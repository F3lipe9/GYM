// Sizes are stored in cm (2 decimals so inch entries round-trip exactly).
const CM_PER_IN = 2.54

const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d

export const toCm = (value, unit) => round(unit === 'in' ? value * CM_PER_IN : value, 2)
export const cmToIn = (cm) => cm / CM_PER_IN
export const fromCm = (cm, unit) => (unit === 'in' ? cmToIn(cm) : cm)

// Number for display: 1 decimal, no trailing ".0" → 90, 35.4
export const fmtNum = (n) => String(round(n, 1))

export const fmtBoth = (cm) => (cm == null ? '—' : `${fmtNum(cm)}cm/${fmtNum(cmToIn(cm))}in`)

export function fmtDiff(cmDiff) {
  const inDiff = round(cmToIn(cmDiff), 1)
  const cm = round(cmDiff, 1)
  if (cm === 0 && inDiff === 0) return '0cm/0in'
  const sign = (n) => (n > 0 ? `+${fmtNum(n)}` : fmtNum(n))
  return `${sign(cm)}cm/${sign(inDiff)}in`
}

// Most recent value of `key` from an entry dated before `date`, or null.
export function getPrevValue(sizes, date, key) {
  let best = null
  for (const s of sizes) {
    if (s.date < date && s[key] != null && (!best || s.date > best.date)) best = s
  }
  return best ? best[key] : null
}

// [{ date, value }] ascending, only entries that have `key`. value is in cm.
export function getSizeSeries(sizes, key) {
  return sizes
    .filter((s) => s[key] != null)
    .map((s) => ({ date: s.date, value: s[key] }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Today's date as YYYY-MM-DD in the local timezone.
export function localToday() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fmtSizeDate(dateStr) {
  if (dateStr === localToday()) return 'TODAY'
  const d = new Date(dateStr + 'T00:00:00')
  const opts = { month: 'short', day: 'numeric' }
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric'
  return d.toLocaleDateString('en-US', opts).toUpperCase()
}
