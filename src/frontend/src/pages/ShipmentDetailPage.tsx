import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import StatusBadge from '../components/StatusBadge'
import { getShipmentById } from '../services/api'
import type { Shipment } from '../types/domain'
import styles from './DetailPage.module.css'

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getShipmentById(id)
      .then((data) => {
        setShipment(data)
        if (!data) setError('Shipment not found.')
      })
      .catch(() => setError('Failed to load shipment.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingState label="Loading shipment…" />
  if (error || !shipment) return <ErrorState message={error ?? 'Not found.'} onRetry={() => navigate('/shipments')} />

  return (
    <div>
      <PageHeader
        title={shipment.trackingNumber}
        description={`${shipment.origin} → ${shipment.destination}`}
        actions={<StatusBadge severity={shipment.priority} />}
      />
      <div className={styles.detailGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Shipment Details</h3>
          <dl className={styles.dl}>
            <dt>Carrier</dt>       <dd>{shipment.carrier}</dd>
            <dt>Status</dt>        <dd><StatusBadge severity={shipment.priority} label={shipment.status} /></dd>
            <dt>Priority</dt>      <dd><StatusBadge severity={shipment.priority} /></dd>
            <dt>Cold Chain</dt>    <dd>{shipment.isColdChain ? '❄ Yes' : 'No'}</dd>
            <dt>Est. Arrival</dt>  <dd>{shipment.estimatedArrival ? new Date(shipment.estimatedArrival).toLocaleDateString() : '—'}</dd>
            <dt>Risk Score</dt>    <dd>{shipment.riskScore !== null ? `${(shipment.riskScore * 100).toFixed(0)}%` : '—'}</dd>
          </dl>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>AI Analysis</h3>
          <p className={styles.placeholderText}>
            AI-powered shipment analysis will appear here once IBM watsonx.ai integration is complete (Phase 5+).
          </p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Route Information</h3>
          <p className={styles.placeholderText}>
            Route details and disruption impact analysis — Phase 3+.
          </p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Cold Chain Sensors</h3>
          {shipment.isColdChain ? (
            <p className={styles.placeholderText}>
              Temperature sensor data — Phase 3+.
            </p>
          ) : (
            <p className={styles.placeholderText}>This shipment does not require cold-chain monitoring.</p>
          )}
        </div>
      </div>
    </div>
  )
}
