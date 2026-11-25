import { useEffect, useEffectEvent } from 'react'
import topLeft from './raya-mark-top-left.png'
import topRight from './raya-mark-top-right.png'
import bottomLeft from './raya-mark-bottom-left.png'
import bottomRight from './raya-mark-bottom-right.png'
import wordmark from './raya-wordmark.svg'
import tagline from './tagline.svg'
import credit from './splash-credit.svg'
import styles from './OpeningSplash.module.css'

type OpeningSplashProps = {
  onComplete?: () => void
}

const cycleMs = 5000
const pieces = [
  { source: topLeft, className: styles.topLeft },
  { source: topRight, className: styles.topRight },
  { source: bottomLeft, className: styles.bottomLeft },
  { source: bottomRight, className: styles.bottomRight },
]

export function OpeningSplash({ onComplete }: OpeningSplashProps) {
  const complete = useEffectEvent(() => onComplete?.())
  const hasCompletionHandler = Boolean(onComplete)

  useEffect(() => {
    if (!hasCompletionHandler) return
    const timer = window.setTimeout(complete, cycleMs)
    return () => window.clearTimeout(timer)
  }, [hasCompletionHandler])

  return (
    <section
      className={styles.splash}
      aria-label="شروع رایا"
      style={{ '--opening-duration': `${cycleMs}ms` } as React.CSSProperties}
    >
      {/* Brand assembly, title, and tagline */}
      <div className={styles.brand}>
        <div className={styles.mark} aria-hidden="true">
          {pieces.map(({ source, className }) => (
            <img key={source} src={source} alt="" className={className} />
          ))}
        </div>
        <h1 className={styles.name} lang="en">
          <img src={wordmark} alt="AI Business Coaching" />
        </h1>
        <img
          className={styles.tagline}
          src={tagline}
          alt="Smarter People, Stronger Businesses"
          lang="en"
        />
      </div>
      {/* Credit and loading share the same visual center. */}
      <div className={styles.footer}>
        <img
          className={styles.credit}
          src={credit}
          alt="Copyright by CEO Master"
          lang="en"
        />
        <div className={styles.loading} aria-hidden="true" />
      </div>
    </section>
  )
}
