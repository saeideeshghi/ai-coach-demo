import { demoSessionId, markDemoSessionComplete, readDemoCorrection, storeDemoCorrection } from './demoSessionStorage'
import { coachSpeechLevels } from './coachSpeechLevels'
import avatarUrl from '../assets/coach/summary-profile.png'
import posterUrl from '../assets/coach/coach-ready.webp'
import chatPosterUrl from '../assets/coach/coach-active.webp'
import videoUrl from '../assets/coach/coach-demo.mp4?url'
import sampleUrl from '../assets/coach/coach-voice-sample.m4a?url'
import type { CoachMessage, CoachService, VoicePreferences } from '../features/coach/coachSession'

const defaults: VoicePreferences = { voice: 'first', speed: 1, noise: true, transcript: false }
let saved = defaults

const voices = [
  { id: 'first', name: 'صدای اول', description: 'آرام و صمیمی', sampleUrl },
  { id: 'second', name: 'صدای دوم', description: 'رسا و پرانرژی' },
]
const initialMessages: readonly CoachMessage[] = [
  { id: 'demo-1', author: 'coach', time: '09:41', text: 'سلام سامان، کاهش فروش و چالش‌های تیمی را ثبت کردی. کدام موضوع الان برایت مهم‌تر است تا گفت‌وگو را از همان شروع کنیم؟' },
  { id: 'demo-2', author: 'user', time: '09:42', text: 'از کاهش فروش و چالش‌های تیم شروع کنیم.' },
  { id: 'demo-3', author: 'coach', time: '09:42', text: 'در چه بازه‌ای فروش کم شده؟\nچالش اصلی تیم چیست و چه اثری روی فروش دارد؟\nاول این دو موضوع را دقیق‌تر بررسی کنیم.' },
]

function check(sessionId: string, signal: AbortSignal) {
  signal.throwIfAborted()
  if (sessionId !== demoSessionId) throw new Error('Demo session not found')
}

export const demoCoachService: CoachService = {
  async open(sessionId, signal) {
    check(sessionId, signal)
    return {
      id: sessionId,
      media: { posterUrl, chatPosterUrl, videoUrl, speechLevels: coachSpeechLevels },
      voices,
      defaults,
      preferences: saved,
      messages: initialMessages,
    }
  },
  async start(sessionId, signal) {
    check(sessionId, signal)
  },
  async sendMessage(sessionId, text, signal) {
    check(sessionId, signal)
    const reply = /فروش|مشتری/.test(text)
      ? 'برای شروع، نرخ تبدیل و دلیل از دست رفتن مشتریان را بررسی کنید.'
      : 'یک نمونهٔ مشخص از این چالش را بگویید تا بتوانیم قدم بعدی را انتخاب کنیم.'

    await new Promise<void>((resolve, reject) => {
      const stop = () => {
        window.clearTimeout(timer)
        reject(signal.reason)
      }
      const timer = window.setTimeout(() => {
        signal.removeEventListener('abort', stop)
        resolve()
      }, 1200)
      signal.addEventListener('abort', stop, { once: true })
    })

    return {
      id: crypto.randomUUID(),
      author: 'coach',
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      text: reply,
    }
  },
  async savePreferences(sessionId, preferences, signal) {
    check(sessionId, signal)
    saved = { ...preferences }
    return saved
  },
  async getSummary(sessionId, signal) {
    check(sessionId, signal)
    return {
      correction: readDemoCorrection(sessionId),
      participant: { name: 'سامان رضایی', date: 'سه‌شنبه ۱۲ آبان ۱۴۰۵', avatarUrl },
      subject: 'فروش و مدیریت تیم',
      overview: 'کاهش فروش و چالش‌های تیم دو دغدغهٔ اصلی‌اند. ارتباط این دو موضوع باید دقیق‌تر بررسی شود.',
      concerns: ['کاهش فروش', 'چالش‌های تیمی', 'بررسی ارتباط این دو دغدغه'],
      recommendation: {
        title: 'مبانی سیستم مدیریت کسب‌وکار',
        detail: 'روشن‌کردن نقش‌ها و مسئولیت‌های تیم به بررسی مسئلهٔ فروش کمک می‌کند.',
        footnote: 'بستهٔ جامع شامل هر ۷ سیستم است.',
      },
    }
  },
  async saveCorrection(sessionId, note, signal) {
    check(sessionId, signal)
    storeDemoCorrection(sessionId, note)
  },
  async end(sessionId, signal) {
    check(sessionId, signal)
    markDemoSessionComplete()
  },
}
