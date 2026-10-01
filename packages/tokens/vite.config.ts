import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    // Per-file declarations. `rollupTypes` with more than one library entry
    // wrote the last entry's rollup over `dist/index.d.ts`, dropping every
    // root export from the published types (CT-KITS-R1 amendment A1, D1).
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/generate.ts', 'src/generate-dtcg.ts', 'src/**/*.spec.ts'],
    }),
  ],
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'utils/index': resolve(__dirname, 'src/utils/index.ts'),
        'utils/theme-script': resolve(__dirname, 'src/utils/theme-script.ts'),
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
