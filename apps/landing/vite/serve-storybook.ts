import { cpSync, createReadStream, existsSync, statSync } from 'node:fs'
import { join, normalize, resolve, sep } from 'node:path'
import type { Connect, Plugin, ViteDevServer } from 'vite'

/**
 * Mounts the free Storybook build under `/storybook/` so the landing page's
 * "Components" link (config.ts → STORYBOOK_BASE) resolves to a real app on the
 * same origin — no second dev server, no rebuild.
 *
 * The committed `apps/storybook/storybook-static` build references its assets
 * with relative URLs (`./sb-manager/...`), so it can be served from any
 * sub-path verbatim. We keep using that committed artifact (ADR-12); refresh it
 * with `yarn storybook:build` when components change.
 *
 * - dev/preview: serve the static dir via middleware, ahead of the SPA fallback.
 * - build: copy the static dir into `dist/storybook` for a self-contained deploy.
 */

const MOUNT = '/storybook'

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

function contentType(path: string): string {
  const dot = path.lastIndexOf('.')
  const ext = dot === -1 ? '' : path.slice(dot).toLowerCase()
  return MIME[ext] ?? 'application/octet-stream'
}

function serveStorybookMiddleware(staticDir: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url
    if (!url || (url !== MOUNT && !url.startsWith(`${MOUNT}/`) && !url.startsWith(`${MOUNT}?`))) {
      return next()
    }

    // Bare `/storybook` → redirect so relative assets resolve against the dir.
    if (url === MOUNT) {
      res.statusCode = 301
      res.setHeader('Location', `${MOUNT}/`)
      res.end()
      return
    }

    let rel = url.slice(MOUNT.length).split('?')[0].split('#')[0]
    rel = decodeURIComponent(rel)
    if (rel === '' || rel === '/') rel = '/index.html'

    const filePath = normalize(join(staticDir, rel))
    // Block path traversal outside the static root.
    if (filePath !== staticDir && !filePath.startsWith(staticDir + sep)) {
      return next()
    }

    let target = filePath
    if (existsSync(target) && statSync(target).isDirectory()) {
      target = join(target, 'index.html')
    }
    if (!existsSync(target) || !statSync(target).isFile()) {
      return next()
    }

    res.statusCode = 200
    res.setHeader('Content-Type', contentType(target))
    createReadStream(target).pipe(res)
  }
}

export function serveStorybook(): Plugin {
  // apps/landing/vite/ → apps/storybook/storybook-static
  const staticDir = resolve(__dirname, '../../storybook/storybook-static')

  const attach = (server: ViteDevServer | { middlewares: Connect.Server }): void => {
    if (!existsSync(staticDir)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[serve-storybook] ${staticDir} not found — run \`yarn storybook:build\`. `
        + 'The "Components" link will 404 until then.',
      )
      return
    }
    server.middlewares.use(serveStorybookMiddleware(staticDir))
  }

  return {
    name: 'dzup-serve-storybook',
    // Added during configureServer (pre internal middlewares) so `/storybook/*`
    // is served before Vite's SPA history fallback redirects it to `/`.
    configureServer(server) {
      attach(server)
    },
    configurePreviewServer(server) {
      attach(server)
    },
    closeBundle() {
      // Self-contained production output: dist/storybook/**.
      if (!existsSync(staticDir)) return
      const out = resolve(__dirname, '../dist/storybook')
      cpSync(staticDir, out, { recursive: true })
    },
  }
}
