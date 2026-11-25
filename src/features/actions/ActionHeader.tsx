import { useEffect, useRef } from 'react'
import { ProgramChevron } from '../../components/ProgramChevron'
import type { ActionItem } from './action'
import styles from './ActionFlow.module.css'

export function ActionIdentity({ action }: { action: ActionItem }) {
  return <section className={styles.identity} aria-label="اقدام جاری">
    <strong>{action.system}</strong>
    <p>{action.subsystem}</p>
    <h2>{action.title}</h2>
    <p>اقدام {action.position.toLocaleString('fa-IR')} از ۶ این زیرسیستم</p>
  </section>
}

export function ActionPageHeading({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus({ preventScroll: true }), [])
  return <header className={styles.pageHeader}>
    <button className={styles.back} type="button" aria-label="بازگشت" onClick={onBack}><ProgramChevron direction="right" /></button>
    <h1 ref={heading} tabIndex={-1}>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
  </header>
}
