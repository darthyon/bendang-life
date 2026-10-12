// Grey-box island layout in metres. x runs east, z runs south, y up.
// Visual placement only: no game rules live here.
import type { Rect, Target } from '../input/interactions'

export interface Box {
  center: [number, number, number]
  size: [number, number, number]
}

export const ISLAND: Rect = { minX: -12, maxX: 12, minZ: -9, maxZ: 9 }
export const ISLAND_DEPTH = 1.4

export const PLAYER_START: [number, number] = [-6.6, -1]
export const PLAYER_RADIUS = 0.35

const PLOT_W = 6
const PLOT_D = 6.5
export const PLOTS: { id: number; rect: Rect }[] = [
  { id: 1, x: -1.5, z: -3.75 },
  { id: 2, x: 5.5, z: -3.75 },
  { id: 3, x: -1.5, z: 3.75 },
  { id: 4, x: 5.5, z: 3.75 },
].map(({ id, x, z }) => ({
  id,
  rect: { minX: x - PLOT_W / 2, maxX: x + PLOT_W / 2, minZ: z - PLOT_D / 2, maxZ: z + PLOT_D / 2 },
}))

export const CANAL: Rect = { minX: 9.5, maxX: 11, minZ: -9, maxZ: 9 }
export const LONGKANG: Rect = { minX: -11, maxX: 9.5, minZ: 8, maxZ: 8.8 }
export const PATH: Rect = { minX: -7.4, maxX: -5.8, minZ: -7, maxZ: 7.6 }

export const GATES: { id: 'A' | 'B'; x: number; z: number }[] = [
  { id: 'A', x: 10.25, z: -5.5 },
  { id: 'B', x: 10.25, z: 5.5 },
]

export const COTTAGE: Box = { center: [-9.4, 1.6, -5.4], size: [4, 3.2, 4.4] }

export const TREES: [number, number][] = [
  [-11, -8],
  [-11, 0.5],
  [-9.5, 4],
  [-4, -8.2],
  [8.5, -8.2],
]

function boxRect(b: Box): Rect {
  return {
    minX: b.center[0] - b.size[0] / 2,
    maxX: b.center[0] + b.size[0] / 2,
    minZ: b.center[2] - b.size[2] / 2,
    maxZ: b.center[2] + b.size[2] / 2,
  }
}

const TREE_TRUNK = 0.4

/** Areas the player cannot walk into. */
export const BLOCKERS: Rect[] = [
  boxRect(COTTAGE),
  CANAL,
  LONGKANG,
  ...TREES.map(([x, z]) => ({
    minX: x - TREE_TRUNK,
    maxX: x + TREE_TRUNK,
    minZ: z - TREE_TRUNK,
    maxZ: z + TREE_TRUNK,
  })),
]

const REACH = 1.4

export const TARGETS: Target[] = [
  ...PLOTS.map((p): Target => ({
    id: `plot-${p.id}`,
    kind: 'plot',
    plotId: p.id,
    area: p.rect,
    anchor: [(p.rect.minX + p.rect.maxX) / 2, (p.rect.minZ + p.rect.maxZ) / 2],
  })),
  ...GATES.map((g): Target => ({
    id: `gate-${g.id}`,
    kind: 'gate',
    gateId: g.id,
    area: { minX: g.x - REACH - 0.75, maxX: g.x, minZ: g.z - REACH, maxZ: g.z + REACH },
    anchor: [g.x, g.z],
  })),
  {
    id: 'longkang',
    kind: 'longkang',
    area: {
      minX: LONGKANG.minX,
      maxX: LONGKANG.maxX,
      minZ: LONGKANG.minZ - REACH,
      maxZ: LONGKANG.minZ,
    },
    anchor: [(LONGKANG.minX + LONGKANG.maxX) / 2, LONGKANG.minZ],
  },
]
