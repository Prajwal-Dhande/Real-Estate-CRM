const Lead = require('../models/Lead');
const Property = require('../models/Property');
const Activity = require('../models/Activity');
const { redis, isReady } = require('../config/redis');

/**
 * GET /api/dashboard/metrics
 * Cached with key dashboard:metrics:{userId} (TTL: 5 minutes = 300s)
 */
async function getDashboardMetrics(req, res) {
  try {
    const userId = req.user ? req.user._id.toString() : 'guest';
    const cacheKey = `dashboard:metrics:${userId}`;

    // 1. Check Redis cache
    if (isReady() && redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.status(200).json({
            success: true,
            cached: true,
            metrics: JSON.parse(cached)
          });
        }
      } catch (cacheErr) {
        console.warn(`[Dashboard] Cache read warning:`, cacheErr.message);
      }
    }

    // Filter by assigned agent if not admin
    const leadFilter = req.user && req.user.role === 'agent'
      ? { assignedAgent: req.user._id }
      : {};

    const [
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      totalProperties,
      availableProperties,
      stageCounts,
      upcomingFollowups
    ] = await Promise.all([
      Lead.countDocuments(leadFilter),
      Lead.countDocuments({ ...leadFilter, aiPriorityTag: 'Hot' }),
      Lead.countDocuments({ ...leadFilter, aiPriorityTag: 'Warm' }),
      Lead.countDocuments({ ...leadFilter, aiPriorityTag: 'Cold' }),
      Property.countDocuments(),
      Property.countDocuments({ status: 'Available' }),
      Lead.aggregate([
        { $match: leadFilter },
        { $group: { _id: '$pipelineStage', count: { $sum: 1 } } }
      ]),
      Activity.find({
        isFollowUpCompleted: false,
        nextFollowUpAt: { $gte: new Date() },
        ...(req.user && req.user.role === 'agent' ? { agent: req.user._id } : {})
      })
        .populate('lead', 'fullName phone email')
        .sort({ nextFollowUpAt: 1 })
        .limit(5)
    ]);

    // Format stages map
    const pipelineStages = {
      'New Inquiry': 0,
      'Contacted': 0,
      'Site Visit Scheduled': 0,
      'Negotiation': 0,
      'Closed Won': 0,
      'Closed Lost': 0
    };

    stageCounts.forEach(s => {
      if (pipelineStages[s._id] !== undefined) {
        pipelineStages[s._id] = s.count;
      }
    });

    const metrics = {
      leads: {
        total: totalLeads,
        hot: hotLeads,
        warm: warmLeads,
        cold: coldLeads,
        byStage: pipelineStages
      },
      properties: {
        total: totalProperties,
        available: availableProperties
      },
      upcomingFollowups
    };

    // 2. Cache in Redis for 5 minutes (300 seconds)
    if (isReady() && redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(metrics), 'EX', 300);
      } catch (cacheWriteErr) {
        console.warn(`[Dashboard] Cache write warning:`, cacheWriteErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      cached: false,
      metrics
    });
  } catch (err) {
    console.error('[Dashboard] Get metrics error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics',
      error: err.message
    });
  }
}

module.exports = {
  getDashboardMetrics
};
