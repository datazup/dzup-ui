/**
 * Tests for the minimal draft-07 evaluator, and — the point of the file — a
 * **differential cross-check against ajv** over the real DTCG export
 * (TASK-R5-O7).
 *
 * Why differential testing rather than more unit tests: a hand-written schema
 * evaluator fails by being too *permissive*, and a permissive validator passes
 * every test you thought to write. Ajv 8.18.0 is a mature independent
 * implementation of the same specification, so making the two agree on the real
 * 292 KB document and on a set of deliberate mutations tests the evaluator
 * against a spec, not against its author's assumptions.
 *
 * This caught three real defects while the gate was being written, each of
 * which had the validator passing a document ajv rejected or vice versa:
 *
 *   1. `#/definitions/…` resolved against the document root instead of the
 *      enclosing `$id` resource — every oklch colour failed.
 *   2. Patterns compiled with the `u` flag — the spec says plain ECMA-262, and
 *      the schema's own curly-brace pattern is a SyntaxError under `u`.
 *   3. A `<url>#<pointer>` ref kept the *referring* resource as its base
 *      instead of adopting the referenced one — every aliased token failed.
 *
 * Ajv is used here as a **dev-time oracle only**. It is a transitive
 * dependency, and the gate itself must not rely on it — see the module header
 * of `json-schema-draft07.ts`.
 */

import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildDtcgDocument, serializeDtcgDocument } from '../../../tokens/src/dtcg.ts'
import { SCHEMA_PATH } from './dtcg-schema.ts'
import { Draft07Validator, validateAgainstSchema } from './json-schema-draft07.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const require = createRequire(resolve(HERE, '../../../../package.json'))

const schema: unknown = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'))
const tokensPackage = JSON.parse(
  readFileSync(resolve(HERE, '../../../tokens/package.json'), 'utf8'),
) as { version?: string }
const document: unknown = JSON.parse(serializeDtcgDocument(
  buildDtcgDocument({ packageVersion: tokensPackage.version ?? '0.0.0' }).document,
))

/** Ajv, resolved from the hoisted transitive copy. Test-only. */
function ajvVerdict(instance: unknown): boolean {
  const Ajv = require('ajv') as new (options: unknown) => {
    compile: (schema: unknown) => (data: unknown) => boolean
  }
  const addFormats = require('ajv-formats') as (ajv: unknown) => void
  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  return ajv.compile(schema)(instance)
}

const ours = (instance: unknown): boolean => validateAgainstSchema(schema, instance).length === 0

/** Deep clone that does not care about the document's shape. */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

describe('draft-07 evaluator — keyword behaviour', () => {
  it('accepts a boolean true schema and rejects false', () => {
    expect(validateAgainstSchema(true, 1)).toEqual([])
    expect(validateAgainstSchema(false, 1)).toHaveLength(1)
  })

  it('enforces type', () => {
    expect(validateAgainstSchema({ type: 'string' }, 1)).toHaveLength(1)
    expect(validateAgainstSchema({ type: ['string', 'number'] }, 1)).toEqual([])
  })

  it('enforces const, enum and pattern', () => {
    expect(validateAgainstSchema({ const: 'a' }, 'b')).toHaveLength(1)
    expect(validateAgainstSchema({ enum: ['a', 'b'] }, 'c')).toHaveLength(1)
    expect(validateAgainstSchema({ type: 'string', pattern: '^a' }, 'b')).toHaveLength(1)
  })

  it('enforces exclusiveMaximum, which color.json uses for hue', () => {
    expect(validateAgainstSchema({ type: 'number', exclusiveMaximum: 360 }, 360)).toHaveLength(1)
    expect(validateAgainstSchema({ type: 'number', exclusiveMaximum: 360 }, 359.9)).toEqual([])
  })

  it('enforces required and additionalProperties: false', () => {
    expect(validateAgainstSchema({ type: 'object', required: ['a'] }, {})).toHaveLength(1)
    expect(validateAgainstSchema(
      { type: 'object', properties: { a: true }, additionalProperties: false },
      { a: 1, b: 2 },
    )).toHaveLength(1)
  })

  it('enforces the tuple form of items', () => {
    const tuple = { type: 'array', items: [{ type: 'number' }, { type: 'string' }] }
    expect(validateAgainstSchema(tuple, [1, 'a'])).toEqual([])
    expect(validateAgainstSchema(tuple, [1, 2])).toHaveLength(1)
  })

  it('enforces oneOf exclusivity', () => {
    const schemaWithTwoMatches = { oneOf: [{ type: 'number' }, { type: 'number' }] }
    expect(validateAgainstSchema(schemaWithTwoMatches, 1)[0]?.message).toContain('oneOf branches')
  })

  it('applies if/then/else', () => {
    const conditional = {
      if: { type: 'object', required: ['a'] },
      then: { type: 'object', required: ['b'] },
      else: { type: 'object', required: ['c'] },
    }
    expect(validateAgainstSchema(conditional, { a: 1 })).toHaveLength(1)
    expect(validateAgainstSchema(conditional, { a: 1, b: 1 })).toEqual([])
    expect(validateAgainstSchema(conditional, { c: 1 })).toEqual([])
  })

  it('reports an unknown keyword instead of ignoring it', () => {
    // An assertion the evaluator cannot evaluate must never read as a pass.
    const errors = validateAgainstSchema({ unevaluatedProperties: false }, {})
    expect(errors).toHaveLength(1)
    expect(errors[0]?.message).toContain('does not implement')
  })

  it('reports an unresolvable $ref instead of skipping it', () => {
    const errors = validateAgainstSchema({ $ref: '#/definitions/nope' }, 1)
    expect(errors[0]?.message).toContain('could not be resolved')
  })

  it('resolves a fragment ref against the enclosing $id resource, not the root', () => {
    // Regression for defect 1. `inner` has no `definitions` of its own at the
    // root, so a root-scoped resolver finds nothing.
    const scoped = {
      $id: 'https://example.test/root.json',
      properties: {
        a: {
          $id: 'https://example.test/inner.json',
          $ref: '#/definitions/thing',
          definitions: { thing: { type: 'number' } },
        },
      },
    }
    expect(validateAgainstSchema(scoped, { a: 1 })).toEqual([])
    expect(validateAgainstSchema(scoped, { a: 'x' })).toHaveLength(1)
  })

  it('adopts the referenced resource as the base for a url#pointer ref', () => {
    // Regression for defect 3.
    const scoped = {
      $id: 'https://example.test/root.json',
      definitions: {
        shared: { $ref: '#/definitions/thing' },
        thing: { type: 'number' },
        other: {
          $id: 'https://example.test/other.json',
          $ref: 'https://example.test/root.json#/definitions/shared',
        },
      },
      properties: { a: { $ref: 'https://example.test/other.json' } },
    }
    expect(validateAgainstSchema(scoped, { a: 1 })).toEqual([])
    expect(validateAgainstSchema(scoped, { a: 'x' })).toHaveLength(1)
  })
})

describe('differential cross-check against ajv', () => {
  it('both implementations accept the real export', () => {
    expect(ours(document)).toBe(true)
    expect(ajvVerdict(document)).toBe(true)
  })

  /**
   * Each mutation breaks the document in a way the schema should catch. Both
   * implementations must reject — a mutation only one rejects means they have
   * diverged, which is the whole thing this file exists to detect.
   */
  /**
   * Walk into the cloned document without reaching for `any`.
   *
   * These tests deliberately break a deeply nested token, which needs untyped
   * traversal; an index-signature record gives that without turning off the
   * type checker for the whole expression.
   */
  const at = (root: unknown, ...path: string[]): Record<string, unknown> => {
    let cursor = root as Record<string, unknown>
    for (const segment of path) cursor = cursor[segment] as Record<string, unknown>
    return cursor
  }

  const mutations: { name: string, mutate: (document: Record<string, never>) => void }[] = [
    {
      name: 'a colour with an out-of-range hue (exclusiveMaximum 360)',
      mutate: (d) => {
        at(d, 'primitive', 'color', 'primary', '500', '$value').components = [0.55, 0.22, 400]
      },
    },
    {
      name: 'a colour in a colour space the spec does not define',
      mutate: (d) => {
        at(d, 'primitive', 'color', 'primary', '500', '$value').colorSpace = 'not-a-color-space'
      },
    },
    {
      name: 'a token with an unknown $-property',
      mutate: (d) => {
        at(d, 'primitive', 'color', 'primary', '500').$nonsense = true
      },
    },
    {
      name: 'a malformed curly-brace alias',
      mutate: (d) => {
        at(d, 'semantic', 'light', 'background').$value = '{primitive..color}'
      },
    },
    {
      name: 'a dimension whose $value is the wrong shape',
      mutate: (d) => {
        at(d, 'component', 'button', 'radius').$value = { nope: 1 }
      },
    },
    {
      name: 'a group name containing a dot',
      mutate: (d) => {
        at(d)['bad.name'] = { $type: 'color' }
      },
    },
    {
      name: 'a $deprecated of the wrong type',
      mutate: (d) => {
        at(d, 'primitive', 'color', 'primary', '500').$deprecated = 42
      },
    },
  ]

  for (const { name, mutate } of mutations) {
    it(`both reject: ${name}`, () => {
      const mutated = clone(document) as Record<string, never>
      mutate(mutated)
      const oursSaid = ours(mutated)
      const ajvSaid = ajvVerdict(mutated)
      expect(ajvSaid, 'ajv should reject this mutation').toBe(false)
      expect(oursSaid, 'our evaluator should agree with ajv').toBe(false)
    })
  }

  it('both accept a mutation the schema permits (no false positives)', () => {
    // $description is an allowed optional property; neither may reject it.
    const mutated = clone(document) as Record<string, never>
    at(mutated, 'primitive', 'color', 'primary', '500').$description = 'the brand primary'
    expect(ajvVerdict(mutated)).toBe(true)
    expect(ours(mutated)).toBe(true)
  })
})

describe('draft07Validator', () => {
  it('indexes every bundled $id so no ref needs the network', () => {
    // The published sub-schema URLs all 404; resolution must be purely local.
    const errors = new Draft07Validator(schema).validate(document)
    expect(errors.filter(error => error.message.includes('could not be resolved'))).toEqual([])
  })
})
