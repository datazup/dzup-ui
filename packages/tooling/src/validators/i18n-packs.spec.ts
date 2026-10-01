import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  catalogKeys,
  checkPack,
  checkPackExports,
  checkPseudo,
  findPackImports,
  isUntranslated,
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
  const en = { locale: 'en', translated: 110, effective: 110, fallback: 0, total: 110, status: 'complete' } as const
  const de = { locale: 'de', translated: 0, effective: 0, fallback: 110, total: 110, status: 'scaffold' } as const
  const fr = { locale: 'fr', translated: 3, effective: 3, fallback: 107, total: 110, status: 'partial' } as const
  /**
   * The shape TASK-S5-O1's finding F1 was measured on: one value present under a
   * translated key, and that value the English source copied verbatim. `status`
   * turns on `effective`, so it is a scaffold (RESIDUAL-02).
   */
  const plCopiedOnly = { locale: 'pl', translated: 1, effective: 0, fallback: 109, total: 110, status: 'scaffold' } as const

  it('passes the checked-in shape: en exported, the de scaffold not', () => {
    expect(checkPackExports(['.', './i18n', './i18n/locales/en.json'], [en, de])).toEqual([])
  })

  it('fires for a translated pack with no export, an exported scaffold, and an export with no pack', () => {
    expect(checkPackExports(['./i18n/locales/en.json'], [en, fr]).map(v => v.key)).toEqual(['fr'])
    expect(checkPackExports(['./i18n/locales/en.json', './i18n/locales/de.json'], [en, de]).map(v => v.key)).toEqual(['de'])
    expect(checkPackExports(['./i18n/locales/en.json', './i18n/locales/it.json'], [en]).map(v => v.key)).toEqual(['it'])
  })

  it('does NOT demand publication of a pack whose only value is English copied verbatim', () => {
    // Before RESIDUAL-02 `published` read the raw `translated` count, so this
    // exact shape produced `"pl" has translations but no export` — the gate
    // pressing for an untranslated scaffold to be shipped as a locale.
    expect(checkPackExports(['./i18n/locales/en.json'], [en, plCopiedOnly])).toEqual([])
  })

  it('does fire if such a pack IS exported — the direction the old predicate could not see', () => {
    const fired = checkPackExports(['./i18n/locales/en.json', './i18n/locales/pl.json'], [en, plCopiedOnly])
    expect(fired.map(v => v.key)).toEqual(['pl'])
    expect(fired[0]?.message).toContain('a scaffold the build does not publish')
  })

  it('still demands publication of a pack with a single GENUINE translation', () => {
    // Option B, not C: R5-O4 deliberately supports shipping a partial pack that
    // falls back to English, so one real translation is publishable.
    const plOneReal = { ...plCopiedOnly, effective: 1, status: 'partial' } as const
    const fired = checkPackExports(['./i18n/locales/en.json'], [en, plOneReal])
    expect(fired.map(v => v.key)).toEqual(['pl'])
    expect(fired[0]?.message).toContain('1 effective translation(s)')
  })
})

describe('effective translations — the predicate rule 9 turns on', () => {
  it('a value copied verbatim from English is not an effective translation', () => {
    const english = readFileSync(join(LOCALES_DIR, 'en.json'), 'utf8')
    const source = (JSON.parse(english) as { messages: Record<string, Record<string, string>> }).messages
    const copied = source.DzAlert?.close as string
    const result = checkPack('pl.json', pack({ locale: 'pl' }, { DzAlert: { close: copied } }))
    expect(result.violations).toEqual([])
    expect(result.coverage).toMatchObject({ translated: 1, effective: 0, status: 'scaffold' })
  })

  it('whitespace is normalised, case is not — a case change is not a translation', () => {
    expect(isUntranslated('Close', 'Close')).toBe(true)
    expect(isUntranslated('Close', '  Close ')).toBe(true)
    expect(isUntranslated('Close', 'close')).toBe(false)
    expect(isUntranslated('Close', 'Zamknij')).toBe(false)
  })

  it('a genuine translation counts, and one real value makes the pack partial', () => {
    const result = checkPack('pl.json', pack({ locale: 'pl' }, { DzAlert: { close: 'Zamknij' } }))
    expect(result.violations).toEqual([])
    expect(result.coverage).toMatchObject({ translated: 1, effective: 1, status: 'partial' })
  })

  it('the source pack is exempt: en.json is complete, not a scaffold of itself', () => {
    const raw = JSON.parse(readFileSync(join(LOCALES_DIR, 'en.json'), 'utf8'))
    expect(checkPack('en.json', raw).coverage).toMatchObject({
      locale: 'en',
      translated: ALL.length,
      effective: ALL.length,
      status: 'complete',
    })
  })

  it('a pack that copies EVERY English value reads as a scaffold, not as complete', () => {
    const raw = JSON.parse(readFileSync(join(LOCALES_DIR, 'en.json'), 'utf8')) as Record<string, unknown>
    const copied = { ...raw, locale: 'pl', direction: 'ltr', fallback: [] }
    const result = checkPack('pl.json', copied)
    expect(result.violations).toEqual([])
    expect(result.coverage).toMatchObject({
      translated: ALL.length,
      effective: 0,
      status: 'scaffold',
    })
    // And therefore rule 9 does not ask for it to be published. `en`'s own
    // coverage is present because otherwise its export has no pack, which is a
    // different clause of the same rule.
    const enCoverage = checkPack('en.json', JSON.parse(readFileSync(join(LOCALES_DIR, 'en.json'), 'utf8'))).coverage
    expect(checkPackExports(['./i18n/locales/en.json'], [enCoverage!, result.coverage!])).toEqual([])
  })
})
