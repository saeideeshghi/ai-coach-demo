import { ScrollArea } from '../../components/ScrollArea/ScrollArea'
import { TypingDots } from '../../components/TypingDots/TypingDots'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import brand from '../../assets/coach/summary-brand.svg'
import mic from '../../assets/coach/composer-mic.svg'
import attach from '../../assets/coach/composer-attach.svg'
import send from '../../assets/coach/composer-send.svg'
import documentIcon from '../../assets/coach/summary-document.svg'
import template from '../../assets/program/role-comparison-template.pdf'
import type { ActionItem, ActionService } from './action'
import { ActionIdentity, ActionPageHeading } from './ActionHeader'
import styles from './ActionFlow.module.css'

export function ActionChat({ action, service, onBack, isNextActionPreview }: {
  action: ActionItem
  service: ActionService
  onBack: () => void
  isNextActionPreview: boolean
}) {
  const [messages, setMessages] = useState(() => service.messages(action.id))
  const [draft, setDraft] = useState('')
  const [replyPending, setReplyPending] = useState(false)
  const replyId = useRef<number | null>(null)
  const log = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const current = log.current
    if (current) current.scrollTop = current.scrollHeight
  }, [messages, replyPending])
  useEffect(() => () => { if (replyId.current !== null) window.clearTimeout(replyId.current) }, [])

  function sendMessage(text: string) {
    const message = text.trim()
    if (!message || replyId.current !== null) return
    const sent = service.send(action.id, message)
    setMessages(sent.slice(0, -1))
    setDraft('')
    setReplyPending(true)
    const showReply = () => {
      replyId.current = null
      setMessages(sent)
      setReplyPending(false)
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) showReply()
    else replyId.current = window.setTimeout(showReply, 620)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    sendMessage(draft)
  }

  return <section className={styles.chatScreen}>
    <ActionPageHeading title="گفت‌وگو با کوچ" onBack={onBack} />
    <ActionIdentity action={action} />
    <ScrollArea className={styles.messages} viewportClassName={styles.messagePadding} role="log" aria-label="پیام‌های گفت‌وگو" ref={log} tabIndex={0}>
      {messages.map(message => <div key={message.id} className={styles.message} data-author={message.author}>
        {message.author === 'coach' && <span className={styles.avatar}><img src={brand} alt="" width="22" height="22" /></span>}
        <div>
          <p>{message.text}</p>
          {message.attachment && <a className={styles.attachment} href={template} download="الگوی مقایسه نقش‌ها.pdf">
            <img src={documentIcon} alt="" /><span>الگوی مقایسه نقش‌ها<small>PDF</small></span><span aria-hidden="true">↓</span>
          </a>}
        </div>
      </div>)}
      {replyPending && <div className={styles.typing} role="status" aria-label="کوچ در حال تایپ"><TypingDots /></div>}
    </ScrollArea>
    {messages.some(message => message.attachment) && <div className={styles.suggestions}>
      <button type="button" disabled={replyPending} onClick={() => sendMessage('نمونهٔ تکمیل‌شده')}>نمونهٔ تکمیل‌شده</button>
      <button type="button" disabled={replyPending} onClick={() => sendMessage('خلأها را چطور پیدا کنم؟')}>خلأها را چطور پیدا کنم؟</button>
    </div>}
    <form className={styles.composer} onSubmit={submit}>
      <button type="button" className={styles.tool} disabled aria-label="پیام صوتی"><img src={mic} alt="" width="15" height="15" /></button>
      <button type="button" className={styles.tool} disabled={replyPending}
        aria-label={isNextActionPreview ? 'درخواست نمونهٔ شاخص' : 'درخواست فایل نمونه'}
        onClick={() => sendMessage(isNextActionPreview ? 'یک نمونه از شاخص‌های عملکرد را بفرست.' : 'الگوی مقایسه نقش‌ها را بفرست.')}>
        <img src={attach} alt="" width="16" height="16" />
      </button>
      <input type="text" aria-label="پیام" placeholder="پیام خود را بنویسید…" value={draft} maxLength={700}
        dir={draft ? 'auto' : 'rtl'} onChange={event => setDraft(event.currentTarget.value)} />
      <button type="submit" disabled={!draft.trim() || replyPending} aria-label="ارسال پیام">
        <img src={send} alt="" width="18" height="18" />
      </button>
    </form>
  </section>
}
