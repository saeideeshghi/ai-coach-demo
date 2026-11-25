import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import apple from '../../assets/account/apple.svg'
import back from '../../assets/account/back.svg'
import google from '../../assets/account/google.svg'
import { AccountField } from './AccountField'
import { checkSignup } from './signupValidation'
import type { SignupErrors } from './signupValidation'
import styles from './SignupPage.module.css'

export function SignupPage({ onBack, onVerified, onSignin, covered }: {
  onBack: () => void
  onVerified: (email: string, password: string) => boolean
  onSignin: () => void
  covered: boolean
}) {
  const title = useRef<HTMLHeadingElement>(null)
  const hintId = useId()
  const termsErrorId = useId()
  const [errors, setErrors] = useState<SignupErrors>({})

  useEffect(() => {
    if (!covered) title.current?.focus({ preventScroll: true })
  }, [covered])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const next = checkSignup(form)
    const firstError = Object.keys(next)[0]
    setErrors(next)
    if (firstError) {
      const field = form.elements.namedItem(firstError)
      if (field instanceof HTMLElement) field.focus()
      return
    }
    const data = new FormData(form)
    if (!onVerified(String(data.get('email')), String(data.get('password')))) {
      setErrors({ email: 'با این ایمیل حساب آزمایشی ساخته شده است.' })
      const email = form.elements.namedItem('email')
      if (email instanceof HTMLElement) email.focus()
    }
  }

  return (
    <section className={styles.screen} aria-labelledby="signup-title" inert={covered}>
      <button className={styles.back} type="button" onClick={onBack} aria-label="بازگشت">
        <img src={back} alt="" width="10" height="16" />
      </button>
      <header className={styles.header}>
        <h1 id="signup-title" ref={title} tabIndex={-1}>ساخت حساب کاربری</h1>
        <p>با ایجاد حساب، مسیر رشد کسب‌وکار خود را آغاز کنید.</p>
      </header>

      <form className={styles.form} noValidate onSubmit={submit}
        onChange={(event) => {
          const field = event.target
          if (!(field instanceof HTMLInputElement)) return
          if (field.name in errors) {
            setErrors((previous) => ({ ...previous, [field.name]: undefined }))
          }
        }}
      >
        <div className={styles.fields}>
          <div className={styles.names}>
            <AccountField name="firstName" label="نام" type="text" autoComplete="given-name" error={errors.firstName} />
            <AccountField name="lastName" label="نام خانوادگی" type="text" autoComplete="family-name" error={errors.lastName} />
          </div>
          <AccountField name="email" label="ایمیل" type="email" autoComplete="email" error={errors.email} />
          <AccountField name="password" label="رمز عبور" type="password" autoComplete="new-password" error={errors.password} hintId={hintId} />
          <AccountField name="confirmation" label="تکرار رمز عبور" type="password" autoComplete="new-password" error={errors.confirmation} />
        </div>

        <p className={styles.hint} id={hintId}>حداقل ۸ کاراکتر با ترکیب حروف و عدد</p>

        <label className={styles.terms}>
          <input type="checkbox" name="terms" required
            aria-invalid={Boolean(errors.terms)}
            aria-describedby={errors.terms ? termsErrorId : undefined}
          />
          <span>
            با ایجاد حساب، <span className={styles.highlight}>شرایط استفاده</span> و{' '}
            <span className={styles.highlight}>حریم خصوصی</span> را می‌پذیرم.
          </span>
        </label>
        {errors.terms && <p className={styles.error} id={termsErrorId}>{errors.terms}</p>}

        <button className={styles.submit} type="submit">ساخت حساب کاربری</button>
      </form>

      <div className={styles.divider}>یا</div>
      <div className={styles.providers}>
        <button type="button" disabled><img src={google} alt="" width="22" height="22" />ورود با گوگل</button>
        <button type="button" disabled><img src={apple} alt="" width="20" height="22" />ورود با اپل</button>
      </div>
      <p className={styles.signin}>
        از قبل حساب دارید؟ <button type="button" onClick={onSignin}>ورود به حساب</button>
      </p>
    </section>
  )
}
