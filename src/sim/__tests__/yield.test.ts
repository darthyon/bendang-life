import { describe, expect, it } from 'vitest'
import { harvestYieldKg } from '../harvest'
import { RULES, VARIETIES } from '../rules'
import { plantedState, plot } from './helpers'

const allBaja = [true, true, true, true]
const base = VARIETIES.mr297.baseYieldKg

describe('yield', () => {
  it('gives the base yield at full health, all baja, ideal day', () => {
    const s = plantedState(19, { bajaDone: allBaja })
    expect(harvestYieldKg(plot(s, 1), 19)).toBe(base)
  })

  it('scales with health', () => {
    const s = plantedState(19, { bajaDone: allBaja, health: 50 })
    expect(harvestYieldKg(plot(s, 1), 19)).toBe(Math.round(base * 0.5))
  })

  it('loses 10% per missed baja stage', () => {
    const s = plantedState(19, { bajaDone: [true, false, true, false] })
    const factor = 1 - 2 * RULES.fertiliser.missedStageYieldPenalty
    expect(harvestYieldKg(plot(s, 1), 19)).toBe(Math.round(base * factor))
  })

  it('uses the early factor before the ideal days', () => {
    const s = plantedState(17, { bajaDone: allBaja })
    expect(harvestYieldKg(plot(s, 1), 17)).toBe(Math.round(base * RULES.harvest.earlyYieldFactor))
  })

  it('compounds the late factor per day late', () => {
    const s = plantedState(22, { bajaDone: allBaja })
    const f = RULES.harvest.lateYieldFactorPerDay ** 2
    expect(harvestYieldKg(plot(s, 1), 22)).toBe(Math.round(base * f))
  })

  it('applies card yield multipliers', () => {
    const s = plantedState(19, { bajaDone: allBaja, yieldMultiplier: 0.95 })
    expect(harvestYieldKg(plot(s, 1), 19)).toBe(Math.round(base * 0.95))
  })
})
