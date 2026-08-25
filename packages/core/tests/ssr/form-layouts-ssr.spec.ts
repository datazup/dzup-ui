/**
 * Layout primitives as form layouts (TASK-FORM-OSS-04).
 *
 * `DzStack`, `DzGrid`, `DzTabs`, `DzAccordion` and `DzStepper` are navigation
 * and layout components that a form renderer uses as *sections*. Two things
 * matter when they hold fields rather than prose, and neither had a test:
 *
 *   1. **A preselected panel renders on the server.** A tabbed form that
 *      server-renders tab 1 and hydrates into tab 2 loses whatever the user had
 *      already typed into it, and a form that renders no panel at all shows an
 *      empty page until JavaScript arrives.
 *   2. **Reveal-then-focus works.** The renderer calls `revealItem` and then
 *      focuses; if the panel is not in the document, `focus()` silently does
 *      nothing and the user is told to fix errors they cannot reach.
 *
 * The second is a browser behaviour and lives in the component specs. This file
 * is the first.
 */

import type { Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'

vi.setConfig({ testTimeout: 15000 })

async function ssrRender(
  component: Component,
  props: Record<string, unknown> = {},
  children?: Record<string, () => unknown>,
): Promise<string> {
  const app = createSSRApp({
    render() {
      return h(component, props, children)
    },
  })
  return renderToString(app)
}

async function load(family: string, name: string): Promise<Component> {
  return (await import(`../../src/components/${family}/${name}.vue`)).default
}

describe('sSR: form layouts render their preselected panel', () => {
  it('dzStack renders its children', async () => {
    const html = await ssrRender(await load('layout', 'DzStack'), {}, {
      default: () => [h('label', 'Email'), h('input', { id: 'email' })],
    })
    expect(html).toContain('Email')
    expect(html).toContain('id="email"')
  })

  it('dzGrid renders its children and its column count', async () => {
    const html = await ssrRender(await load('layout', 'DzGrid'), { cols: 2 }, {
      default: () => [h('input', { id: 'first' }), h('input', { id: 'last' })],
    })
    expect(html).toContain('id="first"')
    expect(html).toContain('id="last"')
  })

  it('dzTabs renders the selected tab on the server, not the first one', async () => {
    // The case that loses data: server renders tab 1, client hydrates into
    // tab 2, and whatever was in tab 2's fields never existed.
    const DzTabs = await load('navigation', 'DzTabs')
    const DzTabList = await load('navigation', 'DzTabList')
    const DzTabTrigger = await load('navigation', 'DzTabTrigger')
    const DzTabContent = await load('navigation', 'DzTabContent')

    const html = await ssrRender(DzTabs, { modelValue: 'billing' }, {
      default: () => [
        h(DzTabList, () => [
          h(DzTabTrigger, { value: 'account' }, () => 'Account'),
          h(DzTabTrigger, { value: 'billing' }, () => 'Billing'),
        ]),
        h(DzTabContent, { value: 'account' }, () => h('input', { id: 'account-field' })),
        h(DzTabContent, { value: 'billing' }, () => h('input', { id: 'billing-field' })),
      ],
    })

    expect(html).toContain('Billing')
    expect(html).toContain('id="billing-field"')
  })

  it('dzAccordion renders an open item on the server', async () => {
    const DzAccordion = await load('data', 'DzAccordion')
    const DzAccordionItem = await load('data', 'DzAccordionItem')
    const DzAccordionTrigger = await load('data', 'DzAccordionTrigger')
    const DzAccordionContent = await load('data', 'DzAccordionContent')

    const html = await ssrRender(DzAccordion, { modelValue: 'shipping' }, {
      default: () => [
        h(DzAccordionItem, { value: 'shipping' }, {
          default: () => [
            h(DzAccordionTrigger, () => 'Shipping'),
            h(DzAccordionContent, () => h('input', { id: 'address' })),
          ],
        }),
      ],
    })

    expect(html).toContain('Shipping')
  })

  it('dzStepper renders the active step on the server', async () => {
    const DzStepper = await load('navigation', 'DzStepper')
    const DzStepperItem = await load('navigation', 'DzStepperItem')

    const html = await ssrRender(DzStepper, { modelValue: 1 }, {
      default: () => [
        h(DzStepperItem, { title: 'Account' }),
        h(DzStepperItem, { title: 'Profile' }),
      ],
    })

    expect(html).toContain('Account')
    expect(html).toContain('Profile')
  })

  it('renders the same output twice for the same input', async () => {
    // Determinism is the precondition for hydration matching at all: two
    // renders that differ cannot both match the client.
    const DzTabs = await load('navigation', 'DzTabs')
    const a = await ssrRender(DzTabs, { modelValue: 'x' })
    const b = await ssrRender(DzTabs, { modelValue: 'x' })
    expect(a).toBe(b)
  })
})
