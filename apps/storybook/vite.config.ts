import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: [
      // Token sub-path exports must come before the base alias
      { find: '@dzup-ui/tokens/css', replacement: resolve(__dirname, '../../packages/tokens/dist/tokens.css') },
      { find: '@dzup-ui/tokens/tailwind', replacement: resolve(__dirname, '../../packages/tokens/dist/tailwind-theme.js') },
      { find: '@dzup-ui/tokens/utils', replacement: resolve(__dirname, '../../packages/tokens/src/utils/index.ts') },
      { find: '@dzup-ui/tokens', replacement: resolve(__dirname, '../../packages/tokens/src') },
      // Other workspace packages
      { find: '@dzup-ui/contracts', replacement: resolve(__dirname, '../../packages/contracts/src/index.ts') },
      { find: '@dzup-ui/core', replacement: resolve(__dirname, '../../packages/core/src') },
      { find: '@dzup-ui/pro', replacement: resolve(__dirname, '../../packages/pro/src') },
    ],
  },
  optimizeDeps: {
    // Optional peer dependencies — exclude from pre-bundling so dynamic import() failures
    // are handled gracefully at runtime (components have built-in fallback UIs)
    exclude: ['chart.js', 'monaco-editor', '@tiptap/vue-3', '@tiptap/starter-kit'],
  },
})
