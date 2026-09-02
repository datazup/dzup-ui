/**
 * Tests for the DTCG 2025.10 projection (TASK-N2-T1).
 *
 * Two jobs. The value parsers are tested against the CSS syntax the token maps
 * actually ship, including the shapes that must be *refused* — a parser that
 * quietly accepted `0.05em` as a DTCG dimension would put a wrong number in
 * front of every consumer, and no round-trip gate could see it because both
 * sides would agree on the same wrong number.
 *
 * The document-level tests assert the invariants that make the export safe to
 * publish: no token is renamed, no value is given a type the spec does not
 * have, aliases stay aliases, and two builds are byte-identical.
 */

import type { DtcgColorValue, DtcgDimensionValue } from './dtcg.js'

import { describe, expect, it } from 'vitest'
import {
  buildDtcgDocument,
  COMPONENT_GROUPS,
  cssVariableRules,
  DEPRECATED_TOKENS,
  DTCG_SCHEMA_URL,
  DTCG_SPEC_VERSION,

  parseCubicBezier,
  parseDimension,
  parseDuration,
  parseFontFamily,
  parseFontWeight,
  parseNumber,
  parseOklchColor,
  parseShadow,
  PRIMITIVE_GROUPS,
  serializeDtcgDocument,
} from './dtcg.js'

/** Every `$type` the DTCG Format module 2025.10 defines. Nothing else is legal. */
const SPEC_TYPES = new Set([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'strokeStyle',
  'border',
  'transition',
  'shadow',
  'gradient',
  'typography',
])

const BUILD_OPTIONS = { packageVersion: '0.0.0-test' }

function ok(outcome: ReturnType<typeof parseDimension>): unknown {
  if (!outcome.ok)
    throw new Error(`expected a parse, got: ${outcome.reason}`)
  return outcome.value
}

describe('dtcg value parsers', () => {
  describe('color', () => {
    it('reads an oklch triple at the precision the stylesheet ships', () => {
      // The CSS carries `0.550 0.2200 260.0`, not the higher-precision float
      // behind it. The export must agree with the stylesheet, not with the maths.
      expect(ok(parseOklchColor('oklch(0.550 0.2200 260.0)'))).toEqual({
        colorSpace: 'oklch',
        components: [0.55, 0.22, 260],
      })
    })

    it('omits alpha when the CSS has none, and carries it when it does', () => {
      expect((ok(parseOklchColor('oklch(1 0 0)')) as DtcgColorValue).alpha).toBeUndefined()
      expect((ok(parseOklchColor('oklch(0 0 0 / 0.6)')) as DtcgColorValue).alpha).toBe(0.6)
    })

    it('refuses components outside the ranges the Color module defines', () => {
      // Hue is [0,360) — 360 is excluded, and the gate must say so rather than
      // emit a value a conformant reader would reject.
      expect(parseOklchColor('oklch(0.5 0.1 360)').ok).toBe(false)
      expect(parseOklchColor('oklch(1.5 0.1 200)').ok).toBe(false)
      expect(parseOklchColor('oklch(0.5 0.1 200 / 1.4)').ok).toBe(false)
    })

    it('refuses a colour space this system does not emit', () => {
      expect(parseOklchColor('rgb(1 2 3)').ok).toBe(false)
    })
  })

  describe('dimension', () => {
    it('reads px and rem', () => {
      expect(ok(parseDimension('0.25rem'))).toEqual({ value: 0.25, unit: 'rem' })
      expect(ok(parseDimension('9999px'))).toEqual({ value: 9999, unit: 'px' })
    })

    it('treats a bare 0 as 0px, which is what CSS does', () => {
      // `--dz-radius-none` ships `0` while `--dz-spacing-0` ships `0px`; the
      // projection normalises rather than editing the maps.
      expect(ok(parseDimension('0'))).toEqual({ value: 0, unit: 'px' })
    })

    it('refuses units the spec does not define, and names the unit', () => {
      const em = parseDimension('0.05em')
      expect(em.ok).toBe(false)
      if (!em.ok)
        expect(em.reason).toContain('em')
      const vw = parseDimension('100vw')
      expect(vw.ok).toBe(false)
      if (!vw.ok)
        expect(vw.reason).toContain('vw')
    })

    it('refuses a calc-family function rather than guessing a number out of it', () => {
      expect(parseDimension('clamp(1.75rem, 3vw, 2.375rem)').ok).toBe(false)
    })
  })

  it('reads durations', () => {
    expect(ok(parseDuration('150ms'))).toEqual({ value: 150, unit: 'ms' })
    expect(parseDuration('150').ok).toBe(false)
  })

  it('reads unitless numbers and bounded font weights', () => {
    expect(ok(parseNumber('1.375'))).toBe(1.375)
    expect(ok(parseFontWeight('600'))).toBe(600)
    expect(parseFontWeight('0').ok).toBe(false)
    expect(parseFontWeight('1001').ok).toBe(false)
  })

  describe('cubicBezier', () => {
    it('reads four numbers', () => {
      expect(ok(parseCubicBezier('cubic-bezier(0.4, 0, 0.2, 1)'))).toEqual([0.4, 0, 0.2, 1])
    })

    it('allows y to overshoot but bounds x to [0,1]', () => {
      // `--dz-ease-bounce` is exactly this case: y outside [0,1] is legal.
      expect(ok(parseCubicBezier('cubic-bezier(0.68, -0.55, 0.27, 1.55)')))
        .toEqual([0.68, -0.55, 0.27, 1.55])
      expect(parseCubicBezier('cubic-bezier(1.4, 0, 0.2, 1)').ok).toBe(false)
    })
  })

  it('reads a font stack as names, dropping CSS quoting', () => {
    expect(ok(parseFontFamily(`'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace`)))
      .toEqual(['JetBrains Mono', 'ui-monospace', 'Cascadia Code', 'monospace'])
  })

  describe('shadow', () => {
    it('splits a multi-layer shadow into an array and fills the implicit spread', () => {
      const value = ok(parseShadow('0 1px 3px oklch(0 0 0 / 0.10), 0 1px 2px oklch(0 0 0 / 0.06)'))
      expect(Array.isArray(value)).toBe(true)
      const layers = value as { blur: DtcgDimensionValue, spread: DtcgDimensionValue }[]
      expect(layers).toHaveLength(2)
      // CSS omits a zero spread; the DTCG schema requires it.
      expect(layers[0]?.spread).toEqual({ value: 0, unit: 'px' })
      expect(layers[0]?.blur).toEqual({ value: 3, unit: 'px' })
    })

    it('carries `inset` as the boolean the schema defines', () => {
      const value = ok(parseShadow('inset 0 2px 4px oklch(0 0 0 / 0.07)')) as { inset?: boolean }
      expect(value.inset).toBe(true)
    })

    it('refuses the `none` keyword instead of inventing an empty shadow', () => {
      const outcome = parseShadow('none')
      expect(outcome.ok).toBe(false)
      if (!outcome.ok)
        expect(outcome.reason).toContain('none')
    })
  })
})

describe('dtcg document', () => {
  const { document, untyped, counts, pathToCssVariable } = buildDtcgDocument(BUILD_OPTIONS)

  interface TokenNode {
    $type?: unknown
    $value?: unknown
    $deprecated?: unknown
    $extensions?: { 'com.dzup'?: { cssVariable?: unknown, cssValue?: unknown } }
  }

  function walk(node: unknown, path: string[], visit: (path: string[], token: TokenNode) => void): void {
    if (typeof node !== 'object' || node === null || Array.isArray(node))
      return
    const record = node as Record<string, unknown>
    if ('$value' in record) {
      visit(path, record as TokenNode)
      return
    }
    for (const [key, child] of Object.entries(record)) {
      if (key.startsWith('$'))
        continue
      walk(child, [...path, key], visit)
    }
  }

  const tokens: { path: string[], token: TokenNode }[] = []
  walk(document, [], (path, token) => tokens.push({ path, token }))

  it('declares the 2025.10 schema and spec version', () => {
    expect(document.$schema).toBe(DTCG_SCHEMA_URL)
    expect(DTCG_SPEC_VERSION).toBe('2025.10')
  })

  it('emits the three tiers as groups', () => {
    expect(Object.keys(document)).toEqual(
      expect.arrayContaining(['primitive', 'semantic', 'component']),
    )
    const semantic = document.semantic as Record<string, unknown>
    expect(Object.keys(semantic).sort()).toEqual(['dark', 'light'])
  })

  it('uses only names the Format module allows', () => {
    // "must not begin with $; must never contain {, } or ."
    for (const { path } of tokens) {
      for (const segment of path) {
        expect(segment.startsWith('$')).toBe(false)
        expect(segment).not.toMatch(/[{}.]/)
      }
    }
  })

  it('gives every token a spec `$type` — never an invented one', () => {
    expect(tokens.length).toBeGreaterThan(0)
    for (const { path, token } of tokens) {
      expect(SPEC_TYPES.has(token.$type as string), `${path.join('.')} has $type ${String(token.$type)}`)
        .toBe(true)
    }
  })

  it('stamps every token with the exact --dz-* name it projects', () => {
    for (const { path, token } of tokens) {
      const cssVariable = token.$extensions?.['com.dzup']?.cssVariable
      expect(typeof cssVariable, path.join('.')).toBe('string')
      expect(String(cssVariable).startsWith('--dz-')).toBe(true)
      expect(pathToCssVariable.get(path.join('.'))).toBe(cssVariable)
    }
  })

  it('keeps a var() reference as a DTCG alias rather than resolving it', () => {
    let aliasCount = 0
    for (const { path, token } of tokens) {
      const cssValue = String(token.$extensions?.['com.dzup']?.cssValue ?? '')
      if (!/^var\(--dz-[a-z0-9_-]+\)$/.test(cssValue))
        continue
      aliasCount += 1
      expect(typeof token.$value, path.join('.')).toBe('string')
      expect(String(token.$value)).toMatch(/^\{[^{}]+\}$/)
    }
    expect(aliasCount).toBe(counts.aliases)
    expect(aliasCount).toBeGreaterThan(300)
  })

  it('records every inexpressible token with a reason instead of a fake type', () => {
    expect(untyped.length).toBe(counts.untyped)
    const emitted = new Set(tokens.map(entry => entry.path.join('.')))
    for (const record of untyped) {
      // An untyped token is NOT emitted as a token — a token whose $type cannot
      // be resolved is invalid per the spec.
      expect(emitted.has(record.path), `${record.path} must not be emitted as a token`).toBe(false)
      expect(record.reason.trim().length).toBeGreaterThan(0)
      expect(record.cssVariable.startsWith('--dz-')).toBe(true)
    }
  })

  it('accounts for every planned token exactly once', () => {
    expect(counts.typed + counts.untyped).toBe(counts.total)
    expect(tokens.length).toBe(counts.typed)
  })

  it('carries the ABI statement and the untyped set in $extensions', () => {
    const extensions = (document.$extensions as Record<string, unknown>)['com.dzup'] as Record<string, unknown>
    const abi = extensions.runtimeAbi as Record<string, unknown>
    expect(abi.prefix).toBe('--dz-')
    expect(String(abi.statement)).toContain('runtime ABI')
    expect(Object.keys(extensions.untyped as object)).toHaveLength(counts.untyped)
  })

  it('publishes a path→CSS-variable rule for every group it emits', () => {
    const rules = cssVariableRules()
    const prefixes = new Set(rules.map(rule => rule.pathPrefix))
    for (const spec of PRIMITIVE_GROUPS) expect(prefixes.has(`primitive.${spec.group}`)).toBe(true)
    for (const spec of COMPONENT_GROUPS) expect(prefixes.has(`component.${spec.group}`)).toBe(true)
    expect(prefixes.has('semantic.light')).toBe(true)
    expect(prefixes.has('semantic.dark')).toBe(true)
  })

  it('marks the deprecated sidebar aliases with $deprecated', () => {
    const byCssVariable = new Map(
      tokens.map(entry => [String(entry.token.$extensions?.['com.dzup']?.cssVariable), entry.token]),
    )
    for (const name of Object.keys(DEPRECATED_TOKENS)) {
      expect(byCssVariable.get(name)?.$deprecated, name).toBe(DEPRECATED_TOKENS[name])
    }
  })

  it('is deterministic — two builds serialise to the same bytes', () => {
    const first = serializeDtcgDocument(buildDtcgDocument(BUILD_OPTIONS).document)
    const second = serializeDtcgDocument(buildDtcgDocument(BUILD_OPTIONS).document)
    expect(first).toBe(second)
    expect(first).not.toMatch(/\d{4}-\d{2}-\d{2}T/)
  })
})
