import { mount } from '@vue/test-utils'
/**
 * DzQRCode — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzQRCode from './DzQRCode.vue'

describe('dzQRCode — Unit Tests', () => {
  it('renders a <div> root containing the QR <svg>', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'hello' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('produces a non-empty path of dark modules', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'hello' } })
    const d = wrapper.find('path').attributes('d')
    expect(d).toBeTruthy()
    expect(d!.length).toBeGreaterThan(0)
  })

  it('applies the size prop to the root', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'x', size: 240 } })
    expect(wrapper.attributes('style')).toContain('width: 240px')
    expect(wrapper.attributes('style')).toContain('height: 240px')
  })

  it('applies color and background to the matrix', () => {
    const wrapper = mount(DzQRCode, {
      props: { value: 'x', color: 'var(--dz-primary)', background: 'var(--dz-muted)' },
    })
    expect(wrapper.find('path').attributes('fill')).toBe('var(--dz-primary)')
    expect(wrapper.find('rect').attributes('fill')).toBe('var(--dz-muted)')
  })

  it('defaults colors to foreground/background tokens', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'x' } })
    expect(wrapper.find('path').attributes('fill')).toBe('var(--dz-foreground)')
    expect(wrapper.find('rect').attributes('fill')).toBe('var(--dz-background)')
  })

  it('renders nothing when value is empty', () => {
    const wrapper = mount(DzQRCode, { props: { value: '' } })
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.attributes('data-state')).toBe('empty')
  })

  it('renders a centered logo from the icon prop', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'x', icon: '/logo.svg' } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/logo.svg')
    // decorative — not part of the accessible name
    expect(img.attributes('alt')).toBe('')
  })

  it('renders the logo slot over the icon prop', () => {
    const wrapper = mount(DzQRCode, {
      props: { value: 'x', icon: '/logo.svg' },
      slots: { logo: '<span data-testid="custom-logo">L</span>' },
    })
    expect(wrapper.find('[data-testid="custom-logo"]').exists()).toBe(true)
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('shows a loading overlay when status is loading', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'x', status: 'loading' } })
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('shows a refresh action when expired and emits refresh on click', async () => {
    const wrapper = mount(DzQRCode, { props: { value: 'x', status: 'expired' } })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    await button.trigger('click')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
  })

  it('renders a custom expired slot', () => {
    const wrapper = mount(DzQRCode, {
      props: { value: 'x', status: 'expired' },
      slots: { expired: '<button data-testid="renew">Renew</button>' },
    })
    expect(wrapper.find('[data-testid="renew"]').exists()).toBe(true)
  })

  it('does not show overlays when status is active', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'x', status: 'active' } })
    expect(wrapper.find('.animate-spin').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'x', id: 'qr-1' } })
    expect(wrapper.attributes('id')).toBe('qr-1')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzQRCode, {
      props: { value: 'x' },
      attrs: { 'data-testid': 'qr' },
    })
    expect(wrapper.attributes('data-testid')).toBe('qr')
  })
})
