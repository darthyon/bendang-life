import { COTTAGE } from '../layout'
import { PALETTE } from '../palette'

/** Kampung house on stilts: body box plus a pyramid roof. */
export function Cottage() {
  const [x, , z] = COTTAGE.center
  const [w, h, d] = COTTAGE.size
  const stilt = 0.6
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, stilt + (h * 0.55) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h * 0.55, d]} />
        <meshStandardMaterial color={PALETTE.wood} flatShading />
      </mesh>
      <mesh position={[0, stilt + h * 0.55 + 0.7, 0]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[Math.hypot(w, d) / 2 + 0.4, 1.4, 4]} />
        <meshStandardMaterial color={PALETTE.roof} flatShading />
      </mesh>
      <mesh position={[0, stilt / 2, 0]}>
        <boxGeometry args={[w - 0.3, stilt, d - 0.3]} />
        <meshStandardMaterial color={PALETTE.trunk} flatShading />
      </mesh>
    </group>
  )
}
