import { useEffect, useState } from 'react'
import { readRecordsRoute } from './recordsRoute'
import type { RecordsRoute } from './recordsRoute'
import type { ActionView } from '../features/actions/action'
import type { OrderView } from '../features/program/checkout'
import type { AccessView } from '../features/account/AccountAccess'
import type { CoachView } from '../features/coach/coachSession'
import type { OnboardingStep } from '../features/onboarding/OnboardingPage'

type Route =
  | RecordsRoute
  | { page: 'progress' }
  | { page: 'opening' | 'welcome' | 'signup' | 'account-created' }
  | { page: 'onboarding'; step: OnboardingStep }
  | { page: 'coach'; sessionId: string; view: CoachView }
  | { page: 'home'; starting: boolean; preparationMotion: boolean }
  | { page: 'package'; contents: boolean }
  | { page: 'checkout' | 'followup' }
  | { page: 'courses'; courseId?: string; lessonId?: string }
  | { page: 'action'; actionId: string; view: ActionView }
  | { page: 'system'; systemId: string }
  | { page: 'order'; orderId: string; view: OrderView }
  | { page: 'access'; view: AccessView; token: string }
  | { page: 'profile'; step: number; picker: boolean; query: string }

export const paths = {
  onboarding: '/onboarding',
  welcome: '/welcome',
  signup: '/signup',
  accountCreated: '/account-created',
  signin: '/signin',
  recovery: '/password/recovery',
  sent: '/password/sent',
  reset: '/password/reset',
  changed: '/password/changed',
  profile: '/profile/1',
  home: '/home',
  followup: '/followup',
  progress: '/followup/systems',
  courses: '/courses',
  startSession: '/home/start-session',
  package: '/program/package',
  checkout: '/checkout',
  packageContents: '/program/package/contents',
} as const

const accessViews = ['signin', 'recovery', 'sent', 'reset', 'changed'] as const
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

export function appPathname() {
  const { pathname } = window.location
  if (pathname === basePath) return '/'
  return pathname.startsWith(basePath + '/') ? pathname.slice(basePath.length) : pathname
}

function isAppAddress(value: unknown): value is string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return false
  }
  for (const character of value) {
    const code = character.charCodeAt(0)
    if (code <= 32 || code === 127) return false
  }
  return true
}

export function navigationOrigin(): string | undefined {
  const value: unknown = window.history.state?.rayaFrom
  return isAppAddress(value) ? value : undefined
}

export function pathOf(address: string | undefined) {
  return address?.split(/[?#]/, 1)[0]
}

export function onboardingAddress(step: OnboardingStep) {
  return step === 1 ? paths.onboarding : `${paths.onboarding}?slide=${step}`
}

export function coachAddress(sessionId: string, view: CoachView = 'room') {
  return `/coach/session/${encodeURIComponent(sessionId)}${view === 'room' ? '' : view === 'summary' ? '/summary' : '/summary/' + view}`
}

export function profileAddress(step: number) {
  return `/profile/${step}`
}

export function industryAddress(query = '') {
  return paths.profile + '?industry=picker' + (query ? '&q=' + encodeURIComponent(query) : '')
}

export function systemAddress(id: string) {
  return '/program/systems/' + encodeURIComponent(id)
}

export function courseAddress(courseId: string, lessonId?: string) {
  return paths.courses + '/' + encodeURIComponent(courseId) + (lessonId ? '/lessons/' + encodeURIComponent(lessonId) : '')
}

export function actionAddress(id: string, view: ActionView = 'detail') {
  return '/actions/' + encodeURIComponent(id) + (view === 'detail' ? '' : '/' + view)
}

export function orderAddress(id: string, view: OrderView = 'status') {
  return '/orders/' + encodeURIComponent(id) + (view === 'status' ? '' : '/' + view)
}

function readRoute(): Route {
  const pathname = appPathname()
  const { search } = window.location
  const session = /^\/coach\/session\/([a-zA-Z0-9_-]+)(\/summary(?:\/(correction|saved))?)?$/.exec(pathname)
  if (session) {
    const view = session[3] === 'correction' || session[3] === 'saved' ? session[3] : session[2] ? 'summary' : 'room'
    return { page: 'coach', sessionId: session[1], view }
  }
  if (pathname === paths.home || pathname === paths.startSession) return { page: 'home', starting: pathname === paths.startSession, preparationMotion: new URLSearchParams(search).get('preparing') === '1' }
  if (pathname === paths.courses) return { page: 'courses' }
  const course = /^\/courses\/([a-zA-Z0-9_-]+)(?:\/lessons\/([a-zA-Z0-9_-]+))?$/.exec(pathname)
  if (course) return { page: 'courses', courseId: course[1], lessonId: course[2] }
  const records = readRecordsRoute(pathname, search)
  if (records) return records
  if (pathname === paths.progress) return { page: 'progress' }
  if (pathname === paths.followup) return { page: 'followup' }
  const action = /^\/actions\/([a-zA-Z0-9_-]+)(?:\/(chat|submitted|review|feedback))?$/.exec(pathname)
  if (action) return { page: 'action', actionId: action[1], view: (action[2] ?? 'detail') as ActionView }
  if (pathname === paths.checkout) return { page: 'checkout' }
  if (pathname === paths.package || pathname === paths.packageContents) return { page: 'package', contents: pathname === paths.packageContents }
  const system = /^\/program\/systems\/([a-zA-Z0-9_-]+)$/.exec(pathname)
  if (system) return { page: 'system', systemId: system[1] }
  const order = /^\/orders\/([a-zA-Z0-9_-]+)(?:\/(receipt|preparing))?$/.exec(pathname)
  if (order) return { page: 'order', orderId: order[1], view: order[2] === 'receipt' ? 'receipt' : order[2] === 'preparing' ? 'preparing' : 'status' }
  const params = new URLSearchParams(search)
  const access = accessViews.find(view => paths[view] === pathname)
  if (access) return { page: 'access', view: access, token: params.get('token') ?? '' }
  const step = /^\/profile\/([1-7])$/.exec(pathname)?.[1]
  if (step) {
    const picker = step === '1' && params.get('industry') === 'picker'
    return { page: 'profile', step: Number(step), picker, query: picker ? params.get('q') ?? '' : '' }
  }
  if (pathname === paths.welcome) return { page: 'welcome' }
  if (pathname === paths.signup) return { page: 'signup' }
  if (pathname === paths.accountCreated) return { page: 'account-created' }
  if (pathname !== paths.onboarding) return { page: 'opening' }
  const value = params.get('slide')
  return { page: 'onboarding', step: value === '2' ? 2 : value === '3' ? 3 : 1 }
}

export function useAppNavigation() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const restoreRoute = () => setRoute(readRoute())
    window.addEventListener('popstate', restoreRoute)
    return () => window.removeEventListener('popstate', restoreRoute)
  }, [])

  function navigate(address: string, method: 'push' | 'replace' = 'push') {
    if (!isAppAddress(address)) return
    const pathname = appPathname()
    const { search } = window.location
    if (address === pathname + search) return
    const browserAddress = basePath + address
    if (method === 'replace') {
      const previous = navigationOrigin()
      window.history.replaceState(previous && previous !== address ? { rayaFrom: previous } : null, '', browserAddress)
    } else {
      window.history.pushState({ rayaFrom: pathname + search }, '', browserAddress)
    }
    setRoute(readRoute())
  }

  function backTo(address: string) {
    if (!isAppAddress(address)) return
    if (navigationOrigin() === address) window.history.back()
    else navigate(address, 'replace')
  }

  return { route, navigate, backTo }
}
