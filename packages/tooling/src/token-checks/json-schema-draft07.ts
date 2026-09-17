/**
 * A minimal JSON Schema **draft-07** evaluator, sized to exactly the keywords
 * the published DTCG format schema uses (TASK-R5-O7).
 *
 * ── Why this exists instead of `import Ajv from 'ajv'` ──
 *
 * `@dzup-ui/tooling` declares no `ajv`. Ajv 8.18.0 *is* resolvable here, but
 * only as a hoisted **transitive** dependency of other tools — `yarn.lock`
 * carries four separate ajv ranges, none of them ours. N2-T1 §4c validated the
 * export against the official schema exactly that way and recorded the result
 * as explicitly **out-of-band** for this reason: a mandatory gate that resolves
 * a package nobody declared is one dependency bump away from either vanishing
 * or silently changing validator semantics, and declaring it would mutate
 * `yarn.lock` — which no prompt in this program authorises.
 *
 * The repo already answered this question once. N2-T1 needed an independent
 * DTCG reader for the round-trip gate, declined to install `@terrazzo/parser`
 * for the same lockfile reason, and wrote one. This is the same trade at a
 * tenth of the size: the schema uses 20 keywords, all of them local, and the
 * evaluator below is a direct transcription of the draft-07 specification for
 * those 20 and nothing else.
 *
 * It is not a general-purpose validator and does not try to be. Anything it
 * cannot evaluate it reports as an error rather than skipping — an unknown
 * keyword must never read as a pass. `json-schema-draft07.spec.ts` cross-checks
 * every verdict against ajv, which is legitimate in a **test** (a dev-time
 * oracle that can disappear without taking a gate with it) in a way it is not
 * in a gate.
 *
 * ── Keywords implemented ──
 *
 * `$ref` (local pointer · bundled `$id` · `$id`-plus-pointer) · `type` ·
 * `const` · `enum` · `pattern` · `required` · `properties` ·
 * `patternProperties` · `additionalProperties` · `items` (schema and tuple
 * form) · `minItems` · `maxItems` · `minimum` · `maximum` · `allOf` · `anyOf` ·
 * `oneOf` · `not` · `if`/`then`/`else`.
 *
 * `format` is treated as an annotation, which is what draft-07 §7.2 says it is
 * by default ("implementations MUST NOT fail validation ... for unknown
 * formats"); the two in use (`uri-reference`, `json-pointer-uri-fragment`) are
 * already constrained by sibling `pattern` keywords in this schema.
 */

export interface SchemaError {
  /** JSON pointer into the *instance* — for a token file this is its path. */
  readonly instancePath: string
  readonly message: string
}

type Json = unknown
interface SchemaObject { [key: string]: Json }

/**
 * Every keyword this evaluator either enforces or knowingly ignores.
 *
 * An exhaustive census of the vendored schema's *schema positions* found 30
 * distinct keywords; all of them are below. Anything outside this set is
 * reported as an error rather than ignored, so a later spec edition that
 * introduces a new assertion cannot quietly widen what the gate accepts.
 *
 * The annotation-only group (`title`, `description`, `$comment`, `default`,
 * `examples`, `deprecated`, `readOnly`, `writeOnly`, `$schema`, `$id`,
 * `definitions`) carries no assertion in draft-07 and is ignored by design —
 * `definitions` is a container that is only ever reached through `$ref`.
 */
const KNOWN_KEYWORDS = new Set([
  // Annotations and containers — no assertion in draft-07, ignored by design.
  // `definitions` is only ever reached through `$ref`.
  '$schema',
  '$id',
  '$comment',
  'title',
  'description',
  'default',
  'examples',
  'deprecated',
  'readOnly',
  'writeOnly',
  'definitions',
  // `format` is an annotation by default per draft-07 §7.2 — see the header.
  'format',
  // Enforced below, and nothing else is. Assertions this evaluator does not
  // implement (minLength, multipleOf, uniqueItems, contains, propertyNames,
  // dependencies, min/maxProperties) are deliberately ABSENT: the vendored
  // schema uses none of them, and if a later edition introduces one the gate
  // must fail loudly rather than ignore an assertion it cannot evaluate.
  '$ref',
  'type',
  'const',
  'enum',
  'pattern',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'required',
  'properties',
  'patternProperties',
  'additionalProperties',
  'items',
  'additionalItems',
  'minItems',
  'maxItems',
  'allOf',
  'anyOf',
  'oneOf',
  'not',
  'if',
  'then',
  'else',
])

function isObject(value: Json): value is SchemaObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Draft-07 type names against a runtime value. `integer` is a number check. */
function matchesType(value: Json, type: string): boolean {
  switch (type) {
    case 'object': return isObject(value)
    case 'array': return Array.isArray(value)
    case 'string': return typeof value === 'string'
    case 'number': return typeof value === 'number'
    case 'integer': return typeof value === 'number' && Number.isInteger(value)
    case 'boolean': return typeof value === 'boolean'
    case 'null': return value === null
    default: return false
  }
}

function deepEqual(a: Json, b: Json): boolean {
  if (a === b)
    return true
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))
  if (isObject(a) && isObject(b)) {
    const aKeys = Object.keys(a).sort()
    const bKeys = Object.keys(b).sort()
    return aKeys.length === bKeys.length
      && aKeys.every((key, index) => key === bKeys[index])
      && aKeys.every(key => deepEqual(a[key], b[key]))
  }
  return false
}

/** `~1` → `/` and `~0` → `~`, per RFC 6901. */
const unescapePointer = (segment: string): string => segment.replace(/~1/g, '/').replace(/~0/g, '~')

function resolvePointer(root: Json, pointer: string): Json | undefined {
  if (pointer === '' || pointer === '#')
    return root
  let current: Json = root
  for (const raw of pointer.replace(/^#/, '').split('/').slice(1)) {
    const segment = unescapePointer(raw)
    if (Array.isArray(current))
      current = current[Number(segment)]
    else if (isObject(current))
      current = current[segment]
    else return undefined
  }
  return current
}

/**
 * Index every `$id` in the document.
 *
 * The published `format.json` bundles all 17 of its sub-schemas under
 * `definitions`, keyed by their own URL and each carrying its `$id`. That
 * bundling is load-bearing: the 18 sub-schema URLs the schema `$ref`s
 * **return HTTP 404** (N2-T1 §5 F-5), so a validator that fetches `$ref`s over
 * the network cannot validate this file at all — and a gate must not touch the
 * network regardless.
 */
function indexIds(node: Json, into: Map<string, Json>): Map<string, Json> {
  if (Array.isArray(node)) {
    for (const item of node) indexIds(item, into)
    return into
  }
  if (!isObject(node))
    return into
  const id = node.$id
  if (typeof id === 'string' && !into.has(id))
    into.set(id, node)
  for (const key of Object.keys(node)) indexIds(node[key], into)
  return into
}

export class Draft07Validator {
  private readonly root: Json
  private readonly ids: Map<string, Json>

  constructor(schema: Json) {
    this.root = schema
    this.ids = indexIds(schema, new Map())
  }

  validate(instance: Json): SchemaError[] {
    return this.check(this.root, instance, '', this.root)
  }

  /**
   * Resolve a `$ref`.
   *
   * `base` is the **current schema resource** — the nearest enclosing subschema
   * that declares an `$id`. This matters here and is easy to get wrong: the
   * bundled `color.json` refers to its own component definitions as
   * `#/definitions/hueComponent`, and draft-07 §8.3 resolves that against
   * color.json's* `$id`, not against the document root. Resolving it at the
   * root finds nothing — the root's `definitions` has no `hueComponent` — so
   * every oklch colour in the export would fail against a schema it actually
   * satisfies. That was this validator's first bug, caught by the ajv
   * cross-check in the spec.
   */
  private deref(ref: string, base: Json): { node: Json, base: Json } | undefined {
    // A fragment-only ref stays inside the current resource.
    if (ref.startsWith('#')) {
      const node = resolvePointer(base, ref)
      return node === undefined ? undefined : { node, base }
    }
    const hash = ref.indexOf('#')
    if (hash === -1) {
      const node = this.ids.get(ref)
      // The target declares its own $id, so it *is* the new scope.
      return node === undefined ? undefined : { node, base: node }
    }
    // URL + pointer: the scope becomes the resource the URL names, NOT the one
    // that referred to it. token.json points at
    // `format.json#/definitions/tokenValueReference`, and that node's own
    // `#/definitions/curlyBraceReference` refs must resolve against format.json.
    // Carrying token.json's scope across instead makes every aliased token —
    // every `"$value": "{primitive.color.neutral.100}"` — fail to resolve.
    const resource = this.ids.get(ref.slice(0, hash))
    if (resource === undefined)
      return undefined
    const node = resolvePointer(resource, ref.slice(hash))
    return node === undefined ? undefined : { node, base: resource }
  }

  private check(schema: Json, value: Json, path: string, base: Json): SchemaError[] {
    // Draft-07 allows a boolean schema: `true` accepts, `false` rejects.
    if (schema === true)
      return []
    if (schema === false)
      return [{ instancePath: path, message: 'is not allowed here' }]
    if (!isObject(schema))
      return [{ instancePath: path, message: 'schema node is not an object' }]

    const errors: SchemaError[] = []

    // Entering a subschema that declares $id opens a new resolution scope.
    const scope = typeof schema.$id === 'string' ? schema : base

    for (const keyword of Object.keys(schema)) {
      if (!KNOWN_KEYWORDS.has(keyword)) {
        // Never skip silently: an unrecognised assertion must not read as a
        // pass. If a later spec edition introduces one, this gate says so.
        errors.push({
          instancePath: path,
          message: `schema uses "${keyword}", which this evaluator does not implement`,
        })
      }
    }

    if (typeof schema.$ref === 'string') {
      const target = this.deref(schema.$ref, scope)
      if (target === undefined) {
        return [{
          instancePath: path,
          message: `schema $ref "${schema.$ref}" could not be resolved inside the vendored schema`,
        }]
      }
      // draft-07: $ref replaces every sibling keyword.
      return this.check(target.node, value, path, target.base)
    }

    if (schema.type !== undefined) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type]
      if (!types.some(type => typeof type === 'string' && matchesType(value, type))) {
        errors.push({ instancePath: path, message: `must be ${types.join(' or ')}` })
        // Type is the precondition for every other assertion here.
        return errors
      }
    }

    if (schema.const !== undefined && !deepEqual(value, schema.const))
      errors.push({ instancePath: path, message: `must equal ${JSON.stringify(schema.const)}` })

    if (Array.isArray(schema.enum) && !schema.enum.some(option => deepEqual(value, option)))
      errors.push({ instancePath: path, message: `must be one of ${JSON.stringify(schema.enum)}` })

    if (typeof value === 'string' && typeof schema.pattern === 'string') {
      // No `u` flag: JSON Schema draft-07 §6.3.3 specifies ECMA-262 regular
      // expressions WITHOUT it, and the schema's own
      // `^\{[^${}.][^{}.]*(\.[^${}.][^{}.]*)*\}$` is a lone-quantifier-bracket
      // SyntaxError under `u`. ajv compiles these unflagged for the same reason.
      if (!new RegExp(schema.pattern).test(value))
        errors.push({ instancePath: path, message: `must match /${schema.pattern}/` })
    }

    if (typeof value === 'number') {
      if (typeof schema.minimum === 'number' && value < schema.minimum)
        errors.push({ instancePath: path, message: `must be >= ${schema.minimum}` })
      if (typeof schema.maximum === 'number' && value > schema.maximum)
        errors.push({ instancePath: path, message: `must be <= ${schema.maximum}` })
      if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum)
        errors.push({ instancePath: path, message: `must be > ${schema.exclusiveMinimum}` })
      // Used once, by color.json's hueComponent: a hue is [0, 360).
      if (typeof schema.exclusiveMaximum === 'number' && value >= schema.exclusiveMaximum)
        errors.push({ instancePath: path, message: `must be < ${schema.exclusiveMaximum}` })
    }

    if (Array.isArray(value))
      errors.push(...this.checkArray(schema, value, path, scope))

    if (isObject(value))
      errors.push(...this.checkObject(schema, value, path, scope))

    errors.push(...this.checkCombinators(schema, value, path, scope))

    return errors
  }

  private checkArray(schema: SchemaObject, value: Json[], path: string, base: Json): SchemaError[] {
    const errors: SchemaError[] = []
    if (typeof schema.minItems === 'number' && value.length < schema.minItems)
      errors.push({ instancePath: path, message: `must have at least ${schema.minItems} item(s)` })
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems)
      errors.push({ instancePath: path, message: `must have at most ${schema.maxItems} item(s)` })

    if (Array.isArray(schema.items)) {
      // Tuple form: schema N constrains item N; extras fall to additionalItems.
      value.forEach((item, index) => {
        const itemSchema = (schema.items as Json[])[index]
        if (itemSchema !== undefined)
          errors.push(...this.check(itemSchema, item, `${path}/${index}`, base))
        else if (schema.additionalItems !== undefined)
          errors.push(...this.check(schema.additionalItems, item, `${path}/${index}`, base))
      })
    }
    else if (schema.items !== undefined) {
      value.forEach((item, index) => {
        errors.push(...this.check(schema.items, item, `${path}/${index}`, base))
      })
    }
    return errors
  }

  private checkObject(schema: SchemaObject, value: SchemaObject, path: string, base: Json): SchemaError[] {
    const errors: SchemaError[] = []

    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (typeof key === 'string' && !Object.prototype.hasOwnProperty.call(value, key))
          errors.push({ instancePath: path, message: `must have required property "${key}"` })
      }
    }

    const properties = isObject(schema.properties) ? schema.properties : {}
    const patternProperties = isObject(schema.patternProperties) ? schema.patternProperties : {}

    for (const key of Object.keys(value)) {
      const escaped = `${path}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`
      let covered = false

      if (Object.prototype.hasOwnProperty.call(properties, key)) {
        covered = true
        errors.push(...this.check(properties[key], value[key], escaped, base))
      }
      for (const pattern of Object.keys(patternProperties)) {
        if (new RegExp(pattern).test(key)) {
          covered = true
          errors.push(...this.check(patternProperties[pattern], value[key], escaped, base))
        }
      }
      if (!covered && schema.additionalProperties !== undefined) {
        if (schema.additionalProperties === false)
          errors.push({ instancePath: escaped, message: 'is not an allowed property here' })
        else
          errors.push(...this.check(schema.additionalProperties, value[key], escaped, base))
      }
    }
    return errors
  }

  private checkCombinators(schema: SchemaObject, value: Json, path: string, base: Json): SchemaError[] {
    const errors: SchemaError[] = []

    if (Array.isArray(schema.allOf)) {
      for (const branch of schema.allOf)
        errors.push(...this.check(branch, value, path, base))
    }

    if (Array.isArray(schema.anyOf)) {
      const results = schema.anyOf.map(branch => this.check(branch, value, path, base))
      if (!results.some(result => result.length === 0))
        errors.push(...summarise('anyOf', results, path))
    }

    if (Array.isArray(schema.oneOf)) {
      const results = schema.oneOf.map(branch => this.check(branch, value, path, base))
      const passing = results.filter(result => result.length === 0).length
      if (passing === 0)
        errors.push(...summarise('oneOf', results, path))
      else if (passing > 1)
        errors.push({ instancePath: path, message: `matches ${passing} oneOf branches; exactly one is allowed` })
    }

    if (schema.not !== undefined && this.check(schema.not, value, path, base).length === 0)
      errors.push({ instancePath: path, message: 'must NOT match the "not" schema' })

    if (schema.if !== undefined) {
      const conditionHolds = this.check(schema.if, value, path, base).length === 0
      const branch = conditionHolds ? schema.then : schema.else
      if (branch !== undefined)
        errors.push(...this.check(branch, value, path, base))
    }

    return errors
  }
}

/**
 * Turn N failed branches into one actionable message.
 *
 * Printing every branch's errors for a schema with 65 `oneOf`s buries the real
 * cause. The branch that reached **deepest** into the instance is almost always
 * the one the author intended, so its errors are the ones worth showing.
 */
function summarise(keyword: string, results: SchemaError[][], path: string): SchemaError[] {
  const depth = (errors: SchemaError[]): number =>
    errors.reduce((deepest, error) => Math.max(deepest, error.instancePath.length), 0)
  const best = [...results].sort((a, b) => depth(b) - depth(a))[0] ?? []
  return [
    { instancePath: path, message: `does not match any of the ${results.length} ${keyword} alternatives` },
    ...best.slice(0, 3),
  ]
}

/** Convenience wrapper. */
export function validateAgainstSchema(schema: Json, instance: Json): SchemaError[] {
  return new Draft07Validator(schema).validate(instance)
}
