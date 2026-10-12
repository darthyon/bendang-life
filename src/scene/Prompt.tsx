import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { Group, Vector3 } from 'three'
import type { Target } from '../input/interactions'
import { t } from '../i18n'

// M1: one static label per target kind. M2 derives the label from game state.
const LABEL: Record<Target['kind'], string> = {
  plot: 'actions.bajak',
  gate: 'actions.gate_open',
  longkang: 'actions.pancing',
}

/** Context prompt floating above the player's head. */
export function Prompt({ target, focus }: { target: Target | null; focus: RefObject<Vector3> }) {
  const group = useRef<Group>(null)

  useFrame(() => {
    const p = focus.current
    if (p && group.current) group.current.position.set(p.x, 2.4, p.z)
  })

  return (
    <group ref={group}>
      {target && (
        <Html center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="prompt" role="status">
            <kbd className="prompt__key">E</kbd>
            <span>{t(LABEL[target.kind])}</span>
          </div>
        </Html>
      )}
    </group>
  )
}
