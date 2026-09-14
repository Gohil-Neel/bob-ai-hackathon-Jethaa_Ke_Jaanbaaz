/**
 * SupplyShield AI — Notifications & Escalation Rules
 *
 * Automated alerting channels & multi-tier escalation policies matching Stitch Design System:
 * - Multi-channel routing (PagerDuty on-call, SMS gateways, Slack war-rooms)
 * - Severity-based escalation delays & quiet-hours overrides
 * - Synthetic test broadcast execution
 * - Stitch tokens: bg-bg-surface, bg-surface-container-lowest, material-symbols-outlined
 */

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EscalationRule {
  id: string;
  name: string;
  triggerCondition: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  channels: ('PAGERDUTY' | 'SLACK' | 'SMS' | 'EMAIL')[];
  escalationDelayMinutes: number;
  assignedOnCallRoster: string;
  active: boolean;
  quietHoursBypass: boolean;
}

interface DeliveryLog {
  id: string;
  timestamp: string;
  channel: string;
  recipient: string;
  alertTitle: string;
  status: 'DELIVERED' | 'ACKED' | 'FAILED';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RULES: EscalationRule[] = [
  {
    id: 'rule-001',
    name: 'Critical Cold-Chain Excursion Page',
    triggerCondition: 'Sensor Temp > 8.0°C for > 30 min (Cold Chain Biologics)',
    severity: 'CRITICAL',
    channels: ['PAGERDUTY', 'SMS', 'SLACK'],
    escalationDelayMinutes: 5,
    assignedOnCallRoster: 'Tier-1 Cold Chain On-Call (Dr. Priya Nair)',
    active: true,
    quietHoursBypass: true,
  },
  {
    id: 'rule-002',
    name: 'Major Port Congestion / Force Majeure War-Room',
    triggerCondition: 'Port closure or Strike impact affecting > 5 shipments',
    severity: 'CRITICAL',
    channels: ['SLACK', 'EMAIL', 'SMS'],
    escalationDelayMinutes: 15,
    assignedOnCallRoster: 'Global Operations Desk (Arjun Mehta)',
    active: true,
    quietHoursBypass: true,
  },
  {
    id: 'rule-003',
    name: 'IoT Sensor Telemetry Data Gap Warning',
    triggerCondition: 'No heartbeat packet from transponder for > 120 minutes',
    severity: 'HIGH',
    channels: ['SLACK', 'EMAIL'],
    escalationDelayMinutes: 30,
    assignedOnCallRoster: 'IoT Gateway Engineering Desk',
    active: true,
    quietHoursBypass: false,
  },
];

const MOCK_LOGS: DeliveryLog[] = [
  {
    id: 'log-001',
    timestamp: '10:03 UTC (Today)',
    channel: 'PagerDuty',
    recipient: 'Dr. Priya Nair (+41 79 123 4567)',
    alertTitle: 'Cold Chain Breach INC-2024-891',
    status: 'ACKED',
  },
  {
    id: 'log-002',
    timestamp: '06:15 UTC (Dec 12)',
    channel: 'Slack (#war-room-atlantic)',
    recipient: 'Channel Broadcast (18 operators)',
    alertTitle: 'North Atlantic Cyclone Force Majeure INC-2024-884',
    status: 'DELIVERED',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [rules, setRules] = useState<EscalationRule[]>(MOCK_RULES);
  const [logs] = useState<DeliveryLog[]>(MOCK_LOGS);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <span className="material-symbols-outlined text-[24px]">campaign</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                Notifications &amp; Escalation Engine
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold">
                3 ACTIVE ESCALATION TREES
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              Automated multi-channel PagerDuty, Slack war-room &amp; SMS emergency broadcast rules
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Synthetic test broadcast sent to on-call desk: PagerDuty trigger simulated.')}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          Trigger Test Broadcast
        </button>
      </div>

      {/* ── Escalation Rules List ── */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const isCritical = rule.severity === 'CRITICAL';

          return (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all ${rule.active
                  ? 'bg-bg-surface border-border-subtle hover:border-border-strong'
                  : 'bg-surface-container-lowest/50 border-border-subtle/50 opacity-60'
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full font-semibold ${isCritical ? 'bg-risk-critical/15 text-risk-critical' : 'bg-risk-high/15 text-risk-high'
                      }`}>
                      {rule.severity}
                    </span>
                    <h3 className="font-card-title text-card-title text-text-primary">{rule.name}</h3>
                    {rule.quietHoursBypass && (
                      <span className="font-badge-label text-badge-label px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                        ⚡ 24/7 Quiet Hours Bypass
                      </span>
                    )}
                  </div>
                  <div className="font-caption text-caption text-text-secondary mb-1">
                    Trigger: <strong className="text-text-primary">{rule.triggerCondition}</strong>
                  </div>
                  <div className="font-caption text-caption text-text-muted">
                    Roster: <strong className="text-text-primary">{rule.assignedOnCallRoster}</strong> • Escalation delay: <strong className="text-text-primary">{rule.escalationDelayMinutes}m</strong>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    type="button"
                    className={`font-badge-label text-badge-label px-2.5 py-1 rounded-lg font-bold transition-all ${rule.active ? 'bg-risk-low/15 text-risk-low border border-risk-low/30' : 'bg-surface-container-high text-text-muted'
                      }`}
                  >
                    {rule.active ? 'ACTIVE' : 'PAUSED'}
                  </button>
                  <div className="flex gap-1">
                    {rule.channels.map((ch) => (
                      <span key={ch} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-container-high text-amber-400 font-bold">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Delivery Logs ── */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-[20px]">history</span>
          <h3 className="font-card-title text-card-title text-text-primary">Recent Automated Notification Deliveries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-caption text-caption">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Channel</th>
                <th className="py-2 px-3">Recipient</th>
                <th className="py-2 px-3">Alert Context</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border-subtle/50 hover:bg-surface-container-low/50">
                  <td className="py-2.5 px-3 font-mono text-text-muted">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-400">{log.channel}</td>
                  <td className="py-2.5 px-3 text-text-primary">{log.recipient}</td>
                  <td className="py-2.5 px-3 text-text-secondary">{log.alertTitle}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/15 text-risk-low font-semibold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
