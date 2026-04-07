import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      outDir: 'dist',
      entryRoot: 'src',
      cleanVueFileName: true,
      skipDiagnostics: true,
      exclude: ['**/*.spec.ts', '**/*.test.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@dzup-ui/tokens': resolve(__dirname, '../tokens/src'),
      '@dzup-ui/contracts': resolve(__dirname, '../contracts/src'),
      '@dzup-ui/core': resolve(__dirname, '../core/src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@dzup-ui/core',
        '@dzup-ui/tokens',
        '@dzup-ui/contracts',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
})
