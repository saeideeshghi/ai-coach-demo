import type { KeyboardEvent } from 'react'

export function handleDialogKey(event: KeyboardEvent<HTMLElement>, onClose: () => void) {
  if (event.key === 'Escape') {
    event.preventDefault()
    onClose()
    return
  }
  if (event.key !== 'Tab') return

  const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
  const first = buttons[0]
  const last = buttons[buttons.length - 1]
  if (!first || !last) {
    event.preventDefault()
    return
  }
  const active = event.currentTarget.ownerDocument.activeElement
  const onButton = buttons.some(button => button === active)
  if (!onButton || active === (event.shiftKey ? first : last)) {
    event.preventDefault()
    const target = event.shiftKey ? last : first
    target.focus()
  }
}
