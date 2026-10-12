import { Html } from '@react-three/drei'
import { plotProblems, type Problem } from '../sim/selectors'
import { useGame } from '../state/store'
import { DropIcon, SackIcon, SickleIcon, SnailIcon, WeedIcon } from '../ui/icons'
import { PLOTS } from './layout'

const ICON: Record<Problem, (props: { size: number }) => React.JSX.Element> = {
  ripe: SickleIcon,
  snails: SnailIcon,
  weeds: WeedIcon,
  water_low: DropIcon,
  water_high: DropIcon,
  baja: SackIcon,
}

/** One small icon floating over each plot that needs attention (spec §4.5). No panel opens by itself. */
export function ProblemIcons() {
  const game = useGame((s) => s.game)
  return (
    <>
      {PLOTS.map((p) => {
        const top = plotProblems(game, p.id)[0]
        if (!top) return null
        const Icon = ICON[top]
        return (
          <Html
            key={p.id}
            position={[(p.rect.minX + p.rect.maxX) / 2, 1.6, (p.rect.minZ + p.rect.maxZ) / 2]}
            center
            zIndexRange={[5, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <span className={`problem problem--${top}`} aria-hidden="true">
              <Icon size={20} />
            </span>
          </Html>
        )
      })}
    </>
  )
}
