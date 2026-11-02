const Property = require('../models/Property');
const aiClient = require('../services/aiClient');
const uploadService = require('../services/uploadService');

/**
 * Create a new property
 * Calls FastAPI /predict-price and /generate-embedding, then saves in MongoDB
 */
async function createProperty(req, res) {
  try {
    const {
      title,
      description,
      locality,
      address,
      coordinates,
      carpetAreaSqFt,
      bhk,
      bathrooms = 2,
      floorNumber,
      totalFloors,
      furnishing = 'Semi-Furnished',
      amenities = [],
      listedPriceInLakhs,
      status = 'Available',
      builderName = '',
      reraNumber = '',
      possessionDate = 'Ready to Move',
      floorPlanUrl = '',
      brochureUrl = '',
      images = []
    } = req.body;

    if (!title || !description || !locality || !address || !carpetAreaSqFt || !bhk || floorNumber === undefined || !totalFloors || !listedPriceInLakhs) {
      return res.status(400).json({
        success: false,
        message: 'Missing required property fields: title, description, locality, address, carpetAreaSqFt, bhk, floorNumber, totalFloors, listedPriceInLakhs'
      });
    }

    // Default coordinates if not provided (e.g. default Nagpur lat/lng)
    const coords = coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number'
      ? coordinates
      : { lat: 21.1458, lng: 79.0882 };

    // 1. Fetch AI Valuation (with Redis caching valuation:{locality}:{bhk}:{carpetAreaSqFt})
    let aiEstimatedPriceInLakhs = null;
    let valuationConfidence = null;

    try {
      const valuationResult = await aiClient.predictPrice({
        locality,
        carpetAreaSqFt,
        bhk,
        bathrooms,
        floorNumber,
        totalFloors,
        furnishing,
        amenitiesCount: Array.isArray(amenities) ? amenities.length : 0
      });

      aiEstimatedPriceInLakhs = valuationResult.estimatedPriceInLakhs;
      valuationConfidence = valuationResult.confidenceScore;
    } catch (valErr) {
      console.warn('[Property Controller] Valuation call warning:', valErr.message);
    }

    // 2. Generate 384-dim semantic embedding using description, title, locality, amenities
    let semanticEmbedding = [];
    try {
      const textToEmbed = `${title}. ${description}. Located in ${locality}. ${bhk} BHK, ${carpetAreaSqFt} sq ft. Amenities: ${(amenities || []).join(', ')}.`;
      semanticEmbedding = await aiClient.generateEmbedding(textToEmbed);
    } catch (embErr) {
      console.warn('[Property Controller] Embedding generation warning:', embErr.message);
    }

    // 3. Save Property
    const property = new Property({
      title,
      description,
      locality,
      address,
      coordinates: coords,
      carpetAreaSqFt: Number(carpetAreaSqFt),
      bhk: Number(bhk),
      bathrooms: Number(bathrooms),
      floorNumber: Number(floorNumber),
      totalFloors: Number(totalFloors),
      furnishing,
      amenities: Array.isArray(amenities) ? amenities : [],
      listedPriceInLakhs: Number(listedPriceInLakhs),
      aiEstimatedPriceInLakhs,
      valuationConfidence,
      status,
      builderName: builderName ? builderName.trim() : '',
      reraNumber: reraNumber ? reraNumber.trim() : '',
      possessionDate: possessionDate || 'Ready to Move',
      floorPlanUrl: floorPlanUrl || '',
      brochureUrl: brochureUrl || '',
      images: Array.isArray(images) ? images : [],
      semanticEmbedding,
      createdBy: req.user ? req.user._id : null
    });

    await property.save();

    return res.status(201).json({
      success: true,
      message: 'Property created successfully with AI valuation and semantic embedding',
      property
    });
  } catch (err) {
    console.error('[Property Controller] Create property error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: err.message
    });
  }
}

/**
 * Get properties with filtering and pagination
 */
async function getProperties(req, res) {
  try {
    const {
      locality,
      bhk,
      status,
      furnishing,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Agent Territory Filtering: If logged in as agent, filter to assigned localities
    if (req.user && req.user.role === 'agent' && req.user.assignedLocalities?.length > 0 && req.query.allBrokerage !== 'true') {
      if (locality) {
        filter.locality = new RegExp(locality, 'i');
      } else {
        filter.locality = { $in: req.user.assignedLocalities.map(l => new RegExp(l, 'i')) };
      }
    } else if (locality) {
      filter.locality = new RegExp(locality, 'i');
    }
    if (bhk) {
      filter.bhk = Number(bhk);
    }
    if (status) {
      filter.status = status;
    }
    if (furnishing) {
      filter.furnishing = furnishing;
    }

    if (minPrice || maxPrice) {
      filter.listedPriceInLakhs = {};
      if (minPrice) filter.listedPriceInLakhs.$gte = Number(minPrice);
      if (maxPrice) filter.listedPriceInLakhs.$lte = Number(maxPrice);
    }

    if (minArea || maxArea) {
      filter.carpetAreaSqFt = {};
      if (minArea) filter.carpetAreaSqFt.$gte = Number(minArea);
      if (maxArea) filter.carpetAreaSqFt.$lte = Number(maxArea);
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { locality: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Exclude heavy 384-dim semanticEmbedding array on general list query for efficiency
    const properties = await Property.find(filter)
      .select('-semanticEmbedding')
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Property.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: properties.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      properties
    });
  } catch (err) {
    console.error('[Property Controller] Get properties error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: err.message
    });
  }
}

/**
 * Get property by ID
 */
async function getPropertyById(req, res) {
  try {
    const property = await Property.findById(req.params.id)
      .populate('createdBy', 'name email role');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    return res.status(200).json({
      success: true,
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: err.message
    });
  }
}

/**
 * Update property
 */
async function updateProperty(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership if agent
    if (req.user.role !== 'admin' && property.createdBy && property.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this property'
      });
    }

    const updates = req.body;
    const coreSpecsChanged = updates.locality || updates.carpetAreaSqFt || updates.bhk || updates.floorNumber || updates.furnishing;

    // Recalculate valuation if core specs changed
    if (coreSpecsChanged) {
      try {
        const valResult = await aiClient.predictPrice({
          locality: updates.locality || property.locality,
          carpetAreaSqFt: updates.carpetAreaSqFt || property.carpetAreaSqFt,
          bhk: updates.bhk || property.bhk,
          bathrooms: updates.bathrooms || property.bathrooms,
          floorNumber: updates.floorNumber !== undefined ? updates.floorNumber : property.floorNumber,
          totalFloors: updates.totalFloors || property.totalFloors,
          furnishing: updates.furnishing || property.furnishing,
          amenitiesCount: Array.isArray(updates.amenities || property.amenities) ? (updates.amenities || property.amenities).length : 0
        });

        updates.aiEstimatedPriceInLakhs = valResult.estimatedPriceInLakhs;
        updates.valuationConfidence = valResult.confidenceScore;
      } catch (valErr) {
        console.warn('[Property Controller] Re-valuation warning:', valErr.message);
      }
    }

    // Recalculate embedding if description or title changed
    if (updates.description || updates.title || updates.locality) {
      try {
        const textToEmbed = `${updates.title || property.title}. ${updates.description || property.description}. Located in ${updates.locality || property.locality}.`;
        updates.semanticEmbedding = await aiClient.generateEmbedding(textToEmbed);
      } catch (embErr) {
        console.warn('[Property Controller] Re-embedding warning:', embErr.message);
      }
    }

    Object.assign(property, updates);
    await property.save();

    return res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: err.message
    });
  }
}

/**
 * Delete property
 */
async function deleteProperty(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (req.user.role !== 'admin' && property.createdBy && property.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this property'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: err.message
    });
  }
}

/**
 * Upload document (Floor plan, Brochure, Image) via Cloudinary/S3/Local
 */
async function uploadDocument(req, res) {
  try {
    const { file, fileType = 'floorPlan', fileName, metadata } = req.body;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided for upload'
      });
    }

    const result = await uploadService.processUpload({
      file,
      fileType,
      fileName,
      metadata
    });

    return res.status(200).json({
      success: true,
      message: `${fileType} uploaded successfully`,
      data: result
    });
  } catch (err) {
    console.error('[Property Controller] Upload error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
}

/**
 * Generate/Return SVG sample blueprint for architectural layout
 */
async function getSampleBlueprint(req, res) {
  try {
    const bhk = Number(req.query.bhk) || 3;
    const carpetAreaSqFt = Number(req.query.carpetAreaSqFt) || 1250;
    const title = req.query.title || 'Nagpur Luxury Blueprint';

    const svg = uploadService.generateSvgFloorPlan(bhk, carpetAreaSqFt, title);
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svg);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate sample blueprint' });
  }
}

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  uploadDocument,
  getSampleBlueprint
};

