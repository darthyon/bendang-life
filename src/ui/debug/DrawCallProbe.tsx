import { useFrame } from '@react-three/fiber'
import { debugStats } from './stats'

/** Reads the renderer's counters each frame (values are from the previous frame). */
export default function DrawCallProbe() {
  useFrame(({ gl }) => {
    debugStats.drawCalls = gl.info.render.calls
    debugStats.triangles = gl.info.render.triangles
  })
  return null
}
