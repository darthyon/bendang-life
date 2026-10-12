import { create } from 'zustand'
import { applyAction, canApply, type ReasonKey } from '../sim/actions'
import { advanceDay } from '../sim/day'
import { createRng } from '../sim/rng'
import { createInitialState } from '../sim/state'
import type { Action, GameState } from '../sim/types'

interface GameStore {
  game: GameState
  seed: number
  /** Saved RNG position so the season replays the same from a save. */
  rngState: number
  /** Apply an action. Returns why it was blocked, or null if it happened. */
  dispatch: (action: Action) => ReasonKey | null
  /** Tidur: end the day. */
  sleep: () => void
  /** Replace the game state directly. Debug panel only. */
  debugSet: (next: GameState) => void
}

const seed = Date.now() >>> 0

export const useGame = create<GameStore>((set, get) => ({
  // Onboarding (M6) picks the starter seed; M2 starts with MR297.
  game: createInitialState({ starter: 'mr297' }),
  seed,
  rngState: seed,
  dispatch: (action) => {
    const { game } = get()
    const reason = canApply(game, action)
    if (reason === null) set({ game: applyAction(game, action) })
    return reason
  },
  sleep: () => {
    const { game, seed: s, rngState } = get()
    const rng = createRng(s, rngState)
    set({ game: advanceDay(game, rng), rngState: rng.state() })
  },
  debugSet: (next) => set({ game: next }),
}))
