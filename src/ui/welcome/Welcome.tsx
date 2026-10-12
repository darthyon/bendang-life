import { useState } from 'react'
import { t } from '../../i18n'
import { formatRm } from '../format'
import { RULES, VARIETIES, VARIETY_LIST } from '../../sim/rules'
import type { VarietyId } from '../../sim/types'
import { useGame } from '../../state/store'
import { FarmerIcon, SeedlingIcon } from '../icons'

type Step = 'money' | 'seed' | 'tutorial'

/** Tok Wan at the cottage (spec §6 step 4): the money, the notebook, then a starter seed bag. */
export function Welcome() {
  const beginGame = useGame((s) => s.beginGame)
  const [step, setStep] = useState<Step>('money')
  const [starter, setStarter] = useState<VarietyId | null>(null)

  return (
    <div className="welcome-layer">
      {step === 'money' && (
        <Speech onNext={() => setStep('seed')}>
          {t('story.tok_welcome', { coins: formatRm(RULES.economy.startCoins) })}
        </Speech>
      )}

      {step === 'seed' && (
        <section className="starter" aria-labelledby="starter-title">
          <header className="starter__head">
            <h2 id="starter-title" className="starter__title">
              {t('story.starter_title')}
            </h2>
            <p className="starter__body">{t('story.starter_body')}</p>
          </header>
          <div className="starter__cards">
            {VARIETY_LIST.map((id) => (
              <article key={id} className="seed-card">
                <span className="seed-card__icon" aria-hidden="true">
                  <SeedlingIcon size={34} />
                </span>
                <h3 className="seed-card__name">{t(`varieties.${id}.name`)}</h3>
                <p className="seed-card__trait">{t(`varieties.${id}.desc`)}</p>
                <p className="seed-card__fact">{t(`facts.${VARIETIES[id].factId}`)}</p>
                <button
                  type="button"
                  className="btn btn--primary seed-card__pick"
                  onClick={() => {
                    setStarter(id)
                    setStep('tutorial')
                  }}
                >
                  {t('story.starter_pick')}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {step === 'tutorial' && starter && (
        <Speech onNext={() => beginGame(starter)}>{t('story.tok_tutorial')}</Speech>
      )}
    </div>
  )
}

function Speech({ children, onNext }: { children: string; onNext: () => void }) {
  return (
    <section className="panel speech" aria-live="polite">
      <span className="speech__avatar" aria-hidden="true">
        <FarmerIcon size={30} />
      </span>
      <div className="speech__body">
        <p className="speech__name">{t('story.tok')}</p>
        <p className="speech__text">{children}</p>
        <button type="button" className="btn btn--primary speech__next" autoFocus onClick={onNext}>
          {t('ui.next')}
        </button>
      </div>
    </section>
  )
}
