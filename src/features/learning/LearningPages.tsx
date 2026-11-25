import { ScrollArea } from '../../components/ScrollArea/ScrollArea'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ProgramChevron } from '../../components/ProgramChevron'
import type { Course, CourseStatus, LearningProgress } from './learning'
import { courseProgress, number } from './learning'
import { LessonPlayer } from './LessonPlayer'
import styles from './Learning.module.css'

const filters = [
  ['not-started', 'شروع‌نشده'],
  ['in-progress', 'در حال یادگیری'],
  ['completed', 'تکمیل‌شده‌ها'],
] as const

const actionLabel: Record<CourseStatus, string> = {
  'not-started': 'شروع دوره',
  'in-progress': 'ادامهٔ یادگیری',
  completed: 'مرور دوره',
}

function Back({ onClick }: { onClick: () => void }) {
  return <button className={styles.back} type="button" onClick={onClick} aria-label="بازگشت">
    <ProgramChevron direction="right" />
  </button>
}

function usePageHeading() {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => title.current?.focus({ preventScroll: true }), [])
  return title
}

type CoursePageProps = {
  courses: readonly Course[]
  course: Course
  progress: LearningProgress
  canWatch: boolean
  nav: ReactNode
  onBack: () => void
  onCourse: (id: string) => void
  onLesson: (courseId: string, lessonId: string) => void
}

export function CoursesPage({ courses, course, progress, canWatch, nav, onBack, onCourse, onLesson }: CoursePageProps) {
  const featured = courseProgress(course, progress)
  const orderedFilters = featured.status === 'not-started' ? filters : [filters[1], filters[0], filters[2]]
  const currentLessonNumber = featured.status === 'completed' ? course.lessons.length : course.lessons.indexOf(featured.next) + 1
  const [filter, setFilter] = useState<CourseStatus>(featured.status)
  const title = usePageHeading()
  const items = courses.filter(item => item.id !== course.id && courseProgress(item, progress).status === filter)
  const percent = Math.floor(featured.completed * 100 / course.lessons.length)
  const stateLabel = featured.status === 'completed' ? 'تکمیل‌شده' : filters.find(([key]) => key === featured.status)?.[1]

  return <section className={styles.screen} aria-label="آموزش">
    <ScrollArea className={styles.scroll}>
      <div className={styles.catalog}>
        <header className={styles.courseHero}>
          <img src={course.hero ?? course.image} alt="" fetchPriority="high" />
          <Back onClick={onBack} />
          <div>
            <h1 ref={title} tabIndex={-1}>{course.title}</h1>
            <p>{!canWatch ? 'پیش‌نمایش قبل از تأیید پرداخت' : featured.status === 'not-started' ? 'از بستهٔ جامع هفت سیستم' : stateLabel}</p>
          </div>
        </header>
        <section className={styles.featured} aria-label="دورهٔ منتخب">
          <div className={styles.featureSummary}>
            <img className={styles.featureImage} src={course.image} alt="" />
            <div className={styles.featureCopy}>
              <span className={styles.badge}>{stateLabel}</span>
              <h2>{course.title}</h2>
              {course.instructor && <span className={styles.instructor} lang="en">{course.instructor}</span>}
              <p>{course.subtitle}</p>
            </div>
          </div>
          <div className={styles.metadata}>
            <span>▷　 جلسه {number(currentLessonNumber)} از {number(course.lessons.length)}</span>
            {course.minutes > 0 && <span>◷　 مدت زمان: {number(course.minutes)} دقیقه</span>}
          </div>
          <div className={styles.progressRow}>
            <span>{number(percent)}٪</span>
            <progress aria-label="پیشرفت دوره" value={percent} max={100} />
          </div>
          <button type="button" className={styles.pill} onClick={() => onLesson(course.id, featured.next.id)}>
            {actionLabel[featured.status]}<ProgramChevron />
          </button>
        </section>

        <div className={styles.filters} role="group" aria-label="وضعیت دوره‌ها">
          {orderedFilters.map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id}
            onClick={() => setFilter(id)}>{label}</button>)}
        </div>
        <ul className={styles.courses}>
          {items.map(item => <li key={item.id}>
            <button type="button" className={styles.courseCard} onClick={() => onCourse(item.id)}>
              <img src={item.image} alt="" loading="lazy" />
              <span className={styles.cardCopy}><strong>{item.title}</strong><small>{item.subtitle}</small>
                <span>▷　 جلسه {number(1)} از {number(item.lessons.length)}</span>
              </span><ProgramChevron />
            </button>
          </li>)}
        </ul>
      </div>
    </ScrollArea>
    {nav}
  </section>
}

function CourseRoadmap({ course, progress, activeId, preview }: {
  course: Course
  progress: LearningProgress
  activeId: string
  preview: boolean
}) {
  const active = course.lessons.findIndex(lesson => lesson.id === activeId)
  const { completed } = courseProgress(course, progress)
  return <section className={styles.courseRoadmap} aria-label="پیشرفت درس‌ها">
    <h2>{course.title}</h2>
    <div><p>درس {number(active + 1)} از {number(course.lessons.length)}</p>
      <p>{preview ? `${number(course.lessons.length)} درس` : `${number(completed)} از ${number(course.lessons.length)} تکمیل شده`}</p>
    </div>
    <ol>
      {course.lessons.map((lesson, index) => <li key={lesson.id}
        data-done={!preview && progress.read(course.id, lesson.id).completed || undefined}
        aria-current={lesson.id === activeId ? 'step' : undefined}>
        <span aria-hidden="true" />{number(index + 1)}
      </li>)}
    </ol>
  </section>
}

export function LessonPage({ course, lessonId, progress, canWatch, nav, onBack, onLesson, onOffer }: {
  course: Course
  lessonId: string
  progress: LearningProgress
  canWatch: boolean
  nav: ReactNode
  onBack: () => void
  onLesson: (id: string) => void
  onOffer: () => void
}) {
  const index = course.lessons.findIndex(lesson => lesson.id === lessonId)
  const lesson = course.lessons[index]
  const next = course.lessons[index + 1]
  const hasUnfinishedLessons = courseProgress(course, progress).status !== 'completed'
  const title = usePageHeading()
  const [initial] = useState(() => progress.read(course.id, lessonId))
  const [completed, setCompleted] = useState(initial.completed)
  const sample = canWatch ? course.sample : undefined

  return <section className={styles.screen} aria-label="درس">
    <ScrollArea className={styles.scroll}>
      <header className={styles.lessonHero} data-locked={!sample || undefined}>
        <Back onClick={onBack} />
        {sample ? <>
          <h1 className={styles.videoTitle} ref={title} tabIndex={-1}>{lesson.title}</h1>
          <LessonPlayer sample={sample} initial={initial} onProgress={(seconds, ended) => {
            const done = completed || ended
            progress.save(course.id, lessonId, { seconds, completed: done })
            if (ended) setCompleted(true)
          }} />
        </> : <div className={styles.locked}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <rect x="6" y="10" width="12" height="11" rx="2" /><path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3M12 14v3" />
          </svg>
          <h1 ref={title} tabIndex={-1}>پیش‌نمایش سرفصل‌ها</h1>
          <p>{canWatch ? 'ویدیوی نمونهٔ این دوره در دسترس نیست.' : 'پخش درس پس از تأیید پرداخت در دسترس است.'}</p>
          {!canWatch && <button type="button" onClick={onOffer}>مشاهدهٔ بسته</button>}
        </div>}
      </header>
      <CourseRoadmap course={course} progress={progress} activeId={lessonId} preview={!canWatch} />
      <section className={styles.syllabus}>
        <header><h2>سرفصل‌های دوره</h2><span>{number(course.lessons.length)} درس</span></header>
        <ol>
          {course.lessons.map((item, position) => {
            const current = item.id === lessonId
            const done = progress.read(course.id, item.id).completed
            return <li key={item.id}>
              <button type="button" aria-current={current ? 'page' : undefined} onClick={() => onLesson(item.id)}>
                <span>{number(position + 1)}</span><strong>{item.title}</strong>
                <span className={styles.lessonIndicator} data-done={done || undefined} aria-hidden="true">
                  {current ? '▶' : done ? '✓' : <ProgramChevron />}
                </span>
              </button>
            </li>
          })}
        </ol>
      </section>
      {sample && completed && next && hasUnfinishedLessons && <button className={styles.next} type="button" onClick={() => onLesson(next.id)}>
        درس بعدی<ProgramChevron />
      </button>}
    </ScrollArea>
    {nav}
  </section>
}
