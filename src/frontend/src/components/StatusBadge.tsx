import type { SeverityLevel } from '../types/domain'
import styles from './StatusBadge.module.css'

interface StatusBadgeProps {
  severity: SeverityLevel | 'NORMAL' | 'DATA_GAP'
  label?: string
}

const severityMeta: Record<string, { className: string; defaultLabel: string }> = {
  CRITICAL:  { className: styles.critical,  defaultLabel: 'CRITICAL' },
  HIGH:      { className: styles.high,      defaultLabel: 'HIGH' },
  MEDIUM:    { className: styles.medium,    defaultLabel: 'MEDIUM' },
  LOW:       { className: styles.low,       defaultLabel: 'LOW' },
  NORMAL:    { className: styles.normal,    defaultLabel: 'NORMAL' },
  DATA_GAP:  { className: styles.dataGap,   defaultLabel: 'DATA GAP' },
}

export default function StatusBadge({ severity, label }: StatusBadgeProps) {
  const meta = severityMeta[severity] ?? { className: styles.normal, defaultLabel: severity }
  return (
    <span className={`${styles.badge} ${meta.className}`}>
      {label ?? meta.defaultLabel}
    </span>
  )
}
