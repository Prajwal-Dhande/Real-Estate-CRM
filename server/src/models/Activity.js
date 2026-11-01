const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: {
    type: String,
    enum: ['Call', 'WhatsApp', 'Site Visit', 'Stage Change', 'Note'],
    required: true
  },
  notes: { type: String, required: true },
  callDurationSeconds: { type: Number, default: 0 },
  clientSentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'], default: 'Neutral' },
  nextFollowUpAt: { type: Date, index: true },
  isFollowUpCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
