import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ShipmentCard from '../components/ShipmentCard'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import styles from './ListPage.module.css'
import { getShipments } from '../services/api'
import type { Shipment } from '../types/domain'

export default function ShipmentsPage() {
  const navigate = useNavigate()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getShipments()
      .then(setShipments)
      .catch(() => setError('Failed to load shipments.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <PageHeader
        title="Shipments"
        description="All tracked shipments. Select a shipment to view details, risk analysis, and AI insights."
      />
      {loading && <LoadingState label="Loading shipments…" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && shipments.length === 0 && (
        <EmptyState title="No shipments found" description="Shipment data will appear here once loaded from the database." />
      )}
      {!loading && !error && shipments.length > 0 && (
        <div className={styles.grid}>
          {shipments.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              onClick={() => navigate(`/shipments/${s.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
