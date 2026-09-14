# SupplyShield AI UI/UX Guide

## Product
Enterprise logistics operations command center.

Personality:
- operational
- precise
- intelligent
- high-information
- calm under pressure
- action-oriented

## Stack
React + TypeScript frontend.
ASP.NET Core Web API + C# primary backend.
Python + FastAPI AI/ML service.
PostgreSQL/Supabase database.
SignalR for realtime where needed.

## Navigation
- Command Center
- Disruptions
- Shipments
- Recovery Planner
- Fleet Intelligence
- Cold Chain
- AI Insights
- Scenario Simulator
- Audit / Reports
- Settings

## Command Center
Header → KPI row → map + disruptions → priority actions/shipments → cold-chain/fleet/AI.

KPIs:
- Total Shipments
- Active Disruptions
- At-Risk Shipments
- Cold-Chain Alerts
- Idle Fleet Assets

Clearly label LIVE, SIMULATED, SYNTHETIC and HISTORICAL data.

## Screens
Disruptions: severity, status, location, affected routes/shipments, impact.
Shipment Detail: route, ETA, risk, timeline, sensor status, recommendations, history.
Recovery Planner: route/carrier, ETA, cost, risk, feasibility, score, reason.
Fleet Intelligence: availability, capacity, location, compatibility, recommendation.
Cold Chain: configured range, readings, excursion window, duration, severity, evidence.
AI Insights: situation, evidence, explanation, confidence/limitations.
Scenario Simulator: inputs, baseline, simulated result, impact delta.
Audit: action, recommendation, operator, timestamp, previous/new state, reason.

## Approval UX
Recommendation → Review → Explicit Confirmation → Action → Success → Audit.
Never hide consequential actions behind an AI response.

## Visual System
Dark enterprise operations aesthetic, clear hierarchy, restrained decoration and centralized design tokens. Base spacing may use a 4px scale.

Severity:
NORMAL / LOW / MEDIUM / HIGH / CRITICAL.

Do not rely on color alone.

## Maps
Use maps for spatial context. Use tables/lists for exact IDs, costs, ETAs and comparisons.

## Interaction
Prioritize scanning, progressive disclosure, filters, search, sortable tables and clear actions. Provide loading, empty and error states. Avoid unnecessary animation.

## Reusable Components
AppShell, Sidebar, TopBar, PageHeader, KpiCard, StatusBadge, DataTable, AlertCard, ShipmentCard, DisruptionCard, FleetAssetCard, ColdChainAlertCard, RecommendationCard, AIInsightCard, FilterBar, ConfirmationDialog, LoadingState, EmptyState, ErrorState, MapView, ChartCard.

## Accessibility
Do not rely on color alone. Use readable contrast, keyboard-accessible controls and meaningful labels.

## Golden Path
Command Center → Disruption → Affected Shipment → Recovery Planner → Recommendation → AI Explanation → What-If → Confirmation → Action → Monitoring → Audit.
