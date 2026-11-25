import type { ReactNode } from 'react'
import onboardingStatus from '../../assets/phone/status-bar.svg'
import welcomeStatus from '../../assets/phone/welcome-status.svg'
import accountStatus from '../../assets/phone/account-status.svg'
import recoveryStatus from '../../assets/phone/recovery-status.svg'
import profileStatus from '../../assets/phone/profile-status.svg'
import followupStatus from '../../assets/phone/followup-status.svg'
import homeStatus from '../../assets/phone/home-status.svg'
import summaryStatus from '../../assets/phone/summary-status.svg'
import styles from './PhonePreview.module.css'

const statusBars = {
  opening: onboardingStatus,
  onboarding: onboardingStatus,
  welcome: welcomeStatus,
  account: accountStatus,
  recovery: recoveryStatus,
  profile: profileStatus,
  coach: profileStatus,
  summary: summaryStatus,
  home: homeStatus,
  followup: followupStatus,
  package: summaryStatus,
}

export function PhonePreview({ children, variant, statusInFront = false }: {
  children: ReactNode
  variant: keyof typeof statusBars
  statusInFront?: boolean
}) {
  return (
    <div className={styles.frame} data-variant={variant}>
      {children}
      <img className={styles.status} data-in-front={statusInFront || undefined} src={statusBars[variant]} alt="" draggable={false} />
    </div>
  )
}
