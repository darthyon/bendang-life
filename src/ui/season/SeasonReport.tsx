import { t } from '../../i18n'
import { buildReport } from '../../sim/season'
import { plotsOpenInSeason } from '../../sim/state'
import { useGame } from '../../state/store'
import { formatRm } from '../format'
import { CheckIcon, CloseIcon, FarmerIcon } from '../icons'

/** Tok Wan reads the season report at the cottage door, then you choose (spec §4.10). */
export function SeasonReport() {
  const game = useGame((s) => s.game)
  const stay = useGame((s) => s.stay)
  const leave = useGame((s) => s.leave)
  if (game.phase !== 'report') return null

  const report = buildReport(game)
  const nextPlots = plotsOpenInSeason(game.season + 1).filter(
    (id) => !plotsOpenInSeason(game.season).includes(id),
  )

  return (
    <div className="season-layer">
      <section
        className="panel report"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
      >
        <header className="report__tok">
          <span className="report__avatar" aria-hidden="true">
            <FarmerIcon size={28} />
          </span>
          <div>
            <p className="report__speaker">{t('story.tok')}</p>
            <p className="report__quote">{t(`story.verdict_${report.verdict}`)}</p>
          </div>
        </header>

        <h2 id="report-title" className="report__title">
          {t('report.title')}
        </h2>
        <p className="report__yield">{t('report.yield', { kg: formatRm(report.kg) })}</p>

        <dl className="ledger">
          <div className="ledger__row">
            <dt>{t('report.gross')}</dt>
            <dd>RM{formatRm(report.saleRm)}</dd>
          </div>
          <div className="ledger__row">
            <dt>{t('report.potongan')}</dt>
            <dd className="is-minus">−RM{formatRm(report.potonganRm)}</dd>
          </div>
          <div className="ledger__row">
            <dt>{t('report.subsidy')}</dt>
            <dd>+RM{formatRm(report.subsidyRm)}</dd>
          </div>
          <div className="ledger__row">
            <dt>{t('report.costs')}</dt>
            <dd className="is-minus">−RM{formatRm(report.costs)}</dd>
          </div>
          <div
            className={`ledger__row ledger__row--total${report.verdict === 'rugi' ? ' is-loss' : ''}`}
          >
            {/* Neutral label with a signed amount, so it never contradicts Tok's verdict. */}
            <dt>{t('report.net')}</dt>
            <dd>
              {report.net < 0 ? '−' : ''}RM{formatRm(Math.abs(report.net))}
            </dd>
          </div>
          {report.loanRepaidRm > 0 && (
            <div className="ledger__row ledger__row--note">
              <dt>{t('report.loan')}</dt>
              <dd>RM{formatRm(report.loanRepaidRm)}</dd>
            </div>
          )}
        </dl>

        <div className="report__lists">
          <div>
            <h3 className="report__heading">{t('report.did_well')}</h3>
            <ul className="report__list">
              {report.good.length === 0 && <li className="is-empty">{t('report.nothing_yet')}</li>}
              {report.good.map((line) => (
                <li key={line.key} className="is-good">
                  <CheckIcon size={16} />
                  {t(`report.${line.key}`, line.params)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="report__heading">{t('report.missed')}</h3>
            <ul className="report__list">
              {report.missed.length === 0 && (
                <li className="is-empty">{t('report.nothing_yet')}</li>
              )}
              {report.missed.map((line) => (
                <li key={line.key} className="is-missed">
                  <CloseIcon size={16} />
                  {t(`report.${line.key}`, line.params)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {report.newFacts.length > 0 && (
          <div>
            <h3 className="report__heading">{t('report.facts_learned')}</h3>
            <ul className="report__facts">
              {report.newFacts.map((id) => (
                <li key={id}>{t(`facts.${id}`)}</li>
              ))}
            </ul>
          </div>
        )}

        <footer className="report__choice">
          {nextPlots.length > 0 && (
            <p className="report__quote">
              {t('story.plot_next_season', { n: nextPlots.join(', ') })}
            </p>
          )}
          <h3 className="report__heading">{t('story.choice_title')}</h3>
          <div className="report__buttons">
            <button type="button" className="btn btn--primary" onClick={stay}>
              {t('story.choice_stay')}
            </button>
            <button type="button" className="btn" onClick={leave}>
              {t('story.choice_leave')}
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
