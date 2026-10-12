import { useState, type ComponentType } from 'react'
import { t } from '../../i18n'
import { cardOptions, DECLINE, findCard, RAYA_GUARD } from '../../sim/events'
import { liveUnlocked } from '../../sim/live'
import { useGame } from '../../state/store'
import {
  BookIcon,
  DropIcon,
  PeopleIcon,
  PhoneIcon,
  RainIcon,
  RatIcon,
  SackIcon,
  SnailIcon,
  SunIcon,
  WeedIcon,
} from '../icons'
import { describeCost, describeEffect } from './effects'

// The art window shows the card's category icon until the M7 illustrations.
const ART: Record<string, ComponentType<{ size?: number }>> = {
  hujan_lebat: RainIcon,
  panas_terik: SunIcon,
  serangan_siput: SnailIcon,
  tikus_malam: RatIcon,
  padi_angin: WeedIcon,
  fon_jatuh: PhoneIcon,
  ceramah_ppkk: SackIcon,
  kenduri_sebelah: PeopleIcon,
  pasar_malam: PeopleIcon,
  kucing_oren: DropIcon,
}

/** Tonight's card (spec §4.7): Bala with responses, or Rezeki with take or decline. */
export function NightCard() {
  const cardId = useGame((s) => s.game.pendingCard)
  const choose = useGame((s) => s.chooseCard)
  const game = useGame((s) => s.game)
  const [refused, setRefused] = useState<{ option: string; reason: string } | null>(null)
  const card = findCard(cardId)
  if (!card) return null
  const Art = ART[card.id] ?? BookIcon
  const bala = card.kind === 'bala'

  const pick = (optionId: string) => {
    const reason = choose(optionId)
    setRefused(reason ? { option: optionId, reason } : null)
  }

  return (
    <article className={`card card--${card.kind}`} aria-labelledby="card-title">
      <header className="card__head">
        <h2 id="card-title" className="card__title">
          {t(`events.${card.id}.title`)}
        </h2>
        <p className="card__real">{t(`events.${card.id}.real`)}</p>
      </header>
      <div className="card__art">
        <Art size={64} />
        <span className="card__kind">{t(bala ? 'night.bala' : 'night.rezeki')}</span>
      </div>
      <p className="card__body">{t(`events.${card.id}.body`)}</p>
      <p className="card__ask">{t(bala ? 'night.bala_body' : 'night.rezeki_body')}</p>
      <div className="card__options">
        {cardOptions(game, card).map((option) => {
          const costs = describeCost(option)
          const effects = option.effects.flatMap((e) => describeEffect(e, liveUnlocked(game)))
          return (
            <button
              key={option.id}
              type="button"
              className="card__option"
              onClick={() => pick(option.id)}
            >
              <span className="card__option-name">
                {option.id === RAYA_GUARD ? t('raya.guard') : t(`events.${card.id}.${option.id}`)}
              </span>
              <span className="card__option-meta">
                {costs.length === 0 && (
                  <span className="tag tag--free">{t('night.cost_free')}</span>
                )}
                {costs.map((c) => (
                  <span key={c} className="tag tag--cost">
                    {c}
                  </span>
                ))}
                {effects.map((e) => (
                  <span key={e} className="tag">
                    {e}
                  </span>
                ))}
              </span>
              {refused?.option === option.id && (
                <span className="card__refused" role="alert">
                  {t(refused.reason)}
                </span>
              )}
            </button>
          )
        })}
        {!bala && (
          <button
            type="button"
            className="btn btn--quiet card__decline"
            onClick={() => pick(DECLINE)}
          >
            {t('night.decline_all')}
          </button>
        )}
      </div>
    </article>
  )
}
