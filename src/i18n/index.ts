import en from '../../content/i18n/en.yaml'
import kdh from '../../content/i18n/kdh.yaml'

export type Locale = 'kdh' | 'en'

const tables: Record<Locale, unknown> = { kdh, en }

let locale: Locale = 'kdh'

export function setLocale(next: Locale): void {
  locale = next
}

export function getLocale(): Locale {
  return locale
}

function lookup(table: unknown, key: string): string | undefined {
  let node: unknown = table
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : undefined
}

/** Translate a dotted key, filling `{name}` placeholders. Falls back to the key itself. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const text = lookup(tables[locale], key) ?? key
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}
