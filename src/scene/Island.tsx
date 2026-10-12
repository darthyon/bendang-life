import { PALETTE } from './palette'
import { CANAL, ISLAND, ISLAND_DEPTH, PATH, PLOTS, TREES } from './layout'
import type { Rect } from '../input/interactions'

function size(r: Rect): [number, number] {
  return [r.maxX - r.minX, r.maxZ - r.minZ]
}
function mid(r: Rect): [number, number] {
  return [(r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2]
}

/** A flat slab lying on the ground covering a rect. */
function Slab({ rect, y, h, color }: { rect: Rect; y: number; h: number; color: string }) {
  const [w, d] = size(rect)
  const [x, z] = mid(rect)
  return (
    <mesh position={[x, y, z]} receiveShadow castShadow={h > 0.1}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  )
}

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 2.4, 6]} />
        <meshStandardMaterial color={PALETTE.trunk} flatShading />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <icosahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial color={PALETTE.leaf} flatShading />
      </mesh>
    </group>
  )
}

// Bund (batas) ring around the 2×2 plot block, plus the cross bunds between plots.
const bundBlock: Rect = {
  minX: Math.min(...PLOTS.map((p) => p.rect.minX)) - 0.6,
  maxX: Math.max(...PLOTS.map((p) => p.rect.maxX)) + 0.6,
  minZ: Math.min(...PLOTS.map((p) => p.rect.minZ)) - 0.6,
  maxZ: Math.max(...PLOTS.map((p) => p.rect.maxZ)) + 0.6,
}

export function Island() {
  const [iw, id] = size(ISLAND)
  return (
    <group>
      {/* Sea */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.9, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color={PALETTE.sea} />
      </mesh>
      {/* Soil block with a grass top */}
      <mesh position={[0, -ISLAND_DEPTH / 2 - 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[iw, ISLAND_DEPTH, id]} />
        <meshStandardMaterial color={PALETTE.soil} flatShading />
      </mesh>
      <Slab rect={ISLAND} y={-0.025} h={0.05} color={PALETTE.grass} />
      <Slab rect={bundBlock} y={0.02} h={0.06} color={PALETTE.bund} />
      <Slab rect={PATH} y={0.03} h={0.04} color={PALETTE.path} />
      {/* Canal: a cut filled with water */}
      <Slab rect={CANAL} y={0.02} h={0.04} color={PALETTE.water} />
      {TREES.map(([x, z]) => (
        <Tree key={`${x},${z}`} x={x} z={z} />
      ))}
    </group>
  )
}
