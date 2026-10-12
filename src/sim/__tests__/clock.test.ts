import { describe, expect, it } from 'vitest'
import { applyAction } from '../actions'
import { weekOf, weekdayOf } from '../calendar'
import { RULES } from '../rules'
import { freshState } from './helpers'

describe('clock', () => {
  it('passes time', () => {
    const s = applyAction(freshState(), { type: 'PASS_TIME', hours: 1.5 })
    expect(s.hour).toBe(RULES.clock.dayStartHour + 1.5)
  })

  it('stops at night start', () => {
    const s = applyAction(freshState({ hour: 18.8 }), { type: 'PASS_TIME', hours: 1 })
    expect(s.hour).toBe(RULES.clock.nightStartHour)
  })

  it('reads the real seconds per game hour from rules', () => {
    expect(RULES.clock.realSecondsPerGameHour).toBeGreaterThan(0)
  })

  it('maps season days to weeks and weekdays, day 1 = Monday', () => {
    expect([weekOf(1), weekdayOf(1)]).toEqual([1, 1])
    expect([weekOf(7), weekdayOf(7)]).toEqual([1, 7])
    expect([weekOf(8), weekdayOf(8)]).toEqual([2, 1])
  })
})
