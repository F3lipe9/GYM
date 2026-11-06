import { SIZE_FIELDS } from '../data/sizeFields'
import { fmtBoth, fmtDiff, getPrevValue, fmtSizeDate } from '../utils/size'
import styles from './SizeHistory.module.css'

// Expandable list of size entries, newest first. One date open at a time.
export default function SizeHistory({ sizes, openDate, onToggle }) {
  const sorted = [...sizes].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <ul className={styles.list}>
      {sorted.map((entry) => {
        const open = entry.date === openDate
        return (
          <li key={entry.date} className={styles.item}>
            <button
              className={styles.dateRow}
              onClick={() => onToggle(open ? null : entry.date)}
              aria-expanded={open}
            >
              <span>{fmtSizeDate(entry.date)}</span>
              <span className={styles.chevron}>{open ? '▾' : '▸'}</span>
            </button>

            {open && (
              <div className={styles.details}>
                {SIZE_FIELDS.map(({ key, label }) => {
                  const value = entry[key]
                  const prev = value != null ? getPrevValue(sizes, entry.date, key) : null
                  const diff = prev != null ? value - prev : null
                  const diffClass =
                    diff == null ? '' : diff > 0.04 ? styles.up : diff < -0.04 ? styles.down : styles.flat
                  return (
                    <div key={key} className={styles.measure}>
                      <span className={styles.label}>{label}</span>
                      <span className={value == null ? styles.missing : styles.value}>{fmtBoth(value)}</span>
                      <span className={`${styles.diff} ${diffClass}`}>{diff != null ? fmtDiff(diff) : ''}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
