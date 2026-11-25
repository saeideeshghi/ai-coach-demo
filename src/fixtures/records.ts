import type { AccountProfile } from '../components/Records/AccountEditor'
import type { NoteContent } from '../components/Records/NoteEditor'
import type { CalendarMonth } from '../components/Records/SessionCalendar'

export type NoteKind = 'session' | 'action' | 'course'
export type Note = NoteContent & { id: string; kind: NoteKind; meta: string }

export const initialNotes: readonly Note[] = [
  { id: 'weekly-priorities', kind: 'session', title: 'جمع‌بندی جلسه و اولویت‌های هفتهٔ بعد',
    description: 'مرور اولویت‌های کلیدی، تصمیم‌های گرفته‌شده و اقدام‌های پیگیری برای هفتهٔ آینده.', meta: 'دوشنبه ۱۸ آبان ۱۴۰۵', sessionId: 'sh-18-am' },
  { id: 'business-review', kind: 'action', title: 'تحلیل وضعیت فعلی کسب‌وکار',
    description: 'بررسی جایگاه فعلی در بازار، تحلیل رقبا و جمع‌آوری داده‌های موردنیاز برای تصمیم‌گیری.', meta: 'دوشنبه ۱۸ آبان ۱۴۰۵' },
  { id: 'team-roles', kind: 'session', title: 'تفویض مسئولیت و ساختارسازی تیم',
    description: 'تعیین نقش‌ها، شفاف‌سازی مسئولیت‌ها و برنامهٔ پیگیری اجرای ساختار جدید.', meta: 'یکشنبه ۱۷ آبان ۱۴۰۵', sessionId: 'sh-18-pm' },
  { id: 'sales-metrics', kind: 'action', title: 'پایش فروش و شاخص‌های کلیدی',
    description: 'بررسی گزارش فروش، کنترل شاخص‌های کلیدی و تنظیم چرخهٔ گزارش‌دهی هفتگی.', meta: 'شنبه ۱۶ آبان ۱۴۰۵' },
  { id: 'course-notes', kind: 'course', title: 'مبانی سیستم مدیریت کسب‌وکار',
    description: 'مرور اصول تصمیم‌گیری استراتژیک، معیارهای انتخاب و حوزه‌های تمرکز برای پیشرفت.', meta: 'شنبه ۱۶ آبان ۱۴۰۵' },
]

export const recordSessions = [
  { id: 'mor-8', day: 8, date: 'پنجشنبه ۸ مرداد ۱۴۰۵', title: 'جلسهٔ مرور مسیر رشد', description: 'بررسی نتیجهٔ اقدامات پیشین.', meta: '۱۱:۰۰ · ۳۰ دقیقه', status: 'completed', summary: 'مسیر رشد و اقدامات انجام‌شده مرور شد.' },
  { id: 'sh-18-am', day: 18, date: 'چهارشنبه ۱۸ شهریور ۱۴۰۵', title: 'کوچینگ رشد کسب‌وکار', description: 'بررسی پیشرفت، چالش‌های اجرایی و اولویت‌های مرحلهٔ بعد', meta: '۱۰:۳۰ · ۴۵ دقیقه', status: 'completed', summary: 'نتایج اقدامات دورهٔ قبل بررسی شد، چالش‌های اجرایی مرور شدند و اولویت‌های دو هفتهٔ آینده مشخص شد.' },
  { id: 'sh-18-pm', day: 18, date: 'چهارشنبه ۱۸ شهریور ۱۴۰۵', title: 'مرور اهداف و برنامه‌ریزی', description: 'مرور اهداف جلسه، وضعیت اقدامات و اولویت‌های برنامه‌ریزی', meta: '۱۶:۰۰ · ۳۰ دقیقه', status: 'completed', summary: 'در این جلسه، پیشرفت اهداف مرور و دربارهٔ برنامهٔ اقدام و اولویت‌بندی مراحل بعد گفت‌وگو شد.' },
  { id: 'sh-22', day: 22, date: 'یکشنبه ۲۲ شهریور ۱۴۰۵', title: 'پیگیری اقدامات', description: 'مرور نتایج اقدام فعلی.', meta: '۱۴:۰۰ · ۳۰ دقیقه', status: 'scheduled' },
] as const

export const months: readonly (CalendarMonth & { id: string; initial: number })[] = [
  { id: 'mordad', label: 'مرداد ۱۴۰۵', days: 31, leadingDays: 5, initial: 8, sessions: recordSessions.slice(0, 1) },
  { id: 'shahrivar', label: 'شهریور ۱۴۰۵', days: 31, leadingDays: 1, initial: 18, sessions: recordSessions.slice(1) },
]

export const alerts = [
  { id: 'summary', kind: 'summary', title: 'جمع‌بندی جلسهٔ رایگان آماده است', description: 'جمع‌بندی کوچ و پیشنهاد شروع برنامه را ببینید.', meta: '۱۲ آبان' },
  { id: 'action', kind: 'action', title: 'یادآوری اقدام', description: 'مقایسهٔ نقش‌های فعلی با ساختار مطلوب · موعد فردا', meta: '۳ ساعت پیش' },
  { id: 'session', kind: 'session', title: 'جلسهٔ بعدی', description: 'جلسهٔ بعدی کوچینگ ساعت ۱۴ برگزار می‌شود.', meta: 'دیروز' },
  { id: 'course', kind: 'course', title: 'آموزش بستهٔ جامع فعال شد', description: 'دوره‌ها و درس‌ها در تب آموزش در دسترس‌اند.', meta: '۱ روز پیش' },
  { id: 'progress', kind: 'progress', title: 'پیشرفت یکی از زیرسیستم‌ها ثبت شد', description: 'پیشرفت اقدامات را از بخش پیگیری ببینید.', meta: '۳ روز پیش' },
] as const

const profile: AccountProfile = { name: 'سامان رضایی', job: 'مدیر توسعه کسب‌وکار', email: 'saman.rezaei@coachai.ir', phone: '09123456789' }
export const preferences = [
  { key: 'alerts', label: 'اعلان‌ها' },
  { key: 'reminders', label: 'یادآوری جلسات و اقدامات' },
  { key: 'reports', label: 'دریافت گزارش‌های دوره' },
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isNote(value: unknown): value is Note {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' &&
    typeof value.description === 'string' && typeof value.meta === 'string' &&
    (value.kind === 'session' || value.kind === 'action' || value.kind === 'course') &&
    (value.tag === undefined || value.tag === 'action' || value.tag === 'learning' || value.tag === 'feedback') &&
    (value.sessionId === undefined || typeof value.sessionId === 'string')
}

type Preferences = Record<(typeof preferences)[number]['key'], boolean>

function read<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem('raya-records:' + key) ?? 'null')
    return isValid(value) ? value : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): T {
  sessionStorage.setItem('raya-records:' + key, JSON.stringify(value))
  return value
}

export const records = {
  notes: () => read('notes', initialNotes, (value): value is readonly Note[] => Array.isArray(value) && value.every(isNote)),
  saveNote(note: Note) {
    const notes = this.notes()
    save('notes', notes.some(item => item.id === note.id) ? notes.map(item => item.id === note.id ? note : item) : [note, ...notes])
  },
  profile: () => read('account', profile, (value): value is AccountProfile => isRecord(value) &&
    typeof value.name === 'string' && typeof value.job === 'string' &&
    typeof value.email === 'string' && typeof value.phone === 'string'),
  saveProfile: (value: AccountProfile) => save('account', value),
  preferences: () => read<Preferences>('preferences', { alerts: true, reminders: true, reports: false },
    (value): value is Preferences => isRecord(value) && preferences.every(({ key }) => typeof value[key] === 'boolean')),
  savePreferences: (value: Preferences) => save('preferences', value),
  readAlerts: () => read<string[]>('read', ['course', 'progress'],
    (value): value is string[] => Array.isArray(value) && value.every(id => typeof id === 'string')),
  markRead(id: string) { save('read', [...new Set([...this.readAlerts(), id])]) },
}
