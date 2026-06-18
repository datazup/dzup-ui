import { mount } from '@vue/test-utils'
/**
 * DzColorModeToggle — Contract Spec v1 conformance tests.
 *
 * Verifies the public API (variants, props, ARIA, events) of the theme switch.
 * These tests mount the control WITHOUT a DzThemeProvider — `useTheme` is
 * consumed in `optional` mode, so the control renders against a no-op sentinel
 * (theme = 'system', resolved = 'light'). Provider-backed behaviour (cycling,
 * persistence, system-following) is covered in DzColorModeToggle.spec.ts.
 */
import { describe, expect, it } from 'vitest'
import DzColorModeToggle from './DzColorModeToggle.vue'

describe('dzColorModeToggle — Contract Spec v1', () => {
  // ── Variant: icon ──

  it('icon variant renders a real button', () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'icon' } })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('icon variant exposes an action-oriented accessible label', () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'icon' } })
    // Sentinel preference is 'system'; the next mode in the cycle is 'light'.
    expect(wrapper.find('button').attributes('aria-label')).toBe('Switch to light theme')
  })

  it('icon variant reflects the active mode via data-mode', () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'icon' } })
    expect(wrapper.find('[data-mode]').attributes('data-mode')).toBe('system')
  })

  // ── Variant: switch ──

  it('switch variant renders role="switch"', () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'switch' } })
    expect(wrapper.find('[role="switch"]').exists()).toBe(true)
  })

  it('switch variant is unchecked when resolved mode is light', () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'switch' } })
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('false')
  })

  // ── Variant: segmented ──

  it('segmented variant renders one option per mode (light/dark/system)', () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'segmented' } })
    expect(wrapper.findAll('button')).toHaveLength(3)
  })

  it('segmented variant drops the system option when showSystem is false', () => {
    const wrapper = mount(DzColorModeToggle, {
      props: { variant: 'segmented', showSystem: false },
    })
    const labels = wrapper.findAll('button').map(b => b.text())
    expect(labels).toHaveLength(2)
    expect(labels).not.toContain('System')
  })

  it('segmented variant renders the default mode labels', () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'segmented' } })
    expect(wrapper.text()).toContain('Light')
    expect(wrapper.text()).toContain('Dark')
    expect(wrapper.text()).toContain('System')
  })

  // ── Labels override (i18n) ──

  it('applies label overrides to the segmented options', () => {
    const wrapper = mount(DzColorModeToggle, {
      props: {
        variant: 'segmented',
        labels: { light: 'Helles', dark: 'Dunkles', system: 'System' },
      },
    })
    expect(wrapper.text()).toContain('Helles')
    expect(wrapper.text()).toContain('Dunkles')
  })

  // ── Accessibility ──

  it('honours a consumer-supplied aria-label on the icon variant', () => {
    const wrapper = mount(DzColorModeToggle, {
      props: { variant: 'icon', ariaLabel: 'Theme' },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Theme')
  })

  it('renders a polite live region announcing the active mode', () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'icon' } })
    const live = wrapper.find('[aria-live="polite"]')
    expect(live.exists()).toBe(true)
    expect(live.text()).toContain('System theme')
  })

  // ── Sizing ──

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzColorModeToggle, { props: { variant: 'icon', size } })
      expect(wrapper.find('button').exists()).toBe(true)
    }
  })

  // ── Events ──

  it('emits change with the next mode when the icon is activated', async () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'icon' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('change')![0]).toEqual(['light'])
  })

  // ── Class merging ──

  it('merges a consumer class onto the root via cn()', () => {
    const wrapper = mount(DzColorModeToggle, {
      props: { variant: 'icon' },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.classes()).toContain('custom-class')
  })

  // ── Default variant ──

  it('defaults to the icon variant', () => {
    const wrapper = mount(DzColorModeToggle)
    expect(wrapper.attributes('data-variant')).toBe('icon')
  })
})
