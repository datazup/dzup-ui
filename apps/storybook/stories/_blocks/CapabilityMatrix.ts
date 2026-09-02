/**
 * Reusable MDX doc-block: the capability/evidence matrix (TASK-OSS-P5-06).
 *
 * One row per public component, one cell per evidence row that component's tier
 * and traits require, and four states a cell can be in. Data comes from
 * `_data/capability.generated.ts`, which `yarn generate:capability-matrix`
 * writes and `yarn validate:capability-matrix` keeps in step.
 *
 * **There is no percentage anywhere on this page, and that is a decision.** A
 * single number over cells of different weight is satisfied equally by closing
 * four badge cells and by closing one combobox cell, and it hides which — which
 * is precisely the reporting habit the reassessment's P5 exit criterion set out
 * to replace ("browser/AT/performance/security gaps are not collapsed into
 * aggregate test counts"). Counts are shown per tier and per state and are not
 * reduced further.
 *
 * Authored with `createElement` (no JSX) for the same reason as `DocTable` and
 * `DoDont`: the Storybook Vite pipeline has no React-JSX transform.
 */
import type { DocCapabilityRow, DocEvidenceCell } from '../_data/capability.generated.ts'
import { createElement as h, useState } from 'react'
import {
  CAPABILITY_INPUTS,
  CAPABILITY_ROWS,
  CAPABILITY_SOURCE_COMMIT,
  CAPABILITY_TOTALS,
} from '../_data/capability.generated.ts'

const STATES = ['pass', 'present', 'stale', 'unrun', 'excepted'] as const
type State = typeof STATES[number]

/** What each state means, in the words the page needs a reader to hold. */
const STATE_MEANING: Record<State, string> = {
  pass: 'An artifact exists and something recorded it passing.',
  present: 'An artifact exists. Nothing here proves it ran green.',
  stale: 'An artifact exists and the component has changed since. Not a pass — a pass about different code.',
  unrun: 'No artifact. The state this page exists to keep visible.',
  excepted: 'The component provably cannot produce this row, and the reason is on the cell.',
}

const STATE_COLOR: Record<State, string> = {
  pass: 'var(--dz-success)',
  present: 'var(--dz-info)',
  stale: 'var(--dz-warning)',
  unrun: 'var(--dz-muted-foreground)',
  excepted: 'var(--dz-primary)',
}

const CSS = `
.dz-cap { margin: 16px 0; color: var(--dz-foreground); }
.dz-cap__inputs { border: 1px solid var(--dz-border); border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; background: var(--dz-muted); }
.dz-cap__inputs h4 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; }
.dz-cap__input { display: flex; gap: 8px; align-items: baseline; font-size: 13px; padding: 2px 0; }
.dz-cap__input code { font-size: 12px; }
.dz-cap__note { color: var(--dz-muted-foreground); }
.dz-cap__totals { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
.dz-cap__totals th, .dz-cap__totals td { padding: 8px 12px; border-bottom: 1px solid var(--dz-border); text-align: right; }
.dz-cap__totals th:first-child, .dz-cap__totals td:first-child { text-align: left; }
.dz-cap__controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; font-size: 13px; }
.dz-cap__controls select, .dz-cap__controls input { font: inherit; padding: 4px 8px; border: 1px solid var(--dz-border); border-radius: 6px; background: var(--dz-background); color: var(--dz-foreground); }
.dz-cap__row { border: 1px solid var(--dz-border); border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
.dz-cap__head { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; padding: 10px 14px; background: var(--dz-muted); }
.dz-cap__name { font-weight: 600; }
.dz-cap__meta { font-size: 12px; color: var(--dz-muted-foreground); }
.dz-cap__cells { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px; padding: 12px 14px; }
.dz-cap__cell { border-left: 3px solid var(--dz-border); padding: 4px 0 4px 10px; font-size: 12.5px; }
.dz-cap__kind { font-weight: 600; }
.dz-cap__state { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; margin-left: 6px; }
.dz-cap__origin { color: var(--dz-muted-foreground); }
.dz-cap__links { margin-top: 2px; word-break: break-all; }
.dz-cap__links code { font-size: 11px; color: var(--dz-muted-foreground); }
.dz-cap__empty { padding: 24px; text-align: center; color: var(--dz-muted-foreground); }
`

function cellView(cell: DocEvidenceCell) {
  const state = cell.state as State
  return h(
    'div',
    { key: cell.kind, className: 'dz-cap__cell', style: { borderLeftColor: STATE_COLOR[state] } },
    h(
      'div',
      null,
      h('span', { className: 'dz-cap__kind' }, cell.kind),
      h('span', { className: 'dz-cap__state', style: { color: STATE_COLOR[state] } }, state),
    ),
    h(
      'div',
      { className: 'dz-cap__origin' },
      cell.origin,
      cell.scope === 'corpus' ? ' · corpus-scope' : '',
    ),
    cell.note === undefined ? null : h('div', { className: 'dz-cap__note' }, cell.note),
    cell.artifacts === undefined || cell.artifacts.length === 0
      ? null
      : h(
          'div',
          { className: 'dz-cap__links' },
          cell.artifacts.map(a => h('code', { key: a }, `${a} `)),
        ),
  )
}

function rowView(row: DocCapabilityRow) {
  return h(
    'div',
    { key: row.component, className: 'dz-cap__row' },
    h(
      'div',
      { className: 'dz-cap__head' },
      h('span', { className: 'dz-cap__name' }, row.component),
      h(
        'span',
        { className: 'dz-cap__meta' },
        `Tier ${row.tier} · ${row.family} · APG ${row.pattern}`
        + `${row.boundary === 'none' ? '' : ` · boundary ${row.boundary}`}`
        + ` · anatomy ${row.anatomy}`
        // TASK-N1-O6. The fifth generated input, on the header line rather than
        // as a cell: visual regression is not something a tier makes a
        // component owe (see VisualEvidence in capability-matrix.ts), so it is
        // reported about the component, not counted among its obligations.
        + ` · visual ${row.visual.state}`,
      ),
    ),
    h('div', { className: 'dz-cap__cells' }, row.cells.map(cellView)),
  )
}

/** The matrix, with a tier filter, a state filter and a name search. */
export function CapabilityMatrix() {
  const [tier, setTier] = useState('all')
  const [state, setState] = useState('all')
  const [query, setQuery] = useState('')

  const rows = CAPABILITY_ROWS.filter((row) => {
    if (tier !== 'all' && row.tier !== tier)
      return false
    if (query !== '' && !row.component.toLowerCase().includes(query.toLowerCase()))
      return false
    if (state !== 'all' && !row.cells.some(c => c.state === state))
      return false
    return true
  }).map((row) => {
    // Filtering by state narrows the CELLS too, so "show me every unrun cell"
    // answers that question rather than showing whole components that happen to
    // contain one.
    if (state === 'all')
      return row
    return { ...row, cells: row.cells.filter(c => c.state === state) }
  })

  return h(
    'div',
    { className: 'dz-cap' },
    h('style', null, CSS),

    h(
      'div',
      { className: 'dz-cap__inputs' },
      h('h4', null, `Evidence inputs at ${CAPABILITY_SOURCE_COMMIT.slice(0, 8)}`),
      Object.entries(CAPABILITY_INPUTS).map(([name, input]) =>
        h(
          'div',
          { key: name, className: 'dz-cap__input' },
          h('span', { style: { color: input.available ? 'var(--dz-success)' : 'var(--dz-warning)' } }, input.available ? '●' : '○'),
          h('code', null, name),
          h('span', { className: 'dz-cap__note' }, input.note ?? input.path),
        ),
      ),
    ),

    h(
      'table',
      { className: 'dz-cap__totals' },
      h(
        'thead',
        null,
        h('tr', null, h('th', null, 'Tier'), ...STATES.map(s => h('th', { key: s }, s))),
      ),
      h(
        'tbody',
        null,
        (['A', 'B', 'C', 'D'] as const).map(t =>
          h(
            'tr',
            { key: t },
            h('td', null, t),
            ...STATES.map(s => h('td', { key: s }, String(CAPABILITY_TOTALS[t][s]))),
          ),
        ),
      ),
    ),

    h(
      'div',
      { className: 'dz-cap__controls' },
      h(
        'select',
        { value: tier, onChange: (e: { target: { value: string } }) => setTier(e.target.value) },
        h('option', { value: 'all' }, 'All tiers'),
        ...(['A', 'B', 'C', 'D'] as const).map(t => h('option', { key: t, value: t }, `Tier ${t}`)),
      ),
      h(
        'select',
        { value: state, onChange: (e: { target: { value: string } }) => setState(e.target.value) },
        h('option', { value: 'all' }, 'All states'),
        ...STATES.map(s => h('option', { key: s, value: s }, s)),
      ),
      h('input', {
        type: 'search',
        placeholder: 'Component…',
        value: query,
        onChange: (e: { target: { value: string } }) => setQuery(e.target.value),
      }),
      h('span', { className: 'dz-cap__note' }, `${rows.length} component(s)`),
    ),

    state === 'all'
      ? null
      : h('p', { className: 'dz-cap__note' }, STATE_MEANING[state as State]),

    rows.length === 0
      ? h('div', { className: 'dz-cap__empty' }, 'No component matches that filter.')
      : rows.map(rowView),
  )
}
