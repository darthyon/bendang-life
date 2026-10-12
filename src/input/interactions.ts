export interface Rect {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export type Target =
  | { id: string; kind: 'plot'; plotId: number; area: Rect; anchor: [number, number] }
  | { id: string; kind: 'gate'; gateId: 'A' | 'B'; area: Rect; anchor: [number, number] }
  | { id: string; kind: 'longkang'; area: Rect; anchor: [number, number] }

export function inRect(x: number, z: number, r: Rect, margin = 0): boolean {
  return (
    x >= r.minX - margin && x <= r.maxX + margin && z >= r.minZ - margin && z <= r.maxZ + margin
  )
}

/** The target whose area contains the point; ties go to the closest anchor. */
export function findTarget(x: number, z: number, targets: readonly Target[]): Target | null {
  let best: Target | null = null
  let bestDist = Infinity
  for (const target of targets) {
    if (!inRect(x, z, target.area)) continue
    const d = Math.hypot(x - target.anchor[0], z - target.anchor[1])
    if (d < bestDist) {
      best = target
      bestDist = d
    }
  }
  return best
}
