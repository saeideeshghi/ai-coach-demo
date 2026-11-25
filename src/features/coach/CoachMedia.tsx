import { useEffect, useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'
import type { CoachSession } from './coachSession'
import styles from './CoachRoom.module.css'

export type Playback = 'ready' | 'loading' | 'playing' | 'paused' | 'finished' | 'error'

export type CoachMediaControls = {
  play: () => Promise<void>
  pause: () => void
  isPlaying: () => boolean
}

export function CoachMedia({ media, ref, showChatPoster, onPlayback, onPosition }: {
  media: CoachSession['media']
  ref: Ref<CoachMediaControls>
  showChatPoster: boolean
  onPlayback: (state: Playback) => void
  onPosition: (seconds: number) => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const failed = useRef(false)
  const requested = useRef(false)

  useImperativeHandle(ref, () => ({
    async play() {
      const element = video.current
      if (!element) throw new Error('Coach player unavailable')
      if (element.error) element.load()
      if (element.ended) element.currentTime = 0
      requested.current = true
      failed.current = false
      await element.play()
    },
    pause() {
      video.current?.pause()
    },
    isPlaying() {
      const element = video.current
      return Boolean(element && !element.paused && !element.ended)
    },
  }), [])

  useEffect(() => {
    const element = video.current
    return () => { element?.pause() }
  }, [])

  return (
    <>
      <video
        className={styles.video}
        ref={video}
        src={media.videoUrl}
        poster={media.posterUrl}
        preload="none"
        playsInline
        disablePictureInPicture
        aria-hidden="true"
        onPlaying={() => onPlayback('playing')}
        onTimeUpdate={({ currentTarget }) => onPosition(currentTarget.currentTime)}
        onSeeked={({ currentTarget }) => onPosition(currentTarget.currentTime)}
        onWaiting={(event) => { if (!event.currentTarget.paused) onPlayback('loading') }}
        onPause={(event) => {
          if (requested.current && !event.currentTarget.ended && !failed.current) onPlayback('paused')
        }}
        onEnded={() => onPlayback('finished')}
        onError={() => {
          failed.current = true
          onPlayback('error')
        }}
      />
      {showChatPoster && <img className={styles.chatPoster} src={media.chatPosterUrl} alt="" />}
    </>
  )
}
