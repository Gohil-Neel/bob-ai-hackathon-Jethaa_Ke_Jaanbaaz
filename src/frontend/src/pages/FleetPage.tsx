import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import styles from './FleetPage.module.css'
import { getFleetAssets } from '../services/api'
import type { FleetAsset } from '../types/domain'

const statusSeverity: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
  IDLE: 'MEDIUM',
  AVAILABLE: 'LOW',
  IN_USE: 'LOW',
  MAINTENANCE: 'HIGH',
}

export default function FleetPage() {
  const [assets, setAssets] = useState<FleetAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getFleetAssets()
      .then(setAssets)
      .catch(() => setError('Failed to load fleet assets.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const idleCount = assets.filter((a) => a.status === 'IDLE').length

  return (
    <div>
      <PageHeader
        title="Fleet"
        description={`Fleet asset management. ${idleCount} idle asset${idleCount !== 1 ? 's' : ''} available for redeployment.`}
      />
      {loading && <LoadingState label="Loading fleet…" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && assets.length === 0 && (
        <EmptyState title="No fleet assets" description="Fleet asset data will appear here once loaded." />
      )}
      {!loading && !error && assets.length > 0 && (
        <div className={styles.grid}>
          {assets.map((a) => (
            <div key={a.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.code}>{a.assetCode}</span>
                <StatusBadge severity={statusSeverity[a.status] ?? 'LOW'} label={a.status} />
              </div>
              <span className={styles.type}>{a.assetType}</span>
              <div className={styles.meta}>
                <span>📍 {a.currentLocation}</span>
                <span>⚖ {a.capacityKg.toLocaleString()} kg</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.phaseNote}>
        Redeployment recommendations — Phase 3+
      </div>
    </div>
  )
}
