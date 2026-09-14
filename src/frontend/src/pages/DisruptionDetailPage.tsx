import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import StatusBadge from '../components/StatusBadge'
import { getDisruptionById } from '../services/api'
import type { Disruption } from '../types/domain'
import styles from './DetailPage.module.css'

export default function DisruptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [disruption, setDisruption] = useState<Disruption | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getDisruptionById(id)
      .then((data) => {
        setDisruption(data)
        if (!data) setError('Disruption not found.')
      })
      .catch(() => setError('Failed to load disruption.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingState label="Loading disruption…" />
  if (error || !disruption) return <ErrorState message={error ?? 'Not found.'} onRetry={() => navigate('/disruptions')} />

  return (
    <div>
      <PageHeader
        title={disruption.title}
        description={disruption.affectedRegion}
        actions={<StatusBadge severity={disruption.severity} />}
      />
      <div className={styles.detailGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Disruption Details</h3>
          <dl className={styles.dl}>
            <dt>Type</dt>       <dd>{disruption.disruptionType.replace(/_/g, ' ')}</dd>
            <dt>Severity</dt>   <dd><StatusBadge severity={disruption.severity} /></dd>
            <dt>Status</dt>     <dd>{disruption.isActive ? 'Active' : 'Resolved'}</dd>
            <dt>Started</dt>    <dd>{new Date(disruption.startedAt).toLocaleDateString()}</dd>
            <dt>Affected</dt>   <dd>{disruption.affectedShipmentCount} shipments</dd>
          </dl>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Description</h3>
          <p className={styles.placeholderText}>{disruption.description}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Affected Shipments</h3>
          <p className={styles.placeholderText}>Affected shipment list — Phase 3+.</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Alternative Routes</h3>
          <p className={styles.placeholderText}>Route alternatives — Phase 3+.</p>
        </div>
      </div>
    </div>
  )
}
