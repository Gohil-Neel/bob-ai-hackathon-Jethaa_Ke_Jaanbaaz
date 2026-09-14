import styles from './KpiCard.module.css'
import type { SeverityLevel } from '../types/domain'

interface KpiCardProps {
  label: string
  value: number | string
  /** Optional: color the value using a severity level */
  severity?: SeverityLevel | 'normal'
  /** Optional: sub-label below value */
  subLabel?: string
}

const severityClass: Record<string, string> = {
  CRITICAL: styles.valueCritical,
  HIGH:     styles.valueHigh,
  MEDIUM:   styles.valueMedium,
  LOW:      styles.valueLow,
  normal:   styles.valueNormal,
}

export default function KpiCard({ label, value, severity = 'normal', subLabel }: KpiCardProps) {
  const valueClass = severityClass[severity] ?? styles.valueNormal

  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${valueClass}`}>{value}</span>
      {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
    </div>
  )
}
