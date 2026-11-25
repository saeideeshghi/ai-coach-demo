import type { CheckoutService, Order, PaymentOutcome, PaymentStatus } from '../features/program/checkout'

const key = 'raya-demo-package-order'
const preparationDuration = 2200
const outcomes: readonly PaymentOutcome[] = ['paid', 'incomplete', 'unknown']
const statuses: readonly PaymentStatus[] = [...outcomes, 'redirecting', 'verifying']

function readOrder(): Order | undefined {
  try {
    const stored = sessionStorage.getItem(key)
    if (!stored) return
    const order = JSON.parse(stored) as Partial<Order> | null
    if (!order || typeof order.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(order.id)) return
    const { id, status, outcome, readyAt } = order
    if (!status || !outcome || !statuses.includes(status) || !outcomes.includes(outcome)) return
    if (readyAt !== undefined && (status !== 'paid' || !Number.isSafeInteger(readyAt) || readyAt < 0)) return
    return { id, status, outcome, readyAt }
  } catch {
    return undefined
  }
}

function save(order: Order) {
  sessionStorage.setItem(key, JSON.stringify(order))
  return order
}

export const demoCheckout: CheckoutService = {
  open(outcome) {
    return readOrder() ?? save({ id: crypto.randomUUID(), status: 'redirecting', outcome })
  },
  read(id) {
    const order = readOrder()
    return order?.id === id ? order : undefined
  },
  advance(id, from) {
    const order = this.read(id)
    if (order?.status !== from) return order
    return save({ ...order, status: from === 'redirecting' && order.outcome !== 'paid' ? 'verifying' : order.outcome })
  },
  retry(id) {
    const order = this.read(id)
    if (order?.status !== 'incomplete') return order
    return save({ ...order, status: 'redirecting', outcome: 'paid' })
  },
  check(id) {
    const order = this.read(id)
    if (order?.status !== 'unknown') return order
    return save({ ...order, status: 'verifying', outcome: 'paid' })
  },
  program() {
    const order = readOrder()
    if (order?.status !== 'paid') return { status: 'unpaid' }
    const readyAt = order.readyAt
    return { status: readyAt !== undefined && Date.now() >= readyAt ? 'active' : 'preparing', readyAt }
  },
  beginPreparation() {
    const order = readOrder()
    if (order?.status !== 'paid') return
    if (order.readyAt !== undefined) return order.readyAt
    const readyAt = Date.now() + preparationDuration
    save({ ...order, readyAt })
    return readyAt
  },
}
