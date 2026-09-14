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

    # ── CORS (allow ASP.NET Core backend to call this service) ───────────────
    allowed_origins: List[str] = [
        "http://localhost:5000",
        "http://localhost:5001",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5001",
    ]

    # ── IBM watsonx.ai (Phase 13+) ────────────────────────────────────────────
    watsonx_api_key: str = ""
    watsonx_project_id: str = ""
    watsonx_url: str = "https://us-south.ml.cloud.ibm.com"
    watsonx_model_id: str = "ibm/granite-13b-instruct-v2"

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def watsonx_configured(self) -> bool:
        return bool(self.watsonx_api_key and self.watsonx_project_id)


settings = Settings()
