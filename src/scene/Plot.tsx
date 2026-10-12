import type { Rect } from '../input/interactions'
import { PALETTE } from './palette'

/** One sawah plot: a shallow mud bed sunk into the bunds. Padi arrives with the sim (M2+). */
export function Plot({ rect }: { rect: Rect }) {
  const w = rect.maxX - rect.minX
  const d = rect.maxZ - rect.minZ
  return (
    <mesh position={[(rect.minX + rect.maxX) / 2, 0.04, (rect.minZ + rect.maxZ) / 2]} receiveShadow>
      <boxGeometry args={[w, 0.06, d]} />
      <meshStandardMaterial color={PALETTE.mud} flatShading />
    </mesh>
  )
}
