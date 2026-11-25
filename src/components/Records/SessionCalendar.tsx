import { useId } from 'react'
import { ProgramChevron } from '../ProgramChevron'
import styles from './SessionCalendar.module.css'

export type CalendarSession = {
  id: string
  day: number
  title: string
  description: string
  meta: string
  status: 'completed' | 'scheduled'
}
export type CalendarMonth = {
  label: string
  days: number
  leadingDays: number
  sessions: readonly CalendarSession[]
}
const number = new Intl.NumberFormat('fa-IR')
const weekdays = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
]

export function SessionCalendar({
  month,
  selectedDay,
  onSelectDay,
  onPrevious,
  onNext,
  onOpen,
}: {
  month: CalendarMonth
  selectedDay: number
  onSelectDay: (day: number) => void
  onPrevious?: () => void
  onNext?: () => void
  onOpen: (session: CalendarSession) => void
}) {
  const id = useId()
  const recorded = new Set(month.sessions.map(({ day }) => day))
  const attended = new Set(month.sessions.filter(session => session.status === 'completed').map(({ day }) => day))
  const selected = month.sessions.filter(({ day }) => day === selectedDay)
  const days = Array.from({ length: month.days }, (_, index) => index + 1)
  const trailingDays = (7 - (month.leadingDays + month.days) % 7) % 7

  return (
    <div className={styles.calendar}>
      <div className={styles.stats}>
        <span><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor"
          strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 5h14v12H3zm0 4h14M6 3v4m8-4v4m-7 6 2 2 4-4" />
        </svg>{number.format(attended.size)} روز حضور</span>
        <span>{number.format(month.sessions.length)} جلسه در این ماه</span>
      </div>
      <section className={styles.month} aria-labelledby={id}>
        <header>
          <button
            type="button"
            aria-label="ماه بعد"
            disabled={!onNext}
            onClick={onNext}
          >
            <ProgramChevron direction="right" />
          </button>
          <h2 id={id}>{month.label}</h2>
          <button
            type="button"
            aria-label="ماه قبل"
            disabled={!onPrevious}
            onClick={onPrevious}
          >
            <ProgramChevron />
          </button>
        </header>
        <div className={styles.days}>
          {weekdays.map((day) => (
            <span key={day} className={styles.weekday}>
              {day}
            </span>
          ))}
          {Array.from({ length: month.leadingDays }, (_, index) => (
            <span key={index + '-before'} className={styles.blank} aria-hidden="true" />
          ))}
          {days.map((day) => (
            <button
              key={day}
              type="button"
              data-session={recorded.has(day)}
              aria-pressed={day === selectedDay}
              aria-label={
                number.format(day) +
                ' ' +
                month.label +
                (recorded.has(day) ? '، جلسه ثبت‌شده' : '')
              }
              onClick={() => onSelectDay(day)}
            >
              {number.format(day)}
            </button>
          ))}
          {Array.from({ length: trailingDays }, (_, index) => (
            <span key={index + '-after'} className={styles.blank} aria-hidden="true" />
          ))}
        </div>
        <p className={styles.legend}>● جلسه ثبت‌شده</p>
      </section>
      <h2 className={styles.result} aria-live="polite">
        <span>{weekdays[(month.leadingDays + selectedDay - 1) % 7]}، {number.format(selectedDay)} {month.label}</span>
        <small>{number.format(selected.length)} جلسه</small>
      </h2>
      {selected.length ? (
        selected.map((session) => (
          <button key={session.id} type="button" className={styles.session} onClick={() => onOpen(session)}>
            <strong>{session.title}</strong><small>{session.meta}</small>
            <span data-scheduled={session.status === 'scheduled' || undefined}>
              {session.status === 'completed' ? '✓ تکمیل شده' : 'زمان‌بندی شده'}
            </span>
            <em>جزئیات جلسه<ProgramChevron /></em>
          </button>
        ))
      ) : (
        <p>جلسه‌ای برای این روز ثبت نشده است.</p>
      )}
    </div>
  )
}
