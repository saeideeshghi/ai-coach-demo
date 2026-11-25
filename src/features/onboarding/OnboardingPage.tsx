import { useEffect, useRef } from 'react'
import growth from '../../assets/onboarding/onboarding-03.webp'
import conversation from '../../assets/onboarding/onboarding-04.webp'
import future from '../../assets/onboarding/onboarding-05.webp'
import brandMark from '../../assets/onboarding/brand-mark.svg'
import chevron from '../../assets/onboarding/onboarding-chevron.svg'
import styles from './OnboardingPage.module.css'

export type OnboardingStep = 1 | 2 | 3

const steps = [1, 2, 3] as const
const labels = new Intl.NumberFormat('fa-IR')

const slides = {
  1: {
    hero: growth,
    title: 'همراه هوشمند شما',
    emphasis: 'در مسیر رشد',
    copy: [
      'با برنامه‌های تخصصی و راهکارهای عملی، مهارت‌های خود و',
      'کسب‌وکارتان را به سطح بالاتری برسانید.',
    ],
  },
  2: {
    hero: conversation,
    title: 'گفت‌وگو با کوچ هوشمند و',
    emphasis: 'شخصی‌سازی‌شده',
    copy: [
      'در جلسات تعاملی و هدفمند، با راهبری هوشمند، مسیر رشد',
      'خود و کسب‌وکارتان را شفاف‌تر و دقیق‌تر پیش ببرید.',
    ],
  },
  3: {
    hero: future,
    title: 'قدم‌به‌قدم',
    emphasis: 'تا آینده‌ای بزرگ‌تر',
    copy: [
      'با حمایت یک همراه حرفه‌ای، برنامه‌ریزی کنید،',
      'اجرا کنید و نتایج ملموس بسازید.',
    ],
  },
} as const

export function OnboardingPage({ step, onSelect, onFinish }: {
  step: OnboardingStep
  onSelect: (step: OnboardingStep) => void
  onFinish: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  const slide = slides[step]
  const next = step === 3 ? undefined : steps[step]

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [step])

  return (
    <section className={styles.screen} aria-label="معرفی Ai Coach" data-slide={step}>
      <img className={styles.hero} src={slide.hero} alt="" />

      <button className={styles.skip} data-onboarding-skip type="button" onClick={onFinish}>
        رد کردن
      </button>

      <div className={styles.intro}>
        <img className={styles.mark} src={brandMark} alt="" />
        <div className={styles.accent} aria-hidden="true" />
        <h1 className={styles.title} ref={heading} tabIndex={-1}>
          {slide.title}{' '}
          <span>{slide.emphasis}</span>
        </h1>
        <p className={styles.copy} data-onboarding-copy>
          {slide.copy[0]} <br className={styles.referenceBreak} />
          {slide.copy[1]}
        </p>
      </div>

      <footer className={styles.footer}>
        <div className={styles.progress} role="group" aria-label="انتخاب اسلاید معرفی">
          {steps.map((candidate) => (
            <button
              key={candidate}
              type="button"
              aria-label={`اسلاید ${labels.format(candidate)}`}
              aria-current={candidate === step ? 'step' : undefined}
              onClick={() => onSelect(candidate)}
            />
          ))}
        </div>
        <button
          className={styles.next}
          data-onboarding-next
          type="button"
          onClick={next ? () => onSelect(next) : onFinish}
        >
          {next ? 'بعدی' : 'شروع کنید'}
          <img width="6" height="10" src={chevron} alt="" />
        </button>
      </footer>
    </section>
  )
}
