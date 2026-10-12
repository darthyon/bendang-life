import { useGame } from '../../state/store'
import { NightCard } from './NightCard'
import { Recap } from './Recap'

/** The night between two days: tonight's card first, then the recap (spec §4.2, §4.7). */
export function NightScene() {
  const night = useGame((s) => s.ui.night)
  if (!night) return null
  return (
    <div className="night" role="dialog" aria-modal="true">
      {night.step === 'card' ? <NightCard /> : <Recap recap={night.recap} />}
    </div>
  )
}
