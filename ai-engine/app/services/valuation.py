"""
Property valuation service.

Generates a realistic synthetic dataset for Nagpur localities and trains
an XGBoost → RandomForest ensemble pipeline on first startup.  The trained
model is persisted as a .pkl so subsequent cold-starts are instant.
"""

import os
import pickle
import logging
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from xgboost import XGBRegressor

logger = logging.getLogger("estateiq.valuation")

# ── Locality profiles (Nagpur-centric) ───────────────────────────
# basePricePerSqFt is in INR; we convert to lakhs at the end
LOCALITY_PROFILES: dict[str, dict] = {
    "Vasudev Nagar":   {"basePricePerSqFt": 5_200, "premiumMultiplier": 1.10},
    "Dharampeth":      {"basePricePerSqFt": 7_800, "premiumMultiplier": 1.25},
    "MIHAN":           {"basePricePerSqFt": 4_500, "premiumMultiplier": 1.05},
    "Manish Nagar":    {"basePricePerSqFt": 5_800, "premiumMultiplier": 1.12},
    "Sadar":           {"basePricePerSqFt": 8_500, "premiumMultiplier": 1.30},
    "Wardha Road":     {"basePricePerSqFt": 4_000, "premiumMultiplier": 1.00},
    "Hingna":          {"basePricePerSqFt": 3_200, "premiumMultiplier": 0.95},
    "Civil Lines":     {"basePricePerSqFt": 9_000, "premiumMultiplier": 1.35},
    "Laxmi Nagar":     {"basePricePerSqFt": 6_000, "premiumMultiplier": 1.15},
    "Trimurti Nagar":  {"basePricePerSqFt": 5_500, "premiumMultiplier": 1.08},
}

FURNISHING_LABELS = ["Unfurnished", "Semi-Furnished", "Fully-Furnished"]
FURNISHING_PREMIUM = {"Unfurnished": 0.0, "Semi-Furnished": 0.06, "Fully-Furnished": 0.14}

MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "models"
MODEL_PATH = MODEL_DIR / "valuation_model.pkl"

# ── Synthetic data generation ────────────────────────────────────

def _generate_synthetic_dataset(n_per_locality: int = 600, seed: int = 42) -> pd.DataFrame:
    """
    Produce a realistic property dataset with controlled noise.
    Each row has: locality, carpetAreaSqFt, bhk, bathrooms,
    floorNumber, totalFloors, furnishing, amenitiesCount, priceInLakhs
    """
    rng = np.random.default_rng(seed)
    rows: list[dict] = []

    for locality, profile in LOCALITY_PROFILES.items():
        base = profile["basePricePerSqFt"]
        mult = profile["premiumMultiplier"]

        for _ in range(n_per_locality):
            bhk = int(rng.choice([1, 2, 3, 4], p=[0.10, 0.35, 0.40, 0.15]))
            area = int(rng.normal(loc=bhk * 380, scale=bhk * 50))
            area = max(350, min(area, 3500))
            bathrooms = min(bhk, int(rng.choice([1, 2, 3], p=[0.2, 0.6, 0.2])))
            total_floors = int(rng.choice([5, 7, 10, 14, 20, 25], p=[0.15, 0.20, 0.25, 0.20, 0.12, 0.08]))
            floor = int(rng.integers(0, total_floors + 1))
            furnishing = rng.choice(FURNISHING_LABELS, p=[0.30, 0.45, 0.25])
            amenities = int(rng.integers(0, 8))

            # Price model with realistic factors
            floor_factor = 1.0 + 0.003 * min(floor, 15)           # higher floors slightly costlier
            amenity_factor = 1.0 + 0.008 * amenities               # each amenity adds ~0.8%
            furn_factor = 1.0 + FURNISHING_PREMIUM[furnishing]
            noise = rng.normal(1.0, 0.06)                           # ±6% market noise

            price_inr = base * area * mult * floor_factor * amenity_factor * furn_factor * noise
            price_lakhs = round(price_inr / 1e5, 2)
            price_lakhs = max(8.0, price_lakhs)                     # floor at 8L

            rows.append({
                "locality": locality,
                "carpetAreaSqFt": area,
                "bhk": bhk,
                "bathrooms": bathrooms,
                "floorNumber": floor,
                "totalFloors": total_floors,
                "furnishing": furnishing,
                "amenitiesCount": amenities,
                "priceInLakhs": price_lakhs,
            })

    return pd.DataFrame(rows)


# ── Model training ───────────────────────────────────────────────

def _build_pipeline() -> Pipeline:
    """Build an ensemble of XGBoost + RandomForest wrapped in a sklearn Pipeline."""

    numeric_features = [
        "carpetAreaSqFt", "bhk", "bathrooms",
        "floorNumber", "totalFloors", "amenitiesCount",
    ]
    categorical_features = ["locality", "furnishing"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), categorical_features),
        ],
        remainder="drop",
    )

    xgb = XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    rf = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        random_state=42,
        n_jobs=-1,
    )

    ensemble = VotingRegressor(estimators=[("xgb", xgb), ("rf", rf)])

    return Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", ensemble),
    ])


def train_model() -> Pipeline:
    """Train the valuation pipeline and persist it."""
    logger.info("Generating synthetic dataset for valuation model …")
    df = _generate_synthetic_dataset()

    feature_cols = [
        "locality", "carpetAreaSqFt", "bhk", "bathrooms",
        "floorNumber", "totalFloors", "furnishing", "amenitiesCount",
    ]
    X = df[feature_cols]
    y = df["priceInLakhs"]

    pipeline = _build_pipeline()

    # Quick cross-val to log quality
    scores = cross_val_score(pipeline, X, y, cv=5, scoring="r2")
    logger.info(f"Cross-val R² scores: {scores.round(3)}  (mean={scores.mean():.3f})")

    pipeline.fit(X, y)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)
    logger.info(f"Valuation model saved → {MODEL_PATH}")

    return pipeline


def load_or_train_model() -> Pipeline:
    """Load cached model or train from scratch."""
    if MODEL_PATH.exists():
        logger.info(f"Loading cached valuation model ← {MODEL_PATH}")
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return train_model()


# ── Prediction ───────────────────────────────────────────────────

_model: Pipeline | None = None


def get_model() -> Pipeline:
    global _model
    if _model is None:
        _model = load_or_train_model()
    return _model


def predict_price(
    locality: str,
    carpet_area: float,
    bhk: int,
    bathrooms: int,
    floor_number: int,
    total_floors: int,
    furnishing: str,
    amenities_count: int,
) -> dict:
    """
    Return estimated price with a confidence-weighted range.
    """
    model = get_model()

    input_df = pd.DataFrame([{
        "locality": locality,
        "carpetAreaSqFt": carpet_area,
        "bhk": bhk,
        "bathrooms": bathrooms,
        "floorNumber": floor_number,
        "totalFloors": total_floors,
        "furnishing": furnishing,
        "amenitiesCount": amenities_count,
    }])

    predicted = float(model.predict(input_df)[0])
    predicted = max(1.0, round(predicted, 2))

    # Confidence heuristic: known localities get higher confidence
    known = locality in LOCALITY_PROFILES
    confidence = 0.88 if known else 0.62

    # Price range narrows with confidence
    spread = 0.08 if known else 0.15
    price_min = round(predicted * (1 - spread), 2)
    price_max = round(predicted * (1 + spread), 2)

    return {
        "estimatedPriceInLakhs": predicted,
        "priceRangeMin": price_min,
        "priceRangeMax": price_max,
        "confidenceScore": confidence,
    }
