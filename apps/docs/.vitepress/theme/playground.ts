/**
 * playground.ts — the docs site's side of the sandbox contract (TASK-N2-D3).
 *
 * Everything load-bearing here is imported from
 * `@dzup-ui/tooling/playground`, which is the ONE statement of that contract.
 * This file only resolves URLs against VitePress's base and boots the REPL; it
 * decides nothing.
 *
 * `apps/storybook/stories/_blocks/playground.config.ts` is the other consumer
 * and is currently a parallel copy, held by `yarn validate:playground-parity`.
 * See owner decision **D3-D1** for why it was not re-pointed at the shared
 * module in this packet.
 */
import type { PlaygroundSeed, PlaygroundSeeds } from '@dzup-ui/tooling/playground'
import {
  PLAYGROUND_REPL_STYLESHEETS,
  playgroundImportMap,
  sandboxHeadHTML,
  THEME_RECIPE_MESSAGE,
} from '@dzup-ui/tooling/playground'
import { withBase } from 'vitepress'
// Vue is imported STATICALLY and by name, deliberately. `import('vue')` — the
// obvious thing to write beside the other two dynamic imports — is a NAMESPACE
// import, which defeats tree-shaking of the whole package; Rollup then had to
// keep all of Vue in VitePress's shared `framework` chunk, measured at
// **140,060 B against a 111,886 B baseline: +28,174 B on all 158 pages**.
// Vue is already in that chunk because VitePress needs it, so naming the three
// functions costs nothing and gives the tree-shaker its job back.
import { createApp, h, ref } from 'vue'

export type { PlaygroundSeed, PlaygroundSeeds }
export { THEME_RECIPE_MESSAGE }

/** Absolute URL of the served `playground/` directory, base-href aware. */
export function assetBase(): string {
  if (typeof window === 'undefined')
    return withBase('/playground/')
  return new URL(withBase('/playground/'), window.location.origin).href
}

let seedsPromise: Promise<PlaygroundSeeds> | null = null

/**
 * Fetch the generated seeds once per page load.
 *
 * Deliberately a fetch and not an import: a static import would put all 126 KB
 * of seeds into a page chunk, and 143 of every 144 of them would be for
 * components the reader is not looking at.
 */
export async function loadSeeds(): Promise<PlaygroundSeeds> {
  seedsPromise ??= fetch(`${assetBase()}seeds.json`).then(async (response) => {
    if (!response.ok)
      throw new Error(`playground seeds returned HTTP ${response.status}`)
    return response.json() as Promise<PlaygroundSeeds>
  })
  return seedsPromise
}

/**
 * `@vue/repl`'s two stylesheets, served as files rather than imported.
 *
 * **This is the difference between "lazy" and "lazy in the bytes".** VitePress
 * 1.6.4 builds with Vite's `cssCodeSplit` disabled, so *all* CSS reachable from
 * the module graph — including CSS behind a dynamic `import()` — is emitted into
 * the one shared `style.css` every page downloads. Writing the obvious
 * `await import('@vue/repl/style.css')` therefore grew the site's shared
 * stylesheet from 112,811 B to 131,233 B: **+18,422 B of code-editor CSS
 * charged to every reader of every page**, including the 150 pages that have no
 * editor on them.
 *
 * Copying the two files into `public/playground/repl/` and appending a `<link>`
 * at launch time takes that back to zero. Measured, not assumed — §7.
 */
/**
 * Imported, not restated. These two paths used to be written out here AND in
 * `scripts/sync-playground-assets.mjs`, and a seeded rename of one of them
 * passed `validate:playground-parity`, `playground:check`, `validate:docs-pages`
 * and the site build with every gate green while the editor rendered unstyled
 * (D3-F7). The copy step still restates them because it is a plain `.mjs` that
 * cannot import TypeScript — so the parity gate now reads that file for these
 * exact names.
 */
const REPL_STYLESHEETS = PLAYGROUND_REPL_STYLESHEETS

let stylesInjected = false

function ensureReplStylesheets(): void {
  if (stylesInjected || typeof document === 'undefined')
    return
  stylesInjected = true
  for (const href of REPL_STYLESHEETS) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `${assetBase()}${href}`
    link.dataset.dzPlayground = 'repl'
    document.head.appendChild(link)
  }
}

/** The resolved colour mode VitePress is currently showing. */
export function currentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined')
    return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export interface MountedRepl {
  unmount: () => void
  setTheme: (theme: 'light' | 'dark') => void
  /** The sandbox iframe, once the preview has created one. */
  frame: () => HTMLIFrameElement | null
}

export interface MountReplOptions {
  host: HTMLElement
  code: string
  theme: 'light' | 'dark'
  /** Install the ThemeRecipe listener in the sandbox head. Theme builder only. */
  acceptThemeRecipe?: boolean
  layout?: 'horizontal' | 'vertical'
  /** Hide the editor entirely — a live preview rather than a playground. */
  previewOnly?: boolean
}

/**
 * Boot a `@vue/repl` instance into `host`.
 *
 * Every import in this function is dynamic. That is what keeps the REPL out of
 * the shared bundle: nothing under `@vue/repl` is referenced statically
 * anywhere in `apps/docs`, so Rollup has no reason to place it in a chunk any
 * other page loads.
 */
export async function mountRepl(options: MountReplOptions): Promise<MountedRepl> {
  const { host, code, theme, acceptThemeRecipe = false, layout = 'horizontal', previewOnly = false } = options

  ensureReplStylesheets()
  const [replMod, editorMod] = await Promise.all([
    import('@vue/repl'),
    import('@vue/repl/codemirror-editor'),
  ])

  const { Repl, useStore, useVueImportMap, mergeImportMap } = replMod
  const CodemirrorEditor = (editorMod as { default: unknown }).default

  const { importMap: vueImportMap, productionMode } = useVueImportMap()
  productionMode.value = true
  const builtinImportMap = mergeImportMap(vueImportMap.value, {
    imports: playgroundImportMap(assetBase()),
  })

  const store = useStore({ builtinImportMap: ref(builtinImportMap) })
  await store.setFiles({ 'src/App.vue': code }, 'src/App.vue')

  const themeRef = ref(theme)
  const app = createApp({
    setup() {
      return () =>
        h(Repl, {
          store,
          editor: CodemirrorEditor,
          theme: themeRef.value,
          // Load-bearing, and the reason is recorded in the Storybook copy of
          // this call: `theme` alone themes the EDITOR chrome only. @vue/repl
          // gates the sandbox class write on `previewTheme`, which defaults to
          // false — without it the theme bridge in the sandbox head observes a
          // class nobody ever writes and the preview stays light forever.
          previewTheme: true,
          autoResize: true,
          clearConsole: false,
          showCompileOutput: false,
          showImportMap: false,
          layout,
          ...(previewOnly ? { layoutReverse: true } : {}),
          editorOptions: { autoSaveText: false as const },
          previewOptions: {
            headHTML: sandboxHeadHTML({ assetBase: assetBase(), theme: themeRef.value, acceptThemeRecipe }),
          },
        })
    },
  })
  app.mount(host)

  return {
    unmount: () => app.unmount(),
    setTheme: (next) => {
      themeRef.value = next
    },
    frame: () => host.querySelector('iframe'),
  }
}
