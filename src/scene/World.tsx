import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { attachKeyboard } from '../input/keyboard'
import { findTarget, type Target } from '../input/interactions'
import { primaryJob } from '../sim/selectors'
import { isPaused, useGame } from '../state/store'
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

const BLOCKED_MS = 1800
const INTERACT_KEYS = ['KeyE', 'Space']

export function World() {
  const player = useRef(new Vector3(PLAYER_START[0], 0, PLAYER_START[1]))
  const [target, setTarget] = useState<Target | null>(null)
  const [blocked, setBlocked] = useState<string | null>(null)
  const targetRef = useRef<Target | null>(null)
  const game = useGame((s) => s.game)
  const setPlotPanel = useGame((s) => s.setPlotPanel)
  const job = target ? primaryJob(game, target) : null

  useEffect(() => {
    let timer: number | undefined
    const detach = attachKeyboard((code) => {
      if (!INTERACT_KEYS.includes(code) || isPaused()) return
      const current = targetRef.current
      if (!current) return
      const { game: now, dispatch } = useGame.getState()
      const action = primaryJob(now, current)?.action
      if (!action) return
      const reason = dispatch(action)
      window.clearTimeout(timer)
      setBlocked(reason)
      if (reason) timer = window.setTimeout(() => setBlocked(null), BLOCKED_MS)
    })
    return () => {
      window.clearTimeout(timer)
      detach()
    }
  }, [])

  useFrame(() => {
    const next = findTarget(player.current.x, player.current.z, TARGETS)
    if (next?.id !== targetRef.current?.id) {
      targetRef.current = next
      setTarget(next)
      setBlocked(null)
      useGame.getState().setStandingPlot(next?.kind === 'plot' ? next.plotId : null)
    }
  })

  return (
    <>
      <color attach="background" args={[PALETTE.sky]} />
      <Lighting focus={player} />
      <CameraRig focus={player} />
      <Island />
      {PLOTS.map((p) => {
        const state = game.plots.find((g) => g.id === p.id)
        return state ? (
          <Plot key={p.id} rect={p.rect} plot={state} onSelect={() => setPlotPanel(p.id)} />
        ) : null
      })}
      {GATES.map((g) => (
        <Gate key={g.id} x={g.x} z={g.z} open={game.gates[g.id]} />
      ))}
      <Longkang />
      <Cottage />
      <Player position={player} />
      <Prompt job={job} blocked={blocked} focus={player} />
    </>
  )
}
