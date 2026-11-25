import type { ReactNode } from 'react'
import styles from './PhonePreview.module.css'

export function PhonePreview({ children, variant }: {
  children: ReactNode
  variant: 'opening' | 'onboarding' | 'welcome' | 'account' | 'recovery' | 'profile' | 'coach' | 'summary' | 'home' | 'followup' | 'package'
}) {
  return (
    <div className={styles.frame} data-variant={variant}>
      {children}
    </div>
  )
}
