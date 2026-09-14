"""SupplyShield AI — AI Service Health Route"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check — verifies the AI service is running."""
    return HealthResponse(status="ok", service="supplyshield-ai-service")
