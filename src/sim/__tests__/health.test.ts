import { describe, expect, it } from 'vitest'
import { advanceDay } from '../day'
import { createRng } from '../rng'
import { RULES } from '../rules'
import { plantedState, plot } from './helpers'

const penalty = RULES.water.healthPenaltyPerDayOffTarget

describe('health', () => {
  it('loses health for a day outside the water band', () => {
    // Day 2 band is 5-7 cm; 0 cm is too dry.
    const s = advanceDay(plantedState(2, { waterCm: 0 }), createRng(1))
    expect(plot(s, 1).health).toBe(100 - penalty)
  })

  it('keeps health inside the band', () => {
    const s = advanceDay(plantedState(2, { waterCm: 6 }), createRng(1))
    expect(plot(s, 1).health).toBe(100)
  })

  it('loses health per weed and snail patch', () => {
    const s = advanceDay(plantedState(13, { waterCm: 7, weeds: 2, snails: 1 }), createRng(1))
    const expected =
      100 -
      2 * RULES.weeds.healthPenaltyPerPatchPerDay -
      1 * RULES.snails.healthPenaltyPerPatchPerDay
    expect(plot(s, 1).health).toBe(expected)
  })

  it('never drops below 0', () => {
    const s = advanceDay(plantedState(2, { health: 3, weeds: 5 }), createRng(1))
    expect(plot(s, 1).health).toBe(0)
  })

  it('leaves unplanted plots alone', () => {
    const s = advanceDay(plantedState(2, { status: 'ploughed', health: 100 }), createRng(1))
    expect(plot(s, 1).health).toBe(100)
  })

  it('spawns weeds and snails only inside their windows', () => {
    const outside = RULES.weeds.window.toDay + 1
    let s = plantedState(outside, { waterCm: 7 })
    for (let i = 0; i < 3; i++) s = advanceDay(s, createRng(i))
    expect(plot(s, 1).weeds).toBe(0)
    expect(plot(s, 1).snails).toBe(0)
  })

  it('spawns fewer weeds for MR220 CL2', () => {
    const count = (variety: 'mr297' | 'mr220cl2') => {
      let total = 0
      for (let seed = 0; seed < 400; seed++) {
        const s = advanceDay(plantedState(3, { variety, waterCm: 6 }), createRng(seed))
        total += plot(s, 1).weeds
      }
      return total
    }
    expect(count('mr220cl2')).toBeLessThan(count('mr297') * 0.6)
  })
})

describe('balance note', () => {
  // Not a rule, a record: with +2 cm a day, the day-2 band (5-7 cm) is out of reach
  // until day 4 even with the gate opened on day 1. Owner decides whether to retune.
  it('costs a perfect player two days of water penalty after sowing', () => {
    let s = plantedState(1, { waterCm: 0 })
    s = { ...s, gates: { A: true, B: false } }
    const rng = createRng(1)
    for (let day = 1; day <= 3; day++) s = advanceDay(s, rng)
    expect(100 - plot(s, 1).health).toBeGreaterThanOrEqual(2 * penalty)
  })
})
