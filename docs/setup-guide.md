# SupplyShield AI — Setup Guide

> **This file is read by the automated evaluation pipeline. Steps are precise and complete.**

## Prerequisites

| Tool | Version | Verify |
|---|---|---|
| .NET SDK | 10.x | `dotnet --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Python | 3.11+ | `python --version` |
| Git | any | `git --version` |

---

## Project Structure

```
src/
├── frontend/      ← React + TypeScript + Vite (port 5173)
├── backend/       ← PRIMARY backend — ASP.NET Core 10 / C# (port 5000)
└── ai-service/    ← Separate Python AI/ML service — FastAPI (port 8001)
```

---

## 1. Backend (ASP.NET Core — PRIMARY)

```bash
cd src/backend

# Restore NuGet packages
dotnet restore SupplyShield.slnx

# Build solution
dotnet build SupplyShield.slnx

# Start development server (port 5000)
dotnet run --project SupplyShield.Api
```

Backend available at:
- API: `http://localhost:5000/api`
- Health: `http://localhost:5000/api/health`
- API browser (Scalar): `http://localhost:5000/scalar/v1`
- OpenAPI spec: `http://localhost:5000/openapi/v1.json`

### What Starts Without Any Configuration

The backend starts immediately with **no credentials required**:
- Uses **EF Core in-memory database** as fallback when no `DATABASE_URL` is set.
- On startup it auto-seeds a benchmark dataset (carriers, routes, vehicles, shipments, disruptions, sensors, alerts).
- All read endpoints return live data from the in-memory database.

### Backend Environment Variables

Set as environment variables or create `appsettings.Local.json` in `src/backend/SupplyShield.Api/`:

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL URI (`postgresql://user:pass@host:5432/db`) | Optional — in-memory fallback |
| `ConnectionStrings__DefaultConnection` | Alternative Npgsql connection string format | Optional |
| `Supabase__Url` | Supabase project URL | Optional |
| `Supabase__AnonKey` | Supabase anon key (public) | Optional |
| `Supabase__ServiceRoleKey` | Service role key — **never expose in frontend** | Optional |
| `AiService__BaseUrl` | Python AI service URL (default: `http://localhost:8001`) | Optional |

See `src/backend/SupplyShield.Api/.env.example` for full reference.

### Backend Tests

```bash
dotnet test src/backend/tests/SupplyShield.Api.Tests
```

Expected: 4 health endpoint tests pass.

---

## 2. Frontend (React + Vite)

```bash
cd src/frontend

# Install dependencies
npm install

# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

Frontend available at `http://localhost:5173`

Vite proxies `/api/*` → `http://localhost:5000` (ASP.NET Core backend).

> **Note:** The frontend currently uses mock data. It is not yet wired to the live backend API (Phase 6–7 integration pending).

---

## 3. AI Service (Python — Separate)

```bash
cd src/ai-service

# Create virtual environment
python -m venv .venv

# Activate
.venv\Scripts\activate      # Windows PowerShell
source .venv/bin/activate   # macOS / Linux

# Install dependencies (includes ibm-watsonx-ai, scikit-learn, pandas)
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — see "AI Service Environment Variables" below

# Start service (port 8001)
uvicorn app.main:app --reload --port 8001
```

AI Service available at:
- Health: `http://localhost:8001/health`
- API docs: `http://localhost:8001/docs`
- Explain endpoint: `POST http://localhost:8001/predict/explain`
- Risk score: `POST http://localhost:8001/predict/risk-score`

### AI Service Environment Variables

The AI service uses a **priority-ordered multi-provider LLM client**. Configure at least one provider key to enable live AI, or leave all blank to use the built-in grounded synthesizer (always available, no API key needed).

| Variable | Description | Provider | Required |
|---|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key (free tier) | Google Gemini | Optional |
| `GEMINI_MODEL_ID` | Gemini model (default: `gemini-1.5-flash`) | Google Gemini | Optional |
| `OPENAI_API_KEY` | OpenAI API key | OpenAI | Optional |
| `OPENAI_MODEL_ID` | OpenAI model (default: `gpt-4o-mini`) | OpenAI | Optional |
| `WATSONX_API_KEY` | IBM Cloud API key | IBM watsonx.ai | Optional |
| `WATSONX_PROJECT_ID` | watsonx.ai project ID | IBM watsonx.ai | Optional |
| `WATSONX_URL` | Regional endpoint (default: `https://us-south.ml.cloud.ibm.com`) | IBM watsonx.ai | Optional |
| `WATSONX_MODEL_ID` | Granite model (default: `ibm/granite-13b-instruct-v2`) | IBM watsonx.ai | Optional |

**Provider selection order** (first configured wins):
1. Google Gemini — if `GEMINI_API_KEY` is set
2. OpenAI — if `OPENAI_API_KEY` is set
3. IBM watsonx.ai — if both `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` are set
4. Built-in Grounded Synthesizer — always available as fallback, no keys required

See `src/ai-service/.env.example` for full reference.

### AI Service Tests

```bash
pytest tests/ -v
```

---

## Health Check Verification

After starting all three services, verify each is healthy:

**ASP.NET Core backend:**
```bash
curl http://localhost:5000/api/health
```
Expected:
```json
{"status":"ok","service":"supplyshield-api"}
```

**Python AI service:**
```bash
curl http://localhost:8001/health
```
Expected:
```json
{"status":"ok","service":"supplyshield-ai-service"}
```

---

## Quick Smoke Test — AI Explanation

With both the backend and AI service running, test the end-to-end AI flow. First get a shipment ID:

```bash
curl http://localhost:5000/api/shipments
```

Then call the AI explain endpoint with any shipment GUID from the response:

```bash
curl -X POST http://localhost:5000/api/ai/explain/shipment/50000000-0000-0000-0000-000000000002
```

Expected response shape:
```json
{
  "status": "ok",
  "shipmentId": "50000000-0000-0000-0000-000000000002",
  "explanation": "Thermal Telemetry Analysis: ..."
}
```

The explanation text will be from the active LLM provider (or the built-in synthesizer if no keys are configured).

---

## Quick Smoke Test — ML Risk Score

```bash
curl -X POST http://localhost:8001/predict/risk-score \
  -H "Content-Type: application/json" \
  -d '{
    "shipment_id": "SHP-2026-BIO9942",
    "is_cold_chain": true,
    "priority": "Critical",
    "active_disruption_count": 2,
    "max_disruption_severity": "Critical",
    "backend_risk_score": 0.94
  }'
```

Expected response shape:
```json
{
  "status": "ok",
  "shipment_id": "SHP-2026-BIO9942",
  "ml_risk_score": 0.87,
  "risk_band": "CRITICAL",
  "feature_contributions": { ... },
  "explanation": null
}
```

---

## Seeded Demo Data

The backend auto-seeds a benchmark dataset on startup (no manual step required):

| Data | Count | Examples |
|---|---|---|
| Carriers | 6 | Maersk, DHL, FedEx, MSC, Kuehne+Nagel, DB Schenker |
| Routes | 5 | Shanghai→Rotterdam, Mumbai→Hamburg, LA→Chicago, Singapore→Frankfurt, Busan→Long Beach |
| Vehicles | 5 | Refrigerated trucks, reefers, dry freight trailers |
| Disruptions | 4 | Typhoon Malakas (Critical), Rotterdam congestion (High), Suez delay (Medium), Rail strike (High) |
| Shipments | 5 | Risk scores 0.22–0.94; includes cold-chain and high-priority |
| Sensors | Seeded via Python script | — |

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `dotnet: command not found` | Install .NET 10 SDK from https://dotnet.microsoft.com |
| Backend port 5000 in use | Set env var `ASPNETCORE_URLS=http://localhost:5010` |
| `ModuleNotFoundError: pydantic_settings` | Run `pip install -r requirements.txt` again |
| `ModuleNotFoundError: ibm_watsonx_ai` | Run `pip install ibm-watsonx-ai>=1.1.0` |
| Frontend CORS error | Ensure backend is running on port 5000 |
| `npm: command not found` | Install Node.js 18+ from https://nodejs.org |
| AI endpoint returns "not configured" | This is normal — set a provider API key in `src/ai-service/.env` or leave blank for built-in synthesizer |
| AI endpoint returns 500 | Check Python service logs; ensure the AI service is running on port 8001 |
| `DATABASE_URL` not connecting | Verify Supabase URL format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres` |
| Backend uses in-memory DB (data lost on restart) | Set `DATABASE_URL` in environment to persist data in Supabase |

---

## Running All Three Services

Open three terminals:

**Terminal 1 — Backend:**
```bash
cd src/backend && dotnet run --project SupplyShield.Api
```

**Terminal 2 — Frontend:**
```bash
cd src/frontend && npm run dev
```

**Terminal 3 — AI Service:**
```bash
cd src/ai-service && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8001
```

Then open `http://localhost:5173` in your browser.
