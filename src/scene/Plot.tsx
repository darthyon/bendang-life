import { useMemo } from 'react'
import { Color } from 'three'
import type { Rect } from '../input/interactions'
import { RULES } from '../sim/rules'
import type { Plot as PlotState } from '../sim/types'
import { PALETTE } from './palette'

const STATUS_COLOUR: Record<PlotState['status'], string> = {
  locked: PALETTE.lockedSoil,
  empty: PALETTE.mud,
  ploughed: PALETTE.ploughed,
  planted: PALETTE.planted,
  harvested: PALETTE.stubble,
}

/** One sawah plot. Grey-box: colour shows status, a blue tint shows water depth. */
export function Plot({ rect, plot }: { rect: Rect; plot: PlotState }) {
  const w = rect.maxX - rect.minX
  const d = rect.maxZ - rect.minZ
  const colour = useMemo(() => {
    const c = new Color(STATUS_COLOUR[plot.status])
    return c.lerp(new Color(PALETTE.water), Math.min(1, plot.waterCm / RULES.water.capCm) * 0.7)
  }, [plot.status, plot.waterCm])

  return (
    <mesh position={[(rect.minX + rect.maxX) / 2, 0.04, (rect.minZ + rect.maxZ) / 2]} receiveShadow>
      <boxGeometry args={[w, 0.06, d]} />
      <meshStandardMaterial color={colour} flatShading />
    </mesh>
  )
}
