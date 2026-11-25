export const speeds = [0.75, 1, 1.25] as const

export type VoicePreferences = {
  voice: string
  speed: (typeof speeds)[number]
  noise: boolean
  transcript: boolean
}

export type CoachVoice = {
  id: string
  name: string
  description: string
  sampleUrl?: string
}

export type CoachMessage = {
  id: string
  author: 'user' | 'coach'
  text: string
  time: string
}

export type CoachSession = {
  id: string
  media: {
    speechLevels?: readonly number[]
    posterUrl: string
    chatPosterUrl: string
    videoUrl: string
  }
  voices: readonly CoachVoice[]
  preferences: VoicePreferences
  defaults: VoicePreferences
  messages: readonly CoachMessage[]
}

export type CoachView = 'room' | 'summary' | 'correction' | 'saved'

export type CoachSummary = {
  correction?: string
  participant: { name: string; date: string; avatarUrl?: string }
  subject: string
  overview: string
  concerns: readonly string[]
  recommendation: { title: string; detail: string; footnote: string }
}

export interface CoachService {
  open(sessionId: string, signal: AbortSignal): Promise<CoachSession>
  start(sessionId: string, signal: AbortSignal): Promise<void>
  sendMessage(sessionId: string, text: string, signal: AbortSignal): Promise<CoachMessage>
  savePreferences(sessionId: string, preferences: VoicePreferences, signal: AbortSignal): Promise<VoicePreferences>
  getSummary(sessionId: string, signal: AbortSignal): Promise<CoachSummary>
  saveCorrection(sessionId: string, note: string, signal: AbortSignal): Promise<void>
  end(sessionId: string, signal: AbortSignal): Promise<void>
}
