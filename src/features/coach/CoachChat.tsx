import { ScrollArea } from '../../components/ScrollArea/ScrollArea'
import { TypingDots } from '../../components/TypingDots/TypingDots'
import { useEffect, useRef } from 'react'
import attach from '../../assets/coach/composer-attach.svg'
import mic from '../../assets/coach/composer-mic.svg'
import send from '../../assets/coach/composer-send.svg'
import { CoachIcon, VoiceWave } from './CoachIcons'
import type { CoachMessage } from './coachSession'
import styles from './CoachChat.module.css'

export function CoachChat({ messages, draft, pending, error, onDraft, onSend, onVoice }: {
  messages: readonly CoachMessage[]
  draft: string
  pending: boolean
  error: string
  onDraft: (value: string) => void
  onSend: () => void
  onVoice: () => void
}) {
  const title = useRef<HTMLHeadingElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const followLatest = useRef(true)

  useEffect(() => {
    title.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const list = log.current
    if (list && followLatest.current) list.scrollTop = list.scrollHeight
  }, [messages, pending])

  return (
    <section className={styles.chat} aria-labelledby="coach-chat-title">
      <h2 className={styles.srOnly} id="coach-chat-title" tabIndex={-1} ref={title}>گفت‌وگو با کوچ</h2>
      <ScrollArea className={styles.log} viewportClassName={styles.logView} contentClassName={styles.logContents} role="log" tabIndex={0} aria-label="پیام‌های جلسه" ref={log}
        onScroll={(event) => {
          const list = event.currentTarget
          followLatest.current = list.scrollHeight - list.scrollTop - list.clientHeight < 28
        }}>
        {messages.map(({ id, author, text, time }) => (
          <div className={styles.message} data-author={author} key={id}>
            <span className={styles.avatar} aria-hidden="true">
              {author === 'coach' ? <VoiceWave /> : <CoachIcon name="user" />}
            </span>
            <article className={styles.bubble}>
              <header><span>{author === 'coach' ? 'کوچ هوشمند' : 'شما'}</span><time dir="ltr">{time}</time></header>
              <p dir="auto">{text}</p>
            </article>
          </div>
        ))}
        {pending && <p className={styles.typing} role="status"><TypingDots /><span className={styles.srOnly}>کوچ در حال تایپ…</span></p>}
      </ScrollArea>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); onSend() }}>
        <button type="button" onClick={onVoice} aria-label="بازگشت به مکالمه صوتی"><img src={mic} alt="" /></button>
        <button type="submit" className={styles.send} aria-label="ارسال پیام" disabled={!draft.trim() || pending}><img src={send} alt="" /></button>
        <input aria-label="متن پیام" placeholder="پیام خود را بنویسید…" dir="auto"
          value={draft} maxLength={1000} onChange={(event) => onDraft(event.target.value)} />
        <button type="button" aria-label="افزودن پیوست" disabled><img src={attach} alt="" /></button>
      </form>
    </section>
  )
}
