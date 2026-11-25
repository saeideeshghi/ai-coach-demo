import { FinalReport, FinalReportDetails } from '../../components/Records/Records'
import type { ReportDetails } from '../../components/Records/Records'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton'
import { RecordPage } from './RecordPage'
import styles from './RecordPages.module.css'

const summary = 'مسئولیت‌های تیم روشن‌تر شده‌اند. پایش شاخص‌های فروش به ادامهٔ کار نیاز دارد.'
const details: ReportDetails = {
  goals: [
    { title: 'شفافیت نقش‌ها', percent: 85 },
    { title: 'تفویض مسئولیت', percent: 75 },
    { title: 'پایش عملکرد', percent: 60 },
  ],
  impact: 'جلسه‌های بازبینی منظم شدند و برای هر اقدام، مسئول و زمان پیگیری تعیین شد.',
  gaps: 'پایش فروش هنوز به تعریف شاخص‌ها، داشبورد و چرخهٔ گزارش‌دهی منظم نیاز دارد.',
  priorities: ['تکمیل و راه‌اندازی داشبورد فروش', 'بهبود تفویض و نظارت بر اجرا', 'بازتنظیم اهداف فصل بعد بر اساس نتایج'],
}

type System = { id: string; title: string; completed: boolean }

function download(systems: readonly System[]) {
  const contents = ['گزارش نهایی آزمایشی Ai Coach', '', 'وضعیت هفت سیستم',
    ...systems.map(system => system.title + ' — تکمیل شد'), '', 'جمع‌بندی مدیریتی', summary,
    '', 'میزان تحقق اهداف', ...details.goals.map(goal => goal.title + ' — ' + goal.percent.toLocaleString('fa-IR') + '٪'),
    '', 'اثر بر عملکرد مدیریتی', details.impact, '', 'شکاف‌های باقی‌مانده', details.gaps,
    '', 'اولویت‌های ۹۰ روز آینده', ...details.priorities]
  const url = URL.createObjectURL(new Blob(['\uFEFF', contents.join('\r\n')], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'گزارش-نمونه-Ai Coach.txt'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function ReportPage({ systems, showDetails, onDetails, onProgress, onBack }: {
  systems: readonly System[]
  showDetails: boolean
  onDetails: () => void
  onProgress: () => void
  onBack: () => void
}) {
  const complete = systems.length > 0 && systems.every(system => system.completed)
  return <RecordPage view="report" title="گزارش نهایی برنامه" subtitle="ارزیابی دستاوردها و اولویت‌های مرحلهٔ بعد" onBack={onBack}
    footer={complete && <PrimaryButton appearance="program" onClick={() => download(systems)}>دریافت گزارش نهایی
      <svg className={styles.downloadIcon} aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v8m-3-3 3 3 3-3M3 10v3h10v-3" />
      </svg>
    </PrimaryButton>}>
    {complete ? showDetails ? <FinalReportDetails details={details} />
      : <FinalReport systems={systems} summary={summary} onDetails={onDetails} />
      : <>
        <p role="status">گزارش نهایی پس از تکمیل هفت سیستم آماده می‌شود.</p>
        <SecondaryButton onClick={onProgress}>مشاهدهٔ پیشرفت برنامه</SecondaryButton>
      </>}
  </RecordPage>
}
