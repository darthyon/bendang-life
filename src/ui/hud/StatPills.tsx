import { t } from '../../i18n'
import { weekOf, weekdayOf } from '../../sim/calendar'
import { RULES } from '../../sim/rules'
import { useGame } from '../../state/store'
import { formatClock, formatRm } from '../format'
import { CalendarIcon, CoinIcon, FishIcon, SackIcon, SeedlingIcon } from '../icons'

/** Top-right: coins, benih, baja, fish, then the day and time (spec §7). */
export function StatPills() {
  const game = useGame((s) => s.game)
  const night = useGame((s) => s.ui.night)
  // During the night scene the clock shows the evening that just ended, not the coming morning.
  const day = night?.step === 'recap' ? night.recap.day : game.day
  const hour = night ? RULES.clock.nightStartHour : game.hour
  const benih = Object.values(game.benih).reduce((a, b) => a + b, 0)
  const fish = Object.values(game.fish).reduce((a, b) => a + b, 0)

  return (
    <div className="pills">
      <div className="panel pill" title={t('hud.coins')}>
        <CoinIcon className="pill__icon pill__icon--coin" />
        <span className="sr-only">{t('hud.coins')}</span>
        <span className="pill__value">RM{formatRm(game.coins)}</span>
      </div>
      <div className="panel pill" title={t('hud.seed_bags')}>
        <SeedlingIcon className="pill__icon pill__icon--leaf" />
        <span className="sr-only">{t('hud.seed_bags')}</span>
        <span className="pill__value">{benih}</span>
      </div>
      <div className="panel pill" title={t('hud.fert_bags')}>
        <SackIcon className="pill__icon pill__icon--sack" />
        <span className="sr-only">{t('hud.fert_bags')}</span>
        <span className="pill__value">{game.baja}</span>
      </div>
      <div className="panel pill" title={t('hud.fish')}>
        <FishIcon className="pill__icon pill__icon--fish" />
        <span className="sr-only">{t('hud.fish')}</span>
        <span className="pill__value">{fish}</span>
      </div>
      <div className="panel pill pill--clock">
        <CalendarIcon className="pill__icon pill__icon--sun" size={24} />
        <span className="pill__lines">
          <span>{t('hud.week_day', { w: weekOf(day), d: day })}</span>
          <span className="pill__sub">
            {t(`hud.weekday_${weekdayOf(day)}`)}, <time>{formatClock(hour)}</time>
          </span>
        </span>
      </div>
    </div>
  )
}
