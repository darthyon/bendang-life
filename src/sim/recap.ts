// The night recap: what changed overnight and why (spec §4.2, added in M4).
import { waterTarget } from './calendar'
import { RULES } from './rules'
import { taskStatus, type TaskLine } from './tasks'
import type { GameState, GateId } from './types'

export type HealthCause = 'water_low' | 'water_high' | 'weeds' | 'snails' | 'card'

export interface RecapPlot {
  plotId: number
  waterFrom: number
  waterTo: number
  gateOpen: boolean
  healthFrom: number
  healthTo: number
  causes: HealthCause[]
  newWeeds: number
  newSnails: number
}

export interface Recap {
  day: number
  plots: RecapPlot[]
  money: { earned: number; spent: number }
  /** What is due tomorrow: the new morning's open tasks. */
  tomorrow: TaskLine[]
}

function gateOf(plotId: number): GateId | null {
  if (RULES.water.gates.A.includes(plotId)) return 'A'
  if (RULES.water.gates.B.includes(plotId)) return 'B'
  return null
}

/** Compare the evening (`before`) with the next morning (`after`). Only planted plots are listed. */
export function buildRecap(before: GameState, after: GameState): Recap {
  const band = waterTarget(before.day)
  const cardHealth = before.effects.some((e) => e.kind === 'health')
  const plots = before.plots
    .filter((p) => p.status === 'planted')
    .map((p): RecapPlot => {
      const next = after.plots.find((q) => q.id === p.id) ?? p
      const gate = gateOf(p.id)
      const causes: HealthCause[] = []
      if (p.waterCm < band.min) causes.push('water_low')
      if (p.waterCm > band.max) causes.push('water_high')
      if (p.weeds > 0) causes.push('weeds')
      if (p.snails > 0) causes.push('snails')
      if (cardHealth) causes.push('card')
      return {
        plotId: p.id,
        waterFrom: p.waterCm,
        waterTo: next.waterCm,
        gateOpen: gate !== null && before.gates[gate],
        healthFrom: p.health,
        healthTo: next.health,
        causes,
        newWeeds: Math.max(0, next.weeds - p.weeds),
        newSnails: Math.max(0, next.snails - p.snails),
      }
    })
  return {
    day: before.day,
    plots,
    money: { ...before.today },
    tomorrow: taskStatus(after).filter((t) => !t.done),
  }
}
