/**
 * build-llms.mjs — generate an `llms.txt` + `llms-full.txt` for the @dzup-ui/core
 * component API and drop them into the Storybook static build.
 *
 * WHY: AI coding tools increasingly discover libraries through an `llms.txt`
 * index (https://llmstxt.org). `apps/landing` already ships one for the *blocks*,
 * but the component API itself — import paths, the frozen variant/size/tone
 * taxonomy, props/emits/slots and a minimal usage snippet — was never exposed.
 * A structured Markdown index of every component's public surface materially
 * raises the odds an assistant recommends dzup-ui and wires it up correctly.
 *
 * HOW (never drifts): everything is derived from source, not hand-authored:
 *   - the component roster + ordering ← packages/core/manifests/public-api.manifest.json (ADR-01)
 *   - the frozen taxonomies (ButtonVariant, CanonicalSize, …) ← @dzup-ui/contracts
 *   - props / emits / slots ← each component's `*.types.ts` interfaces (parsed with
 *     the TypeScript compiler API, so `extends Base*Props<Variant>` chains resolve
 *     and generic type-parameters are substituted correctly)
 *   - description + minimal usage snippet ← the `@example` in each `.vue` header
 *   - v-model names ← `defineModel()` calls in each `.vue` (ADR-16)
 *
 * OUTPUT (git-ignored build artifacts, regenerated from workspace source):
 *   apps/storybook/public/llms.txt        concise index + per-component summaries
 *   apps/storybook/public/llms-full.txt   the above + full member tables + snippets
 *
 * Storybook copies `public/` into `storybook-static/`, so once deployed the files
 * are reachable at `/storybook/llms.txt` and `/storybook/llms-full.txt`, and the
 * landing `llms.txt` cross-links to them.
 *
 * Run automatically before `storybook dev` / `storybook build` (see the
 * `build:llms` package script), same lifecycle as build-playground / build-releases.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, '..')
const repoRoot = resolve(appRoot, '../..')
const coreRoot = resolve(repoRoot, 'packages/core')
const contractsSrc = resolve(repoRoot, 'packages/contracts/src')
const componentsRoot = resolve(coreRoot, 'src/components')
const MANIFEST = resolve(coreRoot, 'manifests/public-api.manifest.json')
const OUT_INDEX = resolve(appRoot, 'public/llms.txt')
const OUT_FULL = resolve(appRoot, 'public/llms-full.txt')

/** Human labels + one-line summaries for the 11 component families. */
const FAMILY_LABELS = {
  buttons: 'Buttons',
  cards: 'Cards',
  inputs: 'Inputs',
  forms: 'Forms',
  layout: 'Layout',
  navigation: 'Navigation',
  overlays: 'Overlays',
  feedback: 'Feedback',
  data: 'Data display',
  media: 'Media',
  typography: 'Typography',
}

// ---------------------------------------------------------------------------
// Registries populated by parsing (see collectSource)
// ---------------------------------------------------------------------------

/** name → interface descriptor { members, heritage, typeParams }. */
const interfaces = new Map()
/** name → string[] for string-literal-union type aliases (the taxonomies). */
const typeAliases = new Map()
/** name → referenced alias name, for `type A = B` re-exports (e.g. DzCardVariant = CardVariant). */
const aliasRefs = new Map()
/** DzXxx → { description, example, models: [{ name, type }] } from the .vue file. */
const vueMeta = new Map()

// ---------------------------------------------------------------------------
// TypeScript-compiler-API parsing
// ---------------------------------------------------------------------------

function sourceFileFor(path, text) {
  return ts.createSourceFile(path, text, ts.ScriptTarget.Latest, /* setParentNodes */ true)
}

/** Extract the leading `/** … *\/` doc for a node and flatten it to one line. */
function leadingDoc(node, sf) {
  const ranges = ts.getLeadingCommentRanges(sf.text, node.getFullStart()) ?? []
  const block = ranges.filter(r => r.kind === ts.SyntaxKind.MultiLineCommentTrivia).pop()
  if (!block)
    return ''
  const raw = sf.text.slice(block.pos, block.end)
  const lines = raw
    .replace(/^\/\*\*?/, '')
    .replace(/\*\/$/, '')
    .split(/\r?\n/)
    .map(l => l.replace(/^\s*\*?\s?/, '').trimEnd())

  // Keep only the description prose: JSDoc tags (@example, @param, …) and the
  // fenced code blocks that follow them come after the description, so stop at
  // the first tag line rather than merely filtering tags out (which would leak
  // an `@example`'s ```vue fence into a Markdown table cell).
  const description = []
  for (const l of lines) {
    if (/^@\w/.test(l))
      break
    description.push(l)
  }
  return description
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Pull the string-literal members out of a union / single literal type node. */
function stringLiteralUnion(typeNode) {
  const out = []
  const visit = (n) => {
    if (ts.isUnionTypeNode(n)) {
      n.types.forEach(visit)
    }
    else if (ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal)) {
      out.push(n.literal.text)
    }
    else if (ts.isParenthesizedTypeNode(n)) {
      visit(n.type)
    }
  }
  visit(typeNode)
  return out
}

/** Register every interface + string-literal type alias in a .ts source string. */
function indexDeclarations(path, text) {
  const sf = sourceFileFor(path, text)
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      const members = []
      for (const m of node.members) {
        if (!ts.isPropertySignature(m) && !ts.isMethodSignature(m))
          continue
        const name = m.name?.getText(sf)
        if (!name)
          continue
        members.push({
          name,
          optional: !!m.questionToken,
          type: m.type ? m.type.getText(sf).replace(/\s+/g, ' ') : 'unknown',
          doc: leadingDoc(m, sf),
        })
      }
      const heritage = []
      for (const clause of node.heritageClauses ?? []) {
        for (const t of clause.types) {
          heritage.push({
            name: t.expression.getText(sf),
            args: (t.typeArguments ?? []).map(a => a.getText(sf)),
          })
        }
      }
      const typeParams = (node.typeParameters ?? []).map(tp => ({
        name: tp.name.getText(sf),
        default: tp.default ? tp.default.getText(sf) : undefined,
      }))
      interfaces.set(node.name.getText(sf), { members, heritage, typeParams })
    }
    else if (ts.isTypeAliasDeclaration(node)) {
      const aliasName = node.name.getText(sf)
      const lits = stringLiteralUnion(node.type)
      if (lits.length)
        typeAliases.set(aliasName, lits)
      else if (ts.isTypeReferenceNode(node.type))
        aliasRefs.set(aliasName, node.type.typeName.getText(sf))
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sf, visit)
}

// ---------------------------------------------------------------------------
// Interface resolution (heritage + generic substitution)
// ---------------------------------------------------------------------------

/** Substitute generic type-parameters within a member's type text (word-boundary). */
function substituteParams(typeText, argMap) {
  let out = typeText
  for (const [param, arg] of Object.entries(argMap)) {
    if (param === arg)
      continue
    out = out.replace(new RegExp(`\\b${param}\\b`, 'g'), arg)
  }
  return out
}

/**
 * Resolve an interface to its full merged member set, walking `extends` chains
 * and substituting generic type-parameters (so `extends BaseAppearanceProps<
 * CanonicalSize, InputVariant>` yields a concrete `variant: InputVariant`).
 *
 * Returns { own, all, bases } where `own` are the directly-declared members,
 * `all` is the merged map, and `bases` is the list of extended interface names.
 */
function resolveInterface(name, argMap = {}, seen = new Set()) {
  const decl = interfaces.get(name)
  if (!decl || seen.has(name))
    return { own: [], all: new Map(), bases: [] }
  seen.add(name)

  const all = new Map()
  const bases = []
  for (const h of decl.heritage) {
    bases.push(h.name)
    const baseDecl = interfaces.get(h.name)
    if (!baseDecl)
      continue
    // Map each base type-parameter to the concrete arg passed here (resolving
    // that arg through the current substitution map first), falling back to the
    // parameter's declared default.
    const childMap = {}
    baseDecl.typeParams.forEach((tp, i) => {
      const passed = h.args[i]
      childMap[tp.name] = (passed && (argMap[passed] ?? passed)) || tp.default || tp.name
    })
    const sub = resolveInterface(h.name, childMap, seen)
    for (const [k, v] of sub.all)
      all.set(k, v)
  }

  const own = decl.members.map(m => ({ ...m, type: substituteParams(m.type, argMap) }))
  for (const m of own)
    all.set(m.name, m)
  return { own, all, bases }
}

/** Expand a type-text to its string-literal union, or null if not one. */
function expandType(typeText, seen = new Set()) {
  if (!typeText || seen.has(typeText))
    return null
  seen.add(typeText)
  if (typeAliases.has(typeText))
    return typeAliases.get(typeText)
  if (aliasRefs.has(typeText))
    return expandType(aliasRefs.get(typeText), seen)
  // Inline union of quoted literals, e.g. `'button' | 'submit' | 'reset'`.
  const trimmed = typeText.trim()
  if (/^(?:['"][^'"]*['"]\s*(?:\|\s*)?)+$/.test(trimmed)) {
    const lits = [...trimmed.matchAll(/['"]([^'"]*)['"]/g)].map(m => m[1])
    if (lits.length)
      return lits
  }
  return null
}

// ---------------------------------------------------------------------------
// .vue header parsing (description, @example snippet, defineModel)
// ---------------------------------------------------------------------------

function parseVue(name, text) {
  // Leading block comment inside <script setup> — description + @example live here.
  const commentMatch = text.match(/\/\*\*([\s\S]*?)\*\//)
  const comment = commentMatch
    ? commentMatch[1].split(/\r?\n/).map(l => l.replace(/^\s*\*?\s?/, '')).join('\n')
    : ''

  // Description: text after the `DzXxx — …` / `DzXxx -- …` lead line.
  let description = ''
  const lead = comment.match(/^\s*Dz\w+\s*(?:—|--|-)\s*(\S.*)$/m)
  if (lead)
    description = lead[1].trim().replace(/\s+/g, ' ')

  // Minimal usage snippet: the first ```vue fenced block in the @example.
  let example = ''
  const fence = comment.match(/```vue[ \t]*\r?\n([\s\S]*?)```/)
  if (fence)
    example = fence[1].replace(/\s+$/, '')

  // v-model names via defineModel (ADR-16). Unnamed → `modelValue`. Strip
  // comments first so a `defineModel<…>()` mention inside a JSDoc header (as in
  // DzToggleButton) isn't counted as a real model declaration.
  const code = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
  const models = []
  const re = /defineModel\s*(?:<([^>]+)>\s*)?\(\s*(?:(['"])([^'"]+)\2)?/g
  for (let m = re.exec(code); m !== null; m = re.exec(code)) {
    models.push({ name: m[3] || 'modelValue', type: (m[1] || 'unknown').trim() })
  }

  vueMeta.set(name, { description, example, models })
}

// ---------------------------------------------------------------------------
// Source collection
// ---------------------------------------------------------------------------

async function collectSource() {
  // Contracts first — the canonical taxonomies + Base*Props that components extend.
  for (const file of await readdir(contractsSrc)) {
    if (file.endsWith('.types.ts'))
      indexDeclarations(resolve(contractsSrc, file), await readFile(resolve(contractsSrc, file), 'utf8'))
  }

  // Every component family: index its *.types.ts interfaces + read each .vue header.
  for (const family of await readdir(componentsRoot)) {
    const dir = resolve(componentsRoot, family)
    let entries
    try {
      entries = await readdir(dir)
    }
    catch {
      continue // not a directory
    }
    for (const file of entries) {
      const abs = resolve(dir, file)
      if (file.endsWith('.types.ts'))
        indexDeclarations(abs, await readFile(abs, 'utf8'))
      else if (file.endsWith('.vue'))
        parseVue(file.replace(/\.vue$/, ''), await readFile(abs, 'utf8'))
    }
  }
}

// ---------------------------------------------------------------------------
// Per-component model
// ---------------------------------------------------------------------------

/** Resolve the frozen variant/size/tone taxonomy for a component's props. */
function taxonomyFor(propsName) {
  const decl = interfaces.get(propsName)
  const resolved = resolveInterface(propsName)
  const out = {}

  const pick = (memberName) => {
    const m = resolved.all.get(memberName)
    return m ? expandType(m.type) : null
  }

  out.variant = pick('variant')
  out.size = pick('size')
  out.tone = pick('tone')

  // If a Base*Props<Variant> heritage arg carries the variant but the member
  // itself resolved to a bare type-parameter name, fall back to the heritage arg.
  if (!out.variant && decl) {
    for (const h of decl.heritage) {
      const idx = { BaseAppearanceProps: 1, BaseInteractiveProps: 0, BaseFormControlProps: 0 }[h.name]
      if (idx !== undefined && h.args[idx])
        out.variant = expandType(h.args[idx])
    }
  }
  return out
}

function buildComponent(name, family) {
  const meta = vueMeta.get(name) ?? { description: '', example: '', models: [] }
  const propsName = `${name}Props`
  const emitsName = `${name}Emits`
  const slotsName = `${name}Slots`

  const propsDecl = interfaces.get(propsName)
  const props = propsDecl
    ? { own: resolveInterface(propsName).own, bases: propsDecl.heritage.map(h => h.name) }
    : null
  const emits = interfaces.has(emitsName) ? [...resolveInterface(emitsName).all.values()] : []
  const slots = interfaces.has(slotsName) ? [...resolveInterface(slotsName).all.values()] : []
  const taxonomy = propsDecl ? taxonomyFor(propsName) : {}

  return {
    name,
    family,
    description: meta.description,
    example: meta.example,
    models: meta.models,
    props,
    emits,
    slots,
    taxonomy,
  }
}

async function buildModel() {
  await collectSource()
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  const families = []
  for (const [family, entry] of Object.entries(manifest.exports.components)) {
    families.push({
      key: family,
      label: FAMILY_LABELS[family] ?? family,
      components: entry.exports.map(name => buildComponent(name, family)),
    })
  }
  return { families, version: manifest.version }
}

// ---------------------------------------------------------------------------
// Markdown emitters
// ---------------------------------------------------------------------------

const INTRO = `> The Vue 3 component library published as \`@dzup-ui/core\`. Every component imports from a single entry point, is styled exclusively through \`--dz-*\` design tokens, themes via a \`data-theme\` attribute, and takes v-model through Vue 3.5 \`defineModel\` (ADR-16). This file indexes every component's public API — import path, the frozen variant/size/tone taxonomy, and its props / emits / slots.`

function conventions() {
  return [
    '## Conventions',
    '',
    'These hold for every component below, so they are stated once here:',
    '',
    '- **Import** — everything is a named export of `@dzup-ui/core`: `import { DzButton, DzInput } from \'@dzup-ui/core\'`. Types come from `@dzup-ui/contracts`.',
    '- **Styling (ADR-04)** — components are styled only through CSS custom properties (`var(--dz-*)` tokens). There are no hardcoded colors and no `<style scoped>`; override the look by re-mapping tokens, not by patching classes.',
    '- **Theming** — light/dark and brand themes are switched with a `data-theme` attribute on an ancestor element (typically `<html>`); tokens cascade from there.',
    '- **v-model (ADR-16)** — form/stateful components expose v-model through `defineModel`. The default binding is `v-model`; named bindings are written `v-model:name` (listed per component as "v-model").',
    '- **Frozen taxonomies (ADR-02)** — `size`, `tone`, and per-family `variant` unions are fixed contracts. Canonical values:',
    `  - size: ${(typeAliases.get('CanonicalSize') ?? []).map(v => `\`${v}\``).join(' ')}`,
    `  - tone: ${(typeAliases.get('CanonicalTone') ?? []).map(v => `\`${v}\``).join(' ')}`,
    '- **Shared prop bases** — many components extend base interfaces from `@dzup-ui/contracts`:',
    ...['BaseAccessibilityProps', 'BaseBehaviorProps', 'BaseValidationProps', 'BaseAppearanceProps', 'BaseInteractiveProps', 'BaseFormControlProps']
      .filter(b => interfaces.has(b))
      .map((b) => {
        const members = [...resolveInterface(b).all.keys()]
        return `  - \`${b}\`: ${members.map(m => `\`${m}\``).join(', ')}`
      }),
    '',
  ].join('\n')
}

/** Compact one-line taxonomy string, or '' if the component has none. */
function taxonomyLine(tax) {
  const parts = []
  if (tax.variant?.length)
    parts.push(`variant: ${tax.variant.map(v => `\`${v}\``).join(' ')}`)
  if (tax.size?.length)
    parts.push(`size: ${tax.size.map(v => `\`${v}\``).join(' ')}`)
  if (tax.tone?.length)
    parts.push(`tone: ${tax.tone.map(v => `\`${v}\``).join(' ')}`)
  return parts.join(' · ')
}

/** Concise index: one bullet per component with import + key props + taxonomy. */
function renderIndex(model) {
  const total = model.families.reduce((n, f) => n + f.components.length, 0)
  const lines = [
    '# dzup-ui components',
    '',
    INTRO,
    '',
    `${total} components across ${model.families.length} families. This is the index; for full props/emits/slots tables plus a usage snippet per component see [/storybook/llms-full.txt](/storybook/llms-full.txt).`,
    '',
    conventions(),
  ]

  for (const family of model.families) {
    lines.push(`## ${family.label}`, '')
    for (const c of family.components) {
      const desc = c.description ? ` — ${c.description}` : ''
      lines.push(`- **${c.name}**${desc}`)
      const detail = []
      const keyProps = (c.props?.own ?? []).slice(0, 6).map(p => `\`${p.name}\``)
      if (keyProps.length)
        detail.push(`props: ${keyProps.join(', ')}`)
      const tax = taxonomyLine(c.taxonomy)
      if (tax)
        detail.push(tax)
      if (c.models.length)
        detail.push(`v-model: ${c.models.map(m => (m.name === 'modelValue' ? '`v-model`' : `\`v-model:${m.name}\``)).join(', ')}`)
      for (const d of detail)
        lines.push(`  - ${d}`)
    }
    lines.push('')
  }

  lines.push('---', '', 'Part of dzup-ui. See also the ready-made blocks index at [/llms.txt](/llms.txt) on the landing site.', '')
  return lines.join('\n')
}

/** Escape a value for a single Markdown table cell (no pipes / fences / newlines). */
function cell(text) {
  return String(text)
    .replace(/\r?\n/g, ' ')
    .replace(/```/g, '') // never let a stray fence leak into a table cell
    .replace(/\|/g, '\\|')
    .replace(/\s+/g, ' ')
    .trim()
}

function memberTable(rows, header) {
  if (!rows.length)
    return ''
  const out = [`| ${header} | Type | Description |`, '| --- | --- | --- |']
  for (const r of rows) {
    const name = r.optional ? `${r.name}?` : r.name
    out.push(`| \`${cell(name)}\` | \`${cell(r.type)}\` | ${cell(r.doc || '')} |`)
  }
  return out.join('\n')
}

/** Full file: everything in the index plus member tables and a usage snippet. */
function renderFull(model) {
  const total = model.families.reduce((n, f) => n + f.components.length, 0)
  const lines = [
    '# dzup-ui components — full API',
    '',
    INTRO,
    '',
    `${total} components across ${model.families.length} families, each with its full props / emits / slots and a minimal usage snippet. For the index alone see [/storybook/llms.txt](/storybook/llms.txt).`,
    '',
    conventions(),
  ]

  for (const family of model.families) {
    lines.push(`## ${family.label}`, '')
    for (const c of family.components) {
      lines.push(`### ${c.name}`, '')
      if (c.description)
        lines.push(c.description, '')
      lines.push(`- **Import:** \`import { ${c.name} } from '@dzup-ui/core'\``)
      if (c.props?.bases?.length)
        lines.push(`- **Extends:** ${c.props.bases.map(b => `\`${b}\``).join(', ')}`)
      const tax = taxonomyLine(c.taxonomy)
      if (tax)
        lines.push(`- **Taxonomy:** ${tax}`)
      if (c.models.length)
        lines.push(`- **v-model:** ${c.models.map(m => (m.name === 'modelValue' ? `\`v-model\` (\`${m.type}\`)` : `\`v-model:${m.name}\` (\`${m.type}\`)`)).join(', ')}`)
      lines.push('')

      if (c.props?.own?.length) {
        lines.push('**Props** (component-specific; plus the extended bases above):', '')
        lines.push(memberTable(c.props.own, 'Prop'), '')
      }
      if (c.emits.length) {
        lines.push('**Emits:**', '')
        lines.push(memberTable(c.emits, 'Event'), '')
      }
      if (c.slots.length) {
        lines.push('**Slots:**', '')
        lines.push(memberTable(c.slots, 'Slot'), '')
      }
      if (c.example) {
        lines.push('**Usage:**', '', '```vue', c.example, '```', '')
      }
    }
  }

  lines.push('---', '', 'Part of dzup-ui. See also the ready-made blocks source at [/llms-full.txt](/llms-full.txt) on the landing site.', '')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function run() {
  const model = await buildModel()
  const index = renderIndex(model)
  const full = renderFull(model)
  await writeFile(OUT_INDEX, index, 'utf8')
  await writeFile(OUT_FULL, full, 'utf8')

  const total = model.families.reduce((n, f) => n + f.components.length, 0)
  console.log(
    `[llms] wrote ${total} components across ${model.families.length} families → `
    + `${OUT_INDEX.replace(repoRoot, '.')} (${index.length} B), `
    + `${OUT_FULL.replace(repoRoot, '.')} (${full.length} B)`,
  )
}

run().catch((err) => {
  console.error('[llms] build failed:', err)
  process.exitCode = 1
})
