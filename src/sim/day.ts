import { waterTarget } from './calendar'
import type { Rng } from './rng'
import { RULES, VARIETIES } from './rules'
import { refreshTasks } from './tasks'
import type { GameState, GateId, Plot } from './types'

function inWindow(day: number, w: { fromDay: number; toDay: number }): boolean {
  return day >= w.fromDay && day <= w.toDay
}

/** Health lost by a planted plot over the day that just ended. */
function endOfDayHealth(plot: Plot, day: number): number {
  if (plot.status !== 'planted') return plot.health
  const band = waterTarget(day)
  let loss = 0
  if (plot.waterCm < band.min || plot.waterCm > band.max) {
    loss += RULES.water.healthPenaltyPerDayOffTarget
  }
  loss += plot.weeds * RULES.weeds.healthPenaltyPerPatchPerDay
  loss += plot.snails * RULES.snails.healthPenaltyPerPatchPerDay
  return Math.max(0, plot.health - loss)
}

function gateFor(plotId: number): GateId | null {
  if (RULES.water.gates.A.includes(plotId)) return 'A'
  if (RULES.water.gates.B.includes(plotId)) return 'B'
  return null
}

function overnightWater(plot: Plot, gates: GameState['gates']): number {
  if (plot.status === 'locked') return plot.waterCm
  const gate = gateFor(plot.id)
  const open = gate !== null && gates[gate]
  const next = open
    ? plot.waterCm + RULES.water.gateOpenGainCmPerDay
    : plot.waterCm - RULES.water.gateClosedLossCmPerDay
  return Math.min(RULES.water.capCm, Math.max(0, next))
}

export interface WaterForecast {
  gateId: GateId
  open: boolean
  /** Water depth after tonight, from the gate as it is now. */
  nextCm: number
}

/** Which gate feeds a plot and where its water will be tomorrow morning. Null for locked plots. */
export function waterForecast(state: GameState, plotId: number): WaterForecast | null {
  const plot = state.plots.find((p) => p.id === plotId)
  const gateId = gateFor(plotId)
  if (!plot || plot.status === 'locked' || gateId === null) return null
  return { gateId, open: state.gates[gateId], nextCm: overnightWater(plot, state.gates) }
}

/** Weeds and snails appear on planted plots at the start of a day inside their windows. */
function spawnPests(plot: Plot, day: number, rng: Rng): Pick<Plot, 'weeds' | 'snails'> {
  if (plot.status !== 'planted' || !plot.variety) return { weeds: plot.weeds, snails: plot.snails }
  // Always draw both numbers so the RNG sequence does not depend on which windows are open.
  const weedRoll = rng.next()
  const snailRoll = rng.next()
  const weedChance = RULES.weeds.spawnChancePerDay * VARIETIES[plot.variety].weedSpawnMultiplier
  return {
    weeds: plot.weeds + (inWindow(day, RULES.weeds.window) && weedRoll < weedChance ? 1 : 0),
    snails:
      plot.snails +
      (inWindow(day, RULES.snails.window) && snailRoll < RULES.snails.spawnChancePerDay ? 1 : 0),
  }
}

/** End the current day (Tidur or 7 PM) and start the next morning. */
export function advanceDay(state: GameState, rng: Rng): GameState {
  const nextDay = state.day + 1
  const plots = state.plots.map((plot) => {
    const ended: Plot = {
      ...plot,
      health: endOfDayHealth(plot, state.day),
      waterCm: overnightWater(plot, state.gates),
    }
    return { ...ended, ...spawnPests(ended, nextDay, rng) }
  })
  return refreshTasks({
    ...state,
    day: nextDay,
    hour: RULES.clock.dayStartHour,
    plots,
    tasksToday: [],
  })
}
