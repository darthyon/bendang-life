import { useGame } from '../state/store'

/** Global game keys (AGENTS.md "Controls"): Z sleep, F phone, Tab plot panel, Esc close. */
export function attachControls(): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.repeat) return
    const target = e.target
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
    ) {
      return
    }
    const { ui, game, sleep, setPhone, setKitab, setPlotPanel } = useGame.getState()
    if (e.code === 'Tab') e.preventDefault()
    // The night scene and the season report take over; day controls wait.
    if (ui.night || game.phase !== 'playing') return
    switch (e.code) {
      case 'KeyZ':
        if (!ui.phoneOpen && !ui.kitabOpen) sleep()
        break
      case 'KeyF':
        setPhone(!ui.phoneOpen)
        break
      case 'Tab':
        if (ui.phoneOpen || ui.kitabOpen) break
        setPlotPanel(ui.plotPanelId !== null ? null : ui.standingPlotId)
        break
      case 'Escape':
        if (ui.phoneOpen) setPhone(false)
        else if (ui.kitabOpen) setKitab(false)
        else if (ui.plotPanelId !== null) setPlotPanel(null)
        break
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}
