import { useEffect, useRef, useState } from 'react'
import { CoachChat } from './CoachChat'
import { CoachComplete } from './CoachComplete'
import { CoachIcon, CoachTouchPulse, VoiceWave } from './CoachIcons'
import { CoachMedia } from './CoachMedia'
import type { CoachMediaControls, Playback } from './CoachMedia'
import { CoachSettings } from './CoachSettings'
import type { CoachMessage, CoachService, CoachSession, VoicePreferences } from './coachSession'
import styles from './CoachRoom.module.css'

const playbackText: Record<Playback, string> = {
  ready: 'در حال ورود به جلسه…',
  loading: 'در حال آماده‌سازی…',
  playing: 'در حال گفت‌وگو',
  paused: 'مکالمه متوقف است',
  finished: 'نمونهٔ مکالمه تمام شد',
  error: 'خطای پخش',
}

function CoachRoom({ session, service, onExit, onSummary }: {
  session: CoachSession
  service: CoachService
  onExit: () => void
  onSummary: () => void
}) {
  const [view, setView] = useState<'voice' | 'chat'>('voice')
  const [playback, setPlayback] = useState<Playback>('ready')
  const [position, setPosition] = useState(0)
  const [touchPulse, setTouchPulse] = useState(false)
  const [preferences, setPreferences] = useState(session.preferences)
  const [settings, setSettings] = useState(false)
  const [messages, setMessages] = useState(session.messages)
  const [draft, setDraft] = useState('')
  const [replyPending, setReplyPending] = useState(false)
  const [replyError, setReplyError] = useState('')
  const [started, setStarted] = useState(false)
  const [ending, setEnding] = useState(false)
  const [ended, setEnded] = useState(false)
  const [actionError, setActionError] = useState('')
  const media = useRef<CoachMediaControls>(null)
  const lifetime = useRef<AbortController | null>(null)
  const reply = useRef<AbortController | null>(null)
  const startRequest = useRef<Promise<void> | null>(null)
  const resumeOnClose = useRef(false)
  const restoreFocus = useRef(false)
  const settingsButton = useRef<HTMLButtonElement>(null)
  const chatButton = useRef<HTMLButtonElement>(null)
  const restoreChatFocus = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    lifetime.current = controller
    return () => {
      controller.abort()
      reply.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!settings && restoreFocus.current) {
      restoreFocus.current = false
      settingsButton.current?.focus({ preventScroll: true })
    }
  }, [settings])

  useEffect(() => {
    if (view === 'voice' && restoreChatFocus.current) {
      restoreChatFocus.current = false
      chatButton.current?.focus({ preventScroll: true })
    }
  }, [view])

  function closeChat() {
    restoreChatFocus.current = true
    setView('voice')
  }

  function start(signal: AbortSignal) {
    if (!startRequest.current) {
      startRequest.current = service.start(session.id, signal).then(() => {
        if (!signal.aborted) setStarted(true)
      }).catch((error: unknown) => {
        startRequest.current = null
        throw error
      })
    }
    return startRequest.current
  }

  function play() {
    const player = media.current
    const signal = lifetime.current?.signal
    if (!player || !signal || signal.aborted) return
    setPlayback('loading')
    void Promise.all([player.play(), start(signal)]).catch((error: unknown) => {
      if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return
      player.pause()
      setPlayback('error')
    })
  }

  function toggle() {
    if (playback === 'playing') media.current?.pause()
    else {
      if (playback === 'ready' && !matchMedia('(prefers-reduced-motion: reduce)').matches) setTouchPulse(true)
      play()
    }
  }

  function openSettings() {
    const player = media.current
    resumeOnClose.current = player?.isPlaying() ?? false
    player?.pause()
    setSettings(true)
  }

  function closeSettings() {
    restoreFocus.current = true
    setSettings(false)
    if (resumeOnClose.current) {
      resumeOnClose.current = false
      play()
    }
  }

  async function saveSettings(value: VoicePreferences) {
    const signal = lifetime.current?.signal
    if (!signal) return
    const saved = await service.savePreferences(session.id, value, signal)
    if (signal.aborted) return
    setPreferences(saved)
  }

  async function send() {
    const text = draft.trim()
    const signal = lifetime.current?.signal
    if (!text || reply.current || !signal || signal.aborted) return
    const controller = new AbortController()
    const message: CoachMessage = {
      id: crypto.randomUUID(),
      author: 'user',
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      text,
    }
    reply.current = controller
    setDraft('')
    setReplyError('')
    setReplyPending(true)
    setMessages((items) => [...items, message])
    try {
      await start(signal)
      const answer = await service.sendMessage(session.id, text, controller.signal)
      if (!controller.signal.aborted) setMessages((items) => [...items, answer])
    } catch {
      if (!controller.signal.aborted) {
        setMessages((items) => items.filter(({ id }) => id !== message.id))
        setDraft((current) => current || text)
        setReplyError('ارسال پیام ممکن نشد. دوباره تلاش کنید.')
      }
    } finally {
      if (!controller.signal.aborted) setReplyPending(false)
      if (reply.current === controller) reply.current = null
    }
  }

  async function end() {
    const signal = lifetime.current?.signal
    if (ending || !signal) return
    setEnding(true)
    setActionError('')
    media.current?.pause()
    try {
      await service.end(session.id, signal)
      if (signal.aborted) return
      reply.current?.abort()
      setReplyPending(false)
      setEnded(true)
    } catch {
      if (!signal.aborted) setActionError('پایان جلسه ثبت نشد. دوباره تلاش کنید.')
    } finally {
      if (!signal.aborted) setEnding(false)
    }
  }

  const busy = playback === 'loading'
  const active = playback === 'playing'
  const levels = session.media.speechLevels
  const sample = Math.floor(position * 4)
  const showWave = active && (!levels || sample >= levels.findIndex(level => level > 0))
  const voiceLabel = active ? 'مکث مکالمه' : playback === 'error' ? 'تلاش دوباره'
    : playback === 'finished' ? 'بازپخش مکالمه' : playback === 'paused' ? 'ادامه مکالمه' : 'شروع مکالمه'

  return (
    <section className={styles.room} aria-label="اتاق کوچ" data-mode={view} data-playback={playback}>
      <CoachMedia
        ref={media}
        media={session.media}
        showChatPoster={view === 'chat' && playback === 'ready'}
        onPosition={setPosition}
        onPlayback={(state) => {
          setPlayback(previous => previous === 'error' && state === 'paused' ? previous : state)
          if (state === 'finished') void end()
        }}
      />
      <div className={styles.content} inert={settings || ended}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && view === 'chat') {
            event.preventDefault()
            closeChat()
          }
        }}>
        {view === 'chat' && (
          <button type="button" className={styles.chatBackdrop} aria-label="بستن چت"
            tabIndex={-1} onClick={closeChat} />
        )}
        <header className={styles.bar}>
          <button type="button" className={styles.back}
            aria-label={started ? 'پایان جلسه' : 'بازگشت'} disabled={ending}
            onClick={started ? () => void end() : onExit}>
            <CoachIcon name="back" />
          </button>
          <span className={styles.status} role="status"><i aria-hidden="true" />{view === 'chat' && playback === 'ready' ? 'گفت‌وگوی آزمایشی' : playbackText[playback]}</span>
        </header>
        {actionError && <p className={styles.actionError} role="alert">{actionError}</p>}
        {view === 'chat' ? (
          <CoachChat messages={messages} draft={draft} pending={replyPending} error={replyError}
            onDraft={setDraft} onSend={() => void send()} onVoice={closeChat} />
        ) : (
          <div className={styles.voice}>
            {playback === 'ready' && <p className={styles.prompt}><VoiceWave /><span>برای شروع مکالمه، کلیک کنید.<small>من آماده‌ام با شما صحبت کنم</small></span></p>}
            {playback === 'error' && <p className={styles.prompt} role="alert"><span>پخش ویدیوی دمو ممکن نشد.</span></p>}
            <div className={styles.controls}>
              <button type="button" className={styles.side} ref={settingsButton} onClick={openSettings}>
                <span><CoachIcon name="settings" /></span>تنظیمات صدا
              </button>
              <button type="button" className={styles.voiceButton} aria-label={voiceLabel} disabled={busy} onClick={toggle}>
                {showWave ? <VoiceWave moving level={levels ? levels[sample] ?? 0 : undefined} /> : <CoachIcon name="mic" />}
                {touchPulse && <CoachTouchPulse onEnd={() => setTouchPulse(false)} />}
              </button>
              <button type="button" className={styles.side} ref={chatButton} onClick={() => setView('chat')}>
                <span><CoachIcon name="chat" /></span>صفحه چت
              </button>
            </div>
          </div>
        )}
      </div>
      {settings && (
        <CoachSettings preferences={preferences} defaults={session.defaults} voices={session.voices}
          onClose={closeSettings} onSave={saveSettings} />
      )}
      {ended && <CoachComplete onSummary={onSummary} onLater={onExit} />}
    </section>
  )
}

export function CoachSessionPage({ sessionId, service, onExit, onSummary }: {
  sessionId: string
  service: CoachService
  onExit: () => void
  onSummary: () => void
}) {
  const [session, setSession] = useState<CoachSession>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    void service.open(sessionId, controller.signal).then((value) => {
      if (!controller.signal.aborted) setSession(value)
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true)
    })
    return () => controller.abort()
  }, [sessionId, service])

  if (!session) {
    return <section className={styles.unavailable}>
      {failed ? <><p role="alert">جلسهٔ کوچ پیدا نشد.</p><button type="button" onClick={onExit}>بازگشت به پرسش‌نامه</button></>
        : <p role="status">در حال آماده‌سازی اتاق کوچ…</p>}
    </section>
  }

  return <CoachRoom session={session} service={service} onExit={onExit} onSummary={onSummary} />
}
