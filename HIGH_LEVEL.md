# GymLog

## What It Does

GymLog is a browser-based workout tracker for recording workouts, reviewing workout history, and viewing exercise and bodyweight progress. It calculates volume and personal-record information and displays a weight suggestion for an exercise based on its most recent recorded session. The application stores its data in the browser rather than sending it to a server.

## Intended Scope

The repository describes GymLog as a personal progressive-overload tracker in [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) and [CLAUDE.md](CLAUDE.md). The available source does not describe a multi-user product, organizational deployment, or classroom assignment, so this documentation treats it as a personal tool. No user-count, performance, or usage metrics are provided.

## Architecture

The application is a single-page React frontend. [main.jsx](Frontend/src/main.jsx) mounts [App.jsx](Frontend/src/App.jsx), which provides the application context and client-side routes for logging, history, progress, and exercises. [AppContext.jsx](Frontend/src/context/AppContext.jsx) owns the shared state and reducer actions; browser `localStorage` is used for persistence through [storage.js](Frontend/src/utils/storage.js). Screen components call small utility modules for progression suggestions, personal records, and volume calculations. There is no backend application in the repository.

A typical flow is: React screen -> `useApp()` context -> reducer action -> state update -> `localStorage` write. The log screen also reads and writes a separate in-progress draft.

## Tech Stack

### Frontend

- React 18.3.1 and React DOM, specified in [Frontend/package.json](Frontend/package.json).
- React Router 6.28.0 for the four routes configured in [App.jsx](Frontend/src/App.jsx).
- Recharts 2.13.0 for the bar charts in [Progress.jsx](Frontend/src/screens/Progress.jsx).
- CSS Modules for screen and component styles, with global CSS variables in [index.css](Frontend/src/index.css).
- Barlow Condensed loaded from Google Fonts by [index.html](Frontend/index.html).

### Backend

- No backend framework, server package, API client, or server-side source is present. The repository’s project notes also describe the application as having no backend.

### Data

- Browser `localStorage` holds `workouts`, `exercises`, `bodyweight`, and the `workout_draft` used by [AppContext.jsx](Frontend/src/context/AppContext.jsx) and [LogWorkout.jsx](Frontend/src/screens/LogWorkout.jsx).
- Default exercises are defined in [defaultExercises.js](Frontend/src/data/defaultExercises.js). Custom exercises are stored with the other exercise records.

### Infrastructure

- Vite 6.0.5 builds and serves the frontend; scripts are defined in [Frontend/package.json](Frontend/package.json).
- `vite-plugin-pwa` generates the manifest and service-worker assets according to [vite.config.js](Frontend/vite.config.js).
- [deploy.yml](.github/workflows/deploy.yml) runs `npm ci` and `npm run build` from `Frontend/`, uploads `Frontend/dist`, and invokes GitHub Pages deployment on pushes to `main` or manually.

### Testing

- [Frontend/package.json](Frontend/package.json) defines `dev`, `build`, and `preview` scripts, but no test script.
- No test or spec files were found in the repository. Automated test coverage is therefore not documented as present.

## Current State

The source contains the four main screens, local persistence, exercise management, workout draft persistence, charts, and PWA configuration. A deployment workflow is configured for GitHub Pages, and a generated `dist/` directory is present in the repository workspace. The repository does not provide evidence that a GitHub Pages deployment has succeeded or that the app is currently publicly reachable, so deployment status is **not verifiable from the repository**. Mobile add-to-home-screen testing and end-to-end phone testing remain unchecked items in [CLAUDE.md](CLAUDE.md). The worktree also contains uncommitted changes to [LogWorkout.jsx](Frontend/src/screens/LogWorkout.jsx) and its stylesheet at the time this document was written.
