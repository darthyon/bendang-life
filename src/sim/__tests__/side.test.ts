import { describe, expect, it } from 'vitest'
import { applyAction, canApply } from '../actions'
import { advanceDay } from '../day'
import { cardOptions, findCard, resolveCard, RAYA_GUARD } from '../events'
import { fishSpotOpen, startFishing } from '../fishing'
import { liveUnlocked, livePay } from '../live'
import { createRng } from '../rng'
import { RULES } from '../rules'
import type { GameState } from '../types'
import { freshState, plantedState, withPlot } from './helpers'

const longkang = { kind: 'longkang' } as const
const plot1 = { kind: 'plot', plotId: 1 } as const

describe('fishing', () => {
  it('picks a fish for the spot with its green zone', () => {
    for (let seed = 0; seed < 20; seed++) {
      const start = startFishing(freshState(), longkang, createRng(seed))
      if (typeof start === 'string') throw new Error(start)
      expect(['haruan', 'puyu', 'sepat', 'tilapia']).toContain(start.fish)
      expect(start.zone).toBe(RULES.fishing.fish[start.fish].zone)
    }
  })

  it('spends an hour and keeps a caught fish', () => {
    const s = applyAction(freshState(), {
      type: 'FISH',
      spot: longkang,
      fish: 'puyu',
      caught: true,
    })
    expect(s.fish.puyu).toBe(1)
    expect(s.hour).toBe(RULES.clock.dayStartHour + RULES.fishing.hours.pancing)
    expect(s.today.caughtFish).toBe(true)
  })

  it('spends the hour on a miss too', () => {
    const s = applyAction(freshState(), {
      type: 'FISH',
      spot: longkang,
      fish: 'puyu',
      caught: false,
    })
    expect(s.fish.puyu).toBe(0)
    expect(s.hour).toBe(RULES.clock.dayStartHour + 1)
  })

  it('limits catches per spot per day, then resets', () => {
    let s = freshState()
    const limit = RULES.fishing.spots.longkang.catchesPerDay
    for (let i = 0; i < limit; i++) {
      s = applyAction(s, { type: 'FISH', spot: longkang, fish: 'sepat', caught: true })
    }
    expect(canApply(s, { type: 'FISH', spot: longkang, fish: 'sepat', caught: true })).toBe(
      'fishing.none_left',
    )
    expect(startFishing(s, longkang, createRng(1))).toBe('fishing.none_left')
    s = advanceDay(s, createRng(1))
    expect(canApply(s, { type: 'FISH', spot: longkang, fish: 'sepat', caught: true })).toBeNull()
  })

  it('opens serkap only on drained plots at the right time', () => {
    expect(fishSpotOpen(freshState(), plot1)).toBe(true) // empty, before ploughing
    expect(fishSpotOpen(withPlot(freshState(), 1, { status: 'ploughed' }), plot1)).toBe(false)
    expect(fishSpotOpen(plantedState(10), plot1)).toBe(false)
    expect(fishSpotOpen(plantedState(17, { waterCm: 1 }), plot1)).toBe(true)
    expect(fishSpotOpen(plantedState(17, { waterCm: 3 }), plot1)).toBe(false)
    expect(fishSpotOpen(withPlot(freshState(), 1, { status: 'harvested' }), plot1)).toBe(true)
    expect(fishSpotOpen(freshState(), { kind: 'plot', plotId: 2 })).toBe(false) // locked
  })

  it('serkap catches keli or haruan and unlocks the fact', () => {
    const start = startFishing(freshState(), plot1, createRng(3))
    if (typeof start === 'string') throw new Error(start)
    expect(['keli', 'haruan']).toContain(start.fish)
    const s = applyAction(freshState(), { type: 'FISH', spot: plot1, fish: 'keli', caught: true })
    expect(s.facts).toContain('fact_fish_in_bendang')
  })

  it('refuses a fish that does not live at the spot', () => {
    expect(
      canApply(freshState(), { type: 'FISH', spot: longkang, fish: 'keli', caught: true }),
    ).toBe('reasons.not_now')
  })
})

describe('Jual Ikan', () => {
  it('sells every fish at its price', () => {
    const s0 = freshState({ fish: { keli: 1, haruan: 2, puyu: 0, sepat: 3, tilapia: 0 } })
    const s = applyAction(s0, { type: 'SELL_FISH' })
    const f = RULES.fishing.fish
    const total = f.keli.price + 2 * f.haruan.price + 3 * f.sepat.price
    expect(s.coins).toBe(s0.coins + total)
    expect(Object.values(s.fish).every((n) => n === 0)).toBe(true)
    expect(s.today.earned).toBe(total)
  })

  it('has nothing to sell with no fish', () => {
    expect(canApply(freshState(), { type: 'SELL_FISH' })).toBe('reasons.not_now')
  })

  it('pays 1.5x the day after Pasar Malam', () => {
    let s: GameState = { ...plantedState(10), coins: 100, pendingCard: 'pasar_malam' }
    s = resolveCard(s, 'buka_gerai', createRng(1))
    s = advanceDay(s, createRng(1))
    s = { ...s, fish: { keli: 0, haruan: 2, puyu: 0, sepat: 0, tilapia: 0 } }
    const sold = applyAction(s, { type: 'SELL_FISH' })
    expect(sold.coins - s.coins).toBe(Math.round(2 * RULES.fishing.fish.haruan.price * 1.5))
    expect(advanceDay(sold, createRng(1)).fishPriceToday).toBe(1)
  })
})

describe('Live', () => {
  it('opens on season 1 day 8 and stays open later', () => {
    expect(liveUnlocked(freshState({ day: 7 }))).toBe(false)
    expect(liveUnlocked(freshState({ day: 8 }))).toBe(true)
    expect(liveUnlocked(freshState({ season: 2, day: 1 }))).toBe(true)
    expect(canApply(freshState({ day: 7 }), { type: 'GO_LIVE' })).toBe('reasons.not_now')
  })

  it('pays by followers up to the cap', () => {
    expect(livePay(0)).toBe(RULES.live.baseCoins)
    expect(livePay(25)).toBe(RULES.live.baseCoins + 2)
    expect(livePay(10_000)).toBe(RULES.live.maxCoins)
  })

  it('gains followers with bonuses for today, once a day, for an hour', () => {
    let s = freshState({ day: 8, followers: 30 })
    s = applyAction(s, { type: 'BAJAK', plotId: 1 })
    s = applyAction(s, { type: 'FISH', spot: longkang, fish: 'puyu', caught: true })
    const before = s
    s = applyAction(s, { type: 'GO_LIVE' })
    const b = RULES.live.bonusFollowers
    expect(s.followers).toBe(30 + RULES.live.followersPerLive + b.farmJob + b.fish)
    expect(s.coins).toBe(before.coins + livePay(30))
    expect(s.hour).toBe(before.hour + RULES.live.hours)
    expect(s.lastLive).toMatchObject({
      coins: livePay(30),
      viewers: s.followers,
      bonuses: ['farm_job', 'fish'],
    })
    expect(canApply(s, { type: 'GO_LIVE' })).toBe('live.done_today')
    expect(canApply(advanceDay(s, createRng(1)), { type: 'GO_LIVE' })).toBeNull()
  })
})

describe('cards back in the deck', () => {
  it('Kucing Oren gives a keli and takes a baja bag', () => {
    const s = resolveCard(
      { ...plantedState(10), baja: 1, pendingCard: 'kucing_oren' },
      'terima_hadiah',
      createRng(1),
    )
    expect(s.fish.keli).toBe(1)
    expect(s.baja).toBe(0)
  })

  it('Kenduri adds followers once Live is open', () => {
    const before = freshState({ day: 9, followers: 5, pendingCard: 'kenduri_sebelah' })
    expect(resolveCard(before, 'pi_rewang', createRng(1)).followers).toBe(25)
    const early = freshState({ day: 5, followers: 5, pendingCard: 'kenduri_sebelah' })
    expect(resolveCard(early, 'pi_rewang', createRng(1)).followers).toBe(5)
  })
})

describe('Raya', () => {
  it('arrives on the morning of season 1 day 14', () => {
    const s = advanceDay(freshState({ day: 13 }), createRng(1))
    expect(s.moments).toContain('raya_arrival')
    // The Live intro (day 8) is queued first; acknowledge until Raya's moment is seen.
    let acked = s
    while (acked.moments.length > 0) acked = applyAction(acked, { type: 'ACK_MOMENT' })
    expect(acked.rayaHere).toBe(true)
    expect(acked.moments).not.toContain('raya_arrival')
  })

  it('queues the Live intro on day 8', () => {
    expect(advanceDay(freshState({ day: 7 }), createRng(1)).moments).toContain('live_intro')
  })

  it('offers a free guard option on Tikus Malam only once he is here', () => {
    const card = findCard('tikus_malam')
    if (!card) throw new Error('no card')
    expect(cardOptions(freshState(), card).map((o) => o.id)).not.toContain(RAYA_GUARD)
    expect(cardOptions(freshState({ rayaHere: true }), card).map((o) => o.id)).toContain(RAYA_GUARD)
  })

  it('keeps watch 4 times in 5, and is ghosted the rest', () => {
    const outcomes = new Set<string>()
    for (let seed = 0; seed < 60; seed++) {
      const s = resolveCard(
        { ...plantedState(12), rayaHere: true, pendingCard: 'tikus_malam' },
        RAYA_GUARD,
        createRng(seed),
      )
      outcomes.add(s.lastCardOutcome ?? 'none')
      if (s.lastCardOutcome === 'ghosted') expect(s.plots[0]?.yieldMultiplier).toBeCloseTo(0.95)
      if (s.lastCardOutcome === 'guard_ok') expect(s.plots[0]?.yieldMultiplier).toBe(1)
    }
    expect(outcomes).toEqual(new Set(['guard_ok', 'ghosted']))
  })
})
