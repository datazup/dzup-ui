/**
 * Per-block accessibility guard (docs/blocks.md §3.6, §3.7, Task I3).
 *
 * Best-in-class galleries show *earned* trust marks, not decoration: the
 * "Accessible" / "Light + dark" badges BlockCard/BlockPreview render are only
 * honest because this suite runs `axe-core` against every block in CI. Each
 * `BLOCKS` entry is mounted with zero props (blocks are self-contained — no
 * required inputs) under each `AUDITED_THEMES` value and scanned against the WCAG
 * 2.0/2.1 A + AA rule set; a `critical` or `serious` violation fails the run
 * loudly, naming the block id, the theme, the rule, and the offending nodes.
 *
 * Single source of truth: the marks live in `certifications.ts` and the meta-test
 * below asserts this suite enforces exactly those marks — you cannot render a mark
 * without a backing check here, and the "Light + dark" claim is earned only because
 * the per-block loop audits every theme in `AUDITED_THEMES`.
 *
 * Scope & honesty (what the marks can claim):
 *   • This is a static axe pass in jsdom under each theme. It catches the
 *     structural WCAG failures axe can prove headless — missing names, bad ARIA,
 *     label/role mismatches, list/heading structure, img-alt — at the
 *     `critical`/`serious` impact the marks certify.
 *   • Contrast (`color-contrast`) needs real layout/paint, which jsdom does not
 *     provide, so axe returns it as *incomplete*, not a violation — rendered
 *     contrast is verified manually + via the preview's light/dark toggle, not
 *     claimed here. There is deliberately NO "Responsive" mark: reflow needs a
 *     real layout engine (see certifications.ts).
 *
 * ESLint is broken locally (MEMORY.md → "Lint config broken"); this Vitest run is
 * the only automated a11y gate, so — like registry.spec.ts — it stands alone.
 */

import type { Result } from 'axe-core'
import type { Component } from 'vue'
import type { AuditedTheme } from './certifications.ts'
import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { defineComponent, h } from 'vue'
import { AUDITED_THEMES, CERTIFICATIONS, isCertified, KNOWN_A11Y_DEBT } from './certifications.ts'
import { BLOCKS } from './registry.ts'

/**
 * jsdom lacks `matchMedia` / `IntersectionObserver`; some composed components
 * (DzColorModeToggle, DzAnimatedNumber's on-scroll count-up, DzSidebar's
 * `useSidebar`, DzTour) reach for them at mount, guarded only by `typeof window`.
 * Static, non-matching stubs are enough — we render the default (desktop /
 * no-reduced-motion) state, which is what the marks certify. ResizeObserver and
 * scrollIntoView are already polyfilled globally in vitest.setup.ts.
 */
beforeAll(() => {
  if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): [] {
        return []
      }
    } as unknown as typeof globalThis.IntersectionObserver
  }
})

/**
 * The WCAG 2.0/2.1 Level A + AA rule tags — the exact conformance target the
 * marks advertise (docs/blocks.md §3.7). Best-practice/experimental rules are
 * excluded so the gate tracks the standard, not axe's house opinions.
 */
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const

/** Impacts that block the marks. Moderate/minor are surfaced by axe but not gating. */
const BLOCKING_IMPACTS = new Set(['critical', 'serious'])

/**
 * Force-resolve a block's lazy `defineAsyncComponent` BEFORE mount.
 *
 * Critical: rendering the async wrapper inside `<Suspense>` and flushing promises
 * does NOT settle the dynamic `import()` in this jsdom run — the wrapper stays an
 * unresolved comment placeholder, so axe would scan an EMPTY container and every
 * block would falsely pass. Awaiting the wrapper's internal `__asyncLoader()`
 * resolves the real SFC up front, after which it mounts synchronously. The
 * non-empty-content guard in each test is the backstop that keeps this honest.
 */
async function resolveBlock(component: Component): Promise<void> {
  const loader = (component as { __asyncLoader?: () => Promise<unknown> }).__asyncLoader
  if (typeof loader === 'function')
    await loader()
}

/**
 * Mount a (pre-resolved) block component to a settled DOM under a given theme.
 * `data-theme` on the wrapper scopes token re-resolution exactly as BlockPreview's
 * stage does, so the audit sees the same DOM a visitor would in that theme.
 */
async function mountBlock(component: Component, theme: AuditedTheme) {
  // Capture render + lifecycle errors. Without this a block that throws on mount
  // renders NOTHING, axe scans an empty container, and the block falsely "passes"
  // the gate — so these are surfaced as a loud failure instead.
  const errors: unknown[] = []
  const Harness = defineComponent({
    name: 'A11yHarness',
    setup() {
      return () => h('div', { 'data-theme': theme }, [h(component)])
    },
  })
  const utils = render(Harness, {
    global: { config: { errorHandler: (error: unknown) => errors.push(error) } },
  })
  // Let nested onMounted hooks / microtasks settle before we snapshot the DOM.
  await flushPromises()
  return { ...utils, errors }
}

/**
 * Best-effort stringify for a thrown value — Errors give their message, plain
 *  objects are JSON'd (so the guard never reports a useless "[object Object]").
 */
function describeError(error: unknown): string {
  if (error instanceof Error)
    return error.message
  try {
    return typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error)
  }
  catch {
    return String(error)
  }
}

/** Render one violation as a loud, copy-pasteable line: rule + help + nodes + url. */
function reportViolation(violation: Result): string {
  const targets = violation.nodes
    .map(node => (Array.isArray(node.target) ? node.target.join(' ') : String(node.target)))
    .join(', ')
  return `[${violation.impact}] ${violation.id} — ${violation.help}\n      nodes: ${targets}\n      ${violation.helpUrl}`
}

/**
 * Mount `block` under `theme`, guard against silent empty/error renders, and
 * return the serious/critical axe violations. Throws loudly (with block id +
 * theme) if the block can't even be rendered to a non-empty DOM — an unrendered
 * block must never be mistaken for a clean one.
 */
async function auditBlock(component: Component, blockId: string, theme: AuditedTheme): Promise<Result[]> {
  // @testing-library/vue types `container` as Element (not HTMLElement); axe and
  // `.textContent` both accept it, so keep the wider type to match the render result.
  let container: Element
  let errors: unknown[]
  try {
    await resolveBlock(component)
    ;({ container, errors } = await mountBlock(component, theme))
  }
  catch (error) {
    throw new Error(`[a11y] block "${blockId}" threw while mounting (${theme} theme): ${describeError(error)}`)
  }

  if (errors.length > 0) {
    throw new Error(
      `[a11y] block "${blockId}" raised ${errors.length} error(s) while rendering (${theme} theme): ${
        errors.map(describeError).join('; ')}`,
    )
  }
  expect(
    container.textContent?.trim() ?? '',
    `[a11y] block "${blockId}" rendered no content (${theme} theme) — cannot certify`,
  ).not.toBe('')

  const results = await axe(container, { runOnly: { type: 'tag', values: [...AXE_TAGS] } })
  return (results.violations ?? []).filter(
    violation => violation.impact != null && BLOCKING_IMPACTS.has(violation.impact),
  )
}

/** Certified blocks render the marks; known-debt blocks are tracked separately. */
const certified = BLOCKS.filter(block => isCertified(block.id)).map(block => ({ block, label: block.id }))
const debt = BLOCKS.filter(block => !isCertified(block.id)).map(block => ({ block, label: block.id }))

describe('block trust marks are backed by this suite', () => {
  // The marks rendered on the cards and the checks run here share one source of
  // truth (certifications.ts). These guards make drift impossible: a mark cannot
  // be added without a backing assertion, and "Light + dark" stays truthful only
  // while the per-block loop below audits both themes.
  it('renders exactly the certifications this suite enforces (no decorative marks)', () => {
    expect(CERTIFICATIONS.map(mark => mark.id)).toEqual(['accessible', 'light-dark'])
  })

  it('audits every theme the "Light + dark" mark claims', () => {
    expect([...AUDITED_THEMES]).toEqual(['light', 'dark'])
  })

  it('certifies the bulk of the catalog (known debt is the rare exception)', () => {
    // A backstop against the known-debt list quietly swallowing the catalog: if it
    // ever covers most blocks, the marks stop meaning anything. Keep it small.
    expect(certified.length).toBeGreaterThan(BLOCKS.length - 5)
  })
})

// ---------------------------------------------------------------------------
// Certified catalog — the gate. Every certified block, under every audited
// theme, must have ZERO serious/critical violations. This is what the
// "Accessible" + "Light + dark" marks promise.
// ---------------------------------------------------------------------------

describe('blocks — accessibility (axe-core, WCAG A/AA)', () => {
  it('has a non-empty catalog to check', () => {
    expect(BLOCKS.length).toBeGreaterThan(0)
  })

  describe.each(certified)('block "$label"', ({ block }) => {
    for (const theme of AUDITED_THEMES) {
      it(`renders with no critical or serious a11y violations (${theme})`, async () => {
        const blocking = await auditBlock(block.component, block.id, theme)
        expect(
          blocking,
          `Block "${block.id}" (${theme} theme) has ${blocking.length} blocking a11y violation(s):\n    ${blocking.map(reportViolation).join('\n    ')}`,
        ).toEqual([])
      })
    }
  })
})

// ---------------------------------------------------------------------------
// Known a11y debt — bounded, not ignored. These blocks fail axe ONLY on the
// documented rules (defects inside @dzup-ui/core components, not the block).
// The suite stays green while they persist, but fails the moment a NEW rule
// appears — debt can't grow silently, and these blocks render no trust marks.
// ---------------------------------------------------------------------------

describe.runIf(debt.length > 0)('blocks — known a11y debt (tracked, uncertified)', () => {
  describe.each(debt)('block "$label"', ({ block }) => {
    const known = KNOWN_A11Y_DEBT[block.id]!
    for (const theme of AUDITED_THEMES) {
      it(`has only its documented known-issue rules (${theme}) — ${known.ref}`, async () => {
        const blocking = await auditBlock(block.component, block.id, theme)
        const unexpected = blocking.filter(violation => !known.rules.includes(violation.id))
        expect(
          unexpected,
          `Block "${block.id}" (${theme} theme) has ${unexpected.length} NEW violation(s) beyond its known debt `
          + `[${known.rules.join(', ')}]:\n    ${unexpected.map(reportViolation).join('\n    ')}`,
        ).toEqual([])
      })
    }
  })
})
