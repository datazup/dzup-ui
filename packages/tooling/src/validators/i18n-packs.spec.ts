import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  catalogKeys,
  checkPack,
  checkPackExports,
  checkPseudo,
  findPackImports,
  LOCALES_DIR,
  renderEnglishPack,
  scaffoldPack,
} from './i18n-packs.ts'

/**
 * `validate:i18n-packs` (TASK-R5-O4) — every rule seeded to fail once, so the
 * gate is proven to fire rather than assumed to.
 */

const ALL = catalogKeys()

/** A pack with every key a fallback except the ones given as translations. */
function pack(overrides: Record<string, unknown> = {}, translations: Record<string, Record<string, unknown>> = {}) {
  const translated = new Set(Object.entries(translations).flatMap(([group, keys]) => Object.keys(keys).map(key => `${group}.${key}`)))
  return {
    locale: 'de',
    direction: 'ltr',
    fallback: ALL.filter(key => !translated.has(key)),
    messages: translations,
    ...overrides,
  }
}

function rules(raw: unknown, file = 'de.json') {
  return checkPack(file, raw).violations.map(violation => violation.rule)
}

describe('the checked-in packs', () => {
  it('en.json is the rendered catalog, byte for byte', () => {
    expect(readFileSync(join(LOCALES_DIR, 'en.json'), 'utf8').replaceAll('\r\n', '\n')).toBe(renderEnglishPack())
  })

  it('de.json passes and is reported as a scaffold — nothing translated, nothing machine-translated', () => {
    const raw = JSON.parse(readFileSync(join(LOCALES_DIR, 'de.json'), 'utf8'))
    const result = checkPack('de.json', raw)
    expect(result.violations).toEqual([])
    expect(result.coverage).toMatchObject({ locale: 'de', translated: 0, status: 'scaffold' })
  })

  it('a fresh scaffold passes', () => {
    expect(rules(JSON.parse(scaffoldPack('fr')), 'fr.json')).toEqual([])
  })

  it('the pseudo-locale formats with the same arguments as English', () => {
    expect(checkPseudo()).toEqual([])
  })

  it('no source module imports a pack', () => {
    expect(findPackImports()).toEqual([])
  })
})

describe('every rule fires', () => {
  it('missing — a key neither translated nor listed', () => {
    expect(rules(pack({ fallback: ALL.slice(1) }))).toEqual(['missing'])
  })

  it('both — translated and listed', () => {
    const raw = pack({}, { DzAlert: { close: 'Schließen' } })
    expect(rules({ ...raw, fallback: [...raw.fallback, 'DzAlert.close'] })).toEqual(['both'])
  })

  it('unknown — a translation or fallback for a key the catalog lacks', () => {
    expect(rules(pack({}, { DzAlert: { closed: 'x' } }))).toEqual(['unknown'])
    expect(rules(pack({ fallback: [...ALL, 'DzNope.gone'] }))).toEqual(['unknown'])
  })

  it('duplicate — a fallback listed twice', () => {
    expect(rules(pack({ fallback: [...ALL, ALL[0]] }))).toEqual(['duplicate'])
  })

  it('syntax — a translation that does not parse', () => {
    expect(rules(pack({}, { DzTagsInput: { count: '{count, plural, one {# Tag}' } }))).toEqual(['syntax'])
  })

  it('arguments — dropped, invented, or re-selected', () => {
    expect(rules(pack({}, { DzTagsInput: { countOfMax: '{count, plural, one {# Tag} other {# Tags}}' } }))).toEqual(['arguments'])
    expect(rules(pack({}, { DzAlert: { close: 'Schließen {name}' } }))).toEqual(['arguments'])
    expect(rules(pack({}, { DzTagsInput: { count: '{count, select, other {Tags}}' } }))).toEqual(['arguments'])
  })

  it('arguments — allows a plain argument where English pluralises, and the reverse', () => {
    expect(rules(pack({}, { DzTagsInput: { count: '{count}件のタグ' } }))).toEqual([])
    expect(rules(pack({}, { DzTagsInput: { countOfMax: '{count, plural, one {# oznaka} other {# oznake}} od {max, plural, other {#}}' } })))
      .toEqual([])
  })

  it('shape — nulls, unexpected fields, a misnamed file, a non-object', () => {
    expect(rules(pack({}, { DzAlert: { close: null } }))).toContain('shape')
    expect(rules(pack({ status: 'done' }))).toEqual(['shape'])
    expect(rules(pack(), 'fr.json')).toEqual(['shape'])
    expect(rules([])).toEqual(['shape'])
    expect(rules(pack({ direction: 'auto' }))).toEqual(['shape'])
  })

  it('direction — a declared direction the locale list disagrees with', () => {
    expect(rules(pack({ direction: 'rtl' }))).toEqual(['direction'])
    expect(rules({ ...pack({ locale: 'ar', direction: 'ltr' }) }, 'ar.json')).toEqual(['direction'])
  })
})

describe('rule 9 — exported iff published', () => {
  const en = { locale: 'en', translated: 110, fallback: 0, total: 110, status: 'complete' } as const
  const de = { locale: 'de', translated: 0, fallback: 110, total: 110, status: 'scaffold' } as const
  const fr = { locale: 'fr', translated: 3, fallback: 107, total: 110, status: 'partial' } as const

  it('passes the checked-in shape: en exported, the de scaffold not', () => {
    expect(checkPackExports(['.', './i18n', './i18n/locales/en.json'], [en, de])).toEqual([])
  })

  it('fires for a translated pack with no export, an exported scaffold, and an export with no pack', () => {
    expect(checkPackExports(['./i18n/locales/en.json'], [en, fr]).map(v => v.key)).toEqual(['fr'])
    expect(checkPackExports(['./i18n/locales/en.json', './i18n/locales/de.json'], [en, de]).map(v => v.key)).toEqual(['de'])
    expect(checkPackExports(['./i18n/locales/en.json', './i18n/locales/it.json'], [en]).map(v => v.key)).toEqual(['it'])
  })
})
