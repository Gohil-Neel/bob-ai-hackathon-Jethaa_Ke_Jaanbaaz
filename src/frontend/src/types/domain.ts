/**
 * SupplyShield AI — Domain TypeScript Types
 *
 * These types define the application's core domain model.
 * They mirror the backend Pydantic schemas and the planned database schema.
 * All entities use string UUIDs as IDs consistently.
 *
 * Phase 2: Types defined and used by mock data and component props.
 * Phase 3+: Connected to real API responses from FastAPI backend.
 */

// ─── Enumerations ────────────────────────────────────────────────────────────

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ShipmentStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'DELAYED'
  | 'AT_RISK'
  | 'DELIVERED'
  | 'CANCELLED'

export type DisruptionType =
  | 'WEATHER'
  | 'PORT_CONGESTION'
  | 'ROAD_CLOSURE'
  | 'CUSTOMS_DELAY'
  | 'CARRIER_ISSUE'
  | 'POLITICAL'
  | 'OTHER'

export type FleetAssetStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'IDLE'

export type AlertType =
  | 'TEMPERATURE_EXCURSION'
  | 'DISRUPTION'
  | 'DELAY'
  | 'DATA_GAP'
  | 'SYSTEM'

export type ColdChainStatus = 'NORMAL' | 'EXCURSION' | 'RECOVERING' | 'DATA_GAP'

// ─── Shipment ─────────────────────────────────────────────────────────────────

export interface Shipment {
  id: string
  trackingNumber: string
  origin: string
  destination: string
  carrier: string
  status: ShipmentStatus
  priority: SeverityLevel
  estimatedArrival: string | null  // ISO 8601 date string
  isColdChain: boolean
  routeId: string | null
  riskScore: number | null         // 0.0 – 1.0
  createdAt: string
  updatedAt: string
}

// ─── Disruption ───────────────────────────────────────────────────────────────

export interface Disruption {
  id: string
  title: string
  disruptionType: DisruptionType
  severity: SeverityLevel
  affectedRegion: string
  description: string
  startedAt: string               // ISO 8601
  resolvedAt: string | null
  isActive: boolean
  affectedShipmentCount: number
  createdAt: string
}

// ─── Route ────────────────────────────────────────────────────────────────────

export interface Route {
  id: string
  name: string
  origin: string
  destination: string
  waypoints: string[]
  estimatedHours: number
  carrier: string
  isActive: boolean
}

// ─── Fleet Asset ──────────────────────────────────────────────────────────────

export interface FleetAsset {
  id: string
  assetCode: string
  assetType: string
  status: FleetAssetStatus
  capacityKg: number
  currentLocation: string
  lastSeenAt: string | null
  createdAt: string
}

// ─── Cold Chain ───────────────────────────────────────────────────────────────

export interface ColdChainSensor {
  id: string
  sensorCode: string
  shipmentId: string
  minTempCelsius: number
  maxTempCelsius: number
  lastReadingCelsius: number | null
  lastReadingAt: string | null
  status: ColdChainStatus
  currentExcursionSeverity: SeverityLevel | null
  createdAt: string
}

export interface TemperatureReading {
  id: string
  sensorId: string
  temperatureCelsius: number
  recordedAt: string              // ISO 8601
  isExcursion: boolean
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export interface Alert {
  id: string
  alertType: AlertType
  severity: SeverityLevel
  title: string
  description: string
  shipmentId: string | null
  sensorId: string | null
  disruptionId: string | null
  isAcknowledged: boolean
  acknowledgedAt: string | null
  createdAt: string
}

// ─── AI Insight ───────────────────────────────────────────────────────────────

export interface AIInsight {
  id: string
  contextType: 'shipment' | 'disruption' | 'cold_chain' | 'fleet' | 'simulation'
  contextId: string
  explanation: string
  confidence: number | null       // 0.0 – 1.0
  recommendations: string[]
  evidenceSources: string[]
  modelId: string
  createdAt: string
}

// ─── Recommendation ───────────────────────────────────────────────────────────

export interface Recommendation {
  id: string
  shipmentId: string
  recommendationType: 'REROUTE' | 'CARRIER_CHANGE' | 'FLEET_REDEPLOY' | 'HOLD'
  title: string
  rationale: string
  severity: SeverityLevel
  confidence: number | null
  proposedRouteId: string | null
  proposedCarrier: string | null
  proposedFleetAssetId: string | null
  estimatedTimeSavingMinutes: number | null
  estimatedCostDeltaUsd: number | null
  requiresApproval: boolean
  createdAt: string
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export interface SimulationScenario {
  shipmentId: string
  proposedRouteId?: string
  proposedCarrier?: string
  description: string
}

export interface Simulation {
  id: string
  scenario: SimulationScenario
  currentEta: string | null
  alternativeEta: string | null
  estimatedCostDeltaUsd: number | null
  riskDelta: string | null
  recommendation: string
  createdAt: string
}

// ─── Operator Action ─────────────────────────────────────────────────────────

export interface OperatorAction {
  id: string
  operatorId: string
  actionType: string
  targetEntityType: string
  targetEntityId: string
  description: string
  approvedAt: string
  appliedAt: string | null
  isApplied: boolean
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardKpis {
  totalShipments: number
  activeDisruptions: number
  atRiskShipments: number
  coldChainAlerts: number
  idleFleetAssets: number
  lastUpdated: string
}
