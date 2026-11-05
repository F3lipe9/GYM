import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { groupByCategory } from '../data/categories'
import styles from './ExercisePicker.module.css'

// Bottom sheet: collapsible categories (one open at a time) → tap an exercise to add it.
// Stays open after adding so several exercises can be added in a row.
export default function ExercisePicker({ open, exercises, addedIds, suggestions, onAdd, onClose }) {
  const [openCategory, setOpenCategory] = useState(null)
  const [query, setQuery] = useState('')

  // Reset each time the sheet opens.
  useEffect(() => {
    if (open) {
      setOpenCategory(null)
      setQuery('')
    }
  }, [open])

  const q = query.trim().toLowerCase()
  const groups = groupByCategory(exercises)
  const matches = q ? exercises.filter((ex) => ex.name.toLowerCase().includes(q)) : []

  function renderRow(ex) {
    const added = addedIds.has(ex.id)
    const s = suggestions.get(ex.id)
    const isUp = s && s.suggested > s.topWeight
    return (
      <button
        key={ex.id}
        className={`${styles.exRow} ${added ? styles.added : ''}`}
        onClick={() => onAdd(ex.id)}
        disabled={added}
      >
        <span className={styles.exInfo}>
          <span className={styles.exName}>{ex.name}</span>
          {(ex.equipment || !ex.isDefault) && (
            <span className={styles.exMeta}>
              {ex.equipment ? ex.equipment.toUpperCase() : 'CUSTOM'}
            </span>
          )}
        </span>
        <span className={styles.exRight}>
          {added ? (
            <span className={styles.check}>✓</span>
          ) : (
            s && (
              <span className={`${styles.suggest} ${isUp ? styles.up : ''}`}>
                {isUp ? '🔺 ' : ''}{s.suggested} lbs
              </span>
            )
          )}
        </span>
      </button>
    )
  }

  return (
    <Sheet
      open={open}
      title="Add exercise"
      onClose={onClose}
      footer={
        <button className={styles.doneBtn} onClick={onClose}>
          DONE
        </button>
      }
    >
      <input
        type="text"
        className={styles.search}
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {q ? (
        <div className={styles.list}>
          {matches.length > 0 ? (
            matches.map(renderRow)
          ) : (
            <p className={styles.empty}>No exercises match “{query.trim()}”.</p>
          )}
        </div>
      ) : (
        groups.map(([cat, list]) => {
          const isOpen = openCategory === cat
          const addedCount = list.filter((ex) => addedIds.has(ex.id)).length
          return (
            <div key={cat} className={`${styles.group} ${isOpen ? styles.groupOpen : ''}`}>
              <button
                className={styles.catHeader}
                onClick={() => setOpenCategory(isOpen ? null : cat)}
                aria-expanded={isOpen}
              >
                <span className={styles.catName}>{cat.toUpperCase()}</span>
                <span className={styles.catMeta}>
                  {addedCount > 0 && <span className={styles.addedCount}>{addedCount} added</span>}
                  {list.length}
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
                </span>
              </button>
              {isOpen && <div className={styles.list}>{list.map(renderRow)}</div>}
            </div>
          )
        })
      )}
    </Sheet>
  )
}
