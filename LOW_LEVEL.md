# Low-Level Reference

## Repository Structure

- `Frontend/`: the Vite application, package manifest, lockfile, PWA/build configuration, public assets, and `src/`.
- `Frontend/src/main.jsx`: React entry point; imports global CSS and mounts `App` in `StrictMode`.
- `Frontend/src/App.jsx`: wraps the app in `AppProvider`, configures `BrowserRouter` with basename `/GYM`, and defines routes for `/`, `/history`, `/progress`, and `/exercises`.
- `Frontend/src/context/AppContext.jsx`: shared state, reducer actions, initial localStorage hydration, and persistence effects.
- `Frontend/src/screens/LogWorkout.jsx`: date selection, exercise selection, set entry, draft persistence, progression badges, workout completion, and discard behavior.
- `Frontend/src/screens/History.jsx`: active streak, 12-week heatmap, reverse date ordering, workout summaries, expandable set details, and workout deletion.
- `Frontend/src/screens/Progress.jsx`: exercise volume chart, top-weight record display, bodyweight logging, seven-day trend, and a small recent bodyweight chart.
- `Frontend/src/screens/Exercises.jsx`: exercise search, category grouping, custom exercise creation, and deletion of custom exercises.
- `Frontend/src/components/`: reusable navigation, header, set-row, progression-badge, and heatmap components. `SetRow.jsx` owns set input, completion toggling, and the current-session PR indicator.
- `Frontend/src/utils/`: pure or mostly stateless helpers for localStorage access, progression suggestions, personal records, and volume data.
- `Frontend/src/data/defaultExercises.js`: the built-in exercise records. The current array contains 33 entries, each mapped to an id such as `default_0` and marked `isDefault: true`.
- `Frontend/src/hooks/useLocalStorage.js`: a reusable localStorage hook. It is defined in the current source but has no current import or usage elsewhere in `Frontend/src`.
- `Frontend/public/`: `logo.png`, `icon-192.png`, and `icon-512.png` used as application/PWA assets.
- `.github/workflows/deploy.yml`: GitHub Actions build and GitHub Pages deployment workflow.
- `Feat Mds/`: feature notes for draft persistence and weight suggestions; these are design/implementation notes rather than runtime modules.
- `dist/`: generated build output currently present in the workspace.

## State And Data Model

The reducer state in [AppContext.jsx](Frontend/src/context/AppContext.jsx) has three arrays: `workouts`, `exercises`, and `bodyweight`.

A workout has an `id`, a date string, and exercise entries. Each exercise entry has an `exerciseId` and sets containing numeric `weight` and `reps` values. The exact object is assembled in [LogWorkout.jsx](Frontend/src/screens/LogWorkout.jsx) when the user finishes a workout.

Exercise records contain an id, name, `isDefault` flag, creation timestamp, and, for the built-in records, category, equipment, and type. Custom records are created with category `Custom`; the add form only asks for a name.

Bodyweight entries contain the current date and a numeric weight. The progress screen appends a new entry rather than replacing an existing entry for the same date.

The log screen stores an in-progress draft under `workout_draft`. Its current shape is `{ date, entries }`, where entries preserve string input values and each set also has a `done` flag. The draft is saved when there is at least one entry and removed when the workout is finished or discarded.

## State Flow And Persistence

On mount, `AppProvider` loads `workouts` and `bodyweight`, reads stored exercises, removes stored default records, and combines the remaining custom records with the current `DEFAULT_EXERCISES` array. Reducer actions then add or delete workouts, add or delete exercises, or append bodyweight entries. Separate effects save each state array to localStorage whenever that array changes.

The `load` helper catches JSON parsing/localStorage errors and returns its fallback. The `save` helper serializes with `JSON.stringify`; it does not catch write errors.

## Algorithms And Non-Trivial Logic

### Progression suggestions

[getSuggestions](Frontend/src/utils/progression.js) iterates the workouts array from its last element toward its first and considers only the first occurrence of each exercise id. It therefore uses the last array occurrence as the “most recent” session; it does not sort workouts by date. For that session it finds the maximum set weight, keeps only sets at that weight, and evaluates the minimum reps among those sets:

- minimum reps at least 10: suggest top weight plus 5 lbs;
- minimum reps at least 5 but below 10: suggest the same top weight;
- minimum reps below 5: suggest top weight minus 5 lbs.

Sets below the top weight are ignored. An exercise with no previous session has no suggestion and therefore no badge.

### Personal records

[getPRs](Frontend/src/utils/prs.js) scans every workout and keeps the highest top weight seen for each exercise. If a new top weight is higher, it stores that weight, the reps from the first set at that weight, and the workout date. It does not calculate a one-repetition-max estimate.

### Volume

[getVolumeOverTime](Frontend/src/utils/volume.js) selects workouts containing the requested exercise, sums `weight * reps` for that exercise’s sets, and sorts the resulting records by date ascending. The progress screen displays the last five records in a Recharts bar chart. History computes total workout volume using the same `weight * reps` operation and formats nonzero values in thousands with a `T` suffix.

### Streak and heatmap

[History.jsx](Frontend/src/screens/History.jsx) de-duplicates workout dates, sorts them descending, and counts consecutive dates starting from today. [Heatmap.jsx](Frontend/src/components/Heatmap.jsx) builds a 12-week grid ending at the current week; intensity is based on total sets on a date: 0 sets, fewer than 8 sets, fewer than 16 sets, or 16 or more sets.

### Workout input handling

The log screen only saves sets where both weight and reps are non-empty, converting those values to numbers. Set completion toggles only when both inputs are non-empty. The “current PR” indicator in `SetRow.jsx` compares the entered weight with the stored highest weight and does not include reps in that comparison.

## External Integrations And Configuration

- Google Fonts is requested by [index.html](Frontend/index.html) for Barlow Condensed. This is the only runtime external request visible in the application source; workout data is not sent to an application API.
- The PWA plugin in [vite.config.js](Frontend/vite.config.js) generates a standalone manifest with the `/GYM/` start URL, app icons, and a Workbox service worker. The configured navigation fallback is `/GYM/index.html`, with `/api` paths excluded.
- GitHub Actions uses Node.js 20, runs from `Frontend/`, and deploys the generated `Frontend/dist` artifact through GitHub Pages. The repository does not contain an application secret, auth flow, environment-variable configuration, or backend credentials.
- React Router and Vite are configured for the `/GYM/` base path in [App.jsx](Frontend/src/App.jsx) and [vite.config.js](Frontend/vite.config.js).

## Known Limitations And Technical Debt

- There are no automated tests or test script in the current package manifest, and no test/spec files were found.
- Persistence is browser-local. Clearing site data, changing browsers/devices, or using another browser profile will not share or restore the records; this follows from the localStorage-only implementation.
- There is no account, synchronization, backup, or server-side data layer in the source or package manifest.
- Deleting a custom exercise does not rewrite existing workouts. History falls back to displaying the stored exercise id when it cannot find the exercise record; this behavior is visible in [History.jsx](Frontend/src/screens/History.jsx).
- `getSuggestions` treats array order as recency even though the workout model contains dates. Callers should append workouts in chronological order for its “most recent” behavior to match dates.
- The bodyweight screen appends records for the current date and does not edit or remove prior records.
- The default exercise list has 33 records in source, while [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) describes 35; the source count is used here because it is the runtime definition.
- [useLocalStorage.js](Frontend/src/hooks/useLocalStorage.js) is currently unused by the application source; persistence is implemented directly through the context and storage helper.
- The project notes in [CLAUDE.md](CLAUDE.md) mark mobile add-to-home-screen testing, pushing/enabling GitHub Pages, and end-to-end phone testing as incomplete. These are project-plan statements, not verification that the tasks remain undone outside the repository.

## TODO, FIXME, And HACK Markers

A repository search found no literal `TODO`, `FIXME`, or `HACK` markers in `Frontend/src`, the frontend configuration files, the workflow, `README.md`, `PROJECT_SUMMARY.md`, or `Feat Mds/`. The unchecked project-plan items mentioned above are written as Markdown checklist entries in [CLAUDE.md](CLAUDE.md), not as code markers.

## Testing And Verification

The only package scripts are `dev`, `build`, and `preview` in [Frontend/package.json](Frontend/package.json). No unit, integration, or end-to-end test framework is configured in that manifest, and no test/spec files were found. The repository includes generated build output under `dist/`, while the CI workflow independently runs `npm ci` and `npm run build` from `Frontend/`.
