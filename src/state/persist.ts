// The only place that touches localStorage. Every access is wrapped: storage can be missing,
// full or blocked (private mode, itch.io iframes), and the game must still run.
import type { Locale } from '../i18n'
import { deserialize, serialize, type SaveData } from '../sim/save'

const SAVE_KEY = 'bendang-life:save'
const INTRO_KEY = 'bendang-life:intro-seen'
const LOCALE_KEY = 'bendang-life:locale'

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): boolean {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const loadSave = (): SaveData | null => deserialize(read(SAVE_KEY))
export const writeSave = (data: SaveData): boolean => write(SAVE_KEY, serialize(data))
export const clearSave = (): boolean => write(SAVE_KEY, null)

export const introSeen = (): boolean => read(INTRO_KEY) === '1'
export const markIntroSeen = (): void => void write(INTRO_KEY, '1')

export function savedLocale(): Locale | null {
  const value = read(LOCALE_KEY)
  return value === 'kdh' || value === 'en' ? value : null
}
export const saveLocale = (locale: Locale): void => void write(LOCALE_KEY, locale)
