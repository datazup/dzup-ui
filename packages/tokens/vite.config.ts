import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/generate.ts'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'utils/index': resolve(__dirname, 'src/utils/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      // Token constants are self-contained — no external runtime deps
      external: [],
    },
    outDir: 'dist',
    // preserve tokens.css and tailwind-theme.{js,d.ts} produced by generate.ts
    emptyOutDir: false,
  },
})
