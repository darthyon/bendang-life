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
