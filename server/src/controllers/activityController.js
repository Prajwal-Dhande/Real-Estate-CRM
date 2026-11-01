const Activity = require('../models/Activity');
const Lead = require('../models/Lead');
const aiClient = require('../services/aiClient');
const { scheduleFollowupReminder } = require('../queues/followupQueue');
const { emitLeadStageUpdated } = require('../socket');

/**
 * POST /activities
 * Logs interaction, triggers BullMQ delayed job for nextFollowUpAt, recalculates lead score
 */
async function createActivity(req, res) {
  try {
    const {
      leadId,
      activityType,
      notes,
      callDurationSeconds = 0,
      clientSentiment = 'Neutral',
      nextFollowUpAt
    } = req.body;

    if (!leadId || !activityType || !notes) {
      return res.status(400).json({
        success: false,
        message: 'leadId, activityType, and notes are required'
      });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const agentId = req.user ? req.user._id : lead.assignedAgent;

    // 1. Create and save the Activity
    const activity = new Activity({
      lead: lead._id,
      agent: agentId,
      activityType,
      notes,
      callDurationSeconds: Number(callDurationSeconds),
      clientSentiment,
      nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : undefined,
      isFollowUpCompleted: false
    });

    await activity.save();

    // 2. Update lead's last contacted timestamp
    lead.lastContactedAt = new Date();

    // If activity is a Site Visit, update stage if still in early inquiries
    if (activityType === 'Site Visit' && ['New Inquiry', 'Contacted'].includes(lead.pipelineStage)) {
      lead.pipelineStage = 'Site Visit Scheduled';
    }

    // 3. Trigger BullMQ delayed job if nextFollowUpAt is scheduled
    let reminderScheduled = false;
    if (nextFollowUpAt) {
      try {
        const job = await scheduleFollowupReminder({
          activityId: activity._id,
          leadId: lead._id,
          agentId,
          nextFollowUpAt,
          notes
        });
        reminderScheduled = Boolean(job);
      } catch (queueErr) {
        console.warn('[Activity Controller] Reminder queueing warning:', queueErr.message);
      }
    }

    // 4. Recalculate Lead Score based on updated activities
    const allActivities = await Activity.find({ lead: lead._id });
    const interactionCount = allActivities.length;
    const daysSinceLastContact = 0; // Just contacted now

    const sentimentValues = { Positive: 1.0, Neutral: 0.0, Negative: -1.0 };
    const avgSentiment = allActivities.reduce(
      (sum, a) => sum + (sentimentValues[a.clientSentiment] || 0),
      0
    ) / allActivities.length;

    const hasSiteVisit = lead.pipelineStage === 'Site Visit Scheduled' ||
      allActivities.some(a => a.activityType === 'Site Visit');

    try {
      const scoreResult = await aiClient.scoreLead({
        budgetMaxInLakhs: lead.budgetMaxInLakhs,
        localityMedianPriceInLakhs: lead.budgetMaxInLakhs,
        interactionCount,
        daysSinceLastContact,
        siteVisitScheduled: hasSiteVisit,
        sentimentScore: avgSentiment
      });

      lead.aiScore = scoreResult.aiScore;
      lead.aiPriorityTag = scoreResult.aiPriorityTag;
      lead.aiScoreFactors = scoreResult.aiScoreFactors;
    } catch (scoreErr) {
      console.warn('[Activity Controller] Lead re-scoring warning:', scoreErr.message);
    }

    await lead.save();

    // Emit stage/score update via socket
    emitLeadStageUpdated({
      _id: lead._id,
      leadId: lead._id,
      pipelineStage: lead.pipelineStage,
      aiScore: lead.aiScore,
      aiPriorityTag: lead.aiPriorityTag,
      aiScoreFactors: lead.aiScoreFactors
    });

    const populatedActivity = await Activity.findById(activity._id)
      .populate('agent', 'name email role')
      .populate('lead', 'fullName phone email pipelineStage');

    return res.status(201).json({
      success: true,
      message: 'Activity logged successfully and lead score recalculated',
      activity: populatedActivity || activity,
      reminderScheduled,
      lead: {
        id: lead._id,
        aiScore: lead.aiScore,
        aiPriorityTag: lead.aiPriorityTag,
        aiScoreFactors: lead.aiScoreFactors,
        pipelineStage: lead.pipelineStage,
        lastContactedAt: lead.lastContactedAt
      }
    });
  } catch (err) {
    console.error('[Activity Controller] Create activity error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to log activity',
      error: err.message
    });
  }
}

/**
 * GET /activities/lead/:leadId
 * Get all activities for a specific lead
 */
async function getActivitiesByLead(req, res) {
  try {
    const { leadId } = req.params;
    const activities = await Activity.find({ lead: leadId })
      .populate('agent', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: err.message
    });
  }
}

/**
 * PATCH /activities/:id/complete
 * Mark a follow-up activity as completed
 */
async function completeFollowUp(req, res) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    activity.isFollowUpCompleted = true;
    await activity.save();

    return res.status(200).json({
      success: true,
      message: 'Follow-up marked as completed',
      activity
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: err.message
    });
  }
}

module.exports = {
  createActivity,
  getActivitiesByLead,
  completeFollowUp
};

