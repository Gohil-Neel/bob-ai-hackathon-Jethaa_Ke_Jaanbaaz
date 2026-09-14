/**
 * SupplyShield AI — Integrations & IoT Gateway Hub
 *
 * Enterprise data pipeline & IoT telematics bridge:
 * - ERP / TMS / WMS bi-directional connectors (SAP S/4HANA, Oracle OTM, Manhattan WMS)
 * - Cold-chain IoT gateways (Sensitech, TempTale Ultra, Roambee LTE, Controlant)
 * - Live satellite data streams (AIS MarineTraffic, ADS-B FlightAware, ECMWF Ensemble Weather)
 * - Real-time sync health, latency pings & webhook event stream logs
 */

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationCategory = 'ERP_TMS_WMS' | 'IOT_TELEMATICS' | 'GEOSPATIAL_WEATHER' | 'COMMUNICATION';
type ConnectionStatus = 'CONNECTED' | 'SYNCING' | 'DEGRADED' | 'DISCONNECTED';

interface IntegrationConnector {
  id: string;
  name: string;
  category: IntegrationCategory;
  provider: string;
  icon: string;
  status: ConnectionStatus;
  lastSyncIso: string;
  latencyMs: number;
  uptimeRate: number; // e.g. 99.98%
  eventsProcessedToday: number;
  authType: string;
  endpointUrl: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CONNECTORS: IntegrationConnector[] = [
  {
    id: 'int-001',
    name: 'SAP S/4HANA Supply Chain Core',
    category: 'ERP_TMS_WMS',
    provider: 'SAP SE',
    icon: '🏢',
    status: 'CONNECTED',
    lastSyncIso: 'Just now (12s ago)',
    latencyMs: 42,
    uptimeRate: 99.99,
    eventsProcessedToday: 148200,
    authType: 'OAuth 2.0 / mTLS Mutual Auth',
    endpointUrl: 'https://api.supplyshield.internal/v2/sap/s4-sync',
  },
  {
    id: 'int-002',
    name: 'Sensitech TempTale Ultra IoT Cloud',
    category: 'IOT_TELEMATICS',
    provider: 'Sensitech Inc.',
    icon: '🌡️',
    status: 'CONNECTED',
    lastSyncIso: 'Just now (4s ago)',
    latencyMs: 18,
    uptimeRate: 99.95,
    eventsProcessedToday: 492100,
    authType: 'API Key + HMAC SHA-256',
    endpointUrl: 'https://telemetry.supplyshield.ai/iot/sensitech/v1',
  },
  {
    id: 'int-003',
    name: 'MarineTraffic Global AIS Live Feed',
    category: 'GEOSPATIAL_WEATHER',
    provider: 'Kpler / MarineTraffic',
    icon: '🚢',
    status: 'CONNECTED',
    lastSyncIso: 'Just now (1s ago)',
    latencyMs: 65,
    uptimeRate: 99.88,
    eventsProcessedToday: 820400,
    authType: 'WebSocket TLS 1.3 Stream',
    endpointUrl: 'wss://stream.marinetraffic.com/ais/v3/live',
  },
  {
    id: 'int-004',
    name: 'ECMWF High-Resolution Weather Ensemble',
    category: 'GEOSPATIAL_WEATHER',
    provider: 'European Centre for Medium-Range Weather Forecasts',
    icon: '🌪️',
    status: 'CONNECTED',
    lastSyncIso: '14 min ago',
    latencyMs: 110,
    uptimeRate: 99.92,
    eventsProcessedToday: 24000,
    authType: 'REST Bearer Token',
    endpointUrl: 'https://api.ecmwf.int/v1/ensemble/cyclone-models',
  },
  {
    id: 'int-005',
    name: 'Controlant Real-Time Logger Cloud',
    category: 'IOT_TELEMATICS',
    provider: 'Controlant hf.',
    icon: '📡',
    status: 'DEGRADED',
    lastSyncIso: '2h ago (Rate limited)',
    latencyMs: 840,
    uptimeRate: 98.4,
    eventsProcessedToday: 64200,
    authType: 'OAuth 2.0 Bearer',
    endpointUrl: 'https://api.controlant.com/pharma/v2/telemetry',
  },
  {
    id: 'int-006',
    name: 'PagerDuty & Twilio Emergency Bridge',
    category: 'COMMUNICATION',
    provider: 'PagerDuty / Twilio',
    icon: '🚨',
    status: 'CONNECTED',
    lastSyncIso: 'Continuous Webhook Listener',
    latencyMs: 24,
    uptimeRate: 100.0,
    eventsProcessedToday: 142,
    authType: 'Webhook Secret Verification',
    endpointUrl: 'https://api.supplyshield.ai/webhooks/pagerduty',
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; bg: string; text: string; border: string }> = {
  CONNECTED:    { label: '🟢 Live Connected', bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.35)' },
  SYNCING:      { label: '🔵 Sync in Progress', bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.35)' },
  DEGRADED:     { label: '🟡 Latency Degraded', bg: 'rgba(234,179,8,0.12)', text: '#facc15', border: 'rgba(234,179,8,0.35)' },
  DISCONNECTED: { label: '🔴 Offline', bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.35)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [connectors] = useState<IntegrationConnector[]>(MOCK_CONNECTORS);
  const [selectedConnector, setSelectedConnector] = useState<IntegrationConnector | null>(MOCK_CONNECTORS[0]);
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'ALL'>('ALL');

  const filtered = connectors.filter((c) => categoryFilter === 'ALL' || c.category === categoryFilter);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🔌</span>
            <h1 className="text-2xl font-extrabold text-white">Integrations & IoT Gateway Hub</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              5 of 6 Pipelines Healthy
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Enterprise ERP bi-directional sync, IoT telematics ingestion & live satellite tracking bridges
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Opening Webhook / REST API integration configuration wizard.')}
            className="text-sm px-4 py-2 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition-all"
          >
            + Connect New Pipeline
          </button>
        </div>
      </div>

      {/* ── Metric Highlights ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Ingested Events Today</div>
          <div className="text-3xl font-extrabold text-cyan-400">1.54M</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Across All IoT & AIS Webhooks</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Average Pipeline Latency</div>
          <div className="text-3xl font-extrabold text-green-400">38 ms</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Real-time sub-second SLA</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Active IoT Sensor Loggers</div>
          <div className="text-3xl font-extrabold text-purple-400">2,480</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Sensitech & Roambee Active Transponders</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Gateway Uptime (30d)</div>
          <div className="text-3xl font-extrabold text-white">99.96%</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Zero Unplanned Downtime</div>
        </div>
      </div>

      {/* ── Category Filters ── */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'ERP_TMS_WMS', 'IOT_TELEMATICS', 'GEOSPATIAL_WEATHER', 'COMMUNICATION'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all ${
              categoryFilter === cat ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {cat === 'ALL' ? 'All Pipelines (6)' : cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((connector) => {
            const isSelected = selectedConnector?.id === connector.id;
            const statusStyle = STATUS_CONFIG[connector.status];

            return (
              <div
                key={connector.id}
                onClick={() => setSelectedConnector(connector)}
                className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{
                  background: isSelected ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.025)',
                  border: isSelected ? '1.5px solid rgba(6,182,212,0.5)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {connector.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">{connector.name}</h3>
                      <div className="text-xs text-white/40">{connector.provider}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold inline-block" style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
                      {statusStyle.label}
                    </span>
                    <div className="text-xs font-mono text-white/40 mt-1">
                      {connector.latencyMs} ms latency
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-white/40">Sync: {connector.lastSyncIso}</span>
                  <span className="font-mono text-cyan-300">{connector.eventsProcessedToday.toLocaleString()} events today</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Pipeline Diagnostics Panel */}
        {selectedConnector && (
          <div className="p-6 rounded-2xl flex flex-col gap-5" style={{ background: 'rgba(10,12,20,0.97)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{selectedConnector.icon}</span>
                <h2 className="text-base font-extrabold text-white">{selectedConnector.name}</h2>
              </div>
              <div className="text-xs text-white/40">Provider: {selectedConnector.provider}</div>
            </div>

            {/* Health & Endpoint Parameters */}
            <div className="p-4 rounded-xl space-y-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">Connection Endpoint</div>
              <div className="text-xs font-mono break-all text-white/80 bg-black/40 p-2 rounded">
                {selectedConnector.endpointUrl}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Auth Architecture:</span>
                <span className="font-semibold text-white">{selectedConnector.authType}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Rolling 30d Uptime:</span>
                <span className="font-bold text-green-400">{selectedConnector.uptimeRate}%</span>
              </div>
            </div>

            {/* Diagnostics Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => alert(`Sending synthetic health check probe to ${selectedConnector.name}. Round-trip: ${selectedConnector.latencyMs}ms (HTTP 200 OK).`)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                ⚡ Execute Live Ping Diagnostic
              </button>
              <button
                onClick={() => alert(`Rotating TLS client certificate and secret keys for ${selectedConnector.name}.`)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                🔑 Rotate API Secret Keys
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
