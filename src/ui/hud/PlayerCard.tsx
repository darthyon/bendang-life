import { t } from '../../i18n'
import { taskStatus } from '../../sim/tasks'
import { useGame } from '../../state/store'
import { Avatar } from '../Avatar'
import { CheckIcon, SeedlingIcon } from '../icons'

/** Top-left: who you are, and today's jobs (spec §7). */
export function PlayerCard() {
  const game = useGame((s) => s.game)
  const tasks = taskStatus(game)
  const allDone = tasks.every((task) => task.done)

  return (
    <div className="hud-stack">
      <section className="panel player">
        <span className="player__avatar">
          <Avatar preset={game.player.preset} size={44} />
        </span>
        <h1 className="player__name">{game.player.name || t('hud.player_placeholder')}</h1>
      </section>

      <section className="panel tasks" aria-labelledby="tasks-title">
        <h2 id="tasks-title" className="panel__title">
          <SeedlingIcon size={18} className="panel__title-icon" />
          {t('hud.tasks_today')}
        </h2>
        <ul className="tasks__list">
          {tasks.map((task) => (
            <li
              key={`${task.id}-${task.plotId ?? ''}`}
              className={`tasks__item${task.done ? ' is-done' : ''}`}
            >
              <span className="tasks__box" aria-hidden="true">
                {task.done && <CheckIcon size={14} />}
              </span>
              <span>{t(`tasks.${task.id}`, task.params)}</span>
            </li>
          ))}
        </ul>
        {allDone && <p className="tasks__done">{t('hud.all_done')}</p>}
      </section>
    </div>
  )
}
