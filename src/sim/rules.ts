// Typed view of content/rules.yaml and content/varieties.yaml.
// The shape is checked at load so a YAML typo fails loudly with its path.
import rawRules from '../../content/rules.yaml'
import rawVarieties from '../../content/varieties.yaml'
import type { FishId, GateId, JobId, Stage, VarietyId } from './types'

type Obj = Record<string, unknown>

export function obj(value: unknown, path: string): Obj {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`rules: expected an object at ${path}`)
  }
  return value as Obj
}
export function arr(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`rules: expected a list at ${path}`)
  return value
}
export function num(value: unknown, path: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`rules: expected a number at ${path}`)
  }
  return value
}
export function str(value: unknown, path: string): string {
  if (typeof value !== 'string') throw new Error(`rules: expected a string at ${path}`)
  return value
}
export function at(o: Obj, key: string, path: string): unknown {
  if (!(key in o)) throw new Error(`rules: missing ${path}.${key}`)
  return o[key]
}

const STAGES: readonly Stage[] = ['tabur', 'anak_padi', 'beranak_bunting', 'masak', 'sedia_tuai']
const JOBS: readonly JobId[] = ['bajak', 'tanam', 'pintu_air', 'baja', 'rumpai', 'siput', 'tuai']
const VARIETY_IDS: readonly VarietyId[] = ['mr297', 'mr220cl2', 'mrq76']

export interface WaterBand {
  fromDay: number
  toDay: number
  minCm: number
  maxCm: number
  stage: Stage
}

export interface Window {
  fromDay: number
  toDay: number
}

export interface Rules {
  season: { days: number; lastDay: number; verdictMargin: number }
  clock: { dayStartHour: number; nightStartHour: number; realSecondsPerGameHour: number }
  water: {
    capCm: number
    gates: Record<GateId, number[]>
    gateOpenGainCmPerDay: number
    gateClosedLossCmPerDay: number
    healthPenaltyPerDayOffTarget: number
    targets: WaterBand[]
  }
  fertiliser: { stageDays: number[]; windowDays: number; missedStageYieldPenalty: number }
  health: { start: number; max: number }
  weeds: { window: Window; spawnChancePerDay: number; healthPenaltyPerPatchPerDay: number }
  snails: { window: Window; spawnChancePerDay: number; healthPenaltyPerPatchPerDay: number }
  harvest: {
    idealFirstDay: number
    earlyFirstDay: number
    earlyYieldFactor: number
    lateYieldFactorPerDay: number
    potongan: { base: number; notDrained: number; drainedMaxCm: number; late: number; max: number }
  }
  jobHours: Record<JobId, number>
  economy: {
    startCoins: number
    salePricePerKg: number
    subsidyPerKg: number
    bajaBagPrice: number
  }
  loan: { maxAmount: number; seasonRate: number }
  plotsBySeason: { season: number; plots: number[] }[]
  fishing: {
    spots: {
      longkang: { fish: FishId[]; catchesPerDay: number }
      plotDrained: { fish: FishId[]; catchesPerDay: number }
    }
    fish: Record<FishId, { zone: number; price: number }>
    needleSeconds: number
    hours: { pancing: number; serkap: number }
  }
  live: {
    hours: number
    baseCoins: number
    coinsPer10Followers: number
    maxCoins: number
    followersPerLive: number
    bonusFollowers: { farmJob: number; fish: number; harvest: number }
  }
  raya: { ghostChance: number }
  unlocks: {
    live: { season: number; day: number }
    raya: { season: number; day: number }
  }
  events: {
    firstCardNight: number
    cardNightEvery: [number, number]
    maxBalaInARow: number
  }
}

export interface Variety {
  id: VarietyId
  price: number
  baseYieldKg: number
  priceMultiplier: number
  weedSpawnMultiplier: number
  harvestWindowDays: number
}

function window(v: unknown, path: string): Window {
  const o = obj(v, path)
  return { fromDay: num(at(o, 'from_day', path), path), toDay: num(at(o, 'to_day', path), path) }
}

const FISH_IDS: readonly FishId[] = ['keli', 'haruan', 'puyu', 'sepat', 'tilapia']

function fishList(v: unknown, path: string): FishId[] {
  return arr(v, path).map((f, i) => {
    const id = str(f, `${path}[${i}]`)
    if (!FISH_IDS.includes(id as FishId)) throw new Error(`rules: unknown fish "${id}" at ${path}`)
    return id as FishId
  })
}

function spot(v: unknown, path: string) {
  const o = obj(v, path)
  return {
    fish: fishList(at(o, 'fish', path), `${path}.fish`),
    catchesPerDay: num(at(o, 'catches_per_day', path), `${path}.catches_per_day`),
  }
}

function seasonDay(v: unknown, path: string): { season: number; day: number } {
  const o = obj(v, path)
  return { season: num(at(o, 'season', path), path), day: num(at(o, 'day', path), path) }
}

function parseRules(raw: unknown): Rules {
  const r = obj(raw, 'rules')
  const season = obj(at(r, 'season', 'rules'), 'season')
  const clock = obj(at(r, 'clock', 'rules'), 'clock')
  const water = obj(at(r, 'water', 'rules'), 'water')
  const gates = obj(at(water, 'gates', 'water'), 'water.gates')
  const fert = obj(at(r, 'fertiliser', 'rules'), 'fertiliser')
  const health = obj(at(r, 'health', 'rules'), 'health')
  const weeds = obj(at(r, 'weeds', 'rules'), 'weeds')
  const snails = obj(at(r, 'snails', 'rules'), 'snails')
  const harvest = obj(at(r, 'harvest', 'rules'), 'harvest')
  const potongan = obj(at(harvest, 'potongan', 'harvest'), 'harvest.potongan')
  const actions = obj(at(r, 'actions', 'rules'), 'actions')
  const economy = obj(at(r, 'economy', 'rules'), 'economy')
  const prices = obj(at(economy, 'prices', 'economy'), 'economy.prices')
  const loan = obj(at(r, 'loan', 'rules'), 'loan')
  const events = obj(at(r, 'events', 'rules'), 'events')
  const every = arr(at(events, 'card_night_every', 'events'), 'events.card_night_every').map(
    (n, i) => num(n, `events.card_night_every[${i}]`),
  )

  const idealDays = arr(at(harvest, 'ideal_days', 'harvest'), 'harvest.ideal_days').map((d, i) =>
    num(d, `harvest.ideal_days[${i}]`),
  )
  const targets = arr(at(water, 'targets', 'water'), 'water.targets').map((t, i): WaterBand => {
    const p = `water.targets[${i}]`
    const o = obj(t, p)
    const stage = str(at(o, 'stage', p), p)
    if (!STAGES.includes(stage as Stage)) throw new Error(`rules: unknown stage "${stage}" at ${p}`)
    return {
      fromDay: num(at(o, 'from_day', p), p),
      toDay: num(at(o, 'to_day', p), p),
      minCm: num(at(o, 'min_cm', p), p),
      maxCm: num(at(o, 'max_cm', p), p),
      stage: stage as Stage,
    }
  })
  const masak = targets.find((t) => t.stage === 'masak')
  if (!masak) throw new Error('rules: water.targets needs a masak band')

  const jobHours = Object.fromEntries(
    JOBS.map((job) => [
      job,
      num(at(obj(at(actions, job, 'actions'), `actions.${job}`), 'hours', `actions.${job}`), job),
    ]),
  ) as Record<JobId, number>

  const gateList = (id: GateId) =>
    arr(at(gates, id, 'water.gates'), `water.gates.${id}`).map((n, i) =>
      num(n, `water.gates.${id}[${i}]`),
    )

  return {
    season: {
      days: num(at(season, 'days', 'season'), 'season.days'),
      lastDay: num(at(season, 'last_day', 'season'), 'season.last_day'),
      verdictMargin: num(at(season, 'verdict_margin', 'season'), 'season.verdict_margin'),
    },
    clock: {
      dayStartHour: num(at(clock, 'day_start_hour', 'clock'), 'clock.day_start_hour'),
      nightStartHour: num(at(clock, 'night_start_hour', 'clock'), 'clock.night_start_hour'),
      realSecondsPerGameHour: num(
        at(clock, 'real_seconds_per_game_hour', 'clock'),
        'clock.real_seconds_per_game_hour',
      ),
    },
    water: {
      capCm: num(at(water, 'cap_cm', 'water'), 'water.cap_cm'),
      gates: { A: gateList('A'), B: gateList('B') },
      gateOpenGainCmPerDay: num(at(water, 'gate_open_gain_cm_per_day', 'water'), 'water'),
      gateClosedLossCmPerDay: num(at(water, 'gate_closed_loss_cm_per_day', 'water'), 'water'),
      healthPenaltyPerDayOffTarget: num(
        at(water, 'health_penalty_per_day_off_target', 'water'),
        'water',
      ),
      targets,
    },
    fertiliser: {
      stageDays: arr(at(fert, 'stage_days', 'fertiliser'), 'fertiliser.stage_days').map((d, i) =>
        num(d, `fertiliser.stage_days[${i}]`),
      ),
      windowDays: num(at(fert, 'window_days', 'fertiliser'), 'fertiliser.window_days'),
      missedStageYieldPenalty: num(at(fert, 'missed_stage_yield_penalty', 'fertiliser'), 'fert'),
    },
    health: {
      start: num(at(health, 'start', 'health'), 'health.start'),
      max: num(at(health, 'max', 'health'), 'health.max'),
    },
    weeds: {
      window: window(at(weeds, 'critical_window', 'weeds'), 'weeds.critical_window'),
      spawnChancePerDay: num(at(weeds, 'spawn_chance_per_day', 'weeds'), 'weeds'),
      healthPenaltyPerPatchPerDay: num(at(weeds, 'health_penalty_per_patch_per_day', 'weeds'), 'w'),
    },
    snails: {
      window: window(at(snails, 'risk_window', 'snails'), 'snails.risk_window'),
      spawnChancePerDay: num(at(snails, 'spawn_chance_per_day', 'snails'), 'snails'),
      healthPenaltyPerPatchPerDay: num(
        at(snails, 'health_penalty_per_patch_per_day', 'snails'),
        's',
      ),
    },
    harvest: {
      idealFirstDay: num(idealDays[0], 'harvest.ideal_days[0]'),
      earlyFirstDay: masak.fromDay,
      earlyYieldFactor: num(at(harvest, 'early_yield_factor', 'harvest'), 'harvest'),
      lateYieldFactorPerDay: num(at(harvest, 'late_yield_factor_per_day', 'harvest'), 'harvest'),
      potongan: {
        base: num(at(potongan, 'base', 'potongan'), 'potongan.base'),
        notDrained: num(at(potongan, 'not_drained', 'potongan'), 'potongan.not_drained'),
        drainedMaxCm: num(at(potongan, 'drained_max_cm', 'potongan'), 'potongan.drained_max_cm'),
        late: num(at(potongan, 'late', 'potongan'), 'potongan.late'),
        max: num(at(potongan, 'max', 'potongan'), 'potongan.max'),
      },
    },
    jobHours,
    economy: {
      startCoins: num(at(economy, 'start_coins', 'economy'), 'economy.start_coins'),
      salePricePerKg: num(at(economy, 'sale_price_per_kg', 'economy'), 'economy'),
      subsidyPerKg: num(at(economy, 'subsidy_per_kg', 'economy'), 'economy'),
      bajaBagPrice: num(at(prices, 'baja_bag', 'economy.prices'), 'economy.prices.baja_bag'),
    },
    loan: {
      maxAmount: num(at(loan, 'max_amount', 'loan'), 'loan.max_amount'),
      seasonRate: num(at(loan, 'season_rate', 'loan'), 'loan.season_rate'),
    },
    fishing: (() => {
      const fishing = obj(at(r, 'fishing', 'rules'), 'fishing')
      const spots = obj(at(fishing, 'spots', 'fishing'), 'fishing.spots')
      const fish = obj(at(fishing, 'fish', 'fishing'), 'fishing.fish')
      const hours = (job: string) =>
        num(
          at(obj(at(actions, job, 'actions'), `actions.${job}`), 'hours', job),
          `actions.${job}.hours`,
        )
      return {
        spots: {
          longkang: spot(at(spots, 'longkang', 'fishing.spots'), 'fishing.spots.longkang'),
          plotDrained: spot(
            at(spots, 'plot_drained', 'fishing.spots'),
            'fishing.spots.plot_drained',
          ),
        },
        fish: Object.fromEntries(
          FISH_IDS.map((id) => {
            const p = `fishing.fish.${id}`
            const f = obj(at(fish, id, 'fishing.fish'), p)
            return [
              id,
              {
                zone: num(at(f, 'zone', p), `${p}.zone`),
                price: num(at(f, 'price', p), `${p}.price`),
              },
            ]
          }),
        ) as Record<FishId, { zone: number; price: number }>,
        needleSeconds: num(at(fishing, 'needle_seconds', 'fishing'), 'fishing.needle_seconds'),
        hours: { pancing: hours('pancing'), serkap: hours('serkap') },
      }
    })(),
    live: (() => {
      const live = obj(at(r, 'live', 'rules'), 'live')
      const bonus = obj(at(live, 'bonus_followers', 'live'), 'live.bonus_followers')
      const n = (o: Obj, key: string, p: string) => num(at(o, key, p), `${p}.${key}`)
      return {
        hours: n(live, 'hours', 'live'),
        baseCoins: n(live, 'base_coins', 'live'),
        coinsPer10Followers: n(live, 'coins_per_10_followers', 'live'),
        maxCoins: n(live, 'max_coins', 'live'),
        followersPerLive: n(live, 'followers_per_live', 'live'),
        bonusFollowers: {
          farmJob: n(bonus, 'farm_job', 'live.bonus_followers'),
          fish: n(bonus, 'fish', 'live.bonus_followers'),
          harvest: n(bonus, 'harvest', 'live.bonus_followers'),
        },
      }
    })(),
    raya: {
      ghostChance: num(
        at(obj(at(r, 'hantu_raya', 'rules'), 'hantu_raya'), 'ghost_chance', 'hantu_raya'),
        'hantu_raya.ghost_chance',
      ),
    },
    unlocks: {
      live: seasonDay(at(obj(at(r, 'live', 'rules'), 'live'), 'unlock', 'live'), 'live.unlock'),
      raya: seasonDay(
        at(obj(at(r, 'hantu_raya', 'rules'), 'hantu_raya'), 'unlock', 'hantu_raya'),
        'hantu_raya.unlock',
      ),
    },
    events: {
      firstCardNight: num(at(events, 'first_card_night', 'events'), 'events.first_card_night'),
      cardNightEvery: [
        num(every[0], 'events.card_night_every[0]'),
        num(every[1], 'events.card_night_every[1]'),
      ],
      maxBalaInARow: num(at(events, 'max_bala_in_a_row', 'events'), 'events.max_bala_in_a_row'),
    },
    plotsBySeason: arr(at(r, 'plots_by_season', 'rules'), 'plots_by_season').map((e, i) => {
      const p = `plots_by_season[${i}]`
      const o = obj(e, p)
      return {
        season: num(at(o, 'season', p), p),
        plots: arr(at(o, 'plots', p), p).map((n, j) => num(n, `${p}.plots[${j}]`)),
      }
    }),
  }
}

function parseVarieties(raw: unknown): Record<VarietyId, Variety> {
  const list = arr(raw, 'varieties').map((v, i): Variety => {
    const p = `varieties[${i}]`
    const o = obj(v, p)
    const id = str(at(o, 'id', p), p)
    if (!VARIETY_IDS.includes(id as VarietyId)) throw new Error(`rules: unknown variety "${id}"`)
    return {
      id: id as VarietyId,
      price: num(at(o, 'price', p), `${p}.price`),
      baseYieldKg: num(at(o, 'base_yield_kg', p), `${p}.base_yield_kg`),
      priceMultiplier: num(at(o, 'price_multiplier', p), `${p}.price_multiplier`),
      weedSpawnMultiplier: num(at(o, 'weed_spawn_multiplier', p), `${p}.weed_spawn_multiplier`),
      harvestWindowDays: num(at(o, 'harvest_window_days', p), `${p}.harvest_window_days`),
    }
  })
  const byId = Object.fromEntries(list.map((v) => [v.id, v]))
  for (const id of VARIETY_IDS) {
    if (!byId[id]) throw new Error(`rules: varieties.yaml is missing ${id}`)
  }
  return byId as Record<VarietyId, Variety>
}

export const RULES: Rules = parseRules(rawRules)
export const VARIETIES: Record<VarietyId, Variety> = parseVarieties(rawVarieties)
export const VARIETY_LIST: readonly VarietyId[] = VARIETY_IDS
export const FISH_LIST: readonly FishId[] = FISH_IDS
