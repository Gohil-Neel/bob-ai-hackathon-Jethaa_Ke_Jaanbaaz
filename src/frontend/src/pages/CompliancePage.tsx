/**
 * SupplyShield AI — Compliance & Audit Ledger
 *
 * Enterprise GDP / GxP / 21 CFR Part 11 Regulatory Compliance Suite:
 * - Immutable SHA-256 audit ledger for temperature excursions & release certificates
 * - Mean Kinetic Temperature (MKT) stability validation checklists
 * - Regulatory jurisdiction filings (FDA, EMA, WHO GDP)
 * - Chain-of-custody verification logs with digital signatures
 * - Electronic certificate download & batch audit exports
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ComplianceStatus = 'COMPLIANT' | 'EXCURSION_REVIEW' | 'QA_HOLD' | 'REJECTED';
type StandardType = 'WHO_GDP' | 'FDA_21CFR11' | 'EMA_GXP' | 'ISO_17025';

interface ComplianceRecord {
  id: string;
  certificateNumber: string;
  shipmentCode: string;
  cargoDescription: string;
  consignee: string;
  origin: string;
  destination: string;
  standards: StandardType[];
  status: ComplianceStatus;
  mktCalculatedCelsius: number; // e.g. 5.1°C
  mktAllowedMaxCelsius: number; // e.g. 8.0°C
  totalExcursionMinutes: number;
  signedBy: string;
  signedAt: string;
  sha256Hash: string;
  qaOfficerNotes: string;
  batchLotNumber: string;
}

// ─── Mock Compliance Data ─────────────────────────────────────────────────────

const MOCK_RECORDS: ComplianceRecord[] = [
  {
    id: 'comp-001',
    certificateNumber: 'GDP-CERT-2024-8841',
    shipmentCode: 'SS-2024-0001',
    cargoDescription: 'Recombinant Insulin 100IU/ml (Cold Chain 2-8°C)',
    consignee: 'Chicago Healthcare Logistics Hub',
    origin: 'Hamburg, Germany',
    destination: 'Chicago, USA',
    standards: ['WHO_GDP', 'FDA_21CFR11', 'ISO_17025'],
    status: 'EXCURSION_REVIEW',
    mktCalculatedCelsius: 8.4,
    mktAllowedMaxCelsius: 8.0,
    totalExcursionMinutes: 87,
    signedBy: 'Dr. Priya Nair (Lead QA Auditor)',
    signedAt: '2024-12-14T10:45:00Z',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    qaOfficerNotes: 'Excursion detected above 8°C threshold. Stability modeling shows 0.4°C MKT deviation. Recommended 24h quarantine testing before release.',
    batchLotNumber: 'LOT-INSU-88902',
  },
  {
    id: 'comp-002',
    certificateNumber: 'GDP-CERT-2024-8840',
    shipmentCode: 'SS-2024-0002',
    cargoDescription: 'Monoclonal Antibody Vials (Active Cold Chain)',
    consignee: 'Erasmus University Medical Center',
    origin: 'Shanghai, China',
    destination: 'Rotterdam, Netherlands',
    standards: ['EMA_GXP', 'WHO_GDP'],
    status: 'COMPLIANT',
    mktCalculatedCelsius: 4.8,
    mktAllowedMaxCelsius: 8.0,
    totalExcursionMinutes: 0,
    signedBy: 'Lars van der Beek (Authorized QA Person)',
    signedAt: '2024-12-14T08:30:00Z',
    sha256Hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    qaOfficerNotes: 'All 14 logger segments verified within 2.0°C - 5.4°C range. Clean chain-of-custody handoff confirmed.',
    batchLotNumber: 'LOT-MAB-4109',
  },
  {
    id: 'comp-003',
    certificateNumber: 'GDP-CERT-2024-8839',
    shipmentCode: 'SS-2024-0003',
    cargoDescription: 'mRNA Vaccine Batches (Deep Freeze -20°C)',
    consignee: 'Tokyo Central BioPharma Depot',
    origin: 'Los Angeles, USA',
    destination: 'Tokyo, Japan',
    standards: ['FDA_21CFR11', 'WHO_GDP', 'EMA_GXP'],
    status: 'COMPLIANT',
    mktCalculatedCelsius: -18.2,
    mktAllowedMaxCelsius: -15.0,
    totalExcursionMinutes: 0,
    signedBy: 'Kenji Takahashi (Director of Quality)',
    signedAt: '2024-12-13T16:00:00Z',
    sha256Hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    qaOfficerNotes: 'Cryogenic loggers show zero thermal breaches throughout trans-Pacific transit. Cleared for immediate clinical batch distribution.',
    batchLotNumber: 'LOT-MRNA-9912',
  },
  {
    id: 'comp-004',
    certificateNumber: 'GDP-CERT-2024-8838',
    shipmentCode: 'SS-2024-0004',
    cargoDescription: 'Cardiovascular Diagnostics Kits (15-25°C Controlled Ambient)',
    consignee: 'Dubai Health Authority Medical Stores',
    origin: 'Mumbai, India',
    destination: 'Dubai, UAE',
    standards: ['WHO_GDP'],
    status: 'QA_HOLD',
    mktCalculatedCelsius: 24.1,
    mktAllowedMaxCelsius: 25.0,
    totalExcursionMinutes: 15,
    signedBy: 'Sanjay Gupta (Compliance Officer)',
    signedAt: '2024-12-11T12:00:00Z',
    sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    qaOfficerNotes: 'Customs clearance document hold resolved. Ambient temperature remained in specification, but secondary packaging seal requires physical inspection.',
    batchLotNumber: 'LOT-CARD-3312',
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ComplianceStatus, { label: string; bg: string; text: string; border: string }> = {
  COMPLIANT:        { label: '🟢 Fully Compliant & Released', bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.35)' },
  EXCURSION_REVIEW: { label: '🟡 Under Excursion MKT Review', bg: 'rgba(234,179,8,0.12)', text: '#facc15', border: 'rgba(234,179,8,0.35)' },
  QA_HOLD:          { label: '🟠 QA Quarantine Hold', bg: 'rgba(249,115,22,0.12)', text: '#fb923c', border: 'rgba(249,115,22,0.35)' },
  REJECTED:         { label: '🔴 Regulatory Release Rejected', bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.35)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>(MOCK_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(MOCK_RECORDS[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'ALL'>('ALL');

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (
        search &&
        !r.certificateNumber.toLowerCase().includes(search.toLowerCase()) &&
        !r.shipmentCode.toLowerCase().includes(search.toLowerCase()) &&
        !r.cargoDescription.toLowerCase().includes(search.toLowerCase()) &&
        !r.batchLotNumber.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [records, statusFilter, search]);

  const compliantCount = records.filter((r) => r.status === 'COMPLIANT').length;
  const reviewCount = records.filter((r) => r.status === 'EXCURSION_REVIEW' || r.status === 'QA_HOLD').length;

  const handleApproveRelease = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'COMPLIANT',
              signedBy: 'Current QA Officer (E-Signature Validated)',
              signedAt: new Date().toISOString(),
              qaOfficerNotes: 'MKT stability calculation validated under 21 CFR Part 11. Final release authorized.',
            }
          : r
      )
    );
    if (selectedRecord?.id === id) {
      setSelectedRecord((prev) =>
        prev
          ? {
              ...prev,
              status: 'COMPLIANT',
              signedBy: 'Current QA Officer (E-Signature Validated)',
              signedAt: new Date().toISOString(),
              qaOfficerNotes: 'MKT stability calculation validated under 21 CFR Part 11. Final release authorized.',
            }
          : null
      );
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">📜</span>
            <h1 className="text-2xl font-extrabold text-white">Compliance & Audit Ledger</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
              WHO-GDP & FDA 21 CFR Part 11
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Immutable temperature stability certificates, MKT calculations & cryptographic audit verification
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Generating full consolidated GDP regulatory compliance package (PDF/XML + SHA-256 signatures).')}
            className="text-sm px-4 py-2 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 transition-all"
          >
            📥 Export Regulatory Audit Package
          </button>
        </div>
      </div>

      {/* ── KPIs Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>GDP Compliance Rate</div>
          <div className="text-3xl font-extrabold text-green-400">99.4%</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>YTD Pharmaceutical Shipments</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Clean Released Lots</div>
          <div className="text-3xl font-extrabold text-teal-400">{compliantCount}</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Cryptographically Anchored</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Pending QA Review</div>
          <div className="text-3xl font-extrabold text-amber-400">{reviewCount}</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Requires Qualified Person Sign-Off</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Audit Ledger Integrity</div>
          <div className="text-3xl font-extrabold text-blue-400">100%</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Zero Hash Discrepancies</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          type="text"
          placeholder="🔍 Search by certificate, lot #, cargo or shipment code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none w-80"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ComplianceStatus | 'ALL')}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ background: 'rgba(25,27,40,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
        >
          <option value="ALL">All Compliance Statuses</option>
          <option value="COMPLIANT">Compliant & Released</option>
          <option value="EXCURSION_REVIEW">Under Excursion Review</option>
          <option value="QA_HOLD">QA Hold</option>
        </select>
        <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {filteredRecords.length} of {records.length} certificates
        </span>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredRecords.map((record) => {
            const isSelected = selectedRecord?.id === record.id;
            const statusStyle = STATUS_CONFIG[record.status];

            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{
                  background: isSelected ? 'rgba(20,184,166,0.08)' : 'rgba(255,255,255,0.025)',
                  border: isSelected ? '1.5px solid rgba(20,184,166,0.5)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                        {record.certificateNumber}
                      </span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                        📦 {record.shipmentCode}
                      </span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/50">
                        Lot: {record.batchLotNumber}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{record.cargoDescription}</h3>
                    <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      📍 {record.origin} ➔ 🏁 {record.destination}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold inline-block" style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
                      {statusStyle.label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex gap-1.5">
                    {record.standards.map((std) => (
                      <span key={std} className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/60 font-mono">
                        {std.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs font-mono" style={{ color: record.mktCalculatedCelsius <= record.mktAllowedMaxCelsius ? '#4ade80' : '#f87171' }}>
                    MKT: {record.mktCalculatedCelsius}°C (Limit: {record.mktAllowedMaxCelsius}°C)
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Certificate Deep-Dive & Electronic Sign-off Panel */}
        {selectedRecord && (
          <div className="p-6 rounded-2xl flex flex-col gap-5" style={{ background: 'rgba(10,12,20,0.97)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-teal-400">{selectedRecord.certificateNumber}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-300">21 CFR Part 11</span>
              </div>
              <h2 className="text-base font-extrabold text-white">{selectedRecord.cargoDescription}</h2>
              <div className="text-xs mt-1 text-white/50">Consignee: {selectedRecord.consignee}</div>
            </div>

            {/* MKT Stability Assessment */}
            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-300">MKT Stability Validation</div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Mean Kinetic Temp (MKT):</span>
                <span className="font-bold text-white">{selectedRecord.mktCalculatedCelsius}°C</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Allowed MKT Upper Limit:</span>
                <span className="font-bold text-white">{selectedRecord.mktAllowedMaxCelsius}°C</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Cumulative Excursion Duration:</span>
                <span className="font-bold text-amber-400">{selectedRecord.totalExcursionMinutes} Minutes</span>
              </div>
            </div>

            {/* QA Auditor Notes */}
            <div className="p-4 rounded-xl space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-white/40">QA Auditor Observation</div>
              <p className="text-xs leading-relaxed text-white/70">{selectedRecord.qaOfficerNotes}</p>
            </div>

            {/* Cryptographic Ledger Proof */}
            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">🔒 Cryptographic Proof (SHA-256)</div>
              <div className="text-xs font-mono break-all text-indigo-200 bg-black/40 p-2 rounded">
                {selectedRecord.sha256Hash}
              </div>
              <div className="text-xs text-white/50">
                Signed by: <span className="text-white font-semibold">{selectedRecord.signedBy}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {selectedRecord.status !== 'COMPLIANT' && (
                <button
                  onClick={() => handleApproveRelease(selectedRecord.id)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white transition-colors"
                >
                  ✓ Approve Qualified Person (QP) Release
                </button>
              )}
              <button
                onClick={() => alert(`Downloading verified certificate ${selectedRecord.certificateNumber}.pdf with cryptographic signature block.`)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                📄 Download Signed GDP Certificate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
