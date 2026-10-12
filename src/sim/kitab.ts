// The Kitab's "Buka" tab: what has opened and what's next (spec §4.10).
import { RULES } from './rules'
import type { GameState } from './types'

export interface KitabUnlock {
  key: 'live' | 'raya' | 'plot_2' | 'plot_3_4'
  unlocked: boolean
  /** Shown while locked: the day or the season it opens. */
  hint: { day: number } | { season: number }
}

function reached(state: GameState, at: { season: number; day: number }): boolean {
  return state.season > at.season || (state.season === at.season && state.day >= at.day)
}

function seasonOpening(plotId: number): number {
  return RULES.plotsBySeason.find((e) => e.plots.includes(plotId))?.season ?? Infinity
}

export function kitabUnlocks(state: GameState): KitabUnlock[] {
  const { live, raya } = RULES.unlocks
  const plot2 = seasonOpening(2)
  const plot34 = Math.max(seasonOpening(3), seasonOpening(4))
  return [
    { key: 'live', unlocked: reached(state, live), hint: { day: live.day } },
    { key: 'raya', unlocked: reached(state, raya), hint: { day: raya.day } },
    { key: 'plot_2', unlocked: state.season >= plot2, hint: { season: plot2 } },
    { key: 'plot_3_4', unlocked: state.season >= plot34, hint: { season: plot34 } },
  ]
}
