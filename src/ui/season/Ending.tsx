import { t } from '../../i18n'
import { useGame } from '../../state/store'
import { formatRm } from '../format'

/** Balik KL: the ending card. Credits and the Ko-fi link arrive in M8. */
export function Ending() {
  const ending = useGame((s) => s.game.ending)
  const phase = useGame((s) => s.game.phase)
  if (phase !== 'ended' || !ending) return null
  return (
    <div className="season-layer season-layer--ending">
      <section className="ending" role="dialog" aria-modal="true" aria-labelledby="ending-title">
        <h2 id="ending-title" className="ending__title">
          {t('ui.title')}
        </h2>
        <p className="ending__body">
          {t('story.ending_leave', { kg: formatRm(ending.kg), facts: ending.facts })}
        </p>
        <p className="ending__thanks">{t('story.ending_thanks')}</p>
      </section>
    </div>
  )
}
