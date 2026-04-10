import { mount } from '@vue/test-utils'
/**
 * DzCodeBlock — Unit / behavior tests.
 */
import { describe, expect, it, vi } from 'vitest'
import DzCodeBlock from './DzCodeBlock.vue'

// Mock the Clipboard API for DzCopyButton usage
const writeTextMock = vi.fn().mockResolvedValue(undefined)
Object.assign(navigator, {
  clipboard: { writeText: writeTextMock },
})

describe('dzCodeBlock', () => {
  const sampleCode = 'const x = 1\nconst y = 2\nreturn x + y'

  // ── Rendering ──

  it('renders code content', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: sampleCode } })
    expect(wrapper.text()).toContain('const x = 1')
    expect(wrapper.text()).toContain('const y = 2')
  })

  it('renders a <pre><code> structure', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: sampleCode } })
    const pre = wrapper.find('pre')
    expect(pre.exists()).toBe(true)
    const code = pre.find('code')
    expect(code.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode },
      attrs: { class: 'my-custom' },
    })
    expect(wrapper.classes()).toContain('my-custom')
  })

  // ── Line numbers ──

  it('does not show line numbers by default', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: sampleCode } })
    expect(wrapper.find('[data-part="line-number"]').exists()).toBe(false)
  })

  it('shows line numbers when showLineNumbers is true', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode, showLineNumbers: true },
    })
    const lineNumbers = wrapper.findAll('[data-part="line-number"]')
    expect(lineNumbers).toHaveLength(3)
    expect(lineNumbers.at(0)?.text()).toBe('1')
    expect(lineNumbers.at(1)?.text()).toBe('2')
    expect(lineNumbers.at(2)?.text()).toBe('3')
  })

  // ── Header ──

  it('shows filename in header', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode, filename: 'index.ts' },
    })
    const filename = wrapper.find('[data-part="filename"]')
    expect(filename.exists()).toBe(true)
    expect(filename.text()).toBe('index.ts')
  })

  it('shows language badge in header', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode, language: 'typescript' },
    })
    const lang = wrapper.find('[data-part="language"]')
    expect(lang.exists()).toBe(true)
    expect(lang.text()).toBe('typescript')
  })

  it('adds language class to code element', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode, language: 'typescript' },
    })
    const code = wrapper.find('code')
    expect(code.classes()).toContain('language-typescript')
  })

  // ── Copy button ──

  it('shows copy button by default (copyable=true)', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: sampleCode } })
    const copyBtn = wrapper.find('[data-part="copy-button"]')
    expect(copyBtn.exists()).toBe(true)
  })

  it('hides copy button when copyable is false', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode, copyable: false },
    })
    const copyBtn = wrapper.find('[data-part="copy-button"]')
    expect(copyBtn.exists()).toBe(false)
  })

  it('hides header when no filename, language, or copyable', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode, copyable: false },
    })
    const header = wrapper.find('[data-part="header"]')
    expect(header.exists()).toBe(false)
  })

  // ── Max height ──

  it('applies maxHeight style to content area', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode, maxHeight: '200px' },
    })
    const content = wrapper.find('[data-part="content"]')
    expect(content.attributes('style')).toContain('max-height: 200px')
    expect(content.attributes('style')).toContain('overflow-y: auto')
  })

  // ── Accessibility ──

  it('has role="region"', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: sampleCode } })
    expect(wrapper.attributes('role')).toBe('region')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode, ariaLabel: 'Example code snippet' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Example code snippet')
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: sampleCode } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Slots ──

  it('renders custom header slot', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode },
      slots: {
        header: '<div data-testid="custom-header">Custom Header</div>',
      },
    })
    expect(wrapper.find('[data-testid="custom-header"]').exists()).toBe(true)
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzCodeBlock, {
      props: { code: sampleCode },
      slots: {
        actions: '<button data-testid="custom-action">Run</button>',
      },
    })
    expect(wrapper.find('[data-testid="custom-action"]').exists()).toBe(true)
  })
})
