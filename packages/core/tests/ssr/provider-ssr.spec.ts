import { renderToString } from '@vue/server-renderer'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import {
  useDzDirection,
  useDzFormats,
  useDzLocale,
  useDzMessages,
  useDzMotion,
  useDzNonce,
  useDzPortalTarget,
  useDzTestIds,
} from '../../src/composables/provider/index.ts'
import { provideDzLocale } from '../../src/composables/provider/useDzLocale.ts'
import { provideDzMessages } from '../../src/composables/provider/useDzMessages.ts'

/**
 * Provider composables under SSR (TASK-OSS-P4-01, ADR-20).
 *
 * The property being proved: **nothing here touches a browser API without a
 * guard.** `useDzMotion` is the only one that wants `matchMedia`, and a server
 * has none.
 *
 * jsdom provides `window` even in a Vitest run, so simply rendering to string
 * would not prove anything — a composable reading `window.matchMedia` would
 * pass. These tests delete the globals for the duration of the render, which is
 * what a Node server actually looks like.
 */

/** Render with `window` and `document` genuinely absent. */
async function ssrRenderWithoutBrowser(component: ReturnType<typeof defineComponent>): Promise<string> {
  const globals = globalThis as Record<string, unknown>
  const savedWindow = globals.window
  const savedDocument = globals.document
  const savedMatchMedia = globals.matchMedia

  delete globals.window
  delete globals.document
  delete globals.matchMedia

  try {
    return await renderToString(createSSRApp({ render: () => h(component) }))
  }
  finally {
    globals.window = savedWindow
    globals.document = savedDocument
    globals.matchMedia = savedMatchMedia
  }
}

describe('provider composables render on a server', () => {
  it('resolves every concern with no window, no document, no matchMedia', async () => {
    const Probe = defineComponent({
      setup() {
        const locale = useDzLocale()
        const direction = useDzDirection()
        const motion = useDzMotion()
        const portal = useDzPortalTarget()
        const nonce = useDzNonce()
        const { read } = useDzMessages()
        const { testId } = useDzTestIds()

        return () => h('div', [
          `locale=${locale.value}`,
          `direction=${direction.value}`,
          `reduced=${String(motion.reduced.value)}`,
          `portal=${String(portal.value)}`,
          `nonce=${String(nonce.value)}`,
          `message=${read('select.noResults', 'No results found')}`,
          `testId=${String(testId('submit'))}`,
        ])
      },
    })

    const html = await ssrRenderWithoutBrowser(Probe)

    expect(html).toContain('locale=en-US')
    expect(html).toContain('direction=ltr')
    // False, not true: the server answers what the CSS media query resolves to
    // before the client knows better. Answering `true` would render markup that
    // never animates and hydrate into markup that does.
    expect(html).toContain('reduced=false')
    expect(html).toContain('portal=undefined')
    expect(html).toContain('nonce=undefined')
    expect(html).toContain('message=No results found')
    expect(html).toContain('testId=undefined')
  })

  it('formats numbers and dates on the server', async () => {
    // `Intl` is a language built-in, not a browser API — the formatter cache is
    // usable during SSR, which is the point of putting it behind a composable
    // rather than an onMounted hook.
    const Probe = defineComponent({
      setup() {
        const formats = useDzFormats()
        return () => h('div', formats.number({ style: 'percent' }).format(0.42))
      },
    })

    expect(await ssrRenderWithoutBrowser(Probe)).toContain('42%')
  })

  it('honours a provider during server render', async () => {
    const Child = defineComponent({
      setup() {
        const { read } = useDzMessages()
        const direction = useDzDirection()
        return () => h('div', `${direction.value}|${read('select.noResults', 'fallback')}`)
      },
    })
    const Shell = defineComponent({
      setup() {
        provideDzLocale(ref('ar-EG'))
        provideDzMessages(ref({ select: { noResults: 'لا نتائج' } }))
        return () => h(Child)
      },
    })

    const html = await ssrRenderWithoutBrowser(Shell)

    // Direction resolved from the locale on the server, so the markup the
    // client hydrates already carries the right one.
    expect(html).toContain('rtl')
    expect(html).toContain('لا نتائج')
  })

  it('produces the same locale and direction the client will compute', async () => {
    // A hydration mismatch here would be a visible layout flip, so the server
    // and client answers have to agree for a given locale.
    const Probe = defineComponent({
      setup() {
        const direction = useDzDirection()
        return () => h('div', direction.value)
      },
    })
    const Shell = defineComponent({
      setup() {
        provideDzLocale(ref('he-IL'))
        return () => h(Probe)
      },
    })

    expect(await ssrRenderWithoutBrowser(Shell)).toContain('rtl')
  })
})
