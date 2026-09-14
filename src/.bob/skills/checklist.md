# SupplyShield AI Development Checklist

## Architecture
- [x] React + TypeScript
- [x] ASP.NET Core Web API + C# is PRIMARY backend
- [x] Entity Framework Core
- [x] PostgreSQL/Supabase
- [x] Python/FastAPI is ONLY AI/ML service
- [ ] IBM watsonx.ai
- [ ] SignalR where needed

## Phases
### 0–1 Foundation
- [x] Read requirements/resources
- [x] Official hackathon repository/template
- [x] Required files preserved
- [x] Architecture confirmed

### 2 Skeleton
- [x] React frontend
- [x] ASP.NET Core solution
- [x] Api/Application/Domain/Infrastructure
- [x] Python AI-service skeleton
- [x] Routing
- [x] API health
- [x] Environment config
- [x] Basic tests/builds

### 3 Database
- [x] Supabase/PostgreSQL
- [x] Core schema
- [x] Relationships
- [x] Keys/constraints
- [x] Indexes
- [x] EF Core configuration
- [x] Reproducible migrations
- [x] Validation
- [x] No frontend service-role key

### 4–5 Data
- [x] Synthetic dataset
- [x] Shipments/routes/disruptions
- [x] Vehicles/carriers
- [x] Sensors/readings
- [x] Cold-chain/recovery scenarios
- [x] Seed/import scripts
- [x] Validation and repeatability

### 6 Backend
- [x] Domain model
- [x] Application services
- [x] EF Core/repositories
- [x] Controllers/DTOs
- [x] Validation/error handling
- [x] Tests

### 7 UI
- [x] Command Center
- [x] KPIs/map/tables
- [x] Disruptions
- [x] Priority actions
- [x] Cold-chain/fleet/AI panels
- [x] Loading/empty/error states

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
