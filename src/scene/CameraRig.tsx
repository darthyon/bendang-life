import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, type RefObject } from 'react'
import { Vector3 } from 'three'

// Fixed iso-style view from the south-east, looking north-west. Never rotates.
export const CAMERA_OFFSET = new Vector3(30, 36, 30)
const FOLLOW = 0.35 // how far the view leans toward the player (0 = fixed on island centre)
const SMOOTHING = 4

const look = new Vector3()

export function CameraRig({ focus }: { focus: RefObject<Vector3> }) {
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    camera.position.copy(CAMERA_OFFSET)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((_, dt) => {
    const p = focus.current
    if (!p) return
    const goal = look.set(p.x * FOLLOW, 0, p.z * FOLLOW)
    const k = 1 - Math.exp(-SMOOTHING * dt)
    camera.position.lerp(goal.clone().add(CAMERA_OFFSET), k)
  })

  return null
}
