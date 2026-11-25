import { useEffect, useRef } from 'react'
import { ProgramChevron } from '../../components/ProgramChevron'
import { demoSystems } from '../../fixtures/program'
import { ProgramLettering } from './ProgramLettering'
import styles from './ProgramPackage.module.css'

export function ProgramPackage({ contents, onBack, onContents, onSystem, onCheckout }: {
  contents: boolean
  onSystem: (id: string) => void
  onCheckout: () => void
  onBack: () => void
  onContents: () => void
}) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { title.current?.focus() }, [contents])

  return (
    <section className={styles.screen} data-contents={contents || undefined} aria-labelledby="program-package-title">
      <button type="button" className={styles.back} aria-label="بازگشت" onClick={onBack}>
        <ProgramChevron direction="right" />
      </button>
      <header className={styles.header}>
        <h1 id="program-package-title" ref={title} tabIndex={-1}>{contents ? 'جزئیات بستهٔ جامع' : 'بستهٔ جامع و پرداخت'}</h1>
        <p>{contents ? '۷ سیستم و ۴۵ زیرسیستم با همراهی کوچ' : 'برنامهٔ سامان پس از تأیید پرداخت آماده می‌شود.'}</p>
      </header>
      {contents ? (
        <section className={`${styles.systems} ${styles.contents}`}>
          <h2>محتوای برنامه</h2>
          <ul>{demoSystems.map(({ id, title, subtitle, subsystems }) => <li key={id}>
            <button type="button" className={styles.systemLink} onClick={() => onSystem(id)}>
              <span>{title}<small><ProgramLettering system={id} variant="catalog" label={subtitle} /></small></span>
              <span className={styles.count}>{new Intl.NumberFormat('fa').format(subsystems.length)} زیرسیستم</span>
            </button>
          </li>)}</ul>
        </section>
      ) : (
        <>
          <section className={styles.systems}>
            <h2>بستهٔ جامع هفت سیستم</h2>
            <p className={styles.caption}><span>۴۵ زیرسیستم با همراهی کوچ</span><span>تعرفه – تومان</span></p>
            <ol>{demoSystems.map(({ title }, index) => <li key={title}>
              <span>{new Intl.NumberFormat('fa').format(index + 1)}. {title}</span><span>—</span>
            </li>)}</ol>
            <button type="button" className={styles.details} onClick={onContents}>
              <ProgramChevron />جزئیات هفت سیستم و زیرسیستم‌ها
            </button>
          </section>
          <section className={styles.amount}>
            <div><h2>مبلغ قابل پرداخت</h2><p>قیمت بستهٔ جامع هفت سیستم</p></div>
            <strong>— تومان</strong>
          </section>
        </>
      )}
      <footer className={styles.footer}>
        {!contents && <p>پرداخت آزمایشی · بدون انتقال وجه</p>}
        {contents ? <button type="button" onClick={onBack}><ProgramChevron />بازگشت به خرید بسته</button>
          : <button type="button" onClick={onCheckout}><ProgramChevron />ادامه و پرداخت</button>}
      </footer>
    </section>
  )
}

