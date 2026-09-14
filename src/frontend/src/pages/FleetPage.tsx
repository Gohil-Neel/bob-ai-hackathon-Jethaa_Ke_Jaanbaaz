import { useState } from 'react';

interface FleetAssetRow {
  id: string;
  type: string;
  fuelType: string;
  location: string;
  depotBay: string;
  hub: string;
  fuelOrTemp: string;
  telemetryStatus: string;
  status: 'idle' | 'in-transit' | 'maintenance' | 'reefer';
  statusLabel: string;
  capacity: string;
  capacityFree: string;
  driver: string;
  isReefer: boolean;
  matchShipmentId?: string;
}

const fleetData: FleetAssetRow[] = [
  {
    id: 'TRK-203',
    type: '18T Multi-Axle',
    fuelType: 'Dual-Fuel CNG+D',
    location: 'Ahmedabad Central Hub',
    depotBay: 'Bay 14 • Staging Yard',
    hub: 'Ahmedabad',
    fuelOrTemp: '88% Fuel',
    telemetryStatus: 'Driver Linked',
    status: 'idle',
    statusLabel: 'Idle - Available Now',
    capacity: '0.0 / 18.0 T',
    capacityFree: '100% Volume Free',
    driver: 'Vikram S.',
    isReefer: false,
    matchShipmentId: 'SHP-0172',
  },
  {
    id: 'REF-104',
    type: 'Reefer Cryo-Safe',
    fuelType: 'Temp Range -20°C',
    location: 'Pune Outer Ring',
    depotBay: 'En Route to Mumbai JNPT',
    hub: 'Pune',
    fuelOrTemp: '-19.4°C',
    telemetryStatus: 'Telemetry OK',
    status: 'in-transit',
    statusLabel: 'In Transit',
    capacity: '11.4 / 14.0 T',
    capacityFree: 'Pharma Consignment',
    driver: 'Rajesh K.',
    isReefer: true,
  },
  {
    id: 'TRK-188',
    type: '24T Heavy Hauler',
    fuelType: 'Hydraulic Tail Lift',
    location: 'Mumbai Central Depot',
    depotBay: 'Dock 7 • Ready Standby',
    hub: 'Mumbai Metro',
    fuelOrTemp: '92% Fuel',
    telemetryStatus: 'Unassigned',
    status: 'idle',
    statusLabel: 'Idle - Available',
    capacity: '0.0 / 24.0 T',
    capacityFree: 'Full Capacity Ready',
    driver: 'Sunil P.',
    isReefer: false,
  },
  {
    id: 'REF-092',
    type: 'Reefer Deep Freeze',
    fuelType: 'Cryo Dual-Unit',
    location: 'Hyderabad North Depot',
    depotBay: 'Maintenance Bay 2',
    hub: 'Hyderabad',
    fuelOrTemp: 'Compressor Test',
    telemetryStatus: 'Return 16:30 IST',
    status: 'maintenance',
    statusLabel: 'Scheduled Maint.',
    capacity: '-- / 16.0 T',
    capacityFree: 'Return Today',
    driver: 'Bay Technician',
    isReefer: true,
  },
  {
    id: 'TRK-311',
    type: '32T Container Carrier',
    fuelType: 'Intermodal Locking',
    location: 'Bangalore South Hub',
    depotBay: 'Electronics City Corridor',
    hub: 'Bangalore',
    fuelOrTemp: '74% Fuel',
    telemetryStatus: 'Driver Active',
    status: 'in-transit',
    statusLabel: 'In Transit',
    capacity: '28.4 / 32.0 T',
    capacityFree: 'High Value Semis',
    driver: 'Amar V.',
    isReefer: false,
  },
  {
    id: 'REF-115',
    type: 'Reefer Bio-Temp',
    fuelType: 'Vaccine Certified 2-8°C',
    location: 'Ahmedabad Central Hub',
    depotBay: 'Cold Bay 4',
    hub: 'Ahmedabad',
    fuelOrTemp: '+4.1°C',
    telemetryStatus: 'Pre-Cooled OK',
    status: 'idle',
    statusLabel: 'Idle - Prepped',
    capacity: '0.0 / 12.0 T',
    capacityFree: 'Clean Protocol Pass',
    driver: 'Deepak N.',
    isReefer: true,
    matchShipmentId: 'SHP-0117',
  },
];

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'idle' | 'in-transit' | 'reefer' | 'maintenance'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('TRK-203');
  const [vehicleSwapAuthorized, setVehicleSwapAuthorized] = useState<boolean>(false);
  const [driverNotified, setDriverNotified] = useState<boolean>(false);

  const selectedAsset = fleetData.find((a) => a.id === selectedAssetId) || fleetData[0];

  const filteredFleet = fleetData.filter((a) => {
    if (activeTab === 'idle' && a.status !== 'idle') return false;
    if (activeTab === 'in-transit' && a.status !== 'in-transit') return false;
    if (activeTab === 'reefer' && !a.isReefer) return false;
    if (activeTab === 'maintenance' && a.status !== 'maintenance') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.driver.toLowerCase().includes(q) ||
        a.hub.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Page Header */}
      <section className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="font-page-title text-page-title text-text-primary tracking-tight">Fleet Management</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-low text-risk-low shadow-sm border border-border-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-ping"></span>
                <span className="font-badge-label text-badge-label font-medium uppercase tracking-wider text-risk-low">
                  Telemetry Stream Active
                </span>
              </div>
            </div>
            <p className="font-body-default text-body-default text-text-secondary mt-0.5">
              Real-time vehicle telemetry, idle capacity re-allocation, and cold-chain carrier dispatch
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => {
                const headers = ['Vehicle ID', 'Type', 'Location', 'Status', 'Driver', 'Capacity'];
                const rows = fleetData.map((f) => [f.id, `"${f.type}"`, `"${f.location}"`, f.statusLabel, `"${f.driver}"`, `"${f.capacity}"`]);
                const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', 'fleet_roster.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-text-primary transition-colors text-xs font-medium shadow-sm border border-border-subtle"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-text-muted">file_download</span>
              <span>Export Fleet Roster</span>
            </button>
            <button
              onClick={() => alert('Opening Reserve Deployment Protocol for regional logistics hubs...')}
              className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary-container transition-all text-xs font-medium shadow-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Deploy Reserve Vehicle</span>
            </button>
          </div>
        </div>

        {/* 5 Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1 */}
          <div className="flex flex-col p-3 rounded-lg bg-bg-surface shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-table-cell text-table-cell text-text-muted font-medium uppercase tracking-wider">
                Total Fleet
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-kpi-val text-kpi-val text-text-primary tabular-nums">184</span>
              <span className="font-badge-label text-badge-label text-risk-low font-medium">+4 vs last wk</span>
            </div>
            <div className="flex items-center justify-between text-caption font-caption text-text-secondary mt-1">
              <span>94.2% Active Deployment</span>
              <span className="text-text-muted">100% telemetry</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '94.2%' }}></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col p-3 rounded-lg bg-bg-surface shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-table-cell text-table-cell text-text-muted font-medium uppercase tracking-wider">
                Active in Transit
              </span>
              <span className="material-symbols-outlined text-status-info text-[18px]">alt_route</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-kpi-val text-kpi-val text-text-primary tabular-nums">128</span>
              <span className="font-badge-label text-badge-label text-status-info">69.5% run rate</span>
            </div>
            <div className="flex items-center justify-between text-caption font-caption text-text-secondary mt-1">
              <span>82 High-Priority Cargo</span>
              <span className="text-risk-high font-medium">6 critical routes</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-status-info h-full rounded-full" style={{ width: '69.5%' }}></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col p-3 rounded-lg bg-bg-surface shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-table-cell text-table-cell text-text-muted font-medium uppercase tracking-wider">
                Idle Deployable
              </span>
              <span className="material-symbols-outlined text-risk-medium text-[18px]">pause_circle</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-kpi-val text-kpi-val text-risk-medium tabular-nums">42</span>
              <span className="font-badge-label text-badge-label text-text-secondary">Ready &lt;30m</span>
            </div>
            <div className="flex items-center justify-between text-caption font-caption text-text-secondary mt-1 truncate">
              <span>18 AMD • 12 BOM • 12 BLR</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-risk-medium h-full rounded-full" style={{ width: '22.8%' }}></div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col p-3 rounded-lg bg-bg-surface shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-table-cell text-table-cell text-text-muted font-medium uppercase tracking-wider">
                Maintenance
              </span>
              <span className="material-symbols-outlined text-text-muted text-[18px]">build</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-kpi-val text-kpi-val text-text-primary tabular-nums">14</span>
              <span className="font-badge-label text-badge-label text-risk-low font-medium">4 return today</span>
            </div>
            <div className="flex items-center justify-between text-caption font-caption text-text-secondary mt-1">
              <span>10 Scheduled servicing</span>
              <span className="text-text-muted">4 depot bay</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-surface-variant h-full rounded-full" style={{ width: '7.6%' }}></div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="flex flex-col p-3 rounded-lg bg-bg-surface shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-table-cell text-table-cell text-text-muted font-medium uppercase tracking-wider">
                Cold-Chain Readiness
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">ac_unit</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-kpi-val text-kpi-val text-text-primary tabular-nums">96.8%</span>
              <span className="font-badge-label text-badge-label text-risk-low font-medium">Certified</span>
            </div>
            <div className="flex items-center justify-between text-caption font-caption text-text-secondary mt-1">
              <span>58 Active Cryo/Reefer</span>
              <span className="text-text-muted">54 compliant</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '96.8%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace (Split 8 Cols / 4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: 8 Cols */}
        <div className="xl:col-span-8 flex flex-col gap-4 min-w-0">
          {/* Regional Fleet Hubs & Spatial Distribution */}
          <div className="flex flex-col rounded-lg bg-bg-surface overflow-hidden shadow-sm border border-border-subtle">
            <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container-lowest border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
                <h2 className="font-section-title text-section-title text-text-primary">
                  Regional Fleet Hubs &amp; Spatial Distribution
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-caption text-caption text-text-muted">Last sync: 14s ago</span>
                <div className="flex items-center gap-1 text-caption text-text-secondary bg-surface-container-low px-2 py-0.5 rounded border border-border-subtle">
                  <span className="w-2 h-2 rounded-full bg-risk-low inline-block"></span>
                  <span className="font-caption text-caption">Active (128)</span>
                  <span className="w-2 h-2 rounded-full bg-risk-medium inline-block ml-1"></span>
                  <span className="font-caption text-caption">Idle (42)</span>
                </div>
              </div>
            </div>

            <div className="relative w-full h-[230px] bg-surface-container-lowest flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              ></div>
              <svg className="absolute inset-0 w-full h-full pointer-events-none text-surface-container-high" xmlns="http://www.w3.org/2000/svg">
                <path d="M 160 100 Q 280 60 420 120" fill="none" opacity="0.4" stroke="currentColor" strokeDasharray="3,3" strokeWidth="1.5" />
                <path d="M 420 120 Q 520 180 640 150" fill="none" opacity="0.4" stroke="currentColor" strokeDasharray="3,3" strokeWidth="1.5" />
                <path d="M 160 100 Q 320 160 520 190" fill="none" opacity="0.4" stroke="currentColor" strokeDasharray="3,3" strokeWidth="1.5" />
              </svg>

              {/* Hub Cards */}
              <div className="relative z-10 w-full h-full p-4 flex flex-wrap items-center justify-around gap-2 select-none">
                {/* Ahmedabad */}
                <div className="flex flex-col p-2.5 rounded-lg bg-bg-surface-raised/90 border border-border-subtle shadow-md backdrop-blur-sm min-w-[130px] hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-card-title text-card-title text-text-primary font-semibold truncate">
                      Ahmedabad
                    </span>
                    <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-risk-medium/20 text-risk-medium leading-none flex-shrink-0">
                      Hub B
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-muted mt-0.5 truncate">Northwest Logistics</span>
                  <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-surface-container-high">
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-risk-medium font-semibold tabular-nums leading-tight">
                        18 Idle
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Ready</span>
                    </div>
                    <div className="h-4 w-px bg-surface-container-high"></div>
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-risk-low font-semibold tabular-nums leading-tight">
                        26 Transit
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Active</span>
                    </div>
                  </div>
                </div>

                {/* Mumbai */}
                <div className="flex flex-col p-2.5 rounded-lg bg-bg-surface-raised/90 border border-border-subtle shadow-md backdrop-blur-sm min-w-[130px] hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-card-title text-card-title text-text-primary font-semibold truncate">
                      Mumbai Metro
                    </span>
                    <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-primary-soft text-primary leading-none flex-shrink-0">
                      Hub A
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-muted mt-0.5 truncate">JNPT Port Yard</span>
                  <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-surface-container-high">
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-risk-medium font-semibold tabular-nums leading-tight">
                        12 Idle
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Ready</span>
                    </div>
                    <div className="h-4 w-px bg-surface-container-high"></div>
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-risk-low font-semibold tabular-nums leading-tight">
                        44 Transit
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Active</span>
                    </div>
                  </div>
                </div>

                {/* Pune */}
                <div className="flex flex-col p-2.5 rounded-lg bg-bg-surface-raised/90 border border-border-subtle shadow-md backdrop-blur-sm min-w-[130px] hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-card-title text-card-title text-text-primary font-semibold truncate">Pune</span>
                    <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container-high text-text-muted leading-none flex-shrink-0">
                      Aux 1
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-muted mt-0.5 truncate">Outer Ring Depot</span>
                  <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-surface-container-high">
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-text-secondary font-semibold tabular-nums leading-tight">
                        4 Idle
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Ready</span>
                    </div>
                    <div className="h-4 w-px bg-surface-container-high"></div>
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-risk-low font-semibold tabular-nums leading-tight">
                        19 Transit
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Active</span>
                    </div>
                  </div>
                </div>

                {/* Hyderabad */}
                <div className="flex flex-col p-2.5 rounded-lg bg-bg-surface-raised/90 border border-border-subtle shadow-md backdrop-blur-sm min-w-[130px] hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-card-title text-card-title text-text-primary font-semibold truncate">
                      Hyderabad
                    </span>
                    <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container-high text-text-muted leading-none flex-shrink-0">
                      Hub C
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-muted mt-0.5 truncate">North Express Hub</span>
                  <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-surface-container-high">
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-text-secondary font-semibold tabular-nums leading-tight">
                        6 Idle
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Ready</span>
                    </div>
                    <div className="h-4 w-px bg-surface-container-high"></div>
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-risk-low font-semibold tabular-nums leading-tight">
                        22 Transit
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Active</span>
                    </div>
                  </div>
                </div>

                {/* Bangalore */}
                <div className="flex flex-col p-2.5 rounded-lg bg-bg-surface-raised/90 border border-border-subtle shadow-md backdrop-blur-sm min-w-[130px] hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-card-title text-card-title text-text-primary font-semibold truncate">
                      Bangalore
                    </span>
                    <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-primary-soft text-primary leading-none flex-shrink-0">
                      Hub D
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-muted mt-0.5 truncate">South Central</span>
                  <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-surface-container-high">
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-risk-medium font-semibold tabular-nums leading-tight">
                        12 Idle
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Ready</span>
                    </div>
                    <div className="h-4 w-px bg-surface-container-high"></div>
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell text-risk-low font-semibold tabular-nums leading-tight">
                        17 Transit
                      </span>
                      <span className="font-caption text-caption text-text-disabled leading-tight">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Roster Table */}
          <div className="flex flex-col rounded-lg bg-bg-surface shadow-sm overflow-hidden border border-border-subtle">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-3 gap-2.5 bg-surface-container-lowest border-b border-border-subtle">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded font-badge-label text-badge-label transition-colors ${
                    activeTab === 'all'
                      ? 'bg-surface-container-high text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  All ({fleetData.length})
                </button>
                <button
                  onClick={() => setActiveTab('idle')}
                  className={`px-2.5 py-1 rounded font-badge-label text-badge-label transition-colors ${
                    activeTab === 'idle'
                      ? 'bg-surface-container-high text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  Idle / Deployable (3)
                </button>
                <button
                  onClick={() => setActiveTab('in-transit')}
                  className={`px-2.5 py-1 rounded font-badge-label text-badge-label transition-colors ${
                    activeTab === 'in-transit'
                      ? 'bg-surface-container-high text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  In Transit (2)
                </button>
                <button
                  onClick={() => setActiveTab('reefer')}
                  className={`px-2.5 py-1 rounded font-badge-label text-badge-label transition-colors ${
                    activeTab === 'reefer'
                      ? 'bg-surface-container-high text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  Reefer Units (3)
                </button>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`px-2.5 py-1 rounded font-badge-label text-badge-label transition-colors ${
                    activeTab === 'maintenance'
                      ? 'bg-surface-container-high text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  Maintenance (1)
                </button>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-2 text-text-disabled text-[16px]">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-surface-container-lowest text-text-primary placeholder-text-muted text-xs pl-7 pr-2.5 py-1 rounded h-8 outline-none w-48 shadow-inner border border-border-subtle"
                    placeholder="Filter ID, Depot, Driver..."
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-table-cell text-table-cell">
                <thead>
                  <tr className="h-9 bg-surface-container-lowest text-text-muted font-table-cell text-table-cell uppercase tracking-wider select-none border-b border-border-subtle">
                    <th className="px-3 py-2 font-medium">Vehicle ID</th>
                    <th className="px-3 py-2 font-medium">Type &amp; Specs</th>
                    <th className="px-3 py-2 font-medium">Location / Depot</th>
                    <th className="px-3 py-2 font-medium">Telemetry</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Payload / Cap</th>
                    <th className="px-3 py-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {filteredFleet.map((v) => {
                    const isSelected = selectedAssetId === v.id;
                    const statusClass =
                      v.status === 'idle'
                        ? 'bg-risk-medium/10 text-risk-medium'
                        : v.status === 'in-transit'
                        ? 'bg-risk-low/10 text-risk-low'
                        : 'bg-surface-container-high text-text-secondary';

                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedAssetId(v.id)}
                        className={`h-12 transition-colors cursor-pointer ${
                          isSelected ? 'bg-bg-surface-hover ring-1 ring-primary/40' : 'hover:bg-bg-surface-hover'
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {isSelected && <span className="w-1.5 h-6 rounded-full bg-primary flex-shrink-0"></span>}
                            <span className="font-semibold text-text-primary tabular-nums">{v.id}</span>
                            {v.isReefer && (
                              <span className="material-symbols-outlined text-primary text-[15px]">ac_unit</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-text-primary font-medium leading-tight">{v.type}</span>
                            <span className="text-text-muted font-caption text-caption mt-0.5">{v.fuelType}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-text-primary font-medium leading-tight">{v.location}</span>
                            <span className="text-text-muted font-caption text-caption mt-0.5">{v.depotBay}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-text-primary tabular-nums font-medium">{v.fuelOrTemp}</span>
                            <span className="text-text-disabled">•</span>
                            <span className="text-text-secondary font-caption text-caption font-medium">
                              {v.telemetryStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-label text-badge-label font-medium ${statusClass}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{v.statusLabel}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-text-primary tabular-nums font-medium leading-tight">{v.capacity}</span>
                            <span className="text-text-muted font-caption text-caption mt-0.5">{v.capacityFree}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssetId(v.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-primary-container text-on-primary-container font-caption text-caption font-semibold hover:bg-primary-hover transition-colors shadow-sm"
                            type="button"
                          >
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-lowest text-text-muted font-caption text-caption border-t border-border-subtle">
              <span>Showing {filteredFleet.length} of 184 active enterprise fleet assets</span>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 rounded bg-surface-container-high text-text-primary" type="button">
                  1
                </button>
                <button className="px-2 py-1 rounded hover:bg-surface-container text-text-secondary" type="button">
                  2
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 Cols (AI Asset Optimization Cockpit) */}
        <div className="xl:col-span-4 flex flex-col gap-3 min-w-0">
          <div className="flex flex-col rounded-lg bg-bg-surface-raised shadow-md overflow-hidden border border-border-strong">
            <div className="flex items-center justify-between px-4 py-3 bg-surface-container-lowest border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                <span className="font-section-title text-section-title text-text-primary">AI Asset Optimization</span>
              </div>
              <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium border border-primary-container/30">
                Engine v4.8
              </span>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {/* Selected Asset Tile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-bg-surface shadow-sm gap-2.5 border border-border-subtle">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-card-title text-card-title text-text-primary font-semibold">
                        {selectedAsset.id}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-risk-medium/20 text-risk-medium font-caption text-caption leading-none">
                        {selectedAsset.statusLabel}
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-muted mt-0.5 truncate">
                      {selectedAsset.type} • {selectedAsset.fuelType}
                    </span>
                  </div>
                </div>
                <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                  <span className="font-table-cell text-table-cell text-text-primary font-semibold truncate">
                    {selectedAsset.hub} Depot
                  </span>
                  <span className="font-caption text-caption text-text-muted truncate">{selectedAsset.depotBay}</span>
                </div>
              </div>

              {/* AI Redeployment Recommendation */}
              <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest shadow-inner gap-2.5 border border-border-subtle">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-badge-label text-badge-label uppercase tracking-wider text-status-info font-semibold flex items-center gap-1.5 min-w-0 truncate">
                    <span className="w-2 h-2 rounded-full bg-status-info animate-pulse flex-shrink-0"></span>
                    <span className="truncate">AI Redeployment Recommendation</span>
                  </span>
                  <span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container-high text-text-secondary flex-shrink-0 font-medium">
                    98.4% Confidence
                  </span>
                </div>

                <div className="p-2.5 rounded bg-bg-surface shadow-sm border border-border-subtle">
                  <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                    <span className="text-text-muted font-medium">Target Shipment</span>
                    <span className="font-table-cell text-table-cell text-risk-high font-semibold bg-risk-high/10 px-1.5 py-0.5 rounded border border-risk-high/30">
                      {selectedAsset.matchShipmentId || 'SHP-0172'} (Critical Delay)
                    </span>
                  </div>
                  <p className="font-body-default text-body-default text-text-primary mt-1.5 leading-snug">
                    Delayed at <strong className="text-risk-high font-semibold">NH-48 Chokepoint</strong> due to mechanical fault on prime mover.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 p-2.5 rounded bg-bg-surface shadow-sm border border-border-subtle">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-text-muted font-medium">Predicted Impact</span>
                    <span className="text-risk-low font-semibold font-badge-label text-badge-label px-1.5 py-0.5 rounded bg-risk-low/10">
                      Saves 4.2h Delay
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary leading-snug">
                    Direct deployment preserves ₹1.2 Cr cargo delivery SLA with regional assembly plant.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-bg-surface flex flex-col justify-between border border-border-subtle">
                    <span className="font-caption text-caption text-text-muted">Handover ETA</span>
                    <span className="font-card-title text-card-title text-text-primary font-semibold mt-0.5 tabular-nums">
                      42 mins
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-0.5 truncate">
                      38.4 km via bypass
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-bg-surface flex flex-col justify-between border border-border-subtle">
                    <span className="font-caption text-caption text-text-muted">Driver Link</span>
                    <span className="font-card-title text-card-title text-text-primary font-semibold mt-0.5 truncate">
                      {selectedAsset.driver}
                    </span>
                    <span className="font-caption text-caption text-risk-low mt-0.5 truncate">On-site • Ready</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <button
                    onClick={() => setVehicleSwapAuthorized(!vehicleSwapAuthorized)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${
                      vehicleSwapAuthorized
                        ? 'bg-risk-low text-on-primary'
                        : 'bg-primary-container hover:bg-primary-hover text-on-primary-container'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {vehicleSwapAuthorized ? 'check_circle' : 'swap_horiz'}
                    </span>
                    <span>
                      {vehicleSwapAuthorized ? 'Vehicle Swap Authorized & Dispatched' : 'Authorize Vehicle Swap'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setDriverNotified(true);
                      alert(`Dispatch notification broadcasted to driver ${selectedAsset.driver} & Depot Master!`);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-text-primary text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-border-subtle"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-text-muted">
                      {driverNotified ? 'check' : 'send_to_mobile'}
                    </span>
                    <span>{driverNotified ? 'Driver & Depot Master Notified' : 'Notify Driver & Depot Master'}</span>
                  </button>
                </div>
              </div>

              {/* Pre-Flight & Telemetry Health */}
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-bg-surface shadow-sm border border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-table-cell text-table-cell text-text-primary font-semibold">
                    Pre-Flight &amp; Telemetry Health
                  </span>
                  <span className="font-caption text-caption text-risk-low flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>All Validated</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="flex flex-col p-2 rounded bg-surface-container-low min-w-0">
                    <span className="font-caption text-caption text-text-muted truncate">Brake Wear</span>
                    <span className="font-card-title text-card-title text-text-primary font-semibold mt-0.5 tabular-nums">
                      94%
                    </span>
                    <span className="font-caption text-caption text-risk-low font-medium">Optimal</span>
                  </div>
                  <div className="flex flex-col p-2 rounded bg-surface-container-low min-w-0">
                    <span className="font-caption text-caption text-text-muted truncate">Cryo Reefer</span>
                    <span className="font-card-title text-card-title text-text-muted font-semibold mt-0.5">
                      {selectedAsset.isReefer ? '+4.1°C' : 'N/A'}
                    </span>
                    <span className="font-caption text-caption text-text-disabled truncate">
                      {selectedAsset.isReefer ? 'Active' : 'Dry Carrier'}
                    </span>
                  </div>
                  <div className="flex flex-col p-2 rounded bg-surface-container-low min-w-0">
                    <span className="font-caption text-caption text-text-muted truncate">Tire Pressure</span>
                    <span className="font-card-title text-card-title text-text-primary font-semibold mt-0.5 tabular-nums">
                      34 PSI
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">Normal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
