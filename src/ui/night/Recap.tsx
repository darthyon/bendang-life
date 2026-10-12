import { t } from '../../i18n'
import type { Recap as RecapData } from '../../sim/recap'
import { useGame } from '../../state/store'
import { formatRm } from '../format'
import { DropIcon, MoonIcon } from '../icons'

/** End-of-day recap: what changed overnight and why, money today, what's due tomorrow. */
export function Recap({ recap }: { recap: RecapData }) {
  const wake = useGame((s) => s.wake)
  const quiet = recap.plots.length === 0

  return (
    <section className="panel recap" aria-labelledby="recap-title">
      <h2 id="recap-title" className="recap__title">
        <MoonIcon size={22} className="recap__moon" />
        {t('night.recap_title')}
      </h2>

      {quiet && <p className="recap__quiet">{t('night.quiet')}</p>}

      {recap.plots.map((p) => {
        const lost = p.healthTo < p.healthFrom
        return (
          <div key={p.plotId} className="recap__plot">
            <h3 className="recap__plot-title">{t('plot_panel.title', { n: p.plotId })}</h3>
            <p className="recap__line">
              <DropIcon size={16} className="recap__icon" />
              {t('night.recap_water', { from: p.waterFrom, to: p.waterTo })}
              {p.gateId && (
                <span className="recap__muted">
                  {' · '}
                  {t(p.gateOpen ? 'night.recap_gate_open' : 'night.recap_gate_closed', {
                    gate: p.gateId,
                  })}
                </span>
              )}
            </p>
            <p className={`recap__line${lost ? ' is-loss' : ''}`}>
              {t('night.recap_health', { from: p.healthFrom, to: p.healthTo })}
              {lost && p.causes.length > 0 && (
                <span className="recap__muted">
                  {' · '}
                  {p.causes.map((c) => t(`night.cause_${c}`)).join(', ')}
                </span>
              )}
            </p>
            {p.newWeeds > 0 && (
              <p className="recap__line is-warn">{t('night.recap_new_weeds', { n: p.newWeeds })}</p>
            )}
            {p.newSnails > 0 && (
              <p className="recap__line is-warn">
                {t('night.recap_new_snails', { n: p.newSnails })}
              </p>
            )}
          </div>
        )
      })}

      <p className="recap__money">
        {t('night.recap_money', {
          earned: formatRm(recap.money.earned),
          spent: formatRm(recap.money.spent),
        })}
      </p>

      <div className="recap__tomorrow">
        <h3 className="recap__plot-title">{t('night.recap_tomorrow')}</h3>
        {recap.tomorrow.length === 0 ? (
          <p className="recap__muted">{t('night.recap_nothing_due')}</p>
        ) : (
          <ul className="recap__list">
            {recap.tomorrow.map((task) => (
              <li key={`${task.id}-${task.plotId ?? ''}`}>{t(`tasks.${task.id}`, task.params)}</li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className="btn btn--primary recap__wake" onClick={wake} autoFocus>
        {t('night.wake')}
      </button>
    </section>
  )
}
