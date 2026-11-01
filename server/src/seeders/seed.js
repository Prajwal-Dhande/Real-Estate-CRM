require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const aiClient = require('../services/aiClient');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/estateiq';

async function seed() {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${MONGODB_URI} …`);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected successfully ✓');

    // Clear existing data (optional / safe reset)
    await Promise.all([
      User.deleteMany({}),
      Property.deleteMany({}),
      Lead.deleteMany({}),
      Activity.deleteMany({})
    ]);
    console.log('[Seed] Cleared existing records');

    // 1. Seed Users
    const passwordHash = await User.hashPassword('password123');

    const admin = new User({
      name: 'Admin User',
      email: 'admin@estateiq.com',
      passwordHash,
      role: 'admin',
      assignedLocalities: ['Dharampeth', 'Civil Lines', 'Sadar'],
      activeLeadCount: 0
    });
    await admin.save();

    const agent1 = new User({
      name: 'Prajwal Dhande',
      email: 'prajwal@estateiq.com',
      passwordHash,
      role: 'agent',
      assignedLocalities: ['Vasudev Nagar', 'MIHAN', 'Wardha Road'],
      activeLeadCount: 2
    });
    await agent1.save();

    const agent2 = new User({
      name: 'Sneha Sharma',
      email: 'sneha@estateiq.com',
      passwordHash,
      role: 'agent',
      assignedLocalities: ['Dharampeth', 'Manish Nagar', 'Laxmi Nagar'],
      activeLeadCount: 1
    });
    await agent2.save();

    console.log('[Seed] Seeded Users (1 Admin, 2 Agents)');

    // 2. Seed Properties
    const rawProperties = [
      {
        title: 'Luxury 3BHK Apartment near Metro',
        description: 'Spacious high-rise apartment with panoramic city views, modular kitchen, and modern clubhouse access.',
        locality: 'Vasudev Nagar',
        address: 'Plot 42, Metro View Residency, Vasudev Nagar, Nagpur',
        coordinates: { lat: 21.1245, lng: 79.0342 },
        carpetAreaSqFt: 1350,
        bhk: 3,
        bathrooms: 3,
        floorNumber: 7,
        totalFloors: 14,
        furnishing: 'Fully-Furnished',
        amenities: ['Parking', 'Gym', 'Metro Proximity', 'Power Backup', 'Clubhouse'],
        listedPriceInLakhs: 78.5,
        status: 'Available',
        createdBy: agent1._id
      },
      {
        title: 'Modern 2BHK Flat with Balcony',
        description: 'Well-ventilated East-facing apartment close to schools and IT parks with covered car parking.',
        locality: 'MIHAN',
        address: 'Tower B, Tech City Enclave, MIHAN, Nagpur',
        coordinates: { lat: 21.0543, lng: 79.0621 },
        carpetAreaSqFt: 980,
        bhk: 2,
        bathrooms: 2,
        floorNumber: 3,
        totalFloors: 8,
        furnishing: 'Semi-Furnished',
        amenities: ['Parking', 'Power Backup', 'Security', 'Park'],
        listedPriceInLakhs: 48.0,
        status: 'Available',
        createdBy: agent1._id
      },
      {
        title: 'Premium 4BHK Villa with Private Garden',
        description: 'Elite standalone villa in prime central residential hub with private lawn, imported marble and terrace gazebo.',
        locality: 'Dharampeth',
        address: '12 Boulevard Avenue, West Dharampeth, Nagpur',
        coordinates: { lat: 21.1418, lng: 79.0682 },
        carpetAreaSqFt: 2600,
        bhk: 4,
        bathrooms: 4,
        floorNumber: 0,
        totalFloors: 2,
        furnishing: 'Fully-Furnished',
        amenities: ['Private Garden', 'Parking', 'Gym', 'Security', 'Power Backup'],
        listedPriceInLakhs: 215.0,
        status: 'Available',
        createdBy: agent2._id
      },
      {
        title: 'Affordable 2BHK Near Wardha Road Junction',
        description: 'Cozy, move-in ready apartment situated in a gated community with 24/7 water and security.',
        locality: 'Manish Nagar',
        address: 'Flat 204, Shrinath Heights, Manish Nagar, Nagpur',
        coordinates: { lat: 21.0921, lng: 79.0784 },
        carpetAreaSqFt: 920,
        bhk: 2,
        bathrooms: 2,
        floorNumber: 2,
        totalFloors: 6,
        furnishing: 'Semi-Furnished',
        amenities: ['Parking', 'Lift', 'Security'],
        listedPriceInLakhs: 55.0,
        status: 'Available',
        createdBy: agent2._id
      }
    ];

    const seededProperties = [];
    for (const p of rawProperties) {
      // Fetch AI valuation
      let valuation = { estimatedPriceInLakhs: p.listedPriceInLakhs, confidenceScore: 0.85 };
      try {
        valuation = await aiClient.predictPrice({
          locality: p.locality,
          carpetAreaSqFt: p.carpetAreaSqFt,
          bhk: p.bhk,
          bathrooms: p.bathrooms,
          floorNumber: p.floorNumber,
          totalFloors: p.totalFloors,
          furnishing: p.furnishing,
          amenitiesCount: p.amenities.length
        });
      } catch (e) {
        // Fallback used
      }

      // Generate embedding
      let embedding = [];
      try {
        const text = `${p.title}. ${p.description}. Locality: ${p.locality}. Amenities: ${p.amenities.join(', ')}`;
        embedding = await aiClient.generateEmbedding(text);
      } catch (e) {}

      const propDoc = new Property({
        ...p,
        aiEstimatedPriceInLakhs: valuation.estimatedPriceInLakhs,
        valuationConfidence: valuation.confidenceScore,
        semanticEmbedding: embedding
      });
      await propDoc.save();
      seededProperties.push(propDoc);
    }
    console.log(`[Seed] Seeded ${seededProperties.length} Properties with AI valuations and embeddings`);

    // 3. Seed Leads
    const rawLeads = [
      {
        fullName: 'Rahul Verma',
        phone: '+91 98230 11223',
        email: 'rahul.verma@example.com',
        source: 'Website',
        rawRequirementText: 'Looking for a 3BHK flat near metro station in Vasudev Nagar under 85 Lakhs.',
        preferredLocalities: ['Vasudev Nagar', 'Wardha Road'],
        budgetMinInLakhs: 70,
        budgetMaxInLakhs: 85,
        desiredBhk: 3,
        minCarpetAreaSqFt: 1200,
        pipelineStage: 'Site Visit Scheduled',
        assignedAgent: agent1._id
      },
      {
        fullName: 'Anita Kulkarni',
        phone: '+91 97654 44556',
        email: 'anita.kulkarni@example.com',
        source: 'Referral',
        rawRequirementText: 'Need 2BHK flat close to IT corridor in MIHAN, budget 45L to 52L.',
        preferredLocalities: ['MIHAN'],
        budgetMinInLakhs: 45,
        budgetMaxInLakhs: 52,
        desiredBhk: 2,
        minCarpetAreaSqFt: 900,
        pipelineStage: 'Contacted',
        assignedAgent: agent1._id
      },
      {
        fullName: 'Vikramaditya Rao',
        phone: '+91 99887 77665',
        email: 'vikram.rao@example.com',
        source: 'PropertyPortal',
        rawRequirementText: 'Interested in luxury independent house or villa in Dharampeth or Civil Lines with private lawn.',
        preferredLocalities: ['Dharampeth', 'Civil Lines'],
        budgetMinInLakhs: 180,
        budgetMaxInLakhs: 250,
        desiredBhk: 4,
        minCarpetAreaSqFt: 2200,
        pipelineStage: 'Negotiation',
        assignedAgent: agent2._id
      }
    ];

    for (const leadData of rawLeads) {
      let embedding = [];
      try {
        embedding = await aiClient.generateEmbedding(leadData.rawRequirementText);
      } catch (e) {}

      let matches = [];
      try {
        const matchRes = await aiClient.matchProperties(
          leadData.rawRequirementText,
          leadData.budgetMaxInLakhs,
          seededProperties
        );
        if (matchRes && matchRes.matches) {
          matches = matchRes.matches.slice(0, 3).map(m => ({
            property: m.propertyId,
            matchScore: m.matchScore
          }));
        }
      } catch (e) {}

      let scoring = { aiScore: 75, aiPriorityTag: 'Hot', aiScoreFactors: ['High budget match', 'Active inquiries'] };
      try {
        scoring = await aiClient.scoreLead({
          budgetMaxInLakhs: leadData.budgetMaxInLakhs,
          localityMedianPriceInLakhs: leadData.budgetMaxInLakhs,
          interactionCount: 2,
          daysSinceLastContact: 1,
          siteVisitScheduled: leadData.pipelineStage === 'Site Visit Scheduled',
          sentimentScore: 0.5
        });
      } catch (e) {}

      const leadDoc = new Lead({
        ...leadData,
        requirementEmbedding: embedding,
        recommendedProperties: matches,
        aiScore: scoring.aiScore,
        aiPriorityTag: scoring.aiPriorityTag,
        aiScoreFactors: scoring.aiScoreFactors,
        lastContactedAt: new Date()
      });

      await leadDoc.save();

      // Seed an Activity for each lead
      const activity = new Activity({
        lead: leadDoc._id,
        agent: leadData.assignedAgent,
        activityType: leadData.pipelineStage === 'Site Visit Scheduled' ? 'Site Visit' : 'Call',
        notes: `Initial consultation for ${leadDoc.fullName}. Client confirmed preferences and budget.`,
        callDurationSeconds: 240,
        clientSentiment: 'Positive',
        nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      });
      await activity.save();
    }
    console.log(`[Seed] Seeded ${rawLeads.length} Leads and corresponding Activities`);

    console.log('[Seed] ✅ Database seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] ❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();

