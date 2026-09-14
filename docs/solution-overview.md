# SupplyShield AI — Solution Overview

## What We Built

SupplyShield AI is a supply-chain operations intelligence platform. It gives logistics operators a single command center to detect disruptions, score shipment risk, monitor cold-chain sensors, identify idle fleet assets, and receive AI-powered grounded recommendations from IBM watsonx.ai — all through a clean, layered ASP.NET Core / C# primary backend.

## How It Works

1. **Disruptions are detected** — active weather, port congestion, road closures, and carrier issues are tracked and linked to affected routes and shipments.

2. **Shipments are risk-scored** — each shipment receives a deterministic risk score combining disruption severity, shipment priority, expected delay, cold-chain state, and route risk. AI does not set the score.

3. **Cold-chain sensors report in real time** — temperature readings are compared against per-sensor configured thresholds. Excursions trigger severity classification (MEDIUM/HIGH/CRITICAL) using deterministic rules.

4. **Idle fleet assets are surfaced** — vehicles in IDLE or AVAILABLE status are ranked for redeployment by compatibility, capacity, and proximity.

5. **IBM watsonx.ai generates grounded explanations** — the ASP.NET Core backend assembles verified facts and sends them to the Python AI service via HTTP. The Python service calls the Granite model. Responses are returned to the backend and then the frontend.

6. **Operators confirm before acting** — no consequential action can be applied without explicit operator confirmation. Every approval creates a `DecisionAudit` record.

7. **What-If simulations** — operators compare current vs proposed plans (ETA, cost, risk) without touching live operational state.

## Architecture Diagram

See [`architecture.md`](architecture.md) for the full diagram.

```
React Frontend
      ↓ HTTP
ASP.NET Core primary backend (C#)
      ↓ EF Core                    ↓ HTTP (verified facts only)
Supabase PostgreSQL         Python AI Service (FastAPI)
                                    ↓ IBM SDK
                            IBM watsonx.ai (Granite)
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| ASP.NET Core as primary backend | Clean Architecture, typed C# domain model, EF Core migrations, strong DI |
| Python as separate AI service | Keeps IBM/ML dependencies isolated; ASP.NET Core does not import IBM SDK |
| Deterministic severity first | AI must not decide cold-chain severity — rules-based classification is more reliable |
| AI receives only verified facts | Prevents hallucinated recommendations referencing nonexistent entities |
| Human confirmation required | Enterprise operations require human oversight before consequential actions |
| EF Core in-memory for Phase 2 | Application starts cleanly without PostgreSQL credentials |
| Mock data isolated in frontend | Phase 2 UI works without a running backend |

## IBM Technologies Used

- **IBM watsonx.ai (Granite models):** Used for grounded natural-language explanations. The Python AI service receives verified structured facts from the ASP.NET Core backend and calls the Granite model. AI never invents operational data.
- **IBM Bob:** Used as the primary development partner throughout the project — planning architecture, generating code, reviewing implementations, and maintaining architectural discipline.

## Known Limitations (Phase 2)

- Frontend uses mock data — not connected to ASP.NET Core backend
- Backend API routes return placeholder responses — services not yet implemented
- EF Core uses in-memory database — no PostgreSQL schema yet (Phase 3)
- watsonx.ai integration is a stub — no AI calls yet (Phase 13+)
- SignalR realtime updates not yet implemented (Phase 15+)
- Authentication and authorization not yet implemented
- Disruption intelligence algorithms deferred (Phase 8)
- Fleet redeployment algorithm deferred (Phase 10)
- Cold-chain excursion engine deferred (Phase 11)
- ML predictions (scikit-learn) deferred (Phase 12)
