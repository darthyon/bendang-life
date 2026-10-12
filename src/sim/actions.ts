import { bajaStageDue, harvestTiming } from './calendar'
import { harvestPlot } from './harvest'
import { RULES, VARIETIES } from './rules'
import { unlockBy } from './facts'
import {
  catchesLeft,
  fishingHours,
  fishSaleValue,
  fishSpotOpen,
  spotKey,
  spotRules,
} from './fishing'
import { goLive, liveUnlocked } from './live'
import { refreshTasks } from './tasks'
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
  | 'fishing.none_left'
  | 'live.done_today'

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

// Reasons that mean the action does not apply here at all; they win over running out of time.
const NOT_APPLICABLE: ReasonKey[] = [
  'reasons.not_now',
  'stages.locked',
  'reasons.not_ripe',
  'fishing.none_left',
  'live.done_today',
]

/** Hours an action takes from the day, or 0. */
export function actionHours(action: Action): number {
  const job = JOB_OF[action.type]
  if (job) return RULES.jobHours[job]
  if (action.type === 'FISH') return fishingHours(action.spot)
  if (action.type === 'GO_LIVE') return RULES.live.hours
  return 0
}

export function canApply(state: GameState, action: Action): ReasonKey | null {
  const reason = baseReason(state, action)
  if (reason && NOT_APPLICABLE.includes(reason)) return reason
  const hours = actionHours(action)
  if (hours > 0 && state.hour + hours > RULES.clock.nightStartHour) return 'toasts.no_time'
  return reason
}

function baseReason(state: GameState, action: Action): ReasonKey | null {
  switch (action.type) {
    case 'TOGGLE_GATE':
      return null
    case 'PASS_TIME':
      return action.hours > 0 ? null : 'reasons.not_now'
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
    case 'FISH':
      if (!fishSpotOpen(state, action.spot)) return 'reasons.not_now'
      if (!spotRules(action.spot).fish.includes(action.fish)) return 'reasons.not_now'
      return catchesLeft(state, action.spot) > 0 ? null : 'fishing.none_left'
    case 'SELL_FISH':
      return Object.values(state.fish).some((n) => n > 0) ? null : 'reasons.not_now'
    case 'GO_LIVE':
      if (!liveUnlocked(state)) return 'reasons.not_now'
      return state.today.wentLive ? 'live.done_today' : null
    case 'ACK_MOMENT':
      return state.moments.length > 0 ? null : 'reasons.not_now'
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
  const next = reduce(state, action)
  return next === state ? state : refreshTasks(unlockFactsFor(next, action))
}

function unlockFactsFor(state: GameState, action: Action): GameState {
  const job = JOB_OF[action.type]
  if (job) return unlockBy(state, { on: 'action', job })
  if (action.type === 'BUY_BENIH')
    return unlockBy(state, { on: 'buy_seed', variety: action.variety })
  if (action.type === 'LOAN_TAKE') return unlockBy(state, { on: 'loan' })
  if (action.type === 'FISH' && action.spot.kind === 'plot') {
    return unlockBy(state, { on: 'action', job: 'serkap' })
  }
  return state
}

function spend(state: GameState, rm: number, line: 'seedRm' | 'bajaRm'): GameState {
  return {
    ...state,
    coins: state.coins - rm,
    ledger: { ...state.ledger, [line]: state.ledger[line] + rm },
    today: { ...state.today, spent: state.today.spent + rm },
  }
}

function reduce(state: GameState, action: Action): GameState {
  const job = JOB_OF[action.type]
  const hours = actionHours(action)
  let s: GameState = hours > 0 ? { ...state, hour: state.hour + hours } : state
  // Live bonus: at least one farm job today.
  if (job) s = { ...s, today: { ...s.today, farmJob: true } }

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
    case 'BUY_BENIH': {
      const paid = spend(s, VARIETIES[action.variety].price, 'seedRm')
      return { ...paid, benih: { ...paid.benih, [action.variety]: paid.benih[action.variety] + 1 } }
    }
    case 'BUY_BAJA': {
      const paid = spend(s, RULES.economy.bajaBagPrice, 'bajaRm')
      return { ...paid, baja: paid.baja + 1 }
    }
    case 'LOAN_TAKE':
      return {
        ...s,
        coins: s.coins + action.amount,
        loan: { ...s.loan, balance: s.loan.balance + action.amount },
      }
    case 'PASS_TIME':
      return { ...s, hour: Math.min(RULES.clock.nightStartHour, s.hour + action.hours) }
    case 'LOAN_REPAY':
      return {
        ...s,
        coins: s.coins - action.amount,
        loan: { ...s.loan, balance: s.loan.balance - action.amount },
      }
    case 'FISH': {
      if (!action.caught) return s
      const key = spotKey(action.spot)
      return {
        ...s,
        fish: { ...s.fish, [action.fish]: s.fish[action.fish] + 1 },
        catchesToday: { ...s.catchesToday, [key]: (s.catchesToday[key] ?? 0) + 1 },
        today: { ...s.today, caughtFish: true },
      }
    }
    case 'SELL_FISH': {
      const rm = fishSaleValue(s)
      return {
        ...s,
        coins: s.coins + rm,
        fish: { keli: 0, haruan: 0, puyu: 0, sepat: 0, tilapia: 0 },
        today: { ...s.today, earned: s.today.earned + rm },
      }
    }
    case 'GO_LIVE':
      return goLive(s)
    case 'ACK_MOMENT': {
      const [moment, ...rest] = s.moments
      if (!moment) return state
      return {
        ...s,
        moments: rest,
        momentsSeen: [...s.momentsSeen, moment],
        rayaHere: s.rayaHere || moment === 'raya_arrival',
      }
    }
  }
}
