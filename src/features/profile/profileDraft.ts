export type Option = { id: string; label: string; description?: string; icon?: string }
type Question = { group: string; lines: readonly string[]; hint?: readonly string[]; options?: readonly Option[] }

const option = (id: string, label: string, icon?: string): Option => ({ id, label, icon })
const make = (prefix: string, labels: string[]) =>
  labels.map((label, index) => option(`${prefix}-${index}`, label, `${prefix}-${index}`))

export const featured = [
  option('retail', 'فروشگاه و خرده‌فروشی', 'retail'),
  option('tech', 'فناوری و نرم‌افزار', 'tech'),
  option('education', 'آموزش', 'education'),
  option('services', 'مشاوره و خدمات حرفه‌ای', 'services'),
  option('construction', 'ساختمان و املاک', 'construction'),
  option('health', 'سلامت و زیبایی', 'health'),
]

export const industryCatalogue = [
  option('manufacturing', 'صنعت و تولید', 'picker-0'),
  option('tech', 'فناوری اطلاعات و نرم‌افزار', 'picker-1'),
  option('retail', 'فروش و توزیع', 'picker-2'),
  option('services', 'خدمات و مشاوره', 'picker-3'),
  option('online', 'کسب‌وکارهای آنلاین', 'picker-4'),
  option('food', 'کشاورزی و صنایع غذایی', 'picker-5'),
  option('construction', 'ساخت‌وساز و املاک', 'picker-6'),
  option('logistics', 'حمل‌ونقل و لجستیک', 'picker-7'),
  option('energy', 'انرژی و پتروشیمی', 'picker-8'),
  ...featured.filter(({ id }) => id === 'education' || id === 'health'),
]

export const reasons = [
  'رشد متوقف شده', 'فروش کاهش پیدا کرده', 'مشتری کافی نداریم', 'سودآوری کمتر شده',
  'حجم کار زیاد شده', 'چالش‌های تیمی', 'می‌خواهم توسعه در بازار', 'فرصت جدید در بازار',
  'سایر موارد', 'از شرایط فعلی راضی نیستم',
].map((label, index) => option(String(index), label))

export const questions: readonly Question[] = [
  {
    group: 'شناخت کسب‌وکار',
    lines: ['کسب‌وکار شما در چه حوزه‌ای فعالیت', 'می‌کند؟'],
    hint: ['این اطلاعات به ما کمک می‌کند تا مسیر مناسب‌تری به شما پیشنهاد دهیم.'],
  },
  {
    group: 'شناخت کسب‌وکار',
    lines: ['کسب‌وکار شما عمدتاً چه چیزی ارائه', 'می‌دهد؟'],
    options: make('offer', ['کالا و محصول', 'مشاوره و خدمات', 'محصول و خدمات', 'پلتفرم یا واسطه‌گری']),
  },
  {
    group: 'شناخت کسب‌وکار',
    lines: ['کسب‌وکار شما در حال حاضر در کدام', 'مرحله قرار دارد؟'],
    options: make('stage', ['آغاز', 'تثبیت اولیه', 'ثبات', 'رشد', 'توسعه', 'توقف رشد', 'بازسازی']),
  },
  {
    group: 'اولویت‌ها',
    lines: ['الان بیشتر می‌خواهید روی چه چیزی کار', 'کنیم؟'],
    hint: ['مهم‌ترین موضوعی را که می‌خواهید به آن بپردازیم انتخاب', 'کنید.'],
    options: [
      ['رشد و فروش', 'افزایش فروش، جذب مشتری، بازاریابی و ...'],
      ['تیم و مدیریت', 'ساخت تیم، استخدام، سیستم‌سازی و ...'],
      ['توسعه', 'توسعه محصول، ورود به بازار جدید و ...'],
      ['مالی و استراتژی', 'سودآوری، نقدینگی، مسیر و استراتژی و ...'],
    ].map(([label, description], index) => ({
      ...option(`priority-${index}`, label, `priority-${index}`), description,
    })),
  },
  {
    group: 'اولویت‌ها',
    lines: ['چه چیزی باعث شده الان به فکر حل این', 'موضوع بیفتید؟'],
    hint: ['حداکثر دو مورد را انتخاب کنید.'],
  },
  {
    group: 'هدف و زمان',
    lines: ['اگر در ۳ تا ۶ ماه آینده فقط یک نتیجه', 'مهم بگیرید، دوست دارید آن نتیجه چه', 'باشد؟'],
    hint: ['این هدف به کوچ کمک می‌کند مسیر مناسب شما را پیشنهاد', 'دهد.'],
  },
  {
    group: 'هدف و زمان',
    lines: ['در هفته چقدر زمان می‌توانید برای این', 'مسیر اختصاص دهید؟'],
    hint: ['واقع‌بینانه زمان قابل اختصاص خود را انتخاب کنید.'],
    options: [
      'کمتر از ۱ ساعت در هفته', '۱ تا ۳ ساعت در هفته', '۳ تا ۵ ساعت در هفته',
      '۵ تا ۸ ساعت در هفته', 'بیش از ۸ ساعت در هفته',
    ].map((label, index) => option(`time-${index}`, label)),
  },
]

export type ProfileDraft = { answers: Record<number, string>; reasons: string[]; goal: string }
const emptyDraft: ProfileDraft = { answers: {}, reasons: [], goal: '' }
export const goalLimit = 300
const storageKey = 'raya-profile-v2'

export function loadDraft(): ProfileDraft {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null')
    if (!saved || typeof saved !== 'object') return emptyDraft

    const answers: Record<number, string> = {}
    questions.forEach((question, index) => {
      const step = index + 1
      const value = saved.answers?.[step]
      const options = step === 1 ? [...featured, ...industryCatalogue] : question.options
      if (options?.some(({ id }) => id === value)) answers[step] = value
    })
    return {
      answers,
      reasons: Array.isArray(saved.reasons)
        ? reasons.filter(({ id }) => saved.reasons.includes(id)).slice(0, 2).map(({ id }) => id)
        : [],
      goal: typeof saved.goal === 'string' ? saved.goal.slice(0, goalLimit) : '',
    }
  } catch {
    return emptyDraft
  }
}

export function storeDraft(value: ProfileDraft) {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(value))
  } catch {
    // The form still keeps its draft in memory when storage is unavailable.
  }
}

export function hasAnswer(draft: ProfileDraft, step: number) {
  if (step === 5) return draft.reasons.length > 0
  if (step === 6) return Boolean(draft.goal.trim())
  return Boolean(draft.answers[step])
}

function normalize(text: string) {
  return text.toLowerCase().replaceAll('ي', 'ی').replaceAll('ك', 'ک')
    .replaceAll('\u200c', ' ').replaceAll('\u200d', ' ').replace(/[\s-]+/g, ' ').trim()
}

export function searchIndustries(query: string) {
  const match = normalize(query)
  return industryCatalogue.filter(({ id, label }) => {
    const alternate = featured.find(item => item.id === id)?.label ?? ''
    return normalize(label).includes(match) || normalize(alternate).includes(match)
  })
}
