import { useGame } from '../../state/store'

/** A short dusk-to-morning fade each time a new day starts. The night scene arrives in M4. */
export function WakeFade() {
  const morning = useGame((s) => s.ui.morning)
  if (morning === 0) return null
  return <div key={morning} className="wake-fade" aria-hidden="true" />
}
