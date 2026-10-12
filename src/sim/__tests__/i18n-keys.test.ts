import { describe, expect, it } from 'vitest'
import en from '../../../content/i18n/en.yaml'
import kdh from '../../../content/i18n/kdh.yaml'

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('i18n', () => {
  it('kdh and en have the same keys', () => {
    expect(flattenKeys(en).sort()).toEqual(flattenKeys(kdh).sort())
  })
})
