import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { SIZE_FIELDS } from '../data/sizeFields'
import { toCm, fromCm, fmtNum } from '../utils/size'
import styles from './SizeSheet.module.css'

const parse = (str) => {
  const n = Number(str)
  return str.trim() !== '' && Number.isFinite(n) && n > 0 ? n : null
}

// Overlay for logging today's measurements. `existing` is today's entry (cm) if any,
// used to prefill. `onSave` receives { key: cm } for every filled field.
export default function SizeSheet({ open, onClose, onSave, existing, unit, onUnitChange }) {
  const [values, setValues] = useState({})

  // Prefill each time the sheet opens.
  useEffect(() => {
    if (!open) return
    const init = {}
    for (const { key } of SIZE_FIELDS) {
      init[key] = existing?.[key] != null ? fmtNum(fromCm(existing[key], unit)) : ''
    }
    setValues(init)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function switchUnit(next) {
    if (next === unit) return
    // Convert typed values so a number never silently changes meaning.
    setValues((prev) => {
      const out = {}
      for (const [key, str] of Object.entries(prev)) {
        const n = parse(str)
        out[key] = n == null ? str : fmtNum(fromCm(toCm(n, unit), next))
      }
      return out
    })
    onUnitChange(next)
  }

  const filled = SIZE_FIELDS.filter(({ key }) => parse(values[key] ?? '') != null)

  function handleSave() {
    if (filled.length === 0) return
    const out = {}
    for (const { key } of filled) out[key] = toCm(parse(values[key]), unit)
    onSave(out)
  }

  return (
    <Sheet
      open={open}
      title="Add Size"
      onClose={onClose}
      footer={
        <button className={styles.saveBtn} onClick={handleSave} disabled={filled.length === 0}>
          SAVE
        </button>
      }
    >
      <div className={styles.unitToggle} role="group" aria-label="Unit">
        {['cm', 'in'].map((u) => (
          <button
            key={u}
            className={`${styles.unitBtn} ${unit === u ? styles.unitActive : ''}`}
            onClick={() => switchUnit(u)}
            aria-pressed={unit === u}
          >
            {u.toUpperCase()}
          </button>
        ))}
      </div>

      {SIZE_FIELDS.map(({ key, label }) => (
        <label key={key} className={styles.row}>
          <span className={styles.label}>{label}</span>
          <span className={styles.inputWrap}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              placeholder="—"
              value={values[key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            />
            <span className={styles.suffix}>{unit}</span>
          </span>
        </label>
      ))}
    </Sheet>
  )
}
