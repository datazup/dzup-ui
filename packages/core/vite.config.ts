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
      exclude: ['**/*.spec.ts', '**/*.test.ts', '**/*.stories.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@dzup-ui/tokens': resolve(__dirname, '../tokens/src'),
      '@dzup-ui/contracts': resolve(__dirname, '../contracts/src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        resolver: resolve(__dirname, 'src/resolver.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        'reka-ui',
        '@floating-ui/vue',
        'lucide-vue-next',
        '@internationalized/date',
        '@dzup-ui/tokens',
        '@dzup-ui/contracts',
        'clsx',
        'tailwind-merge',
        'tailwind-variants',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
})
