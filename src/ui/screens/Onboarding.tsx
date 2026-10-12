import { useState } from 'react'
import { t } from '../../i18n'
import { NAME_MAX, normalizeName, PRESETS } from '../../sim/state'
import type { PresetId } from '../../sim/types'
import { useGame } from '../../state/store'
import { Avatar } from '../Avatar'

const TOTAL = 3

/** Onboarding, 3 steps (spec §6 step 3): character, name, ready. Look from ref 03. */
export function Onboarding() {
  const setScreen = useGame((s) => s.setScreen)
  const setProfile = useGame((s) => s.setProfile)
  const profile = useGame((s) => s.profile)
  const [step, setStep] = useState(1)
  const [preset, setPreset] = useState<PresetId>(profile.preset)
  const [name, setName] = useState(profile.name)
  const cleanName = normalizeName(name)
  const shownName = cleanName || t('hud.player_placeholder')

  const back = () => (step === 1 ? setScreen('start') : setStep(step - 1))
  const next = () => {
    if (step < TOTAL) return setStep(step + 1)
    setProfile({ name: cleanName, preset })
    setScreen('welcome')
  }

  return (
    <div className="front front--paper">
      <section className="onboard" aria-labelledby="onboard-title">
        <p className="onboard__step">{t('onboarding.step', { n: step, total: TOTAL })}</p>
        <div className="onboard__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${step / TOTAL})` }} />
        </div>

        {step === 1 && (
          <>
            <h2 id="onboard-title" className="onboard__title">
              {t('onboarding.pick_character')}
            </h2>
            <div className="presets" role="radiogroup" aria-labelledby="onboard-title">
              {PRESETS.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={preset === id}
                  className={`preset${preset === id ? ' is-picked' : ''}`}
                  onClick={() => setPreset(id)}
                >
                  <Avatar preset={id} size={88} />
                  <span className="preset__name">{t(`onboarding.preset_${id}`)}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <form
            className="onboard__form"
            onSubmit={(e) => {
              e.preventDefault()
              next()
            }}
          >
            <h2 id="onboard-title" className="onboard__title">
              <label htmlFor="player-name">{t('onboarding.enter_name')}</label>
            </h2>
            <p className="onboard__hint">{t('onboarding.enter_name_hint')}</p>
            <input
              id="player-name"
              className="onboard__input"
              value={name}
              maxLength={NAME_MAX + 8}
              autoComplete="off"
              autoFocus
              placeholder={t('hud.player_placeholder')}
              onChange={(e) => setName(e.target.value)}
            />
          </form>
        )}

        {step === 3 && (
          <>
            <h2 id="onboard-title" className="onboard__title">
              {t('onboarding.ready')}
            </h2>
            <div className="onboard__summary">
              <Avatar preset={preset} size={120} />
              <dl className="onboard__facts">
                <div>
                  <dt>{t('onboarding.summary_character')}</dt>
                  <dd>{t(`onboarding.preset_${preset}`)}</dd>
                </div>
                <div>
                  <dt>{t('onboarding.summary_name')}</dt>
                  <dd>{shownName}</dd>
                </div>
              </dl>
            </div>
          </>
        )}

        <div className="onboard__actions">
          <button type="button" className="btn btn--paper" onClick={back}>
            {t('ui.back')}
          </button>
          <button type="button" className="btn btn--forest" onClick={next}>
            {step === TOTAL ? t('ui.start') : t('ui.next')}
          </button>
        </div>
      </section>
    </div>
  )
}
