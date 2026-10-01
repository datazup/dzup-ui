/**
 * Does teleported content survive SSR **and hydration**? (RESIDUAL-17,
 * `D-RES16-2` option (d).)
 *
 * ## The gap this file closes
 *
 * The capability matrix publishes a `portal-hydration` row for 24 components and
 * documents it as *"Teleported content survives SSR and hydration."* RESIDUAL-16
 * censused the 19 citations it had and found the cell was reusing `ssr-sample`'s
 * predicate over the same directory: **16 of 19 named a spec that never reaches a
 * teleport, and 0 of 19 hydrated anything.** `ssr-smoke.spec.ts` contains no
 * hydration at all, and `form-controls-ssr.spec.ts` says so in its own header
 * (*"What this does not do is drive a hydration mismatch."*).
 *
 * So the kind's second half had no harness anywhere. This is that harness, in the
 * shape RESIDUAL-11 already proved on `DzStepper` (`form-layouts-ssr.spec.ts:157`):
 * render on the server, hydrate the string, and assert the hydration changed
 * **nothing**. That assertion — not "no warning" — is the one with teeth, because
 * the `DzStepper` defect produced no Vue warning at all: the client's *first*
 * render agreed with the server and the correction arrived afterwards as an
 * ordinary reactive patch, silently rewriting 2,706 bytes into 2,317.
 *
 * ## Four clauses per component, and why each is needed
 *
 * 1. **The portal branch was taken on the SERVER** — `<!--teleport start-->` /
 *    `<!--teleport end-->` is what `renderToString` emits in place of a
 *    `<Teleport>`, so the pair in the server string is the only admissible proof.
 *    A prop value in the call is **not**: see the `DzCommandPalette` case at the
 *    bottom, which renders `open: true` and produces no teleport whatsoever.
 * 2. **The teleported content the server produced**, read from `renderToString`'s
 *    SSR context (`ctx.teleports`), asserted structurally. This is where the
 *    panel markup actually goes, and until this file nothing in the repository
 *    had ever looked at it. Without this clause, clauses 1 and 3 are satisfied by
 *    a component that emits an empty anchor pair and has stopped rendering.
 * 3. **Hydration rewrote zero bytes** of the component's own output.
 * 4. **Every warning hydration produced is a hydration notice** — never a
 *    component warning and never an error — captured rather than printed, so this
 *    file cannot pass while spraying diagnostics into a green suite.
 *
 * ## What this harness does NOT prove, and the control that establishes the limit
 *
 * It does not prove that hydration **claims** the server-rendered content sitting
 * in the teleport *target* rather than re-creating it. That was attempted and
 * abandoned on evidence: injecting `ctx.teleports` into `document.body` and then
 * hydrating produces one `Hydration node mismatch` for the most minimal control
 * imaginable —
 *
 * ```
 * h(Teleport, { to: 'body' }, [h('div', { id: 'p' }, 'panel')])
 * ```
 *
 * — whose server teleport payload is `<!--teleport start anchor--><div
 * id="p">panel</div><!--teleport anchor-->`. The control fails identically to
 * `DzTour` and `DzPopconfirm`, which is proof the mismatch belongs to *hand-placing
 * a teleport target in jsdom*, not to the components. Four control shapes were
 * measured (plain div, author-comment-first, `Transition`-wrapped, `v-if`-guarded)
 * and all four behave the same. Asserting a failure there would have been a defect
 * claim against two components on the strength of a broken fixture. The target half
 * therefore needs a real SSR document in a real engine, and that is raised as
 * `D-RES17-1` rather than left to be discovered.
 *
 * ## The one serializer normalization, measured rather than assumed
 *
 * `container.innerHTML = serverHtml` followed by reading `container.innerHTML` back
 * is a **parse and re-serialize**, and the DOM's serializer is not byte-faithful to
 * `renderToString`: `DzBlockUI`'s server output carries a valueless `data-blocked`
 * and the DOM prints `data-blocked=""`. Comparing post-hydration HTML against the
 * raw server string would therefore report a 3-byte "rewrite" that hydration did
 * not cause. RESIDUAL-11's `DzStepper` test never met this because that tree has no
 * valueless attribute.
 *
 * So the baseline comes from a **second, never-hydrated container** filled with the
 * same string — the DOM's own serialization of the *server* tree. `client ===
 * baseline` is then exactly "did hydration change the tree", with the serializer's
 * quirks on both sides. Three of the four components also satisfy the stricter
 * `client === server`, asserted where it holds so the normalization is not silently
 * load-bearing everywhere; for `DzBlockUI` the difference is asserted to be
 * **precisely** that one attribute, so the accommodation cannot quietly grow.
 *
 * ## Which components are here, and which are not
 *
 * Measured over all 24 rows carrying a `portal-hydration` cell. Exactly **four**
 * emit a teleport anchor pair from `renderToString`, and they are the four whose
 * `.vue` contains a native Vue `<Teleport>`: `DzBlockUI`, `DzPopconfirm`,
 * `DzSidebar`, `DzTour`. The other **20** portal through Reka UI's `*Portal`
 * primitives, which render **nothing** on the server — so there is no teleported
 * content for SSR to preserve and none for hydration to match, and their cells stay
 * `unrun` with that reason rather than acquiring a citation to something else. That
 * fact is asserted at the bottom of this file rather than written down, so the day
 * Reka server-renders its portals this file goes red and those cells can be
 * credited on evidence.
 */

import type { Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h, nextTick } from 'vue'

vi.setConfig({ testTimeout: 20000 })

interface HydrationResult {
  /** What `renderToString` produced for the component's own position. */
  server: string
  /** What it produced for each teleport target, keyed by target selector. */
  teleports: Record<string, string>
  /** The DOM's serialization of the server tree, never hydrated. */
  baseline: string
  /** The DOM's serialization after hydrating the server tree. */
  client: string
  /**
   * Everything hydration wrote to `console.warn` **and** `console.error`,
   * captured rather than printed. Both, because Vue splits its hydration
   * reporting across the two: the per-node `[Vue warn]: Hydration node mismatch`
   * goes to `warn` and the summary `Hydration completed but contains mismatches.`
   * to `error`, and a file that captured only one would still spray the other
   * into a green suite.
   */
  warnings: string[]
}

async function load(family: string, name: string): Promise<Component> {
  return (await import(`../../src/components/${family}/${name}.vue`)).default
}

/**
 * Vue's server-side teleport boundary, held at **file level** rather than written
 * inline — and only the counter-example at the bottom of this file uses it.
 *
 * The reason is about this repository's own machinery and is worth stating rather
 * than hiding. `spec-capability-refs.ts` credits a `portal-hydration` citation by
 * matching the anchor text **inside the asserting block**, and a text predicate
 * cannot tell an assertion from its negation. The counter-example asserts that
 * hydration *creates* a boundary the server never rendered; quoting the markers
 * there made the scanner read it as evidence of the very thing it disproves, and
 * `DzCommandPalette` measurably re-acquired the cell it had just lost — observed,
 * not hypothesised, on the first regeneration after this file landed.
 *
 * The rejected alternative was to move the counter-example out of
 * `packages/core/tests/ssr/`, which the generator reads as the SSR evidence
 * corpus. That would have hidden the limitation instead of naming it, and put an
 * SSR test somewhere an SSR test does not belong. The four positive tests DO quote
 * the markers inline, because they are the evidence and must read as such.
 *
 * Recorded as a known limitation in the RESIDUAL-17 handoff §7.
 */
const TELEPORT_BOUNDARY = ['<!--', 'teleport start', '-->', '<!--', 'teleport end', '-->'].join('')

/**
 * Server-render, hydrate the result, and return every string involved.
 *
 * The root factory is called **twice** — once for the server app and once for the
 * client app — because one app instance cannot be both, and because sharing a
 * single root component object across the boundary would let state leak and hide
 * exactly the divergence this file looks for.
 */
async function ssrThenHydrate(
  component: Component,
  props: Record<string, unknown> = {},
  children?: Record<string, () => unknown>,
): Promise<HydrationResult> {
  const root = (): Component => ({
    render() {
      return h(component, props, children)
    },
  })

  const ctx: { teleports?: Record<string, string> } = {}
  const server = await renderToString(createSSRApp(root()), ctx)

  const untouched = document.createElement('div')
  untouched.innerHTML = server
  const baseline = untouched.innerHTML

  const container = document.createElement('div')
  container.innerHTML = server
  document.body.appendChild(container)

  const warnings: string[] = []
  const collect = (...args: unknown[]): void => {
    warnings.push(args.map(a => String(a)).join(' '))
  }
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(collect)
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(collect)
  const app = createSSRApp(root())
  app.mount(container)
  await nextTick()
  warnSpy.mockRestore()
  errorSpy.mockRestore()

  const client = container.innerHTML
  app.unmount()
  container.remove()

  return { server, teleports: ctx.teleports ?? {}, baseline, client, warnings }
}

/**
 * Clause 4. Hydrating a `<Teleport to="body">` whose target holds no
 * server-rendered content necessarily produces a Vue hydration notice — the client
 * resolves the teleport into a target the server never populated. Measured here:
 * `DzTour` 1, `DzPopconfirm` 2, `DzSidebar` 1, `DzBlockUI` 0 (its teleport is
 * disabled, so the overlay is rendered in place).
 *
 * The count is not asserted, because it is a property of Vue's teleport
 * implementation and would make this file fail on a Vue patch release that says
 * the same thing differently. What IS asserted is the **class**: nothing other
 * than a hydration notice may appear. A component warning, a Reka warning or a
 * thrown error means something about the component, and that must not hide inside
 * expected noise.
 */
function onlyHydrationNotices(warnings: readonly string[]): string[] {
  return warnings.filter(w =>
    !/^\[Vue warn\]:\s*Hydration/.test(w)
    && !/^Hydration completed but contains mismatches\./.test(w))
}

describe('portal hydration: a teleport that survives SSR and hydration', () => {
  it('dzTour server-renders its dialog into the teleport target and hydrates unchanged', async () => {
    const DzTour = await load('overlays', 'DzTour')
    const { server, teleports, baseline, client, warnings } = await ssrThenHydrate(DzTour, {
      open: true,
      steps: [{ target: '#step-1', title: 'Start here', description: 'The first stop.' }],
    })

    // 1 — the branch was taken. RESIDUAL-10 fixed this component's SSR sibling
    // for rendering `open: false`, where the whole output was an 11-byte false
    // `v-if` and the test title claimed a teleport had been reached.
    expect(server).toContain('<!--teleport start-->')
    expect(server).toContain('<!--teleport end-->')
    // …and nothing is painted into the document flow: a tour mask ahead of
    // hydration would cover the page and trap the pointer.
    expect(server).toBe('<!--teleport start--><!--teleport end-->')

    // 2 — the panel really is server-rendered, into `body`. This is the half
    // `ssr-smoke.spec.ts` could never see, because it only ever looked at the
    // return value of `renderToString`.
    expect(Object.keys(teleports)).toEqual(['body'])
    expect(teleports.body).toContain('<!--teleport start anchor-->')
    expect(teleports.body).toContain('role="dialog"')
    expect(teleports.body).toContain('Start here')
    expect(teleports.body).toContain('The first stop.')

    // 3 — hydration rewrote nothing, on the strict comparison as well as the
    // serializer-normalized one.
    expect(client).toBe(baseline)
    expect(client).toBe(server)

    // 4
    expect(onlyHydrationNotices(warnings)).toEqual([])
  })

  it('dzSidebar server-renders its whole navigation in place and hydrates unchanged', async () => {
    const DzSidebar = await load('navigation', 'DzSidebar')
    const { server, teleports, baseline, client, warnings } = await ssrThenHydrate(DzSidebar, {}, {
      default: () => h('span', { 'data-probe': 'nav' }, 'Items'),
    })

    expect(server).toContain('<!--teleport start-->')
    expect(server).toContain('<!--teleport end-->')
    // 2 — unlike the overlays this component renders in place AND teleports, so
    // the load-bearing claim is that the in-place half is fully server-rendered:
    // a sidebar whose navigation only exists after hydration is invisible to a
    // crawler and to a first paint.
    expect(server).toContain('role="navigation"')
    expect(server).toContain('aria-label="Sidebar navigation"')
    expect(server).toContain('data-state="expanded"')
    expect(server).toContain('data-part="body"')
    expect(server).toContain('data-probe="nav"')
    // Its teleported half is the MOBILE overlay, closed on the server, so the
    // target gets anchors and a false `v-if` and no painted overlay. Asserted so
    // "the overlay is not in the target" is a measurement rather than a hope.
    expect(Object.keys(teleports)).toEqual(['body'])
    expect(teleports.body).toContain('<!--teleport start anchor-->')
    expect(teleports.body).toContain('<!--v-if-->')
    expect(teleports.body).not.toContain('<div')

    expect(client).toBe(baseline)
    expect(client).toBe(server)
    expect(onlyHydrationNotices(warnings)).toEqual([])
  })

  it('dzPopconfirm server-renders its alertdialog to the target, keeps the trigger in flow', async () => {
    const DzPopconfirm = await load('overlays', 'DzPopconfirm')
    const { server, teleports, baseline, client, warnings } = await ssrThenHydrate(
      DzPopconfirm,
      { open: true, title: 'Delete this?' },
      { default: () => h('button', { 'data-probe': 'trigger' }, 'Delete') },
    )

    expect(server).toContain('<!--teleport start-->')
    expect(server).toContain('<!--teleport end-->')
    // The trigger IS in the flow — it is the page's own button and must work
    // before JavaScript arrives — and the panel is NOT.
    expect(server).toContain('data-part="trigger"')
    expect(server).toContain('data-probe="trigger"')
    expect(server).not.toContain('Delete this?')
    expect(server).not.toContain('role="alertdialog"')
    // The teleport is reached and resolves to an adjacent anchor pair in place.
    expect(server).toContain('<!--teleport start--><!--teleport end-->')

    // 2 — and the panel the flow does not carry IS server-rendered, into `body`.
    expect(Object.keys(teleports)).toEqual(['body'])
    expect(teleports.body).toContain('role="alertdialog"')
    expect(teleports.body).toContain('data-part="panel"')
    expect(teleports.body).toContain('Delete this?')

    expect(client).toBe(baseline)
    expect(client).toBe(server)
    expect(onlyHydrationNotices(warnings)).toEqual([])
  })

  it('dzBlockUI renders its overlay INSIDE the anchors and hydrates it unchanged', async () => {
    // The strongest of the four, and the only one whose teleported content is in
    // the component's own output: the teleport is DISABLED, so the overlay is
    // rendered in place between the anchors instead of resolving to an empty
    // pair. There is real teleported content here for hydration to preserve or
    // rewrite, and it is measured byte for byte.
    const DzBlockUI = await load('feedback', 'DzBlockUI')
    const { server, teleports, baseline, client, warnings } = await ssrThenHydrate(
      DzBlockUI,
      { blocked: true },
      { default: () => h('span', { 'data-probe': 'content' }, 'Body') },
    )

    expect(server).toContain('<!--teleport start-->')
    expect(server).toContain('<!--teleport end-->')

    // 2 — the overlay, its spinner and its accessible name are all between the
    // anchors, after the blocked content, in the server string itself.
    const start = server.indexOf('<!--teleport start-->')
    const end = server.indexOf('<!--teleport end-->')
    const teleported = server.slice(start, end)
    expect(teleported).toContain('data-part="overlay"')
    expect(teleported).toContain('role="status"')
    expect(teleported).toContain('aria-label="Loading"')
    expect(server).toContain('aria-busy="true"')
    expect(server.indexOf('data-probe="content"')).toBeLessThan(start)
    // Nothing went to the target, because the teleport is disabled. Asserted, so
    // the in-place rendering above cannot silently become a target render.
    expect(teleports.body).not.toContain('data-part="overlay"')

    // 3 — hydration rewrote nothing.
    expect(client).toBe(baseline)

    // The one serializer normalization, pinned to exactly one attribute.
    // `renderToString` emits a valueless `data-blocked`; the DOM serializer
    // prints `data-blocked=""`. Both sides of the assertion above are DOM
    // serializations, so hydration is still measured byte for byte — this only
    // records WHY the raw server string differs, and fails if it stops being the
    // sole difference.
    expect(server).not.toBe(baseline)
    expect(server.replace('data-blocked aria-busy', 'data-blocked="" aria-busy'))
      .toBe(baseline)

    expect(onlyHydrationNotices(warnings)).toEqual([])
  })
})

describe('the 20 cells that stay `unrun`, and the measured reason they do', () => {
  it('reka UI portals render NOTHING on the server, so there is no teleport to preserve', async () => {
    // This is the citation for 20 `unrun` cells, asserted rather than narrated.
    //
    // `DzCommandPalette` read `present` until RESIDUAL-17 because its citation in
    // `ssr-smoke.spec.ts` passes `open: true`, and RESIDUAL-16's predicate took
    // that as proof the portal branch had been taken. It is not: opened, the
    // server output is 27 bytes of comment markers with a FALSE `v-if` where the
    // portal would be, `ctx.teleports` is EMPTY, and hydration then replaces
    // those 27 bytes with a teleport anchor pair. Nothing survived SSR because
    // nothing was rendered.
    //
    // That is Reka UI's deliberate degradation — a portal needs a DOM target and
    // the server has none — not a defect, and it is why 20 of the 24
    // `portal-hydration` cells cannot be evidenced by any harness in jsdom or
    // out of it. Asserted here so the day Reka server-renders its portals this
    // test goes red and those cells can be credited on evidence.
    const DzCommandPalette = await load('overlays', 'DzCommandPalette')
    const { server, teleports, baseline, client } = await ssrThenHydrate(DzCommandPalette, {
      open: true,
      items: [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }],
    })

    expect(server).toBe('<!--[--><!--v-if--><!--]-->')
    expect(server).not.toContain('teleport')
    expect(teleports).toEqual({})
    // Hydration introduces the boundary the server never rendered. Recorded as a
    // measurement, not as a failure: the overlay paints nothing either way, which
    // is the behaviour `ssr-smoke.spec.ts` already asserts. The expected string is
    // built from `TELEPORT_BOUNDARY` rather than written out — see its docblock,
    // and §7 of the RESIDUAL-17 handoff.
    expect(client).not.toBe(baseline)
    expect(client).toBe(`<!--[-->${TELEPORT_BOUNDARY}<!--]-->`)
  })
})
