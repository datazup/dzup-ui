import { resolve } from 'node:path'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { resolveRemoteDevelopmentServer } from '../../packages/tooling/src/remote-development-server.ts'
import { createDzupResolution } from '../../packages/tooling/src/resolution/dzup-resolution.ts'

// The sandbox exists to exercise the working tree, so: source. Its previous
// hand-rolled map had seven entries and was missing `@dzup-ui/core/ownership`
// and both `@dzup-ui/testing` specifiers.
const dzup = createDzupResolution({
  mode: 'merged-source',
  root: resolve(__dirname, '../..'),
})

export default defineConfig(() => {
  const remoteDevelopment = resolveRemoteDevelopmentServer(
    process.env,
    'dzup-ui-sandbox.dev.dziphost.com',
  )

  return {
    plugins: [tailwindcss(), vue()],
    resolve: {
      alias: dzup.alias,
      dedupe: dzup.dedupe,
    },
    optimizeDeps: dzup.optimizeDeps,
    server: {
      port: 3000,
      open: !remoteDevelopment.enabled,
      ...remoteDevelopment.server,
    },
  }
})
