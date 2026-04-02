import { mount } from '@vue/test-utils'
/**
 * DzSplitter (alias for DzResizable) — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzSplitter from './DzSplitter.vue'
import DzSplitterHandle from './DzSplitterHandle.vue'
import DzSplitterPanel from './DzSplitterPanel.vue'

/** Helper to render a splitter layout */
function mountSplitter(splitterProps: Record<string, unknown> = {}) {
  return mount(DzSplitter, {
    props: { direction: 'horizontal', ...splitterProps },
    slots: {
      default: () => [
        h(DzSplitterPanel, { defaultSize: 50 }, {
          default: () => 'Panel A',
        }),
        h(DzSplitterHandle, { withHandle: true }),
        h(DzSplitterPanel, { defaultSize: 50 }, {
          default: () => 'Panel B',
        }),
      ],
    },
  })
}

describe('dzSplitter — Unit Tests', () => {
  it('renders successfully', () => {
    const wrapper = mountSplitter()
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mountSplitter()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('forwards aria-label', () => {
    const wrapper = mountSplitter({ ariaLabel: 'Splitter panels' })
    expect(wrapper.attributes('aria-label')).toBe('Splitter panels')
  })

  it('forwards aria-labelledby', () => {
    const wrapper = mountSplitter({ ariaLabelledby: 'splitter-label' })
    expect(wrapper.attributes('aria-labelledby')).toBe('splitter-label')
  })

  it('forwards aria-describedby', () => {
    const wrapper = mountSplitter({ ariaDescribedby: 'splitter-desc' })
    expect(wrapper.attributes('aria-describedby')).toBe('splitter-desc')
  })

  it('forwards id to root element', () => {
    const wrapper = mountSplitter({ id: 'my-splitter' })
    // SplitterGroup from Reka UI may render the id on its root element
    expect(wrapper.html()).toContain('my-splitter')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSplitter, {
      props: { direction: 'horizontal' },
      attrs: { class: 'my-splitter' },
      slots: {
        default: () => [
          h(DzSplitterPanel, { defaultSize: 100 }, {
            default: () => 'Content',
          }),
        ],
      },
    })
    expect(wrapper.classes()).toContain('my-splitter')
  })

  it('renders panel content', () => {
    const wrapper = mountSplitter()
    expect(wrapper.text()).toContain('Panel A')
    expect(wrapper.text()).toContain('Panel B')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mountSplitter({ disabled: true })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('does not set data-disabled when not disabled', () => {
    const wrapper = mountSplitter({ disabled: false })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  it('renders vertical direction', () => {
    const wrapper = mountSplitter({ direction: 'vertical' })
    expect(wrapper.exists()).toBe(true)
  })
})

describe('dzSplitterPanel — Unit Tests', () => {
  it('renders within the splitter group', () => {
    const wrapper = mountSplitter()
    const panels = wrapper.findAllComponents(DzSplitterPanel)
    expect(panels).toHaveLength(2)
  })
})

describe('dzSplitterHandle — Unit Tests', () => {
  it('renders within the splitter group', () => {
    const wrapper = mountSplitter()
    const handles = wrapper.findAllComponents(DzSplitterHandle)
    expect(handles).toHaveLength(1)
  })
})
