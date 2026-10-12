// Grey-box icon set: one stroke weight, round caps, 24px grid. Replaced by the M7 icon pass.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const CoinIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3.2a1.8 1.8 0 0 0 0 3.6h4.2M12 7.5v1.8M12 16.8v1.7" />
  </Svg>
)

export const SeedlingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20v-8" />
    <path d="M12 12c0-3.6-2.6-6-6.5-6 0 3.6 2.6 6 6.5 6Z" />
    <path d="M12 14c0-3.2 2.4-5.5 6.5-5.5 0 3.2-2.4 5.5-6.5 5.5Z" />
  </Svg>
)

export const SackIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 4.5h6l-1.4 3h-3.2Z" />
    <path d="M10.4 7.5C6.6 9.4 5 12.6 5 15.5 5 18.6 7.4 20 12 20s7-1.4 7-4.5c0-2.9-1.6-6.1-5.4-8" />
    <path d="M9.5 14.5h5" />
  </Svg>
)

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </Svg>
)

export const MoonIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z" />
  </Svg>
)

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6.5" y="3" width="11" height="18" rx="2.5" />
    <path d="M10.5 17.5h3" />
  </Svg>
)

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 12.5 4 4 8-9" />
  </Svg>
)

export const DropIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" />
  </Svg>
)

export const SnailIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 18h13.5a4.5 4.5 0 0 0 4.5-4.5V9" />
    <circle cx="11" cy="12" r="5" />
    <path d="M11 12a1.8 1.8 0 1 1 1.8-1.8" />
    <path d="m19.5 9-1.5-3M21.5 8.5 22 5.5" />
  </Svg>
)

export const WeedIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20V9M12 20c-1-4-3.5-7-7-8.5M12 20c1-4 3.5-7 7-8.5M12 9c-1.4-1.5-1.6-3.6-.5-5.5M12 9c1.4-1.5 1.6-3.6.5-5.5" />
    <path d="M4 20h16" />
  </Svg>
)

export const SickleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 18 9.5 14.5" />
    <path d="M9.5 14.5C14 15.5 19 12 19 6.5c0-.9-.1-1.8-.4-2.5-.6 4.5-4.2 8.2-9.1 8.7" />
    <path d="m4 20 2.4-2.4" />
  </Svg>
)

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m7 7 10 10M17 7 7 17" />
  </Svg>
)

export const BackIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m14.5 6-6 6 6 6" />
  </Svg>
)

export const BankIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 9.5 12 4.5l8.5 5" />
    <path d="M5.5 10v7M10 10v7M14 10v7M18.5 10v7M3.5 19.5h17" />
  </Svg>
)

export const StoreIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 10v9.5h15V10" />
    <path d="M3.5 6.5 5 4.5h14l1.5 2v1.3a2.6 2.6 0 0 1-5.2 0 2.6 2.6 0 0 1-5.3 0 2.6 2.6 0 0 1-5.5 0Z" />
    <path d="M10 19.5v-5h4v5" />
  </Svg>
)

export const FarmerIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 10.5c2.4-1.2 5.4-1.8 9-1.8s6.6.6 9 1.8" />
    <path d="M8.2 9.2c.5-2.6 1.9-4.2 3.8-4.2s3.3 1.6 3.8 4.2" />
    <circle cx="12" cy="13.5" r="3.2" />
    <path d="M6 21c.7-2.6 3.2-4.2 6-4.2s5.3 1.6 6 4.2" />
  </Svg>
)

export const SunIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
  </Svg>
)

export const RainIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 14.5a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17 7.5a3.5 3.5 0 0 1 .5 7H7Z" />
    <path d="m8 17.5-1 2.5M12 17.5l-1 2.5M16 17.5l-1 2.5" />
  </Svg>
)

export const RatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 15.5c0-3.6 3.4-6.5 7.5-6.5 3 0 5.4 1.4 6.6 3.5L21 14l-2.7 1.2c-.9 1.5-2.9 2.3-6.8 2.3H6" />
    <circle cx="9.5" cy="8" r="1.8" />
    <path d="M4 15.5c-1.4 0-2 1.2-1.5 2.5" />
    <circle cx="17.2" cy="12.8" r=".4" fill="currentColor" />
  </Svg>
)

export const PeopleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3" />
    <circle cx="16.5" cy="9.5" r="2.4" />
    <path d="M3.5 19c.6-3 2.9-5 5.5-5s4.9 2 5.5 5M14.5 14.3c.6-.2 1.3-.3 2-.3 2.2 0 4 1.6 4.5 4" />
  </Svg>
)

export const BookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 5.5c2.6-1 5.2-1 7.5.6 2.3-1.6 4.9-1.6 7.5-.6v13c-2.6-1-5.2-1-7.5.6-2.3-1.6-4.9-1.6-7.5-.6Z" />
    <path d="M12 6.1v13" />
  </Svg>
)

export const FishIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12c2.4-3.4 5.6-5 9-5 3.6 0 6.3 2 8 5-1.7 3-4.4 5-8 5-3.4 0-6.6-1.6-9-5Z" />
    <path d="M3 12 1.5 8.5M3 12l-1.5 3.5" />
    <circle cx="15.5" cy="11" r=".6" fill="currentColor" />
  </Svg>
)

export const LiveIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="2.2" />
    <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
  </Svg>
)
