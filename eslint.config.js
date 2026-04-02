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

    // Import sorting handled by perfectionist/sort-imports (built into @antfu/eslint-config)

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
  ],
})
