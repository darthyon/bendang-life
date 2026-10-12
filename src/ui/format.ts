import { t } from '../i18n'

/** 13.25 -> "1:15 PM" (12-hour, as in docs/refs). */
export function formatClock(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const h12 = ((h + 11) % 12) + 1
  return `${h12}:${String(m).padStart(2, '0')} ${t(h < 12 ? 'hud.am' : 'hud.pm')}`
}

const rm = new Intl.NumberFormat('en-MY')

/** Whole ringgit with thousands separators: 1250 -> "1,250". */
export function formatRm(amount: number): string {
  return rm.format(Math.round(amount))
}
