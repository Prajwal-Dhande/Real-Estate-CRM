const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const Activity = require('../models/Activity');
const aiClient = require('../services/aiClient');
const { emitLeadCreated, emitLeadStageUpdated } = require('../socket');

/**
 * Helper to auto-assign agent based on localities or lowest activeLeadCount
 */
async function autoAssignAgent(preferredLocalities = []) {
  try {
    // 1. Try finding an agent assigned to one of the preferred localities
    if (preferredLocalities.length > 0) {
      const localityAgent = await User.findOne({
        role: 'agent',
        isActive: true,
        assignedLocalities: { $in: preferredLocalities }
      }).sort({ activeLeadCount: 1 });

      if (localityAgent) return localityAgent;
    }

    // 2. Otherwise pick active agent with lowest activeLeadCount
    const fallbackAgent = await User.findOne({
      role: 'agent',
      isActive: true
    }).sort({ activeLeadCount: 1 });

    return fallbackAgent;
  } catch (err) {
    console.warn('[Lead Controller] Auto-assign agent error:', err.message);
    return null;
  }
}

/**
 * POST /leads
 * Saves lead, calls FastAPI /score-lead & /match-properties, caches in Redis, emits Socket event lead:created
 */
async function createLead(req, res) {
  try {
    const {
      fullName,
      phone,
      email,
      source = 'Website',
      rawRequirementText,
      preferredLocalities = [],
      budgetMinInLakhs,
      budgetMaxInLakhs,
      desiredBhk,
      minCarpetAreaSqFt = 800,
      pipelineStage = 'New Inquiry',
      assignedAgent
    } = req.body;

    if (!fullName || !phone || !rawRequirementText || budgetMinInLakhs === undefined || budgetMaxInLakhs === undefined || !desiredBhk) {
      return res.status(400).json({
        success: false,
        message: 'Missing required lead fields: fullName, phone, rawRequirementText, budgetMinInLakhs, budgetMaxInLakhs, desiredBhk'
      });
    }

    // Check unique phone number
    const existingLead = await Lead.findOne({ phone });
    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: 'A lead with this phone number already exists'
      });
    }

    // 1. Assign agent (if not provided, auto-assign)
    let agentId = assignedAgent;
    if (!agentId) {
      const assigned = await autoAssignAgent(preferredLocalities);
      if (assigned) agentId = assigned._id;
    }

    // 2. Generate 384-dim semantic embedding for requirements
    let requirementEmbedding = [];
    try {
      requirementEmbedding = await aiClient.generateEmbedding(rawRequirementText);
    } catch (embErr) {
      console.warn('[Lead Controller] Requirement embedding generation warning:', embErr.message);
    }

    // 3. Find candidate properties in database and rank with AI matcher
    let recommendedProperties = [];
    let localityMedianPrice = Number(budgetMaxInLakhs);

    try {
      // Find available properties matching general budget or localities
      const propertyQuery = { status: 'Available' };
      if (preferredLocalities && preferredLocalities.length > 0) {
        propertyQuery.locality = { $in: preferredLocalities.map(loc => new RegExp(loc, 'i')) };
      }

      const candidateProperties = await Property.find(propertyQuery).limit(50);

      if (candidateProperties.length > 0) {
        // Calculate median price from available candidates in preferred localities
        const prices = candidateProperties.map(p => p.listedPriceInLakhs).sort((a, b) => a - b);
        localityMedianPrice = prices[Math.floor(prices.length / 2)] || Number(budgetMaxInLakhs);

        // Run semantic + budget matching
        const matchResult = await aiClient.matchProperties(
          rawRequirementText,
          budgetMaxInLakhs,
          candidateProperties
        );

        if (matchResult && Array.isArray(matchResult.matches)) {
          recommendedProperties = matchResult.matches.slice(0, 5).map(m => ({
            property: m.propertyId,
            matchScore: m.matchScore
          }));
        }
      }
    } catch (matchErr) {
      console.warn('[Lead Controller] Property matching warning:', matchErr.message);
    }

    // 4. Score lead using FastAPI engine
    let aiScore = 50;
    let aiPriorityTag = 'Warm';
    let aiScoreFactors = ['Initial lead creation'];

    try {
      const scoreResult = await aiClient.scoreLead({
        budgetMaxInLakhs: Number(budgetMaxInLakhs),
        localityMedianPriceInLakhs: localityMedianPrice,
        interactionCount: 0,
        daysSinceLastContact: 0,
        siteVisitScheduled: pipelineStage === 'Site Visit Scheduled',
        sentimentScore: 0.0
      });

      aiScore = scoreResult.aiScore;
      aiPriorityTag = scoreResult.aiPriorityTag;
      aiScoreFactors = scoreResult.aiScoreFactors;
    } catch (scoreErr) {
      console.warn('[Lead Controller] Lead scoring warning:', scoreErr.message);
    }

    // 5. Save Lead
    const lead = new Lead({
      fullName,
      phone,
      email: email ? email.toLowerCase() : undefined,
      source,
      rawRequirementText,
      preferredLocalities,
      budgetMinInLakhs: Number(budgetMinInLakhs),
      budgetMaxInLakhs: Number(budgetMaxInLakhs),
      desiredBhk: Number(desiredBhk),
      minCarpetAreaSqFt: Number(minCarpetAreaSqFt),
      pipelineStage,
      assignedAgent: agentId,
      aiScore,
      aiPriorityTag,
      aiScoreFactors,
      recommendedProperties,
      requirementEmbedding,
      lastContactedAt: new Date()
    });

    await lead.save();

    // Increment agent's active lead count
    if (agentId) {
      await User.findByIdAndUpdate(agentId, { $inc: { activeLeadCount: 1 } });
    }

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedAgent', 'name email role assignedLocalities')
      .populate('recommendedProperties.property', 'title locality listedPriceInLakhs bhk carpetAreaSqFt status');

    // 6. Emit real-time Socket.io event lead:created
    emitLeadCreated(populatedLead || lead);

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully with AI score and property recommendations',
      lead: populatedLead || lead
    });
  } catch (err) {
    console.error('[Lead Controller] Create lead error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: err.message
    });
  }
}

/**
 * GET /leads
 * Supports query filters: stage, priority, locality, assignedAgent, search
 */
async function getLeads(req, res) {
  try {
    const {
      stage,
      priority,
      locality,
      assignedAgent,
      source,
      search,
      page = 1,
      limit = 25,
      sortBy = 'aiScore',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (stage) {
      filter.pipelineStage = stage;
    }
    if (priority) {
      filter.aiPriorityTag = priority;
    }
    if (locality) {
      filter.preferredLocalities = { $in: [new RegExp(locality, 'i')] };
    }
    if (assignedAgent) {
      filter.assignedAgent = assignedAgent;
    }
    if (source) {
      filter.source = source;
    }

    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { rawRequirementText: new RegExp(search, 'i') }
      ];
    }

    // If logged in as agent, optionally restrict to their assigned leads or show all if permitted
    if (req.user && req.user.role === 'agent' && req.query.myLeadsOnly === 'true') {
      filter.assignedAgent = req.user._id;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const leads = await Lead.find(filter)
      .select('-requirementEmbedding')
      .populate('assignedAgent', 'name email role assignedLocalities')
      .populate('recommendedProperties.property', 'title locality listedPriceInLakhs bhk carpetAreaSqFt status')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Lead.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: leads.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      leads
    });
  } catch (err) {
    console.error('[Lead Controller] Get leads error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: err.message
    });
  }
}

/**
 * GET /leads/:id
 */
async function getLeadById(req, res) {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedAgent', 'name email role assignedLocalities')
      .populate('recommendedProperties.property', 'title locality listedPriceInLakhs bhk carpetAreaSqFt status address coordinates');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    return res.status(200).json({
      success: true,
      lead
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: err.message
    });
  }
}

/**
 * PATCH /leads/:id/stage
 * Updates Kanban stage, logs Activity, recalculates AI score, emits lead:stage_updated
 */
async function updateLeadStage(req, res) {
  try {
    const { stage, notes } = req.body;
    const validStages = ['New Inquiry', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Closed Won', 'Closed Lost'];

    if (!stage || !validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${validStages.join(', ')}`
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const previousStage = lead.pipelineStage;
    lead.pipelineStage = stage;
    lead.lastContactedAt = new Date();

    // 1. Log stage change Activity
    const activity = new Activity({
      lead: lead._id,
      agent: req.user ? req.user._id : lead.assignedAgent,
      activityType: 'Stage Change',
      notes: notes || `Pipeline stage transitioned from "${previousStage}" to "${stage}"`,
      clientSentiment: stage === 'Closed Won' ? 'Positive' : stage === 'Closed Lost' ? 'Negative' : 'Neutral'
    });
    await activity.save();

    // 2. Fetch all lead activities to aggregate score factors
    const activities = await Activity.find({ lead: lead._id });
    const interactionCount = activities.length;

    // Calculate days since last contact
    const lastContactTime = lead.lastContactedAt ? new Date(lead.lastContactedAt).getTime() : Date.now();
    const daysSinceLastContact = Math.max(0, Math.floor((Date.now() - lastContactTime) / (1000 * 60 * 60 * 24)));

    // Calculate average sentiment score (-1 to +1)
    const sentimentMap = { Positive: 1.0, Neutral: 0.0, Negative: -1.0 };
    const avgSentiment = activities.length > 0
      ? activities.reduce((acc, a) => acc + (sentimentMap[a.clientSentiment] || 0), 0) / activities.length
      : 0.0;

    const isSiteVisit = stage === 'Site Visit Scheduled' || activities.some(a => a.activityType === 'Site Visit');

    // 3. Recalculate AI score
    try {
      const scoreResult = await aiClient.scoreLead({
        budgetMaxInLakhs: lead.budgetMaxInLakhs,
        localityMedianPriceInLakhs: lead.budgetMaxInLakhs,
        interactionCount,
        daysSinceLastContact,
        siteVisitScheduled: isSiteVisit,
        sentimentScore: avgSentiment
      });

      lead.aiScore = scoreResult.aiScore;
      lead.aiPriorityTag = scoreResult.aiPriorityTag;
      lead.aiScoreFactors = scoreResult.aiScoreFactors;
    } catch (scoreErr) {
      console.warn('[Lead Controller] Stage change score recalculation warning:', scoreErr.message);
    }

    // 4. Update agent activeLeadCount if closing lead
    if (lead.assignedAgent) {
      if (['Closed Won', 'Closed Lost'].includes(stage) && !['Closed Won', 'Closed Lost'].includes(previousStage)) {
        await User.findByIdAndUpdate(lead.assignedAgent, { $inc: { activeLeadCount: -1 } });
      } else if (!['Closed Won', 'Closed Lost'].includes(stage) && ['Closed Won', 'Closed Lost'].includes(previousStage)) {
        await User.findByIdAndUpdate(lead.assignedAgent, { $inc: { activeLeadCount: 1 } });
      }
    }

    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedAgent', 'name email role assignedLocalities')
      .populate('recommendedProperties.property', 'title locality listedPriceInLakhs bhk carpetAreaSqFt status');

    // 5. Emit real-time Socket event lead:stage_updated
    emitLeadStageUpdated({
      _id: lead._id,
      leadId: lead._id,
      pipelineStage: stage,
      previousStage,
      aiScore: lead.aiScore,
      aiPriorityTag: lead.aiPriorityTag,
      aiScoreFactors: lead.aiScoreFactors,
      lead: populatedLead || lead
    });

    return res.status(200).json({
      success: true,
      message: `Stage successfully updated to "${stage}"`,
      lead: populatedLead || lead,
      activity
    });
  } catch (err) {
    console.error('[Lead Controller] Update stage error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update lead stage',
      error: err.message
    });
  }
}

/**
 * PATCH /leads/:id
 * General lead updates
 */
async function updateLead(req, res) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const updates = req.body;

    // If requirements changed, recompute embeddings and recommendations
    if (updates.rawRequirementText && updates.rawRequirementText !== lead.rawRequirementText) {
      try {
        updates.requirementEmbedding = await aiClient.generateEmbedding(updates.rawRequirementText);
        const candidates = await Property.find({ status: 'Available' }).limit(40);
        const matchRes = await aiClient.matchProperties(
          updates.rawRequirementText,
          updates.budgetMaxInLakhs || lead.budgetMaxInLakhs,
          candidates
        );
        if (matchRes && matchRes.matches) {
          updates.recommendedProperties = matchRes.matches.slice(0, 5).map(m => ({
            property: m.propertyId,
            matchScore: m.matchScore
          }));
        }
      } catch (embErr) {
        console.warn('[Lead Controller] Re-embedding warning:', embErr.message);
      }
    }

    Object.assign(lead, updates);
    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedAgent', 'name email role assignedLocalities')
      .populate('recommendedProperties.property', 'title locality listedPriceInLakhs bhk carpetAreaSqFt status');

    return res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      lead: populatedLead || lead
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: err.message
    });
  }
}

/**
 * DELETE /leads/:id
 */
async function deleteLead(req, res) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.assignedAgent) {
      await User.findByIdAndUpdate(lead.assignedAgent, { $inc: { activeLeadCount: -1 } });
    }

    await Lead.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: err.message
    });
  }
}

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStage,
  updateLead,
  deleteLead
};

