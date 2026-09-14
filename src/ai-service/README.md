# SupplyShield AI — Python AI Service

Separate ML / AI explanation service. **This is NOT the primary backend** — that is ASP.NET Core.

## Responsibilities

- Receive structured facts from the ASP.NET Core backend
- Run ML predictions (scikit-learn) — Phase 12+
- Call IBM watsonx.ai (Granite) for grounded explanations — Phase 13+
- Return results to the ASP.NET Core backend

## Quick Start

```bash
# 1. Create virtual environment
python -m venv .venv

# 2. Activate
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment (no credentials needed for Phase 2)
cp .env.example .env

# 5. Start service
uvicorn app.main:app --reload --port 8001
```

Service: `http://localhost:8001`  
Health: `http://localhost:8001/health`  
Docs: `http://localhost:8001/docs`

## Running Tests

```bash
pytest tests/ -v
```

## Architecture Rule

This service only exposes prediction and explanation endpoints.
It does NOT perform CRUD operations on operational data.
The ASP.NET Core backend assembles verified facts before calling this service.

## Phase 2 Status

All endpoints return placeholder responses.
watsonx.ai client is a stub — no credentials required.
ML service is stubbed — no scikit-learn models yet.
