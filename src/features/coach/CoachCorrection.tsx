import { useEffect, useRef, useState } from 'react'
import correctionBadge from '../../assets/coach/correction-badge.svg'
import savedBadge from '../../assets/coach/correction-saved-badge.svg'
import { ProgramChevron } from '../../components/ProgramChevron'
import { ProgramSheet } from '../../components/ProgramSheet/ProgramSheet'
import type { CoachService } from './coachSession'
import styles from './CoachCorrection.module.css'

export function CoachCorrection({ sessionId, service, initialNote, covered = false, onSaved, onClose }: {
  sessionId: string
  service: CoachService
  initialNote: string
  covered?: boolean
  onSaved: (note: string) => void
  onClose: () => void
}) {
  const [note, setNote] = useState(initialNote)
  const [invalid, setInvalid] = useState(false)
  const [failed, setFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const request = useRef<AbortController>(null)
  const input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => () => request.current?.abort(), [])

  async function save() {
    const value = note.trim()
    if (!value) {
      setInvalid(true)
      input.current?.focus()
      return
    }
    if (request.current) return
    const controller = new AbortController()
    request.current = controller
    setSaving(true)
    setFailed(false)
    try {
      await service.saveCorrection(sessionId, value, controller.signal)
      if (!controller.signal.aborted) onSaved(value)
    } catch {
      if (!controller.signal.aborted) setFailed(true)
    } finally {
      if (!controller.signal.aborted) setSaving(false)
      request.current = null
    }
  }

  return (
    <ProgramSheet badge={correctionBadge} variant="correction" covered={covered} onClose={onClose}
      title="ثبت نکته دربارهٔ جمع‌بندی"
      description="اگر بخشی از جمع‌بندی با دغدغه‌های شما هم‌خوان نیست، توضیح خود را ثبت کنید.">
      {exit => <form className={styles.form} noValidate onSubmit={(event) => { event.preventDefault(); void save() }}>
        <div className={styles.field}>
          <label htmlFor="correction-note">توضیح شما</label>
          <textarea id="correction-note" ref={input} value={note} maxLength={1000} required dir="rtl"
            aria-invalid={invalid} aria-describedby={invalid || failed ? 'correction-error' : undefined}
            placeholder="مثلاً اولویت من روشن‌کردن مسئولیت‌های تیم فروش است."
            onChange={(event) => { setNote(event.currentTarget.value); setInvalid(false); setFailed(false) }} />
        </div>
        {(invalid || failed) && <p className={styles.error} id="correction-error" role="alert">
          {invalid ? 'توضیح خود را وارد کنید.' : 'یادداشت ثبت نشد. دوباره تلاش کنید.'}
        </p>}
        <div className={styles.actions}>
          <button type="submit" disabled={saving}><ProgramChevron />{saving ? 'در حال ثبت…' : 'ثبت یادداشت'}</button>
          <button type="button" onClick={() => exit(onClose)}>انصراف</button>
        </div>
      </form>}
    </ProgramSheet>
  )
}

export function CoachCorrectionSaved({ onPackage, onClose }: {
  onPackage: () => void
  onClose: () => void
}) {
  return (
    <ProgramSheet badge={savedBadge} variant="saved" onClose={onClose} title="یادداشت شما ثبت شد"
      description="یادداشت در کنار جمع‌بندی اولیه برای کوچ ثبت شد.">
      {exit => <div className={styles.saved}>
        <button type="button" onClick={() => exit(onPackage)}><ProgramChevron />مشاهدهٔ بسته و تعرفه‌ها</button>
        <button type="button" onClick={() => exit(onClose)}>بازگشت به جمع‌بندی</button>
      </div>}
    </ProgramSheet>
  )
}

