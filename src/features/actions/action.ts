export type ActionView = 'detail' | 'chat' | 'submitted' | 'review' | 'feedback'

export type ActionStatus = 'current' | 'review' | 'revision' | 'approved'

export type ActionRevision = { summary: string; attachmentName?: string }

export type ActionReview = { status: ActionStatus; revised: boolean }

export type ActionMessage = { id: string; author: 'coach' | 'user'; text: string; attachment?: boolean }

export type ActionItem = {
  id: string
  title: string
  position: number
  system: string
  subsystem: string
  reason: string
  steps: readonly string[]
  output: string
  notes: string
}

export interface ActionService {
  read(id: string): ActionReview
  check(id: string): ActionReview
  submit(id: string, revision?: ActionRevision): void
  messages(id: string): readonly ActionMessage[]
  send(id: string, text: string): readonly ActionMessage[]
}
