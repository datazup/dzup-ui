import type { UserConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { createLibConfig } from '../tooling/src/vite.ts'

/**
 * Every family barrel is its OWN entry, one per `./buttons`, `./cards`, … subpath
 * export in package.json.
 *
 * This is load-bearing, not tidiness. A family barrel is a pure re-export file, so
 * under `preserveModules` Rollup inlines it into whatever imports it and emits no
 * chunk for it at all: before this, `dist/components/buttons/index.d.ts` existed
 * (vite-plugin-dts walks types, not the module graph) while
 * `dist/components/buttons/index.js` did not — so all 11 family subpaths, plus
 * `./providers`, resolved to nothing. Declaring them as entries forces a chunk.
 *
 * `yarn validate:exports` now asserts this after every build.
 */
const COMPONENT_FAMILIES = [
  'buttons',
  'cards',
  'data',
  'feedback',
  'forms',
  'inputs',
  'layout',
  'media',
  'navigation',
  'overlays',
  'typography',
] as const

const familyEntries = Object.fromEntries(
  COMPONENT_FAMILIES.map((family) => [
    `components/${family}/index`,
    `src/components/${family}/index.ts`,
  ]),
)

// createLibConfig returns a Vite UserConfig; widen to the Vitest UserConfig so
// the `test` field is typed. The shared createLibConfig shape is preserved.
const config = createLibConfig({
  baseDir: __dirname,
  entry: {
    index: 'src/index.ts',
    resolver: 'src/resolver.ts',
    'providers/index': 'src/providers/index.ts',
    ...familyEntries,
  },
  // `src/index.ts` side-effect-imports `./styles/base.css`; this pins the extracted
  // asset to `dist/core.css`, the target of the `./styles` export. Default: style.css.
  cssFileName: 'core',
  alias: {
    '@dzup-ui/tokens': resolve(__dirname, '../tokens/src'),
    '@dzup-ui/contracts': resolve(__dirname, '../contracts/src'),
  },
}) as UserConfig

config.test = {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./vitest.setup.ts'],
}

export default config
