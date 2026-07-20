/**
 * build-playground-snippets.mjs — derive one runnable playground SFC per component
 * so every component docs page can offer "Open in playground" preloaded with THAT
 * component (TASK-FREE2-12).
 *
 * WHY generated, not hand-added: the alternative — pasting a REPL block into 139+
 * autodocs pages — is exactly the hand-maintained duplication that let counts and
 * comments rot elsewhere in this repo. One derivation keeps every page in step with
 * the source of truth for free.
 *
 * WHERE the snippet comes from (same source the llms.txt build already mines): the
 * `@example` ```vue fence in each component's `.vue` header. Those fences are
 * template fragments*, not runnable SFCs — they reference components that must be
 * imported and script bindings (`v-model="x"`, `@click="save"`) that must be
 * declared. This script wraps each fragment into a self-contained
 * `<script setup>` + `<template>` SFC that resolves entirely against `@dzup-ui/core`
 * and `vue` — the only two specifiers the REPL sandbox import map provides
 * (stories/_blocks/playground.config.ts).
 *
 * HOW it never ships a broken preload:
 *   1. Every wrapped SFC is COMPILE-VALIDATED with `@vue/compiler-sfc` (the same
 *      compiler the REPL uses). A fence that cannot be converted (compile error,
 *      or a compound composition we can't satisfy) falls back to its family's
 *      starter snippet — a known-good sibling example — never a broken or empty one.
 *   2. Unknown non-`Dz` placeholder tags in a fence (`<SearchIcon />`, `<UserIcon />`)
 *      can't resolve in the sandbox, so they're replaced with a neutral glyph span
 *      rather than left to warn "failed to resolve component" in the preview.
 *   3. A cross-family SAMPLE is additionally run in a real browser REPL by
 *      scripts/verify-repl.mjs — compile-validation proves it parses; that proves
 *      it mounts.
 *
 * OUTPUT: apps/storybook/stories/_data/playgroundSnippets.generated.ts —
 * `PLAYGROUND_SNIPPETS: Record<componentName, { code, source }>`, keyed by the
 * component name that is the last segment of every `Core/<Family>/<Component>`
 * story title, so the docs block can look a page's snippet up by name.
 *
 * COMMITTED (unlike its gitignored `_data/*.generated.ts` siblings): the docs
 * block that reads it is referenced from `.storybook/preview.ts`, which the Vitest
 * `storybook` test project loads — and that CI job has no generation step. A
 * gitignored import there would make the job structurally red (the trap TASK-FREE
 * hit with the landing's untracked generated files). So this file is committed and
 * a CI drift-guard (`git diff --exit-code`) keeps it honest.
 *
 * Run before `storybook dev` / `storybook build` via the `build:playground-snippets`
 * package script, same lifecycle as build-llms / build-releases.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parse as parseSfc } from '@vue/compiler-sfc'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, '..')
const repoRoot = resolve(appRoot, '../..')
const coreRoot = resolve(repoRoot, 'packages/core')
const componentsRoot = resolve(coreRoot, 'src/components')
const MANIFEST = resolve(coreRoot, 'manifests/public-api.manifest.json')
const OUT = resolve(appRoot, 'stories/_data/playgroundSnippets.generated.ts')

/**
 * One representative component per family whose (validated) snippet doubles as the
 * family's starter fallback. Chosen for being self-contained — each mounts on its
 * own with no parent context, required data, or portal — so a component whose own
 * example can't be converted still lands on a live, on-topic preview.
 */
const FAMILY_REPRESENTATIVE = {
  buttons: 'DzButton',
  cards: 'DzCard',
  inputs: 'DzInput',
  forms: 'DzSwitch',
  layout: 'DzDivider',
  navigation: 'DzColorModeToggle',
  overlays: 'DzTooltip',
  feedback: 'DzBadge',
  data: 'DzTag',
  media: 'DzAvatar',
  typography: 'DzText',
}

/**
 * Identifiers that appear in template expressions but must NOT be declared as refs:
 * JS globals/keywords and the `$event` template local. Anything else that a binding
 * references and we can't see a declaration for gets a `ref()` (or a handler stub).
 */
const RESERVED = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'this',
  'in',
  'of',
  'new',
  'typeof',
  'instanceof',
  'void',
  'delete',
  'if',
  'else',
  'return',
  'await',
  'async',
  'function',
  'const',
  'let',
  'var',
  '$event',
  'event',
  'window',
  'document',
  'console',
  'Math',
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'JSON',
  'Date',
  'Promise',
  'Set',
  'Map',
  'NaN',
  'Infinity',
])

// ── @example fence extraction (mirrors build-llms.mjs parseVue) ───────────────

/** Pull the first ```vue fenced block out of a component's `.vue` header comment. */
function exampleFence(vueSource) {
  const commentMatch = vueSource.match(/\/\*\*([\s\S]*?)\*\//)
  if (!commentMatch)
    return ''
  const comment = commentMatch[1]
    .split(/\r?\n/)
    .map(l => l.replace(/^\s*\*?\s?/, ''))
    .join('\n')
  const fence = comment.match(/```vue[ \t]*\r?\n([\s\S]*?)```/)
  return fence ? fence[1].replace(/\s+$/, '') : ''
}

// ── Fragment → runnable SFC ───────────────────────────────────────────────────

/** Every PascalCase tag in the fragment, split into dzup (`Dz*`) and unknown. */
function collectTags(fragment) {
  const dzup = new Set()
  const unknown = new Set()
  for (const m of fragment.matchAll(/<\/?([A-Z][A-Za-z0-9]*)\b/g)) {
    const tag = m[1]
    if (tag.startsWith('Dz'))
      dzup.add(tag)
    else
      unknown.add(tag)
  }
  return { dzup, unknown }
}

/** Replace unknown non-`Dz` component tags (icons etc.) with a neutral glyph span. */
function stripUnknownTags(fragment, unknown) {
  let out = fragment
  for (const tag of unknown) {
    // Paired: <Tag …>…</Tag>  → <span aria-hidden="true">◆</span>
    out = out.replace(
      new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, 'g'),
      '<span aria-hidden="true">◆</span>',
    )
    // Self-closing / void: <Tag … />  or  <Tag …>
    out = out.replace(new RegExp(`<${tag}\\b[^>]*/?>`, 'g'), '<span aria-hidden="true">◆</span>')
  }
  return out
}

/** Root identifier of an expression (`a.b(c)` → `a`), or '' if it isn't one. */
function rootIdent(expr) {
  const m = expr.trim().match(/^([a-z_$][\w$]*)/i)
  return m ? m[1] : ''
}

/**
 * Scan the fragment's bindings for identifiers that need a `<script setup>`
 * declaration, classifying each as a reactive ref or an event-handler stub. Only
 * enough to make the example interactive; anything missed still renders (Vue treats
 * an unknown template ref as `undefined`, it does not throw), so this is best-effort
 * and the compile gate is the real guarantee.
 */
function collectBindings(fragment, componentTags) {
  const refs = new Set()
  const handlers = new Set()
  const forLocals = new Set()

  // v-for locals are template-scoped, never script declarations. Capture the whole
  // `"…"` value first and split `lhs in|of rhs` in plain JS — a single regex with a
  // `\s+…([^"]+)` tail can backtrack super-linearly (regexp/no-super-linear-backtracking).
  for (const m of fragment.matchAll(/v-for\s*=\s*"([^"]*)"/g)) {
    const split = m[1].split(/\s+(?:in|of)\s+/)
    if (split.length < 2)
      continue
    const lhs = split[0].replace(/^\(|\)$/g, '')
    for (const l of lhs.split(','))
      forLocals.add(rootIdent(l.trim()))
    const src = rootIdent(split[1])
    if (src)
      refs.add(src)
  }

  const consider = (expr, asRef) => {
    for (const idm of expr.matchAll(/(?<![.\w$])([a-z_$][\w$]*)/gi)) {
      const id = idm[1]
      if (RESERVED.has(id) || componentTags.has(id) || forLocals.has(id))
        continue
      if (asRef)
        refs.add(id)
    }
  }

  // Event handlers: a bare `@evt="ident"` is a function; anything else is inline
  // code whose identifiers are refs (`@click="count++"`).
  for (const m of fragment.matchAll(/@[\w:.\-[\]]+\s*=\s*"([^"]*)"/g)) {
    const expr = m[1].trim()
    if (/^[a-z_$][\w$]*$/i.test(expr) && !RESERVED.has(expr) && !componentTags.has(expr))
      handlers.add(expr)
    else
      consider(expr, true)
  }

  // v-model, :bound props (skip JS literals), and {{ interpolations }} → refs.
  for (const m of fragment.matchAll(/v-model(?::[\w-]+)?\s*=\s*"([^"]*)"/g))
    consider(m[1], true)
  for (const m of fragment.matchAll(/(?:^|\s):[\w-]+\s*=\s*"([^"]*)"/g)) {
    const expr = m[1].trim()
    if (/^[[{'"`]|^-?\d|^(?:true|false|null)$/.test(expr))
      continue // inline literal — no binding needed
    consider(expr, true)
  }
  for (const m of fragment.matchAll(/v-(?:if|else-if|show)\s*=\s*"([^"]*)"/g))
    consider(m[1], true)
  for (const m of fragment.matchAll(/\{\{([^}]*)\}\}/g))
    consider(m[1], true)

  // A name can't be both; a function wins (it was used as a bare handler).
  for (const h of handlers)
    refs.delete(h)

  return { refs: [...refs], handlers: [...handlers] }
}

/** Wrap a template fragment into a self-contained SFC string. */
function wrapSfc(fragment, name) {
  const { dzup, unknown } = collectTags(fragment)
  dzup.add(name) // always import the documented component itself
  const template = stripUnknownTags(fragment, unknown)
  const { refs, handlers } = collectBindings(template, dzup)

  const imports = []
  if (refs.length)
    imports.push(`import { ref } from 'vue'`)
  imports.push(`import { ${[...dzup].sort().join(', ')} } from '@dzup-ui/core'`)

  const decls = [
    ...refs.map(r => `const ${r} = ref()`),
    ...handlers.map(h => `function ${h}() {}`),
  ]

  const body = template
    .split('\n')
    .map(l => (l.length ? `  ${l}` : l))
    .join('\n')

  return [
    `<script setup lang="ts">`,
    ...imports,
    ...(decls.length ? ['', ...decls] : []),
    `</script>`,
    ``,
    `<template>`,
    body,
    `</template>`,
    ``,
  ].join('\n')
}

/** Compile a wrapped SFC; returns the list of errors ([] when it compiles cleanly). */
function compileErrors(sfc, id) {
  const { descriptor, errors } = parseSfc(sfc, { filename: id })
  const out = errors.map(e => (e.message ?? String(e)))
  if (!descriptor.template || descriptor.template.content.trim().length === 0)
    out.push('no <template> content')
  return out
}

// ── Build ─────────────────────────────────────────────────────────────────────

async function readVue(family, name) {
  try {
    return await readFile(resolve(componentsRoot, family, `${name}.vue`), 'utf8')
  }
  catch {
    return ''
  }
}

const DEBUG = process.env.DEBUG_SNIPPETS === '1'

/** Derive a component's primary snippet: converted example, or null if it can't be. */
function deriveSnippet(name, vueSource) {
  const fence = exampleFence(vueSource)
  if (!fence) {
    if (DEBUG)
      console.log(`  ✗ ${name}: no @example fence`)
    return null
  }
  const sfc = wrapSfc(fence, name)
  const errors = compileErrors(sfc, `${name}.playground.vue`)
  if (errors.length) {
    if (DEBUG)
      console.log(`  ✗ ${name}: ${errors.join(' | ')}`)
    return null
  }
  return sfc
}

async function run() {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  const families = Object.entries(manifest.exports.components)

  // Pass 1 — derive each component's own converted snippet (or null).
  const derived = new Map() // name → { family, sfc|null }
  for (const [family, entry] of families) {
    for (const name of entry.exports) {
      const vueSource = await readVue(family, name)
      derived.set(name, { family, sfc: vueSource ? deriveSnippet(name, vueSource) : null })
    }
  }

  // Pass 2 — resolve family starters from each representative's derived snippet.
  const familyStarter = {} // family → sfc
  for (const [family, rep] of Object.entries(FAMILY_REPRESENTATIVE)) {
    const d = derived.get(rep)
    if (!d || !d.sfc) {
      console.error(
        `[playground-snippets] family representative ${rep} (${family}) has no convertible `
        + `@example — its snippet would have been the fallback for the whole family. Fix its `
        + `@example or pick another representative in FAMILY_REPRESENTATIVE.`,
      )
      process.exitCode = 1
      return
    }
    familyStarter[family] = d.sfc
  }

  // Names with a converted example, longest first — used to resolve a compound
  // subpart (DzTableRow, DzDialogTitle) to its PARENT's example, which shows the
  // subpart in real context. This is a strictly better fallback than a family
  // sibling, so it's tried first.
  const withExample = [...derived.entries()]
    .filter(([, d]) => d.sfc)
    .map(([n]) => n)
    .sort((a, b) => b.length - a.length)

  const parentOf = (name) => {
    for (const parent of withExample) {
      if (parent !== name && name.startsWith(parent))
        return parent
    }
    return null
  }

  // Pass 3 — assemble the final map: own example → parent example → family starter.
  const snippets = {} // name → { code, source }
  let exampleCount = 0
  let fallbackCount = 0
  let parentCount = 0
  let familyCount = 0
  for (const [name, { family, sfc }] of derived) {
    if (sfc) {
      snippets[name] = { code: sfc, source: 'example' }
      exampleCount += 1
      continue
    }
    const parent = parentOf(name)
    if (parent)
      parentCount += 1
    else
      familyCount += 1
    snippets[name] = {
      code: parent ? derived.get(parent).sfc : familyStarter[family],
      source: 'fallback',
    }
    fallbackCount += 1
  }

  await writeFile(OUT, emit(snippets), 'utf8')
  console.log(
    `[playground-snippets] wrote ${Object.keys(snippets).length} snippets `
    + `(${exampleCount} from @example, ${fallbackCount} fallback: `
    + `${parentCount} to a parent example, ${familyCount} to a family starter) → ${OUT.replace(repoRoot, '.')}`,
  )
}

/** Emit the typed, committed data module. */
function emit(snippets) {
  const entries = Object.entries(snippets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, { code, source }]) =>
      `  ${JSON.stringify(name)}: { source: ${JSON.stringify(source)}, code: ${JSON.stringify(code)} },`,
    )
    .join('\n')

  return `/**
 * AUTO-GENERATED by apps/storybook/scripts/build-playground-snippets.mjs — DO NOT EDIT.
 *
 * One runnable playground SFC per component, keyed by the component name that is the
 * last segment of its \`Core/<Family>/<Component>\` story title. Consumed by
 * stories/_blocks/OpenInPlayground.ts to seed the per-page playground.
 *
 * \`source: 'example'\` — converted from the component's own \`@example\`.
 * \`source: 'fallback'\` — the family's starter snippet (the component's example could
 * not be converted automatically; the preview is a live, on-topic family sibling).
 *
 * COMMITTED on purpose (see the generator header): reached from .storybook/preview.ts,
 * which the Vitest \`storybook\` test job loads with no generation step. A CI drift-guard
 * regenerates and asserts this file is unchanged.
 */
/* eslint-disable */
export interface PlaygroundSnippet {
  /** A self-contained SFC that resolves only against \`@dzup-ui/core\` and \`vue\`. */
  code: string
  /** Whether the code is the component's own example or its family starter fallback. */
  source: 'example' | 'fallback'
}

export const PLAYGROUND_SNIPPETS: Record<string, PlaygroundSnippet> = {
${entries}
}
`
}

run().catch((err) => {
  console.error('[playground-snippets] build failed:', err)
  process.exitCode = 1
})
