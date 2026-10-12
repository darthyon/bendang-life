import { useState } from 'react'
import { t } from '../../i18n'
import { useGame } from '../../state/store'
import { loadSave } from '../../state/persist'
import { SeedlingIcon } from '../icons'

/** Start screen (spec §6 step 1): Mula Main or Sambung, Tetapan, Keluar. */
export function StartScreen() {
  const setScreen = useGame((s) => s.setScreen)
  const setSettings = useGame((s) => s.setSettings)
  const continueGame = useGame((s) => s.continueGame)
  // Re-read after Tetapan closes, in case the save was deleted there.
  useGame((s) => s.settingsOpen)
  const hasSave = loadSave() !== null
  const [confirmNew, setConfirmNew] = useState(false)

  const startNew = () => setScreen('intro')

  return (
    <div className="front front--start">
      <section className="start" aria-labelledby="start-title">
        <SeedlingIcon size={34} className="start__sprout" />
        <h1 id="start-title" className="start__title">
          {t('ui.title')}
        </h1>
        <p className="start__tagline">{t('ui.tagline')}</p>

        {confirmNew ? (
          <div className="start__confirm" role="alertdialog" aria-labelledby="confirm-new">
            <p id="confirm-new">{t('ui.new_game_confirm')}</p>
            <button type="button" className="btn btn--primary" onClick={startNew}>
              {t('ui.new_game_yes')}
            </button>
            <button type="button" className="btn" onClick={() => setConfirmNew(false)}>
              {t('ui.cancel')}
            </button>
          </div>
        ) : (
          <nav className="start__menu">
            {hasSave && (
              <button type="button" className="btn btn--primary" onClick={() => continueGame()}>
                {t('ui.continue')}
              </button>
            )}
            <button
              type="button"
              className={hasSave ? 'btn' : 'btn btn--primary'}
              onClick={() => (hasSave ? setConfirmNew(true) : startNew())}
            >
              {t('ui.start')}
            </button>
            <button type="button" className="btn" onClick={() => setSettings(true)}>
              {t('ui.settings')}
            </button>
            <button type="button" className="btn btn--quiet" onClick={() => setScreen('goodbye')}>
              {t('ui.quit')}
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}
