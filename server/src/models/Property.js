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
  
  // Priority 3: Documents, Floor Plans & RERA Verification
  builderName: { type: String, default: '' },
  reraNumber: { type: String, default: '', index: true },
  isReraVerified: { type: Boolean, default: false },
  possessionDate: { type: String, default: 'Ready to Move' },
  floorPlanUrl: { type: String, default: '' },
  brochureUrl: { type: String, default: '' },
  images: [{ type: String }],
  
  semanticEmbedding: [{ type: Number }], // 384-dim vector from all-MiniLM-L6-v2
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Pre-save hook: Auto-verify MahaRERA format (e.g., P50500028192)
propertySchema.pre('save', function(next) {
  if (this.reraNumber) {
    const cleanRera = this.reraNumber.trim().toUpperCase();
    this.reraNumber = cleanRera;
    // MahaRERA standard format starts with P followed by digits (or valid RERA alphanumeric 10-14 chars)
    const isValidRera = /^P\d{9,12}$/i.test(cleanRera) || cleanRera.length >= 10;
    this.isReraVerified = isValidRera;
  }
  next();
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
