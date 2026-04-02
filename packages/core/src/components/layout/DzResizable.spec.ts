import { mount } from '@vue/test-utils'
/**
 * DzResizable (compound, Reka UI Splitter) — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzResizable from './DzResizable.vue'
import DzResizableHandle from './DzResizableHandle.vue'
import DzResizablePanel from './DzResizablePanel.vue'

/** Helper to render a resizable layout */
function mountResizable(resizableProps = {}) {
  return mount(DzResizable, {
    props: { direction: 'horizontal', ...resizableProps },
    slots: {
      default: () => [
        h(DzResizablePanel, { defaultSize: 50 }, {
          default: () => 'Panel A',
        }),
        h(DzResizableHandle, { withHandle: true }),
        h(DzResizablePanel, { defaultSize: 50 }, {
          default: () => 'Panel B',
        }),
      ],
    },
  })
}

describe('dzResizable', () => {
  it('renders successfully', () => {
    const wrapper = mountResizable()
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style', () => {
    const wrapper = mountResizable()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('forwards aria-label', () => {
    const wrapper = mountResizable({ ariaLabel: 'Resizable panels' })
    expect(wrapper.attributes('aria-label')).toBe('Resizable panels')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzResizable, {
      props: { direction: 'horizontal' },
      attrs: { class: 'my-resizable' },
      slots: {
        default: () => [
          h(DzResizablePanel, { defaultSize: 100 }, {
            default: () => 'Content',
          }),
        ],
      },
    })
    expect(wrapper.classes()).toContain('my-resizable')
  })

  it('renders panel content', () => {
    const wrapper = mountResizable()
    expect(wrapper.text()).toContain('Panel A')
    expect(wrapper.text()).toContain('Panel B')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mountResizable({ disabled: true })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('renders vertical direction', () => {
    const wrapper = mountResizable({ direction: 'vertical' })
    expect(wrapper.exists()).toBe(true)
  })
})

describe('dzResizablePanel', () => {
  it('renders within the resizable group', () => {
    const wrapper = mountResizable()
    const panels = wrapper.findAllComponents(DzResizablePanel)
    expect(panels).toHaveLength(2)
  })
})

describe('dzResizableHandle', () => {
  it('renders within the resizable group', () => {
    const wrapper = mountResizable()
    const handles = wrapper.findAllComponents(DzResizableHandle)
    expect(handles).toHaveLength(1)
  })
})
