import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getPRs } from '../utils/prs'
import { getSuggestions, getSuggestionDetails } from '../utils/progression'
import { load, save } from '../utils/storage'
import { makeId } from '../utils/id'
import {
  DRAFT_KEY,
  todayISO,
  buildEntriesFromTemplate,
  templateFromEntries,
  exercisesFromEntries,
} from '../utils/templates'
import SetRow from '../components/SetRow'
import ProgressionBadge from '../components/ProgressionBadge'
import ExercisePicker from '../components/ExercisePicker'
import TemplatePicker from '../components/TemplatePicker'
import Sheet from '../components/Sheet'
import styles from './LogWorkout.module.css'

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
}

function newSet() {
  return { weight: '', reps: '', done: false }
}

export default function LogWorkout() {
  const { state, dispatch } = useApp()
  const [date, setDate] = useState(() => load(DRAFT_KEY, null)?.date ?? todayISO())
  const [entries, setEntries] = useState(() => load(DRAFT_KEY, null)?.entries ?? [])
  const [activeTemplateId, setActiveTemplateId] = useState(
    () => load(DRAFT_KEY, null)?.activeTemplateId ?? null
  )
  const [showPicker, setShowPicker] = useState(false)
  const [showSplitPicker, setShowSplitPicker] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const [splitName, setSplitName] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (entries.length > 0) {
      save(DRAFT_KEY, { date, entries, activeTemplateId })
    } else {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [date, entries, activeTemplateId])

  // If the split behind this draft was deleted (e.g. on the Splits page), this resolves to null.
  const activeTemplate = state.templates.find((t) => t.id === activeTemplateId) ?? null

  const prs = getPRs(state.workouts)
  const suggestions = getSuggestions(state.workouts)
  const suggestionDetails = getSuggestionDetails(state.workouts)
  const addedIds = new Set(entries.map((e) => e.exerciseId))

  function addExercise(exerciseId) {
    if (!exerciseId) return
    // Picker stays open so several exercises can be added in a row.
    setEntries((prev) =>
      prev.some((e) => e.exerciseId === exerciseId)
        ? prev
        : [...prev, { exerciseId, sets: [newSet()] }]
    )
  }

  function updateSet(ei, si, updated) {
    setEntries((prev) =>
      prev.map((e, i) =>
        i !== ei ? e : { ...e, sets: e.sets.map((s, j) => (j === si ? updated : s)) }
      )
    )
  }

  function addSet(ei) {
    setEntries((prev) =>
      prev.map((e, i) => (i !== ei ? e : { ...e, sets: [...e.sets, newSet()] }))
    )
  }

  function removeExercise(ei) {
    setEntries((prev) => prev.filter((_, i) => i !== ei))
  }

  function loadTemplate(template) {
    if (entries.length > 0 && !window.confirm('Replace current session?')) return
    const built = buildEntriesFromTemplate(template, state.workouts, state.exercises)
    const skipped = template.exercises.length - built.length
    setEntries(built)
    setActiveTemplateId(template.id)
    setShowSplitPicker(false)
    setShowPicker(false)
    setNotice(
      skipped > 0
        ? `${skipped} ${skipped === 1 ? 'exercise' : 'exercises'} in this split no longer ${skipped === 1 ? 'exists' : 'exist'}.`
        : ''
    )
  }

  function openSave() {
    setSplitName('')
    setShowSave(true)
  }

  function saveAsNewSplit() {
    const name = splitName.trim()
    if (!name) return
    const template = templateFromEntries(name, entries)
    dispatch({ type: 'ADD_TEMPLATE', payload: template })
    setActiveTemplateId(template.id)
    setShowSave(false)
    setSplitName('')
  }

  function updateActiveSplit() {
    if (!activeTemplate) return
    dispatch({
      type: 'UPDATE_TEMPLATE',
      payload: { ...activeTemplate, exercises: exercisesFromEntries(entries) },
    })
    setShowSave(false)
  }

  function resetSession() {
    localStorage.removeItem(DRAFT_KEY)
    setEntries([])
    setActiveTemplateId(null)
    setNotice('')
  }

  function finishWorkout() {
    const doneSets = entries
      .map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets
          .filter((s) => s.weight !== '' && s.reps !== '')
          .map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })),
      }))
      .filter((e) => e.sets.length > 0)

    if (!doneSets.length) return
    const workout = { id: makeId(), date, exercises: doneSets }
    if (activeTemplate) workout.templateId = activeTemplate.id
    dispatch({ type: 'ADD_WORKOUT', payload: workout })
    resetSession()
  }

  function discardWorkout() {
    resetSession()
    setDate(todayISO())
  }

  return (
    <div className={styles.page}>
      <div className={styles.scrollContent}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Today's Session</h1>
            <p className={styles.date}>{formatDate(date)}</p>
          </div>
          <label className={styles.calBtn} aria-label="Pick date">
            <CalendarIcon />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.hiddenDate}
            />
          </label>
        </div>

        {activeTemplate && (
          <div className={styles.splitTag}>SPLIT · {activeTemplate.name.toUpperCase()}</div>
        )}

        {notice && <p className={styles.notice}>{notice}</p>}

        {entries.map((entry, ei) => {
          const ex = state.exercises.find((e) => e.id === entry.exerciseId)
          const firstUndoneIdx = entry.sets.findIndex((s) => !s.done)
          const currentPR = prs[entry.exerciseId]?.weight ?? 0

          const suggested = suggestions.get(entry.exerciseId) ?? null

          return (
            <ExerciseCard
              key={entry.exerciseId}
              name={ex?.name ?? entry.exerciseId}
              sets={entry.sets}
              firstUndoneIdx={firstUndoneIdx}
              currentPR={currentPR}
              suggestedWeight={suggested}
              onUpdateSet={(si, updated) => updateSet(ei, si, updated)}
              onAddSet={() => addSet(ei)}
              onRemove={() => removeExercise(ei)}
            />
          )
        })}

        {entries.length === 0 && !showPicker && (
          <div className={styles.emptyState}>
            <DumbbellEmptyIcon />
            <p className={styles.emptyTitle}>Ready to train?</p>
            <p className={styles.emptyHint}>Tap ADD EXERCISE to start building your session.</p>
          </div>
        )}

        <button className={styles.addExBtn} onClick={() => setShowPicker(true)}>
          <span className={styles.addExIcon}>⊕</span> ADD EXERCISE
        </button>

        {state.templates.length > 0 && (
          <button className={styles.splitBtn} onClick={() => setShowSplitPicker(true)}>
            START FROM SPLIT
          </button>
        )}
      </div>

      {entries.length > 0 && (
        <div className={styles.buttonBar}>
          <button className={styles.finishBtn} onClick={finishWorkout}>
            FINISH WORKOUT
          </button>
          <button className={styles.saveSplitBtn} onClick={openSave}>
            SAVE AS SPLIT
          </button>
          <button className={styles.discardBtn} onClick={discardWorkout}>
            Discard workout
          </button>
        </div>
      )}

      <ExercisePicker
        open={showPicker}
        exercises={state.exercises}
        addedIds={addedIds}
        suggestions={suggestionDetails}
        onAdd={addExercise}
        onClose={() => setShowPicker(false)}
      />

      <TemplatePicker
        open={showSplitPicker}
        templates={state.templates}
        exercises={state.exercises}
        onPick={loadTemplate}
        onClose={() => setShowSplitPicker(false)}
      />

      <Sheet open={showSave} title="Save as split" onClose={() => setShowSave(false)}>
        {activeTemplate && (
          <>
            <button className={styles.finishBtn} onClick={updateActiveSplit}>
              UPDATE '{activeTemplate.name.toUpperCase()}'
            </button>
            <p className={styles.orLabel}>OR SAVE AS NEW</p>
          </>
        )}
        <input
          type="text"
          placeholder="Split name (e.g. Push Day)"
          value={splitName}
          onChange={(e) => setSplitName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && saveAsNewSplit()}
          autoFocus={!activeTemplate}
        />
        <button
          className={activeTemplate ? styles.saveSplitBtn : styles.finishBtn}
          onClick={saveAsNewSplit}
          disabled={!splitName.trim()}
        >
          SAVE NEW SPLIT
        </button>
      </Sheet>
    </div>
  )
}

function ExerciseCard({ name, sets, firstUndoneIdx, currentPR, suggestedWeight, onUpdateSet, onAddSet, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.exNameWrap}>
          <span className={styles.exName}>{name.toUpperCase()}</span>
          {suggestedWeight !== null && <ProgressionBadge suggestedWeight={suggestedWeight} />}
        </div>
        <div className={styles.menuWrap}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen((v) => !v)}>···</button>
          {menuOpen && (
            <div className={styles.menu}>
              <button onClick={() => { onRemove(); setMenuOpen(false) }}>Remove exercise</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.colHeaders}>
        <span>SET</span>
        <span>LBS</span>
        <span>REPS</span>
        <span>✓</span>
      </div>

      <div className={styles.sets}>
        {sets.map((set, si) => (
          <SetRow
            key={si}
            index={si}
            set={set}
            isActive={si === firstUndoneIdx}
            currentPR={currentPR}
            onChange={(updated) => onUpdateSet(si, updated)}
          />
        ))}
      </div>

      <button className={styles.addSetBtn} onClick={onAddSet}>+ ADD SET</button>
    </div>
  )
}

function DumbbellEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
