const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  locality: { type: String, required: true, index: true },
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  carpetAreaSqFt: { type: Number, required: true },
  bhk: { type: Number, required: true },
  bathrooms: { type: Number, default: 2 },
  floorNumber: { type: Number, required: true },
  totalFloors: { type: Number, required: true },
  furnishing: { type: String, enum: ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'], default: 'Semi-Furnished' },
  amenities: [{ type: String }], // ["Parking", "Gym", "Metro Proximity", "Power Backup"]
  listedPriceInLakhs: { type: Number, required: true },
  aiEstimatedPriceInLakhs: { type: Number },
  valuationConfidence: { type: Number }, // 0 to 1
  status: { type: String, enum: ['Available', 'Under Offer', 'Sold'], default: 'Available' },
  semanticEmbedding: [{ type: Number }], // 384-dim vector from all-MiniLM-L6-v2
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
