"""
SupplyShield AI — IBM watsonx.ai Client (AI Service)

Architecture rule:
  - Only this module calls the IBM SDK.
  - Receives VERIFIED structured facts from calling code.
  - NEVER receives raw user input.
  - AI failure handled gracefully — no crash.

Phase 2: Stub — no credentials required.
Phase 13+: Implement real watsonx.ai call.
"""
from __future__ import annotations
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class WatsonxClient:
    """
    IBM watsonx.ai client wrapper.
    Phase 2: Stub.
    Phase 13+: Initialise with WATSONX_API_KEY and WATSONX_PROJECT_ID.
    """

    def __init__(self) -> None:
        self._model = None

    @property
    def is_configured(self) -> bool:
        return settings.watsonx_configured

    async def generate(self, prompt: str, max_tokens: int = 512) -> str:
        """
        Call the Granite model with a verified-facts prompt.
        Phase 13+: Real implementation.
        """
        if not self.is_configured:
            logger.warning("watsonx.ai not configured — returning placeholder.")
            return "AI explanation not available. Set WATSONX_API_KEY and WATSONX_PROJECT_ID. (Phase 13+)"

        # Phase 13+:
        # from ibm_watsonx_ai.foundation_models import ModelInference
        # model = ModelInference(model_id=settings.watsonx_model_id, ...)
        # return model.generate_text(prompt=prompt)
        raise NotImplementedError("WatsonxClient.generate — Phase 13+")


watsonx_client = WatsonxClient()
