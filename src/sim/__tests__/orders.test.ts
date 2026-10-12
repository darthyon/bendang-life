import { describe, expect, it } from 'vitest'
import { applyAction, canApply } from '../actions'
import { RULES, VARIETIES } from '../rules'
import { freshState } from './helpers'

describe('Kedai Tani orders', () => {
  it('buys a seed bag at the variety price', () => {
    const s = applyAction(freshState(), { type: 'BUY_BENIH', variety: 'mrq76' })
    expect(s.benih.mrq76).toBe(1)
    expect(s.coins).toBe(RULES.economy.startCoins - VARIETIES.mrq76.price)
  })

  it('buys a baja bag', () => {
    const s = applyAction(freshState(), { type: 'BUY_BAJA' })
    expect(s.baja).toBe(1)
    expect(s.coins).toBe(RULES.economy.startCoins - RULES.economy.bajaBagPrice)
  })

  it('refuses without enough coins and takes no time', () => {
    const s = freshState({ coins: 10 })
    expect(canApply(s, { type: 'BUY_BAJA' })).toBe('shop.not_enough')
    expect(applyAction(freshState(), { type: 'BUY_BAJA' }).hour).toBe(RULES.clock.dayStartHour)
  })
})
