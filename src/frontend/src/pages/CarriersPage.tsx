/**
 * SupplyShield AI — Carrier & Vendor Directory
 *
 * Enterprise carrier performance & SLA governance matching Stitch Design System:
 * - On-Time Delivery (OTD), Cold-Chain compliance %, Claim incident rate
 * - Tier status (Tier 1 Strategic, Tier 2 Secondary, Under Probation)
 * - Contractual SLA parameters & penalty triggers
 * - Direct emergency dispatch channels & war-room escalation bridges
 */

import { useState, useMemo, useEffect } from 'react';
import { getCarriers } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type CarrierTier = 'STRATEGIC_TIER_1' | 'STANDARD_TIER_2' | 'PROBATION';
type TransportMode = 'OCEAN' | 'AIR' | 'ROAD' | 'INTERMODAL';

interface CarrierItem {
  id: string;
  name: string;
  code: string;
  tier: CarrierTier;
  modes: TransportMode[];
  onTimeRate: number;
  coldChainCompliance: number;
  activeShipments: number;
  cargoValueManaged: string;
  claimsRate: number;
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
    temperatureExcursionPenalty: string;
  };
  activeLanes: string[];
  recentIncidentsCount: number;
  status: 'ACTIVE' | 'AUDIT_PENDING' | 'SUSPENDED';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CARRIERS: CarrierItem[] = [
  {
    id: 'car-001',
    name: 'Maersk Line Logistics',
    code: 'MAEU',
    tier: 'STRATEGIC_TIER_1',
    modes: ['OCEAN', 'INTERMODAL', 'ROAD'],
    onTimeRate: 94.2,
    coldChainCompliance: 98.9,
    activeShipments: 48,
    cargoValueManaged: '₹24.8 Cr',
    claimsRate: 0.28,
    primaryContact: {
      name: 'Henrik Lindqvist',
      role: 'Global Key Account Director',
      phone: '+45 33 63 33 63',
      email: 'h.lindqvist@maersk.com',
    },
    emergencyHotline: '+45 33 63 99 00 (24/7 War-Room)',
    slaTerms: {
      maxResponseTimeHours: 1,
      delayPenaltyThresholdHours: 12,
      temperatureExcursionPenalty: '₹25,00,000 / Event',
    },
    activeLanes: ['NH-48 Western (JNPT - Pune - Bengaluru)', 'North Atlantic (Hamburg - Chicago)', 'Asia-Europe (Singapore - Rotterdam)'],
    recentIncidentsCount: 1,
    status: 'ACTIVE',
  },
  {
    id: 'car-002',
    name: 'CMA CGM Group',
    code: 'CMDU',
    tier: 'PROBATION',
    modes: ['OCEAN', 'AIR'],
    onTimeRate: 81.3,
    coldChainCompliance: 92.4,
    activeShipments: 22,
    cargoValueManaged: '₹14.2 Cr',
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
      temperatureExcursionPenalty: '₹40,00,000 / Event',
    },
    activeLanes: ['Trans-Pacific (LA - Tokyo)', 'JNPT Feeder Route'],
    recentIncidentsCount: 4,
    status: 'AUDIT_PENDING',
  },
  {
    id: 'car-003',
    name: 'Hapag-Lloyd AG',
    code: 'HLCU',
    tier: 'STRATEGIC_TIER_1',
    modes: ['OCEAN', 'ROAD'],
    onTimeRate: 96.1,
    coldChainCompliance: 99.6,
    activeShipments: 34,
    cargoValueManaged: '₹18.5 Cr',
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
      temperatureExcursionPenalty: '₹30,00,000 / Event',
    },
    activeLanes: ['Indian Ocean (Mumbai - Dubai)', 'North Sea (Rotterdam - Hamburg)'],
    recentIncidentsCount: 0,
    status: 'ACTIVE',
  },
  {
    id: 'car-004',
    name: 'Kuehne + Nagel Pharma Road Fleet',
    code: 'KNRL',
    tier: 'STANDARD_TIER_2',
    modes: ['ROAD', 'INTERMODAL'],
    onTimeRate: 91.5,
    coldChainCompliance: 97.2,
    activeShipments: 28,
    cargoValueManaged: '₹9.8 Cr',
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
      temperatureExcursionPenalty: '₹15,00,000 / Event',
    },
    activeLanes: ['EU Pharma Corridor (Basel - Antwerp)', 'NH-44 South-North Express'],
    recentIncidentsCount: 1,
    status: 'ACTIVE',
  },
  {
    id: 'car-005',
    name: 'Lufthansa Cargo / Swiss WorldCargo',
    code: 'LHCR',
    tier: 'STRATEGIC_TIER_1',
    modes: ['AIR'],
    onTimeRate: 98.4,
    coldChainCompliance: 99.9,
    activeShipments: 12,
    cargoValueManaged: '₹32.0 Cr',
    claimsRate: 0.04,
    primaryContact: {
      name: 'Sabine Weber',
      role: 'Active Cold Chain Solutions Lead',
      phone: '+49 69 696 0',
      email: 'sabine.weber@lufthansa-cargo.com',
    },
    emergencyHotline: '+49 69 696 9000 (Expedited Air Triage)',
    slaTerms: {
      maxResponseTimeHours: 0.5,
      delayPenaltyThresholdHours: 2,
      temperatureExcursionPenalty: '₹75,00,000 / Event',
    },
    activeLanes: ['Frankfurt - Chicago O’Hare (ORD)', 'Zurich - Singapore Changi (SIN)', 'Mumbai (BOM) - Frankfurt (FRA)'],
    recentIncidentsCount: 0,
    status: 'ACTIVE',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<CarrierItem[]>(MOCK_CARRIERS);
  const [activeId, setActiveId] = useState<string>(MOCK_CARRIERS[0].id);
  const [tierFilter, setTierFilter] = useState<CarrierTier | 'all'>('all');
  const [modeFilter, setModeFilter] = useState<TransportMode | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getCarriers().then((liveCarriers) => {
      if (liveCarriers && liveCarriers.length > 0) {
        const mapped: CarrierItem[] = liveCarriers.map((c, idx) => {
          return {
            id: c.id,
            name: c.name,
            code: c.code,
            tier: idx < 2 ? 'STRATEGIC_TIER_1' : 'STANDARD_TIER_2',
            modes: ['OCEAN', 'INTERMODAL', 'ROAD'],
            onTimeRate: Number((93.5 + (idx % 5) * 1.2).toFixed(1)),
            coldChainCompliance: Number((97.5 + (idx % 3) * 0.8).toFixed(1)),
            activeShipments: 20 + idx * 8,
            cargoValueManaged: `₹${(15 + idx * 6).toFixed(1)} Cr`,
            claimsRate: Number((0.2 + (idx % 3) * 0.1).toFixed(2)),
            primaryContact: {
              name: `${c.name} Dispatch Ops`,
              role: 'Global Trade Coordinator',
              phone: '+91 22 6123 4500',
              email: c.contactEmail || `ops@${c.code.toLowerCase()}.com`,
            },
            emergencyHotline: '+91 22 6123 9999',
            slaTerms: {
              maxResponseTimeHours: 1,
              delayPenaltyThresholdHours: 4,
              temperatureExcursionPenalty: '₹50,00,000 / Incident',
            },
            activeLanes: ['Asia-Europe Transoceanic', 'Transpacific Super-Corridor'],
            recentIncidentsCount: idx === 1 ? 1 : 0,
            status: c.isActive ? 'ACTIVE' : 'AUDIT_PENDING',
          };
        });
        setCarriers(mapped);
        if (mapped.length > 0) {
          setActiveId(mapped[0].id);
        }
      }
    }).catch(() => {});
  }, []);

  const activeCarrier = carriers.find((c) => c.id === activeId) || carriers[0] || MOCK_CARRIERS[0];

  const filteredCarriers = useMemo(() => {
    return carriers.filter((c) => {
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      if (modeFilter !== 'all' && !c.modes.includes(modeFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.primaryContact.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [carriers, tierFilter, modeFilter, searchQuery]);

  // Network averages
  const avgOtd = (carriers.reduce((acc, c) => acc + c.onTimeRate, 0) / carriers.length).toFixed(1);
  const avgColdChain = (carriers.reduce((acc, c) => acc + c.coldChainCompliance, 0) / carriers.length).toFixed(1);
  const totalShipments = carriers.reduce((acc, c) => acc + c.activeShipments, 0);

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[24px]">apartment</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                Carrier &amp; Vendor Performance Directory
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">
                {carriers.length} CERTIFIED PARTNERS
              </span>
              <span className="font-caption text-caption text-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-ping" />
                SLA Telemetry Live
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              Contractual SLA compliance scorecards • On-Time In-Full (OTIF) telemetry &amp; emergency dispatch bridges
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Opening new carrier onboarding ISO 9001 / GDP compliance workflow.')}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">add_business</span>
          Onboard Carrier
        </button>
      </div>

      {/* ── KPI Metrics Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Network On-Time Rate
            </span>
            <span className="material-symbols-outlined text-risk-low text-[18px]">verified</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">{avgOtd}%</span>
            <span className="font-caption text-caption text-risk-low font-medium">Target: ≥ 92%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="bg-risk-low h-full" style={{ width: `${avgOtd}%` }} />
          </div>
        </div>

        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Cold Chain Compliance
            </span>
            <span className="material-symbols-outlined text-teal-400 text-[18px]">ac_unit</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">{avgColdChain}%</span>
            <span className="font-caption text-caption text-teal-400 font-medium">MKT Integrity</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="bg-teal-400 h-full" style={{ width: `${avgColdChain}%` }} />
          </div>
        </div>

        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Managed Active Loads
            </span>
            <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">{totalShipments}</span>
            <span className="font-caption text-caption text-primary font-medium">₹99.3 Cr Managed</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[85%]" />
          </div>
        </div>

        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Under Review / Audit
            </span>
            <span className="material-symbols-outlined text-risk-critical text-[18px]">gavel</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-risk-critical">1 Carrier</span>
            <span className="font-caption text-caption text-risk-critical font-medium">CMA CGM Probation</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="bg-risk-critical h-full w-[20%]" />
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search carrier name, code (e.g. MAEU) or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-primary placeholder:text-text-disabled text-caption font-caption outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as CarrierTier | 'all')}
            className="px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary text-caption font-caption outline-none focus:border-primary"
          >
            <option value="all">All Tiers</option>
            <option value="STRATEGIC_TIER_1">Tier 1 Strategic</option>
            <option value="STANDARD_TIER_2">Tier 2 Secondary</option>
            <option value="PROBATION">Probationary Audit</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as TransportMode | 'all')}
            className="px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary text-caption font-caption outline-none focus:border-primary"
          >
            <option value="all">All Modes</option>
            <option value="OCEAN">Ocean</option>
            <option value="AIR">Air Cargo</option>
            <option value="ROAD">Overland Road</option>
            <option value="INTERMODAL">Intermodal</option>
          </select>

          <span className="font-caption text-caption text-text-disabled ml-1">
            {filteredCarriers.length} of {carriers.length}
          </span>
        </div>
      </div>

      {/* ── Split Layout: Carrier List & Detailed Workbench ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Carrier Cards */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {filteredCarriers.map((carrier) => {
            const isSelected = activeCarrier.id === carrier.id;
            const isTier1 = carrier.tier === 'STRATEGIC_TIER_1';
            const isProbation = carrier.tier === 'PROBATION';

            return (
              <div
                key={carrier.id}
                onClick={() => setActiveId(carrier.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected
                    ? 'bg-surface-container-low border-primary shadow-md'
                    : 'bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-container-lowest'
                  }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-text-primary px-1.5 py-0.5 rounded bg-surface-container-high">
                        {carrier.code}
                      </span>
                      <h3 className="font-card-title text-card-title text-text-primary">{carrier.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full font-semibold ${isTier1 ? 'bg-risk-low/15 text-risk-low' : isProbation ? 'bg-risk-critical/15 text-risk-critical' : 'bg-primary-soft text-primary'
                        }`}>
                        {isTier1 ? 'Tier 1 Strategic' : isProbation ? 'Probation Review' : 'Tier 2 Secondary'}
                      </span>
                      {carrier.modes.map((m) => (
                        <span key={m} className="font-badge-label text-badge-label px-1.5 py-0.5 rounded bg-surface-container-high text-text-secondary">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-card-title text-card-title text-text-primary">{carrier.activeShipments} Active</div>
                    <div className={`font-mono text-caption font-bold ${carrier.onTimeRate >= 92 ? 'text-risk-low' : 'text-risk-critical'}`}>
                      {carrier.onTimeRate}% OTD
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-border-subtle text-caption font-caption text-text-muted">
                  <div>
                    <span>Cold Chain: </span>
                    <strong className="text-text-primary">{carrier.coldChainCompliance}%</strong>
                  </div>
                  <div className="text-right">
                    <span>Managed: </span>
                    <strong className="text-text-primary">{carrier.cargoValueManaged}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Workbench */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-md space-y-6 sticky top-20">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-bold text-primary">{activeCarrier.code}</span>
                <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full font-semibold ${activeCarrier.tier === 'STRATEGIC_TIER_1' ? 'bg-risk-low/15 text-risk-low' : 'bg-risk-critical/15 text-risk-critical'
                  }`}>
                  {activeCarrier.tier.replace(/_/g, ' ')}
                </span>
                <span className="font-caption text-caption text-text-muted">Status: {activeCarrier.status}</span>
              </div>
              <h2 className="font-section-title text-section-title text-text-primary">
                {activeCarrier.name}
              </h2>
            </div>

            <div className="text-right">
              <div className="font-caption text-caption text-text-muted">Managed Volume</div>
              <div className="font-section-title text-section-title text-primary font-bold">
                {activeCarrier.cargoValueManaged}
              </div>
            </div>
          </div>

          {/* Contractual SLA Parameters Box */}
          <div className="p-4 rounded-lg bg-bg-surface border border-border-subtle space-y-2.5">
            <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              Contractual SLA Governance &amp; Penalty Clauses
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-caption font-caption pt-1">
              <div>
                <div className="text-text-muted">Incident Response MTTA:</div>
                <div className="font-bold text-text-primary">&le; {activeCarrier.slaTerms.maxResponseTimeHours} Hour</div>
              </div>
              <div>
                <div className="text-text-muted">Delay Penalty Trigger:</div>
                <div className="font-bold text-text-primary">&gt; {activeCarrier.slaTerms.delayPenaltyThresholdHours}h Unplanned</div>
              </div>
              <div>
                <div className="text-text-muted">Temp Excursion Penalty:</div>
                <div className="font-bold text-risk-high">{activeCarrier.slaTerms.temperatureExcursionPenalty}</div>
              </div>
            </div>
          </div>

          {/* Active Corridors */}
          <div className="space-y-2">
            <div className="font-caption text-caption uppercase tracking-wider text-text-muted font-bold">
              Allocated Commercial Corridors
            </div>
            <div className="space-y-1.5">
              {activeCarrier.activeLanes.map((lane, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-bg-surface border border-border-subtle flex items-center gap-2 text-caption font-caption text-text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-primary">route</span>
                  <span>{lane}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Dispatch Bridge */}
          <div className="p-4 rounded-lg bg-risk-critical/5 border border-risk-critical/20 space-y-1.5">
            <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-risk-critical font-bold">
              <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
              Emergency Crisis War-Room Dispatch
            </div>
            <div className="font-card-title text-card-title text-text-primary">{activeCarrier.primaryContact.name} ({activeCarrier.primaryContact.role})</div>
            <div className="font-mono text-caption text-risk-critical font-bold">📞 {activeCarrier.emergencyHotline}</div>
            <div className="font-caption text-caption text-text-muted">✉️ {activeCarrier.primaryContact.email}</div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2.5 pt-2 border-t border-border-subtle">
            <button
              onClick={() => alert(`Opening emergency direct teleconference bridge with ${activeCarrier.name} operations tower.`)}
              className="px-4 py-2 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              Open Dispatch Bridge
            </button>
            <button
              onClick={() => alert(`Initiating formal annual GDP compliance audit for ${activeCarrier.name}.`)}
              className="px-4 py-2 rounded-lg bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle font-badge-label text-badge-label flex items-center gap-1.5 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Trigger GDP Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
