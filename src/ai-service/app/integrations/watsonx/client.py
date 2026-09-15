"""
SupplyShield AI — IBM watsonx.ai Client

Architecture rules (enforced here):
  - Only this module calls the IBM watsonx.ai SDK.
  - Receives VERIFIED structured facts assembled by calling code — never raw user input.
  - AI failure is handled gracefully: returns a safe fallback string, never raises.
  - IBM credentials are loaded from environment variables only; never hard-coded.

Phase 13: Real implementation using ibm-watsonx-ai SDK with IBM Granite model.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Generation parameters — tuned for grounded logistics explanations
# ---------------------------------------------------------------------------
_GENERATE_PARAMS: Dict[str, Any] = {
    "max_new_tokens": 512,
    "min_new_tokens": 20,
    "decoding_method": "greedy",
    "repetition_penalty": 1.05,
    "stop_sequences": ["###", "\n\n\n"],
}


class WatsonxClient:
    """
    IBM watsonx.ai client wrapper (Phase 13).

    Lazily initialises the IBM ModelInference object on first use so that the
    service can start without credentials configured (returns a safe fallback).
    """

    def __init__(self) -> None:
        self._model: Optional[Any] = None

    # ── Public helpers ───────────────────────────────────────────────────────

    @property
    def is_configured(self) -> bool:
        """True when the mandatory watsonx env-vars are present."""
        return settings.watsonx_configured

    # ── Internal initialisation ──────────────────────────────────────────────

    def _get_model(self) -> Any:
        """
        Returns a cached ModelInference instance.
        Raises RuntimeError if credentials are not configured.
        """
        if self._model is not None:
            return self._model

        if not self.is_configured:
            raise RuntimeError("watsonx.ai credentials not configured.")

        try:
            from ibm_watsonx_ai.foundation_models import ModelInference
            from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
            from ibm_watsonx_ai import Credentials

            credentials = Credentials(
                url=settings.watsonx_url,
                api_key=settings.watsonx_api_key,
            )

            self._model = ModelInference(
                model_id=settings.watsonx_model_id,
                credentials=credentials,
                project_id=settings.watsonx_project_id,
                params=_GENERATE_PARAMS,
            )
            logger.info(
                "WatsonxClient initialised — model=%s project=%s url=%s",
                settings.watsonx_model_id,
                settings.watsonx_project_id,
                settings.watsonx_url,
            )
        except ImportError as exc:
            raise RuntimeError(
                "ibm-watsonx-ai package not installed. "
                "Run: pip install ibm-watsonx-ai>=1.1.0"
            ) from exc

        return self._model

    # ── Core generation ──────────────────────────────────────────────────────

    async def generate(self, prompt: str, max_tokens: int = 512) -> str:
        """
        Send a verified-facts prompt to the IBM Granite model and return the
        generated text.  Falls back to a safe placeholder on any error so that
        the main API never crashes due to an AI failure.

        Args:
            prompt: A prompt assembled entirely from verified backend facts.
            max_tokens: Upper bound on generated tokens (overrides default).

        Returns:
            The model's generated text, or a safe fallback string.
        """
        if not self.is_configured:
            logger.warning(
                "watsonx.ai not configured — returning placeholder. "
                "Set WATSONX_API_KEY and WATSONX_PROJECT_ID."
            )
            return (
                "AI explanation not available. "
                "Configure WATSONX_API_KEY and WATSONX_PROJECT_ID to enable IBM watsonx.ai."
            )

        try:
            model = self._get_model()

            # Override max_new_tokens if the caller requested a different limit
            params = dict(_GENERATE_PARAMS)
            params["max_new_tokens"] = max_tokens

            # The SDK's generate_text is synchronous; run it directly
            # (FastAPI handles blocking via the thread pool when called from async endpoints)
            result: str = model.generate_text(prompt=prompt, params=params)
            return result.strip() if result else "No explanation generated."

        except Exception as exc:  # noqa: BLE001
            logger.error("watsonx.ai generation failed: %s", exc, exc_info=True)
            return (
                f"AI explanation temporarily unavailable. "
                f"Please retry or contact support. (Error: {type(exc).__name__})"
            )


# Singleton — one client per process
watsonx_client = WatsonxClient()
