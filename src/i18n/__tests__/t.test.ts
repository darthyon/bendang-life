import { afterEach, describe, expect, it } from 'vitest'
import { setLocale, t } from '../index'

afterEach(() => setLocale('kdh'))

describe('t', () => {
  it('defaults to Kedah', () => {
    expect(t('actions.bajak')).toBe('Bajak')
  })

  it('switches to English', () => {
    setLocale('en')
    expect(t('actions.bajak')).toBe('Plough')
  })

  it('fills placeholders and leaves unknown ones', () => {
    setLocale('en')
    expect(t('plot_panel.title', { n: 2 })).toBe('Plot 2')
    expect(t('plot_panel.title')).toBe('Plot {n}')
  })

  it('falls back to the key when missing', () => {
    expect(t('nope.missing')).toBe('nope.missing')
  })
})
