import { describe, expect, it } from 'vitest'
import { kitabUnlocks } from '../kitab'
import { freshState } from './helpers'

const byKey = (s: Parameters<typeof kitabUnlocks>[0]) =>
  Object.fromEntries(kitabUnlocks(s).map((u) => [u.key, u.unlocked]))

describe('Kitab unlocks tab', () => {
  it('starts with everything locked', () => {
    expect(byKey(freshState())).toEqual({
      live: false,
      raya: false,
      plot_2: false,
      plot_3_4: false,
    })
  })

  it('opens Live on day 8 and Raya on day 14 of season 1', () => {
    expect(byKey(freshState({ day: 8 })).live).toBe(true)
    expect(byKey(freshState({ day: 13 })).raya).toBe(false)
    expect(byKey(freshState({ day: 14 })).raya).toBe(true)
  })

  it('opens plots by season', () => {
    expect(byKey(freshState({ season: 2 }))).toMatchObject({
      live: true,
      plot_2: true,
      plot_3_4: false,
    })
    expect(byKey(freshState({ season: 3 })).plot_3_4).toBe(true)
  })
})
