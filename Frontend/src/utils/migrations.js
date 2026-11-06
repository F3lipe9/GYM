import { load, save } from './storage'
import { DRAFT_KEY } from './templates'
import { LEGACY_ID_MAP, REMOVED_DEFAULTS } from '../data/legacyIdMap'

export const SCHEMA_VERSION = 3

const remap = (id) => LEGACY_ID_MAP[id] ?? id

function remapEntries(list = []) {
  return list.map((e) => ({ ...e, exerciseId: remap(e.exerciseId) }))
}

// v1 → v2: default exercise IDs went from position-based (`default_N`) to fixed slugs.
function remapLegacyIds() {
  const workouts = load('workouts', [])
  const templates = load('templates', [])
  const draft = load(DRAFT_KEY, null)

  save('workouts', workouts.map((w) => ({ ...w, exercises: remapEntries(w.exercises) })))
  save('templates', templates.map((t) => ({ ...t, exercises: remapEntries(t.exercises) })))
  if (draft) save(DRAFT_KEY, { ...draft, entries: remapEntries(draft.entries) })
}

// Re-creates removed defaults as custom exercises if any saved data still uses them.
// Idempotent, so it's safe to run after every change to REMOVED_DEFAULTS.
function reviveRemovedDefaults() {
  const workouts = load('workouts', [])
  const templates = load('templates', [])
  const draft = load(DRAFT_KEY, null)
  const stored = load('exercises', [])

  const used = new Set()
  for (const w of workouts) w.exercises?.forEach((e) => used.add(e.exerciseId))
  for (const t of templates) t.exercises?.forEach((e) => used.add(e.exerciseId))
  draft?.entries?.forEach((e) => used.add(e.exerciseId))

  const customs = Array.isArray(stored) ? stored.filter((e) => !e.isDefault) : []
  const customIds = new Set(customs.map((e) => e.id))
  const revived = REMOVED_DEFAULTS
    .filter((ex) => used.has(ex.id) && !customIds.has(ex.id))
    .map((ex) => ({ ...ex, isDefault: false, createdAt: new Date(0).toISOString() }))

  save('exercises', [...customs, ...revived])
}

// Runs on startup; `schemaVersion` in localStorage records which steps are done.
// v3: more defaults removed — revive them for existing v2 users too.
export function runMigrations() {
  const version = load('schemaVersion', 1)
  if (version >= SCHEMA_VERSION) return

  if (version < 2) remapLegacyIds()
  reviveRemovedDefaults()
  save('schemaVersion', SCHEMA_VERSION)
}
