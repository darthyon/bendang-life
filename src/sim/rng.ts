// Seeded PRNG (mulberry32). The only source of randomness in the sim.

export interface Rng {
  /** Next float in [0, 1). */
  next(): number
  /** Internal state, for saving and resuming. */
  state(): number
}

export function createRng(seed: number, resumeState?: number): Rng {
  let s = (resumeState ?? seed) >>> 0
  return {
    next() {
      s = (s + 0x6d2b79f5) >>> 0
      let t = s
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
    state: () => s,
  }
}
