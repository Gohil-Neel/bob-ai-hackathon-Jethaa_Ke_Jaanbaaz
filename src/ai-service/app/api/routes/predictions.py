"""
SupplyShield AI — Predictions Routes (Phase 13)

Endpoints receive VERIFIED structured facts from the ASP.NET Core backend.
They NEVER receive raw user input.

Phase 13: Real IBM watsonx.ai explanations via verified-facts prompts.
Phase 12: Deterministic ML risk scoring via scikit-learn (heuristic model, 
          full model training deferred to Phase 12 proper).
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.integrations.watsonx.client import watsonx_client
from app.integrations.watsonx.prompts import (
    build_shipment_prompt,
    build_disruption_prompt,
    build_cold_chain_prompt,
    build_reroute_prompt,
    build_risk_score_explanation_prompt,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class ExplanationRequest(BaseModel):
    """Structured facts payload sent by the ASP.NET Core backend."""
    # "shipment" | "disruption" | "cold_chain" | "reroute" | "risk_score"
    context_type: str
    context_id: str
    facts: Dict[str, Any]


class ExplanationResponse(BaseModel):
    status: str
    context_type: str
    context_id: str
    explanation: str
    confidence: Optional[float] = None
    watsonx_enabled: bool = False


class RiskScoreRequest(BaseModel):
    """Structured shipment features for ML risk scoring."""
    shipment_id: str
    # Route / carrier features
    route_estimated_hours: Optional[float] = None
    days_until_arrival: Optional[float] = None
    is_cold_chain: Optional[bool] = False
    priority: Optional[str] = "Medium"       # Critical | High | Medium | Low
    # Disruption signals
    active_disruption_count: Optional[int] = 0
    max_disruption_severity: Optional[str] = "None"  # Critical | High | Medium | Low | None
    # Historical / carrier signals
    carrier_on_time_rate: Optional[float] = 1.0      # 0–1
    historical_delay_rate: Optional[float] = 0.0     # 0–1
    # Existing deterministic risk score from backend (used as a strong signal)
    backend_risk_score: Optional[float] = None


class RiskScoreResponse(BaseModel):
    status: str
    shipment_id: str
    ml_risk_score: float            # 0.0 – 1.0
    risk_band: str                  # LOW | MEDIUM | HIGH | CRITICAL
    feature_contributions: Dict[str, float]
    explanation: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_PRIORITY_WEIGHTS = {"Critical": 0.20, "High": 0.12, "Medium": 0.05, "Low": 0.0}
_SEVERITY_WEIGHTS = {"Critical": 0.30, "High": 0.20, "Medium": 0.10, "Low": 0.05, "None": 0.0}
_RISK_BANDS = [(0.75, "CRITICAL"), (0.50, "HIGH"), (0.25, "MEDIUM"), (0.0, "LOW")]


def _risk_band(score: float) -> str:
    for threshold, band in _RISK_BANDS:
        if score >= threshold:
            return band
    return "LOW"


def _compute_ml_risk(req: RiskScoreRequest) -> tuple[float, Dict[str, float]]:
    """
    Heuristic risk scorer — combines signals linearly.
    Returns (score_0_to_1, feature_contributions_dict).

    A full scikit-learn model (trained on the Kaggle DataCo / seeded dataset)
    can replace this in Phase 12 proper. The contributions dict is structured
    identically so the prompt builder and frontend remain unchanged.
    """
    contributions: Dict[str, float] = {}

    # 1. Backend deterministic score — highest-fidelity signal when available
    if req.backend_risk_score is not None:
        contributions["backend_risk_score"] = round(req.backend_risk_score * 0.45, 4)
    else:
        contributions["backend_risk_score"] = 0.0

    # 2. Priority
    contributions["priority"] = _PRIORITY_WEIGHTS.get(req.priority or "Medium", 0.05)

    # 3. Active disruption count (capped at 3 disruptions for score)
    disruption_weight = min((req.active_disruption_count or 0), 3) * 0.08
    contributions["active_disruption_count"] = round(disruption_weight, 4)

    # 4. Max disruption severity
    contributions["max_disruption_severity"] = _SEVERITY_WEIGHTS.get(
        req.max_disruption_severity or "None", 0.0
    )

    # 5. Cold-chain multiplier
    contributions["cold_chain_multiplier"] = 0.05 if req.is_cold_chain else 0.0

    # 6. Time pressure (days_until_arrival < 2 → elevated risk)
    if req.days_until_arrival is not None:
        time_pressure = max(0.0, min(0.10, (2.0 - req.days_until_arrival) * 0.05))
        contributions["time_pressure"] = round(time_pressure, 4)
    else:
        contributions["time_pressure"] = 0.0

    # 7. Historical delay rate
    contributions["historical_delay_rate"] = round((req.historical_delay_rate or 0.0) * 0.10, 4)

    # 8. Carrier reliability (inverted on-time rate)
    contributions["carrier_unreliability"] = round(
        (1.0 - min(1.0, req.carrier_on_time_rate or 1.0)) * 0.10, 4
    )

    total = min(1.0, sum(contributions.values()))
    return round(total, 4), contributions


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/explain", response_model=ExplanationResponse)
async def explain(request: ExplanationRequest) -> ExplanationResponse:
    """
    Generate a grounded explanation for the given context using IBM watsonx.ai.

    Supported context_type values:
      - "shipment"    → shipment risk analysis
      - "disruption"  → disruption impact analysis
      - "cold_chain"  → cold-chain excursion analysis
      - "reroute"     → reroute recommendation
      - "risk_score"  → ML risk score explanation
    """
    logger.info(
        "explain called — context_type=%s id=%s watsonx_enabled=%s",
        request.context_type,
        request.context_id,
        watsonx_client.is_configured,
    )

    # Build the prompt from verified facts
    prompt_builders = {
        "shipment": build_shipment_prompt,
        "disruption": build_disruption_prompt,
        "cold_chain": build_cold_chain_prompt,
        "reroute": build_reroute_prompt,
        "risk_score": build_risk_score_explanation_prompt,
    }

    builder = prompt_builders.get(request.context_type)
    if builder is None:
        logger.warning("Unknown context_type: %s", request.context_type)
        return ExplanationResponse(
            status="error",
            context_type=request.context_type,
            context_id=request.context_id,
            explanation=(
                f"Unknown context type '{request.context_type}'. "
                f"Supported: {', '.join(prompt_builders.keys())}."
            ),
            watsonx_enabled=watsonx_client.is_configured,
        )

    prompt = builder(request.facts)
    explanation = await watsonx_client.generate(prompt)

    return ExplanationResponse(
        status="ok",
        context_type=request.context_type,
        context_id=request.context_id,
        explanation=explanation,
        confidence=None,  # Granite greedy-decode — deterministic, no confidence score
        watsonx_enabled=watsonx_client.is_configured,
    )


@router.post("/risk-score", response_model=RiskScoreResponse)
async def predict_risk_score(request: RiskScoreRequest) -> RiskScoreResponse:
    """
    Compute an ML risk score for a shipment and optionally generate a
    watsonx.ai explanation of the top contributing factors.

    The score is a linear heuristic combination of verified feature signals.
    A full trained scikit-learn model replaces this in Phase 12 proper.
    """
    logger.info("risk-score called — shipment_id=%s", request.shipment_id)

    score, contributions = _compute_ml_risk(request)
    band = _risk_band(score)

    # Generate AI explanation if watsonx.ai is configured
    explanation: Optional[str] = None
    if watsonx_client.is_configured:
        facts = {
            "tracking_number": request.shipment_id,
            "ml_risk_score": score,
            "model_version": "heuristic-v1",
            "feature_contributions": {k: str(v) for k, v in contributions.items()},
        }
        explanation = await watsonx_client.generate(
            build_risk_score_explanation_prompt(facts),
            max_tokens=256,
        )

    return RiskScoreResponse(
        status="ok",
        shipment_id=request.shipment_id,
        ml_risk_score=score,
        risk_band=band,
        feature_contributions=contributions,
        explanation=explanation,
    )
