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
    'apps/storybook/stories/_data/*.generated.ts',
    'apps/landing/public/r/**',
    'apps/landing/public/llms*.txt',
    'apps/landing/src/generated/**',
    'apps/*/dist/**',
    'apps/*/storybook-static/**',

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
  // DzPresence clones its slot's child vnode to stamp `data-state` onto it, which
  // requires a render function — `<script setup>` cannot express that.
  name: 'dzup/render-function-components',
  files: ['apps/landing/src/motion/components/DzPresence.vue'],
  rules: {
    'vue/component-api-style': 'off',
  },
})
