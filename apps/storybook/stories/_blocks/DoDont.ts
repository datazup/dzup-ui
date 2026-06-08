/**
 * Reusable MDX doc-block: a side-by-side Do / Don't callout (TASK-0.14).
 *
 * Authored with `createElement` (no JSX) so it compiles without a React-JSX
 * transform in the Storybook Vite pipeline. Import into any family `.mdx`:
 *
 * ```mdx
 * import { DoDont, Do, Dont } from '../_blocks/DoDont.ts'
 *
 * <DoDont>
 *   <Do>Use `tone="danger"` for destructive actions.</Do>
 *   <Dont>Use red text alone to signal errors — pair it with an icon/label.</Dont>
 * </DoDont>
 * ```
 */
import { createElement as h } from 'react'

const cardBase = {
  flex: 1,
  minWidth: 220,
  borderRadius: 8,
  padding: '12px 14px',
  fontSize: 14,
  lineHeight: 1.5,
}

export function Do({ children }: { children?: unknown }) {
  return h('div', { style: { ...cardBase, border: '1px solid #15803d', background: 'rgba(21,128,61,0.06)' } }, [
    h('strong', { key: 't', style: { color: '#15803d', display: 'block', marginBottom: 4 } }, '✓ Do'),
    h('div', { key: 'c' }, children as never),
  ])
}

export function Dont({ children }: { children?: unknown }) {
  return h('div', { style: { ...cardBase, border: '1px solid #b91c1c', background: 'rgba(185,28,28,0.06)' } }, [
    h('strong', { key: 't', style: { color: '#b91c1c', display: 'block', marginBottom: 4 } }, '✕ Don’t'),
    h('div', { key: 'c' }, children as never),
  ])
}

export function DoDont({ children }: { children?: unknown }) {
  return h('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' } }, children as never)
}
