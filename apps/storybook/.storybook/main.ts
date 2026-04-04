import type { StorybookConfig } from '@storybook/vue3-vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

const config: StorybookConfig = {
  stories: [
    // Standalone stories directories
    '../../../packages/core/stories/**/*.stories.ts',
    '../../../packages/pro/stories/**/*.stories.ts',
    // Local app stories (intro, etc.)
    '../stories/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal(config) {
    // Tailwind CSS 4 — required for utility classes in component variants
    config.plugins = config.plugins || []
    config.plugins.push(tailwindcss())

    const optionalPeerDeps = ['chart.js', 'monaco-editor', '@tiptap/vue-3', '@tiptap/starter-kit']

    // Workspace package aliases — Storybook doesn't auto-resolve yarn workspace links
    const pkgRoot = resolve(__dirname, '../../..')
    config.resolve = config.resolve || {}
    config.resolve.alias = [
      ...(Array.isArray(config.resolve.alias) ? config.resolve.alias : []),
      // Token sub-path exports must come before the base alias
      { find: '@dzup-ui/tokens/css', replacement: resolve(pkgRoot, 'packages/tokens/dist/tokens.css') },
      { find: '@dzup-ui/tokens/tailwind', replacement: resolve(pkgRoot, 'packages/tokens/dist/tailwind-theme.js') },
      { find: '@dzup-ui/tokens/utils', replacement: resolve(pkgRoot, 'packages/tokens/src/utils/index.ts') },
      { find: '@dzup-ui/tokens', replacement: resolve(pkgRoot, 'packages/tokens/src') },
      { find: '@dzup-ui/contracts', replacement: resolve(pkgRoot, 'packages/contracts/src/index.ts') },
      { find: '@dzup-ui/core', replacement: resolve(pkgRoot, 'packages/core/src') },
      { find: '@dzup-ui/pro', replacement: resolve(pkgRoot, 'packages/pro/src') },
    ]

    // Exclude from Vite dev server pre-bundling so dynamic import() failures
    // are handled gracefully at runtime (components have built-in fallback UIs)
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude || []),
      ...optionalPeerDeps,
    ]

    // Mark as external for production build
    config.build = config.build || {}
    config.build.rollupOptions = config.build.rollupOptions || {}
    const external = config.build.rollupOptions.external || []
    config.build.rollupOptions.external = [
      ...(Array.isArray(external) ? external : [external]),
      ...optionalPeerDeps,
    ]
    return config
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
  },
}

export default config
