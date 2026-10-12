import { Canvas } from '@react-three/fiber'
import { PCFShadowMap } from 'three'
import { World } from './scene/World'
import './styles.css'

export function App() {
  return (
    <Canvas shadows={{ type: PCFShadowMap }} dpr={[1, 2]} camera={{ fov: 25, near: 0.1, far: 200 }}>
      <World />
    </Canvas>
  )
}
