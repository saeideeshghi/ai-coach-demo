import exitIcon from './exit-icon.svg'
import type { MouseEventHandler, ReactNode } from 'react'
import styles from './SecondaryButton.module.css'

type SecondaryButtonProps = {
  children: ReactNode
  type?: 'button' | 'submit'
  disabled?: boolean
  appearance?: 'neutral' | 'accent-outline' | 'destructive'
  compact?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export function SecondaryButton({
  children,
  type = 'button',
  disabled,
  appearance = 'neutral',
  compact = false,
  onClick,
}: SecondaryButtonProps) {
  return (
    <button
      className={styles.button}
      type={type}
      disabled={disabled}
      data-appearance={appearance}
      data-compact={compact}
      onClick={onClick}
    >
      {appearance === 'destructive' && (
        <img
          src={exitIcon}
          alt=""
          className={styles.exitIcon}
          width="18"
          height="18"
        />
      )}
      {children}
    </button>
  )
}
