import { Canvas } from '@react-three/fiber'
import { lazy, Suspense, useEffect } from 'react'
import { PCFShadowMap } from 'three'
import { attachControls } from './input/controls'
import { World } from './scene/World'
import { startClock } from './state/clock'
import { Hud } from './ui/hud/Hud'
import './styles.css'

// Dev-only tools. `import.meta.env.DEV` is false in production, so these chunks are never built.
const DebugPanel = import.meta.env.DEV ? lazy(() => import('./ui/debug/DebugPanel')) : null
const DrawCallProbe = import.meta.env.DEV ? lazy(() => import('./ui/debug/DrawCallProbe')) : null

export function App() {
  useEffect(() => {
    const stopClock = startClock()
    const detachControls = attachControls()
    return () => {
      stopClock()
      detachControls()
    }
  }, [])

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
      <Hud />
      {DebugPanel && (
        <Suspense fallback={null}>
          <DebugPanel />
        </Suspense>
      )}
    </>
  )
}
