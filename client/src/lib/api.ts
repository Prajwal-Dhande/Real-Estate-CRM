import { Lead, Property, Activity, DashboardMetrics, PredictPriceResult, PipelineStage } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fallback demo leads if backend server is offline
export const MOCK_LEADS: Lead[] = [
  {
    _id: "lead-1",
    fullName: "Rahul Verma",
    phone: "+91 98230 11223",
    email: "rahul.verma@example.com",
    source: "Website",
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
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    _id: "lead-2",
    fullName: "Anita Kulkarni",
    phone: "+91 97654 44556",
    email: "anita.kulkarni@example.com",
    source: "Referral",
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
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    _id: "lead-3",
    fullName: "Vikramaditya Rao",
    phone: "+91 99887 77665",
    email: "vikram.rao@example.com",
    source: "PropertyPortal",
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
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    _id: "lead-4",
    fullName: "Pooja Deshmukh",
    phone: "+91 94221 88990",
    email: "pooja.d@example.com",
    source: "Walk-in",
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
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    _id: "lead-5",
    fullName: "Amitabh Banerjee",
    phone: "+91 93710 55443",
    email: "amitabh.b@example.com",
    source: "Website",
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
    status: "Available"
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
    status: "Available"
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
    status: "Available"
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
    status: "Available"
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
    status: "Under Offer"
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
  user?: import("@/types").User;
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
    
    const mockUser: import("@/types").User = isRahul
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
    const mockUser: import("@/types").User = {
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

  const mockUser: import("@/types").User = isRahul
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
export async function fetchCurrentUser(): Promise<import("@/types").User | null> {
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
export async function fetchAgents(): Promise<import("@/types").User[]> {
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

