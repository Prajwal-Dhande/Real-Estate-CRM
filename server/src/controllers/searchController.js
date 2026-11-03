const Lead = require('../models/Lead');
const Property = require('../models/Property');

const NAGPUR_LOCALITIES = [
  "Vasudev Nagar",
  "Dharampeth",
  "MIHAN",
  "Manish Nagar",
  "Civil Lines",
  "Wardha Road",
  "Hingna",
  "Sadar",
  "Laxmi Nagar",
  "Trimurti Nagar",
  "Besa Road",
  "Medical Square",
  "Ramdaspeth",
  "Shankar Nagar"
];

/**
 * GET /api/search?q=...
 * Unified Global Search for Leads, Properties, and Localities (Priority 5)
 */
async function globalSearch(req, res) {
  try {
    const query = (req.query.q || '').trim();

    if (!query) {
      return res.status(200).json({
        success: true,
        results: {
          leads: [],
          properties: [],
          localities: []
        }
      });
    }

    const regex = new RegExp(query, 'i');

    // 1. Search Leads (name, phone, locality, requirement)
    const leadQuery = {
      $or: [
        { fullName: regex },
        { phone: regex },
        { preferredLocalities: regex },
        { rawRequirementText: regex }
      ]
    };

    // Agent territory scoping
    if (req.user && req.user.role === 'agent' && req.user.assignedLocalities?.length > 0 && req.query.allBrokerage !== 'true') {
      leadQuery.preferredLocalities = { $in: req.user.assignedLocalities.map(l => new RegExp(l, 'i')) };
    }

    const leadsPromise = Lead.find(leadQuery)
      .select('fullName phone email pipelineStage aiScore aiPriorityTag budgetMinInLakhs budgetMaxInLakhs desiredBhk preferredLocalities nextFollowUpAt lastContactedAt')
      .limit(8)
      .lean();

    // 2. Search Properties (title, locality, builder, RERA)
    const propertyQuery = {
      $or: [
        { title: regex },
        { locality: regex },
        { address: regex },
        { builderName: regex },
        { reraNumber: regex }
      ]
    };

    const propertiesPromise = Property.find(propertyQuery)
      .select('title locality address listedPriceInLakhs bhk carpetAreaSqFt builderName reraNumber isReraVerified possessionDate images status')
      .limit(8)
      .lean();

    // 3. Match Localities
    const matchedLocalities = NAGPUR_LOCALITIES.filter(loc =>
      loc.toLowerCase().includes(query.toLowerCase())
    );

    const [leads, properties] = await Promise.all([leadsPromise, propertiesPromise]);

    return res.status(200).json({
      success: true,
      query,
      results: {
        leads,
        properties,
        localities: matchedLocalities
      }
    });
  } catch (err) {
    console.error('[Search Controller] Global search error:', err);
    return res.status(500).json({
      success: false,
      message: 'Global search failed',
      error: err.message
    });
  }
}

module.exports = {
  globalSearch,
  NAGPUR_LOCALITIES
};

