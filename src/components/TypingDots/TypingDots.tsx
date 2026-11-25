import styles from './TypingDots.module.css'

export function TypingDots() {
  return <span className={styles.dots} aria-hidden="true">
    <i data-typing-dot="" /><i data-typing-dot="" /><i data-typing-dot="" />
  </span>
}
