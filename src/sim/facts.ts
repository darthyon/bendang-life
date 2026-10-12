// Kitab Bendang facts from content/facts.yaml. Text lives in i18n under facts.<id>.
import rawFacts from '../../content/facts.yaml'
import { arr, at, obj, str } from './rules'
import type { GameState } from './types'

export interface FactDef {
  id: string
  rc: number[]
  source: string
  unlock: Record<string, unknown>
}

function parseFacts(raw: unknown): FactDef[] {
  return arr(raw, 'facts').map((entry, i) => {
    const p = `facts[${i}]`
    const o = obj(entry, p)
    const rc = o.rc === undefined ? [] : arr(o.rc, `${p}.rc`).filter((n) => typeof n === 'number')
    return {
      id: str(at(o, 'id', p), `${p}.id`),
      rc: rc as number[],
      source: str(at(o, 'source', p), `${p}.source`),
      unlock: obj(at(o, 'unlock', p), `${p}.unlock`),
    }
  })
}

export const FACTS: readonly FactDef[] = parseFacts(rawFacts)

/** Add a fact to the Kitab if it is new. */
export function unlockFact(state: GameState, id: string): GameState {
  if (state.facts.includes(id) || !FACTS.some((f) => f.id === id)) return state
  return { ...state, facts: [...state.facts, id] }
}

export type FactTrigger =
  | { on: 'action'; job: string }
  | { on: 'day'; day: number }
  | { on: 'event'; id: string }
  | { on: 'event_option'; id: string }
  | { on: 'buy_seed'; variety: string }
  | { on: 'loan' }
  | { on: 'report' }

function matches(fact: FactDef, trigger: FactTrigger): boolean {
  const u = fact.unlock
  switch (trigger.on) {
    case 'action':
      return u.on_action === trigger.job
    case 'day':
      return u.on_day === trigger.day
    case 'event':
      return u.on_event === trigger.id
    case 'event_option':
      return u.on_event_option === trigger.id
    case 'buy_seed':
      return u.on_buy_seed === trigger.variety
    case 'loan':
      return u.on_loan === true
    case 'report':
      return u.on_report === true
  }
}

/** Unlock every fact this trigger opens. Facts unlock once, so "first_time" needs no tracking. */
export function unlockBy(state: GameState, trigger: FactTrigger): GameState {
  return FACTS.filter((f) => matches(f, trigger)).reduce((s, f) => unlockFact(s, f.id), state)
}
