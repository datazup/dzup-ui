import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineMain } from '@storybook/vue3-vite/node'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineMain({
  addons: [],
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

    // Workspace package aliases — Storybook doesn't auto-resolve yarn workspace links
    const pkgRoot = resolve(__dirname, '../../..')
    config.resolve = config.resolve || {}
    config.resolve.alias = [
      ...(Array.isArray(config.resolve.alias) ? config.resolve.alias : []),
      // Token sub-path exports must come before the base alias
      { find: '@dzip-ui/tokens/css', replacement: resolve(pkgRoot, 'packages/tokens/dist/tokens.css') },
      { find: '@dzip-ui/tokens/tailwind', replacement: resolve(pkgRoot, 'packages/tokens/dist/tailwind-theme.js') },
      { find: '@dzip-ui/tokens/utils', replacement: resolve(pkgRoot, 'packages/tokens/src/utils/index.ts') },
      { find: '@dzip-ui/tokens', replacement: resolve(pkgRoot, 'packages/tokens/src') },
      { find: '@dzip-ui/contracts', replacement: resolve(pkgRoot, 'packages/contracts/src/index.ts') },
      { find: '@dzip-ui/core', replacement: resolve(pkgRoot, 'packages/core/src') },
    ]

    return config
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
  },
})
