import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import styles from './ColdChainPage.module.css'
import { getColdChainSensors } from '../services/api'
import type { ColdChainSensor } from '../types/domain'

export default function ColdChainPage() {
  const [sensors, setSensors] = useState<ColdChainSensor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getColdChainSensors()
      .then(setSensors)
      .catch(() => setError('Failed to load cold-chain sensors.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const excursionCount = sensors.filter((s) => s.status === 'EXCURSION').length

  return (
    <div>
      <PageHeader
        title="Cold Chain"
        description={`Temperature monitoring for cold-chain shipments. ${excursionCount} active excursion${excursionCount !== 1 ? 's' : ''}.`}
      />
      {loading && <LoadingState label="Loading sensors…" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && sensors.length === 0 && (
        <EmptyState title="No sensors" description="Cold-chain sensor data will appear here once loaded." />
      )}
      {!loading && !error && sensors.length > 0 && (
        <div className={styles.grid}>
          {sensors.map((s) => (
            <div key={s.id} className={`${styles.card} ${s.status === 'EXCURSION' ? styles.excursion : ''}`}>
              <div className={styles.header}>
                <span className={styles.code}>{s.sensorCode}</span>
                <StatusBadge
                  severity={s.currentExcursionSeverity ?? 'LOW'}
                  label={s.status}
                />
              </div>
              <div className={styles.temp}>
                {s.lastReadingCelsius !== null
                  ? <span className={styles.tempValue}>{s.lastReadingCelsius.toFixed(1)}°C</span>
                  : <span className={styles.tempNA}>No reading</span>
                }
                <span className={styles.range}>
                  Allowed: {s.minTempCelsius}–{s.maxTempCelsius}°C
                </span>
              </div>
              <span className={styles.shipmentId}>Shipment: {s.shipmentId}</span>
              <div className={styles.phaseNote}>
                Temperature chart &amp; history — Phase 3+
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
