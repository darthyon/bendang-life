import { describe, expect, it } from 'vitest'
import { potonganRate } from '../harvest'
import { RULES, VARIETIES } from '../rules'

const p = RULES.harvest.potongan
const mr297 = VARIETIES.mr297

describe('potongan', () => {
  it('always takes the base rate', () => {
    expect(potonganRate(0, 19, mr297)).toBeCloseTo(p.base)
  })

  it('adds the not-drained rate above the drained limit', () => {
    expect(potonganRate(p.drainedMaxCm, 19, mr297)).toBeCloseTo(p.base)
    expect(potonganRate(p.drainedMaxCm + 1, 19, mr297)).toBeCloseTo(p.base + p.notDrained)
  })

  it('adds the late rate after the last ideal day', () => {
    expect(potonganRate(0, 21, mr297)).toBeCloseTo(p.base + p.late)
    expect(potonganRate(0, 20, VARIETIES.mrq76)).toBeCloseTo(p.base + p.late)
  })

  it('caps at the maximum', () => {
    expect(potonganRate(5, 25, mr297)).toBeCloseTo(p.max)
  })
})
