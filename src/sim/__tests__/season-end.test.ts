import { describe, expect, it } from 'vitest'
import { applyAction } from '../actions'
import { advanceDay } from '../day'
import { resolveCard, startNight } from '../events'
import { buildRecap } from '../recap'
import { buildReport, finishSeason, isSeasonOver, leaveForKl, newSeason } from '../season'
import { createRng } from '../rng'
import { RULES } from '../rules'
import { createInitialState } from '../state'
import { freshState, plantedState, plot } from './helpers'

const allBaja = [true, true, true, true]

describe('facts', () => {
  it('unlocks the starter seed fact at the start', () => {
    expect(createInitialState({ starter: 'mrq76' }).facts).toContain('fact_mrq76')
  })

  it('unlocks on the first job, the day, a loan and a seed bought', () => {
    let s = applyAction(freshState(), { type: 'BAJAK', plotId: 1 })
    expect(s.facts).toContain('fact_plough_timing')
    s = applyAction(s, { type: 'LOAN_TAKE', amount: 100 })
    expect(s.facts).toContain('fact_agribank_loan')
    s = applyAction(s, { type: 'BUY_BENIH', variety: 'mr220cl2' })
    expect(s.facts).toContain('fact_cl2_blast')
    let day = plantedState(16)
    day = advanceDay(day, createRng(1))
    expect(day.facts).toContain('fact_drain_before_harvest')
  })

  it('unlocks on a card event and on a card option', () => {
    const night = startNight(
      { ...plantedState(12), pendingCard: null, cards: { nextNight: 12, lastKind: 'rezeki' } },
      createRng(2),
    )
    if (night.pendingCard === 'tikus_malam')
      expect(night.facts).toContain('fact_tikus_bukan_bencana')
    const s = resolveCard(
      { ...plantedState(5), pendingCard: 'fon_jatuh' },
      'rendam_beras',
      createRng(1),
    )
    expect(s.facts).toContain('fact_phone_rice')
  })
})

describe('day recap', () => {
  it('explains water, health lost and new pests', () => {
    const before = { ...plantedState(2, { waterCm: 2, weeds: 1 }), gates: { A: true, B: false } }
    const after = advanceDay(before, createRng(3))
    const recap = buildRecap(before, after)
    const p = recap.plots.find((r) => r.plotId === 1)
    expect(p).toMatchObject({ waterFrom: 2, waterTo: 4, gateOpen: true })
    expect(p?.causes).toEqual(expect.arrayContaining(['water_low', 'weeds']))
    expect(p?.healthTo).toBe(plot(after, 1).health)
  })

  it('starts from the evening so a night card change shows', () => {
    const evening = { ...plantedState(5, { waterCm: 5 }), pendingCard: 'hujan_lebat' }
    const resolved = resolveCard(evening, 'biar', createRng(1))
    const recap = buildRecap(evening, advanceDay(resolved, createRng(1)), {
      id: 'hujan_lebat',
      optionId: 'biar',
    })
    expect(recap.plots[0]).toMatchObject({ waterFrom: 5, waterTo: 8 })
    expect(recap.card).toEqual({ id: 'hujan_lebat', optionId: 'biar' })
  })

  it('sums money in and out today', () => {
    let s = applyAction(freshState(), { type: 'BUY_BAJA' })
    s = applyAction(s, { type: 'BUY_BENIH', variety: 'mr297' })
    const recap = buildRecap(s, advanceDay(s, createRng(1)))
    expect(recap.money).toEqual({ earned: 0, spent: RULES.economy.bajaBagPrice + 150 })
  })

  it('starts each day with a clean money count', () => {
    const s = advanceDay(applyAction(freshState(), { type: 'BUY_BAJA' }), createRng(1))
    expect(s.today).toEqual({ earned: 0, spent: 0 })
  })
})

describe('season end', () => {
  it('is not over before the last calendar day', () => {
    expect(isSeasonOver(freshState({ day: RULES.season.days }))).toBe(false)
  })

  it('ends the morning after the last day when nothing is left growing', () => {
    expect(isSeasonOver(freshState({ day: RULES.season.days + 1 }))).toBe(true)
  })

  it('waits for an unharvested plot, up to the last allowed day', () => {
    expect(isSeasonOver(plantedState(RULES.season.days + 1))).toBe(false)
    expect(isSeasonOver(plantedState(RULES.season.lastDay + 1))).toBe(true)
  })

  it('reports money, verdict and what was missed', () => {
    let s = { ...plantedState(19, { bajaDone: [true, false, true, true], waterCm: 4 }), coins: 0 }
    s = applyAction(s, { type: 'TUAI', plotId: 1 })
    const report = buildReport({ ...s, day: 21 })
    const h = s.harvests.at(-1)
    expect(report.kg).toBe(h?.kg)
    expect(report.saleRm).toBe(h?.saleRm)
    expect(report.net).toBe((h?.saleRm ?? 0) + (h?.subsidyRm ?? 0) - report.costs)
    expect(report.verdict).toBe('untung')
    expect(report.missed.map((m) => m.key)).toEqual(
      expect.arrayContaining(['missed_baja', 'not_drained']),
    )
  })

  it('gives rugi and pulang modal by the margin', () => {
    const base = freshState({ day: 21 })
    const spentBig = { ...base, season: 1, ledger: { ...base.ledger, seedRm: 500 } }
    expect(buildReport(spentBig).verdict).toBe('rugi')
    expect(buildReport(base).verdict).toBe('pulang_modal')
  })

  it('counts plots still growing at the cap as lost', () => {
    const report = buildReport(plantedState(RULES.season.lastDay + 1))
    expect(report.missed.map((m) => m.key)).toContain('plot_lost')
  })

  it('unlocks report facts when the season finishes', () => {
    const s = finishSeason(freshState({ day: 21 }))
    expect(s.phase).toBe('report')
    expect(s.facts).toEqual(expect.arrayContaining(['fact_floor_price', 'fact_cost_per_hectare']))
  })

  it('starts Musim Baru keeping coins, loan and facts, opening the next plot', () => {
    let s = finishSeason({
      ...freshState({ day: 21, coins: 3000 }),
      loan: { balance: 300, interestCharged: true },
    })
    s = newSeason(s)
    expect(s.season).toBe(2)
    expect(s.day).toBe(1)
    expect(s.coins).toBe(3000)
    expect(s.loan).toEqual({ balance: 300, interestCharged: false })
    expect(s.facts).toContain('fact_floor_price')
    expect([1, 2].map((id) => plot(s, id).status)).toEqual(['empty', 'empty'])
    expect(s.phase).toBe('playing')
  })

  it('balik KL ends the game with kg and facts learned', () => {
    let s = { ...plantedState(19, { bajaDone: allBaja }) }
    s = applyAction(s, { type: 'TUAI', plotId: 1 })
    s = leaveForKl(finishSeason({ ...s, day: 21 }))
    expect(s.phase).toBe('ended')
    expect(s.ending?.kg).toBe(s.harvests[0]?.kg)
    expect(s.ending?.facts).toBe(s.facts.length)
  })
})
