import { useState } from 'react'
import type { ReactNode } from 'react'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import { RecordGroup } from '../../components/Records/Records'
import { SessionCalendar } from '../../components/Records/SessionCalendar'
import { months, recordSessions } from '../../fixtures/records'
import coachAvatar from '../../assets/records/coach-naderi.webp'
import documentIcon from '../../assets/coach/summary-document.svg'
import recording from '../../assets/coach/coach-demo.mp4?url'
import { RecordPage } from './RecordPage'
import styles from './RecordPages.module.css'

export function HistoryPage({ onBack, onCalendar, nav }: {
  onBack: () => void
  onCalendar: () => void
  nav: ReactNode
}) {
  return <RecordPage title="سوابق" onBack={onBack} nav={nav} onCalendar={onCalendar}>
    <p className={styles.emptyHistory} role="status">هنوز سابقه‌ای ثبت نشده است.</p>
  </RecordPage>
}

export function CalendarPage({ month, day, onSelect, onOpen, onBack }: {
  month: string | null
  day: string | null
  onSelect: (month: string, day: number) => void
  onOpen: (id: string) => void
  onBack: () => void
}) {
  const index = month === months[0].id ? 0 : 1
  const current = months[index]
  const value = Number(day)
  const selected = Number.isInteger(value) && value >= 1 && value <= current.days ? value : current.initial
  return <RecordPage view="calendar" title="تقویم جلسات" subtitle="مرور روزهای حضور شما" onBack={onBack}>
    <SessionCalendar month={current} selectedDay={selected} onSelectDay={value => onSelect(current.id, value)}
      onPrevious={index > 0 ? () => onSelect(months[index - 1].id, months[index - 1].initial) : undefined}
      onNext={index < months.length - 1 ? () => onSelect(months[index + 1].id, months[index + 1].initial) : undefined}
      onOpen={session => onOpen(session.id)} />
  </RecordPage>
}

export function SessionDetailsPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [watching, setWatching] = useState(false)
  const session = recordSessions.find(item => item.id === id)
  const button = session?.status === 'completed' && <PrimaryButton appearance="program" onClick={() => setWatching(value => !value)}>
    {watching ? 'بستن ضبط جلسه' : 'مشاهدهٔ ضبط جلسه'}
  </PrimaryButton>

  return <RecordPage view="session" title="جزئیات جلسهٔ کوچینگ" subtitle="مرور خلاصه، دستاوردها و فایل‌های جلسه" onBack={onBack} footer={button}>
    {session ? <>
      <RecordGroup title="جلسه با کوچ"><img className={styles.detailIcon} src={documentIcon} alt="" />
        <h3>{session.title}</h3><p>{session.status === 'completed' ? 'جلسهٔ ثبت‌شده در تقویم سوابق' : 'جلسهٔ زمان‌بندی‌شده'}</p>
      </RecordGroup>
      {watching && <video className={styles.recording} src={recording} controls playsInline autoPlay aria-label="نمونهٔ ضبط جلسه" />}
      <section className={styles.sessionIdentity} aria-label="مشخصات جلسه">
        <img src={coachAvatar} alt="" /><span><small>کوچ جلسه</small><strong>دکتر نادری</strong><small>کوچ توسعه کسب‌وکار</small></span>
        <span><strong>{session.date}</strong><small>{session.meta}</small></span>
      </section>
      <RecordGroup title="موضوع جلسه"><p>{session.description}</p></RecordGroup>
      {session.status === 'completed' && <>
        <RecordGroup title="خلاصهٔ جلسه"><p>{session.summary}</p></RecordGroup>
        <RecordGroup title="دستاوردها و خروجی‌ها"><ul>
          <li>✓ جمع‌بندی وضعیت و پیشرفت برنامه</li>
          <li>✓ تعیین سه اقدام کلیدی برای مرحلهٔ بعد</li>
          <li>✓ تعیین مسئول و زمان پیگیری اقدامات</li>
        </ul></RecordGroup>
      </>}
    </> : <p role="status">این جلسه در سوابق پیدا نشد.</p>}
  </RecordPage>
}
