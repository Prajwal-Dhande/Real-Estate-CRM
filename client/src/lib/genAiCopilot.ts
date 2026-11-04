/**
 * EstateIQ GenAI Copilot & Marketing Copywriting Engine
 * Generates high-converting marketing drafts for real estate listings
 * and computes automated Stalled Deal diagnostics & re-engagement nudges.
 */

export interface MarketingCopyParams {
  title?: string;
  locality: string;
  bhk: number;
  carpetAreaSqFt: number;
  furnishing?: string;
  amenities?: string[];
  listedPriceInLakhs: number;
  builderName?: string;
  reraNumber?: string;
  possessionDate?: string;
}

export interface MarketingCopyResult {
  whatsappTeaser: string;
  seoDescription: string;
  instagramCaption: string;
}

export interface StalledDealParams {
  leadId: string;
  fullName: string;
  phone: string;
  pipelineStage: string;
  createdAt?: string;
  updatedAt?: string;
  lastContactedAt?: string;
  desiredBhk: number;
  budgetMaxInLakhs: number;
  preferredLocalities?: string[];
  rawRequirementText?: string;
}

export interface StalledDealDiagnosis {
  isStalled: boolean;
  daysInactive: number;
  urgencyLevel: 'Normal' | 'Medium' | 'High' | 'Critical';
  stageName: string;
  reason: string;
  smartNudge: string;
  actionStrategy: string;
  suggestedReengagementPitch: string;
}

/**
 * Generates 3 specialized marketing copies from property specifications
 */
export function generateMarketingCopies(params: MarketingCopyParams): MarketingCopyResult {
  const {
    title = `${params.bhk} BHK Luxury Residence`,
    locality,
    bhk,
    carpetAreaSqFt,
    furnishing = "Semi-Furnished",
    amenities = ["Parking", "Lift", "Power Backup"],
    listedPriceInLakhs,
    builderName = "Nagpur Premier Estates",
    reraNumber = "P50500028192",
    possessionDate = "Ready to Move"
  } = params;

  const amenitiesList = amenities.slice(0, 5).join(" • ");
  const priceFormatted = listedPriceInLakhs >= 100 
    ? `₹${(listedPriceInLakhs / 100).toFixed(2)} Cr` 
    : `₹${listedPriceInLakhs.toFixed(2)} Lakhs`;

  // 1. WhatsApp Short Teaser (High conversion, urgency emojis, bulleted)
  const whatsappTeaser = 
`🔥 *EXCLUSIVE PRE-MARKET LAUNCH IN ${locality.toUpperCase()}, NAGPUR!*

Looking for a spacious family home in a prime neighborhood?
Check out this verified *${bhk} BHK Premium Flat* by *${builderName}*!

✨ *KEY SPECIFICATIONS:*
📐 Carpet Area: *${carpetAreaSqFt} sq.ft (RERA Carpet)*
🏢 Floor: Prime Level • ${furnishing}
📜 MahaRERA: *${reraNumber}* (${possessionDate})
💎 Amenities: ${amenitiesList}
🚇 Connectivity: Prime road & Metro corridor proximity

💰 *OFFER PRICE:* *${priceFormatted}* (Special Developer Token Benefit)

⚠️ *Only 2 units remaining at this price point!*
📲 Reply *'VISIT'* or call *+91 98220 11800* for private showing & CAD blueprints.

_EstateIQ Private Brokerage • MahaRERA Certified Advisory_`;

  // 2. 99acres / MagicBricks SEO Description (Keyword rich, infrastructure, compliance)
  const seoDescription = 
`Presenting an ultra-modern ${bhk} BHK luxury apartment situated in the coveted residential enclave of ${locality}, Nagpur. Developed by renowned builder ${builderName}, this vastu-compliant home offers ${carpetAreaSqFt} sq.ft of optimum RERA carpet area, featuring abundant cross-ventilation, Italian-style living spaces, and expansive balcony views.

PROJECT HIGHLIGHTS & AMENITIES:
• Configuration: ${bhk} Bedrooms, Designer Bathrooms, Modular Utility Space
• Furnishing Condition: ${furnishing} with premium electrical fittings
• World-class Infrastructure: ${amenitiesList}
• MahaRERA Registered: Certificate No. ${reraNumber} (${possessionDate})
• Title: Clear marketable title with NMC sanction and leading bank loan approvals (SBI / HDFC / ICICI)

LOCALITY CONNECTIVITY & NEIGHBORHOOD:
Strategically positioned in ${locality}, offering seamless connectivity to Nagpur Airport, MIHAN SEZ IT hub, prominent educational institutions, multispecialty hospitals, and Nagpur Metro stations. Ideal for self-use families and high-yield capital appreciation investors.

Price: ${priceFormatted} (Negotiable on early token booking). Contact EstateIQ Managing Brokerage for private walkthroughs and official cost sheets.`;

  // 3. Instagram Luxury Caption (Lifestyle, aesthetic emojis, viral hashtags)
  const instagramCaption = 
`Your sanctuary of calm and luxury in Nagpur 🏙️✨

Discover architectural perfection with this ${bhk} BHK bespoke residence in prime ${locality}. Boasting ${carpetAreaSqFt} sq.ft of sun-drenched interiors, modern ${furnishing.toLowerCase()} finishes, and private sun decks overlooking the city skyline 🌅

Highlights you'll fall in love with:
🔑 ${bhk} Spacious Bedrooms with En-suite Bathrooms
🌿 ${amenitiesList}
📜 100% MahaRERA Verified (${reraNumber})
📍 Unbeatable ${locality} location, moments from the city's finest dining & metro

Offered at ${priceFormatted}

Tag someone who would love this home! 👇
DM or WhatsApp +91 98220 11800 for private inspection.

#NagpurRealEstate #NagpurProperty #LuxuryHomesNagpur #MahaRERA #Nagpur #Dharampeth #CivilLinesNagpur #ManishNagar #DreamHomeNagpur #RealEstateIndia #EstateIQ`;

  return {
    whatsappTeaser,
    seoDescription,
    instagramCaption
  };
}

/**
 * Analyzes lead interaction chronology to detect stalled deals and generate actionable smart nudges
 */
export function diagnoseStalledDeal(params: StalledDealParams): StalledDealDiagnosis {
  const now = Date.now();
  
  // Calculate days inactive from last contact or update timestamp
  const refTime = params.lastContactedAt 
    ? new Date(params.lastContactedAt).getTime() 
    : params.updatedAt 
    ? new Date(params.updatedAt).getTime() 
    : params.createdAt 
    ? new Date(params.createdAt).getTime() 
    : now - 3 * 86400000;

  const daysInactive = Math.max(0, Math.floor((now - refTime) / (1000 * 3600 * 24)));
  const localitiesStr = params.preferredLocalities?.join(", ") || "Nagpur";

  let isStalled = false;
  let urgencyLevel: 'Normal' | 'Medium' | 'High' | 'Critical' = 'Normal';
  let reason = "Deal progressing normally along pipeline cadence.";
  let smartNudge = "Continue active engagement as per scheduled SLA.";
  let actionStrategy = "Regular pipeline follow-up";

  switch (params.pipelineStage) {
    case 'New Inquiry':
      if (daysInactive >= 1) {
        isStalled = true;
        urgencyLevel = daysInactive >= 3 ? 'Critical' : 'High';
        reason = `Fresh inbound inquiry has received no agent outreach for ${daysInactive} day(s). Inbound lead decay rate is 70%+ after 24 hours.`;
        smartNudge = `${params.fullName} ne ${daysInactive} din se inquiry ki hui hai par initial contact pending hai. Competitor portals par switch hone se pehle 1-click WhatsApp introduction karein.`;
        actionStrategy = "Immediate first-response call & WhatsApp introduction";
      }
      break;

    case 'Contacted':
      if (daysInactive >= 4) {
        isStalled = true;
        urgencyLevel = daysInactive >= 7 ? 'High' : 'Medium';
        reason = `Lead contacted but site visit not scheduled for ${daysInactive} day(s). Interest drops significantly without an on-site physical experience.`;
        smartNudge = `${params.fullName} ne ${daysInactive} din se reply nahi diya — ${localitiesStr} mein unke ₹${params.budgetMaxInLakhs}L budget ke andar 2 verified properties aayi hain. Re-engagement pitch bhej kar physical site visit schedule karein.`;
        actionStrategy = "Send fresh inventory teaser with Saturday site visit invite";
      }
      break;

    case 'Site Visit Scheduled':
      if (daysInactive >= 3) {
        isStalled = true;
        urgencyLevel = daysInactive >= 5 ? 'High' : 'Medium';
        reason = `Site visit status pending follow-up for ${daysInactive} day(s). Buyer post-visit feedback is unrecorded.`;
        smartNudge = `Site visit hue ${daysInactive} din ho gaye hain. Buyer ka reaction lene ke liye call karein aur layout ya pricing par feedback collect karein.`;
        actionStrategy = "Conduct post-visit debrief & objection handling";
      }
      break;

    case 'Negotiation':
      if (daysInactive >= 5) {
        isStalled = true;
        urgencyLevel = daysInactive >= 9 ? 'Critical' : 'High';
        reason = `Deal frozen in price negotiation for ${daysInactive} day(s). High danger of buyer ghosting due to budget hesitation or rival developer offers.`;
        smartNudge = `Negotiation ${daysInactive} din se stagnant hai. Buyer ko close karne ke liye developer se parking waiver ya 1% token advance price-lock offer karein.`;
        actionStrategy = "Offer strategic financial concession / token lock";
      }
      break;

    case 'Closed Won':
    case 'Closed Lost':
      isStalled = false;
      urgencyLevel = 'Normal';
      reason = `Deal concluded as ${params.pipelineStage}.`;
      smartNudge = "Maintain long-term client relationship for referral opportunities.";
      actionStrategy = "Archive or referral nurture";
      break;

    default:
      if (daysInactive >= 7) {
        isStalled = true;
        urgencyLevel = 'Medium';
        reason = `No recorded interaction for ${daysInactive} days.`;
        smartNudge = `Re-engage with new listings in ${localitiesStr}.`;
        actionStrategy = "General re-engagement";
      }
  }

  // Pre-generate tailored re-engagement WhatsApp pitch
  const suggestedReengagementPitch = 
`Hi ${params.fullName}, hope you are doing well!
I was reviewing your search for a ${params.desiredBhk} BHK home in ${localitiesStr} (budget under ₹${params.budgetMaxInLakhs}L).

We just received 2 newly listed MahaRERA certified properties this week with spacious layouts and prime connectivity that closely match your criteria.

Would you be free for a 5-minute call or a quick site visit this Saturday morning?
Best regards,
Prajwal Dhande • EstateIQ Nagpur`;

  return {
    isStalled,
    daysInactive,
    urgencyLevel,
    stageName: params.pipelineStage,
    reason,
    smartNudge,
    actionStrategy,
    suggestedReengagementPitch
  };
}
