import { ScrollArea } from '../../components/ScrollArea/ScrollArea'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ProgramChevron } from '../../components/ProgramChevron'
import { ProgramNavigation } from '../../components/ProgramNavigation/ProgramNavigation'
import { ProgramSheet } from '../../components/ProgramSheet/ProgramSheet'
import guide from '../../assets/coach/summary-document.svg'
import type { ActionItem, ActionReview, ActionRevision, ActionService, ActionStatus, ActionView } from './action'
import { ActionFeedback } from './ActionFeedback'
import { ActionChat } from './ActionChat'
import { ActionIdentity, ActionPageHeading } from './ActionHeader'
import styles from './ActionFlow.module.css'

type ActionFlowProps = {
  action: ActionItem
  titles: readonly string[]
  service: ActionService
  active: boolean
  isNextActionPreview: boolean
  review: ActionReview
  trackingAction: ActionItem
  trackingStatus: ActionStatus
  nextAction?: ActionItem
  view: 'tracking' | ActionView
  onHome: () => void
  onCoaching: () => void
  onTracking: () => void
  onLearning: () => void
  onHistory: () => void
  onSystems: () => void
  onBack: () => void
  onOpen: (id: string, view: ActionView) => void
  onSubmit: (revision?: ActionRevision) => void
}

export function ActionBadge({ kind, animated = false }: { kind: 'check' | 'clock' | 'lock' | 'edit'; animated?: boolean }) {
  const ring = kind === 'clock' ? 'waiting' : 'accent'
  return <span className={styles.badge} aria-hidden="true">
    {animated && <svg className={styles.badgeRing} data-action-ring={ring}
      viewBox="0 0 76 76" fill="none" strokeLinecap="round">
      {kind === 'clock' && <circle cx="38" cy="38" r="36" stroke="#ff98504d" />}
      <circle cx="38" cy="38" r="36" stroke="#ff9e61" strokeWidth="1.6"
        pathLength="100" strokeDasharray={kind === 'clock' ? '22 78' : undefined} />
    </svg>}
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor"
      strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'check' && <path d="m6 16 6.5 6.5L26 9" pathLength="1" data-action-glyph={animated ? 'check' : undefined} />}
      {kind === 'clock' && <><circle cx="16" cy="16" r="13" /><path d="M16 9v7l4 3" /></>}
      {kind === 'edit' && <path d="m6 26 1.5-6.5L22 5a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L12.5 24.5 6 26Zm12-17 5 5"
        pathLength="1" data-action-glyph={animated ? 'edit' : undefined} />}
      {kind === 'lock' && <><rect x="7.5" y="13" width="17" height="13" rx="3" /><path d="M11 13V9a5 5 0 1 1 10 0v4" /></>}
    </svg>
  </span>
}

function HomeReturnArrow() {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path d="M14.167 8.5H2.833M7.083 12.75 2.833 8.5l4.25-4.25"
      stroke="currentColor" strokeWidth="1.16875" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

function ConversationIcon() {
  return <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.2 7.6a6.1 6.1 0 0 1-8.5 5.7L2 14l.9-3.1a6.1 6.1 0 1 1 11.3-3.3Z" /><path d="M5.5 7.6h5" />
  </svg>
}

function StatusSheet({ view, action, review, nextAction, onTracking, onOpen }: Pick<ActionFlowProps, 'action' | 'review' | 'nextAction' | 'onTracking' | 'onOpen'> & {
  view: 'submitted' | 'review'
}) {
  const submitted = view === 'submitted'
  const state = submitted ? 'submitted' : review.status
  const responses = {
    submitted: {
      badge: 'check', title: review.revised ? 'اصلاحیه ثبت شد' : 'اعلام انجام ثبت شد',
      copy: review.revised ? 'گزارش اصلاح‌شده برای بررسی دوبارهٔ کوچ ارسال شد.' : `گزارش «${action.title}» برای بررسی کوچ ارسال شد.`,
      primary: 'مشاهدهٔ وضعیت', secondary: 'بازگشت به برنامه', next: () => onOpen(action.id, 'review'),
    },
    review: {
      badge: 'clock', title: 'در انتظار تأیید کوچ', copy: `کوچ گزارش «${action.title}» را بررسی می‌کند.`,
      primary: 'بازگشت به برنامه', secondary: 'بعداً بررسی می‌کنم', next: onTracking,
    },
    revision: {
      badge: 'edit', title: 'نیازمند اصلاح', copy: `بازخورد کوچ برای اقدام «${action.title}» آماده است.`,
      primary: 'مشاهدهٔ بازخورد کوچ', secondary: 'بعداً اصلاح می‌کنم', next: () => onOpen(action.id, 'feedback'),
    },
    approved: {
      badge: 'check', title: 'تأیید موفق اقدام', copy: nextAction ? 'اقدام بعدی در همین زیرسیستم آماده است.' : 'کوچ انجام این اقدام را تأیید کرد.',
      primary: nextAction ? 'مشاهدهٔ اقدام بعدی' : 'بازگشت به برنامه', secondary: 'بازگشت به برنامه',
      next: nextAction ? () => onOpen(nextAction.id, 'detail') : onTracking,
    },
  } as const
  if (state === 'current') return null
  const response = responses[state]
  return <ProgramSheet badge={<ActionBadge kind={response.badge} animated />}
    variant={'action-' + state} exitMotion={state === 'approved' ? 'fade' : 'slide'} onClose={onTracking} title={response.title} description={response.copy}>
    {(exit, swap) => <div className={styles.sheetActions}>
      <button type="button" className={styles.primary} onClick={() => submitted ? swap(response.next) : exit(response.next)}>
        <span key={response.primary} data-sheet-copy="">{response.primary}</span><ProgramChevron />
      </button>
      {response.secondary !== response.primary && <button type="button" className={styles.secondary} onClick={() => exit(onTracking)}>
        <span key={response.secondary} data-sheet-copy="">{response.secondary}</span>
      </button>}
    </div>}
  </ProgramSheet>
}

function Tracking({ action, titles, active, status, covered, nav, onHome, onOpen, onSystems }: Pick<ActionFlowProps, 'action' | 'titles' | 'active' | 'onHome' | 'onOpen' | 'onSystems'> & {
  status: ActionStatus
  covered: boolean
  nav: ReactNode
}) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (!covered) title.current?.focus({ preventScroll: true }) }, [covered])
  const needsReview = status !== 'current'
  const underReview = status === 'review'
  const revision = status === 'revision'
  const actionIndex = action.position - 1
  const nextAvailable = actionIndex > 1 && status === 'current'
  const doneCount = Math.max(1, actionIndex + Number(status === 'approved'))
  const fa = (value: number) => value.toLocaleString('fa-IR')
  const openAction = () => onOpen(action.id, revision ? 'feedback' : needsReview ? 'review' : 'detail')
  return <section className={styles.screen} data-tracking="" inert={covered} aria-hidden={covered || undefined}>
    <ScrollArea className={styles.body}>
      <header className={styles.trackingHeader}>
        <h1 ref={title} tabIndex={-1}>پیگیری</h1>
        <p>مسیر اجرای برنامهٔ کوچینگ</p>
      </header>
      {active ? <div className={styles.trackingCards}>
        <section className={styles.system}>
          <div className={styles.systemTop}><p className={styles.marker}>سیستم جاری</p><button type="button" className={styles.systemsLink} onClick={onSystems}>همهٔ سیستم‌ها: ۰ از ۷ تکمیل</button></div>
          <h2>{action.system}</h2>
          <p>زیرسیستم · {action.subsystem}</p>
          <p>{fa(doneCount)} از {fa(titles.length)} اقدام این زیرسیستم انجام شده</p>
          <progress aria-label="پیشرفت زیرسیستم" value={doneCount} max={titles.length} />
        </section>
        <section className={styles.current} data-revision={revision || undefined}>
          <h2 className={styles.marker}>{revision ? 'نیازمند اصلاح' : underReview ? 'در انتظار تأیید کوچ' : status === 'approved' ? 'اقدام تأیید شد' : 'اقدام فعلی'}</h2>
          <h3>{action.title}</h3>
          <p>{revision ? 'بازخورد کوچ را مرور و اصلاحیه را ارسال کنید.' : underReview ? 'گزارش برای کوچ ارسال شده است.' : status === 'approved' ? 'گزارش اقدام تأیید شد.' : nextAvailable ? 'تعریف معیارهای اندازه‌گیری برای هر نقش' : 'موعد · فردا'}</p>
          <div className={styles.cardActions}>
            <button type="button" onClick={openAction}>{revision ? 'مشاهدهٔ بازخورد' : needsReview ? 'مشاهدهٔ وضعیت' : nextAvailable ? 'ادامهٔ اقدام بعدی' : 'ادامهٔ اقدام'}<ProgramChevron /></button>
            <button type="button" onClick={needsReview ? onHome : () => onOpen(action.id, 'chat')}>
              <span>{needsReview ? 'بازگشت به خانه' : 'گفت‌وگو با کوچ'}</span>
              {needsReview ? <HomeReturnArrow /> : <ConversationIcon />}
            </button>
          </div>
        </section>
        <section className={styles.actionList}>
          <header><h2>اقدام‌های این زیرسیستم</h2><p>۶ اقدام</p></header>
          <ol>
            {titles.map((label, index) => {
              const state = index < doneCount ? 'done' : index === actionIndex ? 'current' : 'upcoming'
              const content = <><span className={styles.rowStatus} data-indicator={state === 'current' && (!needsReview || revision) ? (nextAvailable || revision ? 'outline' : 'filled') : undefined} aria-hidden="true">
                {state === 'done' ? '✓' : state === 'upcoming' ? <ActionBadge kind="lock" /> : underReview ? <ActionBadge kind="clock" /> : null}
              </span><span>{label}<small>{state === 'done' ? 'تکمیل شد' : state === 'upcoming' ? 'پیش‌رو' : revision ? 'نیازمند اصلاح' : underReview ? 'در بررسی' : 'در جریان'}</small></span><ConversationIcon /></>
              return <li key={label} data-state={state}>
                {state === 'current' ? <button type="button" onClick={openAction}>{content}</button>
                  : <div>{content}</div>}
              </li>
            })}
          </ol>
        </section>
      </div> : <div className={styles.trackingCards}>
        <section className={styles.inactive}>
          <ActionBadge kind="lock" />
          <h2>برنامه هنوز فعال نشده</h2>
          <p>بعد از آماده‌شدن برنامهٔ اختصاصی، سیستم‌ها و اقدام‌های شما در این بخش نمایش داده می‌شوند.</p>
        </section>
        <button type="button" className={styles.secondary} onClick={onHome}>بازگشت به خانه<ProgramChevron /></button>
      </div>}
    </ScrollArea>
    {nav}
  </section>
}

function Detail({ action, nav, review, isNextActionPreview, onBack, onTracking, onOpen, onSubmit }: Pick<ActionFlowProps, 'action' | 'review' | 'isNextActionPreview' | 'onBack' | 'onTracking' | 'onOpen' | 'onSubmit'> & { nav: ReactNode }) {
  const underReview = review.status !== 'current'
  const returnToTracking = isNextActionPreview && !underReview
  const primaryLabel = returnToTracking ? 'بازگشت به پیگیری' : underReview ? 'مشاهدهٔ وضعیت' : 'اعلام انجام'
  const activatePrimary = returnToTracking ? onTracking : underReview ? () => onOpen(action.id, 'review') : () => onSubmit()
  return <section className={styles.screen} data-detail="">
    <ScrollArea className={styles.body}>
      <ActionPageHeading title="جزئیات اقدام" subtitle="راهنمای انجام و خروجی مورد انتظار" onBack={onBack} />
      <div className={styles.detailCards}>
        <ActionIdentity action={action} />
        <section className={styles.reason}>
          <h2>چرا این اقدام مهم است؟</h2>
          <p>{action.reason}</p>
        </section>
        <section className={styles.steps}>
          <h2><img src={guide} alt="" />راهنمای انجام اقدام</h2>
          <ol>{action.steps.map(step => <li key={step}>{step}</li>)}</ol>
        </section>
        <section className={styles.output}>
          <h2><img src={guide} alt="" />خروجی مورد انتظار</h2>
          <p>{action.output}</p>
        </section>
        <details className={styles.notes} onToggle={event => {
          if (!event.currentTarget.open) return
          event.currentTarget.scrollIntoView({
            block: 'nearest',
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          })
        }}>
          <summary>نکات تکمیلی<ProgramChevron /></summary>
          <p>{action.notes}</p>
        </details>
      </div>
    </ScrollArea>
    <div className={styles.detailActions}>
      <button type="button" className={styles.primary} onClick={activatePrimary}>
        {primaryLabel}
      </button>
      <button type="button" className={styles.secondary} onClick={() => onOpen(action.id, 'chat')}>گفت‌وگو با کوچ</button>
    </div>
    {nav}
  </section>
}

export function ActionFlow(props: ActionFlowProps) {
  const { action, trackingAction, trackingStatus, review, nextAction, titles, service, active, isNextActionPreview, view, onHome, onCoaching, onTracking, onLearning, onHistory, onSystems, onBack, onOpen, onSubmit } = props
  const nav = <ProgramNavigation current="followup" onHome={onHome} onCoaching={onCoaching} onFollowup={onTracking} onLearning={onLearning} onHistory={onHistory} />
  if (active && view === 'detail') return <Detail action={action} nav={nav} review={review} isNextActionPreview={isNextActionPreview} onBack={onBack}
    onTracking={onTracking} onOpen={onOpen} onSubmit={onSubmit} />
  if (active && view === 'chat') return <ActionChat key={action.id} action={action} service={service} onBack={onBack} isNextActionPreview={isNextActionPreview} />
  if (active && view === 'feedback' && review.status === 'revision') return <ActionFeedback action={action} nav={nav} onBack={onBack} onSubmit={onSubmit} />
  const status = active && review.status !== 'current' && (view === 'submitted' || view === 'review') ? view : null
  return <>
    <Tracking action={trackingAction} titles={titles} active={active} status={trackingStatus} covered={status !== null} nav={nav} onHome={onHome} onOpen={onOpen} onSystems={onSystems} />
    {status && <StatusSheet action={action} review={review} nextAction={nextAction} view={status} onTracking={onTracking} onOpen={onOpen} />}
  </>
}
