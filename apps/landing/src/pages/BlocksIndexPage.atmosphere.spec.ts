/**
 * TASK-BV2-01 — the /blocks ambient atmosphere.
 *
 * The page promotes the active category's decorative accent from chips/pills to
 * a page-level `--bv2-accent` custom property: a fixed, aria-hidden wash layer
 * and the hero eyebrow both read it, and switching categories (or entering
 * results mode) retargets it. These specs pin the contract:
 *
 *   1. exactly one `.bv2-atmosphere` layer, decorative (aria-hidden), inside
 *      the page root — never a focus/pointer target;
 *   2. the page root carries the ACTIVE category's accent var (derived from the
 *      registry, never hard-coded here);
 *   3. switching category via the tab bar retargets the var;
 *   4. results mode (any active filter) settles it to the neutral primary.
 *
 * The hue cross-fade itself is CSS (`@property` + transition) — jsdom cannot
 * observe interpolation, so the specs assert the *targets*, which is the whole
 * JS-side contract.
 */

import { fireEvent, render } from '@testing-library/vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { BLOCKS, blocksByCategory, CATEGORIES } from '../blocks/registry.ts'
import DzCountUp from '../motion/components/DzCountUp.vue'
import BlocksIndexPage from './BlocksIndexPage.vue'

/** Non-empty categories in browse order — the sections the page renders. */
const sections = CATEGORIES.filter(c => blocksByCategory(c.id).length > 0)

async function mountPage() {
  // The page mirrors the active category into the URL hash (replaceState), and
  // jsdom's location persists across tests in a file — clear it so every mount
  // opens on the first section rather than wherever the previous test browsed.
  window.history.replaceState(window.history.state, '', window.location.pathname)
  const utils = render(BlocksIndexPage, {
    global: {
      stubs: {
        // The page reaches RouterLink through BlockCard's permalink; the router
        // itself is irrelevant to the atmosphere contract.
        RouterLink: { template: '<a><slot /></a>' },
      },
    },
  })
  await flushPromises()
  return utils
}

function pageRoot(container: Element): HTMLElement {
  const root = container.querySelector<HTMLElement>('.blocks-page')
  if (!root)
    throw new Error('blocks page root not rendered')
  return root
}

describe('bv2 atmosphere layer', () => {
  it('renders exactly one aria-hidden, decorative wash inside the page root', async () => {
    const { container } = await mountPage()
    const layers = container.querySelectorAll('.bv2-atmosphere')
    expect(layers).toHaveLength(1)
    const layer = layers[0]!
    expect(layer.getAttribute('aria-hidden')).toBe('true')
    expect(pageRoot(container).contains(layer)).toBe(true)
    // Decorative means no accessible content and no interactive descendants.
    expect(layer.textContent).toBe('')
    expect(layer.querySelector('a, button, input, [tabindex]')).toBeNull()
  })

  it('lights the room with the active category accent, derived from the registry', async () => {
    const { container } = await mountPage()
    const first = sections[0]!
    expect(pageRoot(container).getAttribute('style')).toContain(
      `--bv2-accent: var(--dz-colors-${first.accent}-500)`,
    )
  })

  it('retargets the accent when the reader switches category', async () => {
    const { container } = await mountPage()
    // Scope to the category tablist — every BlockPreview contributes its own
    // Preview/Code tabs, so a page-wide role=tab query catches dozens.
    const tablist = container.querySelector('[role="tablist"][aria-label="Block categories"]')
    if (!tablist)
      throw new Error('category tablist not rendered')
    const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
    expect(tabs.length).toBe(sections.length)
    await fireEvent.click(tabs[1]!)
    await flushPromises()
    expect(pageRoot(container).getAttribute('style')).toContain(
      `--bv2-accent: var(--dz-colors-${sections[1]!.accent}-500)`,
    )
  })

  it('settles to the neutral primary in results mode (mixed categories)', async () => {
    const { container } = await mountPage()
    const input = container.querySelector<HTMLInputElement>('input[type="search"], input')
    if (!input)
      throw new Error('search input not rendered')
    await fireEvent.update(input, 'hero')
    await flushPromises()
    expect(pageRoot(container).getAttribute('style')).toContain('--bv2-accent: var(--dz-primary)')
  })
})

describe('bv2 hero stats (TASK-BV2-02)', () => {
  it('derives every figure from the registry — blocks, non-empty categories, distinct components', async () => {
    // test-utils mount (not testing-library) so the DzCountUp *targets* are
    // assertable via props — the count-up tween is timing, the derivation
    // contract is what matters, and no literal numbers belong in this spec.
    const wrapper = mount(BlocksIndexPage, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    await flushPromises()

    const stats = wrapper.find('.blocks-hero-stats')
    expect(stats.exists()).toBe(true)
    const labels = stats.findAll('dt').map(dt => dt.text())
    expect(labels).toEqual(['Blocks', 'Categories', 'Components used'])

    const counters = wrapper
      .findAllComponents(DzCountUp)
      .filter(c => stats.element.contains(c.element))
    expect(counters.map(c => c.props('value'))).toEqual([
      BLOCKS.length,
      sections.length,
      new Set(BLOCKS.flatMap(b => b.components)).size,
    ])
    wrapper.unmount()
  })
})

describe('bv2 pager (TASK-BV2-04)', () => {
  it('previews the destination aisle hue and rolls the position digit', async () => {
    const { container } = await mountPage()
    const pager = container.querySelector('.blocks-pager')
    if (!pager)
      throw new Error('pager not rendered')
    const [prevBtn, nextBtn] = [...pager.querySelectorAll<HTMLButtonElement>('.blocks-pager-btn')]
    // On the first group there is no previous destination: disabled, no accent.
    expect(prevBtn!.disabled).toBe(true)
    expect(prevBtn!.getAttribute('style') ?? '').not.toContain('--pager-accent')
    // Next previews the second section's accent — derived from the registry.
    expect(nextBtn!.disabled).toBe(false)
    expect(nextBtn!.getAttribute('style')).toContain(
      `--pager-accent: var(--dz-colors-${sections[1]!.accent}-500)`,
    )
    expect(pager.querySelector('.blocks-pager-count-num')?.textContent).toBe('1')

    await fireEvent.click(nextBtn!)
    await flushPromises()
    expect(pager.querySelector('.blocks-pager-count-num')?.textContent).toBe('2')
  })
})

describe('bv2 results choreography (TASK-BV2-07)', () => {
  async function enterQuery(container: Element, value: string) {
    const input = container.querySelector<HTMLInputElement>('input[type="search"], input')
    if (!input)
      throw new Error('search input not rendered')
    await fireEvent.update(input, value)
    await flushPromises()
  }

  it('renders the FLIP results grid and the odometer count while filtering', async () => {
    const { container } = await mountPage()
    await enterQuery(container, 'hero')
    const grid = container.querySelector('.block-grid--results')
    expect(grid).not.toBeNull()
    expect(grid!.querySelectorAll(':scope > li').length).toBeGreaterThan(0)
    // The live count keeps a plain-text SR layer; the digits are aria-hidden.
    const count = container.querySelector('.block-search-count')
    expect(count).not.toBeNull()
    expect(count!.querySelector('.dz-odometer')).not.toBeNull()
  })

  it('a dead-end filter gets the designed empty state with derived suggestions', async () => {
    const { container } = await mountPage()
    await enterQuery(container, 'zzz-no-such-block-anywhere')
    const empty = container.querySelector('.blocks-empty')
    expect(empty).not.toBeNull()
    expect(empty!.querySelector('.blocks-empty-art')?.getAttribute('aria-hidden')).toBe('true')

    // Suggestions are the catalog's top-3 tags by frequency — derived here the
    // same way, so the spec can never assert an invented tag.
    const freq = new Map<string, number>()
    for (const block of BLOCKS) {
      for (const tag of block.tags) freq.set(tag, (freq.get(tag) ?? 0) + 1)
    }
    const expected = [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([tag]) => tag)
    const rendered = [...empty!.querySelectorAll('.blocks-empty-tag')].map(el =>
      el.textContent?.trim(),
    )
    expect(rendered).toEqual(expected)
  })

  it('applying a suggestion replaces the dead-end filters and exits the empty state', async () => {
    const { container } = await mountPage()
    await enterQuery(container, 'zzz-no-such-block-anywhere')
    const tagButton = container.querySelector<HTMLButtonElement>('.blocks-empty-tag')
    if (!tagButton)
      throw new Error('no suggested tag rendered')
    await fireEvent.click(tagButton)
    await flushPromises()
    expect(container.querySelector('.blocks-empty')).toBeNull()
    expect(container.querySelector('.block-grid--results')).not.toBeNull()
  })

  it('the empty state\'s clear button restores the category deck', async () => {
    const { container } = await mountPage()
    await enterQuery(container, 'zzz-no-such-block-anywhere')
    const clear = [...container.querySelectorAll<HTMLButtonElement>('.blocks-empty button')].find(
      b => b.textContent?.includes('Clear filters'),
    )
    if (!clear)
      throw new Error('clear button not rendered')
    await fireEvent.click(clear)
    await flushPromises()
    expect(container.querySelector('.blocks-empty')).toBeNull()
    expect(container.querySelector('.blocks-deck-mode')).not.toBeNull()
  })
})
