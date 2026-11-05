# GymLog — Complete Project Summary

## What Is It

GymLog is a personal progressive overload tracker built as a Progressive Web App (PWA). It runs entirely in the browser with no backend, no account, and no external services. All data lives in `localStorage`. The entire point is to log workouts, see your progress, and get told when to add weight — without the noise of a commercial gym app.

It is designed to be installed on a phone's home screen and used like a native app. The UI is fullscreen and dark-themed, with a fixed top bar and bottom nav, and is built entirely around mobile-first interactions.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | React 18 | Component model, hooks, fast re-renders |
| Build Tool | Vite 6 | HMR, fast builds, plugin ecosystem |
| Routing | React Router v6 | Client-side SPA routing with basename support |
| State | React Context + useReducer | Lightweight, no external library needed |
| Persistence | localStorage | Single-user, no backend needed |
| Charts | Recharts 2 | Lightweight composable chart library for React |
| PWA | vite-plugin-pwa | Generates manifest + Workbox service worker |
| Styling | CSS Modules + CSS variables | Scoped per-component styles, no runtime overhead |
| Font | Barlow Condensed (Google Fonts) | Weights 400/600/700/800, condensed for gym aesthetic |
| Hosting | GitHub Pages | Free static hosting under `/GYM/` path |

**Runtime dependencies:** `react`, `react-dom`, `react-router-dom`, `recharts`  
**Dev dependencies:** `vite`, `@vitejs/plugin-react`, `vite-plugin-pwa`

---

## Folder Structure

```
Frontend/
├── public/
│   ├── logo.png          — App branding logo
│   ├── icon-192.png      — PWA homescreen icon (small)
│   └── icon-512.png      — PWA homescreen icon (large/maskable)
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx         — Fixed 4-tab footer navigation
│   │   ├── TopBar.jsx            — Fixed header with logo
│   │   ├── SetRow.jsx            — Single set input row (weight/reps/done)
│   │   ├── ProgressionBadge.jsx  — "🔺 Suggested: X lbs" badge
│   │   └── Heatmap.jsx           — 12-week workout intensity grid
│   ├── screens/
│   │   ├── LogWorkout.jsx   — / (home) — core workout logging
│   │   ├── History.jsx      — /history — past workouts + streak
│   │   ├── Progress.jsx     — /progress — charts + bodyweight
│   │   └── Exercises.jsx    — /exercises — exercise library
│   ├── context/
│   │   └── AppContext.jsx   — Global state + localStorage persistence
│   ├── hooks/
│   │   └── useLocalStorage.js  — Custom hook (not used in current build)
│   ├── utils/
│   │   ├── storage.js       — load/save localStorage wrappers
│   │   ├── progression.js   — getSuggestions() logic
│   │   ├── prs.js           — getPRs() personal record tracker
│   │   └── volume.js        — getVolumeOverTime() chart data
│   ├── data/
│   │   └── defaultExercises.js  — 35 pre-loaded exercises with metadata
│   ├── App.jsx       — Root router + layout shell
│   ├── main.jsx      — React mount point
│   └── index.css     — Global CSS variables + resets
├── index.html        — Entry point, imports Barlow Condensed font
├── vite.config.js    — Build config + PWA plugin setup
└── package.json      — Project metadata + scripts
```

---

## Data Model

All data lives in `localStorage` under three keys:

### `workouts`
```js
[
  {
    id: string,
    date: string,          // ISO date string e.g. "2025-04-28"
    exercises: [
      {
        exerciseId: string,
        sets: [
          { weight: number, reps: number }   // weight in lbs
        ]
      }
    ]
  }
]
```

### `exercises`
```js
[
  {
    id: string,            // "default_0" or "custom_<timestamp>_<rand>"
    name: string,
    category: string,      // "Chest", "Back", "Shoulders", "Legs", "Arms", "Custom"
    equipment: string,     // "Barbell", "Cable", "Machine", etc.
    type: string,          // "Compound" or "Isolation"
    isDefault: boolean,
    createdAt: string      // ISO date string
  }
]
```

### `bodyweight`
```js
[
  { date: string, weight: number }  // weight in lbs
]
```

### `workout_draft` (localStorage key)
In-progress workout is auto-saved here and restored on page reload:
```js
{
  date: string,
  entries: [
    {
      exerciseId: string,
      sets: [
        { weight: string, reps: string, done: boolean }
      ]
    }
  ]
}
```

---

## Default Exercise Database

35 exercises pre-loaded across 5 muscle groups. All have `isDefault: true` and cannot be deleted.

| Category | Exercises |
|---|---|
| Chest | Bench Press, Incline Bench, Dumbbell Bench, Incline Dumbbell, Pec Fly |
| Shoulders | Shoulder Press, Lat Raise Machine, Lat Raise Cable |
| Triceps | Tricep Extension, Tricep Rope, JM Press, Tricep Machine |
| Biceps | Lying Curl, Lying Hammer Curl, Straight Bar Curl, Reverse Curl, Rope Hammer Curl, Behind Curl |
| Back | Pull Up, Lat Pulldown, Lat Pullover, Lower Row, Upper Row, Kelso, Rear Delt Fly, Face Pull |
| Legs | Squat, Leg Press, RDL, Leg Extension, Leg Curl, Calf Raises, Hip Abductor, Hip Adductor |

---

## State Management

**File:** `src/context/AppContext.jsx`

A single React context wraps the entire app. `useReducer` manages three independent data slices: `workouts`, `exercises`, and `bodyweight`.

**Reducer actions:**

| Action | Effect |
|---|---|
| `INIT` | Hydrate state from localStorage on first load |
| `ADD_WORKOUT` | Append a new workout object |
| `DELETE_WORKOUT` | Remove a workout by ID |
| `ADD_EXERCISE` | Push a custom exercise |
| `DELETE_EXERCISE` | Filter out a custom exercise by ID |
| `LOG_BODYWEIGHT` | Append a bodyweight entry |

Every state change triggers a `useEffect` that writes the updated state back to `localStorage`. Default exercises are merged in on `INIT` so they always exist even if the user clears data.

Consumed via the `useApp()` custom hook:
```js
const { state, dispatch } = useApp()
```

---

## Business Logic (Utils)

### `progression.js` — `getSuggestions(workouts)`
Returns a `Map<exerciseId, suggestedWeight>`.

Algorithm:
1. For each exercise, find the most recent workout it appeared in
2. From that workout, find the **top weight** (maximum weight across all sets)
3. Collect every set logged at that top weight
4. Apply progression rule:
   - All top sets ≥ 10 reps → suggest `topWeight + 5`
   - All top sets ≥ 5 reps → suggest `topWeight` (maintain)
   - Any top set < 5 reps → suggest `topWeight - 5` (deload)

This ignores drop sets (sets below top weight) entirely, which keeps the logic clean for both normal sets and drop set protocols.

### `prs.js` — `getPRs(workouts)`
Returns `Map<exerciseId, { weight, reps, date }>`.

Scans all workouts for each exercise and records the highest weight ever lifted, the reps achieved at that weight, and which date it happened. Used by `SetRow` to show a "↑ PR" badge when the current set exceeds the known PR.

### `volume.js` — `getVolumeOverTime(workouts, exerciseId)`
Returns `[{ date, volume }]` sorted oldest to newest.

Volume per session = Σ(weight × reps) for every set. Used by the Progress screen's bar chart.

### `storage.js`
Thin wrapper:
```js
load(key, fallback)   // JSON.parse(localStorage.getItem(key)) ?? fallback
save(key, value)      // localStorage.setItem(key, JSON.stringify(value))
```

---

## Screens

### Log Workout (`/`)
The primary screen and most complex component.

**What it does:**
- Date picker defaults to today
- Add exercises from a dropdown (already-added exercises are hidden from options)
- Each exercise card shows sets as `SetRow` components
- Sets track weight, reps, and a done/check state
- Sets highlight as "active" (next undone one) to guide the user through the workout
- A `ProgressionBadge` appears above each exercise if a weight suggestion exists
- "FINISH WORKOUT" saves only sets where both weight and reps are filled in
- "DISCARD" clears the draft
- In-progress draft auto-saves to `workout_draft` in localStorage on every change and rehydrates on page load

**Format date helper:** Converts ISO strings to uppercase format like `"APR 28, 2025"`.

### History (`/history`)
**What it does:**
- Shows active streak (consecutive days with at least one workout) with a flame icon
- 12-week workout heatmap (rendered by `Heatmap` component)
- Sorted list of all workouts, newest first
- Each card shows: date label (TODAY / YESTERDAY / date), total volume formatted as `2.5T` for 2,500 lbs, and a one-line summary of exercise names
- Cards are expandable to show full set details per exercise
- Sets are displayed in compact notation: `3×10 @ 185` or mixed notation for varied reps
- Each workout has a delete button (calls `DELETE_WORKOUT` dispatch)

**Volume formatting:** Total weight × reps across all sets, then divided by 1000 and shown as `1.2T`.

### Progress (`/progress`)
**What it does:**
- Exercise picker dropdown to select any exercise
- Two PR badges: **1RM** (highest weight ever for that exercise) and **VOL PR** (highest single-session volume)
- Recharts `BarChart` showing volume for the last 5 sessions
  - Bars are dark gray; the most recent session is always highlighted in accent lime
  - X-axis: abbreviated month/day, Y-axis hidden, custom dark tooltip
- Bodyweight section:
  - Shows current (most recent) bodyweight as a large number
  - "LOG WEIGHT" button toggles an inline input form
  - 7-day trend with directional arrow: ↗ in red for gain, ↘ in accent for loss
  - Mini 7-day bodyweight bar chart

### Exercises (`/exercises`)
**What it does:**
- Search bar filters all exercises by name (case-insensitive)
- Exercises grouped by category in a fixed display order: Chest → Back → Shoulders → Legs → Arms → Custom
- Categories rendered via `useMemo` for performance
- Each exercise card shows name, equipment tag, type tag
- Default exercises show a lock icon — no delete button
- Custom exercises show a red delete button and a left border in accent color
- "ADD EXERCISE" inline form with a text input, Cancel, and Add buttons
- New custom exercises get ID `custom_${Date.now()}_${Math.random()}`

---

## Components

### `TopBar`
Fixed header at 56px. Black background (`#000`), center-aligned "GYMLOG" text in accent lime, dumbbell SVG icon left, user SVG icon right.

### `BottomNav`
Fixed footer at 68px. Four `NavLink` tabs: LOG, HISTORY, PROGRESS, EXERCISES. Active tab has accent lime background with black text. Inactive tabs have muted text. 0.12s color transition. Icons are SVG strokes above label text.

### `SetRow`
Single set input row in a 4-column grid: `[SET #]` `[WEIGHT input]` `[REPS input]` `[CHECK button]`.

- The "active" set (next undone) has its inputs highlighted in accent color
- A `"↑ PR"` badge floats above the check button if this set's weight exceeds the current PR for that exercise
- Checking a set marks it done; the next set becomes active
- Check button is disabled until both weight and reps have values

### `ProgressionBadge`
Small inline badge reading `"🔺 Suggested: X lbs"` with an accent-tinted background. Shown above an exercise card when a progression suggestion exists.

### `Heatmap`
12-week activity grid (12 cols × 7 rows = 84 cells). Each cell is one day. Intensity levels are calculated by total sets that day:
- Level 0: no workout — dark gray
- Level 1: < 8 sets — dark olive green (`#3a4500`)
- Level 2: 8–15 sets — medium green (`#7a9200`)
- Level 3: 16+ sets — bright lime (accent)

Hovering shows the ISO date as a tooltip title. A legend below shows LIGHT → HEAVY.

---

## Styling

### Design Language
- **Dark theme throughout** — never a white background
- **Accent color: `#ccff00`** (bright lime) — used for active elements, progress highlights, badges, active nav, borders on focus
- **Barlow Condensed** font — uppercase tracking-heavy labels everywhere
- **No shadows** — depth comes from background color layering
- **Border-radius: 6px** on all cards and inputs

### CSS Variables (defined in `index.css`)
```css
--bg: #111111          /* page background */
--bg-card: #1c1c1c     /* card/panel background */
--bg-input: #0d0d0d    /* input field background */
--accent: #ccff00      /* primary accent (lime) */
--accent-dim: #99cc00  /* dimmed accent for hover states */
--text: #ffffff        /* primary text */
--text-muted: #888888  /* secondary/label text */
--border: #2e2e2e      /* default border */
--border-active: #ccff00  /* active input border */
--radius: 6px
--topbar-height: 56px
--nav-height: 68px
```

### Scoped Styles
Each component and screen has its own `.module.css` file. Class names are auto-hashed at build time to prevent collisions. Every CSS file is co-located with its component.

---

## PWA Configuration

**File:** `vite.config.js`

```js
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'GymLog',
    short_name: 'GymLog',
    display: 'standalone',
    start_url: '/GYM/',
    theme_color: '#111111',
    background_color: '#111111',
    icons: [
      { src: '/GYM/logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/GYM/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    navigateFallback: '/GYM/index.html',
    navigateFallbackDenylist: [/^\/api/]
  }
})
```

- `registerType: 'autoUpdate'` — service worker updates silently when a new build is deployed
- Workbox pre-caches all static assets: JS bundles, CSS, HTML, images, fonts
- SPA fallback routes all 404s to `/GYM/index.html` (required for client-side routing)
- API routes explicitly excluded from the navigation fallback

When installed on a phone via "Add to Home Screen," the app launches as a standalone fullscreen experience with no browser chrome.

---

## Routing

**Router:** `BrowserRouter` with `basename="/GYM"`

| Route | Screen |
|---|---|
| `/` | LogWorkout |
| `/history` | History |
| `/progress` | Progress |
| `/exercises` | Exercises |

The basename matches the GitHub Pages deployment path. All `NavLink` and `Link` hrefs are relative; React Router prepends `/GYM` automatically.

---

## Build & Deployment

### Local Development
```bash
cd Frontend
npm install
npm run dev       # starts Vite dev server with HMR
```

### Production Build
```bash
npm run build     # outputs to dist/
npm run preview   # local preview of production build
```

### Deployment Target
GitHub Pages under `https://<user>.github.io/GYM/`

The Vite config sets `base: '/GYM/'` which prefixes all asset URLs and the service worker scope with that path. The `BrowserRouter basename="/GYM"` ensures React Router's link generation stays consistent.

A GitHub Actions CI workflow is configured in `.github/workflows/` to run on push to `main`, pointing to the `Frontend/` subdirectory for building.

---

## App Architecture Patterns

### Data Flow
```
User interaction
  → Component local state update
    → dispatch() to AppContext
      → Reducer produces new state
        → useEffect persists to localStorage
          → Components re-render with new data
```

### Key Design Decisions

**No backend.** Every feature works offline. LocalStorage is the database. There is no sync, no auth, no server round-trips.

**Derive, don't store.** PRs, volume history, suggestions, and streaks are all computed on-demand from the raw `workouts` array. Nothing is pre-computed and stored separately, which means the data model stays simple and calculations always reflect the true current state.

**Draft persistence.** The in-progress workout is written to `localStorage` on every change. Closing the browser mid-workout doesn't lose data.

**Progressive overload as first-class.** The app is built around one core feedback loop: log weights → get told when to go up. The `getSuggestions()` function is central to the entire UX and surfaces its output right on the exercise card during logging.

**No abstraction beyond what's needed.** There's one context, one reducer, one set of utilities. No HOCs, no complex middleware, no derived state libraries.

---

## Feature Status

| Feature | Status |
|---|---|
| Workout logging with multiple exercises/sets | Done |
| Draft auto-save and restore | Done |
| Progressive overload suggestions | Done |
| PR detection and inline badge | Done |
| Volume history chart | Done |
| Workout history with expandable cards | Done |
| Streak counter | Done |
| 12-week heatmap | Done |
| Bodyweight tracking + chart | Done |
| Exercise library with search | Done |
| Custom exercise creation/deletion | Done |
| PWA manifest + service worker | Done |
| Dark theme | Done |
| Bottom navigation | Done |
| Mobile-first responsive layout | Done |
| "Add to Home Screen" testing on device | Pending |
| GitHub Pages deployment | Done |
