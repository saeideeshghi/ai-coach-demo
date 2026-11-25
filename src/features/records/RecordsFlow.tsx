import type { ReactNode } from 'react'
import { actionAddress, navigationOrigin, pathOf, paths } from '../../app/navigation'
import { calendarAddress, noteAddress, recordPaths, sessionAddress } from '../../app/recordsRoute'
import type { RecordsRoute } from '../../app/recordsRoute'
import { demoAction } from '../../fixtures/actions'
import { programSystems } from '../../fixtures/programProgress'
import type { ProgramScenario } from '../../fixtures/programProgress'
import { AccountEditPage, AccountPage, NotificationsPage } from './AccountPages'
import { CalendarPage, HistoryPage, SessionDetailsPage } from './HistoryPages'
import { NoteEditPage, NotesPage } from './NotesPages'
import { ReportPage } from './ReportPage'

export function RecordsFlow({ route, scenario, nav, summary, go, backTo }: {
  route: RecordsRoute
  scenario?: ProgramScenario
  nav: ReactNode
  summary: string
  go: (path: string, method?: 'push' | 'replace') => void
  backTo: (path: string) => void
}) {
  const destination = navigationOrigin()
  const originPath = pathOf(destination)
  switch (route.view) {
    case 'history':
      return <HistoryPage nav={nav} onBack={() => backTo(destination && originPath !== recordPaths.history ? destination : paths.home)}
        onCalendar={() => go(recordPaths.calendar)} />
    case 'calendar':
      return <CalendarPage month={route.month} day={route.day}
        onBack={() => backTo(destination && originPath === paths.home ? destination : recordPaths.history)}
        onSelect={(month, day) => go(calendarAddress(month, day), 'replace')} onOpen={id => go(sessionAddress(id))} />
    case 'session':
      return <SessionDetailsPage key={route.id} id={route.id}
        onBack={() => backTo(destination && (originPath === recordPaths.calendar || originPath === recordPaths.notifications) ? destination : recordPaths.calendar)} />
    case 'notes':
      return <NotesPage onBack={() => backTo(destination && (originPath === recordPaths.history || originPath === paths.home) ? destination : paths.home)}
        onAdd={() => go(recordPaths.newNote)} onOpen={id => go(noteAddress(id))} />
    case 'note':
      return <NoteEditPage key={route.id} id={route.id} onBack={() => backTo(recordPaths.notes)} />
    case 'notifications': {
      const targets = {
        summary,
        action: actionAddress(demoAction.id),
        session: sessionAddress('sh-22'),
        course: paths.courses,
        progress: paths.followup,
      }
      return <NotificationsPage onBack={() => backTo(destination && originPath === paths.home ? destination : paths.home)}
        onSettings={() => go(recordPaths.account)} onOpen={id => go(targets[id])} />
    }
    case 'account':
      return <AccountPage onBack={() => backTo(destination && (originPath === recordPaths.notifications || originPath === paths.home) ? destination : paths.home)}
        onEdit={() => go(recordPaths.editAccount)} onPassword={() => go(paths.recovery)} onLogout={() => go(paths.signin, 'replace')} />
    case 'editAccount':
      return <AccountEditPage onBack={() => backTo(recordPaths.account)} />
    case 'report':
    case 'reportDetails':
      return <ReportPage systems={programSystems(scenario)} showDetails={route.view === 'reportDetails'}
        onDetails={() => go(recordPaths.reportDetails)} onProgress={() => go(paths.followup)}
        onBack={() => backTo(route.view === 'reportDetails' ? recordPaths.report
          : destination && (originPath === paths.followup || originPath === paths.progress || originPath === paths.home) ? destination : paths.home)} />
  }
}
