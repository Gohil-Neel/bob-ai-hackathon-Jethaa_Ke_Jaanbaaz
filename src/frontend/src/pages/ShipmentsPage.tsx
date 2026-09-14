import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShipmentRow {
  id: string;
  route: string;
  cargo: string;
  cargoValue: string;
  valueNumeric: number;
  carrier: string;
  unit: string;
  driver: string;
  priority: 'P1 Critical' | 'P2 High' | 'P3 Medium' | 'P4 Low';
  eta: string;
  delayEst: string;
  telemetryType: 'temp' | 'flood' | 'mechanical' | 'nominal' | 'halt';
  telemetryBadge: string;
  isColdChain: boolean;
  isDisrupted: boolean;
  currentTemp?: string;
  corridor: string;
  carrierKey: string;
  status: 'at-risk' | 'delayed' | 'in-transit' | 'delivered';
}

const shipmentsData: ShipmentRow[] = [
  {
    id: 'SHP-0117',
    route: 'Hyderabad → Chennai DC',
    cargo: 'HPV Vaccines (Biopharma)',
    cargoValue: '₹1.85 Cr',
    valueNumeric: 18500000,
    carrier: 'ColdTrans Logistics Ltd',
    carrierKey: 'coldtrans',
    unit: 'REF-104',
    driver: 'Rajesh K.',
    priority: 'P1 Critical',
    eta: '18:15 Today',
    delayEst: '+3.2h Delay',
    telemetryType: 'temp',
    telemetryBadge: 'Temp 9.4°C (>8°C)',
    isColdChain: true,
    isDisrupted: true,
    currentTemp: '9.4°C',
    corridor: 'hyderabad-chennai',
    status: 'at-risk',
  },
  {
    id: 'SHP-0102',
    route: 'Mumbai → Bangalore Hub',
    cargo: 'Auto Components',
    cargoValue: '₹64 Lakhs',
    valueNumeric: 6400000,
    carrier: 'Blue Dart Express',
    carrierKey: 'bluedart',
    unit: 'TRK-882',
    driver: 'Sunil P.',
    priority: 'P2 High',
    eta: '22:30 Today',
    delayEst: '+4.5h Delay',
    telemetryType: 'flood',
    telemetryBadge: 'Flooding Alert',
    isColdChain: false,
    isDisrupted: true,
    corridor: 'mumbai-bangalore',
    status: 'delayed',
  },
  {
    id: 'SHP-0123',
    route: 'Pune → Hyderabad Junction',
    cargo: 'Consumer Electronics',
    cargoValue: '₹85 Lakhs',
    valueNumeric: 8500000,
    carrier: 'SafeXpress Heavy',
    carrierKey: 'safexpress',
    unit: 'TRK-203',
    driver: 'Amar V.',
    priority: 'P3 Medium',
    eta: 'Tomorrow 06:00',
    delayEst: '+1.8h Delay',
    telemetryType: 'mechanical',
    telemetryBadge: 'Mechanical Halt',
    isColdChain: false,
    isDisrupted: false,
    corridor: 'pune-hyderabad',
    status: 'delayed',
  },
  {
    id: 'SHP-0145',
    route: 'Delhi IGI → Bangalore BLR',
    cargo: 'High Precision Optics',
    cargoValue: '₹2.10 Cr',
    valueNumeric: 21000000,
    carrier: 'DHL Global Forwarding',
    carrierKey: 'dhl',
    unit: 'FLT-8802',
    driver: 'Air Freight Crew',
    priority: 'P4 Low',
    eta: 'Tomorrow 09:30',
    delayEst: 'On Track',
    telemetryType: 'nominal',
    telemetryBadge: 'Nominal 21.0°C',
    isColdChain: true,
    isDisrupted: false,
    corridor: 'delhi-ahmedabad',
    status: 'in-transit',
  },
  {
    id: 'SHP-0188',
    route: 'Coimbatore → Chennai Port',
    cargo: 'Textile Machinery',
    cargoValue: '₹42 Lakhs',
    valueNumeric: 4200000,
    carrier: 'TCI Freight Line',
    carrierKey: 'tci',
    unit: 'TRK-552',
    driver: 'Murugan S.',
    priority: 'P2 High',
    eta: 'Tonight 23:45',
    delayEst: '+5.1h Delay',
    telemetryType: 'halt',
    telemetryBadge: 'Terminal Halt',
    isColdChain: false,
    isDisrupted: true,
    corridor: 'hyderabad-chennai',
    status: 'delayed',
  },
  {
    id: 'SHP-0204',
    route: 'Ahmedabad → Navi Mumbai',
    cargo: 'Industrial Chemicals',
    cargoValue: '₹78 Lakhs',
    valueNumeric: 7800000,
    carrier: 'TransChem Cargo',
    carrierKey: 'transchem',
    unit: 'TNK-401',
    driver: 'Farhan K.',
    priority: 'P3 Medium',
    eta: 'Tomorrow 04:15',
    delayEst: '+1.4h Delay',
    telemetryType: 'nominal',
    telemetryBadge: 'Pressure Stable',
    isColdChain: false,
    isDisrupted: false,
    corridor: 'delhi-ahmedabad',
    status: 'in-transit',
  },
  {
    id: 'SHP-0233',
    route: 'Anand → Mumbai Super Hub',
    cargo: 'Enzymes & Cultures',
    cargoValue: '₹55 Lakhs',
    valueNumeric: 5500000,
    carrier: 'ColdTrans Logistics Ltd',
    carrierKey: 'coldtrans',
    unit: 'REF-088',
    driver: 'Deepak N.',
    priority: 'P1 Critical',
    eta: 'Today 20:00',
    delayEst: '+2.8h Delay',
    telemetryType: 'temp',
    telemetryBadge: 'Temp 7.8°C (Edge)',
    isColdChain: true,
    isDisrupted: true,
    currentTemp: '7.8°C',
    corridor: 'mumbai-bangalore',
    status: 'at-risk',
  },
];

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'at-risk' | 'delayed' | 'cold-chain' | 'in-transit' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [corridorFilter, setCorridorFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [filterDisruptedOnly, setFilterDisruptedOnly] = useState<boolean>(false);
  const [filterHighValueOnly, setFilterHighValueOnly] = useState<boolean>(false);
  const [filterStrictColdChain, setFilterStrictColdChain] = useState<boolean>(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('SHP-0117');
  const [emergencyActionAuthorized, setEmergencyActionAuthorized] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);

  const selectedShipment = shipmentsData.find((s) => s.id === selectedShipmentId) || shipmentsData[0];

  const filteredShipments = shipmentsData.filter((s) => {
    if (activeTab === 'at-risk' && s.status !== 'at-risk') return false;
    if (activeTab === 'delayed' && s.status !== 'delayed') return false;
    if (activeTab === 'cold-chain' && !s.isColdChain) return false;
    if (activeTab === 'in-transit' && s.status !== 'in-transit') return false;
    if (activeTab === 'delivered' && s.status !== 'delivered') return false;

    if (corridorFilter !== 'all' && s.corridor !== corridorFilter) return false;
    if (severityFilter !== 'all') {
      if (severityFilter === 'p1' && s.priority !== 'P1 Critical') return false;
      if (severityFilter === 'p2' && s.priority !== 'P2 High') return false;
      if (severityFilter === 'p3' && s.priority !== 'P3 Medium') return false;
      if (severityFilter === 'p4' && s.priority !== 'P4 Low') return false;
    }
    if (carrierFilter !== 'all' && s.carrierKey !== carrierFilter) return false;

    if (filterDisruptedOnly && !s.isDisrupted) return false;
    if (filterHighValueOnly && s.valueNumeric < 5000000) return false;
    if (filterStrictColdChain && !s.isColdChain) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.cargo.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q) ||
        s.unit.toLowerCase().includes(q) ||
        s.driver.toLowerCase().includes(q) ||
        s.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeFiltersCount =
    (corridorFilter !== 'all' ? 1 : 0) +
    (severityFilter !== 'all' ? 1 : 0) +
    (carrierFilter !== 'all' ? 1 : 0) +
    (filterDisruptedOnly ? 1 : 0) +
    (filterHighValueOnly ? 1 : 0) +
    (filterStrictColdChain ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setCorridorFilter('all');
    setSeverityFilter('all');
    setCarrierFilter('all');
    setFilterDisruptedOnly(false);
    setFilterHighValueOnly(false);
    setFilterStrictColdChain(false);
    setActiveTab('all');
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Page Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="font-page-title text-page-title text-text-primary tracking-tight">Shipments Management</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high text-caption font-caption text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-status-info animate-pulse"></span>
              Telemetry Synced 12s ago
            </span>
          </div>
          <p className="font-body-default text-body-default text-text-muted mt-0.5">
            Real-time active freight tracking, multivariable risk classification, and carrier cold-chain telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              const headers = ['ID', 'Route', 'Cargo', 'Value', 'Carrier', 'Priority', 'ETA', 'Telemetry'];
              const rows = shipmentsData.map((s) => [
                s.id,
                `"${s.route}"`,
                `"${s.cargo}"`,
                s.cargoValue,
                `"${s.carrier}"`,
                s.priority,
                `"${s.eta}"`,
                `"${s.telemetryBadge}"`,
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', 'supplyshield_shipments.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover font-card-title text-card-title shadow-sm transition-colors border border-border-subtle"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-text-muted">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary-hover font-card-title text-card-title shadow-sm transition-all duration-150 active:scale-[0.98]"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Add / Ingest Shipment</span>
          </button>
        </div>
      </div>

      {/* Operational Filter Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap shadow-sm transition-colors ${activeTab === 'all'
              ? 'bg-primary-soft text-primary border border-primary-container/30 font-medium'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
          type="button"
        >
          <span>All Shipments</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-primary-container/20 text-primary">
            1,248
          </span>
        </button>
        <button
          onClick={() => setActiveTab('at-risk')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'at-risk'
              ? 'bg-error-container/30 text-error border border-error/30 font-medium'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
          type="button"
        >
          <span className="w-2 h-2 rounded-full bg-risk-critical"></span>
          <span>At-Risk</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-error-container/30 text-error">23</span>
        </button>
        <button
          onClick={() => setActiveTab('delayed')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'delayed'
              ? 'bg-risk-medium/20 text-risk-medium border border-risk-medium/40 font-medium'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
          type="button"
        >
          <span className="w-2 h-2 rounded-full bg-risk-medium"></span>
          <span>Delayed</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-risk-medium/20 text-risk-medium">212</span>
        </button>
        <button
          onClick={() => setActiveTab('cold-chain')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'cold-chain'
              ? 'bg-status-info/20 text-status-info border border-status-info/40 font-medium'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[14px] text-status-info">ac_unit</span>
          <span>Cold Chain Monitored</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-secondary">
            184
          </span>
        </button>
        <button
          onClick={() => setActiveTab('in-transit')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'in-transit'
              ? 'bg-primary-soft text-primary font-medium'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
          type="button"
        >
          <span>In Transit</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-secondary">
            820
          </span>
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'delivered'
              ? 'bg-risk-low/20 text-risk-low font-medium'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
          type="button"
        >
          <span>Delivered Today</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-secondary">
            193
          </span>
        </button>
      </div>

      {/* Top KPI Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between gap-2.5 border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-card-title text-card-title text-text-secondary">Total In-Transit</span>
            <div className="p-1.5 rounded-md bg-surface-container text-text-muted flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-kpi-val text-kpi-val text-text-primary font-semibold tracking-tight">1,248</span>
            <span className="inline-flex items-center text-risk-low font-caption text-caption font-medium">
              <span className="material-symbols-outlined text-[14px] leading-none mr-0.5">arrow_upward</span>
              12% vs yesterday
            </span>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted pt-2 border-t border-border-subtle/40">
            <span>Fleet Utilization</span>
            <span className="text-text-primary font-medium">98.2% service rate</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between gap-2.5 border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-card-title text-card-title text-text-secondary">High Risk Shipments</span>
              <span className="w-2 h-2 rounded-full bg-risk-critical animate-ping flex-shrink-0"></span>
            </div>
            <div className="p-1.5 rounded-md bg-error-container/20 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-kpi-val text-kpi-val text-error font-semibold tracking-tight">23</span>
            <span className="inline-flex items-center text-error font-caption text-caption font-medium">
              Requires immediate triage
            </span>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted pt-2 border-t border-border-subtle/40">
            <span>Value at Hazard</span>
            <span className="text-error font-medium">₹3.82 Cr at stake</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between gap-2.5 border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-card-title text-card-title text-text-secondary">On-Time Integrity</span>
            <div className="p-1.5 rounded-md bg-surface-container text-text-muted flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">timelapse</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-kpi-val text-kpi-val text-text-primary font-semibold tracking-tight">83.2%</span>
            <span className="inline-flex items-center text-risk-high font-caption text-caption font-medium">
              <span className="material-symbols-outlined text-[14px] leading-none mr-0.5">arrow_downward</span>
              2.4% corridor shock
            </span>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted pt-2 border-t border-border-subtle/40">
            <span>Main Blocker</span>
            <span className="text-text-secondary font-medium truncate max-w-[170px]">NH-48 Monsoon</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between gap-2.5 border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-card-title text-card-title text-text-secondary">Cold Chain Excursions</span>
            <div className="p-1.5 rounded-md bg-surface-container text-status-info flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">ac_unit</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-kpi-val text-kpi-val text-risk-high font-semibold tracking-tight">5</span>
            <span className="inline-flex items-center text-risk-high font-caption text-caption font-medium">
              Sensor alert active
            </span>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted pt-2 border-t border-border-subtle/40">
            <span>Cryo Safe Rate</span>
            <span className="text-risk-low font-medium">97.3% optimal thermal</span>
          </div>
        </div>
      </div>

      {/* Advanced Filtering and Query Matrix */}
      <div className="p-3 bg-bg-surface rounded-xl shadow-sm mb-4 flex flex-col gap-3 border border-border-subtle">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <span className="material-symbols-outlined text-[16px] text-text-muted absolute left-2.5 top-2.5">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-8 rounded-lg bg-bg-app text-body-default font-body-default text-text-primary placeholder:text-text-disabled outline-none focus:ring-1 focus:ring-primary transition-colors border border-border-subtle"
              placeholder="Search Shipment ID, Cargo, Carrier, Chassis..."
              type="text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-text-disabled hover:text-text-primary"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">cancel</span>
              </button>
            )}
          </div>

          {/* Route Corridor Select */}
          <div className="md:col-span-2">
            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-bg-app text-table-cell font-table-cell text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-subtle"
            >
              <option value="all">All Corridors (India-Wide)</option>
              <option value="hyderabad-chennai">Hyderabad → Chennai Corridor</option>
              <option value="mumbai-bangalore">Mumbai → Bangalore (NH-48)</option>
              <option value="delhi-ahmedabad">Delhi → Ahmedabad Line</option>
              <option value="pune-hyderabad">Pune → Hyderabad Logistics</option>
            </select>
          </div>

          {/* Severity / Risk Filter */}
          <div className="md:col-span-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-bg-app text-table-cell font-table-cell text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-subtle"
            >
              <option value="all">Severity: All Levels</option>
              <option value="p1">P1 Critical Risk</option>
              <option value="p2">P2 High Impact</option>
              <option value="p3">P3 Medium Impact</option>
              <option value="p4">P4 Low / Nominal</option>
            </select>
          </div>

          {/* Carrier Filter */}
          <div className="md:col-span-2">
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-bg-app text-table-cell font-table-cell text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-subtle"
            >
              <option value="all">Carrier: All Fleets</option>
              <option value="coldtrans">ColdTrans Logistics Ltd</option>
              <option value="bluedart">Blue Dart Express</option>
              <option value="safexpress">SafeXpress Heavy</option>
              <option value="tci">TCI Freight Line</option>
              <option value="dhl">DHL Global Forwarding</option>
              <option value="transchem">TransChem Cargo</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-2 flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="h-8 px-3 rounded-lg bg-surface-container text-text-secondary hover:text-text-primary font-caption text-caption flex items-center gap-1 border border-border-subtle transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Micro Filter Switches */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border-subtle/50">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={filterDisruptedOnly}
                onChange={(e) => setFilterDisruptedOnly(e.target.checked)}
                className="rounded bg-bg-app text-primary-container focus:ring-0 focus:outline-none w-3.5 h-3.5"
                type="checkbox"
              />
              <span className="font-caption text-caption text-text-secondary">
                Disrupted Corridors Only (Flooding / Congestion)
              </span>
            </label>
            <div className="w-1 h-3 rounded-full bg-surface-container-high"></div>
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={filterHighValueOnly}
                onChange={(e) => setFilterHighValueOnly(e.target.checked)}
                className="rounded bg-bg-app text-primary-container focus:ring-0 focus:outline-none w-3.5 h-3.5"
                type="checkbox"
              />
              <span className="font-caption text-caption text-text-secondary">High Value Cargo (&gt; ₹50 Lakhs)</span>
            </label>
            <div className="w-1 h-3 rounded-full bg-surface-container-high"></div>
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={filterStrictColdChain}
                onChange={(e) => setFilterStrictColdChain(e.target.checked)}
                className="rounded bg-bg-app text-primary-container focus:ring-0 focus:outline-none w-3.5 h-3.5"
                type="checkbox"
              />
              <span className="font-caption text-caption text-text-secondary">Strict Telemetry (Cold Chain IoT)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-caption text-caption text-text-muted">
              Applied Filters: <strong className="text-text-primary">{activeFiltersCount} Active</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Split Workspace: 65% Enterprise Data Table | 35% Deep-Dive Investigation Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
        {/* LEFT 65%: Operational Shipments Data Table */}
        <div className="xl:col-span-8 flex flex-col gap-2.5">
          <div className="rounded-xl bg-bg-surface shadow-sm overflow-hidden flex flex-col border border-border-subtle">
            {/* Table Control Toolbar */}
            <div className="h-10 px-3 bg-surface-container-lowest flex items-center justify-between text-caption font-caption text-text-muted border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <span className="text-text-primary font-medium">
                  Filtered Results: {filteredShipments.length} Shipments
                </span>
                <span className="text-text-disabled">|</span>
                <div className="flex items-center gap-1 text-risk-critical">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-critical"></span>
                  <span>18 Require Intervention</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => resetFilters()}
                  className="px-2 py-1 rounded bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover flex items-center gap-1 border border-border-subtle"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[13px]">refresh</span>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Scrollable Table Body */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left font-table-cell text-table-cell border-collapse">
                <thead>
                  <tr className="h-9 bg-bg-sidebar text-text-muted font-caption text-caption uppercase tracking-wider select-none border-b border-border-subtle">
                    <th className="w-8 px-3 text-center">#</th>
                    <th className="px-2 font-medium">Shipment ID</th>
                    <th className="px-2 font-medium">Route &amp; Cargo Spec</th>
                    <th className="px-2 font-medium">Carrier &amp; Unit</th>
                    <th className="px-2 font-medium text-center">Priority</th>
                    <th className="px-2 font-medium">ETA &amp; Delay</th>
                    <th className="px-2 font-medium">Telemetry Risk</th>
                    <th className="px-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40 text-text-primary">
                  {filteredShipments.map((s, idx) => {
                    const isSelected = selectedShipmentId === s.id;
                    const priorityClass =
                      s.priority === 'P1 Critical'
                        ? 'bg-error-container/30 text-error border border-error/30'
                        : s.priority === 'P2 High'
                          ? 'bg-risk-high/20 text-risk-high border border-risk-high/30'
                          : s.priority === 'P3 Medium'
                            ? 'bg-risk-medium/20 text-risk-medium border border-risk-medium/30'
                            : 'bg-surface-container-high text-text-secondary';

                    const telemetryClass =
                      s.telemetryType === 'temp'
                        ? 'bg-error-container/20 text-error border border-error/30'
                        : s.telemetryType === 'flood'
                          ? 'bg-risk-high/20 text-risk-high border border-risk-high/30'
                          : s.telemetryType === 'mechanical'
                            ? 'bg-risk-medium/20 text-risk-medium border border-risk-medium/30'
                            : s.telemetryType === 'halt'
                              ? 'bg-risk-high/20 text-risk-high border border-risk-high/30'
                              : 'bg-risk-low/20 text-risk-low border border-risk-low/30';

                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedShipmentId(s.id)}
                        className={`h-14 transition-colors cursor-pointer relative group ${isSelected ? 'bg-bg-surface-hover ring-1 ring-primary/40' : 'hover:bg-bg-surface-hover'
                          }`}
                      >
                        <td className="w-8 px-3 text-center relative py-2">
                          {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                          <span className="text-text-disabled text-xs">{idx + 1}</span>
                        </td>
                        <td className="px-2 font-semibold text-primary py-2">
                          <div className="flex items-center gap-1.5">
                            <span>{s.id}</span>
                            {s.isColdChain && (
                              <span className="material-symbols-outlined text-[13px] text-status-info" title="IoT Connected Cold Chain">
                                sensors
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 min-w-[190px]">
                          <div className="font-medium text-text-primary leading-snug">{s.route}</div>
                          <div className="text-[11px] text-text-muted mt-0.5 leading-normal">
                            {s.cargo} • {s.cargoValue}
                          </div>
                        </td>
                        <td className="px-2 py-2 min-w-[150px]">
                          <div className="text-text-secondary leading-snug">{s.carrier}</div>
                          <div className="text-[11px] text-text-muted mt-0.5 leading-normal">
                            {s.unit} • Driver: {s.driver}
                          </div>
                        </td>
                        <td className="px-2 text-center py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-badge-label text-badge-label font-medium whitespace-nowrap ${priorityClass}`}>
                            {s.priority}
                          </span>
                        </td>
                        <td className="px-2 py-2 min-w-[120px]">
                          <div
                            className={`font-medium leading-snug ${s.delayEst.includes('Delay') ? 'text-risk-high' : 'text-risk-low'
                              }`}
                          >
                            {s.delayEst}
                          </div>
                          <div className="text-[11px] text-text-muted mt-0.5 leading-normal">{s.eta}</div>
                        </td>
                        <td className="px-2 py-2 min-w-[150px]">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-badge-label text-badge-label font-medium whitespace-nowrap shadow-sm ${telemetryClass}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {s.telemetryBadge}
                          </span>
                        </td>
                        <td className="px-3 text-right py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/shipments/${s.id}`);
                            }}
                            className="h-7 px-2.5 rounded bg-primary-container text-on-primary-container hover:bg-primary-hover font-card-title text-card-title text-[11px] transition-colors shadow-sm whitespace-nowrap"
                            type="button"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="h-10 px-3 bg-surface-container-lowest flex items-center justify-between font-caption text-caption text-text-muted select-none border-t border-border-subtle">
              <div>
                Showing <strong className="text-text-primary">1–{filteredShipments.length}</strong> of{' '}
                <strong className="text-text-primary">{filteredShipments.length}</strong> filtered records (Total: 1,248)
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="w-6 h-6 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-medium"
                  type="button"
                >
                  1
                </button>
                <button
                  className="w-6 h-6 rounded bg-bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center"
                  type="button"
                >
                  2
                </button>
              </div>
            </div>
          </div>

          {/* Live Corridor Disruption Strip */}
          <div className="p-3 bg-bg-surface rounded-xl shadow-sm flex items-center justify-between gap-4 border border-border-subtle">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-error-container/20 flex items-center justify-center flex-shrink-0 text-error">
                <span className="material-symbols-outlined text-[18px]">flood</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-card-title text-card-title text-text-primary truncate">
                    Active Disruption: NH-48 Pune-Hyderabad Corridor Flooding
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-error-container/30 text-error font-caption text-caption font-medium">
                    High Impact
                  </span>
                </div>
                <span className="font-caption text-caption text-text-muted truncate">
                  Affecting 17 Active Shipments • Reroute recommendations simulated for 12 transit units
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/disruptions')}
              className="h-7 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-text-secondary hover:text-text-primary font-card-title text-card-title text-[12px] flex items-center gap-1.5 flex-shrink-0 transition-colors"
              type="button"
            >
              <span>Inspect Corridor Map</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* RIGHT 35%: Selected Shipment Deep-Dive Panel */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          <div className="bg-bg-surface-raised rounded-xl shadow-md p-4 flex flex-col gap-3.5 border border-border-subtle">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-border-subtle/40">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-section-title text-section-title text-text-primary font-semibold">
                    {selectedShipment.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-error-container/30 text-error font-badge-label text-badge-label font-semibold flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-ping"></span>
                    {selectedShipment.priority}
                  </span>
                </div>
                <span className="font-caption text-caption text-text-muted mt-1 leading-normal">
                  Route: {selectedShipment.route}
                </span>
              </div>
              <button
                onClick={() => navigate(`/shipments/${selectedShipment.id}`)}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
                title="Expand Full View"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </button>
            </div>

            {/* AI Operational Rationale */}
            <div className="p-3.5 rounded-lg bg-bg-surface border-l-2 border-primary-container shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-primary font-caption text-caption font-semibold">
                  <span className="material-symbols-outlined text-[16px]">neurology</span>
                  <span>SupplyShield AI Operational Rationale</span>
                </div>
                <span className="font-caption text-caption text-text-muted bg-surface-container-high px-2 py-0.5 rounded font-medium whitespace-nowrap">
                  94% Confidence
                </span>
              </div>
              <p className="font-body-default text-body-default text-on-surface text-[12px] leading-relaxed">
                Corridor delay at Solapur Chokepoint has affected transit schedule. For unit{' '}
                <strong className="text-text-primary font-semibold">{selectedShipment.unit}</strong>, temperature is recorded at{' '}
                <span className="text-risk-critical font-semibold">{selectedShipment.currentTemp || '8.2°C'}</span> (Target: 2.0°C – 8.0°C).
              </p>
              <div className="flex items-center gap-2 pt-1 font-caption text-caption text-error border-t border-border-subtle/30">
                <span className="material-symbols-outlined text-[15px]">timer</span>
                <span>
                  Estimated buffer window: <strong className="font-semibold">1h 22m</strong> remaining.
                </span>
              </div>
            </div>

            {/* Real-Time Telemetry Curve (Inline SVG) */}
            <div className="p-3.5 bg-surface-container-lowest rounded-lg flex flex-col gap-2.5 border border-border-subtle">
              <div className="flex items-center justify-between gap-2 text-caption font-caption">
                <span className="text-text-secondary font-medium truncate">Temperature Sensor Stream (Core Probe)</span>
                <span className="text-risk-critical font-semibold text-[12px] whitespace-nowrap flex-shrink-0">
                  {selectedShipment.currentTemp || '9.4°C'} Current
                </span>
              </div>
              <div className="relative h-20 w-full bg-surface-container-low/40 rounded overflow-hidden pt-1">
                <div className="absolute left-0 right-0 top-[28%] bottom-[25%] bg-risk-low/10 pointer-events-none flex items-center justify-end px-2.5">
                  <span className="text-[9px] text-risk-low font-medium tracking-tight">Safe Zone [2°C - 8°C]</span>
                </div>
                <div className="absolute left-0 right-0 top-[28%] border-b border-error/40 border-dashed"></div>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 70">
                  <defs>
                    <linearGradient id="tempGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                      <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,45 Q30,42 60,44 T120,40 T180,48 T220,38 T260,20 T300,12 L300,70 L0,70 Z" fill="url(#tempGradient)" />
                  <path d="M0,45 Q30,42 60,44 T120,40 T180,48 T220,38 T260,20 T300,12" fill="none" stroke="#ef4444" strokeLinecap="round" strokeWidth="2" />
                  <circle cx="300" cy="12" fill="#ef4444" r="3.5" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                <span>04:00 (4.2°C)</span>
                <span>08:30 (Excursion Start)</span>
                <span className="text-error font-medium">Now ({selectedShipment.currentTemp || '9.4°C'} Alert)</span>
              </div>
            </div>

            {/* Route Milestones */}
            <div className="flex flex-col gap-2.5">
              <span className="font-card-title text-card-title text-text-secondary">Route Milestones &amp; Chokepoints</span>
              <div className="flex flex-col gap-3 pl-1.5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
                <div className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-risk-low flex items-center justify-center flex-shrink-0 z-10 mt-0.5">
                    <span className="material-symbols-outlined text-[11px] text-bg-app">check</span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-table-cell text-table-cell font-medium text-text-primary truncate">
                        Origin: {selectedShipment.route.split('→')[0]}
                      </span>
                      <span className="font-caption text-caption text-text-muted whitespace-nowrap">Dep: 04:30 AM</span>
                    </div>
                    <span className="font-caption text-caption text-text-muted leading-normal">
                      Loaded payload at certified safe threshold
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-risk-critical flex items-center justify-center flex-shrink-0 z-10 shadow-[0_0_0_3px_rgba(239,68,68,0.25)] mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-table-cell text-table-cell font-medium text-error truncate">
                        Current: Solapur Checkpoint
                      </span>
                      <span className="font-caption text-caption text-error font-semibold whitespace-nowrap">LIVE ALERT</span>
                    </div>
                    <span className="font-caption text-caption text-text-secondary leading-normal">
                      Vehicle moving at 24 km/h • Secondary compressor active
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 z-10 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-disabled"></span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-table-cell text-table-cell font-medium text-text-muted truncate">
                        Destination: {selectedShipment.route.split('→')[1]}
                      </span>
                      <span className="font-caption text-caption text-text-muted whitespace-nowrap">
                        Est: {selectedShipment.eta}
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-disabled leading-normal">
                      Target unloading bay Cold Vault
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry Matrix */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 bg-bg-surface rounded-lg flex flex-col justify-between min-h-[64px] border border-border-subtle">
                <span className="font-caption text-caption text-text-muted block">Cargo Value</span>
                <span className="font-card-title text-card-title text-text-primary font-semibold mt-0.5">
                  {selectedShipment.cargoValue}
                </span>
                <span className="font-caption text-caption text-text-secondary block truncate mt-0.5">
                  {selectedShipment.cargo}
                </span>
              </div>
              <div className="p-2.5 bg-bg-surface rounded-lg flex flex-col justify-between min-h-[64px] border border-border-subtle">
                <span className="font-caption text-caption text-text-muted block">Carrier Unit</span>
                <span className="font-card-title text-card-title text-text-primary font-semibold mt-0.5">
                  {selectedShipment.unit}
                </span>
                <span className="font-caption text-caption text-text-secondary block truncate mt-0.5">
                  {selectedShipment.carrier}
                </span>
              </div>
            </div>

            {/* AI Prescription & Action */}
            <div className="p-3.5 bg-surface-container-high rounded-xl flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-2 text-text-primary">
                <span className="material-symbols-outlined text-[18px] text-primary">auto_fix_high</span>
                <span className="font-card-title text-card-title font-semibold">Prescribed Mitigations</span>
              </div>
              <div className="p-3 rounded-lg bg-bg-app text-table-cell font-table-cell text-on-surface flex flex-col gap-1.5 border border-border-subtle/50">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-text-primary leading-snug">Option A: Solapur Cold Depot Offload</span>
                  <span className="font-caption text-caption text-risk-low bg-risk-low/10 px-2 py-0.5 rounded font-semibold whitespace-nowrap flex-shrink-0">
                    AI Recommended
                  </span>
                </div>
                <span className="text-caption font-caption text-text-muted leading-relaxed">
                  Facility 14.2 km away (22m transit) with certified 4°C medical bays. Prevents cargo spoilage.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={() => setEmergencyActionAuthorized(!emergencyActionAuthorized)}
                  className={`w-full sm:flex-1 h-8 px-3 rounded-lg font-card-title text-card-title text-[12px] flex items-center justify-center gap-1.5 shadow-sm transition-all duration-150 active:scale-[0.98] whitespace-nowrap ${emergencyActionAuthorized
                      ? 'bg-risk-low text-on-primary font-semibold'
                      : 'bg-primary-container text-on-primary-container hover:bg-primary-hover font-semibold'
                    }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {emergencyActionAuthorized ? 'check_circle' : 'alt_route'}
                  </span>
                  <span>{emergencyActionAuthorized ? 'Reroute Dispatched' : 'Authorize Emergency Reroute'}</span>
                </button>
                <button
                  onClick={() => alert(`Calling Dispatch Desk for driver ${selectedShipment.driver} (${selectedShipment.unit})`)}
                  className="w-full sm:w-auto px-3.5 h-8 rounded-lg bg-surface-container-highest text-text-secondary hover:text-text-primary font-card-title text-card-title text-[12px] flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">call</span>
                  <span>Call Driver</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingest Shipment Modal Dialog */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface-raised border border-border-strong rounded-xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
                <h3 className="font-section-title text-section-title text-text-primary">Add / Ingest New Shipment</h3>
              </div>
              <button
                onClick={() => setIsIngestModalOpen(false)}
                className="text-text-muted hover:text-text-primary"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 font-caption text-caption text-text-secondary">
              <div>
                <label className="block text-text-muted mb-1">Shipment Tracking ID</label>
                <input
                  defaultValue={`SHP-0${Math.floor(100 + Math.random() * 900)}`}
                  className="w-full h-8 px-3 rounded-lg bg-bg-app border border-border-subtle text-text-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted mb-1">Origin Hub → Destination Port</label>
                <input
                  defaultValue="Pune Hub → Chennai DC"
                  className="w-full h-8 px-3 rounded-lg bg-bg-app border border-border-subtle text-text-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-text-muted mb-1">Cargo Spec</label>
                  <input
                    defaultValue="Vaccines / Pharma"
                    className="w-full h-8 px-3 rounded-lg bg-bg-app border border-border-subtle text-text-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1">Cargo Value (₹)</label>
                  <input
                    defaultValue="₹1.20 Cr"
                    className="w-full h-8 px-3 rounded-lg bg-bg-app border border-border-subtle text-text-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
              <button
                onClick={() => setIsIngestModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-bg-surface text-text-secondary hover:text-text-primary text-xs"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Shipment successfully ingested into telemetry stream!');
                  setIsIngestModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold"
                type="button"
              >
                Save &amp; Track
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
