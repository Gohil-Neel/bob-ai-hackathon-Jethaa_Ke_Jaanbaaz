/**
 * SupplyShield AI — Inventory & Buffer Stock Intelligence
 *
 * Real-time warehouse inventory pools, buffer stock forecasting & stockout triage:
 * - Days of Supply (DOS) countdowns across global regional distribution centers (RDC)
 * - Inbound shipment pipeline linkage (auto-adjusting safety stock with in-transit delays)
 * - Critical pharmaceutical batch allocation & stockout risk indices
 * - Automated cross-depot emergency rebalancing recommendations
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StockStatus = 'HEALTHY' | 'LOW_BUFFER' | 'CRITICAL_STOCKOUT_RISK' | 'OVERSTOCKED';

interface InventoryItem {
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

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    sku: 'SKU-INSU-100',
    productName: 'Humalog Recombinant Insulin (10ml)',
    category: 'Biologics (2-8°C)',
    warehouse: 'Chicago RDC (ORD-01)',
    location: 'Chicago, USA',
    onHandUnits: 1420,
    safetyStockUnits: 3000,
    dailyBurnRateUnits: 450,
    daysOfSupplyRemaining: 3.1,
    status: 'CRITICAL_STOCKOUT_RISK',
    inboundPipelineUnits: 5000,
    inboundShipmentCode: 'SS-2024-0001',
    inboundDelayHours: 87,
    recommendedTransferFrom: 'Frankfurt Central Hub (FRA-02)',
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
    productName: 'Respiratory Bivalent Vaccine Batches',
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
  {
    id: 'inv-005',
    sku: 'SKU-EPIN-050',
    productName: 'Auto-Injector Epinephrine 0.3mg',
    category: 'Emergency Therapeutics',
    warehouse: 'Basel Distribution Center (BSL-01)',
    location: 'Basel, Switzerland',
    onHandUnits: 2100,
    safetyStockUnits: 2500,
    dailyBurnRateUnits: 190,
    daysOfSupplyRemaining: 11.0,
    status: 'LOW_BUFFER',
    inboundPipelineUnits: 2500,
    inboundShipmentCode: 'SS-2024-0006',
    inboundDelayHours: 0,
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StockStatus, { label: string; bg: string; text: string; border: string }> = {
  HEALTHY:                  { label: '🟢 Healthy Buffer', bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.35)' },
  LOW_BUFFER:               { label: '🟡 Low Safety Stock', bg: 'rgba(234,179,8,0.12)', text: '#facc15', border: 'rgba(234,179,8,0.35)' },
  CRITICAL_STOCKOUT_RISK:   { label: '🔴 Immediate Stockout Risk', bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.35)' },
  OVERSTOCKED:              { label: '🔵 High Inventory Level', bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.35)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(MOCK_INVENTORY[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'ALL'>('ALL');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (
        search &&
        !item.productName.toLowerCase().includes(search.toLowerCase()) &&
        !item.sku.toLowerCase().includes(search.toLowerCase()) &&
        !item.warehouse.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [items, statusFilter, search]);

  const stockoutRiskCount = items.filter((i) => i.status === 'CRITICAL_STOCKOUT_RISK').length;
  const totalUnits = items.reduce((acc, i) => acc + i.onHandUnits, 0);

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

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">📦</span>
            <h1 className="text-2xl font-extrabold text-white">Inventory & Buffer Stock Intelligence</h1>
            {stockoutRiskCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                {stockoutRiskCount} Depots at Stockout Risk
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Days-of-supply projections tied dynamically to active in-transit logistics disruptions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Calculating global stock reallocation across all 5 regional distribution centers.')}
            className="text-sm px-4 py-2 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all"
          >
            ⚡ Rebalance Global Buffer Stocks
          </button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Total On-Hand Inventory</div>
          <div className="text-3xl font-extrabold text-white">{totalUnits.toLocaleString()}</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Across 5 Global Distribution Depots</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Stockout Threat Depots</div>
          <div className="text-3xl font-extrabold text-red-400">{stockoutRiskCount}</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Chicago & Tokyo Depots (&lt; 3.5 DOS)</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Inbound Pipeline Units</div>
          <div className="text-3xl font-extrabold text-teal-400">22,500</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Currently In-Transit Across Sea/Air</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Avg Network DOS</div>
          <div className="text-3xl font-extrabold text-purple-400">14.2 Days</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Safety Target: ≥ 15 Days</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          type="text"
          placeholder="🔍 Search by SKU, product name or warehouse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none w-80"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StockStatus | 'ALL')}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ background: 'rgba(25,27,40,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
        >
          <option value="ALL">All Stock Levels</option>
          <option value="CRITICAL_STOCKOUT_RISK">Immediate Stockout Risk</option>
          <option value="LOW_BUFFER">Low Safety Stock</option>
          <option value="HEALTHY">Healthy Buffer</option>
        </select>
        <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {filteredItems.length} of {items.length} SKUs monitored
        </span>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SKU List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredItems.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            const statusStyle = STATUS_CONFIG[item.status];

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{
                  background: isSelected ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.025)',
                  border: isSelected ? '1.5px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white/80">
                        {item.sku}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-purple-300">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{item.productName}</h3>
                    <div className="text-xs mt-1 text-white/50">
                      🏢 {item.warehouse} ({item.location})
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold inline-block" style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
                      {statusStyle.label}
                    </span>
                    <div className="text-xs font-mono font-bold mt-1.5" style={{ color: item.daysOfSupplyRemaining < 5 ? '#ef4444' : '#4ade80' }}>
                      {item.daysOfSupplyRemaining} Days of Supply
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <span className="text-white/40">On Hand:</span>{' '}
                    <span className="font-bold text-white">{item.onHandUnits.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-white/40">Safety Target:</span>{' '}
                    <span className="font-bold text-white">{item.safetyStockUnits.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/40">Inbound:</span>{' '}
                    <span className="font-mono text-teal-300">+{item.inboundPipelineUnits.toLocaleString()} ({item.inboundShipmentCode})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected SKU Deep-Dive & Emergency Transfer Panel */}
        {selectedItem && (
          <div className="p-6 rounded-2xl flex flex-col gap-5" style={{ background: 'rgba(10,12,20,0.97)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-purple-400">{selectedItem.sku}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">{selectedItem.category}</span>
              </div>
              <h2 className="text-base font-extrabold text-white">{selectedItem.productName}</h2>
              <div className="text-xs mt-1 text-white/50">{selectedItem.warehouse}</div>
            </div>

            {/* DOS Runway Gauge */}
            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-300">Depot Stockout Runway</div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Daily Burn Rate:</span>
                <span className="font-bold text-white">{selectedItem.dailyBurnRateUnits} units / day</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Days Remaining:</span>
                <span className={`font-bold font-mono text-sm ${selectedItem.daysOfSupplyRemaining < 5 ? 'text-red-400' : 'text-green-400'}`}>
                  {selectedItem.daysOfSupplyRemaining} Days
                </span>
              </div>
            </div>

            {/* Inbound Shipment Linkage */}
            {selectedItem.inboundShipmentCode && (
              <div className="p-4 rounded-xl space-y-1.5" style={{ background: selectedItem.inboundDelayHours > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)', border: `1px solid ${selectedItem.inboundDelayHours > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}` }}>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedItem.inboundDelayHours > 0 ? '#f87171' : '#4ade80' }}>
                  🚢 Inbound Shipment Linkage
                </div>
                <div className="text-xs font-semibold text-white">
                  Load: {selectedItem.inboundShipmentCode} (+{selectedItem.inboundPipelineUnits.toLocaleString()} units)
                </div>
                <div className="text-xs" style={{ color: selectedItem.inboundDelayHours > 0 ? '#fca5a5' : '#86efac' }}>
                  {selectedItem.inboundDelayHours > 0 ? `⚠️ Active Disruption Delay: +${selectedItem.inboundDelayHours} hours` : '✓ On-Time in transit'}
                </div>
              </div>
            )}

            {/* Emergency Rebalance Recommendation */}
            {selectedItem.recommendedTransferFrom && (
              <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-300">💡 AI Stock Transfer Action</div>
                <div className="text-xs text-white/80">
                  Transfer <strong className="text-white">+{selectedItem.recommendedTransferUnits?.toLocaleString()} units</strong> from <strong className="text-white">{selectedItem.recommendedTransferFrom}</strong> via expedited air courier.
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {selectedItem.recommendedTransferFrom && (
                <button
                  onClick={() => handleExecuteTransfer(selectedItem.id)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                >
                  ⚡ Authorize Emergency Cross-Depot Transfer
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
