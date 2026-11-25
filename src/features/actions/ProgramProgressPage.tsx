import type { ReactNode } from 'react'
import { ScrollArea } from '../../components/ScrollArea/ScrollArea'
import { ProgramChevron } from '../../components/ProgramChevron'
import { programSystems } from '../../fixtures/programProgress'
import type { ProgramScenario } from '../../fixtures/programProgress'
import styles from './ActionFlow.module.css'
import progress from './ProgramProgressPage.module.css'

export function ProgramProgressPage({ scenario, overview, nav, onTracking, onReport }: {
  scenario?: ProgramScenario
  overview: boolean
  nav: ReactNode
  onTracking: () => void
  onReport: () => void
}) {
  const systems = programSystems(scenario)
  const complete = scenario === 'complete'
  const done = systems.filter(system => system.completed).length
  const current = systems.find(system => !system.completed && system.id === 'management')
  const ordered = (overview || done === 1) && !complete
    ? [...systems].sort((a, b) => Number(b.id === 'management') - Number(a.id === 'management'))
    : systems
  return <section className={styles.screen} data-tracking="">
    <ScrollArea className={styles.body}>
      <header className={styles.trackingHeader}><h1>پیگیری</h1><p>مسیر اجرای برنامهٔ کوچینگ</p></header>
      <div className={progress.sections}>
        <section className={progress.banner} data-completed={complete || undefined}>
          {!done && <p><span className={progress.badge} aria-hidden="true">▤</span>مسیر برنامهٔ اختصاصی</p>}
          <h2>{done > 0 && <span className={progress.badge} data-completed={complete || undefined} aria-hidden="true">✓</span>}{complete ? 'برنامهٔ هفت سیستم تکمیل شد' : done.toLocaleString('fa-IR') + ' از ۷ سیستم تکمیل شده'}</h2>
          <p>{complete ? 'نتایج، دستاوردها و اولویت‌های بعدی در گزارش نهایی ثبت شده‌اند.'
            : done ? 'برنامهٔ اختصاصی شما ادامه دارد.' : 'سیستم جاری و وضعیت بخش‌های دیگر را اینجا ببینید.'}</p>
        </section>
        <ul className={progress.systems} aria-label="وضعیت هفت سیستم">
          {ordered.map(system => <li key={system.id}>
            <span>{(system.completed || system === current) && <i data-current={system === current || undefined} aria-hidden="true">{system.completed ? '✓' : '○'}</i>}{system.title}</span>
            {!complete && <small data-state={system.completed ? 'done' : system === current ? 'current' : 'upcoming'}>
              {system.completed ? 'تکمیل شد' : system === current ? 'در جریان' : 'پیش‌رو'}
            </small>}
          </li>)}
        </ul>
      </div>
    </ScrollArea>
    <footer className={progress.footer}>
      <button type="button" className={done && !complete ? styles.secondary : styles.primary} onClick={complete ? onReport : onTracking}>
        {complete ? 'مشاهدهٔ گزارش نهایی' : done ? 'بازگشت به برنامه' : 'بازگشت به اقدام جاری'}<ProgramChevron />
      </button>
    </footer>
    {nav}
  </section>
}
