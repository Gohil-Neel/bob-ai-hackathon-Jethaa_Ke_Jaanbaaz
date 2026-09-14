/**
 * SupplyShield AI — API Service Layer
 *
 * All React components fetch data through this module only.
 * Phase 2: Returns mock data. Replace implementations in Phase 3+.
 *
 * Architecture rule:
 *   - Components import from this file, NEVER from mockData.ts directly.
 *   - When the real API is ready, only this file needs to change.
 */

import type {
  Shipment,
  Disruption,
  FleetAsset,
  Alert,
  ColdChainSensor,
  DashboardKpis,
} from '../types/domain'

import {
  mockShipments,
  mockDisruptions,
  mockFleetAssets,
  mockAlerts,
  mockColdChainSensors,
  mockDashboardKpis,
} from './mock/mockData'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// Simulate realistic async delay for mock data
function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardKpis(): Promise<DashboardKpis> {
  // Phase 3+: return fetch(`${BASE_URL}/api/dashboard/kpis`).then(r => r.json())
  await delay()
  return mockDashboardKpis
}

// ─── Shipments ────────────────────────────────────────────────────────────────

export async function getShipments(): Promise<Shipment[]> {
  // Phase 3+: return fetch(`${BASE_URL}/api/shipments`).then(r => r.json())
  await delay()
  return mockShipments
}

export async function getShipmentById(id: string): Promise<Shipment | null> {
  // Phase 3+: return fetch(`${BASE_URL}/api/shipments/${id}`).then(r => r.json())
  await delay()
  return mockShipments.find((s) => s.id === id) ?? null
}

// ─── Disruptions ──────────────────────────────────────────────────────────────

export async function getDisruptions(): Promise<Disruption[]> {
  // Phase 3+: return fetch(`${BASE_URL}/api/disruptions`).then(r => r.json())
  await delay()
  return mockDisruptions
}

export async function getDisruptionById(id: string): Promise<Disruption | null> {
  await delay()
  return mockDisruptions.find((d) => d.id === id) ?? null
}

// ─── Fleet ────────────────────────────────────────────────────────────────────

export async function getFleetAssets(): Promise<FleetAsset[]> {
  // Phase 3+: return fetch(`${BASE_URL}/api/fleet`).then(r => r.json())
  await delay()
  return mockFleetAssets
}

// ─── Cold Chain ───────────────────────────────────────────────────────────────

export async function getColdChainSensors(): Promise<ColdChainSensor[]> {
  // Phase 3+: return fetch(`${BASE_URL}/api/cold-chain`).then(r => r.json())
  await delay()
  return mockColdChainSensors
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function getAlerts(): Promise<Alert[]> {
  // Phase 3+: return fetch(`${BASE_URL}/api/alerts`).then(r => r.json())
  await delay()
  return mockAlerts
}

// Suppress unused import warning for BASE_URL in Phase 2
void BASE_URL
