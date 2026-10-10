import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { generateColorCssVars } from '../../../../tokens/src/primitives/colors.ts'
import { LIGHT_SEMANTIC_TOKENS } from '../../../../tokens/src/semantic/light.ts'
import { contrastRatio } from '../../../../tooling/src/token-checks/oklch-contrast.ts'
import DzStepper from './DzStepper.vue'
import DzStepperItem from './DzStepperItem.vue'
import DzTabList from './DzTabList.vue'
import DzTabs from './DzTabs.vue'
import DzTabTrigger from './DzTabTrigger.vue'

const lightTokens = { ...generateColorCssVars(), ...LIGHT_SEMANTIC_TOKENS }

function resolveColor(token: string): string {
  const value = lightTokens[token]
  if (!value)
    throw new Error(`Missing light token: ${token}`)
  const reference = value.match(/^var\((--dz-[^)]+)\)$/)
  return reference ? resolveColor(reference[1]!) : value
}

function textToken(classes: string[], activeTab = false): string {
  const prefix = activeTab ? 'data-[state=active]:' : ''
  const matches = classes
    .filter(value => value.startsWith(`${prefix}text-[var(`))
    .map(value => value.match(/var\((--dz-[^)]+)\)/)?.[1])
  expect(matches).toHaveLength(1)
  return matches[0]!
}

function expectReadable(foreground: string, background: string): void {
  // Repository helper crosschecked against the calibrated 20260909 OKLCH
  // harness in CORE-QA-2-P1. Resolve current source tokens, not stale dist CSS
  // or hex samples. jsdom cannot compute Tailwind's arbitrary-value styles.
  const ratio = contrastRatio(resolveColor(foreground), resolveColor(background))
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
