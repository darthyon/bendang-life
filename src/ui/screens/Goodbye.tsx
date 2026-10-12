import { t } from '../../i18n'
import { useGame } from '../../state/store'

/** Keluar: a browser game can't close its tab, so it says goodbye instead (owner, M6). */
export function Goodbye() {
  const setScreen = useGame((s) => s.setScreen)
  return (
    <div className="front front--night">
      <section className="goodbye" aria-labelledby="goodbye-title">
        <h2 id="goodbye-title" className="goodbye__title">
          {t('ui.goodbye_title')}
        </h2>
        <p className="goodbye__body">{t('ui.goodbye_body')}</p>
        <button type="button" className="btn btn--primary" onClick={() => setScreen('start')}>
          {t('ui.goodbye_back')}
        </button>
      </section>
    </div>
  )
}
