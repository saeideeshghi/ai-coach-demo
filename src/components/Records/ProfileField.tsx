import { useId } from 'react'
import styles from './ProfileField.module.css'

type ProfileFieldProps = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel'
  autoComplete?: string
  defaultValue?: string
  required?: boolean
  pattern?: string
  onValueChange?: (value: string) => void
}

export function ProfileField({
  name,
  label,
  type = 'text',
  autoComplete,
  defaultValue,
  required,
  pattern,
  onValueChange,
}: ProfileFieldProps) {
  const id = useId()
  return (
    <label className={styles.field} htmlFor={id}>
      {label}
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        dir={type === 'text' ? 'auto' : 'ltr'}
        required={required}
        pattern={pattern}
        onChange={(event) => onValueChange?.(event.currentTarget.value)}
      />
    </label>
  )
}
