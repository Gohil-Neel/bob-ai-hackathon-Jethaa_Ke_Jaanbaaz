/**
 * SupplyShield AI — Notifications & Escalation Rules
 *
 * Automated alerting channels & multi-tier escalation policies:
 * - Multi-channel routing: PagerDuty on-call, SMS gateways, Slack war-rooms & email
 * - Severity-based escalation delays (L1 Operator -> L2 Lead -> L3 VP Logistics)
 * - Excursion priority overrides (bypasses quiet hours for Critical GDP breaches)
 * - Live notification delivery logs & synthetic test broadcast simulator
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
    name: 'Critical Temperature Excursion Immediate Page',
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
    triggerCondition: 'No heartbeat ping from transponder for > 120 minutes',
    severity: 'HIGH',
    channels: ['SLACK', 'EMAIL'],
    escalationDelayMinutes: 30,
    assignedOnCallRoster: 'IoT Gateway Engineering Roster',
    active: true,
    quietHoursBypass: false,
  },
  {
    id: 'rule-004',
    name: 'Carrier SLA Rolling Monthly Warning',
    triggerCondition: 'Carrier On-Time Delivery Drops Below 85% Benchmark',
    severity: 'MEDIUM',
    channels: ['EMAIL'],
    escalationDelayMinutes: 120,
    assignedOnCallRoster: 'Procurement & Vendor Governance Desk',
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
    alertTitle: 'Cold Chain Breach INC-2024-0047',
    status: 'ACKED',
  },
  {
    id: 'log-002',
    timestamp: '06:15 UTC (Dec 12)',
    channel: 'Slack (#war-room-atlantic)',
    recipient: 'Channel Broadcast (18 operators)',
    alertTitle: 'North Atlantic Storm Force Majeure INC-2024-0046',
    status: 'DELIVERED',
  },
  {
    id: 'log-003',
    timestamp: '07:30 UTC (Dec 13)',
    channel: 'SMS Gateway',
    recipient: 'Meera Pillai (+31 6 1234 5678)',
    alertTitle: 'Rotterdam Strike Delay INC-2024-0045',
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
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🔔</span>
            <h1 className="text-2xl font-extrabold text-white">Notifications & Escalation Engine</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              4 Active Escalation Trees
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Automated multi-channel PagerDuty, Slack & SMS dispatch policies with quiet-hours overrides
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Synthetic test broadcast sent to on-call operator desk: PagerDuty trigger simulated.')}
            className="text-sm px-4 py-2 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 transition-all"
          >
            ⚡ Trigger Test Broadcast
          </button>
        </div>
      </div>

      {/* ── Escalation Rules List ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">Configured Escalation Policies</h2>

        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 rounded-2xl transition-all"
            style={{
              background: rule.active ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: rule.active ? 1 : 0.6,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    rule.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {rule.severity}
                  </span>
                  <h3 className="text-base font-bold text-white">{rule.name}</h3>
                  {rule.quietHoursBypass && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      ⚡ 24/7 Quiet Hours Bypass
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/60 mb-2">Trigger: {rule.triggerCondition}</div>
                <div className="text-xs text-white/40">
                  Assigned Roster: <strong className="text-white">{rule.assignedOnCallRoster}</strong> · Escalation delay: <strong className="text-white">{rule.escalationDelayMinutes}m</strong>
                </div>
              </div>

              {/* Channels & Toggle */}
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                    rule.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-white/40'
                  }`}
                >
                  {rule.active ? 'ACTIVE' : 'PAUSED'}
                </button>
                <div className="flex gap-1">
                  {rule.channels.map((ch) => (
                    <span key={ch} className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-amber-300">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Broadcast Delivery Logs ── */}
      <div className="p-5 rounded-2xl space-y-3" style={{ background: 'rgba(10,12,20,0.97)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-sm font-bold text-white">Recent Notification Deliveries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Timestamp', 'Channel', 'Recipient', 'Alert Context', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 font-bold uppercase tracking-wide text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-2.5 px-3 font-mono text-white/50">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-400">{log.channel}</td>
                  <td className="py-2.5 px-3 text-white">{log.recipient}</td>
                  <td className="py-2.5 px-3 text-white/70">{log.alertTitle}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-500/20 text-green-400">
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
