import { RULES, VARIETY_LIST } from './rules'
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
  }
}

export interface NewGameOptions {
  /** Tok Wan's starter seed (picked in onboarding from M6). */
  starter: VarietyId
  season?: number
}

export function createInitialState({ starter, season = 1 }: NewGameOptions): GameState {
  const open = plotsOpenInSeason(season)
  const benih = Object.fromEntries(VARIETY_LIST.map((v) => [v, 0])) as Record<VarietyId, number>
  benih[starter] = 1
  return {
    season,
    day: 1,
    hour: RULES.clock.dayStartHour,
    coins: RULES.economy.startCoins,
    benih,
    baja: 0,
    plots: PLOT_IDS.map((id) => emptyPlot(id, open.includes(id))),
    gates: { A: false, B: false },
    loan: { balance: 0, interestCharged: false },
    harvests: [],
  }
}
