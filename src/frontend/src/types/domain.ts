/**
 * SupplyShield AI — Domain TypeScript Types
 *
 * Full TypeScript representations matching Supabase PostgreSQL tables and ASP.NET Core API DTOs.
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

// ─── Route & RouteSegment ───────────────────────────────────────────────────

export interface RouteSegment {
  id: string
  sequenceOrder: number
  fromLocation: string
  toLocation: string
  transportMode: string
  estimatedHours: number
}

export interface Route {
  id: string
  name: string
  origin: string
  destination: string
  carrierCode: string | null
  estimatedHours: number
  isActive: boolean
  segmentsCount?: number
  segments?: RouteSegment[]
  createdAt?: string
}

// ─── Carrier ──────────────────────────────────────────────────────────────────

export interface Carrier {
  id: string
  code: string
  name: string
  contactEmail: string | null
  isActive: boolean
  createdAt: string
}

// ─── Fleet Asset & Vehicle Assignment ─────────────────────────────────────────

export interface VehicleAssignment {
  id: string
  vehicleId: string
  shipmentId: string
  shipmentTrackingNumber?: string
  assignedAt: string
  releasedAt: string | null
  notes: string | null
}

export interface FleetAsset {
  id: string
  assetCode: string
  assetType: string
  status: FleetAssetStatus
  capacityKg: number
  currentLocation: string
  carrierId?: string | null
  carrierName?: string | null
  lastSeenAt: string | null
  createdAt: string
  assignments?: VehicleAssignment[]
}

// ─── Cold Chain ───────────────────────────────────────────────────────────────

export interface ColdChainSensor {
  id: string
  sensorCode: string
  shipmentId: string
  shipmentTrackingNumber?: string
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
  shipmentTrackingNumber?: string | null
  sensorId: string | null
  sensorCode?: string | null
  excursionPeakCelsius?: number
  allowedMinCelsius?: number
  allowedMaxCelsius?: number
  excursionStart?: string | null
  excursionEnd?: string | null
  durationMinutes?: number | null
  disruptionId: string | null
  isAcknowledged: boolean
  acknowledgedAt: string | null
  createdAt: string
}

// ─── AI Insight & Recommendation ──────────────────────────────────────────────

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

export interface Recommendation {
  id: string
  shipmentId: string
  shipmentTrackingNumber?: string
  shipmentOrigin?: string
  shipmentDestination?: string
  recommendationType: string
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

// ─── Decision Audit Log ───────────────────────────────────────────────────────

export interface DecisionAudit {
  id: string
  operatorId: string
  actionType: string
  targetEntityType: string
  targetEntityId: string
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'APPLIED' | 'CANCELLED'
  approvedAt: string
  appliedAt: string | null
  beforeStateJson: string | null
  afterStateJson: string | null
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

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardKpis {
  totalShipments: number
  activeDisruptions: number
  atRiskShipments: number
  coldChainAlerts: number
  idleFleetAssets: number
  lastUpdated: string
}
