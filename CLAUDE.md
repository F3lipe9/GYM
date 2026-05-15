# GymLog — Project Description & Build Plan

## Project Description

GymLog is a personal progressive overload tracker built as a PWA (Progressive Web App). It runs entirely in the browser, installs to your phone's home screen, and stores all data locally. No backend, no account, no dependencies on third-party services.

The core purpose is simple: log your workouts, track your progress, and get told when to increase weight — without the noise of a commercial app.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite | Component-based, fast dev experience, easy PWA setup |
| Styling | CSS Modules + CSS variables | Scoped styles, no runtime overhead |
| Routing | React Router v6 | Client-side navigation between screens |
| State | React Context + useReducer | Lightweight, no external library needed |
| Persistence | localStorage | Single user, no backend needed |
| PWA | vite-plugin-pwa | Auto-generates manifest + service worker |
| Deployment | GitHub Pages | Free, static hosting, works with Vite |
| Charts | Recharts | Lightweight, composable React chart library |

---

## Data Model

All data lives in localStorage under these keys:

```js
// Exercises
exercises: [
  { id, name, isDefault, createdAt }
]

// Workouts
workouts: [
  {
    id,
    date,           // ISO string
    exercises: [
      {
        exerciseId,
        sets: [
          { weight: number, reps: number }  // lbs
        ]
      }
    ]
  }
]

// Bodyweight log
bodyweight: [
  { date, weight }  // lbs
]
```

---

## Progression Logic

For every exercise in a completed workout:

1. Find the **top weight** (max weight across all sets for that exercise)
2. Collect all sets logged **at that top weight**
3. If **every** one of those sets has `reps >= 10` → mark exercise for progression
4. Next time that exercise appears in Log Workout → show a 🔺 badge: **"Suggested: {topWeight + 5} lbs"**

This works uniformly for standard sets and drop sets. Drop portions (sets below top weight) are ignored entirely.

---

## Screens

### 1. Log Workout (`/`)
- Date picker (defaults to today)
- Exercise selector (from exercises list)
- Per exercise: add sets with weight + reps inputs
- Progression badge 🔺 shown if exercise qualifies
- Save workout button

### 2. History (`/history`)
- List of past workouts by date
- Expandable to see exercises + sets logged
- Streak counter at top (consecutive days with a workout)
- Workout frequency heatmap (GitHub-style, last 12 weeks)

### 3. Progress (`/progress`)
- Exercise selector → line chart of volume over time (weight × reps summed per session)
- PR display per exercise (best single top-weight set)
- Bodyweight log: input + line chart over time

### 4. Exercises (`/exercises`)
- List of all exercises (defaults + custom)
- Add custom exercise
- Delete custom exercises (defaults cannot be deleted)

---

## Default Exercises

```
Bench Press, Incline Bench Press, Overhead Press,
Squat, Romanian Deadlift, Leg Press, Leg Curl,
Barbell Row, Lat Pulldown, Cable Row,
Pull-up, Dip, Tricep Pushdown, Bicep Curl,
Lateral Raise, Face Pull
```

---

## Build Plan

### Phase 1 — Project Setup
- [x] Scaffold Vite + React project
- [x] Install dependencies: react-router-dom, recharts, vite-plugin-pwa
- [x] Set up folder structure (components/, screens/, context/, hooks/, utils/)
- [x] Configure GitHub Pages deployment (vite.config.js base path)
- [x] Set up CSS variables and global styles

### Phase 2 — Data Layer
- [x] localStorage read/write utility functions
- [x] Seed default exercises on first load
- [x] Context + useReducer for workouts, exercises, bodyweight
- [x] Progression logic utility: `getProgressionFlags(workouts, exercises)`
- [x] PR logic utility: `getPRs(workouts)`
- [x] Volume logic utility: `getVolumeOverTime(workouts, exerciseId)`

### Phase 3 — Screens
- [x] Log Workout screen (core feature, build first)
- [x] Exercises screen (needed by Log Workout)
- [x] History screen
- [x] Progress screen (charts last, depends on data utilities)

### Phase 4 — PWA
 - [x] Configure vite-plugin-pwa (manifest: name, icons, theme color, display: standalone)            
 - [x] Verify service worker caches app shell                                                         
 - [ ] Test "Add to Home Screen" on mobile

### Phase 5 — Polish & Deploy
- [ ] Mobile-first responsive layout
- [ ] Bottom navigation bar (Log, History, Progress, Exercises)
- [ ] Empty states for all screens
- [ ] Push to GitHub, enable GitHub Pages
- [ ] End-to-end test on phone

---

## Folder Structure

```
src/
├── components/
│   ├── BottomNav.jsx
│   ├── ProgressionBadge.jsx
│   ├── SetRow.jsx
│   └── Heatmap.jsx
├── screens/
│   ├── LogWorkout.jsx
│   ├── History.jsx
│   ├── Progress.jsx
│   └── Exercises.jsx
├── context/
│   └── AppContext.jsx
├── hooks/
│   └── useLocalStorage.js
├── utils/
│   ├── progression.js
│   ├── prs.js
│   ├── volume.js
│   └── storage.js
├── data/
│   └── defaultExercises.js
├── App.jsx
└── main.jsx
```

---

## Deployment Flow

1. `npm run build` → generates `dist/`
2. Push to GitHub
3. GitHub Pages → set source to `gh-pages` branch (use `gh-pages` npm package or GitHub Actions)
4. Open on phone → browser prompts "Add to Home Screen"
5. Installed as standalone app, no browser chrome

---

## Out of Scope (for now)

- Auth / multi-user
- Cloud sync
- Push notifications
- Rest timer
- Exercise video demos
- Plate calculator