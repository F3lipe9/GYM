import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { makeId } from '../utils/id'
import { CATEGORY_ORDER, groupByCategory } from '../data/categories'
import styles from './Exercises.module.css'

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

export default function Exercises() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Custom')

  function addExercise() {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch({
      type: 'ADD_EXERCISE',
      payload: { id: makeId('custom_'), name: trimmed, isDefault: false, category, createdAt: new Date().toISOString() },
    })
    setName('')
    setCategory('Custom')
    setShowAdd(false)
  }

  const groups = useMemo(() => {
    const q = search.toLowerCase()
    return groupByCategory(state.exercises.filter((ex) => !q || ex.name.toLowerCase().includes(q)))
  }, [state.exercises, search])

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}><SearchIcon /></span>
        <input
          type="text"
          placeholder="SEARCH EXERCISES..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {showAdd ? (
        <div className={styles.addForm}>
          <input
            type="text"
            placeholder="Exercise name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExercise()}
            autoFocus
          />
          <select
            className={styles.categorySelect}
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Category"
          >
            {CATEGORY_ORDER.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className={styles.addFormActions}>
            <button className={styles.cancelBtn} onClick={() => { setShowAdd(false); setName(''); setCategory('Custom') }}>
              CANCEL
            </button>
            <button className={styles.confirmBtn} onClick={addExercise}>
              ADD
            </button>
          </div>
        </div>
      ) : (
        <button className={styles.addCustomBtn} onClick={() => setShowAdd(true)}>
          + ADD CUSTOM
        </button>
      )}

      {groups.map(([cat, list]) => (
        <div key={cat} className={styles.group}>
          <div className={styles.groupLabel}>{cat.toUpperCase()}</div>
          {list.map(ex => (
            <div key={ex.id} className={`${styles.card} ${!ex.isDefault ? styles.customCard : ''}`}>
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{ex.name.toUpperCase()}</div>
                <div className={styles.cardMeta}>
                  {!ex.isDefault && <span className={styles.customBadge}>CUSTOM</span>}
                  {ex.equipment && <span>{ex.equipment.toUpperCase()}</span>}
                  {ex.equipment && ex.type && <span className={styles.dot}> • </span>}
                  {ex.type && <span>{ex.type.toUpperCase()}</span>}
                </div>
              </div>
              {ex.isDefault ? (
                <span className={styles.lockIcon}><LockIcon /></span>
              ) : (
                <button
                  className={styles.deleteBtn}
                  onClick={() => dispatch({ type: 'DELETE_EXERCISE', payload: ex.id })}
                  aria-label={`Delete ${ex.name}`}
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      ))}

      {groups.length === 0 && (
        <p className={styles.empty}>No exercises match your search.</p>
      )}
    </div>
  )
}
