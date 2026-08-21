
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: { entry: 'C:/Users/Ekii/Desktop/datazup/internal-dev/ui/dzup-ui/.tree-shake-test/entry.ts', formats: ['es'] },
    outDir: 'C:/Users/Ekii/Desktop/datazup/internal-dev/ui/dzup-ui/.tree-shake-test/dist',
    rollupOptions: { external: ['vue', 'reka-ui', '@floating-ui/vue', '@internationalized/date', 'lucide-vue-next'] },
    minify: false,
  },
  resolve: {
    alias: {
      '@dzup-ui/core': 'C:/Users/Ekii/Desktop/datazup/internal-dev/ui/dzup-ui/packages/core/src/index.ts',
      '@dzup-ui/contracts': 'C:/Users/Ekii/Desktop/datazup/internal-dev/ui/dzup-ui/packages/contracts/src/index.ts',
      '@dzup-ui/tokens': 'C:/Users/Ekii/Desktop/datazup/internal-dev/ui/dzup-ui/packages/tokens/src/index.ts',
    }
  }
})
