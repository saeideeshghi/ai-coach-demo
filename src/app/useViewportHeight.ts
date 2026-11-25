import { useLayoutEffect, useRef } from 'react'

export function useViewportHeight() {
  const appRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const app = appRef.current
    const viewport = window.visualViewport
    if (!app) return

    const syncHeight = () => {
      if (viewport && viewport.scale !== 1) return
      const height = viewport?.height || window.innerHeight
      if (height > 0) app.style.setProperty('--raya-app-height', Math.floor(height) + 'px')
    }

    syncHeight()
    viewport?.addEventListener('resize', syncHeight)
    window.addEventListener('resize', syncHeight)
    window.addEventListener('pageshow', syncHeight)
    return () => {
      viewport?.removeEventListener('resize', syncHeight)
      window.removeEventListener('resize', syncHeight)
      window.removeEventListener('pageshow', syncHeight)
    }
  }, [])

  return appRef
}
