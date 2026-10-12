import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { DirectionalLight, Vector3 } from 'three'

const SUN_OFFSET: [number, number, number] = [8, 18, 6]

/** Hemisphere fill plus one shadow-casting sun (moon at night) that follows the player. */
export function Lighting({ focus, night }: { focus: RefObject<Vector3>; night: boolean }) {
  const sun = useRef<DirectionalLight>(null)

  useFrame(() => {
    const light = sun.current
    const p = focus.current
    if (!light || !p) return
    light.position.set(p.x + SUN_OFFSET[0], SUN_OFFSET[1], p.z + SUN_OFFSET[2])
    light.target.position.set(p.x, 0, p.z)
    light.target.updateMatrixWorld()
  })

  return (
    <>
      <hemisphereLight args={night ? ['#6d7fb8', '#1c2333', 0.55] : ['#fff6e0', '#5c6b4a', 0.9]} />
      <directionalLight
        ref={sun}
        intensity={night ? 0.35 : 1.8}
        color={night ? '#9fb2ff' : '#ffffff'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0005}
      />
    </>
  )
}
