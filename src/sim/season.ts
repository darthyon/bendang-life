// Season end, Tok Wan's report and the choice after it (spec §4.10).
import { unlockBy } from './facts'
import { RULES } from './rules'
import { EMPTY_LEDGER, EMPTY_TODAY, emptyPlots } from './state'
import { refreshTasks } from './tasks'
import type { GameState } from './types'

export type Verdict = 'untung' | 'pulang_modal' | 'rugi'

export interface ReportLine {
  /** i18n key under report.* */
  key: string
  params?: Record<string, number>
}

export interface Report {
  season: number
  kg: number
  saleRm: number
  potonganRm: number
  subsidyRm: number
  costs: number
  loanRepaidRm: number
  net: number
  verdict: Verdict
  good: ReportLine[]
  missed: ReportLine[]
  newFacts: string[]
}

/**
 * The season is over on the morning after the last calendar day once nothing is still growing,
 * or after the last allowed day whatever is left.
 */
export function isSeasonOver(state: GameState): boolean {
  if (state.day > RULES.season.lastDay) return true
  if (state.day <= RULES.season.days) return false
  return !state.plots.some((p) => p.status === 'planted')
}

export function buildReport(state: GameState): Report {
  const harvests = state.harvests.filter((h) => h.season === state.season)
  const sum = (fn: (h: (typeof harvests)[number]) => number) =>
    harvests.reduce((a, h) => a + fn(h), 0)

  const kg = sum((h) => h.kg)
  const saleRm = sum((h) => h.saleRm)
  const subsidyRm = sum((h) => h.subsidyRm)
  const potonganRm = Math.round(sum((h) => (h.kg - h.soldKg) * RULES.economy.salePricePerKg))
  const { seedRm, bajaRm, cardRm, interestRm } = state.ledger
  const costs = seedRm + bajaRm + cardRm + interestRm
  const net = saleRm + subsidyRm - costs
  const margin = RULES.season.verdictMargin
  const verdict: Verdict = net > margin ? 'untung' : net < -margin ? 'rugi' : 'pulang_modal'

  const good: ReportLine[] = []
  const missed: ReportLine[] = []
  const bajaMissed = sum((h) => h.bajaMissed)
  const offWater = state.plots.reduce((a, p) => a + p.daysOffWater, 0)
  const lost = state.plots.filter((p) => p.status === 'planted').length

  if (harvests.length > 0) {
    if (bajaMissed === 0) good.push({ key: 'good_baja' })
    else missed.push({ key: 'missed_baja', params: { n: bajaMissed } })
    if (harvests.every((h) => h.drained)) good.push({ key: 'good_drained' })
    else missed.push({ key: 'not_drained' })
    if (harvests.every((h) => h.timing === 'ideal')) good.push({ key: 'good_timing' })
    if (harvests.some((h) => h.timing === 'late')) missed.push({ key: 'late' })
    if (harvests.some((h) => h.timing === 'early')) missed.push({ key: 'early' })
  }
  if (offWater > 0) missed.push({ key: 'water_days', params: { n: offWater } })
  else if (harvests.length > 0) good.push({ key: 'good_water' })
  if (lost > 0) missed.push({ key: 'plot_lost', params: { n: lost } })

  return {
    season: state.season,
    kg,
    saleRm,
    potonganRm,
    subsidyRm,
    costs,
    loanRepaidRm: sum((h) => h.loanRepaidRm),
    net,
    verdict,
    good,
    missed,
    newFacts: state.facts.slice(state.factsAtSeasonStart),
  }
}

/** Tok Wan comes back: the report is shown. Report facts unlock now. */
export function finishSeason(state: GameState): GameState {
  return { ...unlockBy(state, { on: 'report' }), phase: 'report', pendingCard: null }
}

/** Musim Baru: keep coins, loan, bags and the Kitab; plots reset and one more opens. */
export function newSeason(state: GameState): GameState {
  const season = state.season + 1
  return refreshTasks({
    ...state,
    season,
    day: 1,
    hour: RULES.clock.dayStartHour,
    plots: emptyPlots(season),
    gates: { A: false, B: false },
    loan: { ...state.loan, interestCharged: false },
    tasksToday: [],
    pendingCard: null,
    cards: { nextNight: RULES.events.firstCardNight, lastKind: null },
    effects: [],
    phoneOffDays: 0,
    hoursLostTomorrow: 0,
    factsAtSeasonStart: state.facts.length,
    ledger: EMPTY_LEDGER,
    today: EMPTY_TODAY,
    catchesToday: {},
    phase: 'playing',
  })
}

/** Balik KL: the ending card with everything harvested and every fact learned. */
export function leaveForKl(state: GameState): GameState {
  return {
    ...state,
    phase: 'ended',
    ending: { kg: state.harvests.reduce((a, h) => a + h.kg, 0), facts: state.facts.length },
  }
}
