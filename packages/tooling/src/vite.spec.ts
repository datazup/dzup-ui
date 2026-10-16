// @vitest-environment node -- vite's esbuild refuses jsdom's TextEncoder
/**
 * createLibConfig — dev diagnostics must survive the lib build (UI-DZUP-UI-CODE-M-17).
 *
 * Vite's lib mode replaces `import.meta.env.*` with fixed values when it builds
 * a package, and our packages are built for production, so every
 * `if (import.meta.env?.DEV)` guard became `if (false)` and its warning was
 * deleted from the published `dist`. A `define` cannot repair that — Vite accepts
 * only a literal or an entity name as a define value, not the
 * `process.env.NODE_ENV` expression a consumer's bundler would resolve — so each
 * guard site calls an `isDevEnv()` helper instead. This spec pins both halves:
 * the config never hard-codes `DEV`, and no library source reads it.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createLibConfig } from './vite.ts'

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..')

/** Every library source file under `packages/<pkg>/src`, specs and stories excluded. */
function librarySources(): string[] {
  const files: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist')
          walk(path)
      }
      else if (/\.(?:ts|vue)$/.test(entry.name) && !/\.(?:spec|test|stories)\.ts$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        files.push(path)
      }
    }
  }
  for (const pkg of ['core', 'compat'])
    walk(join(ROOT_DIR, 'packages', pkg, 'src'))
  return files
}

describe('createLibConfig dev diagnostics (UI-DZUP-UI-CODE-M-17)', () => {
  it('never defines import.meta.env.DEV as a literal', () => {
    const config = createLibConfig({ baseDir: join(ROOT_DIR, 'packages', 'compat'), entry: 'src/index.ts' })
    const value = config.define?.['import.meta.env.DEV']
    expect(typeof value).not.toBe('boolean')
    expect(value).not.toBe('false')
  })

  it('leaves no library guard reading import.meta.env.DEV, which lib mode compiles to false', () => {
    const offenders = librarySources().flatMap((file) => {
      const lines = readFileSync(file, 'utf-8').split('\n')
      return lines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => {
          const code = line.trim()
          return !code.startsWith('*') && !code.startsWith('//') && /import\.meta\.env\??\.DEV\b/.test(code)
        })
        .map(({ index }) => `${relative(ROOT_DIR, file)}:${index + 1}`)
    })
    expect(offenders).toEqual([])
  })

  it.each([
    'packages/core/src/utilities/isDevEnv.ts',
    'packages/compat/src/utils/deprecation.ts',
  ])('%s decides dev mode with a bare process.env.NODE_ENV check the consumer\'s bundler replaces', (file) => {
    const source = readFileSync(join(ROOT_DIR, file), 'utf-8')
    expect(source).toContain(`return process.env.NODE_ENV !== 'production'`)
  })
})
