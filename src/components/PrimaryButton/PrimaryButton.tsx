import navigationArrow from './navigation-arrow.svg'
import type { MouseEventHandler, ReactNode } from 'react'
import styles from './PrimaryButton.module.css'

type PrimaryButtonProps = {
  children: ReactNode
  type?: 'button' | 'submit'
  form?: string
  disabled?: boolean
  appearance?: 'account' | 'program'
  compact?: boolean
  showArrow?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export function PrimaryButton({
  children,
  type = 'button',
  form,
  disabled,
  appearance = 'account',
  compact = false,
  showArrow = false,
  onClick,
}: PrimaryButtonProps) {
  return (
    <button
      className={styles.button}
      type={type}
      form={form}
      disabled={disabled}
      data-appearance={appearance}
      data-compact={compact}
      data-arrow={showArrow}
      onClick={onClick}
    >
      <span>{children}</span>
      {showArrow && (
        <img
          src={navigationArrow}
          alt=""
          className={styles.arrow}
          width="14"
          height="14"
        />
      )}
    </button>
  )
}
