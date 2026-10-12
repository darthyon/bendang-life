import { describe, expect, it } from 'vitest'
import { applyAction } from '../actions'
import { advanceDay } from '../day'
import { createRng } from '../rng'
import { RULES } from '../rules'
import { taskStatus } from '../tasks'
import { freshState, plantedState, withPlot } from './helpers'
import { refreshTasks } from '../tasks'

const ids = (s: Parameters<typeof taskStatus>[0]) =>
  taskStatus(s).map((t) => `${t.id}${t.plotId ? `:${t.plotId}` : ''}${t.done ? ' ✓' : ''}`)

describe('Tugas Hari Ini', () => {
  it('starts day 1 with ploughing the open plot', () => {
    expect(ids(freshState())).toEqual(['bajak:1'])
  })

  it('keeps finished tasks ticked and adds tasks that become due', () => {
    let s = applyAction(freshState(), { type: 'BAJAK', plotId: 1 })
    expect(ids(s)).toEqual(['bajak:1 ✓', 'tanam:1'])
    s = applyAction(s, { type: 'TANAM', plotId: 1, variety: 'mr297' })
    expect(ids(s)).toEqual(['bajak:1 ✓', 'tanam:1 ✓'])
  })

  it('asks to order seed when a plot is ready but no bag is left', () => {
    const s = refreshTasks(
      withPlot(freshState({ benih: { mr297: 0, mr220cl2: 0, mrq76: 0 } }), 1, {
        status: 'ploughed',
      }),
    )
    expect(ids(s)).toContain('beli_benih')
    const bought = applyAction(s, { type: 'BUY_BENIH', variety: 'mr297' })
    expect(ids(bought)).toContain('beli_benih ✓')
  })

  it('starts a new list each morning', () => {
    let s = applyAction(freshState(), { type: 'BAJAK', plotId: 1 })
    s = applyAction(s, { type: 'TANAM', plotId: 1, variety: 'mr297' })
    s = advanceDay({ ...s, gates: { A: false, B: false } }, createRng(3))
    expect(ids(s)).not.toContain('bajak:1 ✓')
    // Day 2: water below the 5-7 cm band and baja stage 1 due.
    expect(ids(s)).toEqual(expect.arrayContaining(['naik_air:1', 'baja:1']))
  })

  it('fills text params for baja and water tasks', () => {
    const s = refreshTasks(plantedState(RULES.fertiliser.stageDays[1] ?? 6, { waterCm: 0 }))
    const baja = taskStatus(s).find((t) => t.id === 'baja')
    const water = taskStatus(s).find((t) => t.id === 'naik_air')
    expect(baja?.params).toEqual({ n: 1, stage: 2 })
    expect(water?.params).toMatchObject({ n: 1, min: 5, max: 7 })
  })

  it('ticks baja once applied', () => {
    let s = refreshTasks({ ...plantedState(2), baja: 1 })
    s = applyAction(s, { type: 'BAJA', plotId: 1 })
    expect(ids(s)).toContain('baja:1 ✓')
  })

  it('asks to drain before harvest and to harvest when ripe', () => {
    expect(ids(refreshTasks(plantedState(17, { waterCm: 4 })))).toContain('kering:1')
    expect(ids(refreshTasks(plantedState(19, { waterCm: 0 })))).toContain('tuai:1')
  })
})
