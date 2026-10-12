// Live streaming (spec §4.9): side income from day 8 of season 1.
import { RULES } from './rules'
import type { GameState, LiveResult } from './types'
import { reached } from './unlocks'

export function liveUnlocked(state: GameState): boolean {
  return reached(state, RULES.unlocks.live)
}

/** RM10 plus RM1 per 10 followers, up to the cap. */
export function livePay(followers: number): number {
  const { baseCoins, coinsPer10Followers, maxCoins } = RULES.live
  return Math.min(maxCoins, baseCoins + Math.floor(followers / 10) * coinsPer10Followers)
}

/** Go live: paid on the followers you had, then followers grow with today's bonuses. */
export function goLive(state: GameState): GameState {
  const { followersPerLive, bonusFollowers } = RULES.live
  const bonuses: LiveResult['bonuses'] = []
  if (state.today.farmJob) bonuses.push('farm_job')
  if (state.today.caughtFish) bonuses.push('fish')
  if (state.today.harvested) bonuses.push('harvest')
  const gain =
    followersPerLive +
    (state.today.farmJob ? bonusFollowers.farmJob : 0) +
    (state.today.caughtFish ? bonusFollowers.fish : 0) +
    (state.today.harvested ? bonusFollowers.harvest : 0)
  const coins = livePay(state.followers)
  const followers = state.followers + gain
  return {
    ...state,
    coins: state.coins + coins,
    followers,
    today: { ...state.today, earned: state.today.earned + coins, wentLive: true },
    lastLive: { viewers: followers, coins, bonuses },
  }
}
