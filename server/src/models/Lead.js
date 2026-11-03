const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, lowercase: true },
  source: { 
    type: String, 
    enum: [
      'Website', 
      'WhatsApp', 
      'Walk-in', 
      'Referral', 
      'Meta Ads', 
      'Google Ads', 
      '99acres', 
      'MagicBricks', 
      'Housing.com', 
      'Print / Outdoor',
      'PropertyPortal'
    ], 
    default: 'Website' 
  },
  campaignName: { type: String, default: '' },
  utmSource: { type: String, default: '' },
  utmMedium: { type: String, default: '' },
  utmCampaign: { type: String, default: '' },
  acquisitionCostInInr: { type: Number, default: 0 },
  rawRequirementText: { type: String, required: true }, // e.g., "Need 3BHK near metro station under 75L"
  preferredLocalities: [{ type: String }],
  budgetMinInLakhs: { type: Number, required: true },
  budgetMaxInLakhs: { type: Number, required: true },
  desiredBhk: { type: Number, required: true },
  minCarpetAreaSqFt: { type: Number, default: 800 },
  pipelineStage: {
    type: String,
    enum: ['New Inquiry', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'New Inquiry',
    index: true
  },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  aiScore: { type: Number, default: 50, index: true }, // 0 to 100
  aiPriorityTag: { type: String, enum: ['Hot', 'Warm', 'Cold'], default: 'Warm' },
  aiScoreFactors: [{ type: String }], // ["Budget aligns with locality median", "Site visit scheduled"]
  recommendedProperties: [{
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    matchScore: { type: Number } // Cosine similarity 0 to 100
  }],
  requirementEmbedding: [{ type: Number }], // 384-dim vector
  lastContactedAt: { type: Date },
  nextFollowUpAt: { type: Date, index: true },
  slaDeadline: { type: Date, index: true }
}, { timestamps: true });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;

