/**
 * SupplyShield AI — GDP / GxP Compliance & Audit Ledger
 *
 * Regulatory compliance suite matching Stitch Design System:
 * - Mean Kinetic Temperature (MKT) stability validation
 * - FDA 21 CFR Part 11 electronic signature audit ledger
 * - WHO GDP pharmaceutical quality release authorization
 * - Cryptographic SHA-256 certificate hashing
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ComplianceStatus = 'COMPLIANT' | 'EXCURSION_REVIEW' | 'QA_HOLD';
type RegulatoryStandard = 'WHO_GDP' | 'FDA_21CFR11' | 'EMA_GXP' | 'ISO_17025';

interface ComplianceCertificate {
  id: string;
  certificateNumber: string;
  shipmentCode: string;
  cargoDescription: string;
  batchLotNumber: string;
  consignee: string;
  standards: RegulatoryStandard[];
  status: ComplianceStatus;
  mktCalculatedCelsius: number;
  mktAllowedMaxCelsius: number;
  totalExcursionMinutes: number;
  signedBy: string;
  signedAt: string;
  sha256Hash: string;
  qaOfficerNotes: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CERTIFICATES: ComplianceCertificate[] = [
  {
    id: 'comp-001',
    certificateNumber: 'GDP-CERT-2024-8841',
    shipmentCode: 'SS-2024-0001',
    cargoDescription: 'Recombinant Insulin 100IU/ml (Cold Chain 2-8°C)',
    batchLotNumber: 'LOT-INSU-88902',
    consignee: 'Chicago / JNPT Central Healthcare Depot',
    standards: ['WHO_GDP', 'FDA_21CFR11', 'ISO_17025'],
    status: 'EXCURSION_REVIEW',
    mktCalculatedCelsius: 8.4,
    mktAllowedMaxCelsius: 8.0,
    totalExcursionMinutes: 87,
    signedBy: 'Dr. Priya Nair (Lead QA Auditor)',
    signedAt: '10:45 UTC (Dec 14)',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    qaOfficerNotes: 'Excursion detected above 8°C threshold during Kolhapur flood holdup. MKT calculation indicates 0.4°C cumulative deviation. 24h stability testing quarantine protocol recommended.',
  },
  {
    id: 'comp-002',
    certificateNumber: 'GDP-CERT-2024-8840',
    shipmentCode: 'SS-2024-0002',
    cargoDescription: 'Monoclonal Antibody Vials (Active Cold Chain)',
    batchLotNumber: 'LOT-MAB-4109',
    consignee: 'Erasmus University Medical Center, Rotterdam',
    standards: ['EMA_GXP', 'WHO_GDP'],
    status: 'COMPLIANT',
    mktCalculatedCelsius: 4.8,
    mktAllowedMaxCelsius: 8.0,
    totalExcursionMinutes: 0,
    signedBy: 'Lars van der Beek (Authorized QA Person)',
    signedAt: '08:30 UTC (Dec 14)',
    sha256Hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    qaOfficerNotes: 'All 14 logger segments verified within 2.0°C - 5.4°C thermal envelope. Clean chain-of-custody transfer confirmed.',
  },
  {
    id: 'comp-003',
    certificateNumber: 'GDP-CERT-2024-8839',
    shipmentCode: 'SS-2024-0003',
    cargoDescription: 'mRNA Vaccine Batches (Deep Freeze -20°C)',
    batchLotNumber: 'LOT-MRNA-9912',
    consignee: 'Tokyo Central BioPharma Depot',
    standards: ['FDA_21CFR11', 'WHO_GDP'],
    status: 'COMPLIANT',
    mktCalculatedCelsius: -18.2,
    mktAllowedMaxCelsius: -15.0,
    totalExcursionMinutes: 0,
    signedBy: 'Kenji Takahashi (Director Quality)',
    signedAt: '16:00 UTC (Dec 13)',
    sha256Hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    qaOfficerNotes: 'Cryogenic loggers confirmed continuous deep freeze envelope throughout trans-Pacific voyage. Immediate clinical release approved.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [certificates, setCertificates] = useState<ComplianceCertificate[]>(MOCK_CERTIFICATES);
  const [activeId, setActiveId] = useState<string>(MOCK_CERTIFICATES[0].id);
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCert = certificates.find((c) => c.id === activeId) || certificates[0];

  const filtered = useMemo(() => {
    return certificates.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.certificateNumber.toLowerCase().includes(q) ||
          c.shipmentCode.toLowerCase().includes(q) ||
          c.cargoDescription.toLowerCase().includes(q) ||
          c.batchLotNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [certificates, statusFilter, searchQuery]);

  const handleApproveRelease = (id: string) => {
    setCertificates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
            ...c,
            status: 'COMPLIANT',
            signedBy: 'Dr. Priya Nair (Lead QA Auditor - Digital E-Signature Validated)',
            signedAt: 'Just now (Dec 14)',
            qaOfficerNotes: 'MKT stability calculation validated under FDA 21 CFR Part 11. Final batch release authorized.',
          }
          : c
      )
    );
    alert('Qualified Person (QP) regulatory release approved. Certificate signed with SHA-256 digital signature.');
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-400 border border-teal-500/20">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                GDP &amp; GxP Regulatory Compliance Ledger
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 font-semibold">
                WHO-GDP &amp; 21 CFR PART 11
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              Mean Kinetic Temperature (MKT) stability validation • Cryptographic batch release certificates &amp; chain-of-custody proofs
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Consolidated GDP Regulatory Audit Package (PDF/XML + SHA-256 Signatures) generated and downloaded.')}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export Audit Package
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search certificate, lot #, or cargo description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-primary placeholder:text-text-disabled text-caption font-caption outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplianceStatus | 'all')}
            className="px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary text-caption font-caption outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLIANT">Fully Compliant</option>
            <option value="EXCURSION_REVIEW">Under Excursion Review</option>
            <option value="QA_HOLD">QA Hold</option>
          </select>

          <span className="font-caption text-caption text-text-disabled ml-1">
            {filtered.length} of {certificates.length}
          </span>
        </div>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Certificate List */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {filtered.map((cert) => {
            const isSelected = activeCert.id === cert.id;
            const isCompliant = cert.status === 'COMPLIANT';

            return (
              <div
                key={cert.id}
                onClick={() => setActiveId(cert.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected
                    ? 'bg-surface-container-low border-teal-500 shadow-md'
                    : 'bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-container-lowest'
                  }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-teal-400 px-1.5 py-0.5 rounded bg-teal-500/10">
                        {cert.certificateNumber}
                      </span>
                      <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full font-semibold ${isCompliant ? 'bg-risk-low/15 text-risk-low' : 'bg-risk-high/15 text-risk-high'
                        }`}>
                        {cert.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="font-card-title text-card-title text-text-primary leading-tight">{cert.cargoDescription}</h3>
                    <div className="font-mono text-caption text-text-muted mt-1">
                      📦 {cert.shipmentCode} • Lot: {cert.batchLotNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-caption font-caption text-text-muted mt-3 pt-2.5 border-t border-border-subtle">
                  <span>MKT: <strong className={cert.mktCalculatedCelsius <= cert.mktAllowedMaxCelsius ? 'text-risk-low' : 'text-risk-critical'}>{cert.mktCalculatedCelsius}°C</strong> (Max {cert.mktAllowedMaxCelsius}°C)</span>
                  <span className="text-teal-400 font-mono text-[11px]">21 CFR Part 11</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Certificate Workbench */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-md space-y-6 sticky top-20">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-bold text-teal-400">{activeCert.certificateNumber}</span>
                <span className="font-badge-label text-badge-label px-2 py-0.5 rounded bg-surface-container-high text-text-secondary">
                  {activeCert.standards.join(' • ')}
                </span>
              </div>
              <h2 className="font-section-title text-section-title text-text-primary leading-tight">
                {activeCert.cargoDescription}
              </h2>
            </div>
            <div className="text-right">
              <div className="font-caption text-caption text-text-muted">Consignee</div>
              <div className="font-card-title text-card-title text-text-primary">{activeCert.consignee.split(',')[0]}</div>
            </div>
          </div>

          {/* MKT Assessment */}
          <div className="p-4 rounded-lg bg-bg-surface border border-border-subtle space-y-2.5">
            <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-teal-400 font-bold">
              <span className="material-symbols-outlined text-[18px]">thermostat</span>
              Mean Kinetic Temperature (MKT) Stability Calculation
            </div>
            <div className="grid grid-cols-3 gap-3 text-caption font-caption pt-1">
              <div>
                <div className="text-text-muted">Calculated MKT:</div>
                <div className="font-bold text-text-primary">{activeCert.mktCalculatedCelsius}°C</div>
              </div>
              <div>
                <div className="text-text-muted">Allowed Upper Limit:</div>
                <div className="font-bold text-text-primary">{activeCert.mktAllowedMaxCelsius}°C</div>
              </div>
              <div>
                <div className="text-text-muted">Excursion Duration:</div>
                <div className="font-bold text-risk-high">{activeCert.totalExcursionMinutes} Minutes</div>
              </div>
            </div>
          </div>

          {/* QA Observation */}
          <div className="p-4 rounded-lg bg-surface-container-high/40 border border-border-subtle space-y-1">
            <div className="font-caption text-caption uppercase tracking-wider text-text-muted font-bold">
              QA Qualified Person (QP) Observation
            </div>
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              {activeCert.qaOfficerNotes}
            </p>
          </div>

          {/* SHA-256 Ledger Digest */}
          <div className="p-4 rounded-lg bg-primary-soft/30 border border-primary/20 space-y-1.5">
            <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-primary font-bold">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Immutable SHA-256 Digital Certificate Anchor
            </div>
            <div className="font-mono text-[11px] text-primary break-all bg-bg-surface p-2 rounded border border-border-subtle">
              {activeCert.sha256Hash}
            </div>
            <div className="font-caption text-caption text-text-muted">
              Digitally Signed By: <strong className="text-text-primary">{activeCert.signedBy}</strong> ({activeCert.signedAt})
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-border-subtle">
            {activeCert.status !== 'COMPLIANT' && (
              <button
                onClick={() => handleApproveRelease(activeCert.id)}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Approve QP Batch Release
              </button>
            )}
            <button
              onClick={() => alert(`Downloading verified certificate ${activeCert.certificateNumber}.pdf.`)}
              className="px-4 py-2 rounded-lg bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle font-badge-label text-badge-label flex items-center gap-1.5 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              Download Signed Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
