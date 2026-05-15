import styles from './Heatmap.module.css'

const WEEKS = 12
const DAYS = 7

function getDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function getIntensity(totalSets) {
  if (totalSets === 0) return 0
  if (totalSets < 8) return 1
  if (totalSets < 16) return 2
  return 3
}

function buildGrid(workouts) {
  const dateMap = {}
  for (const w of workouts) {
    const key = w.date.slice(0, 10)
    const totalSets = w.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
    dateMap[key] = (dateMap[key] || 0) + totalSets
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay()
  const gridEnd = new Date(today)
  gridEnd.setDate(today.getDate() + (6 - dayOfWeek))

  const cells = []
  for (let w = WEEKS - 1; w >= 0; w--) {
    const week = []
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(gridEnd)
      date.setDate(gridEnd.getDate() - w * 7 - (6 - d))
      const key = getDateKey(date)
      week.push({ key, intensity: getIntensity(dateMap[key] || 0) })
    }
    cells.push(week)
  }
  return cells
}

export default function Heatmap({ workouts }) {
  const grid = buildGrid(workouts)

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {grid.map((week) =>
          week.map((cell) => (
            <div
              key={cell.key}
              className={`${styles.cell} ${styles[`i${cell.intensity}`]}`}
              title={cell.key}
            />
          ))
        )}
      </div>
      <div className={styles.legend}>
        <span className={styles.legendLabel}>12 WEEKS</span>
        <div className={styles.legendRight}>
          <span className={styles.legendText}>LIGHT</span>
          <div className={`${styles.swatch} ${styles.i1}`} />
          <div className={`${styles.swatch} ${styles.i2}`} />
          <div className={`${styles.swatch} ${styles.i3}`} />
          <span className={styles.legendText}>HEAVY</span>
        </div>
      </div>
    </div>
  )
}
