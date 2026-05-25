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
}

export interface JsonSchema {
  $schema?: string
  title?: string
  type: 'object'
  required?: string[]
  properties: Record<string, JsonSchemaProperty>
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

export function isFormReady(schema: JsonSchema, data: Record<string, unknown>): boolean {
  for (const key of schema.required ?? []) {
    const value = data[key]
    if (value === undefined || value === null || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    if (value === false && schema.properties[key]?.type === 'boolean') return false
  }
  return true
}
