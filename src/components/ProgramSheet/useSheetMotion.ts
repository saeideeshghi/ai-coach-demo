import { useEffect, useRef, useState } from 'react'

export type ExitSheet = (next: () => void) => void

export function useSheetMotion(exitStyle: 'slide' | 'fade' = 'slide', timing = { panel: 230, backdrop: 230 }) {
  const backdrop = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const running = useRef<Animation[]>(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => () => {
    const animations = running.current
    running.current = null
    animations?.forEach(animation => animation.cancel())
  }, [])

  const swap: ExitSheet = (next) => {
    if (running.current) return
    const sheet = panel.current
    if (!sheet?.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      next()
      return
    }
    const animations = Array.from(sheet.querySelectorAll('[data-sheet-copy]'), element =>
      element.animate([{ opacity: getComputedStyle(element).opacity }, { opacity: 0 }],
        { duration: 150, easing: 'ease-in', fill: 'forwards' }))
    running.current = animations
    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (running.current !== animations) return
      running.current = null
      next()
    })
  }

  const exit: ExitSheet = (next) => {
    const scrim = backdrop.current
    const sheet = panel.current
    if (running.current) return
    if (!scrim || !sheet || matchMedia('(prefers-reduced-motion: reduce)').matches || !sheet.animate) {
      next()
      return
    }

    const opacity = getComputedStyle(scrim).opacity
    const transform = getComputedStyle(sheet).transform
    const options = { duration: timing.panel, easing: 'cubic-bezier(.42, 0, 1, 1)', fill: 'forwards' } as const
    const sheetFrames = exitStyle === 'slide'
      ? [{ transform }, { transform: 'translateY(100%)' }]
      : [{ opacity: getComputedStyle(sheet).opacity }, { opacity: 0 }]
    const animations = [
      scrim.animate([{ opacity }, { opacity: 0 }], { ...options, duration: timing.backdrop, easing: 'ease-out' }),
      sheet.animate(sheetFrames, options),
    ]
    running.current = animations
    setClosing(true)
    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (running.current === animations) next()
    })
  }

  return { backdrop, panel, closing, exit, swap }
}
