import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { DirectionalLight, Vector3 } from 'three'

const SUN_OFFSET: [number, number, number] = [8, 18, 6]

/** Hemisphere fill plus one shadow-casting sun that follows the player. */
export function Lighting({ focus }: { focus: RefObject<Vector3> }) {
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
      <hemisphereLight args={['#fff6e0', '#5c6b4a', 0.9]} />
      <directionalLight
        ref={sun}
        intensity={1.8}
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
