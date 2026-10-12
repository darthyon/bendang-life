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
