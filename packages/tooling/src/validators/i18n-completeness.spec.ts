import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  checkRegister,
  isUntranslated,
  measurePack,
  pluralCategoryGaps,
  readConfig,
  requiredPluralCategories,
  scriptFindings,
  scriptFontToken,
  scriptForLocale,
  trackedFontBinaries,
} from './i18n-completeness.ts'
import { catalogKeys, LOCALES_DIR } from './i18n-packs.ts'

/**
 * `validate:i18n-completeness` (TASK-S5-O1) — every rule seeded to fail once, so
 * the gate is proven to fire rather than assumed to.
 *
 * The plural-category block is the reason this file runs **before** any
 * translator is engaged: the categories are asserted against non-English rule
 * sets (Polish, Arabic, Welsh, Japanese, Russian ordinals) with no translation
 * in the repository at all. What is tested is the *category set*, never a
 * translated sentence — a sentence would need a speaker to review it, and a
 * category set is CLDR.
 */

const ALL = catalogKeys()
const CONFIG = readConfig()

/** A pack with every key an explicit fallback, except the translations given. */
function pack(locale: string, translations: Record<string, Record<string, string>> = {}, overrides: Record<string, unknown> = {}) {
  const translated = new Set(Object.entries(translations).flatMap(([group, keys]) => Object.keys(keys).map(key => `${group}.${key}`)))
  return {
    locale,
    direction: 'ltr',
    fallback: ALL.filter(key => !translated.has(key)),
    messages: translations,
    ...overrides,
  }
}

function rulesOf(locale: string, translations: Record<string, Record<string, string>>): string[] {
  return measurePack(`${locale}.json`, pack(locale, translations), CONFIG).violations.map(v => v.rule)
}

// ---------------------------------------------------------------------------
// The categories themselves — CLDR through Intl, not a table
// ---------------------------------------------------------------------------

describe('requiredPluralCategories reads the platform CLDR', () => {
  it.each([
    ['en', ['one', 'other']],
    ['de', ['one', 'other']],
    ['pl', ['few', 'many', 'one', 'other']],
    ['ar', ['few', 'many', 'one', 'other', 'two', 'zero']],
    ['cy', ['few', 'many', 'one', 'other', 'two', 'zero']],
    ['ja', ['other']],
    ['ru', ['few', 'many', 'one', 'other']],
  ])('%s selects %j', (locale, expected) => {
    expect(requiredPluralCategories(locale)).toEqual(expected)
  })

  it('ordinal rules differ from cardinal ones — English has four ordinal categories', () => {
    expect(requiredPluralCategories('en', 'ordinal')).toEqual(['few', 'one', 'other', 'two'])
    expect(requiredPluralCategories('en', 'cardinal')).toEqual(['one', 'other'])
  })

  it('an unresolvable tag cannot decide, and cannot-decide is never a pass', () => {
    expect(requiredPluralCategories('not a tag')).toEqual([])
    // With no required set there is nothing to be missing, so no violation is
    // invented either — the tag itself is `i18n-packs`' `shape` failure.
    expect(pluralCategoryGaps('not a tag', '{count, plural, other {#}}')).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Rule: plural-categories — the defect no existing gate can see
// ---------------------------------------------------------------------------

describe('rule plural-categories', () => {
  it('a Polish plural with only one/other is missing few and many', () => {
    expect(pluralCategoryGaps('pl', '{count, plural, one {# dzien} other {# dni}}')).toEqual([
      { argument: 'count', type: 'cardinal', missing: ['few', 'many'], unused: [] },
    ])
  })

  it('an Arabic plural with only one/other is missing four of six categories', () => {
    expect(pluralCategoryGaps('ar', '{count, plural, one {x} other {y}}')).toEqual([
      { argument: 'count', type: 'cardinal', missing: ['few', 'many', 'two', 'zero'], unused: [] },
    ])
  })

  it('=N exact selectors do not substitute for a category — =1 is not `one`', () => {
    // `=1` matches exactly 1; Russian's `one` also matches 21, 31, 101.
    expect(pluralCategoryGaps('ru', '{count, plural, =1 {a} =2 {b} other {c}}')[0]?.missing)
      .toEqual(['few', 'many', 'one'])
  })

  it('a complete Polish plural passes', () => {
    expect(pluralCategoryGaps('pl', '{count, plural, one {a} few {b} many {c} other {d}}')).toEqual([])
  })

  it('reaches a plural nested inside a select', () => {
    const message = '{kind, select, file {{count, plural, one {a} other {b}}} other {x}}'
    expect(pluralCategoryGaps('pl', message)[0]?.missing).toEqual(['few', 'many'])
  })

  it('a category the locale never selects is `unused`, not `missing` — report, not failure', () => {
    const gaps = pluralCategoryGaps('ja', '{count, plural, one {a} other {b}}')
    expect(gaps).toEqual([{ argument: 'count', type: 'cardinal', missing: [], unused: ['one'] }])
    // An unused branch renders nothing wrong, so it must not fail the gate.
    expect(rulesOf('ja', { DzCountdown: { days: '{count, plural, one {a} other {b}}' } })).toEqual([])
  })

  it('a syntax error is not counted twice — `i18n-packs` rule 3 owns it', () => {
    expect(pluralCategoryGaps('pl', '{count, plural, one {a}')).toEqual([])
  })

  it('fires through measurePack on a seeded Polish pack, and names the categories', () => {
    const seeded = measurePack('pl.json', pack('pl', {
      DzCountdown: { days: '{count, plural, one {# dzien} other {# dni}}' },
    }), CONFIG)
    expect(seeded.violations.map(v => v.rule)).toEqual(['plural-categories'])
    expect(seeded.violations[0]?.message).toContain('"few", "many"')
    expect(seeded.row?.pluralErrors).toBe(1)
  })

  it('the English catalog satisfies its own rule set — 10 plural messages, all one+other', () => {
    const en = JSON.parse(readFileSync(join(LOCALES_DIR, 'en.json'), 'utf8'))
    const result = measurePack('en.json', en, CONFIG)
    expect(result.violations).toEqual([])
    expect(result.row?.pluralErrors).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Identical-to-English
// ---------------------------------------------------------------------------

describe('identical-to-English arithmetic', () => {
  it('normalises whitespace but not case — a case change is not a translation', () => {
    expect(isUntranslated('Close', 'Close')).toBe(true)
    expect(isUntranslated('Close', '  Close ')).toBe(true)
    expect(isUntranslated('No  options found', 'No options found')).toBe(true)
    expect(isUntranslated('Close', 'close')).toBe(false)
    expect(isUntranslated('Close', 'Schliessen')).toBe(false)
  })

  it('an identical value is not counted as translated, so completeness drops', () => {
    const copied = measurePack('xx.json', pack('xx', { DzAlert: { close: 'Close' } }), CONFIG)
    expect(copied.row).toMatchObject({ translated: 1, identical: 1, completeness: 0 })
    const real = measurePack('xx.json', pack('xx', { DzAlert: { close: 'Schliessen' } }), CONFIG)
    expect(real.row).toMatchObject({ translated: 1, identical: 0 })
    expect(real.row!.completeness).toBeGreaterThan(0)
  })

  it('a pack that copied English wholesale reads 0 %, not 100 %', () => {
    const en = JSON.parse(readFileSync(join(LOCALES_DIR, 'en.json'), 'utf8')) as { messages: Record<string, Record<string, string>> }
    const laundered = measurePack('xx.json', { locale: 'xx', direction: 'ltr', fallback: [], messages: en.messages }, CONFIG)
    expect(laundered.row?.translated).toBe(ALL.length)
    expect(laundered.row?.identical).toBe(ALL.length)
    expect(laundered.row?.completeness).toBe(0)
    expect(laundered.row?.supported).toBe(false)
  })

  it('`en` is the source and is never measured against itself', () => {
    const en = JSON.parse(readFileSync(join(LOCALES_DIR, 'en.json'), 'utf8'))
    expect(measurePack('en.json', en, CONFIG).row).toMatchObject({
      role: 'source',
      identical: 0,
      completeness: 100,
      supported: true,
    })
  })
})

// ---------------------------------------------------------------------------
// Rule: arity — reported here, computed by `i18n-packs`
// ---------------------------------------------------------------------------

describe('rule arity', () => {
  it('a dropped interpolation is a failure, not a warning', () => {
    const rules = rulesOf('xx', { DzTagsInput: { countOfMax: '{count, plural, one {# tag} other {# tags}}' } })
    expect(rules).toContain('arity')
  })

  it('the message cites the owning `i18n-packs` rule, so the two gates cannot disagree', () => {
    const seeded = measurePack('xx.json', pack('xx', {
      DzTagsInput: { countOfMax: '{count, plural, one {# tag} other {# tags}}' },
    }), CONFIG)
    expect(seeded.violations.find(v => v.rule === 'arity')?.message)
      .toContain('validate:i18n-packs rule arguments')
    expect(seeded.row?.arityErrors).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// The register and the floor
// ---------------------------------------------------------------------------

function row(locale: string, completeness: number, scaffoldDecision: string | null = null) {
  return {
    locale,
    direction: 'ltr' as const,
    role: 'translation' as const,
    keys: ALL.length,
    translated: 0,
    identical: 0,
    missing: 0,
    arityErrors: 0,
    pluralErrors: 0,
    pluralUnused: 0,
    completeness,
    script: scriptForLocale(locale),
    supported: completeness >= CONFIG.supported.minCompletenessPercent,
    scaffoldDecision,
  }
}

describe('the register and the supported floor', () => {
  it('rule undeclared-scaffold — an incomplete pack not on the record fails', () => {
    const out = checkRegister([row('en', 100), row('de', 0, 'D59'), row('fr', 12)], CONFIG)
    expect(out.map(v => v.rule)).toEqual(['undeclared-scaffold'])
    expect(out[0]?.message).toContain('12 % complete')
  })

  it('a declared scaffold at 0 % passes — that is what the register is for', () => {
    expect(checkRegister([row('en', 100), row('de', 0, 'D59')], CONFIG)).toEqual([])
  })

  it('rule stale-declaration — a register entry that outlived its gap fails', () => {
    const out = checkRegister([row('en', 100), row('de', 99, 'D59')], CONFIG)
    expect(out.map(v => v.rule)).toEqual(['stale-declaration'])
  })

  it('rule stale-declaration — a register entry naming a pack that does not exist fails', () => {
    expect(checkRegister([row('en', 100)], CONFIG).map(v => v.rule)).toEqual(['stale-declaration'])
  })

  it('rule supported-floor — losing a supported locale fails, and the floor may only rise', () => {
    const out = checkRegister([row('de', 0, 'D59')], CONFIG)
    expect(out.map(v => v.rule)).toContain('supported-floor')
    expect(out.find(v => v.rule === 'supported-floor')?.message).toContain('may only RISE')
  })

  it('the floor is a floor, not a ceiling — two supported locales pass a floor of one', () => {
    expect(checkRegister([row('en', 100), row('fr', 97), row('de', 0, 'D59')], CONFIG)
      .map(v => v.rule)).toEqual([])
  })

  it('the threshold is 95, chosen so legitimately identical values do not cap a pack', () => {
    expect(CONFIG.supported.minCompletenessPercent).toBe(95)
  })
})

// ---------------------------------------------------------------------------
// Script and typeface — AR-2 re-measured
// ---------------------------------------------------------------------------

describe('script support', () => {
  it.each([
    ['en', 'latin'],
    ['de', 'latin'],
    ['pt-BR', 'latin'],
    ['ar', 'arabic'],
    ['ar-EG', 'arabic'],
    ['fa', 'arabic'],
    ['ur', 'arabic'],
    ['he', 'hebrew'],
    ['yi', 'hebrew'],
  ])('%s is written in %s', (locale, script) => {
    expect(scriptForLocale(locale)).toBe(script)
  })

  it('zero font binaries are tracked in this repository — AR-2, re-measured', () => {
    expect(trackedFontBinaries()).toEqual([])
  })

  it('no `--dz-font-family-arabic` token exists yet — D63 option B is unlanded', () => {
    expect(scriptFontToken('arabic')).toBeNull()
    expect(scriptFontToken('hebrew')).toBeNull()
  })

  it('the Arabic finding is reported even though no Arabic pack exists', () => {
    // The whole point: it iterates the register, not the packs, so the absence
    // cannot vanish with the last Arabic pack — which is the state today.
    const findings = scriptFindings([row('en', 100), row('de', 0, 'D59')], CONFIG)
    const arabic = findings.find(f => f.key === 'arabic')
    expect(arabic?.message).toContain('none')
    expect(arabic?.message).toContain('D63')
    expect(arabic?.message).toContain('no pack exercises it')
    expect(arabic?.message).toContain('unasserted, not passing')
  })

  it('script findings never carry a failing rule — option C is a position, not a defect', () => {
    expect(scriptFindings([row('ar', 100)], CONFIG).every(f => f.rule === 'script-support')).toBe(true)
  })

  it('a script no register entry describes is reported unasserted, never passing', () => {
    const findings = scriptFindings([{ ...row('en', 100), script: 'unknown' }], CONFIG)
    expect(findings.some(f => f.key === 'unknown' && f.message.includes('unasserted, not passing'))).toBe(true)
  })

  it('`//` and `$…` prose keys in the register are not reported as scripts', () => {
    expect(scriptFindings([row('en', 100)], CONFIG).map(f => f.key)).not.toContain('//')
  })
})

// ---------------------------------------------------------------------------
// The checked-in packs, at this commit
// ---------------------------------------------------------------------------

describe('the checked-in packs', () => {
  it.each(['en', 'de'])('%s.json passes the completeness gate', (locale) => {
    const raw = JSON.parse(readFileSync(join(LOCALES_DIR, `${locale}.json`), 'utf8'))
    expect(measurePack(`${locale}.json`, raw, CONFIG).violations).toEqual([])
  })

  it('de is reported as a 0 % scaffold, on the record, and NOT as a supported locale', () => {
    const raw = JSON.parse(readFileSync(join(LOCALES_DIR, 'de.json'), 'utf8'))
    expect(measurePack('de.json', raw, CONFIG).row).toMatchObject({
      locale: 'de',
      translated: 0,
      completeness: 0,
      supported: false,
      scaffoldDecision: 'D59',
    })
  })

  it('exactly one locale is at or above the threshold today, and the register says why', () => {
    const rows = ['en', 'de'].map((locale) => {
      const raw = JSON.parse(readFileSync(join(LOCALES_DIR, `${locale}.json`), 'utf8'))
      return measurePack(`${locale}.json`, raw, CONFIG).row!
    })
    expect(rows.filter(r => r.supported).map(r => r.locale)).toEqual(['en'])
    expect(checkRegister(rows, CONFIG)).toEqual([])
    expect(CONFIG.scaffolds.map(s => s.locale)).toEqual(['de'])
  })
})
