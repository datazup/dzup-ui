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
import { createSSRApp, h, nextTick } from 'vue'

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

  it('dzGridItem renders its span on the server, identical to the client class (D67)', async () => {
    // SSR neutrality: the span is a pure computed class — no DOM read, no id —
    // so the server markup already carries it and hydration has nothing to fix.
    const DzGrid = await load('layout', 'DzGrid')
    const DzGridItem = await load('layout', 'DzGridItem')
    const html = await ssrRender(DzGrid, { cols: { sm: 1, md: 12 } }, {
      default: () => [
        h(DzGridItem, { span: { base: 'full', md: 6 } }, () => h('input', { id: 'city' })),
        h(DzGridItem, { span: 'full' }, () => h('input', { id: 'street' })),
      ],
    })
    expect(html).toContain('id="city"')
    expect(html).toMatch(/class="col-span-full md:col-span-6"/)
    expect(html).toContain('id="street"')
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
    // RESIDUAL-11 `D-RES10-1`. "Renders the active step" was the title and the
    // titles were the whole assertion — which two blank steps would also have
    // satisfied. `DzStepperItem` claimed its index in `onMounted`, so on the
    // server every step was `completed` and none was current: this component's
    // progress state did not survive SSR at all. The index is claimed in `setup`
    // now, so the second step is the current one *in the server HTML*.
    expect(html).toMatch(/data-state="completed"[\s\S]*data-state="active"/)
    expect((html.match(/aria-current="step"/g) ?? []).length).toBe(1)
  })

  /**
   * RESIDUAL-11 `D-RES10-1`, the half an SSR string cannot show.
   *
   * The old defect produced **no** Vue hydration warning, and that is why it
   * survived: the client's *first* render agreed with the server (both had
   * `stepIndex === -1`), so hydration matched, and the correction arrived
   * afterwards in `onMounted` as an ordinary reactive patch. Measured on the
   * defective tree: 2,706 bytes of server HTML became 2,317 bytes of DOM, three
   * `completed` states became `completed`/`active`/`upcoming`, three check marks
   * became one, and `aria-current` appeared from nowhere — silently, with zero
   * console output.
   *
   * So the assertion that holds the fix is not "no warning" (there never was
   * one). It is that hydrating the server HTML changes **nothing**.
   */
  it('dzStepper hydrates its server HTML without rewriting a single byte', async () => {
    const DzStepper = await load('navigation', 'DzStepper')
    const DzStepperItem = await load('navigation', 'DzStepperItem')
    const root = (): Component => ({
      render() {
        return h(DzStepper, { modelValue: 1 }, {
          default: () => [
            h(DzStepperItem, { title: 'Account' }),
            h(DzStepperItem, { title: 'Profile' }),
            h(DzStepperItem, { title: 'Review' }),
          ],
        })
      },
    })

    const html = await renderToString(createSSRApp(root()))
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)

    const app = createSSRApp(root())
    app.mount(container)
    await nextTick()

    expect(container.innerHTML).toBe(html)

    app.unmount()
    container.remove()
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
