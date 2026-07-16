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
  ],
})
