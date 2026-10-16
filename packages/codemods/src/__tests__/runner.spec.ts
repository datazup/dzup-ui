/**
 * Runner-level regression specs (UI-DZUP-UI-CODE-M-16).
 *
 * rename-imports is not Vue-aware: it hands the whole SFC to the tsx parser,
 * which throws on `<template>` and `@click`. The runner used to treat that
 * throw as the file's verdict, so the script-extraction fallback never ran and
 * every `.vue` file was reported as an error with its imports unmigrated.
 * The transform specs feed `.ts` sources straight to the transformer and
 * cannot see this; only a run through `CodemodRunner` can.
 */

import type { TransformFn } from '../runner.js'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CodemodRunner } from '../runner.js'
import renameImportsTransform from '../transforms/rename-imports.js'

// The CLI loads transforms dynamically, so jscodeshift's own `API` type never
// meets the runner's minimal `TransformFn`; the cast mirrors that boundary.
const renameImports = renameImportsTransform as unknown as TransformFn

const TEMPLATE = `<template>
  <div class="wrap">
    <DzButton :disabled="busy" @click="save">Save</DzButton>
    <DzInput v-model="name" />
  </div>
</template>
`

const STYLE = `
<style>
.wrap { display: flex; }
</style>
`

function sfc(script: string): string {
  return `${TEMPLATE}
<script setup lang="ts">
${script}
</script>
${STYLE}`
}

describe('codemodRunner — .vue files with a non-Vue-aware transform', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'dzup-codemod-runner-'))
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    rmSync(dir, { recursive: true, force: true })
  })

  it('migrates the script import and leaves template and style byte-identical', async () => {
    const file = join(dir, 'Form.vue')
    writeFileSync(file, sfc(`import { DzButton, DzInput } from 'dzup-ui'
import { ref } from 'vue'

const name = ref('')
const busy = ref(false)
function save(): void {}`))

    const result = await new CodemodRunner().run(renameImports, dir)

    const out = readFileSync(file, 'utf-8')
    expect(out).toContain(`from '@dzup-ui/core'`)
    expect(out).not.toContain(`from 'dzup-ui'`)
    expect(out.startsWith(TEMPLATE)).toBe(true)
    expect(out.endsWith(STYLE)).toBe(true)
    expect(result.success).toBe(true)
    expect(result.stats.filesErrored).toBe(0)
    expect(result.stats.filesModified).toBe(1)
  })

  it('still reports a .vue file whose script block is itself unparseable', async () => {
    const file = join(dir, 'Broken.vue')
    const source = sfc(`import { DzButton } from 'dzup-ui'
const = = ;`)
    writeFileSync(file, source)

    const result = await new CodemodRunner().run(renameImports, dir)

    expect(result.success).toBe(false)
    expect(result.stats.filesErrored).toBe(1)
    expect(readFileSync(file, 'utf-8')).toBe(source)
  })
})
