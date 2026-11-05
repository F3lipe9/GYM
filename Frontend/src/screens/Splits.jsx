import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getSuggestionDetails } from '../utils/progression'
import { load, save } from '../utils/storage'
import { DRAFT_KEY, todayISO, buildEntriesFromTemplate } from '../utils/templates'
import styles from './Splits.module.css'

export default function Splits() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [openId, setOpenId] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const suggestions = getSuggestionDetails(state.workouts)
  const exerciseById = new Map(state.exercises.map((e) => [e.id, e]))
  const splits = [...state.templates].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function toggle(id) {
    setOpenId((cur) => (cur === id ? null : id))
    setRenamingId(null)
  }

  function deleteSplit(split) {
    if (!window.confirm(`Delete '${split.name}'? This can't be undone.`)) return
    dispatch({ type: 'DELETE_TEMPLATE', payload: split.id })
    if (openId === split.id) setOpenId(null)
  }

  function startRename(split) {
    setRenamingId(split.id)
    setRenameValue(split.name)
  }

  function commitRename(split) {
    const name = renameValue.trim()
    if (name && name !== split.name) {
      dispatch({ type: 'UPDATE_TEMPLATE', payload: { ...split, name } })
    }
    setRenamingId(null)
  }

  function startWorkout(split) {
    const draft = load(DRAFT_KEY, null)
    if (draft?.entries?.length > 0 && !window.confirm('Replace current session?')) return
    const entries = buildEntriesFromTemplate(split, state.workouts, state.exercises)
    if (entries.length === 0) {
      window.alert('None of the exercises in this split exist anymore.')
      return
    }
    save(DRAFT_KEY, { date: todayISO(), entries, activeTemplateId: split.id })
    navigate('/')
  }

  if (splits.length === 0) {
    return (
      <div className={styles.page}>
        <h2 className={styles.sectionTitle}>SPLITS</h2>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No splits yet</p>
          <p className={styles.emptyHint}>
            Build a session on the Log page and tap SAVE AS SPLIT.
          </p>
          <button className={styles.primaryBtn} onClick={() => navigate('/')}>
            GO TO LOG
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.sectionTitle}>SPLITS</h2>

      {splits.map((split) => {
        const isOpen = openId === split.id
        const count = split.exercises.length
        return (
          <div key={split.id} className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}>
            <button
              className={styles.header}
              onClick={() => toggle(split.id)}
              aria-expanded={isOpen}
            >
              <span className={styles.name}>{split.name.toUpperCase()}</span>
              <span className={styles.meta}>
                {count} {count === 1 ? 'exercise' : 'exercises'}
                <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
              </span>
            </button>

            {isOpen && (
              <div className={styles.body}>
                {renamingId === split.id && (
                  <div className={styles.renameRow}>
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(split)
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      autoFocus
                    />
                    <button className={styles.smallBtn} onClick={() => commitRename(split)}>
                      SAVE
                    </button>
                  </div>
                )}

                <ul className={styles.exList}>
                  {split.exercises.map((item, i) => {
                    const ex = exerciseById.get(item.exerciseId)
                    const s = suggestions.get(item.exerciseId)
                    const isUp = s && s.suggested > s.topWeight
                    return (
                      <li key={`${item.exerciseId}_${i}`} className={styles.exRow}>
                        <span className={`${styles.exName} ${!ex ? styles.deleted : ''}`}>
                          {ex ? ex.name : 'Deleted exercise'}
                        </span>
                        <span className={styles.exSets}>
                          {item.setCount} {item.setCount === 1 ? 'set' : 'sets'}
                        </span>
                        <span className={`${styles.exWeight} ${isUp ? styles.up : ''}`}>
                          {ex && s ? `${isUp ? '🔺 ' : ''}${s.suggested}` : '—'}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <div className={styles.actions}>
                  <button className={styles.primaryBtn} onClick={() => startWorkout(split)}>
                    START WORKOUT
                  </button>
                  <div className={styles.secondaryActions}>
                    <button className={styles.smallBtn} onClick={() => startRename(split)}>
                      RENAME
                    </button>
                    <button className={styles.deleteBtn} onClick={() => deleteSplit(split)}>
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
