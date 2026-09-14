# SupplyShield AI Development Checklist

## Architecture
- [ ] React + TypeScript
- [ ] ASP.NET Core Web API + C# is PRIMARY backend
- [ ] Entity Framework Core
- [ ] PostgreSQL/Supabase
- [ ] Python/FastAPI is ONLY AI/ML service
- [ ] IBM watsonx.ai
- [ ] SignalR where needed

## Phases
### 0–1 Foundation
- [ ] Read requirements/resources
- [ ] Official hackathon repository/template
- [ ] Required files preserved
- [ ] Architecture confirmed

### 2 Skeleton
- [ ] React frontend
- [ ] ASP.NET Core solution
- [ ] Api/Application/Domain/Infrastructure
- [ ] Python AI-service skeleton
- [ ] Routing
- [ ] API health
- [ ] Environment config
- [ ] Basic tests/builds

### 3 Database
- [ ] Supabase/PostgreSQL
- [ ] Core schema
- [ ] Relationships
- [ ] Keys/constraints
- [ ] Indexes
- [ ] EF Core configuration
- [ ] Reproducible migrations
- [ ] Validation
- [ ] No frontend service-role key

### 4–5 Data
- [ ] Synthetic dataset
- [ ] Shipments/routes/disruptions
- [ ] Vehicles/carriers
- [ ] Sensors/readings
- [ ] Cold-chain/recovery scenarios
- [ ] Seed/import scripts
- [ ] Validation and repeatability

### 6 Backend
- [ ] Domain model
- [ ] Application services
- [ ] EF Core/repositories
- [ ] Controllers/DTOs
- [ ] Validation/error handling
- [ ] Tests

### 7 UI
- [ ] Command Center
- [ ] KPIs/map/tables
- [ ] Disruptions
- [ ] Priority actions
- [ ] Cold-chain/fleet/AI panels
- [ ] Loading/empty/error states

### 8–10 Intelligence
- [ ] Disruption impact
- [ ] Affected shipments
- [ ] Recovery alternatives
- [ ] Route/carrier scoring
- [ ] Idle fleet ranking
- [ ] Approval/audit

### 11–13 AI/ML
- [ ] Cold-chain threshold/excursion engine
- [ ] Python ML service
- [ ] Model evaluation/versioning
- [ ] ASP.NET ↔ ML integration
- [ ] Grounded watsonx.ai
- [ ] AI response validation

### 14–15 Integration
- [ ] What-If simulation
- [ ] No live-state mutation during simulation
- [ ] SignalR/realtime
- [ ] End-to-end disruption → recovery flow

### 16–18 Final
- [ ] Unit/integration/API/database/frontend/E2E tests
- [ ] Security checks
- [ ] Deterministic demo scenario
- [ ] Screenshots/video/presentation
- [ ] Documentation
- [ ] Bob session evidence
- [ ] No secrets
- [ ] Public repository
- [ ] Validation green

## Bob Evidence
- [ ] Planning sessions
- [ ] Coding sessions
- [ ] Review sessions
- [ ] Task reports
- [ ] Screenshots
- [ ] Credentials removed before export
