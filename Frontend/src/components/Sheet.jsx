import { useEffect, useRef } from 'react'
import styles from './Sheet.module.css'

// Bottom sheet with a backdrop. Closes on backdrop tap, Escape, or the
// browser/phone back gesture (a history entry is pushed while open).
export default function Sheet({ open, title, onClose, children, footer }) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Back gesture support: push a same-URL entry; popping it closes the sheet.
    window.history.pushState({ gymSheet: true }, '')
    let popped = false
    const onPop = () => {
      popped = true
      onCloseRef.current()
    }
    window.addEventListener('popstate', onPop)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      window.removeEventListener('popstate', onPop)
      // Closed some other way → drop the entry we pushed.
      if (!popped && window.history.state?.gymSheet) window.history.back()
    }
  }, [open])

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}
