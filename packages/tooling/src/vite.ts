import type { UserConfig } from 'vite'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const DEFAULT_EXTERNALS = [
  'vue',
  'reka-ui',
  '@floating-ui/vue',
  'lucide-vue-next',
  '@internationalized/date',
  '@dzup-ui/tokens',
  '@dzup-ui/contracts',
  '@dzup-ui/core',
  'clsx',
  'tailwind-merge',
  'tailwind-variants',
]

export interface CreateLibConfigOptions {
  baseDir: string
  entry: Record<string, string> | string
  name?: string
  external?: string[]
  tsconfigPath?: string
  outDir?: string
  alias?: Record<string, string>
}

export function createLibConfig(options: CreateLibConfigOptions): UserConfig {
  const {
    baseDir,
    entry,
    external = [],
    tsconfigPath = 'tsconfig.json',
    outDir = 'dist',
    alias = {},
  } = options

  const resolvedEntry =
    typeof entry === 'string'
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
      },
      rollupOptions: {
        external: [...DEFAULT_EXTERNALS, ...external],
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
      },
    },
  })
}
