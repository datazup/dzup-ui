import { resolve } from 'node:path'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { resolveRemoteDevelopmentServer } from '../../packages/tooling/src/remote-development-server.ts'
import { workspaceAliases } from '../../packages/tooling/src/workspace-aliases.ts'
import { preloadRouteChunk } from './vite/preload-route-chunk.ts'
import { serveStorybook } from './vite/serve-storybook.ts'

export default defineConfig(() => {
  const remoteDevelopment = resolveRemoteDevelopmentServer(
    process.env,
    'dzup-ui.dev.dziphost.com',
  )

  return {
    plugins: [tailwindcss(), vue(), serveStorybook(), preloadRouteChunk()],
    resolve: {
      alias: workspaceAliases(resolve(__dirname, '../..')),
    },
    server: {
      port: 3001,
      // Fail loudly when 3001 is taken instead of drifting to the next free port.
      // Without this Vite serves on 3002+ while `open` and any bookmarked tab still
      // point at 3001 — which then shows a stale server (or nothing) and reads as
      // "the app doesn't render". Override the port with `vite --port <n>`.
      strictPort: true,
      open: !remoteDevelopment.enabled,
      ...remoteDevelopment.server,
    },
    build: {
      // Split long-lived third-party dependencies out of the app entry chunk so the
      // initial route ships less JS and the vendor code caches across deploys. Keeps
      // LCP/TBT down (see apps/landing/lighthouserc.json) and the entry within the
      // bundle budget (scripts/check-bundle-budget.ts). Core components resolve from
      // source (aliased above), so they tree-shake into route chunks, not here.
      rollupOptions: {
        output: {
          manualChunks(id: string): string | undefined {
            // Hoist only the two libraries used on virtually every route — the Vue
            // runtime and the Lucide icon set — into long-cached vendor chunks. Both
            // are always needed, so pulling them out shrinks the entry chunk and lets
            // them cache across deploys without over-including anything route-specific.
            // Everything else (reka-ui, date-fns, …) is left to Rollup so a route only
            // pays for the primitives it actually imports, keeping the home entry lean.
            if (!id.includes('node_modules'))
              return undefined
            if (id.includes('lucide'))
              return 'vendor-icons'
            if (id.includes('@vue') || /node_modules[/\\]vue[/\\]/.test(id))
              return 'vendor-vue'
            return undefined
          },
        },
      },
    },
  }
})
