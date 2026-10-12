import { t } from '../../i18n'
import { useGame } from '../../state/store'
import { MoonIcon } from '../icons'

/** Ends the day from anywhere (spec §4.2). Z does the same. */
export function TidurButton() {
  const sleep = useGame((s) => s.sleep)
  return (
    <button type="button" className="panel tidur" onClick={sleep}>
      <MoonIcon size={22} className="tidur__icon" />
      <span>{t('hud.skip_sleep')}</span>
      <kbd className="key">Z</kbd>
    </button>
  )
}
