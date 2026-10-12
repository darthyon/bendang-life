// Dev-only debug panel (toggle with backtick). Excluded from production builds by App.tsx.
// Labels are plain English on purpose: this is a developer tool, not player-facing UI.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { t } from '../../i18n'
import { waterTarget, stageForDay } from '../../sim/calendar'
import { RULES, VARIETY_LIST } from '../../sim/rules'
import type { Action, GameState, Plot, PlotStatus, VarietyId } from '../../sim/types'
import { useGame } from '../../state/store'
import { debugStats } from './stats'

const STATUSES: PlotStatus[] = ['locked', 'empty', 'ploughed', 'planted', 'harvested']

const S: Record<string, CSSProperties> = {
  panel: {
    position: 'fixed',
    top: 8,
    right: 8,
    bottom: 8,
    width: 360,
    overflowY: 'auto',
    padding: 12,
    background: 'rgb(20 24 28 / 0.94)',
    color: '#e8e8e8',
    font: '12px/1.4 ui-monospace, Menlo, monospace',
    borderRadius: 8,
    zIndex: 100,
  },
  h: { margin: '12px 0 4px', fontSize: 12, color: '#9fd18b', textTransform: 'uppercase' },
  row: { display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', margin: '2px 0' },
  btn: {
    padding: '2px 6px',
    background: '#33404a',
    color: '#fff',
    border: '1px solid #4b5a66',
    borderRadius: 4,
    font: 'inherit',
    cursor: 'pointer',
  },
  input: {
    width: 52,
    background: '#11161a',
    color: '#fff',
    border: '1px solid #4b5a66',
    borderRadius: 4,
    font: 'inherit',
  },
  plot: { border: '1px solid #3a464f', borderRadius: 6, padding: 6, margin: '6px 0' },
  log: { color: '#f3c27a', minHeight: 16 },
}

function Btn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" style={S.btn} onClick={onClick}>
      {children}
    </button>
  )
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <label>
      {label}{' '}
      <input
        style={S.input}
        type="number"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) onChange(n)
        }}
      />
    </label>
  )
}

function patchPlot(game: GameState, id: number, patch: Partial<Plot>): GameState {
  return { ...game, plots: game.plots.map((p) => (p.id === id ? { ...p, ...patch } : p)) }
}

export default function DebugPanel() {
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState('')
  const [jumpTo, setJumpTo] = useState(19)
  const [loanAmount, setLoanAmount] = useState(500)
  const [variety, setVariety] = useState<VarietyId>('mr297')
  const [drawCalls, setDrawCalls] = useState(0)
  const { game, dispatch, sleep, debugSet } = useGame()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') setOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    const id = window.setInterval(() => setDrawCalls(debugStats.drawCalls), 500)
    return () => window.clearInterval(id)
  }, [open])

  if (!open) return null

  const run = (action: Action) => {
    const reason = dispatch(action)
    setLog(reason ? `${action.type}: ${t(reason)}` : `${action.type}: ok`)
  }
  const band = waterTarget(game.day)
  const last = game.harvests.at(-1)

  return (
    <aside style={S.panel} aria-label="Debug panel">
      <div style={S.row}>
        <strong>Debug</strong>
        <span>
          · season {game.season} · day {game.day} · {game.hour}:00 · {stageForDay(game.day)}
        </span>
      </div>
      <div style={S.row}>
        RM{game.coins} · baja {game.baja} · benih{' '}
        {VARIETY_LIST.map((v) => `${v}:${game.benih[v]}`).join(' ')}
      </div>
      <div style={S.row}>
        loan RM{game.loan.balance} {game.loan.interestCharged ? '(interest charged)' : ''} · gates
        A:{game.gates.A ? 'open' : 'shut'} B:{game.gates.B ? 'open' : 'shut'}
      </div>
      <div style={S.row}>
        water band today {band.min}–{band.max} cm · draw calls {drawCalls}
      </div>
      <div style={S.log} role="status">
        {log}
      </div>

      <h3 style={S.h}>Time</h3>
      <div style={S.row}>
        <Btn onClick={sleep}>Sleep (next day)</Btn>
        <NumField label="to day" value={jumpTo} onChange={setJumpTo} />
        <Btn
          onClick={() => {
            const target = Math.max(1, Math.min(jumpTo, RULES.season.days + 10))
            while (useGame.getState().game.day < target) useGame.getState().sleep()
          }}
        >
          Jump
        </Btn>
        <Btn onClick={() => debugSet({ ...game, hour: RULES.clock.dayStartHour })}>Reset hours</Btn>
      </div>

      <h3 style={S.h}>Money and orders</h3>
      <div style={S.row}>
        <Btn onClick={() => debugSet({ ...game, coins: game.coins + 500 })}>+RM500</Btn>
        <select
          style={S.input}
          value={variety}
          onChange={(e) => setVariety(e.target.value as VarietyId)}
        >
          {VARIETY_LIST.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <Btn onClick={() => run({ type: 'BUY_BENIH', variety })}>Buy benih</Btn>
        <Btn onClick={() => run({ type: 'BUY_BAJA' })}>Buy baja</Btn>
      </div>
      <div style={S.row}>
        <NumField label="RM" value={loanAmount} onChange={setLoanAmount} />
        <Btn onClick={() => run({ type: 'LOAN_TAKE', amount: loanAmount })}>Take loan</Btn>
        <Btn onClick={() => run({ type: 'LOAN_REPAY', amount: loanAmount })}>Repay</Btn>
      </div>

      <h3 style={S.h}>Gates</h3>
      <div style={S.row}>
        <Btn onClick={() => run({ type: 'TOGGLE_GATE', gateId: 'A' })}>Toggle A (1–2)</Btn>
        <Btn onClick={() => run({ type: 'TOGGLE_GATE', gateId: 'B' })}>Toggle B (3–4)</Btn>
      </div>

      <h3 style={S.h}>Plots</h3>
      {game.plots.map((p) => (
        <div key={p.id} style={S.plot}>
          <div style={S.row}>
            <strong>Plot {p.id}</strong>
            <select
              style={{ ...S.input, width: 90 }}
              value={p.status}
              onChange={(e) =>
                debugSet(patchPlot(game, p.id, { status: e.target.value as PlotStatus }))
              }
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <span>
              {p.variety ?? '—'} · baja {p.bajaDone.map((d) => (d ? '■' : '□')).join('')}
            </span>
          </div>
          <div style={S.row}>
            <NumField
              label="water"
              value={p.waterCm}
              onChange={(n) => debugSet(patchPlot(game, p.id, { waterCm: n }))}
            />
            <NumField
              label="health"
              value={p.health}
              onChange={(n) => debugSet(patchPlot(game, p.id, { health: n }))}
            />
          </div>
          <div style={S.row}>
            <NumField
              label="weeds"
              value={p.weeds}
              onChange={(n) => debugSet(patchPlot(game, p.id, { weeds: n }))}
            />
            <NumField
              label="snails"
              value={p.snails}
              onChange={(n) => debugSet(patchPlot(game, p.id, { snails: n }))}
            />
          </div>
          <div style={S.row}>
            <Btn onClick={() => run({ type: 'BAJAK', plotId: p.id })}>Bajak</Btn>
            <Btn onClick={() => run({ type: 'TANAM', plotId: p.id, variety })}>Tanam</Btn>
            <Btn onClick={() => run({ type: 'BAJA', plotId: p.id })}>Baja</Btn>
            <Btn onClick={() => run({ type: 'RUMPAI', plotId: p.id })}>Rumpai</Btn>
            <Btn onClick={() => run({ type: 'SIPUT', plotId: p.id })}>Siput</Btn>
            <Btn onClick={() => run({ type: 'TUAI', plotId: p.id })}>Tuai</Btn>
          </div>
        </div>
      ))}

      <h3 style={S.h}>Last harvest</h3>
      {last ? (
        <div>
          Plot {last.plotId} · day {last.day} · {last.variety}
          <br />
          {last.kg} kg · potongan {Math.round(last.potonganRate * 100)}% · sold {last.soldKg} kg
          <br />
          sale RM{last.saleRm} + subsidy RM{last.subsidyRm}
          <br />
          loan interest RM{last.loanInterestRm} · repaid RM{last.loanRepaidRm}
          <br />
          to player RM{last.netToPlayerRm}
        </div>
      ) : (
        <div>None yet.</div>
      )}
    </aside>
  )
}
