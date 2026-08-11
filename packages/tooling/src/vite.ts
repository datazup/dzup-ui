import type { UserConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * Every runtime dependency the package DECLARES — `dependencies` +
 * `peerDependencies` read from its own package.json — is externalized.
 *
 * This is derived, never hand-maintained. It used to be a literal list here, and
 * it drifted: `qrcode-generator` was added to `@dzup-ui/core`'s dependencies but
 * not to the list, so Rollup bundled it, and under `preserveModules` that emitted
 * `import E from "../../node_modules/qrcode-generator/dist/qrcode.js"` into
 * `dist/components/media/DzQRCode.vue.js`. That path exists in the repo but NOT in
 * the published tarball (`files: [dist]`), so importing the package barrel died
 * with ERR_MODULE_NOT_FOUND for every consumer.
 *
 * Deriving from package.json makes the build and the manifest impossible to
 * disagree: a dependency is externalized because it is declared, and
 * `yarn validate:externals` fails the build if dist imports anything that isn't.
 */
function declaredRuntimeDeps(baseDir: string): string[] {
  const pkg = JSON.parse(readFileSync(resolve(baseDir, 'package.json'), 'utf-8')) as {
    dependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
  }
  return [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ]
}

/**
 * Matches a bare specifier against a package name, subpaths included — `vue`
 * externalizes `vue`, and `@internationalized/date` also externalizes
 * `@internationalized/date/utils`. A plain array `external` would miss the
 * subpath and silently inline it.
 */
function makeIsExternal(names: string[]): (id: string) => boolean {
  const set = new Set(names)
  return (id: string): boolean => {
    if (id.startsWith('node:'))
      return true
    if (set.has(id))
      return true
    const scoped = id.startsWith('@')
    const parts = id.split('/')
    const root = scoped ? parts.slice(0, 2).join('/') : parts[0]
    return root !== undefined && set.has(root)
  }
}

export interface CreateLibConfigOptions {
  baseDir: string
  entry: Record<string, string> | string
  name?: string
  /**
   * EXTRA externals beyond the package's declared `dependencies` +
   * `peerDependencies`, which are externalized automatically. Reach for this only
   * when a specifier is genuinely not a declared dependency (a bundler virtual
   * module, say) — an ordinary runtime import belongs in package.json, where the
   * consumer's installer can actually see it.
   */
  external?: string[]
  tsconfigPath?: string
  outDir?: string
  alias?: Record<string, string>
  /**
   * Base name for the single extracted CSS asset (no extension), e.g. `'core'`
   * emits `dist/core.css`. Lib mode keeps `cssCodeSplit` off, so every stylesheet
   * reachable from any entry — the base layer, any future SFC <style> — is
   * concatenated into this one file. Without it Vite names the asset `style.css`,
   * which no `exports` target points at.
   */
  cssFileName?: string
}

export function createLibConfig(options: CreateLibConfigOptions): UserConfig {
  const {
    baseDir,
    entry,
    external = [],
    tsconfigPath = 'tsconfig.json',
    outDir = 'dist',
    alias = {},
    cssFileName,
  } = options

  const resolvedEntry
    = typeof entry === 'string'
      ? { index: resolve(baseDir, entry) }
      : Object.fromEntries(Object.entries(entry).map(([k, v]) => [k, resolve(baseDir, v)]))

  return defineConfig({
    plugins: [
      vue(),
      dts({
        tsconfigPath: resolve(baseDir, tsconfigPath),
        outDir,
        entryRoot: 'src',
        // cleanVueFileName strips the trailing `.vue` from both the emitted
        // declaration filename AND the barrel re-export module specifier
        // (e.g. `export { default as DzCard } from './DzCard'`). TypeScript's
        // declaration-file resolution cannot follow that bare specifier back
        // to `DzCard.d.ts`, producing TS2305 "has no exported member" in
        // consumers. Leaving this false keeps the `.vue` suffix on both the
        // emitted file (`DzCard.vue.d.ts`) and the specifier
        // (`from './DzCard.vue'`), which TS resolves correctly — the same
        // way `from './DzCard.types.ts'` already resolves to
        // `DzCard.types.d.ts` for type-only re-exports.
        cleanVueFileName: false,
        exclude: ['**/*.spec.ts', '**/*.test.ts', '**/*.stories.ts'],
      }),
    ],
    resolve: {
      alias,
    },
    build: {
      outDir,
      lib: {
        entry: resolvedEntry,
        formats: ['es'],
        ...(cssFileName === undefined ? {} : { cssFileName }),
      },
      rollupOptions: {
        external: makeIsExternal([...declaredRuntimeDeps(baseDir), ...external]),
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
      },
    },
  })
}
