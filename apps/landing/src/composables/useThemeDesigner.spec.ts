import { afterEach, describe, expect, it } from 'vitest'
import { PALETTE_CONFIGS } from '@dzup-ui/tokens'
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

  it('emits no overrides at the shipped defaults', () => {
    expect(d.vars.value).toEqual({})
    expect(d.hasOverrides.value).toBe(false)
    expect(d.paletteChanged('primary')).toBe(false)
    // The CSS still serialises, just with no properties.
    expect(d.cssText.value).toContain(':root {')
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

  it('does not emit unchanged palettes', () => {
    d.palettes.primary.hue = 20
    // secondary/success/etc. left at defaults → no keys for them.
    expect(d.vars.value['--dz-colors-secondary-500']).toBeUndefined()
    expect(d.vars.value['--dz-colors-success-500']).toBeUndefined()
  })

  it('emits radius, density, shadow and font overrides only when moved', () => {
    expect(d.vars.value['--dz-radius-lg']).toBeUndefined()
    d.radiusScale.value = 1.5
    d.density.value = 'compact'
    d.shadowIntensity.value = 2
    d.fontKey.value = 'serif'
    expect(d.vars.value['--dz-radius-lg']).toBeDefined()
    expect(d.vars.value['--dz-spacing-4']).toBeDefined()
    expect(d.vars.value['--dz-shadow-md']).toContain('oklch(')
    expect(d.vars.value['--dz-font-sans']).toContain('serif')
  })

  it('computes WCAG contrast pairs for both themes', () => {
    // Body text on the surface is high-contrast by construction in both themes.
    const lightBody = d.contrastLight.value.find((p) => p.label === 'Body text')
    const darkBody = d.contrastDark.value.find((p) => p.label === 'Body text')
    expect(lightBody?.ratio).toBeGreaterThan(7)
    expect(darkBody?.ratio).toBeGreaterThan(7)
    expect(lightBody?.passNormal).toBe(true)
    expect(typeof d.failingCount.value).toBe('number')
  })

  it('produces a structured JSON export of the current design', () => {
    d.palettes.primary.hue = 20
    d.radiusScale.value = 1.4
    const parsed = JSON.parse(d.jsonText.value)
    expect(parsed.palettes.primary.hue).toBe(20)
    expect(parsed.radius).toBe(1.4)
    expect(parsed.cssVars['--dz-colors-primary-500']).toContain('oklch(')
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

  it('serialises to an empty token at the shipped defaults', () => {
    expect(d.serialize()).toBe('')
    // A default palette matches its shipped config, so nothing is emitted.
    expect(d.palettes.primary.hue).toBe(PALETTE_CONFIGS.primary.hue)
  })

  it('ignores a malformed URL token without throwing', () => {
    expect(d.deserialize('not-valid-base64!!')).toBe(false)
    expect(d.hasOverrides.value).toBe(false)
  })
})
