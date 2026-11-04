"""
Pydantic v2 request/response schemas for the EstateIQ AI Engine.
Covers all four endpoints defined in ARCHITECTURE.md §3.1.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ──────────────────────────────────────────────
# POST /predict-price
# ──────────────────────────────────────────────

class PredictPriceRequest(BaseModel):
    locality: str = Field(..., min_length=1, description="Property locality name")
    carpetAreaSqFt: float = Field(..., gt=0, description="Carpet area in square feet")
    bhk: int = Field(..., ge=1, le=6, description="Number of bedrooms")
    bathrooms: int = Field(2, ge=1, le=6, description="Number of bathrooms")
    floorNumber: int = Field(..., ge=0, description="Floor number (0 = ground)")
    totalFloors: int = Field(..., ge=1, description="Total floors in building")
    furnishing: str = Field(
        "Semi-Furnished",
        pattern=r"^(Unfurnished|Semi-Furnished|Fully-Furnished)$",
        description="Furnishing status",
    )
    amenitiesCount: int = Field(0, ge=0, description="Number of amenities")


class PredictPriceResponse(BaseModel):
    estimatedPriceInLakhs: float
    priceRangeMin: float
    priceRangeMax: float
    confidenceScore: float = Field(..., ge=0, le=1)


# ──────────────────────────────────────────────
# POST /score-lead
# ──────────────────────────────────────────────

class ScoreLeadRequest(BaseModel):
    budgetMaxInLakhs: float = Field(..., gt=0)
    localityMedianPriceInLakhs: float = Field(..., gt=0)
    interactionCount: int = Field(0, ge=0)
    daysSinceLastContact: int = Field(0, ge=0)
    siteVisitScheduled: bool = False
    sentimentScore: float = Field(
        0.0, ge=-1.0, le=1.0,
        description="Aggregated sentiment: -1 (negative) to +1 (positive)",
    )


class ScoreLeadResponse(BaseModel):
    aiScore: int = Field(..., ge=0, le=100)
    aiPriorityTag: str = Field(..., pattern=r"^(Hot|Warm|Cold)$")
    aiScoreFactors: list[str]


# ──────────────────────────────────────────────
# POST /generate-embedding
# ──────────────────────────────────────────────

class GenerateEmbeddingRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to embed")


class GenerateEmbeddingResponse(BaseModel):
    embedding: list[float] = Field(..., description="384-dimensional vector")


# ──────────────────────────────────────────────
# POST /match-properties
# ──────────────────────────────────────────────

class PropertyCandidate(BaseModel):
    id: str
    embedding: list[float]
    listedPriceInLakhs: float = Field(..., gt=0)


class MatchedProperty(BaseModel):
    propertyId: str
    matchScore: float = Field(..., ge=0, le=100)


class MatchPropertiesRequest(BaseModel):
    leadRequirementText: str = Field(..., min_length=1)
    budgetMaxInLakhs: float = Field(..., gt=0)
    properties: list[PropertyCandidate]


class MatchPropertiesResponse(BaseModel):
    matches: list[MatchedProperty]


# ──────────────────────────────────────────────
# POST /generate-marketing-copy
# ──────────────────────────────────────────────

class GenerateMarketingCopyRequest(BaseModel):
    locality: str
    bhk: int
    carpetAreaSqFt: float
    furnishing: str = "Semi-Furnished"
    amenities: list[str] = Field(default_factory=list)
    listedPriceInLakhs: float
    builderName: Optional[str] = "Nagpur Premier Estates"
    reraNumber: Optional[str] = "P50500028192"
    possessionDate: Optional[str] = "Ready to Move"


class GenerateMarketingCopyResponse(BaseModel):
    whatsappTeaser: str
    seoDescription: str
    instagramCaption: str


# ──────────────────────────────────────────────
# POST /predict-stalled-deal
# ──────────────────────────────────────────────

class PredictStalledDealRequest(BaseModel):
    leadId: str
    fullName: str
    pipelineStage: str
    daysInactive: int = 0
    desiredBhk: int
    budgetMaxInLakhs: float
    preferredLocalities: list[str] = Field(default_factory=list)


class PredictStalledDealResponse(BaseModel):
    isStalled: bool
    daysInactive: int
    urgencyLevel: str
    reason: str
    smartNudge: str
    actionStrategy: str
    suggestedPitch: str

