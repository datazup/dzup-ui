/**
 * Build the strict-CSP fixture into a static bundle (TASK-R2-O4).
 *
 * **Why a build and not a dev server.** Vite's dev server injects its own
 * inline `<script>` for HMR and installs stylesheets by writing `<style>`
 * elements from JavaScript. Under `script-src 'self'; style-src 'self'
 * 'nonce-…'` a browser drops both, and the lane would then be measuring Vite's
 * development plumbing rather than what a consumer ships. A production build
 * emits one module script and one stylesheet, from the same origin — which is
 * what a consumer's own build produces and the only thing a CSP claim can
 * honestly be about.
 *
 * Three build options are load-bearing and each one is a construct a strict
 * policy would otherwise block:
 *
 * - `modulePreload.polyfill: false` — the polyfill is an **inline** script;
 * - `cssCodeSplit: false` — one stylesheet, linked, never injected from JS;
 * - `assetsInlineLimit: 0` — no `data:` URLs, which `default-src 'self'` refuses.
 *
 * Source, not `dist/`: the components are aliased through `createDzupResolution`
 * in `merged-source` mode, the same resolution `vitest.config.ts` uses, so the
 * lane measures the working tree rather than the last build. The packed-tarball
 * question is `e2e/styling`'s, and it is a different question.
 *
 * Usage:
 *   tsx e2e/csp/build-fixture.ts              # build into the default stage
 *   DZUP_CSP_STAGE=/some/dir tsx …            # choose the stage root
 *
 * @module
 */

import { mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'
import { createDzupResolution } from '../../packages/tooling/src/resolution/dzup-resolution.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')

export const CSP_STAGE = process.env.DZUP_CSP_STAGE ?? join(tmpdir(), 'dzup-csp-fixture')

export async function buildCspFixture(stage = CSP_STAGE): Promise<string> {
  rmSync(stage, { recursive: true, force: true })
  mkdirSync(stage, { recursive: true })

  const dzup = createDzupResolution({ mode: 'merged-source', root: ROOT })

  await build({
    root: join(HERE, 'fixture'),
    base: './',
    logLevel: 'warn',
    plugins: [vue()],
    resolve: { alias: dzup.alias, dedupe: dzup.dedupe },
    build: {
      outDir: stage,
      emptyOutDir: true,
      cssCodeSplit: false,
      assetsInlineLimit: 0,
      modulePreload: { polyfill: false },
      minify: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
  })

  return stage
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  // Not a top-level await: `antfu/no-top-level-await` is on for this repo, and
  // a CLI entry point is exactly where swallowing a rejection would be worst.
  buildCspFixture()
    .then((stage) => {
      console.warn(`✓ strict-CSP fixture built → ${stage}`)
    })
    .catch((error: unknown) => {
      console.error(error)
      process.exitCode = 1
    })
}
