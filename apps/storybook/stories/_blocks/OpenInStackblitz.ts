/**
 * OpenInStackblitz — a docs button that forks a full, runnable dzup-ui project
 * on StackBlitz with a given example injected.
 *
 * ```mdx
 * import { OpenInStackblitz } from './_blocks/OpenInStackblitz.ts'
 *
 * <OpenInStackblitz />                       // default DzButton example
 * <OpenInStackblitz code={mySource} title="DzButton — sizes" />
 * ```
 *
 * The starter project lives in-repo at `apps/storybook/playground-template/`
 * (Vite + Vue 3 + Tailwind 4 + @dzup-ui/core) and is inlined here at build time
 * via `import.meta.glob('?raw')`, so the button always ships the current
 * template. We inject the example into `src/App.vue` and stamp the published
 * `@dzup-ui/*` version (playground.config.ts `DZUP_VERSION`) into the forked
 * project's package.json.
 *
 * The StackBlitz SDK is loaded on click (dynamic import) so it never weighs on
 * the docs bundle.
 */
import { createElement as h, useState } from 'react'
import { DEFAULT_REPL_CODE, DZUP_VERSION } from './playground.config.ts'

// Inline the in-repo starter template as { projectPath: contents }. Eager so it
// compiles into this (already lazy) chunk; keys are relative to this file.
const RAW_TEMPLATE = import.meta.glob('../../playground-template/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const TEMPLATE_MARKER = 'playground-template/'

/**
 * Build the StackBlitz project files from the in-repo template, injecting the
 *  example source and pinning the published dependency versions.
 */
function buildFiles(code: string): Record<string, string> {
  const files: Record<string, string> = {}
  for (const [path, contents] of Object.entries(RAW_TEMPLATE)) {
    const idx = path.indexOf(TEMPLATE_MARKER)
    if (idx === -1)
      continue
    const rel = path.slice(idx + TEMPLATE_MARKER.length)
    files[rel] = contents
  }

  // Inject the example.
  files['src/App.vue'] = code

  // Pin @dzup-ui/* to the current published version (single source of truth).
  if (files['package.json']) {
    try {
      const pkg = JSON.parse(files['package.json'])
      pkg.dependencies = pkg.dependencies ?? {}
      pkg.dependencies['@dzup-ui/core'] = DZUP_VERSION
      pkg.dependencies['@dzup-ui/tokens'] = DZUP_VERSION
      files['package.json'] = `${JSON.stringify(pkg, null, 2)}\n`
    }
    catch {
      // Leave the template's package.json untouched if it isn't parseable.
    }
  }

  return files
}

export interface OpenInStackblitzProps {
  /** SFC source to open as `src/App.vue`. Defaults to the DzButton example. */
  code?: string
  /** Project title shown in StackBlitz. */
  title?: string
}

export function OpenInStackblitz({ code, title }: OpenInStackblitzProps) {
  const [busy, setBusy] = useState(false)

  async function open() {
    if (busy)
      return
    setBusy(true)
    try {
      const sdk = (await import('@stackblitz/sdk')).default
      sdk.openProject(
        {
          title: title ?? 'dzup-ui playground',
          description: 'Live dzup-ui example — Vite + Vue 3 + @dzup-ui/core.',
          template: 'node',
          files: buildFiles(code ?? DEFAULT_REPL_CODE),
        },
        { openFile: 'src/App.vue', newWindow: true },
      )
    }
    finally {
      setBusy(false)
    }
  }

  return h(
    'button',
    {
      'type': 'button',
      'onClick': open,
      'disabled': busy,
      'aria-label': 'Open this example in StackBlitz (opens a new tab)',
      'style': {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        fontSize: 13,
        fontWeight: 600,
        cursor: busy ? 'progress' : 'pointer',
        color: 'var(--dz-foreground, #111827)',
        background: 'var(--dz-surface, #fff)',
        border: '1px solid var(--dz-border, #d1d5db)',
        borderRadius: 8,
        opacity: busy ? 0.7 : 1,
      },
    },
    [
      h(
        'svg',
        {
          'key': 'i',
          'width': 14,
          'height': 14,
          'viewBox': '0 0 28 28',
          'fill': 'currentColor',
          'aria-hidden': true,
        },
        h('path', { d: 'M12.747 16.273H4L18.573 1.4l-3.32 10.327H24L9.427 26.6l3.32-10.327z' }),
      ),
      h('span', { key: 't' }, busy ? 'Opening…' : 'Open in StackBlitz'),
    ],
  )
}
