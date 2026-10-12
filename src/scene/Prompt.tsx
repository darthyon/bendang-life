import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { Group, Vector3 } from 'three'
import type { Job } from '../sim/selectors'
import { t } from '../i18n'

/** Context prompt floating above the player's head. */
export function Prompt({
  job,
  blocked,
  focus,
}: {
  job: Job | null
  /** Reason shown after a refused E press. */
  blocked: string | null
  focus: RefObject<Vector3>
}) {
  const group = useRef<Group>(null)

  useFrame(() => {
    const p = focus.current
    if (p && group.current) group.current.position.set(p.x, 2.4, p.z)
  })

  return (
    <group ref={group}>
      {job && (
        <Html center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="prompt" role="status">
            {job.action && <kbd className="prompt__key">E</kbd>}
            <span>{t(job.labelKey)}</span>
            {blocked && <span className="prompt__reason">{t(blocked)}</span>}
          </div>
        </Html>
      )}
    </group>
  )
}
