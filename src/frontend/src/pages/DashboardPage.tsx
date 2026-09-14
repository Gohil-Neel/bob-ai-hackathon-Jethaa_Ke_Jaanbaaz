import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import AlertCard from '../components/AlertCard'
import ShipmentCard from '../components/ShipmentCard'
import MapPlaceholder from '../components/MapPlaceholder'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import styles from './DashboardPage.module.css'
import { getDashboardKpis, getAlerts, getShipments, getDisruptions } from '../services/api'
import type { DashboardKpis, Alert, Shipment, Disruption } from '../types/domain'
import StatusBadge from '../components/StatusBadge'

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      getDashboardKpis(),
      getAlerts(),
      getShipments(),
      getDisruptions(),
    ])
      .then(([kpisData, alertsData, shipmentsData, disruptionsData]) => {
        setKpis(kpisData)
        setAlerts(alertsData)
        setShipments(shipmentsData)
        setDisruptions(disruptionsData)
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingState label="Loading Command Center…" />
  if (error) return <ErrorState message={error} onRetry={load} />

  const atRiskShipments = shipments.filter(
    (s) => s.status === 'AT_RISK' || s.status === 'DELAYED',
  )
  const unacknowledgedAlerts = alerts.filter((a) => !a.isAcknowledged)

  return (
    <div className={styles.page}>
      <PageHeader
        title="Command Center"
        description="Real-time supply-chain operations overview. Values marked [MOCK] are placeholder data."
      />

      {/* KPI Cards */}
      <section className={styles.kpiGrid} aria-label="Key Performance Indicators">
        <KpiCard label="Total Shipments"    value={kpis?.totalShipments ?? '—'} />
        <KpiCard label="Active Disruptions" value={kpis?.activeDisruptions ?? '—'} severity={kpis?.activeDisruptions ? 'CRITICAL' : 'normal'} />
        <KpiCard label="At-Risk Shipments"  value={kpis?.atRiskShipments ?? '—'}  severity={kpis?.atRiskShipments ? 'HIGH' : 'normal'} />
        <KpiCard label="Cold Chain Alerts"  value={kpis?.coldChainAlerts ?? '—'}   severity={kpis?.coldChainAlerts ? 'HIGH' : 'normal'} />
        <KpiCard label="Idle Fleet Assets"  value={kpis?.idleFleetAssets ?? '—'}   severity="MEDIUM" subLabel="Available for redeployment" />
      </section>

      {/* Main content grid */}
      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.leftCol}>
          {/* Operations Map */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Operations Map</h2>
            <MapPlaceholder height="280px" />
          </section>

          {/* At-Risk Shipments */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>At-Risk Shipments</h2>
            {atRiskShipments.length === 0 ? (
              <p className={styles.emptyText}>No at-risk shipments.</p>
            ) : (
              <div className={styles.cardList}>
                {atRiskShipments.map((s) => (
                  <ShipmentCard key={s.id} shipment={s} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          {/* Active Disruptions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Active Disruptions</h2>
            {disruptions.length === 0 ? (
              <p className={styles.emptyText}>No active disruptions.</p>
            ) : (
              <div className={styles.cardList}>
                {disruptions.map((d) => (
                  <div key={d.id} className={styles.disruptionRow}>
                    <StatusBadge severity={d.severity} />
                    <div className={styles.disruptionText}>
                      <span className={styles.disruptionTitle}>{d.title}</span>
                      <span className={styles.disruptionMeta}>
                        {d.affectedShipmentCount} shipment{d.affectedShipmentCount !== 1 ? 's' : ''} affected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Critical Alerts */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Recent Alerts
              {unacknowledgedAlerts.length > 0 && (
                <span className={styles.alertCount}>{unacknowledgedAlerts.length}</span>
              )}
            </h2>
            {unacknowledgedAlerts.length === 0 ? (
              <p className={styles.emptyText}>No unacknowledged alerts.</p>
            ) : (
              <div className={styles.cardList}>
                {unacknowledgedAlerts.slice(0, 4).map((a) => (
                  <AlertCard key={a.id} alert={a} />
                ))}
              </div>
            )}
          </section>

          {/* AI Insights Placeholder */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>AI Insights</h2>
            <div className={styles.aiPlaceholder}>
              <span className={styles.aiIcon}>🤖</span>
              <span className={styles.aiText}>
                IBM watsonx.ai integration — Phase 5+
              </span>
              <span className={styles.aiSub}>
                AI explanations and recommendations will appear here once
                the watsonx.ai integration is complete.
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
