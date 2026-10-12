import { describe, expect, it } from 'vitest'
import { plotProblems } from '../selectors'
import { freshState, plantedState } from './helpers'

describe('plot problems', () => {
  it('has none for an unplanted plot', () => {
    expect(plotProblems(freshState(), 1)).toEqual([])
  })

  it('lists problems in priority order', () => {
    const s = { ...plantedState(2, { waterCm: 0, weeds: 1, snails: 1 }) }
    expect(plotProblems(s, 1)).toEqual(['snails', 'weeds', 'water_low', 'baja'])
  })

  it('flags deep water and ripe padi', () => {
    expect(plotProblems(plantedState(17, { waterCm: 5 }), 1)).toEqual(['ripe', 'water_high'])
  })

  it('stops flagging baja once applied', () => {
    const s = plantedState(2, { waterCm: 6, bajaDone: [true, false, false, false] })
    expect(plotProblems(s, 1)).toEqual([])
  })
})
