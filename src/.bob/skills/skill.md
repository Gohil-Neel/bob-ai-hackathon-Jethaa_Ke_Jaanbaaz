---
name: supplyshield-ai-developer
description: Develop and maintain SupplyShield AI from repository setup through database, data ingestion, backend, Command Center UI, disruption intelligence, fleet intelligence, cold-chain monitoring, grounded AI, simulation, testing, demo, and hackathon submission using IBM Bob, Supabase, FastAPI, React, and IBM watsonx.ai
---

# SupplyShield AI Developer Skill

## Mission

Act as the primary AI development partner for SupplyShield AI.

Build a real, reproducible, data-driven supply-chain operations proof of concept. Do not build only a static dashboard or a collection of mock screens.

Before major work, read the project problem statement, instructions, design specifications, submission guide, and this skill.

## Non-negotiable principles

- Inspect the repository before changing it.
- Follow the project's documented requirements over generic assumptions.
- Work phase-by-phase.
- Preserve working functionality.
- Use Supabase as the operational source of truth.
- Keep business logic in the backend/domain layer.
- Keep AI grounded in verified application data.
- Require explicit human approval for consequential operational actions.
- Never commit secrets.
- Test meaningful functionality.
- Keep documentation synchronized with implementation.
- Do not silently invent requirements, regulatory claims, data, or completed actions.

## Development order

```text
PHASE 0  Understand tools
PHASE 1  Create official repository
PHASE 2  Create application skeleton
PHASE 3  Design Supabase database
PHASE 4  Create realistic dataset
PHASE 5  Feed data into Supabase
PHASE 6  Build backend/API
PHASE 7  Build Command Center UI
PHASE 8  Build disruption intelligence
PHASE 9  Build fleet intelligence
PHASE 10 Build cold-chain monitoring
PHASE 11 Add grounded AI
PHASE 12 Add What-If simulation
PHASE 13 Integrate end-to-end
PHASE 14 Test
PHASE 15 Demo
PHASE 16 Submission
```

Do not implement future phases prematurely unless explicitly asked.

## Preferred stack

- React + TypeScript + Vite
- Python + FastAPI
- Supabase PostgreSQL
- IBM watsonx.ai + appropriate Granite model
- Git + GitHub
- Recharts or equivalent
- MapLibre or Leaflet

Avoid unnecessary dependencies.

## Architecture

```text
Operator
  ↓
React Frontend
  ↓ HTTP/JSON
FastAPI
  ↓
Domain Services / Rule Engine
  ↓
Supabase PostgreSQL

Verified backend facts
  ↓
Structured AI context
  ↓
watsonx.ai / Granite
  ↓
Explanation / recommendation
  ↓
Backend
  ↓
Frontend
```

The browser must never contain privileged Supabase or IBM credentials.

## Core entities

Use these conceptual entities unless the repository already defines a better compatible schema:

- shipments
- disruptions
- routes
- fleet_assets
- cold_chain_sensors
- temperature_readings
- alerts
- ai_insights
- recommendations
- simulations
- operator_actions

## Supply-chain intelligence

Disruption flow:

```text
Active disruption
→ affected route
→ affected shipments
→ risk calculation
→ alternative routes/carriers
→ ranked recommendation
```

Fleet flow:

```text
Idle fleet
→ affected shipments
→ proximity
→ capacity
→ availability
→ ranked redeployment recommendation
```

Cold-chain flow:

```text
Sensor reading
→ allowed-range check
→ excursion detection
→ duration
→ documented severity rule
→ alert
→ AI explanation
```

## AI rules

AI must never invent shipment IDs, route IDs, disruption facts, temperatures, costs, ETAs, or completed actions.

Backend should provide structured facts such as:

```json
{
  "disruption": {"name": "...", "severity": "...", "status": "Active"},
  "impact": {"affected_shipments": 0, "critical_shipments": 0},
  "recommendation": {"route": "...", "delay_hours": 0, "additional_cost": 0}
}
```

Prefer AI output structured as:

```text
Situation
Evidence
Recommendation
Expected impact
Confidence
```

Do not expose hidden chain-of-thought.

## Human approval

Consequential actions must follow:

```text
Recommendation
→ Review
→ Explicit confirmation
→ Backend action
→ Audit record
```

Never claim an action succeeded until the backend confirms it.

## Data

Use synthetic or explicitly permitted data.

Never use confidential company data, client data, personal information, social-media data, or data without permission.

Data ingestion must be reproducible:

```text
CSV/JSON
→ validate
→ transform
→ insert
→ verify
```

## IBM Bob usage

Use IBM Bob as a genuine development partner:

```text
READ → INSPECT → UNDERSTAND → PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT
```

Use Plan mode for complex features and Code/Agent mode for implementation.

Use Bob skills/project-level rules to standardize behavior.

Maintain the `bob_sessions/` submission evidence required by the hackathon. Before exporting, remove credentials/API keys from code and reports.

## Security

Never commit:

```text
.env
API keys
Supabase service-role keys
IBM Cloud credentials
watsonx credentials
passwords
tokens
```

Use `.env.example`.

## Completion report

After every meaningful task report:

```text
Current phase:
Task:
Files changed:
Implemented:
Data/API impact:
Tests performed:
Known limitations:
Next recommended step:
```
