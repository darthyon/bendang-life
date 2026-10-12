import { useGame } from '../state/store'
import { COTTAGE } from './layout'
import { PALETTE } from './palette'

/** Tok Wan at the cottage door, only at the season report (spec §2). Grey-box until M7. */
export function TokWan() {
  const atDoor = useGame((s) => s.game.phase === 'report')
  if (!atDoor) return null
  const [x, , z] = COTTAGE.center
  // Just outside the door on the path side (east face of the cottage).
  const doorX = x + COTTAGE.size[0] / 2 + 0.7
  return (
    <group position={[doorX, 0, z + 1]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.66, 4, 8]} />
        <meshStandardMaterial color={PALETTE.tokShirt} flatShading />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.24, 8, 6]} />
        <meshStandardMaterial color={PALETTE.skin} flatShading />
      </mesh>
      {/* Songkok */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.16, 10]} />
        <meshStandardMaterial color={PALETTE.songkok} flatShading />
      </mesh>
    </group>
  )
}
