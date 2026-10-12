import { Canvas } from '@react-three/fiber'

// Sage backdrop sampled from docs/refs/01-day-hud.png.
const SKY = '#8a9f78'

export function App() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [20, 20, 20], fov: 25, near: 0.1, far: 200 }}>
      <color attach="background" args={[SKY]} />
      <hemisphereLight args={['#fff6e0', '#5c6b4a', 0.8]} />
      <directionalLight position={[10, 18, 6]} intensity={1.6} castShadow />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#7f9a52" flatShading />
      </mesh>
    </Canvas>
  )
}
