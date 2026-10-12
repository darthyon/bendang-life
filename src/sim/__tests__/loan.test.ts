import { describe, expect, it } from 'vitest'
import { applyAction, canApply } from '../actions'
import { RULES } from '../rules'
import { freshState, plantedState } from './helpers'

const max = RULES.loan.maxAmount
const allBaja = [true, true, true, true]

describe('Agribank loan', () => {
  it('lends up to the maximum in total', () => {
    let s = applyAction(freshState(), { type: 'LOAN_TAKE', amount: 1500 })
    expect(s.loan.balance).toBe(1500)
    expect(s.coins).toBe(RULES.economy.startCoins + 1500)
    expect(canApply(s, { type: 'LOAN_TAKE', amount: max - 1500 + 1 })).toBe('reasons.loan_limit')
    s = applyAction(s, { type: 'LOAN_TAKE', amount: max - 1500 })
    expect(s.loan.balance).toBe(max)
  })

  it('rejects zero or negative amounts', () => {
    expect(canApply(freshState(), { type: 'LOAN_TAKE', amount: 0 })).toBe('reasons.not_now')
    expect(canApply(freshState(), { type: 'LOAN_REPAY', amount: -5 })).toBe('reasons.not_now')
  })

  it('repays part or all early from coins', () => {
    let s = applyAction(freshState(), { type: 'LOAN_TAKE', amount: 1000 })
    s = applyAction(s, { type: 'LOAN_REPAY', amount: 400 })
    expect(s.loan.balance).toBe(600)
    expect(canApply(s, { type: 'LOAN_REPAY', amount: 601 })).toBe('reasons.not_now')
    s = applyAction(s, { type: 'LOAN_REPAY', amount: 600 })
    expect(s.loan.balance).toBe(0)
  })

  it('needs the coins to repay', () => {
    const s = freshState({ coins: 50, loan: { balance: 500, interestCharged: false } })
    expect(canApply(s, { type: 'LOAN_REPAY', amount: 100 })).toBe('shop.not_enough')
  })

  it('charges interest once at harvest and repays from the sale', () => {
    const s = {
      ...plantedState(19, { bajaDone: allBaja }),
      loan: { balance: 1000, interestCharged: false },
    }
    const after = applyAction(s, { type: 'TUAI', plotId: 1 })
    const result = after.harvests.at(-1)
    expect(result?.loanInterestRm).toBe(Math.round(1000 * RULES.loan.seasonRate))
    expect(result?.loanRepaidRm).toBe(1000 + (result?.loanInterestRm ?? 0))
    expect(after.loan.balance).toBe(0)
    expect(after.loan.interestCharged).toBe(true)
  })

  it('rolls the rest over when the harvest cannot cover it', () => {
    const s = {
      ...plantedState(19, { bajaDone: allBaja, health: 10 }),
      loan: { balance: 2000, interestCharged: false },
    }
    const after = applyAction(s, { type: 'TUAI', plotId: 1 })
    const result = after.harvests.at(-1)
    expect(after.loan.balance).toBeGreaterThan(0)
    expect(result?.netToPlayerRm).toBe(0)
    expect(after.coins).toBe(s.coins)
  })
})
