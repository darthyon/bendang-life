import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { attachKeyboard } from '../input/keyboard'
import { findTarget, type Target } from '../input/interactions'
import { CameraRig } from './CameraRig'
import { Island } from './Island'
import { GATES, PLAYER_START, PLOTS, TARGETS } from './layout'
import { Lighting } from './Lighting'
import { Player } from './Player'
import { Plot } from './Plot'
import { Prompt } from './Prompt'
import { Cottage } from './Props/Cottage'
import { Gate } from './Props/Gate'
import { Longkang } from './Props/Longkang'
import { PALETTE } from './palette'

export function World() {
  const player = useRef(new Vector3(PLAYER_START[0], 0, PLAYER_START[1]))
  const [target, setTarget] = useState<Target | null>(null)

  // E / Space will dispatch sim actions from M2. Listening now keeps held-key state live.
  useEffect(() => attachKeyboard(), [])

  useFrame(() => {
    const next = findTarget(player.current.x, player.current.z, TARGETS)
    if (next?.id !== target?.id) setTarget(next)
  })

  return (
    <>
      <color attach="background" args={[PALETTE.sky]} />
      <Lighting focus={player} />
      <CameraRig focus={player} />
      <Island />
      {PLOTS.map((p) => (
        <Plot key={p.id} rect={p.rect} />
      ))}
      {GATES.map((g) => (
        <Gate key={g.id} x={g.x} z={g.z} />
      ))}
      <Longkang />
      <Cottage />
      <Player position={player} />
      <Prompt target={target} focus={player} />
    </>
  )
}
