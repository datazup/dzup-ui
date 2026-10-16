/**
 * CodemodRunner file discovery (UI-DZUP-UI-CODE-L-07).
 *
 * The runner used to paste the raw target path into its glob pattern, so a
 * target whose own path contained glob metacharacters (`[id]`, `(group)`)
 * matched nothing and the run reported a clean, empty success.
 */

import type { TransformFn } from './runner.js'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CodemodRunner } from './runner.js'

/** Appends a marker comment so a processed file is observable on disk. */
const markTransform: TransformFn = file => `${file.source}// migrated\n`

describe('codemodRunner — target paths with glob metacharacters', () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'dzup-codemod-glob-'))
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    rmSync(root, { recursive: true, force: true })
  })

  it('finds and processes files under a [bracket] (paren) directory', async () => {
    const target = join(root, 'app', '[id]', '(group)')
    mkdirSync(join(target, 'nested'), { recursive: true })
    const tsFile = join(target, 'page.ts')
    const vueFile = join(target, 'nested', 'View.vue')
    writeFileSync(tsFile, 'export const a = 1\n')
    writeFileSync(vueFile, '<script setup lang="ts">\nconst b = 2\n</script>\n')

    const runner = new CodemodRunner()
    const result = await runner.run(markTransform, target)

    expect(result.success).toBe(true)
    expect(result.stats.filesProcessed).toBe(2)
    expect(readFileSync(tsFile, 'utf-8')).toContain('// migrated')
    expect(readFileSync(vueFile, 'utf-8')).toContain('// migrated')
  })

  it('reports failure for a target that is not a directory', async () => {
    const file = join(root, 'not-a-dir.ts')
    writeFileSync(file, 'export const a = 1\n')

    const runner = new CodemodRunner()
    expect((await runner.run(markTransform, file)).success).toBe(false)
    expect((await runner.run(markTransform, join(root, 'missing'))).success).toBe(false)
  })
})
