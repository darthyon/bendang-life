import { createInitialState } from '../state'
import type { GameState, Plot } from '../types'

/** Season-1 start with Plot 1 open and one MR297 bag. */
export function freshState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState({ starter: 'mr297' }), ...overrides }
}

export function withPlot(state: GameState, plotId: number, patch: Partial<Plot>): GameState {
  return {
    ...state,
    plots: state.plots.map((p) => (p.id === plotId ? { ...p, ...patch } : p)),
  }
}

export function plot(state: GameState, plotId: number): Plot {
  const found = state.plots.find((p) => p.id === plotId)
  if (!found) throw new Error(`no plot ${plotId}`)
  return found
}

/** A planted MR297 plot 1 at full health, dry, nothing applied. */
export function plantedState(day: number, patch: Partial<Plot> = {}): GameState {
  return withPlot(freshState({ day }), 1, {
    status: 'planted',
    variety: 'mr297',
    health: 100,
    waterCm: 0,
    ...patch,
  })
}
