import styles from './MapPlaceholder.module.css'

interface MapPlaceholderProps {
  height?: string
  label?: string
}

/**
 * MapPlaceholder — Phase 2
 *
 * The final map will use MapLibre or Leaflet.
 * Replace this component's implementation in the map integration phase.
 * The props interface is intentionally forward-compatible.
 */
export default function MapPlaceholder({
  height = '320px',
  label = 'Operations Map',
}: MapPlaceholderProps) {
  return (
    <div className={styles.container} style={{ height }} aria-label={label}>
      <div className={styles.grid} aria-hidden="true">
        {/* Grid lines simulating a map background */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.gridLine} />
        ))}
      </div>
      <div className={styles.overlay}>
        <div className={styles.pin} aria-hidden="true">📍</div>
        <span className={styles.label}>{label}</span>
        <span className={styles.subLabel}>
          MapLibre / Leaflet integration — Phase 4+
        </span>
      </div>
    </div>
  )
}
