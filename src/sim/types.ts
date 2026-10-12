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
  /** Product of card effects on yield (night cards, M4). */
  yieldMultiplier: number
}

export interface HarvestResult {
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
