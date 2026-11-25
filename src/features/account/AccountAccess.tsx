import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import apple from '../../assets/account/apple.svg'
import back from '../../assets/account/back.svg'
import changedBadge from '../../assets/account/changed-badge.svg'
import google from '../../assets/account/google.svg'
import recoveredBadge from '../../assets/account/recovered-badge.svg'
import { demoAuth } from '../../fixtures/auth'
import { AccountField } from './AccountField'
import { useSheetMotion } from '../../components/ProgramSheet/useSheetMotion'
import motion from '../../components/ProgramSheet/sheetMotion.module.css'
import { handleDialogKey } from './dialogKeyboard'
import styles from './AccountAccess.module.css'

export type AccessView = 'signin' | 'recovery' | 'sent' | 'reset' | 'changed'
type Destination = AccessView | 'signup' | 'profile' | 'welcome'
type Navigate = (to: Destination, token?: string) => void

const resetRules = [
  { title: 'حداقل ۸ کاراکتر', matches: (text: string) => Array.from(text).length >= 8 },
  { title: 'شامل حداقل یک حرف بزرگ', matches: (text: string) => /\p{Lu}/u.test(text) },
  { title: 'شامل حداقل یک حرف کوچک', matches: (text: string) => /\p{Ll}/u.test(text) },
  { title: 'شامل حداقل یک عدد', matches: (text: string) => /\p{Nd}/u.test(text) },
  { title: 'شامل حداقل یک علامت خاص', matches: (text: string) => /[\p{P}\p{S}]/u.test(text) },
] as const

function Providers({ recovery }: { recovery: boolean }) {
  const action = recovery ? 'بازیابی' : 'ورود'
  return (
    <>
      <div className={styles.divider}>{recovery ? 'یا بازیابی از طریق حساب دیگر' : 'یا'}</div>
      <div className={styles.providers}>
        <button type="button" disabled><img src={google} alt="" />{action} با گوگل</button>
        <button type="button" disabled><img src={apple} alt="" />{action} با اپل</button>
      </div>
    </>
  )
}

type Mode = 'signin' | 'recovery' | 'reset'
type Errors = Partial<Record<'email' | 'password' | 'confirmation', string>>

function AccessForm({ mode, covered, token, initialEmail, onRequest, onNavigate }: {
  mode: Mode
  covered: boolean
  token: string
  initialEmail?: string
  onRequest: (email: string) => void
  onNavigate: Navigate
}) {
  const title = useRef<HTMLHeadingElement>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [notice, setNotice] = useState('')
  const [password, setPassword] = useState('')
  const reset = mode === 'reset'
  const signin = mode === 'signin'
  const recovery = mode === 'recovery'
  const expired = reset && !covered && !demoAuth.hasToken(token)

  useEffect(() => {
    if (!covered) title.current?.focus({ preventScroll: true })
  }, [covered])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const secret = String(data.get('password') ?? '')
    const next: Errors = {}
    if (!reset) {
      const field = form.elements.namedItem('email')
      if (!(field instanceof HTMLInputElement) || !field.validity.valid) next.email = 'ایمیل معتبر وارد کنید.'
    }
    if (signin && !secret) next.password = 'رمز عبور را وارد کنید.'
    if (reset) {
      if (!resetRules.every(({ matches }) => matches(secret))) next.password = 'رمز عبور همهٔ شروط را برآورده نمی‌کند.'
      if (!data.get('confirmation') || data.get('confirmation') !== secret) next.confirmation = 'تکرار رمز عبور یکسان نیست.'
    }
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) {
      const field = form.elements.namedItem(first)
      if (field instanceof HTMLElement) field.focus()
      return
    }
    if (recovery) onRequest(email)
    if (signin) {
      if (demoAuth.signIn(email, secret)) onNavigate('profile')
      else setNotice('ایمیل یا رمز عبور حساب آزمایشی درست نیست.')
    }
    if (reset) {
      if (demoAuth.reset(token, secret)) onNavigate('changed')
      else setNotice('لینک بازیابی معتبر نیست.')
    }
  }

  return (
    <section className={styles.screen} data-mode={mode} inert={covered}>
      <button type="button" className={styles.back} aria-label="بازگشت"
        onClick={() => onNavigate(signin ? 'welcome' : reset ? 'recovery' : 'signin')}>
        <img src={back} alt="" width="10" height="16" />
      </button>
      <header className={styles.header}>
        <h1 ref={title} tabIndex={-1}>
          {expired ? 'لینک بازیابی معتبر نیست.' : signin ? 'ورود به حساب' : recovery ? 'بازیابی رمز عبور' : 'ایجاد رمز عبور جدید'}
        </h1>
        {!expired && (
          <p>
            {signin ? 'برای ادامه، وارد حساب کاربری خود شوید.' : recovery
              ? 'برای دریافت لینک بازیابی، ایمیل مرتبط با حساب خود را وارد کنید.'
              : 'رمز عبور جدید باید حداقل ۸ کاراکتر داشته باشد و ترکیبی از حروف، عدد و علامت باشد.'}
          </p>
        )}
      </header>
      {expired ? (
        <button type="button" className={styles.primary} onClick={() => onNavigate('recovery')}>درخواست لینک بازیابی</button>
      ) : (
        <form className={styles.form} noValidate onSubmit={submit}
          onChange={({ target }) => {
            if (!(target instanceof HTMLInputElement)) return
            setNotice('')
            if (target.name === 'password') setPassword(target.value)
            if (errors[target.name as keyof Errors]) {
              setErrors(previous => ({ ...previous, [target.name]: undefined }))
            }
          }}>
          {!reset && <AccountField name="email" label="ایمیل" type="email" autoComplete="email" error={errors.email} defaultValue={initialEmail} />}
          {!recovery && <AccountField name="password" label={reset ? 'رمز عبور جدید' : 'رمز عبور'} type="password"
            autoComplete={reset ? 'new-password' : 'current-password'} leadingEye={reset} error={errors.password} />}
          {reset && (
            <>
              <AccountField name="confirmation" label="تکرار رمز عبور جدید" type="password"
                autoComplete="new-password" leadingEye error={errors.confirmation} />
              <section className={styles.conditions} aria-label="شرایط رمز عبور">
                <h2>شرایط رمز عبور:</h2>
                <ul>
                  {resetRules.map(({ title, matches }) => <li key={title} data-met={matches(password)}>{title}</li>)}
                </ul>
              </section>
            </>
          )}
          {signin && <button className={styles.textButton} type="button" onClick={() => onNavigate('recovery')}>رمز عبور را فراموش کرده‌اید؟</button>}
          {notice && <p className={styles.error} role="alert">{notice}</p>}
          <button type="submit" className={styles.primary}>{signin ? 'ورود به حساب' : recovery ? 'ارسال لینک بازیابی' : 'تغییر رمز عبور'}</button>
          {recovery && <button className={styles.outline} type="button" onClick={() => onNavigate('signin')}>بازگشت به ورود</button>}
        </form>
      )}
      {!reset && <Providers recovery={recovery} />}
      {signin && <p className={styles.note}>حساب کاربری ندارید؟ <button className={styles.textButton} type="button" onClick={() => onNavigate('signup')}>ثبت نام کنید.</button></p>}
      {recovery && <p className={styles.note}>اگر حساب خود را با گوگل، اپل یا شمارهٔ گوشی‌تان ساخته‌اید، برای ورود از همان روش استفاده کنید.</p>}
    </section>
  )
}

function RecoverySheet({ sent, link, onNavigate, onResend }: {
  sent: boolean
  link?: string
  onNavigate: Navigate
  onResend: () => void
}) {
  const { backdrop, panel, closing, exit } = useSheetMotion()
  const title = useRef<HTMLHeadingElement>(null)
  const [notice, setNotice] = useState('')
  const leave = () => exit(() => onNavigate(sent ? 'recovery' : 'signin'))

  useEffect(() => {
    title.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className={styles.overlay + ' ' + motion.overlay} data-motion={closing ? 'closing' : undefined}>
      <div ref={backdrop} className={motion.backdrop} aria-hidden="true" />
      <section ref={panel} inert={closing} className={styles.sheet + ' ' + motion.panel} data-sent={sent} role="dialog" aria-modal="true" aria-labelledby="access-sheet-title"
        onKeyDown={(event) => handleDialogKey(event, leave)}>
        <span className={styles.handle} aria-hidden="true" />
        <img className={styles.badge} src={sent ? recoveredBadge : changedBadge} width="68" height="68" alt="" />
        <h1 id="access-sheet-title" ref={title} tabIndex={-1}>
          {sent ? 'لینک بازیابی ارسال شد.' : 'رمز عبور شما با موفقیت تغییر کرد.'}
        </h1>
        <p>{sent ? 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید و روی لینک موجود کلیک نمایید.'
          : 'اکنون می‌توانید با رمز عبور جدید وارد حساب خود شوید.'}</p>
        <div className={styles.sheetActions}>
          {sent ? (
            <>
              <button className={styles.primary} type="button" onClick={() => {
                onResend()
                setNotice('درخواست ارسال مجدد آزمایشی ثبت شد.')
              }}>ارسال مجدد لینک</button>
              <button className={styles.outline} type="button" onClick={leave}>ویرایش ایمیل</button>
            </>
          ) : <button className={styles.primary} type="button" onClick={leave}>ورود به حساب</button>}
        </div>
        {sent && link && <button className={styles.demoLink} type="button" onClick={() => exit(() => onNavigate('reset', link))}>باز کردن لینک آزمایشی</button>}
        {notice && <p className={styles.screenReader} role="status">{notice}</p>}
      </section>
    </div>
  )
}

export function AccountAccess({ view, token, onNavigate }: { view: AccessView; token: string; onNavigate: Navigate }) {
  const [request, setRequest] = useState<{ email: string; token?: string }>()
  const sent = view === 'sent'
  const changed = view === 'changed'
  const mode: Mode = sent ? 'recovery' : changed ? 'reset' : view

  function requestLink(email: string) {
    setRequest({ email, token: demoAuth.requestRecovery(email) })
    onNavigate('sent')
  }

  return (
    <>
      <AccessForm key={changed ? 'changed-backdrop' : mode} mode={mode} covered={sent || changed} token={token}
        initialEmail={request?.email} onRequest={requestLink} onNavigate={onNavigate} />
      {(sent || changed) && (
        <RecoverySheet key={view} sent={sent} link={request?.token && demoAuth.hasToken(request.token) ? request.token : undefined} onNavigate={onNavigate}
          onResend={() => {
            if (request) setRequest({ email: request.email, token: demoAuth.requestRecovery(request.email) })
            else onNavigate('recovery')
          }} />
      )}
    </>
  )
}
