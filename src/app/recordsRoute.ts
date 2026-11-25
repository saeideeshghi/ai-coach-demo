export const recordPaths = {
  history: '/history',
  calendar: '/sessions/calendar',
  notes: '/notes',
  newNote: '/notes/new',
  notifications: '/notifications',
  account: '/account',
  editAccount: '/account/edit',
  report: '/reports/final',
  reportDetails: '/reports/final/details',
} as const

export type RecordsRoute =
  | { page: 'records'; view: 'history' | 'notes' | 'notifications' | 'account' | 'editAccount' | 'report' | 'reportDetails' }
  | { page: 'records'; view: 'calendar'; month: string | null; day: string | null }
  | { page: 'records'; view: 'session' | 'note'; id: string }

export function readRecordsRoute(pathname: string, search: string): RecordsRoute | undefined {
  switch (pathname) {
    case recordPaths.history: return { page: 'records', view: 'history' }
    case recordPaths.calendar: {
      const params = new URLSearchParams(search)
      return { page: 'records', view: 'calendar', month: params.get('month'), day: params.get('day') }
    }
    case recordPaths.notes: return { page: 'records', view: 'notes' }
    case recordPaths.notifications: return { page: 'records', view: 'notifications' }
    case recordPaths.account: return { page: 'records', view: 'account' }
    case recordPaths.editAccount: return { page: 'records', view: 'editAccount' }
    case recordPaths.report: return { page: 'records', view: 'report' }
    case recordPaths.reportDetails: return { page: 'records', view: 'reportDetails' }
  }
  const match = /^\/(sessions|notes)\/([a-zA-Z0-9_-]+)$/.exec(pathname)
  if (match) return { page: 'records', view: match[1] === 'sessions' ? 'session' : 'note', id: match[2] }
}

export function sessionAddress(id: string) {
  return '/sessions/' + encodeURIComponent(id)
}

export function noteAddress(id: string) {
  return '/notes/' + encodeURIComponent(id)
}

export function calendarAddress(month: string, day: number) {
  return recordPaths.calendar + '?' + new URLSearchParams({ month, day: String(day) })
}
