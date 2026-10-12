import type { GameState } from './types'

/** True once the game has reached this season and day (or any later season). */
export function reached(state: GameState, at: { season: number; day: number }): boolean {
  return state.season > at.season || (state.season === at.season && state.day >= at.day)
}
