import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// dzup-ui components render Tailwind utility classes at runtime, so a consuming
// app processes Tailwind and scans the library for those classes (see
// src/style.css `@source`). This mirrors the library's own Storybook setup.
export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
