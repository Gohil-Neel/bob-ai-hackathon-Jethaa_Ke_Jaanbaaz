import React, { useEffect, useState } from 'react'
import {
  Route as RouteIcon,
  Plane,
  Ship,
  Truck,
  Train,
  Clock,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers
} from 'lucide-react'
import { getRoutes } from '../services/api'
import type { Route } from '../types/domain'

export const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  const fetchRoutesData = async () => {
    setLoading(true)
    try {
      const data = await getRoutes()
      setRoutes(data)
      if (data.length > 0 && !selectedRoute) {
        setSelectedRoute(data[0])
      }
    } catch (err) {
      console.error('Failed to load routes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutesData()
  }, [])

  const filteredRoutes = routes.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.origin.toLowerCase().includes(search.toLowerCase()) ||
      r.destination.toLowerCase().includes(search.toLowerCase()) ||
      (r.carrierCode && r.carrierCode.toLowerCase().includes(search.toLowerCase()))
    const matchFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'ACTIVE' && r.isActive) ||
      (activeFilter === 'INACTIVE' && !r.isActive)
    return matchSearch && matchFilter
  })

  const getModeIcon = (mode: string) => {
    const m = mode.toUpperCase()
    if (m.includes('AIR')) return <Plane className="w-4 h-4 text-sky-400" />
    if (m.includes('MARITIME') || m.includes('SEA') || m.includes('OCEAN'))
      return <Ship className="w-4 h-4 text-cyan-400" />
    if (m.includes('RAIL') || m.includes('TRAIN'))
      return <Train className="w-4 h-4 text-amber-400" />
    return <Truck className="w-4 h-4 text-emerald-400" />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <RouteIcon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Corridors & Multimodal Routes
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Global transit corridors, multi-leg segment sequencing, and carrier network topology.
          </p>
        </div>

        <button
          onClick={fetchRoutesData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Topology
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Corridors</p>
          <p className="text-2xl font-bold text-white mt-1.5">{routes.length}</p>
          <span className="text-xs text-indigo-400 mt-2 block font-medium">Mapped global network</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Corridors</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1.5">
            {routes.filter((r) => r.isActive).length}
          </p>
          <span className="text-xs text-emerald-400/80 mt-2 block font-medium">Operational & verified</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Route Legs</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1.5">
            {routes.reduce((acc, r) => acc + (r.segments?.length || r.segmentsCount || 0), 0)}
          </p>
          <span className="text-xs text-cyan-400/80 mt-2 block font-medium">Multimodal transitions</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Transit Time</p>
          <p className="text-2xl font-bold text-amber-400 mt-1.5">
            {routes.length > 0
              ? Math.round(routes.reduce((acc, r) => acc + r.estimatedHours, 0) / routes.length)
              : 0}{' '}
            <span className="text-sm font-normal text-slate-400">hrs</span>
          </p>
          <span className="text-xs text-amber-400/80 mt-2 block font-medium">End-to-end SLA</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, origin, destination, carrier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 uppercase font-semibold">Status:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Two-column master-detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Corridor Catalog ({filteredRoutes.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Loading corridors...
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
              No routes found matching filter.
            </div>
          ) : (
            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {filteredRoutes.map((route) => {
                const isSelected = selectedRoute?.id === route.id
                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-base">{route.name}</span>
                          {route.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              <XCircle className="w-2.5 h-2.5" />
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                          <span className="text-slate-300 font-medium">{route.origin}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-300 font-medium">{route.destination}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-indigo-300 px-2 py-1 rounded bg-indigo-950/60 border border-indigo-800/40">
                          {route.carrierCode || 'UNASSIGNED'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400 justify-end mt-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{route.estimatedHours}h</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {route.segments?.length || route.segmentsCount || 0} Segment(s)
                      </span>
                      <span className="text-indigo-400 font-medium hover:underline flex items-center gap-1">
                        Inspect Leg Flow <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Route Breakdown & Multimodal Leg Flow */}
        <div className="lg:col-span-7">
          {selectedRoute ? (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-6 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-slate-400">ID: {selectedRoute.id}</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{selectedRoute.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Primary Carrier: {selectedRoute.carrierCode || 'Open Assignment'}
                  </span>
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    Total: {selectedRoute.estimatedHours} Hours
                  </span>
                </div>
              </div>

              {/* Geographic Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    Origin Terminal
                  </div>
                  <p className="text-base font-bold text-slate-200 mt-1">{selectedRoute.origin}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Destination Hub
                  </div>
                  <p className="text-base font-bold text-slate-200 mt-1">{selectedRoute.destination}</p>
                </div>
              </div>

              {/* Multimodal Segments Timeline */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Multimodal Segments & Waypoints ({selectedRoute.segments?.length ?? 0})
                  </h4>
                </div>

                {selectedRoute.segments && selectedRoute.segments.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
                    {selectedRoute.segments
                      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                      .map((seg, idx) => (
                        <div
                          key={seg.id || idx}
                          className="relative flex items-start gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 pl-10"
                        >
                          <div className="absolute left-2.5 top-5 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">
                            {seg.sequenceOrder}
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                                  {getModeIcon(seg.transportMode)}
                                </span>
                                <div>
                                  <p className="text-sm font-bold text-white">
                                    {seg.fromLocation} <span className="text-slate-500">→</span> {seg.toLocation}
                                  </p>
                                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                    Mode: {seg.transportMode}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-900/40">
                                  <Clock className="w-3 h-3" />
                                  {seg.estimatedHours} hrs
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800/80 text-sm">
                    No individual segment breakdown registered for this corridor.
                  </div>
                )}
              </div>

              {/* AI Network Validation Notice */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-indigo-300">Live Dynamic Rerouting Engine Active</p>
                  This corridor is continuously evaluated against global weather patterns, port congestion,
                  and cold chain telemetry to generate instant recovery paths during disruptions.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
              Select a corridor from the list to view multimodal leg sequencing.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
