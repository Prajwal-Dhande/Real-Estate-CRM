/**
 * WhatsApp Real Estate Requirement NLP Parser
 * Extracts BHK, Locality, Budget range, and Area from unstructured WhatsApp messages
 * e.g. "Need 3BHK in Manish Nagar budget around 75L"
 */

const KNOWN_LOCALITIES = [
  "Manish Nagar",
  "Vasudev Nagar",
  "Dharampeth",
  "MIHAN",
  "Trimurti Nagar",
  "Civil Lines",
  "Sadar",
  "Wardha Road",
  "Hingna",
  "Laxmi Nagar",
  "Besa",
  "Pratap Nagar",
  "Ramdaspeth",
  "Dhantoli"
];

// Baseline price per sq ft for fallback budget estimation in Nagpur
const LOCALITY_RATES = {
  "Dharampeth": 7800,
  "Civil Lines": 9000,
  "Ramdaspeth": 8500,
  "Sadar": 8000,
  "Manish Nagar": 5800,
  "Vasudev Nagar": 5200,
  "Trimurti Nagar": 5500,
  "Laxmi Nagar": 6000,
  "MIHAN": 4500,
  "Wardha Road": 4000,
  "Besa": 4800,
  "Hingna": 3200
};

/**
 * Parse an incoming WhatsApp message into structured CRM lead fields
 */
function parseRequirement(rawText = "") {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Extract BHK (e.g., "3BHK", "3 BHK", "2 bedroom", "4 bed")
  let desiredBhk = 2; // sensible Nagpur default
  const bhkMatch = lower.match(/(\d)\s*(?:bhk|bedroom|bed|room)/i);
  if (bhkMatch) {
    desiredBhk = Math.min(6, Math.max(1, parseInt(bhkMatch[1], 10)));
  } else if (lower.includes("studio") || lower.includes("1rk")) {
    desiredBhk = 1;
  } else if (lower.includes("penthouse") || lower.includes("villa") || lower.includes("duplex")) {
    desiredBhk = 4;
  }

  // 2. Extract Locality
  const preferredLocalities = [];
  for (const loc of KNOWN_LOCALITIES) {
    const locLower = loc.toLowerCase();
    if (lower.includes(locLower)) {
      preferredLocalities.push(loc);
    }
  }

  // If Besa mentioned, associate with Manish Nagar
  if (preferredLocalities.includes("Besa") && !preferredLocalities.includes("Manish Nagar")) {
    preferredLocalities.push("Manish Nagar");
  }

  // Default if no specific locality found
  if (preferredLocalities.length === 0) {
    preferredLocalities.push("Manish Nagar"); // default prominent residential cluster
  }

  // 3. Extract Budget
  let budgetMaxInLakhs = null;
  let budgetMinInLakhs = null;

  // Pattern A: Range like "50 to 65 Lakhs" or "50-65L"
  const rangeMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|lac|l)\b/i);
  if (rangeMatch) {
    budgetMinInLakhs = parseFloat(rangeMatch[1]);
    budgetMaxInLakhs = parseFloat(rangeMatch[2]);
  }

  // Pattern B: Crores like "1.5 Cr", "1.2 Crores", "2 cr"
  if (!budgetMaxInLakhs) {
    const crMatch = lower.match(/(?:around|under|budget|below|near)?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/i);
    if (crMatch) {
      const crVal = parseFloat(crMatch[1]);
      budgetMaxInLakhs = Math.round(crVal * 100);
      budgetMinInLakhs = Math.round(budgetMaxInLakhs * 0.85);
    }
  }

  // Pattern C: Lakhs like "75L", "80 Lakhs", "under 60 Lacs"
  if (!budgetMaxInLakhs) {
    const lMatch = lower.match(/(?:around|under|budget|below|near|max)?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|lac|l)\b/i);
    if (lMatch) {
      budgetMaxInLakhs = parseFloat(lMatch[1]);
      budgetMinInLakhs = Math.max(10, Math.round(budgetMaxInLakhs * 0.85));
    }
  }

  // Fallback budget estimation based on BHK and locality rates if budget was not mentioned
  if (!budgetMaxInLakhs) {
    const primaryLoc = preferredLocalities[0] || "Manish Nagar";
    const sqFtRate = LOCALITY_RATES[primaryLoc] || 5500;
    const estSqFt = desiredBhk === 1 ? 600 : desiredBhk === 2 ? 950 : desiredBhk === 3 ? 1350 : 2200;
    const estimatedCost = (sqFtRate * estSqFt) / 100000; // in Lakhs
    budgetMaxInLakhs = Math.round(estimatedCost * 1.05);
    budgetMinInLakhs = Math.round(estimatedCost * 0.9);
  }

  // 4. Extract or Estimate Carpet Area
  let minCarpetAreaSqFt = 800;
  const areaMatch = lower.match(/(\d{3,4})\s*(?:sq\.?ft|sqft|square\s*feet|sq\s*feet)/i);
  if (areaMatch) {
    minCarpetAreaSqFt = parseInt(areaMatch[1], 10);
  } else {
    // Default by BHK
    minCarpetAreaSqFt = desiredBhk === 1 ? 550 : desiredBhk === 2 ? 900 : desiredBhk === 3 ? 1250 : 1800;
  }

  return {
    desiredBhk,
    preferredLocalities,
    budgetMinInLakhs,
    budgetMaxInLakhs,
    minCarpetAreaSqFt,
    rawRequirementText: text
  };
}

module.exports = {
  parseRequirement,
  KNOWN_LOCALITIES
};

