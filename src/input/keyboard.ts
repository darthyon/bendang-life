// Held-key state for movement, plus one-shot listeners for presses like E.

const held = new Set<string>()

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

export function isHeld(code: string): boolean {
  return held.has(code)
}

/** Attach window listeners. Returns a cleanup function. */
export function attachKeyboard(onPress?: (code: string) => void): () => void {
  const down = (e: KeyboardEvent) => {
    if (isTyping(e.target)) return
    if (!e.repeat) onPress?.(e.code)
    held.add(e.code)
  }
  const up = (e: KeyboardEvent) => held.delete(e.code)
  const clear = () => held.clear()
  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', clear)
  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', clear)
    held.clear()
  }
}

/** Screen-space move input from WASD / arrows: x right, y up. Not normalised. */
export function moveInput(): { x: number; y: number } {
  const x =
    (isHeld('KeyD') || isHeld('ArrowRight') ? 1 : 0) -
    (isHeld('KeyA') || isHeld('ArrowLeft') ? 1 : 0)
  const y =
    (isHeld('KeyW') || isHeld('ArrowUp') ? 1 : 0) - (isHeld('KeyS') || isHeld('ArrowDown') ? 1 : 0)
  return { x, y }
}
