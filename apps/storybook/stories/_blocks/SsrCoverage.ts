/**
 * Reusable MDX doc-blocks: what the SSR suite actually covers (TASK-FREE-14).
 *
 * Read from the real spec source (`packages/core/tests/ssr/ssr-smoke.spec.ts`), not
 * typed into the guide. An SSR page that claims coverage it does not have is worse
 * than no page, and the only way to keep the claim true is to derive it: add a test
 * and it appears here; skip one and it moves to the "skipped" column by itself.
 *
 * Scanned signals, all stable literals in that file:
 * - `describe('sSR: <family>', ...)` — the family grouping
 * - `it('<component> renders in SSR', ...)` — a covered component
 * - `it.skip(...)` — a component that is NOT verified, surfaced as such
 *
 * Note the casing: the spec reads `describe('sSR: buttons')` and
 * `it('dzButton renders in SSR')` because an ESLint rule lowercases the first
 * letter of a test title. Match case-insensitively and re-capitalise the component
 * name for display — do NOT "tidy" the spec's titles to suit this parser.
 */
import type { CSSProperties } from 'react'
import { createElement as h } from 'react'

const RAW = import.meta.glob('../../../../packages/core/tests/ssr/**/*.spec.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface SsrCase {
  /** Component name, e.g. `DzButton`. */
  component: string
  /** Family from the enclosing `describe`, e.g. `buttons`. */
  family: string
  /** True when the test is `it.skip` — present but NOT verifying anything. */
  skipped: boolean
}

/** `dzButton` → `DzButton`. The spec's titles are lowercased by a lint rule. */
function normalise(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/** Every SSR case in the suite, in source order, grouped by its describe block. */
export const SSR_CASES: SsrCase[] = Object.values(RAW).flatMap((source) => {
  const cases: SsrCase[] = []
  let family = 'other'
  // One pass over the file: `describe` lines set the current family; `it` lines
  // under them are that family's cases.
  for (const line of source.split('\n')) {
    // No `\s*` after the colon — it can exchange characters with `[^'"]+` and
    // trips regexp/no-super-linear-backtracking. The `.trim()` below does that job.
    const describe = line.match(/describe\(\s*['"]ssr:([^'"]+)['"]/i)
    if (describe?.[1]) {
      family = describe[1].trim()
      continue
    }
    // Literal single space before "renders", not `\s+`: the titles are written
    // `'dzButton renders in SSR'`, and an unbounded `\s+` next to `\s*` is
    // super-linear backtracking (regexp/no-super-linear-backtracking).
    const test = line.match(/\bit(\.skip)?\(\s*['"](dz\w+) renders in SSR/i)
    if (test?.[2])
      cases.push({ component: normalise(test[2]), family, skipped: Boolean(test[1]) })
  }
  return cases
})

const COVERED = SSR_CASES.filter(c => !c.skipped)
const SKIPPED = SSR_CASES.filter(c => c.skipped)

/** Ordered unique family names as they appear in the suite. */
const FAMILIES = [...new Set(SSR_CASES.map(c => c.family))]

const box: CSSProperties = {
  border: '1px solid var(--dz-border, #e5e7eb)',
  borderRadius: 8,
  padding: '12px 14px',
  margin: '16px 0',
}

/** A one-line, derived headline for the coverage claim. */
export function SsrCoverageSummary() {
  if (SSR_CASES.length === 0) {
    return h('p', null, 'No SSR suite found — the coverage claim on this page is unverified.')
  }
  return h('div', { style: box }, [
    h('p', { key: 'p', style: { margin: 0 } }, [
      h('strong', { key: 's' }, `${COVERED.length} components`),
      ` are asserted to render on the server, across ${FAMILIES.length} families`,
      SKIPPED.length > 0
        ? `, and ${SKIPPED.length} ${SKIPPED.length === 1 ? 'is' : 'are'} skipped (${SKIPPED.map(c => c.component).join(', ')}).`
        : '.',
    ]),
    h(
      'p',
      { key: 'q', style: { margin: '8px 0 0', opacity: 0.8, fontSize: 13 } },
      'Generated from packages/core/tests/ssr/ — if this number moves, the suite moved.',
    ),
  ])
}

/** Per-family list of the covered components, with skips called out. */
export function SsrCoverage() {
  if (SSR_CASES.length === 0)
    return h('p', null, 'No SSR cases found.')

  return h(
    'div',
    { style: { overflowX: 'auto' } },
    h(
      'table',
      { style: { borderCollapse: 'collapse', width: '100%', margin: '16px 0' } },
      h('thead', null, h('tr', null, [
        h('th', { key: 'f', style: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--dz-border, #e5e7eb)' } }, 'Family'),
        h('th', { key: 'n', style: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--dz-border, #e5e7eb)' } }, 'Covered'),
        h('th', { key: 'c', style: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--dz-border, #e5e7eb)' } }, 'Components'),
      ])),
      h(
        'tbody',
        null,
        FAMILIES.map((family) => {
          const rows = SSR_CASES.filter(c => c.family === family)
          const cell: CSSProperties = {
            padding: '8px 10px',
            borderBottom: '1px solid var(--dz-border, #e5e7eb)',
            verticalAlign: 'top',
          }
          return h('tr', { key: family }, [
            h('td', { key: 'f', style: { ...cell, whiteSpace: 'nowrap', textTransform: 'capitalize' } }, family),
            h('td', { key: 'n', style: cell }, String(rows.filter(r => !r.skipped).length)),
            h(
              'td',
              { key: 'c', style: cell },
              rows.map((r, i) =>
                h('span', { key: r.component }, [
                  h('code', { key: 'c' }, r.component),
                  r.skipped ? h('em', { key: 's', style: { opacity: 0.75 } }, ' (skipped)') : null,
                  i < rows.length - 1 ? ', ' : '',
                ]),
              ),
            ),
          ])
        }),
      ),
    ),
  )
}
