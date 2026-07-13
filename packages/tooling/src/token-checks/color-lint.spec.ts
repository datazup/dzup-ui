/**
 * Tests for the ADR-04 color-literal gate (TASK-DS-05).
 *
 * The gate's job is to fail when a raw color returns to the codebase. These
 * tests pin the two ways that job is easy to get wrong: missing a violation
 * that hides on a line which also references a token, and flagging prose or
 * legitimate data as if it were a style.
 */

import { describe, expect, it } from 'vitest'
import { checkSource } from './color-lint.ts'

/** Matched literals for one source string, as if it were a story file. */
function story(src: string): string[] {
  return checkSource(src, 'packages/core/stories/buttons/DzButton.stories.ts').map(v => v.match)
}

/** Matched literals for one source string, as if it were a component file. */
function component(src: string): string[] {
  return checkSource(src, 'packages/core/src/components/buttons/DzButton.variants.ts').map(v => v.match)
}

describe('color-lint: Tailwind color classes', () => {
  it('flags a raw gray in a story', () => {
    expect(story('const c = `<p class="text-gray-500">hi</p>`')).toEqual(['text-gray-500'])
  })

  it('flags a raw color on a line that also references a token', () => {
    // The whole point: a class list normally carries both, and the old
    // `var(--dz-` line exclusion would have skipped this line entirely.
    const src = 'const c = `<p class="text-gray-500 border-[var(--dz-border)]">hi</p>`'
    expect(story(src)).toEqual(['text-gray-500'])
  })

  it('flags variant-prefixed and opacity-modified colors', () => {
    expect(story('`<a class="hover:bg-gray-100">x</a>`')).toEqual(['hover:bg-gray-100'])
    expect(story('`<a class="bg-white/90">x</a>`')).toEqual(['bg-white/90'])
    expect(story('`<a class="dark:text-gray-300">x</a>`')).toEqual(['dark:text-gray-300'])
  })

  it('flags text-white and bg-black', () => {
    expect(story('`<a class="text-white">x</a>`')).toEqual(['text-white'])
  })

  it('accepts a tokenized class', () => {
    expect(story('`<p class="text-[var(--dz-muted-foreground)]">hi</p>`')).toEqual([])
    expect(story('`<div class="from-[var(--dz-colors-blue-400)]"></div>`')).toEqual([])
  })

  it('does not mistake a primitive token name for a raw class', () => {
    expect(story('`<i class="bg-[var(--dz-colors-purple-600)]"></i>`')).toEqual([])
  })

  it('applies to component source too, not only stories', () => {
    expect(component(`base: 'text-gray-500'`)).toEqual(['text-gray-500'])
  })
})

describe('color-lint: raw CSS values', () => {
  it('flags hex, rgb and hsl', () => {
    expect(story('const bg = `<i style="color:#3b82f6"></i>`')).toEqual(['#3b82f6'])
    expect(story('const bg = `<i style="background: hsl(210 70% 55%)"></i>`')).toEqual(['hsl('])
  })

  it('does not flag a numeric id or an HTML entity', () => {
    expect(story('const label = `Order #1042 shipped`')).toEqual([])
    expect(story('const icon = `<span>&#128196;</span>`')).toEqual([])
  })
})

describe('color-lint: untokenized borders', () => {
  it('flags a bare border inside a class attribute in a story', () => {
    expect(story('`<div class="rounded-md border p-4"></div>`')).toEqual(['border'])
    expect(story('`<div class="flex border-t pt-4"></div>`')).toEqual(['border-t'])
  })

  it('accepts a bare border once a token supplies its color', () => {
    expect(story('`<div class="border border-[var(--dz-border)]"></div>`')).toEqual([])
    expect(story('`<div class="border-t border-t-[var(--dz-border)]"></div>`')).toEqual([])
  })

  it('does not flag the English word "border" in prose', () => {
    expect(story('`<DzText>Card with a border outline.</DzText>`')).toEqual([])
  })

  it('does not flag border-2 or border-collapse', () => {
    expect(story('`<div class="border-2 border-collapse"></div>`')).toEqual([])
  })

  it('does not apply the bare-border rule to component variants', () => {
    // A tv() base string legitimately carries `border`; the colour arrives from
    // a separate compoundVariants entry.
    expect(component(`outline: 'border bg-transparent'`)).toEqual([])
  })
})

describe('color-lint: escape hatches', () => {
  it('honours token-check-disable-file', () => {
    const src = '// token-check-disable-file — presets are data\nconst c = `<p class="text-gray-500"></p>`'
    expect(story(src)).toEqual([])
  })

  it('honours token-check-disable-next-line', () => {
    const src = '// token-check-disable-next-line — code sample\nconst snippet = `primary: "#3b82f6"`'
    expect(story(src)).toEqual([])
  })

  it('ignores comments', () => {
    expect(story('// use text-gray-500 here? no.')).toEqual([])
  })
})
