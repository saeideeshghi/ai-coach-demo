export type OrderView = 'status' | 'receipt' | 'preparing'
export type PaymentOutcome = 'paid' | 'incomplete' | 'unknown'
export type PaymentStatus = PaymentOutcome | 'redirecting' | 'verifying'

export type Order = {
  id: string
  status: PaymentStatus
  outcome: PaymentOutcome
  readyAt?: number
}

export interface CheckoutService {
  open(outcome: PaymentOutcome): Order
  read(id: string): Order | undefined
  advance(id: string, from: 'redirecting' | 'verifying'): Order | undefined
  retry(id: string): Order | undefined
  check(id: string): Order | undefined
  program(): { status: 'unpaid' | 'preparing' | 'active'; readyAt?: number }
  beginPreparation(): number | undefined
}
