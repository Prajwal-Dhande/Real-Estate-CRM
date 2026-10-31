"""
Lead scoring service.

Computes a 0-100 conversion probability score based on weighted signals,
assigns a priority tag (Hot / Warm / Cold), and produces human-readable
factor explanations for the CRM UI.
"""

import logging

logger = logging.getLogger("estateiq.scoring")

# ── Scoring weights (must sum to ~1.0) ───────────────────────────
WEIGHTS = {
    "budget_alignment":   0.25,
    "interaction_depth":  0.20,
    "recency":            0.20,
    "site_visit":         0.20,
    "sentiment":          0.15,
}


def score_lead(
    budget_max: float,
    locality_median_price: float,
    interaction_count: int,
    days_since_last_contact: int,
    site_visit_scheduled: bool,
    sentiment_score: float,
) -> dict:
    """
    Evaluate a lead's conversion likelihood.

    Returns:
        aiScore (0-100), aiPriorityTag, and aiScoreFactors list.
    """
    factors: list[str] = []

    # ── 1. Budget alignment (0-100) ──────────────────────────────
    if locality_median_price > 0:
        ratio = budget_max / locality_median_price
        if ratio >= 1.2:
            budget_score = 100.0
            factors.append("Budget significantly exceeds locality median price")
        elif ratio >= 0.9:
            budget_score = 70.0 + (ratio - 0.9) / 0.3 * 30.0
            factors.append("Budget aligns with locality median price")
        elif ratio >= 0.7:
            budget_score = 40.0 + (ratio - 0.7) / 0.2 * 30.0
            factors.append("Budget slightly below locality median - may limit options")
        else:
            budget_score = max(0, ratio / 0.7 * 40.0)
            factors.append("Budget well below locality median price")
    else:
        budget_score = 50.0

    # ── 2. Interaction depth (0-100) ─────────────────────────────
    if interaction_count >= 6:
        interaction_score = 100.0
        factors.append(f"High engagement - {interaction_count} interactions logged")
    elif interaction_count >= 3:
        interaction_score = 50.0 + (interaction_count - 3) / 3 * 50.0
        factors.append(f"Moderate engagement - {interaction_count} interactions")
    elif interaction_count >= 1:
        interaction_score = interaction_count / 3 * 50.0
        factors.append(f"Low engagement - only {interaction_count} interaction(s)")
    else:
        interaction_score = 0.0
        factors.append("No interactions recorded yet")

    # ── 3. Recency (0-100) ───────────────────────────────────────
    if days_since_last_contact <= 1:
        recency_score = 100.0
        factors.append("Contacted within the last 24 hours")
    elif days_since_last_contact <= 3:
        recency_score = 80.0
        factors.append("Last contact within 3 days")
    elif days_since_last_contact <= 7:
        recency_score = 55.0
        factors.append("Last contact within a week")
    elif days_since_last_contact <= 14:
        recency_score = 30.0
        factors.append("Over a week since last contact - follow up soon")
    else:
        recency_score = max(0, 30 - (days_since_last_contact - 14) * 2)
        factors.append(f"No contact for {days_since_last_contact} days - at risk of going cold")

    # ── 4. Site visit (binary boost) ─────────────────────────────
    if site_visit_scheduled:
        site_score = 100.0
        factors.append("Site visit scheduled - high buying intent")
    else:
        site_score = 0.0
        factors.append("No site visit scheduled yet")

    # ── 5. Sentiment (-1 to +1 → 0-100) ─────────────────────────
    sentiment_normalized = (sentiment_score + 1) / 2 * 100  # map [-1,1] → [0,100]
    if sentiment_score > 0.3:
        factors.append("Positive client sentiment detected")
    elif sentiment_score < -0.3:
        factors.append("Negative client sentiment - potential objections")
    else:
        factors.append("Neutral client sentiment")

    # ── Weighted total ───────────────────────────────────────────
    raw_score = (
        WEIGHTS["budget_alignment"]  * budget_score
        + WEIGHTS["interaction_depth"] * interaction_score
        + WEIGHTS["recency"]           * recency_score
        + WEIGHTS["site_visit"]        * site_score
        + WEIGHTS["sentiment"]         * sentiment_normalized
    )

    ai_score = int(round(min(100, max(0, raw_score))))

    # ── Priority tag ─────────────────────────────────────────────
    if ai_score >= 70:
        tag = "Hot"
    elif ai_score >= 40:
        tag = "Warm"
    else:
        tag = "Cold"

    logger.info(f"Lead scored: {ai_score} ({tag}) — factors: {factors}")

    return {
        "aiScore": ai_score,
        "aiPriorityTag": tag,
        "aiScoreFactors": factors,
    }
