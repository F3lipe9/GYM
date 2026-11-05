import { load, save } from './storage'
import { DRAFT_KEY } from './templates'
import { LEGACY_ID_MAP, REMOVED_DEFAULTS } from '../data/legacyIdMap'

export const SCHEMA_VERSION = 2

const remap = (id) => LEGACY_ID_MAP[id] ?? id

function remapEntries(list = []) {
  return list.map((e) => ({ ...e, exerciseId: remap(e.exerciseId) }))
}

// v1 → v2: default exercise IDs went from position-based (`default_N`) to fixed slugs.
// Rewrites every stored exerciseId and re-creates removed defaults that still have data.
// Runs once; `schemaVersion` in localStorage marks it done.
export function runMigrations() {
  const version = load('schemaVersion', 1)
  if (version >= SCHEMA_VERSION) return

  const workouts = load('workouts', [])
  const templates = load('templates', [])
  const draft = load(DRAFT_KEY, null)
  const stored = load('exercises', [])

  const newWorkouts = workouts.map((w) => ({ ...w, exercises: remapEntries(w.exercises) }))
  const newTemplates = templates.map((t) => ({ ...t, exercises: remapEntries(t.exercises) }))
  const newDraft = draft ? { ...draft, entries: remapEntries(draft.entries) } : null

  // Keep removed defaults as custom exercises if anything still uses them.
  const used = new Set()
  for (const w of newWorkouts) w.exercises.forEach((e) => used.add(e.exerciseId))
  for (const t of newTemplates) t.exercises.forEach((e) => used.add(e.exerciseId))
  newDraft?.entries?.forEach((e) => used.add(e.exerciseId))

  const customs = Array.isArray(stored) ? stored.filter((e) => !e.isDefault) : []
  const customIds = new Set(customs.map((e) => e.id))
  const revived = REMOVED_DEFAULTS
    .filter((ex) => used.has(ex.id) && !customIds.has(ex.id))
    .map((ex) => ({ ...ex, isDefault: false, createdAt: new Date(0).toISOString() }))

  save('workouts', newWorkouts)
  save('templates', newTemplates)
  if (newDraft) save(DRAFT_KEY, newDraft)
  save('exercises', [...customs, ...revived])
  save('schemaVersion', SCHEMA_VERSION)
}
