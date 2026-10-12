import { RULES, VARIETY_LIST } from './rules'
import { unlockBy } from './facts'
import { refreshTasks } from './tasks'
import type { GameState, Plot, VarietyId } from './types'

const PLOT_IDS = [1, 2, 3, 4]

export function plotsOpenInSeason(season: number): number[] {
  const entries = RULES.plotsBySeason.filter((e) => e.season <= season)
  return entries.at(-1)?.plots ?? []
}

function emptyPlot(id: number, open: boolean): Plot {
  return {
    id,
    status: open ? 'empty' : 'locked',
    variety: null,
    waterCm: 0,
    health: RULES.health.start,
    weeds: 0,
    snails: 0,
    bajaDone: RULES.fertiliser.stageDays.map(() => false),
    yieldMultiplier: 1,
    daysOffWater: 0,
  }
}

export function emptyPlots(season: number): Plot[] {
  const open = plotsOpenInSeason(season)
  return PLOT_IDS.map((id) => emptyPlot(id, open.includes(id)))
}

export const EMPTY_LEDGER = { seedRm: 0, bajaRm: 0, cardRm: 0, interestRm: 0 }

export const EMPTY_TODAY: GameState['today'] = {
  earned: 0,
  spent: 0,
  farmJob: false,
  caughtFish: false,
  harvested: false,
  wentLive: false,
}

export interface NewGameOptions {
  /** Tok Wan's starter seed (picked in onboarding from M6). */
  starter: VarietyId
  season?: number
}

export function createInitialState({ starter, season = 1 }: NewGameOptions): GameState {
  const benih = Object.fromEntries(VARIETY_LIST.map((v) => [v, 0])) as Record<VarietyId, number>
  benih[starter] = 1
  const state: GameState = {
    season,
    day: 1,
    hour: RULES.clock.dayStartHour,
    coins: RULES.economy.startCoins,
    benih,
    baja: 0,
    plots: emptyPlots(season),
    gates: { A: false, B: false },
    loan: { balance: 0, interestCharged: false },
    harvests: [],
    tasksToday: [],
    pendingCard: null,
    cards: { nextNight: RULES.events.firstCardNight, lastKind: null },
    effects: [],
    phoneOffDays: 0,
    hoursLostTomorrow: 0,
    facts: [],
    factsAtSeasonStart: 0,
    ledger: EMPTY_LEDGER,
    today: EMPTY_TODAY,
    phase: 'playing',
    ending: null,
    fish: { keli: 0, haruan: 0, puyu: 0, sepat: 0, tilapia: 0 },
    catchesToday: {},
    fishPriceToday: 1,
    fishPriceTomorrow: 1,
    followers: 0,
    lastLive: null,
    moments: [],
    momentsSeen: [],
    rayaHere: false,
    lastCardOutcome: null,
  }
  // The starter seed counts as a seed bought (facts.yaml).
  return refreshTasks(unlockBy(state, { on: 'buy_seed', variety: starter }))
}
