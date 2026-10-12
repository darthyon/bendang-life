import { describe, expect, it } from 'vitest'
import { advanceDay } from '../day'
import { CARDS, canResolve, drawCard, resolveCard, startNight } from '../events'
import { createRng } from '../rng'
import { RULES } from '../rules'
import type { GameState } from '../types'
import { freshState, plantedState, plot } from './helpers'

const card = (id: string) => {
  const found = CARDS.find((c) => c.id === id)
  if (!found) throw new Error(`no card ${id}`)
  return found
}

/** State on a card night with a pending card, skipping the draw. */
function withCard(state: GameState, id: string): GameState {
  return { ...state, pendingCard: id }
}

describe('night card deck (events.yaml balance rules)', () => {
  it('gives every Bala a free option and a money or time option', () => {
    for (const c of CARDS.filter((c) => c.kind === 'bala')) {
      const free = c.options.some(
        (o) => !o.cost.coins && !o.cost.hoursTomorrow && !o.cost.hoursPerDay,
      )
      const paid = c.options.some(
        (o) =>
          (o.cost.coins ?? 0) > 0 ||
          (o.cost.hoursTomorrow ?? 0) > 0 ||
          (o.cost.hoursPerDay ?? 0) > 0,
      )
      expect(free, c.id).toBe(true)
      expect(paid, c.id).toBe(true)
    }
  })

  it('gives every Rezeki a gain and a cost', () => {
    for (const c of CARDS.filter((c) => c.kind === 'rezeki')) {
      for (const o of c.options) {
        expect(o.effects.length, c.id).toBeGreaterThan(0)
        const hasCost =
          (o.cost.coins ?? 0) > 0 ||
          (o.cost.hoursTomorrow ?? 0) > 0 ||
          Object.keys(o.cost.items ?? {}).length > 0
        expect(hasCost, c.id).toBe(true)
      }
    }
  })
})

describe('drawing cards', () => {
  it('draws nothing before the first card night', () => {
    const s = startNight(plantedState(RULES.events.firstCardNight - 1), createRng(1))
    expect(s.pendingCard).toBeNull()
  })

  it('draws a card on the first card night, filtered by stage', () => {
    for (let seed = 0; seed < 30; seed++) {
      const s = startNight(plantedState(RULES.events.firstCardNight), createRng(seed))
      expect(s.pendingCard).not.toBeNull()
      expect(card(s.pendingCard ?? '').stages).toContain('anak_padi')
    }
  })

  it('waits 2 or 3 nights before the next card', () => {
    const s = startNight(plantedState(2), createRng(4))
    expect([4, 5]).toContain(s.cards.nextNight)
  })

  it('never draws two Bala in a row', () => {
    for (let seed = 0; seed < 50; seed++) {
      const s = { ...plantedState(5), cards: { nextNight: 5, lastKind: 'bala' as const } }
      const id = drawCard(s, createRng(seed))
      if (id) expect(card(id).kind).toBe('rezeki')
    }
  })

  it('includes the fishing cards in the deck (back since M5)', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 300; seed++) {
      const id = drawCard(
        { ...plantedState(10), cards: { nextNight: 10, lastKind: 'bala' } },
        createRng(seed),
      )
      if (id) seen.add(id)
    }
    expect(seen.has('kucing_oren')).toBe(true)
    expect(seen.has('pasar_malam')).toBe(true)
  })

  it('is deterministic', () => {
    const a = startNight(plantedState(2), createRng(9))
    const b = startNight(plantedState(2), createRng(9))
    expect(a).toEqual(b)
  })
})

describe('resolving cards', () => {
  it('Biar on heavy rain adds 4 cm to planted plots', () => {
    const s = resolveCard(
      withCard(plantedState(5, { waterCm: 5 }), 'hujan_lebat'),
      'biar',
      createRng(1),
    )
    expect(plot(s, 1).waterCm).toBe(9)
    expect(s.pendingCard).toBeNull()
  })

  it('paying coins needs the coins', () => {
    const s = withCard(freshState({ day: 5, coins: 10 }), 'hujan_lebat')
    expect(canResolve(s, 'sewa_pam')).toBe('shop.not_enough')
    const paid = resolveCard({ ...s, coins: 100 }, 'sewa_pam', createRng(1))
    expect(paid.coins).toBe(20)
  })

  it('hours tomorrow start the next day later', () => {
    let s = resolveCard(withCard(plantedState(5), 'hujan_lebat'), 'buka_keluar', createRng(1))
    s = advanceDay(s, createRng(1))
    expect(s.hour).toBe(RULES.clock.dayStartHour + 1)
    s = advanceDay(s, createRng(1))
    expect(s.hour).toBe(RULES.clock.dayStartHour)
  })

  it('hours per day last for their days', () => {
    let s = resolveCard(withCard(plantedState(5), 'panas_terik'), 'jaga_pintu', createRng(1))
    const hours: number[] = []
    for (let i = 0; i < 4; i++) {
      s = advanceDay(s, createRng(i))
      hours.push(s.hour)
    }
    const h = RULES.clock.dayStartHour
    expect(hours).toEqual([h + 1, h + 1, h + 1, h])
  })

  it('water per day drains planted plots each night for its days', () => {
    let s = resolveCard(
      withCard(plantedState(5, { waterCm: 10 }), 'panas_terik'),
      'biar',
      createRng(1),
    )
    s = { ...s, gates: { A: true, B: false } }
    const water: number[] = []
    for (let i = 0; i < 4; i++) {
      s = advanceDay(s, createRng(i))
      water.push(plot(s, 1).waterCm)
    }
    // Gate open (+2, capped at 10) and heat (-2) for 3 nights, then gate only.
    expect(water).toEqual([8, 8, 8, 10])
  })

  it('health per day hurts for its days', () => {
    let s = resolveCard(
      withCard(plantedState(3, { waterCm: 6 }), 'serangan_siput'),
      'biar',
      createRng(1),
    )
    s = { ...s, gates: { A: true, B: false }, plots: s.plots.map((p) => ({ ...p, waterCm: 5 })) }
    s = advanceDay(s, createRng(1))
    expect(plot(s, 1).health).toBe(96)
  })

  it('applies yield multipliers to planted plots', () => {
    const s = resolveCard(withCard(plantedState(12), 'tikus_malam'), 'biar', createRng(1))
    expect(plot(s, 1).yieldMultiplier).toBeCloseTo(0.95)
  })

  it('turns the phone off for days', () => {
    let s = resolveCard(withCard(plantedState(5), 'fon_jatuh'), 'biar', createRng(1))
    expect(s.phoneOffDays).toBe(2)
    s = advanceDay(s, createRng(1))
    expect(s.phoneOffDays).toBe(1)
  })

  it('rolls the rice gamble with the seeded RNG', () => {
    const outcomes = new Set<number>()
    for (let seed = 0; seed < 40; seed++) {
      outcomes.add(
        resolveCard(withCard(plantedState(5), 'fon_jatuh'), 'rendam_beras', createRng(seed))
          .phoneOffDays,
      )
    }
    expect(outcomes).toEqual(new Set([0, 2]))
  })

  it('takes a Rezeki: gain and cost', () => {
    let s = resolveCard(withCard(plantedState(5), 'ceramah_ppkk'), 'pergi', createRng(1))
    expect(s.baja).toBe(1)
    s = advanceDay(s, createRng(1))
    expect(s.hour).toBe(RULES.clock.dayStartHour + 2)
  })

  it('declines a Rezeki with no gain and no cost', () => {
    const before = withCard(plantedState(5), 'ceramah_ppkk')
    const s = resolveCard(before, 'decline', createRng(1))
    expect(s.baja).toBe(before.baja)
    expect(s.pendingCard).toBeNull()
  })

  it('refuses decline on a Bala', () => {
    expect(canResolve(withCard(plantedState(5), 'hujan_lebat'), 'decline')).toBe('reasons.not_now')
  })
})
