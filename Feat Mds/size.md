## Feature: Body Size Tracking

### Summary
A new **SIZE** section on the Progress screen, below Bodyweight. You log body measurements (in cm or inches) through an **ADD SIZE** overlay. Logged entries appear as a list of dates, newest first. Tapping a date expands it to show every measurement in both units, with the change since the previous entry. A chart shows one measurement over time.

### Decisions
| Question | Decision |
|---|---|
| Unit input | One **CM \| IN** toggle for the whole overlay; last choice is remembered |
| Partial entries | Allowed — at least 1 field required; empty fields show `—` |
| Same-day saves | One entry per date. Saving again on the same day **merges** into it (filled fields overwrite, others kept) |
| Date | Always today (no date picker) |
| Extras | Change vs last entry ✅, chart per measurement ✅, edit/delete ❌ (out of scope) |

---

### Measurements (fixed order)
| Key | Label |
|---|---|
| `neck` | Neck |
| `chest` | Chest |
| `leftArm` | Left Arm |
| `rightArm` | Right Arm |
| `waist` | Belly Button |
| `leftLeg` | Left Leg |
| `rightLeg` | Right Leg |
| `leftCalf` | Left Calf |
| `rightCalf` | Right Calf |

Defined once in `src/data/sizeFields.js` as `SIZE_FIELDS = [{ key, label }, ...]`. Every UI piece reads from it.

---

### Data Model

New localStorage key `sizes`:
```js
sizes: [
  {
    date,        // 'YYYY-MM-DD', unique
    neck,        // cm, number — omitted if not measured
    chest,
    leftArm,
    // ...one optional number per SIZE_FIELDS key
  }
]
```

New localStorage key `sizeUnit`: `'cm' | 'in'`, default `'cm'`.

**Values are always stored in cm**, rounded to 2 decimals. Two decimals (not one) means an inch entry survives the round trip: `35.4in → 89.92cm → 35.4in`.

No migration is needed. `sizes` is a new key that defaults to `[]`, so `SCHEMA_VERSION` stays at 3.

---

### Display Format
- Value: `90cm/35.4in`, both rounded to 1 decimal (`cm / 2.54` for inches)
- Missing value: `—`
- Change vs last: `+1.2cm/+0.5in` (green), `-0.8cm/-0.3in` (red), `0cm/0in` (muted)
  - "Last" means the **most recent earlier entry that has that same measurement**, not just the previous date. If you skipped chest last time, chest is compared with the entry before that.
  - If no earlier entry has it, no change is shown.

---

### UI

**Progress screen layout (new part below the Bodyweight card):**
```
SIZE
┌──────────────────────────────┐
│ [CHEST ▾]       98.0cm/38.6in│  ← measurement selector + latest value
│ [1M][3M][6M][ALL]            │
│  ╱‾‾╲__╱‾‾ line chart         │
│                              │
│ [ ⊕ ADD SIZE               ] │
│                              │
│ NOV 6                      ▾ │  ← tap to expand
│   Neck       39.0cm/15.4in  +0.5cm/+0.2in
│   Chest      98.0cm/38.6in  +1.0cm/+0.4in
│   Left Arm   —
│   ...
│ OCT 30                     ▸ │
│ OCT 23                     ▸ │
└──────────────────────────────┘
```
- The chart sits above the button so a long date list doesn't push it out of view.
- Date list: newest first. Only one date is expanded at a time; tapping an open date closes it.
- Dates use the existing `fmtDate` style (`TODAY`, `NOV 6`). Add the year (`NOV 6, 2025`) when it isn't the current year.
- Empty state (no entries): the card shows only the button plus `No measurements yet.`

**Chart:**
- A `<select>` of the 9 measurements. It defaults to the first measurement that has data.
- Same 1M/3M/6M/ALL range toggle and Recharts styling as the volume chart.
- Plots only entries that have the selected measurement.
- The Y axis and tooltip use the current `sizeUnit`.
- Empty cases: `No entries for this measurement yet.` / `No entries in this range.` / with 1 point: `Add another entry to see a trend.`

**ADD SIZE overlay** (reuses `components/Sheet.jsx`):
```
ADD SIZE                       ✕
[  CM  |  IN  ]
Neck        [      ]
Chest       [      ]
Left Arm    [      ]
...(all 9)
─────────────────────────────
[            SAVE            ]
```
- Inputs are `type="number"` with `inputMode="decimal"`, showing the unit as a suffix/placeholder.
- If **today already has an entry**, fields open prefilled with it (converted to the current unit). This makes same-day updating obvious.
- Switching CM↔IN with values typed converts them in place, so switching never silently reinterprets a number.
- Save is disabled until at least one field holds a number > 0. Blank or invalid fields are ignored, never saved as 0.
- On save: convert to cm, dispatch, close the sheet, and auto-expand today's entry in the list.

---

### Implementation

**`src/data/sizeFields.js`** — `SIZE_FIELDS`.

**`src/utils/size.js`** — pure helpers:
```js
toCm(value, unit)                 // in → cm, rounded to 2 decimals
cmToIn(cm)                        // cm / 2.54
fmtBoth(cm)                       // '90cm/35.4in'
fmtDiff(cmDiff)                   // '+1.2cm/+0.5in'
getPrevValue(sizes, date, key)    // most recent value for key before `date`, or null
getSizeSeries(sizes, key)         // [{ date, value }] sorted asc, only entries with key
```

**`src/context/AppContext.jsx`:**
- Add `sizes: []` to `initialState`, load it in INIT, and add a save effect, the same way as `bodyweight`.
- New action `SAVE_SIZE`, payload `{ date, ...fields }`. It upserts by date: if an entry exists, `{ ...existing, ...payload }`; otherwise append.

**`src/components/SizeSheet.jsx`** (+ `.module.css`): the overlay. It owns the unit toggle and its inputs, and reads/writes `sizeUnit` via `load`/`save`.

**`src/components/SizeHistory.jsx`** (+ `.module.css`): the expandable date list with values and change since last entry.

**`src/screens/Progress.jsx`:** the SIZE section title + card, the chart (reusing `RANGES`, `rangeCutoff`, `tooltipStyle`, `fmtDate`), the ADD SIZE button (same style as `logWeightBtn`), `<SizeHistory>`, and `<SizeSheet>`.

---

### Out of Scope
- Editing or deleting past entries. A wrong value can only be fixed **on the same day**, by adding size again. Revisit if this becomes a problem.
- Picking a past date / backfilling.
- Custom measurement categories.

### Test Checklist
- [ ] Add a full entry in cm → list shows today with all 9 values as `Xcm/Yin`
- [ ] Add an entry in inches → stored cm round-trips to the same inch value
- [ ] Partial entry → missing fields show `—`, Save disabled with all blank
- [ ] Add size twice today → still one date row; new fields merged, old ones kept, overlay prefilled the second time
- [ ] Change vs last skips entries missing that measurement
- [ ] Unit toggle converts typed values and is remembered after reload
- [ ] Chart: switching measurement/range works; empty and single-point states show
- [ ] Data persists after reload; existing bodyweight/workout data is untouched
