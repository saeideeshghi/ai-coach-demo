import { useEffect, useRef, useState } from 'react'
import alertIcon from '../../assets/coach/summary-alert.svg'
import documentIcon from '../../assets/coach/summary-document.svg'
import tipIcon from '../../assets/coach/summary-tip.svg'
import { ProgramChevron } from '../../components/ProgramChevron'
import { ProgramNavigation } from '../../components/ProgramNavigation/ProgramNavigation'
import { CoachCorrection, CoachCorrectionSaved } from './CoachCorrection'
import type { CoachService, CoachSummary, CoachView } from './coachSession'
import styles from './CoachSummaryPage.module.css'

export function CoachSummaryPage({ sessionId, service, view, onView, onHome, onExit, onPackage, onFollowup, onLearning, onHistory }: {
  sessionId: string
  service: CoachService
  view: Exclude<CoachView, 'room'>
  onView: (view: Exclude<CoachView, 'room'>) => void
  onHome: () => void
  onExit: () => void
  onPackage: () => void
  onFollowup: () => void
  onLearning: () => void
  onHistory: () => void
}) {
  const [summary, setSummary] = useState<CoachSummary>()
  const [submittedFromForm, setSubmittedFromForm] = useState(false)
  const [failed, setFailed] = useState(false)
  const title = useRef<HTMLHeadingElement>(null)
  const correctionButton = useRef<HTMLButtonElement>(null)
  const previousView = useRef(view)

  useEffect(() => {
    const controller = new AbortController()
    void service.getSummary(sessionId, controller.signal).then(result => {
      if (!controller.signal.aborted) setSummary(result)
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true)
    })
    return () => controller.abort()
  }, [sessionId, service])

  useEffect(() => {
    if (!summary) return
    if (view === 'summary' || (view === 'saved' && !summary.correction)) {
      if (previousView.current === 'summary') title.current?.focus({ preventScroll: true })
      else correctionButton.current?.focus({ preventScroll: true })
    }
    previousView.current = view
  }, [summary, view])

  const showSaved = view === 'saved' && Boolean(summary?.correction)
  useEffect(() => {
    if (view === 'saved' && summary && !showSaved) onView('summary')
  }, [onView, showSaved, summary, view])

  const modalOpen = view === 'correction' || showSaved

  if (!summary) {
    return <section className={styles.unavailable}>
      {failed ? <><p role="alert">جمع‌بندی جلسه در دسترس نیست.</p><button type="button" onClick={onExit}>بازگشت به خانه</button></>
        : <p role="status">در حال دریافت جمع‌بندی…</p>}
    </section>
  }

  const closeCorrection = () => {
    setSubmittedFromForm(false)
    onView('summary')
  }

  return (
    <>
      <section className={styles.screen} aria-labelledby="coach-summary-title" inert={modalOpen} aria-hidden={modalOpen || undefined}>
        <header className={styles.header}>
          <h1 id="coach-summary-title" ref={title} tabIndex={-1}>جمع‌بندی جلسهٔ رایگان</h1>
          <p>دغدغه‌های ثبت‌شده و پیشنهاد کوچ برای شروع برنامه</p>
        </header>

        <div className={styles.cards}>
          <div className={styles.identity}>
            <div className={styles.person}>
              {summary.participant.avatarUrl && <img width="34" height="34" src={summary.participant.avatarUrl} alt="" />}
              <div><strong>{summary.participant.name}</strong><small>{summary.participant.date}</small></div>
            </div>
            <div className={styles.subject}><small>موضوع گفت‌وگو</small><strong>{summary.subject}</strong></div>
          </div>

          <section className={styles.card}>
            <h2><img src={documentIcon} alt="" />خلاصهٔ جلسه</h2>
            <p>{summary.overview}</p>
          </section>

          <section className={`${styles.card} ${styles.concerns}`}>
            <h2><img src={alertIcon} alt="" />دغدغه‌های شناسایی‌شده</h2>
            <ul>{summary.concerns.map(concern => <li key={concern}>{concern}</li>)}</ul>
          </section>

          <section className={`${styles.card} ${styles.highlight}`}>
            <h2><img src={tipIcon} alt="" />پیشنهاد کوچ برای شروع</h2>
            <strong>{summary.recommendation.title}</strong>
            <p>{summary.recommendation.detail}</p>
            <p className={styles.footnote}>{summary.recommendation.footnote}</p>
          </section>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onPackage}><ProgramChevron />مشاهدهٔ بسته و تعرفه‌ها</button>
          <button type="button" ref={correctionButton} onClick={() => onView('correction')}><ProgramChevron />ثبت اصلاحیه</button>
        </div>
        <ProgramNavigation current="coaching" onHome={onHome} onFollowup={onFollowup} onLearning={onLearning} onHistory={onHistory} onCoaching={() => title.current?.focus()} />
      </section>
      {(view === 'correction' || (showSaved && submittedFromForm)) && <CoachCorrection sessionId={sessionId} service={service} covered={showSaved}
        initialNote={summary.correction ?? ''} onClose={closeCorrection} onSaved={(note) => {
          setSubmittedFromForm(true)
          setSummary({ ...summary, correction: note })
          onView('saved')
        }} />}
      {showSaved && <CoachCorrectionSaved onClose={closeCorrection} onPackage={onPackage} />}
    </>
  )
}

