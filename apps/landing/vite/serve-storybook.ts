import { cpSync, createReadStream, existsSync, statSync } from 'node:fs'
import { join, normalize, resolve, sep } from 'node:path'
import type { Connect, Plugin, ViteDevServer } from 'vite'

/**
 * Mounts the free Storybook build under `/storybook/` so the landing page's
 * "Components" link (config.ts → STORYBOOK_BASE) resolves to a real app on the
 * same origin — no second dev server, no rebuild.
 *
 * `apps/storybook/storybook-static` is a BUILD INPUT, not a committed artifact:
 * it is gitignored (`.gitignore` → `storybook-static/`), so it is absent on every
 * clean clone and every CI runner until `yarn storybook:build` runs. ADR-12
 * covers the committed package `dist/` artifacts — it does NOT cover this one.
 * Its assets are referenced with relative URLs (`./sb-manager/...`), so once
 * built it can be served from any sub-path verbatim.
 *
 * - dev/preview: serve the static dir via middleware, ahead of the SPA fallback.
 *   Missing → warn and skip; a local dev server without docs is a nuisance, not a
 *   broken release.
 * - build: copy the static dir into `dist/storybook` for a self-contained deploy.
 *   Missing → THROW. A production landing build whose primary call-to-action
 *   404s is a failed build, not a smaller one. Set `LANDING_SKIP_STORYBOOK=1` to
 *   opt out deliberately (see `scripts/README.md`).
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

    // Destructure with a default: under `noUncheckedIndexedAccess` a bare
    // `split(...)[0]` is `string | undefined`, even though it never is here.
    const [pathname = ''] = url.slice(MOUNT.length).split(/[?#]/)
    let rel = decodeURIComponent(pathname)
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

/** Opt out of bundling the Storybook — the landing build then ships WITHOUT `/storybook/`. */
const SKIP_ENV = 'LANDING_SKIP_STORYBOOK'

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
      //
      // This is the site's primary call-to-action: LINKS.components, every
      // "Built with" badge on the template pages, and all ⌘K palette rows point
      // under /storybook/. Shipping a dist/ without it deploys a 404, so a
      // missing input FAILS the build instead of quietly shrinking it.
      const entry = join(staticDir, 'index.html')
      const built = existsSync(entry) && statSync(entry).size > 0

      if (!built) {
        if (process.env[SKIP_ENV]) {
          // eslint-disable-next-line no-console
          console.warn(
            `\n${'!'.repeat(72)}\n`
            + `[serve-storybook] ${SKIP_ENV} is set — building the landing site WITHOUT /storybook/.\n`
            + 'Every docs link (Components, Getting Started, Theming, Design Tokens,\n'
            + 'Accessibility, Contributing), every template "Built with" badge and every\n'
            + 'row of the ⌘K component palette WILL 404 in this output.\n'
            + `Do not deploy this artifact as the public site.\n${'!'.repeat(72)}\n`,
          )
          return
        }

        throw new Error(
          `[serve-storybook] Storybook build not found at ${staticDir}\n\n`
          + 'The landing site mounts it at /storybook/, which is where the "Components"\n'
          + 'CTA, the docs links and the ⌘K palette all point — without it this build\n'
          + 'would deploy a site whose front door 404s.\n\n'
          + 'This directory is gitignored, so it is absent on a clean clone and in CI.\n'
          + 'Build it first (it needs the package dists, so build those too):\n\n'
          + '    yarn build && yarn storybook:build\n\n'
          + `To build the landing standalone anyway, set ${SKIP_ENV}=1 — the output will\n`
          + 'have no /storybook/ and must not be deployed as the public site.',
        )
      }

      const out = resolve(__dirname, '../dist/storybook')
      cpSync(staticDir, out, { recursive: true })
    },
  }
}
