/**
 * The outcome half of an evidence citation (RESIDUAL-16, tightened by
 * RESIDUAL-17).
 *
 * Every rule below is pinned **both ways**: the OLD predicate is reconstructed
 * inline, shown crediting the citation, and then the shipped predicate is shown
 * rejecting it — RESIDUAL-05's and RESIDUAL-14's method. A one-way test proves
 * nothing here, because a predicate that always returns `false` passes every
 * rejection case and empties the matrix.
 *
 * The fixtures are the real shapes, reduced: `ssr-smoke.spec.ts`'s overlay block
 * (`open: false`, no teleport), its `DzTour` block (`open: true`, anchor pair, no
 * hydration), its `DzCommandPalette` block (`open: true` and the branch
 * measurably NOT taken), its `it.skip`ped `DzAccordion`,
 * `portal-hydration.spec.ts`'s server-render-then-hydrate shape, and
 * `cards.a11y.spec.ts`'s axe idiom.
 */

import { describe, expect, it } from 'vitest'
import { capabilityCallsIn, exercisedBy, filesExercising, helpersReaching, testBlocksIn } from './spec-capability-refs.ts'
import { componentsLoadedBy, stripComments } from './spec-component-refs.ts'

/**
 * The predicate this module replaces: RESIDUAL-05's structural rule, which asks
 * only whether the file **loads** the component.
 *
 * Reconstructed here rather than imported so the comparison cannot quietly become
 * a comparison of the new predicate with itself.
 */
function oldPredicate(source: string, component: string): boolean {
  return componentsLoadedBy(source).has(component)
}

const rel = (p: string) => p

/** `ssr-smoke.spec.ts`'s overlay block, reduced. The teleport is behind `open`. */
const CLOSED_OVERLAY = [
  'import { renderToString } from \'@vue/server-renderer\'',
  'import { createSSRApp, h } from \'vue\'',
  'async function ssrRender(component, props = {}, children) {',
  '  return renderToString(createSSRApp({ render: () => h(component, props, children) }))',
  '}',
  'describe(\'sSR: overlays\', () => {',
  '  it(\'dzDialog passes its slot through and adds no element in SSR\', async () => {',
  '    const DzDialog = (await import(\'../../src/components/overlays/DzDialog.vue\')).default',
  '    const html = await ssrRender(DzDialog, { open: false }, {',
  '      default: () => h(\'button\', { \'data-probe\': \'trigger\' }, \'Open\'),',
  '    })',
  '    expect(withoutComments(html)).toBe(TRIGGER)',
  '  })',
  '})',
].join('\n')

/**
 * `ssr-smoke.spec.ts`'s `DzTour` block: the branch is taken and the anchors are
 * asserted, and **nothing is hydrated**. RESIDUAL-16 credited this for
 * `portal-hydration`; RESIDUAL-17 does not, because the kind's name claims a
 * hydration and this block has none.
 */
const OPENED_PORTAL_NO_HYDRATION = [
  'import { renderToString } from \'@vue/server-renderer\'',
  'import { createSSRApp, h } from \'vue\'',
  'async function ssrRender(component, props = {}) {',
  '  return renderToString(createSSRApp({ render: () => h(component, props) }))',
  '}',
  'it(\'dzTour reaches its teleport and paints nothing in the document in SSR\', async () => {',
  '  const DzTour = (await import(\'../../src/components/overlays/DzTour.vue\')).default',
  '  const html = await ssrRender(DzTour, { open: true, steps: [] })',
  '  expect(html).toContain(\'<!--teleport start-->\')',
  '  expect(html).toContain(\'<!--teleport end-->\')',
  '})',
].join('\n')

/**
 * `portal-hydration.spec.ts`'s shape, reduced: the server render, the anchor pair
 * asserted, and a hydration — all three, through a file-level helper, which is how
 * every SSR spec in this repository is written.
 */
const HYDRATED_PORTAL = [
  'import { renderToString } from \'@vue/server-renderer\'',
  'import { createSSRApp, h, nextTick } from \'vue\'',
  'async function ssrThenHydrate(component, props = {}) {',
  '  const root = () => ({ render: () => h(component, props) })',
  '  const server = await renderToString(createSSRApp(root()))',
  '  const container = document.createElement(\'div\')',
  '  container.innerHTML = server',
  '  const app = createSSRApp(root())',
  '  app.mount(container)',
  '  await nextTick()',
  '  return { server, client: container.innerHTML }',
  '}',
  'it(\'dzTour server-renders its dialog and hydrates unchanged\', async () => {',
  '  const DzTour = (await import(\'../../src/components/overlays/DzTour.vue\')).default',
  '  const { server, client } = await ssrThenHydrate(DzTour, { open: true, steps: [] })',
  '  expect(server).toContain(\'<!--teleport start-->\')',
  '  expect(server).toContain(\'<!--teleport end-->\')',
  '  expect(client).toBe(server)',
  '})',
].join('\n')

/**
 * The shape RESIDUAL-17 measured to be a false credit: `open: true` in the call,
 * the portal branch NOT taken, no anchor assertion — `DzCommandPalette`'s real
 * citation. RESIDUAL-16 accepted `open: true` as proof of the branch; the measured
 * server output is 27 bytes with a false `v-if` and no teleport at all.
 */
const OPENED_BUT_NO_PORTAL = [
  'import { renderToString } from \'@vue/server-renderer\'',
  'import { createSSRApp, h, nextTick } from \'vue\'',
  'async function ssrThenHydrate(component, props = {}) {',
  '  const root = () => ({ render: () => h(component, props) })',
  '  const server = await renderToString(createSSRApp(root()))',
  '  const container = document.createElement(\'div\')',
  '  container.innerHTML = server',
  '  const app = createSSRApp(root())',
  '  app.mount(container)',
  '  await nextTick()',
  '  return { server, client: container.innerHTML }',
  '}',
  'it(\'dzCommandPalette keeps its overlay out of the document in SSR when open\', async () => {',
  '  const DzCommandPalette = (await import(\'../../src/components/overlays/DzCommandPalette.vue\')).default',
  '  const { server } = await ssrThenHydrate(DzCommandPalette, { open: true, items: [] })',
  '  expect(withoutComments(server)).toBe(\'\')',
  '})',
].join('\n')

/** The `it.skip` that gave `DzAccordion` an SSR citation. */
const SKIPPED_SSR = [
  'import { renderToString } from \'@vue/server-renderer\'',
  'import { createSSRApp, h } from \'vue\'',
  'async function ssrRender(component, props = {}) {',
  '  return renderToString(createSSRApp({ render: () => h(component, props) }))',
  '}',
  'it.skip(\'dzAccordion renders in SSR (blocked by Reka UI AccordionRoot SSR stall)\', async () => {',
  '  const DzAccordion = (await import(\'../../src/components/data/DzAccordion.vue\')).default',
  '  const html = await ssrRender(DzAccordion, { type: \'single\' })',
  '  expect(html).toBeTruthy()',
  '})',
].join('\n')

/** `cards.a11y.spec.ts`'s idiom: render the subject, then run axe over it. */
const AXE_SUBJECT = [
  'import { render } from \'@testing-library/vue\'',
  'import { axe } from \'vitest-axe\'',
  'import DzCard from \'../../src/components/cards/DzCard.vue\'',
  'it(\'has no a11y violations with variant="flat"\', async () => {',
  '  const { container } = render(DzCard, { props: { variant: \'flat\' } })',
  '  const results = await axe(container)',
  '  expect(results).toHaveNoViolations()',
  '})',
].join('\n')

/** The same file's non-axe block: the component is rendered, axe never runs. */
const AXE_ABSENT = [
  'import { render } from \'@testing-library/vue\'',
  'import DzCard from \'../../src/components/cards/DzCard.vue\'',
  'it(\'has role="button" and tabindex when clickable\', () => {',
  '  const { container } = render(DzCard, { props: { clickable: true } })',
  '  expect(container.firstElementChild).toHaveAttribute(\'role\', \'button\')',
  '})',
].join('\n')

describe('testBlocksIn — the scanning hazards, before any verdict depends on it', () => {
  it('does not run a block on to end-of-file because a regex holds a paren', () => {
    // MEASURED on the real `ssr-smoke.spec.ts`: a paren matcher that treats `"` as
    // a string delimiter reads `/data-state="([^"]*)"/g` as the string `"([^"`,
    // swallowing the `(` and leaving the `)` to close the call early — and a regex
    // with an unbalanced paren runs the block to EOF. Two blocks ran away
    // (731→852, 813→1206) and handed every overlay the DzStepper test's teleport
    // assertions, turning 9 wrong verdicts into 10 right-looking ones.
    const source = [
      'it(\'dzStepper renders one step per item in SSR\', async () => {',
      '  expect([...html.matchAll(/data-state="([^"]*)"/g)].map(m => m[1])).toEqual([\'ready\'])',
      '})',
      'it(\'dzTour reaches its teleport\', async () => {',
      '  expect(html).toContain(\'<!--teleport start-->\')',
      '})',
    ].join('\n')
    const blocks = testBlocksIn(source)

    expect(blocks).toHaveLength(2)
    expect(blocks[0]!.text).not.toContain('teleport start')
    expect(blocks[1]!.name).toBe('dzTour reaches its teleport')
  })

  it('marks `it.skip` as skipped and a plain `it` as live', () => {
    const blocks = testBlocksIn('it.skip(\'a\', () => {})\nit(\'b\', () => {})')
    expect(blocks.map(b => b.skipped)).toEqual([true, false])
  })

  it('reports the line of the `it` token, not of the block body', () => {
    expect(testBlocksIn('\n\nit(\'a\', () => {})')[0]!.line).toBe(3)
  })
})

describe('helpersReaching — every SSR spec renders through a helper', () => {
  it('finds a helper whose parameter list contains a brace', () => {
    // `props: Record<string, unknown> = {}` puts a `{` before the body, so a scan
    // that took the first brace after the name would read the default value as the
    // function body and find no `renderToString` in it — which rejected all 119
    // genuine `ssr-sample` citations when it was measured.
    const source = [
      'async function ssrRender(component, props = {}, children) {',
      '  return renderToString(createSSRApp({ render: () => h(component, props, children) }))',
      '}',
    ].join('\n')
    expect(helpersReaching(source, /renderToString\s*\(/)).toEqual(['ssrRender'])
  })

  it('does not report a helper that never reaches the token', () => {
    expect(helpersReaching('function withoutComments(html) { return html.trim() }', /renderToString\s*\(/))
      .toEqual([])
  })
})

describe('`portal-hydration` must show a portal — the kind that was `ssr-sample` under another name', () => {
  const files = [{ path: 'closed.spec.ts', source: CLOSED_OVERLAY }]

  it('the OLD predicate credits an overlay rendered CLOSED, whose teleport is never reached', () => {
    expect(oldPredicate(CLOSED_OVERLAY, 'DzDialog')).toBe(true)
  })

  it('the NEW predicate rejects it', () => {
    expect(filesExercising(files, 'DzDialog', 'portal-hydration', rel)).toEqual([])
  })

  it('…and still credits it for `ssr-sample`, which is the claim that test DOES support', () => {
    // The rejection above must not be a blanket one: the same file is genuine
    // evidence that DzDialog server-renders. Sixteen citations moved; none of the
    // component's other evidence did.
    expect(filesExercising(files, 'DzDialog', 'ssr-sample', rel)).toEqual(['closed.spec.ts'])
  })

  it('rejects a portal rendered OPEN with its anchors asserted but NOTHING hydrated', () => {
    // RESIDUAL-16 credited exactly this shape, because no citation in the
    // repository hydrated anything and requiring it would have emptied the
    // column. RESIDUAL-17 wrote the harness, so the requirement can be met and
    // the cell can mean its own name. The SSR claim is untouched — see below.
    const files = [{ path: 'tour.spec.ts', source: OPENED_PORTAL_NO_HYDRATION }]
    expect(filesExercising(files, 'DzTour', 'portal-hydration', rel)).toEqual([])
    expect(filesExercising(files, 'DzTour', 'ssr-sample', rel)).toEqual(['tour.spec.ts'])
  })

  it('credits a portal that is server-rendered, anchor-asserted AND hydrated', () => {
    expect(filesExercising([{ path: 'portal-hydration.spec.ts', source: HYDRATED_PORTAL }], 'DzTour', 'portal-hydration', rel))
      .toEqual(['portal-hydration.spec.ts'])
  })

  it('rejects `open: true` as proof the branch was taken, because it MEASURABLY is not', () => {
    // The RESIDUAL-17 measurement, turned into a standing rule. `DzCommandPalette`
    // rendered `open: true` emits `<!--[--><!--v-if--><!--]-->`: 27 bytes, no
    // teleport, because Reka UI's `*Portal` does not render on the server. It
    // hydrates — it just has no portal to preserve — so the hydration term alone
    // would still credit it. The anchor pair in the ASSERTED OUTPUT is what
    // separates a demonstrated branch from a hypothesised one.
    const files = [{ path: 'smoke.spec.ts', source: OPENED_BUT_NO_PORTAL }]
    expect(/\bopen\s*:\s*true\b/.test(OPENED_BUT_NO_PORTAL)).toBe(true)
    expect(filesExercising(files, 'DzCommandPalette', 'portal-hydration', rel)).toEqual([])
    expect(filesExercising(files, 'DzCommandPalette', 'ssr-sample', rel)).toEqual(['smoke.spec.ts'])
  })

  it('does not accept VTU `mount(` as a hydration — it renders from scratch', () => {
    // `.mount(` with the dot is an app mounting over existing markup; a bare
    // `mount(` is Vue Test Utils, which builds a tree and hydrates nothing. A
    // predicate that matched the bare form would credit most of the unit suite.
    const vtu = HYDRATED_PORTAL
      .replace('  const app = createSSRApp(root())\n', '')
      .replace('  app.mount(container)', '  mount(component, { props })')
    expect(filesExercising([{ path: 'vtu.spec.ts', source: vtu }], 'DzTour', 'portal-hydration', rel))
      .toEqual([])
  })
})

describe('a skipped test is not evidence', () => {
  const files = [{ path: 'smoke.spec.ts', source: SKIPPED_SSR }]

  it('the OLD predicate credits the dynamic import inside an `it.skip`', () => {
    expect(oldPredicate(SKIPPED_SSR, 'DzAccordion')).toBe(true)
  })

  it('the NEW predicate rejects it', () => {
    expect(filesExercising(files, 'DzAccordion', 'ssr-sample', rel)).toEqual([])
  })

  it('and credits the same file once the test runs', () => {
    const live = SKIPPED_SSR.replace('it.skip(', 'it(')
    expect(filesExercising([{ path: 'smoke.spec.ts', source: live }], 'DzAccordion', 'ssr-sample', rel))
      .toEqual(['smoke.spec.ts'])
  })
})

describe('`axe` must run axe', () => {
  it('the OLD predicate credits a file that renders the component and never runs axe', () => {
    expect(oldPredicate(AXE_ABSENT, 'DzCard')).toBe(true)
  })

  it('the NEW predicate rejects it', () => {
    expect(filesExercising([{ path: 'cards.a11y.spec.ts', source: AXE_ABSENT }], 'DzCard', 'axe', rel))
      .toEqual([])
  })

  it('and credits the block that awaits axe over the rendered subject', () => {
    expect(filesExercising([{ path: 'cards.a11y.spec.ts', source: AXE_SUBJECT }], 'DzCard', 'axe', rel))
      .toEqual(['cards.a11y.spec.ts'])
  })

  it('credits a component that is the ROOT of an inline template rather than a render argument', () => {
    // 23 of the 61 axe citations take this shape, and a predicate that only looked
    // for `render(DzFoo` would have moved every one of them to `unrun`.
    const source = [
      'import { render } from \'@testing-library/vue\'',
      'import { axe } from \'vitest-axe\'',
      'import DzList from \'../../src/components/data/DzList.vue\'',
      'import DzListItem from \'../../src/components/data/DzListItem.vue\'',
      'it(\'has no a11y violations with list items\', async () => {',
      '  const { container } = render({',
      '    template: \'<DzList aria-label="Items"><DzListItem>Item</DzListItem></DzList>\',',
      '    components: { DzList, DzListItem },',
      '  })',
      '  expect(await axe(container)).toHaveNoViolations()',
      '})',
    ].join('\n')
    const files = [{ path: 'data.a11y.spec.ts', source }]

    expect(filesExercising(files, 'DzList', 'axe', rel)).toEqual(['data.a11y.spec.ts'])
    expect(filesExercising(files, 'DzListItem', 'axe', rel)).toEqual(['data.a11y.spec.ts'])
  })
})

describe('the RESIDUAL-05 floor still holds — loading is required, not merely exercising', () => {
  it('a prose mention in a file that runs axe grants nothing', () => {
    // The `D-RES02-2` shape, asked of the new predicate: a "tested elsewhere" note
    // beside a real axe run. `filesExercising` calls `componentsLoadedBy` first, so
    // the structural rule is not weakened by the outcome rule being added.
    const source = [
      'import { render } from \'@testing-library/vue\'',
      'import { axe } from \'vitest-axe\'',
      'import DzCard from \'../../src/components/cards/DzCard.vue\'',
      '// Note: DzGhost is tested in another.a11y.spec.ts.',
      'it(\'has no a11y violations\', async () => {',
      '  /* DzGhost lives elsewhere */',
      '  const { container } = render(DzCard)',
      '  expect(await axe(container)).toHaveNoViolations()',
      '})',
    ].join('\n')
    const files = [{ path: 'cards.a11y.spec.ts', source }]

    expect(oldPredicate(source, 'DzGhost')).toBe(false)
    expect(filesExercising(files, 'DzGhost', 'axe', rel)).toEqual([])
    expect(filesExercising(files, 'DzCard', 'axe', rel)).toEqual(['cards.a11y.spec.ts'])
  })

  it('a comment inside a live block cannot satisfy the capability either', () => {
    // `exercisedBy` reads comment-stripped text, so a docblock that quotes
    // `await axe(container)` is not an axe run. This is the mechanism RESIDUAL-14
    // measured 18 times in the keyboard tables.
    const source = [
      'import DzCard from \'../../src/components/cards/DzCard.vue\'',
      'it(\'renders\', () => {',
      '  // Historically this asserted `await axe(container)`; it no longer does.',
      '  expect(render(DzCard)).toBeTruthy()',
      '})',
    ].join('\n')
    const block = testBlocksIn(stripComments(source, { preserveLines: true }))[0]!

    expect(/\baxe\s*\(/.test(source)).toBe(true)
    expect(exercisedBy(block, 'DzCard', 'axe', capabilityCallsIn(source))).toBe(false)
  })
})

describe('capabilityCallsIn — the per-file call shapes', () => {
  it('resolves the SSR helper and the HYDRATION helper separately', () => {
    const calls = capabilityCallsIn(HYDRATED_PORTAL)
    expect(calls.ssr.test('await ssrThenHydrate(DzTour, {})')).toBe(true)
    expect(calls.hydrate.test('await ssrThenHydrate(DzTour, {})')).toBe(true)
    // A file that only server-renders resolves no hydration helper, and the
    // direct `.mount(` alternative does not match a bare call either.
    const ssrOnly = capabilityCallsIn(OPENED_PORTAL_NO_HYDRATION)
    expect(ssrOnly.ssr.test('await ssrRender(DzTour, { open: true })')).toBe(true)
    expect(ssrOnly.hydrate.test('await ssrRender(DzTour, { open: true })')).toBe(false)
  })
})
