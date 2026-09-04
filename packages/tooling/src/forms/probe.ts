/**
 * Source probe for the renderer-facing control contract (TASK-FORM-OSS-01).
 *
 * Reads every form-capable Core control and reports the facts the readiness
 * matrix can decide **without a human**: which model a value is bound to, which
 * declared props are never read, which state attributes reach the DOM, which
 * `data-state` expressions can emit a value outside `DataState`, and which
 * browser globals are touched outside an event handler.
 *
 * **Why a probe rather than a checklist.** The audit this file replaces would
 * have been thirty-nine rows of prose asserting things about source, and the
 * assertions would have been true on the day they were written. Every fact here
 * is re-read on each run, so a cell cannot claim a gap is closed while the
 * source still shows it open — which is precisely what TASK-FORM-OSS-02 needs
 * when it flips those cells one family at a time.
 *
 * What it deliberately does not decide: anything requiring judgment about
 * behaviour (does clearing emit the documented empty value? is the hydrated DOM
 * equal?). Those live in `assessments.ts` with a reviewer and a reason, and the
 * probe's job there is only to make a stale review visible.
 *
 * @module @dzup-ui/tooling/forms/probe
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const COMPONENTS = resolve(ROOT, 'packages/core/src/components')
const STORIES = resolve(ROOT, 'packages/core/stories')
const A11Y_DIR = resolve(ROOT, 'packages/core/tests/a11y')
const SSR_DIR = resolve(ROOT, 'packages/core/tests/ssr')

/**
 * The common `data-state` vocabulary — a name list, **not** a closed union.
 *
 * Mirrored from `packages/contracts/src/data-attributes.types.ts`, where it is
 * still declared as a closed union. ADR-19 §4 decided it widens to `string`
 * with each component's anatomy carrying the real constraint, and `DzInput`
 * already declares `['disabled','loading','readonly']` — none of which are in
 * this list, and all of which are correct.
 *
 * So this list is kept for one purpose: the spec beside this module asserts it
 * still equals the union in contracts, which is how the day that union widens
 * becomes visible here instead of silently changing what a probe means.
 * Nothing in the readiness matrix judges a component against it.
 */
export const DATA_STATE_VALUES = [
  'open',
  'closed',
  'active',
  'inactive',
  'checked',
  'unchecked',
  'indeterminate',
  'selected',
] as const

/** Props that {@link https://developer.mozilla.org/ MDN} would call identity. */
const IDENTITY_PROPS = ['id', 'ariaLabel', 'ariaLabelledby', 'ariaDescribedby', 'ariaInvalid'] as const
/**
 * Props the contract's C3 table names.
 *
 * Exported because `validators/form-readiness.ts` derives the C3 cell from
 * exactly this list; keeping it here means the probe and the gate cannot
 * disagree about which props are states.
 */
export const STATE_PROPS = ['disabled', 'readonly', 'loading', 'invalid', 'error', 'required'] as const
/** Props inherited from `BaseBehaviorProps`. */
const BEHAVIOR_PROPS = ['disabled', 'readonly', 'loading', 'name'] as const
/** Props inherited from `BaseValidationProps`. */
const VALIDATION_PROPS = ['invalid', 'error', 'required'] as const

/**
 * The five identity axes a control resolves against `DzFormField`.
 *
 * Detected by the *context field* each one reads, not by a variable name.
 * `DzInput` calls its merge `isInvalid` and `DzRadioGroup` does the same merge
 * inline in the template; a probe that looked for `resolvedInvalid` would have
 * called both of them broken, which is how a check earns its reputation for
 * crying wolf.
 */
export const RESOLUTIONS = ['id', 'disabled', 'required', 'invalid', 'describedby'] as const
export type Resolution = (typeof RESOLUTIONS)[number]

/** The `DzFormFieldContext` member that proves each axis was merged. */
const CONTEXT_FIELD: Record<Resolution, string> = {
  id: 'fieldId',
  disabled: 'isDisabled',
  required: 'isRequired',
  invalid: 'isInvalid',
  describedby: 'ariaDescribedby',
}

export interface ProbeModel {
  /** `null` for the default model (`v-model`), otherwise the model's name. */
  readonly name: string | null
  /** The declared type argument, verbatim. */
  readonly type: string | null
  /** Whether a `default` was given. */
  readonly hasDefault: boolean
  /** The default expression, trimmed, when short enough to be useful. */
  readonly defaultExpr: string | null
}

export interface ProbeResult {
  readonly component: string
  readonly family: string
  readonly file: string
  /** Line of the `<template>` opening tag, for citations into the template. */
  readonly templateLine: number
  /** What the props interface extends, verbatim. */
  readonly extendsClause: string
  /** Every prop the component accepts, own and inherited. */
  readonly declared: readonly string[]
  /** Declared props that appear nowhere in the `.vue` but a `withDefaults` entry. */
  readonly declaredUnread: readonly { prop: string, line: number | null }[]
  /** Models, in source order. The first is the value unless a named one is primary. */
  readonly models: readonly ProbeModel[]
  /** Whether the component injects `DzFormField` context. */
  readonly consumesFieldContext: boolean
  /** Whether the component *provides* it — true only for `DzFormField`. */
  readonly providesFieldContext: boolean
  /** Context id members the template binds, e.g. `descriptionId`. */
  readonly contextIdBindings: readonly string[]
  /** Which of the five C2 resolutions the component computes. */
  readonly resolutions: readonly Resolution[]
  /** State attributes found in the template. */
  readonly stateAttrs: {
    readonly disabled: boolean
    readonly readonly: boolean
    readonly invalid: boolean
    readonly loading: boolean
    readonly required: boolean
    readonly ariaInvalid: boolean
    readonly ariaBusy: boolean
    readonly ariaRequired: boolean
    readonly ariaReadonly: boolean
    readonly ariaDescribedby: boolean
  }
  /**
   * Literal `data-state` values the template can emit, with their line.
   *
   * `declared` is true when the component's anatomy names the value. It is
   * `null` when the component has no anatomy at all, which is a rollout state
   * (P3-02's ratchet) rather than a violation.
   */
  readonly dataStateValues: readonly { value: string, line: number, declared: boolean | null }[]
  /** `states` from `Dz{Name}.anatomy.ts`, or `null` when there is no anatomy. */
  readonly declaredStates: readonly string[] | null
  /** Browser globals read outside an event handler or lifecycle hook. */
  readonly eagerGlobals: readonly { name: string, line: number }[]
  /** Animates without a `prefers-reduced-motion` guard. */
  readonly animatesUnguarded: boolean
  readonly animates: boolean
  readonly hasContractSpec: boolean
  readonly hasAnatomy: boolean
  readonly namedInA11ySpec: boolean
  readonly namedInSsrSpec: boolean
  readonly storyPath: string | null
  readonly storyExports: readonly string[]
  /** Whether the component takes an `options`-shaped collection prop. */
  readonly takesOptions: boolean
  /** C9 surface, all of which is absent today. */
  readonly async: {
    readonly optionsState: boolean
    readonly loadOptionsEmit: boolean
    readonly abortSignal: boolean
    readonly retry: boolean
  }
}

/**
 * Read, with line endings normalised.
 *
 * The working tree is CRLF on Windows and LF in CI, and every pattern here that
 * anchors on `\n` would otherwise mean two different things on two machines.
 * Line numbers are unaffected: the count of newlines does not change.
 */
export function read(path: string): string | null {
  return existsSync(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : null
}
const lineOf = (source: string, index: number): number => source.slice(0, index).split('\n').length

function storyFor(component: string): string | null {
  if (!existsSync(STORIES))
    return null
  for (const family of readdirSync(STORIES)) {
    const candidate = join(STORIES, family, `${component}.stories.ts`)
    if (existsSync(candidate))
      return `packages/core/stories/${family}/${component}.stories.ts`
  }
  return null
}

function concatDir(dir: string): string {
  if (!existsSync(dir))
    return ''
  return readdirSync(dir)
    .filter(f => f.endsWith('.ts'))
    .map(f => read(join(dir, f)) ?? '')
    .join('\n')
}

/** Splits a `.vue` into its script and template halves. */
function split(source: string): { script: string, template: string, templateOffset: number } {
  const at = source.indexOf('\n<template>')
  if (at < 0)
    return { script: source, template: '', templateOffset: source.length }
  return { script: source.slice(0, at), template: source.slice(at), templateOffset: at }
}

/**
 * Keys an `extends` clause removes from a base with `Omit<Base, 'a' | 'b'>`.
 *
 * The base expansion below resolves an inherited interface **by name**, so
 * `extends Omit<BaseAccessibilityProps, 'ariaInvalid'>` matches
 * `/BaseAccessibilityProps/` and would contribute all five identity props —
 * including the one the component just removed. That is the worst kind of false
 * positive for this probe: it reports a prop as declared-and-unread when the
 * source says it is not declared at all, which would leave `Omit` unusable as a
 * removal mechanism and the C2 cell permanently red for a fixed component.
 *
 * Narrow on purpose. It reads string literals out of the second type argument
 * and nothing else — no `keyof`, no aliased unions, no `Pick`. A clause it
 * cannot read contributes nothing, which leaves the old behaviour: the prop
 * stays reported and the cell stays red. **The probe is allowed to miss a
 * removal; it is not allowed to invent one.**
 */
function omittedKeys(extendsClause: string): string[] {
  const out: string[] = []
  for (const omit of extendsClause.matchAll(/Omit<\s*\w+\s*,([^>]*)>/g)) {
    for (const key of (omit[1] ?? '').matchAll(/'([^']+)'/g)) {
      if (key[1] !== undefined)
        out.push(key[1])
    }
  }
  return out
}

/**
 * Every prop the component accepts.
 *
 * Own props come from the interface body; inherited ones from the `extends`
 * clause, which is resolved against the four base interfaces in
 * `@dzup-ui/contracts`, then narrowed by any {@link omittedKeys}. Resolving by
 * name rather than by parsing the contracts package keeps this a source probe
 * rather than half a type-checker; the spec beside this file pins the four
 * expansions against the real interfaces.
 */
function declaredProps(types: string, component: string): { declared: string[], extendsClause: string } {
  const header = new RegExp(`interface ${component}Props([^{]*)\\{`).exec(types)
  const extendsClause = header?.[1]?.replace(/\s+/g, ' ').trim() ?? ''
  const body = new RegExp(`interface ${component}Props[\\s\\S]*?\\n\\}`).exec(types)
  const own = new Set<string>()
  for (const match of (body?.[0] ?? '').matchAll(/^ {2}(?:readonly )?'?(\w+)'?\??:/gm)) {
    if (match[1] !== undefined)
      own.add(match[1])
  }
  const declared = new Set<string>(own)

  const add = (list: readonly string[]): void => list.forEach(p => declared.add(p))
  if (/BaseFormControlProps/.test(extendsClause)) {
    add(BEHAVIOR_PROPS)
    add(VALIDATION_PROPS)
    add(IDENTITY_PROPS)
  }
  else if (/BaseInteractiveProps/.test(extendsClause)) {
    add(BEHAVIOR_PROPS)
    add(IDENTITY_PROPS)
  }
  else {
    if (/BaseBehaviorProps/.test(extendsClause))
      add(BEHAVIOR_PROPS)
    if (/BaseValidationProps/.test(extendsClause))
      add(VALIDATION_PROPS)
    if (/BaseAccessibilityProps/.test(extendsClause))
      add(IDENTITY_PROPS)
  }
  // A key the interface declares itself outranks an `Omit` of the same name on
  // the base — the component re-declared it, so it is its own prop.
  for (const key of omittedKeys(extendsClause)) {
    if (!own.has(key))
      declared.delete(key)
  }
  return { declared: [...declared].sort(), extendsClause }
}

/**
 * A prop is "read" when it appears anywhere in the `.vue` other than as a key
 * in the `withDefaults` object.
 *
 * The bar is deliberately low. A prop referenced once in a comment counts as
 * read and this probe will not flag it — that produces a false negative, which
 * costs a gap nobody notices, where the opposite produces a false positive that
 * costs a reviewer an afternoon and then costs the whole check its credibility.
 */
function unreadProps(vue: string, declared: readonly string[]): { prop: string, line: number | null }[] {
  // `\n})` and not `\n)`: the defaults object closes the call on the same line,
  // and the looser pattern ran past it and swallowed half the component —
  // which made every prop below it look read.
  const defaults = /withDefaults\([\s\S]*?\n\}\)/.exec(vue)?.[0] ?? ''
  const withoutDefaults = defaults ? vue.replace(defaults, '\n'.repeat(defaults.split('\n').length)) : vue
  const kebab = (p: string): string => p.replace(/([A-Z])/g, s => `-${s.toLowerCase()}`)
  const out: { prop: string, line: number | null }[] = []
  for (const prop of declared) {
    const used = new RegExp(`(?:props\\.${prop}\\b|\\b${prop}\\s*[,)=.?]|:${kebab(prop)}=|\\b${prop}\\b\\s*\\?\\?)`).test(withoutDefaults)
    if (used)
      continue
    const inDefaults = new RegExp(`^\\s*${prop}:`, 'm').exec(defaults)
    const line = inDefaults ? lineOf(vue, vue.indexOf(defaults) + inDefaults.index) : null
    out.push({ prop, line })
  }
  return out
}

function models(script: string): ProbeModel[] {
  const out: ProbeModel[] = []
  for (const m of script.matchAll(/defineModel\s*(?:<([^>]*)>\s*)?\(([\s\S]{0,160}?)\)\s*$/gm)) {
    const args = m[2] ?? ''
    const named = /^\s*'([^']+)'/.exec(args)
    const def = /default:\s*([^,\n}]+)/.exec(args)
    out.push({
      name: named?.[1] ?? null,
      type: m[1] ?? null,
      hasDefault: def !== null,
      defaultExpr: def?.[1]?.trim().slice(0, 40) ?? null,
    })
  }
  return out
}

const GLOBALS = /^(?:window|document|navigator|localStorage|sessionStorage|matchMedia)$/

/**
 * Browser globals read at the top level of `<script setup>`.
 *
 * Top level is the only depth that matters: that code runs during setup, on the
 * server. Everything nested — an event handler, an `onMounted`, a `computed`
 * body — either never runs on the server or runs only when something asks for
 * it, and flagging those produces noise rather than findings.
 *
 * The first version of this counted braces per line and reported
 * `window.setTimeout` from the middle of a blur handler, because a line-at-a-time
 * count cannot survive a generic type argument or an arrow inside a call. This
 * one scans characters and tracks strings, template literals, comments and
 * regex literals, so the depth it reports is the depth the parser would.
 */
function eagerGlobals(script: string): { name: string, line: number }[] {
  const out: { name: string, line: number }[] = []
  let depth = 0
  let line = 1
  let i = 0
  let word = ''
  let wordLine = 1
  let prevSignificant = ''
  const at = (index: number): string => script[index] ?? ''

  const flush = (): void => {
    if (depth === 0 && GLOBALS.test(word) && prevSignificant !== '.' && prevSignificant !== 'typeof')
      out.push({ name: word, line: wordLine })
    if (word !== '')
      prevSignificant = word
    word = ''
  }

  while (i < script.length) {
    const c = at(i)
    if (c === '\n') {
      line++
      i++
      flush()
      continue
    }
    // Comments
    if (c === '/' && script[i + 1] === '/') {
      while (i < script.length && script[i] !== '\n') i++
      continue
    }
    if (c === '/' && script[i + 1] === '*') {
      i += 2
      while (i < script.length && !(script[i] === '*' && script[i + 1] === '/')) {
        if (script[i] === '\n')
          line++
        i++
      }
      i += 2
      continue
    }
    // Strings and template literals
    if (c === '\'' || c === '"' || c === '`') {
      flush()
      const quote = c
      i++
      while (i < script.length && script[i] !== quote) {
        if (script[i] === '\\') {
          i += 2
          continue
        }
        if (script[i] === '\n')
          line++
        i++
      }
      i++
      prevSignificant = 'string'
      continue
    }
    if (/\w|\$/.test(c)) {
      if (word === '')
        wordLine = line
      word += c
      i++
      continue
    }
    flush()
    if (c === '{' || c === '(' || c === '[')
      depth++
    else if (c === '}' || c === ')' || c === ']')
      depth = Math.max(0, depth - 1)
    if (!/\s/.test(c))
      prevSignificant = c
    i++
  }
  flush()
  return out
}

function probeOne(family: string, component: string): ProbeResult | null {
  const dir = join(COMPONENTS, family)
  const vuePath = join(dir, `${component}.vue`)
  const vue = read(vuePath)
  if (vue === null)
    return null
  const types = read(join(dir, `${component}.types.ts`)) ?? ''
  const variants = read(join(dir, `${component}.variants.ts`)) ?? ''
  const { script, template, templateOffset } = split(vue)
  const { declared, extendsClause } = declaredProps(types, component)
  const story = storyFor(component)
  const storySource = story ? read(resolve(ROOT, story)) : null

  const anatomySource = read(join(dir, `${component}.anatomy.ts`))
  const statesBlock = anatomySource === null
    ? null
    : /\n\s*states:\s*\[([^\]]*)\]/.exec(anatomySource)
  const declaredStates = anatomySource === null
    ? null
    : [...(statesBlock?.[1] ?? '').matchAll(/'([^']*)'/g)].flatMap(m => (m[1] === undefined ? [] : [m[1]]))

  const dataStateValues: { value: string, line: number, declared: boolean | null }[] = []
  for (const m of template.matchAll(/:?data-state="([^"]*)"/g)) {
    const expression = m[1]
    if (expression === undefined)
      continue
    const line = lineOf(vue, templateOffset + m.index)
    for (const lit of expression.matchAll(/'([^']*)'/g)) {
      const value = lit[1]
      if (value === undefined || value === '')
        continue
      dataStateValues.push({
        value,
        line,
        declared: declaredStates === null ? null : declaredStates.includes(value),
      })
    }
    if (!expression.includes('\'') && !expression.includes('?')) {
      // A bare binding such as `:data-state="state"` — value not decidable here.
      dataStateValues.push({ value: `«${expression.trim()}»`, line, declared: true })
    }
  }

  const resolutions = RESOLUTIONS.filter(r =>
    new RegExp(`\\b${CONTEXT_FIELD[r]}\\b`).test(vue),
  )

  /**
   * Movement, not decoration.
   *
   * WCAG 2.3.3 is about motion — transforms, and the named keyframe animations.
   * A `transition-colors` on a focus ring is neither a vestibular hazard nor
   * something anybody would guard, and a check that demanded a `motion-reduce`
   * beside every one of them would be switched off inside a week and take the
   * real findings with it.
   */
  const animates = /transition-transform|transition-all|animate-(?!none)|(?:^|[\s'"`:])-?(?:translate|scale|rotate|skew)-/.test(vue + variants)
  const motionGuard = /motion-reduce|prefers-reduced-motion|useReducedMotion|reducedMotion/.test(vue + variants)

  return {
    component,
    family,
    file: `packages/core/src/components/${family}/${component}.vue`,
    templateLine: lineOf(vue, templateOffset) + 1,
    extendsClause,
    declared,
    declaredUnread: unreadProps(vue, declared),
    models: models(script),
    consumesFieldContext: script.includes('useFormFieldContext'),
    providesFieldContext: /\buseFormField\s*\(/.test(script),
    contextIdBindings: [...template.matchAll(/context\??\.(\w+Id)\b/g)]
      .flatMap(m => (m[1] === undefined ? [] : [m[1]]))
      .filter((v, i, a) => a.indexOf(v) === i),
    resolutions,
    stateAttrs: {
      disabled: /data-disabled=/.test(template),
      readonly: /data-readonly=/.test(template),
      invalid: /data-invalid=/.test(template),
      loading: /data-loading=/.test(template),
      required: /data-required=/.test(template),
      ariaInvalid: /aria-invalid=/.test(template),
      ariaBusy: /aria-busy=/.test(template),
      ariaRequired: /aria-required=/.test(template),
      ariaReadonly: /aria-readonly=/.test(template),
      ariaDescribedby: /aria-describedby=/.test(template),
    },
    dataStateValues,
    declaredStates,
    eagerGlobals: eagerGlobals(script),
    animates,
    animatesUnguarded: animates && !motionGuard,
    hasContractSpec: existsSync(join(dir, `${component}.contract.spec.ts`)),
    hasAnatomy: existsSync(join(dir, `${component}.anatomy.ts`)),
    namedInA11ySpec: concatDir(A11Y_DIR).includes(component),
    namedInSsrSpec: concatDir(SSR_DIR).includes(component),
    storyPath: story,
    storyExports: storySource
      ? [...storySource.matchAll(/^export const (\w+)/gm)].flatMap(m => (m[1] === undefined ? [] : [m[1]]))
      : [],
    takesOptions: /\boptions\??:/.test(types),
    /**
     * The C9 surface, detected by the contract a control extends as well as by
     * the members it declares itself.
     *
     * `DzSelect` extends `AsyncOptionsProps` and `AsyncOptionsEmits` and so the
     * words `optionsState` and `AbortSignal` appear nowhere in its own types
     * file — a probe looking only for those strings reported the one control
     * that had the seam as not having it.
     */
    async: {
      optionsState: types.includes('AsyncOptionsProps') || types.includes('optionsState'),
      loadOptionsEmit: types.includes('AsyncOptionsEmits') || types.includes('\'load-options\''),
      abortSignal: types.includes('AsyncOptionsEmits') || types.includes('AbortSignal'),
      retry: types.includes('AsyncOptions') || types.includes('optionsRetryable'),
    },
  }
}

/** Probes every control named, skipping any whose `.vue` has been removed. */
export function probeControls(controls: readonly (readonly [string, string])[]): ProbeResult[] {
  const out: ProbeResult[] = []
  for (const [family, component] of controls) {
    const result = probeOne(family, component)
    if (result !== null)
      out.push(result)
  }
  return out
}

/**
 * The value model.
 *
 * The default model when there is one; otherwise the one literally named
 * `value`, which is the convention six controls use; otherwise the first.
 * Ordering matters: `DzInplace` declares `active` before `value`, and taking
 * the first model would have reported its open/closed flag as the field's value.
 */
export function valueModel(result: ProbeResult): ProbeModel | null {
  return result.models.find(m => m.name === null)
    ?? result.models.find(m => m.name === 'value')
    ?? result.models[0]
    ?? null
}
