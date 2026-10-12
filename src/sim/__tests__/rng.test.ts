import { describe, expect, it } from 'vitest'
import { createRng } from '../rng'

describe('rng', () => {
  it('gives the same sequence for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    const seqA = Array.from({ length: 5 }, () => a.next())
    const seqB = Array.from({ length: 5 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('stays in [0, 1) and differs across seeds', () => {
    const a = createRng(1)
    const b = createRng(2)
    const values = Array.from({ length: 200 }, () => a.next())
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true)
    expect(a.next()).not.toBe(b.next())
  })

  it('resumes from a saved state', () => {
    const a = createRng(7)
    a.next()
    const resumed = createRng(7, a.state())
    expect(resumed.next()).toBe(a.next())
  })
})
