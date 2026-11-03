const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const Activity = require('../models/Activity');
const aiClient = require('../services/aiClient');
const whatsappParser = require('../services/whatsappParser');
const whatsappService = require('../services/whatsappService');
const { emitLeadCreated, getIO } = require('../socket');

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'estateiq_whatsapp_verify_token_2026';

/**
 * GET /api/webhook/whatsapp
 * Meta WhatsApp Business Cloud API Webhook Verification Endpoint
 */
function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verification successful ✓');
    return res.status(200).send(challenge);
  }

  console.warn('[WhatsApp Webhook] Verification token mismatch. Received:', token);
  return res.status(403).json({ success: false, message: 'Verification token mismatch' });
}

/**
 * Helper to auto-assign agent based on localities
 */
async function autoAssignAgent(preferredLocalities = []) {
  try {
    if (preferredLocalities.length > 0) {
      const localityAgent = await User.findOne({
        role: 'agent',
        isActive: true,
        assignedLocalities: { $in: preferredLocalities }
      }).sort({ activeLeadCount: 1 });

      if (localityAgent) return localityAgent;
    }

    const fallbackAgent = await User.findOne({
      role: 'agent',
      isActive: true
    }).sort({ activeLeadCount: 1 });

    return fallbackAgent;
  } catch (err) {
    console.warn('[WhatsApp Ingestion] Agent auto-assign error:', err.message);
    return null;
  }
}

/**
 * Core ingestion logic for an incoming WhatsApp message
 */
async function processIncomingMessage({ senderPhone, senderName, messageText }) {
  // Format phone number cleanly (+91 XXXXX XXXXX)
  let cleanedPhone = senderPhone.replace(/[^\d+]/g, '');
  if (!cleanedPhone.startsWith('+')) {
    if (cleanedPhone.length === 10) cleanedPhone = `+91${cleanedPhone}`;
    else cleanedPhone = `+${cleanedPhone}`;
  }

  const name = senderName && senderName.trim().length > 0 ? senderName.trim() : 'WhatsApp Buyer';

  console.log(`[WhatsApp Ingestion] Processing message from ${name} (${cleanedPhone}): "${messageText}"`);

  // 1. Check if lead already exists
  let lead = await Lead.findOne({ phone: cleanedPhone });

  if (lead) {
    console.log(`[WhatsApp Ingestion] Existing lead found: ${lead.fullName} (${lead._id})`);

    // Log new WhatsApp Activity
    const activity = new Activity({
      lead: lead._id,
      agent: lead.assignedAgent || (await User.findOne({ role: 'admin' }))?._id,
      activityType: 'WhatsApp',
      notes: `Inbound WhatsApp message: "${messageText}"`,
      clientSentiment: 'Positive',
      isFollowUpCompleted: false,
      nextFollowUpAt: new Date(Date.now() + 3600000 * 2) // reminder in 2 hours
    });
    await activity.save();

    // Re-score lead with incremented interactions
    let updatedScore = Math.min(99, (lead.aiScore || 60) + 10);
    lead.aiScore = updatedScore;
    lead.aiPriorityTag = updatedScore >= 70 ? 'Hot' : 'Warm';
    if (!lead.aiScoreFactors.includes('Frequent WhatsApp engagements')) {
      lead.aiScoreFactors.unshift('Frequent WhatsApp engagements');
    }
    lead.lastContactedAt = new Date();
    await lead.save();

    // Emit socket event for real-time CRM updates
    const io = getIO();
    if (io) {
      io.emit('whatsapp:message_received', {
        leadId: lead._id,
        phone: cleanedPhone,
        message: messageText,
        leadName: lead.fullName,
        timestamp: new Date()
      });
      io.emit('lead:stage_updated', {
        leadId: lead._id,
        pipelineStage: lead.pipelineStage,
        aiScore: lead.aiScore,
        aiPriorityTag: lead.aiPriorityTag,
        aiScoreFactors: lead.aiScoreFactors
      });
    }

    // Auto-reply
    const assignedAgent = await User.findById(lead.assignedAgent);
    const replyBody = whatsappService.composeAutoReply({
      leadName: lead.fullName,
      desiredBhk: lead.desiredBhk,
      preferredLocality: lead.preferredLocalities?.[0] || 'Nagpur',
      budgetMax: lead.budgetMaxInLakhs,
      matchedCount: lead.recommendedProperties?.length || 2,
      agentName: assignedAgent?.name
    });

    await whatsappService.sendTextMessage(cleanedPhone, replyBody);

    return {
      isNew: false,
      lead,
      activity,
      autoReply: replyBody
    };
  }

  // 2. New Lead Pipeline: Parse requirement using NLP
  const parsed = whatsappParser.parseRequirement(messageText);

  // Auto-assign appropriate territory agent
  const agent = await autoAssignAgent(parsed.preferredLocalities);
  const agentId = agent ? agent._id : null;

  // AI Scoring
  let aiScore = 75; // high initial intent for direct inbound WhatsApp
  let aiPriorityTag = 'Hot';
  let aiScoreFactors = [
    'Direct inbound WhatsApp inquiry - High buying intent',
    `Specified locality: ${parsed.preferredLocalities.join(', ')}`,
    `Budget range aligned with Nagpur sub-market rates`
  ];

  try {
    const scoringResult = await aiClient.scoreLead({
      budgetMinInLakhs: parsed.budgetMinInLakhs,
      budgetMaxInLakhs: parsed.budgetMaxInLakhs,
      desiredBhk: parsed.desiredBhk,
      pipelineStage: 'New Inquiry',
      preferredLocalities: parsed.preferredLocalities,
      interactionCount: 1,
      lastInteractionSentiment: 'Positive',
      daysSinceLastContact: 0
    });

    if (scoringResult) {
      aiScore = scoringResult.conversionScore;
      aiPriorityTag = scoringResult.priorityTag;
      if (scoringResult.scoreFactors && scoringResult.scoreFactors.length > 0) {
        aiScoreFactors = [
          'Direct inbound WhatsApp inquiry - High immediate intent',
          ...scoringResult.scoreFactors
        ];
      }
    }
  } catch (err) {
    console.warn('[WhatsApp Ingestion] AI Scoring fallback:', err.message);
  }

  // Property Matching
  let recommendedProperties = [];
  try {
    const availableProps = await Property.find({ status: 'Available' });
    if (availableProps.length > 0) {
      const matchResult = await aiClient.matchProperties({
        requirementText: messageText,
        budgetMinInLakhs: parsed.budgetMinInLakhs,
        budgetMaxInLakhs: parsed.budgetMaxInLakhs,
        desiredBhk: parsed.desiredBhk,
        preferredLocalities: parsed.preferredLocalities,
        candidateProperties: availableProps.map(p => ({
          propertyId: p._id.toString(),
          title: p.title,
          description: p.description,
          locality: p.locality,
          listedPriceInLakhs: p.listedPriceInLakhs,
          bhk: p.bhk,
          carpetAreaSqFt: p.carpetAreaSqFt
        }))
      });

      if (matchResult && matchResult.matches) {
        recommendedProperties = matchResult.matches.slice(0, 3).map(m => ({
          property: m.propertyId,
          matchScore: m.matchScore
        }));
      }
    }
  } catch (matchErr) {
    console.warn('[WhatsApp Ingestion] AI Property Matching fallback:', matchErr.message);
  }

  // Generate 384-dim semantic embedding
  let requirementEmbedding = [];
  try {
    requirementEmbedding = await aiClient.generateEmbedding(messageText);
  } catch (e) {
    // Non-blocking
  }

  // Create new Lead
  const newLead = new Lead({
    fullName: name,
    phone: cleanedPhone,
    source: 'WhatsApp',
    campaignName: 'WhatsApp Cloud Inbound',
    acquisitionCostInInr: 45,
    rawRequirementText: messageText,
    preferredLocalities: parsed.preferredLocalities,
    budgetMinInLakhs: parsed.budgetMinInLakhs,
    budgetMaxInLakhs: parsed.budgetMaxInLakhs,
    desiredBhk: parsed.desiredBhk,
    minCarpetAreaSqFt: parsed.minCarpetAreaSqFt,
    pipelineStage: 'New Inquiry',
    assignedAgent: agentId,
    aiScore,
    aiPriorityTag,
    aiScoreFactors,
    recommendedProperties,
    requirementEmbedding,
    lastContactedAt: new Date()
  });

  await newLead.save();

  // Increment agent active lead count
  if (agentId) {
    await User.findByIdAndUpdate(agentId, { $inc: { activeLeadCount: 1 } });
  }

  // Create initial Activity
  const activity = new Activity({
    lead: newLead._id,
    agent: agentId || (await User.findOne({ role: 'admin' }))?._id,
    activityType: 'WhatsApp',
    notes: `Initial WhatsApp Inquiry: "${messageText}"`,
    clientSentiment: 'Positive',
    isFollowUpCompleted: false,
    nextFollowUpAt: new Date(Date.now() + 1800000) // follow up in 30 mins
  });
  await activity.save();

  const populatedLead = await Lead.findById(newLead._id)
    .populate('assignedAgent', 'name email role assignedLocalities')
    .populate('recommendedProperties.property', 'title locality listedPriceInLakhs bhk carpetAreaSqFt status');

  // Emit real-time Socket.io events
  emitLeadCreated(populatedLead || newLead);

  const io = getIO();
  if (io) {
    io.emit('whatsapp:new_lead', {
      lead: populatedLead || newLead,
      message: messageText,
      timestamp: new Date()
    });
  }

  // Send automated WhatsApp confirmation reply
  const replyBody = whatsappService.composeAutoReply({
    leadName: name,
    desiredBhk: parsed.desiredBhk,
    preferredLocality: parsed.preferredLocalities[0],
    budgetMax: parsed.budgetMaxInLakhs,
    matchedCount: recommendedProperties.length || 2,
    agentName: agent?.name
  });

  await whatsappService.sendTextMessage(cleanedPhone, replyBody);

  return {
    isNew: true,
    lead: populatedLead || newLead,
    activity,
    autoReply: replyBody
  };
}

/**
 * POST /api/webhook/whatsapp
 * Receives incoming WhatsApp messages from Meta WhatsApp Business Cloud API
 */
async function handleIncomingWhatsApp(req, res) {
  try {
    const body = req.body;

    // Ensure it's a WhatsApp webhook event
    if (body.object === 'whatsapp_business_account' && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (value && value.messages && value.messages.length > 0) {
            const message = value.messages[0];
            const contact = value.contacts?.[0] || {};

            // We only process incoming text messages
            if (message.type === 'text' && message.text?.body) {
              const senderPhone = message.from;
              const senderName = contact.profile?.name || 'WhatsApp Contact';
              const messageText = message.text.body;

              // Process asynchronously so Meta receives 200 OK immediately
              processIncomingMessage({ senderPhone, senderName, messageText }).catch(err => {
                console.error('[WhatsApp Webhook] Ingestion error:', err);
              });
            }
          }
        }
      }
    }

    // Immediate 200 OK to acknowledge Meta receipt
    return res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error('[WhatsApp Webhook] Error processing event:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/webhook/whatsapp/simulate
 * Direct testing endpoint for brokers, admins, and UI simulators
 */
async function simulateIncomingWhatsApp(req, res) {
  try {
    const { phone, name, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'phone and message are required'
      });
    }

    const result = await processIncomingMessage({
      senderPhone: phone,
      senderName: name || 'WhatsApp Inquirer',
      messageText: message
    });

    return res.status(201).json({
      success: true,
      message: result.isNew ? 'New WhatsApp lead ingested and scored' : 'Existing lead activity updated',
      data: result
    });
  } catch (err) {
    console.error('[WhatsApp Simulation Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to ingest simulated WhatsApp message',
      error: err.message
    });
  }
}

module.exports = {
  verifyWebhook,
  handleIncomingWhatsApp,
  simulateIncomingWhatsApp
};

