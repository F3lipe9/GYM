# GymLog — Update Plan

Four features:

1. **Saved workouts (templates)**: save a workout and load it later to fill in Log Workout, with suggested weights already entered.
2. **Progress chart**: change the volume bar chart to a line graph of volume over time.
3. **Default exercises**: the new list is already in `defaultExercises.js`; it still needs stable IDs and a migration.
4. **Category exercise picker**: ADD EXERCISE on Log Workout opens collapsible categories, and you expand one to pick from its exercises.
5. **Splits page**: a new `/splits` screen listing every saved split; tap one to see its exercises, and delete splits from there.

> **Naming:** "split" and "saved workout" mean the same thing: the `templates` data from section 1. The code keeps the name `templates`, and the UI says **Split**.

---

## 1. Saved Workouts (Templates) ✅ Implemented

### Goal
Save a routine such as "Push Day" once. Later, pick it on the Log Workout screen to fill the page with its exercises and sets. Each set's weight is pre-filled with the suggested weight from `getSuggestions()`.

### Data model
New localStorage key `templates`:

```js
templates: [
  {
    id,                 // makeId()
    name,               // "Push Day"
    createdAt,          // ISO string
    exercises: [
      { exerciseId, setCount }   // e.g. { exerciseId: 'bench-press', setCount: 3 }
    ]
  }
]
```

A template stores only the structure (which exercises and how many sets). It never stores weights. Weights are worked out when the template is loaded, so they always reflect your latest session.

### State (`context/AppContext.jsx`)
- Add `templates: []` to `initialState`.
- Load `load('templates', [])` in the `INIT` effect.
- Persist with `useEffect(() => save('templates', state.templates), [state.templates])`.
- New reducer actions:
  - `ADD_TEMPLATE`: append
  - `UPDATE_TEMPLATE`: replace by id (rename, or overwrite with the current session)
  - `DELETE_TEMPLATE`: remove by id

### Autofill logic (`utils/templates.js`, new)
```js
// Build Log Workout entries from a template.
export function buildEntriesFromTemplate(template, workouts, exercises) {
  const suggestions = getSuggestions(workouts)
  const validIds = new Set(exercises.map((e) => e.id))

  return template.exercises
    .filter((t) => validIds.has(t.exerciseId))          // skip deleted exercises
    .map((t) => {
      const suggested = suggestions.get(t.exerciseId)
      const weight = suggested != null ? String(suggested) : ''
      return {
        exerciseId: t.exerciseId,
        sets: Array.from({ length: Math.max(1, t.setCount) }, () => ({
          weight, reps: '', done: false,
        })),
      }
    })
}

// Build a template from the current Log Workout entries.
export function templateFromEntries(name, entries) {
  return {
    id: makeId(),
    name,
    createdAt: new Date().toISOString(),
    exercises: entries.map((e) => ({ exerciseId: e.exerciseId, setCount: e.sets.length })),
  }
}
```

Rules:
- **Weight**: use the suggested weight if the exercise has history. Otherwise leave it blank.
- **Reps**: always blank. The user enters what they actually did.
- **No history**: leave the weight blank and show no badge, as happens now.
- **Deleted exercises**: skip them without an error. Optionally show a toast, e.g. "1 exercise in this template no longer exists".
- **Edge case**: `getSuggestions` can return `topWeight - 5`, which may be 0 or less. Clamp it to `Math.max(0, …)` in `progression.js` or in this helper.
- Move `makeId()` out of `LogWorkout.jsx` into `utils/id.js` so both files can share it.

### UI (`screens/LogWorkout.jsx`)
- **Empty state** (no entries): add a **"START FROM SAVED WORKOUT"** button next to ADD EXERCISE. Tapping it opens a list or sheet of templates showing name, exercise count and the first few exercise names. Tapping a template calls `setEntries(buildEntriesFromTemplate(...))`.
- **During a session**: in the button bar, add **"SAVE AS WORKOUT"**. It asks for a name and dispatches `ADD_TEMPLATE` with `templateFromEntries(name, entries)`. If a template is already loaded, offer "Update '<name>'" and "Save as new".
- **Replacing a session**: if entries already exist when a template is picked, ask "Replace current session?" first, so a draft is never wiped by accident.
- **Track the loaded template**: keep `activeTemplateId` in component state and include it in the `workout_draft` save, so "Update template" still works after a reload.
- **Badges**: pre-filled sets keep showing the 🔺 `ProgressionBadge` so the user can tell the weight was suggested.

### Managing templates
Saved workouts are called **splits** in the UI. They're viewed and deleted on the new **Splits page** (section 5). The Log Workout picker is only for *starting* one, so it doesn't need its own delete/rename menu.

### Optional: store template origin on workouts
When finishing a session that came from a template, save `templateId` on the workout:

```js
{ id, date, templateId, exercises: [...] }
```

Nothing uses this yet. Later it could drive History labels ("Push Day · Nov 5") or a "last done" date in the picker.

### Files
| File | Change |
|---|---|
| `src/context/AppContext.jsx` | `templates` state, load/save, 3 reducer actions |
| `src/utils/templates.js` | **new**: `buildEntriesFromTemplate`, `templateFromEntries` |
| `src/utils/id.js` | **new**: shared `makeId` |
| `src/utils/progression.js` | clamp suggested weight to at least 0 |
| `src/screens/LogWorkout.jsx` | picker, save-as button, replace confirmation, `activeTemplateId` in draft |
| `src/components/TemplatePicker.jsx` (+ `.module.css`) | **new**: list and sheet with rename/delete |
| `src/screens/LogWorkout.module.css` | styles for the new buttons |

---

## 2. Progress: Volume Line Graph ✅ Implemented

### Goal
After picking an exercise on Progress, show a **line graph of volume over time** across every session, instead of the 5-bar `BarChart`.

### Changes (`screens/Progress.jsx`)
- Swap the imports: `BarChart, Bar, Cell` become `LineChart, Line, YAxis, CartesianGrid`. Keep `XAxis`, `Tooltip` and `ResponsiveContainer`.
- Use **all** sessions instead of `volumeData.slice(-5)`. If the x-axis gets crowded, add a range toggle: `1M · 3M · 6M · ALL`, defaulting to `3M`.
- Chart setup:
  ```jsx
  <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
    <CartesianGrid vertical={false} stroke="#2a2a2a" />
    <XAxis dataKey="date" tickFormatter={fmtDate} axisLine={false} tickLine={false}
           minTickGap={24} tick={{ fontSize: 10, fill: '#666', fontWeight: 700 }} />
    <YAxis width={40} axisLine={false} tickLine={false}
           tick={{ fontSize: 10, fill: '#666' }}
           tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
    <Tooltip ... labelFormatter={fmtDate} formatter={(v) => [`${v.toLocaleString()} lbs`, 'Volume']} />
    <Line type="monotone" dataKey="volume" stroke="var(--accent)" strokeWidth={2}
          dot={{ r: 3, fill: 'var(--accent)' }} activeDot={{ r: 5 }} />
  </LineChart>
  ```
- Drop `CustomTick` and its `interval={0}`. With many points every label would overlap, so `minTickGap` decides spacing instead.
- Rename the header from "VOLUME HISTORY" to "VOLUME OVER TIME". Keep the current-volume number on the right.
- **One session only**: a line needs two points. Show the single dot and the hint "Log another session to see a trend".
- Increase the chart height from `160` to about `200` to make room for the Y-axis.

### Related fix in `utils/volume.js`
`getVolumeOverTime` returns one point per *workout*. If two workouts fall on the same date, the x-axis repeats that date. Group by `date` and add up the volume so there is one point per day.

### Optional
Make the bodyweight mini chart (`miniChartData`) a small `LineChart` sparkline as well, so both charts on the page look the same.

### Files
| File | Change |
|---|---|
| `src/screens/Progress.jsx` | BarChart → LineChart, range toggle, remove `CustomTick` |
| `src/screens/Progress.module.css` | range toggle styles |
| `src/utils/volume.js` | combine same-day sessions |

---

## 3. Update Default Exercises ✅ Implemented

> **Status:** done. Defaults now have fixed slug IDs (`defaultExercises.js`), the old→new map is in `data/legacyIdMap.js`, and `utils/migrations.js` runs once from `main.jsx` *before* the first render (LogWorkout reads the draft in its initial state, so running it in the AppContext effect would be too late). The ⚠️ renames below were applied as guessed. To correct one, edit `legacyIdMap.js` before deploying. Type fixes applied: Leg Extension, Leg Curl, Straight Bar Curl, Reverse Curl and Rope Hammer Curl → Isolation. Dips, Lying Curl and Face Pull are left as-is.

### Problem: IDs are tied to list position
`data/defaultExercises.js` currently creates IDs from each exercise's position:

```js
.map((ex, i) => ({ id: `default_${i}`, ... }))
```

Workouts store `exerciseId`. Inserting, removing or reordering a default changes which exercise each saved ID points to. Old history then appears under the wrong exercise, and PRs, suggestions and charts all break. **This has to be fixed before the list changes.**

### Fix: stable slug IDs
Give every default a fixed `id` written by hand, and never reuse or change one:

```js
export const DEFAULT_EXERCISES = [
  { id: 'bench-press',   name: 'Bench Press',   category: 'Chest', equipment: 'Barbell', type: 'Compound' },
  { id: 'incline-bench', name: 'Incline Bench', category: 'Chest', equipment: 'Barbell', type: 'Compound' },
  // ...
].map((ex) => ({ isDefault: true, createdAt: new Date(0).toISOString(), ...ex }))
```

### Migration (one time, in `AppContext` `INIT`)
1. Add a `LEGACY_ID_MAP` that maps each old ID to its new one. It must be built from the **old list order in the last commit (`62fd613`)**, not the new file, because that order is what saved workouts on the live app reference. See the mapping table below.
2. On load, if `load('schemaVersion', 1) < 2`:
   - Rewrite `exerciseId` in every `workouts[].exercises[]`.
   - Rewrite `exerciseId` in every `templates[].exercises[]` (if templates ship first).
   - Rewrite `exerciseId` in the `workout_draft` entries.
   - Then `save('schemaVersion', 2)`.
3. If a removed default still has logged history, keep it as a custom exercise (`isDefault: false`) instead of dropping it, so no history is lost.

### Legacy ID mapping (old position → new slug)
Old order is from commit `62fd613`. Rows marked ⚠️ are renames I guessed. Confirm them before building `legacyIdMap.js`.

| Old ID | Old name | New ID | New name |
|---|---|---|---|
| `default_0` | Bench Press | `bench-press` | Bench Press |
| `default_1` | Incline Bench | `incline-bench` | Incline Bench |
| `default_2` | Dumbbell Bench | `dumbbell-bench` | Dumbbell Bench |
| `default_3` | Incline Dumbbell | `incline-dumbbell` | Incline Dumbbell |
| `default_4` | Pec Fly | `pec-fly` | Pec Fly |
| `default_5` | Shoulder Press | `shoulder-press` | Shoulder Press |
| `default_6` | Lat Raise Machine | `machine-lateral-raise` | Machine Lateral Raise ⚠️ |
| `default_7` | Lat Raise Cable | `cable-lateral-raise` | Cable Lateral Raise ⚠️ |
| `default_8` | Tricep Extension | `sa-tricep-extension` | S/A Tricep Extension ⚠️ |
| `default_9` | Tricep Rope | `tricep-rope` | Tricep Rope |
| `default_10` | JM Press | `jm-press` | JM Press |
| `default_11` | Tricep Machine | *(removed)* | becomes a custom exercise if it has history ⚠️ |
| `default_12` | Lying Curl | `lying-curl` | Lying Curl |
| `default_13` | Lying Hammer Curl | `lying-hammer-curl` | Lying Hammer Curl |
| `default_14` | Straight Bar Curl | `straight-bar-curl` | Straight Bar Curl |
| `default_15` | Reverse Curl | `reverse-curl` | Reverse Curl |
| `default_16` | Rope Hammer Curl | `rope-hammer-curl` | Rope Hammer Curl |
| `default_17` | Behind Curl | `behind-curl` | Behind Curl |
| `default_18` | Pull Up | `pull-up` | Pull Up |
| `default_19` | Lat Pulldown | `lat-pulldown` | Lat Pulldown |
| `default_20` | Lat Pullover | `lat-pullover` | Lat Pullover |
| `default_21` | Lower Row | `lower-row` | Lower Row |
| `default_22` | Upper Row | `upper-row` | Upper Row |
| `default_23` | Kelso | `kelso` | Kelso |
| `default_24` | Rear Delt Fly | `rear-delt-fly` | Rear Delt Fly |
| `default_25` | Face Pull | `face-pull` | Face Pull |
| `default_26` | Squat | `squat` | Squat |
| `default_27` | Leg Press | `leg-press` | Leg Press |
| `default_28` | RDL | `rdl` | RDL |
| `default_29` | Leg Extension | `leg-extension` | Leg Extension |
| `default_30` | Leg Curl | `leg-curl` | Leg Curl |
| `default_31` | Calf Raises | `calf-raises` | Calf Raises |
| `default_32` | Hip Abductor | `hip-abductor` | Hip Abductor |
| `default_33` | Hip Adductor | `hip-adductor` | Hip Adductor |

**New exercises with no history:** `smith-incline-bench`, `low-to-high-cable-fly`, `smith-shoulder-press`, `cable-front-raise`, `sa-overhead-extension`, `dips`.

### Data fixes in the new list
- Several isolation movements are tagged `Compound`: Leg Extension, Leg Curl, Reverse Curl, Rope Hammer Curl and Straight Bar Curl. Face Pull is debatable.
- `Dips` is tagged `Machine` / `Isolation`. If it's bodyweight dips, use `Free` / `Compound`.
- "Lying Curl" uses Dumbbell equipment. Check whether that is right.

### Exercises screen
- This screen already groups by `category` (`Exercises.jsx`, falling back to `'Custom'`). Move the category order into the shared `CATEGORY_ORDER` constant from section 4 so both screens use the same order.
- Optional: add a search box above the list.

### Files
| File | Change |
|---|---|
| `src/data/defaultExercises.js` | stable slug IDs, updated list |
| `src/data/legacyIdMap.js` | **new**: map from `default_N` to the new IDs |
| `src/context/AppContext.jsx` | `schemaVersion` migration in `INIT` |
| `src/screens/Exercises.jsx` | use shared `CATEGORY_ORDER` (optional search) |

---

## 4. Category Exercise Picker (Log Workout) ✅ Implemented

### Goal
Right now ADD EXERCISE shows one native `<select>` with every exercise, more than 40 in a flat list. Instead, tapping ADD EXERCISE should show a list of **collapsible categories** (Chest, Shoulder, Tricep, Bicep, Back, Legs, Custom). Tapping a category expands it to show its exercises, and tapping an exercise adds it to the session.

### Behavior
- Tapping **ADD EXERCISE** opens a bottom sheet titled "ADD EXERCISE". A bottom sheet fits the phone layout and keeps the button bar from getting buried.
- Each category row shows the category name, the number of exercises in it, and a ▾ chevron that rotates when open.
- Tapping a category expands it **accordion-style**. Only one category is open at a time to keep the sheet short; expanding one collapses the previous one.
- Each exercise row shows the name, with equipment underneath as a small label (Barbell / Cable / Machine…). Equipment is useful here because the list includes Machine, Cable and Smith versions of similar lifts.
- If the exercise has a suggestion, show the 🔺 suggested weight on its row too. `getSuggestions` is already computed on this screen.
- Exercises already in the session appear dimmed with a ✓ and can't be tapped.
- Tapping an exercise adds it and **keeps the sheet open**, so you can add several exercises in a row. A **DONE** button, a tap on the backdrop, or the Android back gesture closes it.
- Categories with no exercises are hidden. If there are no custom exercises, there's no "Custom" row.
- Optional: a search box at the top. While typing, it skips the categories and shows matching exercises in a flat list.

### Category order (`data/categories.js`, new)
```js
export const CATEGORY_ORDER = ['Chest', 'Shoulder', 'Tricep', 'Bicep', 'Back', 'Legs', 'Custom']

// Groups exercises by category in a fixed order. Unknown categories go before 'Custom'.
export function groupByCategory(exercises) {
  const groups = new Map()
  for (const ex of exercises) {
    const cat = ex.category || 'Custom'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat).push(ex)
  }
  const rank = (c) => {
    const i = CATEGORY_ORDER.indexOf(c)
    return i === -1 ? CATEGORY_ORDER.length - 1.5 : i
  }
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b))
}
```
`Exercises.jsx` uses the same helper so both screens show categories in the same order.

### Component (`components/ExercisePicker.jsx`, new)
```jsx
<ExercisePicker
  open={showPicker}
  exercises={state.exercises}
  addedIds={addedIds}
  suggestions={suggestions}
  onAdd={addExercise}          // existing function, minus setShowPicker(false)
  onClose={() => setShowPicker(false)}
/>
```
- Internal state: `openCategory` (string or null), plus `query` if search is added.
- Exercises within a category stay in the order of `defaultExercises.js`, with custom exercises after them.
- The sheet is a fixed overlay with a backdrop, max height about 75vh, and scrolls on its own. Lock page scroll while it's open.

### Changes to `screens/LogWorkout.jsx`
- Remove the inline `<select className={styles.exSelect}>` block and its `onBlur` handling.
- Change `addExercise` so it no longer closes the picker.
- Render `<ExercisePicker>` at the root of the page.
- The empty state ("Ready to train?") now hides only while the sheet is open, same as now.

### Optional: custom exercise categories
Custom exercises are currently always saved with `category: 'Custom'` (`Exercises.jsx:49`). A small upgrade: add a category dropdown (from `CATEGORY_ORDER`) to the add-exercise form, so custom lifts appear under the right muscle group.

### Files
| File | Change |
|---|---|
| `src/data/categories.js` | **new**: `CATEGORY_ORDER`, `groupByCategory` |
| `src/components/ExercisePicker.jsx` (+ `.module.css`) | **new**: bottom sheet with accordion categories |
| `src/screens/LogWorkout.jsx` | replace `<select>` with `ExercisePicker` |
| `src/screens/LogWorkout.module.css` | remove `.exSelect` |
| `src/screens/Exercises.jsx` | use `groupByCategory`; optional category field for custom exercises |

---

## 5. Splits Page (`/splits`) ✅ Implemented

### Goal
A dedicated screen showing all saved splits (the `templates` from section 1). Each split appears as a collapsed row with its name. Tapping it expands to show the exercises in that split, and you can delete a split from this page.

### Layout
```
SPLITS
┌─────────────────────────────────────┐
│ PUSH DAY            5 exercises   ▾ │
├─────────────────────────────────────┤
│ PULL DAY            6 exercises   ▴ │
│   Lat Pulldown          3 sets  🔺 145 │
│   Lower Row             3 sets     120 │
│   Kelso                 3 sets      90 │
│   Face Pull             2 sets      45 │
│   ...                                  │
│   [ START WORKOUT ]        [ DELETE ]  │
├─────────────────────────────────────┤
│ LEG DAY             5 exercises   ▾ │
└─────────────────────────────────────┘
```

### Behavior
- **List**: one card per split, sorted by `createdAt` (newest first). Optionally sort by "last done" instead if `templateId` is stored on workouts (section 1, optional).
- **Collapsed row**: split name and exercise count, with a ▾ chevron that rotates when open.
- **Expanded**: accordion style, one open at a time, using the same interaction as the category picker (section 4). It lists each exercise in the split's order with:
  - the exercise name (looked up from `state.exercises`)
  - the set count (`setCount`)
  - the suggested next weight from `getSuggestions()`, with 🔺 when it's an increase. This is optional but cheap, since the helper already exists.
  - If an exercise was deleted, show it as "Deleted exercise" in grey. `buildEntriesFromTemplate` already skips these.
- **Delete**:
  - The **DELETE** button in the expanded card asks for confirmation: "Delete 'Pull Day'? This can't be undone." Confirming dispatches `DELETE_TEMPLATE`.
  - Deleting a split **does not** touch workout history. Workouts store exercise data, not a reference that depends on the split.
  - If the deleted split is the `activeTemplateId` of the current Log Workout draft, clear `activeTemplateId` and leave the draft entries alone.
- **Start workout** (nice to have): fills Log Workout with this split, the same as picking it there, then navigates to `/`. It uses the same "Replace current session?" check if a draft exists.
- **Empty state**: "No splits yet. Build a session on the Log page and tap SAVE AS SPLIT." Include a button linking to `/`.
- **Rename** (optional): add a `···` menu on the card with Rename, reusing the `ExerciseCard` menu pattern. This dispatches `UPDATE_TEMPLATE`.

### Navigation
- Add `<Route path="/splits" element={<Splits />} />` in `App.jsx`.
- Add a **SPLITS** tab to `BottomNav.jsx` with a new icon (e.g. a stacked list or calendar grid). That makes 5 tabs: LOG · SPLITS · HISTORY · PROGRESS · EXERCISES. Check that the labels still fit at about 360px width; if not, shrink the label font or move Exercises behind a TopBar icon.
- Rename the Log Workout button from section 1 to **SAVE AS SPLIT** and the picker to **START FROM SPLIT** so the wording matches.

### Shared accordion component (optional)
The category picker (section 4) and the Splits page both use a "tap a header to expand one at a time" list. You could pull that out into `components/Accordion.jsx` (`items`, `renderHeader`, `renderBody`, controlled `openId`). This is worth doing only if both get built close together; otherwise duplicating it is fine.

### Files
| File | Change |
|---|---|
| `src/screens/Splits.jsx` (+ `.module.css`) | **new**: list, expand, delete, start |
| `src/App.jsx` | `/splits` route |
| `src/components/BottomNav.jsx` (+ `.module.css`) | SPLITS tab and icon; check the 5-tab fit |
| `src/context/AppContext.jsx` | `DELETE_TEMPLATE` / `UPDATE_TEMPLATE` (already in section 1) |
| `src/screens/LogWorkout.jsx` | rename the buttons to "Split"; clear `activeTemplateId` if its split is deleted; read the start-split handoff |
| `src/components/Accordion.jsx` | **optional**: shared with `ExercisePicker` |

**Start-workout handoff:** the Splits page can't call `setEntries` on Log Workout directly. The simplest option: write the built entries to `workout_draft` (or pass `navigate('/', { state: { templateId } })`) and have Log Workout pick it up on mount.

---

## Suggested Order

1. **Default exercise IDs and migration.** Do this before anything ships, since the new list is already in the working copy. Templates store `exerciseId`, so stable IDs must exist first.
2. **Category exercise picker.** Builds on the new list's categories, and the template picker can reuse its bottom-sheet pattern.
3. **Progress line graph.** Small and self-contained.
4. **Saved workouts (splits).** The largest change, built on the stable IDs.
5. **Splits page.** Needs the `templates` state from step 4. Build it right after so there's somewhere to view and delete splits.

## Test Checklist

> Verified 2026-11-05: automated end-to-end run in headless Edge at 360×740 against `vite preview` (31/31 checks passed).

- [x] Existing history, PRs and suggestions still line up with the right exercises after the ID migration.
- [x] The migration runs only once (`schemaVersion` is set), including after a reload.
- [x] A removed default with history (Tricep Machine) shows up as a custom exercise with its history intact.
- [x] ADD EXERCISE opens the sheet with categories in `CATEGORY_ORDER`; only one category is open at a time.
- [x] Adding an exercise keeps the sheet open, and the added exercise shows as dimmed with a ✓.
- [x] Custom exercises appear under "Custom", and the row is hidden when there are none.
- [x] The sheet closes with DONE, a backdrop tap, and the phone's back gesture.
- [x] The Splits page lists every saved split; tapping one expands it to show its exercises and set counts, and only one is open at a time.
- [x] Deleting a split asks for confirmation, removes it after a reload, and leaves History unchanged.
- [x] Deleting the split behind the current draft keeps the draft entries and clears the "Update split" option.
- [x] START WORKOUT from the Splits page fills Log Workout with suggested weights (and asks first if a draft exists).
- [x] The Splits empty state shows when there are no splits, and the 5-tab bottom nav fits at 360px width.
- [x] Save a session as a template, reload, and load the template: exercises, set counts and suggested weights are filled in and reps are blank.
- [x] Loading a template while a draft exists asks for confirmation first.
- [x] A template with a deleted custom exercise loads the remaining exercises without errors.
- [x] Progress line chart handles 0, 1, 2 and many sessions; the range toggle filters correctly.
- [x] Two workouts on the same date show as one point on the chart.
- [x] The production build (`npm run build`) works and the PWA runs offline (service worker active, manifest linked). Real "Add to Home Screen" on a phone is still a manual check.
