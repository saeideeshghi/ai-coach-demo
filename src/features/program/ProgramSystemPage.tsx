import { useEffect, useRef } from 'react'
import { ProgramChevron } from '../../components/ProgramChevron'
import type { DemoSystem } from '../../fixtures/program'
import { ProgramLettering } from './ProgramLettering'
import shell from './ProgramPackage.module.css'
import styles from './ProgramSystemPage.module.css'

const digits = new Intl.NumberFormat('fa', { minimumIntegerDigits: 2 })
const count = new Intl.NumberFormat('fa')

export function ProgramSystemPage({ system, onBack }: { system?: DemoSystem; onBack: () => void }) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { title.current?.focus() }, [system])

  return (
    <section className={shell.screen} data-contents="true" aria-labelledby="program-system-title">
      <button type="button" className={shell.back} aria-label="بازگشت" onClick={onBack}>
        <ProgramChevron direction="right" />
      </button>
      <header className={shell.header}>
        <h1 id="program-system-title" ref={title} tabIndex={-1}>زیرسیستم‌های بستهٔ جامع</h1>
        {system && <>
          <div className={styles.subtitle}><ProgramLettering system={system.id} variant="detail" label={system.subtitle} /></div>
          <h2>{system.title}</h2>
          <p>{count.format(system.subsystems.length)} زیرسیستم</p>
        </>}
      </header>
      {system ? <ol className={styles.list} aria-label="زیرسیستم‌ها">
        {system.subsystems.map((item, index) => <li key={item.subtitle}>
          <span className={styles.index} aria-hidden="true">{digits.format(index + 1)}</span>
          <span>{item.title}<small><ProgramLettering system={system.id} variant={index} label={item.subtitle} /></small></span>
        </li>)}
      </ol> : <p role="status">این سیستم در بسته پیدا نشد.</p>}
      <footer className={shell.footer + ' ' + styles.footer}>
        {system && <div className={styles.price}><span>تعرفهٔ این سیستم</span><strong>— تومان</strong></div>}
        <button type="button" onClick={onBack}><ProgramChevron />بازگشت به جزئیات بسته</button>
      </footer>
    </section>
  )
}
