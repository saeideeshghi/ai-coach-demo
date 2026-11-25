import { useId, useState } from 'react'
import emailIcon from '../../assets/account/email.svg'
import eyeIcon from '../../assets/account/eye.svg'
import nameIcon from '../../assets/account/name.svg'
import passwordIcon from '../../assets/account/password.svg'
import styles from './AccountField.module.css'

const icons = { text: nameIcon, email: emailIcon, password: passwordIcon }

export function AccountField({ name, label, type, autoComplete, error, hintId, defaultValue, leadingEye = false }: {
  name: string
  label: string
  type: keyof typeof icons
  autoComplete: string
  error?: string
  hintId?: string
  defaultValue?: string
  leadingEye?: boolean
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const password = type === 'password'
  const errorId = error ? id + '-error' : undefined

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.control} data-invalid={Boolean(error)} data-leading-eye={leadingEye}>
        {(!password || !leadingEye) && <img src={icons[type]} className={styles.icon} alt="" width="20" height="20" />}
        <input
          id={id}
          name={name}
          type={visible ? 'text' : type}
          autoComplete={autoComplete}
          placeholder={label}
          defaultValue={defaultValue}
          dir={type === 'text' ? 'rtl' : 'ltr'}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        />
        {password && (
          <button
            type="button"
            className={styles.visibility}
            aria-label={`${visible ? 'پنهان کردن' : 'نمایش'} ${label}`}
            aria-controls={id}
            onClick={() => setVisible((previous) => !previous)}
          >
            <img src={eyeIcon} alt="" width="21" height="20" />
          </button>
        )}
      </div>
      {error && <p className={styles.error} id={errorId}>{error}</p>}
    </div>
  )
}
