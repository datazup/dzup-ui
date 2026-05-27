export type Widget
  = | 'input'
    | 'email'
    | 'password'
    | 'textarea'
    | 'number'
    | 'slider'
    | 'switch'
    | 'checkbox'
    | 'select'
    | 'radio-group'
    | 'multi-select'
    | 'checkbox-group'
    | 'date'
    | 'unsupported'

export interface FieldLayout {
  /** Grid column span. Clamped to the active group's column count. */
  colSpan?: number
  /** Sort order within the group. Lower renders first. Ties keep declaration order. */
  order?: number
}

export interface JsonSchemaProperty {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  title?: string
  description?: string
  placeholder?: string
  format?: 'email' | 'password' | 'date' | 'textarea'
  enum?: readonly (string | number)[]
  enumLabels?: Record<string, string>
  default?: unknown
  minimum?: number | string
  maximum?: number | string
  multipleOf?: number
  maxLength?: number
  maxItems?: number
  items?: JsonSchemaProperty
  'x-widget'?: Widget
  /** Group id; matches an entry in the root x-groups array. Ungrouped → default bucket. */
  'x-group'?: string
  'x-layout'?: FieldLayout
}

export interface GroupSpec {
  id: string
  title?: string
  description?: string
  /** Column count for this group; overrides root x-layout.columns. */
  columns?: number
}

export interface RootLayout {
  /** Default grid column count for any group that does not override it. Default 2. */
  columns?: number
  /** CSS gap value for the grid (e.g. '14px'). Default '14px'. */
  gap?: string
}

export interface JsonSchema {
  $schema?: string
  title?: string
  type: 'object'
  required?: string[]
  properties: Record<string, JsonSchemaProperty>
  'x-layout'?: RootLayout
  'x-groups'?: GroupSpec[]
}

export function widgetFor(schema: JsonSchemaProperty): Widget {
  const override = schema['x-widget']
  if (override) return override

  const t = schema.type
  if (t === 'boolean') return 'switch'

  if (t === 'integer' || t === 'number') {
    const hasBounds = typeof schema.minimum === 'number' && typeof schema.maximum === 'number'
    return hasBounds ? 'slider' : 'number'
  }

  if (t === 'array') {
    if (schema.items?.enum) return 'multi-select'
    return 'unsupported'
  }

  if (t === 'string') {
    if (schema.enum) return 'select'
    if (schema.format === 'date') return 'date'
    if (schema.format === 'email') return 'email'
    if (schema.format === 'password') return 'password'
    if (schema.format === 'textarea') return 'textarea'
    if (schema.maxLength && schema.maxLength > 200) return 'textarea'
    return 'input'
  }

  return 'unsupported'
}

export function defaultValueFor(schema: JsonSchemaProperty): unknown {
  if (schema.default !== undefined) return schema.default

  switch (schema.type) {
    case 'boolean': return false
    case 'integer':
    case 'number': return typeof schema.minimum === 'number' ? schema.minimum : 0
    case 'array': return []
    case 'string':
    default: return ''
  }
}

export function initialFormData(schema: JsonSchema): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, sub] of Object.entries(schema.properties ?? {})) {
    result[key] = defaultValueFor(sub)
  }
  return result
}

export interface ResolvedField {
  key: string
  schema: JsonSchemaProperty
  widget: Widget
  required: boolean
  colSpan: number
  order: number
}

export interface ResolvedGroup {
  id: string
  title?: string
  description?: string
  columns: number
  gap: string
  fields: ResolvedField[]
}

const DEFAULT_GROUP_ID = '__default__'

export function buildLayout(schema: JsonSchema): ResolvedGroup[] {
  const rootColumns = Math.max(1, schema['x-layout']?.columns ?? 2)
  const gap = schema['x-layout']?.gap ?? '14px'
  const required = new Set(schema.required ?? [])
  const groupSpecs = schema['x-groups'] ?? []

  const groupMap = new Map<string, ResolvedGroup>()
  const groupOrder: string[] = []

  function ensureGroup(id: string, spec?: GroupSpec): ResolvedGroup {
    const existing = groupMap.get(id)
    if (existing) return existing
    const columns = Math.max(1, spec?.columns ?? rootColumns)
    const group: ResolvedGroup = {
      id,
      title: spec?.title,
      description: spec?.description,
      columns,
      gap,
      fields: [],
    }
    groupMap.set(id, group)
    groupOrder.push(id)
    return group
  }

  for (const spec of groupSpecs) ensureGroup(spec.id, spec)

  let declarationIndex = 0
  for (const [key, sub] of Object.entries(schema.properties ?? {})) {
    const groupId = sub['x-group'] ?? DEFAULT_GROUP_ID
    const spec = groupSpecs.find(g => g.id === groupId)
    const group = ensureGroup(groupId, spec)
    const requestedSpan = sub['x-layout']?.colSpan ?? 1
    const colSpan = Math.min(Math.max(1, requestedSpan), group.columns)
    const order = sub['x-layout']?.order ?? declarationIndex
    group.fields.push({
      key,
      schema: sub,
      widget: widgetFor(sub),
      required: required.has(key),
      colSpan,
      order,
    })
    declarationIndex += 1
  }

  for (const group of groupMap.values()) {
    group.fields.sort((a, b) => a.order - b.order)
  }

  return groupOrder
    .map(id => groupMap.get(id)!)
    .filter(g => g.fields.length > 0)
}

export function isFormReady(schema: JsonSchema, data: Record<string, unknown>): boolean {
  for (const key of schema.required ?? []) {
    const value = data[key]
    if (value === undefined || value === null || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    if (value === false && schema.properties[key]?.type === 'boolean') return false
  }
  return true
}
