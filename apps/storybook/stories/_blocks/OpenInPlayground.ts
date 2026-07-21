/**
 * OpenInPlayground — the per-component "Open in playground" affordance injected on
 * EVERY component autodocs page (TASK-FREE2-12).
 *
 * The live REPL and StackBlitz launcher already existed, but only on GettingStarted
 * and the family Overview MDX pages — one navigation hop away from the 139+ component
 * docs pages where "let me try this with my own props" actually fires. This block
 * closes that gap without touching a single component page by hand: `.storybook/
 * preview.ts` injects it into the autodocs template (after `<Primary/>`), and it looks
 * its snippet up by the page's component name from the generated
 * `_data/playgroundSnippets.generated.ts` map (built from each component's `@example`).
 *
 * Two surfaces, one seeded snippet:
 *   - "Try it live" reveals an inline, editable @vue/repl (DzRepl) — collapsed by
 *     default so booting @vue/repl costs nothing until a visitor asks. Mounting it
 *     eagerly on all 139 pages would be a real perf regression.
 *   - "Open in StackBlitz" forks the full runnable project (OpenInStackblitz).
 *
 * Renders nothing when the page's component has no snippet (e.g. the family Overview
 * pages, whose last title segment isn't a component) — never a broken or empty button.
 */
import { createElement as h, useState } from 'react'
import { PLAYGROUND_SNIPPETS } from '../_data/playgroundSnippets.generated.ts'
import { DzRepl } from './DzRepl.ts'
import { OpenInStackblitz } from './OpenInStackblitz.ts'

export interface OpenInPlaygroundProps {
  /** Component name — the last segment of the docs page's `Core/<Family>/<X>` title. */
  component?: string
}

export function OpenInPlayground({ component }: OpenInPlaygroundProps) {
  const [open, setOpen] = useState(false)

  const snippet = component ? PLAYGROUND_SNIPPETS[component] : undefined
  // No snippet → this isn't a component page (Overview/guide) — render nothing.
  if (!component || !snippet)
    return null

  // Honesty: a `fallback` whose code doesn't actually contain the component is a
  // family starter (a sibling), so say so rather than imply it's this component.
  const isFamilyStarter = snippet.source === 'fallback' && !snippet.code.includes(`<${component}`)

  return h(
    'div',
    {
      className: 'dz-open-in-playground sb-unstyled',
      style: {
        margin: '24px 0',
        padding: 16,
        border: '1px solid var(--dz-border, #e5e7eb)',
        borderRadius: 10,
        background: 'var(--dz-surface-sunken, #f9fafb)',
      },
    },
    [
      h(
        'div',
        {
          key: 'head',
          style: { display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
        },
        [
          h('strong', { key: 't', style: { fontSize: 15 } }, 'Try it in the playground'),
          h(
            'span',
            { key: 's', style: { fontSize: 12.5, color: 'var(--dz-muted-foreground, #6b7280)' } },
            isFamilyStarter
              ? `Live ${component} family starter — edit it or fork the full project.`
              : `Edit ${component} with your own props, or fork the full project.`,
          ),
        ],
      ),
      h(
        'div',
        { key: 'actions', style: { display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 0' } },
        [
          h(
            'button',
            {
              'key': 'toggle',
              'type': 'button',
              'onClick': () => setOpen(o => !o),
              'aria-expanded': open,
              'style': {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--dz-primary-foreground, #fff)',
                background: 'var(--dz-primary, #0766ee)',
                border: '1px solid transparent',
                borderRadius: 8,
              },
            },
            open ? 'Hide live editor' : 'Try it live',
          ),
          h(OpenInStackblitz, { key: 'sb', code: snippet.code, title: `dzup-ui — ${component}` }),
        ],
      ),
      open
        ? h(DzRepl, { key: 'repl', code: snippet.code, height: 460 })
        : null,
    ],
  )
}
