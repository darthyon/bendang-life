import { Kitab } from '../kitab/Kitab'
import { NightScene } from '../night/NightScene'
import { PlotPanel } from '../panels/PlotPanel'
import { Phone } from '../phone/Phone'
import { LeftRail } from './LeftRail'
import { PlayerCard } from './PlayerCard'
import { StatPills } from './StatPills'
import { TidurButton } from './TidurButton'
import { Toasts } from './Toasts'
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
      <NightScene />
      <WakeFade />
    </div>
  )
}
