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
    GenerateMarketingCopyRequest,
    GenerateMarketingCopyResponse,
    PredictStalledDealRequest,
    PredictStalledDealResponse,
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


# ── 5. GenAI Listing & Marketing Copy Generator ─────────────────

@app.post(
    "/api/v1/generate-marketing-copy",
    response_model=GenerateMarketingCopyResponse,
    tags=["GenAI Copilot"],
    summary="Generate 3 high-converting marketing drafts (WhatsApp, SEO, Instagram)",
)
async def generate_marketing_copy_endpoint(body: GenerateMarketingCopyRequest):
    try:
        amenities_str = " • ".join(body.amenities[:5]) if body.amenities else "Parking • Power Backup • Lift"
        price_str = f"₹{body.listedPriceInLakhs / 100:.2f} Cr" if body.listedPriceInLakhs >= 100 else f"₹{body.listedPriceInLakhs:.2f} Lakhs"

        whatsapp_teaser = (
            f"🔥 *EXCLUSIVE PRE-MARKET LAUNCH IN {body.locality.upper()}, NAGPUR!*\n\n"
            f"Looking for a spacious family home in a prime neighborhood?\n"
            f"Check out this verified *{body.bhk} BHK Premium Flat* by *{body.builderName}*!\n\n"
            f"✨ *KEY SPECIFICATIONS:*\n"
            f"📐 Carpet Area: *{body.carpetAreaSqFt:.0f} sq.ft (RERA Carpet)*\n"
            f"🏢 Floor: Prime Level • {body.furnishing}\n"
            f"📜 MahaRERA: *{body.reraNumber}* ({body.possessionDate})\n"
            f"💎 Amenities: {amenities_str}\n"
            f"🚇 Connectivity: Prime road & Metro corridor proximity\n\n"
            f"💰 *OFFER PRICE:* *{price_str}* (Special Developer Token Benefit)\n\n"
            f"⚠️ *Only 2 units remaining at this price point!*\n"
            f"📲 Reply *'VISIT'* or call *+91 98220 11800* for private showing & CAD blueprints.\n\n"
            f"_EstateIQ Private Brokerage • MahaRERA Certified Advisory_"
        )

        seo_description = (
            f"Presenting an ultra-modern {body.bhk} BHK luxury apartment situated in the coveted residential "
            f"enclave of {body.locality}, Nagpur. Developed by renowned builder {body.builderName}, this vastu-compliant "
            f"home offers {body.carpetAreaSqFt:.0f} sq.ft of optimum RERA carpet area, featuring abundant cross-ventilation, "
            f"Italian-style living spaces, and expansive balcony views.\n\n"
            f"PROJECT HIGHLIGHTS & AMENITIES:\n"
            f"• Configuration: {body.bhk} Bedrooms, Designer Bathrooms, Modular Utility Space\n"
            f"• Furnishing Condition: {body.furnishing} with premium electrical fittings\n"
            f"• World-class Infrastructure: {amenities_str}\n"
            f"• MahaRERA Registered: Certificate No. {body.reraNumber} ({body.possessionDate})\n"
            f"• Title: Clear marketable title with NMC sanction and leading bank loan approvals (SBI / HDFC / ICICI)\n\n"
            f"LOCALITY CONNECTIVITY & NEIGHBORHOOD:\n"
            f"Strategically positioned in {body.locality}, offering seamless connectivity to Nagpur Airport, MIHAN SEZ "
            f"IT hub, prominent educational institutions, multispecialty hospitals, and Nagpur Metro stations.\n\n"
            f"Price: {price_str} (Negotiable on early token booking). Contact EstateIQ Managing Brokerage for private walkthroughs."
        )

        instagram_caption = (
            f"Your sanctuary of calm and luxury in Nagpur 🏙️✨\n\n"
            f"Discover architectural perfection with this {body.bhk} BHK bespoke residence in prime {body.locality}. "
            f"Boasting {body.carpetAreaSqFt:.0f} sq.ft of sun-drenched interiors, modern {body.furnishing.lower()} finishes, "
            f"and private sun decks overlooking the city skyline 🌅\n\n"
            f"Highlights you'll fall in love with:\n"
            f"🔑 {body.bhk} Spacious Bedrooms with En-suite Bathrooms\n"
            f"🌿 {amenities_str}\n"
            f"📜 100% MahaRERA Verified ({body.reraNumber})\n"
            f"📍 Unbeatable {body.locality} location, moments from the city's finest dining & metro\n\n"
            f"Offered at {price_str}\n\n"
            f"Tag someone who would love this home! 👇\n"
            f"DM or WhatsApp +91 98220 11800 for private inspection.\n\n"
            f"#NagpurRealEstate #NagpurProperty #LuxuryHomesNagpur #MahaRERA #Nagpur #Dharampeth #CivilLinesNagpur #EstateIQ"
        )

        return GenerateMarketingCopyResponse(
            whatsappTeaser=whatsapp_teaser,
            seoDescription=seo_description,
            instagramCaption=instagram_caption,
        )
    except Exception as e:
        logger.exception("Marketing copy generation failed")
        raise HTTPException(status_code=500, detail=str(e))


# ── 6. AI Stalled Deal Predictor & Smart Nudges ──────────────────

@app.post(
    "/api/v1/predict-stalled-deal",
    response_model=PredictStalledDealResponse,
    tags=["GenAI Copilot"],
    summary="Analyze deal latency and generate proactive re-engagement strategy",
)
async def predict_stalled_deal_endpoint(body: PredictStalledDealRequest):
    try:
        is_stalled = False
        urgency = "Normal"
        reason = "Deal progressing normally."
        smart_nudge = "Maintain standard SLA follow-up cadence."
        strategy = "Regular pipeline follow-up"

        localities = ", ".join(body.preferredLocalities) if body.preferredLocalities else "Nagpur"

        if body.pipelineStage == "New Inquiry" and body.daysInactive >= 1:
            is_stalled = True
            urgency = "Critical" if body.daysInactive >= 3 else "High"
            reason = f"Fresh inbound inquiry unattended for {body.daysInactive} day(s). Inbound conversion decays by 70%+ after 24 hrs."
            smart_nudge = f"{body.fullName} ne {body.daysInactive} din se inquiry ki hui hai par initial contact pending hai. 1-click WhatsApp introduction karein."
            strategy = "Immediate first-response call & WhatsApp introduction"
        elif body.pipelineStage == "Contacted" and body.daysInactive >= 4:
            is_stalled = True
            urgency = "High" if body.daysInactive >= 7 else "Medium"
            reason = f"Lead contacted but site visit not scheduled for {body.daysInactive} day(s). Interest cools down without an in-person physical tour."
            smart_nudge = f"{body.fullName} ne {body.daysInactive} din se reply nahi diya — {localities} mein unke ₹{body.budgetMaxInLakhs}L budget ke andar nayi units aayi hain. Saturday site visit schedule karein."
            strategy = "Send fresh inventory teaser with weekend site visit invite"
        elif body.pipelineStage == "Negotiation" and body.daysInactive >= 5:
            is_stalled = True
            urgency = "Critical" if body.daysInactive >= 9 else "High"
            reason = f"Price negotiation stalled for {body.daysInactive} day(s). High danger of buyer ghosting due to budget hesitation or rival developer offers."
            smart_nudge = f"Negotiation {body.daysInactive} din se stagnant hai. Buyer ko close karne ke liye developer parking concession ya 1% token advance lock offer karein."
            strategy = "Offer strategic financial concession / token lock"

        suggested_pitch = (
            f"Hi {body.fullName}, hope you are doing well!\n"
            f"I was reviewing your search for a {body.desiredBhk} BHK home in {localities} (budget under ₹{body.budgetMaxInLakhs}L).\n\n"
            f"We just received 2 newly listed MahaRERA certified properties this week with spacious layouts and prime connectivity.\n"
            f"Would you be free for a 5-minute call or a quick site visit this Saturday morning?\n"
            f"Best regards, Prajwal Dhande • EstateIQ Nagpur"
        )

        return PredictStalledDealResponse(
            isStalled=is_stalled,
            daysInactive=body.daysInactive,
            urgencyLevel=urgency,
            reason=reason,
            smartNudge=smart_nudge,
            actionStrategy=strategy,
            suggestedPitch=suggested_pitch,
        )
    except Exception as e:
        logger.exception("Stalled deal prediction failed")
        raise HTTPException(status_code=500, detail=str(e))



# ── Entrypoint ───────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)
