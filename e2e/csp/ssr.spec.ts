import type { Component } from 'vue'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DzButton from '../../packages/core/src/components/buttons/DzButton.vue'
import DzAlert from '../../packages/core/src/components/feedback/DzAlert.vue'
import DzCheckbox from '../../packages/core/src/components/forms/DzCheckbox.vue'
import DzColorPicker from '../../packages/core/src/components/forms/DzColorPicker.vue'
import DzInput from '../../packages/core/src/components/inputs/DzInput.vue'
import { buildInventory } from '../../packages/tooling/src/security/inline-style-inventory.ts'

/**
 * SSR bytes are parsed before hydration: style-src-attr 'none' blocks an
 * attribute even when Vue's later client CSSOM writes would succeed.
 * Browser policy enforcement and packed consumption are separate gate steps.
 */
describe('static styles under strict CSP in SSR', () => {
  const cases: [string, Component, Record<string, unknown>][] = [
    ['button', DzButton, {}],
    ['loading button', DzButton, { loading: true }],
    ['alert', DzAlert, {}],
    ['input', DzInput, {}],
    ['checkbox', DzCheckbox, {}],
    ['color picker', DzColorPicker, {}],
  ]

  it.each(cases)('%s emits neither inline style attributes nor style tags', async (_name, component, props) => {
    const html = await renderToString(createSSRApp({
      render: () => h(component, props, { default: () => 'CSP evidence' }),
    }))
    expect(html).not.toMatch(/\sstyle\s*=/i)
    expect(html).not.toMatch(/<style\b/i)
    expect(html).toContain('[contain:layout_style]')
  })

  it('leaves no inventoried static style site in published templates', () => {
    expect(buildInventory().sites.filter(site => site.kind === 'static')).toEqual([])
  })
})
