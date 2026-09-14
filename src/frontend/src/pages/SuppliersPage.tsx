/**
 * SupplyShield AI — Supplier & Partner Portal
 *
 * Tier-1 & Tier-2 manufacturing partner scorecards matching Stitch Design System:
 * - OTIF fulfillment ratings, defect PPM, single-source dependency risk
 * - GMP facility certifications & purchase order pipelines
 * - Stitch tokens: bg-bg-surface, bg-surface-container-lowest, material-symbols-outlined
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SupplierTier = 'TIER_1_CRITICAL' | 'TIER_2_SECONDARY';

interface SupplierPartner {
  id: string;
  name: string;
  code: string;
  category: string;
  country: string;
  facilityLocation: string;
  tier: SupplierTier;
  otifRate: number;
  qualityDefectPpm: number;
  avgLeadTimeDays: number;
  singleSourceRisk: boolean;
  activeOrdersCount: number;
  annualSpend: string;
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

const MOCK_SUPPLIERS: SupplierPartner[] = [
  {
    id: 'sup-001',
    name: 'Lonza AG Active Biologics',
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
    annualSpend: '₹148.5 Cr',
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
    name: 'Aurobindo Pharma Active Substances',
    code: 'SUP-AURO-04',
    category: 'Small Molecule Active Ingredients',
    country: 'India',
    facilityLocation: 'Hyderabad Unit VII, Telangana',
    tier: 'TIER_1_CRITICAL',
    otifRate: 96.5,
    qualityDefectPpm: 12,
    avgLeadTimeDays: 28,
    singleSourceRisk: false,
    activeOrdersCount: 14,
    annualSpend: '₹84.2 Cr',
    primaryContact: {
      name: 'Rajesh Reddy',
      role: 'Global Export Delivery Lead',
      email: 'r.reddy@aurobindo.com',
      phone: '+91 40 6672 5000',
    },
    gmpCertifiedUntil: '2027-03-20',
    keyMaterialsSupplied: ['Cardiovascular APIs', 'Sterile Formulation Excipients'],
  },
  {
    id: 'sup-003',
    name: 'Schott Pharma Container Systems',
    code: 'SUP-SCHT-03',
    category: 'Type 1 Borosilicate Glass Vials',
    country: 'Germany',
    facilityLocation: 'Mainz & Mitterteich Plants',
    tier: 'TIER_2_SECONDARY',
    otifRate: 99.1,
    qualityDefectPpm: 2,
    avgLeadTimeDays: 21,
    singleSourceRisk: false,
    activeOrdersCount: 8,
    annualSpend: '₹38.0 Cr',
    primaryContact: {
      name: 'Jürgen Bachmann',
      role: 'Senior Director Pharma Containment',
      email: 'juergen.bachmann@schott.com',
      phone: '+49 6131 66 0',
    },
    gmpCertifiedUntil: '2026-08-15',
    keyMaterialsSupplied: ['Everic Pure 2R Vials', 'Pre-fillable Cryo-Syringes'],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SuppliersPage() {
  const [suppliers] = useState<SupplierPartner[]>(MOCK_SUPPLIERS);
  const [activeId, setActiveId] = useState<string>(MOCK_SUPPLIERS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const activeSupplier = suppliers.find((s) => s.id === activeId) || suppliers[0];

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [suppliers, searchQuery]);

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[24px]">factory</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                Supplier &amp; Manufacturing Partner Portal
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">
                {suppliers.length} QUALIFIED SUPPLIERS
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              OTIF delivery compliance, single-source dependency risk heatmaps &amp; GMP facility audits
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Initiating dual-sourcing qualification RFP for single-source biologic APIs.')}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Qualify Secondary Source
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search supplier name, code, material or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-primary placeholder:text-text-disabled text-caption font-caption outline-none focus:border-primary"
          />
        </div>

        <span className="font-caption text-caption text-text-disabled ml-1">
          {filtered.length} of {suppliers.length}
        </span>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Supplier List */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {filtered.map((sup) => {
            const isSelected = activeSupplier.id === sup.id;

            return (
              <div
                key={sup.id}
                onClick={() => setActiveId(sup.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-surface-container-low border-primary shadow-md'
                    : 'bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-text-primary px-1.5 py-0.5 rounded bg-surface-container-high">
                        {sup.code}
                      </span>
                      {sup.singleSourceRisk && (
                        <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical font-bold border border-risk-critical/30">
                          ⚠️ Single-Source Risk
                        </span>
                      )}
                    </div>
                    <h3 className="font-card-title text-card-title text-text-primary leading-tight">{sup.name}</h3>
                    <div className="font-caption text-caption text-text-muted mt-1">
                      🌍 {sup.country} • {sup.facilityLocation}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-card-title text-card-title text-risk-low">{sup.otifRate}% OTIF</div>
                    <div className="font-mono text-caption text-text-muted">{sup.avgLeadTimeDays}d Lead Time</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-border-subtle">
                  {sup.keyMaterialsSupplied.map((m, idx) => (
                    <span key={idx} className="font-badge-label text-badge-label px-1.5 py-0.5 rounded bg-surface-container-high text-text-secondary">
                      🧪 {m}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Supplier Workbench */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-md space-y-6 sticky top-20">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-bold text-primary">{activeSupplier.code}</span>
                <span className="font-badge-label text-badge-label px-2 py-0.5 rounded bg-surface-container-high text-text-secondary">
                  GMP Valid: {activeSupplier.gmpCertifiedUntil}
                </span>
              </div>
              <h2 className="font-section-title text-section-title text-text-primary leading-tight">
                {activeSupplier.name}
              </h2>
            </div>
            <div className="text-right">
              <div className="font-caption text-caption text-text-muted">Annual Spend</div>
              <div className="font-section-title text-section-title text-primary font-bold">{activeSupplier.annualSpend}</div>
            </div>
          </div>

          {/* SLA Performance Box */}
          <div className="p-4 rounded-lg bg-bg-surface border border-border-subtle space-y-2.5">
            <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Manufacturing Quality &amp; OTIF Benchmarks
            </div>
            <div className="grid grid-cols-3 gap-3 text-caption font-caption pt-1">
              <div>
                <div className="text-text-muted">OTIF Rate:</div>
                <div className="font-bold text-risk-low">{activeSupplier.otifRate}%</div>
              </div>
              <div>
                <div className="text-text-muted">Defect PPM:</div>
                <div className="font-bold text-text-primary">{activeSupplier.qualityDefectPpm} PPM</div>
              </div>
              <div>
                <div className="text-text-muted">Avg Lead Time:</div>
                <div className="font-bold text-text-primary">{activeSupplier.avgLeadTimeDays} Days</div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-lg bg-surface-container-high/40 border border-border-subtle space-y-1">
            <div className="font-caption text-caption uppercase tracking-wider text-text-muted font-bold">
              Primary Commercial &amp; Supply Contact
            </div>
            <div className="font-card-title text-card-title text-text-primary">{activeSupplier.primaryContact.name} ({activeSupplier.primaryContact.role})</div>
            <div className="font-caption text-caption text-primary">✉️ {activeSupplier.primaryContact.email}</div>
            <div className="font-caption text-caption text-text-muted">📞 {activeSupplier.primaryContact.phone}</div>
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-border-subtle">
            <button
              onClick={() => alert(`Connecting directly to ${activeSupplier.name} ERP procurement bridge.`)}
              className="px-4 py-2 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              Open Supplier Dispatch Bridge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
