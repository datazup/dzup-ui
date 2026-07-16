import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, ref, toValue } from 'vue'

/**
 * useBlockCodeView — derive the Code-tab variants from one canonical SFC.
 *
 * The Code tab shows a block's verbatim `?raw` source (docs/blocks.md §3.2). A
 * best-in-class gallery lets a developer pick *Full SFC ↔ Template-only* and
 * *TS ↔ JS*, and shows the one import line a consumer needs. Crucially, EVERY
 * variant is derived deterministically from the single `getBlockSource(path)` at
 * runtime — there is no second copy of the code, so the snippet can never drift
 * from what renders.
 *
 * Three pure derivations back the toggles, each exported for direct unit testing:
 *   • `extractTemplate(source)` — the root `<template>` element, verbatim.
 *   • `toJavaScript(source)`    — a best-effort TS→JS *annotation strip* (NOT a
 *                                 compiler — see the function's contract below).
 *   • `buildImportLine(names)`  — `import { … } from '@dzup-ui/core'` from
 *                                 `components[]`.
 *
 * The composable wires those into reactive `code` (the currently-shown variant)
 * + `importLine` outputs plus the `format`/`lang` toggle state, so a host like
 * BlockPreview binds them straight to DzSegmented / DzCodeBlock / DzCopyButton.
 */

/** Full single-file component vs. just its `<template>` markup. */
export type CodeFormat = 'sfc' | 'template'
/** TypeScript (canonical) vs. the derived, type-stripped JavaScript. */
export type CodeLang = 'ts' | 'js'

export interface UseBlockCodeView {
  /** Selected output shape — two-way for a DzSegmented v-model. */
  format: Ref<CodeFormat>
  /**
   * Selected language — two-way for a DzSegmented v-model. Only meaningful for
   * the `sfc` format; the `template` format is identical in TS and JS (markup
   * carries no types), so this is ignored while `format === 'template'`.
   */
  lang: Ref<CodeLang>
  /** The exact code string for the current `format`/`lang` — show AND copy this. */
  code: ComputedRef<string>
  /** `import { … } from '@dzup-ui/core'` from `components[]`, or '' when empty. */
  importLine: ComputedRef<string>
  /** `'vue'` for an SFC, `'html'` for template-only — drives DzCodeBlock syntax. */
  language: ComputedRef<string>
}

// ---------------------------------------------------------------------------
// Pure derivations (one source of truth: the canonical SFC string)
// ---------------------------------------------------------------------------

/**
 * Extract the root `<template>` element (open tag → matching close), verbatim.
 *
 * The match is intentionally greedy so it spans to the *last* `</template>`,
 * which is the root element's close — Vue blocks nest `<template #slot>` children
 * whose own `</template>` tags must stay inside the result. Returns the trimmed
 * element, or '' when the source has no template block.
 */
export function extractTemplate(source: string): string {
  const match = source.match(/<template[^>]*>[\s\S]*<\/template>/)
  return match ? match[0].trim() : ''
}

/**
 * Build the consumer import line from a block's `components[]`.
 *
 * Names are emitted in authored order (matching the "Built from" chips) so the
 * line reads identically to the registry entry. Returns '' for an empty list.
 */
export function buildImportLine(components: readonly string[]): string {
  if (components.length === 0) return ''
  return `import { ${components.join(', ')} } from '@dzup-ui/core'`
}

/**
 * Best-effort TS→JS conversion for our block style — an ANNOTATION STRIPPER,
 * **not** a TypeScript compiler.
 *
 * Blocks are deliberately small, self-contained SFCs (no props/emits, no
 * decorators, no `enum`/namespace, no `.d.ts` gymnastics), so a handful of
 * targeted, confined regexes produce JS that is clearly correct for *this*
 * catalog. We only touch the `<script>` region (template/style are left exactly
 * as-is), and we handle exactly these patterns:
 *
 *   1. `<script setup lang="ts">`            → drop the `lang="ts"` attribute.
 *   2. `import type { … } from '…'`           → removed (type-only imports).
 *   3. `import { a, type B }`                 → drop inline `type` specifiers.
 *   4. `ref<…>()`, `computed<…>()`, `new Map<…>()`, … (a known Vue/builtin
 *      allowlist)                             → drop the generic type argument.
 *   5. `): ReturnType {` / `): ReturnType =>` → drop the return-type annotation.
 *   6. `(event: KeyboardEvent)`               → drop parameter type annotations.
 *   7. `const x: Type = …`                    → drop the variable annotation.
 *   8. `'danger' as const`                    → drop the `as const` assertion.
 *
 * What it does NOT do (out of scope by design — do not rely on it): arbitrary
 * `as Type` casts, `interface`/`type`/`enum` declarations, non-null `!`, generic
 * function calls outside the allowlist, or anything requiring real type
 * inference. None of those appear in the blocks catalog; if a future block needs
 * them, prefer reshaping the block over teaching this stripper to compile.
 */
export function toJavaScript(source: string): string {
  // Confine every transform to <script> blocks (an SFC may have two — e.g. a
  // plain `<script>` beside `<script setup>`); template/style stay verbatim.
  return source.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (_full, open: string, body: string, close: string) => {
    const openJs = open.replace(/\s+lang=(["'])ts\1/, '')
    return openJs + stripTypesFromScript(body) + close
  })
}

/** Vue/runtime callees whose generic type argument is purely a type (safe to drop). */
const GENERIC_CALLEES = [
  'ref', 'shallowRef', 'computed', 'reactive', 'shallowReactive', 'customRef',
  'defineModel', 'defineProps', 'defineEmits', 'withDefaults',
  'inject', 'provide', 'toRef', 'toRefs', 'useTemplateRef',
]

function stripTypesFromScript(body: string): string {
  let out = body

  // 2. Type-only imports — whole statement (handles multi-line member lists).
  out = out.replace(/import\s+type\s+(?:\{[^}]*\}|[A-Za-z_$][\w$]*)\s+from\s+(["'])[^"']*\1;?[ \t]*\n?/g, '')

  // 3. Inline `type` specifiers in a value import: `{ a, type B, c }`.
  out = out.replace(/,\s*type\s+[A-Za-z_$][\w$]*/g, '')
  out = out.replace(/\{\s*type\s+[A-Za-z_$][\w$]*\s*,/g, '{')

  // 4. Generic type arguments on known callees: `ref<…>(` and `new Map<…>(`.
  //    The inner class allows one level of nested generics (e.g. Map<string, Foo[]>).
  const inner = '(?:[^<>]|<[^<>]*>)*'
  const calleeAlt = GENERIC_CALLEES.join('|')
  out = out.replace(new RegExp(`\\b(${calleeAlt})\\s*<${inner}>\\s*\\(`, 'g'), '$1(')
  out = out.replace(new RegExp(`\\bnew\\s+(Map|Set|WeakMap|WeakSet)\\s*<${inner}>\\s*\\(`, 'g'), 'new $1(')

  // A type token: identifier with members/generics/arrays/unions, but NO ':' —
  // excluding ':' is what stops a match from spanning into the next annotation.
  const typeToken = '[A-Za-z_$][\\w$.<>\\[\\], |&]*'

  // 5. Return-type annotations: `): T {` or `): T =>` → `) {` / `) =>`.
  //    (`\s*` is consumed around the type, so a single space is re-inserted.)
  out = out.replace(new RegExp(`\\)\\s*:\\s*${typeToken}\\s*(=>|\\{)`, 'g'), ') $1')

  // 6. Parameter annotations: `(event: KeyboardEvent` / `, x: number`.
  //    Anchored to `(`/`,` before and a `,`/`)` after so object literals (which
  //    close with `}`) and ternaries are left untouched.
  out = out.replace(new RegExp(`([(,])\\s*([A-Za-z_$][\\w$]*)\\s*:\\s*${typeToken}(?=\\s*[,)])`, 'g'), '$1$2')

  // 7. Variable annotations: `const x: Type = …` → `const x = …`.
  out = out.replace(new RegExp(`\\b(const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*:\\s*${typeToken}\\s*=`, 'g'), '$1 $2 =')

  // 8. `as const` assertions (the only cast idiom our blocks use).
  out = out.replace(/\s+as\s+const\b/g, '')

  // Tidy up blank lines left by removed type imports (3+ newlines → 2).
  out = out.replace(/\n{3,}/g, '\n\n')

  return out
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * @param source     The canonical `BlockDef.source` (`?raw` SFC string).
 * @param components The block's `components[]` — real `Dz*` export names.
 */
export function useBlockCodeView(
  source: MaybeRefOrGetter<string>,
  components: MaybeRefOrGetter<readonly string[]>,
): UseBlockCodeView {
  const format = ref<CodeFormat>('sfc')
  const lang = ref<CodeLang>('ts')

  const importLine = computed(() => buildImportLine(toValue(components)))

  const code = computed(() => {
    const src = toValue(source)
    // Template-only is language-agnostic — markup is identical in TS and JS.
    if (format.value === 'template') return extractTemplate(src)
    return lang.value === 'js' ? toJavaScript(src) : src
  })

  const language = computed(() => (format.value === 'template' ? 'html' : 'vue'))

  return { format, lang, code, importLine, language }
}
