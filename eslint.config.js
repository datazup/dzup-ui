import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,

  stylistic: {
    quotes: 'single',
    semi: false,
  },

  rules: {
    // Enforce no `any` (ADR: zero any types)
    '@typescript-eslint/no-explicit-any': 'error',

    // Vue specific
    'vue/define-macros-order': ['error', {
      order: ['defineOptions', 'defineModel', 'defineProps', 'defineEmits', 'defineSlots'],
    }],
    'vue/block-order': ['error', {
      order: ['script', 'template', 'style'],
    }],
    'vue/component-api-style': ['error', ['script-setup']],

    // No console in production code
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },

  ignores: [
    'dist/**',
    'node_modules/**',
    'coverage/**',
    'storybook-static/**',
    'packages/tokens/dist/**',
    '*.d.ts',

    // Generated artifacts in apps/. These are build OUTPUT committed to the repo
    // (or produced into the source tree), not hand-written code — linting them is
    // both meaningless and ruinous: the Vite lib bundle at playground/dzup-core.mjs
    // alone accounts for ~99,600 of the ~105,600 problems `eslint apps/` reports,
    // which buries every real finding. Regenerate these, don't edit them.
    'apps/storybook/public/playground/**',
    // TASK-N2-D3: the same bundle, copied. `apps/docs/scripts/sync-playground-assets.mjs`
    // copies the producer's output into apps/docs/public/playground/, and without this
    // line `yarn lint` reports 98,922 errors from one 1.75 MB Vite lib bundle and the
    // aggregate gate is red for a file nobody wrote. Git-ignores are not eslint ignores
    // (flat config does not read .gitignore), which is why the copy needed its own entry.
    'apps/docs/public/playground/**',
    'apps/storybook/stories/_data/*.generated.ts',
    'apps/landing/public/r/**',
    'apps/landing/public/llms*.txt',
    'apps/landing/src/generated/**',
    'apps/*/dist/**',
    'apps/*/storybook-static/**',

    // TASK-N2-D1. The docs site's generated pages and its build output. The
    // pages are markdown written by `yarn generate:docs-pages` from
    // packages/core/docs/component-meta.json, and @antfu/eslint-config lints the
    // fenced ts/vue blocks inside markdown — which here are VERBATIM slices of
    // real Storybook stories. Linting them would report style findings against
    // code this file does not own and cannot fix, and an `--fix` would be
    // reverted by the next generate. Freshness is gated by
    // `yarn validate:docs-pages` instead. The hand-written guide/ pages and
    // components/_usage/ prose are NOT ignored.
    'apps/docs/components/*.md',
    'apps/docs/.vitepress/dist/**',
    'apps/docs/.vitepress/cache/**',
    'apps/docs/.vitepress/generated/**',

    // Nuxt consumer fixtures (TASK-OSS-P1-03): `package.json` is rendered from
    // `package.template.json` with absolute tarball paths, and `.tarballs/`
    // holds the packed artifacts. Both are build output for this machine.
    'packages/nuxt/test/.tarballs/**',
    'packages/nuxt/test/fixtures/*/package.json',
    'packages/nuxt/test/fixtures/*/package-lock.json',

    // Generated ownership table read by the auto-import resolver
    // (TASK-OSS-P1-02). Written by `yarn generate:ownership`, freshness-gated by
    // `yarn validate:ownership`; an eslint --fix here would be reverted by the
    // next generate and would fail the gate in between.
    'packages/core/src/generated/**',

    // Ownership-scanner fixtures (TASK-OSS-P0-01). These are deliberately
    // malformed inputs -- unsorted export clauses, a re-export of a module that
    // does not exist -- because that is what the scanner must survive. Linting
    // them into tidiness would delete the cases under test.
    'packages/tooling/src/ownership/__fixtures__/**',
  ],
}, {
  // Node CLI + build scripts: stdout is their user interface, not a debugging
  // leftover. `no-console` guards shipped component code; it does not apply here.
  name: 'dzup/cli-scripts',
  files: ['**/scripts/**'],
  rules: {
    'no-console': 'off',
  },
}, {
  // TASK-N2-D1. Fenced code blocks inside the docs site's hand-written guide
  // pages are INSTRUCTIONS, and in one of them the import order is the
  // instruction: `import '@dzup-ui/tokens/css'` must come before the app's own
  // imports, or the consumer gets a flash of unstyled content. `perfectionist/
  // sort-imports` would autofix that snippet into advice that is wrong, silently
  // — the same class as TASK-N2-A1's finding F8, where `regexp/use-ignore-case`
  // would have rewritten a published JSON Schema pattern. A lint rule may not
  // edit documentation into being incorrect, so it is off for these blocks only.
  name: 'dzup/docs-guide-snippets',
  files: ['apps/docs/guide/**/*.md/**'],
  rules: {
    'perfectionist/sort-imports': 'off',
  },
}, {
  // DzPresence clones its slot's child vnode to stamp `data-state` onto it, which
  // requires a render function — `<script setup>` cannot express that.
  name: 'dzup/render-function-components',
  files: ['apps/landing/src/motion/components/DzPresence.vue'],
  rules: {
    'vue/component-api-style': 'off',
  },
})
