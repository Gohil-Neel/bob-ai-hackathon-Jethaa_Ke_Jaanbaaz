"""
SupplyShield AI — Predictions Routes (Phase 2 Placeholder)

These endpoints receive VERIFIED structured facts from the ASP.NET Core backend.
They NEVER receive raw user input.

Phase 2: Placeholder responses.
Phase 12+: Implement scikit-learn ML predictions.
Phase 13+: Implement IBM watsonx.ai explanations.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict

router = APIRouter()


class ExplanationRequest(BaseModel):
    """Structured facts payload sent by the ASP.NET Core backend."""
    context_type: str  # "shipment" | "disruption" | "cold_chain"
    context_id: str
    facts: Dict[str, Any]


class ExplanationResponse(BaseModel):
    status: str
    explanation: str
    confidence: float | None = None


@router.post("/explain", response_model=ExplanationResponse)
async def explain(request: ExplanationRequest) -> ExplanationResponse:
    """
    Generate a grounded explanation for the given context.
    Phase 2: Placeholder.
    Phase 13+: Call IBM watsonx.ai with structured facts.
    """
    return ExplanationResponse(
        status="placeholder",
        explanation=(
            f"AI explanation for {request.context_type} {request.context_id} — "
            "IBM watsonx.ai integration Phase 13+"
        ),
        confidence=None,
    )


@router.post("/risk-score")
async def predict_risk_score():
    """
    ML risk score prediction.
    Phase 2: Placeholder.
    Phase 12+: Implement scikit-learn model.
    """
    return {
        "status": "placeholder",
        "message": "Risk score prediction — Phase 12+",
        "score": None,
    }
