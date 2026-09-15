"""
SupplyShield AI — AI Service Configuration

All settings loaded from environment variables.
Never hard-code secrets.
"""
from __future__ import annotations
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Service ──────────────────────────────────────────────────────────────
    app_env: str = "development"
    app_port: int = 8001   # AI service runs on 8001; ASP.NET Core runs on 5000

    # ── CORS (allow ASP.NET Core backend & React frontend to call this service)
    allowed_origins: List[str] = [
        "http://localhost:5000",
        "http://localhost:5001",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
    ]

    # ── Google Gemini API (100% Free Tier via Google AI Studio) ───────────────
    gemini_api_key: str = ""
    gemini_model_id: str = "gemini-1.5-flash"

    # ── OpenAI API ────────────────────────────────────────────────────────────
    openai_api_key: str = ""
    openai_model_id: str = "gpt-4o-mini"

    # ── IBM watsonx.ai (Phase 13+) ────────────────────────────────────────────
    watsonx_api_key: str = ""
    watsonx_project_id: str = ""
    watsonx_url: str = "https://us-south.ml.cloud.ibm.com"
    watsonx_model_id: str = "ibm/granite-13b-instruct-v2"

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key and self.gemini_api_key.strip())

    @property
    def openai_configured(self) -> bool:
        return bool(self.openai_api_key and self.openai_api_key.strip())

    @property
    def watsonx_configured(self) -> bool:
        return bool(self.watsonx_api_key and self.watsonx_project_id)

    @property
    def active_llm_provider(self) -> str:
        if self.gemini_configured:
            return "gemini"
        if self.openai_configured:
            return "openai"
        if self.watsonx_configured:
            return "watsonx"
        return "grounded_synthesizer"


settings = Settings()
