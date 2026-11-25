import { useRef, useState } from 'react'
import type { Course, LessonProgress } from './learning'
import styles from './Learning.module.css'

function time(seconds: number) {
  const whole = Math.floor(seconds)
  return [Math.floor(whole / 60), whole % 60].map(value => String(value).padStart(2, '0')).join(':')
}

export function LessonPlayer({ sample, initial, onProgress }: {
  sample: NonNullable<Course['sample']>
  initial: LessonProgress
  onProgress: (seconds: number, completed: boolean) => void
}) {
  const player = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [seconds, setSeconds] = useState(initial.completed ? 0 : initial.seconds)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [error, setError] = useState(false)

  const percent = duration > 0 ? Math.min(100, seconds / duration * 100) : 0

  function toggle() {
    const media = video.current
    if (!media) return
    if (media.paused) void media.play().catch(() => setError(true))
    else media.pause()
  }

  return <div className={styles.player} ref={player}>
    <video src={sample.source} poster={sample.poster} preload="metadata" playsInline ref={video} muted
      onLoadedMetadata={event => {
        const media = event.currentTarget
        setDuration(media.duration)
        if (!initial.completed && initial.seconds > 0) media.currentTime = Math.min(initial.seconds, Math.max(0, media.duration - 0.15))
      }}
      onPlaying={() => { setPlaying(true); setError(false) }}
      onPause={event => {
        setPlaying(false)
        if (event.currentTarget.currentTime > 0 && !event.currentTarget.ended) {
          onProgress(event.currentTarget.currentTime, false)
        }
      }}
      onTimeUpdate={event => {
        const current = event.currentTarget.currentTime
        setSeconds(current)
        if (current > 0 && !event.currentTarget.ended) onProgress(current, false)
      }}
      onEnded={event => {
        setPlaying(false)
        onProgress(event.currentTarget.duration, true)
      }}
      onError={() => setError(true)} />
    {!playing && <button className={styles.playOverlay} type="button" aria-label="پخش ویدیو" onClick={toggle}>
      <span className={styles.playIcon} aria-hidden="true" />
    </button>}
    {error && <p role="status" className={styles.playerError}>ویدیو در این مرورگر پخش نشد.</p>}
    <div className={styles.controls}>
      <button type="button" aria-label={playing ? 'توقف ویدیو' : 'پخش ویدیو'} onClick={toggle}>{playing ? 'Ⅱ' : '▶'}</button>
      <time>{time(seconds)}</time>
      <input type="range" min={0} max={duration || 1} step={0.05} value={seconds}
        aria-label="موقعیت پخش" aria-valuetext={time(seconds)} disabled={!duration}
        style={{ background: 'linear-gradient(90deg, #ff641f ' + percent + '%, #ffffff38 ' + percent + '%)' }}
        onChange={event => { if (video.current) video.current.currentTime = event.currentTarget.valueAsNumber }} />
      <button type="button" className={styles.speed} aria-label={`سرعت پخش ${speed} برابر`} onClick={() => {
        const nextSpeed = speed === 2 ? 1 : speed + 0.25
        if (video.current) video.current.playbackRate = nextSpeed
        setSpeed(nextSpeed)
      }}>{speed.toFixed(2).replace(/0$/, '')}×</button>
      <button type="button" aria-label="تمام‌صفحه" onClick={() => {
        const fullscreen = document.fullscreenElement ? document.exitFullscreen() : player.current?.requestFullscreen?.()
        void fullscreen?.catch(() => {})
      }}>
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor">
          <path d="M1 6V1h5m4 0h5v5m0 4v5h-5m-4 0H1v-5" />
        </svg>
      </button>
    </div>
  </div>
}
