import { useState } from 'react'
import { t } from '../../i18n'
import { introSeen, markIntroSeen } from '../../state/persist'
import { useGame } from '../../state/store'

const CARDS = ['story.intro_1', 'story.intro_2', 'story.intro_3']

/** The three intro cards (spec §6 step 2). Langkau shows only after the first play. */
export function Intro() {
  const setScreen = useGame((s) => s.setScreen)
  const [index, setIndex] = useState(0)
  const [canSkip] = useState(introSeen)
  const done = () => {
    markIntroSeen()
    setScreen('onboarding')
  }
  const last = index === CARDS.length - 1

  return (
    <div className="front front--night">
      <section className="intro" aria-live="polite">
        <p key={index} className="intro__text">
          {t(CARDS[index] ?? '')}
        </p>
        <div className="intro__dots" aria-hidden="true">
          {CARDS.map((key, i) => (
            <span key={key} className={`intro__dot${i === index ? ' is-on' : ''}`} />
          ))}
        </div>
        <div className="intro__actions">
          {canSkip && (
            <button type="button" className="btn btn--quiet" onClick={done}>
              {t('story.skip_intro')}
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary"
            autoFocus
            onClick={() => (last ? done() : setIndex(index + 1))}
          >
            {t('ui.next')}
          </button>
        </div>
      </section>
    </div>
  )
}
