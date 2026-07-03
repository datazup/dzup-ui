/**
 * DzRepl — an embedded, editable @vue/repl playground for MDX docs pages.
 *
 * Storybook docs render in React, but @vue/repl is a Vue component, so this
 * block is a thin React wrapper that mounts a tiny Vue app (hosting <Repl>) into
 * a DOM node once it's on screen. Usage in any `.mdx`:
 *
 * ```mdx
 * import { DzRepl } from './_blocks/DzRepl.ts'
 *
 * <DzRepl />                       // seeded DzButton example
 * <DzRepl code={`<template>…</template>`} height={520} />
 * ```
 *
 * Design notes:
 * - Everything (@vue/repl, its CodeMirror editor, its CSS, Vue) is loaded via
 *   dynamic import() *inside* the mount effect, so it becomes its own lazy chunk
 *   and never weighs on the docs bundle until a visitor opens the page.
 * - `@dzup-ui/core` resolves inside the sandbox via an import map pointing at the
 *   self-contained bundle from scripts/build-playground.mjs (see
 *   playground.config.ts); Vue stays a shared singleton via the REPL's built-in
 *   map.
 * - Theme: we read Storybook's `data-theme` and re-render on toolbar changes;
 *   the sandbox mirrors it live without reloading (playground.config.ts), so a
 *   visitor's edits survive a theme toggle.
 * - prefers-reduced-motion: the sandbox already ships dzup's reduced-motion
 *   guards; here we also strip editor transitions.
 */
import { createElement as h, useEffect, useRef, useState } from 'react'
import {
  currentStorybookTheme,
  DEFAULT_REPL_CODE,
  dzupImportMap,
  prefersReducedMotion,
  replSandboxHeadHTML,
} from './playground.config.ts'

export interface DzReplProps {
  /** Seed SFC source. Defaults to a small editable DzButton example. */
  code?: string
  /** Editor+preview height in px. */
  height?: number
  /** Optional caption shown above the editor. */
  title?: string
}

// One-time reduced-motion stylesheet for the editor chrome (the sandbox has its
// own guards). Injected lazily so it costs nothing until a REPL renders.
let reducedMotionStyleInjected = false
function ensureReducedMotionStyle() {
  if (reducedMotionStyleInjected || typeof document === 'undefined')
    return
  reducedMotionStyleInjected = true
  const style = document.createElement('style')
  style.dataset.dzRepl = 'reduced-motion'
  style.textContent
    = '@media (prefers-reduced-motion: reduce){.dz-repl .vue-repl *{transition:none!important;animation:none!important;scroll-behavior:auto!important}}'
  document.head.appendChild(style)
}

export function DzRepl({ code, height = 460, title }: DzReplProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let disposed = false
    let unmount: (() => void) | null = null
    let observer: MutationObserver | null = null
    ensureReducedMotionStyle()

    async function boot() {
      try {
        // Lazy chunks — none of this is in the docs bundle until now.
        const [replMod, editorMod, vueMod] = await Promise.all([
          import('@vue/repl'),
          import('@vue/repl/codemirror-editor'),
          import('vue'),
        ])
        await import('@vue/repl/style.css')
        if (disposed || !hostRef.current)
          return

        const { Repl, useStore, useVueImportMap, mergeImportMap } = replMod
        const CodemirrorEditor = (editorMod as { default: unknown }).default
        const { createApp, h: vh, ref } = vueMod

        // Vue from the REPL's built-in CDN map; merge our local core bundle on
        // top so `import … from '@dzup-ui/core'` resolves in the sandbox.
        const { importMap: vueImportMap, productionMode } = useVueImportMap()
        productionMode.value = true
        const builtinImportMap = mergeImportMap(vueImportMap.value, { imports: dzupImportMap() })

        const store = useStore({ builtinImportMap: ref(builtinImportMap) })
        await store.setFiles({ 'src/App.vue': code ?? DEFAULT_REPL_CODE }, 'src/App.vue')
        if (disposed || !hostRef.current)
          return

        const themeRef = ref(currentStorybookTheme())
        const reduce = prefersReducedMotion()

        const app = createApp({
          setup() {
            return () =>
              vh(Repl, {
                store,
                editor: CodemirrorEditor,
                theme: themeRef.value,
                autoResize: true,
                clearConsole: false,
                showCompileOutput: false,
                showImportMap: false,
                layout: 'horizontal',
                editorOptions: { autoSaveText: false as const },
                previewOptions: { headHTML: replSandboxHeadHTML(themeRef.value) },
              })
          },
        })
        app.mount(hostRef.current)
        unmount = () => app.unmount()

        // Re-theme on Storybook toolbar changes. Updating the ref re-renders the
        // Repl (new `theme` prop) which the sandbox mirrors live — no reload,
        // edits preserved. Respect reduced motion by skipping nothing here (the
        // change is instant either way).
        void reduce
        observer = new MutationObserver(() => {
          const next = currentStorybookTheme()
          if (next !== themeRef.value)
            themeRef.value = next
        })
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        })

        if (!disposed)
          setStatus('ready')
      }
      catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : String(err))
          setStatus('error')
        }
      }
    }

    void boot()
    return () => {
      disposed = true
      observer?.disconnect()
      unmount?.()
    }
  }, [code])

  return h(
    'div',
    {
      className: 'dz-repl',
      style: {
        margin: '20px 0',
        border: '1px solid var(--dz-border, #e5e7eb)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: 'var(--dz-shadow-xs, 0 1px 2px rgba(0,0,0,0.05))',
      },
    },
    [
      title
        ? h(
          'div',
          {
            key: 'cap',
            style: {
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 600,
              borderBottom: '1px solid var(--dz-border, #e5e7eb)',
            },
          },
          title,
        )
        : null,
      h(
        'div',
        { key: 'host', style: { position: 'relative', height } },
        [
          status !== 'ready'
            ? h(
              'div',
              {
                key: 'ovl',
                style: {
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  color: status === 'error' ? '#b91c1c' : 'var(--dz-muted-foreground, #6b7280)',
                  padding: 16,
                  textAlign: 'center',
                },
              },
              status === 'error'
                ? `Couldn't load the playground: ${error}`
                : 'Loading live playground…',
            )
            : null,
          h('div', { key: 'mount', ref: hostRef, style: { height: '100%' } }),
        ],
      ),
    ],
  )
}
