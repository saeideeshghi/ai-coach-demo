import { useEffect, useRef } from 'react'
import badge from '../../assets/coach/session-complete.svg'
import { useSheetMotion } from '../../components/ProgramSheet/useSheetMotion'
import motion from '../../components/ProgramSheet/sheetMotion.module.css'
import styles from './CoachComplete.module.css'

export function CoachComplete({ onSummary, onLater }: { onSummary: () => void; onLater: () => void }) {
  const { backdrop, panel, closing, exit } = useSheetMotion()
  const title = useRef<HTMLHeadingElement>(null)
  const summary = useRef<HTMLButtonElement>(null)
  const later = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    title.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className={styles.overlay + ' ' + motion.overlay} data-preset="complete" data-motion={closing ? 'closing' : undefined}>
      <div ref={backdrop} className={motion.backdrop} aria-hidden="true" />
      <section ref={panel} inert={closing} className={styles.sheet + ' ' + motion.panel} role="dialog" aria-modal="true" aria-labelledby="coach-end-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); exit(onLater) }
          if (event.key === 'Tab') {
            const edge = event.shiftKey ? summary.current : later.current
            if (event.target === edge || event.target === title.current) {
              event.preventDefault()
              const next = event.shiftKey ? later.current : summary.current
              next?.focus()
            }
          }
        }}>
        <span className={styles.handle} aria-hidden="true" />
        <img className={styles.badge} src={badge} alt="" width="68" height="68" />
        <h2 tabIndex={-1} ref={title} id="coach-end-title">جلسهٔ رایگان شما به پایان رسید.</h2>
        <p>گفت‌وگوی شما با کوچ به پایان رسید. جمع‌بندی جلسه و پیشنهادهای مسیر بعدی آمادهٔ بررسی است.</p>
        <div className={styles.actions}>
          <button type="button" ref={summary} onClick={() => exit(onSummary)}>مشاهدهٔ جمع‌بندی جلسه</button>
          <button type="button" ref={later} onClick={() => exit(onLater)}>بعداً انجام می‌دهم</button>
        </div>
      </section>
    </div>
  )
}
