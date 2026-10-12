import { t } from '../../i18n'
import { useGame } from '../../state/store'
import { LiveIcon, PhoneIcon } from '../icons'

/** One-off story moments on a morning: the Live intro (day 8) and Raya moving in (day 14). */
export function MomentCard() {
  const moment = useGame((s) => (s.ui.night === null ? s.game.moments[0] : undefined))
  const dispatch = useGame((s) => s.dispatch)
  if (!moment) return null
  const raya = moment === 'raya_arrival'

  return (
    <div className="moment-layer">
      <section
        className="panel moment"
        role="dialog"
        aria-modal="true"
        aria-labelledby="moment-title"
      >
        <span className={`moment__icon${raya ? ' moment__icon--raya' : ''}`} aria-hidden="true">
          {raya ? <PhoneIcon size={30} /> : <LiveIcon size={30} />}
        </span>
        <h2 id="moment-title" className="moment__title">
          {raya ? t('raya.arrive_title') : t('kitab.unlock_live')}
        </h2>
        <p className="moment__body">{raya ? t('raya.arrive_body') : t('story.live_unlock')}</p>
        <button
          type="button"
          className="btn btn--primary"
          autoFocus
          onClick={() => dispatch({ type: 'ACK_MOMENT' })}
        >
          {raya ? t('raya.arrive_ok') : t('ui.next')}
        </button>
      </section>
    </div>
  )
}
