"""
EstateIQ AI Engine — FastAPI application.

Exposes four ML endpoints under /api/v1 and a health check at /health.
Trains the valuation model on startup if no cached .pkl exists.
"""

import logging
import time
from contextlib import asynccontextmanager

import sys
from pathlib import Path

# Add project root to sys.path so 'app' is always resolvable regardless of working directory
_AI_ENGINE_DIR = Path(__file__).resolve().parent.parent
if str(_AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(_AI_ENGINE_DIR))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    PredictPriceRequest,
    PredictPriceResponse,
    ScoreLeadRequest,
    ScoreLeadResponse,
    GenerateEmbeddingRequest,
    GenerateEmbeddingResponse,
    MatchPropertiesRequest,
    MatchPropertiesResponse,
)
from app.services.valuation import get_model, predict_price
from app.services.scoring import score_lead
from app.services.matcher import generate_embedding, match_properties

# ── Logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger("estateiq.api")


# ── Lifespan: warm up models on startup ──────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load expensive models so the first request is fast."""
    logger.info("🚀 Starting EstateIQ AI Engine …")

    t0 = time.time()
    get_model()  # train or load valuation model
    logger.info(f"Valuation model ready  ({time.time() - t0:.1f}s)")

    t1 = time.time()
    generate_embedding("warmup")  # download & cache sentence-transformer
    logger.info(f"Embedding model ready  ({time.time() - t1:.1f}s)")

    yield

    logger.info("AI Engine shutting down.")


# ── App ──────────────────────────────────────────────────────────

app = FastAPI(
    title="EstateIQ AI Engine",
    version="1.0.0",
    description="ML microservice for property valuation, lead scoring, and semantic matching.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ───────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "estateiq-ai-engine"}


# ── 1. Predict Price ─────────────────────────────────────────────

@app.post(
    "/api/v1/predict-price",
    response_model=PredictPriceResponse,
    tags=["Valuation"],
    summary="Predict property price using ML ensemble",
)
async def predict_price_endpoint(body: PredictPriceRequest):
    try:
        result = predict_price(
            locality=body.locality,
            carpet_area=body.carpetAreaSqFt,
            bhk=body.bhk,
            bathrooms=body.bathrooms,
            floor_number=body.floorNumber,
            total_floors=body.totalFloors,
            furnishing=body.furnishing,
            amenities_count=body.amenitiesCount,
        )
        return PredictPriceResponse(**result)
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(e))


# ── 2. Score Lead ────────────────────────────────────────────────

@app.post(
    "/api/v1/score-lead",
    response_model=ScoreLeadResponse,
    tags=["Lead Scoring"],
    summary="Compute AI-driven lead conversion score",
)
async def score_lead_endpoint(body: ScoreLeadRequest):
    try:
        result = score_lead(
            budget_max=body.budgetMaxInLakhs,
            locality_median_price=body.localityMedianPriceInLakhs,
            interaction_count=body.interactionCount,
            days_since_last_contact=body.daysSinceLastContact,
            site_visit_scheduled=body.siteVisitScheduled,
            sentiment_score=body.sentimentScore,
        )
        return ScoreLeadResponse(**result)
    except Exception as e:
        logger.exception("Lead scoring failed")
        raise HTTPException(status_code=500, detail=str(e))


# ── 3. Generate Embedding ───────────────────────────────────────

@app.post(
    "/api/v1/generate-embedding",
    response_model=GenerateEmbeddingResponse,
    tags=["Embeddings"],
    summary="Generate 384-dim text embedding via all-MiniLM-L6-v2",
)
async def generate_embedding_endpoint(body: GenerateEmbeddingRequest):
    try:
        embedding = generate_embedding(body.text)
        return GenerateEmbeddingResponse(embedding=embedding)
    except Exception as e:
        logger.exception("Embedding generation failed")
        raise HTTPException(status_code=500, detail=str(e))


# ── 4. Match Properties ─────────────────────────────────────────

@app.post(
    "/api/v1/match-properties",
    response_model=MatchPropertiesResponse,
    tags=["Matching"],
    summary="Rank properties by semantic + budget match",
)
async def match_properties_endpoint(body: MatchPropertiesRequest):
    try:
        props = [
            {"id": p.id, "embedding": p.embedding, "listedPriceInLakhs": p.listedPriceInLakhs}
            for p in body.properties
        ]
        matches = match_properties(
            lead_requirement_text=body.leadRequirementText,
            budget_max=body.budgetMaxInLakhs,
            properties=props,
        )
        return MatchPropertiesResponse(matches=matches)
    except Exception as e:
        logger.exception("Property matching failed")
        raise HTTPException(status_code=500, detail=str(e))


# ── Entrypoint ───────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)
