import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ProgramChevron } from '../../components/ProgramChevron'
import { ScrollArea } from '../../components/ScrollArea/ScrollArea'
import styles from './RecordPages.module.css'

export function RecordPage({ title, subtitle, onBack, children, footer, nav, endBack, onCalendar, view }: {
  title: string
  subtitle?: string
  onBack: () => void
  children: ReactNode
  footer?: ReactNode
  nav?: ReactNode
  endBack?: boolean
  view?: string
  onCalendar?: () => void
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => titleRef.current?.focus({ preventScroll: true }), [title])
  return <section className={styles.page} data-view={view} data-with-nav={nav ? '' : undefined}>
    <ScrollArea className={styles.scroll}>
      <header className={styles.heading} data-history={onCalendar ? '' : undefined}>
        <button type="button" className={styles.back} data-end={endBack || undefined} aria-label="بازگشت" onClick={onBack}>
          <ProgramChevron direction={endBack ? 'left' : 'right'} />
        </button>
        {onCalendar && (
          <button type="button" className={styles.calendarButton} aria-label="تقویم جلسات" onClick={onCalendar}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="4" y="6" width="16" height="15" rx="2" /><path d="M8 3v6m8-6v6M4 11h16" />
            </svg>
          </button>
        )}
        <h1 ref={titleRef} tabIndex={-1}>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className={styles.content}>{children}</div>
    </ScrollArea>
    {footer && <footer className={styles.footer}>{footer}</footer>}
    {nav}
  </section>
}
