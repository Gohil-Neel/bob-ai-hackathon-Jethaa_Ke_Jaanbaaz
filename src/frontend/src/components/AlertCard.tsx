import type { Alert } from '../types/domain'
import StatusBadge from './StatusBadge'
import styles from './AlertCard.module.css'

interface AlertCardProps {
  alert: Alert
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AlertCard({ alert }: AlertCardProps) {
  return (
    <div className={`${styles.card} ${alert.isAcknowledged ? styles.acknowledged : ''}`}>
      <div className={styles.header}>
        <StatusBadge severity={alert.severity} />
        <span className={styles.time}>{formatTime(alert.createdAt)}</span>
      </div>
      <p className={styles.title}>{alert.title}</p>
      <p className={styles.description}>{alert.description}</p>
      {alert.isAcknowledged && (
        <span className={styles.ackLabel}>Acknowledged</span>
      )}
    </div>
  )
}
