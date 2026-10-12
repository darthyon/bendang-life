import { t } from '../../i18n'
import type { CardOption, Effect } from '../../sim/events'

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

/** Short labels for what an option costs and does, e.g. "−RM80", "+4 cm water". */
export function describeEffect(effect: Effect, liveOpen: boolean): string[] {
  switch (effect.type) {
    case 'water_cm':
      return [t('night.effect_water', { cm: signed(effect.value) })]
    case 'water_cm_per_day':
      return [t('night.effect_water_day', { cm: signed(effect.value), n: effect.days })]
    case 'health':
      return [t('night.effect_health', { n: signed(effect.value) })]
    case 'health_per_day':
      return [t('night.effect_health_day', { n: signed(effect.value), d: effect.days })]
    case 'yield_multiplier':
      return [t('night.effect_yield', { n: signed(Math.round((effect.value - 1) * 100)) })]
    case 'phone_off_days':
      return [t('night.effect_phone_off', { n: effect.value })]
    case 'chance':
      return [
        `${t('night.effect_chance', { n: Math.round(effect.value * 100) })} ${effect.then
          .flatMap((e) => describeEffect(e, liveOpen))
          .join(', ')}`,
      ]
    case 'unlock_fact':
    case 'unlock_random_fact':
      return [t('night.effect_fact')]
    case 'item':
      return [t('night.effect_baja', { n: effect.count })]
    case 'followers':
      // Before Live opens a "needs_live" gain does nothing, so it is not shown.
      return effect.needsLive && !liveOpen ? [] : [t('night.effect_followers', { n: effect.value })]
    case 'fish':
      return [t('night.effect_fish', { n: effect.count, fish: t(`fishing.${effect.fish}`) })]
    case 'fish_price_multiplier':
      return [t('night.effect_fish_price', { n: effect.value })]
  }
}

export function describeCost(option: CardOption): string[] {
  const { cost } = option
  const parts: string[] = []
  if (cost.coins) parts.push(t('night.cost_coins', { n: cost.coins }))
  if (cost.hoursTomorrow) parts.push(t('night.cost_hours_tomorrow', { h: cost.hoursTomorrow }))
  if (cost.hoursPerDay)
    parts.push(t('night.cost_hours_days', { h: cost.hoursPerDay, n: cost.days ?? 1 }))
  if (cost.items?.baja_bag) parts.push(t('night.cost_baja', { n: cost.items.baja_bag }))
  return parts
}
