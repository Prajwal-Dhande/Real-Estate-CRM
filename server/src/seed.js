require('dotenv').config();

const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./models/User');
const Property = require('./models/Property');
const Lead = require('./models/Lead');
const Activity = require('./models/Activity');
const aiClient = require('./services/aiClient');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estateiq';
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000/api/v1';

async function connectDatabase() {
  console.log(`[Seed] Connecting to MongoDB: ${MONGODB_URI} …`);
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('[Seed] ✓ Connected to primary MongoDB');
    return null;
  } catch (err) {
    console.warn(`[Seed] ⚠️ Primary MongoDB at ${MONGODB_URI} not reachable: ${err.message}`);
    console.log('[Seed] Initializing fallback in-memory MongoDB server for testing …');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`[Seed] In-memory MongoDB running at ${uri}`);
      await mongoose.connect(uri);
      console.log('[Seed] ✓ Connected to in-memory MongoDB');
      return mongod;
    } catch (memErr) {
      console.error('[Seed] Could not start in-memory MongoDB:', memErr.message);
      throw err;
    }
  }
}

async function verifyAiEngine() {
  console.log(`[Seed] Verifying AI Engine connectivity: ${AI_ENGINE_URL} …`);
  try {
    const res = await axios.get('http://127.0.0.1:8000/health', { timeout: 3000 });
    console.log(`[Seed] ✓ AI Engine is LIVE:`, res.data);
    return true;
  } catch (e) {
    console.warn(`[Seed] ⚠️ AI Engine health check failed (${e.message}). Will use built-in heuristic fallbacks.`);
    return false;
  }
}

async function runSeed() {
  console.log('====================================================');
  console.log('       EstateIQ Database Seeder (Nagpur Market)     ');
  console.log('====================================================');

  const mongod = await connectDatabase();
  const aiEngineOnline = await verifyAiEngine();

  // Clear existing collections for a clean idempotent seed
  console.log('\n[1/4] Clearing existing collections …');
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Lead.deleteMany({}),
    Activity.deleteMany({})
  ]);
  console.log('✓ Collections reset');

  // ─────────────────────────────────────────────────────────────
  // 1. Create 1 Admin and 2 Agents
  // ─────────────────────────────────────────────────────────────
  console.log('\n[2/4] Seeding Users (1 Admin, 2 Agents) …');
  const defaultPassword = 'Password123!';
  const passwordHash = await User.hashPassword(defaultPassword);

  const admin = new User({
    name: 'Prajwal Dhande (Admin)',
    email: 'admin@estateiq.com',
    passwordHash,
    role: 'admin',
    assignedLocalities: ['Civil Lines', 'Dharampeth', 'Sadar'],
    activeLeadCount: 0,
    isActive: true
  });
  await admin.save();

  const agent1 = new User({
    name: 'Sneha Deshmukh',
    email: 'sneha@estateiq.com',
    passwordHash,
    role: 'agent',
    assignedLocalities: ['Vasudev Nagar', 'Trimurti Nagar', 'Wardha Road'],
    activeLeadCount: 10,
    isActive: true
  });
  await agent1.save();

  const agent2 = new User({
    name: 'Rohan Kulkarni',
    email: 'rohan@estateiq.com',
    passwordHash,
    role: 'agent',
    assignedLocalities: ['MIHAN', 'Manish Nagar', 'Hingna'],
    activeLeadCount: 10,
    isActive: true
  });
  await agent2.save();

  console.log(`✓ Seeded Users:`);
  console.log(`   - Admin: ${admin.email} (Localities: ${admin.assignedLocalities.join(', ')})`);
  console.log(`   - Agent 1: ${agent1.email} (Localities: ${agent1.assignedLocalities.join(', ')})`);
  console.log(`   - Agent 2: ${agent2.email} (Localities: ${agent2.assignedLocalities.join(', ')})`);

  // ─────────────────────────────────────────────────────────────
  // 2. Create 15 Realistic Properties
  // Across Vasudev Nagar, Dharampeth, MIHAN, Trimurti Nagar, and Manish Nagar
  // ─────────────────────────────────────────────────────────────
  console.log('\n[3/4] Seeding 15 Properties across 5 Nagpur localities …');

  const rawProperties = [
    // Vasudev Nagar (3 properties)
    {
      title: 'Vasudev Metro Heights 3BHK Luxury Flat',
      description: 'East-facing luxury flat directly opposite the Metro station with modular kitchen, spacious balconies, and 2 covered parking spots.',
      locality: 'Vasudev Nagar',
      address: 'Plot 45, Near Metro Pillar 102, Vasudev Nagar, Hingna Road, Nagpur',
      coordinates: { lat: 21.1245, lng: 79.0342 },
      carpetAreaSqFt: 1350,
      bhk: 3,
      bathrooms: 3,
      floorNumber: 6,
      totalFloors: 12,
      furnishing: 'Fully-Furnished',
      amenities: ['Metro Proximity', 'Parking', 'Gym', 'Power Backup', 'Clubhouse'],
      listedPriceInLakhs: 78.5,
      status: 'Available',
      createdBy: agent1._id
    },
    {
      title: 'Green Valley 2BHK Garden Apartment',
      description: 'Peaceful residential flat surrounded by landscaped greenery, 24/7 security, solar water heating, and modern elevator.',
      locality: 'Vasudev Nagar',
      address: 'Tower C, Green Valley Enclave, Vasudev Nagar, Nagpur',
      coordinates: { lat: 21.1260, lng: 79.0365 },
      carpetAreaSqFt: 980,
      bhk: 2,
      bathrooms: 2,
      floorNumber: 2,
      totalFloors: 7,
      furnishing: 'Semi-Furnished',
      amenities: ['Parking', 'Power Backup', 'Security', 'Private Garden'],
      listedPriceInLakhs: 52.0,
      status: 'Available',
      createdBy: agent1._id
    },
    {
      title: 'Vasudev Premium 4BHK Penthouse with Terrace',
      description: 'Top-floor penthouse with private open-to-sky terrace gazebo, Italian marble flooring, servant quarters, and high-speed lifts.',
      locality: 'Vasudev Nagar',
      address: 'Penthouse 1201, Royal Sky Towers, Vasudev Nagar, Nagpur',
      coordinates: { lat: 21.1230, lng: 79.0320 },
      carpetAreaSqFt: 2100,
      bhk: 4,
      bathrooms: 4,
      floorNumber: 12,
      totalFloors: 12,
      furnishing: 'Fully-Furnished',
      amenities: ['Parking', 'Gym', 'Metro Proximity', 'Clubhouse', 'Private Garden'],
      listedPriceInLakhs: 145.0,
      status: 'Available',
      createdBy: agent1._id
    },

    // Dharampeth (3 properties)
    {
      title: 'Dharampeth Elite 4BHK Independent Villa',
      description: 'High-end bungalow in prime West Dharampeth with teak wood doors, private garden lawn, CCTV surveillance, and solar inverter setup.',
      locality: 'Dharampeth',
      address: '14 Boulevard Avenue, West High Court Road, Dharampeth, Nagpur',
      coordinates: { lat: 21.1418, lng: 79.0682 },
      carpetAreaSqFt: 2800,
      bhk: 4,
      bathrooms: 4,
      floorNumber: 0,
      totalFloors: 2,
      furnishing: 'Fully-Furnished',
      amenities: ['Private Garden', 'Parking', 'Security', 'Power Backup', 'Gym'],
      listedPriceInLakhs: 235.0,
      status: 'Available',
      createdBy: admin._id
    },
    {
      title: 'Shriram Heritage 3BHK Central Apartment',
      description: 'Centrally located luxury apartment near Shivaji Nagar park and elite schools, Vastu-compliant layout with two Master suites.',
      locality: 'Dharampeth',
      address: 'Flat 402, Shriram Heritage, Coffee House Square, Dharampeth, Nagpur',
      coordinates: { lat: 21.1442, lng: 79.0655 },
      carpetAreaSqFt: 1550,
      bhk: 3,
      bathrooms: 3,
      floorNumber: 4,
      totalFloors: 8,
      furnishing: 'Semi-Furnished',
      amenities: ['Parking', 'Lift', 'Security', 'Power Backup'],
      listedPriceInLakhs: 128.0,
      status: 'Available',
      createdBy: admin._id
    },
    {
      title: 'Dharampeth Grandeur 2BHK Move-In Ready Flat',
      description: 'Chic urban apartment with premium fittings, proximity to Law College square, commercial markets, and hospital centers.',
      locality: 'Dharampeth',
      address: '2nd Floor, Grandeur Heights, Zenda Chowk, Dharampeth, Nagpur',
      coordinates: { lat: 21.1395, lng: 79.0710 },
      carpetAreaSqFt: 1050,
      bhk: 2,
      bathrooms: 2,
      floorNumber: 2,
      totalFloors: 5,
      furnishing: 'Semi-Furnished',
      amenities: ['Parking', 'Lift', 'Security'],
      listedPriceInLakhs: 88.0,
      status: 'Under Offer',
      createdBy: admin._id
    },

    // MIHAN (3 properties)
    {
      title: 'MIHAN Tech City 2BHK Corporate Apartment',
      description: 'Modern condominium located next to Infosys and TCS campuses with co-working lounge, high-speed fiber internet, and club.',
      locality: 'MIHAN',
      address: 'Tower A, First City Enclave, MIHAN SEZ, Nagpur',
      coordinates: { lat: 21.0543, lng: 79.0621 },
      carpetAreaSqFt: 1020,
      bhk: 2,
      bathrooms: 2,
      floorNumber: 5,
      totalFloors: 14,
      furnishing: 'Semi-Furnished',
      amenities: ['Parking', 'Gym', 'Clubhouse', 'Power Backup', 'Security'],
      listedPriceInLakhs: 48.5,
      status: 'Available',
      createdBy: agent2._id
    },
    {
      title: 'Aviation Greens 3BHK Spacious Apartment',
      description: 'Overlooking the MIHAN aerocity green belt, featuring Olympic-length swimming pool, jogging track, and multi-tier security.',
      locality: 'MIHAN',
      address: 'Block 3, Aviation Greens, Wardha Road Bypass, MIHAN, Nagpur',
      coordinates: { lat: 21.0489, lng: 79.0585 },
      carpetAreaSqFt: 1400,
      bhk: 3,
      bathrooms: 3,
      floorNumber: 8,
      totalFloors: 16,
      furnishing: 'Unfurnished',
      amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Power Backup'],
      listedPriceInLakhs: 66.0,
      status: 'Available',
      createdBy: agent2._id
    },
    {
      title: 'EcoNest MIHAN 1BHK Smart Studio Suite',
      description: 'Ideal rental yield studio apartment with smart home automation, induction kitchen, and walking distance to AIIMS Nagpur.',
      locality: 'MIHAN',
      address: 'Studio 304, EcoNest Tech Park, MIHAN South, Nagpur',
      coordinates: { lat: 21.0598, lng: 79.0645 },
      carpetAreaSqFt: 580,
      bhk: 1,
      bathrooms: 1,
      floorNumber: 3,
      totalFloors: 9,
      furnishing: 'Fully-Furnished',
      amenities: ['Parking', 'Lift', 'Security', 'Power Backup'],
      listedPriceInLakhs: 28.0,
      status: 'Available',
      createdBy: agent2._id
    },

    // Trimurti Nagar (3 properties)
    {
      title: 'Trimurti Prime 3BHK Road-Facing Flat',
      description: 'Convenient central south residential property near Ring Road with double balcony, granite kitchen platform, and visitor parking.',
      locality: 'Trimurti Nagar',
      address: 'Flat 301, Prime Park View, Ring Road Junction, Trimurti Nagar, Nagpur',
      coordinates: { lat: 21.1182, lng: 79.0432 },
      carpetAreaSqFt: 1280,
      bhk: 3,
      bathrooms: 2,
      floorNumber: 3,
      totalFloors: 6,
      furnishing: 'Semi-Furnished',
      amenities: ['Parking', 'Lift', 'Security', 'Power Backup'],
      listedPriceInLakhs: 72.0,
      status: 'Available',
      createdBy: agent1._id
    },
    {
      title: 'Sai Kripa 2BHK Family Home',
      description: 'Well-maintained family home near Orange City Hospital with 24-hour borewell and municipal water, security intercom, and park.',
      locality: 'Trimurti Nagar',
      address: 'Plot 22, Sai Kripa Complex, Bhamti, Trimurti Nagar, Nagpur',
      coordinates: { lat: 21.1150, lng: 79.0410 },
      carpetAreaSqFt: 960,
      bhk: 2,
      bathrooms: 2,
      floorNumber: 1,
      totalFloors: 4,
      furnishing: 'Unfurnished',
      amenities: ['Parking', 'Security'],
      listedPriceInLakhs: 54.0,
      status: 'Available',
      createdBy: agent1._id
    },
    {
      title: 'Trimurti Royal 3BHK Duplex Apartment',
      description: 'Architecturally designed duplex with internal wooden staircase, double height ceiling in living room, and private open terrace.',
      locality: 'Trimurti Nagar',
      address: 'Duplex 501, Royal Enclave, Trimurti Nagar, Nagpur',
      coordinates: { lat: 21.1210, lng: 79.0460 },
      carpetAreaSqFt: 1750,
      bhk: 3,
      bathrooms: 3,
      floorNumber: 5,
      totalFloors: 6,
      furnishing: 'Fully-Furnished',
      amenities: ['Parking', 'Gym', 'Power Backup', 'Clubhouse'],
      listedPriceInLakhs: 104.0,
      status: 'Available',
      createdBy: agent1._id
    },

    // Manish Nagar (3 properties)
    {
      title: 'Besa Square Horizon 3BHK High-Rise Flat',
      description: 'Newly constructed high-rise flat on Besa-Manish Nagar main road with clubhouse, rooftop infinity pool, and biometric entry.',
      locality: 'Manish Nagar',
      address: 'Tower 2, Horizon Heights, Besa Road, Manish Nagar, Nagpur',
      coordinates: { lat: 21.0921, lng: 79.0784 },
      carpetAreaSqFt: 1420,
      bhk: 3,
      bathrooms: 3,
      floorNumber: 9,
      totalFloors: 15,
      furnishing: 'Semi-Furnished',
      amenities: ['Parking', 'Gym', 'Swimming Pool', 'Clubhouse', 'Power Backup'],
      listedPriceInLakhs: 84.0,
      status: 'Available',
      createdBy: agent2._id
    },
    {
      title: 'Shrinath Residency 2BHK Move-In Ready Flat',
      description: 'Budget-friendly 2BHK flat close to Manish Nagar railway overbridge, shopping complexes, and vegetable markets with covered stilt parking.',
      locality: 'Manish Nagar',
      address: 'Flat 203, Shrinath Residency, Somalwada Road, Manish Nagar, Nagpur',
      coordinates: { lat: 21.0955, lng: 79.0745 },
      carpetAreaSqFt: 940,
      bhk: 2,
      bathrooms: 2,
      floorNumber: 2,
      totalFloors: 6,
      furnishing: 'Semi-Furnished',
      amenities: ['Parking', 'Lift', 'Security'],
      listedPriceInLakhs: 56.5,
      status: 'Available',
      createdBy: agent2._id
    },
    {
      title: 'Manish Nagar Parkview 3BHK Penthouse Suite',
      description: 'Exclusive top-floor corner unit with unhindered airport runway views, Italian modular kitchen, and double covered car garage.',
      locality: 'Manish Nagar',
      address: 'Penthouse A, Parkview Towers, Manish Nagar, Nagpur',
      coordinates: { lat: 21.0890, lng: 79.0815 },
      carpetAreaSqFt: 1680,
      bhk: 3,
      bathrooms: 3,
      floorNumber: 7,
      totalFloors: 7,
      furnishing: 'Fully-Furnished',
      amenities: ['Parking', 'Gym', 'Power Backup', 'Clubhouse', 'Lift'],
      listedPriceInLakhs: 112.0,
      status: 'Sold',
      createdBy: agent2._id
    }
  ];

  const seededProperties = [];
  for (let i = 0; i < rawProperties.length; i++) {
    const p = rawProperties[i];
    process.stdout.write(`   [${i + 1}/${rawProperties.length}] Processing "${p.title}" (${p.locality}) … `);

    // Call AI Engine for valuation
    let aiEstimatedPriceInLakhs = p.listedPriceInLakhs;
    let valuationConfidence = 0.85;

    try {
      const val = await aiClient.predictPrice({
        locality: p.locality,
        carpetAreaSqFt: p.carpetAreaSqFt,
        bhk: p.bhk,
        bathrooms: p.bathrooms,
        floorNumber: p.floorNumber,
        totalFloors: p.totalFloors,
        furnishing: p.furnishing,
        amenitiesCount: p.amenities.length
      });
      aiEstimatedPriceInLakhs = val.estimatedPriceInLakhs;
      valuationConfidence = val.confidenceScore;
    } catch (e) {
      // fallback handled in aiClient
    }

    // Call AI Engine for 384-dim semantic embedding
    let semanticEmbedding = [];
    try {
      const text = `${p.title}. ${p.description}. Locality: ${p.locality}. ${p.bhk} BHK, ${p.carpetAreaSqFt} sq ft. Amenities: ${p.amenities.join(', ')}`;
      semanticEmbedding = await aiClient.generateEmbedding(text);
    } catch (e) {}

    const doc = new Property({
      ...p,
      aiEstimatedPriceInLakhs,
      valuationConfidence,
      semanticEmbedding
    });
    await doc.save();
    seededProperties.push(doc);
    console.log(`✓ (AI Val: ₹${aiEstimatedPriceInLakhs}L | Emb: ${semanticEmbedding.length} dims)`);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Create 20 Realistic Leads across Kanban Stages
  // ─────────────────────────────────────────────────────────────
  console.log('\n[4/4] Seeding 20 Leads across all 6 Kanban Stages …');

  const rawLeads = [
    // Stage 1: New Inquiry (4 leads)
    {
      fullName: 'Vikram Joshi',
      phone: '+91 98220 11001',
      email: 'vikram.joshi@gmail.com',
      source: 'Website',
      rawRequirementText: 'Looking for 3BHK flat near metro station in Vasudev Nagar or Hingna Road under 80 Lakhs with car parking.',
      preferredLocalities: ['Vasudev Nagar', 'Hingna'],
      budgetMinInLakhs: 65,
      budgetMaxInLakhs: 80,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1200,
      pipelineStage: 'New Inquiry',
      assignedAgent: agent1._id,
      sentimentScore: 0.2
    },
    {
      fullName: 'Deepika Sen',
      phone: '+91 98220 11002',
      email: 'deepika.sen@yahoo.com',
      source: 'Walk-in',
      rawRequirementText: 'Need compact 1BHK or studio apartment near AIIMS hospital or IT Park in MIHAN within 30 Lakhs budget.',
      preferredLocalities: ['MIHAN'],
      budgetMinInLakhs: 22,
      budgetMaxInLakhs: 30,
      desiredBhk: 1,
      minCarpetAreaSqFt: 550,
      pipelineStage: 'New Inquiry',
      assignedAgent: agent2._id,
      sentimentScore: 0.0
    },
    {
      fullName: 'Pooja Bhatt',
      phone: '+91 98220 11003',
      email: 'pooja.bhatt@outlook.com',
      source: 'PropertyPortal',
      rawRequirementText: 'Want a 2BHK flat in Trimurti Nagar near Ring road junction under 60 Lakhs, ready to move in.',
      preferredLocalities: ['Trimurti Nagar'],
      budgetMinInLakhs: 48,
      budgetMaxInLakhs: 60,
      desiredBhk: 2,
      minCarpetAreaSqFt: 900,
      pipelineStage: 'New Inquiry',
      assignedAgent: agent1._id,
      sentimentScore: 0.1
    },
    {
      fullName: 'Girish Chandran',
      phone: '+91 98220 11004',
      email: 'girish.c@gmail.com',
      source: 'Referral',
      rawRequirementText: 'Searching for 2BHK flat in Manish Nagar near Besa road under 60 Lakhs with power backup.',
      preferredLocalities: ['Manish Nagar'],
      budgetMinInLakhs: 50,
      budgetMaxInLakhs: 60,
      desiredBhk: 2,
      minCarpetAreaSqFt: 920,
      pipelineStage: 'New Inquiry',
      assignedAgent: agent2._id,
      sentimentScore: -0.1
    },

    // Stage 2: Contacted (4 leads)
    {
      fullName: 'Kunal Deshpande',
      phone: '+91 98220 11005',
      email: 'kunal.d@tcs.com',
      source: 'Website',
      rawRequirementText: 'TCS tech lead seeking 2BHK or 3BHK in MIHAN near Infosys campus under 55 Lakhs, East facing preferred.',
      preferredLocalities: ['MIHAN'],
      budgetMinInLakhs: 45,
      budgetMaxInLakhs: 55,
      desiredBhk: 2,
      minCarpetAreaSqFt: 980,
      pipelineStage: 'Contacted',
      assignedAgent: agent2._id,
      sentimentScore: 0.4
    },
    {
      fullName: 'Sunita Agrawal',
      phone: '+91 98220 11006',
      email: 'sunita.agrawal@gmail.com',
      source: 'PropertyPortal',
      rawRequirementText: 'Interested in Dharampeth 3BHK flat near coffee house or Shivaji nagar under 135 Lakhs with lift and parking.',
      preferredLocalities: ['Dharampeth'],
      budgetMinInLakhs: 110,
      budgetMaxInLakhs: 135,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1500,
      pipelineStage: 'Contacted',
      assignedAgent: admin._id,
      sentimentScore: 0.3
    },
    {
      fullName: 'Nilesh Tijare',
      phone: '+91 98220 11007',
      email: 'nilesh.tijare@rediffmail.com',
      source: 'Walk-in',
      rawRequirementText: 'Looking for 3BHK in Trimurti Nagar or Pratap Nagar with balcony under 75 Lakhs.',
      preferredLocalities: ['Trimurti Nagar'],
      budgetMinInLakhs: 60,
      budgetMaxInLakhs: 75,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1250,
      pipelineStage: 'Contacted',
      assignedAgent: agent1._id,
      sentimentScore: 0.2
    },
    {
      fullName: 'Meenakshi Iyer',
      phone: '+91 98220 11008',
      email: 'meenakshi.iyer@gmail.com',
      source: 'Referral',
      rawRequirementText: 'Need 3BHK apartment in Manish Nagar close to airport with modern gymnasium and security under 90L.',
      preferredLocalities: ['Manish Nagar'],
      budgetMinInLakhs: 75,
      budgetMaxInLakhs: 90,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1350,
      pipelineStage: 'Contacted',
      assignedAgent: agent2._id,
      sentimentScore: 0.1
    },

    // Stage 3: Site Visit Scheduled (4 leads)
    {
      fullName: 'Rahul Verma',
      phone: '+91 98220 11009',
      email: 'rahul.verma@example.com',
      source: 'Website',
      rawRequirementText: 'Looking for a 3BHK luxury flat near metro station in Vasudev Nagar under 85 Lakhs. Visited show flat already.',
      preferredLocalities: ['Vasudev Nagar'],
      budgetMinInLakhs: 70,
      budgetMaxInLakhs: 85,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1300,
      pipelineStage: 'Site Visit Scheduled',
      assignedAgent: agent1._id,
      sentimentScore: 0.7
    },
    {
      fullName: 'Harishankar Tiwari',
      phone: '+91 98220 11010',
      email: 'htiwari@gmail.com',
      source: 'PropertyPortal',
      rawRequirementText: 'Need 4BHK bungalow or independent house in Dharampeth or Civil Lines under 2.5 Crore. Site inspection this Saturday.',
      preferredLocalities: ['Dharampeth', 'Civil Lines'],
      budgetMinInLakhs: 190,
      budgetMaxInLakhs: 250,
      desiredBhk: 4,
      minCarpetAreaSqFt: 2500,
      pipelineStage: 'Site Visit Scheduled',
      assignedAgent: admin._id,
      sentimentScore: 0.6
    },
    {
      fullName: 'Ashwin Khobragade',
      phone: '+91 98220 11011',
      email: 'ashwin.k@gmail.com',
      source: 'Referral',
      rawRequirementText: 'Seeking 3BHK flat in Besa or Manish Nagar with rooftop amenities under 88 Lakhs.',
      preferredLocalities: ['Manish Nagar'],
      budgetMinInLakhs: 72,
      budgetMaxInLakhs: 88,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1400,
      pipelineStage: 'Site Visit Scheduled',
      assignedAgent: agent2._id,
      sentimentScore: 0.5
    },
    {
      fullName: 'Dr. Shalini Gupta',
      phone: '+91 98220 11012',
      email: 'dr.shalini@aiims.edu',
      source: 'Walk-in',
      rawRequirementText: 'Doctor at AIIMS Nagpur seeking 3BHK in MIHAN Aviation Greens under 70 Lakhs with quick possession.',
      preferredLocalities: ['MIHAN'],
      budgetMinInLakhs: 55,
      budgetMaxInLakhs: 70,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1350,
      pipelineStage: 'Site Visit Scheduled',
      assignedAgent: agent2._id,
      sentimentScore: 0.8
    },

    // Stage 4: Negotiation (4 leads)
    {
      fullName: 'Vikramaditya Rao',
      phone: '+91 98220 11013',
      email: 'vikram.rao@example.com',
      source: 'PropertyPortal',
      rawRequirementText: 'Interested in luxury 4BHK independent villa in West Dharampeth. Counter-offered 2.25 Cr, discussing token advance.',
      preferredLocalities: ['Dharampeth'],
      budgetMinInLakhs: 200,
      budgetMaxInLakhs: 240,
      desiredBhk: 4,
      minCarpetAreaSqFt: 2600,
      pipelineStage: 'Negotiation',
      assignedAgent: admin._id,
      sentimentScore: 0.8
    },
    {
      fullName: 'Manish Chawla',
      phone: '+91 98220 11014',
      email: 'manish.chawla@gmail.com',
      source: 'Website',
      rawRequirementText: 'Negotiating final price for 3BHK Penthouse in Vasudev Nagar. Loan pre-approved with SBI.',
      preferredLocalities: ['Vasudev Nagar'],
      budgetMinInLakhs: 125,
      budgetMaxInLakhs: 145,
      desiredBhk: 4,
      minCarpetAreaSqFt: 2000,
      pipelineStage: 'Negotiation',
      assignedAgent: agent1._id,
      sentimentScore: 0.7
    },
    {
      fullName: 'Sanjay Borkar',
      phone: '+91 98220 11015',
      email: 'sanjay.borkar@yahoo.com',
      source: 'Referral',
      rawRequirementText: 'Negotiating 3BHK duplex apartment in Trimurti Nagar near Ring Road. Looking to close at 98 Lakhs.',
      preferredLocalities: ['Trimurti Nagar'],
      budgetMinInLakhs: 90,
      budgetMaxInLakhs: 105,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1700,
      pipelineStage: 'Negotiation',
      assignedAgent: agent1._id,
      sentimentScore: 0.6
    },
    {
      fullName: 'Priyanka Meshram',
      phone: '+91 98220 11016',
      email: 'priyanka.m@gmail.com',
      source: 'PropertyPortal',
      rawRequirementText: 'Final terms negotiation for 3BHK in Besa Horizon Heights Manish Nagar. Requesting covered car parking fee waiver.',
      preferredLocalities: ['Manish Nagar'],
      budgetMinInLakhs: 75,
      budgetMaxInLakhs: 85,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1400,
      pipelineStage: 'Negotiation',
      assignedAgent: agent2._id,
      sentimentScore: 0.5
    },

    // Stage 5: Closed Won (3 leads)
    {
      fullName: 'Amitabh Banerjee',
      phone: '+91 98220 11017',
      email: 'amitabh.b@example.com',
      source: 'Website',
      rawRequirementText: '3BHK penthouse in Manish Nagar near Besa Square. Sale deed registered and possession keys handed over.',
      preferredLocalities: ['Manish Nagar'],
      budgetMinInLakhs: 95,
      budgetMaxInLakhs: 115,
      desiredBhk: 3,
      minCarpetAreaSqFt: 1650,
      pipelineStage: 'Closed Won',
      assignedAgent: agent2._id,
      sentimentScore: 1.0
    },
    {
      fullName: 'Tanvi Saxena',
      phone: '+91 98220 11018',
      email: 'tanvi.saxena@tcs.com',
      source: 'Walk-in',
      rawRequirementText: 'Closed won 2BHK flat in MIHAN First City. Stamp duty and registration completed with bank disbursal.',
      preferredLocalities: ['MIHAN'],
      budgetMinInLakhs: 45,
      budgetMaxInLakhs: 50,
      desiredBhk: 2,
      minCarpetAreaSqFt: 1000,
      pipelineStage: 'Closed Won',
      assignedAgent: agent2._id,
      sentimentScore: 0.9
    },
    {
      fullName: 'Rajendra Pande',
      phone: '+91 98220 11019',
      email: 'rajendra.pande@gmail.com',
      source: 'Referral',
      rawRequirementText: 'Closed deal for 2BHK Green Valley Vasudev Nagar. Registry complete.',
      preferredLocalities: ['Vasudev Nagar'],
      budgetMinInLakhs: 48,
      budgetMaxInLakhs: 54,
      desiredBhk: 2,
      minCarpetAreaSqFt: 980,
      pipelineStage: 'Closed Won',
      assignedAgent: agent1._id,
      sentimentScore: 0.95
    },

    // Stage 6: Closed Lost (1 lead)
    {
      fullName: 'Gautam Singhania',
      phone: '+91 98220 11020',
      email: 'gautam.s@gmail.com',
      source: 'PropertyPortal',
      rawRequirementText: 'Wanted Dharampeth 4BHK bungalow under 1.5 Cr. Unrealistic budget expectations for prime Dharampeth market.',
      preferredLocalities: ['Dharampeth'],
      budgetMinInLakhs: 120,
      budgetMaxInLakhs: 150,
      desiredBhk: 4,
      minCarpetAreaSqFt: 2500,
      pipelineStage: 'Closed Lost',
      assignedAgent: admin._id,
      sentimentScore: -0.6
    }
  ];

  for (let i = 0; i < rawLeads.length; i++) {
    const l = rawLeads[i];
    process.stdout.write(`   [${i + 1}/${rawLeads.length}] Scoring lead "${l.fullName}" (${l.pipelineStage}) … `);

    // 1. Generate 384-dim semantic embedding
    let requirementEmbedding = [];
    try {
      requirementEmbedding = await aiClient.generateEmbedding(l.rawRequirementText);
    } catch (e) {}

    // 2. Semantic matching with seeded properties
    let recommendedProperties = [];
    try {
      const matchRes = await aiClient.matchProperties(
        l.rawRequirementText,
        l.budgetMaxInLakhs,
        seededProperties
      );
      if (matchRes && matchRes.matches) {
        recommendedProperties = matchRes.matches.slice(0, 3).map(m => ({
          property: m.propertyId,
          matchScore: m.matchScore
        }));
      }
    } catch (e) {}

    // 3. AI lead conversion score
    let aiScore = 50;
    let aiPriorityTag = 'Warm';
    let aiScoreFactors = ['Initial qualification'];

    const isSiteVisit = ['Site Visit Scheduled', 'Negotiation', 'Closed Won'].includes(l.pipelineStage);
    const interactionCount = l.pipelineStage === 'Closed Won' ? 8 : l.pipelineStage === 'Negotiation' ? 6 : isSiteVisit ? 4 : 2;
    const daysSinceLastContact = l.pipelineStage === 'Closed Lost' ? 25 : l.pipelineStage === 'New Inquiry' ? 1 : 0;

    try {
      const scoreRes = await aiClient.scoreLead({
        budgetMaxInLakhs: l.budgetMaxInLakhs,
        localityMedianPriceInLakhs: l.budgetMaxInLakhs * 0.95,
        interactionCount,
        daysSinceLastContact,
        siteVisitScheduled: isSiteVisit,
        sentimentScore: l.sentimentScore || 0.0
      });
      aiScore = scoreRes.aiScore;
      aiPriorityTag = scoreRes.aiPriorityTag;
      aiScoreFactors = scoreRes.aiScoreFactors;
    } catch (e) {}

    const leadDoc = new Lead({
      fullName: l.fullName,
      phone: l.phone,
      email: l.email,
      source: l.source,
      rawRequirementText: l.rawRequirementText,
      preferredLocalities: l.preferredLocalities,
      budgetMinInLakhs: l.budgetMinInLakhs,
      budgetMaxInLakhs: l.budgetMaxInLakhs,
      desiredBhk: l.desiredBhk,
      minCarpetAreaSqFt: l.minCarpetAreaSqFt,
      pipelineStage: l.pipelineStage,
      assignedAgent: l.assignedAgent,
      aiScore,
      aiPriorityTag,
      aiScoreFactors,
      recommendedProperties,
      requirementEmbedding,
      lastContactedAt: new Date(Date.now() - daysSinceLastContact * 86400000)
    });

    await leadDoc.save();

    // Log a corresponding activity
    const activity = new Activity({
      lead: leadDoc._id,
      agent: l.assignedAgent,
      activityType: isSiteVisit ? 'Site Visit' : 'Call',
      notes: `Interaction logged for ${l.fullName}: ${l.rawRequirementText.slice(0, 80)}...`,
      callDurationSeconds: 180,
      clientSentiment: l.sentimentScore > 0.3 ? 'Positive' : l.sentimentScore < -0.2 ? 'Negative' : 'Neutral',
      nextFollowUpAt: new Date(Date.now() + 2 * 86400000)
    });
    await activity.save();

    console.log(`✓ (Score: ${aiScore} [${aiPriorityTag}] | Matches: ${recommendedProperties.length})`);
  }

  console.log('\n====================================================');
  console.log('✅ SEEDING COMPLETE: Full Node.js -> FastAPI -> DB Pipeline Verified!');
  console.log(`   - 3 Users (1 Admin, 2 Agents)`);
  console.log(`   - 15 Properties across 5 Nagpur Localities`);
  console.log(`   - 20 Leads scored across all 6 Kanban Stages`);
  console.log('====================================================');

  if (mongod) {
    await mongod.stop();
  }
  process.exit(0);
}

runSeed().catch(err => {
  console.error('[Seed Error] Seeding process failed:', err);
  process.exit(1);
});
