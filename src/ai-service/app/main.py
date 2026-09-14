"""
SupplyShield AI — Python AI Service Entry Point

This is the SEPARATE AI/ML service.
It is NOT the primary application backend (that is ASP.NET Core).

Responsibilities:
  - Receive structured facts from the ASP.NET Core backend
  - Run ML predictions (scikit-learn) — Phase 12+
  - Call IBM watsonx.ai for grounded explanations — Phase 13+
  - Return results to the ASP.NET Core backend

Architecture rule:
  - This service does NOT expose operational CRUD endpoints.
  - It only exposes prediction / explanation endpoints.
  - It receives VERIFIED structured facts — never raw user input.
  - It never returns data that directly mutates operational state.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import configure_logging
from app.api.routes import health, predictions

configure_logging()

app = FastAPI(
    title="SupplyShield AI — Python AI Service",
    description="ML predictions and IBM watsonx.ai explanations for SupplyShield AI",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS — allow the ASP.NET Core backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(predictions.router, prefix="/predict", tags=["predictions"])
