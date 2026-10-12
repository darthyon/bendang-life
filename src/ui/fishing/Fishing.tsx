import { useEffect, useRef, useState } from 'react'
import { t } from '../../i18n'
import { RULES } from '../../sim/rules'
import { useGame } from '../../state/store'
import { FishIcon } from '../icons'

const RESULT_MS = 1600

/** The fishing minigame (spec §4.8): a needle swings across a bar; press E in the green zone. */
export function Fishing() {
  const fishing = useGame((s) => s.ui.fishing)
  if (!fishing) return null
  return (
    <div className="fishing-layer">
      {fishing.step === 'cast' ? (
        <Cast
          key={`${fishing.fish}-${fishing.zone}`}
          zone={fishing.zone}
          spotKind={fishing.spot.kind}
        />
      ) : (
        <Result fish={fishing.fish} caught={fishing.caught} />
      )}
    </div>
  )
}

function Cast({ zone, spotKind }: { zone: number; spotKind: 'longkang' | 'plot' }) {
  const landFish = useGame((s) => s.landFish)
  // Where the green zone sits on the bar. Visual only, so it does not use the sim's RNG.
  const [zoneStart] = useState(() => Math.random() * (1 - zone))
  const needle = useRef<HTMLSpanElement>(null)
  const position = useRef(0)

  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const period = RULES.fishing.needleSeconds * 1000
    const tick = (now: number) => {
      // Triangle wave: left to right and back.
      const phase = ((now - start) % (2 * period)) / period
      position.current = phase <= 1 ? phase : 2 - phase
      if (needle.current) needle.current.style.left = `${position.current * 100}%`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    const strike = () => {
      const p = position.current
      landFish(p >= zoneStart && p <= zoneStart + zone)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'KeyQ') {
        e.preventDefault()
        strike()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
    }
  }, [landFish, zone, zoneStart])

  return (
    <section className="panel fishing" aria-labelledby="fishing-title">
      <h2 id="fishing-title" className="fishing__title">
        {t(spotKind === 'longkang' ? 'fishing.title_pancing' : 'fishing.title_serkap')}
      </h2>
      <button
        type="button"
        className="fishing__bar"
        aria-label={t('fishing.hint')}
        onClick={() => {
          const p = position.current
          landFish(p >= zoneStart && p <= zoneStart + zone)
        }}
      >
        <span
          className="fishing__zone"
          style={{ left: `${zoneStart * 100}%`, width: `${zone * 100}%` }}
        />
        <span ref={needle} className="fishing__needle" />
      </button>
      <p className="fishing__hint">
        <kbd className="key">E</kbd> {t('fishing.hint')}
      </p>
    </section>
  )
}

function Result({ fish, caught }: { fish: string; caught: boolean }) {
  const close = useGame((s) => s.closeFishing)
  useEffect(() => {
    const id = window.setTimeout(close, RESULT_MS)
    return () => window.clearTimeout(id)
  }, [close])
  return (
    <section className={`panel fishing fishing--result${caught ? ' is-caught' : ''}`} role="status">
      <FishIcon size={36} className="fishing__fish" />
      <p className="fishing__title">
        {caught ? t('fishing.caught', { fish: t(`fishing.${fish}`) }) : t('fishing.missed')}
      </p>
    </section>
  )
}
