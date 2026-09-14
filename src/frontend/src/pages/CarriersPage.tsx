/**
 * SupplyShield AI — Carrier & Vendor Directory
 *
 * Enterprise carrier performance & SLA management:
 * - Carrier scorecards (On-Time Delivery %, Cold-Chain integrity %, Claim rates)
 * - Tier status (Tier 1 Strategic, Tier 2 Secondary, Under Probation)
 * - Active contracts & SLA benchmarks (MTTA, Penalty triggers)
 * - Fleet capacity & lane coverage matrices
 * - Direct emergency dispatch channels & escalation contacts
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type CarrierTier = 'STRATEGIC_TIER_1' | 'STANDARD_TIER_2' | 'PROBATION' | 'RESTRICTED';
type Mode = 'OCEAN' | 'AIR' | 'ROAD' | 'INTERMODAL';

interface Carrier {
  id: string;
  name: string;
  code: string;
  logoIcon: string;
  tier: CarrierTier;
  modes: Mode[];
  onTimeRate: number; // e.g. 94.8%
  coldChainCompliance: number; // e.g. 99.2%
  activeShipments: number;
  totalVolumeYtd: string;
  avgCostPerKm: string;
  claimsRate: number; // e.g. 0.4%
  primaryContact: {
    name: string;
    role: string;
    phone: string;
    email: string;
  };
  emergencyHotline: string;
  slaTerms: {
    maxResponseTimeHours: number;
    delayPenaltyThresholdHours: number;
    temperatureExcursionPenaltyUsd: number;
    forceMajeureClauseActive: boolean;
  };
  activeLanes: string[];
  recentIncidentsCount: number;
  status: 'ACTIVE' | 'AUDIT_PENDING' | 'SUSPENDED';
}

// ─── Mock Carriers ────────────────────────────────────────────────────────────

const MOCK_CARRIERS: Carrier[] = [
  {
    id: 'car-001',
    name: 'Maersk Line',
    code: 'MAEU',
    logoIcon: '🚢',
    tier: 'STRATEGIC_TIER_1',
    modes: ['OCEAN', 'INTERMODAL', 'ROAD'],
    onTimeRate: 94.2,
    coldChainCompliance: 98.9,
    activeShipments: 48,
    totalVolumeYtd: '14,200 TEU',
    avgCostPerKm: '$1.42',
    claimsRate: 0.28,
    primaryContact: {
      name: 'Henrik Lindqvist',
      role: 'Global Key Account Director',
      phone: '+45 33 63 33 63',
      email: 'h.lindqvist@maersk.com',
    },
    emergencyHotline: '+45 33 63 99 00 (24/7 Operations)',
    slaTerms: {
      maxResponseTimeHours: 1,
      delayPenaltyThresholdHours: 12,
      temperatureExcursionPenaltyUsd: 25000,
      forceMajeureClauseActive: true,
    },
    activeLanes: ['North Atlantic (Hamburg - Chicago)', 'Trans-Pacific (Shanghai - LA)', 'Asia-Europe (Singapore - Rotterdam)'],
    recentIncidentsCount: 1,
    status: 'ACTIVE',
  },
  {
    id: 'car-002',
    name: 'CMA CGM Group',
    code: 'CMDU',
    logoIcon: '⚓',
    tier: 'PROBATION',
    modes: ['OCEAN', 'AIR'],
    onTimeRate: 81.3,
    coldChainCompliance: 92.4,
    activeShipments: 22,
    totalVolumeYtd: '8,400 TEU',
    avgCostPerKm: '$1.35',
    claimsRate: 1.45,
    primaryContact: {
      name: 'Claire Beauchamp',
      role: 'Enterprise Logistics Lead',
      phone: '+33 4 88 91 90 00',
      email: 'c.beauchamp@cma-cgm.com',
    },
    emergencyHotline: '+33 4 88 91 99 99',
    slaTerms: {
      maxResponseTimeHours: 4,
      delayPenaltyThresholdHours: 8,
      temperatureExcursionPenaltyUsd: 50000,
      forceMajeureClauseActive: false,
    },
    activeLanes: ['Trans-Pacific (LA - Tokyo)', 'Mediterranean (Marseille - Alexandria)'],
    recentIncidentsCount: 4,
    status: 'AUDIT_PENDING',
  },
  {
    id: 'car-003',
    name: 'Hapag-Lloyd',
    code: 'HLCU',
    logoIcon: '🛳️',
    tier: 'STRATEGIC_TIER_1',
    modes: ['OCEAN', 'ROAD'],
    onTimeRate: 96.1,
    coldChainCompliance: 99.6,
    activeShipments: 34,
    totalVolumeYtd: '11,100 TEU',
    avgCostPerKm: '$1.48',
    claimsRate: 0.12,
    primaryContact: {
      name: 'Klaus Richter',
      role: 'Pharma Logistics Lead',
      phone: '+49 40 3001 0',
      email: 'k.richter@hlag.com',
    },
    emergencyHotline: '+49 40 3001 9911',
    slaTerms: {
      maxResponseTimeHours: 1,
      delayPenaltyThresholdHours: 6,
      temperatureExcursionPenaltyUsd: 35000,
      forceMajeureClauseActive: false,
    },
    activeLanes: ['Indian Ocean (Mumbai - Dubai)', 'North Sea (Rotterdam - Hamburg)'],
    recentIncidentsCount: 0,
    status: 'ACTIVE',
  },
  {
    id: 'car-004',
    name: 'COSCO Shipping',
    code: 'COSU',
    logoIcon: '🌐',
    tier: 'STANDARD_TIER_2',
    modes: ['OCEAN', 'INTERMODAL'],
    onTimeRate: 88.7,
    coldChainCompliance: 95.1,
    activeShipments: 19,
    totalVolumeYtd: '9,800 TEU',
    avgCostPerKm: '$1.22',
    claimsRate: 0.85,
    primaryContact: {
      name: 'Wei Zhang',
      role: 'Asia-Pacific Account Exec',
      phone: '+86 21 6596 6666',
      email: 'wei.zhang@coscoshipping.com',
    },
    emergencyHotline: '+86 21 6596 8888',
    slaTerms: {
      maxResponseTimeHours: 3,
      delayPenaltyThresholdHours: 18,
      temperatureExcursionPenaltyUsd: 20000,
      forceMajeureClauseActive: false,
    },
    activeLanes: ['East Asia (Shanghai - Rotterdam)', 'Trans-Pacific (Ningbo - Long Beach)'],
    recentIncidentsCount: 2,
    status: 'ACTIVE',
  },
  {
    id: 'car-005',
    name: 'Lufthansa Cargo / Swiss WorldCargo',
    code: 'LHCR',
    logoIcon: '✈️',
    tier: 'STRATEGIC_TIER_1',
    modes: ['AIR'],
    onTimeRate: 98.4,
    coldChainCompliance: 99.9,
    activeShipments: 12,
    totalVolumeYtd: '1,450 Tons',
    avgCostPerKm: '$4.90',
    claimsRate: 0.04,
    primaryContact: {
      name: 'Sabine Weber',
      role: 'Active Cold Chain Solutions Lead',
      phone: '+49 69 696 0',
      email: 'sabine.weber@lufthansa-cargo.com',
    },
    emergencyHotline: '+49 69 696 9000 (Expedited Triage)',
    slaTerms: {
      maxResponseTimeHours: 0.5,
      delayPenaltyThresholdHours: 2,
      temperatureExcursionPenaltyUsd: 100000,
      forceMajeureClauseActive: false,
    },
    activeLanes: ['Transatlantic Air (Frankfurt - Chicago O’Hare)', 'Trans-Eurasia (Zurich - Singapore Changi)'],
    recentIncidentsCount: 0,
    status: 'ACTIVE',
  },
  {
    id: 'car-006',
    name: 'Kuehne + Nagel Road Logistics',
    code: 'KNRL',
    logoIcon: '🚛',
    tier: 'STANDARD_TIER_2',
    modes: ['ROAD', 'INTERMODAL'],
    onTimeRate: 91.5,
    coldChainCompliance: 97.2,
    activeShipments: 28,
    totalVolumeYtd: '4,200 FTL',
    avgCostPerKm: '$2.15',
    claimsRate: 0.42,
    primaryContact: {
      name: 'Thomas Meier',
      role: 'European Overland Dispatcher',
      phone: '+41 44 786 95 11',
      email: 'thomas.meier@kuehne-nagel.com',
    },
    emergencyHotline: '+41 44 786 99 99',
    slaTerms: {
      maxResponseTimeHours: 2,
      delayPenaltyThresholdHours: 4,
      temperatureExcursionPenaltyUsd: 15000,
      forceMajeureClauseActive: false,
    },
    activeLanes: ['EU Pharma Corridor (Basel - Antwerp)', 'Cross-Channel (Rotterdam - London Gateway)'],
    recentIncidentsCount: 1,
    status: 'ACTIVE',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_STYLES: Record<CarrierTier, { label: string; bg: string; text: string; border: string }> = {
  STRATEGIC_TIER_1: { label: 'Tier 1 Strategic', bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.35)' },
  STANDARD_TIER_2:  { label: 'Tier 2 Secondary', bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.35)' },
  PROBATION:        { label: 'Probationary Audit', bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.35)' },
  RESTRICTED:       { label: 'Restricted / Locked', bg: 'rgba(107,114,128,0.12)', text: '#9ca3af', border: 'rgba(107,114,128,0.35)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CarriersPage() {
  const [carriers] = useState<Carrier[]>(MOCK_CARRIERS);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<CarrierTier | 'ALL'>('ALL');
  const [modeFilter, setModeFilter] = useState<Mode | 'ALL'>('ALL');
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(MOCK_CARRIERS[0]);

  const filteredCarriers = useMemo(() => {
    return carriers.filter((c) => {
      if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;
      if (modeFilter !== 'ALL' && !c.modes.includes(modeFilter)) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [carriers, tierFilter, modeFilter, search]);

  const avgOtd = (carriers.reduce((acc, c) => acc + c.onTimeRate, 0) / carriers.length).toFixed(1);
  const avgColdChain = (carriers.reduce((acc, c) => acc + c.coldChainCompliance, 0) / carriers.length).toFixed(1);
  const totalActiveShipments = carriers.reduce((acc, c) => acc + c.activeShipments, 0);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🏢</span>
            <h1 className="text-2xl font-extrabold text-white">Carrier & Vendor Directory</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {carriers.length} Active Partners
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            SLA performance governance, cold-chain compliance scorecards & direct incident escalation paths
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('New carrier onboarding workflow initiated. Generating ISO 9001/GDP audit checklist.')}
            className="text-sm px-4 py-2 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
          >
            + Onboard Carrier
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Network On-Time Rate</div>
          <div className="text-3xl font-extrabold text-green-400">{avgOtd}%</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Target: ≥ 92.0%</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Cold Chain Compliance</div>
          <div className="text-3xl font-extrabold text-teal-400">{avgColdChain}%</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>MKT Excursion Rate: 0.8%</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Managed In-Transit</div>
          <div className="text-3xl font-extrabold text-blue-400">{totalActiveShipments}</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Across 6 Global Carriers</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Under Review / Probation</div>
          <div className="text-3xl font-extrabold text-red-400">1</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>CMA CGM SLA Review Active</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          type="text"
          placeholder="🔍 Search carrier by name or code (e.g., MAEU)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none w-72"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as CarrierTier | 'ALL')}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ background: 'rgba(25,27,40,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
        >
          <option value="ALL">All Tiers</option>
          <option value="STRATEGIC_TIER_1">Tier 1 Strategic</option>
          <option value="STANDARD_TIER_2">Tier 2 Secondary</option>
          <option value="PROBATION">Probation / Audit</option>
        </select>
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value as Mode | 'ALL')}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ background: 'rgba(25,27,40,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
        >
          <option value="ALL">All Transport Modes</option>
          <option value="OCEAN">Ocean Freight</option>
          <option value="AIR">Air Cargo</option>
          <option value="ROAD">Overland Road</option>
          <option value="INTERMODAL">Intermodal</option>
        </select>
        <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Showing {filteredCarriers.length} of {carriers.length} carriers
        </span>
      </div>

      {/* ── Split Layout: Grid & Details Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carrier Cards Grid */}
        <div className="lg:col-span-2 space-y-3">
          {filteredCarriers.map((carrier) => {
            const isSelected = selectedCarrier?.id === carrier.id;
            const tierStyle = TIER_STYLES[carrier.tier];

            return (
              <div
                key={carrier.id}
                onClick={() => setSelectedCarrier(carrier)}
                className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{
                  background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.025)',
                  border: isSelected ? '1.5px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {carrier.logoIcon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{carrier.name}</h3>
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                          {carrier.code}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: tierStyle.bg, color: tierStyle.text, border: `1px solid ${tierStyle.border}` }}>
                          {tierStyle.label}
                        </span>
                        {carrier.modes.map((m) => (
                          <span key={m} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right mini stats */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{carrier.activeShipments} Active Loads</div>
                    <div className="text-xs font-mono" style={{ color: carrier.onTimeRate >= 92 ? '#4ade80' : '#f87171' }}>
                      {carrier.onTimeRate}% On-Time
                    </div>
                  </div>
                </div>

                {/* Performance progress bars */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      <span>SLA On-Time Delivery</span>
                      <span className="font-bold text-white">{carrier.onTimeRate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${carrier.onTimeRate}%`, background: carrier.onTimeRate >= 92 ? '#22c55e' : '#ef4444' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      <span>Cold Chain Integrity</span>
                      <span className="font-bold text-white">{carrier.coldChainCompliance}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${carrier.coldChainCompliance}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Carrier Deep-Dive Panel */}
        {selectedCarrier && (
          <div className="p-6 rounded-2xl flex flex-col gap-5" style={{ background: 'rgba(10,12,20,0.97)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCarrier.logoIcon}</span>
                  <h2 className="text-lg font-extrabold text-white">{selectedCarrier.name}</h2>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">{selectedCarrier.code}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Primary global carrier agreement · ISO 9001 & GDP certified pharma transport network.
              </p>
            </div>

            {/* SLA Governance Details */}
            <div className="p-4 rounded-xl space-y-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-300">Contractual SLA Benchmarks</div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Incident Max MTTA:</span>
                <span className="font-bold text-white">&le; {selectedCarrier.slaTerms.maxResponseTimeHours} Hour</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Delay Penalty Trigger:</span>
                <span className="font-bold text-white">&gt; {selectedCarrier.slaTerms.delayPenaltyThresholdHours}h Unplanned</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Temp Excursion Penalty:</span>
                <span className="font-bold text-amber-400">${selectedCarrier.slaTerms.temperatureExcursionPenaltyUsd.toLocaleString()} / Event</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Claims Rate YTD:</span>
                <span className="font-bold text-white">{selectedCarrier.claimsRate}%</span>
              </div>
            </div>

            {/* Active Lanes */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Allocated Trade Lanes</div>
              <div className="space-y-1.5">
                {selectedCarrier.activeLanes.map((lane, idx) => (
                  <div key={idx} className="text-xs p-2.5 rounded-lg flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)' }}>
                    <span>🛤️</span>
                    <span className="truncate">{lane}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Escalation Contacts */}
            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-red-400">🚨 Incident War-Room Dispatch</div>
              <div className="text-xs font-bold text-white">{selectedCarrier.primaryContact.name} ({selectedCarrier.primaryContact.role})</div>
              <div className="text-xs font-mono text-red-300">📞 {selectedCarrier.emergencyHotline}</div>
              <div className="text-xs text-white/50">✉️ {selectedCarrier.primaryContact.email}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => alert(`Initiating priority dispatch bridge with ${selectedCarrier.name} operations control.`)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                📞 Open Dispatch Bridge
              </button>
              <button
                onClick={() => alert(`Triggering annual GDP/GxP performance audit for ${selectedCarrier.name}.`)}
                className="py-2.5 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white/80 transition-colors"
              >
                Audit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
