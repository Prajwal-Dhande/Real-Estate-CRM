const axios = require('axios');
const { redis, isReady } = require('../config/redis');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: AI_ENGINE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Locality baseline prices per sqft (INR) for fallback pricing if AI service is offline
const LOCALITY_BASE_PRICES = {
  'Vasudev Nagar': 5200,
  'Dharampeth': 7800,
  'MIHAN': 4500,
  'Manish Nagar': 5800,
  'Sadar': 8500,
  'Wardha Road': 4000,
  'Hingna': 3200,
  'Civil Lines': 9000,
  'Laxmi Nagar': 6000,
  'Trimurti Nagar': 5500
};

/**
 * 1. Predict Property Price with Redis Cache (TTL: 24 hours)
 */
async function predictPrice(params) {
  const {
    locality,
    carpetAreaSqFt,
    bhk,
    bathrooms = 2,
    floorNumber = 1,
    totalFloors = 5,
    furnishing = 'Semi-Furnished',
    amenitiesCount = 0
  } = params;

  // Cache key: valuation:{locality}:{bhk}:{carpetAreaSqFt}
  const cacheKey = `valuation:${locality.trim().toLowerCase()}:${bhk}:${Math.round(carpetAreaSqFt)}`;

  // 1. Try reading from Redis cache
  if (isReady() && redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (cacheErr) {
      console.warn(`[AI Client] Redis cache read error for ${cacheKey}:`, cacheErr.message);
    }
  }

  // 2. Call FastAPI Engine
  try {
    const payload = {
      locality,
      carpetAreaSqFt: Number(carpetAreaSqFt),
      bhk: Number(bhk),
      bathrooms: Number(bathrooms),
      floorNumber: Number(floorNumber),
      totalFloors: Number(totalFloors),
      furnishing,
      amenitiesCount: Number(amenitiesCount)
    };

    const response = await apiClient.post('/predict-price', payload);
    const result = response.data;

    // 3. Cache in Redis for 24 hours (86400 seconds)
    if (isReady() && redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(result), 'EX', 86400);
      } catch (cacheWriteErr) {
        console.warn(`[AI Client] Redis cache write error for ${cacheKey}:`, cacheWriteErr.message);
      }
    }

    return result;
  } catch (err) {
    console.warn(`[AI Client] /predict-price failed, using fallback estimator: ${err.message}`);

    // Graceful fallback: heuristic estimation
    const baseRate = LOCALITY_BASE_PRICES[locality] || 4500;
    const estINR = baseRate * Number(carpetAreaSqFt) * (1 + (bhk >= 3 ? 0.08 : 0));
    const estimatedPriceInLakhs = Math.max(5, parseFloat((estINR / 100000).toFixed(2)));

    return {
      estimatedPriceInLakhs,
      priceRangeMin: parseFloat((estimatedPriceInLakhs * 0.9).toFixed(2)),
      priceRangeMax: parseFloat((estimatedPriceInLakhs * 1.1).toFixed(2)),
      confidenceScore: 0.5
    };
  }
}

/**
 * 2. Score Lead Conversion Likelihood
 */
async function scoreLead(params) {
  const {
    budgetMaxInLakhs,
    localityMedianPriceInLakhs,
    interactionCount = 0,
    daysSinceLastContact = 0,
    siteVisitScheduled = false,
    sentimentScore = 0.0
  } = params;

  try {
    const payload = {
      budgetMaxInLakhs: Number(budgetMaxInLakhs),
      localityMedianPriceInLakhs: Number(localityMedianPriceInLakhs) || Number(budgetMaxInLakhs),
      interactionCount: Number(interactionCount),
      daysSinceLastContact: Number(daysSinceLastContact),
      siteVisitScheduled: Boolean(siteVisitScheduled),
      sentimentScore: Number(sentimentScore)
    };

    const response = await apiClient.post('/score-lead', payload);
    return response.data;
  } catch (err) {
    console.warn(`[AI Client] /score-lead failed, using fallback scorer: ${err.message}`);

    // Graceful fallback
    let score = 50;
    const factors = ['Fallback score: baseline engagement evaluation'];

    if (siteVisitScheduled) {
      score += 25;
      factors.push('Site visit scheduled (+25)');
    }
    if (interactionCount >= 3) {
      score += 15;
      factors.push('Active interaction history (+15)');
    }
    if (daysSinceLastContact > 7) {
      score -= 15;
      factors.push('No recent contact (-15)');
    }

    score = Math.min(100, Math.max(0, score));
    const tag = score >= 70 ? 'Hot' : score >= 40 ? 'Warm' : 'Cold';

    return {
      aiScore: score,
      aiPriorityTag: tag,
      aiScoreFactors: factors
    };
  }
}

/**
 * 3. Generate 384-dim Embedding
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  try {
    const response = await apiClient.post('/generate-embedding', { text });
    return response.data.embedding || [];
  } catch (err) {
    console.warn(`[AI Client] /generate-embedding failed: ${err.message}`);
    return [];
  }
}

/**
 * 4. Match Properties Against Lead Requirements
 */
async function matchProperties(leadRequirementText, budgetMaxInLakhs, properties) {
  if (!properties || properties.length === 0) {
    return { matches: [] };
  }

  // Filter properties that have embeddings
  const validProperties = properties
    .filter(p => Array.isArray(p.semanticEmbedding) && p.semanticEmbedding.length === 384)
    .map(p => ({
      id: p._id.toString(),
      embedding: p.semanticEmbedding,
      listedPriceInLakhs: Number(p.listedPriceInLakhs)
    }));

  if (validProperties.length === 0) {
    // If no properties have 384-dim embeddings yet, do budget-proximity fallback
    const matches = properties.map(p => {
      const budgetDiff = Math.abs(p.listedPriceInLakhs - budgetMaxInLakhs);
      const proximity = Math.max(0, 100 - (budgetDiff / budgetMaxInLakhs) * 100);
      return {
        propertyId: p._id.toString(),
        matchScore: parseFloat(proximity.toFixed(2))
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return { matches };
  }

  try {
    const payload = {
      leadRequirementText,
      budgetMaxInLakhs: Number(budgetMaxInLakhs),
      properties: validProperties
    };

    const response = await apiClient.post('/match-properties', payload);
    return response.data;
  } catch (err) {
    console.warn(`[AI Client] /match-properties failed, using budget fallback: ${err.message}`);

    const matches = validProperties.map(p => {
      const budgetDiff = Math.abs(p.listedPriceInLakhs - budgetMaxInLakhs);
      const score = Math.max(10, Math.min(95, 100 - (budgetDiff / budgetMaxInLakhs) * 50));
      return {
        propertyId: p.id,
        matchScore: parseFloat(score.toFixed(2))
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return { matches };
  }
}

module.exports = {
  predictPrice,
  scoreLead,
  generateEmbedding,
  matchProperties
};
