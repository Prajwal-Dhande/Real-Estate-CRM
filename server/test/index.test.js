const assert = require('assert');
const express = require('express');
const mongoose = require('mongoose');

console.log('--- Testing EstateIQ Server Components ---');

// 1. Models Verification
const User = require('../src/models/User');
const Property = require('../src/models/Property');
const Lead = require('../src/models/Lead');
const Activity = require('../src/models/Activity');

console.log('[1/5] Verifying Mongoose Schemas...');

// Test User model schema
const testUser = new User({
  name: 'Test Agent',
  email: 'agent@test.com',
  passwordHash: '$2a$10$xyz',
  role: 'agent',
  assignedLocalities: ['Vasudev Nagar', 'MIHAN']
});
assert.strictEqual(testUser.name, 'Test Agent');
assert.strictEqual(testUser.role, 'agent');
assert.strictEqual(testUser.assignedLocalities.length, 2);
console.log('✓ User model verified');

// Test Property model schema
const testProperty = new Property({
  title: 'Test 3BHK Apartment',
  description: 'Near metro station',
  locality: 'Vasudev Nagar',
  address: '123 Test Road',
  coordinates: { lat: 21.14, lng: 79.08 },
  carpetAreaSqFt: 1200,
  bhk: 3,
  floorNumber: 4,
  totalFloors: 10,
  listedPriceInLakhs: 75.0,
  aiEstimatedPriceInLakhs: 73.5,
  valuationConfidence: 0.88,
  semanticEmbedding: new Array(384).fill(0.01)
});
assert.strictEqual(testProperty.locality, 'Vasudev Nagar');
assert.strictEqual(testProperty.bhk, 3);
assert.strictEqual(testProperty.semanticEmbedding.length, 384);
console.log('✓ Property model verified (384-dim embedding supported)');

// Test Lead model schema
const testLead = new Lead({
  fullName: 'John Doe',
  phone: '+91 98765 43210',
  rawRequirementText: 'Need 3BHK under 75L',
  budgetMinInLakhs: 60,
  budgetMaxInLakhs: 75,
  desiredBhk: 3,
  pipelineStage: 'New Inquiry',
  aiScore: 82,
  aiPriorityTag: 'Hot',
  aiScoreFactors: ['High budget match', 'Contacted recently']
});
assert.strictEqual(testLead.fullName, 'John Doe');
assert.strictEqual(testLead.aiScore, 82);
assert.strictEqual(testLead.aiPriorityTag, 'Hot');
console.log('✓ Lead model verified (scoring + factors supported)');

// Test Activity model schema
const testActivity = new Activity({
  lead: new mongoose.Types.ObjectId(),
  agent: new mongoose.Types.ObjectId(),
  activityType: 'Call',
  notes: 'Client confirmed budget and requirements',
  callDurationSeconds: 120,
  clientSentiment: 'Positive',
  nextFollowUpAt: new Date(Date.now() + 86400000)
});
assert.strictEqual(testActivity.activityType, 'Call');
assert.strictEqual(testActivity.clientSentiment, 'Positive');
console.log('✓ Activity model verified');

// 2. AI Client Verification (Fallback check when engine is offline)
console.log('\n[2/5] Testing AI Client Fallback mechanisms...');
const aiClient = require('../src/services/aiClient');

async function testAIClient() {
  const valuation = await aiClient.predictPrice({
    locality: 'Vasudev Nagar',
    carpetAreaSqFt: 1200,
    bhk: 3,
    bathrooms: 2,
    floorNumber: 2,
    totalFloors: 5,
    furnishing: 'Semi-Furnished',
    amenitiesCount: 3
  });
  assert(valuation.estimatedPriceInLakhs > 0, 'Estimated price should be > 0');
  console.log(`✓ AI Client predictPrice returned: ${valuation.estimatedPriceInLakhs} Lakhs (confidence: ${valuation.confidenceScore})`);

  const scoring = await aiClient.scoreLead({
    budgetMaxInLakhs: 75,
    localityMedianPriceInLakhs: 70,
    interactionCount: 2,
    daysSinceLastContact: 1,
    siteVisitScheduled: true,
    sentimentScore: 0.5
  });
  assert(scoring.aiScore >= 0 && scoring.aiScore <= 100, 'Score should be 0-100');
  assert(['Hot', 'Warm', 'Cold'].includes(scoring.aiPriorityTag), 'Priority tag should be Hot/Warm/Cold');
  console.log(`✓ AI Client scoreLead returned: Score ${scoring.aiScore} (${scoring.aiPriorityTag}) - Factors: ${scoring.aiScoreFactors.length}`);

  const embedding = await aiClient.generateEmbedding('Need 3BHK flat near metro');
  console.log(`✓ AI Client generateEmbedding returned array (length: ${embedding.length})`);
}

// 3. Socket.io and Queue imports check
console.log('\n[3/5] Testing Socket.io and BullMQ Queue imports...');
const socket = require('../src/socket');
assert(typeof socket.emitLeadCreated === 'function');
assert(typeof socket.emitLeadStageUpdated === 'function');
assert(typeof socket.emitFollowupDue === 'function');
console.log('✓ Socket emit functions exported');

const followupQueue = require('../src/queues/followupQueue');
assert(typeof followupQueue.scheduleFollowupReminder === 'function');
console.log('✓ BullMQ scheduleFollowupReminder function exported');

// 4. Express Routes & Middleware check
console.log('\n[4/5] Testing Route mounting on Express...');
const authRoutes = require('../src/routes/authRoutes');
const propertyRoutes = require('../src/routes/propertyRoutes');
const leadRoutes = require('../src/routes/leadRoutes');
const activityRoutes = require('../src/routes/activityRoutes');
const dashboardRoutes = require('../src/routes/dashboardRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

console.log('✓ All 5 route modules mounted successfully');

// Run async checks
testAIClient().then(() => {
  console.log('\n[5/5] All Unit and Integration Tests Passed! ✅');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
