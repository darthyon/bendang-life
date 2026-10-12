// Tugas Hari Ini, built from content/tasks.yaml.
import rawTasks from '../../content/tasks.yaml'
import { bajaStageDue, stageForDay, waterTarget } from './calendar'
import { arr, at, obj, str } from './rules'
import type { GameState, Plot, TaskId, TaskRef } from './types'

type Conditions = Record<string, unknown>

interface TaskTemplate {
  id: TaskId
  when: Conditions
  doneWhen: Conditions
  /** True when the task is about one plot. */
  perPlot: boolean
}

const TASK_IDS: readonly TaskId[] = [
  'beli_benih',
  'bajak',
  'tanam',
  'naik_air',
  'baja',
  'siput',
  'rumpai',
  'kering',
  'tuai',
]

const GLOBAL_KEYS = ['seed_bags', 'any_plot_status', 'seed_bags_at_least']
const PLOT_KEYS = [
  'plot_status',
  'day_at_most',
  'water_below_target',
  'water_above_target',
  'water_in_target',
  'fertiliser_stage_due',
  'fertiliser_stage_done',
  'snails_at_least',
  'weeds_at_least',
  'snails',
  'weeds',
  'stage',
]

function parseTasks(raw: unknown): TaskTemplate[] {
  return arr(raw, 'tasks').map((entry, i) => {
    const p = `tasks[${i}]`
    const o = obj(entry, p)
    const id = str(at(o, 'id', p), `${p}.id`)
    if (!TASK_IDS.includes(id as TaskId)) throw new Error(`tasks: unknown task id "${id}"`)
    const when = obj(at(o, 'when', p), `${p}.when`)
    const doneWhen = obj(at(o, 'done_when', p), `${p}.done_when`)
    for (const key of [...Object.keys(when), ...Object.keys(doneWhen)]) {
      if (!GLOBAL_KEYS.includes(key) && !PLOT_KEYS.includes(key)) {
        throw new Error(`tasks: unknown condition "${key}" in ${p}`)
      }
    }
    const perPlot = Object.keys(when).some((k) => PLOT_KEYS.includes(k))
    return { id: id as TaskId, when, doneWhen, perPlot }
  })
}

export const TASKS: readonly TaskTemplate[] = parseTasks(rawTasks)

function seedBags(state: GameState): number {
  return Object.values(state.benih).reduce((a, b) => a + b, 0)
}

/** True when every condition holds. Unknown keys were rejected at load. */
function holds(state: GameState, plot: Plot | null, conditions: Conditions): boolean {
  const band = waterTarget(state.day)
  const bajaStage = bajaStageDue(state.day)
  return Object.entries(conditions).every(([key, value]) => {
    switch (key) {
      case 'seed_bags':
        return seedBags(state) === value
      case 'seed_bags_at_least':
        return typeof value === 'number' && seedBags(state) >= value
      case 'any_plot_status':
        return (
          Array.isArray(value) &&
          state.plots.some((p) => p.status !== 'locked' && value.includes(p.status))
        )
    }
    if (!plot) return false
    switch (key) {
      case 'plot_status':
        return plot.status === value
      case 'day_at_most':
        return typeof value === 'number' && state.day <= value
      case 'water_below_target':
        return plot.waterCm < band.min === value
      case 'water_above_target':
        return plot.waterCm > band.max === value
      case 'water_in_target':
        return (plot.waterCm >= band.min && plot.waterCm <= band.max) === value
      case 'fertiliser_stage_due':
        return (bajaStage !== null && !plot.bajaDone[bajaStage]) === value
      case 'fertiliser_stage_done':
        return (bajaStage === null || plot.bajaDone[bajaStage] === true) === value
      case 'snails_at_least':
        return typeof value === 'number' && plot.snails >= value
      case 'weeds_at_least':
        return typeof value === 'number' && plot.weeds >= value
      case 'snails':
        return plot.snails === value
      case 'weeds':
        return plot.weeds === value
      case 'stage':
        return stageForDay(state.day) === value
      default:
        return false
    }
  })
}

const same = (a: TaskRef, b: TaskRef) => a.id === b.id && a.plotId === b.plotId

function plotOf(state: GameState, ref: Pick<TaskRef, 'plotId'>): Plot | null {
  return ref.plotId === null ? null : (state.plots.find((p) => p.id === ref.plotId) ?? null)
}

function isDone(state: GameState, ref: TaskRef): boolean {
  const template = TASKS.find((t) => t.id === ref.id)
  return ref.done || (template ? holds(state, plotOf(state, ref), template.doneWhen) : false)
}

/** Tick tasks that are now done, then add any task whose `when` holds and is not listed yet. */
export function refreshTasks(state: GameState): GameState {
  const open = state.plots.filter((p) => p.status !== 'locked')
  const ticked = state.tasksToday.map((t) =>
    t.done || !isDone(state, t) ? t : { ...t, done: true },
  )
  const changed = ticked.some((t, i) => t !== state.tasksToday[i])
  const added: TaskRef[] = []
  for (const template of TASKS) {
    const candidates: TaskRef[] = template.perPlot
      ? open
          .filter((p) => holds(state, p, template.when))
          .map((p) => ({ id: template.id, plotId: p.id, done: false }))
      : holds(state, null, template.when)
        ? [{ id: template.id, plotId: null, done: false }]
        : []
    for (const c of candidates) {
      if (!state.tasksToday.some((t) => same(t, c)) && !added.some((t) => same(t, c))) added.push(c)
    }
  }
  if (!changed && added.length === 0) return state
  const withNew = [...ticked, ...added.map((t) => ({ ...t, done: isDone(state, t) }))]
  return { ...state, tasksToday: withNew }
}

export interface TaskLine extends TaskRef {
  done: boolean
  /** Placeholders for the i18n text `tasks.<id>`. */
  params: Record<string, number>
}

export function taskStatus(state: GameState): TaskLine[] {
  const band = waterTarget(state.day)
  const stage = bajaStageDue(state.day)
  return state.tasksToday.map((ref) => {
    const params: Record<string, number> = {}
    if (ref.plotId !== null) params.n = ref.plotId
    if (ref.id === 'baja' && stage !== null) params.stage = stage + 1
    if (ref.id === 'naik_air') Object.assign(params, { min: band.min, max: band.max })
    return { ...ref, params, done: isDone(state, ref) }
  })
}
