import { describe, expect, it } from 'vitest'
import { applyAction, canApply } from '../actions'
import { RULES } from '../rules'
import { freshState, plantedState, plot, withPlot } from './helpers'

const start = RULES.clock.dayStartHour

describe('jobs', () => {
  it('opens only Plot 1 in season 1', () => {
    const s = freshState()
    expect(plot(s, 1).status).toBe('empty')
    expect([2, 3, 4].map((id) => plot(s, id).status)).toEqual(['locked', 'locked', 'locked'])
    expect(canApply(s, { type: 'BAJAK', plotId: 2 })).toBe('stages.locked')
  })

  it('ploughs an empty plot and spends its hours', () => {
    const s = applyAction(freshState(), { type: 'BAJAK', plotId: 1 })
    expect(plot(s, 1).status).toBe('ploughed')
    expect(s.hour).toBe(start + RULES.jobHours.bajak)
  })

  it('sows a ploughed plot with a seed bag', () => {
    let s = applyAction(freshState(), { type: 'BAJAK', plotId: 1 })
    s = applyAction(s, { type: 'TANAM', plotId: 1, variety: 'mr297' })
    expect(plot(s, 1)).toMatchObject({ status: 'planted', variety: 'mr297', health: 100 })
    expect(s.benih.mr297).toBe(0)
    expect(s.hour).toBe(start + RULES.jobHours.bajak + RULES.jobHours.tanam)
  })

  it('needs a bag of the chosen variety to sow', () => {
    const s = withPlot(freshState(), 1, { status: 'ploughed' })
    expect(canApply(s, { type: 'TANAM', plotId: 1, variety: 'mrq76' })).toBe('reasons.no_benih')
  })

  it('blocks a job that does not fit before night', () => {
    const s = freshState({ hour: RULES.clock.nightStartHour - 1 })
    expect(canApply(s, { type: 'BAJAK', plotId: 1 })).toBe('toasts.no_time')
    expect(applyAction(s, { type: 'BAJAK', plotId: 1 })).toBe(s)
  })

  it('applies baja only inside a stage window and uses a bag', () => {
    const [first = 0] = RULES.fertiliser.stageDays
    const early = plantedState(first - 1, {})
    expect(canApply({ ...early, baja: 1 }, { type: 'BAJA', plotId: 1 })).toBe('reasons.not_now')

    const due = { ...plantedState(first), baja: 1 }
    const s = applyAction(due, { type: 'BAJA', plotId: 1 })
    expect(plot(s, 1).bajaDone[0]).toBe(true)
    expect(s.baja).toBe(0)
    expect(canApply({ ...s, baja: 1 }, { type: 'BAJA', plotId: 1 })).toBe('reasons.not_now')
    expect(canApply(plantedState(first), { type: 'BAJA', plotId: 1 })).toBe('reasons.no_baja')
  })

  it('clears one weed or snail patch per job', () => {
    const s = plantedState(5, { weeds: 2, snails: 1 })
    const weeded = applyAction(s, { type: 'RUMPAI', plotId: 1 })
    expect(plot(weeded, 1).weeds).toBe(1)
    const picked = applyAction(weeded, { type: 'SIPUT', plotId: 1 })
    expect(plot(picked, 1).snails).toBe(0)
    expect(canApply(picked, { type: 'SIPUT', plotId: 1 })).toBe('reasons.not_now')
  })

  it('does not harvest before the padi is ripe', () => {
    const s = plantedState(RULES.harvest.earlyFirstDay - 1)
    expect(canApply(s, { type: 'TUAI', plotId: 1 })).toBe('reasons.not_ripe')
  })
})
