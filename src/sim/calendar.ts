import { RULES, type Variety } from './rules'
import type { Stage } from './types'

function bandFor(day: number) {
  const bands = RULES.water.targets
  // Past the last band (days beyond the season) the last band holds.
  const band = bands.find((b) => day >= b.fromDay && day <= b.toDay) ?? bands.at(-1)
  if (!band) throw new Error('rules: water.targets is empty')
  return band
}

export function stageForDay(day: number): Stage {
  return bandFor(day).stage
}

export function waterTarget(day: number): { min: number; max: number } {
  const band = bandFor(day)
  return { min: band.minCm, max: band.maxCm }
}

/** Index (0-3) of the baja stage whose window covers this day, or null. */
export function bajaStageDue(day: number): number | null {
  const { stageDays, windowDays } = RULES.fertiliser
  const index = stageDays.findIndex((start) => day >= start && day < start + windowDays)
  return index === -1 ? null : index
}

/** True once the window of baja stage `index` has closed by `day`. */
export function bajaStageClosed(index: number, day: number): boolean {
  const start = RULES.fertiliser.stageDays[index]
  return start !== undefined && day >= start + RULES.fertiliser.windowDays
}

export type HarvestTiming = 'too_early' | 'early' | 'ideal' | 'late'

export function lastIdealDay(variety: Variety): number {
  return RULES.harvest.idealFirstDay + variety.harvestWindowDays - 1
}

export function harvestTiming(day: number, variety: Variety): HarvestTiming {
  if (day < RULES.harvest.earlyFirstDay) return 'too_early'
  if (day < RULES.harvest.idealFirstDay) return 'early'
  if (day <= lastIdealDay(variety)) return 'ideal'
  return 'late'
}

const DAYS_PER_WEEK = 7

/** Week number of a season day, starting at 1. */
export function weekOf(day: number): number {
  return Math.ceil(day / DAYS_PER_WEEK)
}

/** Weekday 1-7 (Monday-Sunday); season day 1 is a Monday. */
export function weekdayOf(day: number): number {
  return ((day - 1) % DAYS_PER_WEEK) + 1
}
