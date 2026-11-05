export const CATEGORY_ORDER = ['Chest', 'Shoulder', 'Tricep', 'Bicep', 'Back', 'Legs', 'Custom']

// Groups exercises by category in a fixed order → [[category, exercises[]], ...].
// Exercises keep their input order. Unknown categories go just before 'Custom'.
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
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
}
