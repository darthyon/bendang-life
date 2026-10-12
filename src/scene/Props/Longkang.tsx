import { LONGKANG } from '../layout'
import { PALETTE } from '../palette'

/** The drain ditch along the south edge: where you go fishing. */
export function Longkang() {
  const w = LONGKANG.maxX - LONGKANG.minX
  const d = LONGKANG.maxZ - LONGKANG.minZ
  return (
    <mesh
      position={[(LONGKANG.minX + LONGKANG.maxX) / 2, 0.02, (LONGKANG.minZ + LONGKANG.maxZ) / 2]}
      receiveShadow
    >
      <boxGeometry args={[w, 0.04, d]} />
      <meshStandardMaterial color={PALETTE.water} flatShading />
    </mesh>
  )
}
