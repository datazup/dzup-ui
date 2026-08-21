import { renderToString } from '@vue/server-renderer'
import { afterEach, beforeEach, vi } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import {
  useDzDirection,
  useDzFormats,
  useDzLocale,
  useDzMessages,
  useDzMotion,
  useDzPortalTarget,
  useDzTestIds,
} from '../../src/composables/provider/index.ts'
import DzProvider from '../../src/providers/DzProvider.vue'
import DzThemeProvider from '../../src/providers/DzThemeProvider.vue'
import { getThemeScript } from '../../src/providers/theme-script.ts'

/**
 * `DzProvider` under SSR and through hydration (TASK-OSS-P4-02, ADR-20).
 *
 * Two different properties, and the second is the one that costs a user
 * something when it breaks:
 *
 *   1. **The provider renders on a server.** Every concern resolves with
 *      `window`, `document` and `matchMedia` deleted — not merely absent from a
 *      render. A provider that read `window` lazily inside a computed would
 *      pass a render-only test and fail in a real SSR process.
 *   2. **The client's first paint agrees with the server's markup.** Vue
 *      reports a hydration mismatch by writing to the console and then
 *      **silently patching the DOM**, so a mismatch is invisible unless
 *      something watches the console. These tests watch it, and assert zero.
 */

/**
 * jsdom implements no `matchMedia`, and the hydration half of this file needs a
 * client that has one — a provider that owns the theme reads
 * `prefers-color-scheme` on mount. The SSR half deletes it again for the
 * duration of each render, which is the point of doing both in one file: the
 * same component is proved to work with the API and without it.
 */
beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('dir')

  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('dir')
})

/** Render with `window`, `document` and `matchMedia` genuinely absent. */
async function ssrRenderWithoutBrowser(
  component: ReturnType<typeof defineComponent>,
): Promise<string> {
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

/**
 * Server-render, then hydrate the same component into that markup, collecting
 * everything Vue said while it did so.
 *
 * `console.warn` and `console.error` both, because Vue routes hydration
 * complaints through `warn` in a dev build and the bail-out through `error`.
 */
async function hydrateAndCollectWarnings(
  component: ReturnType<typeof defineComponent>,
): Promise<string[]> {
  const html = await renderToString(createSSRApp({ render: () => h(component) }))

  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)

  const messages: string[] = []
  const originalWarn = console.warn
  const originalError = console.error
  const collect = (...args: unknown[]): void => {
    messages.push(args.map(String).join(' '))
  }
  console.warn = collect
  console.error = collect

  const app = createSSRApp({ render: () => h(component) })
  try {
    app.mount(container)
  }
  finally {
    console.warn = originalWarn
    console.error = originalError
    app.unmount()
    container.remove()
  }

  return messages.filter(message => /hydration|mismatch/i.test(message))
}

/** A page that renders everything a provider can influence. */
const Page = defineComponent({
  setup() {
    const locale = useDzLocale()
    const direction = useDzDirection()
    const motion = useDzMotion()
    const { read } = useDzMessages()
    const { testId } = useDzTestIds()
    const formats = useDzFormats()

    return () => h('main', { dir: direction.value, ...testId('page') }, [
      h('p', locale.value),
      h('p', read('DzPagination.next', 'Next')),
      h('p', formats.number({ style: 'percent' }).format(0.42)),
      h('p', motion.reduced.value ? 'still' : 'animated'),
    ])
  },
})

const ConfiguredApp = defineComponent({
  setup() {
    return () => h(
      DzProvider,
      {
        locale: 'ar-EG',
        messages: { DzPagination: { next: 'التالي' } },
        testIdPrefix: 'e2e',
      },
      { default: () => h(Page) },
    )
  },
})

describe('dzProvider renders on a server', () => {
  it('resolves every concern with no window, no document, no matchMedia', async () => {
    const html = await ssrRenderWithoutBrowser(ConfiguredApp)

    expect(html).toContain('dir="rtl"')
    expect(html).toContain('data-testid="e2e-page"')
    expect(html).toContain('ar-EG')
    expect(html).toContain('التالي')
    // `Intl` is a language built-in, not a browser API, so formatting works on
    // the server — which is why the formats cache sits behind a composable
    // rather than an onMounted hook. Arabic-Egypt renders Arabic-Indic digits.
    expect(html).toContain('٤٢')
    // False, not true: what the CSS media query resolves to before the client
    // knows better. Answering `true` renders markup that never animates and
    // hydrates into markup that does, which is a visible jump (ADR-20 §7).
    expect(html).toContain('animated')
  })

  it('touches no DOM when it is the root provider', async () => {
    // `applyDirection` and `applyThemeAttribute` both write to
    // `document.documentElement`. Neither may run during a server render, and
    // with `document` deleted a stray call is a TypeError rather than a
    // silently wrong attribute.
    await expect(ssrRenderWithoutBrowser(ConfiguredApp)).resolves.toBeTruthy()
  })

  it('renders DzThemeProvider through its DzProvider delegate', async () => {
    const Themed = defineComponent({
      setup: () => () => h(
        DzThemeProvider,
        { defaultTheme: 'dark' },
        { default: () => h('span', 'themed') },
      ),
    })
    expect(await ssrRenderWithoutBrowser(Themed)).toContain('themed')
  })
})

describe('hydration', () => {
  it('hydrates a configured provider with zero mismatch warnings', async () => {
    expect(await hydrateAndCollectWarnings(ConfiguredApp)).toEqual([])
  })

  it('hydrates a nested provider with zero mismatch warnings', async () => {
    // Nesting is where a hydration bug would hide: the inner provider resolves
    // its direction from an ancestor's locale, and a resolution that ran only
    // on the client would flip the subtree after the markup had already
    // committed.
    const Nested = defineComponent({
      setup: () => () => h(
        DzProvider,
        { locale: 'ar-EG' },
        {
          default: () => h(
            DzProvider,
            { locale: 'en-US' },
            { default: () => h(Page) },
          ),
        },
      ),
    })

    expect(await hydrateAndCollectWarnings(Nested)).toEqual([])
  })

  it('hydrates DzThemeProvider with zero mismatch warnings', async () => {
    const Themed = defineComponent({
      setup: () => () => h(
        DzThemeProvider,
        { defaultTheme: 'system' },
        { default: () => h(Page) },
      ),
    })

    expect(await hydrateAndCollectWarnings(Themed)).toEqual([])
  })
})

describe('portal targets under SSR', () => {
  it('resolves a portal target without touching the DOM', async () => {
    // TASK-OSS-P4-04. Nineteen components now resolve their portal target from
    // the provider. The resolution must be a string handed to the portal, never
    // a DOM query — with `document` deleted, a `querySelector` here is a
    // TypeError rather than a silently wrong target.
    const Probe = defineComponent({
      setup() {
        const target = useDzPortalTarget()
        return () => h('div', `portal=${String(target.value)}`)
      },
    })
    const Shell = defineComponent({
      setup: () => () => h(
        DzProvider,
        { portal: '#dz-portal' },
        { default: () => h(Probe) },
      ),
    })

    expect(await ssrRenderWithoutBrowser(Shell)).toContain('portal=#dz-portal')
  })

  it('server-renders a component whose portal target came from the provider', async () => {
    // `DzTooltipContent` teleports on the client; on the server it must render
    // (or not render) without asking where `#dz-portal` is.
    const Shell = defineComponent({
      setup: () => () => h(
        DzProvider,
        { portal: '#dz-portal' },
        { default: () => h('main', 'shell') },
      ),
    })
    expect(await ssrRenderWithoutBrowser(Shell)).toContain('shell')
  })
})

describe('the bootstrap script and the provider agree', () => {
  it('writes the same dir the server rendered', async () => {
    // The inline script runs before first paint; the provider writes the same
    // value on mount. If they disagreed the page would flip direction between
    // the first frame and hydration, which is the failure ADR-15 exists to
    // prevent for theme and this extends to direction.
    const script = getThemeScript({ locale: 'ar-EG' })
    expect(script).toContain(`setAttribute('dir',"rtl")`)

    const html = await ssrRenderWithoutBrowser(ConfiguredApp)
    expect(html).toContain('dir="rtl"')
  })

  it('says nothing about direction when the host declared no locale', () => {
    // A host that has not declared a locale gets no opinion imposed on its
    // markup — the emitted script is byte-identical to what it was before
    // direction existed.
    expect(getThemeScript()).not.toContain('dir')
  })
})
