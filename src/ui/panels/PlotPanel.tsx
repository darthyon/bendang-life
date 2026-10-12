import { t } from '../../i18n'
import { canApply } from '../../sim/actions'
import { bajaStageDue, stageForDay, waterTarget } from '../../sim/calendar'
import { waterForecast } from '../../sim/day'
import { RULES } from '../../sim/rules'
import { primaryJob } from '../../sim/selectors'
import type { Action, JobId } from '../../sim/types'
import { useGame } from '../../state/store'
import { CloseIcon, DropIcon, SackIcon, SnailIcon, WeedIcon } from '../icons'

const JOBS: { job: JobId; action: (plotId: number) => Action }[] = [
  { job: 'bajak', action: (plotId) => ({ type: 'BAJAK', plotId }) },
  {
    job: 'tanam',
    action: (plotId) => ({ type: 'TANAM', plotId, variety: 'mr297' }),
  },
  { job: 'baja', action: (plotId) => ({ type: 'BAJA', plotId }) },
  { job: 'siput', action: (plotId) => ({ type: 'SIPUT', plotId }) },
  { job: 'rumpai', action: (plotId) => ({ type: 'RUMPAI', plotId }) },
  { job: 'tuai', action: (plotId) => ({ type: 'TUAI', plotId }) },
]

const JOB_LABEL: Record<JobId, string> = {
  bajak: 'actions.bajak',
  tanam: 'actions.tanam',
  pintu_air: 'actions.gate_open',
  baja: 'actions.baja',
  siput: 'actions.siput',
  rumpai: 'actions.rumpai',
  tuai: 'actions.tuai',
}

function openingSeason(plotId: number): number | null {
  return RULES.plotsBySeason.find((e) => e.plots.includes(plotId))?.season ?? null
}

function Meter({ value, max, tone }: { value: number; max: number; tone: string }) {
  return (
    <span className="meter" aria-hidden="true">
      <span
        className={`meter__fill meter__fill--${tone}`}
        style={{ transform: `scaleX(${Math.max(0, Math.min(1, value / max))})` }}
      />
    </span>
  )
}

/** Plot details on demand (Tab or click), spec §7. Information only: jobs are done with E. */
export function PlotPanel() {
  const plotId = useGame((s) => s.ui.plotPanelId)
  const game = useGame((s) => s.game)
  const close = useGame((s) => s.setPlotPanel)
  const plot = game.plots.find((p) => p.id === plotId)
  if (!plot) return null

  const band = waterTarget(game.day)
  const planted = plot.status === 'planted'
  const nextJob = primaryJob(game, { kind: 'plot', plotId: plot.id })
  const bajaDone = plot.bajaDone.filter(Boolean).length
  const dueStage = bajaStageDue(game.day)
  const nextBajaDay = RULES.fertiliser.stageDays.find(
    (day, i) => !plot.bajaDone[i] && day + RULES.fertiliser.windowDays > game.day,
  )
  const forecast = waterForecast(game, plot.id)
  const waterState =
    plot.waterCm < band.min ? 'water_low' : plot.waterCm > band.max ? 'water_high' : 'water_ok'

  // Jobs that make sense here now (allowed, or blocked only by time, money or bags).
  const jobs = JOBS.map(({ job, action }) => {
    const a = action(plot.id)
    if (a.type === 'TANAM' && nextJob?.action?.type === 'TANAM') {
      return { job, action: nextJob.action, reason: nextJob.reason }
    }
    return { job, action: a, reason: canApply(game, a) }
  }).filter(
    (j) =>
      j.reason !== 'reasons.not_now' &&
      j.reason !== 'reasons.not_ripe' &&
      j.reason !== 'stages.locked',
  )

  const status = planted
    ? t('plot_panel.stage_day', { stage: t(`stages.${stageForDay(game.day)}`), day: game.day })
    : t(`stages.${plot.status}`)

  return (
    <aside className="panel plot-panel" aria-labelledby="plot-panel-title">
      <header className="plot-panel__head">
        <div>
          <h2 id="plot-panel-title" className="plot-panel__title">
            {t('plot_panel.title', { n: plot.id })}
          </h2>
          <span className={`chip chip--${plot.status}`}>{status}</span>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={t('ui.close')}
          onClick={() => close(null)}
        >
          <CloseIcon size={18} />
          <kbd className="key key--small">Tab</kbd>
        </button>
      </header>

      {plot.status === 'locked' && (
        <p className="plot-panel__note">
          {t('plot_panel.locked', { n: openingSeason(plot.id) ?? '' })}
        </p>
      )}
      {(plot.status === 'empty' || plot.status === 'ploughed') && (
        <p className="plot-panel__note">{t('plot_panel.empty')}</p>
      )}

      {(planted || plot.status === 'harvested') && plot.variety && (
        <dl className="facts">
          <div className="facts__row">
            <dt>{t('plot_panel.variety')}</dt>
            <dd>{t(`varieties.${plot.variety}.name`)}</dd>
          </div>
        </dl>
      )}

      {planted && (
        <>
          <div className="stat">
            <div className="stat__head">
              <DropIcon size={18} className="stat__icon stat__icon--water" />
              <span>{t('plot_panel.water')}</span>
              <span className={`stat__value stat__value--${waterState}`}>
                {plot.waterCm} cm · {t(`plot_panel.${waterState}`)}
              </span>
            </div>
            <Meter value={plot.waterCm} max={RULES.water.capCm} tone="water" />
            <span className="stat__note">
              {t('plot_panel.water_target', { min: band.min, max: band.max })}
            </span>
            {forecast && (
              <span className={`stat__note stat__note--gate${forecast.open ? ' is-open' : ''}`}>
                {t(forecast.open ? 'plot_panel.gate_open' : 'plot_panel.gate_closed', {
                  gate: forecast.gateId,
                  cm: forecast.nextCm,
                })}
              </span>
            )}
          </div>

          <div className="stat">
            <div className="stat__head">
              <SackIcon size={18} className="stat__icon stat__icon--sack" />
              <span>{t('plot_panel.fert')}</span>
              <span className="stat__value">
                {t('plot_panel.fert_progress', { done: bajaDone })}
              </span>
            </div>
            {nextBajaDay !== undefined && (
              <span className={`stat__note${dueStage !== null ? ' is-due' : ''}`}>
                {t('plot_panel.fert_next', { day: Math.max(nextBajaDay, game.day) })}
              </span>
            )}
          </div>

          <div className="stat">
            <div className="stat__head">
              <span>{t('plot_panel.health')}</span>
              <span className="stat__value">{plot.health}</span>
            </div>
            <Meter
              value={plot.health}
              max={RULES.health.max}
              tone={plot.health < 50 ? 'danger' : 'leaf'}
            />
          </div>

          <div className="pests">
            <span className="pests__item">
              <WeedIcon size={18} className="stat__icon" />
              {t('plot_panel.weeds')}: {plot.weeds || t('plot_panel.none')}
            </span>
            <span className="pests__item">
              <SnailIcon size={18} className="stat__icon" />
              {t('plot_panel.snails')}: {plot.snails || t('plot_panel.none')}
            </span>
          </div>
        </>
      )}

      {jobs.length > 0 && (
        <ul className="jobs" aria-label={t('hud.tasks_today')}>
          {jobs.map(({ job, action, reason }) => {
            const isNext = nextJob?.action?.type === action.type
            return (
              <li key={job} className={`jobs__item${isNext ? ' is-next' : ''}`}>
                {isNext && <kbd className="key key--small">E</kbd>}
                <span className="jobs__name">{t(JOB_LABEL[job])}</span>
                <span className="jobs__hours">
                  {t('plot_panel.hours', { h: RULES.jobHours[job] })}
                </span>
                {reason && <span className="jobs__reason">{t(reason)}</span>}
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
