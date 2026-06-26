import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
/**
 * DzMasonry -- Unit / behavior tests.
 */
import { defineComponent, nextTick } from 'vue'
import DzMasonry from './DzMasonry.vue'

const items = {
  default: Array.from({ length: 6 }, (_, i) => `<div class="item">Item ${i + 1}</div>`).join(''),
}

describe('dzMasonry -- Unit Tests', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // -- CSS fast path --

  it('applies columns-N utility for a numeric column count', () => {
    const wrapper = mount(DzMasonry, { props: { columns: 5 }, slots: items })
    expect(wrapper.classes()).toContain('columns-5')
  })

  it('handles a partial responsive columns object', () => {
    const wrapper = mount(DzMasonry, {
      props: { columns: { md: 3 } },
      slots: items,
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('md:columns-3')
    expect(classStr).not.toContain('sm:columns')
    expect(classStr).not.toContain('lg:columns')
  })

  it('maps gap=none to the spacing-0 token', () => {
    const wrapper = mount(DzMasonry, { props: { gap: 'none' }, slots: items })
    expect(wrapper.attributes('style')).toContain('var(--dz-spacing-0)')
  })

  it('maps gap=xl to the spacing-8 token', () => {
    const wrapper = mount(DzMasonry, { props: { gap: 'xl' }, slots: items })
    expect(wrapper.attributes('style')).toContain('var(--dz-spacing-8)')
  })

  it('renders as <ul> when as="ul"', () => {
    const wrapper = mount(DzMasonry, {
      props: { as: 'ul' },
      slots: { default: '<li>Item</li>' },
    })
    expect(wrapper.element.tagName).toBe('UL')
  })

  // -- Measured-JS path --

  it('distributes items round-robin across columns before measurement', () => {
    const wrapper = mount(DzMasonry, {
      props: { columns: 3, sequential: false },
      slots: items,
    })
    const columns = wrapper.findAll('.dz-masonry__column')
    expect(columns).toHaveLength(3)
    // 6 items / 3 columns -> 2 per column with zero-height round-robin fallback.
    for (const column of columns)
      expect(column.findAll('.dz-masonry__item')).toHaveLength(2)
  })

  it('keeps source order within the JS-path round-robin distribution', () => {
    const wrapper = mount(DzMasonry, {
      props: { columns: 2, sequential: false },
      slots: items,
    })
    const columns = wrapper.findAll('.dz-masonry__column')
    // Column 0 -> items 1,3,5 ; column 1 -> items 2,4,6
    expect(columns[0]!.text()).toBe('Item 1Item 3Item 5')
    expect(columns[1]!.text()).toBe('Item 2Item 4Item 6')
  })

  it('makes the measured-path container fill its parent width (not shrink-to-fit)', () => {
    const wrapper = mount(DzMasonry, {
      props: { columns: 4, sequential: false },
      slots: items,
    })
    // The flex row must carry an explicit full width so it does not collapse
    // under a shrink-to-fit ancestor; every column is flex-1 min-w-0 and
    // contributes no intrinsic width of its own.
    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.classes()).toContain('flex')
  })

  it('distributes items across every column in the measured path', () => {
    const wrapper = mount(DzMasonry, {
      props: { columns: 4, sequential: false },
      slots: items,
    })
    const columns = wrapper.findAll('.dz-masonry__column')
    expect(columns).toHaveLength(4)
    // 6 items / 4 columns -> no column may be left empty.
    for (const column of columns)
      expect(column.findAll('.dz-masonry__item').length).toBeGreaterThan(0)
  })

  it('forwards aria-describedby', () => {
    const wrapper = mount(DzMasonry, {
      props: { ariaDescribedby: 'desc-1' },
      slots: items,
    })
    expect(wrapper.attributes('aria-describedby')).toBe('desc-1')
  })

  // -- Dynamic children --

  it('reflows when children are added or removed', async () => {
    const Parent = defineComponent({
      components: { DzMasonry },
      props: { count: { type: Number, default: 3 } },
      template: `
        <DzMasonry :columns="2" :sequential="false">
          <div v-for="n in count" :key="n" class="item">Item {{ n }}</div>
        </DzMasonry>
      `,
    })
    const wrapper = mount(Parent, { props: { count: 3 } })
    await nextTick()
    expect(wrapper.findAll('.dz-masonry__item')).toHaveLength(3)

    await wrapper.setProps({ count: 5 })
    await nextTick()
    expect(wrapper.findAll('.dz-masonry__item')).toHaveLength(5)
  })

  // -- Resize-aware column count --

  it('reflows the column count on container resize', async () => {
    let trigger: () => void = () => {}
    class MockResizeObserver {
      constructor(cb: () => void) {
        trigger = cb
      }

      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    const wrapper = mount(DzMasonry, {
      props: { columns: { xs: 1, lg: 3 }, sequential: false },
      slots: items,
    })
    await nextTick()
    // Initial measured width is 0 -> xs breakpoint -> a single column.
    expect(wrapper.findAll('.dz-masonry__column')).toHaveLength(1)

    Object.defineProperty(wrapper.element, 'offsetWidth', { value: 1200, configurable: true })
    trigger()
    // Wait out the 60ms re-measure debounce.
    await new Promise(resolve => setTimeout(resolve, 90))
    await nextTick()

    expect(wrapper.findAll('.dz-masonry__column')).toHaveLength(3)
  })
})
