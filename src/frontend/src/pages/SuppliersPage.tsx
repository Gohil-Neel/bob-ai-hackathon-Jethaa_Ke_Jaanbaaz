/**
 * SupplyShield AI — Supplier & Partner Portal
 *
 * Tier-1 & Tier-2 raw material / API pharmaceutical supplier intelligence:
 * - OTIF (On-Time In-Full) manufacturing compliance scorecards
 * - Single-source dependency & geo-political vulnerability heatmaps
 * - Purchase order dispatch tracking & yield defect rates
 * - Direct supplier escalation bridge & QA audit scheduling
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SupplierTier = 'TIER_1_CRITICAL' | 'TIER_2_SECONDARY' | 'QUALIFIED_BACKUP';

interface Supplier {
  id: string;
  name: string;
  code: string;
  category: string;
  country: string;
  facilityLocation: string;
  tier: SupplierTier;
  otifRate: number; // e.g. 96.4%
  qualityDefectPpm: number; // Parts per million defects, e.g. 12 PPM
  avgLeadTimeDays: number;
  singleSourceRisk: boolean;
  activeOrdersCount: number;
  annualSpendUsd: string;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  gmpCertifiedUntil: string;
  keyMaterialsSupplied: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Lonza AG',
    code: 'SUP-LONZ-01',
    category: 'Biologics API & Fermentation',
    country: 'Switzerland',
    facilityLocation: 'Visp & Basel Facilities',
    tier: 'TIER_1_CRITICAL',
    otifRate: 98.2,
    qualityDefectPpm: 4,
    avgLeadTimeDays: 45,
    singleSourceRisk: true,
    activeOrdersCount: 6,
    annualSpendUsd: '$48.5M',
    primaryContact: {
      name: 'Dr. Beatrix Meier',
      role: 'Head of Global Pharma Supply',
      email: 'b.meier@lonza.com',
      phone: '+41 61 316 81 11',
    },
    gmpCertifiedUntil: '2026-11-30',
    keyMaterialsSupplied: ['Recombinant Human Insulin Crystals', 'Monoclonal Antibody Intermediates'],
  },
  {
    id: 'sup-002',
    name: 'WuXi Biologics',
    code: 'SUP-WUXI-02',
    category: 'Cell Culture & Viral Vector Processing',
    country: 'China',
    facilityLocation: 'Wuxi City & Shanghai Campus',
    tier: 'TIER_1_CRITICAL',
    otifRate: 94.1,
    qualityDefectPpm: 18,
    avgLeadTimeDays: 60,
    singleSourceRisk: false,
    activeOrdersCount: 9,
    annualSpendUsd: '$34.2M',
    primaryContact: {
      name: 'Chen Wei',
      role: 'Commercial Operations VP',
      email: 'chen_wei@wuxibiologics.com',
      phone: '+86 21 2066 3000',
    },
    gmpCertifiedUntil: '2025-08-15',
    keyMaterialsSupplied: ['Sterile Bio-reactor Media', 'Conjugated Antibody Drug Payloads'],
  },
  {
    id: 'sup-003',
    name: 'Schott Pharma AG',
    code: 'SUP-SCHT-03',
    category: 'Type 1 Borosilicate Glass Vials & Syringes',
    country: 'Germany',
    facilityLocation: 'Mainz & Mitterteich Plants',
    tier: 'TIER_1_CRITICAL',
    otifRate: 99.1,
    qualityDefectPpm: 2,
    avgLeadTimeDays: 28,
    singleSourceRisk: false,
    activeOrdersCount: 14,
    annualSpendUsd: '$19.8M',
    primaryContact: {
      name: 'Jürgen Bachmann',
      role: 'Senior Director Pharma Containment',
      email: 'juergen.bachmann@schott.com',
      phone: '+49 6131 66 0',
    },
    gmpCertifiedUntil: '2027-03-20',
    keyMaterialsSupplied: ['Everic Pure 2R Vials', 'Pre-fillable Cryo-Syringes'],
  },
  {
    id: 'sup-004',
    name: 'Aurobindo Pharma Active Substances',
    code: 'SUP-AURO-04',
    category: 'Small Molecule Active Ingredients',
    country: 'India',
    facilityLocation: 'Hyderabad Unit VII',
    tier: 'TIER_2_SECONDARY',
    otifRate: 91.5,
    qualityDefectPpm: 32,
    avgLeadTimeDays: 40,
    singleSourceRisk: false,
    activeOrdersCount: 5,
    annualSpendUsd: '$12.4M',
    primaryContact: {
      name: 'Rajesh Reddy',
      role: 'Global Export Delivery Manager',
      email: 'r.reddy@aurobindo.com',
      phone: '+91 40 6672 5000',
    },
    gmpCertifiedUntil: '2025-12-31',
    keyMaterialsSupplied: ['Cardiovascular APIs', 'Sterile Formulation Excipients'],
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<SupplierTier, { label: string; bg: string; text: string; border: string }> = {
  TIER_1_CRITICAL:  { label: '🔴 Tier 1 Strategic', bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.35)' },
  TIER_2_SECONDARY: { label: '🔵 Tier 2 Secondary', bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.35)' },
  QUALIFIED_BACKUP: { label: '🟢 Qualified Backup', bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.35)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SuppliersPage() {
  const [suppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(MOCK_SUPPLIERS[0]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<SupplierTier | 'ALL'>('ALL');

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (tierFilter !== 'ALL' && s.tier !== tierFilter) return false;
      if (
        search &&
        !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.code.toLowerCase().includes(search.toLowerCase()) &&
        !s.country.toLowerCase().includes(search.toLowerCase()) &&
        !s.category.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [suppliers, tierFilter, search]);

  const avgOtif = (suppliers.reduce((acc, s) => acc + s.otifRate, 0) / suppliers.length).toFixed(1);
  const singleSourceCount = suppliers.filter((s) => s.singleSourceRisk).length;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🏭</span>
            <h1 className="text-2xl font-extrabold text-white">Supplier & Partner Portal</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {suppliers.length} Qualified Manufacturing Partners
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            OTIF delivery compliance, single-source dependency risk & GMP facility certifications
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Initiating dual-sourcing qualification RFP for single-source biologic APIs.')}
            className="text-sm px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all"
          >
            + Qualify Secondary Source
          </button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Network OTIF Rate</div>
          <div className="text-3xl font-extrabold text-green-400">{avgOtif}%</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>On-Time In-Full Target: ≥ 95%</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Single-Source Vulnerabilities</div>
          <div className="text-3xl font-extrabold text-red-400">{singleSourceCount}</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Lonza AG (Insulin Crystals)</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Active Manufacturing POs</div>
          <div className="text-3xl font-extrabold text-blue-400">34</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Valued at $114.9M YTD</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Avg Quality Defect PPM</div>
          <div className="text-3xl font-extrabold text-teal-400">14 PPM</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>GxP Tolerance: &lt; 50 PPM</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          type="text"
          placeholder="🔍 Search by supplier name, code, material or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none w-80"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as SupplierTier | 'ALL')}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ background: 'rgba(25,27,40,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
        >
          <option value="ALL">All Supplier Tiers</option>
          <option value="TIER_1_CRITICAL">Tier 1 Strategic</option>
          <option value="TIER_2_SECONDARY">Tier 2 Secondary</option>
        </select>
        <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {filteredSuppliers.length} of {suppliers.length} manufacturing partners
        </span>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredSuppliers.map((supplier) => {
            const isSelected = selectedSupplier?.id === supplier.id;
            const tierStyle = TIER_CONFIG[supplier.tier];

            return (
              <div
                key={supplier.id}
                onClick={() => setSelectedSupplier(supplier)}
                className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{
                  background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.025)',
                  border: isSelected ? '1.5px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white/80">
                        {supplier.code}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: tierStyle.bg, color: tierStyle.text, border: `1px solid ${tierStyle.border}` }}>
                        {tierStyle.label}
                      </span>
                      {supplier.singleSourceRisk && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                          ⚠️ Single-Source
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">{supplier.name}</h3>
                    <div className="text-xs mt-1 text-white/50">
                      🌍 {supplier.country} · {supplier.facilityLocation}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-white">{supplier.otifRate}% OTIF</div>
                    <div className="text-xs font-mono text-white/40">{supplier.avgLeadTimeDays} Days Lead Time</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {supplier.keyMaterialsSupplied.map((mat, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/70">
                      🧪 {mat}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Supplier Deep-Dive Panel */}
        {selectedSupplier && (
          <div className="p-6 rounded-2xl flex flex-col gap-5" style={{ background: 'rgba(10,12,20,0.97)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-indigo-400">{selectedSupplier.code}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">GMP: {selectedSupplier.gmpCertifiedUntil}</span>
              </div>
              <h2 className="text-base font-extrabold text-white">{selectedSupplier.name}</h2>
              <div className="text-xs mt-1 text-white/50">{selectedSupplier.category}</div>
            </div>

            {/* Performance KPI Benchmarks */}
            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">Manufacturing Quality & SLA</div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">OTIF Fulfillment:</span>
                <span className="font-bold text-green-400">{selectedSupplier.otifRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Defect Rate:</span>
                <span className="font-bold text-white">{selectedSupplier.qualityDefectPpm} PPM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Average Lead Time:</span>
                <span className="font-bold text-white">{selectedSupplier.avgLeadTimeDays} Days</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Annual Contract Value:</span>
                <span className="font-bold text-white">{selectedSupplier.annualSpendUsd}</span>
              </div>
            </div>

            {/* Direct Contact */}
            <div className="p-4 rounded-xl space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-white/40">Primary Commercial Contact</div>
              <div className="text-xs font-bold text-white">{selectedSupplier.primaryContact.name}</div>
              <div className="text-xs text-white/50">{selectedSupplier.primaryContact.role}</div>
              <div className="text-xs font-mono text-indigo-300">✉️ {selectedSupplier.primaryContact.email}</div>
              <div className="text-xs font-mono text-white/40">📞 {selectedSupplier.primaryContact.phone}</div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => alert(`Connecting directly to ${selectedSupplier.name} ERP order dispatch terminal.`)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                📞 Open Supplier Dispatch Bridge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
