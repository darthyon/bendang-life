import { useState } from 'react'
import { t } from '../../i18n'
import { fishSaleValue } from '../../sim/fishing'
import { liveUnlocked } from '../../sim/live'
import { FISH_LIST, RULES, VARIETIES, VARIETY_LIST } from '../../sim/rules'
import type { Action } from '../../sim/types'
import { useGame } from '../../state/store'
import { formatRm } from '../format'
import {
  BackIcon,
  BankIcon,
  CloseIcon,
  FishIcon,
  LiveIcon,
  SackIcon,
  SeedlingIcon,
  StoreIcon,
} from '../icons'

type App = 'home' | 'kedai' | 'bank' | 'jual' | 'live'
const LOAN_STEP = 100

/** Phone (F). Pauses the game while open (spec §4.6). */
const TITLES: Record<App, string> = {
  home: 'phone.title',
  kedai: 'phone.app_kedai',
  bank: 'phone.app_bank',
  jual: 'phone.app_jual',
  live: 'phone.app_live',
}

export function Phone() {
  const open = useGame((s) => s.ui.phoneOpen)
  // Mounted only while open, so the phone always opens on its home screen.
  return open ? <PhoneBody /> : null
}

function PhoneBody() {
  const setPhone = useGame((s) => s.setPhone)
  const [app, setApp] = useState<App>('home')
  const phoneOffDays = useGame((s) => s.game.phoneOffDays)
  const title = TITLES[app]

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
              {app === 'jual' && <JualIkan />}
              {app === 'live' && <Live />}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function Home({ onOpen }: { onOpen: (app: App) => void }) {
  const game = useGame((s) => s.game)
  const liveOpen = liveUnlocked(game)
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
      <button type="button" className="app-tile" onClick={() => onOpen('jual')}>
        <span className="app-tile__icon app-tile__icon--jual">
          <FishIcon size={30} />
        </span>
        {t('phone.app_jual')}
      </button>
      <button
        type="button"
        className="app-tile"
        aria-disabled={!liveOpen}
        onClick={() => liveOpen && onOpen('live')}
      >
        <span className={`app-tile__icon app-tile__icon--live${liveOpen ? '' : ' is-locked'}`}>
          <LiveIcon size={30} />
        </span>
        {t('phone.app_live')}
        {!liveOpen && (
          <span className="app-tile__note">
            {t('live.locked', { day: RULES.unlocks.live.day })}
          </span>
        )}
      </button>
    </div>
  )
}

function JualIkan() {
  const game = useGame((s) => s.game)
  const toast = useGame((s) => s.toast)
  const run = useRun()
  const total = fishSaleValue(game)
  const owned = FISH_LIST.filter((id) => game.fish[id] > 0)

  return (
    <div className="shop">
      {game.fishPriceToday !== 1 && (
        <p className="shop__boost">{t('phone.price_today', { n: game.fishPriceToday })}</p>
      )}
      {owned.length === 0 ? (
        <p className="shop__empty">{t('phone.no_fish')}</p>
      ) : (
        <>
          <ul className="shop__list">
            {owned.map((id) => (
              <li key={id} className="item">
                <FishIcon size={22} className="item__icon item__icon--fish" />
                <div className="item__body">
                  <span className="item__name">{t(`fishing.${id}`)}</span>
                  <span className="item__owned">{t('shop.owned', { n: game.fish[id] })}</span>
                </div>
                <span className="item__price">
                  RM{formatRm(RULES.fishing.fish[id].price * game.fishPriceToday)}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn--primary shop__sell"
            onClick={() => {
              if (run({ type: 'SELL_FISH' })) toast('phone.fish_sold', { n: formatRm(total) })
            }}
          >
            {t('phone.sell_all')} · {t('fishing.sell', { n: formatRm(total) })}
          </button>
        </>
      )}
    </div>
  )
}

const BONUS_LABEL = {
  farm_job: 'live.bonus_farm_job',
  fish: 'live.bonus_fish',
  harvest: 'live.bonus_harvest',
} as const

function Live() {
  const game = useGame((s) => s.game)
  const toast = useGame((s) => s.toast)
  const run = useRun()
  const done = game.today.wentLive

  return (
    <div className="live">
      <p className="live__followers">{t('live.followers', { n: formatRm(game.followers) })}</p>
      {done && game.lastLive ? (
        <div className="live__result">
          <p>
            {t('live.result', {
              viewers: formatRm(game.lastLive.viewers),
              coins: game.lastLive.coins,
            })}
          </p>
          {game.lastLive.bonuses.length > 0 && (
            <ul className="live__bonuses">
              {game.lastLive.bonuses.map((b) => (
                <li key={b}>{t(BONUS_LABEL[b])}</li>
              ))}
            </ul>
          )}
          <p className="live__done">{t('live.done_today')}</p>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn--primary live__start"
          onClick={() => {
            if (!run({ type: 'GO_LIVE' })) return
            const result = useGame.getState().game.lastLive
            if (result)
              toast('live.result', { viewers: formatRm(result.viewers), coins: result.coins })
          }}
        >
          <LiveIcon size={20} />
          {t('live.start')}
        </button>
      )}
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
