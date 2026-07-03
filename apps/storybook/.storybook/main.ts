import tailwindcss from '@tailwindcss/vite'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineMain } from '@storybook/vue3-vite/node'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const require = createRequire(import.meta.url)

export default defineMain({
  // Keep this list in sync with the `addons` registered in preview.ts (TASK-0.1).
  // Docs is the only addon that must be listed here for its manager UI; a11y and
  // themes register their preview behavior in preview.ts, but listing them here
  // guarantees the A11y panel and Theme toolbar mount on a fresh `storybook dev`.
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
    // Design panel — reads `parameters.design = { type: 'figma', url }` (TASK-0.15).
    // The convention was reserved in storybook-decisions.md; this is the one-line
    // switch-on. Stories without the parameter show a friendly empty Design panel.
    '@storybook/addon-designs',
  ],
  stories: [
    // Standalone stories directories
    '../../../packages/core/stories/**/*.stories.ts',
    // Local app stories (intro, etc.)
    '../stories/**/*.mdx',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal(config) {
    // Tailwind CSS 4 — required for utility classes in component variants
    config.plugins = config.plugins || []
    config.plugins.push(tailwindcss())

    // @vue/repl (the "Try it now" doc block) imports `vue/compiler-sfc`. Two
    // problems bundling that for the browser, both fixed by a pre-enforced
    // resolveId that runs before alias resolution:
    //
    // 1. The Vue plugin's broad `vue` → `vue/dist/vue.esm-bundler.js` alias runs
    //    after this hook and would rewrite the specifier to the non-existent
    //    `…/vue.esm-bundler.js/compiler-sfc`.
    // 2. Node's default resolution picks compiler-sfc's CJS build, which bundles
    //    @vue/consolidate and its dozens of OPTIONAL, node-only template-engine
    //    requires (pug, velocityjs, teacup/lib/express, …) — unresolvable in the
    //    browser. We pin to the `esm-browser` build instead (the one
    //    play.vuejs.org uses): it drops consolidate entirely.
    const compilerSfcBrowser = require
      .resolve('@vue/compiler-sfc')
      .replace(/compiler-sfc\.cjs\.js$/, 'compiler-sfc.esm-browser.js')
    config.plugins.push({
      name: 'dzup-repl-compiler-sfc',
      enforce: 'pre',
      resolveId(id: string) {
        if (id === 'vue/compiler-sfc' || id.endsWith('vue.esm-bundler.js/compiler-sfc'))
          return compilerSfcBrowser
        return null
      },
    })

    // Workspace package aliases — Storybook doesn't auto-resolve yarn workspace links
    const pkgRoot = resolve(__dirname, '../../..')
    config.resolve = config.resolve || {}
    config.resolve.alias = [
      ...(Array.isArray(config.resolve.alias) ? config.resolve.alias : []),
      // Token sub-path exports must come before the base alias
      {
        find: '@dzup-ui/tokens/css',
        replacement: resolve(pkgRoot, 'packages/tokens/dist/tokens.css'),
      },
      {
        find: '@dzup-ui/tokens/tailwind',
        replacement: resolve(pkgRoot, 'packages/tokens/dist/tailwind-theme.js'),
      },
      {
        find: '@dzup-ui/tokens/utils',
        replacement: resolve(pkgRoot, 'packages/tokens/src/utils/index.ts'),
      },
      { find: '@dzup-ui/tokens', replacement: resolve(pkgRoot, 'packages/tokens/src') },
      {
        find: '@dzup-ui/contracts',
        replacement: resolve(pkgRoot, 'packages/contracts/src/index.ts'),
      },
      { find: '@dzup-ui/core', replacement: resolve(pkgRoot, 'packages/core/src') },
    ]

    return config
  },
  // Brand favicon (apps/storybook/public/favicon.svg — served at the manager
  // root by Vite's publicDir). Injected explicitly so the dzup-ui mark replaces
  // Storybook's default favicon on a fresh `dev` and in the built static app.
  managerHead: (head) =>
    `${head}\n<link rel="icon" type="image/svg+xml" href="./favicon.svg" />`,
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
  },
})
