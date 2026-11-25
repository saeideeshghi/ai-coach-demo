import { useEffect, useRef, useState } from 'react'
import { ProgramChevron } from '../../components/ProgramChevron'
import { ProgramSheet } from '../../components/ProgramSheet/ProgramSheet'
import { demoSystems } from '../../fixtures/program'
import type { CheckoutService, OrderView, PaymentStatus } from './checkout'
import { OrderReview } from './OrderReview'
import warning from './payment-incomplete.svg'
import paid from './payment-paid.svg'
import preparing from './payment-preparing.svg'
import clock from './payment-verifying.svg'
import shell from './ProgramPackage.module.css'
import styles from './OrderPage.module.css'

const copy = {
  redirecting: { badge: <span className={styles.gatewayBadge}><i /><i /><i /></span>, title: 'در حال انتقال به درگاه پرداخت', description: 'برای پرداخت سفارش بستهٔ جامع، به درگاه بانکی منتقل می‌شوید.' },
  verifying: { badge: clock, title: 'در حال تأیید پرداخت', description: 'تا اعلام نتیجه از طرف درگاه بانکی، پرداخت را تکرار نکنید.' },
  paid: { badge: paid, title: 'پرداخت با موفقیت انجام شد', description: 'سفارش بستهٔ جامع هفت سیستم ثبت شد. برنامهٔ اختصاصی شما در حال آماده‌سازی است.' },
  incomplete: { badge: warning, title: 'پرداخت کامل نشد', description: 'پرداخت این سفارش به پایان نرسید. برای ادامه می‌توانید دوباره تلاش کنید.' },
  unknown: { badge: clock, title: 'نتیجهٔ پرداخت هنوز مشخص نیست', description: 'وضعیت سفارش از درگاه استعلام می‌شود. تا اعلام نتیجه، پرداخت را تکرار نکنید.' },
  preparing: { badge: preparing, title: 'برنامه در حال آماده‌سازی است', description: 'برنامهٔ هفت سیستم بر اساس جمع‌بندی جلسهٔ شما در حال آماده‌سازی است.' },
} as const

export function OrderPage({ orderId, view, service, onView, onHome, onReview }: {
  orderId: string
  view: OrderView
  service: CheckoutService
  onView: (view: OrderView) => void
  onHome: (animatePreparation?: boolean) => void
  onReview: () => void
}) {
  const [order, setOrder] = useState(() => service.read(orderId))
  const status = order?.status
  const handoff = useRef(false)

  useEffect(() => {
    if (status !== 'redirecting' && status !== 'verifying') return
    const timer = window.setTimeout(() => setOrder(service.advance(orderId, status)), status === 'redirecting' ? 2820 : 1100)
    return () => window.clearTimeout(timer)
  }, [orderId, service, status])

  if (!status) {
    return <section className={shell.screen}>
      <h1>سفارش</h1>
      <p role="status">سفارش در این تب پیدا نشد.</p>
      <footer className={shell.footer}><button type="button" onClick={onReview}>بازگشت به سفارش</button></footer>
    </section>
  }

  if (status === 'paid' && view === 'receipt') {
    return <OrderReceipt onHome={() => onView('preparing')} onBack={() => onView('status')} />
  }

  const sheet: PaymentStatus | 'preparing' = status === 'paid' && view === 'preparing' ? 'preparing' : status
  const waiting = sheet === 'redirecting' || sheet === 'verifying'
  const { badge, title, description } = copy[sheet]
  const goToPreparingHome = () => {
    if (handoff.current) return
    handoff.current = true
    onHome(true)
  }

  return (
    <>
      <OrderReview covered onBack={onReview} onPay={onReview} />
      <ProgramSheet badge={badge} variant={sheet} billing
        entrance={waiting ? 'fade' : 'slide'} onClose={sheet === 'preparing' ? goToPreparingHome : onReview}
        title={title} description={description}>
        {exit => waiting ? (
          <div className={styles.wait} role="status">
            {sheet === 'redirecting'
              ? <span className={styles.gatewayLine} data-payment-progress aria-hidden="true" />
              : <span className={styles.verificationDots} aria-hidden="true"><i /><i /><i /></span>}
            {sheet === 'redirecting' ? 'در حال باز کردن درگاه بانکی' : 'در انتظار پاسخ درگاه بانکی'}
          </div>
        ) : (
          <div className={styles.actions}>
            {sheet === 'paid' && <>
              <button type="button" onClick={goToPreparingHome}><ProgramChevron />بازگشت به خانه</button>
              <button type="button" onClick={() => exit(() => onView('receipt'))}>مشاهدهٔ خلاصهٔ سفارش</button>
            </>}
            {sheet === 'preparing' && <button type="button" onClick={goToPreparingHome}><ProgramChevron />بازگشت به خانه</button>}
            {sheet === 'incomplete' && <>
              <button type="button" onClick={() => setOrder(service.retry(orderId))}><ProgramChevron />تلاش دوباره</button>
              <button type="button" onClick={() => exit(onReview)}>بازگشت به سفارش</button>
            </>}
            {sheet === 'unknown' && <>
              <button type="button" onClick={() => setOrder(service.check(orderId))}><ProgramChevron />بررسی وضعیت پرداخت</button>
              <button type="button" onClick={() => exit(onHome)}>بازگشت به خانه</button>
            </>}
          </div>
        )}
      </ProgramSheet>
    </>
  )
}

function OrderReceipt({ onBack, onHome }: { onBack: () => void; onHome: () => void }) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { title.current?.focus() }, [])

  return (
    <section className={shell.screen} aria-labelledby="order-receipt-title">
      <button type="button" className={shell.back} aria-label="بازگشت" onClick={onBack}><ProgramChevron direction="right" /></button>
      <header className={styles.receiptHeader}>
        <h1 id="order-receipt-title" ref={title} tabIndex={-1}>خلاصهٔ سفارش</h1>
        <p>سفارش بستهٔ جامع هفت سیستم</p>
      </header>
      <section className={styles.success} aria-label="وضعیت پرداخت آزمایشی">
        <svg aria-hidden="true" width="42" height="42" viewBox="0 0 42 42">
          <rect width="42" height="42" rx="8" fill="#63d6a2" />
          <path d="m13 21 5 5 11-11" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2>پرداخت با موفقیت انجام شد</h2>
      </section>
      <section className={styles.card}>
        <h2><span className={styles.receiptIcon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
            <rect x="1.5" y="3.5" width="13" height="9" rx="2" />
            <path d="M2 6.5h12M4.5 9.5h3" strokeLinecap="round" />
          </svg>
        </span>جزئیات سفارش</h2>
        <dl><dt>مبلغ پرداخت‌شده</dt><dd>— تومان</dd></dl>
      </section>
      <section className={styles.card}>
        <h2>محتوای سفارش</h2>
        <ul>{demoSystems.map(system => <li key={system.id}>{system.title}</li>)}</ul>
      </section>
      <footer className={shell.footer}><button type="button" onClick={onHome}><ProgramChevron />بازگشت به خانه</button></footer>
    </section>
  )
}
