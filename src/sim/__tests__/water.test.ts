import { describe, expect, it } from 'vitest'
import { applyAction } from '../actions'
import { advanceDay } from '../day'
import { createRng } from '../rng'
import { RULES } from '../rules'
import { freshState, plot, withPlot } from './helpers'

const rng = () => createRng(1)
const { gateOpenGainCmPerDay: gain, gateClosedLossCmPerDay: loss, capCm } = RULES.water

describe('water', () => {
  it('rises overnight on the plots fed by an open gate', () => {
    let s = applyAction(freshState(), { type: 'TOGGLE_GATE', gateId: 'A' })
    expect(s.gates.A).toBe(true)
    expect(s.hour).toBe(RULES.clock.dayStartHour + RULES.jobHours.pintu_air)
    s = advanceDay(s, rng())
    for (const id of RULES.water.gates.A) {
      if (plot(s, id).status !== 'locked') expect(plot(s, id).waterCm).toBe(gain)
    }
    expect(plot(s, 1).waterCm).toBe(gain)
    for (const id of RULES.water.gates.B) expect(plot(s, id).waterCm).toBe(0)
  })

  it('falls overnight with the gate closed, never below 0', () => {
    let s = withPlot(freshState(), 1, { waterCm: 3 })
    s = advanceDay(s, rng())
    expect(plot(s, 1).waterCm).toBe(3 - loss)
    s = withPlot(s, 1, { waterCm: 0 })
    s = advanceDay(s, rng())
    expect(plot(s, 1).waterCm).toBe(0)
  })

  it('never rises above the cap', () => {
    let s = withPlot(freshState({ gates: { A: true, B: false } }), 1, { waterCm: capCm - 1 })
    s = advanceDay(s, rng())
    expect(plot(s, 1).waterCm).toBe(capCm)
  })

  it('leaves locked plots dry', () => {
    const s = advanceDay(freshState({ gates: { A: true, B: true } }), rng())
    expect(plot(s, 2).status).toBe('locked')
    expect(plot(s, 2).waterCm).toBe(0)
  })

  it('closes the gate on a second toggle', () => {
    let s = applyAction(freshState(), { type: 'TOGGLE_GATE', gateId: 'B' })
    s = applyAction(s, { type: 'TOGGLE_GATE', gateId: 'B' })
    expect(s.gates.B).toBe(false)
  })
})
