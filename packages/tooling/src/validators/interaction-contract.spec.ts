import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  collectFiles,
  runInteractionContractCheck,
  validateContent,
} from './interaction-contract'

const TMP_DIR = join(import.meta.dirname, '.interaction-contract-test-tmp')
const COMPONENTS_DIR = join(TMP_DIR, 'packages/core/src/components')

beforeAll(() => {
  mkdirSync(COMPONENTS_DIR, { recursive: true })
})

afterAll(() => {
  rmSync(TMP_DIR, { recursive: true, force: true })
})

describe('interaction-contract validator', () => {
  it('returns no violations for semantic interaction utilities', () => {
    const violations = validateContent(
      [
        'const classes = [',
        '\'dz-focus-ring-button dz-disabled-button\',',
        '\'dz-focus-within-ring-input dz-disabled-input-shell\',',
        ']',
      ].join('\n'),
      'packages/core/src/components/buttons/DzExample.variants.ts',
    )

    expect(violations).toHaveLength(0)
  })

  it('flags raw semantic focus-ring token plumbing', () => {
    const violations = validateContent(
      [
        'const widthClass = \'ring-[length:var(--dz-button-focus-ring-width)]\'',
        'const colorClass = \'ring-[var(--dz-button-focus-ring-color)]\'',
      ].join('\n'),
      'packages/core/src/components/buttons/DzBad.variants.ts',
    )

    expect(violations).toHaveLength(2)
    expect(violations.map(v => v.rule)).toEqual([
      'raw-semantic-focus-ring-token',
      'raw-semantic-focus-ring-token',
    ])
    expect(violations[0]?.file).toBe('packages/core/src/components/buttons/DzBad.variants.ts')
  })

  it('flags one-off danger outline overrides', () => {
    const violations = validateContent(
      'const invalid = \'border-[var(--dz-danger)] focus-visible:outline-[var(--dz-danger)]\'',
      'packages/core/src/components/forms/DzBadInput.variants.ts',
    )

    expect(violations).toHaveLength(1)
    expect(violations[0]?.rule).toBe('raw-invalid-outline-override')
  })

  it('collects only implementation files from a components directory', () => {
    const familyDir = join(COMPONENTS_DIR, 'buttons')
    mkdirSync(familyDir, { recursive: true })
    writeFileSync(join(familyDir, 'DzGood.variants.ts'), 'export const x = "dz-focus-ring-button"')
    writeFileSync(join(familyDir, 'DzIgnored.spec.ts'), 'export const ignored = true')
    writeFileSync(join(familyDir, 'DzIgnored.tokens.ts'), 'export const ignored = true')

    const files = collectFiles(COMPONENTS_DIR)

    expect(files.some(file => file.endsWith('DzGood.variants.ts'))).toBe(true)
    expect(files.some(file => file.endsWith('DzIgnored.spec.ts'))).toBe(false)
    expect(files.some(file => file.endsWith('DzIgnored.tokens.ts'))).toBe(false)
  })

  it('scans a components directory and reports relative file paths', () => {
    const buttonsDir = join(COMPONENTS_DIR, 'buttons')
    mkdirSync(buttonsDir, { recursive: true })
    writeFileSync(
      join(buttonsDir, 'DzDrift.variants.ts'),
      'const className = \'ring-[length:var(--dz-button-focus-ring-width)] focus-visible:outline-[var(--dz-danger)]\'',
    )

    const violations = runInteractionContractCheck(COMPONENTS_DIR, TMP_DIR)

    expect(violations).toHaveLength(2)
    expect(violations[0]?.file).toBe('packages/core/src/components/buttons/DzDrift.variants.ts')
    expect(violations.map(v => v.rule).sort()).toEqual([
      'raw-invalid-outline-override',
      'raw-semantic-focus-ring-token',
    ])
  })
})
