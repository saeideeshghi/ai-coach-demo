import { useEffect, useRef } from 'react'
import badge from '../../assets/account/created-badge.svg'
import { useSheetMotion } from '../../components/ProgramSheet/useSheetMotion'
import motion from '../../components/ProgramSheet/sheetMotion.module.css'
import { handleDialogKey } from './dialogKeyboard'
import styles from './AccountCreatedSheet.module.css'

export function AccountCreatedSheet({ onClose, onContinue }: { onClose: () => void; onContinue: () => void }) {
  const { backdrop, panel, closing, exit } = useSheetMotion()
  const title = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    title.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className={styles.overlay + ' ' + motion.overlay} data-motion={closing ? 'closing' : undefined}>
      <div ref={backdrop} className={motion.backdrop} aria-hidden="true" />
      <section
        ref={panel} inert={closing} className={styles.sheet + ' ' + motion.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-created-title"
        aria-describedby="account-created-copy account-created-demo"
        onKeyDown={(event) => handleDialogKey(event, () => exit(onClose))}
      >
        <span className={styles.handle} aria-hidden="true" />
        <img className={styles.badge} src={badge} alt="" width="68" height="68" />
        <h1 className={styles.title} id="account-created-title" ref={title} tabIndex={-1}>
          حساب شما با موفقیت ایجاد شد.
        </h1>
        <p className={styles.copy} id="account-created-copy">
          پروفایل اختصاصی شما با موفقیت راه‌اندازی شد؛ <br className={styles.referenceBreak} />
          لطفاً برای دریافت راهنمایی‌های دقیق‌تر و <br className={styles.referenceBreak} />
          شخصی‌سازی‌شده از سوی کوچ اختصاصی‌تان، <br className={styles.referenceBreak} />
          اطلاعات پایه کسب‌وکار خود را تکمیل فرمایید.
        </p>
        <p className={styles.visuallyHidden} id="account-created-demo">
          این تأیید آزمایشی است. برای بازگشت به فرم کلید Escape را بزنید.
        </p>
        <button className={styles.action} type="button" onClick={() => exit(onContinue)}>
          شروع تکمیل اطلاعات
        </button>
      </section>
    </div>
  )
}
