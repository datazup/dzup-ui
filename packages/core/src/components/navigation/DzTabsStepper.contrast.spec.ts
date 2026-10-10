import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { generateColorCssVars } from '../../../../tokens/src/primitives/colors.ts'
import { DARK_SEMANTIC_TOKENS } from '../../../../tokens/src/semantic/dark.ts'
import { GUARANTEED_SYSTEM_PAIRS, HIGH_CONTRAST_SEMANTIC_TOKENS } from '../../../../tokens/src/semantic/high-contrast.ts'
import { LIGHT_SEMANTIC_TOKENS } from '../../../../tokens/src/semantic/light.ts'
import { contrastRatio } from '../../../../tooling/src/token-checks/oklch-contrast.ts'
import { stepperTokens } from './DzStepper.tokens.ts'
import DzStepper from './DzStepper.vue'
import DzStepperItem from './DzStepperItem.vue'
import DzTabList from './DzTabList.vue'
import DzTabs from './DzTabs.vue'
import DzTabTrigger from './DzTabTrigger.vue'

const lightTokens = { ...generateColorCssVars(), ...LIGHT_SEMANTIC_TOKENS }
const darkTokens = { ...generateColorCssVars(), ...DARK_SEMANTIC_TOKENS }
const hostSurfaces = [
  '--dz-background', '--dz-muted', '--dz-surface',
  '--dz-surface-raised', '--dz-surface-overlay', '--dz-surface-sunken',
] as const

function resolveColor(token: string, tokens: Record<string, string> = lightTokens): string {
  const value = tokens[token]
  if (!value)
    throw new Error(`Missing light token: ${token}`)
  const reference = value.match(/^var\((--dz-[^)]+)\)$/)
  return reference ? resolveColor(reference[1]!, tokens) : value
}

function textToken(classes: string[], activeTab = false): string {
  const prefix = activeTab ? 'data-[state=active]:' : ''
  const matches = classes
    .filter(value => value.startsWith(`${prefix}text-[var(`))
    .map(value => value.match(/var\((--dz-[^)]+)\)/)?.[1])
  expect(matches).toHaveLength(1)
  return matches[0]!
}

function expectReadable(foreground: string, background: string, tokens: Record<string, string> = lightTokens): void {
  // Repository helper crosschecked against the calibrated 20260909 OKLCH
  // harness in CORE-QA-2-P1. Resolve current source tokens, not stale dist CSS
  // or hex samples. jsdom cannot compute Tailwind's arbitrary-value styles.
  const ratio = contrastRatio(resolveColor(foreground, tokens), resolveColor(background, tokens))
  expect(ratio, `${foreground} on ${background}`).not.toBeNull()
  expect(ratio, `${foreground} on ${background}: ${ratio?.toFixed(4)}:1`)
    .toBeGreaterThanOrEqual(4.5)
}

describe('core-QA-2 active labels — WCAG AA light-theme contrast', () => {
  const surfaces = ['--dz-background', '--dz-muted'] as const

  // Line tabs inherit the host surface; enclosed tabs paint --dz-background.
  // Checking both surfaces also protects the primary text token against the
  // muted-host case recorded by the lane admission.
  for (const variant of ['line', 'enclosed'] as const) {
    it.each(surfaces)(`primary ${variant} active label clears 4.5:1 on %s`, (surface) => {
      const wrapper = mount(DzTabs, {
        props: { modelValue: 'account', variant, tone: 'primary' },
        slots: {
          default: () => h(DzTabList, {}, () => [
            h(DzTabTrigger, { value: 'account' }, () => 'Account'),
          ]),
        },
      })
      const trigger = wrapper.get('[role="tab"][data-state="active"]')
      const foreground = textToken(trigger.classes(), true)
      wrapper.unmount()
      expectReadable(foreground, surface)
    })
  }

  it.each(surfaces)('stepper active title clears 4.5:1 on %s', (surface) => {
    const wrapper = mount(DzStepper, {
      props: { modelValue: 0 },
      slots: { default: () => h(DzStepperItem, { title: 'Account' }) },
    })
    const title = wrapper.get('[data-state="active"] [data-part="title"]')
    const foreground = textToken(title.classes())
    wrapper.unmount()
    expectReadable(foreground, surface)
  })
})

function expectReadableAcrossThemes(foreground: string, surfaces: readonly string[]): void {
  for (const tokens of [lightTokens, darkTokens]) {
    for (const surface of surfaces)
      expectReadable(foreground, surface, tokens)
  }
  // System colours vary by OS palette: assert guaranteed roles rather than
  // pretending that a fixed black/white sample measures every user's theme.
  const highContrastForeground = resolveColor(foreground, HIGH_CONTRAST_SEMANTIC_TOKENS)
  for (const surface of surfaces) {
    const highContrastBackground = resolveColor(surface, HIGH_CONTRAST_SEMANTIC_TOKENS)
    expect(highContrastForeground).toBe(GUARANTEED_SYSTEM_PAIRS[highContrastBackground])
  }
}

describe('core-QA-2 active labels — every repaired tone and theme', () => {
  for (const variant of ['line', 'enclosed'] as const) {
    it.each(['primary', 'success', 'warning', 'danger', 'info'] as const)(`${variant} %s active text stays readable across themes`, (tone) => {
      const wrapper = mount(DzTabs, {
        props: { modelValue: 'account', variant, tone },
        slots: {
          default: () => h(DzTabList, {}, () => [
            h(DzTabTrigger, { value: 'account' }, () => 'Account'),
          ]),
        },
      })
      const trigger = wrapper.get('[role="tab"][data-state="active"]')
      const foreground = textToken(trigger.classes(), true)
      const surfaces = variant === 'enclosed' ? ['--dz-background'] : hostSurfaces
      if (variant === 'enclosed')
        expect(trigger.classes()).toContain('data-[state=active]:bg-[var(--dz-background)]')
      wrapper.unmount()
      expectReadableAcrossThemes(foreground, surfaces)
    })
  }

  it.each(['title', 'indicator'] as const)('stepper active %s stays readable across themes', (part) => {
    const wrapper = mount(DzStepper, {
      props: { modelValue: 0 },
      slots: { default: () => h(DzStepperItem, { title: 'Account' }) },
    })
    const element = wrapper.get(`[data-state="active"] [data-part="${part}"]`)
    const foreground = textToken(element.classes())
    wrapper.unmount()
    expectReadableAcrossThemes(foreground, hostSurfaces)
    const mapping = part === 'title' ? stepperTokens.status.active.titleColor : stepperTokens.status.active.indicatorColor
    expect(mapping).toBe(`var(${foreground})`)
  })
})
