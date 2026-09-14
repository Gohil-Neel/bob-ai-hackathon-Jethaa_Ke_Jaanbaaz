/**
 * SupplyShield AI — Mock Data
 *
 * PHASE 2 ONLY. This data is used for UI development while the real API
 * is not yet implemented.
 *
 * Architecture rule:
 *   - Mock data must be imported only through services/api.ts.
 *   - React components must NEVER import mock data directly.
 *   - When the real API is ready, replace the service implementation only.
 *
 * Data represents realistic supply-chain scenarios.
 * It does NOT contain personal data or confidential information.
 */

import type {
  Shipment,
  Disruption,
  FleetAsset,
  Alert,
  ColdChainSensor,
  DashboardKpis,
} from '../../types/domain'

// ─── Shipments ────────────────────────────────────────────────────────────────

export const mockShipments: Shipment[] = [
  {
    id: 'shp-001',
    trackingNumber: 'SS-2024-0001',
    origin: 'Hamburg, Germany',
    destination: 'Chicago, USA',
    carrier: 'Maersk',
    status: 'AT_RISK',
    priority: 'HIGH',
    estimatedArrival: '2024-12-18T14:00:00Z',
    isColdChain: true,
    routeId: 'rte-001',
    riskScore: 0.82,
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-14T10:30:00Z',
  },
  {
    id: 'shp-002',
    trackingNumber: 'SS-2024-0002',
    origin: 'Shanghai, China',
    destination: 'Rotterdam, Netherlands',
    carrier: 'COSCO',
    status: 'IN_TRANSIT',
    priority: 'MEDIUM',
    estimatedArrival: '2024-12-22T09:00:00Z',
    isColdChain: false,
    routeId: 'rte-002',
    riskScore: 0.35,
    createdAt: '2024-12-03T07:00:00Z',
    updatedAt: '2024-12-14T06:00:00Z',
  },
  {
    id: 'shp-003',
    trackingNumber: 'SS-2024-0003',
    origin: 'Los Angeles, USA',
    destination: 'Tokyo, Japan',
    carrier: 'CMA CGM',
    status: 'DELAYED',
    priority: 'CRITICAL',
    estimatedArrival: '2024-12-20T16:00:00Z',
    isColdChain: true,
    routeId: 'rte-003',
    riskScore: 0.91,
    createdAt: '2024-11-28T10:00:00Z',
    updatedAt: '2024-12-14T11:00:00Z',
  },
  {
    id: 'shp-004',
    trackingNumber: 'SS-2024-0004',
    origin: 'Mumbai, India',
    destination: 'Dubai, UAE',
    carrier: 'Hapag-Lloyd',
    status: 'IN_TRANSIT',
    priority: 'LOW',
    estimatedArrival: '2024-12-16T12:00:00Z',
    isColdChain: false,
    routeId: 'rte-004',
    riskScore: 0.12,
    createdAt: '2024-12-08T09:00:00Z',
    updatedAt: '2024-12-14T08:00:00Z',
  },
  {
    id: 'shp-005',
    trackingNumber: 'SS-2024-0005',
    origin: 'Singapore',
    destination: 'Sydney, Australia',
    carrier: 'MSC',
    status: 'PENDING',
    priority: 'MEDIUM',
    estimatedArrival: '2024-12-25T08:00:00Z',
    isColdChain: false,
    routeId: null,
    riskScore: null,
    createdAt: '2024-12-13T15:00:00Z',
    updatedAt: '2024-12-13T15:00:00Z',
  },
]

// ─── Disruptions ─────────────────────────────────────────────────────────────

export const mockDisruptions: Disruption[] = [
  {
    id: 'dis-001',
    title: 'Severe Weather — North Atlantic',
    disruptionType: 'WEATHER',
    severity: 'CRITICAL',
    affectedRegion: 'North Atlantic Ocean',
    description:
      'Storm system causing significant wave heights and vessel deviations. Multiple carriers issuing force majeure notices.',
    startedAt: '2024-12-12T06:00:00Z',
    resolvedAt: null,
    isActive: true,
    affectedShipmentCount: 14,
    createdAt: '2024-12-12T06:00:00Z',
  },
  {
    id: 'dis-002',
    title: 'Port Congestion — Rotterdam',
    disruptionType: 'PORT_CONGESTION',
    severity: 'HIGH',
    affectedRegion: 'Rotterdam, Netherlands',
    description:
      'Berth availability reduced due to equipment maintenance. Expected 48–72 hour delays for all inbound vessels.',
    startedAt: '2024-12-10T00:00:00Z',
    resolvedAt: null,
    isActive: true,
    affectedShipmentCount: 8,
    createdAt: '2024-12-10T00:00:00Z',
  },
  {
    id: 'dis-003',
    title: 'Road Closure — Alpine Pass',
    disruptionType: 'ROAD_CLOSURE',
    severity: 'MEDIUM',
    affectedRegion: 'Brenner Pass, Austria/Italy',
    description:
      'Temporary road closure due to avalanche risk assessment. Alternative routing available via Fréjus Tunnel.',
    startedAt: '2024-12-13T08:00:00Z',
    resolvedAt: null,
    isActive: true,
    affectedShipmentCount: 3,
    createdAt: '2024-12-13T08:00:00Z',
  },
]

// ─── Fleet Assets ─────────────────────────────────────────────────────────────

export const mockFleetAssets: FleetAsset[] = [
  {
    id: 'flt-001',
    assetCode: 'TRK-0042',
    assetType: 'Refrigerated Truck',
    status: 'IDLE',
    capacityKg: 12000,
    currentLocation: 'Frankfurt, Germany',
    lastSeenAt: '2024-12-14T09:00:00Z',
    createdAt: '2023-03-15T00:00:00Z',
  },
  {
    id: 'flt-002',
    assetCode: 'TRK-0071',
    assetType: 'Dry Freight Truck',
    status: 'IDLE',
    capacityKg: 20000,
    currentLocation: 'Amsterdam, Netherlands',
    lastSeenAt: '2024-12-14T07:30:00Z',
    createdAt: '2022-07-20T00:00:00Z',
  },
  {
    id: 'flt-003',
    assetCode: 'VAN-0015',
    assetType: 'Cargo Van',
    status: 'IN_USE',
    capacityKg: 3500,
    currentLocation: 'Brussels, Belgium',
    lastSeenAt: '2024-12-14T11:00:00Z',
    createdAt: '2023-09-01T00:00:00Z',
  },
  {
    id: 'flt-004',
    assetCode: 'TRK-0089',
    assetType: 'Flatbed Truck',
    status: 'MAINTENANCE',
    capacityKg: 25000,
    currentLocation: 'Hamburg, Germany',
    lastSeenAt: '2024-12-12T14:00:00Z',
    createdAt: '2021-11-30T00:00:00Z',
  },
]

// ─── Cold-Chain Sensors ───────────────────────────────────────────────────────

export const mockColdChainSensors: ColdChainSensor[] = [
  {
    id: 'sns-001',
    sensorCode: 'SENSOR-A1',
    shipmentId: 'shp-001',
    minTempCelsius: 2,
    maxTempCelsius: 8,
    lastReadingCelsius: 10.4,
    lastReadingAt: '2024-12-14T10:45:00Z',
    status: 'EXCURSION',
    currentExcursionSeverity: 'HIGH',
    createdAt: '2024-12-01T08:00:00Z',
  },
  {
    id: 'sns-002',
    sensorCode: 'SENSOR-A2',
    shipmentId: 'shp-003',
    minTempCelsius: -20,
    maxTempCelsius: -15,
    lastReadingCelsius: -16.2,
    lastReadingAt: '2024-12-14T11:00:00Z',
    status: 'NORMAL',
    currentExcursionSeverity: null,
    createdAt: '2024-11-28T10:00:00Z',
  },
  {
    id: 'sns-003',
    sensorCode: 'SENSOR-B3',
    shipmentId: 'shp-001',
    minTempCelsius: 2,
    maxTempCelsius: 8,
    lastReadingCelsius: null,
    lastReadingAt: '2024-12-14T09:00:00Z',
    status: 'DATA_GAP',
    currentExcursionSeverity: null,
    createdAt: '2024-12-01T08:00:00Z',
  },
]

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const mockAlerts: Alert[] = [
  {
    id: 'alt-001',
    alertType: 'TEMPERATURE_EXCURSION',
    severity: 'HIGH',
    title: 'Temperature Excursion — SS-2024-0001',
    description:
      'Sensor SENSOR-A1 recorded 10.4°C (allowed: 2–8°C). Excursion duration: 45 minutes.',
    shipmentId: 'shp-001',
    sensorId: 'sns-001',
    disruptionId: null,
    isAcknowledged: false,
    acknowledgedAt: null,
    createdAt: '2024-12-14T10:00:00Z',
  },
  {
    id: 'alt-002',
    alertType: 'DISRUPTION',
    severity: 'CRITICAL',
    title: 'Active Disruption — North Atlantic Storm',
    description:
      '14 shipments affected by North Atlantic storm system. Carrier deviations in progress.',
    shipmentId: null,
    sensorId: null,
    disruptionId: 'dis-001',
    isAcknowledged: false,
    acknowledgedAt: null,
    createdAt: '2024-12-12T06:00:00Z',
  },
  {
    id: 'alt-003',
    alertType: 'DELAY',
    severity: 'HIGH',
    title: 'Significant Delay — SS-2024-0003',
    description:
      'Shipment delayed by 36 hours due to port congestion at Rotterdam.',
    shipmentId: 'shp-003',
    sensorId: null,
    disruptionId: 'dis-002',
    isAcknowledged: true,
    acknowledgedAt: '2024-12-14T09:00:00Z',
    createdAt: '2024-12-13T07:00:00Z',
  },
  {
    id: 'alt-004',
    alertType: 'DATA_GAP',
    severity: 'MEDIUM',
    title: 'Sensor Data Gap — SENSOR-B3',
    description:
      'No temperature readings received from SENSOR-B3 for the past 2 hours.',
    shipmentId: 'shp-001',
    sensorId: 'sns-003',
    disruptionId: null,
    isAcknowledged: false,
    acknowledgedAt: null,
    createdAt: '2024-12-14T09:00:00Z',
  },
]

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export const mockDashboardKpis: DashboardKpis = {
  totalShipments: 247,
  activeDisruptions: 3,
  atRiskShipments: 17,
  coldChainAlerts: 4,
  idleFleetAssets: 8,
  lastUpdated: '2024-12-14T11:00:00Z',
}
