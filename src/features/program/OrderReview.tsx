import { useEffect, useRef } from 'react'
import { ProgramChevron } from '../../components/ProgramChevron'
import shell from './ProgramPackage.module.css'
import styles from './OrderReview.module.css'

export function OrderReview({ covered = false, onBack, onPay }: {
  covered?: boolean
  onBack: () => void
  onPay: () => void
}) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (!covered) title.current?.focus({ preventScroll: true }) }, [covered])

  return (
    <section className={shell.screen} data-checkout-review inert={covered} aria-hidden={covered || undefined}
      aria-labelledby="order-review-title">
      <div className={styles.step}>
        <button type="button" className={shell.back} aria-label="بازگشت به بسته" onClick={onBack}>
          <ProgramChevron direction="right" />
        </button>
        <span className={styles.bars} aria-hidden="true"><i /><i /></span>
        <span>گام ۲ از ۲</span>
      </div>
      <header className={styles.heading}>
        <h1 id="order-review-title" ref={title} tabIndex={-1}>بررسی سفارش و پرداخت</h1>
        <p>جزئیات سفارش پیش از ورود به درگاه بانکی</p>
      </header>
      <section className={styles.package}>
        <h2>بستهٔ پیشنهادی کوچ</h2>
        <strong>بستهٔ جامع هفت سیستم</strong>
        <p>۴۵ زیرسیستم با همراهی کوچ</p>
      </section>
      <section className={styles.card}>
        <h2>ریز هزینه‌ها</h2>
        <dl className={styles.costs}>
          <div><dt>بستهٔ جامع هفت سیستم</dt><dd>—</dd></div>
          <div><dt>مبلغ قابل پرداخت</dt><dd>— تومان</dd></div>
        </dl>
      </section>
      <section className={styles.method}>
        <h2>پرداخت آنلاین</h2>
        <div><strong>پرداخت آزمایشی</strong><p>نتیجهٔ سفارش پس از بازگشت در همین برنامه نمایش داده می‌شود.</p></div>
      </section>
      <footer className={shell.footer}>
        <button type="button" onClick={onPay}><ProgramChevron />پرداخت آزمایشی</button>
      </footer>
    </section>
  )
}
