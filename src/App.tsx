import { Canvas } from '@react-three/fiber'
import { lazy, Suspense } from 'react'
import { PCFShadowMap } from 'three'
import { World } from './scene/World'
import './styles.css'

// Dev-only tools. `import.meta.env.DEV` is false in production, so these chunks are never built.
const DebugPanel = import.meta.env.DEV ? lazy(() => import('./ui/debug/DebugPanel')) : null
const DrawCallProbe = import.meta.env.DEV ? lazy(() => import('./ui/debug/DrawCallProbe')) : null

export function App() {
  return (
    <>
      <Canvas
        shadows={{ type: PCFShadowMap }}
        dpr={[1, 2]}
        camera={{ fov: 25, near: 0.1, far: 200 }}
      >
        <World />
        {DrawCallProbe && (
          <Suspense fallback={null}>
            <DrawCallProbe />
          </Suspense>
        )}
      </Canvas>
      {DebugPanel && (
        <Suspense fallback={null}>
          <DebugPanel />
        </Suspense>
      )}
    </>
  )
}
