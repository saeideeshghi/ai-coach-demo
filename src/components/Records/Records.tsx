import selectedTag from './selected-tag.svg'
import unselectedTag from './unselected-tag.svg'
import notificationSession from './notification-session.svg'
import notificationSummary from './notification-summary.svg'
import noteSessionIcon from './note-session-icon.svg'
import noteCalendarIcon from './note-calendar-icon.svg'
import type { ReactNode } from 'react'
import { CompletionMark } from '../CompletionMark'
import { ProgramChevron } from '../ProgramChevron'
import styles from './Records.module.css'

export function RecordFilters<T extends string>({
  options,
  selected,
  onSelect,
  label,
  appearance = 'default',
  showSelection = false,
}: {
  options: readonly { id: T; label: string }[]
  selected: T
  onSelect: (id: T) => void
  label: string
  appearance?: 'default' | 'notification'
  showSelection?: boolean
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={styles.filters}
      data-appearance={appearance}
      data-selection-mark={showSelection}
    >
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={selected === id}
          onClick={() => onSelect(id)}
        >
          {showSelection && (
            <span className={styles.selectionMark} aria-hidden="true">
              <img
                src={selected === id ? selectedTag : unselectedTag}
                alt=""
                width="16"
                height="16"
              />
            </span>
          )}
          {label}
        </button>
      ))}
    </div>
  )
}

export function RecordCard({
  title,
  description,
  category,
  meta,
  appearance = 'default',
  showChevron = false,
  onOpen,
}: {
  title: string
  description: string
  category?: string
  meta?: string
  appearance?: 'default' | 'note'
  showChevron?: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      className={styles.card}
      data-appearance={appearance}
      data-chevron={showChevron || undefined}
      onClick={onOpen}
    >
      {category && (
        <small
          className={appearance === 'note' ? styles.noteCategory : undefined}
        >
          {appearance === 'note' && (
            <img src={noteSessionIcon} alt="" width="18" height="18" />
          )}
          {category}
        </small>
      )}
      <strong>{title}</strong>
      <span>{description}</span>
      {meta && (
        <small className={appearance === 'note' ? styles.noteMeta : undefined}>
          {appearance === 'note' && (
            <img src={noteCalendarIcon} alt="" width="12" height="12" />
          )}
          {meta}
        </small>
      )}
      {showChevron && <ProgramChevron />}
    </button>
  )
}

const notificationIcons = {
  summary: 'M5 5h14v12H9l-4 4V5Zm4 5h6m-6 3h4',
  action: 'M6 3h12v18H6z M9 8h6m-6 4h6m-6 4h3',
  session: 'M4 7h16v14H4z M8 3v8m8-8v8M4 12h16',
  course: 'm2 8 10-5 10 5-10 5Zm4 2v7l6 4 6-4v-7',
  progress: 'M4 20h16 M7 16v-4m5 4V8m5 8V4',
}

export function NotificationCard({
  title,
  description,
  meta,
  kind,
  unread,
  onOpen,
}: {
  title: string
  description: string
  meta: string
  kind: keyof typeof notificationIcons
  unread: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      className={styles.notification}
      data-unread={unread}
      onClick={onOpen}
    >
      <span className={styles.notificationIcon} aria-hidden="true">
        {kind === 'session' || kind === 'summary' ? (
          <img
            src={kind === 'session' ? notificationSession : notificationSummary}
            alt=""
            width="18"
            height="18"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d={notificationIcons[kind]} />
          </svg>
        )}
      </span>
      <span className={styles.notificationCopy}>
        <strong>{title}</strong>
        <span>{description}</span>
        <span className={styles.srOnly}>
          {unread ? 'خوانده‌نشده' : 'خوانده‌شده'}
        </span>
      </span>
      <small>
        {unread && <span className={styles.unreadMark} aria-hidden="true" />}
        {meta}
      </small>
    </button>
  )
}

export function RecordGroup({
  title,
  icon,
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <section className={styles.group}>
      <h2>{icon && <span className={styles.groupIcon} aria-hidden="true">{icon}</span>}{title}</h2>
      {children}
    </section>
  )
}

export function FinalReport({
  systems,
  summary,
  onDetails,
}: {
  systems: readonly { id: string; title: string; completed: boolean }[]
  summary: string
  onDetails: () => void
}) {
  const completed =
    systems.length > 0 && systems.every((system) => system.completed)
  return (
    <div className={styles.report}>
      <div className={styles.reportBanner} data-completed={completed}>
        <strong>{completed && <CompletionMark />}{completed ? 'برنامهٔ هفت سیستم تکمیل شد' : 'برنامه در حال انجام است'}</strong>
        {completed && <p>نتایج، دستاوردها و اولویت‌های بعدی در گزارش نهایی ثبت شده‌اند.</p>}
      </div>
      <section className={styles.reportSystems}>
        <h2>وضعیت هفت سیستم</h2>
        <ul>
          {systems.map(({ id, title, completed }) => (
            <li key={id}>
              <span>{completed && <span className={styles.systemCheck} aria-hidden="true">✓</span>}{title}</span>
              <small data-completed={completed}>
                {completed ? 'تکمیل شد' : 'در جریان'}
              </small>
            </li>
          ))}
        </ul>
      </section>
      <RecordCard
        title="جمع‌بندی مدیریتی"
        description={summary}
        showChevron
        onOpen={onDetails}
      />
    </div>
  )
}

export type ReportDetails = {
  goals: readonly { title: string; percent: number }[]
  impact: string
  gaps: string
  priorities: readonly string[]
}

const reportIcons = {
  goals: 'M3 15V4h12M6 12V9m3 3V7m3 5V5',
  impact: 'm3 12 4-4 3 2 4-6m-4 0h4v4',
  gaps: 'M8 2 15 14H1Zm0 4v3m0 2v.1',
  priorities: 'M4 3h8v11H4Zm2 3h4M6 9h4m-4 2h3',
}

function ReportIcon({ name }: { name: keyof typeof reportIcons }) {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={reportIcons[name]} />
  </svg>
}

export function FinalReportDetails({
  details,
}: {
  details: ReportDetails
}) {
  const format = new Intl.NumberFormat('fa-IR', { style: 'percent' })
  return (
    <div className={styles.report}>
      <RecordGroup title="میزان تحقق اهداف" icon={<ReportIcon name="goals" />}>
        <dl className={styles.goals}>
          {details.goals.map(({ title, percent }) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{format.format(percent / 100)}</dd>
            </div>
          ))}
        </dl>
      </RecordGroup>
      <RecordGroup title="اثر بر عملکرد مدیریتی" icon={<ReportIcon name="impact" />}>
        <p className={styles.reportCopy}>{details.impact}</p>
      </RecordGroup>
      <RecordGroup title="شکاف‌های باقی‌مانده" icon={<ReportIcon name="gaps" />}>
        <p className={styles.reportCopy}>{details.gaps}</p>
      </RecordGroup>
      <RecordGroup title="اولویت‌های ۹۰ روز آینده" icon={<ReportIcon name="priorities" />}>
        <ul className={styles.priorities}>
          {details.priorities.map((priority) => (
            <li key={priority}>{priority}</li>
          ))}
        </ul>
      </RecordGroup>
    </div>
  )
}
