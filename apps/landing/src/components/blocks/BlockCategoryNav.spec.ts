/**
 * BlockCategoryNav — the arrow keys follow the writing direction (TASK-APP-1).
 *
 * This nav hand-rolls the WAI-ARIA tab pattern — `role="tablist"`, roving
 * `tabindex`, its own `keydown` handler — rather than using the library's
 * `useTabs`. That is a legitimate choice here: `useTabs` activates on focus and
 * this nav must not, because activating a category mounts a stack of heavy live
 * previews.
 *
 * What was **not** legitimate is that the hand-rolled handler re-introduced the
 * exact defect `TASK-OSS-P4-05` had just fixed in `useTabs`: `ArrowRight` was
 * hard-coded as "next". APG's tab pattern is written in terms of previous and
 * next, and in a right-to-left document the next tab is to the *left* — so an
 * Arabic reader pressing the key that points at the next tab got the previous
 * one.
 *
 * The nav now reads `useDzDirection()` from `@dzup-ui/core`, the same provider
 * contract (ADR-20) the library's own components use. These tests are what make
 * that real rather than latent: **no ordinary landing route sets `dir` today**
 * — only `BlockPreviewPage` and the template preview customiser do — so nothing
 * else in this repository can exercise the right-to-left branch.
 */

import type { CategoryMeta } from '../../blocks/registry.ts'
import { DzProvider } from '@dzup-ui/core/providers'
import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import BlockCategoryNav from './BlockCategoryNav.vue'

/**
 * `DzProvider` reads `prefers-color-scheme` and `prefers-reduced-motion` at
 * mount; jsdom has no `matchMedia`. A static non-matching stub is enough — this
 * file is about arrow keys, and the default (light, motion allowed) state is the
 * one the assertions describe. Same stub the blocks a11y sweep installs.
 */
beforeAll(() => {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
})

const CATEGORIES: CategoryMeta[] = [
  { id: 'marketing', label: 'Marketing', blurb: '', accent: 'indigo' },
  { id: 'application', label: 'Application', blurb: '', accent: 'teal' },
  { id: 'commerce', label: 'Commerce', blurb: '', accent: 'amber' },
] as CategoryMeta[]

/** Mount the nav under a provider declaring a writing direction. */
function mountNav(direction: 'ltr' | 'rtl') {
  const Host = defineComponent({
    setup() {
      const active = ref('marketing')
      return () =>
        h(DzProvider, { direction }, {
          default: () =>
            h(BlockCategoryNav, {
              'categories': CATEGORIES,
              'modelValue': active.value,
              'onUpdate:modelValue': (value: string) => { active.value = value },
            }),
        })
    },
  })
  return mount(Host, { attachTo: document.body })
}

/** The id of the tab that currently holds the roving tabindex. */
function focusedTabLabel(wrapper: ReturnType<typeof mountNav>): string {
  const focused = wrapper.findAll('[role="tab"]').find(t => t.attributes('tabindex') === '0')
  return focused?.text() ?? '<none>'
}

async function press(wrapper: ReturnType<typeof mountNav>, key: string): Promise<void> {
  await wrapper.find('[role="tablist"]').trigger('keydown', { key })
}

describe('blockCategoryNav keyboard direction', () => {
  it('left-to-right: ArrowRight advances, ArrowLeft retreats', async () => {
    const wrapper = mountNav('ltr')
    expect(focusedTabLabel(wrapper)).toBe('Marketing')

    await press(wrapper, 'ArrowRight')
    expect(focusedTabLabel(wrapper)).toBe('Application')

    await press(wrapper, 'ArrowLeft')
    expect(focusedTabLabel(wrapper)).toBe('Marketing')

    wrapper.unmount()
  })

  it('right-to-left: ArrowLeft advances, ArrowRight retreats', async () => {
    const wrapper = mountNav('rtl')
    expect(focusedTabLabel(wrapper)).toBe('Marketing')

    // The key pointing at the next tab in an RTL document is ArrowLeft.
    await press(wrapper, 'ArrowLeft')
    expect(
      focusedTabLabel(wrapper),
      'ArrowLeft must advance under dir="rtl" — this is the defect TASK-OSS-P4-05 '
      + 'fixed in useTabs and this nav re-implemented',
    ).toBe('Application')

    await press(wrapper, 'ArrowRight')
    expect(focusedTabLabel(wrapper)).toBe('Marketing')

    wrapper.unmount()
  })

  it('vertical keys do not swap — dir is about the inline axis only', async () => {
    const wrapper = mountNav('rtl')

    await press(wrapper, 'ArrowDown')
    expect(focusedTabLabel(wrapper)).toBe('Application')

    await press(wrapper, 'ArrowUp')
    expect(focusedTabLabel(wrapper)).toBe('Marketing')

    wrapper.unmount()
  })

  it('home and End are direction-independent', async () => {
    const wrapper = mountNav('rtl')

    await press(wrapper, 'End')
    expect(focusedTabLabel(wrapper)).toBe('Commerce')

    await press(wrapper, 'Home')
    expect(focusedTabLabel(wrapper)).toBe('Marketing')

    wrapper.unmount()
  })
})

describe('blockCategoryNav identity (TASK-BV2-03)', () => {
  /** CategorySection-shaped input: meta + the category's blocks. */
  const COUNTED = CATEGORIES.map((category, i) => ({
    ...category,
    blocks: Array.from({ length: i + 1 }, (_, j) => ({ id: `${category.id}-${j}` })),
  })) as unknown as CategoryMeta[]

  function mountCounted(categories: CategoryMeta[]) {
    const Host = defineComponent({
      setup() {
        const active = ref('marketing')
        return () =>
          h(DzProvider, { direction: 'ltr' }, {
            default: () =>
              h(BlockCategoryNav, {
                'categories': categories,
                'modelValue': active.value,
                'onUpdate:modelValue': (value: string) => {
                  active.value = value
                },
              }),
          })
      },
    })
    return mount(Host, { attachTo: document.body })
  }

  it('every tab carries an aria-hidden identity glyph', () => {
    const wrapper = mountCounted(COUNTED)
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs.length).toBe(CATEGORIES.length)
    for (const tab of tabs) {
      const icon = tab.find('.cat-nav-icon')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('aria-hidden')).toBe('true')
    }
    wrapper.unmount()
  })

  it('shows the derived block count and folds it into the accessible name', () => {
    const wrapper = mountCounted(COUNTED)
    const tabs = wrapper.findAll('[role="tab"]')
    tabs.forEach((tab, i) => {
      const badge = tab.find('.cat-nav-count')
      expect(badge.exists()).toBe(true)
      // Count derived from the blocks handed in — never typed.
      expect(badge.text()).toBe(String(i + 1))
      expect(badge.attributes('aria-hidden')).toBe('true')
      const expectedLabel = `${CATEGORIES[i]!.label}, ${i + 1} ${i === 0 ? 'block' : 'blocks'}`
      expect(tab.attributes('aria-label')).toBe(expectedLabel)
    })
    wrapper.unmount()
  })

  it('meta-only input (no blocks) renders no badge and keeps the bare label', () => {
    const wrapper = mountCounted(CATEGORIES)
    const tabs = wrapper.findAll('[role="tab"]')
    for (const tab of tabs) {
      expect(tab.find('.cat-nav-count').exists()).toBe(false)
      expect(tab.attributes('aria-label')).toBeUndefined()
    }
    wrapper.unmount()
  })
})
