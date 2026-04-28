import styles from './TopBar.module.css'

export default function TopBar() {
  return (
    <header className={styles.bar}>
      <DumbbellIcon />
      <span className={styles.logo}>GYMLOG</span>
      <UserIcon />
    </header>
  )
}

function DumbbellIcon() {
  return (
    <svg className={styles.icon} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4"/>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className={styles.icon} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}
