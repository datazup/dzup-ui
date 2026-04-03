/**
 * Vue template transform utilities.
 *
 * Vue SFC `<template>` sections cannot be parsed by jscodeshift (which only
 * handles JS/TS AST).  For template-level attribute renaming we use a
 * targeted regex approach.  Each helper is deliberately narrow so false
 * positives are minimised, but consumers should still review diffs after
 * running the transform.
 */

/** A single attribute rename rule scoped to one or more component tags. */
export interface TemplateAttrRenameRule {
  /** Component tag names this rule applies to (PascalCase). */
  components: string[]
  /** Attribute name to find (exact match). */
  oldAttr: string
  /** Replacement attribute name. */
  newAttr: string
}

/** A single attribute value rename rule scoped to one or more component tags. */
export interface TemplateValueRenameRule {
  /** Component tag names this rule applies to (PascalCase). */
  components: string[]
  /** Attribute name whose value should be rewritten. */
  attr: string
  /** Map from old value to new value. */
  valueMap: Record<string, string>
}

/** An attribute + value that should expand into multiple attributes. */
export interface TemplateAttrExpandRule {
  /** Component tag names this rule applies to (PascalCase). */
  components: string[]
  /** Attribute name to match. */
  attr: string
  /** Map from old value to the replacement attribute string (raw HTML attrs). */
  expansionMap: Record<string, string>
}

/** An event rename rule scoped to one or more component tags. */
export interface TemplateEventRenameRule {
  /** Component tag names this rule applies to (PascalCase). */
  components: string[]
  /** Old event name (without `@` or `v-on:` prefix). */
  oldEvent: string
  /** New event name (without prefix). */
  newEvent: string
}

/**
 * Build a regex that matches an opening tag for any of the given component
 * names.  The regex captures everything up to the closing `>` or `/>`.
 *
 * NOTE: This is intentionally a simple pattern.  It does NOT handle edge
 * cases like attribute values containing `>`.  It is good enough for the
 * vast majority of real-world Vue templates.
 */
function tagRegex(componentNames: string[]): RegExp {
  const names = componentNames.join('|')
  // Match the opening tag including all attributes up to the closing bracket.
  // The `s` (dotAll) flag lets `.` match newlines inside multi-line tags.
  return new RegExp(`(<(?:${names})\\b)([^>]*?)(\\/?>)`, 'gs')
}

/**
 * Rename an attribute on matching component tags.
 *
 * Handles:
 * - `oldAttr="value"` -> `newAttr="value"`
 * - `oldAttr` (boolean)  -> `newAttr`
 * - `:oldAttr="expr"`    -> `:newAttr="expr"`
 * - `v-bind:oldAttr`     -> `v-bind:newAttr`
 */
export function renameTemplateAttrs(
  template: string,
  rules: TemplateAttrRenameRule[],
): string {
  let result = template

  for (const rule of rules) {
    const tag = tagRegex(rule.components)
    result = result.replace(tag, (_match, open: string, attrs: string, close: string) => {
      // Replace bare attr, :attr, and v-bind:attr forms.
      const attrPattern = new RegExp(
        `(\\s)(v-bind:|:)?(${escapeRegex(rule.oldAttr)})(\\s*=|\\s|$)`,
        'g',
      )
      const newAttrs = attrs.replace(
        attrPattern,
        (_m: string, ws: string, prefix: string | undefined, _name: string, suffix: string) =>
          `${ws}${prefix ?? ''}${rule.newAttr}${suffix}`,
      )
      return `${open}${newAttrs}${close}`
    })
  }

  return result
}

/**
 * Rename attribute values on matching component tags.
 */
export function renameTemplateAttrValues(
  template: string,
  rules: TemplateValueRenameRule[],
): string {
  let result = template

  for (const rule of rules) {
    const tag = tagRegex(rule.components)
    result = result.replace(tag, (_match, open: string, attrs: string, close: string) => {
      // Match attr="value" (double or single quotes).
      const attrPattern = new RegExp(
        `(\\s${escapeRegex(rule.attr)}\\s*=\\s*)(["'])([^"']*?)\\2`,
        'g',
      )
      const newAttrs = attrs.replace(
        attrPattern,
        (_m: string, prefix: string, quote: string, value: string) => {
          const mapped = rule.valueMap[value]
          return mapped !== undefined ? `${prefix}${quote}${mapped}${quote}` : _m
        },
      )
      return `${open}${newAttrs}${close}`
    })
  }

  return result
}

/**
 * Expand a single attribute + value into multiple attributes.
 *
 * For example `type="primary"` on DzButton becomes `tone="primary" variant="solid"`.
 */
export function expandTemplateAttrs(
  template: string,
  rules: TemplateAttrExpandRule[],
): string {
  let result = template

  for (const rule of rules) {
    const tag = tagRegex(rule.components)
    result = result.replace(tag, (_match, open: string, attrs: string, close: string) => {
      const attrPattern = new RegExp(
        `(\\s)${escapeRegex(rule.attr)}\\s*=\\s*(["'])([^"']*?)\\2`,
        'g',
      )
      const newAttrs = attrs.replace(
        attrPattern,
        (_m: string, ws: string, _quote: string, value: string) => {
          const expansion = rule.expansionMap[value]
          return expansion !== undefined ? `${ws}${expansion}` : _m
        },
      )
      return `${open}${newAttrs}${close}`
    })
  }

  return result
}

/**
 * Rename events on matching component tags.
 *
 * Handles:
 * - `@oldEvent` -> `@newEvent`
 * - `v-on:oldEvent` -> `v-on:newEvent`
 */
export function renameTemplateEvents(
  template: string,
  rules: TemplateEventRenameRule[],
): string {
  let result = template

  for (const rule of rules) {
    const tag = tagRegex(rule.components)
    result = result.replace(tag, (_match, open: string, attrs: string, close: string) => {
      const eventPattern = new RegExp(
        `(\\s)(@|v-on:)(${escapeRegex(rule.oldEvent)})(\\s*=|\\s|$)`,
        'g',
      )
      const newAttrs = attrs.replace(
        eventPattern,
        (_m: string, ws: string, prefix: string, _name: string, suffix: string) =>
          `${ws}${prefix}${rule.newEvent}${suffix}`,
      )
      return `${open}${newAttrs}${close}`
    })
  }

  return result
}

/**
 * Extract `<template>` content and its positions from a Vue SFC string.
 * Returns null if no `<template>` block is found.
 */
export function extractTemplate(source: string): {
  content: string
  start: number
  end: number
} | null {
  const openTag = /<template[^>]*>/
  const closeTag = /<\/template>/
  const openMatch = openTag.exec(source)
  if (!openMatch)
    return null
  const contentStart = openMatch.index + openMatch[0].length
  const closeMatch = closeTag.exec(source.slice(contentStart))
  if (!closeMatch)
    return null
  const contentEnd = contentStart + closeMatch.index
  return {
    content: source.slice(contentStart, contentEnd),
    start: contentStart,
    end: contentEnd,
  }
}

/**
 * Replace the `<template>` content in a Vue SFC string.
 */
export function replaceTemplate(
  source: string,
  newContent: string,
  positions: { start: number, end: number },
): string {
  return source.slice(0, positions.start) + newContent + source.slice(positions.end)
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
