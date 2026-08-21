import type { AnatomyPart, ComponentAnatomy, DzClassValue, UiOverrides } from './anatomy.types'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { ANATOMY_PART_VOCABULARY } from './anatomy.types'

/**
 * Specs for the anatomy contract (TASK-OSS-P3-02, ADR-19).
 *
 * `@dzup-ui/contracts` is types-only, so most of what matters here is checked
 * with `expectTypeOf`: the derived `AnatomyPart` and `UiOverrides` are what make
 * a mistyped part name a compile error instead of a class that lands nowhere,
 * and a type that silently widened to `string` would keep every existing test
 * green while removing the whole guarantee.
 */

/**
 * `satisfies` rather than an annotation, and `typeof` rather than the value:
 * the derived types read the *literal* shape, so widening either fixture to
 * `ComponentAnatomy` would make every assertion below vacuously true.
 */
export const buttonAnatomy = {
  parts: ['root', 'spinner'],
  optionalParts: ['spinner'],
  states: ['idle', 'loading', 'disabled'],
  componentTokens: ['--dz-button-font-weight'],
  recipes: ['variant', 'size', 'tone'],
  riskTier: 'A',
} as const satisfies ComponentAnatomy

export const renderlessAnatomy = {
  parts: 'none',
  states: [],
  componentTokens: [],
  riskTier: 'D',
} as const satisfies ComponentAnatomy

describe('the shared part vocabulary', () => {
  it('names each role once', () => {
    expect(new Set(ANATOMY_PART_VOCABULARY).size).toBe(ANATOMY_PART_VOCABULARY.length)
  })

  it('is kebab-case throughout, as the ADR requires', () => {
    for (const part of ANATOMY_PART_VOCABULARY)
      expect(part, part).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  it('starts from root, the one part every rendering component has', () => {
    expect(ANATOMY_PART_VOCABULARY[0]).toBe('root')
  })
})

describe('anatomyPart', () => {
  it('is the union of the declared part names', () => {
    expectTypeOf<AnatomyPart<typeof buttonAnatomy>>().toEqualTypeOf<'root' | 'spinner'>()
  })

  it('is never for a renderless component, so `ui` has no keys to offer', () => {
    expectTypeOf<AnatomyPart<typeof renderlessAnatomy>>().toEqualTypeOf<never>()
  })

  it('does not widen to string', () => {
    // The guarantee is exactly this: a part name that does not exist must not
    // type-check. If this ever passes, `ui` accepts typos again.
    expectTypeOf<AnatomyPart<typeof buttonAnatomy>>().not.toEqualTypeOf<string>()
  })
})

describe('uiOverrides', () => {
  it('accepts a declared part', () => {
    const ui: UiOverrides<typeof buttonAnatomy> = { spinner: 'size-4 text-white' }
    expect(ui.spinner).toBe('size-4 text-white')
  })

  it('accepts every class value shape cn() takes', () => {
    const ui: UiOverrides<typeof buttonAnatomy> = {
      root: ['a', { b: true }, undefined, 1, null],
    }
    expect(Array.isArray(ui.root)).toBe(true)
  })

  it('is partial, and each value is a class value', () => {
    expectTypeOf<UiOverrides<typeof buttonAnatomy>>()
      .toEqualTypeOf<Partial<Record<'root' | 'spinner', DzClassValue>>>()
  })

  it('rejects a part the anatomy does not declare', () => {
    // @ts-expect-error `label` is not a DzButton part — it is slot content the
    // component wraps in nothing (see DzButton.anatomy.ts).
    const ui: UiOverrides<typeof buttonAnatomy> = { label: 'font-bold' }
    expect(ui).toBeDefined()
  })
})

describe('componentAnatomy', () => {
  it('requires a token name to look like a token', () => {
    const anatomy = {
      parts: ['root'],
      states: [],
      // @ts-expect-error component tokens are `--dz-*`; a bare name is not one.
      componentTokens: ['button-bg'],
      riskTier: 'C',
    } as const satisfies ComponentAnatomy
    expect(anatomy.componentTokens).toHaveLength(1)
  })

  it('rejects a recipe axis that is not one of the five', () => {
    const anatomy = {
      parts: ['root'],
      states: [],
      componentTokens: [],
      // @ts-expect-error `colour` is not a recipe axis; the five are fixed.
      recipes: ['colour'],
      riskTier: 'C',
    } as const satisfies ComponentAnatomy
    expect(anatomy.recipes).toHaveLength(1)
  })

  it('rejects a risk tier outside A-D', () => {
    const anatomy = {
      parts: ['root'],
      states: [],
      componentTokens: [],
      // @ts-expect-error tiers are A, B, C, D — "critical" is a description.
      riskTier: 'critical',
    } as const satisfies ComponentAnatomy
    expect(anatomy.riskTier).toBe('critical')
  })
})
