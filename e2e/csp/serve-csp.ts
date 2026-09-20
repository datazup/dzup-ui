/**
 * Serve the strict-CSP fixture twice: once under a real
 * `Content-Security-Policy` header, once without one (TASK-R2-O4).
 *
 * **Why a server at all.** `page.setContent` and `page.route` cannot deliver a
 * CSP the way a host delivers one. The policy that matters is the *header*
 * (`<meta http-equiv>` cannot carry `frame-ancestors`, `report-uri` or
 * `sandbox`, and is applied later in the parse), and the whole reason this lane
 * exists is that jsdom does not enforce CSP at all — a fixture that faked the
 * header would reproduce that gap one layer up.
 *
 * **Why two mounts of one build.** The assertion is *equality*: the same bytes,
 * rendered twice, differing only in the header. Two builds could differ for a
 * reason that has nothing to do with CSP, and then the lane would be measuring
 * the build.
 *
 *   /open/     no CSP header at all
 *   /strict/   default-src 'self'; style-src 'self' 'nonce-<per-request>'; …
 *
 * The nonce is generated per request and written into BOTH the header and
 * `<html data-dz-nonce>`, so the value the provider forwards to a `<style>` and
 * the value the browser accepts cannot drift — which is the exact failure the
 * ADR-20 §8 nonce contract exists to prevent, and it would otherwise be
 * invisible here.
 *
 * Usage:
 *   tsx e2e/csp/serve-csp.ts            # build if needed, then serve on 6180
 *   DZUP_CSP_PORT=6181 tsx …
 *   DZUP_CSP_REBUILD=1 tsx …            # force a rebuild of the stage
 *
 * @module
 */

import type { Buffer } from 'node:buffer'
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { buildCspFixture, CSP_STAGE } from './build-fixture.ts'

export const CSP_PORT = Number(process.env.DZUP_CSP_PORT ?? 6180)

/**
 * The policy under test.
 *
 * `'unsafe-inline'` appears nowhere, which is the point: it is the directive
 * that makes every finding in `packages/core/security/inline-style-inventory.json`
 * disappear without fixing anything. `style-src-attr 'none'` is stated
 * explicitly rather than left to fall back to `style-src`, so the lane's
 * measurement of finding F-C1 is about a directive a host actually wrote.
 */
export function policyFor(nonce: string): string {
  return [
    'default-src \'self\'',
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    'style-src-attr \'none\'',
    'img-src \'self\' data:',
    'font-src \'self\'',
    'connect-src \'self\'',
    'object-src \'none\'',
    'base-uri \'none\'',
    'frame-src \'none\'',
    'form-action \'none\'',
  ].join('; ')
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

/** Strip the `/strict` or `/open` mount and resolve inside the stage. */
function fileFor(stage: string, url: string): string | undefined {
  const path = decodeURIComponent(url.split('?')[0] ?? '/')
  const withoutMount = path.replace(/^\/(?:strict|open)/, '') || '/'
  const relative = withoutMount === '/' ? 'index.html' : withoutMount.replace(/^\//, '')
  const full = normalize(join(stage, relative))
  // Path traversal is not a threat in a test server and is refused anyway: a
  // fixture that can read outside its stage is a fixture whose results depend
  // on the machine it ran on.
  if (!full.startsWith(stage + sep) && full !== join(stage, 'index.html'))
    return undefined
  return existsSync(full) ? full : undefined
}

export async function startCspServer(port = CSP_PORT, stage = CSP_STAGE) {
  if (process.env.DZUP_CSP_REBUILD === '1' || !existsSync(join(stage, 'index.html')))
    await buildCspFixture(stage)

  const server = createServer((request, response) => {
    const url = request.url ?? '/'
    const strict = url.startsWith('/strict')
    const file = fileFor(stage, url)

    if (file === undefined) {
      response.writeHead(404, { 'content-type': 'text/plain' })
      response.end('not found')
      return
    }

    const nonce = randomBytes(16).toString('base64')
    const headers: Record<string, string> = {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      // No caching: the two mounts serve the same bytes and a cached response
      // could otherwise carry the other mount's header.
      'cache-control': 'no-store',
    }
    if (strict)
      headers['content-security-policy'] = policyFor(nonce)

    let body: Buffer | string = readFileSync(file)
    if (file.endsWith('index.html')) {
      body = body
        .toString('utf8')
        .replace('<html lang="en">', `<html lang="en" data-dz-nonce="${strict ? nonce : ''}">`)
    }

    response.writeHead(200, headers)
    response.end(body)
  })

  await new Promise<void>((done) => {
    server.listen(port, '127.0.0.1', done)
  })
  return server
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  // See `build-fixture.ts`: a CLI entry point reports its own failure rather
  // than leaving Playwright to time out against a server that never listened.
  startCspServer()
    .then(() => {
      console.warn(`✓ strict-CSP fixture served on http://127.0.0.1:${CSP_PORT}/strict/ and /open/`)
    })
    .catch((error: unknown) => {
      console.error(error)
      process.exitCode = 1
    })
}
