import { canApply, type ReasonKey } from './actions'
import { bajaStageDue, harvestTiming, waterTarget } from './calendar'
import { VARIETIES, VARIETY_LIST } from './rules'
import type { Action, GameState, GateId } from './types'

/** What the player stands at, as the sim sees it. */
export type SimTarget =
  { kind: 'plot'; plotId: number } | { kind: 'gate'; gateId: GateId } | { kind: 'longkang' }

export interface Job {
  /** i18n key for the prompt label. */
  labelKey: string
  /** What E does, or null when E does nothing here yet. */
  action: Action | null
  /** Why the action is blocked, if it is. */
  reason: ReasonKey | null
}

function job(state: GameState, labelKey: string, action: Action | null): Job {
  return { labelKey, action, reason: action ? canApply(state, action) : null }
}

/** The single job E performs at a target, in priority order. Null when there is nothing to do. */
export function primaryJob(state: GameState, target: SimTarget): Job | null {
  switch (target.kind) {
    case 'gate':
      return job(state, state.gates[target.gateId] ? 'actions.gate_close' : 'actions.gate_open', {
        type: 'TOGGLE_GATE',
        gateId: target.gateId,
      })
    case 'longkang':
      // Fishing arrives in M5.
      return { labelKey: 'actions.pancing', action: null, reason: null }
    case 'plot':
      break
  }

  const plot = state.plots.find((p) => p.id === target.plotId)
  if (!plot) return null
  const plotId = plot.id
  switch (plot.status) {
    case 'locked':
      return { labelKey: 'stages.locked', action: null, reason: null }
    case 'empty':
      return job(state, 'actions.bajak', { type: 'BAJAK', plotId })
    case 'ploughed': {
      const variety = VARIETY_LIST.find((v) => state.benih[v] > 0) ?? VARIETY_LIST[0] ?? 'mr297'
      return job(state, 'actions.tanam', { type: 'TANAM', plotId, variety })
    }
    case 'harvested':
      return null
    case 'planted':
      break
  }

  if (plot.variety && harvestTiming(state.day, VARIETIES[plot.variety]) !== 'too_early') {
    return job(state, 'actions.tuai', { type: 'TUAI', plotId })
  }
  if (plot.snails > 0) return job(state, 'actions.siput', { type: 'SIPUT', plotId })
  if (plot.weeds > 0) return job(state, 'actions.rumpai', { type: 'RUMPAI', plotId })
  const stage = bajaStageDue(state.day)
  if (stage !== null && !plot.bajaDone[stage]) {
    return job(state, 'actions.baja', { type: 'BAJA', plotId })
  }
  return null
}

export type Problem = 'ripe' | 'snails' | 'weeds' | 'water_low' | 'water_high' | 'baja'

/** What needs attention on a plot, most urgent first. Empty for unplanted plots. */
export function plotProblems(state: GameState, plotId: number): Problem[] {
  const plot = state.plots.find((p) => p.id === plotId)
  if (!plot || plot.status !== 'planted' || !plot.variety) return []
  const problems: Problem[] = []
  if (harvestTiming(state.day, VARIETIES[plot.variety]) !== 'too_early') problems.push('ripe')
  if (plot.snails > 0) problems.push('snails')
  if (plot.weeds > 0) problems.push('weeds')
  const band = waterTarget(state.day)
  if (plot.waterCm < band.min) problems.push('water_low')
  if (plot.waterCm > band.max) problems.push('water_high')
  const stage = bajaStageDue(state.day)
  if (stage !== null && !plot.bajaDone[stage]) problems.push('baja')
  return problems
}
