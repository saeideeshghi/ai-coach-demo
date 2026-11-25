import brand from '../../assets/coach/summary-brand.svg'
import coach from '../../assets/coach/summary-coach.svg'
import course from '../../assets/coach/summary-course.svg'
import history from '../../assets/coach/summary-history.svg'
import progress from '../../assets/coach/summary-progress.svg'
import styles from './ProgramNavigation.module.css'

export function ProgramNavigation({ current, onHome, onCoaching, onFollowup, onLearning, onHistory }: {
  current: 'home' | 'coaching' | 'followup' | 'learning' | 'history'
  onHome: () => void
  onCoaching: () => void
  onFollowup: () => void
  onLearning: () => void
  onHistory: () => void
}) {
  return (
    <nav className={styles.nav} aria-label="نوار اصلی">
      <button type="button" className={styles.coaching} aria-current={current === 'coaching' ? 'page' : undefined}
        onClick={onCoaching}>
        <img src={coach} alt="" />کوچینگ
      </button>
      <button type="button" className={styles.learning} aria-current={current === 'learning' ? 'page' : undefined}
        onClick={onLearning}><img src={course} alt="" />آموزش</button>
      <button type="button" className={styles.home} aria-label="خانه" aria-current={current === 'home' ? 'page' : undefined}
        onClick={onHome}>
        <img src={brand} alt="" />
      </button>
      <button type="button" className={styles.followup} aria-current={current === 'followup' ? 'page' : undefined}
        onClick={onFollowup}><img src={progress} alt="" />پیگیری</button>
      <button type="button" className={styles.history} aria-current={current === 'history' ? 'page' : undefined} onClick={onHistory}><img src={history} alt="" />سوابق</button>
    </nav>
  )
}

