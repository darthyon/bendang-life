import { describe, expect, it } from 'vitest'
import { bajaStageDue, harvestTiming, stageForDay, waterTarget } from '../calendar'
import { RULES, VARIETIES } from '../rules'

describe('calendar', () => {
  it('maps every season day to the stage and band in rules.yaml', () => {
    for (const band of RULES.water.targets) {
      for (let day = band.fromDay; day <= band.toDay; day++) {
        expect(stageForDay(day)).toBe(band.stage)
        expect(waterTarget(day)).toEqual({ min: band.minCm, max: band.maxCm })
      }
    }
  })

  it('keeps the last band after the season length', () => {
    expect(stageForDay(RULES.season.days + 3)).toBe('sedia_tuai')
    expect(waterTarget(RULES.season.days + 3)).toEqual({ min: 0, max: 1 })
  })

  it('opens each baja stage for its window only', () => {
    const [first = 0, , , fourth = 0] = RULES.fertiliser.stageDays
    expect(bajaStageDue(first - 1)).toBeNull()
    expect(bajaStageDue(first)).toBe(0)
    expect(bajaStageDue(first + RULES.fertiliser.windowDays - 1)).toBe(0)
    expect(bajaStageDue(first + RULES.fertiliser.windowDays)).toBeNull()
    expect(bajaStageDue(fourth)).toBe(3)
  })

  it('classifies harvest timing by the variety window', () => {
    const mr297 = VARIETIES.mr297
    const mrq76 = VARIETIES.mrq76
    expect(harvestTiming(16, mr297)).toBe('too_early')
    expect(harvestTiming(17, mr297)).toBe('early')
    expect(harvestTiming(19, mr297)).toBe('ideal')
    expect(harvestTiming(20, mr297)).toBe('ideal')
    expect(harvestTiming(21, mr297)).toBe('late')
    expect(harvestTiming(19, mrq76)).toBe('ideal')
    expect(harvestTiming(20, mrq76)).toBe('late')
  })
})
