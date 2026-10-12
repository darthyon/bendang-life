import { describe, expect, it } from 'vitest'
import { applyAction } from '../actions'
import { RULES, VARIETIES } from '../rules'
import { plantedState, plot } from './helpers'

const allBaja = [true, true, true, true]
const { salePricePerKg, subsidyPerKg } = RULES.economy

describe('harvest sale', () => {
  it('sells the crop after potongan, adds the subsidy and pays the player', () => {
    const s = plantedState(19, { bajaDone: allBaja })
    const after = applyAction(s, { type: 'TUAI', plotId: 1 })
    const r = after.harvests.at(-1)
    const kg = VARIETIES.mr297.baseYieldKg
    const sold = Math.round(kg * (1 - RULES.harvest.potongan.base))
    expect(r).toMatchObject({ plotId: 1, kg, soldKg: sold })
    expect(r?.saleRm).toBe(Math.round(sold * salePricePerKg))
    expect(r?.subsidyRm).toBe(Math.round(sold * subsidyPerKg))
    expect(after.coins).toBe(s.coins + (r?.saleRm ?? 0) + (r?.subsidyRm ?? 0))
    expect(plot(after, 1).status).toBe('harvested')
  })

  it('applies the fragrant price multiplier to the sale, not the subsidy', () => {
    const s = plantedState(19, { variety: 'mrq76', bajaDone: allBaja })
    const r = applyAction(s, { type: 'TUAI', plotId: 1 }).harvests.at(-1)
    const sold = r?.soldKg ?? 0
    expect(r?.saleRm).toBe(Math.round(sold * salePricePerKg * VARIETIES.mrq76.priceMultiplier))
    expect(r?.subsidyRm).toBe(Math.round(sold * subsidyPerKg))
  })
})
