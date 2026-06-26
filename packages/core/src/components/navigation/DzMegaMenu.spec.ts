import type { DzMegaMenuItem } from './DzMegaMenu.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzMegaMenu — Unit / behavior tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzMegaMenu from './DzMegaMenu.vue'

const items: DzMegaMenuItem[] = [
  {
    label: 'Products',
    items: [
      {
        label: 'Analytics',
        items: [
          { label: 'Dashboards', href: '/dash' },
          { label: 'Reports', href: '/reports' },
        ],
      },
      {
        label: 'Data',
        items: [{ label: 'Pipelines', href: '/pipe' }],
      },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Guides', items: [{ label: 'Getting Started', href: '/start' }] },
    ],
  },
  { label: 'Docs', href: '/docs' },
]

/** jsdom lacks matchMedia; default to "not collapsed". */
function stubMatchMedia(matches = false): void {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

beforeEach(() => stubMatchMedia(false))
afterEach(() => vi.unstubAllGlobals())

describe('dzMegaMenu — Open / close', () => {
  it('opens a panel on trigger click and renders its columns', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false } })
    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(false)

    await wrapper.get('[data-mega-trigger="0"]').trigger('click')

    // get() throws if the panel is absent — its presence is the assertion.
    const panel = wrapper.get('[data-mega-panel="0"]')
    expect(panel.attributes('role')).toBe('menu')
    expect(wrapper.findAll('[data-mega-link]')).toHaveLength(3)
  })

  it('toggles the panel closed on a second click', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false } })
    await wrapper.get('[data-mega-trigger="0"]').trigger('click')
    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(true)
    await wrapper.get('[data-mega-trigger="0"]').trigger('click')
    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(false)
  })

  it('opens on hover when openOnHover is enabled', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items } })
    await wrapper.findAll('[role="menubar"] > li')[0]!.trigger('mouseenter')
    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(true)
  })

  it('emits open and close events with the item index', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false } })
    await wrapper.get('[data-mega-trigger="0"]').trigger('click')
    await wrapper.get('[data-mega-trigger="0"]').trigger('click')
    expect(wrapper.emitted('open')?.[0]).toEqual([0])
    expect(wrapper.emitted('close')?.[0]).toEqual([0])
  })

  it('emits select and closes when a link is clicked', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false } })
    await wrapper.get('[data-mega-trigger="0"]').trigger('click')
    await wrapper.findAll('[data-mega-link]')[0]!.trigger('click')

    const select = wrapper.emitted('select')
    expect(select).toBeTruthy()
    expect((select![0]![0] as { label: string }).label).toBe('Dashboards')
    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(false)
  })

  it('does not open a panel for a leaf (href-only) item', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false } })
    const docs = wrapper.get('[data-mega-trigger="2"]')
    expect(docs.element.tagName).toBe('A')
    expect(docs.attributes('href')).toBe('/docs')
    await docs.trigger('click')
    expect(wrapper.find('[data-mega-panel="2"]').exists()).toBe(false)
  })
})

describe('dzMegaMenu — Keyboard menubar navigation', () => {
  it('arrowRight moves roving focus to the next trigger', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false }, attachTo: document.body })
    await wrapper.get('[data-mega-trigger="0"]').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-mega-trigger="1"]').attributes('tabindex')).toBe('0')
    expect(wrapper.get('[data-mega-trigger="0"]').attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('arrowLeft wraps from the first trigger to the last', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false }, attachTo: document.body })
    await wrapper.get('[data-mega-trigger="0"]').trigger('keydown', { key: 'ArrowLeft' })
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-mega-trigger="2"]').attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('arrowDown opens the panel and focuses the first link', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false }, attachTo: document.body })
    await wrapper.get('[data-mega-trigger="0"]').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(true)
    const firstLink = wrapper.findAll('[data-mega-link]')[0]!
    expect(document.activeElement).toBe(firstLink.element)
    wrapper.unmount()
  })

  it('enter toggles the panel open', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false }, attachTo: document.body })
    await wrapper.get('[data-mega-trigger="0"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('arrowDown / ArrowUp move focus between panel links', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false }, attachTo: document.body })
    await wrapper.get('[data-mega-trigger="0"]').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    const links = wrapper.findAll('[data-mega-link]')
    await links[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(links[1]!.element)
    await links[1]!.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(links[0]!.element)
    wrapper.unmount()
  })
})

describe('dzMegaMenu — Esc handling', () => {
  it('closes the open panel on Escape and returns focus to the trigger', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, openOnHover: false }, attachTo: document.body })
    await wrapper.get('[data-mega-trigger="0"]').trigger('click')
    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(false)
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(wrapper.get('[data-mega-trigger="0"]').element)
    wrapper.unmount()
  })
})

describe('dzMegaMenu — Responsive collapse', () => {
  it('renders a stacked accordion (no menubar) when collapsed', async () => {
    const wrapper = mount(DzMegaMenu, { props: { items, collapsed: true } })
    expect(wrapper.find('[role="menubar"]').exists()).toBe(false)
    expect(wrapper.attributes('data-collapsed')).toBe('')

    // Disclosure expands inline on click rather than as a positioned panel.
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.find('[data-mega-panel="0"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-mega-link]').length).toBeGreaterThan(0)
  })

  it('collapses when matchMedia reports a match below the breakpoint', async () => {
    stubMatchMedia(true)
    const wrapper = mount(DzMegaMenu, { props: { items } })
    // matchMedia is read in onMounted; let the reactive update flush.
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="menubar"]').exists()).toBe(false)
  })

  it('renders the menubar (not collapsed) above the breakpoint', () => {
    stubMatchMedia(false)
    const wrapper = mount(DzMegaMenu, { props: { items } })
    expect(wrapper.find('[role="menubar"]').exists()).toBe(true)
  })
})

describe('dzMegaMenu — Slots', () => {
  it('renders custom #item content', () => {
    const wrapper = mount(DzMegaMenu, {
      props: { items, openOnHover: false },
      slots: { item: '<span class="custom-trigger">X</span>' },
    })
    expect(wrapper.find('.custom-trigger').exists()).toBe(true)
  })

  it('renders custom #group content for a featured card', async () => {
    const featured: DzMegaMenuItem[] = [
      {
        label: 'Solutions',
        items: [{ label: 'Featured', featured: true, items: [{ label: 'New', href: '/new' }] }],
      },
    ]
    const wrapper = mount(DzMegaMenu, {
      props: { items: featured, openOnHover: false },
      slots: { group: '<div class="featured-card">Card</div>' },
    })
    await wrapper.get('[data-mega-trigger="0"]').trigger('click')
    expect(wrapper.find('.featured-card').exists()).toBe(true)
  })
})
