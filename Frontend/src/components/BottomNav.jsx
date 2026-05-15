import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const links = [
  { to: '/', label: 'LOG', icon: <LogIcon /> },
  { to: '/history', label: 'HISTORY', icon: <HistoryIcon /> },
  { to: '/progress', label: 'PROGRESS', icon: <ProgressIcon /> },
  { to: '/exercises', label: 'EXERCISES', icon: <ExercisesIcon /> },
]

export default function BottomNav() {
  return (
    <nav className={styles.nav}>
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          <div className={styles.tab}>
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
          </div>
        </NavLink>
      ))}
    </nav>
  )
}

function LogIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none"/>
      <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 7 12 12 15 15"/>
    </svg>
  )
}

function ProgressIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="16" width="4" height="6"/>
      <rect x="10" y="10" width="4" height="12"/>
      <rect x="18" y="4" width="4" height="18"/>
    </svg>
  )
}

function ExercisesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}
