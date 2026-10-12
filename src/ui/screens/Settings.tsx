import { useState } from 'react'
import { t, type Locale } from '../../i18n'
import { useGame } from '../../state/store'
import { CloseIcon } from '../icons'

const LOCALES: { id: Locale; key: string }[] = [
  { id: 'kdh', key: 'ui.lang_kdh' },
  { id: 'en', key: 'ui.lang_en' },
]

/** Tetapan (owner, M6): language, back to the start screen (in game), delete save. */
export function Settings() {
  const open = useGame((s) => s.settingsOpen)
  return open ? <SettingsPanel /> : null
}

function SettingsPanel() {
  const screen = useGame((s) => s.screen)
  const locale = useGame((s) => s.locale)
  const setLocale = useGame((s) => s.setLocale)
  const setSettings = useGame((s) => s.setSettings)
  const setScreen = useGame((s) => s.setScreen)
  const saveNow = useGame((s) => s.saveNow)
  const deleteSave = useGame((s) => s.deleteSave)
  const toast = useGame((s) => s.toast)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inGame = screen === 'game'

  return (
    <div className="settings-layer" onClick={() => setSettings(false)}>
      <section
        className="panel settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings__head">
          <h2 id="settings-title" className="settings__title">
            {t('settings.title')}
          </h2>
          <button
            type="button"
            className="icon-btn"
            aria-label={t('ui.close')}
            onClick={() => setSettings(false)}
          >
            <CloseIcon size={18} />
          </button>
        </header>

        <fieldset className="settings__group">
          <legend>{t('ui.language')}</legend>
          <div className="segmented">
            {LOCALES.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={locale === l.id}
                className={`segmented__item${locale === l.id ? ' is-on' : ''}`}
                onClick={() => setLocale(l.id)}
              >
                {t(l.key)}
              </button>
            ))}
          </div>
        </fieldset>

        {inGame && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              saveNow()
              setScreen('start')
            }}
          >
            {t('settings.to_start')}
          </button>
        )}

        {confirmDelete ? (
          <div className="settings__confirm" role="alertdialog" aria-labelledby="delete-q">
            <p id="delete-q">{t('settings.delete_confirm')}</p>
            <div className="settings__row">
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  deleteSave()
                  toast('settings.deleted')
                  setConfirmDelete(false)
                  if (inGame) setScreen('start')
                }}
              >
                {t('settings.delete_yes')}
              </button>
              <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>
                {t('ui.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn--quiet" onClick={() => setConfirmDelete(true)}>
            {t('settings.delete')}
          </button>
        )}
      </section>
    </div>
  )
}
