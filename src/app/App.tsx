import { flushSync } from 'react-dom'
import { lazy, Suspense, useEffect, useReducer, useRef } from 'react'
import { OpeningSplash } from '../components/OpeningSplash/OpeningSplash'
import { AccountAccess } from '../features/account/AccountAccess'
import { AccountCreatedSheet } from '../features/account/AccountCreatedSheet'
import { SignupPage } from '../features/account/SignupPage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { OrderReview } from '../features/program/OrderReview'
import { OrderPage } from '../features/program/OrderPage'
import { ProgramSystemPage } from '../features/program/ProgramSystemPage'
import { ProgramNavigation } from '../components/ProgramNavigation/ProgramNavigation'
import { CoursesPage, LessonPage } from '../features/learning/LearningPages'
import { demoCourses, demoLearning } from '../fixtures/learning'
import { RecordsFlow } from '../features/records/RecordsFlow'
import { RecordPage } from '../features/records/RecordPage'
import { recordPaths } from './recordsRoute'
import { ProgramProgressPage } from '../features/actions/ProgramProgressPage'
import { programScenario, programScenarioKey } from '../fixtures/programProgress'
import { ActionFlow } from '../features/actions/ActionFlow'
import type { ActionView } from '../features/actions/action'
import { demoAction, demoActions, demoActionTitles, demoNextAction } from '../fixtures/actions'
import { demoCheckout } from '../fixtures/checkout'
import { demoSystems } from '../fixtures/program'
import { ProgramHome } from '../features/program/ProgramHome'
import { ProgramPackage } from '../features/program/ProgramPackage'
import { demoSessionId, isDemoSessionComplete } from '../fixtures/demoSessionStorage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { WelcomePage } from '../features/welcome/WelcomePage'
import { demoAuth } from '../fixtures/auth'
import { PhonePreview } from './PhonePreview/PhonePreview'
import { actionAddress, appPathname, coachAddress, courseAddress, industryAddress, navigationOrigin, onboardingAddress, orderAddress, pathOf, paths, profileAddress, systemAddress, useAppNavigation } from './navigation'
import styles from './App.module.css'
import { useMobileViewport } from './useMobileViewport'

const DemoCoachRoute = lazy(() => import('../features/coach/DemoCoachRoute'))

export function App() {
  const appRef = useMobileViewport()
  const { route, navigate, backTo } = useAppNavigation()
  const routeFade = useRef<ViewTransition | null>(null)
  const [, refreshProgram] = useReducer((revision: number) => revision + 1, 0)
  const program = demoCheckout.program()
  const preparationMotion = route.page === 'home' && route.preparationMotion && program.readyAt !== undefined
  const demo = route.page === 'home' ? new URLSearchParams(window.location.search).get('demo') : null
  const requestedScenario = programScenario(demo)
  const scenario = demo === 'reset' ? undefined : requestedScenario ?? programScenario(sessionStorage.getItem(programScenarioKey))
  const active = program.status === 'active' || Boolean(scenario)
  const canWatch = program.status !== 'unpaid' || Boolean(scenario)

  useEffect(() => {
    if (demo === 'reset') sessionStorage.removeItem(programScenarioKey)
    else if (requestedScenario) sessionStorage.setItem(programScenarioKey, requestedScenario)
  }, [demo, requestedScenario])
  const trackingAction = demoActions.read(demoAction.id).status === 'approved' ? demoNextAction : demoAction
  const trackingReview = demoActions.read(trackingAction.id)
  const selectedAction = route.page === 'action'
    ? [demoAction, demoNextAction].find(item => item.id === route.actionId && (item === demoAction || item === trackingAction))
    : undefined
  const action = selectedAction ?? trackingAction
  const review = demoActions.read(action.id)
  const completed = canWatch || isDemoSessionComplete()

  useEffect(() => {
    if (preparationMotion || program.status !== 'preparing' || program.readyAt === undefined) return
    const timer = window.setTimeout(refreshProgram, Math.max(0, program.readyAt - Date.now()))
    return () => window.clearTimeout(timer)
  }, [route.page, preparationMotion, program.status, program.readyAt])
  const summaryAddress = coachAddress(demoSessionId, 'summary')
  const confirming = route.page === 'account-created'
  const course = route.page === 'courses' && route.courseId
    ? demoCourses.find(item => item.id === route.courseId)
    : demoCourses[0]
  const lesson = route.page === 'courses' && route.lessonId
    ? course?.lessons.find(item => item.id === route.lessonId)
    : undefined
  const missingLearning = route.page === 'courses' && (!course || (route.lessonId && !lesson))
  const variant = route.page === 'access' ? (route.view === 'signin' ? 'account' : 'recovery')
    : route.page === 'signup' || route.page === 'account-created' ? 'account'
    : route.page === 'order' || route.page === 'system' || route.page === 'checkout' ? 'package'
    : route.page === 'coach' && route.view !== 'room' ? 'summary'
    : route.page === 'courses' ? 'home'
    : route.page === 'records' ? (route.view === 'history' ? 'home' : 'package')
    : route.page === 'progress' ? 'followup'
    : route.page === 'action' ? (active && selectedAction && (route.view === 'chat' || route.view === 'detail' || route.view === 'feedback') ? 'package' : 'followup')
    : route.page

  function fadeScreen(change: () => void) {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      change()
      return
    }

    routeFade.current?.skipTransition()
    const root = document.documentElement
    root.classList.add('raya-route-fade')
    const transition = document.startViewTransition(() => flushSync(change))
    routeFade.current = transition
    const clear = () => {
      if (routeFade.current !== transition) return
      routeFade.current = null
      root.classList.remove('raya-route-fade')
    }
    void transition.finished.then(clear, clear)
  }

  function openLearning() {
    if (appPathname() !== paths.courses) fadeScreen(() => navigate(paths.courses))
  }

  function returnFromLearning() {
    const previous = navigationOrigin()
    if (route.page === 'courses' && route.courseId) {
      const detail = courseAddress(route.courseId)
      backTo(route.lessonId && previous === detail ? previous : paths.courses)
      return
    }
    const origin = pathOf(previous)
    const availableOrigin = previous && origin &&
      (origin === paths.home || origin === paths.followup || origin === paths.progress ||
        origin === recordPaths.history || origin === recordPaths.notifications ||
        origin.startsWith('/coach/session/') || origin.startsWith('/actions/'))
    backTo(availableOrigin ? previous : paths.home)
  }

  const openHistory = () => navigate(recordPaths.history)
  const openCoaching = () => navigate(completed ? summaryAddress : paths.startSession)
  const navHandlers = {
    onHome: () => backTo(paths.home),
    onCoaching: openCoaching,
    onFollowup: () => navigate(paths.followup),
    onLearning: openLearning,
    onHistory: openHistory,
  }
  const learningNav = <ProgramNavigation current="learning" {...navHandlers} />
  const progressPage = route.page === 'progress' || (route.page === 'followup' && (scenario === 'complete' || scenario === 'one-system'))


  function openAction(id: string, view: ActionView) {
    const fromSubmitted = route.page === 'action' && route.view === 'submitted'
    if (view === 'review' && !fromSubmitted) demoActions.check(id)
    const go = () => navigate(actionAddress(id, view), fromSubmitted ? 'replace' : 'push')
    if (view === 'chat') fadeScreen(go)
    else go()
  }

  function returnToTracking() {
    if (route.page === 'followup') window.scrollTo(0, 0)
    else backTo(paths.followup)
  }

  function returnFromAction() {
    const previous = navigationOrigin()
    const origin = pathOf(previous)
    const detail = actionAddress(action.id)
    const review = actionAddress(action.id, 'review')
    const parent = route.page === 'action' && route.view === 'feedback' ? review : detail
    const fromActionParent = origin === parent ||
      (route.page === 'action' && route.view === 'chat' && origin === review)
    backTo(previous && (fromActionParent || origin === paths.home || origin === recordPaths.notifications)
      ? previous : paths.followup)
  }

  function openingProfileBack() {
    const origin = navigationOrigin()
    backTo(origin === paths.signin || origin === paths.accountCreated ? origin : paths.welcome)
  }

  function returnFromOrder(withPreparation?: boolean) {
    const readyAt = withPreparation ? demoCheckout.beginPreparation() : undefined
    const target = readyAt !== undefined && readyAt > Date.now() ? paths.home + '?preparing=1' : paths.home
    const go = () => {
      navigate(target, 'replace')
      window.scrollTo(0, 0)
    }

    if (target === paths.home) go()
    else fadeScreen(go)
  }

  return (
    <main className={styles.app} ref={appRef}>
      <section className={styles.desktopNotice} aria-labelledby="desktop-notice-title">
        <h2 id="desktop-notice-title">نسخهٔ دسکتاپ هنوز آماده نیست</h2>
        <p>برای مشاهدهٔ <bdi>Ai Coach</bdi>، این صفحه را روی موبایل باز کنید.</p>
      </section>
      <div className={styles.stage}>
        <PhonePreview variant={variant}>
          {route.page === 'opening' && (
            <OpeningSplash onComplete={() => navigate(paths.onboarding, 'replace')} />
          )}
          {route.page === 'onboarding' && (
            <OnboardingPage step={route.step}
              onSelect={(step) => navigate(onboardingAddress(step))}
              onFinish={() => navigate(paths.welcome)} />
          )}
          {route.page === 'welcome' && (
            <WelcomePage onSignup={() => navigate(paths.signup)} onSignin={() => navigate(paths.signin)} />
          )}
          {(route.page === 'signup' || confirming) && (
            <SignupPage covered={confirming}
              onBack={() => backTo(paths.welcome)}
              onSignin={() => navigate(paths.signin)}
              onVerified={(email, password) => {
                if (!demoAuth.signUp(email, password)) return false
                navigate(paths.accountCreated)
                return true
              }} />
          )}
          {confirming && (
            <AccountCreatedSheet
              onClose={() => backTo(paths.signup)}
              onContinue={() => navigate(paths.profile)} />
          )}
          {route.page === 'access' && (
            <AccountAccess view={route.view} token={route.token}
              onNavigate={(target, token) => {
                if (target === 'recovery' && route.view === 'sent') {
                  backTo(paths.recovery)
                  return
                }
                const address = paths[target] + (token ? '?token=' + encodeURIComponent(token) : '')
                if (route.view === 'recovery' && target === 'signin' && navigationOrigin() === recordPaths.account) {
                  backTo(recordPaths.account)
                } else {
                  navigate(address, route.view === 'reset' || target === 'changed' ? 'replace' : 'push')
                }
              }} />
          )}
          {route.page === 'coach' && (
            <Suspense fallback={<p className={styles.coachLoading} role="status">در حال آماده‌سازی اتاق کوچ…</p>}>
              <DemoCoachRoute
                sessionId={route.sessionId}
                view={route.view}
                onView={(view) => {
                  const address = coachAddress(route.sessionId, view)
                  if (view === 'summary' && route.view !== 'room') backTo(address)
                  else navigate(address, view === 'correction' ? 'push' : 'replace')
                }}
                onHome={() => backTo(paths.home)}
                onExit={() => backTo(paths.home)}
                onPackage={() => navigate(paths.package)}
                onFollowup={() => navigate(paths.followup)} onLearning={openLearning} onHistory={openHistory}
              />
            </Suspense>
          )}
          {route.page === 'home' && (
            <ProgramHome completed={completed} preparing={program.status === 'preparing'}
              active={active || preparationMotion} starting={route.starting && !completed}
              actionStatus={trackingReview.status} nextAction={trackingAction === demoNextAction} scenario={scenario}
              onOpenRecords={page => navigate(recordPaths[page])}
              onChat={() => active && scenario !== 'complete' ? openAction(trackingAction.id, 'chat') : openCoaching()}
              onOpenAction={() => scenario === 'one-system' ? navigate(paths.progress) : openAction(trackingAction.id, trackingReview.status === 'current' ? 'detail' : 'review')}
              onFollowup={() => navigate(paths.followup)} onLearning={openLearning} onHistory={openHistory}
              preparationReadyAt={preparationMotion ? program.readyAt : undefined}
              onPreparationEnd={() => navigate(paths.home, 'replace')}
              onOpenCoach={() => navigate(completed ? summaryAddress : paths.startSession)}
              onStart={() => navigate(coachAddress(demoSessionId), 'replace')}
              onClose={() => backTo(paths.home)} />
          )}
          {route.page === 'records' && <RecordsFlow route={route} scenario={scenario} summary={summaryAddress}
            nav={<ProgramNavigation current="history" {...navHandlers} />} go={navigate} backTo={backTo} />}
          {progressPage && <ProgramProgressPage scenario={scenario} overview={route.page === 'progress'}
            nav={<ProgramNavigation current="followup" {...navHandlers} />}
            onTracking={() => scenario === 'one-system' ? backTo(paths.home) : backTo(paths.followup)}
            onReport={() => navigate(recordPaths.report)} />}
          {((route.page === 'followup' && !progressPage) || route.page === 'action') && (
            <ActionFlow action={action} trackingAction={trackingAction} trackingStatus={trackingReview.status}
              review={review} nextAction={action === demoAction ? demoNextAction : undefined}
              titles={demoActionTitles} service={demoActions} active={active} isNextActionPreview={action === demoNextAction}
              view={route.page === 'action' && selectedAction ? route.view : 'tracking'}
              onHome={() => backTo(paths.home)}
              onCoaching={() => navigate(completed ? summaryAddress : paths.startSession)}
              onTracking={returnToTracking} onLearning={openLearning} onHistory={openHistory}
              onSystems={() => navigate(paths.progress)} onBack={returnFromAction} onOpen={openAction}
              onSubmit={(revision) => {
                demoActions.submit(action.id, revision)
                navigate(actionAddress(action.id, 'submitted'), 'replace')
              }} />
          )}
          {route.page === 'courses' && course && lesson && (
            <LessonPage key={course.id + '/' + lesson.id} course={course} lessonId={lesson.id}
              progress={demoLearning} canWatch={canWatch} nav={learningNav} onBack={returnFromLearning}
              onLesson={(id) => navigate(courseAddress(course.id, id), 'replace')}
              onOffer={() => navigate(paths.package)} />
          )}
          {missingLearning && <RecordPage title="محتوای آموزشی پیدا نشد" nav={learningNav} onBack={returnFromLearning}>
            <p role="status">این دوره یا درس در نسخهٔ فعلی در دسترس نیست.</p>
          </RecordPage>}
          {route.page === 'courses' && course && !lesson && !missingLearning && (
            <CoursesPage key={route.courseId ?? paths.courses} courses={demoCourses} course={course}
              progress={demoLearning} canWatch={canWatch} nav={learningNav} onBack={returnFromLearning}
              onCourse={(id) => navigate(courseAddress(id))} onLesson={(id, item) => fadeScreen(() => navigate(courseAddress(id, item)))} />
          )}
          {route.page === 'package' && (
            <ProgramPackage contents={route.contents} onContents={() => navigate(paths.packageContents)}
              onSystem={(id) => navigate(systemAddress(id))}
              onCheckout={() => navigate(paths.checkout + window.location.search)}
              onBack={() => {
                const previous = navigationOrigin()
                const origin = pathOf(previous)
                backTo(route.contents ? previous && origin === paths.package ? previous : paths.package :
                  previous && (origin === coachAddress(demoSessionId, 'saved') ||
                    origin?.startsWith(paths.courses + '/')) ? previous : summaryAddress)
              }} />
          )}
          {route.page === 'checkout' && (
            <OrderReview onBack={() => backTo(paths.package + window.location.search)}
              onPay={() => {
                const scenario = new URLSearchParams(window.location.search).get('demo')
                const order = demoCheckout.open(scenario === 'unknown' || scenario === 'incomplete' ? scenario : 'paid')
                navigate(orderAddress(order.id))
              }} />
          )}
          {route.page === 'system' && (
            <ProgramSystemPage system={demoSystems.find(system => system.id === route.systemId)}
              onBack={() => {
                const previous = navigationOrigin()
                backTo(previous && pathOf(previous) === paths.packageContents ? previous : paths.packageContents)
              }} />
          )}
          {route.page === 'order' && (
            <OrderPage key={route.orderId} orderId={route.orderId} view={route.view} service={demoCheckout}
              onView={(view) => {
                const address = orderAddress(route.orderId, view)
                if (view === 'status') backTo(address)
                else navigate(address, view === 'preparing' ? 'replace' : 'push')
              }}
              onHome={returnFromOrder}
              onReview={() => {
                const previous = navigationOrigin()
                backTo(previous && pathOf(previous) === paths.checkout ? previous : paths.checkout)
              }} />
          )}
          {route.page === 'profile' && (
            <ProfilePage step={route.step} picker={route.picker} query={route.query}
              onStep={(step) => navigate(profileAddress(step))}
              onFinish={() => navigate(completed ? paths.home : paths.startSession, 'replace')}
              onBack={() => route.step === 1 ? openingProfileBack() : backTo(profileAddress(route.step - 1))}
              onOpenPicker={() => navigate(industryAddress())}
              onClosePicker={() => backTo(paths.profile)}
              onQuery={(query) => navigate(industryAddress(query), 'replace')} />
          )}
        </PhonePreview>
      </div>
    </main>
  )
}
