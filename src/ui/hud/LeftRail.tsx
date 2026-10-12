import { t } from '../../i18n'
import { useGame } from '../../state/store'
import { PhoneIcon } from '../icons'

/** Left rail (spec §7). Kitab joins in M4. */
export function LeftRail() {
  const phoneOpen = useGame((s) => s.ui.phoneOpen)
  const setPhone = useGame((s) => s.setPhone)
  return (
    <nav className="rail" aria-label={t('hud.nav_phone')}>
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
    </nav>
  )
}
