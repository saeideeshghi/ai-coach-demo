const completionKey = 'raya-demo-coach-completed'

export const demoSessionId = 'demo'

export function isDemoSessionComplete() {
  return sessionStorage.getItem(completionKey) === '1'
}

export function markDemoSessionComplete() {
  sessionStorage.setItem(completionKey, '1')
}

function correctionKey(sessionId: string) {
  return 'raya-demo-summary-correction:' + sessionId
}

export function readDemoCorrection(sessionId: string) {
  return sessionStorage.getItem(correctionKey(sessionId)) ?? ''
}

export function storeDemoCorrection(sessionId: string, note: string) {
  sessionStorage.setItem(correctionKey(sessionId), note)
}

