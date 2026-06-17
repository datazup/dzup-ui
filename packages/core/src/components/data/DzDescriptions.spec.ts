import { mount } from '@vue/test-utils'
/**
 * DzDescriptions + DzDescriptionsItem — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzDescriptions from './DzDescriptions.vue'
import DzDescriptionsItem from './DzDescriptionsItem.vue'

const items = [
  { label: 'Name', value: 'Ada Lovelace' },
  { label: 'Role', value: 'Engineer' },
  { label: 'Bio', value: 'Mathematician and writer', span: 2 },
]

describe('dzDescriptions (items prop)', () => {
  it('renders a <dt> for every label and <dd> for every value', () => {
    const wrapper = mount(DzDescriptions, { props: { items } })
    const terms = wrapper.findAll('dt')
    const details = wrapper.findAll('dd')
    expect(terms).toHaveLength(3)
    expect(details).toHaveLength(3)
    expect(terms[0]!.text()).toBe('Name')
    expect(details[0]!.text()).toBe('Ada Lovelace')
  })

  it('groups each dt/dd pair in a div (valid dl semantics)', () => {
    const wrapper = mount(DzDescriptions, { props: { items } })
    const groups = wrapper.findAll('dl > div')
    expect(groups).toHaveLength(3)
    expect(groups[0]!.find('dt').exists()).toBe(true)
    expect(groups[0]!.find('dd').exists()).toBe(true)
  })

  it('applies grid-column span style for spanning entries', () => {
    const wrapper = mount(DzDescriptions, { props: { items } })
    const groups = wrapper.findAll('dl > div')
    // first two entries default to span 1 → no inline grid-column
    expect(groups[0]!.attributes('style') ?? '').not.toContain('grid-column')
    // third entry spans 2
    expect(groups[2]!.attributes('style')).toContain('grid-column: span 2')
  })

  it('renders numeric values', () => {
    const wrapper = mount(DzDescriptions, {
      props: { items: [{ label: 'Age', value: 36 }] },
    })
    expect(wrapper.find('dd').text()).toBe('36')
  })

  it('sets data-bordered when bordered', () => {
    const bordered = mount(DzDescriptions, { props: { items, bordered: true } })
    const plain = mount(DzDescriptions, { props: { items, bordered: false } })
    expect(bordered.attributes('data-bordered')).toBeDefined()
    expect(plain.attributes('data-bordered')).toBeUndefined()
  })

  it('sets responsive column CSS variables from a number', () => {
    const wrapper = mount(DzDescriptions, { props: { items, columns: 4 } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('--dz-descriptions-cols-base: 4')
    expect(style).toContain('--dz-descriptions-cols-xl: 4')
  })

  it('resolves responsive columns with mobile-first inheritance', () => {
    const wrapper = mount(DzDescriptions, {
      props: { items, columns: { base: 1, md: 3 } },
    })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('--dz-descriptions-cols-base: 1')
    expect(style).toContain('--dz-descriptions-cols-sm: 1') // inherits base
    expect(style).toContain('--dz-descriptions-cols-md: 3')
    expect(style).toContain('--dz-descriptions-cols-lg: 3') // inherits md
    expect(style).toContain('--dz-descriptions-cols-xl: 3')
  })

  it('renders slot children instead of items when items is omitted', () => {
    const wrapper = mount(DzDescriptions, {
      slots: {
        default: () =>
          h(DzDescriptionsItem, { label: 'Status' }, { default: () => 'Active' }),
      },
    })
    expect(wrapper.find('dt').text()).toBe('Status')
    expect(wrapper.find('dd').text()).toBe('Active')
  })
})

describe('dzDescriptionsItem (slot child)', () => {
  function mountItem(itemProps = {}, slots = {}) {
    return mount(DzDescriptions, {
      slots: {
        default: () => h(DzDescriptionsItem, itemProps, slots),
      },
    })
  }

  it('renders label from prop and value from default slot', () => {
    const wrapper = mountItem({ label: 'Email' }, { default: () => 'ada@dz.dev' })
    expect(wrapper.find('dt').text()).toBe('Email')
    expect(wrapper.find('dd').text()).toBe('ada@dz.dev')
  })

  it('renders a label slot overriding the prop', () => {
    const wrapper = mountItem(
      { label: 'ignored' },
      {
        label: () => h('span', { 'data-testid': 'custom-label' }, 'Custom'),
        default: () => 'value',
      },
    )
    expect(wrapper.find('[data-testid="custom-label"]').exists()).toBe(true)
    expect(wrapper.find('dt').text()).toBe('Custom')
  })

  it('applies grid-column span style when span > 1', () => {
    const wrapper = mountItem({ label: 'Bio', span: 3 }, { default: () => 'text' })
    expect(wrapper.find('dl > div').attributes('style')).toContain('grid-column: span 3')
  })

  it('inherits bordered density from the parent', () => {
    const wrapper = mount(DzDescriptions, {
      props: { bordered: true },
      slots: {
        default: () => h(DzDescriptionsItem, { label: 'A' }, { default: () => 'B' }),
      },
    })
    // bordered label cells carry the muted background utility
    expect(wrapper.find('dt').classes().some(c => c.includes('dz-descriptions-label-bg')))
      .toBe(true)
  })
})
