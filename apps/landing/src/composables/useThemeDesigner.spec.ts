import { decodeThemeRecipe, PALETTE_CONFIGS } from '@dzup-ui/tokens'
import { afterEach, describe, expect, it } from 'vitest'
import { useThemeDesigner } from './useThemeDesigner.ts'

/**
 * Guards the Theme Designer's core promises (docs/landing — /themes editor):
 *   • the single override map re-skins via the PRIMITIVE ramp (so light+dark
 *     stay correct through the semantic indirection),
 *   • only *changed* palettes are emitted (honest, lean export),
 *   • the CSS + JSON exports reflect the live design, and
 *   • a shared URL reproduces the EXACT theme (serialize → deserialize round-trip)
 *     — the headline success criterion.
 *
 * The store is a module singleton, so each test resets it afterwards.
 */
describe('useThemeDesigner', () => {
  const d = useThemeDesigner()

  afterEach(() => d.reset())

  it('expands a complete recipe at the shipped defaults', () => {
    expect(Object.keys(d.vars.value).length).toBeGreaterThan(100)
    expect(d.hasOverrides.value).toBe(false)
    expect(d.paletteChanged('primary')).toBe(false)
    expect(d.vars.value['--dz-colors-primary-500']).toContain('260.0')
    expect(d.cssText.value).toContain(':root {')
    expect(d.cssText.value).toContain('[data-theme="dark"] {')
    expect(d.cssText.value.match(/--dz-shadow-md:/g)).toHaveLength(2)
  })

  it('regenerates the primitive ramp when a palette hue changes', () => {
    d.palettes.primary.hue = 20 // rose-ish, far from the shipped 260
    expect(d.paletteChanged('primary')).toBe(true)
    // A full 11-shade ramp is emitted for the changed palette…
    for (const shade of [50, 100, 500, 900, 950]) {
      const value = d.vars.value[`--dz-colors-primary-${shade}`]
      expect(value, `shade ${shade}`).toMatch(/^oklch\([\d.]+ [\d.]+ 20\.0\)$/)
    }
    // …and the CSS export carries it as a real override, on the PRIMITIVE ramp
    // (not the semantic token) so the swap is correct in both themes.
    expect(d.cssText.value).toContain('--dz-colors-primary-500: oklch(')
    expect(d.cssText.value).not.toContain('--dz-primary:')
  })

  it('keeps unchanged palettes at their canonical values', () => {
    d.palettes.primary.hue = 20
    expect(d.vars.value['--dz-colors-secondary-500']).toContain('290.0')
    expect(d.vars.value['--dz-colors-success-500']).toContain('145.0')
  })

  it('expands radius, density, shadow and font changes', () => {
    const defaultRadius = d.vars.value['--dz-radius-lg']
    const defaultSpacing = d.vars.value['--dz-spacing-4']
    d.radiusScale.value = 1.5
    d.density.value = 'compact'
    d.shadowIntensity.value = 2
    d.fontKey.value = 'serif'
    expect(d.vars.value['--dz-radius-lg']).not.toBe(defaultRadius)
    expect(d.vars.value['--dz-spacing-4']).not.toBe(defaultSpacing)
    expect(d.vars.value['--dz-shadow-md']).toContain('oklch(')
    expect(d.vars.value['--dz-font-sans']).toContain('serif')
  })

  it('computes WCAG contrast pairs for both themes', () => {
    // Body text on the surface is high-contrast by construction in both themes.
    const lightBody = d.contrastLight.value.find(p => p.label === 'Body text')
    const darkBody = d.contrastDark.value.find(p => p.label === 'Body text')
    expect(lightBody?.ratio).toBeGreaterThan(7)
    expect(darkBody?.ratio).toBeGreaterThan(7)
    expect(lightBody?.passNormal).toBe(true)
    expect(typeof d.failingCount.value).toBe('number')
  })

  it('produces a structured JSON export of the current design', () => {
    d.palettes.primary.hue = 20
    d.radiusScale.value = 1.4
    const parsed = JSON.parse(d.jsonText.value)
    expect(parsed.version).toBe(1)
    expect(parsed.preset).toBe('custom')
    expect(parsed.palettes.primary.hue).toBe(20)
    expect(parsed.radius).toBe(1.4)
    expect(parsed.cssVars).toBeUndefined()
  })

  it('reproduces the exact theme from a shared URL token (round-trip)', () => {
    d.palettes.primary.hue = 18
    d.palettes.primary.chroma = 0.19
    d.palettes.neutral.hue = 18
    d.radiusScale.value = 1.6
    d.density.value = 'spacious'
    d.shadowIntensity.value = 1.4
    d.fontKey.value = 'rounded'
    const token = d.serialize()
    const cssBefore = d.cssText.value
    expect(token).not.toBe('')

    // Wipe the design, then restore purely from the token.
    d.reset()
    expect(d.hasOverrides.value).toBe(false)
    const applied = d.deserialize(token)

    expect(applied).toBe(true)
    expect(d.palettes.primary.hue).toBe(18)
    expect(d.palettes.primary.chroma).toBe(0.19)
    expect(d.radiusScale.value).toBe(1.6)
    expect(d.density.value).toBe('spacious')
    expect(d.shadowIntensity.value).toBe(1.4)
    expect(d.fontKey.value).toBe('rounded')
    // The reconstructed CSS is byte-identical → the link reproduces the theme.
    expect(d.cssText.value).toBe(cssBefore)
  })

  it('serialises a versioned default recipe', () => {
    const decoded = decodeThemeRecipe(d.serialize())
    expect(decoded.version).toBe(1)
    expect(decoded.preset).toBe('dzup')
    expect(d.palettes.primary.hue).toBe(PALETTE_CONFIGS.primary.hue)
  })

  it('ignores a malformed URL token without throwing', () => {
    expect(d.deserialize('not-valid-base64!!')).toBe(false)
    expect(d.hasOverrides.value).toBe(false)
  })
})
