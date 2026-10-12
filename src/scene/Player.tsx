import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { Vector3, type Group } from 'three'
import { moveInput } from '../input/keyboard'
import { isPaused } from '../state/store'
import { inRect } from '../input/interactions'
import { BLOCKERS, ISLAND, PLAYER_RADIUS } from './layout'
import { PALETTE } from './palette'

const SPEED = 4.5 // m/s
// Screen-aligned axes for the fixed camera (see CameraRig): up-screen is north-west.
const UP = new Vector3(-1, 0, -1).normalize()
const RIGHT = new Vector3(1, 0, -1).normalize()
const EDGE = 0.5

function walkable(x: number, z: number): boolean {
  if (!inRect(x, z, ISLAND, -EDGE)) return false
  return !BLOCKERS.some((b) => inRect(x, z, b, PLAYER_RADIUS))
}

const step = new Vector3()

/** Moves `position` in place from keyboard input, sliding along blockers. */
export function Player({ position }: { position: RefObject<Vector3> }) {
  const group = useRef<Group>(null)

  useFrame((_, dt) => {
    const p = position.current
    const g = group.current
    if (!p || !g) return
    if (isPaused()) return
    const input = moveInput()
    if (input.x === 0 && input.y === 0) return

    step
      .set(0, 0, 0)
      .addScaledVector(RIGHT, input.x)
      .addScaledVector(UP, input.y)
      .normalize()
      .multiplyScalar(SPEED * Math.min(dt, 0.1))

    // Resolve each axis separately so the player slides along walls.
    const x = walkable(p.x + step.x, p.z) ? p.x + step.x : p.x
    const z = walkable(x, p.z + step.z) ? p.z + step.z : p.z
    p.set(x, 0, z)

    g.position.set(p.x, 0, p.z)
    g.rotation.y = Math.atan2(step.x, step.z)
  })

  return (
    <group ref={group} position={[position.current?.x ?? 0, 0, position.current?.z ?? 0]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.7, 4, 8]} />
        <meshStandardMaterial color={PALETTE.shirt} flatShading />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.24, 8, 6]} />
        <meshStandardMaterial color={PALETTE.skin} flatShading />
      </mesh>
      {/* Terendak (conical hat) */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <coneGeometry args={[0.5, 0.28, 8]} />
        <meshStandardMaterial color={PALETTE.hat} flatShading />
      </mesh>
      {/* Nose marker so facing reads in grey-box */}
      <mesh position={[0, 1.45, 0.24]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color={PALETTE.trunk} />
      </mesh>
    </group>
  )
}
