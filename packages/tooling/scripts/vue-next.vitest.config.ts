import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { mergeConfig } from 'vitest/config'
import root from '../../../vitest.config.ts'

/**
 * Vue's own single-file build that contains BOTH runtimes.
 *
 * `vue.runtime-with-vapor.esm-browser.js` has no external imports at all: the
 * vDOM runtime and the Vapor runtime are in one module, so the process holds
 * exactly one Vue. Aliasing to it is the only arrangement in which the
 * interop plugin is being asked the question a real Vapor app asks it —
 * everything else puts two Vue builds in one process and measures the seam
 * between them.
 *
 * Resolved rather than hard-coded so the config is inert on a checkout where
 * the file does not exist (every Vue before 3.6). `undefined` means "add no
 * alias", and the smoke then reports honestly instead of failing to resolve.
 */
const VAPOR_BUNDLE = join(
  process.cwd(),
  'node_modules/vue/dist/vue.runtime-with-vapor.esm-browser.js',
)
const vaporBundleExists = existsSync(VAPOR_BUNDLE)

/**
 * The Vue forward-compatibility lane's Vitest config (TASK-N5-03).
 *
 * **It exists for exactly one reason, and it is a packaging fact about Vue 3.6,
 * not a preference.** `vue`'s CJS build carries no Vapor runtime:
 * `vue/package.json` routes the `node` import condition to `index.js` →
 * `dist/vue.cjs.js`, and only `dist/vue.runtime.esm-bundler.js` does
 * `export * from "@vue/runtime-vapor"`. Node's own loader — which is what
 * Vitest uses for anything it treats as an external dependency — therefore
 * hands the suite a `vue` with no `createVaporApp` on it at all:
 *
 *     node -e "const m = await import('vue'); console.log('createVaporApp' in m)"
 *     false        # vue@3.6.0-rc.6
 *
 * Reaching past that to `@vue/runtime-vapor` directly gets the exports but not
 * a working runtime: the vapor **esm-bundler** build imports `initFeatureFlags`
 * from `@vue/runtime-dom`, a symbol only the esm-bundler build of runtime-dom
 * defines, so a vapor app built on the CJS runtime-dom dies in `prepareApp`
 * with `(0 , initFeatureFlags) is not a function`. Two Vue builds in one
 * process is not a state anybody ships, and a red run in it is not evidence
 * about Vapor.
 *
 * `server.deps.inline` makes Vite process the Vue packages itself, so every
 * one of them resolves through the bundler conditions and the process holds
 * **one** Vue build — the one a real Vapor application, bundled by Vite, would
 * have.
 *
 * **This is deliberately NOT in the root `vitest.config.ts`.** Inlining Vue for
 * all 499 default-lane test files would change how every one of them resolves
 * its runtime, to fix a problem the default lane does not have. The default
 * toolchain stays exactly as it was; this config is loaded only by
 * `vue-next-lane.mjs`.
 */
export default mergeConfig(root, {
  // The conditions a bundler uses. `@vue/runtime-dom`'s esm-bundler build does
  // `export * from "@vue/runtime-core"`, and runtime-core's esm-bundler build
  // is the only one that defines `initFeatureFlags` — so under bundler
  // conditions the symbol runtime-vapor imports exists, and under Node's
  // `node` condition (which selects the CJS builds) it does not.
  resolve: {
    conditions: ['module', 'browser', 'development', 'import', 'default'],
    alias: vaporBundleExists ? { vue: VAPOR_BUNDLE } : {},
  },
  ssr: {
    resolve: {
      conditions: ['module', 'browser', 'development', 'import', 'default'],
      externalConditions: ['module', 'browser', 'development', 'import', 'default'],
    },
  },
  test: {
    server: {
      deps: {
        // Vue's own packages only. Widening this to everything would inline
        // reka-ui, jsdom and the rest, which is a different experiment.
        inline: [/^vue$/, /^@vue\//],
      },
    },
  },
})
