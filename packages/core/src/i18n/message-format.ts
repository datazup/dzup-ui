/**
 * The message formatter: plural, select and typed interpolation on `Intl`
 * (TASK-R5-O4).
 *
 * **Why this exists.** Before it, every count the library announced was built
 * by string concatenation — `` `${n} item${n === 1 ? '' : 's'}` `` in five
 * components. That is correct in English and wrong in most other languages the
 * moment a second catalog exists: Bosnian and Russian have a `few` form, Arabic
 * has six categories, French puts `0` in the singular. `Intl.PluralRules` knows
 * all of them; concatenation knows two.
 *
 * **The syntax is a documented subset of ICU MessageFormat** — the format every
 * translation-management tool already reads, so a translator never learns a
 * dzup-ui dialect:
 *
 * ```text
 * {name}                                            argument; numbers formatted for the locale
 * {count, plural, =0 {none} one {# item} other {# items}}
 * {place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}
 * {kind, select, file {File} folder {Folder} other {Item}}
 * '{literal braces}'   ''                          ICU apostrophe quoting
 * ```
 *
 * `other` is required in every `plural`/`select`, `#` is the enclosing plural's
 * number, and `=N` exact matches win over categories. **Not supported, and
 * rejected with a syntax error rather than half-honoured:** `offset:`, and the
 * `number`/`date`/`time` argument types — a date inside a message would bypass
 * the instant/plain rules in `packages/core/docs/i18n.md`.
 *
 * **Escaping rule.** Argument values are data. They are inserted after parsing,
 * so a value containing `{`, `}`, `#` or `'` is never read as syntax, and the
 * formatter's only output is **text** — it never produces markup. Core renders
 * that text through Vue text and attribute bindings, which escape `<` and `&`
 * (Core has zero `v-html` sinks). A consumer that must put a formatted message
 * into HTML passes it through the sanitizer seam (`useDzSanitizer`, TASK-R3-O2),
 * whose default escapes. `message-format.spec.ts` proves both halves.
 *
 * **Framework-free**, like `intl-cache.ts`, so pure helpers and the validator
 * can use it without Vue.
 *
 * @module @dzup-ui/core/i18n/message-format
 */

import type { DzMessageArg, DzMessageValues } from '@dzup-ui/contracts'
import type { IntlLocaleArg } from './intl-cache.ts'
import { cachedNumberFormat, cachedPluralRules } from './intl-cache.ts'

// ---------------------------------------------------------------------------
// AST
// ---------------------------------------------------------------------------

export type MessageNode
  = | { readonly type: 'text', readonly value: string }
    | { readonly type: 'argument', readonly name: string }
    | { readonly type: 'pound' }
    | {
      readonly type: 'plural'
      readonly name: string
      readonly ordinal: boolean
      readonly options: Readonly<Record<string, readonly MessageNode[]>>
    }
    | {
      readonly type: 'select'
      readonly name: string
      readonly options: Readonly<Record<string, readonly MessageNode[]>>
    }

/** What an argument is used as, for the pack gate's argument-parity rule. */
export type MessageArgumentKind = 'simple' | 'plural' | 'selectordinal' | 'select'

/** A message that does not parse. Carries the offset so a gate can point at it. */
export class MessageSyntaxError extends Error {
  readonly offset: number

  constructor(message: string, source: string, offset: number) {
    super(`${message} at offset ${offset} in ${JSON.stringify(source)}`)
    this.name = 'MessageSyntaxError'
    this.offset = offset
  }
}

/** A message that parsed but cannot be formatted with the values given. */
export class MessageArgumentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MessageArgumentError'
  }
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

const IDENTIFIER = /[A-Z_]\w*/iy
const SELECTOR = /=\d+|[A-Z_]\w*/iy
const PLURAL_CATEGORIES = new Set(['zero', 'one', 'two', 'few', 'many', 'other'])

class Parser {
  private pos = 0

  constructor(private readonly source: string) {}

  parse(): MessageNode[] {
    const nodes = this.nodes(false, false)
    if (this.pos < this.source.length)
      this.fail('unmatched "}"')
    return nodes
  }

  private fail(reason: string): never {
    throw new MessageSyntaxError(reason, this.source, this.pos)
  }

  private skipSpace(): void {
    while (this.pos < this.source.length && /\s/.test(this.source[this.pos]!))
      this.pos += 1
  }

  private read(pattern: RegExp): string | undefined {
    pattern.lastIndex = this.pos
    const match = pattern.exec(this.source)
    if (match === null)
      return undefined
    this.pos += match[0].length
    return match[0]
  }

  private expect(char: string): void {
    if (this.source[this.pos] !== char)
      this.fail(`expected "${char}"`)
    this.pos += 1
  }

  /**
   * Text and arguments up to an unconsumed `}` or the end.
   *
   * @param nested  inside a plural/select branch — a `}` ends it
   * @param inPlural a `#` means the enclosing plural's number
   */
  private nodes(nested: boolean, inPlural: boolean): MessageNode[] {
    const out: MessageNode[] = []
    let text = ''
    const flush = (): void => {
      if (text !== '') {
        out.push({ type: 'text', value: text })
        text = ''
      }
    }

    while (this.pos < this.source.length) {
      const char = this.source[this.pos]!

      if (char === '\'') {
        text += this.quoted(inPlural)
        continue
      }
      if (char === '{') {
        flush()
        out.push(this.argument(inPlural))
        continue
      }
      if (char === '}') {
        if (!nested)
          this.fail('unmatched "}"')
        break
      }
      if (char === '#' && inPlural) {
        flush()
        out.push({ type: 'pound' })
        this.pos += 1
        continue
      }
      text += char
      this.pos += 1
    }

    if (nested && this.pos >= this.source.length)
      this.fail('unclosed "{"')
    flush()
    return out
  }

  /**
   * ICU apostrophe quoting. `''` is one apostrophe anywhere; a single `'`
   * starts a quoted run only before a character that would otherwise be syntax,
   * so "don't" needs no escaping.
   */
  private quoted(inPlural: boolean): string {
    const next = this.source[this.pos + 1]
    if (next === '\'') {
      this.pos += 2
      return '\''
    }
    if (next !== '{' && next !== '}' && !(inPlural && next === '#')) {
      this.pos += 1
      return '\''
    }

    this.pos += 1
    let literal = ''
    while (this.pos < this.source.length) {
      const char = this.source[this.pos]!
      if (char === '\'') {
        if (this.source[this.pos + 1] === '\'') {
          literal += '\''
          this.pos += 2
          continue
        }
        this.pos += 1
        return literal
      }
      literal += char
      this.pos += 1
    }
    this.fail('unterminated quoted literal')
  }

  private argument(inPlural: boolean): MessageNode {
    this.expect('{')
    this.skipSpace()
    const name = this.read(IDENTIFIER)
    if (name === undefined)
      this.fail('expected an argument name')
    this.skipSpace()

    if (this.source[this.pos] === '}') {
      this.pos += 1
      return { type: 'argument', name }
    }

    this.expect(',')
    this.skipSpace()
    const kind = this.read(IDENTIFIER)
    if (kind !== 'plural' && kind !== 'selectordinal' && kind !== 'select') {
      this.fail(kind === undefined
        ? 'expected an argument type'
        : `unsupported argument type "${kind}" (plural, selectordinal and select are supported)`)
    }
    this.skipSpace()
    this.expect(',')

    const isPlural = kind !== 'select'
    const options: Record<string, MessageNode[]> = {}
    for (;;) {
      this.skipSpace()
      if (this.source[this.pos] === '}') {
        this.pos += 1
        break
      }
      if (this.source.startsWith('offset:', this.pos))
        this.fail('"offset:" is not supported')

      const selector = this.read(SELECTOR)
      if (selector === undefined)
        this.fail('expected a selector')
      if (selector.startsWith('=') && !isPlural)
        this.fail(`exact selector "${selector}" is only valid in plural`)
      if (isPlural && !selector.startsWith('=') && !PLURAL_CATEGORIES.has(selector))
        this.fail(`"${selector}" is not a plural category (zero, one, two, few, many, other)`)
      if (Object.hasOwn(options, selector))
        this.fail(`duplicate selector "${selector}"`)

      this.skipSpace()
      this.expect('{')
      options[selector] = this.nodes(true, isPlural || inPlural)
      this.expect('}')
    }

    if (!Object.hasOwn(options, 'other'))
      this.fail(`"${name}" has no "other" branch`)

    return isPlural
      ? { type: 'plural', name, ordinal: kind === 'selectordinal', options }
      : { type: 'select', name, options }
  }
}

/**
 * Parsed messages, keyed by source.
 *
 * Bounded by the distinct messages an application renders — the catalog plus
 * whatever a host supplies, a fixed set — and cleared wholesale past a ceiling
 * rather than growing without limit if a caller formats generated strings.
 */
const parsed = new Map<string, readonly MessageNode[]>()
const PARSE_CACHE_LIMIT = 1_000

/** Parse a message. Throws {@link MessageSyntaxError}. */
export function parseMessage(message: string): readonly MessageNode[] {
  const hit = parsed.get(message)
  if (hit !== undefined)
    return hit
  const nodes = new Parser(message).parse()
  if (parsed.size >= PARSE_CACHE_LIMIT)
    parsed.clear()
  parsed.set(message, nodes)
  return nodes
}

/** Every argument a message reads, and what it reads it as. Throws on bad syntax. */
export function messageArguments(message: string): Map<string, MessageArgumentKind> {
  const out = new Map<string, MessageArgumentKind>()
  const walk = (nodes: readonly MessageNode[]): void => {
    for (const node of nodes) {
      if (node.type === 'argument') {
        if (!out.has(node.name))
          out.set(node.name, 'simple')
      }
      else if (node.type === 'plural' || node.type === 'select') {
        out.set(node.name, node.type === 'select' ? 'select' : node.ordinal ? 'selectordinal' : 'plural')
        for (const branch of Object.values(node.options))
          walk(branch)
      }
    }
  }
  walk(parseMessage(message))
  return out
}

// ---------------------------------------------------------------------------
// Serialiser — used by the pseudo-locale, which rewrites text and nothing else
// ---------------------------------------------------------------------------

function quoteText(value: string, inPlural: boolean): string {
  let out = value.replaceAll('\'', '\'\'')
  out = out.replace(inPlural ? /[{}#]+/g : /[{}]+/g, run => `'${run}'`)
  return out
}

/** Rebuild source text from nodes. `parseMessage(serialiseMessage(n))` equals `n`. */
export function serialiseMessage(nodes: readonly MessageNode[], inPlural = false): string {
  return nodes.map((node) => {
    switch (node.type) {
      case 'text':
        return quoteText(node.value, inPlural)
      case 'argument':
        return `{${node.name}}`
      case 'pound':
        return '#'
      case 'plural':
      case 'select': {
        const kind = node.type === 'select' ? 'select' : node.ordinal ? 'selectordinal' : 'plural'
        const branchInPlural = node.type === 'plural' || inPlural
        const branches = Object.entries(node.options)
          .map(([selector, branch]) => `${selector} {${serialiseMessage(branch, branchInPlural)}}`)
          .join(' ')
        return `{${node.name}, ${kind}, ${branches}}`
      }
    }
    return ''
  }).join('')
}

/**
 * Apply `transform` to the translatable text of a message, leaving argument
 * names, selectors and `#` untouched. Throws on bad syntax.
 */
export function mapMessageText(message: string, transform: (text: string) => string): string {
  const visit = (nodes: readonly MessageNode[]): MessageNode[] => nodes.map((node) => {
    if (node.type === 'text')
      return { type: 'text', value: transform(node.value) }
    if (node.type === 'plural' || node.type === 'select') {
      const options: Record<string, MessageNode[]> = {}
      for (const [selector, branch] of Object.entries(node.options))
        options[selector] = visit(branch)
      return { ...node, options }
    }
    return node
  })
  return serialiseMessage(visit(parseMessage(message)))
}

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------

export interface FormatMessageOptions {
  /**
   * The locale whose plural rules pick a branch, when it differs from the one
   * numbers are formatted in. Set when an English default renders inside a
   * non-English application: the branches are English, so English rules must
   * choose between them, while `1,234` still groups for the reader.
   */
  readonly pluralLocale?: IntlLocaleArg
}

/**
 * A plural's value must be a number. `NaN` and `Infinity` are accepted: plural
 * rules place both in `other` and `Intl.NumberFormat` renders them, which is
 * what the concatenations this replaced did ("NaN seconds") — a component fed
 * a bad prop keeps rendering rather than throwing inside a watcher.
 */
function numeric(name: string, value: DzMessageArg | undefined): number {
  if (typeof value !== 'number')
    throw new MessageArgumentError(`"${name}" must be a number, got ${String(value)}`)
  return value
}

/**
 * Format a message for a locale. Throws {@link MessageSyntaxError} for a
 * malformed message and {@link MessageArgumentError} for a missing or mistyped
 * value — a component catches both and renders its English default instead.
 */
export function formatMessage(
  message: string,
  values: DzMessageValues,
  locale: IntlLocaleArg,
  options: FormatMessageOptions = {},
): string {
  const pluralLocale = options.pluralLocale ?? locale

  const render = (nodes: readonly MessageNode[], pound: number | undefined): string => {
    let out = ''
    for (const node of nodes) {
      switch (node.type) {
        case 'text':
          out += node.value
          break
        case 'pound':
          out += pound === undefined ? '#' : cachedNumberFormat(locale).format(pound)
          break
        case 'argument': {
          const value = values[node.name]
          if (value === undefined)
            throw new MessageArgumentError(`missing value for "${node.name}"`)
          out += typeof value === 'number' ? cachedNumberFormat(locale).format(value) : value
          break
        }
        case 'plural': {
          const count = numeric(node.name, values[node.name])
          const exact = node.options[`=${count}`]
          const category = cachedPluralRules(pluralLocale, { type: node.ordinal ? 'ordinal' : 'cardinal' })
            .select(count)
          out += render(exact ?? node.options[category] ?? node.options.other!, count)
          break
        }
        case 'select': {
          const value = values[node.name]
          if (value === undefined)
            throw new MessageArgumentError(`missing value for "${node.name}"`)
          const key = String(value)
          const branch = Object.hasOwn(node.options, key) ? node.options[key]! : node.options.other!
          out += render(branch, pound)
          break
        }
      }
    }
    return out
  }

  return render(parseMessage(message), undefined)
}
