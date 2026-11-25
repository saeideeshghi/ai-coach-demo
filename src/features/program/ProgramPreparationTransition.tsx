import { useEffect, useEffectEvent, useState } from 'react'
import styles from './ProgramPreparationTransition.module.css'

export function ProgramPreparationTransition({ readyAt, onDone }: { readyAt: number; onDone: () => void }) {
  const done = useEffectEvent(onDone)

  const [duration] = useState(() => Math.max(0, readyAt - Date.now()))

  useEffect(() => {
    const timer = window.setTimeout(done, Math.max(0, readyAt - Date.now()))
    return () => window.clearTimeout(timer)
  }, [readyAt])

  return (
    <div className={styles.overlay} role="status" aria-label="آماده‌سازی برنامه"
      style={{ '--preparation-time': duration + 'ms' } as React.CSSProperties}>
      <div className={styles.message}>
        <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>
        <strong>در حال آماده‌سازی برنامهٔ اختصاصی شما</strong>
        <p>برنامهٔ کوچینگ شما بر اساس جمع‌بندی جلسه و بستهٔ انتخابی در حال آماده‌سازی است.</p>
      </div>
    </div>
  )
}
