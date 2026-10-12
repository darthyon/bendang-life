import { useState } from 'react'
import { t } from '../../i18n'
import { RULES, VARIETIES, VARIETY_LIST } from '../../sim/rules'
import type { Action } from '../../sim/types'
import { useGame } from '../../state/store'
import { formatRm } from '../format'
import { BackIcon, BankIcon, CloseIcon, SackIcon, SeedlingIcon, StoreIcon } from '../icons'

type App = 'home' | 'kedai' | 'bank'
const LOAN_STEP = 100

/** Phone (F). Pauses the game while open (spec §4.6). Jual Ikan and Live arrive in M5. */
export function Phone() {
  const open = useGame((s) => s.ui.phoneOpen)
  const setPhone = useGame((s) => s.setPhone)
  const [app, setApp] = useState<App>('home')
  const phoneOffDays = useGame((s) => s.game.phoneOffDays)
  if (!open) return null

  const title =
    app === 'kedai' ? 'phone.app_kedai' : app === 'bank' ? 'phone.app_bank' : 'phone.title'

  return (
    <div className="phone-layer" onClick={() => setPhone(false)}>
      <section
        className="phone"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="phone__notch" aria-hidden="true" />
        <header className="phone__bar">
          {app !== 'home' ? (
            <button
              type="button"
              className="icon-btn"
              aria-label={t('ui.back')}
              onClick={() => setApp('home')}
            >
              <BackIcon size={18} />
            </button>
          ) : (
            <span className="icon-btn icon-btn--ghost" aria-hidden="true" />
          )}
          <h2 id="phone-title" className="phone__title">
            {t(title)}
          </h2>
          <button
            type="button"
            className="icon-btn"
            aria-label={t('ui.close')}
            onClick={() => setPhone(false)}
          >
            <CloseIcon size={18} />
          </button>
        </header>
        <div className="phone__screen">
          {phoneOffDays > 0 ? (
            <p className="phone__dead">{t('phone.no_signal', { n: phoneOffDays })}</p>
          ) : (
            <>
              {app === 'home' && <Home onOpen={setApp} />}
              {app === 'kedai' && <Kedai />}
              {app === 'bank' && <Bank />}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function Home({ onOpen }: { onOpen: (app: App) => void }) {
  return (
    <div className="apps">
      <button type="button" className="app-tile" onClick={() => onOpen('kedai')}>
        <span className="app-tile__icon app-tile__icon--kedai">
          <StoreIcon size={30} />
        </span>
        {t('phone.app_kedai')}
      </button>
      <button type="button" className="app-tile" onClick={() => onOpen('bank')}>
        <span className="app-tile__icon app-tile__icon--bank">
          <BankIcon size={30} />
        </span>
        {t('phone.app_bank')}
      </button>
    </div>
  )
}

function useRun() {
  const dispatch = useGame((s) => s.dispatch)
  const toast = useGame((s) => s.toast)
  return (action: Action): boolean => {
    const reason = dispatch(action)
    if (reason) toast(reason)
    return reason === null
  }
}

function Kedai() {
  const game = useGame((s) => s.game)
  const run = useRun()
  return (
    <div className="shop">
      <h3 className="shop__heading">{t('shop.seeds')}</h3>
      <ul className="shop__list">
        {VARIETY_LIST.map((id) => {
          const v = VARIETIES[id]
          const short = game.coins < v.price
          return (
            <li key={id} className="item">
              <SeedlingIcon size={22} className="item__icon item__icon--leaf" />
              <div className="item__body">
                <span className="item__name">{t(`varieties.${id}.name`)}</span>
                <span className="item__desc">{t(`varieties.${id}.desc`)}</span>
                <span className="item__owned">{t('shop.owned', { n: game.benih[id] })}</span>
              </div>
              <button
                type="button"
                className="buy"
                aria-disabled={short}
                onClick={() => run({ type: 'BUY_BENIH', variety: id })}
              >
                <span className="sr-only">{t('shop.buy')} </span>RM{formatRm(v.price)}
              </button>
            </li>
          )
        })}
      </ul>
      <h3 className="shop__heading">{t('shop.baja_bag')}</h3>
      <ul className="shop__list">
        <li className="item">
          <SackIcon size={22} className="item__icon item__icon--sack" />
          <div className="item__body">
            <span className="item__name">{t('shop.baja_bag')}</span>
            <span className="item__owned">{t('shop.owned', { n: game.baja })}</span>
          </div>
          <button
            type="button"
            className="buy"
            aria-disabled={game.coins < RULES.economy.bajaBagPrice}
            onClick={() => run({ type: 'BUY_BAJA' })}
          >
            <span className="sr-only">{t('shop.buy')} </span>RM
            {formatRm(RULES.economy.bajaBagPrice)}
          </button>
        </li>
      </ul>
    </div>
  )
}

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  label: string
}) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper__btn"
        aria-label="−"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - LOAN_STEP))}
      >
        −
      </button>
      <output className="stepper__value">RM{formatRm(value)}</output>
      <button
        type="button"
        className="stepper__btn"
        aria-label="+"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + LOAN_STEP))}
      >
        +
      </button>
    </div>
  )
}

function Bank() {
  const game = useGame((s) => s.game)
  const toast = useGame((s) => s.toast)
  const run = useRun()
  const room = RULES.loan.maxAmount - game.loan.balance
  const [borrow, setBorrow] = useState(Math.min(500, room))
  const [repay, setRepay] = useState(LOAN_STEP)
  const borrowAmount = Math.min(borrow, room)
  const repayMax = Math.min(game.loan.balance, Math.floor(game.coins / LOAN_STEP) * LOAN_STEP)
  const repayAmount = Math.min(repay, repayMax)

  const repayAll = () => {
    if (run({ type: 'LOAN_REPAY', amount: game.loan.balance })) toast('bank.repaid')
  }

  return (
    <div className="bank">
      <div className="bank__balance">
        <span className="bank__label">
          {t('bank.balance', { amount: formatRm(game.loan.balance) })}
        </span>
      </div>
      <p className="bank__body">{t('bank.body')}</p>

      {room > 0 && (
        <div className="bank__action">
          <Stepper
            value={borrowAmount}
            min={LOAN_STEP}
            max={room}
            onChange={setBorrow}
            label={t('bank.borrow', { amount: '' })}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => run({ type: 'LOAN_TAKE', amount: borrowAmount })}
          >
            {t('bank.borrow', { amount: formatRm(borrowAmount) })}
          </button>
        </div>
      )}

      {game.loan.balance > 0 && (
        <div className="bank__action">
          {repayMax >= LOAN_STEP && (
            <>
              <Stepper
                value={repayAmount}
                min={LOAN_STEP}
                max={repayMax}
                onChange={setRepay}
                label={t('bank.repay', { amount: '' })}
              />
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (
                    run({ type: 'LOAN_REPAY', amount: repayAmount }) &&
                    repayAmount === game.loan.balance
                  ) {
                    toast('bank.repaid')
                  }
                }}
              >
                {t('bank.repay', { amount: formatRm(repayAmount) })}
              </button>
            </>
          )}
          <button type="button" className="btn btn--quiet" onClick={repayAll}>
            {t('bank.repay_all')}
          </button>
        </div>
      )}
    </div>
  )
}
