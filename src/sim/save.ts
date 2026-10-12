// Save files: { version, state } plus the RNG position (AGENTS.md "Saves").
// Pure: reading and writing localStorage lives in src/state/persist.ts.
import { createInitialState } from './state'
import type { GameState } from './types'

export const SAVE_VERSION = 1

export interface SaveData {
  state: GameState
  seed: number
  rngState: number
}

/**
 * Upgrades from older versions, keyed by the version they upgrade from.
 * Add one here and bump SAVE_VERSION whenever the GameState shape changes.
 */
const MIGRATIONS: Record<number, (state: Record<string, unknown>) => Record<string, unknown>> = {}

// Every top-level key a valid state must have, taken from a fresh game.
const REQUIRED_KEYS = Object.keys(createInitialState({ starter: 'mr297' }))

export function serialize(data: SaveData): string {
  return JSON.stringify({ version: SAVE_VERSION, ...data })
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Read a save. Anything unreadable, unknown or broken returns null, never throws. */
export function deserialize(raw: string | null): SaveData | null {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isObject(parsed)) return null
  const { version, seed, rngState } = parsed
  if (typeof version !== 'number' || version > SAVE_VERSION || version < 1) return null
  if (typeof seed !== 'number' || typeof rngState !== 'number') return null
  if (!isObject(parsed.state)) return null

  let state = parsed.state
  for (let v = version; v < SAVE_VERSION; v++) {
    const migrate = MIGRATIONS[v]
    if (!migrate) return null
    state = migrate(state)
  }
  if (!REQUIRED_KEYS.every((key) => key in state)) return null
  if (!Array.isArray(state.plots)) return null
  return { state: state as unknown as GameState, seed, rngState }
}
