import type { ActionItem, ActionMessage, ActionReview, ActionRevision, ActionService } from '../features/actions/action'

export const demoAction: ActionItem = {
  id: 'compare-roles',
  position: 2,
  title: 'مقایسهٔ نقش‌های فعلی با ساختار مطلوب',
  system: 'مبانی سیستم مدیریت کسب‌وکار',
  subsystem: 'توافق‌نامه‌های نقش، مسئولیت و نتایج مورد انتظار',
  reason: 'این مقایسه، مسئولیت‌های مشترک و نقش‌های بدون مسئول را روشن می‌کند.',
  steps: [
    'نقش‌ها و مسئولیت‌های فعلی تیم را مرور کنید.',
    'آن‌ها را با ساختار مطلوب مقایسه کنید.',
    'تفاوت‌ها و ابهام‌ها را یادداشت کنید.',
  ],
  output: 'فهرست تفاوت نقش‌ها و مسئولیت‌هایی که باید روشن شوند.',
  notes: 'برای هر مسئولیت مشترک، یک مسئول اصلی مشخص کنید و نتیجهٔ مورد انتظار را کنار آن بنویسید.',
}

export const demoNextAction: ActionItem = {
  ...demoAction,
  id: 'performance-indicators',
  position: 3,
  title: 'تعیین شاخص‌های ارزیابی عملکرد',
  reason: 'شاخص‌های مشخص به تیم کمک می‌کنند نتیجهٔ هر مسئولیت را اندازه‌گیری کند.',
  steps: [
    'نتیجهٔ مورد انتظار هر نقش را مرور کنید.',
    'برای هر نقش یک شاخص قابل اندازه‌گیری انتخاب کنید.',
    'مسئول و زمان بررسی هر شاخص را مشخص کنید.',
  ],
  output: 'جدول شاخص‌ها، مسئول و زمان بررسی هر شاخص.',
  notes: 'شاخص‌ها را با نتیجهٔ مورد انتظار نقش مرتبط کنید.',
}

export const demoActionTitles = [
  'تحلیل وضعیت فعلی تیم',
  demoAction.title,
  demoNextAction.title,
  'طراحی برنامهٔ اجرایی مسئولیت‌ها',
  'اجرای آزمایشی تقسیم مسئولیت‌ها',
  'بازبینی نتیجه و اصلاح نقش‌ها',
] as const

const welcomeMessage = 'سلام سامان. در مقایسهٔ نقش‌های فعلی با ساختار مطلوب، روی کدام بخش کار می‌کنی؟'
const nextActionMessage = 'برای هر نقش، یک شاخص قابل اندازه‌گیری تعریف کنیم. از کدام نقش می‌خواهی شروع کنی؟'
const actionKey = (id: string, field: string) => 'raya-demo-action:' + id + ':' + field

type StoredReview = ActionReview & { dueAt?: number; revision?: ActionRevision }
const reviewDelay = 20_000

function readReview(id: string): StoredReview {
  const saved = sessionStorage.getItem(actionKey(id, 'review'))
  if (saved === '1') return { status: 'review', revised: false }
  if (saved) {
    try {
      const review = JSON.parse(saved) as Partial<StoredReview> | null
      if (review && typeof review.revised === 'boolean' &&
        (review.status === 'current' || review.status === 'review' || review.status === 'revision' || review.status === 'approved') &&
        (review.dueAt === undefined || Number.isSafeInteger(review.dueAt))) {
        return { ...review, status: review.status, revised: review.revised }
      }
    } catch {
      // Discard unreadable records from earlier demo tabs.
    }
  }
  return { status: 'current', revised: false }
}

function saveReview(id: string, review: StoredReview) {
  sessionStorage.setItem(actionKey(id, 'review'), JSON.stringify(review))
  return review
}

export const demoActions: ActionService = {
  read: readReview,
  check(id) {
    const review = readReview(id)
    if (review.status !== 'review' || Date.now() < (review.dueAt ?? 0)) return review
    return saveReview(id, { ...review, status: review.revised || id !== demoAction.id ? 'approved' : 'revision' })
  },
  submit(id, revision) {
    const review = readReview(id)
    if (revision ? review.status !== 'revision' : review.status !== 'current') return
    saveReview(id, { status: 'review', revised: Boolean(revision), dueAt: Date.now() + reviewDelay, revision })
  },
  messages(id) {
    const saved = sessionStorage.getItem(actionKey(id, 'messages'))
    if (saved) {
      try {
        const messages = JSON.parse(saved) as Partial<ActionMessage>[] | null
        if (Array.isArray(messages) && messages.every(message => message &&
          typeof message.id === 'string' && typeof message.text === 'string' &&
          (message.author === 'user' || message.author === 'coach') &&
          (message.attachment === undefined || typeof message.attachment === 'boolean'))) {
          return messages as ActionMessage[]
        }
      } catch {
        // Keep the conversation usable if the local draft cannot be read.
      }
    }
    return [{ id: 'intro', author: 'coach', text: id === demoNextAction.id ? nextActionMessage : welcomeMessage }]
  },
  send(id, text) {
    const messages = this.messages(id)
    const indicators = id === demoNextAction.id
    const attachment = !indicators && /نمونه|جدول|الگو|PDF/i.test(text)
    const next: ActionMessage[] = [
      ...messages,
      { id: crypto.randomUUID(), author: 'user', text },
      { id: crypto.randomUUID(), author: 'coach', attachment, text: indicators
        ? 'برای هر شاخص واحد سنجش، هدف و دورهٔ بازبینی بنویس. مثلاً برای فروش، نرخ تبدیل هفتگی را اندازه بگیر.'
        : attachment
        ? 'الگوی مقایسه نقش‌ها را براساس شرایط تیم خودت تکمیل کن.'
        : 'از مسئولیت‌هایی شروع کن که بین دو یا چند نفر مشترک‌اند. برای هر مورد، نقش فعلی و نقش مطلوب را در یک جدول بنویس.' },
    ]
    sessionStorage.setItem(actionKey(id, 'messages'), JSON.stringify(next))
    return next
  },
}
