import { describe, expect, it } from 'vitest'
import { findTarget, type Target } from '../interactions'

const targets: Target[] = [
  {
    id: 'plot-1',
    kind: 'plot',
    plotId: 1,
    area: { minX: 0, maxX: 4, minZ: 0, maxZ: 4 },
    anchor: [2, 2],
  },
  {
    id: 'gate-A',
    kind: 'gate',
    gateId: 'A',
    area: { minX: 3, maxX: 6, minZ: 3, maxZ: 6 },
    anchor: [5, 5],
  },
]

describe('findTarget', () => {
  it('returns null outside every area', () => {
    expect(findTarget(-1, -1, targets)).toBeNull()
  })

  it('returns the target whose area contains the point', () => {
    expect(findTarget(1, 1, targets)?.id).toBe('plot-1')
    expect(findTarget(5.5, 5.5, targets)?.id).toBe('gate-A')
  })

  it('picks the closest anchor where areas overlap', () => {
    expect(findTarget(3.2, 3.2, targets)?.id).toBe('plot-1')
    expect(findTarget(3.9, 3.9, targets)?.id).toBe('gate-A')
  })
})
