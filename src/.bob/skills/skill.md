---
name: supplyshield-ai-developer
description: Develop SupplyShield AI with React, ASP.NET Core/C#, PostgreSQL/Supabase, Python/FastAPI for AI/ML, and IBM watsonx.ai
---

# SupplyShield AI Developer Skill

## Architecture
- Frontend: React + TypeScript.
- PRIMARY backend: ASP.NET Core Web API + C# + Entity Framework Core.
- Database: PostgreSQL, hosted using Supabase.
- AI/ML: Python + FastAPI + pandas + scikit-learn as a SEPARATE service.
- GenAI: IBM watsonx.ai.
- Realtime: ASP.NET Core SignalR where useful.

**Never replace the primary ASP.NET Core backend with FastAPI.**

## .NET Structure
`src/backend/`
- `SupplyShield.Api/` — HTTP/controllers/SignalR
- `SupplyShield.Application/` — use cases, workflows, DTOs, validation
- `SupplyShield.Domain/` — entities and core business rules
- `SupplyShield.Infrastructure/` — EF Core, PostgreSQL/Supabase, repositories, integrations
- `SupplyShield.sln`

Keep business logic out of controllers.

## AI Service
`src/ai-service/`
- `app/`
- `models/`
- `training/`

Use Python/FastAPI only for ML, anomaly detection and prediction workloads.

## Core Domain
Shipment, Route, RouteSegment, Disruption, ShipmentDisruption, Vehicle, Carrier, VehicleAssignment, Sensor, SensorReading, ColdChainAlert, RecoveryRecommendation, DecisionAudit, ModelPrediction.

## Product Flow
Disruption → Impact Analysis → Affected Shipments → Recovery Options → Route/Carrier Alternatives → Idle Fleet → Cold-Chain Risk → Recommendation → Human Approval → Action → Monitoring → Audit.

## AI Rules
Deterministic application logic is the source of operational truth.
ML handles prediction/anomaly detection.
watsonx.ai handles grounded explanations and operational Q&A.

Never invent IDs, costs, ETAs, sensor values, disruption facts or completed actions.
Consequential actions require: Recommendation → Human Review → Explicit Approval → Backend Action → Audit.
Never allow free-form LLM output to directly mutate critical state.

## Cold Chain
Keep deterministic temperature rules, ML anomaly detection and AI explanation separate. Do not present unsupported regulatory claims as authoritative.

## Database
Use PostgreSQL/Supabase with source-controlled migrations, keys, constraints and useful indexes. Never expose a Supabase service-role key to the frontend.

## Phases
0 Understand project/tools
1 Repository + baseline
2 Application skeleton
3 PostgreSQL/Supabase database
4 Synthetic dataset
5 Data ingestion/seeding
6 ASP.NET Core backend/API
7 Command Center UI
8 Disruption impact intelligence
9 Recovery planner
10 Fleet intelligence
11 Cold-chain monitoring
12 Python ML service
13 IBM watsonx.ai
14 What-If simulation
15 Realtime + end-to-end integration
16 Testing/security/hardening
17 Demo preparation
18 Hackathon submission

Never implement all phases together.

## Phase Workflow
When asked for a phase:
1. Inspect the current repository and previous phase.
2. Ask important questions specific to that phase.
3. Wait for answers.
4. Create a focused plan.
5. Get human approval.
6. Implement only that phase.
7. Test and review.
8. Update documentation.
9. Report completed, deferred and blocked work.

Do not silently change architecture. Explain significant architecture changes and wait for approval.

## Repository/Security
Preserve official hackathon files and template.
Do not modify `.github/workflows/validate.yml` unless officially required.
Never commit `.env`, passwords, API keys, Supabase service-role keys, IBM credentials or tokens. Use `.env.example`.

## Bob Workflow
Ask/Research → Plan → Human Review → Code → Test → Review → Commit.
Use Bob for meaningful planning, coding, review and documentation. Retain required Bob session evidence in `bob_sessions/` and remove credentials before export.

## Quality
Prefer simple, maintainable, testable, reproducible and demo-ready code. Avoid unnecessary complexity, duplicated logic, fake integrations, unsupported regulatory claims and premature optimization.
