import { create } from 'zustand'
import { applyAction, canApply, type ReasonKey } from '../sim/actions'
import { advanceDay } from '../sim/day'
import { canResolve, resolveCard, startNight } from '../sim/events'
import { buildRecap, type Recap } from '../sim/recap'
import { finishSeason, isSeasonOver } from '../sim/season'
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
  /** The night scene: the card (if any), then the recap. Null during the day. */
  night: { step: 'card' } | { step: 'recap'; recap: Recap } | null
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
  /** Tidur or 7 PM: start the night. */
  sleep: () => void
  /** Pick an option on tonight's card (or 'decline' a Rezeki). */
  chooseCard: (optionId: string) => ReasonKey | null
  /** Close the recap and start the next morning. */
  wake: () => void
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

export const useGame = create<GameStore>((set, get) => {
  /** The RNG at its saved position. Callers save `rng.state()` back via `commit`. */
  const rngNow = () => createRng(get().seed, get().rngState)

  /** Store new game state; toast when the Kitab gains a fact. */
  const commit = (next: GameState, rngState?: number) => {
    const before = get().game
    set(rngState === undefined ? { game: next } : { game: next, rngState })
    if (next.facts.length > before.facts.length) get().toast('toasts.fact_unlocked')
  }

  /** Run the night: advance to the next morning and show the recap. */
  const endNight = () => {
    const before = get().game
    const rng = rngNow()
    const after = advanceDay(before, rng)
    commit(after, rng.state())
    set((st) => ({ ui: { ...st.ui, night: { step: 'recap', recap: buildRecap(before, after) } } }))
  }

  return {
    // Onboarding (M6) picks the starter seed; until then the game starts with MR297.
    game: createInitialState({ starter: 'mr297' }),
    seed,
    rngState: seed,
    ui: { phoneOpen: false, plotPanelId: null, standingPlotId: null, morning: 0, night: null },
    toasts: [],
    dispatch: (action) => {
      const { game, toast } = get()
      const reason = canApply(game, action)
      if (reason !== null) return reason
      const next = applyAction(game, action)
      commit(next)
      if (ORDERS.includes(action.type)) toast('phone.delivered')
      const harvest = next.harvests.length > game.harvests.length ? next.harvests.at(-1) : undefined
      if (harvest) toast('toasts.harvested', { kg: harvest.kg })
      return null
    },
    sleep: () => {
      const { game, ui } = get()
      if (ui.night || game.phase !== 'playing') return
      const rng = rngNow()
      const night = startNight(game, rng)
      commit(night, rng.state())
      set((st) => ({ ui: { ...st.ui, phoneOpen: false, plotPanelId: null } }))
      if (night.pendingCard) set((st) => ({ ui: { ...st.ui, night: { step: 'card' } } }))
      else endNight()
    },
    chooseCard: (optionId) => {
      const { game } = get()
      const reason = canResolve(game, optionId)
      if (reason !== null) return reason
      const rng = rngNow()
      commit(resolveCard(game, optionId, rng), rng.state())
      endNight()
      return null
    },
    wake: () => {
      const { game } = get()
      if (isSeasonOver(game)) commit(finishSeason(game))
      set((st) => ({ ui: { ...st.ui, night: null, morning: st.ui.morning + 1 } }))
    },
    setPhone: (open) => set((s) => ({ ui: { ...s.ui, phoneOpen: open } })),
    setPlotPanel: (plotId) => set((s) => ({ ui: { ...s.ui, plotPanelId: plotId } })),
    setStandingPlot: (plotId) =>
      set((s) =>
        s.ui.standingPlotId === plotId ? s : { ui: { ...s.ui, standingPlotId: plotId } },
      ),
    toast: (key, params) => {
      const id = ++toastId
      set((s) => ({ toasts: [...s.toasts.slice(-2), { id, key, params }] }))
      window.setTimeout(() => get().dismissToast(id), TOAST_MS)
    },
    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    debugSet: (next) => set({ game: next }),
  }
})

/** True while time should stand still (spec §4.2): phone, night scene, report. */
export function isPaused(): boolean {
  const { ui, game } = useGame.getState()
  return ui.phoneOpen || ui.night !== null || game.phase !== 'playing'
}
