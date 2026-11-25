import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ExitSheet } from './useSheetMotion'
import { useSheetMotion } from './useSheetMotion'
import motion from './sheetMotion.module.css'
import styles from './ProgramSheet.module.css'

export function ProgramSheet({ badge, title, description, variant, billing = false, entrance = 'slide', exitMotion, covered = false, onClose, children }: {
  badge: ReactNode
  title: string
  description: string
  variant: string
  billing?: boolean
  entrance?: 'slide' | 'fade'
  exitMotion?: 'slide' | 'fade'
  covered?: boolean
  onClose: () => void
  children: ReactNode | ((exit: ExitSheet, swap: ExitSheet) => ReactNode)
}) {
  const [entry] = useState(entrance)
  const { backdrop, panel, closing, exit, swap } = useSheetMotion(
    exitMotion ?? entry, exitMotion === 'fade' ? { panel: 200, backdrop: 200 } : undefined,
  )
  const titleRef = useRef<HTMLHeadingElement>(null)
  const titleId = useId()

  useEffect(() => { if (!covered) titleRef.current?.focus({ preventScroll: true }) }, [variant, covered])

  return (
    <div className={styles.overlay + ' ' + motion.overlay} data-entrance={entry}
      data-motion={closing ? 'closing' : undefined}
      data-action-status={variant.startsWith('action-') || undefined} aria-hidden={covered || undefined}>
      <div ref={backdrop} className={motion.backdrop} aria-hidden="true" />
      <section ref={panel} inert={closing || covered} className={styles.sheet + ' ' + motion.panel} data-sheet={variant} data-billing={billing || undefined} role="dialog" aria-modal="true"
        aria-labelledby={titleId} aria-describedby={titleId + '-description'}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            exit(onClose)
          }
          if (event.key !== 'Tab') return
          const focusable = event.currentTarget.querySelectorAll('button:enabled, textarea:enabled')
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (event.target === titleRef.current || event.target === (event.shiftKey ? first : last)) {
            event.preventDefault()
            const next = event.shiftKey ? last : first
            if (next instanceof HTMLElement) next.focus()
          }
        }}>
        <span className={styles.handle} aria-hidden="true" />
        <div key={variant + '-badge'} className={styles.badge} data-sheet-copy="" aria-hidden="true">
          {typeof badge === 'string' ? <img src={badge} alt="" width="68" height="68" /> : badge}
        </div>
        <h2 key={variant + '-title'} id={titleId} data-sheet-copy="" ref={titleRef} tabIndex={-1}>{title}</h2>
        <p key={variant + '-description'} id={titleId + '-description'} data-sheet-copy="">{description}</p>
        {typeof children === 'function' ? children(exit, swap) : children}
      </section>
    </div>
  )
}

