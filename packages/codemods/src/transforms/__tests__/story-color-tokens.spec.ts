/**
 * Tests for the story-color-tokens transform (TASK-DS-05).
 *
 * The transform's contract has two halves, and both are load-bearing:
 * it rewrites what it can classify, and it *refuses* to rewrite what it
 * cannot — reporting instead of guessing.
 */

import { describe, expect, it } from 'vitest'
import { resolveClassList, transformStoryColors } from '../story-color-tokens.js'

/** Rewrite a bare class list and return the result. */
function cls(classList: string): string {
  return resolveClassList(classList).classList
}

/** Reasons the transform gave for declining a class list. */
function reasons(classList: string): string[] {
  return resolveClassList(classList).unclassified.map(u => u.utility)
}

describe('story-color-tokens: neutral family → semantic tokens', () => {
  it('maps secondary-text grays to --dz-muted-foreground', () => {
    expect(cls('text-sm text-gray-500')).toBe('text-sm text-[var(--dz-muted-foreground)]')
    expect(cls('text-gray-400')).toBe('text-[var(--dz-muted-foreground)]')
    expect(cls('text-gray-600')).toBe('text-[var(--dz-muted-foreground)]')
  })

  it('maps body-text grays to --dz-foreground', () => {
    expect(cls('text-gray-900')).toBe('text-[var(--dz-foreground)]')
    expect(cls('text-slate-700')).toBe('text-[var(--dz-foreground)]')
  })

  it('maps subtle surfaces to --dz-muted and borders to --dz-border', () => {
    expect(cls('bg-gray-50')).toBe('bg-[var(--dz-muted)]')
    expect(cls('bg-gray-100')).toBe('bg-[var(--dz-muted)]')
    expect(cls('border-gray-200')).toBe('border-[var(--dz-border)]')
    expect(cls('border-gray-300')).toBe('border-[var(--dz-border)]')
  })

  it('treats a base+hover gray pair as a button, not a surface', () => {
    expect(cls('px-3 bg-gray-200 rounded hover:bg-gray-300')).toBe(
      'px-3 bg-[var(--dz-secondary)] rounded hover:bg-[var(--dz-secondary-hover)]',
    )
  })

  it('maps a lone gray hover to --dz-muted', () => {
    expect(cls('px-2 hover:bg-gray-50')).toBe('px-2 hover:bg-[var(--dz-muted)]')
  })
})

describe('story-color-tokens: dark demo panels stay theme-invariant', () => {
  it('maps a dark panel to the primitive neutral ramp, not a semantic token', () => {
    // A semantic token would invert in dark mode and destroy the demo.
    expect(cls('bg-gray-800 text-gray-200')).toBe(
      'bg-[var(--dz-colors-neutral-800)] text-[var(--dz-colors-neutral-200)]',
    )
  })

  it('refuses a light gray text with no dark surface declared beside it', () => {
    expect(reasons('text-gray-200')).toEqual(['text-gray-200'])
    expect(cls('text-gray-200')).toBe('text-gray-200')
  })
})

describe('story-color-tokens: intent families', () => {
  it('maps status chips to the {intent}-muted pair', () => {
    expect(cls('bg-green-100 text-green-800')).toBe(
      'bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)]',
    )
    expect(cls('bg-blue-50 text-blue-800')).toBe(
      'bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]',
    )
  })

  it('never emits --dz-{intent} as a text colour (CLAUDE.md rule 1b)', () => {
    // text-{intent}-500/600 would fail AA on the page background.
    expect(cls('text-blue-600')).toBe('text-[var(--dz-primary-muted-foreground)]')
    expect(cls('text-red-500')).toBe('text-[var(--dz-danger-muted-foreground)]')
  })

  it('maps solid fills and resolves text-white against them', () => {
    expect(cls('bg-blue-600 text-white rounded')).toBe(
      'bg-[var(--dz-primary-solid)] text-[var(--dz-primary-foreground)] rounded',
    )
    expect(cls('bg-green-600 text-white')).toBe(
      'bg-[var(--dz-success-solid)] text-[var(--dz-success-foreground)]',
    )
  })

  it('maps every intent through the same -solid state set (TASK-DS-10)', () => {
    // `warning` used to need a branch here: its legible fill is a LIGHTER shade
    // than its intent color. Since DS-10 every intent answers to `-solid` /
    // `-solid-hover`, so the transform is uniform and warning is not special.
    expect(cls('bg-amber-500')).toBe('bg-[var(--dz-warning-solid)]')
    expect(cls('bg-blue-500 hover:bg-blue-600')).toBe(
      'bg-[var(--dz-primary-solid)] hover:bg-[var(--dz-primary-solid-hover)]',
    )
    expect(cls('bg-amber-500 hover:bg-amber-600')).toBe(
      'bg-[var(--dz-warning-solid)] hover:bg-[var(--dz-warning-solid-hover)]',
    )
  })

  it('maps focus rings to --dz-ring', () => {
    expect(cls('focus:ring-2 focus:ring-blue-500')).toBe('focus:ring-2 focus:ring-[var(--dz-ring)]')
  })
})

describe('story-color-tokens: decorative palettes stay primitive', () => {
  it('maps gradients to the primitive ramp', () => {
    expect(cls('bg-gradient-to-r from-blue-400 to-purple-500')).toBe(
      'bg-gradient-to-r from-[var(--dz-colors-blue-400)] to-[var(--dz-colors-purple-500)]',
    )
  })

  it('maps a palette with no intent within 10° of hue to the primitive ramp', () => {
    // purple is 20° from secondary — a swatch, not a status.
    expect(cls('bg-purple-100 text-purple-800')).toBe(
      'bg-[var(--dz-colors-purple-100)] text-[var(--dz-colors-purple-800)]',
    )
  })

  it('resolves text-white over a gradient to the primitive neutral', () => {
    expect(cls('bg-gradient-to-br from-blue-400 to-purple-500 text-white')).toBe(
      'bg-gradient-to-br from-[var(--dz-colors-blue-400)] to-[var(--dz-colors-purple-500)] text-[var(--dz-colors-neutral-50)]',
    )
  })
})

describe('story-color-tokens: bare border utilities', () => {
  it('gives a bare border the border token', () => {
    expect(cls('rounded-md border p-4')).toBe('rounded-md border border-[var(--dz-border)] p-4')
    expect(cls('flex border-t pt-4')).toBe('flex border-t border-t-[var(--dz-border)] pt-4')
  })

  it('leaves a border that already carries a token colour alone', () => {
    expect(cls('border border-[var(--dz-border)]')).toBe('border border-[var(--dz-border)]')
  })

  it('does not mistake border-gray-200 for a bare border', () => {
    expect(cls('border border-gray-200')).toBe('border border-[var(--dz-border)]')
  })
})

describe('story-color-tokens: refuses to guess', () => {
  it('reports opacity-modified colours instead of rewriting them', () => {
    expect(reasons('bg-white/90')).toEqual(['bg-white/90'])
    expect(cls('bg-white/90')).toBe('bg-white/90')
  })

  it('reports a dark: variant rather than deciding whether it or the token wins', () => {
    expect(reasons('text-gray-600 dark:text-gray-300')).toEqual(['dark:text-gray-300'])
  })

  it('reports text-white when no surface is declared in the same class list', () => {
    expect(reasons('rounded text-white')).toEqual(['text-white'])
  })

  it('names a reason for every literal it declines', () => {
    const { unclassified } = resolveClassList('bg-white/90 dark:text-gray-300 text-white')
    expect(unclassified).toHaveLength(3)
    for (const u of unclassified) expect(u.reason).toBeTruthy()
  })
})

describe('story-color-tokens: file-level behaviour', () => {
  const story = [
    'export const Basic = {',
    '  render: () => ({',
    '    template: `<p class="text-sm text-gray-500 border-t pt-4">Helper text</p>`,',
    '  }),',
    '}',
  ].join('\n')

  it('rewrites class lists inside template literals', () => {
    const { code, replaced } = transformStoryColors(story)
    expect(code).toContain('text-[var(--dz-muted-foreground)]')
    expect(code).toContain('border-t border-t-[var(--dz-border)]')
    expect(replaced).toBe(1)
  })

  it('rewrites the inner strings of a :class binding', () => {
    const src = `<div :class="active ? 'bg-blue-600' : 'bg-gray-300'" />`
    const { code } = transformStoryColors(src)
    expect(code).toContain(`'bg-[var(--dz-primary-solid)]'`)
    expect(code).toContain(`'bg-[var(--dz-border)]'`)
  })

  it('finds a class attribute after an attribute containing single quotes', () => {
    // Regression: pairing balanced quotes left-to-right mis-associates the
    // delimiters here and skips the class list entirely.
    const src = `<span v-for="d in ['Mo', 'Tu']" :key="d" class="text-gray-400 py-1">{{ d }}</span>`
    const { code } = transformStoryColors(src)
    expect(code).toContain('class="text-[var(--dz-muted-foreground)] py-1"')
    expect(code).toContain(`v-for="d in ['Mo', 'Tu']"`)
  })

  it('leaves a :class expression with no string literal alone', () => {
    const src = `<div :class="computedClasses" />`
    expect(transformStoryColors(src).code).toBe(src)
  })

  it('is idempotent', () => {
    const once = transformStoryColors(story).code
    const twice = transformStoryColors(once).code
    expect(twice).toBe(once)
  })

  it('honours the token-check-disable-file marker', () => {
    const disabled = `// token-check-disable-file — presets are data\n${story}`
    const { code, replaced } = transformStoryColors(disabled)
    expect(code).toBe(disabled)
    expect(replaced).toBe(0)
  })

  it('does not rewrite a colour word inside prose', () => {
    const prose = `const label = 'Choose a background colour'`
    expect(transformStoryColors(prose).code).toBe(prose)
  })
})
