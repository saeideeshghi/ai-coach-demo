export const demoAccount = { email: 'demo@example.com', password: 'RayaDemo1!' }

const normalizeEmail = (email: string) => email.trim().toLowerCase()
const recoveryLifetime = 15 * 60_000

// Browser-only fixture. Passwords and recovery tokens live only in memory.
export function createDemoAuth() {
  const passwords = new Map([[demoAccount.email, demoAccount.password]])
  const tokens = new Map<string, { account: string; expiresAt: number }>()

  function getAccount(token: string) {
    const recovery = tokens.get(token)
    if (!recovery) return
    if (recovery.expiresAt > Date.now()) return recovery.account
    tokens.delete(token)
  }

  return {
    signUp(email: string, password: string) {
      const account = normalizeEmail(email)
      if (passwords.has(account)) return false
      passwords.set(account, password)
      return true
    },
    signIn(email: string, password: string) {
      return passwords.get(normalizeEmail(email)) === password
    },
    requestRecovery(email: string) {
      const account = normalizeEmail(email)
      if (!passwords.has(account)) return undefined
      const now = Date.now()
      for (const [token, recovery] of tokens) {
        if (recovery.account === account || recovery.expiresAt <= now) tokens.delete(token)
      }
      const token = crypto.randomUUID()
      tokens.set(token, { account, expiresAt: now + recoveryLifetime })
      return token
    },
    hasToken(token: string) {
      return getAccount(token) !== undefined
    },
    reset(token: string, password: string) {
      const account = getAccount(token)
      if (!account) return false
      passwords.set(account, password)
      tokens.delete(token)
      return true
    },
  }
}

export const demoAuth = createDemoAuth()
