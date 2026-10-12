import { t } from '../../i18n'
import { weekOf, weekdayOf } from '../../sim/calendar'
import { useGame } from '../../state/store'
import { formatClock, formatRm } from '../format'
import { CalendarIcon, CoinIcon, SackIcon, SeedlingIcon } from '../icons'

/** Top-right: coins, benih, baja, then the day and time (spec §7). Fish arrives in M5. */
export function StatPills() {
  const game = useGame((s) => s.game)
  const benih = Object.values(game.benih).reduce((a, b) => a + b, 0)

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
      <div className="panel pill pill--clock">
        <CalendarIcon className="pill__icon pill__icon--sun" size={24} />
        <span className="pill__lines">
          <span>{t('hud.week_day', { w: weekOf(game.day), d: game.day })}</span>
          <span className="pill__sub">
            {t(`hud.weekday_${weekdayOf(game.day)}`)}, <time>{formatClock(game.hour)}</time>
          </span>
        </span>
      </div>
    </div>
  )
}
