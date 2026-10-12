// Night cards from content/events.yaml (spec §4.7). One card a night at most.
import rawEvents from '../../content/events.yaml'
import type { ReasonKey } from './actions'
import { stageForDay } from './calendar'
import { FACTS, unlockBy, unlockFact } from './facts'
import type { Rng } from './rng'
import { liveUnlocked } from './live'
import { arr, at, FISH_LIST, num, obj, RULES, str } from './rules'
import type { CardKind, FishId, GameState, Plot, Stage } from './types'

export type Effect =
  | { type: 'water_cm'; value: number }
  | { type: 'water_cm_per_day'; value: number; days: number }
  | { type: 'health'; value: number }
  | { type: 'health_per_day'; value: number; days: number }
  | { type: 'yield_multiplier'; value: number }
  | { type: 'phone_off_days'; value: number }
  | { type: 'chance'; value: number; then: Effect[] }
  | { type: 'unlock_fact'; id: string }
  | { type: 'unlock_random_fact' }
  | { type: 'item'; item: 'baja_bag'; count: number }
  | { type: 'followers'; value: number; needsLive: boolean }
  | { type: 'fish'; fish: FishId; count: number }
  | { type: 'fish_price_multiplier'; value: number; days: number }

export interface Cost {
  coins?: number
  hoursTomorrow?: number
  hoursPerDay?: number
  days?: number
  items?: { baja_bag?: number }
}

export interface CardOption {
  id: string
  cost: Cost
  /** Bala effects, or a Rezeki's gain. */
  effects: Effect[]
}

export interface Card {
  id: string
  kind: CardKind
  stages: Stage[]
  options: CardOption[]
  /** Raya can add a free "keep watch" option (M5). */
  rayaCanGuard: boolean
}

function parseEffect(raw: unknown, p: string): Effect {
  const o = obj(raw, p)
  const type = str(at(o, 'type', p), `${p}.type`)
  const value = () => num(at(o, 'value', p), `${p}.value`)
  const days = () => num(at(o, 'days', p), `${p}.days`)
  switch (type) {
    case 'water_cm':
    case 'health':
    case 'yield_multiplier':
    case 'phone_off_days':
      return { type, value: value() }
    case 'water_cm_per_day':
    case 'health_per_day':
    case 'fish_price_multiplier':
      return { type, value: value(), days: days() }
    case 'chance':
      return {
        type,
        value: value(),
        then: arr(at(o, 'then', p), `${p}.then`).map((e, i) => parseEffect(e, `${p}.then[${i}]`)),
      }
    case 'unlock_fact':
      return { type, id: str(at(o, 'id', p), `${p}.id`) }
    case 'unlock_random_fact':
      return { type }
    case 'item': {
      const item = str(at(o, 'item', p), `${p}.item`)
      if (item !== 'baja_bag') throw new Error(`events: unknown item "${item}" at ${p}`)
      return { type, item, count: num(at(o, 'count', p), `${p}.count`) }
    }
    case 'followers':
      return { type, value: value(), needsLive: o.needs_live === true }
    case 'fish': {
      const fish = str(at(o, 'fish', p), `${p}.fish`)
      if (!FISH_LIST.includes(fish as FishId))
        throw new Error(`events: unknown fish "${fish}" at ${p}`)
      return { type, fish: fish as FishId, count: num(at(o, 'count', p), `${p}.count`) }
    }
    default:
      throw new Error(`events: unknown effect "${type}" at ${p}`)
  }
}

function parseCost(raw: unknown, p: string): Cost {
  const o = obj(raw, p)
  const cost: Cost = {}
  if (o.coins !== undefined) cost.coins = num(o.coins, `${p}.coins`)
  if (o.hours_tomorrow !== undefined)
    cost.hoursTomorrow = num(o.hours_tomorrow, `${p}.hours_tomorrow`)
  if (o.hours_per_day !== undefined) {
    cost.hoursPerDay = num(o.hours_per_day, `${p}.hours_per_day`)
    cost.days = num(at(o, 'days', p), `${p}.days`)
  }
  if (o.items !== undefined) {
    const items = obj(o.items, `${p}.items`)
    cost.items = { baja_bag: num(at(items, 'baja_bag', `${p}.items`), `${p}.items.baja_bag`) }
  }
  return cost
}

function parseCards(raw: unknown): Card[] {
  return arr(raw, 'events').map((entry, i) => {
    const p = `events[${i}]`
    const o = obj(entry, p)
    const kind = str(at(o, 'kind', p), `${p}.kind`)
    if (kind !== 'bala' && kind !== 'rezeki') throw new Error(`events: unknown kind at ${p}`)
    return {
      id: str(at(o, 'id', p), `${p}.id`),
      kind,
      stages: arr(at(o, 'stages', p), `${p}.stages`).map(
        (s, j) => str(s, `${p}.stages[${j}]`) as Stage,
      ),
      rayaCanGuard: o.hantu_raya_can_guard === true,
      options: arr(at(o, 'options', p), `${p}.options`).map((opt, j) => {
        const q = `${p}.options[${j}]`
        const oo = obj(opt, q)
        const effects = [
          ...(oo.effects === undefined ? [] : arr(oo.effects, `${q}.effects`)),
          ...(oo.gain === undefined ? [] : arr(oo.gain, `${q}.gain`)),
        ].map((e, k) => parseEffect(e, `${q}.effects[${k}]`))
        return {
          id: str(at(oo, 'id', q), `${q}.id`),
          cost: oo.cost === undefined ? {} : parseCost(oo.cost, `${q}.cost`),
          effects,
        }
      }),
    }
  })
}

export const CARDS: readonly Card[] = parseCards(rawEvents)

const PLAYABLE = CARDS

export function findCard(id: string | null): Card | undefined {
  return id === null ? undefined : CARDS.find((c) => c.id === id)
}

/** Pick tonight's card, or null when none fits. */
export function drawCard(state: GameState, rng: Rng): string | null {
  const stage = stageForDay(state.day)
  const balaBlocked = state.cards.lastKind === 'bala' && RULES.events.maxBalaInARow <= 1
  const eligible = PLAYABLE.filter(
    (c) => c.stages.includes(stage) && !(balaBlocked && c.kind === 'bala'),
  )
  if (eligible.length === 0) return null
  return eligible[Math.floor(rng.next() * eligible.length)]?.id ?? null
}

/** Called when the day ends (Tidur or 7 PM), before advanceDay. Sets `pendingCard` on card nights. */
export function startNight(state: GameState, rng: Rng): GameState {
  if (state.pendingCard || state.day < state.cards.nextNight) return state
  const id = drawCard(state, rng)
  const card = findCard(id)
  if (!card) return { ...state, cards: { ...state.cards, nextNight: state.day + 1 } }
  const [min, max] = RULES.events.cardNightEvery
  const gap = min + Math.floor(rng.next() * (max - min + 1))
  return {
    ...state,
    pendingCard: card.id,
    cards: { nextNight: state.day + gap, lastKind: card.kind },
  }
}

export const DECLINE = 'decline'

/** Raya's free "keep watch" option (spec §4.7a). */
export const RAYA_GUARD = 'raya_guard'

/** The options shown on a card, including Raya's once he has moved in. */
export function cardOptions(state: GameState, card: Card): CardOption[] {
  return card.rayaCanGuard && state.rayaHere
    ? [...card.options, { id: RAYA_GUARD, cost: {}, effects: [] }]
    : card.options
}

export function canResolve(state: GameState, optionId: string): ReasonKey | null {
  const card = findCard(state.pendingCard)
  if (!card) return 'reasons.not_now'
  if (optionId === DECLINE) return card.kind === 'rezeki' ? null : 'reasons.not_now'
  const option = cardOptions(state, card).find((o) => o.id === optionId)
  if (!option) return 'reasons.not_now'
  if ((option.cost.coins ?? 0) > state.coins) return 'shop.not_enough'
  if ((option.cost.items?.baja_bag ?? 0) > state.baja) return 'reasons.no_baja'
  return null
}

function mapPlanted(state: GameState, fn: (p: Plot) => Partial<Plot>): GameState {
  return {
    ...state,
    plots: state.plots.map((p) => (p.status === 'planted' ? { ...p, ...fn(p) } : p)),
  }
}

function applyEffect(state: GameState, effect: Effect, rng: Rng): GameState {
  const cap = RULES.water.capCm
  switch (effect.type) {
    case 'water_cm':
      return mapPlanted(state, (p) => ({
        waterCm: Math.min(cap, Math.max(0, p.waterCm + effect.value)),
      }))
    case 'health':
      return mapPlanted(state, (p) => ({
        health: Math.min(RULES.health.max, Math.max(0, p.health + effect.value)),
      }))
    case 'yield_multiplier':
      return mapPlanted(state, (p) => ({ yieldMultiplier: p.yieldMultiplier * effect.value }))
    case 'water_cm_per_day':
      return {
        ...state,
        effects: [...state.effects, { kind: 'water', value: effect.value, daysLeft: effect.days }],
      }
    case 'health_per_day':
      return {
        ...state,
        effects: [...state.effects, { kind: 'health', value: effect.value, daysLeft: effect.days }],
      }
    case 'phone_off_days':
      return { ...state, phoneOffDays: Math.max(state.phoneOffDays, effect.value) }
    case 'chance':
      return rng.next() < effect.value
        ? effect.then.reduce((s, e) => applyEffect(s, e, rng), state)
        : state
    case 'unlock_fact':
      return unlockFact(state, effect.id)
    case 'unlock_random_fact': {
      const locked = FACTS.filter((f) => !state.facts.includes(f.id))
      const pick = locked[Math.floor(rng.next() * locked.length)]
      return pick ? unlockFact(state, pick.id) : state
    }
    case 'item':
      return { ...state, baja: state.baja + effect.count }
    case 'followers':
      // A "needs_live" gain only counts once Live is open.
      return effect.needsLive && !liveUnlocked(state)
        ? state
        : { ...state, followers: state.followers + effect.value }
    case 'fish':
      return {
        ...state,
        fish: { ...state.fish, [effect.fish]: state.fish[effect.fish] + effect.count },
      }
    case 'fish_price_multiplier':
      // Pasar Malam: tomorrow's Jual Ikan price.
      return { ...state, fishPriceTomorrow: effect.value }
  }
}

/** Apply the chosen option (or decline a Rezeki) and clear the pending card. */
export function resolveCard(state: GameState, optionId: string, rng: Rng): GameState {
  if (canResolve(state, optionId) !== null) return state
  const card = findCard(state.pendingCard)
  const cleared: GameState = { ...state, pendingCard: null, lastCardOutcome: null }
  if (!card || optionId === DECLINE) return cleared
  if (optionId === RAYA_GUARD) {
    // 1 time in 5 he was streaming and forgot: the card's Biar effect applies.
    const ghosted = rng.next() < RULES.raya.ghostChance
    const biar = card.options.find((o) => o.id === 'biar')
    const outcome: GameState = { ...cleared, lastCardOutcome: ghosted ? 'ghosted' : 'guard_ok' }
    return ghosted && biar
      ? biar.effects.reduce((acc, e) => applyEffect(acc, e, rng), outcome)
      : outcome
  }
  const option = card.options.find((o) => o.id === optionId)
  if (!option) return cleared

  const { cost } = option
  const coins = cost.coins ?? 0
  let s: GameState = {
    ...unlockBy(cleared, { on: 'event_option', id: option.id }),
    coins: cleared.coins - coins,
    ledger: { ...cleared.ledger, cardRm: cleared.ledger.cardRm + coins },
    today: { ...cleared.today, spent: cleared.today.spent + coins },
    baja: cleared.baja - (cost.items?.baja_bag ?? 0),
    hoursLostTomorrow: cleared.hoursLostTomorrow + (cost.hoursTomorrow ?? 0),
  }
  if (cost.hoursPerDay) {
    s = {
      ...s,
      effects: [...s.effects, { kind: 'hours', value: cost.hoursPerDay, daysLeft: cost.days ?? 1 }],
    }
  }
  return option.effects.reduce((acc, e) => applyEffect(acc, e, rng), s)
}
