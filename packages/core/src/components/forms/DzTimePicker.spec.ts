import { mount } from '@vue/test-utils'
/**
 * DzTimePicker — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzTimePicker from './DzTimePicker.vue'

describe('dzTimePicker — Unit Tests', () => {
  it('renders the time picker root', () => {
    const wrapper = mount(DzTimePicker)
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzTimePicker, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('dz-input-lg-height')
  })

  it('applies variant classes (outline)', () => {
    const wrapper = mount(DzTimePicker, {
      props: { variant: 'outline' },
    })
    expect(wrapper.html()).toContain('border')
  })

  it('applies variant classes (filled)', () => {
    const wrapper = mount(DzTimePicker, {
      props: { variant: 'filled' },
    })
    expect(wrapper.html()).toContain('dz-muted')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzTimePicker, {
      props: { disabled: true },
    })
    const root = wrapper.find('[data-disabled]')
    expect(root.exists()).toBe(true)
  })

  it('applies invalid styling when invalid', () => {
    const wrapper = mount(DzTimePicker, {
      props: { invalid: true },
    })
    // Reka UI TimeFieldRoot may not forward data-invalid;
    // verify the invalid variant class is applied
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTimePicker, {
      attrs: { class: 'my-time' },
    })
    expect(wrapper.html()).toContain('my-time')
  })

  it('renders clock icon', () => {
    const wrapper = mount(DzTimePicker)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders colon separator', () => {
    const wrapper = mount(DzTimePicker)
    expect(wrapper.text()).toContain(':')
  })

  it('renders editable segment inputs (hour + minute spinbuttons)', () => {
    const wrapper = mount(DzTimePicker)
    // Reka renders each editable segment with role="spinbutton".
    const segments = wrapper.findAll('[role="spinbutton"]')
    expect(segments.length).toBeGreaterThanOrEqual(2)
  })

  it('displays the bound model value in the segments', () => {
    const wrapper = mount(DzTimePicker, {
      props: { modelValue: '14:30', hour12: false },
    })
    // 24-hour cycle: hour "14" and minute "30" must be visible.
    expect(wrapper.text()).toContain('14')
    expect(wrapper.text()).toContain('30')
  })

  it('renders a dayPeriod (AM/PM) segment when hour12 is enabled', () => {
    const wrapper = mount(DzTimePicker, {
      props: { modelValue: '14:30', hour12: true },
    })
    expect(wrapper.text()).toContain('PM')
  })

  it('shows placeholder text while empty', () => {
    const wrapper = mount(DzTimePicker, {
      props: { placeholder: 'Select time' },
    })
    expect(wrapper.text()).toContain('Select time')
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzTimePicker)
    const root = wrapper.find('[style*="contain: layout style"]')
    expect(root.exists()).toBe(true)
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzTimePicker)
    const root = wrapper.find('[style*="contain"]')
    await root.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzTimePicker)
    const root = wrapper.find('[style*="contain"]')
    await root.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('reflects the required prop via aria-required', () => {
    const wrapper = mount(DzTimePicker, { props: { required: true } })
    expect(wrapper.find('[style*="contain"]').attributes('aria-required')).toBe('true')
  })

  it('renders with min/max/step bounds without error', () => {
    const wrapper = mount(DzTimePicker, {
      props: { modelValue: '14:30', min: '09:00', max: '17:00', step: 15 },
    })
    // Bounds/step are forwarded to Reka's TimeFieldRoot; component mounts cleanly.
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('renders an inline error message linked via aria-describedby', () => {
    const wrapper = mount(DzTimePicker, { props: { error: 'Time required' } })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Time required')
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })
})
