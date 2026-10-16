import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * UI-DZUP-UI-DESIGN-H-01 — component-token declaration scope.
 *
 * The styling contract promises that re-mapping a component token makes every
 * instance follow (apps/docs/guide/styling-contract.md). A custom property
 * declared on the component element itself always beats the value that element
 * would inherit, so a consumer rule such as
 * `:root { --dz-calendar-selected-bg: red }` only reaches the calendar if
 * base.css declares the default at root scope, never on `.dz-calendar`.
 *
 * jsdom does not resolve custom properties through @layer, so the cascade is
 * checked against the stylesheet text: who declares each token, and where.
 */
const HERE = dirname(fileURLToPath(import.meta.url))
const BASE_CSS = readFileSync(resolve(HERE, 'base.css'), 'utf-8')
const CORE_SRC = resolve(HERE, '..')

interface Rule {
  readonly selector: string
  readonly names: readonly string[]
}

/** The `@layer dz-components { … }` block, comments stripped. */
function componentsLayer(): string {
  const css = BASE_CSS.replace(/\/\*[\s\S]*?\*\//g, '')
  const open = css.indexOf('@layer dz-components {')
  expect(open, 'base.css has no @layer dz-components block').toBeGreaterThanOrEqual(0)
  let depth = 0
  for (let i = css.indexOf('{', open); i < css.length; i++) {
    if (css[i] === '{')
      depth++
    else if (css[i] === '}' && --depth === 0)
      return css.slice(css.indexOf('{', open) + 1, i)
  }
  throw new Error('unterminated @layer dz-components block')
}

/** Every flat rule in the layer that declares at least one --dz-* property. */
function tokenRules(): Rule[] {
  const rules: Rule[] = []
  for (const match of componentsLayer().matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const names = [...match[2]!.matchAll(/(--dz-[\w-]+)\s*:/g)].map(m => m[1]!)
    if (names.length > 0)
      rules.push({ selector: match[1]!.trim().replace(/\s+/g, ' '), names })
  }
  return rules
}

const ROOT_SELECTOR = ':where(:root)'
/** The per-instance hooks that may stay element-scoped. */
const VARIANT_HOOK = /^\.dz-[a-z-]+\[data-(?:size|variant|tone)='[\w-]+'\]$/

const rules = tokenRules()
const rootNames = new Set(rules.filter(r => r.selector === ROOT_SELECTOR).flatMap(r => r.names))
const variantNames = new Set(rules.filter(r => r.selector !== ROOT_SELECTOR).flatMap(r => r.names))

describe('component tokens in base.css (UI-DZUP-UI-DESIGN-H-01)', () => {
  it('declares every default at :where(:root), not on the component element', () => {
    expect(rootNames.size).toBeGreaterThan(100)
    for (const { selector, names } of rules) {
      if (selector === ROOT_SELECTOR)
        continue
      // Anything else must be a per-instance variant hook, e.g.
      // `.dz-calendar[data-size='sm']`. A bare `.dz-calendar { --dz-… }` is the
      // regression: it shadows a consumer re-map for every instance.
      for (const part of selector.split(',')) {
        expect(part.trim(), `${names.join(', ')} declared on a component element`).toMatch(VARIANT_HOOK)
      }
    }
  })

  it('gives every variant-scoped token a root default to fall back to', () => {
    for (const name of variantNames)
      expect(rootNames.has(name), `${name} has no :where(:root) default`).toBe(true)
  })

  it('leaves every token outside a variant hook re-mappable from :root', () => {
    // Every family keeps tokens a consumer can re-map at :root and see on every
    // instance; the only ones an element can still override are the variant
    // hooks, which are per-instance by definition.
    const families = new Map<string, string[]>()
    for (const name of rootNames) {
      if (variantNames.has(name))
        continue
      const family = rules.find(r => r.selector === ROOT_SELECTOR && r.names.includes(name))!
      const key = family.names[0]!
      families.set(key, [...(families.get(key) ?? []), name])
    }
    expect(families.size).toBe(rules.filter(r => r.selector === ROOT_SELECTOR).length)
    expect(rootNames.has('--dz-calendar-selected-bg')).toBe(true)
    expect(variantNames.has('--dz-calendar-selected-bg')).toBe(false)
  })

  it('the calendar selected cell reads the re-mappable token', () => {
    const recipe = readFileSync(resolve(CORE_SRC, 'components/data/DzCalendar.variants.ts'), 'utf-8')
    expect(recipe).toContain('data-[selected]:bg-[var(--dz-calendar-selected-bg)]')
  })

  it('declares no component token anywhere else in base.css', () => {
    // A second declaration on the element in another layer would re-introduce
    // the shadowing this spec exists for.
    const css = BASE_CSS.replace(/\/\*[\s\S]*?\*\//g, '')
    const outside = css.replace(componentsLayer(), '')
    for (const name of rootNames)
      expect(outside.includes(`${name}:`), `${name} redeclared outside dz-components`).toBe(false)
  })
})
