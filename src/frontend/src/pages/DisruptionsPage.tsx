import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import styles from './DisruptionsPage.module.css'
import { getDisruptions } from '../services/api'
import type { Disruption } from '../types/domain'

export default function DisruptionsPage() {
  const navigate = useNavigate()
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getDisruptions()
      .then(setDisruptions)
      .catch(() => setError('Failed to load disruptions.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <PageHeader
        title="Disruptions"
        description="Active and recent supply-chain disruptions. Click a disruption to see affected shipments and alternative routes."
      />
      {loading && <LoadingState label="Loading disruptions…" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && disruptions.length === 0 && (
        <EmptyState title="No active disruptions" description="All operations are running normally." />
      )}
      {!loading && !error && disruptions.length > 0 && (
        <div className={styles.list}>
          {disruptions.map((d) => (
            <div
              key={d.id}
              className={styles.row}
              onClick={() => navigate(`/disruptions/${d.id}`)}
              role="button"
              tabIndex={0}
            >
              <StatusBadge severity={d.severity} />
              <div className={styles.info}>
                <span className={styles.title}>{d.title}</span>
                <span className={styles.region}>{d.affectedRegion}</span>
                <span className={styles.meta}>
                  {d.affectedShipmentCount} shipment{d.affectedShipmentCount !== 1 ? 's' : ''} affected
                  · {d.disruptionType.replace(/_/g, ' ')}
                </span>
              </div>
              <span className={styles.status}>{d.isActive ? 'ACTIVE' : 'RESOLVED'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
