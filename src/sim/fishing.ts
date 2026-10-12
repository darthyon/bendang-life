// Fishing (spec §4.8): pancing at the longkang, serkap in a drained plot.
import { stageForDay } from './calendar'
import type { Rng } from './rng'
import { RULES } from './rules'
import type { FishId, FishSpot, GameState } from './types'

export function spotKey(spot: FishSpot): string {
  return spot.kind === 'longkang' ? 'longkang' : `plot-${spot.plotId}`
}

export function spotRules(spot: FishSpot) {
  return spot.kind === 'longkang' ? RULES.fishing.spots.longkang : RULES.fishing.spots.plotDrained
}

export function fishingHours(spot: FishSpot): number {
  return spot.kind === 'longkang' ? RULES.fishing.hours.pancing : RULES.fishing.hours.serkap
}

/**
 * The longkang is always open. Serkap needs a drained plot (rules `available_when`):
 * before ploughing, in masak or sedia tuai with the water drained, or after harvest.
 */
export function fishSpotOpen(state: GameState, spot: FishSpot): boolean {
  if (spot.kind === 'longkang') return true
  const plot = state.plots.find((p) => p.id === spot.plotId)
  if (!plot) return false
  switch (plot.status) {
    case 'empty':
    case 'harvested':
      return true
    case 'planted': {
      const stage = stageForDay(state.day)
      const drained = plot.waterCm <= RULES.harvest.potongan.drainedMaxCm
      return (stage === 'masak' || stage === 'sedia_tuai') && drained
    }
    default:
      return false
  }
}

export function catchesLeft(state: GameState, spot: FishSpot): number {
  return spotRules(spot).catchesPerDay - (state.catchesToday[spotKey(spot)] ?? 0)
}

export type FishingReason = 'fishing.none_left' | 'reasons.not_now'

/** Pick the fish on the line and its green zone, or say why you can't fish here. */
export function startFishing(
  state: GameState,
  spot: FishSpot,
  rng: Rng,
): { fish: FishId; zone: number } | FishingReason {
  if (!fishSpotOpen(state, spot)) return 'reasons.not_now'
  if (catchesLeft(state, spot) <= 0) return 'fishing.none_left'
  const pool = spotRules(spot).fish
  const fish = pool[Math.floor(rng.next() * pool.length)] ?? pool[0]
  if (!fish) return 'reasons.not_now'
  return { fish, zone: RULES.fishing.fish[fish].zone }
}

/** What all your fish sell for today. */
export function fishSaleValue(state: GameState): number {
  const total = (Object.keys(state.fish) as FishId[]).reduce(
    (sum, id) => sum + state.fish[id] * RULES.fishing.fish[id].price,
    0,
  )
  return Math.round(total * state.fishPriceToday)
}
