# SupplyShield AI — Frontend

React + TypeScript + Vite application for supply-chain operations intelligence.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment (optional in Phase 2 — mock data is used)
cp .env.example .env

# Start development server
npm run dev
```

App will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Type Check

```bash
npm run typecheck
```

## Structure

```
src/
├── main.tsx              ← Entry point
├── App.tsx               ← BrowserRouter wrapper
├── styles/
│   └── globals.css       ← Design tokens + global reset
├── types/
│   └── domain.ts         ← All TypeScript domain interfaces
├── routes/
│   └── AppRoutes.tsx     ← React Router route definitions
├── layouts/
│   ├── AppShell.tsx      ← Main shell (sidebar + topbar + content)
│   ├── Sidebar.tsx       ← Left navigation sidebar
│   └── TopBar.tsx        ← Top header bar
├── components/           ← Reusable UI components
│   ├── PageHeader.tsx
│   ├── KpiCard.tsx
│   ├── StatusBadge.tsx
│   ├── AlertCard.tsx
│   ├── ShipmentCard.tsx
│   ├── MapPlaceholder.tsx
│   ├── LoadingState.tsx
│   ├── EmptyState.tsx
│   └── ErrorState.tsx
├── pages/                ← One file per route
│   ├── DashboardPage.tsx      → /dashboard
│   ├── ShipmentsPage.tsx      → /shipments
│   ├── ShipmentDetailPage.tsx → /shipments/:id
│   ├── DisruptionsPage.tsx    → /disruptions
│   ├── DisruptionDetailPage.tsx → /disruptions/:id
│   ├── FleetPage.tsx          → /fleet
│   ├── ColdChainPage.tsx      → /cold-chain
│   ├── AlertsPage.tsx         → /alerts
│   ├── AIInsightsPage.tsx     → /ai-insights
│   ├── SimulationsPage.tsx    → /simulations
│   ├── ReportsPage.tsx        → /reports
│   └── SettingsPage.tsx       → /settings
└── services/
    ├── api.ts            ← All API calls (mock in Phase 2)
    └── mock/
        └── mockData.ts   ← Phase 2 mock data (isolated)
```

## Phase 2 Notes

- Mock data is used for all API calls.
- The backend proxy is configured in `vite.config.ts` → `/api` → `localhost:8000`.
- When the real API is ready, only `services/api.ts` needs to be updated.
- Design tokens are in `styles/globals.css` as CSS custom properties.
