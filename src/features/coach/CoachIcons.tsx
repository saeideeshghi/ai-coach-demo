import styles from './CoachRoom.module.css'
import type { CSSProperties } from 'react'

const paths = {
  mic: 'M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0z M5 10v1a7 7 0 0 0 14 0v-1 M12 18v4 M8 22h8',
  chat: 'M3 5h18v14H3z M6 9h2m2 0h2m2 0h2m2 0h1 M6 13h2m2 0h2m2 0h2m2 0h1 M8 16h8',
  settings: 'M10 2h4l.6 3 2.5 1 2.7-1.6 2 3.5-2.1 2.1v3l2.1 2.1-2 3.5-2.7-1.6-2.5 1-.6 3h-4l-.6-3-2.5-1-2.7 1.6-2-3.5 2.1-2.1v-3L2.2 7.9l2-3.5L7 6l2.4-1z M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z',
  back: 'M9 4l8 8-8 8',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9v-2a7 6 0 0 1 16 0v2Z',
} as const

export function CoachIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  )
}

export function VoiceWave({ moving = false, level }: { moving?: boolean; level?: number }) {
  return (
    <svg className={styles.wave} data-moving={moving} data-speech-level={level}
      style={level === undefined ? undefined : { '--wave-level': level } as CSSProperties} aria-hidden="true"
      viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 15v6" />
      <path d="M10 8v20" />
      <path d="M18 2v32" />
      <path d="M26 8v20" />
      <path d="M33 15v6" />
    </svg>
  )
}

export function CoachTouchPulse({ onEnd }: { onEnd: () => void }) {
  return <span className={styles.touchPulse} data-voice-pulse="" aria-hidden="true" onAnimationEnd={onEnd} />
}
