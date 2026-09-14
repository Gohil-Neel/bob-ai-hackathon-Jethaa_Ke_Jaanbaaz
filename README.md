# SupplyShield AI

> Enterprise supply-chain operations intelligence — ASP.NET Core primary backend, powered by IBM watsonx.ai

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | Jetha Ke Jaanbaaz |
| **Track** | AI |
| **Team Lead** | Neel Gohil — 26msit026@charusat.edu.in |
| **Members** | Jenish Jadav - 26msit036@charusat.edu.in |
| **Members** | Vaibhav Chavada - 26msit013@charusat.edu.in |
| **Members** | Jaimeen Gondaliya - 26msit030@charusat.edu.in |

> ⚠️ Update team names and emails before final submission.

---

## 🎯 Problem Statement

Supply chain operations teams face fragmented, reactive intelligence. When disruptions hit — storms, port congestion, customs delays — operators must manually cross-reference carrier data, route maps, and cargo sensitivity to determine which shipments are at risk. This takes 30–60 minutes per incident. Cold-chain excursions often go undetected until delivery when product is already compromised. Idle fleet assets sit unused because no system connects disrupted shipments with available nearby vehicles.

---

## 💡 Solution

SupplyShield AI is a supply-chain operations intelligence platform with an ASP.NET Core / C# primary backend. It gives logistics operators a single command center to detect disruptions, score shipment risk, monitor cold-chain sensors, identify idle fleet assets, and receive grounded recommendations from IBM watsonx.ai — where every consequential action requires explicit operator confirmation and creates an audit record.

---

## ✨ Key Features

- **Disruption Intelligence:** Active disruption detection with automatic identification of affected shipments and deterministic risk scoring
- **Cold-Chain Monitoring:** Temperature sensor tracking with excursion severity classification (MEDIUM/HIGH/CRITICAL) using configurable per-sensor policy thresholds
- **Fleet Redeployment:** Idle vehicle identification with redeployment candidates ranked by capacity, proximity, and compatibility
- **Grounded AI (watsonx.ai):** IBM Granite model receives only verified ASP.NET Core backend facts — never invents operational data
- **What-If Simulation:** Compare route/carrier alternatives (ETA, cost, risk) without mutating live operational state

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | C#, TypeScript, Python |
| **Primary Backend** | ASP.NET Core 10 / C# / Entity Framework Core |
| **AI/ML Service** | Python 3.11, FastAPI, scikit-learn |
| **Generative AI** | IBM watsonx.ai, IBM Granite |
| **IBM Tools** | IBM Bob |
| **Database** | Supabase PostgreSQL |
| **Frontend** | React 18, Vite, TypeScript, CSS Modules |
| **Other** | React Router v6, Recharts, xUnit, SignalR (Phase 15+) |

---

## 📁 Repository Structure

```
src/
├── frontend/                    ← React + TypeScript + Vite
├── backend/                     ← PRIMARY backend (ASP.NET Core / C#)
│   ├── SupplyShield.slnx
│   ├── SupplyShield.Api/
│   ├── SupplyShield.Application/
│   ├── SupplyShield.Domain/
│   ├── SupplyShield.Infrastructure/
│   └── tests/SupplyShield.Api.Tests/
└── ai-service/                  ← Python AI/ML service (FastAPI)
```

---

## ⚡ How to Run

### Primary Backend (ASP.NET Core)

```bash
cd src/backend
dotnet restore SupplyShield.slnx
dotnet run --project SupplyShield.Api
```

Backend: `http://localhost:5000/api`  
Health: `http://localhost:5000/api/health`  
Swagger: `http://localhost:5000/swagger`

### Frontend

```bash
cd src/frontend
npm install && npm run dev
```

Frontend: `http://localhost:5173` (proxies `/api` → `localhost:5000`)

### AI Service (Python)

```bash
cd src/ai-service
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

> Full instructions in [`docs/setup-guide.md`](docs/setup-guide.md)

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- Phase 2 skeleton only — frontend uses mock data, backend returns placeholder responses
- Supabase database schema not yet implemented (Phase 3+)
- IBM watsonx.ai integration is a stub (Phase 13+)
- ASP.NET Core service implementations deferred (Phase 6+)
- ML predictions (scikit-learn) deferred (Phase 12+)
- SignalR realtime updates deferred (Phase 15+)
- Authentication and authorization not yet implemented

---

## 🏅 What We're Most Proud Of

The clean architectural separation between the primary ASP.NET Core backend, the isolated Python AI service, and the IBM watsonx.ai grounding rules. The ASP.NET Core backend never imports IBM SDK dependencies — all AI calls flow through verified structured facts to the Python service. This prevents hallucinated recommendations in an enterprise operations context where incorrect advice could cause major supply-chain or cold-chain failures.
