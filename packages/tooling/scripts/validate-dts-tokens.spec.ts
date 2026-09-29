import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { validateRuntimeExportParity } from './validate-dts.ts'

const dirs: string[] = []

function dist(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'validate-dts-'))
  dirs.push(dir)
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(dir, name, '..'), { recursive: true })
    writeFileSync(join(dir, name), content)
  }
  return dir
}

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('validateRuntimeExportParity', () => {
  it('fails a root declaration that was overwritten by another entry', () => {
    // The shape @dzup-ui/tokens shipped: the index rollup held only theme-script.
    const dir = dist({
      'index.js': 'export const themeScript = ""\nexport const applyThemeRecipe = () => {}\nexport const palettes = {}\n',
      'index.d.ts': 'export declare const themeScript = "";\nexport { }\n',
    })
    const errors = validateRuntimeExportParity('@dzup-ui/tokens', dir, 'index.d.ts')
    expect(errors).toHaveLength(1)
    expect(errors[0]?.message).toContain('applyThemeRecipe')
    expect(errors[0]?.message).toContain('palettes')
  })

  it('follows export * chains across per-file declarations', () => {
    const dir = dist({
      'index.js': 'export const themeScript = ""\nexport const applyThemeRecipe = () => {}\n',
      'index.d.ts': 'export * from \'./theme-recipe\';\nexport declare const themeScript = "";\nexport type ThemeMode = \'light\';\n',
      'theme-recipe.d.ts': 'export interface ThemeRecipeV1 { v: 1 }\nexport declare function applyThemeRecipe(): void;\n',
    })
    expect(validateRuntimeExportParity('@dzup-ui/tokens', dir, 'index.d.ts')).toEqual([])
  })
})
