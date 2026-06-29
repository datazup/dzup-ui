import { afterEach, describe, expect, it } from 'vitest'
import { useBlockTheme } from './useBlockTheme.ts'

/**
 * Guards the single-source guarantee behind the /blocks theme editor
 * (docs/blocks.md §3.4): one override store must feed BOTH the preview `:style`
 * map AND the copied `:root{}`. The store is a module singleton, so each test
 * resets it afterwards.
 */
describe('useBlockTheme', () => {
  const theme = useBlockTheme()

  afterEach(() => theme.reset())

  it('emits no overrides at the shipped defaults', () => {
    expect(theme.vars.value).toEqual({})
    expect(theme.hasOverrides.value).toBe(false)
    expect(theme.rootCss.value).toBe('')
    expect(theme.themeCssBlock.value).toBe('')
    expect(theme.contrastWarning.value).toBeNull()
  })

  it('maps a brand colour onto the primary token set', () => {
    theme.brand.value = '#4f46e5'
    expect(theme.vars.value['--dz-primary']).toBe('#4f46e5')
    expect(theme.vars.value['--dz-ring']).toBe('#4f46e5')
    expect(theme.vars.value['--dz-link']).toBe('#4f46e5')
    // A dark brand takes near-white text and clears AA, so no warning.
    expect(theme.vars.value['--dz-primary-foreground']).toBe('var(--dz-colors-neutral-50)')
    expect(theme.contrastWarning.value).toBeNull()
  })

  it('picks near-black text on a light brand', () => {
    theme.brand.value = '#fde047'
    expect(theme.vars.value['--dz-primary-foreground']).toBe('var(--dz-colors-neutral-950)')
  })

  it('warns when a muddy mid-tone brand cannot reach AA either way', () => {
    theme.brand.value = '#8a8a8a'
    expect(theme.brandContrast.value).not.toBeNull()
    expect(theme.brandContrast.value as number).toBeLessThan(4.5)
    expect(theme.contrastWarning.value).toMatch(/WCAG AA/)
  })

  it('scales the named radius steps but leaves the pill alone', () => {
    theme.radiusScale.value = 1.5
    // 0.5rem (md) × 1.5 = 0.75rem.
    expect(theme.vars.value['--dz-radius-md']).toBe('0.75rem')
    expect(theme.vars.value['--dz-radius-sm']).toBe('0.375rem')
    expect(theme.vars.value).not.toHaveProperty('--dz-radius-full')
    expect(theme.vars.value).not.toHaveProperty('--dz-radius-none')
  })

  it('scales the spacing scale per density, and not at comfortable', () => {
    theme.density.value = 'comfortable'
    expect(theme.vars.value).not.toHaveProperty('--dz-spacing-4')

    theme.density.value = 'spacious'
    // 1rem (spacing-4) × 1.15 = 1.15rem; dotted steps map `.` → `_`.
    expect(theme.vars.value['--dz-spacing-4']).toBe('1.15rem')
    expect(theme.vars.value).toHaveProperty('--dz-spacing-1_5')
  })

  it('serialises the SAME vars into rootCss — never computed twice', () => {
    theme.brand.value = '#4f46e5'
    theme.radiusScale.value = 1.25
    theme.density.value = 'compact'

    const css = theme.rootCss.value
    expect(css.startsWith(':root {')).toBe(true)
    // Every override in the style map appears verbatim in the copied block.
    for (const [prop, value] of Object.entries(theme.vars.value)) {
      expect(css).toContain(`${prop}: ${value};`)
    }
    expect(theme.themeCssBlock.value).toContain(css)
  })

  it('reset restores the shipped defaults', () => {
    theme.brand.value = '#ef4444'
    theme.radiusScale.value = 0.5
    theme.density.value = 'spacious'
    theme.reset()
    expect(theme.brand.value).toBe('')
    expect(theme.radiusScale.value).toBe(1)
    expect(theme.density.value).toBe('comfortable')
    expect(theme.hasOverrides.value).toBe(false)
  })
})
