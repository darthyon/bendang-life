import { t } from '../../i18n'
import { useGame } from '../../state/store'
import { BookIcon, GearIcon, PhoneIcon } from '../icons'

/** Left rail (spec §7): Fon, Kitab, Tetapan. */
export function LeftRail() {
  const phoneOpen = useGame((s) => s.ui.phoneOpen)
  const kitabOpen = useGame((s) => s.ui.kitabOpen)
  const setPhone = useGame((s) => s.setPhone)
  const setKitab = useGame((s) => s.setKitab)
  const setSettings = useGame((s) => s.setSettings)
  return (
    <nav className="rail">
      <button
        type="button"
        className={`panel rail__item${phoneOpen ? ' is-active' : ''}`}
        aria-pressed={phoneOpen}
        onClick={() => setPhone(!phoneOpen)}
      >
        <PhoneIcon size={24} className="rail__icon" />
        <span>{t('hud.nav_phone')}</span>
        <kbd className="key key--small">F</kbd>
      </button>
      <button
        type="button"
        className={`panel rail__item${kitabOpen ? ' is-active' : ''}`}
        aria-pressed={kitabOpen}
        onClick={() => setKitab(!kitabOpen)}
      >
        <BookIcon size={24} className="rail__icon" />
        <span>{t('hud.nav_kitab')}</span>
      </button>
      <button type="button" className="panel rail__item" onClick={() => setSettings(true)}>
        <GearIcon size={24} className="rail__icon" />
        <span>{t('hud.nav_settings')}</span>
      </button>
    </nav>
  )
}
