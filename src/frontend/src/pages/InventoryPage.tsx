/**
 * SupplyShield AI — Inventory & Buffer Stock Intelligence
 *
 * Warehouse buffer stock & stockout runway modeling matching Stitch Design System:
 * - Days of Supply (DOS) run-out projections
 * - Inbound shipment disruption delay linkage
 * - Emergency cross-depot stock rebalancing authorization
 * - Stitch tokens: bg-bg-surface, bg-surface-container-lowest, material-symbols-outlined
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StockStatus = 'HEALTHY' | 'LOW_BUFFER' | 'CRITICAL_STOCKOUT_RISK';

interface InventorySKU {
  id: string;
  sku: string;
  productName: string;
  category: string;
  warehouse: string;
  location: string;
  onHandUnits: number;
  safetyStockUnits: number;
  dailyBurnRateUnits: number;
  daysOfSupplyRemaining: number;
  status: StockStatus;
  inboundPipelineUnits: number;
  inboundShipmentCode: string | null;
  inboundDelayHours: number;
  recommendedTransferFrom?: string;
  recommendedTransferUnits?: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_INVENTORY: InventorySKU[] = [
  {
    id: 'inv-001',
    sku: 'SKU-INSU-100',
    productName: 'Humalog Recombinant Insulin (10ml)',
    category: 'Biologics (2-8°C)',
    warehouse: 'JNPT / Pune Central Pharma Hub (PNQ-01)',
    location: 'Pune, Maharashtra',
    onHandUnits: 1420,
    safetyStockUnits: 3000,
    dailyBurnRateUnits: 450,
    daysOfSupplyRemaining: 3.1,
    status: 'CRITICAL_STOCKOUT_RISK',
    inboundPipelineUnits: 5000,
    inboundShipmentCode: 'SS-2024-0001',
    inboundDelayHours: 87,
    recommendedTransferFrom: 'Hyderabad Bio Hub (HYD-02)',
    recommendedTransferUnits: 1500,
  },
  {
    id: 'inv-002',
    sku: 'SKU-MAB-400',
    productName: 'Pembrolizumab (Keytruda) Oncology Vials',
    category: 'Oncology Biologics',
    warehouse: 'Rotterdam BioPharma Depot (RTM-03)',
    location: 'Rotterdam, Netherlands',
    onHandUnits: 6200,
    safetyStockUnits: 2500,
    dailyBurnRateUnits: 180,
    daysOfSupplyRemaining: 34.4,
    status: 'HEALTHY',
    inboundPipelineUnits: 3000,
    inboundShipmentCode: 'SS-2024-0002',
    inboundDelayHours: 0,
  },
  {
    id: 'inv-003',
    sku: 'SKU-MRNA-900',
    productName: 'mRNA Bivalent Vaccine Batches',
    category: 'Deep Freeze (-20°C)',
    warehouse: 'Tokyo Kanto Medical Hub (TYO-01)',
    location: 'Tokyo, Japan',
    onHandUnits: 890,
    safetyStockUnits: 2000,
    dailyBurnRateUnits: 320,
    daysOfSupplyRemaining: 2.8,
    status: 'CRITICAL_STOCKOUT_RISK',
    inboundPipelineUnits: 8000,
    inboundShipmentCode: 'SS-2024-0003',
    inboundDelayHours: 36,
    recommendedTransferFrom: 'Singapore LifeSciences Depot (SIN-01)',
    recommendedTransferUnits: 1200,
  },
  {
    id: 'inv-004',
    sku: 'SKU-CARD-250',
    productName: 'Troponin Rapid Assay Diagnostic Kits',
    category: 'Controlled Ambient (15-25°C)',
    warehouse: 'Dubai Freezone Medical Storage (DXB-02)',
    location: 'Dubai, UAE',
    onHandUnits: 4100,
    safetyStockUnits: 3500,
    dailyBurnRateUnits: 210,
    daysOfSupplyRemaining: 19.5,
    status: 'HEALTHY',
    inboundPipelineUnits: 4000,
    inboundShipmentCode: 'SS-2024-0004',
    inboundDelayHours: 12,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [items, setItems] = useState<InventorySKU[]>(MOCK_INVENTORY);
  const [activeId, setActiveId] = useState<string>(MOCK_INVENTORY[0].id);
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeItem = items.find((i) => i.id === activeId) || items[0];

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.productName.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.warehouse.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, statusFilter, searchQuery]);

  const handleExecuteTransfer = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.recommendedTransferUnits
          ? {
            ...i,
            onHandUnits: i.onHandUnits + i.recommendedTransferUnits,
            daysOfSupplyRemaining: +(
              (i.onHandUnits + i.recommendedTransferUnits) /
              i.dailyBurnRateUnits
            ).toFixed(1),
            status: 'HEALTHY',
          }
          : i
      )
    );
    alert('Emergency cross-depot stock transfer authorized! Air charter flight booking queued.');
  };

  const stockoutRiskCount = items.filter((i) => i.status === 'CRITICAL_STOCKOUT_RISK').length;

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                Inventory &amp; Buffer Stock Intelligence
              </span>
              {stockoutRiskCount > 0 && (
                <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical font-semibold animate-pulse">
                  {stockoutRiskCount} DEPOTS AT STOCKOUT RISK
                </span>
              )}
            </div>
            <span className="font-caption text-caption text-text-secondary">
              Days-of-supply (DOS) run-out projections linked directly to active in-transit logistics delays
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Calculating global inventory rebalance across all regional pharma hubs.')}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">sync_alt</span>
          Rebalance Regional Stocks
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search SKU, product name, or warehouse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-primary placeholder:text-text-disabled text-caption font-caption outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StockStatus | 'all')}
            className="px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary text-caption font-caption outline-none focus:border-primary"
          >
            <option value="all">All Buffer Levels</option>
            <option value="CRITICAL_STOCKOUT_RISK">Immediate Stockout Risk</option>
            <option value="LOW_BUFFER">Low Safety Buffer</option>
            <option value="HEALTHY">Healthy Buffer</option>
          </select>

          <span className="font-caption text-caption text-text-disabled ml-1">
            {filtered.length} of {items.length}
          </span>
        </div>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left SKU List */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {filtered.map((item) => {
            const isSelected = activeItem.id === item.id;
            const isCritical = item.status === 'CRITICAL_STOCKOUT_RISK';

            return (
              <div
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected
                    ? 'bg-surface-container-low border-primary shadow-md'
                    : 'bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-container-lowest'
                  }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-text-primary px-1.5 py-0.5 rounded bg-surface-container-high">
                        {item.sku}
                      </span>
                      <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full font-semibold ${isCritical ? 'bg-risk-critical/15 text-risk-critical' : 'bg-risk-low/15 text-risk-low'
                        }`}>
                        {item.daysOfSupplyRemaining} DOS
                      </span>
                    </div>
                    <h3 className="font-card-title text-card-title text-text-primary leading-tight">{item.productName}</h3>
                    <div className="font-caption text-caption text-text-muted mt-1">
                      🏢 {item.warehouse.split('(')[0]}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-caption font-caption text-text-muted mt-3 pt-2.5 border-t border-border-subtle">
                  <div>On Hand: <strong className="text-text-primary">{item.onHandUnits.toLocaleString()} units</strong></div>
                  <div className="text-right">Inbound: <strong className="text-primary font-mono">+{item.inboundPipelineUnits.toLocaleString()}</strong></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right SKU Workbench */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-md space-y-6 sticky top-20">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-bold text-primary">{activeItem.sku}</span>
                <span className="font-badge-label text-badge-label px-2 py-0.5 rounded bg-surface-container-high text-text-secondary">
                  {activeItem.category}
                </span>
              </div>
              <h2 className="font-section-title text-section-title text-text-primary leading-tight">
                {activeItem.productName}
              </h2>
            </div>
            <div className="text-right">
              <div className="font-caption text-caption text-text-muted">Hub Location</div>
              <div className="font-card-title text-card-title text-text-primary">{activeItem.location}</div>
            </div>
          </div>

          {/* Runway Card */}
          <div className="p-4 rounded-lg bg-bg-surface border border-border-subtle space-y-2.5">
            <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">timer</span>
              Depot Stockout Runway Analysis
            </div>
            <div className="grid grid-cols-3 gap-3 text-caption font-caption pt-1">
              <div>
                <div className="text-text-muted">Daily Burn Rate:</div>
                <div className="font-bold text-text-primary">{activeItem.dailyBurnRateUnits} units / day</div>
              </div>
              <div>
                <div className="text-text-muted">Safety Target:</div>
                <div className="font-bold text-text-primary">{activeItem.safetyStockUnits.toLocaleString()} units</div>
              </div>
              <div>
                <div className="text-text-muted">Days of Supply Remaining:</div>
                <div className={`font-bold font-mono text-sm ${activeItem.daysOfSupplyRemaining < 5 ? 'text-risk-critical' : 'text-risk-low'}`}>
                  {activeItem.daysOfSupplyRemaining} Days
                </div>
              </div>
            </div>
          </div>

          {/* Inbound Shipment Linkage */}
          {activeItem.inboundShipmentCode && (
            <div className={`p-4 rounded-lg border space-y-1.5 ${activeItem.inboundDelayHours > 0 ? 'bg-risk-critical/5 border-risk-critical/20' : 'bg-risk-low/5 border-risk-low/20'
              }`}>
              <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider font-bold" style={{ color: activeItem.inboundDelayHours > 0 ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                Inbound Shipment Pipeline Linkage
              </div>
              <div className="font-card-title text-card-title text-text-primary">
                Shipment {activeItem.inboundShipmentCode} (+{activeItem.inboundPipelineUnits.toLocaleString()} units)
              </div>
              <div className="font-caption text-caption text-text-secondary">
                {activeItem.inboundDelayHours > 0 ? `⚠️ Active Corridor Disruption Delay: +${activeItem.inboundDelayHours} hours` : '✓ On-Time in transit'}
              </div>
            </div>
          )}

          {/* AI Rebalance Directive */}
          {activeItem.recommendedTransferFrom && (
            <div className="p-4 rounded-lg bg-primary-soft/30 border border-primary/30 space-y-1.5">
              <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-primary font-bold">
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                AI Prescriptive Stock Transfer Directive
              </div>
              <p className="font-caption text-caption text-text-secondary">
                Execute emergency cross-depot air transfer of <strong className="text-text-primary">+{activeItem.recommendedTransferUnits?.toLocaleString()} units</strong> from <strong className="text-text-primary">{activeItem.recommendedTransferFrom}</strong>.
              </p>
            </div>
          )}

          <div className="flex gap-2.5 pt-2 border-t border-border-subtle">
            {activeItem.recommendedTransferFrom && (
              <button
                onClick={() => handleExecuteTransfer(activeItem.id)}
                className="px-4 py-2 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
                Authorize Emergency Stock Transfer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
