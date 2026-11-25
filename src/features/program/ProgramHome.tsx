import { ScrollArea } from '../../components/ScrollArea/ScrollArea'
import { CompletionMark } from '../../components/CompletionMark'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import actionClock from '../../assets/program/home-action-clock.svg'
import documentIcon from '../../assets/coach/summary-document.svg'
import avatar from '../../assets/coach/summary-profile.png'
import startBadge from '../../assets/coach/start-badge.svg'
import { ProgramChevron } from '../../components/ProgramChevron'
import { ProgramNavigation } from '../../components/ProgramNavigation/ProgramNavigation'
import { ProgramSheet } from '../../components/ProgramSheet/ProgramSheet'
import type { ProgramScenario } from '../../fixtures/programProgress'
import type { ActionStatus } from '../actions/action'
import { VoiceWave } from '../coach/CoachIcons'
import bell from './home-bell.svg'
import chat from './home-chat.svg'
import menu from './home-menu.svg'
import { ProgramPreparationTransition } from './ProgramPreparationTransition'
import styles from './ProgramHome.module.css'

const menuEntries = [
  ['calendar', 'تقویم جلسات'],
  ['notes', 'یادداشت‌های من'],
  ['notifications', 'مرکز اعلان‌ها'],
  ['account', 'حساب کاربری'],
  ['report', 'گزارش نهایی'],
] as const
export type HomeDestination = (typeof menuEntries)[number][0]

const milestones = ['شناخت وضعیت', 'تدوین اهداف', 'اقدامات پیشنهادی', 'پیگیری و نتایج']

function DocumentIcon() {
  return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M5 2h9l5 5v15H5z M14 2v6h5 M8 12h8 M8 16h8" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

function ClockIcon() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" />
    <path d="M8 5v3l2 1.5" stroke="currentColor" strokeLinecap="round" />
  </svg>
}

export function ProgramHome({ completed, preparing, active, starting, preparationReadyAt, onOpenCoach, onStart, onClose, onPreparationEnd, actionStatus, nextAction, onOpenAction, onFollowup, onLearning, onHistory, scenario, onOpenRecords, onChat }: {
  completed: boolean
  preparing: boolean
  active: boolean
  actionStatus: ActionStatus
  nextAction: boolean
  onOpenAction: () => void
  onFollowup: () => void
  onLearning: () => void
  onHistory: () => void
  scenario?: ProgramScenario
  onOpenRecords: (page: HomeDestination) => void
  onChat: () => void
  starting: boolean
  preparationReadyAt?: number
  onPreparationEnd: () => void
  onOpenCoach: () => void
  onStart: () => void
  onClose: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const programComplete = scenario === 'complete'
  const oneSystem = scenario === 'one-system'
  const returning = scenario === 'resume'
  function openRecords(destination: HomeDestination) {
    setMenuOpen(false)
    onOpenRecords(destination)
  }

  const homeContent = useRef<HTMLDivElement>(null)
  const covered = starting || preparationReadyAt !== undefined
  const awaitingProgram = preparing && !active
  const actionUnderReview = actionStatus !== 'current'
  const actionTitle = actionStatus === 'revision' ? 'مشاهدهٔ بازخورد کوچ' : actionUnderReview ? 'مشاهدهٔ وضعیت'
    : nextAction ? 'مشاهدهٔ اقدام بعدی' : 'ادامهٔ اقدام'
  const title = programComplete ? 'مشاهدهٔ گزارش نهایی' : oneSystem ? 'مشاهدهٔ وضعیت سیستم‌ها'
    : returning ? 'ادامهٔ مسیر' : active ? actionTitle : awaitingProgram ? 'مشاهدهٔ جمع‌بندی جلسه'
      : completed ? 'جمع‌بندی و پیشنهاد کوچ' : 'شروع جلسهٔ رایگان با کوچ'
  return (
    <>
      <section className={styles.screen} data-preparing={awaitingProgram || undefined} data-active={active || undefined} data-action-review={(actionUnderReview || nextAction || programComplete || oneSystem || returning) || undefined} inert={covered} aria-hidden={covered || undefined}>
        <ScrollArea className={styles.content} contentClassName={styles.homeBackground} ref={homeContent}>
          <header className={styles.hero}>
            <div className={styles.tools}>
              <button type="button" aria-label="منوی برنامه" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
                <img src={menu} alt="" width="22" height="22" />
              </button>
              <div className={styles.profile}>
                <button type="button" className={styles.avatarButton} aria-label="حساب کاربری" onClick={() => openRecords('account')}>
                  <img src={avatar} alt="" width="31" height="31" />
                </button>
                <button type="button" aria-label="گفت‌وگو با کوچ" onClick={onChat}><img src={chat} alt="" width="23" height="23" /></button>
                <button type="button" aria-label="اعلان‌ها" onClick={() => openRecords('notifications')}><img src={bell} alt="" width="23" height="23" /></button>
              </div>
            </div>
            {menuOpen && <div className={styles.menu} aria-label="دسترسی‌های برنامه">
              {menuEntries.filter(([id]) => id !== 'report' || programComplete).map(([id, label]) => (
                <button key={id} type="button" onClick={() => openRecords(id)}>{label}<ProgramChevron /></button>
              ))}
            </div>}
            <h1>سامان عزیز<br /><span>خوش آمدید!</span></h1>
            <p>{programComplete ? 'برنامهٔ هفت سیستم شما به پایان رسید.' : returning ? 'از همان اقدام قبلی ادامه دهید.' : active ? 'برنامهٔ اختصاصی شما در جریان است.' : awaitingProgram ? 'پرداخت تأیید شد و برنامه در حال آماده‌سازی است.' : completed ? 'گام بعدی مسیر رشد کسب‌وکارتان را ببینید.' : 'مسیر رشد کسب‌وکارتان را آغاز کنید.'}</p>
            <button type="button" className={styles.coach} onClick={programComplete ? () => openRecords('report') : active ? onOpenAction : onOpenCoach}>
              <span className={styles.coachIcon}>{active && !actionUnderReview && !programComplete && !oneSystem && !returning ? <img src={actionClock} alt="" width="42" height="42" /> : completed ? <DocumentIcon /> : <VoiceWave />}</span>
              <span className={styles.coachLabel}>{title}</span><ProgramChevron />
            </button>
          </header>
          <section className={styles.roadmap} data-finished={programComplete || undefined} aria-label="راهنمای مسیر شما">
            <h2>راهنمای مسیر شما</h2>
            <ol>
              {milestones.map((milestone, index) => <li key={milestone}
                aria-current={!programComplete && index === (active ? 1 : 0) ? 'step' : undefined}>
                <span className={styles.marker} data-completed={programComplete || (completed && index === 0) || (active && index === 1)}
                  aria-hidden="true">
                  {(programComplete || (completed && index === 0) || (active && index === 1)) && <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                    <path d="m2 6 2.5 2.5L10 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>}
                </span>{milestone}
              </li>)}
            </ol>
          </section>
          {awaitingProgram && <div className={styles.preparingCards}>
            <section>
              <h2><span aria-hidden="true"><ClockIcon /></span>در حال آماده‌سازی برنامهٔ اختصاصی</h2>
              <strong>بستهٔ جامع هفت سیستم</strong>
              <p>برنامه بر اساس جمع‌بندی جلسه و نیازهای کسب‌وکار شما آماده می‌شود.</p>
            </section>
            <section>
              <h2><img src={documentIcon} alt="" />جلسهٔ رایگان</h2>
              <p>جمع‌بندی جلسه آمادهٔ مشاهده است.</p>
            </section>
          </div>}
          {programComplete && <div className={styles.activeCards}>
            <section className={styles.completedBanner}>
              <h2><CompletionMark />برنامهٔ هفت سیستم تکمیل شد</h2>
              <p>نتایج، دستاوردها و اولویت‌های بعدی در گزارش نهایی ثبت شده‌اند.</p>
            </section>
            <section><h2>آخرین فعالیت‌ها</h2><ul><li>تکمیل برنامهٔ جامع هفت سیستم <span>تکمیل شد</span></li></ul></section>
          </div>}
          {active && !programComplete && <div className={styles.activeCards}>
            <section>
              <header><h2>{oneSystem ? 'آخرین سیستم تکمیل‌شده' : 'سیستم جاری'}</h2><small>{oneSystem ? '۱' : '۰'} از ۷ سیستم تکمیل شده</small></header>
              <strong>مبانی سیستم مدیریت کسب‌وکار</strong>
              {!oneSystem && <>
                <p>زیرسیستم · توافق‌نامه‌های نقش، مسئولیت و نتایج مورد انتظار</p>
                <small>{nextAction ? '۲ از ۶ اقدام این زیرسیستم انجام شده' : '۱ از ۴ اقدام این زیرسیستم انجام شده'}</small>
              </>}
            </section>
            <section>
              <header><h2><ClockIcon />فعالیت‌های اخیر</h2><button type="button" onClick={onFollowup}>مشاهدهٔ همه</button></header>
              <ul>
                <li>اتمام جلسهٔ رایگان <span>تکمیل شد</span></li>
                <li>تحلیل وضعیت فعلی تیم <span>تکمیل شد</span></li>
                <li>مقایسهٔ نقش‌های فعلی با ساختار مطلوب <span>{nextAction || oneSystem ? 'تکمیل شد' : actionStatus === 'revision' ? 'نیازمند اصلاح' : actionUnderReview ? 'در بررسی' : 'در جریان'}</span></li>
                <li>تعیین شاخص‌های ارزیابی عملکرد <span>{oneSystem ? 'تکمیل شد' : nextAction ? 'در جریان' : 'پیش‌رو'}</span></li>
              </ul>
            </section>
          </div>}
          {completed && !preparing && !active && <section className={styles.activities}>
            <h2><svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.25" stroke="currentColor" />
              <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeLinecap="round" />
            </svg>فعالیت‌های اخیر</h2>
            <table>
              <thead><tr><th scope="col">فعالیت</th><th scope="col">زمان</th><th scope="col">وضعیت</th></tr></thead>
              <tbody><tr><td>اتمام جلسهٔ رایگان</td><td>—</td><td><span>تکمیل شد</span></td></tr></tbody>
            </table>
          </section>}
        </ScrollArea>
        <ProgramNavigation current="home" onHome={() => homeContent.current?.scrollTo(0, 0)} onCoaching={onOpenCoach} onFollowup={onFollowup} onLearning={onLearning} onHistory={onHistory} />
      </section>
      {starting && <StartSessionSheet onStart={onStart} onClose={onClose} />}
      {preparationReadyAt !== undefined && <ProgramPreparationTransition readyAt={preparationReadyAt} onDone={onPreparationEnd} />}
    </>
  )
}

function StartSessionSheet({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  const [enteringSession, setEnteringSession] = useState(false)
  const enterSession = useEffectEvent(onStart)
  useEffect(() => {
    if (!enteringSession) return
    const timer = window.setTimeout(enterSession, 1500)
    return () => window.clearTimeout(timer)
  }, [enteringSession])

  return (
    <ProgramSheet badge={startBadge} variant="start" onClose={onClose} title="شروع جلسهٔ اول با کوچ"
      description="یک ساعت مشاورهٔ رایگان برای شناخت اهداف و چالش‌های شما؛ پس از این جلسه، روند اختصاصی رشد و یادگیری‌تان را با قدرت آغاز خواهیم کرد.">
      {exit => <div className={styles.startActions}>
        <button type="button" disabled={enteringSession} aria-busy={enteringSession} onClick={() => setEnteringSession(true)}>
          {enteringSession ? 'در حال ورود به جلسه…' : 'شروع گفت‌وگو'}
        </button>
        <button type="button" onClick={() => {
          setEnteringSession(false)
          exit(onClose)
        }}>بعداً ادامه می‌دهم</button>
      </div>}
    </ProgramSheet>
  )
}
