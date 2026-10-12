import { t } from '../../i18n'
import { tutorialDue } from '../../sim/selectors'
import { useGame } from '../../state/store'
import { PhoneIcon } from '../icons'

const CONTROLS: { keys: string[]; label: string; body?: string }[] = [
  { keys: ['W', 'A', 'S', 'D'], label: 'tutorial.move' },
  { keys: ['E'], label: 'tutorial.interact', body: 'tutorial.interact_body' },
  { keys: ['Tab'], label: 'tutorial.panel' },
  { keys: ['F'], label: 'tutorial.phone' },
  { keys: ['Z'], label: 'tutorial.skip' },
]

/** Day-1 controls (ref 06) and the day-2 phone hint (spec §6 step 5). Shown once each. */
export function TutorialPanel() {
  const game = useGame((s) => s.game)
  const night = useGame((s) => s.ui.night)
  const dispatch = useGame((s) => s.dispatch)
  const step = tutorialDue(game)
  if (!step || night || game.moments.length > 0) return null

  if (step === 'phone') {
    return (
      <section className="panel tutorial tutorial--small" aria-labelledby="tut-title">
        <h2 id="tut-title" className="tutorial__title">
          <PhoneIcon size={22} className="tutorial__icon" />
          {t('hud.nav_phone')}
        </h2>
        <p className="tutorial__line">{t('tutorial.phone')}</p>
        <button
          type="button"
          className="btn btn--primary"
          autoFocus
          onClick={() => dispatch({ type: 'ACK_TUTORIAL', step: 'phone' })}
        >
          {t('ui.confirm')}
        </button>
      </section>
    )
  }

  return (
    <section className="panel tutorial" aria-labelledby="tut-title">
      <h2 id="tut-title" className="tutorial__title">
        {t('tutorial.title')}
      </h2>
      <p className="tutorial__body">{t('tutorial.body')}</p>
      <ul className="tutorial__list">
        {CONTROLS.map((c) => (
          <li key={c.label} className="tutorial__row">
            <span className="tutorial__keys">
              {c.keys.map((k) => (
                <kbd key={k} className="key">
                  {k}
                </kbd>
              ))}
            </span>
            <span>
              <span className="tutorial__line">{t(c.label)}</span>
              {c.body && <span className="tutorial__sub">{t(c.body)}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="tutorial__task">{t('tutorial.first_task')}</p>
      <button
        type="button"
        className="btn btn--primary"
        autoFocus
        onClick={() => dispatch({ type: 'ACK_TUTORIAL', step: 'controls' })}
      >
        {t('ui.confirm')}
      </button>
    </section>
  )
}
