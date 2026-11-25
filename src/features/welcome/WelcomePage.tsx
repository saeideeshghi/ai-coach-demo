import { useEffect, useRef } from 'react'
import logo from '../../assets/welcome/welcome-logo.png'
import wordmark from '../../assets/welcome/welcome-wordmark.svg'
import chevron from '../../assets/welcome/welcome-chevron.svg'
import styles from './WelcomePage.module.css'

export function WelcomePage({ onSignup, onSignin }: { onSignup: () => void; onSignin: () => void }) {
  const title = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    title.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section className={styles.screen} aria-labelledby="welcome-title">
      <div className={styles.brand}>
        <img src={logo} className={styles.logo} alt="" width="78" height="79" />
        <img src={wordmark} className={styles.wordmark} alt="AI Business Coaching" lang="en" width="90" height="38" />
      </div>
      <h1 className={styles.title} id="welcome-title" ref={title} tabIndex={-1}>
        خوش آمدید
      </h1>
      <p className={styles.copy}>
        برای ادامه، وارد حساب کاربری خود شوید
        <br />
        یا حساب جدید بسازید.
      </p>
      <span className={styles.accent} aria-hidden="true" />
      <div className={styles.actions}>
        <button className={styles.signin} type="button" onClick={onSignin}>
          ورود به حساب
          <img src={chevron} width="8" height="12" alt="" />
        </button>
        <button className={styles.signup} type="button" onClick={onSignup}>
          ثبت نام
          <img src={chevron} width="8" height="12" alt="" />
        </button>
      </div>
    </section>
  )
}
