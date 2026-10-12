import { bajaStageDue, harvestTiming } from './calendar'
import { harvestPlot } from './harvest'
import { RULES, VARIETIES } from './rules'
import type { Action, GameState, JobId, Plot } from './types'

/** An i18n key explaining why an action can't happen now. */
export type ReasonKey =
  | 'toasts.no_time'
  | 'shop.not_enough'
  | 'stages.locked'
  | 'reasons.no_benih'
  | 'reasons.no_baja'
  | 'reasons.not_ripe'
  | 'reasons.loan_limit'
  | 'reasons.not_now'

const JOB_OF: Partial<Record<Action['type'], JobId>> = {
  BAJAK: 'bajak',
  TANAM: 'tanam',
  TOGGLE_GATE: 'pintu_air',
  BAJA: 'baja',
  RUMPAI: 'rumpai',
  SIPUT: 'siput',
  TUAI: 'tuai',
}

function findPlot(state: GameState, plotId: number): Plot | undefined {
  return state.plots.find((p) => p.id === plotId)
}

type PlotAction = Extract<Action, { plotId: number }>

function plotReason(state: GameState, action: PlotAction): ReasonKey | null {
  const plot = findPlot(state, action.plotId)
  if (!plot) return 'reasons.not_now'
  if (plot.status === 'locked') return 'stages.locked'
  switch (action.type) {
    case 'BAJAK':
      return plot.status === 'empty' ? null : 'reasons.not_now'
    case 'TANAM':
      if (plot.status !== 'ploughed') return 'reasons.not_now'
      return state.benih[action.variety] > 0 ? null : 'reasons.no_benih'
    case 'BAJA': {
      if (plot.status !== 'planted') return 'reasons.not_now'
      const stage = bajaStageDue(state.day)
      if (stage === null || plot.bajaDone[stage]) return 'reasons.not_now'
      return state.baja > 0 ? null : 'reasons.no_baja'
    }
    case 'RUMPAI':
      return plot.status === 'planted' && plot.weeds > 0 ? null : 'reasons.not_now'
    case 'SIPUT':
      return plot.status === 'planted' && plot.snails > 0 ? null : 'reasons.not_now'
    case 'TUAI': {
      if (plot.status !== 'planted' || !plot.variety) return 'reasons.not_now'
      const timing = harvestTiming(state.day, VARIETIES[plot.variety])
      return timing === 'too_early' ? 'reasons.not_ripe' : null
    }
  }
}

export function canApply(state: GameState, action: Action): ReasonKey | null {
  const job = JOB_OF[action.type]
  if (job && state.hour + RULES.jobHours[job] > RULES.clock.nightStartHour) {
    return 'toasts.no_time'
  }
  switch (action.type) {
    case 'TOGGLE_GATE':
      return null
    case 'BUY_BENIH':
      return state.coins >= VARIETIES[action.variety].price ? null : 'shop.not_enough'
    case 'BUY_BAJA':
      return state.coins >= RULES.economy.bajaBagPrice ? null : 'shop.not_enough'
    case 'LOAN_TAKE':
      if (!(action.amount > 0)) return 'reasons.not_now'
      return state.loan.balance + action.amount <= RULES.loan.maxAmount
        ? null
        : 'reasons.loan_limit'
    case 'LOAN_REPAY':
      if (!(action.amount > 0) || action.amount > state.loan.balance) return 'reasons.not_now'
      return state.coins >= action.amount ? null : 'shop.not_enough'
    default:
      return plotReason(state, action)
  }
}

function updatePlot(state: GameState, plotId: number, patch: (p: Plot) => Partial<Plot>) {
  return state.plots.map((p) => (p.id === plotId ? { ...p, ...patch(p) } : p))
}

/** Apply an action. Returns the same state object when the action is not allowed. */
export function applyAction(state: GameState, action: Action): GameState {
  if (canApply(state, action) !== null) return state
  const job = JOB_OF[action.type]
  const s: GameState = job ? { ...state, hour: state.hour + RULES.jobHours[job] } : state

  switch (action.type) {
    case 'BAJAK':
      return { ...s, plots: updatePlot(s, action.plotId, () => ({ status: 'ploughed' })) }
    case 'TANAM':
      return {
        ...s,
        benih: { ...s.benih, [action.variety]: s.benih[action.variety] - 1 },
        plots: updatePlot(s, action.plotId, () => ({
          status: 'planted',
          variety: action.variety,
          health: RULES.health.start,
          weeds: 0,
          snails: 0,
          bajaDone: RULES.fertiliser.stageDays.map(() => false),
          yieldMultiplier: 1,
        })),
      }
    case 'TOGGLE_GATE':
      return { ...s, gates: { ...s.gates, [action.gateId]: !s.gates[action.gateId] } }
    case 'BAJA': {
      const stage = bajaStageDue(s.day)
      if (stage === null) return state
      return {
        ...s,
        baja: s.baja - 1,
        plots: updatePlot(s, action.plotId, (p) => ({
          bajaDone: p.bajaDone.map((done, i) => done || i === stage),
        })),
      }
    }
    case 'RUMPAI':
      return { ...s, plots: updatePlot(s, action.plotId, (p) => ({ weeds: p.weeds - 1 })) }
    case 'SIPUT':
      return { ...s, plots: updatePlot(s, action.plotId, (p) => ({ snails: p.snails - 1 })) }
    case 'TUAI': {
      const plot = findPlot(s, action.plotId)
      return plot ? harvestPlot(s, plot) : state
    }
    case 'BUY_BENIH':
      return {
        ...s,
        coins: s.coins - VARIETIES[action.variety].price,
        benih: { ...s.benih, [action.variety]: s.benih[action.variety] + 1 },
      }
    case 'BUY_BAJA':
      return { ...s, coins: s.coins - RULES.economy.bajaBagPrice, baja: s.baja + 1 }
    case 'LOAN_TAKE':
      return {
        ...s,
        coins: s.coins + action.amount,
        loan: { ...s.loan, balance: s.loan.balance + action.amount },
      }
    case 'LOAN_REPAY':
      return {
        ...s,
        coins: s.coins - action.amount,
        loan: { ...s.loan, balance: s.loan.balance - action.amount },
      }
  }
}
