/**
 * Tests for the DTCG official-schema gate (TASK-R5-O7).
 *
 * The evaluator's own correctness is established in `json-schema-draft07.spec.ts`
 * by differential testing against ajv. This file covers the gate around it: the
 * vendored schema's identity, the token-path reporting the `<schema_gate>`
 * requirement asks for, and the real export's verdict.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { checkDtcgSchema, SCHEMA_EDITION, SCHEMA_PATH, tokenPathFor } from './dtcg-schema.ts'

describe('the vendored schema', () => {
  it('exists and carries the spec edition in its filename', () => {
    expect(existsSync(SCHEMA_PATH)).toBe(true)
    expect(SCHEMA_PATH).toContain(`dtcg-format-${SCHEMA_EDITION}.schema.json`)
  })

  it('is byte-identical to the file published at designtokens.org', () => {
    // Fetched 2026-09-15 from
    // https://www.designtokens.org/schemas/2025.10/format.json — the same
    // 56,523-byte file TASK-N2-T1 §4c validated against on 2026-09-01.
    // If this digest changes, someone edited the vendored copy; upgrading the
    // spec edition means ADDING a file whose name carries the new edition.
    const bytes = readFileSync(SCHEMA_PATH)
    expect(bytes.length).toBe(56523)
    expect(createHash('sha256').update(bytes).digest('hex'))
      .toBe('32e93b780e4e4bca778d0780cb797a560deedc470c608af16576223f7e42915f')
  })

  it('declares draft-07, which is what the evaluator implements', () => {
    const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')) as { $schema?: string }
    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#')
  })
})

describe('tokenPathFor', () => {
  it('names the token, not the pointer', () => {
    expect(tokenPathFor('/primitive/color/primary/500/$value')).toBe('primitive.color.primary.500')
  })

  it('keeps a numeric shade — it is a token name, not an array index', () => {
    // Regression: filtering /^\d+$/ reported `primitive.color.primary` for a
    // failure that belongs to `primitive.color.primary.500`.
    expect(tokenPathFor('/primitive/color/primary/50')).toBe('primitive.color.primary.50')
  })

  it('stops at the first $-prefixed key, dropping value internals', () => {
    expect(tokenPathFor('/semantic/light/surface/$value/components/0'))
      .toBe('semantic.light.surface')
  })

  it('unescapes JSON pointer segments', () => {
    expect(tokenPathFor('/component/page~1hero')).toBe('component.page/hero')
  })

  it('names the root when the failure is not inside a token', () => {
    expect(tokenPathFor('')).toBe('(document root)')
  })
})

describe('checkDtcgSchema', () => {
  const result = checkDtcgSchema()

  it('passes at 99b963a', () => {
    expect(result.errors).toEqual([])
    expect(result.ok).toBe(true)
  })

  it('reports which artifact it validated', () => {
    expect(result.source).toMatch(/dist\/tokens\.dtcg\.json|rebuilt in memory/)
  })

  it('pins the spec edition it claims conformance to', () => {
    expect(result.edition).toBe('2025.10')
  })
})
