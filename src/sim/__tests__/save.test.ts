import { describe, expect, it } from 'vitest'
import { applyAction } from '../actions'
import { advanceDay } from '../day'
import { createRng } from '../rng'
import { deserialize, SAVE_VERSION, serialize } from '../save'
import { createInitialState, normalizeName } from '../state'
import { tutorialDue } from '../selectors'
import { plantedState } from './helpers'

const fresh = () => createInitialState({ starter: 'mr220cl2', name: 'Aina', preset: 'scarf' })

describe('player profile', () => {
  it('keeps the name and preset', () => {
    expect(fresh().player).toEqual({ name: 'Aina', preset: 'scarf' })
  })

  it('trims, collapses spaces and caps the name at 16 characters', () => {
    expect(normalizeName('   Mat   Kilau  ')).toBe('Mat Kilau')
    expect(normalizeName('A'.repeat(30))).toHaveLength(16)
    expect(normalizeName('   ')).toBe('')
  })
})

describe('tutorial', () => {
  it('shows the controls on day 1 until seen', () => {
    const s = fresh()
    expect(tutorialDue(s)).toBe('controls')
    expect(tutorialDue(applyAction(s, { type: 'ACK_TUTORIAL', step: 'controls' }))).toBeNull()
  })

  it('shows the phone hint on the first morning baja is due', () => {
    let s = applyAction(fresh(), { type: 'ACK_TUTORIAL', step: 'controls' })
    s = applyAction(s, { type: 'BAJAK', plotId: 1 })
    s = applyAction(s, { type: 'TANAM', plotId: 1, variety: 'mr220cl2' })
    expect(tutorialDue(s)).toBeNull()
    s = advanceDay(s, createRng(1))
    expect(tutorialDue(s)).toBe('phone')
    expect(tutorialDue(applyAction(s, { type: 'ACK_TUTORIAL', step: 'phone' }))).toBeNull()
  })

  it('does not show the phone hint without a planted plot', () => {
    const s = {
      ...plantedState(2, { status: 'empty' }),
      tutorial: { controlsSeen: true, phoneSeen: false },
    }
    expect(tutorialDue(s)).toBeNull()
  })
})

describe('save', () => {
  it('round-trips the game, seed and RNG position', () => {
    const data = { state: fresh(), seed: 42, rngState: 99 }
    expect(deserialize(serialize(data))).toEqual(data)
  })

  it('writes the version', () => {
    expect(JSON.parse(serialize({ state: fresh(), seed: 1, rngState: 1 })).version).toBe(
      SAVE_VERSION,
    )
  })

  it('returns null for nothing, bad JSON, wrong version or a broken shape', () => {
    expect(deserialize(null)).toBeNull()
    expect(deserialize('{not json')).toBeNull()
    expect(
      deserialize(JSON.stringify({ version: 999, state: fresh(), seed: 1, rngState: 1 })),
    ).toBeNull()
    const broken: Record<string, unknown> = { ...fresh() }
    delete broken.plots
    expect(
      deserialize(JSON.stringify({ version: SAVE_VERSION, state: broken, seed: 1, rngState: 1 })),
    ).toBeNull()
    expect(
      deserialize(
        JSON.stringify({ version: SAVE_VERSION, state: fresh(), seed: 'x', rngState: 1 }),
      ),
    ).toBeNull()
  })
})
