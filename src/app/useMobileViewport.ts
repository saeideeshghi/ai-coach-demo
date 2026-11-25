import { useLayoutEffect, useRef } from 'react'

// Upper bound of the approved unscaled mobile composition. Some Android
// browsers expose a wider CSS viewport for the same physical screen.
const mobileCompositionWidth = 412

export function useMobileViewport() {
  const appRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const app = appRef.current
    const viewport = window.visualViewport
    if (!app) return

    const syncViewport = () => {
      if (viewport && viewport.scale !== 1) return
      const height = viewport?.height || window.innerHeight
      if (height <= 0) return
      app.style.setProperty('--raya-app-height', height + 'px')
      app.style.setProperty('--raya-app-offset-top', (viewport?.offsetTop ?? 0) + 'px')
      app.style.setProperty('--raya-mobile-density', String(Math.max(1, app.clientWidth / mobileCompositionWidth)))
    }

    syncViewport()
    viewport?.addEventListener('resize', syncViewport)
    viewport?.addEventListener('scroll', syncViewport)
    window.addEventListener('resize', syncViewport)
    window.addEventListener('pageshow', syncViewport)
    return () => {
      viewport?.removeEventListener('resize', syncViewport)
      viewport?.removeEventListener('scroll', syncViewport)
      window.removeEventListener('resize', syncViewport)
      window.removeEventListener('pageshow', syncViewport)
    }
  }, [])

  return appRef
}
