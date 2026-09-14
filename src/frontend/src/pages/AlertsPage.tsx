import { useEffect, useState } from 'react'
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  Check
} from 'lucide-react'
import { getAlerts, acknowledgeAlert } from '../services/api'
import type { Alert } from '../types/domain'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNACKNOWLEDGED' | 'ACKNOWLEDGED'>('ALL')
  const [search, setSearch] = useState('')
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAlerts()
      setAlerts(data)
    } catch (err) {
      console.error('Failed to load alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAcknowledge = async (id: string) => {
    setAcknowledgingId(id)
    try {
      const success = await acknowledgeAlert(id)
      if (success) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, isAcknowledged: true, acknowledgedAt: new Date().toISOString() }
              : a
          )
        )
      }
    } catch (err) {
      console.error('Acknowledge error:', err)
    } finally {
      setAcknowledgingId(null)
    }
  }

  const filtered = alerts.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      (a.sensorCode && a.sensorCode.toLowerCase().includes(search.toLowerCase())) ||
      (a.shipmentId && a.shipmentId.toLowerCase().includes(search.toLowerCase()))
    const matchStatus =
      activeFilter === 'ALL' ||
      (activeFilter === 'UNACKNOWLEDGED' && !a.isAcknowledged) ||
      (activeFilter === 'ACKNOWLEDGED' && a.isAcknowledged)
    return matchSearch && matchStatus
  })

  const unacknowledgedCount = alerts.filter((a) => !a.isAcknowledged).length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cold Chain & Disruption Alerts
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time threshold breaches, kinetic temperature excursions, and incident escalations.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Alerts
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Alerts</p>
          <p className="text-2xl font-bold text-white mt-1.5">{alerts.length}</p>
          <span className="text-xs text-indigo-400 mt-2 block font-medium">Logged in PostgreSQL</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Action Required</p>
          <p className="text-2xl font-bold text-rose-400 mt-1.5">{unacknowledgedCount}</p>
          <span className="text-xs text-rose-400/80 mt-2 block font-medium">Unacknowledged breaches</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Critical Thermal Events</p>
          <p className="text-2xl font-bold text-amber-400 mt-1.5">
            {alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length}
          </p>
          <span className="text-xs text-amber-400/80 mt-2 block font-medium">Tier-1 Cold Chain</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Acknowledged</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1.5">
            {alerts.filter((a) => a.isAcknowledged).length}
          </p>
          <span className="text-xs text-emerald-400/80 mt-2 block font-medium">Sign-off completed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by sensor, shipment, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 uppercase font-semibold">Filter:</span>
          {(['ALL', 'UNACKNOWLEDGED', 'ACKNOWLEDGED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {filter === 'ALL'
                ? 'All'
                : filter === 'UNACKNOWLEDGED'
                ? `Pending (${unacknowledgedCount})`
                : 'Resolved'}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Uncongested Alerts Table & Cards */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Alert Activity Stream ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading real-time alerts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldAlert className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No alerts found matching current filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((alert) => (
              <div
                key={alert.id}
                className="p-5 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                    <Thermometer className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">{alert.title}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/40 font-mono">
                        {alert.severity}
                      </span>
                      {alert.isAcknowledged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" /> Action Required
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {alert.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                      {alert.sensorCode && (
                        <span>
                          Sensor: <strong className="text-slate-200 font-mono">{alert.sensorCode}</strong>
                        </span>
                      )}
                      {alert.excursionPeakCelsius !== undefined && (
                        <span>
                          Peak Temp:{' '}
                          <strong className="text-rose-400 font-semibold">
                            +{alert.excursionPeakCelsius}°C
                          </strong>
                        </span>
                      )}
                      {alert.durationMinutes && (
                        <span>
                          Breach Duration:{' '}
                          <strong className="text-amber-400 font-semibold">
                            {alert.durationMinutes} mins
                          </strong>
                        </span>
                      )}
                      <span className="font-mono">
                        Triggered:{' '}
                        {new Date(alert.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:self-center shrink-0">
                  {!alert.isAcknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledgingId === alert.id}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {acknowledgingId === alert.id ? 'Acknowledging...' : 'Acknowledge Alert'}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">
                      Signed off:{' '}
                      {alert.acknowledgedAt
                        ? new Date(alert.acknowledgedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recorded'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
