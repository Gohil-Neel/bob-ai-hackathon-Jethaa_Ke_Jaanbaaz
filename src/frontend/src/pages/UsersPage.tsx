/**
 * SupplyShield AI — User Management & RBAC
 *
 * Enterprise role-based access control, operator directory & permission governance:
 * - Granular capability enforcement (Reroute Approvals, MKT Threshold Changes, War-Room Invocations)
 * - 2FA / SSO authentication statuses & active session monitors
 * - Cryptographic operator audit trails for sensitive action authorizations
 */

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'CONTROL_TOWER_ADMIN' | 'OPERATIONS_LEAD' | 'COLD_CHAIN_QA' | 'DISPATCHER' | 'EXECUTIVE_VIEWER';

interface OperatorUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  department: string;
  location: string;
  status: 'ACTIVE' | 'ON_CALL' | 'INACTIVE';
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
    location: 'Frankfurt Control Tower',
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
    department: 'Trans-Atlantic Incident Desk',
    location: 'London Hub',
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
    location: 'Basel HQ',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastActiveIso: '18 min ago',
    authorizedScopes: ['gdp:release', 'mkt:override', 'audit:export'],
  },
  {
    id: 'usr-004',
    name: 'Vikram Rao',
    email: 'vikram.rao@supplyshield.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'EXECUTIVE_VIEWER',
    department: 'VP Supply Chain Strategy',
    location: 'Singapore Office',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastActiveIso: '2h ago',
    authorizedScopes: ['analytics:view', 'reports:export'],
  },
  {
    id: 'usr-005',
    name: 'Sanjay Gupta',
    email: 'sanjay.gupta@supplyshield.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'DISPATCHER',
    department: 'Middle East & Asia Fleet Dispatch',
    location: 'Dubai Freezone Hub',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastActiveIso: '32 min ago',
    authorizedScopes: ['fleet:reassign', 'customs:file'],
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
  CONTROL_TOWER_ADMIN: { label: 'Admin / Tower Lead', bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.35)' },
  OPERATIONS_LEAD:     { label: 'Operations Lead', bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(168,85,247,0.35)' },
  COLD_CHAIN_QA:       { label: 'GDP / QA Auditor', bg: 'rgba(20,184,166,0.12)', text: '#2dd4bf', border: 'rgba(20,184,166,0.35)' },
  DISPATCHER:          { label: 'Fleet Dispatcher', bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.35)' },
  EXECUTIVE_VIEWER:    { label: 'Executive Viewer', bg: 'rgba(107,114,128,0.12)', text: '#9ca3af', border: 'rgba(107,114,128,0.35)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users] = useState<OperatorUser[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<OperatorUser | null>(MOCK_USERS[0]);
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">👥</span>
            <h1 className="text-2xl font-extrabold text-white">User Management & RBAC</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              5 Active Operators · SSO Enforced
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Role-based capability matrices, on-call dispatch rosters & 21 CFR Part 11 digital signature privileges
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Opening new operator invitation & SAML / Okta SSO role provisioning modal.')}
            className="text-sm px-4 py-2 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all"
          >
            + Invite Operator
          </button>
        </div>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Directory */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 rounded-2xl mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <input
              type="text"
              placeholder="🔍 Search operator by name, email or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
            />
          </div>

          {filtered.map((user) => {
            const isSelected = selectedUser?.id === user.id;
            const roleStyle = ROLE_CONFIG[user.role];

            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{
                  background: isSelected ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.025)',
                  border: isSelected ? '1.5px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{user.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: roleStyle.bg, color: roleStyle.text, border: `1px solid ${roleStyle.border}` }}>
                          {roleStyle.label}
                        </span>
                        {user.status === 'ON_CALL' && (
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            📞 On-Call
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/50">{user.email} · {user.department}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono text-white/40">
                    {user.lastActiveIso}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {user.authorizedScopes.map((scope) => (
                    <span key={scope} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-purple-300">
                      🔒 {scope}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected User Privileges Panel */}
        {selectedUser && (
          <div className="p-6 rounded-2xl flex flex-col gap-5" style={{ background: 'rgba(10,12,20,0.97)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3">
              <img
                src={selectedUser.avatarUrl}
                alt={selectedUser.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500/40"
              />
              <div>
                <h2 className="text-base font-extrabold text-white">{selectedUser.name}</h2>
                <div className="text-xs text-white/50">{selectedUser.location}</div>
              </div>
            </div>

            {/* SAML / Security Status */}
            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-300">Security & Credentials</div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">2FA Hardware Token:</span>
                <span className="font-bold text-green-400">✓ Enforced (FIDO2)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">SSO Provider:</span>
                <span className="font-bold text-white">Okta Enterprise SAML</span>
              </div>
            </div>

            {/* Scope Permissions List */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2 text-white/40">Granted Action Scopes</div>
              <div className="space-y-1.5">
                {selectedUser.authorizedScopes.map((s, idx) => (
                  <div key={idx} className="text-xs p-2.5 rounded-lg flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="font-mono text-purple-300">🔒 {s}</span>
                    <span className="text-green-400 text-[11px] font-bold">ALLOWED</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => alert(`Triggering password / session reset for ${selectedUser.name}.`)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                🔄 Revoke Active Sessions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
