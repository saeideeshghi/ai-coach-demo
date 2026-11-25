import { demoCoachService } from '../../fixtures/coach'
import type { CoachView } from './coachSession'
import { CoachSessionPage } from './CoachRoom'
import { CoachSummaryPage } from './CoachSummaryPage'

export default function DemoCoachRoute({ sessionId, view, onView, onHome, onExit, onPackage, onFollowup, onLearning, onHistory }: {
  sessionId: string
  view: CoachView
  onView: (view: Exclude<CoachView, 'room'>) => void
  onHome: () => void
  onExit: () => void
  onPackage: () => void
  onFollowup: () => void
  onLearning: () => void
  onHistory: () => void
}) {
  if (view === 'room') {
    return <CoachSessionPage key={sessionId} sessionId={sessionId} service={demoCoachService}
      onExit={onExit} onSummary={() => onView('summary')} />
  }

  return <CoachSummaryPage key={sessionId} sessionId={sessionId} service={demoCoachService}
    view={view} onView={onView} onHome={onHome} onExit={onExit} onPackage={onPackage} onFollowup={onFollowup} onLearning={onLearning} onHistory={onHistory} />
}

