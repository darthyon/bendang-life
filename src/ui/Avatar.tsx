import type { PresetId } from '../sim/types'
import { PRESET_LOOK } from './presets'

/** Flat avatar for a preset (grey-box until the M7 character art). */
export function Avatar({ preset, size = 48 }: { preset: PresetId; size?: number }) {
  const look = PRESET_LOOK[preset]
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {/* Shoulders */}
      <path d="M14 62c1-11 8-17 18-17s17 6 18 17Z" fill={look.shirt} />
      {preset === 'scarf' && (
        <path d="M17 44c2-14 6-26 15-26s13 12 15 26c-5 4-25 4-30 0Z" fill={look.headwear} />
      )}
      {/* Face */}
      <circle cx="32" cy="32" r="12" fill={look.skin} />
      <circle cx="27.5" cy="32" r="1.6" fill="#2b241c" />
      <circle cx="36.5" cy="32" r="1.6" fill="#2b241c" />
      <path
        d="M28.5 37.5c2 1.6 5 1.6 7 0"
        stroke="#7a4a32"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {preset === 'hat' && (
        <>
          <ellipse cx="32" cy="23" rx="22" ry="5" fill={look.headwear} />
          <path d="M22 23c1-8 5-12 10-12s9 4 10 12Z" fill={look.headwear} />
          <path d="M22 22h20" stroke="#b8954f" strokeWidth="2" />
        </>
      )}
      {preset === 'cap' && (
        <>
          <path d="M20 26c0-8 5-13 12-13s12 5 12 13Z" fill={look.headwear} />
          <path d="M38 25h12c0 3-3 4-6 4h-6Z" fill={look.headwear} />
        </>
      )}
      {preset === 'scarf' && (
        <path d="M20 30c0-9 5-14 12-14s12 5 12 14c-3-6-7-8-12-8s-9 2-12 8Z" fill={look.headwear} />
      )}
      {preset === 'bun' && (
        <>
          <path
            d="M20 30c0-9 5-14 12-14s12 5 12 14c-2-5-6-8-12-8s-10 3-12 8Z"
            fill={look.headwear}
          />
          <circle cx="32" cy="14" r="5.5" fill={look.headwear} />
        </>
      )}
    </svg>
  )
}
