import hero from '../assets/learning/course-hero.webp'
import management from '../assets/learning/management.webp'
import leadership from '../assets/learning/leadership.webp'
import marketing from '../assets/learning/marketing.webp'
import finance from '../assets/learning/finance.webp'
import systems from '../assets/learning/systems.webp'
import poster from '../assets/learning/lesson-poster.webp'
import sample from '../assets/learning/lesson-demo.mp4'
import type { Course, LearningProgress } from '../features/learning/learning'

export const demoCourses: readonly Course[] = [
  {
    id: 'business-management',
    title: 'مبانی سیستم مدیریت کسب‌وکار',
    subtitle: 'بنیان‌گذار و مدیرعامل هاکل‌بری',
    instructor: 'Gabriela Hersham',
    image: management,
    hero,
    minutes: 45,
    sample: { source: sample, poster },
    lessons: [
      { id: 'performance-standards', title: 'شناسایی و تعیین استانداردهای عملکرد' },
      { id: 'organizational-structure', title: 'راهبرد ساختار سازمانی' },
      { id: 'role-agreements', title: 'توافق‌نامه‌های نقش، مسئولیت و نتایج مورد انتظار' },
      { id: 'growth-meetings', title: 'جلسات رشد و توسعهٔ کارکنان' },
      { id: 'working-relationships', title: 'روابط کاری اثربخش و مبتنی بر اعتماد و پاسخ‌گویی' },
      { id: 'company-meeting', title: 'جلسهٔ سراسری شرکت' },
      { id: 'systemize-operations', title: 'سیستم‌سازی عملیات کسب‌وکار' },
      { id: 'operations-guide', title: 'راهنمای مدون عملیات اجرایی' },
      { id: 'document-processes', title: 'طراحی و مستندسازی سیستم‌ها و فرایندها' },
    ],
  },
  {
    id: 'leadership', title: 'مبانی سیستم رهبری کسب‌وکار', subtitle: 'مشاور ارشد استراتژی',
    image: leadership, minutes: 0, lessons: [{ id: 'introduction', title: 'آشنایی با سیستم رهبری کسب‌وکار' }],
  },
  {
    id: 'marketing', title: 'مبانی سیستم بازاریابی', subtitle: 'مدیر ارشد عملیات و هم‌بنیان‌گذار',
    image: marketing, minutes: 0, lessons: [{ id: 'introduction', title: 'آشنایی با سیستم بازاریابی' }],
  },
  {
    id: 'finance', title: 'مبانی سیستم مالی', subtitle: 'معاون رشد و توسعه',
    image: finance, minutes: 0, lessons: [{ id: 'introduction', title: 'آشنایی با سیستم مالی' }],
  },
  {
    id: 'operations', title: 'مبانی سیستم عملیات اجرایی', subtitle: 'سیستم‌سازی تحویل خدمات',
    image: systems, minutes: 0, lessons: [{ id: 'introduction', title: 'آشنایی با سیستم عملیات اجرایی' }],
  },
]

const storageKey = (courseId: string, lessonId: string) => `raya-lesson:${courseId}:${lessonId}`

export const demoLearning: LearningProgress = {
  read(courseId, lessonId) {
    const saved = sessionStorage.getItem(storageKey(courseId, lessonId))
    if (saved) {
      try {
        const { seconds, completed } = JSON.parse(saved)
        if (typeof seconds === 'number' && Number.isFinite(seconds) && seconds >= 0 && typeof completed === 'boolean') {
          return { seconds, completed }
        }
      } catch {
        // A stale local record falls back to the start of the lesson.
      }
    }
    return { seconds: 0, completed: false }
  },
  save(courseId, lessonId, progress) {
    sessionStorage.setItem(storageKey(courseId, lessonId), JSON.stringify(progress))
  },
}
