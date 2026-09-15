# SupplyShield AI — Solution Overview

## What We Built

SupplyShield AI is a supply-chain operations intelligence platform. It gives logistics operators a single command center to detect disruptions, score shipment risk, monitor cold-chain sensors, identify idle fleet assets, and receive grounded AI-powered explanations — all through a clean, layered ASP.NET Core / C# primary backend connected to IBM watsonx.ai via a separate Python AI service.

---

## How It Works — End to End

### 1. Disruption Intelligence
Active disruptions (weather, port congestion, customs delays, carrier issues, road closures) are stored in the `disruptions` table and linked to affected shipments via the `shipment_disruptions` join table. The `GET /api/disruptions` endpoint returns all active disruptions with affected shipment counts ordered by severity. The `GET /api/disruptions/{id}` endpoint returns full details including the list of affected shipments, their status, and per-shipment delay estimates.

**Status:** ✅ Implemented — data read endpoints are live. Automatic disruption-to-shipment linking algorithm (Phase 8) is not yet implemented.

### 2. Shipment Risk Scoring
Each shipment carries a `risk_score` (0.0–1.0) stored in the database. The seeded dataset includes realistic scores: SHP-2026-BIO9942 at 0.94 (Critical, cold-chain, affected by Suez and weather), SHP-2026-EU8821 at 0.885. The `GET /api/shipments` endpoint returns all shipments ordered by descending risk score. The Python AI service's `POST /predict/risk-score` endpoint provides a multi-signal heuristic ML score using: backend risk score, disruption count, max disruption severity, shipment priority, cold-chain flag, time pressure, and carrier reliability.

**Status:** ✅ Read API and ML risk scoring implemented. Automatic real-time re-scoring on new disruptions (Phase 8) is not yet implemented.

### 3. Cold-Chain Monitoring
Temperature sensors are tracked in the `sensors` table with configurable `min_temp_celsius` / `max_temp_celsius` thresholds per sensor. The `GET /api/cold-chain` endpoint returns all sensors ordered by current excursion severity. The `GET /api/cold-chain/{id}/readings` endpoint returns time-series temperature data. Cold-chain alerts with severity classification (Low / Medium / High / Critical) are stored in `cold_chain_alerts`. Alerts can be acknowledged via `POST /api/alerts/{id}/acknowledge`.

**Status:** ✅ Sensor data read, alert read, and alert acknowledge endpoints are live. Real-time temperature ingestion pipeline (Phase 11) is not yet implemented.

### 4. Fleet Redeployment
The `GET /api/fleet` endpoint returns all vehicles ordered by status, including carrier association. Vehicles with status `Idle` or `Available` are surfaced as redeployment candidates. The KPI endpoint (`GET /api/dashboard/kpis`) counts idle fleet assets in real time.

**Status:** ✅ Fleet read API is live. Ranked redeployment candidates algorithm with proximity and compatibility scoring (Phase 10) is not yet implemented.

### 5. IBM watsonx.ai Grounded Explanations
The Python AI service (`src/ai-service/`) integrates with IBM watsonx.ai via the `ibm-watsonx-ai` SDK. The `MultiProviderLLMClient` in `app/integrations/watsonx/client.py` supports four providers in priority order:
1. **Google Gemini** (free-tier via Google AI Studio)
2. **OpenAI** (gpt-4o-mini / gpt-3.5-turbo)
3. **IBM watsonx.ai** (Granite model — `ibm/granite-13b-instruct-v2`)
4. **Built-in Grounded Synthesizer** (zero-config domain-specific fallback — always available)

The ASP.NET Core backend assembles **verified structured facts** from the database and sends them to the Python service via HTTP. The Python service builds a prompt using one of five specialised prompt builders (`app/integrations/watsonx/prompts.py`) and calls the active provider. AI receives only verified data — it never has access to raw user input.

Available AI endpoints:
- `POST /api/ai/explain/shipment/{id}` — explains shipment risk status
- `POST /api/ai/explain/disruption/{id}` — analyses disruption operational impact
- `POST /api/ai/explain/cold-chain/{sensorId}` — analyses cold-chain excursion
- `POST /api/ai/recommend/reroute/{shipmentId}` — recommends reroute options

**Status:** ✅ Fully implemented. Works without any API keys via the built-in grounded synthesizer. Activates live AI by setting `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `WATSONX_API_KEY` in `src/ai-service/.env`.

### 6. Operator Confirmation and Audit Trail
The `POST /api/alerts/{id}/acknowledge` endpoint is the only state-mutation endpoint currently implemented. All other consequential actions (rerouting, fleet redeployment) require the human-confirmation → approval → `DecisionAudit` flow.

**Status:** ⚠️ Alert acknowledgement is implemented. Full recommendation approval workflow and DecisionAudit creation (Phase 9) are not yet implemented.

### 7. What-If Simulation
`GET /api/simulations` and `POST /api/simulations/run` endpoints exist as stubs.

**Status:** ❌ Not yet implemented (Phase 14).

### 8. Dashboard KPIs
`GET /api/dashboard/kpis` returns live aggregated metrics computed directly from the database:
- Total shipments
- Active disruptions
- At-risk shipments (status = AtRisk OR risk_score ≥ 0.7)
- Unacknowledged cold-chain alerts
- Idle fleet assets (status = Idle or Available)

**Status:** ✅ Implemented and live.

### 9. SignalR Realtime Updates
**Status:** ❌ Not yet implemented (Phase 15).

### 10. Authentication / Authorization
**Status:** ❌ Not yet implemented.

---

## Architecture Summary

```
React Frontend (TypeScript + Vite — port 5173)
       ↓  REST /api/*
ASP.NET Core 10 primary backend (C# — port 5000)
       ↓  EF Core                   ↓  HTTP POST /predict/* (verified facts only)
Supabase PostgreSQL         Python FastAPI AI Service (port 8001)
                                     ↓  Priority: Gemini → OpenAI → watsonx → Synthesizer
                             IBM watsonx.ai Granite / Gemini / OpenAI
```

See [`architecture.md`](architecture.md) for full diagrams.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| ASP.NET Core as primary backend | Clean Architecture with C# domain model, EF Core migrations, typed DTOs, strong DI |
| Python as a separate AI service | IBM SDK, scikit-learn, and ML dependencies stay isolated from the main API; ASP.NET Core does not import any AI SDK |
| Multi-provider LLM client | Works without any API keys (built-in synthesizer); upgrades to live AI by setting any provider key |
| Deterministic severity classification first | AI must not decide cold-chain severity — deterministic rules using per-sensor thresholds are more reliable |
| AI receives only verified structured facts | Prevents hallucinated recommendations referencing nonexistent entities (shipment IDs, routes, ETAs) |
| Human confirmation required for consequential actions | Enterprise operations require human oversight before any reroute, fleet change, or hold action |
| EF Core in-memory fallback | ASP.NET Core starts cleanly without PostgreSQL credentials; switches to Supabase when `DATABASE_URL` is set |
| Synthetic benchmark dataset | Pre-seeded carriers (Maersk, DHL, FedEx, MSC, Schenker), routes, vehicles, shipments, disruptions, and sensors for immediate demo |

---

## IBM Technologies Used

| Technology | Where Used | Status |
|---|---|---|
| **IBM watsonx.ai (Granite model)** | Python AI service — `_call_watsonx()` in `client.py`; activated when `WATSONX_API_KEY` + `WATSONX_PROJECT_ID` set | ✅ Implemented |
| **IBM Bob** | Primary development partner throughout the project — architecture, code generation, review, and documentation | ✅ Active |

---

## What is Not Yet Implemented

| Feature | Phase | Notes |
|---|---|---|
| Frontend connected to live backend API | Phase 6–7 | Frontend currently uses mock data; backend API is live |
| Disruption → shipment automatic linking algorithm | Phase 8 | Links exist in seeded data; real-time impact analysis not yet built |
| Recommendation approval + DecisionAudit creation | Phase 9 | Alert acknowledgement is the only mutation endpoint live |
| Ranked fleet redeployment algorithm | Phase 10 | Read API is live; scoring algorithm not implemented |
| Real-time cold-chain sensor ingestion | Phase 11 | Historical data can be seeded; streaming ingestion not implemented |
| Full scikit-learn ML model (trained) | Phase 12 | Heuristic risk scorer is live; trained model deferred |
| What-If simulation | Phase 14 | Stub endpoints exist |
| SignalR realtime push to frontend | Phase 15 | Not started |
| Authentication & authorization | Phase 16 | Not started |
