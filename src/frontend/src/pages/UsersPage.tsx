/**
 * SupplyShield AI — User Management & RBAC
 *
 * Enterprise operator access control & privilege governance matching Stitch Design System:
 * - Granular capability enforcement (Reroute Approvals, MKT overrides, Crisis War-Room triggers)
 * - 2FA / Okta SAML SSO enforcement status
 * - Stitch tokens: bg-bg-surface, bg-surface-container-lowest, material-symbols-outlined
 */

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'CONTROL_TOWER_ADMIN' | 'OPERATIONS_LEAD' | 'COLD_CHAIN_QA' | 'DISPATCHER';

interface OperatorUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  department: string;
  location: string;
  status: 'ACTIVE' | 'ON_CALL';
  twoFactorEnabled: boolean;
  lastActiveIso: string;
  authorizedScopes: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USERS: OperatorUser[] = [
  {
    id: 'usr-001',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@supplyshield.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'CONTROL_TOWER_ADMIN',
    department: 'Global Logistics Operations',
    location: 'Frankfurt / Mumbai Control Tower',
    status: 'ON_CALL',
    twoFactorEnabled: true,
    lastActiveIso: 'Active now',
    authorizedScopes: ['reroute:approve', 'threshold:modify', 'carrier:escalate', 'gdp:release', 'users:manage'],
  },
  {
    id: 'usr-002',
    name: 'Riya Sharma',
    email: 'riya.sharma@supplyshield.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'OPERATIONS_LEAD',
    department: 'National Incident Desk',
    location: 'Mumbai Hub',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastActiveIso: '5 min ago',
    authorizedScopes: ['reroute:simulate', 'carrier:escalate', 'incident:triage'],
  },
  {
    id: 'usr-003',
    name: 'Dr. Priya Nair',
    email: 'priya.nair@supplyshield.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'COLD_CHAIN_QA',
    department: 'Pharma Quality Assurance & GDP',
    location: 'Basel / Pune Bio Cluster',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastActiveIso: '18 min ago',
    authorizedScopes: ['gdp:release', 'mkt:override', 'audit:export'],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users] = useState<OperatorUser[]>(MOCK_USERS);
  const [activeId, setActiveId] = useState<string>(MOCK_USERS[0].id);

  const activeUser = users.find((u) => u.id === activeId) || users[0];

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 border border-purple-500/20">
            <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                Operator Directory &amp; RBAC Privileges
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-semibold">
                SAML SSO &amp; 2FA ENFORCED
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              Role-based capability matrices • On-call emergency rosters &amp; 21 CFR Part 11 signature authorizations
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Opening operator invite & SAML SSO provisioning modal.')}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          Invite Operator
        </button>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left User Cards */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {users.map((u) => {
            const isSelected = activeUser.id === u.id;

            return (
              <div
                key={u.id}
                onClick={() => setActiveId(u.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-surface-container-low border-primary shadow-md'
                    : 'bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-card-title text-card-title text-text-primary">{u.name}</h3>
                        {u.status === 'ON_CALL' && (
                          <span className="font-badge-label text-badge-label px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            On-Call
                          </span>
                        )}
                      </div>
                      <div className="font-caption text-caption text-text-muted">{u.email}</div>
                    </div>
                  </div>
                  <span className="font-mono text-caption text-text-muted">{u.lastActiveIso}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-border-subtle">
                  {u.authorizedScopes.slice(0, 3).map((s) => (
                    <span key={s} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-container-high text-primary">
                      {s}
                    </span>
                  ))}
                  {u.authorizedScopes.length > 3 && (
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-container-high text-text-muted">
                      +{u.authorizedScopes.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right User Workbench */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-md space-y-6 sticky top-20">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <img src={activeUser.avatarUrl} alt={activeUser.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary" />
            <div>
              <h2 className="font-section-title text-section-title text-text-primary leading-tight">{activeUser.name}</h2>
              <div className="font-caption text-caption text-text-muted">{activeUser.department} • {activeUser.location}</div>
            </div>
          </div>

          {/* Privileges Matrix */}
          <div className="space-y-2">
            <div className="font-caption text-caption uppercase tracking-wider text-text-muted font-bold">
              Granted Capability Scopes
            </div>
            <div className="space-y-1.5">
              {activeUser.authorizedScopes.map((scope, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-between font-caption text-caption">
                  <span className="font-mono text-primary">🔒 {scope}</span>
                  <span className="font-bold text-risk-low text-[11px]">AUTHORIZED</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-border-subtle">
            <button
              onClick={() => alert(`Revoking active sessions for ${activeUser.name}.`)}
              className="px-4 py-2 rounded-lg bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle font-badge-label text-badge-label flex items-center gap-1.5 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">lock_reset</span>
              Revoke Active Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
