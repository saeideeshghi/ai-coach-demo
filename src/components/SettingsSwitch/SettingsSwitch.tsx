import { useId } from 'react'
import styles from './SettingsSwitch.module.css'

export function SettingsSwitch({
  label,
  description,
  checked,
  onChange,
  compact = false,
  disabled = false,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  compact?: boolean
  disabled?: boolean
}) {
  const id = useId()
  return (
    <label className={styles.row} data-compact={compact}>
      <span>
        <span id={id}>{label}</span>
        {description && <small id={id + '-description'}>{description}</small>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-labelledby={id}
        aria-describedby={description ? id + '-description' : undefined}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    </label>
  )
}
