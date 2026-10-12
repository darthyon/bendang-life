import { describe, expect, it } from 'vitest'
import { applyAction } from '../actions'
import { advanceDay } from '../day'
import { createRng } from '../rng'
import { RULES } from '../rules'
import { primaryJob } from '../selectors'
import { createInitialState } from '../state'
import type { GameState } from '../types'

/** A diligent bot: buys what it needs, then does the E-prompt job on Plot 1 until none is left. */
function playSeason(seed: number): GameState {
  const rng = createRng(seed)
  let s = createInitialState({ starter: 'mr297' })
  s = applyAction(s, { type: 'BUY_BAJA' })
  s = applyAction(s, { type: 'BUY_BAJA' })
  s = applyAction(s, { type: 'BUY_BAJA' })
  s = applyAction(s, { type: 'BUY_BAJA' })
  while (s.harvests.length === 0 && s.day <= RULES.season.days + 2) {
    // Water: open for flooded stages, closed for the dry ones.
    const band = RULES.water.targets.find((b) => s.day >= b.fromDay && s.day <= b.toDay)
    const water = s.plots[0]?.waterCm ?? 0
    const wantOpen = band ? water < band.minCm + 1 && band.maxCm > 1 : false
    if (s.gates.A !== wantOpen) s = applyAction(s, { type: 'TOGGLE_GATE', gateId: 'A' })
    for (let i = 0; i < 6; i++) {
      const job = primaryJob(s, { kind: 'plot', plotId: 1 })
      if (!job?.action || job.reason) break
      if (job.action.type === 'TUAI' && s.day < RULES.harvest.idealFirstDay) break
      s = applyAction(s, job.action)
    }
    if (s.harvests.length === 0) s = advanceDay(s, rng)
  }
  return s
}

describe('full season', () => {
  it('reaches a harvest with a profit for a diligent player', () => {
    const s = playSeason(7)
    const r = s.harvests[0]
    expect(r).toBeDefined()
    expect(r?.kg).toBeGreaterThan(1000)
    expect(s.coins).toBeGreaterThan(RULES.economy.startCoins)
  })

  it('is deterministic for the same seed and actions', () => {
    expect(playSeason(123)).toEqual(playSeason(123))
  })
})
