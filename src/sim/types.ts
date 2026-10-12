// Game state and actions. Pure data: no React, three.js or store imports.

export type VarietyId = 'mr297' | 'mr220cl2' | 'mrq76'
export type GateId = 'A' | 'B'
export type Stage = 'tabur' | 'anak_padi' | 'beranak_bunting' | 'masak' | 'sedia_tuai'
export type JobId = 'bajak' | 'tanam' | 'pintu_air' | 'baja' | 'rumpai' | 'siput' | 'tuai'
export type PlotStatus = 'locked' | 'empty' | 'ploughed' | 'planted' | 'harvested'

export interface Plot {
  id: number
  status: PlotStatus
  variety: VarietyId | null
  waterCm: number
  health: number
  weeds: number
  snails: number
  /** One flag per baja stage: applied in its window. */
  bajaDone: boolean[]
  /** Product of card effects on yield (night cards). */
  yieldMultiplier: number
  /** Nights this season the plot was planted and outside its water band. */
  daysOffWater: number
}

export interface HarvestResult {
  season: number
  plotId: number
  day: number
  variety: VarietyId
  kg: number
  potonganRate: number
  soldKg: number
  saleRm: number
  subsidyRm: number
  loanInterestRm: number
  loanRepaidRm: number
  netToPlayerRm: number
  health: number
  bajaMissed: number
  drained: boolean
  timing: 'early' | 'ideal' | 'late'
}

/** Season spending for the report (spec §4.10). Sales live in `harvests`. */
export interface Ledger {
  seedRm: number
  bajaRm: number
  cardRm: number
  interestRm: number
}

export type Phase = 'playing' | 'report' | 'ended'

export type TaskId =
  'beli_benih' | 'bajak' | 'tanam' | 'naik_air' | 'baja' | 'siput' | 'rumpai' | 'kering' | 'tuai'

/** One line of Tugas Hari Ini. `plotId` is null for tasks that are not about a plot. */
export interface TaskRef {
  id: TaskId
  plotId: number | null
  /** Set once the task is completed; stays ticked for the rest of the day. */
  done: boolean
}

export type CardKind = 'bala' | 'rezeki'

/** A card effect that lasts several days (night cards, spec §4.7). */
export interface TimedEffect {
  kind: 'water' | 'health' | 'hours'
  /** cm per night, health per night, or hours lost each morning. */
  value: number
  daysLeft: number
}

export interface GameState {
  season: number
  day: number
  /** Hour of day, 6 to 19. Jobs move it forward. */
  hour: number
  coins: number
  benih: Record<VarietyId, number>
  baja: number
  plots: Plot[]
  gates: Record<GateId, boolean>
  loan: { balance: number; interestCharged: boolean }
  harvests: HarvestResult[]
  /** Tugas Hari Ini: built each morning, extended as new jobs become due. */
  tasksToday: TaskRef[]
  /** Tonight's night card, waiting for the player's choice. */
  pendingCard: string | null
  cards: { nextNight: number; lastKind: CardKind | null }
  effects: TimedEffect[]
  /** Days left without a phone (Fon Jatuh Dalam Bendang). */
  phoneOffDays: number
  /** Hours tomorrow starts late because of a card choice. */
  hoursLostTomorrow: number
  /** Kitab facts unlocked, in unlock order. */
  facts: string[]
  /** How many facts were known when this season started (for "new facts" in the report). */
  factsAtSeasonStart: number
  ledger: Ledger
  /** Money in and out today, for the night recap. */
  today: { earned: number; spent: number }
  phase: Phase
  /** Set when the player goes back to KL. */
  ending: { kg: number; facts: number } | null
}

export type Action =
  | { type: 'BAJAK'; plotId: number }
  | { type: 'TANAM'; plotId: number; variety: VarietyId }
  | { type: 'TOGGLE_GATE'; gateId: GateId }
  | { type: 'BAJA'; plotId: number }
  | { type: 'RUMPAI'; plotId: number }
  | { type: 'SIPUT'; plotId: number }
  | { type: 'TUAI'; plotId: number }
  | { type: 'BUY_BENIH'; variety: VarietyId }
  | { type: 'BUY_BAJA' }
  | { type: 'LOAN_TAKE'; amount: number }
  | { type: 'LOAN_REPAY'; amount: number }
  | { type: 'PASS_TIME'; hours: number }
