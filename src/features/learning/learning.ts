export type Lesson = { id: string; title: string }

export type Course = {
  id: string
  title: string
  instructor?: string
  subtitle: string
  image: string
  hero?: string
  minutes: number
  lessons: readonly Lesson[]
  sample?: { source: string; poster: string }
}

export type LessonProgress = { seconds: number; completed: boolean }

export interface LearningProgress {
  read(courseId: string, lessonId: string): LessonProgress
  save(courseId: string, lessonId: string, progress: LessonProgress): void
}

export type CourseStatus = 'not-started' | 'in-progress' | 'completed'

export function courseProgress(course: Course, progress: LearningProgress) {
  const lessons = course.lessons.map(lesson => progress.read(course.id, lesson.id))
  const completed = lessons.filter(lesson => lesson.completed).length
  const started = completed > 0 || lessons.some(lesson => lesson.seconds > 0)
  const status: CourseStatus = completed === lessons.length ? 'completed' : started ? 'in-progress' : 'not-started'
  const startedIndex = lessons.findLastIndex(lesson => lesson.seconds > 0 && !lesson.completed)
  const nextIndex = lessons.findIndex(lesson => !lesson.completed)
  return { completed, status, next: course.lessons[Math.max(0, startedIndex === -1 ? nextIndex : startedIndex)] }
}

const persian = new Intl.NumberFormat('fa-IR')
export const number = (value: number) => persian.format(value)
