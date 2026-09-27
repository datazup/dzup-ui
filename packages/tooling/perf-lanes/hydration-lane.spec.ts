/**
 * The hydration lane (TASK-R2-O7, doc 06 §Performance).
 *
 * Server render, then client hydrate, of a representative page — **Core-only**
 * and **Core+Pro** — because the comparison is what the Pro program measures
 * against and what a consumer weighing the Pro tier actually wants to know:
 * what does adding Pro cost at startup?
 *
 * **Why this measures `renderToString` + `hydrate` and not a Nuxt build.**
 * The `<discovery>` step points at `packages/nuxt/test/fixtures/` and those
 * fixtures are real: `ssr-hydration` builds a Nuxt app and asserts the server
 * markup. They are also, deliberately, ~800 npm packages and a full production
 * build *per fixture*, staged outside the repository, behind three commands and
 * a network. The task's stop condition caps a lane at 30 minutes; the fixture
 * install alone exceeds it, and the numbers it would produce would be a Nitro
 * build's numbers, not the library's.
 *
 * So the lane measures the two operations the library is actually responsible
 * for, in-process, against the same jsdom the rest of the harness uses:
 *
 *   - `ssr` — `renderToString` of the page on the server;
 *   - `hydrate` — `createSSRApp(...).mount(el)` over that exact markup, which is
 *     the operation whose cost a consumer feels as "the page is visible but
 *     nothing responds yet";
 *   - `tti` — their sum, the time-to-interactive proxy the task names.
 *
 * What that does **not** measure is stated so nobody quotes it as more: no
 * network, no bundle parse, no paint, no Nitro. It is a library-side floor. The
 * end-to-end number belongs to a browser lane over the Nuxt fixture, and is
 * recorded as owed rather than approximated here.
 *
 * **Core+Pro.** `TASK-R3-O1` (consume the Pro ownership manifest) is open and
 * this repository must not build or check out the Pro tree, so the Pro half is
 * driven exactly the way `packages/nuxt/scripts/pack-fixtures.mjs` drives it:
 * `DZUP_PRO_TARBALL`, or a resolvable `@dzup-ui-pro/pro`. Without one the case
 * is **`unrun`** — not `skipped`, and not silently absent — which is the same
 * distinction the Nuxt fixture spec already makes for the same reason.
 *
 * **The seeded failure** is a page whose setup blocks for 120 ms: a hydration
 * lane that has stopped timing reports ~0 for everything.
 */

import type { Component } from 'vue'
import process from 'node:process'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { judge, note, record, reportHarness } from '../src/perf/lane-report.ts'
import { withOwnedContainer } from '../src/perf/tier-fixtures.ts'

/** Server+client round trips per measurement. */
const ITERATIONS = Number(process.env.DZUP_PERF_HYDRATION_ITERATIONS ?? 7)

reportHarness()

/**
 * The page under measurement.
 *
 * Eight components across five families under the provider, which is what a
 * real first paint carries — a single button would measure module resolution
 * and nothing else, and the provider is where the locale, direction, formats
 * and portal contracts are established on both sides of the boundary.
 */
async function corePage(): Promise<Component> {
  const [{ DzButton }, { DzInput }, { DzCard, DzCardBody }, { DzAlert }, { DzTabs, DzTabList, DzTabTrigger, DzTabContent }]
    = await Promise.all([
      import('@dzup-ui/core/buttons'),
      import('@dzup-ui/core/inputs'),
      import('@dzup-ui/core/cards'),
      import('@dzup-ui/core/feedback'),
      import('@dzup-ui/core/navigation'),
    ])
  const { DzProvider } = await import('@dzup-ui/core/providers')

  return defineComponent({
    name: 'HydrationCorePage',
    setup() {
      return () => h(DzProvider as Component, { locale: 'en-US' }, {
        default: () => [
          h(DzAlert as Component, { title: 'Notice' }, { default: () => 'Server rendered.' }),
          h(DzCard as Component, null, {
            default: () => h(DzCardBody as Component, null, {
              default: () => [
                h(DzInput as Component, { modelValue: 'value', label: 'Name' }),
                h(DzButton as Component, null, { default: () => 'Save' }),
              ],
            }),
          }),
          h(DzTabs as Component, { modelValue: 'tab-0' }, {
            default: () => [
              h(DzTabList as Component, null, {
                default: () => Array.from({ length: 4 }, (_, i) =>
                  h(DzTabTrigger as Component, { value: `tab-${i}`, key: `tab-${i}` }, {
                    default: () => `Tab ${i + 1}`,
                  })),
              }),
              ...Array.from({ length: 4 }, (_, i) =>
                h(DzTabContent as Component, { value: `tab-${i}`, key: `panel-${i}` }, {
                  default: () => `Panel ${i + 1}`,
                })),
            ],
          }),
        ],
      })
    },
  })
}

interface RoundTrip {
  ssrMs: number
  hydrateMs: number
}

async function roundTrip(page: Component): Promise<RoundTrip> {
  const ssrStart = performance.now()
  const html = await renderToString(createSSRApp(page))
  const ssrMs = performance.now() - ssrStart

  const hydrateMs = await withOwnedContainer(async (container) => {
    container.innerHTML = html
    const start = performance.now()
    const app = createSSRApp(page)
    app.mount(container)
    const elapsed = performance.now() - start
    app.unmount()
    return elapsed
  })

  return { ssrMs, hydrateMs }
}

/** Whether a Pro build is available to this process, and how it was found. */
async function proPage(): Promise<{ page: Component, via: string } | { reason: string }> {
  const tarball = process.env.DZUP_PRO_TARBALL ?? ''
  // The specifier is held in a variable, not written inline. Vite resolves a
  // *literal* dynamic import at transform time and fails the whole file when
  // the package is absent — which it always is here, since Core must never
  // depend on Pro. `@vite-ignore` only applies to a non-literal expression, so
  // the variable is what makes "absent" a runtime answer instead of a build
  // error. This is the import boundary working, not a workaround for it.
  const specifier = '@dzup-ui-pro/pro'
  try {
    const pro = await import(/* @vite-ignore */ specifier) as Record<string, unknown>
    const core = await corePage()
    const names = Object.keys(pro).filter(name => name.startsWith('Dz')).slice(0, 4)
    if (names.length === 0)
      return { reason: '`@dzup-ui-pro/pro` resolved but exports no Dz component' }

    return {
      via: tarball === '' ? 'resolved from node_modules' : `DZUP_PRO_TARBALL=${tarball}`,
      page: defineComponent({
        name: 'HydrationCoreProPage',
        setup: () => () => h('div', [
          h(core),
          ...names.map(name => h(pro[name] as Component)),
        ]),
      }),
    }
  }
  catch {
    return {
      reason: tarball === ''
        ? 'DZUP_PRO_TARBALL is not set and `@dzup-ui-pro/pro` does not resolve'
        : `DZUP_PRO_TARBALL=${tarball} is set but \`@dzup-ui-pro/pro\` does not resolve`,
    }
  }
}

describe('hydration timer (seeded failure)', () => {
  it('catches a page whose setup blocks past the budget', async () => {
    const Blocking = defineComponent({
      name: 'SeededSlowHydration',
      setup() {
        const until = performance.now() + 120
        while (performance.now() < until) { /* block */ }
        return () => h('div', 'slow')
      },
    })

    const { ssrMs, hydrateMs } = await roundTrip(Blocking)
    expect(ssrMs + hydrateMs, `ssr ${ssrMs.toFixed(1)}ms + hydrate ${hydrateMs.toFixed(1)}ms`)
      .toBeGreaterThan(200)
  })
})

describe('startup / hydration comparison', () => {
  it('core-only: server render + client hydrate', async () => {
    const page = await corePage()
    const ssr: number[] = []
    const hydrate: number[] = []
    const tti: number[] = []

    for (let i = 0; i < ITERATIONS; i++) {
      const trip = await roundTrip(page)
      ssr.push(trip.ssrMs)
      hydrate.push(trip.hydrateMs)
      tti.push(trip.ssrMs + trip.hydrateMs)
    }

    const verdicts = [
      judge('hydration:core-only:ssr', record('hydration:core-only:ssr', ssr), 'ms'),
      judge('hydration:core-only:hydrate', record('hydration:core-only:hydrate', hydrate), 'ms'),
      judge('hydration:core-only:tti', record('hydration:core-only:tti', tti), 'ms'),
    ]
    const failed = verdicts.filter(v => v.fail).map(v => v.message)
    expect(failed.join('\n'), failed.join('\n')).toBe('')
  })

  it('core+pro: server render + client hydrate, or an unrun record', async () => {
    const resolved = await proPage()
    if ('reason' in resolved) {
      // `unrun`, stated, not skipped. TASK-R3-O1 is the dependency; this repo
      // is not permitted to build the Pro tree, and a fabricated comparison
      // would be worse than an empty cell.
      note(`· hydration core+pro: unrun — ${resolved.reason}. `
        + 'Produce a Pro tarball from a Pro checkout and set DZUP_PRO_TARBALL '
        + '(same contract as `yarn test:nuxt-fixtures:pack`), then re-run this lane.')
      expect(process.env.DZUP_PRO_TARBALL ?? '').toBe('')
      return
    }

    note(`· hydration core+pro: ${resolved.via}`)
    const ssr: number[] = []
    const hydrate: number[] = []
    const tti: number[] = []
    for (let i = 0; i < ITERATIONS; i++) {
      const trip = await roundTrip(resolved.page)
      ssr.push(trip.ssrMs)
      hydrate.push(trip.hydrateMs)
      tti.push(trip.ssrMs + trip.hydrateMs)
    }

    const verdicts = [
      judge('hydration:core-pro:ssr', record('hydration:core-pro:ssr', ssr), 'ms'),
      judge('hydration:core-pro:hydrate', record('hydration:core-pro:hydrate', hydrate), 'ms'),
      judge('hydration:core-pro:tti', record('hydration:core-pro:tti', tti), 'ms'),
    ]
    const failed = verdicts.filter(v => v.fail).map(v => v.message)
    expect(failed.join('\n'), failed.join('\n')).toBe('')
  })
})
