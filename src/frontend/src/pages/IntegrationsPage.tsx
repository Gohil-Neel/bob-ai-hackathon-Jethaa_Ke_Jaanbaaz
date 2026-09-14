/**
 * SupplyShield AI — Integrations & IoT Gateway Hub
 *
 * Telematics ingestion & ERP data pipeline status matching Stitch Design System:
 * - SAP S/4HANA, Sensitech, MarineTraffic AIS, ECMWF Weather connectors
 * - Webhook latency diagnostics & test ping triggers
 * - Stitch tokens: bg-bg-surface, bg-surface-container-lowest, material-symbols-outlined
 */

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationCategory = 'ERP_TMS_WMS' | 'IOT_TELEMATICS' | 'GEOSPATIAL_WEATHER' | 'COMMUNICATION';
type PipelineStatus = 'CONNECTED' | 'SYNCING' | 'DEGRADED';

interface IntegrationConnector {
  id: string;
  name: string;
  category: IntegrationCategory;
  provider: string;
  iconName: string;
  status: PipelineStatus;
  lastSyncIso: string;
  latencyMs: number;
  uptimeRate: number;
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
    iconName: 'domain',
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
    iconName: 'sensors',
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
    iconName: 'directions_boat',
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
    provider: 'ECMWF Weather Agency',
    iconName: 'cyclone',
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
    name: 'PagerDuty & Twilio Emergency Dispatch',
    category: 'COMMUNICATION',
    provider: 'PagerDuty / Twilio',
    iconName: 'notifications_active',
    status: 'CONNECTED',
    lastSyncIso: 'Continuous Webhook Listener',
    latencyMs: 24,
    uptimeRate: 100.0,
    eventsProcessedToday: 142,
    authType: 'Webhook Secret Signature',
    endpointUrl: 'https://api.supplyshield.ai/webhooks/pagerduty',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [connectors] = useState<IntegrationConnector[]>(MOCK_CONNECTORS);
  const [activeId, setActiveId] = useState<string>(MOCK_CONNECTORS[0].id);

  const activeConnector = connectors.find((c) => c.id === activeId) || connectors[0];

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <span className="material-symbols-outlined text-[24px]">sensors</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                Integrations &amp; IoT Gateway Hub
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-semibold">
                ALL 5 PIPELINES HEALTHY
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              SAP S/4HANA bi-directional sync, Sensitech cold-chain telemetry &amp; MarineTraffic live satellite AIS feeds
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Opening Webhook & REST API pipeline configuration wizard.')}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">add_link</span>
          Connect New Pipeline
        </button>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pipeline Cards */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {connectors.map((c) => {
            const isSelected = activeConnector.id === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected
                    ? 'bg-surface-container-low border-cyan-500 shadow-md'
                    : 'bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-container-lowest'
                  }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-cyan-400">
                      <span className="material-symbols-outlined text-[20px]">{c.iconName}</span>
                    </div>
                    <div>
                      <h3 className="font-card-title text-card-title text-text-primary leading-tight">{c.name}</h3>
                      <div className="font-caption text-caption text-text-muted">{c.provider}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/15 text-risk-low font-semibold">
                      {c.status}
                    </span>
                    <div className="font-mono text-caption text-text-muted mt-1">{c.latencyMs}ms</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-caption font-caption text-text-muted mt-3 pt-2.5 border-t border-border-subtle">
                  <span>Sync: {c.lastSyncIso}</span>
                  <span className="font-mono text-cyan-400">{c.eventsProcessedToday.toLocaleString()} events today</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Diagnostics Workbench */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-md space-y-6 sticky top-20">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                <span className="material-symbols-outlined text-[24px]">{activeConnector.iconName}</span>
              </div>
              <div>
                <h2 className="font-section-title text-section-title text-text-primary leading-tight">
                  {activeConnector.name}
                </h2>
                <div className="font-caption text-caption text-text-muted">Provider: {activeConnector.provider}</div>
              </div>
            </div>
          </div>

          {/* Endpoint Details */}
          <div className="p-4 rounded-lg bg-bg-surface border border-border-subtle space-y-2.5">
            <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-cyan-400 font-bold">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              Pipeline Connection Parameters
            </div>
            <div className="font-mono text-[11px] text-text-primary bg-surface-container-lowest p-2 rounded border border-border-subtle break-all">
              {activeConnector.endpointUrl}
            </div>
            <div className="grid grid-cols-2 gap-3 text-caption font-caption pt-1">
              <div>
                <div className="text-text-muted">Auth Scheme:</div>
                <div className="font-bold text-text-primary">{activeConnector.authType}</div>
              </div>
              <div>
                <div className="text-text-muted">Rolling 30d Uptime:</div>
                <div className="font-bold text-risk-low">{activeConnector.uptimeRate}%</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-border-subtle">
            <button
              onClick={() => alert(`Sending synthetic health check probe to ${activeConnector.name}. Round-trip: ${activeConnector.latencyMs}ms (HTTP 200 OK).`)}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Execute Live Ping Probe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
