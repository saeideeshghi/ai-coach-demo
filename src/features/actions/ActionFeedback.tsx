import { ScrollArea } from '../../components/ScrollArea/ScrollArea'
import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ProgramChevron } from '../../components/ProgramChevron'
import guide from '../../assets/coach/summary-document.svg'
import { ActionIdentity, ActionPageHeading } from './ActionHeader'
import type { ActionItem, ActionRevision } from './action'
import styles from './ActionFlow.module.css'
import feedback from './ActionFeedback.module.css'

const items = [
  'جدول نقش‌های فعلی و مطلوب را تکمیل کنید.',
  'مسئول اصلی کارهای مشترک را مشخص کنید.',
  'مسئولیت‌های بدون متولی را ثبت کنید.',
]

export function ActionFeedback({ action, nav, onBack, onSubmit }: {
  action: ActionItem
  nav: ReactNode
  onBack: () => void
  onSubmit: (revision: ActionRevision) => void
}) {
  const formId = useId()
  const [summary, setSummary] = useState('')
  const [attachmentName, setAttachmentName] = useState<string>()
  const [attachmentError, setAttachmentError] = useState(false)
  const limit = 1000

  function submit(event: FormEvent) {
    event.preventDefault()
    if (summary.trim() && !attachmentError) onSubmit({ summary: summary.trim(), attachmentName })
  }

  return <section className={styles.screen} data-detail="">
    <ScrollArea className={styles.body}>
      <div className={feedback.heading}>
        <ActionPageHeading title="بازخورد کوچ و ارسال اصلاحیه"
          subtitle="بازخورد کوچ را مرور کنید و اصلاحیه را بفرستید." onBack={onBack} />
      </div>
      <div className={feedback.cards}>
        <ActionIdentity action={action} />
        <section>
          <header><h2><img src={guide} alt="" />بازخورد کوچ</h2><span>دکتر نادری</span></header>
          <p>تفاوت نقش‌های فعلی و مطلوب را روشن‌تر کنید. برای مسئولیت‌های مشترک یک مسئول اصلی تعیین کنید.</p>
        </section>
        <section>
          <h2><img src={guide} alt="" />موارد نیازمند اصلاح</h2>
          <ul>{items.map(item => <li key={item}><label><input type="checkbox" />{item}</label></li>)}</ul>
        </section>
        <form id={formId} className={feedback.form} onSubmit={submit}>
          <h2><img src={guide} alt="" />ارسال گزارش اصلاح‌شده</h2>
          <label className={feedback.field}>
            <textarea aria-label="خلاصهٔ اصلاحات" placeholder="خلاصهٔ اصلاحات را بنویسید…" dir="rtl"
              maxLength={limit} value={summary} onChange={event => setSummary(event.currentTarget.value)} />
            <small>{summary.length.toLocaleString('fa-IR')} از {limit.toLocaleString('fa-IR')}</small>
          </label>
          <label className={feedback.file}>
            <img src={guide} alt="" />
            <span>{attachmentName ?? 'پیوست PDF (اختیاری)'}</span>
            <span>{attachmentName ? 'تغییر فایل' : 'انتخاب فایل'}</span>
            <input type="file" accept=".pdf,application/pdf" aria-label="انتخاب فایل پیوست" onChange={event => {
              const file = event.currentTarget.files?.[0]
              const invalid = Boolean(file && !file.name.toLowerCase().endsWith('.pdf'))
              if (invalid) event.currentTarget.value = ''
              setAttachmentName(invalid ? undefined : file?.name)
              setAttachmentError(invalid)
            }} />
          </label>
          {attachmentError && <p role="alert">یک فایل PDF انتخاب کنید.</p>}
        </form>
      </div>
    </ScrollArea>
    <footer className={feedback.submitBar}>
      <button form={formId} type="submit" className={styles.primary} disabled={!summary.trim() || attachmentError}>
        ارسال اصلاحیه<ProgramChevron />
      </button>
    </footer>
    {nav}
  </section>
}
