export type PipelineStage =
  | 'New Inquiry'
  | 'Contacted'
  | 'Site Visit Scheduled'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export type PriorityTag = 'Hot' | 'Warm' | 'Cold';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  assignedLocalities?: string[];
  activeLeadCount?: number;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  locality: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  carpetAreaSqFt: number;
  bhk: number;
  bathrooms: number;
  floorNumber: number;
  totalFloors: number;
  furnishing: 'Unfurnished' | 'Semi-Furnished' | 'Fully-Furnished';
  amenities: string[];
  listedPriceInLakhs: number;
  aiEstimatedPriceInLakhs?: number;
  valuationConfidence?: number;
  status: 'Available' | 'Under Offer' | 'Sold';
  builderName?: string;
  reraNumber?: string;
  isReraVerified?: boolean;
  possessionDate?: string;
  floorPlanUrl?: string;
  brochureUrl?: string;
  images?: string[];
  createdBy?: User | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecommendedPropertyMatch {
  property: Property;
  matchScore: number;
}

export interface Lead {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  source: 'Website' | 'Walk-in' | 'Referral' | 'PropertyPortal' | 'WhatsApp';
  rawRequirementText: string;
  preferredLocalities: string[];
  budgetMinInLakhs: number;
  budgetMaxInLakhs: number;
  desiredBhk: number;
  minCarpetAreaSqFt?: number;
  pipelineStage: PipelineStage;
  assignedAgent?: User;
  aiScore: number;
  aiPriorityTag: PriorityTag;
  aiScoreFactors: string[];
  recommendedProperties?: RecommendedPropertyMatch[];
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  slaDeadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  _id: string;
  lead: string | Lead;
  agent?: User | string;
  activityType: 'Call' | 'WhatsApp' | 'Site Visit' | 'Stage Change' | 'Note';
  notes: string;
  callDurationSeconds?: number;
  clientSentiment: 'Positive' | 'Neutral' | 'Negative';
  nextFollowUpAt?: string;
  isFollowUpCompleted: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  leads: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    byStage: Record<PipelineStage, number>;
  };
  properties: {
    total: number;
    available: number;
  };
  upcomingFollowups: Activity[];
}

export interface PredictPriceResult {
  estimatedPriceInLakhs: number;
  priceRangeMin: number;
  priceRangeMax: number;
  confidenceScore: number;
}

