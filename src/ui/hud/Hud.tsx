import { Fishing } from '../fishing/Fishing'
import { Kitab } from '../kitab/Kitab'
import { NightScene } from '../night/NightScene'
import { PlotPanel } from '../panels/PlotPanel'
import { Phone } from '../phone/Phone'
import { Ending } from '../season/Ending'
import { MomentCard } from '../story/MomentCard'
import { SeasonReport } from '../season/SeasonReport'
import { LeftRail } from './LeftRail'
import { PlayerCard } from './PlayerCard'
import { StatPills } from './StatPills'
import { TidurButton } from './TidurButton'
import { Toasts } from './Toasts'
import { TutorialPanel } from './TutorialPanel'
import { WakeFade } from './WakeFade'

/** The always-on day HUD over the canvas. */
export function Hud() {
  return (
    <div className="hud">
      <div className="hud__left">
        <PlayerCard />
        <LeftRail />
      </div>
      <StatPills />
      <TidurButton />
      <PlotPanel />
      <Toasts />
      <Phone />
      <Kitab />
      <Fishing />
      <NightScene />
      <MomentCard />
      <TutorialPanel />
      <SeasonReport />
      <Ending />
      <WakeFade />
    </div>
  )
}
