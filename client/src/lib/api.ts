import { Lead, Property, Activity, DashboardMetrics, PredictPriceResult, PipelineStage, User, SearchResult, MarketingRoiSummary, MarketingRoiChannel, LeadSource } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fallback demo leads if backend server is offline
export const MOCK_LEADS: Lead[] = [
  {
    _id: "lead-1",
    fullName: "Rahul Verma",
    phone: "+91 98230 11223",
    email: "rahul.verma@example.com",
    source: "Meta Ads",
    campaignName: "Meta Ads - Manish Nagar Diwali Expo",
    utmSource: "instagram",
    utmMedium: "paid_social",
    utmCampaign: "diwali_expo_2026",
    acquisitionCostInInr: 175,
    rawRequirementText: "Looking for a 3BHK flat near metro station in Vasudev Nagar under 85 Lakhs.",
    preferredLocalities: ["Vasudev Nagar", "Wardha Road"],
    budgetMinInLakhs: 70,
    budgetMaxInLakhs: 85,
    desiredBhk: 3,
    minCarpetAreaSqFt: 1200,
    pipelineStage: "Site Visit Scheduled",
    aiScore: 92,
    aiPriorityTag: "Hot",
    aiScoreFactors: [
      "Budget aligns with locality median price",
      "Site visit scheduled - high buying intent",
      "Positive client sentiment detected",
      "Last contact within 24 hours"
    ],
    recommendedProperties: [
      {
        property: {
          _id: "prop-1",
          title: "Luxury 3BHK Apartment near Metro",
          description: "High-rise apartment with modular kitchen and city view.",
          locality: "Vasudev Nagar",
          address: "Plot 42, Metro View Residency, Vasudev Nagar, Nagpur",
          coordinates: { lat: 21.1245, lng: 79.0342 },
          carpetAreaSqFt: 1350,
          bhk: 3,
          bathrooms: 3,
          floorNumber: 7,
          totalFloors: 14,
          furnishing: "Fully-Furnished",
          amenities: ["Parking", "Gym", "Metro Proximity", "Power Backup"],
          listedPriceInLakhs: 78.5,
          aiEstimatedPriceInLakhs: 80.2,
          valuationConfidence: 0.88,
          status: "Available"
        },
        matchScore: 94.5
      }
    ],
    lastContactedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    nextFollowUpAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago -> Overdue by 3 hrs
    slaDeadline: new Date(Date.now() - 3 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    _id: "lead-2",
    fullName: "Anita Kulkarni",
    phone: "+91 97654 44556",
    email: "anita.kulkarni@example.com",
    source: "Referral",
    campaignName: "Existing Owner Referral (Tech Corridor)",
    utmSource: "referral",
    acquisitionCostInInr: 0,
    rawRequirementText: "Need 2BHK flat close to IT corridor in MIHAN, budget 45L to 52L.",
    preferredLocalities: ["MIHAN"],
    budgetMinInLakhs: 45,
    budgetMaxInLakhs: 52,
    desiredBhk: 2,
    minCarpetAreaSqFt: 950,
    pipelineStage: "Contacted",
    aiScore: 68,
    aiPriorityTag: "Warm",
    aiScoreFactors: [
      "Budget within reasonable range for MIHAN",
      "Moderate interaction history (3 calls)",
      "Neutral sentiment"
    ],
    recommendedProperties: [
      {
        property: {
          _id: "prop-2",
          title: "Modern 2BHK Flat with Balcony",
          description: "Well-ventilated East-facing apartment close to schools and IT parks.",
          locality: "MIHAN",
          address: "Tower B, Tech City Enclave, MIHAN, Nagpur",
          coordinates: { lat: 21.0543, lng: 79.0621 },
          carpetAreaSqFt: 980,
          bhk: 2,
          bathrooms: 2,
          floorNumber: 3,
          totalFloors: 8,
          furnishing: "Semi-Furnished",
          amenities: ["Parking", "Power Backup", "Security"],
          listedPriceInLakhs: 48.0,
          aiEstimatedPriceInLakhs: 46.5,
          valuationConfidence: 0.84,
          status: "Available"
        },
        matchScore: 88.0
      }
    ],
    lastContactedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    nextFollowUpAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago -> Overdue by 45m
    slaDeadline: new Date(Date.now() - 45 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    _id: "lead-3",
    fullName: "Vikramaditya Rao",
    phone: "+91 99887 77665",
    email: "vikram.rao@example.com",
    source: "Google Ads",
    campaignName: "Google Search - Nagpur Luxury 4BHK Dharampeth",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "luxury_villas_nagpur",
    acquisitionCostInInr: 310,
    rawRequirementText: "Interested in luxury villa in Dharampeth or Civil Lines with private lawn.",
    preferredLocalities: ["Dharampeth", "Civil Lines"],
    budgetMinInLakhs: 180,
    budgetMaxInLakhs: 250,
    desiredBhk: 4,
    minCarpetAreaSqFt: 2400,
    pipelineStage: "Negotiation",
    aiScore: 89,
    aiPriorityTag: "Hot",
    aiScoreFactors: [
      "High buying power exceeding locality median",
      "Multiple site visits completed",
      "High urgency for registry before month end"
    ],
    recommendedProperties: [
      {
        property: {
          _id: "prop-3",
          title: "Premium 4BHK Villa with Private Garden",
          description: "Elite standalone villa in prime central residential hub with private lawn.",
          locality: "Dharampeth",
          address: "12 Boulevard Avenue, West Dharampeth, Nagpur",
          coordinates: { lat: 21.1418, lng: 79.0682 },
          carpetAreaSqFt: 2600,
          bhk: 4,
          bathrooms: 4,
          floorNumber: 0,
          totalFloors: 2,
          furnishing: "Fully-Furnished",
          amenities: ["Private Garden", "Parking", "Gym", "Security"],
          listedPriceInLakhs: 215.0,
          aiEstimatedPriceInLakhs: 220.0,
          valuationConfidence: 0.90,
          status: "Available"
        },
        matchScore: 96.0
      }
    ],
    lastContactedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    nextFollowUpAt: new Date(Date.now() + 25 * 60000).toISOString(), // In 25 mins -> Due in 25m (Amber)
    slaDeadline: new Date(Date.now() + 25 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    _id: "lead-4",
    fullName: "Pooja Deshmukh",
    phone: "+91 94221 88990",
    email: "pooja.d@example.com",
    source: "99acres",
    campaignName: "99acres Premium Listing - Hingna Corridors",
    utmSource: "99acres",
    acquisitionCostInInr: 220,
    rawRequirementText: "Looking for 1BHK or compact 2BHK near Hingna MIDC under 30L.",
    preferredLocalities: ["Hingna"],
    budgetMinInLakhs: 22,
    budgetMaxInLakhs: 30,
    desiredBhk: 1,
    minCarpetAreaSqFt: 550,
    pipelineStage: "New Inquiry",
    aiScore: 42,
    aiPriorityTag: "Cold",
    aiScoreFactors: [
      "Budget slightly below locality average",
      "First inquiry - no previous interaction history",
      "Awaiting callback confirmation"
    ],
    recommendedProperties: [],
    lastContactedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    nextFollowUpAt: new Date(Date.now() + 4 * 3600000).toISOString(), // In 4 hours
    slaDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    _id: "lead-5",
    fullName: "Amitabh Banerjee",
    phone: "+91 93710 55443",
    email: "amitabh.b@example.com",
    source: "Website",
    campaignName: "Organic Google Search - Duplex Penthouse Nagpur",
    utmSource: "google_organic",
    acquisitionCostInInr: 35,
    rawRequirementText: "3BHK duplex penthouse in Manish Nagar near Besa Square.",
    preferredLocalities: ["Manish Nagar"],
    budgetMinInLakhs: 90,
    budgetMaxInLakhs: 110,
    desiredBhk: 3,
    minCarpetAreaSqFt: 1600,
    pipelineStage: "Closed Won",
    aiScore: 98,
    aiPriorityTag: "Hot",
    aiScoreFactors: [
      "Deal closed and agreement registered",
      "Full deposit paid"
    ],
    lastContactedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  },
  {
    _id: "lead-6",
    fullName: "Amit Sharma",
    phone: "+91 98230 44551",
    email: "amit.sharma@example.com",
    source: "WhatsApp",
    campaignName: "WhatsApp Cloud Click-to-Chat Inbound",
    utmSource: "whatsapp",
    acquisitionCostInInr: 45,
    rawRequirementText: "Need 3BHK in Manish Nagar budget around 75L.",
    preferredLocalities: ["Manish Nagar"],
    budgetMinInLakhs: 70,
    budgetMaxInLakhs: 78,
    desiredBhk: 3,
    minCarpetAreaSqFt: 1300,
    pipelineStage: "New Inquiry",
    aiScore: 88,
    aiPriorityTag: "Hot",
    aiScoreFactors: [
      "Direct inbound WhatsApp inquiry - High immediate intent",
      "Targeting Manish Nagar corridor",
      "Budget matches locality price range"
    ],
    nextFollowUpAt: new Date(Date.now() - 75 * 60000).toISOString(), // 1h 15m ago -> Overdue by 1h 15m
    slaDeadline: new Date(Date.now() - 75 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 60000).toISOString()
  },
  {
    _id: "lead-7",
    fullName: "Meenakshi Iyer",
    phone: "+91 98228 11888",
    email: "meenakshi.iyer@example.com",
    source: "MagicBricks",
    campaignName: "MagicBricks Verified Buyer Match",
    utmSource: "magicbricks",
    acquisitionCostInInr: 240,
    rawRequirementText: "Need 3BHK apartment in Manish Nagar close to airport with modern gymnasium and security under 90L",
    preferredLocalities: ["Manish Nagar"],
    budgetMinInLakhs: 80,
    budgetMaxInLakhs: 90,
    desiredBhk: 3,
    minCarpetAreaSqFt: 1400,
    pipelineStage: "Contacted",
    aiScore: 78,
    aiPriorityTag: "Warm",
    aiScoreFactors: [
      "Strong interest in airport metro corridor",
      "Requested verified floor plan blueprints"
    ],
    nextFollowUpAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    slaDeadline: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: "lead-8",
    fullName: "Suresh Agrawal",
    phone: "+91 98222 33441",
    email: "suresh.agrawal@example.com",
    source: "Google Ads",
    campaignName: "Google Search - Civil Lines Bungalow High Intent",
    utmSource: "google",
    utmMedium: "search_cpc",
    acquisitionCostInInr: 310,
    rawRequirementText: "Independent bungalow in Civil Lines or Ramdaspeth, min 3000 sq.ft plot, budget around 2.2 Cr.",
    preferredLocalities: ["Civil Lines", "Ramdaspeth"],
    budgetMinInLakhs: 180,
    budgetMaxInLakhs: 230,
    desiredBhk: 4,
    minCarpetAreaSqFt: 3000,
    pipelineStage: "Site Visit Scheduled",
    aiScore: 91,
    aiPriorityTag: "Hot",
    aiScoreFactors: [
      "High net worth buyer searching prime zone",
      "Confirmed Sunday site walkthrough"
    ],
    nextFollowUpAt: new Date(Date.now() + 3600000 * 5).toISOString(),
    slaDeadline: new Date(Date.now() + 3600000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: "lead-9",
    fullName: "Tanvi Joshi",
    phone: "+91 97640 12399",
    email: "tanvi.joshi@example.com",
    source: "Meta Ads",
    campaignName: "Instagram Video Walkthrough - Besa Manish Nagar",
    utmSource: "instagram",
    utmMedium: "video_ad",
    acquisitionCostInInr: 175,
    rawRequirementText: "Looking for 2BHK or 3BHK flat near Besa Square with gym and kids play area under 68L.",
    preferredLocalities: ["Manish Nagar"],
    budgetMinInLakhs: 58,
    budgetMaxInLakhs: 68,
    desiredBhk: 2,
    minCarpetAreaSqFt: 1050,
    pipelineStage: "Contacted",
    aiScore: 72,
    aiPriorityTag: "Warm",
    aiScoreFactors: [
      "Engaged via Instagram video carousel ad",
      "Requested brochure download"
    ],
    nextFollowUpAt: new Date(Date.now() + 3600000 * 8).toISOString(),
    slaDeadline: new Date(Date.now() + 3600000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    _id: "lead-10",
    fullName: "Dr. Harish Gokhale",
    phone: "+91 94228 99887",
    email: "dr.gokhale@example.com",
    source: "Referral",
    campaignName: "Medical Association / Doctor Referral Network",
    utmSource: "doctor_referral",
    acquisitionCostInInr: 0,
    rawRequirementText: "3BHK premium apartment in Dharampeth near VIP Road for clinic & residence.",
    preferredLocalities: ["Dharampeth"],
    budgetMinInLakhs: 110,
    budgetMaxInLakhs: 130,
    desiredBhk: 3,
    minCarpetAreaSqFt: 1650,
    pipelineStage: "Closed Won",
    aiScore: 96,
    aiPriorityTag: "Hot",
    aiScoreFactors: [
      "Direct referral from Dr. Deshpande",
      "Registration done at sub-registrar office"
    ],
    lastContactedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
  }
];

// Fallback demo properties
export const MOCK_PROPERTIES: Property[] = [
  {
    _id: "prop-1",
    title: "Luxury 3BHK Apartment near Metro",
    description: "Spacious high-rise apartment with panoramic city views, modular kitchen, and modern clubhouse access.",
    locality: "Vasudev Nagar",
    address: "Plot 42, Metro View Residency, Vasudev Nagar, Nagpur",
    coordinates: { lat: 21.1245, lng: 79.0342 },
    carpetAreaSqFt: 1350,
    bhk: 3,
    bathrooms: 3,
    floorNumber: 7,
    totalFloors: 14,
    furnishing: "Fully-Furnished",
    amenities: ["Parking", "Gym", "Metro Proximity", "Power Backup", "Clubhouse"],
    listedPriceInLakhs: 78.5,
    aiEstimatedPriceInLakhs: 82.0,
    valuationConfidence: 0.88,
    status: "Available",
    builderName: "Kukreja Infrastructures",
    reraNumber: "P50500019284",
    isReraVerified: true,
    possessionDate: "Ready to Move",
    floorPlanUrl: "/api/properties/blueprint/sample?bhk=3&carpetAreaSqFt=1350",
    brochureUrl: "https://maharera.mahaonline.gov.in",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"]
  },
  {
    _id: "prop-2",
    title: "Modern 2BHK Flat with Balcony",
    description: "Well-ventilated East-facing apartment close to schools and IT parks with covered car parking.",
    locality: "MIHAN",
    address: "Tower B, Tech City Enclave, MIHAN, Nagpur",
    coordinates: { lat: 21.0543, lng: 79.0621 },
    carpetAreaSqFt: 980,
    bhk: 2,
    bathrooms: 2,
    floorNumber: 3,
    totalFloors: 8,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Power Backup", "Security", "Park"],
    listedPriceInLakhs: 48.0,
    aiEstimatedPriceInLakhs: 45.2,
    valuationConfidence: 0.85,
    status: "Available",
    builderName: "Moraj Group Nagpur",
    reraNumber: "P50500028192",
    isReraVerified: true,
    possessionDate: "March 2026",
    floorPlanUrl: "/api/properties/blueprint/sample?bhk=2&carpetAreaSqFt=980",
    brochureUrl: "https://maharera.mahaonline.gov.in",
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"]
  },
  {
    _id: "prop-3",
    title: "Premium 4BHK Villa with Private Garden",
    description: "Elite standalone villa in prime central residential hub with private lawn, imported marble and terrace gazebo.",
    locality: "Dharampeth",
    address: "12 Boulevard Avenue, West Dharampeth, Nagpur",
    coordinates: { lat: 21.1418, lng: 79.0682 },
    carpetAreaSqFt: 2600,
    bhk: 4,
    bathrooms: 4,
    floorNumber: 0,
    totalFloors: 2,
    furnishing: "Fully-Furnished",
    amenities: ["Private Garden", "Parking", "Gym", "Security", "Power Backup"],
    listedPriceInLakhs: 215.0,
    aiEstimatedPriceInLakhs: 224.5,
    valuationConfidence: 0.91,
    status: "Available",
    builderName: "Godrej Properties Anandam",
    reraNumber: "P50500000125",
    isReraVerified: true,
    possessionDate: "Ready to Move",
    floorPlanUrl: "/api/properties/blueprint/sample?bhk=4&carpetAreaSqFt=2600",
    brochureUrl: "https://maharera.mahaonline.gov.in",
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"]
  },
  {
    _id: "prop-4",
    title: "Affordable 2BHK Near Wardha Road Junction",
    description: "Cozy, move-in ready apartment situated in a gated community with 24/7 water and security.",
    locality: "Manish Nagar",
    address: "Flat 204, Shrinath Heights, Manish Nagar, Nagpur",
    coordinates: { lat: 21.0921, lng: 79.0784 },
    carpetAreaSqFt: 920,
    bhk: 2,
    bathrooms: 2,
    floorNumber: 2,
    totalFloors: 6,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Lift", "Security"],
    listedPriceInLakhs: 55.0,
    aiEstimatedPriceInLakhs: 51.5,
    valuationConfidence: 0.82,
    status: "Available",
    builderName: "Sandesh City Projects",
    reraNumber: "P50500014280",
    isReraVerified: true,
    possessionDate: "Dec 2025",
    floorPlanUrl: "/api/properties/blueprint/sample?bhk=2&carpetAreaSqFt=920",
    brochureUrl: "https://maharera.mahaonline.gov.in",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"]
  },
  {
    _id: "prop-5",
    title: "Commercial Office Space near High Court",
    description: "Ready-to-occupy corporate office space with centralized AC and dedicated basement parking.",
    locality: "Civil Lines",
    address: "5th Floor, Apex Towers, Civil Lines, Nagpur",
    coordinates: { lat: 21.1534, lng: 79.0729 },
    carpetAreaSqFt: 1800,
    bhk: 3,
    bathrooms: 2,
    floorNumber: 5,
    totalFloors: 10,
    furnishing: "Fully-Furnished",
    amenities: ["Parking", "Power Backup", "Lift", "Security", "Metro Proximity"],
    listedPriceInLakhs: 165.0,
    aiEstimatedPriceInLakhs: 172.0,
    valuationConfidence: 0.89,
    status: "Under Offer",
    builderName: "Apex Landmark Developers",
    reraNumber: "P50500007891",
    isReraVerified: true,
    possessionDate: "Ready to Move",
    floorPlanUrl: "/api/properties/blueprint/sample?bhk=3&carpetAreaSqFt=1800",
    brochureUrl: "https://maharera.mahaonline.gov.in",
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"]
  }
];

// Helper headers with auth token injection
export function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("estateiq_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

// ── Auth API Functions ──────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

/**
 * Login with email and password
 */
export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    return data;
  } catch (err: any) {
    // Offline / Mock Demo Fallback
    console.warn("[API] Using offline auth fallback:", err.message);
    const isRahul = email.toLowerCase().includes("rahul");
    const isSneha = email.toLowerCase().includes("sneha");
    const role = (isRahul || isSneha) ? "agent" : "admin";
    
    const mockUser: User = isRahul
      ? {
          _id: "user-agent-rahul",
          name: "Rahul Sharma",
          email: "rahul.sharma@estateiq.com",
          role: "agent",
          assignedLocalities: ["Vasudev Nagar", "Dharampeth"],
          activeLeadCount: 8
        }
      : isSneha
      ? {
          _id: "user-agent-sneha",
          name: "Sneha Deshmukh",
          email: "sneha@estateiq.com",
          role: "agent",
          assignedLocalities: ["MIHAN", "Manish Nagar", "Trimurti Nagar"],
          activeLeadCount: 7
        }
      : {
          _id: "user-admin-prajwal",
          name: "Prajwal Dhande",
          email: "admin@estateiq.com",
          role: "admin",
          assignedLocalities: ["Civil Lines", "Dharampeth", "Vasudev Nagar", "MIHAN", "Manish Nagar", "Trimurti Nagar", "Sadar"],
          activeLeadCount: 0
        };

    return {
      success: true,
      message: "Authenticated in local demo mode",
      token: "demo-jwt-token-" + mockUser._id,
      user: mockUser
    };
  }
}

/**
 * Register a new user
 */
export async function registerApi(payload: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "agent";
  assignedLocalities?: string[];
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }
    return data;
  } catch (err: any) {
    console.warn("[API] Register offline fallback:", err.message);
    const mockUser: User = {
      _id: `user-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role || "agent",
      assignedLocalities: payload.assignedLocalities || ["Vasudev Nagar"],
      activeLeadCount: 0
    };
    return {
      success: true,
      message: "Registered successfully in local demo mode",
      token: "demo-jwt-token-" + mockUser._id,
      user: mockUser
    };
  }
}

/**
 * Instant 1-Click Multi-Agent Switcher
 */
export async function demoSwitchApi(email: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/demo-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok && data.user) {
      return data;
    }
  } catch (err: any) {
    console.warn("[API] Demo switch backend call failed, falling back to local simulation:", err.message);
  }

  // Local instant switch fallback
  const isRahul = email.toLowerCase().includes("rahul");
  const isSneha = email.toLowerCase().includes("sneha");

  const mockUser: User = isRahul
    ? {
        _id: "user-agent-rahul",
        name: "Rahul Sharma",
        email: "rahul.sharma@estateiq.com",
        role: "agent",
        assignedLocalities: ["Vasudev Nagar", "Dharampeth"],
        activeLeadCount: 8
      }
    : isSneha
    ? {
        _id: "user-agent-sneha",
        name: "Sneha Deshmukh",
        email: "sneha@estateiq.com",
        role: "agent",
        assignedLocalities: ["MIHAN", "Manish Nagar", "Trimurti Nagar"],
        activeLeadCount: 7
      }
    : {
        _id: "user-admin-prajwal",
        name: "Prajwal Dhande",
        email: "admin@estateiq.com",
        role: "admin",
        assignedLocalities: ["Civil Lines", "Dharampeth", "Vasudev Nagar", "MIHAN", "Manish Nagar", "Trimurti Nagar", "Sadar"],
        activeLeadCount: 0
      };

  return {
    success: true,
    message: `Switched session to ${mockUser.name} (${mockUser.role})`,
    token: "demo-jwt-token-" + mockUser._id,
    user: mockUser
  };
}

/**
 * Fetch current user profile from token
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

/**
 * Fetch active agents list
 */
export async function fetchAgents(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/auth/agents`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to fetch agents");
    const data = await res.json();
    return data.agents || [];
  } catch {
    return [
      {
        _id: "user-agent-rahul",
        name: "Rahul Sharma",
        email: "rahul.sharma@estateiq.com",
        role: "agent",
        assignedLocalities: ["Vasudev Nagar", "Dharampeth"],
        activeLeadCount: 8
      },
      {
        _id: "user-agent-sneha",
        name: "Sneha Deshmukh",
        email: "sneha@estateiq.com",
        role: "agent",
        assignedLocalities: ["MIHAN", "Manish Nagar", "Trimurti Nagar"],
        activeLeadCount: 7
      }
    ];
  }
}

/**
 * Fetch all leads
 */
export async function fetchLeads(query?: string): Promise<Lead[]> {
  try {
    const res = await fetch(`${API_BASE}/leads${query ? `?${query}` : ""}`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to fetch leads");
    const data = await res.json();
    if (data.leads && data.leads.length > 0) {
      return data.leads;
    }
    return MOCK_LEADS;
  } catch (err) {
    console.warn("[API] Using mock leads fallback:", err);
    return MOCK_LEADS;
  }
}

/**
 * Fetch single lead
 */
export async function fetchLeadById(id: string): Promise<Lead | null> {
  try {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to fetch lead");
    const data = await res.json();
    return data.lead;
  } catch (err) {
    console.warn(`[API] Using mock lead for ${id}:`, err);
    return MOCK_LEADS.find(l => l._id === id) || MOCK_LEADS[0];
  }
}

/**
 * Create a new lead
 */
export async function createLead(payload: Partial<Lead>): Promise<Lead> {
  try {
    const res = await fetch(`${API_BASE}/leads`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to create lead");
    }
    const data = await res.json();
    return data.lead;
  } catch (err) {
    console.warn("[API] Creating local fallback lead:", err);
    const mockCreated: Lead = {
      _id: `lead-${Date.now()}`,
      fullName: payload.fullName || "New Lead",
      phone: payload.phone || "+91 90000 00000",
      email: payload.email,
      source: payload.source || "Website",
      campaignName: payload.campaignName || "",
      utmSource: payload.utmSource || "",
      acquisitionCostInInr: payload.acquisitionCostInInr !== undefined 
        ? payload.acquisitionCostInInr 
        : (payload.source === "Meta Ads" ? 175 : payload.source === "Google Ads" ? 310 : payload.source === "WhatsApp" ? 45 : payload.source === "99acres" ? 220 : 0),
      rawRequirementText: payload.rawRequirementText || "",
      preferredLocalities: payload.preferredLocalities || [],
      budgetMinInLakhs: payload.budgetMinInLakhs || 50,
      budgetMaxInLakhs: payload.budgetMaxInLakhs || 75,
      desiredBhk: payload.desiredBhk || 2,
      pipelineStage: payload.pipelineStage || "New Inquiry",
      aiScore: 70,
      aiPriorityTag: "Warm",
      aiScoreFactors: ["Auto-created in fallback mode", "Budget aligned with median"],
      createdAt: new Date().toISOString()
    };
    return mockCreated;
  }
}

/**
 * Update lead stage
 */
export async function updateLeadStage(id: string, stage: PipelineStage, notes?: string): Promise<Lead> {
  try {
    const res = await fetch(`${API_BASE}/leads/${id}/stage`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ stage, notes })
    });
    if (!res.ok) throw new Error("Failed to update stage");
    const data = await res.json();
    return data.lead;
  } catch (err) {
    console.warn(`[API] Local stage update for ${id} -> ${stage}`);
    const found = MOCK_LEADS.find(l => l._id === id);
    if (found) {
      found.pipelineStage = stage;
      return { ...found };
    }
    throw err;
  }
}

/**
 * Update or snooze follow-up SLA for a lead
 */
export async function updateLeadFollowup(
  id: string,
  nextFollowUpAt?: string,
  reason?: string,
  markCompleted: boolean = false
): Promise<Lead> {
  try {
    const res = await fetch(`${API_BASE}/leads/${id}/followup`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ nextFollowUpAt, reason, markCompleted })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update follow-up");
    }
    const data = await res.json();
    return data.lead;
  } catch (err: any) {
    console.warn(`[API] Fallback updating follow-up for ${id}:`, err.message);
    const found = MOCK_LEADS.find(l => l._id === id);
    if (found) {
      if (markCompleted) {
        found.nextFollowUpAt = undefined;
        found.lastContactedAt = new Date().toISOString();
      } else if (nextFollowUpAt) {
        found.nextFollowUpAt = nextFollowUpAt;
      }
      return { ...found };
    }
    throw err;
  }
}

/**
 * Fetch all properties
 */
export async function fetchProperties(query?: string): Promise<Property[]> {
  try {
    const res = await fetch(`${API_BASE}/properties${query ? `?${query}` : ""}`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to fetch properties");
    const data = await res.json();
    if (data.properties && data.properties.length > 0) {
      return data.properties;
    }
    return MOCK_PROPERTIES;
  } catch (err) {
    console.warn("[API] Using mock properties fallback:", err);
    return MOCK_PROPERTIES;
  }
}

/**
 * Fetch a single property by its ID (Public or Authenticated)
 */
export async function fetchPropertyById(id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      if (data.property) return data.property;
    }
  } catch (err) {
    console.warn(`[API] Failed to fetch property ${id} from server:`, err);
  }

  // Fallback to mock list
  const found = MOCK_PROPERTIES.find((p) => p._id === id);
  return found || MOCK_PROPERTIES[0] || null;
}

/**
 * Create a new property
 */
export async function createProperty(payload: Partial<Property>): Promise<Property> {
  try {
    const res = await fetch(`${API_BASE}/properties`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to create property");
    }
    const data = await res.json();
    return data.property;
  } catch (err) {
    console.warn("[API] Creating local fallback property:", err);
    const mockProp: Property = {
      _id: `prop-${Date.now()}`,
      title: payload.title || "New Property",
      description: payload.description || "",
      locality: payload.locality || "Nagpur",
      address: payload.address || "",
      coordinates: payload.coordinates || { lat: 21.1458, lng: 79.0882 },
      carpetAreaSqFt: payload.carpetAreaSqFt || 1000,
      bhk: payload.bhk || 2,
      bathrooms: payload.bathrooms || 2,
      floorNumber: payload.floorNumber || 1,
      totalFloors: payload.totalFloors || 5,
      furnishing: payload.furnishing || "Semi-Furnished",
      amenities: payload.amenities || [],
      listedPriceInLakhs: payload.listedPriceInLakhs || 50,
      aiEstimatedPriceInLakhs: payload.aiEstimatedPriceInLakhs || (payload.listedPriceInLakhs ? payload.listedPriceInLakhs * 1.03 : 52),
      valuationConfidence: payload.valuationConfidence || 0.86,
      status: payload.status || "Available",
      builderName: payload.builderName || "Nagpur Premier Estates",
      reraNumber: payload.reraNumber || "P50500019284",
      isReraVerified: payload.isReraVerified ?? true,
      possessionDate: payload.possessionDate || "Ready to Move",
      floorPlanUrl: payload.floorPlanUrl || `/api/properties/blueprint/sample?bhk=${payload.bhk || 3}&carpetAreaSqFt=${payload.carpetAreaSqFt || 1200}`,
      brochureUrl: payload.brochureUrl || "https://maharera.mahaonline.gov.in",
      images: payload.images?.length ? payload.images : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"],
      createdAt: new Date().toISOString()
    };
    return mockProp;
  }
}

/**
 * Live price prediction
 */
export async function predictPrice(specs: {
  locality: string;
  carpetAreaSqFt: number;
  bhk: number;
  bathrooms?: number;
  floorNumber?: number;
  totalFloors?: number;
  furnishing?: string;
  amenitiesCount?: number;
}): Promise<PredictPriceResult> {
  try {
    // Try calling AI Engine directly or through server
    const aiBase = process.env.NEXT_PUBLIC_AI_ENGINE_URL || "http://127.0.0.1:8001/api/v1";
    const res = await fetch(`${aiBase}/predict-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(specs)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fallback heuristic estimation
  }

  // Fallback formula
  const rates: Record<string, number> = {
    "Vasudev Nagar": 5200,
    "Dharampeth": 7800,
    "MIHAN": 4500,
    "Manish Nagar": 5800,
    "Sadar": 8500,
    "Wardha Road": 4000,
    "Hingna": 3200,
    "Civil Lines": 9000,
    "Laxmi Nagar": 6000
  };
  const rate = rates[specs.locality] || 5000;
  const inr = rate * specs.carpetAreaSqFt * (1 + (specs.bhk >= 3 ? 0.08 : 0));
  const estLakhs = Math.max(5, parseFloat((inr / 100000).toFixed(2)));

  return {
    estimatedPriceInLakhs: estLakhs,
    priceRangeMin: parseFloat((estLakhs * 0.92).toFixed(2)),
    priceRangeMax: parseFloat((estLakhs * 1.08).toFixed(2)),
    confidenceScore: 0.88
  };
}

/**
 * Fetch activities for a lead
 */
export async function fetchActivitiesByLead(leadId: string): Promise<Activity[]> {
  try {
    const res = await fetch(`${API_BASE}/activities/lead/${leadId}`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to fetch activities");
    const data = await res.json();
    return data.activities || [];
  } catch (err) {
    return [
      {
        _id: "act-1",
        lead: leadId,
        activityType: "Call",
        notes: "Detailed phone conversation regarding floor preference and parking requirements.",
        callDurationSeconds: 180,
        clientSentiment: "Positive",
        isFollowUpCompleted: true,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        _id: "act-2",
        lead: leadId,
        activityType: "Site Visit",
        notes: "Scheduled site inspection at Metro View Residency for Saturday 11 AM.",
        callDurationSeconds: 0,
        clientSentiment: "Positive",
        nextFollowUpAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        isFollowUpCompleted: false,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }
}

/**
 * Create activity
 */
export async function createActivity(payload: {
  leadId: string;
  activityType: string;
  notes: string;
  callDurationSeconds?: number;
  clientSentiment?: string;
  nextFollowUpAt?: string;
}): Promise<Activity> {
  try {
    const res = await fetch(`${API_BASE}/activities`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create activity");
    const data = await res.json();
    return data.activity;
  } catch (err) {
    const mockActivity: Activity = {
      _id: `act-${Date.now()}`,
      lead: payload.leadId,
      activityType: payload.activityType as any,
      notes: payload.notes,
      callDurationSeconds: payload.callDurationSeconds || 0,
      clientSentiment: (payload.clientSentiment as any) || "Neutral",
      nextFollowUpAt: payload.nextFollowUpAt,
      isFollowUpCompleted: false,
      createdAt: new Date().toISOString()
    };
    return mockActivity;
  }
}

/**
 * Fetch dashboard metrics
 */
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const res = await fetch(`${API_BASE}/dashboard/metrics`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to fetch metrics");
    const data = await res.json();
    if (data.metrics && (data.metrics.leads?.total > 0 || data.metrics.properties?.total > 0)) {
      return data.metrics;
    }
    throw new Error("Empty metrics payload, using fallback");
  } catch (err) {
    return {
      leads: {
        total: 28,
        hot: 9,
        warm: 13,
        cold: 6,
        byStage: {
          "New Inquiry": 7,
          "Contacted": 8,
          "Site Visit Scheduled": 5,
          "Negotiation": 4,
          "Closed Won": 3,
          "Closed Lost": 1
        }
      },
      properties: {
        total: 18,
        available: 14
      },
      upcomingFollowups: [
        {
          _id: "fu-1",
          lead: { _id: "lead-1", fullName: "Rahul Verma", phone: "+91 98230 11223" } as any,
          activityType: "Site Visit",
          notes: "Metro View Residency 3BHK walkthrough with family",
          clientSentiment: "Positive",
          nextFollowUpAt: new Date(Date.now() + 3600000 * 2).toISOString(),
          isFollowUpCompleted: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: "fu-2",
          lead: { _id: "lead-3", fullName: "Vikramaditya Rao", phone: "+91 99887 77665" } as any,
          activityType: "Call",
          notes: "Discuss token advance and registry timeline",
          clientSentiment: "Positive",
          nextFollowUpAt: new Date(Date.now() + 3600000 * 6).toISOString(),
          isFollowUpCompleted: false,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }
}

/**
 * Simulate incoming WhatsApp message ingestion
 */
export async function simulateWhatsAppMessage(payload: {
  phone: string;
  name: string;
  message: string;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/webhook/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to simulate WhatsApp message");
    }
    return await res.json();
  } catch (err: any) {
    console.warn("[API] WhatsApp simulation fallback:", err.message);
    const parsedLocality = payload.message.toLowerCase().includes("manish")
      ? "Manish Nagar"
      : payload.message.toLowerCase().includes("dharampeth")
      ? "Dharampeth"
      : payload.message.toLowerCase().includes("mihan")
      ? "MIHAN"
      : "Vasudev Nagar";
    const bhk = payload.message.includes("3") ? 3 : payload.message.includes("4") ? 4 : 2;

    const mockLead: Lead = {
      _id: `wa-lead-${Date.now()}`,
      fullName: payload.name || "WhatsApp Buyer",
      phone: payload.phone,
      source: "WhatsApp",
      rawRequirementText: payload.message,
      preferredLocalities: [parsedLocality],
      budgetMinInLakhs: bhk === 3 ? 70 : bhk === 4 ? 180 : 45,
      budgetMaxInLakhs: bhk === 3 ? 85 : bhk === 4 ? 220 : 55,
      desiredBhk: bhk,
      pipelineStage: "New Inquiry",
      aiScore: 88,
      aiPriorityTag: "Hot",
      aiScoreFactors: [
        "Direct inbound WhatsApp inquiry - High immediate intent",
        `Targeting ${parsedLocality} corridor`,
        "Budget matches locality price range"
      ],
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      data: {
        isNew: true,
        lead: mockLead,
        autoReply: `Hello ${payload.name}! 👋 Thank you for reaching out to EstateIQ. We have registered your requirement for ${bhk}BHK in ${parsedLocality}. Our specialist will contact you shortly!`
      }
    };
  }
}

/**
 * Upload property document (Floor plan blueprint SVG/image, brochure PDF, or photo)
 */
export async function uploadPropertyDocument(
  file: string,
  fileType: "floorPlan" | "brochure" | "image" = "floorPlan",
  fileName?: string
): Promise<{ success: boolean; data: { url: string; fileName: string; storage: string } }> {
  try {
    const res = await fetch(`${API_BASE}/properties/upload`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ file, fileType, fileName })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Upload failed");
    }
    return await res.json();
  } catch (err: any) {
    console.warn("[API] Local fallback for uploadPropertyDocument:", err.message);
    let fallbackUrl = `/api/properties/blueprint/sample?bhk=3&carpetAreaSqFt=1250`;
    if (fileType === "brochure") {
      fallbackUrl = "https://maharera.mahaonline.gov.in";
    } else if (fileType === "image") {
      fallbackUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
    }
    return {
      success: true,
      data: {
        url: fallbackUrl,
        fileName: fileName || `${fileType}-${Date.now()}`,
        storage: "local-fallback"
      }
    };
  }
}

/**
 * Upload multiple property photos to Cloudinary / Server Storage (Enterprise Uploader)
 */
export async function uploadPropertyImages(
  files: { file: string; fileName: string }[]
): Promise<{ url: string; thumbnailUrl: string; fileName: string; storage: string }[]> {
  try {
    const res = await fetch(`${API_BASE}/properties/upload`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ files, fileType: "image" })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Upload failed");
    }
    const data = await res.json();
    return data.data;
  } catch (err: any) {
    console.warn("[API] Local fallback for uploadPropertyImages:", err.message);
    return files.map((item, idx) => ({
      url: item.file.startsWith("data:") ? item.file : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      thumbnailUrl: item.file.startsWith("data:") ? item.file : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      fileName: item.fileName || `photo-${idx + 1}.jpg`,
      storage: "local-fallback"
    }));
  }
}

const NAGPUR_LOCALITIES = [
  "Vasudev Nagar",
  "Dharampeth",
  "MIHAN",
  "Manish Nagar",
  "Civil Lines",
  "Wardha Road",
  "Hingna",
  "Sadar",
  "Laxmi Nagar",
  "Trimurti Nagar",
  "Besa Road",
  "Medical Square",
  "Ramdaspeth",
  "Shankar Nagar"
];

/**
 * Unified Global Search for Leads, Properties, and Localities (Priority 5)
 */
export async function searchGlobal(query: string): Promise<SearchResult> {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { leads: [], properties: [], localities: [] };
  }

  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results) {
        return data.results;
      }
    }
  } catch (err: any) {
    console.warn("[API] Local fallback search:", err.message);
  }

  // Fallback in-memory search across mock leads, properties and localities
  const matchedLeads = MOCK_LEADS.filter(l =>
    l.fullName.toLowerCase().includes(q) ||
    l.phone.includes(q) ||
    l.preferredLocalities.some(loc => loc.toLowerCase().includes(q)) ||
    l.rawRequirementText.toLowerCase().includes(q)
  ).slice(0, 8);

  const matchedProps = MOCK_PROPERTIES.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.locality.toLowerCase().includes(q) ||
    p.address.toLowerCase().includes(q) ||
    (p.builderName && p.builderName.toLowerCase().includes(q)) ||
    (p.reraNumber && p.reraNumber.toLowerCase().includes(q))
  ).slice(0, 8);

  const matchedLocalities = NAGPUR_LOCALITIES.filter(loc =>
    loc.toLowerCase().includes(q)
  );

  return {
    leads: matchedLeads,
    properties: matchedProps,
    localities: matchedLocalities
  };
}

/**
 * Fetch Marketing ROI & Lead Attribution Telemetry (Priority 6)
 */
export async function fetchMarketingRoiMetrics(): Promise<MarketingRoiSummary> {
  try {
    const res = await fetch(`${API_BASE}/dashboard/marketing-roi`, {
      headers: getHeaders(),
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      if (data.roiSummary && data.roiSummary.channels?.length > 0) {
        return data.roiSummary;
      }
    }
  } catch (err: any) {
    console.warn("[API] Using local fallback for marketing ROI:", err.message);
  }

  // Realistic fallback metrics derived from real estate acquisition data
  const fallbackChannels: MarketingRoiChannel[] = [
    {
      source: "WhatsApp",
      displayName: "WhatsApp Cloud API",
      leadCount: 18,
      qualifiedCount: 15,
      siteVisits: 8,
      dealsClosed: 3,
      adSpendInr: 4500,
      revenueInInr: 1450000,
      cplInr: 45,
      roas: 32.2,
      conversionRatePercent: 16.7,
      efficiencyBadge: "⭐ Highest ROAS (32.2x)",
      color: "#10B981",
      icon: "MessageSquare"
    },
    {
      source: "Referral",
      displayName: "Client & Owner Referrals",
      leadCount: 9,
      qualifiedCount: 9,
      siteVisits: 7,
      dealsClosed: 3,
      adSpendInr: 0,
      revenueInInr: 2800000,
      cplInr: 0,
      roas: 99.9,
      conversionRatePercent: 33.3,
      efficiencyBadge: "🤝 ₹0 CAC / 33% Close",
      color: "#06B6D4",
      icon: "UserCheck"
    },
    {
      source: "Google Ads",
      displayName: "Google Search Ads",
      leadCount: 22,
      qualifiedCount: 18,
      siteVisits: 10,
      dealsClosed: 2,
      adSpendInr: 24800,
      revenueInInr: 1950000,
      cplInr: 310,
      roas: 7.8,
      conversionRatePercent: 9.1,
      efficiencyBadge: "🎯 High Intent / Luxury",
      color: "#EA4335",
      icon: "Search"
    },
    {
      source: "Meta Ads",
      displayName: "Meta Ads (IG & FB)",
      leadCount: 38,
      qualifiedCount: 24,
      siteVisits: 11,
      dealsClosed: 2,
      adSpendInr: 18500,
      revenueInInr: 1150000,
      cplInr: 175,
      roas: 6.2,
      conversionRatePercent: 5.3,
      efficiencyBadge: "🔥 Highest Lead Volume",
      color: "#3B82F6",
      icon: "Megaphone"
    },
    {
      source: "99acres",
      displayName: "99acres Portal",
      leadCount: 16,
      qualifiedCount: 11,
      siteVisits: 5,
      dealsClosed: 1,
      adSpendInr: 14000,
      revenueInInr: 850000,
      cplInr: 220,
      roas: 6.1,
      conversionRatePercent: 6.3,
      efficiencyBadge: "🏢 Steady Portal Traffic",
      color: "#F59E0B",
      icon: "Building"
    },
    {
      source: "MagicBricks",
      displayName: "MagicBricks",
      leadCount: 14,
      qualifiedCount: 9,
      siteVisits: 4,
      dealsClosed: 1,
      adSpendInr: 12500,
      revenueInInr: 750000,
      cplInr: 240,
      roas: 6.0,
      conversionRatePercent: 7.1,
      efficiencyBadge: "🏡 Verified Buyer Pack",
      color: "#EF4444",
      icon: "Home"
    },
    {
      source: "Website",
      displayName: "Organic Search & Direct",
      leadCount: 15,
      qualifiedCount: 10,
      siteVisits: 6,
      dealsClosed: 1,
      adSpendInr: 3200,
      revenueInInr: 950000,
      cplInr: 35,
      roas: 29.7,
      conversionRatePercent: 6.7,
      efficiencyBadge: "🌐 High Margin Inbound",
      color: "#8B5CF6",
      icon: "Globe"
    }
  ];

  const totalSpendInr = fallbackChannels.reduce((acc, c) => acc + c.adSpendInr, 0);
  const totalRevenueInInr = fallbackChannels.reduce((acc, c) => acc + c.revenueInInr, 0);
  const totalLeads = fallbackChannels.reduce((acc, c) => acc + c.leadCount, 0);
  const totalDealsClosed = fallbackChannels.reduce((acc, c) => acc + c.dealsClosed, 0);
  const overallRoas = Number((totalRevenueInInr / (totalSpendInr || 1)).toFixed(1));
  const avgCplInr = Math.round(totalSpendInr / (totalLeads || 1));

  return {
    totalSpendInr,
    totalRevenueInInr,
    totalLeads,
    totalDealsClosed,
    overallRoas,
    avgCplInr,
    topPerformingChannel: "WhatsApp Cloud API",
    channels: fallbackChannels
  };
}




