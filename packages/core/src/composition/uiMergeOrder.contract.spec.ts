/**
 * The `ui` merge-order and handler-composition contract (TASK-R5-O6, ADR-19 §5,
 * finding R-021).
 *
 * ADR-19 §5 says `class` and `ui` "merge through the same `cn()`". It does not
 * say **in which order**, and `cn()` is tailwind-merge — the last conflicting
 * utility wins — so the order is the entire answer to "which one takes effect".
 * R-021 is that gap: a rule that lives in prose, gated by nothing.
 *
 * Measured at `99b963a` + the R5-O2 dirty tree, the gap had shipped two
 * opposite contracts in one library. Of **79** merge sites, **5** pass `ui`
 * before `class` and **74** pass `class` before `ui`. A consumer writing
 * `<DzButton class="rounded-none" :ui="{ root: 'rounded-xl' }" />` and
 * `<DzCard  class="rounded-none" :ui="{ root: 'rounded-xl' }" />` gets opposite
 * results from the same two props, and nothing anywhere said which was right.
 *
 * ## What this spec asserts
 *
 * 1. **Source level, catalogue-wide.** Every `cn()` call that merges both a
 *    `ui` part and `attrs.class` passes them in `UI_MERGE_ORDER`. The 73 known
 *    deviations are carried in `ui-merge-order-ceilings.json` as a *recorded
 *    defect with a downward-only ceiling* — never as an exemption list. A new
 *    component that merges the wrong way fails here on the day it is written,
 *    and a fixed one must lower the ceiling.
 * 2. **Rendered, on the pilots.** That the source order actually produces the
 *    behaviour: `ui` beats the recipe, and the consumer's `class` beats `ui`.
 *    Source order is a strong proxy but it is still a proxy, and the whole
 *    reason this task exists is that a proxy was trusted.
 * 3. **Handler composition.** A consumer's listener for an event the component
 *    also handles runs exactly once.
 * 4. **Safe attrs.** `id`, `data-*`, `aria-*`, `role`, `title` reach the
 *    declared fallthrough target unchanged.
 *
 * @see packages/contracts/src/composition.types.ts for why `class` wins.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SAFE_FALLTHROUGH_ATTRS, UI_MERGE_ORDER } from '@dzup-ui/contracts'
import { checkUiMergeOrder, classCarryingIdentifiers, expectHandlerComposition, mergeSitesIn } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DzButton from '../components/buttons/DzButton.vue'
import DzInput from '../components/inputs/DzInput.vue'
import ceilings from './ui-merge-order-ceilings.json' with { type: 'json' }

const HERE = dirname(fileURLToPath(import.meta.url))
const CORE_SRC = resolve(HERE, '..')

function collectVueFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory())
      collectVueFiles(path, out)
    else if (entry.endsWith('.vue') && entry.startsWith('Dz'))
      out.push(path)
  }
  return out
}

interface Scanned {
  component: string
  conformant: number
  deviating: number
  problems: string[]
}

function scan(): Scanned[] {
  return collectVueFiles(CORE_SRC)
    .map((path) => {
      const component = basename(path, '.vue')
      const source = readFileSync(path, 'utf8')
      const sites = mergeSitesIn(source)
      return {
        component,
        conformant: sites.filter(s => s.order === 'ui-then-class').length,
        deviating: sites.filter(s => s.order === 'class-then-ui').length,
        problems: checkUiMergeOrder(source, component),
      }
    })
    .filter(row => row.conformant + row.deviating > 0)
    .sort((a, b) => a.component.localeCompare(b.component))
}

describe('the `ui` merge order is a contract, not a convention (ADR-19 §5, R-021)', () => {
  const scanned = scan()

  it('the ratified order is recipe -> ui -> class, so the consumer\'s class wins', () => {
    // Pinned so the order cannot be quietly reversed in the constant while every
    // component and every doc page keeps claiming the old one.
    expect(UI_MERGE_ORDER).toEqual(['recipe', 'ui', 'class'])
  })

  it('no component outside the recorded ceiling merges `class` before `ui`', () => {
    const known = new Set(ceilings.deviating.map(d => d.component))
    const unrecorded = scanned.filter(row => row.deviating > 0 && !known.has(row.component))

    expect(
      unrecorded.flatMap(row => row.problems),
      'A component merges the consumer\'s `class` BEFORE `ui`, so `ui` wins a tailwind-merge '
      + 'conflict and the consumer cannot override it without `!important` — the one outcome '
      + 'ADR-19 exists to prevent. Pass them in UI_MERGE_ORDER: cn(recipe, props.ui?.part, attrs.class).',
    ).toEqual([])
  })

  it('the deviation ceiling is downward-only (it may fall, never rise)', () => {
    const deviatingComponents = scanned.filter(row => row.deviating > 0)
    const deviatingSites = scanned.reduce((n, row) => n + row.deviating, 0)

    expect(deviatingComponents.length).toBeLessThanOrEqual(ceilings.maxDeviatingComponents)
    expect(deviatingSites).toBeLessThanOrEqual(ceilings.maxDeviatingSites)

    // The downward arm: a fix that does not lower the ceiling leaves a gate
    // guarding a number nothing can reach, which is how a ratchet stops
    // ratcheting. TASK-R5-O5's F-8 was found by exactly this assertion.
    expect(
      deviatingComponents.length,
      `${ceilings.maxDeviatingComponents - deviatingComponents.length} component(s) were fixed `
      + 'without lowering `maxDeviatingComponents` in ui-merge-order-ceilings.json. Lower it.',
    ).toBe(ceilings.maxDeviatingComponents)
  })

  it('every component recorded as deviating still exists and still deviates', () => {
    // A stale entry is how an exemption list quietly stops being true. If a
    // component was renamed or deleted, this says so instead of silently
    // widening the allowance.
    const found = new Map(scanned.map(row => [row.component, row]))
    const stale = ceilings.deviating
      .filter(d => (found.get(d.component)?.deviating ?? 0) === 0)
      .map(d => d.component)

    expect(
      stale,
      'Recorded as a merge-order deviation but no longer deviating (or no longer present). '
      + 'Remove the entry and lower `maxDeviatingComponents`.',
    ).toEqual([])
  })

  it('the conformant set is exactly the pilot components the browser evidence covers', () => {
    const conformantOnly = scanned
      .filter(row => row.conformant > 0 && row.deviating === 0)
      .map(row => row.component)
      .sort()

    // Not decoration: this is the evidence D38 rests on. The five components
    // that merge in the ratified order are the five in Overrides.stories.ts,
    // behind e2e/components/styling-overrides.spec.ts. If that stops being
    // true, the decision's justification needs re-reading, not the test
    // updating.
    expect(conformantOnly).toEqual(ceilings.conformant.components)
  })
})

describe('the merge order produces the behaviour it claims (rendered)', () => {
  it('`ui` beats the component recipe', () => {
    const wrapper = mount(DzButton, {
      props: { size: 'md', ui: { root: 'h-20' } },
      slots: { default: 'Save' },
    })
    const classes = wrapper.element.className

    // tailwind-merge drops the recipe's own height when ui supplies one.
    expect(classes).toContain('h-20')
    expect(classes).not.toMatch(/h-\[var\(--dz-button-md-height\)\]/)
  })

  it('the consumer\'s `class` beats `ui` — the half ADR-19 §5 never stated', () => {
    const wrapper = mount(DzButton, {
      props: { ui: { root: 'h-20' } },
      attrs: { class: 'h-32' },
      slots: { default: 'Save' },
    })
    const classes = wrapper.element.className

    expect(classes).toContain('h-32')
    expect(
      classes,
      'The consumer passed `class="h-32"` and `ui.root="h-20"`. Under UI_MERGE_ORDER the class '
      + 'is merged last and wins; if `h-20` survives, this component merges the other way and a '
      + 'consumer wrapping it cannot restyle it without `!important`.',
    ).not.toContain('h-20')
  })

  it('a non-conflicting `ui` class is kept alongside the consumer\'s class', () => {
    // The order only decides *conflicts*. A contract that dropped the ui class
    // outright would be a different, worse rule, so this pins that it does not.
    const wrapper = mount(DzButton, {
      props: { ui: { root: 'shadow-lg' } },
      attrs: { class: 'h-32' },
      slots: { default: 'Save' },
    })

    expect(wrapper.element.className).toContain('shadow-lg')
    expect(wrapper.element.className).toContain('h-32')
  })

  it('the same order holds on a component whose class target is not the root', () => {
    // DzInput merges the consumer's class alongside `ui.control`, not
    // `ui.root` — it is one of the components behind D24. The merge ORDER is
    // still the contract; which node it lands on is the fallthrough
    // declaration's business, asserted in fallthrough.contract.spec.ts.
    const wrapper = mount(DzInput, {
      props: { modelValue: 'x', ui: { control: 'h-20' } },
      attrs: { class: 'h-32' },
    })

    const carrier = wrapper.element.querySelector('.h-32') ?? wrapper.element
    expect(carrier.className).toContain('h-32')
    expect(carrier.className).not.toContain('h-20')
  })
})

describe('handler composition: a consumer\'s listener runs exactly once', () => {
  it('a button runs a consumer click listener once', async () => {
    let calls = 0
    const wrapper = mount(DzButton, {
      attrs: { onClick: () => { calls++ } },
      slots: { default: 'Save' },
    })

    await wrapper.trigger('click')

    // A component that both declares `click` in defineEmits AND lets `onClick`
    // fall through to the same node fires the consumer twice — a form submitted
    // twice, an analytics event double-counted, and it looks like a consumer
    // bug from inside the library.
    expectHandlerComposition('DzButton', calls)
  })

  it('a disabled control does not run the consumer\'s listener at all', () => {
    let calls = 0
    const wrapper = mount(DzButton, {
      props: { disabled: true },
      attrs: { onClick: () => { calls++ } },
      slots: { default: 'Save' },
    })

    wrapper.element.dispatchEvent(new Event('click', { bubbles: true }))
    expect(calls).toBe(0)
  })
})

describe('safe attributes reach the component\'s surface unchanged', () => {
  it('the documented safe list is what the contract publishes', () => {
    expect(SAFE_FALLTHROUGH_ATTRS).toContain('id')
    expect(SAFE_FALLTHROUGH_ATTRS).toContain('aria-*')
    expect(SAFE_FALLTHROUGH_ATTRS).toContain('data-*')

    // `class` and `style` are merged, not forwarded. Listing them here would
    // make the list assert the wrong thing about both.
    expect(SAFE_FALLTHROUGH_ATTRS).not.toContain('class')
    expect(SAFE_FALLTHROUGH_ATTRS).not.toContain('style')
  })

  it('a button forwards id, title, data-* and aria-* verbatim', () => {
    const wrapper = mount(DzButton, {
      attrs: {
        'id': 'save-btn',
        'title': 'Save the thing',
        'data-testid': 'consumer-hook',
        'aria-keyshortcuts': 'Control+S',
      },
      slots: { default: 'Save' },
    })
    const el = wrapper.element

    expect(el.getAttribute('id')).toBe('save-btn')
    expect(el.getAttribute('title')).toBe('Save the thing')
    expect(el.getAttribute('data-testid')).toBe('consumer-hook')
    expect(el.getAttribute('aria-keyshortcuts')).toBe('Control+S')
  })

  it('a consumer\'s attribute does not clobber the component\'s own data-part', () => {
    const wrapper = mount(DzButton, {
      attrs: { 'data-foo': 'bar' },
      slots: { default: 'Save' },
    })

    expect(wrapper.element.getAttribute('data-part')).toBe('root')
  })
})

describe('the scanner itself fails when it should (seeded)', () => {
  const RECIPE = 'buttonVariants({ size })'

  it('flags a class-before-ui merge', () => {
    const seeded = `const c = cn(${RECIPE}, attrs.class as string | undefined, props.ui?.root)`
    expect(checkUiMergeOrder(seeded, 'SeededComponent')).toHaveLength(1)
  })

  it('passes a ui-before-class merge', () => {
    const good = `const c = cn(${RECIPE}, props.ui?.root, attrs.class as string | undefined)`
    expect(checkUiMergeOrder(good, 'SeededComponent')).toEqual([])
  })

  it('is not fooled by a multi-line call or a nested cn()', () => {
    const seeded = `
      const c = cn(
        ${RECIPE},
        cn('a', 'b'),
        attrs.class as string | undefined,
        props.ui?.root,
      )
    `
    expect(checkUiMergeOrder(seeded, 'SeededComponent')).toHaveLength(1)
  })

  it('ignores a call that merges only one of the two', () => {
    // A component applying `ui.spinner` to a node the consumer's class never
    // reaches has no precedence question to answer. Flagging it would be noise,
    // and noise is how a gate gets turned off.
    expect(checkUiMergeOrder(`cn('animate-spin', props.ui?.spinner)`, 'X')).toEqual([])
    expect(checkUiMergeOrder(`cn('p-2', attrs.class as string)`, 'X')).toEqual([])
  })

  it('does not treat an identifier ending in `cn(` as a call', () => {
    expect(mergeSitesIn(`fn(attrs.class, props.ui?.root)`)).toEqual([])
  })

  // The array form was invisible to the first version of this gate. `DzKnob`
  // was opened for an unrelated reason (its fallthrough target) and found
  // merging `[rootClasses, ui?.root]` — a deviation the `cn()` scan could not
  // see, because the consumer's `class` is inside `rootClasses` and the `ui`
  // value never enters a `cn()` call at all. Eighteen components merge that
  // way, and the ceiling went from 53 to 73 when the scanner learned to read
  // it. These four pin the hole shut.
  it('sees a class-carrying identifier merged before `ui` in a template array', () => {
    const seeded = `
      const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))
      </script>
      <template><div :class="[rootClasses, ui?.root]" /></template>
    `
    const problems = checkUiMergeOrder(seeded, 'SeededComponent')
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('array form')
  })

  it('passes the same array when `ui` comes first', () => {
    const good = `
      const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))
      </script>
      <template><div :class="[ui?.root, rootClasses]" /></template>
    `
    expect(checkUiMergeOrder(good, 'SeededComponent')).toEqual([])
  })

  it('does not flag `[recipe, ui]` — there is no consumer class in it', () => {
    const neutral = `
      const styles = computed(() => variants())
      </script>
      <template><div :class="[styles.root(), ui?.root]" /></template>
    `
    expect(checkUiMergeOrder(neutral, 'SeededComponent')).toEqual([])
  })

  it('resolves the identifier per file — a same-named computed elsewhere is not assumed', () => {
    // `rootClasses` here does NOT fold in attrs.class, so the array is not a
    // merge site. A scanner that matched on the name alone would report a
    // deviation that does not exist, and a false positive is how a gate gets
    // an exemption list bolted onto it.
    const unrelated = `
      const rootClasses = computed(() => cn(styles.value.root()))
      </script>
      <template><div :class="[rootClasses, ui?.root]" /></template>
    `
    expect(classCarryingIdentifiers(unrelated).has('rootClasses')).toBe(false)
    expect(checkUiMergeOrder(unrelated, 'SeededComponent')).toEqual([])
  })
})
