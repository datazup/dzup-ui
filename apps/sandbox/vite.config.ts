import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  resolve: {
    alias: [
      // Token sub-path exports must come before the base alias
      { find: '@dzup-ui/tokens/css', replacement: resolve(__dirname, '../../packages/tokens/dist/tokens.css') },
      { find: '@dzup-ui/tokens/tailwind', replacement: resolve(__dirname, '../../packages/tokens/dist/tailwind-theme.js') },
      { find: '@dzup-ui/tokens/utils', replacement: resolve(__dirname, '../../packages/tokens/src/utils/index.ts') },
      { find: '@dzup-ui/tokens', replacement: resolve(__dirname, '../../packages/tokens/src') },
      // Other workspace packages
      { find: '@dzup-ui/core/styles', replacement: resolve(__dirname, '../../packages/core/src/styles/base.css') },
      { find: '@dzup-ui/contracts', replacement: resolve(__dirname, '../../packages/contracts/src/index.ts') },
      { find: '@dzup-ui/core', replacement: resolve(__dirname, '../../packages/core/src') },
      { find: '@dzup-ui/pro', replacement: resolve(__dirname, '../../packages/pro/src') },
    ],
  },
  server: {
    port: 3000,
    open: true,
  },
})
