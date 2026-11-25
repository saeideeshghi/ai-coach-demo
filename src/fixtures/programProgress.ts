import { demoSystems } from './program'

export type ProgramScenario = 'resume' | 'one-system' | 'complete'
export const programScenarioKey = 'raya-program-scenario'

export function programScenario(value: string | null | undefined): ProgramScenario | undefined {
  if (value === 'resume' || value === 'one-system' || value === 'complete') return value
}

const current = 'management'

export function programSystems(scenario?: ProgramScenario) {
  return demoSystems.map(system => ({
    id: system.id,
    title: system.title,
    completed: scenario === 'complete' || (scenario === 'one-system' && system.id === current),
  }))
}
