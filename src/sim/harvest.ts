import { harvestTiming, lastIdealDay } from './calendar'
import { RULES, VARIETIES, type Variety } from './rules'
import type { GameState, HarvestResult, Plot } from './types'

function timingFactor(day: number, variety: Variety): number {
  switch (harvestTiming(day, variety)) {
    case 'too_early':
      return 0
    case 'early':
      return RULES.harvest.earlyYieldFactor
    case 'ideal':
      return 1
    case 'late':
      return RULES.harvest.lateYieldFactorPerDay ** (day - lastIdealDay(variety))
  }
}

/** Yield = base × health/100 × fertiliser × harvest timing × card multipliers. */
export function harvestYieldKg(plot: Plot, day: number): number {
  if (!plot.variety) return 0
  const variety = VARIETIES[plot.variety]
  const missed = plot.bajaDone.filter((done) => !done).length
  const fertiliser = Math.max(0, 1 - missed * RULES.fertiliser.missedStageYieldPenalty)
  return Math.round(
    variety.baseYieldKg *
      (plot.health / RULES.health.max) *
      fertiliser *
      timingFactor(day, variety) *
      plot.yieldMultiplier,
  )
}

export function potonganRate(waterCm: number, day: number, variety: Variety): number {
  const p = RULES.harvest.potongan
  let rate = p.base
  if (waterCm > p.drainedMaxCm) rate += p.notDrained
  if (harvestTiming(day, variety) === 'late') rate += p.late
  return Math.min(rate, p.max)
}

/** Harvest a plot: sell the crop, repay the loan first, pay the player the rest. */
export function harvestPlot(state: GameState, plot: Plot): GameState {
  if (!plot.variety) return state
  const variety = VARIETIES[plot.variety]
  const kg = harvestYieldKg(plot, state.day)
  const rate = potonganRate(plot.waterCm, state.day, variety)
  const soldKg = Math.round(kg * (1 - rate))
  const saleRm = Math.round(soldKg * RULES.economy.salePricePerKg * variety.priceMultiplier)
  const subsidyRm = Math.round(soldKg * RULES.economy.subsidyPerKg)
  const proceeds = saleRm + subsidyRm

  // Interest is charged once a season, on the balance at the first harvest.
  let { balance, interestCharged } = state.loan
  let loanInterestRm = 0
  if (!interestCharged && balance > 0) {
    loanInterestRm = Math.round(balance * RULES.loan.seasonRate)
    balance += loanInterestRm
    interestCharged = true
  }
  const loanRepaidRm = Math.min(balance, proceeds)
  balance -= loanRepaidRm
  const netToPlayerRm = proceeds - loanRepaidRm

  const result: HarvestResult = {
    plotId: plot.id,
    day: state.day,
    variety: variety.id,
    kg,
    potonganRate: rate,
    soldKg,
    saleRm,
    subsidyRm,
    loanInterestRm,
    loanRepaidRm,
    netToPlayerRm,
  }

  return {
    ...state,
    coins: state.coins + netToPlayerRm,
    loan: { balance, interestCharged },
    plots: state.plots.map((p) => (p.id === plot.id ? { ...p, status: 'harvested' } : p)),
    harvests: [...state.harvests, result],
  }
}
