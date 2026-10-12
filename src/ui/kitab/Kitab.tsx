import { useState } from 'react'
import { t } from '../../i18n'
import { FACTS } from '../../sim/facts'
import { kitabUnlocks } from '../../sim/kitab'
import { useGame } from '../../state/store'
import { BookIcon, CloseIcon } from '../icons'

type Tab = 'notes' | 'unlocks'

/** Tok Wan's notebook (spec §4.10). Opens over the screen and pauses the game. */
export function Kitab() {
  const open = useGame((s) => s.ui.kitabOpen)
  // Mounted only while open, so it always opens on Nota.
  return open ? <Book /> : null
}

function Book() {
  const setKitab = useGame((s) => s.setKitab)
  const game = useGame((s) => s.game)
  const [tab, setTab] = useState<Tab>('notes')

  // Newest first, so a fresh unlock is at the top.
  const notes = [...game.facts]
    .reverse()
    .map((id) => FACTS.find((f) => f.id === id))
    .filter((f) => f !== undefined)
  const unlocks = kitabUnlocks(game)

  return (
    <div className="kitab-layer" onClick={() => setKitab(false)}>
      <section
        className="kitab"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kitab-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="kitab__head">
          <BookIcon size={26} className="kitab__icon" />
          <div>
            <h2 id="kitab-title" className="kitab__title">
              {t('kitab.title')}
            </h2>
            <p className="kitab__subtitle">{t('kitab.subtitle')}</p>
          </div>
          <button
            type="button"
            className="icon-btn kitab__close"
            aria-label={t('ui.close')}
            onClick={() => setKitab(false)}
          >
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="kitab__tabs" role="tablist">
          {(['notes', 'unlocks'] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`kitab__tab${tab === id ? ' is-active' : ''}`}
              onClick={() => setTab(id)}
            >
              {t(id === 'notes' ? 'kitab.tab_notes' : 'kitab.tab_unlocks')}
            </button>
          ))}
        </div>

        <div className="kitab__page" role="tabpanel">
          {tab === 'notes' &&
            (notes.length === 0 ? (
              <p className="kitab__empty">{t('kitab.empty')}</p>
            ) : (
              <ol className="notes">
                {notes.map((fact) => (
                  <li key={fact.id} className="note">
                    <p className="note__text">{t(`facts.${fact.id}`)}</p>
                    <p className="note__meta">
                      {fact.rc.length > 0 && (
                        <span>{t('kitab.rc', { n: fact.rc.join(', ') })}</span>
                      )}
                      <a href={fact.source} target="_blank" rel="noopener noreferrer">
                        {t('kitab.source')}
                      </a>
                    </p>
                  </li>
                ))}
              </ol>
            ))}

          {tab === 'unlocks' && (
            <ul className="unlocks">
              {unlocks.map((u) => {
                const name =
                  u.key === 'live'
                    ? t('kitab.unlock_live')
                    : u.key === 'raya'
                      ? t('kitab.unlock_raya')
                      : t('kitab.unlock_plot', { n: u.key === 'plot_2' ? '2' : '3–4' })
                const hint =
                  'day' in u.hint
                    ? t('kitab.hint_day', { day: u.hint.day })
                    : t('kitab.hint_season', { n: u.hint.season })
                return (
                  <li key={u.key} className={`unlock${u.unlocked ? ' is-open' : ''}`}>
                    <span className="unlock__name">{u.unlocked ? name : t('kitab.locked')}</span>
                    {!u.unlocked && <span className="unlock__hint">{hint}</span>}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
