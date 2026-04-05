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
      '@dzip-ui/tokens': resolve(__dirname, '../tokens/src'),
      '@dzip-ui/contracts': resolve(__dirname, '../contracts/src'),
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
        '@dzip-ui/tokens',
        '@dzip-ui/contracts',
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
