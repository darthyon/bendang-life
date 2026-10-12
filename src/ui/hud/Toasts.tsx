import { t } from '../../i18n'
import { useGame } from '../../state/store'

export function Toasts() {
  const toasts = useGame((s) => s.toasts)
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <p key={toast.id} className="panel toast">
          {t(toast.key, toast.params)}
        </p>
      ))}
    </div>
  )
}
