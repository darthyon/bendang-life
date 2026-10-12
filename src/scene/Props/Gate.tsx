import { PALETTE } from '../palette'

/** Pintu air: two posts and a board across the canal. The board lifts when the gate is open. */
export function Gate({ x, z, open }: { x: number; z: number; open: boolean }) {
  return (
    <group position={[x, 0, z]}>
      {[-0.9, 0.9].map((dx) => (
        <mesh key={dx} position={[dx, 0.6, 0]} castShadow>
          <boxGeometry args={[0.25, 1.4, 0.25]} />
          <meshStandardMaterial color={PALETTE.wood} flatShading />
        </mesh>
      ))}
      <mesh position={[0, open ? 1.1 : 0.5, 0]} castShadow>
        <boxGeometry args={[1.6, 0.7, 0.15]} />
        <meshStandardMaterial color={PALETTE.trunk} flatShading />
      </mesh>
    </group>
  )
}
