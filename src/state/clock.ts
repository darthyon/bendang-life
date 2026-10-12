import { RULES } from '../sim/rules'
import { isPaused, useGame } from './store'

// The clock moves in quarter-hour steps so the store updates a few times a second, not every frame.
const STEP_HOURS = 0.25

/** Runs the day clock (spec §4.2). Returns a stop function. */
export function startClock(): () => void {
  let last = performance.now()
  let carry = 0
  let frame = 0

  const tick = (now: number) => {
    const dt = Math.min(now - last, 250) / 1000
    last = now
    if (!isPaused() && !document.hidden) {
      carry += dt / RULES.clock.realSecondsPerGameHour
      if (carry >= STEP_HOURS) {
        const steps = Math.floor(carry / STEP_HOURS) * STEP_HOURS
        carry -= steps
        const { dispatch, sleep } = useGame.getState()
        dispatch({ type: 'PASS_TIME', hours: steps })
        // 7 PM ends the day by itself.
        if (useGame.getState().game.hour >= RULES.clock.nightStartHour) sleep()
      }
    }
    frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}
