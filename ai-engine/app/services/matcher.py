"""
Semantic property matcher service.

Uses `all-MiniLM-L6-v2` (384-dim) for text embedding and combines
cosine similarity with budget proximity to produce a ranked match list.
"""

import logging
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("estateiq.matcher")

MODEL_NAME = "all-MiniLM-L6-v2"

# ── Model loader (singleton) ─────────────────────────────────────

@lru_cache(maxsize=1)
def _load_model() -> SentenceTransformer:
    logger.info(f"Loading sentence-transformer model: {MODEL_NAME} …")
    model = SentenceTransformer(MODEL_NAME)
    logger.info("Sentence-transformer model loaded ✓")
    return model


# ── Embedding generation ─────────────────────────────────────────

def generate_embedding(text: str) -> list[float]:
    """
    Encode a text string into a 384-dimensional dense vector.
    """
    model = _load_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


# ── Cosine similarity ────────────────────────────────────────────

def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two vectors (already L2-normalised)."""
    dot = float(np.dot(a, b))
    norm_a = float(np.linalg.norm(a))
    norm_b = float(np.linalg.norm(b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


# ── Budget proximity score ───────────────────────────────────────

def _budget_proximity(listed_price: float, budget_max: float) -> float:
    """
    Score 0-1 indicating how well the listed price fits the budget.
    Properties over budget are penalised, under-budget ones are rewarded.
    """
    if budget_max <= 0:
        return 0.0

    ratio = listed_price / budget_max

    if ratio <= 1.0:
        # Within budget — closer to budget = better (avoids too-cheap mismatches)
        return 0.7 + 0.3 * ratio
    elif ratio <= 1.15:
        # Slightly over budget (up to 15%) — still viable
        overshoot = (ratio - 1.0) / 0.15
        return 0.7 * (1.0 - overshoot)
    else:
        # Well over budget
        return max(0.0, 0.3 * (1.0 - (ratio - 1.15)))


# ── Match properties ─────────────────────────────────────────────

SEMANTIC_WEIGHT = 0.65
BUDGET_WEIGHT = 0.35


def match_properties(
    lead_requirement_text: str,
    budget_max: float,
    properties: list[dict],
) -> list[dict]:
    """
    Rank candidate properties by combined semantic + budget match.

    Args:
        lead_requirement_text: Free-text requirement from the lead.
        budget_max: Lead's maximum budget in lakhs.
        properties: List of dicts with keys: id, embedding (list[float]), listedPriceInLakhs.

    Returns:
        Sorted list of {propertyId, matchScore} (score 0-100, descending).
    """
    if not properties:
        return []

    model = _load_model()
    lead_embedding = model.encode(lead_requirement_text, normalize_embeddings=True)

    results: list[dict] = []

    for prop in properties:
        prop_embedding = np.array(prop["embedding"], dtype=np.float32)

        # Semantic similarity (0-1)
        semantic_sim = _cosine_similarity(lead_embedding, prop_embedding)
        semantic_sim = max(0.0, semantic_sim)  # clamp negatives

        # Budget proximity (0-1)
        budget_sim = _budget_proximity(prop["listedPriceInLakhs"], budget_max)

        # Weighted blend → 0-100
        combined = (SEMANTIC_WEIGHT * semantic_sim + BUDGET_WEIGHT * budget_sim) * 100
        combined = round(min(100.0, max(0.0, combined)), 2)

        results.append({
            "propertyId": prop["id"],
            "matchScore": combined,
        })

    # Sort descending by matchScore
    results.sort(key=lambda x: x["matchScore"], reverse=True)

    return results
