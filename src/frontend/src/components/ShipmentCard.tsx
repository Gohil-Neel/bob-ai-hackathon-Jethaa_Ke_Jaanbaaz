import type { Shipment } from '../types/domain'
import StatusBadge from './StatusBadge'
import styles from './ShipmentCard.module.css'

interface ShipmentCardProps {
  shipment: Shipment
  onClick?: () => void
}

const statusLabel: Record<string, string> = {
  PENDING:    'Pending',
  IN_TRANSIT: 'In Transit',
  DELAYED:    'Delayed',
  AT_RISK:    'At Risk',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled',
}

export default function ShipmentCard({ shipment, onClick }: ShipmentCardProps) {
  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.row}>
        <span className={styles.tracking}>{shipment.trackingNumber}</span>
        <StatusBadge severity={shipment.priority} label={statusLabel[shipment.status]} />
      </div>
      <div className={styles.route}>
        <span className={styles.location}>{shipment.origin}</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.location}>{shipment.destination}</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.carrier}>{shipment.carrier}</span>
        {shipment.isColdChain && <span className={styles.coldChainBadge}>❄ Cold Chain</span>}
      </div>
    </div>
  )
}
