import { create } from 'zustand'
import { applyAction, canApply, type ReasonKey } from '../sim/actions'
import { advanceDay } from '../sim/day'
import { createRng } from '../sim/rng'
import { createInitialState } from '../sim/state'
import type { Action, GameState } from '../sim/types'

export interface Toast {
  id: number
  /** i18n key and its placeholders. */
  key: string
  params?: Record<string, string | number>
}

interface UiState {
  phoneOpen: boolean
  /** Plot whose panel is open, or null. */
  plotPanelId: number | null
  /** Plot the player is standing in (for Tab), or null. */
  standingPlotId: number | null
  /** Increments on each new morning; drives the wake-up fade. */
  morning: number
}

interface GameStore {
  game: GameState
  seed: number
  /** Saved RNG position so the season replays the same from a save. */
  rngState: number
  ui: UiState
  toasts: Toast[]
  /** Apply an action. Returns why it was blocked, or null if it happened. */
  dispatch: (action: Action) => ReasonKey | null
  /** Tidur: end the day. */
  sleep: () => void
  setPhone: (open: boolean) => void
  setPlotPanel: (plotId: number | null) => void
  setStandingPlot: (plotId: number | null) => void
  toast: (key: string, params?: Toast['params']) => void
  dismissToast: (id: number) => void
  /** Replace the game state directly. Debug panel only. */
  debugSet: (next: GameState) => void
}

const seed = Date.now() >>> 0
let toastId = 0
const TOAST_MS = 3200

// Actions that deliver goods to the cottage steps.
const ORDERS: Action['type'][] = ['BUY_BENIH', 'BUY_BAJA']

export const useGame = create<GameStore>((set, get) => ({
  // Onboarding (M6) picks the starter seed; until then the game starts with MR297.
  game: createInitialState({ starter: 'mr297' }),
  seed,
  rngState: seed,
  ui: { phoneOpen: false, plotPanelId: null, standingPlotId: null, morning: 0 },
  toasts: [],
  dispatch: (action) => {
    const { game, toast } = get()
    const reason = canApply(game, action)
    if (reason !== null) return reason
    const next = applyAction(game, action)
    set({ game: next })
    if (ORDERS.includes(action.type)) toast('phone.delivered')
    const harvest = next.harvests.length > game.harvests.length ? next.harvests.at(-1) : undefined
    if (harvest) toast('toasts.harvested', { kg: harvest.kg })
    return null
  },
  sleep: () => {
    const { game, seed: s, rngState, ui } = get()
    const rng = createRng(s, rngState)
    set({
      game: advanceDay(game, rng),
      rngState: rng.state(),
      ui: { ...ui, morning: ui.morning + 1 },
    })
  },
  setPhone: (open) => set((s) => ({ ui: { ...s.ui, phoneOpen: open } })),
  setPlotPanel: (plotId) => set((s) => ({ ui: { ...s.ui, plotPanelId: plotId } })),
  setStandingPlot: (plotId) =>
    set((s) => (s.ui.standingPlotId === plotId ? s : { ui: { ...s.ui, standingPlotId: plotId } })),
  toast: (key, params) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, key, params }] }))
    window.setTimeout(() => get().dismissToast(id), TOAST_MS)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  debugSet: (next) => set({ game: next }),
}))

/** True while time should stand still (spec §4.2). */
export function isPaused(): boolean {
  return useGame.getState().ui.phoneOpen
}
