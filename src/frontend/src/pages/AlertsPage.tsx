import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import AlertCard from '../components/AlertCard'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import styles from './AlertsPage.module.css'
import { getAlerts } from '../services/api'
import type { Alert } from '../types/domain'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getAlerts()
      .then(setAlerts)
      .catch(() => setError('Failed to load alerts.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const unack = alerts.filter((a) => !a.isAcknowledged)
  const acked = alerts.filter((a) => a.isAcknowledged)

  return (
    <div>
      <PageHeader
        title="Alerts"
        description={`${unack.length} unacknowledged alert${unack.length !== 1 ? 's' : ''} require attention.`}
      />
      {loading && <LoadingState label="Loading alerts…" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && alerts.length === 0 && (
        <EmptyState title="No alerts" description="All systems are nominal." />
      )}
      {!loading && !error && alerts.length > 0 && (
        <div className={styles.columns}>
          <section>
            <h2 className={styles.sectionTitle}>Unacknowledged ({unack.length})</h2>
            <div className={styles.list}>
              {unack.length === 0
                ? <p className={styles.clear}>All alerts acknowledged.</p>
                : unack.map((a) => <AlertCard key={a.id} alert={a} />)
              }
            </div>
          </section>
          <section>
            <h2 className={styles.sectionTitle}>Acknowledged ({acked.length})</h2>
            <div className={styles.list}>
              {acked.map((a) => <AlertCard key={a.id} alert={a} />)}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
