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
      '@dzip-ui/tokens': resolve(__dirname, '../tokens/src'),
      '@dzip-ui/contracts': resolve(__dirname, '../contracts/src'),
      '@dzip-ui/core': resolve(__dirname, '../core/src'),
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
        '@dzip-ui/core',
        '@dzip-ui/tokens',
        '@dzip-ui/contracts',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
})
