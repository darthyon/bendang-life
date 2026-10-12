import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, type RefObject } from 'react'
import { Vector3, type Group } from 'three'
import { t } from '../i18n'
import { RULES } from '../sim/rules'
import { isPaused, useGame } from '../state/store'
import { COTTAGE } from './layout'
import { PALETTE } from './palette'

const FOLLOW_GAP = 1.6 // metres he keeps behind you
const SPEED = 4.2
const LINES = ['raya.idle_1', 'raya.idle_2', 'raya.idle_3']
const LINE_MS = 5000
// Where he appears: at the cottage door, beside Tok Wan's spot.
const START: [number, number, number] = [
  COTTAGE.center[0] + COTTAGE.size[0] / 2 + 0.7,
  0.15,
  COTTAGE.center[2] - 0.6,
]

/** Raya, the Gen Z hantu raya (spec §4.7a): at the cottage on arrival, then following you. */
export function Raya({ player }: { player: RefObject<Vector3> }) {
  const here = useGame((s) => s.game.rayaHere)
  const arriving = useGame((s) => s.game.moments[0] === 'raya_arrival')
  const group = useRef<Group>(null)
  const pos = useRef(
    new Vector3(COTTAGE.center[0] + COTTAGE.size[0] / 2 + 0.7, 0, COTTAGE.center[2] - 0.6),
  )
  const lastPlayer = useRef(new Vector3())
  const walked = useRef(0)
  const lineIndex = useRef(0)
  const [line, setLine] = useState<string | null>(null)

  useFrame((state, dt) => {
    const g = group.current
    const p = player.current
    if (!g || !p) return
    // Float a little: he is a ghost.
    g.position.y = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.06
    if (!here || isPaused()) return

    const toPlayer = p.clone().sub(pos.current).setY(0)
    const distance = toPlayer.length()
    if (distance > FOLLOW_GAP) {
      const step = Math.min(distance - FOLLOW_GAP, SPEED * Math.min(dt, 0.1))
      pos.current.addScaledVector(toPlayer.normalize(), step)
      g.rotation.y = Math.atan2(toPlayer.x, toPlayer.z)
    }
    g.position.x = pos.current.x
    g.position.z = pos.current.z

    // A line every few real minutes while you walk.
    if (lastPlayer.current.distanceToSquared(p) > 1e-6) walked.current += dt
    lastPlayer.current.copy(p)
    if (walked.current >= RULES.raya.idleLineMinutes * 60) {
      walked.current = 0
      const key = LINES[lineIndex.current % LINES.length] ?? LINES[0] ?? ''
      lineIndex.current += 1
      setLine(key)
      window.setTimeout(() => setLine(null), LINE_MS)
    }
  })

  if (!here && !arriving) return null
  return (
    <group ref={group} position={START}>
      {/* Hoodie body */}
      <mesh position={[0, 0.75, 0]}>
        <capsuleGeometry args={[0.3, 0.7, 4, 8]} />
        <meshStandardMaterial color={PALETTE.rayaHoodie} transparent opacity={0.6} flatShading />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 1.42, -0.04]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color={PALETTE.rayaHoodie} transparent opacity={0.6} flatShading />
      </mesh>
      <mesh position={[0, 1.42, 0.08]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color={PALETTE.rayaFace} transparent opacity={0.7} flatShading />
      </mesh>
      {/* Phone, always out */}
      <mesh position={[0.18, 1.0, 0.3]} rotation-x={-0.6}>
        <boxGeometry args={[0.14, 0.24, 0.03]} />
        <meshStandardMaterial
          color={PALETTE.rayaPhone}
          emissive={PALETTE.rayaPhone}
          emissiveIntensity={0.8}
        />
      </mesh>
      {line && (
        <Html position={[0, 2.2, 0]} center zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
          <p className="raya-line">
            <span className="raya-line__name">{t('raya.name')}</span>
            {t(line)}
          </p>
        </Html>
      )}
    </group>
  )
}
