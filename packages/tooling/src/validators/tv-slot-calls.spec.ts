/**
 * Rules for the `tv()` slot-call validator (TASK-N2-S1, closes N1-O3 G1).
 *
 * Every case here is driven through the pure `checkVueSource`, so the rules are
 * exercised without a filesystem and without mounting anything. The live tree is
 * checked by `yarn validate:tv-slots`; what these tests hold is that the rule
 * **can fail**, on each of the shapes the defect actually takes, and that the
 * three correct shapes stay green.
 */

import { describe, expect, it } from 'vitest'
import { bindersIn, checkTvSlotCalls, checkVueSource, slotRecipesIn, stripComments } from './tv-slot-calls.ts'

const RECIPE = `
import { tv } from 'tailwind-variants'
export const lightboxVariants = tv({
  slots: {
    overlay: 'fixed inset-0',
    content: 'relative',
    closeButton: 'absolute top-2 right-2',
  },
  variants: { size: { md: { content: 'max-w-2xl' } } },
})
`

function sfc(body: string): string {
  return `<script setup lang="ts">
import { computed } from 'vue'
import { lightboxVariants } from './DzLightbox.variants.ts'
const styles = computed(() => lightboxVariants({ size: 'md' }))
</script>

<template>
${body}
</template>
`
}

describe('slotRecipesIn', () => {
  it('reads the slot names of a tv() recipe', () => {
    expect(slotRecipesIn(RECIPE).get('lightboxVariants')).toEqual(['overlay', 'content', 'closeButton'])
  })

  it('ignores a tv() recipe with no slots — its result is a string, and binding it is correct', () => {
    const source = `export const buttonVariants = tv({ base: 'inline-flex', variants: { size: { md: 'h-9' } } })`
    expect(slotRecipesIn(source).size).toBe(0)
  })

  it('does not mistake a nested `slots` key inside variants for the slot block', () => {
    const source = `export const r = tv({ base: 'x', variants: { tone: { a: 'b' } }, slots: { root: 'y' } })`
    expect(slotRecipesIn(source).get('r')).toEqual(['root'])
  })
})

describe('bindersIn', () => {
  it('finds the computed() binder that every component in the catalog uses', () => {
    const recipes = slotRecipesIn(RECIPE)
    const { binders } = bindersIn(`const styles = computed(() => lightboxVariants({}))`, recipes)
    expect(binders).toEqual([{ name: 'styles', slots: ['overlay', 'content', 'closeButton'], wrapped: true }])
  })

  it('finds a direct binder', () => {
    const recipes = slotRecipesIn(RECIPE)
    const { binders } = bindersIn(`const styles = lightboxVariants({})`, recipes)
    expect(binders[0]?.wrapped).toBe(false)
  })

  it('finds destructured slot functions, including renamed ones', () => {
    const recipes = slotRecipesIn(RECIPE)
    const { destructured } = bindersIn(`const { overlay, closeButton: close } = lightboxVariants({})`, recipes)
    expect([...destructured.entries()]).toEqual([['overlay', 'overlay'], ['close', 'closeButton']])
  })
})

describe('checkVueSource — the G1 defect', () => {
  it('fails on the exact DzLightbox shape: a slot bound without its call', () => {
    const violations = checkVueSource('X.vue', sfc(`  <div :class="styles.closeButton" />`), [RECIPE])
    expect(violations).toHaveLength(1)
    expect(violations[0]?.expression).toBe('styles.closeButton')
    expect(violations[0]?.message).toContain('NO classes')
  })

  it('reports EVERY uncalled slot, not just the first — DzLightbox shipped ten at once', () => {
    const violations = checkVueSource('X.vue', sfc(
      `  <div :class="styles.overlay" />\n  <div :class="styles.content" />\n  <div :class="styles.closeButton" />`,
    ), [RECIPE])
    expect(violations.map(v => v.expression)).toEqual([
      'styles.overlay',
      'styles.content',
      'styles.closeButton',
    ])
  })

  it('reports the line of the ORIGINAL source, not of a comment-stripped copy', () => {
    // The regression this asserts is real: the first seeded run pointed at line
    // 106 for a defect on line 164, because DzLightbox carries a 58-line header
    // comment describing this very bug.
    const source = `<script setup lang="ts">\n/**\n * A\n * long\n * header\n */\nimport { computed } from 'vue'\nimport { lightboxVariants } from './x.variants.ts'\nconst styles = computed(() => lightboxVariants({}))\n</script>\n\n<template>\n  <div :class="styles.overlay" />\n</template>\n`
    const violations = checkVueSource('X.vue', source, [RECIPE])
    expect(violations[0]?.line).toBe(13)
    expect(source.split('\n')[12]).toContain('styles.overlay')
  })

  it('fails on the script-side `.value` form as well as the template form', () => {
    const source = `<script setup lang="ts">
import { computed } from 'vue'
import { lightboxVariants } from './x.variants.ts'
const styles = computed(() => lightboxVariants({}))
const overlayClasses = computed(() => cn(styles.value.overlay, 'z-50'))
</script>
<template><div :class="overlayClasses" /></template>
`
    const violations = checkVueSource('X.vue', source, [RECIPE])
    expect(violations).toHaveLength(1)
    expect(violations[0]?.expression).toBe('styles.value.overlay')
  })

  it('fails on a destructured slot function used as a class value', () => {
    const source = `<script setup lang="ts">
import { lightboxVariants } from './x.variants.ts'
const { overlay, content } = lightboxVariants({})
</script>
<template><div :class="overlay" /><div :class="content()" /></template>
`
    const violations = checkVueSource('X.vue', source, [RECIPE])
    expect(violations.map(v => v.expression)).toEqual(['overlay'])
  })
})

describe('checkVueSource — what must stay green', () => {
  it('passes when the slot is called', () => {
    expect(checkVueSource('X.vue', sfc(`  <div :class="styles.closeButton()" />`), [RECIPE])).toEqual([])
  })

  it('passes when the slot is called inside cn()', () => {
    expect(checkVueSource('X.vue', sfc(`  <div :class="cn(styles.content(), attrs.class)" />`), [RECIPE])).toEqual([])
  })

  it('does not read the ref unwrap as a slot named `value`', () => {
    // DzStatCard, DzAnimatedNumber, DzCountdown and DzTreeSelect all declare a
    // slot literally called `value`; `styles.value.root()` is the ref unwrap,
    // not a bound-and-uncalled slot. The first draft flagged all four.
    const recipe = `export const r = tv({ slots: { value: 'font-bold', root: 'flex' } })`
    const source = `<script setup lang="ts">
import { r } from './x.variants.ts'
const styles = computed(() => r({}))
const rootClasses = computed(() => styles.value.root())
</script>
<template><span :class="styles.value()" /></template>
`
    expect(checkVueSource('X.vue', source, [recipe])).toEqual([])
  })

  it('honours a `tv-slot-ok:` opt-out on the line, with its reason at the expression', () => {
    const source = sfc(`  <div :class="styles.closeButton" /><!-- tv-slot-ok: passed to a helper that calls it -->`)
    expect(checkVueSource('X.vue', source, [RECIPE])).toEqual([])
  })

  it('ignores an expression that only appears inside a comment', () => {
    const source = sfc(`  <!-- was :class="styles.overlay" before the fix -->\n  <div :class="styles.overlay()" />`)
    expect(checkVueSource('X.vue', source, [RECIPE])).toEqual([])
  })

  it('does nothing at all for a component whose recipe has no slots', () => {
    const noSlots = `export const buttonVariants = tv({ base: 'inline-flex' })`
    const source = `<script setup lang="ts">
import { buttonVariants } from './x.variants.ts'
const classes = buttonVariants({})
</script>
<template><button :class="classes" /></template>
`
    expect(checkVueSource('X.vue', source, [noSlots])).toEqual([])
  })
})

describe('stripComments', () => {
  it('preserves length and newlines so offsets survive', () => {
    const source = 'a // b\n/* c */ d\n'
    const stripped = stripComments(source)
    expect(stripped).toHaveLength(source.length)
    expect(stripped.split('\n')).toHaveLength(source.split('\n').length)
    expect(stripped).toBe('a     \n        d\n')
  })

  it('does not treat a URL as a line comment', () => {
    expect(stripComments(`const u = 'https://x.test/y'`)).toBe(`const u = 'https://x.test/y'`)
  })
})

describe('the live catalog', () => {
  it('has no bound-but-uncalled tv() slot anywhere in packages/core/src', () => {
    const report = checkTvSlotCalls()
    expect(report.violations).toEqual([])
    // The denominator matters: a check that scans nothing also reports nothing.
    expect(report.filesWithSlotRecipes).toBeGreaterThan(100)
  })
})
