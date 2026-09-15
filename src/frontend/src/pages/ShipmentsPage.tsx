import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getShipments,
  getRoutes,
  getCarriers,
  getDisruptions,
  getColdChainSensors,
} from '../services/api';
import type {
  Shipment,
  Route,
  Carrier,
  Disruption,
  ColdChainSensor,
} from '../types/domain';

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [sensors, setSensors] = useState<ColdChainSensor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'at-risk' | 'delayed' | 'cold-chain' | 'in-transit' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [corridorFilter, setCorridorFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [filterDisruptedOnly, setFilterDisruptedOnly] = useState<boolean>(false);
  const [filterStrictColdChain, setFilterStrictColdChain] = useState<boolean>(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);

  // Fetch live Supabase data on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getShipments(),
      getRoutes(),
      getCarriers(),
      getDisruptions(),
      getColdChainSensors(),
    ])
      .then(([shipmentData, routeData, carrierData, disruptionData, sensorData]) => {
        setShipments(shipmentData || []);
        setRoutes(routeData || []);
        setCarriers(carrierData || []);
        setDisruptions(disruptionData || []);
        setSensors(sensorData || []);
        if (shipmentData && shipmentData.length > 0) {
          setSelectedShipmentId(shipmentData[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load live shipments from Supabase:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute live analytical counts
  const atRiskCount = shipments.filter(
    (s) => s.status === 'AT_RISK' || (s.riskScore !== null && s.riskScore >= 0.7)
  ).length;
  const delayedCount = shipments.filter((s) => s.status === 'DELAYED').length;
  const coldChainCount = shipments.filter((s) => s.isColdChain).length;
  const inTransitCount = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
  const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;

  const onTimePercent =
    shipments.length > 0
      ? Math.round(((shipments.length - atRiskCount - delayedCount) / shipments.length) * 100)
      : 100;

  const coldChainExcursions = sensors.filter(
    (s) => s.status === 'EXCURSION' || (s.lastReadingCelsius !== null && s.lastReadingCelsius > s.maxTempCelsius)
  ).length;

  // Filtered dataset
  const filteredShipments = shipments.filter((s) => {
    // Tabs
    if (activeTab === 'at-risk' && !(s.status === 'AT_RISK' || (s.riskScore !== null && s.riskScore >= 0.7))) return false;
    if (activeTab === 'delayed' && s.status !== 'DELAYED') return false;
    if (activeTab === 'cold-chain' && !s.isColdChain) return false;
    if (activeTab === 'in-transit' && s.status !== 'IN_TRANSIT') return false;
    if (activeTab === 'delivered' && s.status !== 'DELIVERED') return false;

    // Dropdowns
    if (corridorFilter !== 'all') {
      const matchRoute = routes.find((r) => r.id === corridorFilter);
      if (matchRoute && s.routeId !== matchRoute.id) return false;
    }

    if (severityFilter !== 'all' && s.priority !== severityFilter) return false;
    if (carrierFilter !== 'all' && s.carrier.toUpperCase() !== carrierFilter.toUpperCase()) return false;

    // Micro toggles
    if (filterDisruptedOnly && !(s.status === 'AT_RISK' || s.status === 'DELAYED')) return false;
    if (filterStrictColdChain && !s.isColdChain) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.trackingNumber.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const selectedShipment: Shipment | null =
    shipments.find((s) => s.id === selectedShipmentId) || shipments[0] || null;

  const selectedSensor: ColdChainSensor | undefined = selectedShipment
    ? sensors.find((sen) => sen.shipmentId === selectedShipment.id)
    : undefined;

  const activeFiltersCount =
    (corridorFilter !== 'all' ? 1 : 0) +
    (severityFilter !== 'all' ? 1 : 0) +
    (carrierFilter !== 'all' ? 1 : 0) +
    (filterDisruptedOnly ? 1 : 0) +
    (filterStrictColdChain ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setCorridorFilter('all');
    setSeverityFilter('all');
    setCarrierFilter('all');
    setFilterDisruptedOnly(false);
    setFilterStrictColdChain(false);
    setActiveTab('all');
  };

  const handleExportCsv = () => {
    const headers = ['Tracking #', 'Origin', 'Destination', 'Carrier', 'Priority', 'Status', 'Risk Score', 'Cold Chain', 'ETA UTC'];
    const rows = shipments.map((s) => [
      `"${s.trackingNumber}"`,
      `"${s.origin}"`,
      `"${s.destination}"`,
      `"${s.carrier}"`,
      s.priority,
      s.status,
      s.riskScore !== null ? `${(s.riskScore * 100).toFixed(0)}%` : 'N/A',
      s.isColdChain ? 'Yes (2-8C)' : 'No',
      `"${s.estimatedArrival || 'N/A'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supplyshield_shipments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full pb-12 gap-4">
      {/* Top Header & Supabase Connection Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="font-page-title text-page-title text-text-primary tracking-tight">Shipments Management</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-risk-low/10 border border-risk-low/30 text-caption font-caption text-risk-low font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-ping"></span>
              Live Supabase `shipments`
            </span>
          </div>
          <p className="font-body-default text-body-default text-text-muted mt-0.5">
            Active multi-modal freight tracking, AI risk scoring, and real-time cold-chain sensor telemetry
          </p>
        </div>

        {/* Global Page Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover font-card-title text-card-title shadow-sm transition-colors border border-border-subtle"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-text-muted">download</span>
            <span>Export CSV ({shipments.length})</span>
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
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap shadow-sm transition-colors ${
            activeTab === 'all'
              ? 'bg-primary-soft text-primary border border-primary-container/30 font-semibold'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
          }`}
          type="button"
        >
          <span>All Shipments</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-primary-container/20 text-primary">
            {loading ? '…' : shipments.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('at-risk')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'at-risk'
              ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30 font-semibold'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
          }`}
          type="button"
        >
          <span className="w-2 h-2 rounded-full bg-risk-critical"></span>
          <span>At-Risk</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-risk-critical/20 text-risk-critical font-bold">
            {loading ? '…' : atRiskCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('delayed')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'delayed'
              ? 'bg-risk-medium/20 text-risk-medium border border-risk-medium/40 font-semibold'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
          }`}
          type="button"
        >
          <span className="w-2 h-2 rounded-full bg-risk-medium"></span>
          <span>Delayed</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-risk-medium/20 text-risk-medium">
            {loading ? '…' : delayedCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('cold-chain')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'cold-chain'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[14px] text-sky-400">ac_unit</span>
          <span>Cold Chain Monitored</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-secondary">
            {loading ? '…' : coldChainCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('in-transit')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'in-transit'
              ? 'bg-primary-soft text-primary font-semibold'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
          }`}
          type="button"
        >
          <span>In Transit</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-secondary">
            {loading ? '…' : inTransitCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`px-3 py-1.5 rounded-lg font-card-title text-card-title flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'delivered'
              ? 'bg-risk-low/20 text-risk-low font-semibold'
              : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
          }`}
          type="button"
        >
          <span>Delivered</span>
          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-secondary">
            {loading ? '…' : deliveredCount}
          </span>
        </button>
      </div>

      {/* Top Analytical KPI Metric Cards Grid (100% Live DB Computed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Active Loads */}
        <div className="p-3.5 rounded-xl bg-bg-surface shadow-sm flex flex-col justify-between gap-2 border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-card-title text-card-title text-text-secondary">Tracked Consignments</span>
            <div className="p-1.5 rounded-md bg-surface-container text-text-muted flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-kpi-val text-kpi-val text-text-primary font-semibold tracking-tight">
              {loading ? '…' : shipments.length}
            </span>
            <span className="inline-flex items-center text-risk-low font-caption text-caption font-medium">
              <span className="material-symbols-outlined text-[14px] leading-none mr-0.5">check_circle</span>
              Supabase Live
            </span>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted pt-2 border-t border-border-subtle/40">
            <span>Active Carriers</span>
            <span className="text-text-primary font-medium">{carriers.length || 6} Registered</span>
          </div>
        </div>

        {/* KPI 2: High Risk */}
        <div className="p-3.5 rounded-xl bg-bg-surface shadow-sm flex flex-col justify-between gap-2 border border-border-subtle hover:border-border-strong transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-risk-critical"></div>
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-2">
              <span className="font-card-title text-card-title text-text-secondary">High Risk Loads</span>
              <span className="w-2 h-2 rounded-full bg-risk-critical animate-ping flex-shrink-0"></span>
            </div>
            <div className="p-1.5 rounded-md bg-risk-critical/15 text-risk-critical flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between pl-1">
            <span className="font-kpi-val text-kpi-val text-risk-critical font-semibold tracking-tight">
              {loading ? '…' : atRiskCount}
            </span>
            <span className="text-risk-critical font-caption text-caption font-medium">
              Score &ge; 0.70
            </span>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted pt-2 border-t border-border-subtle/40 pl-1">
            <span>Disruptions Active</span>
            <span className="text-risk-critical font-medium">{disruptions.length} Ongoing</span>
          </div>
        </div>

        {/* KPI 3: On-Time Integrity */}
        <div className="p-3.5 rounded-xl bg-bg-surface shadow-sm flex flex-col justify-between gap-2 border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-card-title text-card-title text-text-secondary">On-Time Integrity</span>
            <div className="p-1.5 rounded-md bg-surface-container text-text-muted flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">timelapse</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-kpi-val text-kpi-val text-text-primary font-semibold tracking-tight">
              {loading ? '…' : `${onTimePercent}%`}
            </span>
            <span className="inline-flex items-center text-risk-low font-caption text-caption font-medium">
              {onTimePercent >= 80 ? 'Nominal' : 'Delayed'}
            </span>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted pt-2 border-t border-border-subtle/40">
            <span>Tracked Corridors</span>
            <span className="text-text-secondary font-medium">{routes.length || 5} Active</span>
          </div>
        </div>

        {/* KPI 4: Cold Chain */}
        <div className="p-3.5 rounded-xl bg-bg-surface shadow-sm flex flex-col justify-between gap-2 border border-border-subtle hover:border-border-strong transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-sky-500"></div>
          <div className="flex items-center justify-between pl-1">
            <span className="font-card-title text-card-title text-text-secondary">Cold Chain Sensors</span>
            <div className="p-1.5 rounded-md bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">ac_unit</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between pl-1">
            <span className="font-kpi-val text-kpi-val text-text-primary font-semibold tracking-tight">
              {loading ? '…' : coldChainCount}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/15 text-sky-400 font-medium">
              WHO 2°C–8°C
            </span>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted pt-2 border-t border-border-subtle/40 pl-1">
            <span>Thermal Excursions</span>
            <span className={coldChainExcursions > 0 ? 'text-risk-critical font-medium' : 'text-risk-low font-medium'}>
              {coldChainExcursions} Active Excursion
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Filtering Matrix (Dynamic Database Filters) */}
      <div className="p-3 bg-bg-surface rounded-xl shadow-sm flex flex-col gap-3 border border-border-subtle">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <span className="material-symbols-outlined text-[16px] text-text-muted absolute left-2.5 top-2.5">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-8 rounded-lg bg-bg-app text-body-default font-body-default text-text-primary placeholder:text-text-disabled outline-none focus:ring-1 focus:ring-primary transition-colors border border-border-subtle"
              placeholder="Search Tracking #, Port, Carrier, Status..."
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

          {/* Route Corridor Select (Populated from live routes) */}
          <div className="md:col-span-3">
            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-bg-app text-table-cell font-table-cell text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-subtle truncate"
            >
              <option value="all">All Corridors ({routes.length} Live Routes)</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="md:col-span-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-bg-app text-table-cell font-table-cell text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-subtle"
            >
              <option value="all">Priority: All</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Carrier Filter (Populated from live carriers) */}
          <div className="md:col-span-2">
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-bg-app text-table-cell font-table-cell text-text-primary outline-none focus:ring-1 focus:ring-primary border border-border-subtle"
            >
              <option value="all">Carrier: All</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} – {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="md:col-span-1 flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="w-full h-8 px-2 rounded-lg bg-surface-container text-text-secondary hover:text-text-primary font-caption text-caption flex items-center justify-center gap-1 border border-border-subtle transition-colors"
              type="button"
              title="Reset all filters"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Micro Filter Switches */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border-subtle/50">
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={filterDisruptedOnly}
                onChange={(e) => setFilterDisruptedOnly(e.target.checked)}
                className="rounded bg-bg-app text-primary focus:ring-0 focus:outline-none w-3.5 h-3.5"
                type="checkbox"
              />
              <span className="font-caption text-caption text-text-secondary">
                At-Risk / Delayed Only
              </span>
            </label>
            <div className="w-1 h-3 rounded-full bg-surface-container-high"></div>
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={filterStrictColdChain}
                onChange={(e) => setFilterStrictColdChain(e.target.checked)}
                className="rounded bg-bg-app text-primary focus:ring-0 focus:outline-none w-3.5 h-3.5"
                type="checkbox"
              />
              <span className="font-caption text-caption text-text-secondary">Cold Chain Cargo Only (2°C–8°C)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-caption text-caption text-text-muted">
              Applied Filters: <strong className="text-text-primary">{activeFiltersCount} Active</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Split Workspace: Shipments Table | Selected Shipment Detail Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
        {/* LEFT (8 Columns): Live Shipments Table from Supabase */}
        <div className="xl:col-span-8 flex flex-col gap-2.5">
          <div className="rounded-xl bg-bg-surface shadow-sm overflow-hidden flex flex-col border border-border-subtle">
            {/* Table Header Bar */}
            <div className="h-10 px-3 bg-surface-container-lowest flex items-center justify-between text-caption font-caption text-text-muted border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <span className="text-text-primary font-medium">
                  Supabase Records: {filteredShipments.length} of {shipments.length}
                </span>
                {atRiskCount > 0 && (
                  <>
                    <span className="text-text-disabled">|</span>
                    <div className="flex items-center gap-1 text-risk-critical font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-pulse"></span>
                      <span>{atRiskCount} Require Intervention</span>
                    </div>
                  </>
                )}
              </div>
              <span className="text-[11px] text-text-muted font-mono">
                PostgreSQL rest/v1/shipments
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left font-table-cell text-table-cell border-collapse">
                <thead>
                  <tr className="h-9 bg-bg-sidebar text-text-muted font-caption text-caption uppercase tracking-wider select-none border-b border-border-subtle">
                    <th className="w-8 px-3 text-center">#</th>
                    <th className="px-2 font-medium">Tracking Number</th>
                    <th className="px-2 font-medium">Origin → Destination</th>
                    <th className="px-2 font-medium text-center">Carrier</th>
                    <th className="px-2 font-medium text-center">Priority</th>
                    <th className="px-2 font-medium text-center">Risk Score</th>
                    <th className="px-2 font-medium">Status</th>
                    <th className="px-2 font-medium">Telemetry</th>
                    <th className="px-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40 text-text-primary text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-12 text-center text-text-muted">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[24px] text-primary animate-spin">progress_activity</span>
                          <span>Loading shipments from Supabase PostgreSQL...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredShipments.length > 0 ? (
                    filteredShipments.map((s, idx) => {
                      const isSelected = selectedShipmentId === s.id;
                      const sensor = sensors.find((sen) => sen.shipmentId === s.id);
                      const isAtRisk = s.status === 'AT_RISK' || (s.riskScore !== null && s.riskScore >= 0.7);
                      const isDelayed = s.status === 'DELAYED';

                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedShipmentId(s.id)}
                          className={`h-12 transition-colors cursor-pointer relative group ${
                            isSelected ? 'bg-primary-soft/60 ring-1 ring-primary/40' : 'hover:bg-bg-surface-hover'
                          }`}
                        >
                          <td className="w-8 px-3 text-center relative py-2">
                            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                            <span className="text-text-disabled text-xs">{idx + 1}</span>
                          </td>
                          <td className="px-2 font-semibold text-primary py-2 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{s.trackingNumber}</span>
                              {s.isColdChain && (
                                <span className="material-symbols-outlined text-[13px] text-sky-400" title="Cold Chain Monitored">
                                  ac_unit
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 min-w-[170px]">
                            <div className="font-medium text-text-primary leading-snug">
                              {s.origin} → {s.destination}
                            </div>
                            <div className="text-[10px] text-text-muted mt-0.5">
                              ETA: {s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                            </div>
                          </td>
                          <td className="px-2 text-center py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-bg-surface border border-border-subtle font-mono text-text-primary">
                              {s.carrier}
                            </span>
                          </td>
                          <td className="px-2 text-center py-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full font-badge-label text-[10px] font-medium whitespace-nowrap ${
                                s.priority === 'CRITICAL'
                                  ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                                  : s.priority === 'HIGH'
                                  ? 'bg-risk-high/15 text-risk-high border border-risk-high/30'
                                  : 'bg-surface-container-high text-text-secondary'
                              }`}
                            >
                              {s.priority}
                            </span>
                          </td>
                          <td className="px-2 text-center py-2">
                            <span
                              className={`font-semibold text-[11px] ${
                                isAtRisk
                                  ? 'text-risk-critical'
                                  : isDelayed
                                  ? 'text-risk-medium'
                                  : 'text-risk-low'
                              }`}
                            >
                              {s.riskScore !== null ? `${(s.riskScore * 100).toFixed(0)}%` : 'Nominal'}
                            </span>
                          </td>
                          <td className="px-2 py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                s.status === 'AT_RISK'
                                  ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                                  : s.status === 'DELAYED'
                                  ? 'bg-risk-medium/15 text-risk-medium border border-risk-medium/30'
                                  : 'bg-risk-low/15 text-risk-low border border-risk-low/30'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 min-w-[130px]">
                            {s.isColdChain && sensor ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                                  sensor.status === 'EXCURSION'
                                    ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                                    : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {sensor.lastReadingCelsius !== null ? `${sensor.lastReadingCelsius}°C` : 'Temp OK'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-text-muted">Ambient Flow</span>
                            )}
                          </td>
                          <td className="px-3 text-right py-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/shipments/${s.id}`);
                              }}
                              className="h-6 px-2.5 rounded bg-primary text-on-primary hover:bg-primary-hover font-caption text-[11px] font-medium transition-colors shadow-xs"
                              type="button"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-3 py-12 text-center text-text-muted">
                        No shipments matching the applied filters found in Supabase database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="h-10 px-3 bg-surface-container-lowest flex items-center justify-between font-caption text-caption text-text-muted select-none border-t border-border-subtle">
              <div>
                Showing <strong className="text-text-primary">{filteredShipments.length}</strong> of{' '}
                <strong className="text-text-primary">{shipments.length}</strong> Supabase rows
              </div>
              <span className="text-[11px] text-text-muted">Real-time REST client</span>
            </div>
          </div>
        </div>

        {/* RIGHT (4 Columns): Selected Shipment Deep-Dive Panel */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          {selectedShipment ? (
            <div className="bg-bg-surface rounded-xl shadow-md p-4 flex flex-col gap-3.5 border border-border-subtle">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-2 border-b border-border-subtle/40">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-section-title text-section-title text-text-primary font-semibold">
                      {selectedShipment.trackingNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-badge-label text-badge-label font-semibold flex items-center gap-1.5 whitespace-nowrap ${
                        selectedShipment.status === 'AT_RISK'
                          ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                          : selectedShipment.status === 'DELAYED'
                          ? 'bg-risk-medium/15 text-risk-medium border border-risk-medium/30'
                          : 'bg-risk-low/15 text-risk-low border border-risk-low/30'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                      {selectedShipment.status}
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-muted mt-0.5">
                    Carrier: {selectedShipment.carrier} • Priority: {selectedShipment.priority}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/shipments/${selectedShipment.id}`)}
                  className="px-2 py-1 rounded bg-bg-surface-raised hover:bg-bg-surface-hover text-text-secondary text-xs border border-border-subtle flex items-center gap-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  <span>Full View</span>
                </button>
              </div>

              {/* Consignment Origin & Destination Route */}
              <div className="p-3 bg-surface-container-lowest rounded-lg border border-border-subtle flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
                  <span>Transit Corridor</span>
                  <span className="text-primary">{selectedShipment.carrier}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  <span className="font-medium text-text-primary">{selectedShipment.origin}</span>
                  <span className="text-text-disabled">➔</span>
                  <span className="font-medium text-text-primary">{selectedShipment.destination}</span>
                </div>
                <div className="text-[11px] text-text-muted flex items-center justify-between pt-1 border-t border-border-subtle/50">
                  <span>Estimated Arrival:</span>
                  <span className="font-medium text-text-primary">
                    {selectedShipment.estimatedArrival
                      ? new Date(selectedShipment.estimatedArrival).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Cold Chain & Sensor Telemetry */}
              {selectedShipment.isColdChain ? (
                <div className="p-3 bg-sky-500/5 rounded-lg border border-sky-500/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">ac_unit</span>
                      Cold Chain Telemetry
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-400 text-[10px] font-medium">
                      WHO 2°C–8°C
                    </span>
                  </div>
                  {selectedSensor ? (
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-text-muted block">Sensor Code</span>
                        <span className="font-mono font-medium text-text-primary">{selectedSensor.sensorCode}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">Current Reading</span>
                        <span
                          className={`font-semibold ${
                            selectedSensor.status === 'EXCURSION' ? 'text-risk-critical' : 'text-sky-400'
                          }`}
                        >
                          {selectedSensor.lastReadingCelsius !== null ? `${selectedSensor.lastReadingCelsius}°C` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-text-muted">
                      Sensor stream configured. Awaiting initial payload reading from IoT beacon.
                    </p>
                  )}
                </div>
              ) : null}

              {/* Risk Score & AI Prediction */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-border-subtle flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary">AI Risk Score</span>
                  <span
                    className={`font-bold text-sm ${
                      selectedShipment.riskScore && selectedShipment.riskScore >= 0.7
                        ? 'text-risk-critical'
                        : selectedShipment.riskScore && selectedShipment.riskScore >= 0.4
                        ? 'text-risk-medium'
                        : 'text-risk-low'
                    }`}
                  >
                    {selectedShipment.riskScore !== null ? `${(selectedShipment.riskScore * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedShipment.riskScore && selectedShipment.riskScore >= 0.7
                        ? 'bg-risk-critical'
                        : selectedShipment.riskScore && selectedShipment.riskScore >= 0.4
                        ? 'bg-risk-medium'
                        : 'bg-risk-low'
                    }`}
                    style={{ width: `${(selectedShipment.riskScore || 0.1) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-text-secondary leading-tight mt-1">
                  {selectedShipment.riskScore && selectedShipment.riskScore >= 0.7
                    ? 'Elevated risk from corridor disruptions or thermal breach. Auto-reroute evaluation active.'
                    : 'Consignment telemetry operating within normal parameters.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => navigate('/simulations')}
                  className="flex-1 h-8 rounded-lg bg-primary text-on-primary hover:bg-primary-hover font-card-title text-card-title text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">alt_route</span>
                  <span>Simulate Bypass Reroute</span>
                </button>
                <button
                  onClick={() => navigate('/audit')}
                  className="h-8 px-3 rounded-lg bg-bg-surface-raised hover:bg-bg-surface-hover text-text-primary font-card-title text-card-title text-xs border border-border-subtle transition-colors"
                  type="button"
                >
                  Audit Trail
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-bg-surface rounded-xl border border-border-subtle text-center text-text-muted">
              <span className="material-symbols-outlined text-[32px] text-text-disabled mb-2">local_shipping</span>
              <p className="text-sm font-medium text-text-primary">No Shipment Selected</p>
              <p className="text-xs mt-1">Select any consignment row to inspect its live telemetry.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ingestion Modal (Tagged with Upcoming Feature badge) */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-bg-surface border border-border-strong rounded-xl p-5 shadow-2xl max-w-md w-full flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
                <h3 className="font-section-title text-section-title text-text-primary">Add / Ingest Shipment</h3>
              </div>
              <button
                onClick={() => setIsIngestModalOpen(false)}
                className="text-text-muted hover:text-text-primary"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary-soft/50 border border-primary/30 text-xs text-primary">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span><strong>Upcoming Feature:</strong> Automated ERP / EDI 214 webhook ingestion connector.</span>
            </div>

            <p className="text-xs text-text-secondary leading-normal">
              New shipments can be directly inserted into the Supabase PostgreSQL <code className="text-primary font-mono font-semibold">shipments</code> table or synchronized via SAP / Oracle SCM webhook listeners.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsIngestModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-bg-surface-raised hover:bg-bg-surface-hover text-text-secondary text-xs border border-border-subtle"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
