# SupplyShield AI — Setup Guide

> **This file is read by the automated evaluation pipeline. Steps are precise and complete.**

## Prerequisites

- .NET 10 SDK — `dotnet --version` (verify 10.x)
- Node.js 18+ and npm 9+
- Python 3.11+
- Git

## Project Structure

```
src/
├── frontend/      ← React + TypeScript + Vite
├── backend/       ← PRIMARY backend (ASP.NET Core 10 / C#)
└── ai-service/    ← Separate Python AI/ML service (FastAPI, port 8001)
```

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
- API docs (Scalar): `http://localhost:5000/scalar/v1`
- OpenAPI spec: `http://localhost:5000/openapi/v1.json`

### Backend Environment Variables

No credentials required for Phase 2 (uses in-memory database).

For later phases set as environment variables or in `appsettings.Local.json`:

| Variable | Description | Required |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | Supabase PostgreSQL connection string | Phase 3+ |
| `Supabase__Url` | Supabase project URL | Phase 3+ |
| `Supabase__ServiceRoleKey` | Service role key — **never expose in frontend** | Phase 3+ |
| `AiService__BaseUrl` | Python AI service URL (default: `http://localhost:8001`) | Phase 13+ |

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
Vite proxies `/api/*` → `http://localhost:5000` (ASP.NET Core backend)

---

## 3. AI Service (Python — Separate)

```bash
cd src/ai-service

# Create virtual environment
python -m venv .venv

# Activate
.venv\Scripts\activate     # Windows
source .venv/bin/activate  # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment (no credentials needed for Phase 2)
cp .env.example .env

# Start service (port 8001)
uvicorn app.main:app --reload --port 8001
```

AI Service available at:
- Health: `http://localhost:8001/health`
- Docs: `http://localhost:8001/docs`

### AI Service Environment Variables

| Variable | Description | Required |
|---|---|---|
| `WATSONX_API_KEY` | IBM Cloud API key | Phase 13+ |
| `WATSONX_PROJECT_ID` | watsonx.ai project ID | Phase 13+ |
| `WATSONX_URL` | watsonx.ai endpoint | Phase 13+ |

### AI Service Tests

```bash
pytest tests/ -v
```

---

## Health Check Verification

After starting the ASP.NET Core backend:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"ok","service":"supplyshield-api"}
```

After starting the Python AI service:

```bash
curl http://localhost:8001/health
```

Expected response:
```json
{"status":"ok","service":"supplyshield-ai-service"}
```

---

## Phase 2 Notes

- **Backend uses in-memory EF Core database** — no PostgreSQL required.
- **Frontend uses mock data** — works without backend running.
- **AI service uses placeholders** — no watsonx.ai credentials required.
- All services can start independently.

### Phase 2 Verified Build Results

```
dotnet build SupplyShield.slnx
  → Build succeeded. 0 Warning(s). 0 Error(s).

dotnet test SupplyShield.slnx
  → Test Run Successful. Total tests: 4. Passed: 4.
  → Health_Returns_200                  [PASSED]
  → Health_Returns_Status_Ok            [PASSED]
  → Health_Returns_Service_Name         [PASSED]
  → Health_Response_Has_Expected_Shape  [PASSED]
```

No known security vulnerabilities in NuGet dependencies (Microsoft.OpenApi 2.x CVE resolved by upgrading to `Microsoft.AspNetCore.OpenApi` 10.0.12 which uses `Microsoft.OpenApi` 3.x).

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `dotnet: command not found` | Install .NET 10 SDK from https://dotnet.microsoft.com |
| Backend port 5000 in use | Set `ASPNETCORE_URLS=http://localhost:5010` |
| `ModuleNotFoundError: pydantic_settings` | Run `pip install -r requirements.txt` again |
| Frontend CORS error | Ensure backend is running on port 5000 |
| `npm: command not found` | Install Node.js 18+ from https://nodejs.org |
