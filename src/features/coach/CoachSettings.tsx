import { useEffect, useId, useRef, useState } from 'react'
import { useSheetMotion } from '../../components/ProgramSheet/useSheetMotion'
import motion from '../../components/ProgramSheet/sheetMotion.module.css'
import { CoachTouchPulse, VoiceWave } from './CoachIcons'
import { speeds } from './coachSession'
import type { CoachVoice, VoicePreferences } from './coachSession'
import styles from './CoachSettings.module.css'

const speedNames = ['آهسته', 'معمولی', 'سریع']
const format = new Intl.NumberFormat('fa-IR')

export function CoachSettings({ preferences, defaults, voices, onClose, onSave }: {
  preferences: VoicePreferences
  defaults: VoicePreferences
  voices: readonly CoachVoice[]
  onClose: () => void
  onSave: (value: VoicePreferences) => Promise<void>
}) {
  const { backdrop, panel, closing, exit } = useSheetMotion('slide', { panel: 200, backdrop: 165 })
  const [draft, setDraft] = useState(preferences)
  const [samplePlaying, setSamplePlaying] = useState(false)
  const [samplePulse, setSamplePulse] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const titleId = useId()
  const close = useRef<HTMLButtonElement>(null)
  const restore = useRef<HTMLButtonElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const voice = voices.find(({ id }) => id === draft.voice)

  useEffect(() => {
    const element = audio.current
    close.current?.focus({ preventScroll: true })
    return () => { element?.pause() }
  }, [])

  function update(value: VoicePreferences) {
    if (value.voice !== draft.voice) {
      audio.current?.pause()
      setSamplePlaying(false)
      setError('')
    }
    if (audio.current) audio.current.playbackRate = value.speed
    setDraft(value)
  }

  function playSample() {
    const element = audio.current
    if (!element || !voice?.sampleUrl) return
    if (!element.paused) {
      element.pause()
      return
    }
    setError('')
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setSamplePulse(true)
    if (element.getAttribute('src') !== voice.sampleUrl) element.src = voice.sampleUrl
    element.currentTime = 0
    element.playbackRate = draft.speed
    void element.play().catch((reason: unknown) => {
      if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError('پخش نمونهٔ صدا ممکن نشد.')
    })
  }

  function dismiss() {
    audio.current?.pause()
    exit(onClose)
  }

  async function save() {
    if (saving) return
    setSaving(true)
    setError('')
    audio.current?.pause()
    try {
      await onSave(draft)
      dismiss()
    } catch {
      setError('تنظیمات ذخیره نشد. دوباره تلاش کنید.')
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay + ' ' + motion.overlay} data-preset="audio" data-motion={closing ? 'closing' : undefined}>
      <div ref={backdrop} className={motion.backdrop} aria-hidden="true" />
      <section ref={panel} inert={closing} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className={styles.sheet + ' ' + motion.panel}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !saving) { event.preventDefault(); dismiss() }
          if (event.key === 'Tab') {
            if (event.shiftKey && event.target === close.current) { event.preventDefault(); restore.current?.focus() }
            else if (!event.shiftKey && event.target === restore.current) { event.preventDefault(); close.current?.focus() }
          }
        }}>
        <span className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <div><h2 id={titleId}>تنظیمات صدا</h2><p>گفت‌وگو را با صدای دلخواه‌تان ادامه دهید.</p></div>
          <button type="button" className={styles.close} ref={close} aria-label="بستن تنظیمات" onClick={dismiss} disabled={saving}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 4.5l9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <fieldset>
          <legend>صدای کوچ</legend>
          <div className={styles.voices}>
            {voices.map(({ id, name, description }) => (
              <label key={id}>
                <span>{name}<small>{description}</small></span>
                <input type="radio" name={titleId + '-voice'} checked={draft.voice === id}
                  onChange={() => update({ ...draft, voice: id })} />
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" className={styles.sample} disabled={!voice?.sampleUrl} onClick={playSample}>
          <VoiceWave />{samplePlaying ? 'توقف نمونه صدا' : 'شنیدن نمونه صدا'}
          {samplePulse && <CoachTouchPulse onEnd={() => setSamplePulse(false)} />}
        </button>
        {!voice?.sampleUrl && <p className={styles.notice} role="status">نمونهٔ صدای دوم در دمو موجود نیست.</p>}
        <audio ref={audio} preload="none" onPlaying={() => setSamplePlaying(true)}
          onPause={() => setSamplePlaying(false)} onEnded={() => setSamplePlaying(false)} />
        <fieldset>
          <legend>سرعت صحبت کوچ</legend>
          <div className={styles.speeds}>
            {speeds.map((speed, index) => (
              <label key={speed}>
                <input type="radio" name={titleId + '-speed'} checked={draft.speed === speed}
                  onChange={() => update({ ...draft, speed })} />
                <span>{format.format(speed)}× {speedNames[index]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className={styles.toggle}>
          <span>کاهش نویز میکروفون<small>صدای محیط کمتر به مکالمه وارد می‌شود</small></span>
          <input type="checkbox" role="switch" aria-label="کاهش نویز میکروفون"
            checked={draft.noise} onChange={(event) => update({ ...draft, noise: event.target.checked })} />
        </label>
        <label className={styles.toggle}>
          <span>نمایش متن مکالمه<small>متن پاسخ کوچ هم‌زمان نمایش داده شود</small></span>
          <input type="checkbox" role="switch" aria-label="نمایش متن مکالمه"
            checked={draft.transcript} onChange={(event) => update({ ...draft, transcript: event.target.checked })} />
        </label>
        {error && <p className={styles.notice} role="alert">{error}</p>}
        <button type="button" className={styles.save} disabled={saving} onClick={() => void save()}>ذخیره تنظیمات</button>
        <button ref={restore} type="button" className={styles.reset} disabled={saving} onClick={() => update(defaults)}>بازگرداندن تنظیمات پیش‌فرض</button>
      </section>
    </div>
  )
}
