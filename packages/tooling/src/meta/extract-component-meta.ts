/**
 * The extraction layer (TASK-N2-A2) — `vue-component-meta` plus the two joins
 * that need the same TypeScript program.
 *
 * This module is the ONLY place in the repository that reads a `.vue` or a
 * `.types.ts` to answer "what is this component's API". Everything downstream
 * — the docs site, `llms-full.txt`, the MCP tools — reads the artifact this
 * produces. That is the whole point of the packet: one extractor, many
 * renderers.
 *
 * Two things here are not plain `vue-component-meta` calls, and both use the
 * checker's OWN `ts.Program`, never a second parser:
 *
 *   1. **Emit descriptions.** Vue's `ShortEmits<T>` mapped type erases member
 *      JSDoc before `vue-component-meta` can read it: every event's declaration
 *      resolves into `@vue/runtime-core/dist/runtime-core.d.ts`, not into the
 *      repository's `Dz{Name}Emits` interface. Measured on this catalog:
 *      **0 of 359** event descriptions survive. The prose exists — it is on the
 *      interface members — so it is read back from the same program, and every
 *      recovered description is stamped `descriptionSource: "emits-interface"`
 *      so a renderer can tell the two apart.
 *   2. **Story examples.** Parsed from the stories file with the TypeScript AST
 *      and emitted as a VERBATIM source slice. Never synthesized markup.
 *
 * @module @dzup-ui/tooling/meta/extract-component-meta
 */

import type {
  ComponentDescriptionSource,
  ComponentMetaRecord,
  DescriptionSource,
  EventMetaRecord,
  ExposedMetaRecord,
  PropMeta,
  SlotMetaRecord,
  StoriesJoin,
  StoryRecord,
} from './component-meta.ts'
import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { createChecker } from 'vue-component-meta'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** The extractor and its exact version, read from the installed package. */
export function extractorId(): string {
  const pkg = JSON.parse(
    readFileSync(join(ROOT, 'node_modules/vue-component-meta/package.json'), 'utf8'),
  ) as { name: string, version: string }
  return `${pkg.name}@${pkg.version}`
}

/** The tsconfig the checker builds its program from — the one `@dzup-ui/core` type-checks with. */
export const CORE_TSCONFIG = join(ROOT, 'packages/core/tsconfig.json')

/**
 * Every documentation block in a `.vue`, in file order, comment markers
 * stripped (TASK-R5-O8).
 *
 * Both header dialects are read — the `<!-- … -->` one before `<script setup>`
 * that `packages/core/src/providers/` uses, and the JSDoc one inside it that
 * every other family uses — and **all** of their blocks, not the first of each
 * kind.
 *
 * Reading only the first was a positional assumption, and TASK-R5-O8 broke it
 * by accident: documenting `defineModel` put a one-line JSDoc above the SFC
 * header in `DzBlockUI`, `DzPopconfirm` and `DzTour`, and all three lost their
 * component description to a `Whether the blocking overlay …` comment that
 * happened to sort first. A header is a header wherever the file puts it — the
 * lead-line match, which must name THIS component, is what identifies one, and
 * file order still decides between two candidates.
 */
function documentationBlocks(text: string): string[] {
  const blocks: { index: number, body: string }[] = []
  for (const re of [/<!--([\s\S]*?)-->/g, /\/\*\*([\s\S]*?)\*\//g]) {
    for (const m of text.matchAll(re)) {
      blocks.push({
        index: m.index,
        body: m[1]!
          .split(/\r?\n/)
          .map(l => l.replace(/^\s*\*?\s?/, ''))
          .join('\n'),
      })
    }
  }
  return blocks
    .sort((a, b) => a.index - b.index)
    .map(b => b.body)
}

/**
 * The component's one-line "what it is" description, read from its SFC header
 * (TASK-N2-A3).
 *
 * `vue-component-meta` exposes no component-level description — it answers
 * "what is this component's API", not "what is this component". That line is
 * the most-read string in `llms.txt` and the payload `list_components` returns
 * to an AI client, so it has to come from somewhere generated. Per B9 it comes
 * from here, in the one module allowed to read a `.vue`, rather than from a
 * second parser inside the renderer that wants it.
 *
 * Two header dialects exist in this repository and both are read:
 *
 *   - `<!-- DzProvider — one root component … -->` before `<script setup>`
 *     (`packages/core/src/providers/`, 2 components);
 *   - the first `/** DzButton — Primary button component. *\/` block inside
 *     `<script setup>` (every other family).
 *
 * The lead line must name THIS component. Matching a bare `Dz\w+` — which the
 * generator this replaces did — would let the header of an imported component
 * quoted in prose supply the description of the file that mentions it.
 *
 * Returns `''` with source `none` when no header prose exists. **Nothing is
 * inferred from the component's name**: an empty description is published as
 * empty, and ratcheted by `validate:llms`.
 */
export function componentDescription(
  vueAbsPath: string,
  name: string,
): { description: string, descriptionSource: ComponentDescriptionSource } {
  let text: string
  try {
    text = readFileSync(vueAbsPath, 'utf8')
  }
  catch {
    return { description: '', descriptionSource: 'none' }
  }

  // Both dialects, every block, in file order.
  const blocks = documentationBlocks(text)

  // `Name — description`, tolerating every dash the repository actually uses.
  const lead = new RegExp(`^\\s*${name}\\s*(?:—|–|--|-)\\s*(\\S.*)$`, 'm')
  for (const block of blocks) {
    const m = lead.exec(block)
    if (m) {
      return {
        description: m[1]!.trim().replace(/\s+/g, ' '),
        descriptionSource: 'sfc-header',
      }
    }
  }
  return { description: '', descriptionSource: 'none' }
}

/**
 * The component's intent and selection guidance, from an `@intent` block in the
 * same SFC header `componentDescription` reads (TASK-R5-O5).
 *
 * The documentation contract's first section is *"what is this for, and when
 * should you reach for something else"*. That sentence has to be authored by a
 * person — no extractor can derive it — but it must NOT be authored in
 * `apps/docs`: a selection guide living next to the site drifts from the
 * component the first time the component changes, and nothing notices. Putting
 * it in the source header means whoever changes the behaviour is holding the
 * paragraph that describes it, and `validate:docs-pages` counts the components
 * that have none under a ratchet.
 *
 * Multi-line and markdown-bearing: the block runs from `@intent` to the next
 * block tag or the end of the comment, and is published verbatim.
 *
 * Returns `undefined` when the component declares none. **Nothing is inferred**
 * — an absent intent is published as absent.
 */
export function componentIntent(vueAbsPath: string): string | undefined {
  let text: string
  try {
    text = readFileSync(vueAbsPath, 'utf8')
  }
  catch {
    return undefined
  }

  const blocks = documentationBlocks(text)

  for (const block of blocks) {
    const at = /^[ \t]*@intent[ \t]*\n?/m.exec(block)
    if (at === null)
      continue
    const rest = block.slice(at.index + at[0].length)
    // Up to the next block tag at the start of a line, or the end of the header.
    const next = /^[ \t]*@\w+/m.exec(rest)
    const body = (next === null ? rest : rest.slice(0, next.index)).trim()
    if (body !== '')
      return body.replace(/[ \t]+$/gm, '')
  }
  return undefined
}

/** Repo-relative, forward-slashed. Absolute paths would make the artifact machine-specific. */
export function repoRelative(abs: string): string {
  return relative(ROOT, abs).replace(/\\/g, '/')
}

/**
 * Strip machine-specific absolute paths out of a printed type.
 *
 * TypeScript prints unresolvable or ambient module references as
 * `import("<absolute path>")`. Left alone that would put this checkout's home
 * directory into a committed artifact and make the freshness gate fail on every
 * other machine — a determinism bug about *stamping*, not about extraction.
 * Measured on this catalog the count is 0, but the normalization stays: a
 * determinism property that holds by luck is not a property.
 */
export function normalizeType(type: string): string {
  return type.replace(/import\("([^"]*)"\)/g, (_m, p: string) => {
    const norm = p.replace(/\\/g, '/')
    const rootFwd = ROOT.replace(/\\/g, '/')
    const rel = norm.startsWith(rootFwd) ? norm.slice(rootFwd.length).replace(/^\/+/, '') : norm
    return `import("${rel}")`
  })
}

/**
 * Whether a printed type is unusable for a consumer.
 *
 * Deliberately tight. `Record<string, unknown>` and `TreeNode<unknown>` are
 * fully resolved types that happen to contain the word `unknown`; calling them
 * unresolved would inflate the number this packet exists to report honestly.
 */
export function isUnresolvedType(type: string): boolean {
  const t = type.trim()
  return t === ''
    || t === 'any'
    || t.includes('__VLS_')
    || t.includes('import(')
}

/** `{}` and `any` both mean "this slot takes no props" in the extractor's output. */
function slotHasPayload(type: string): boolean {
  const t = type.trim()
  return t !== '' && t !== 'any' && t !== '{}' && t !== 'unknown'
}

/** Pull a named JSDoc tag's text out of the extractor's tag list. */
function tagText(tags: { name: string, text?: string }[], name: string): string | undefined {
  const hit = tags.find(t => t.name === name)
  if (!hit)
    return undefined
  return hit.text ?? ''
}

function allTagTexts(tags: { name: string, text?: string }[], name: string): string[] {
  return tags.filter(t => t.name === name).map(t => t.text ?? '')
}

export interface Checker {
  getComponentMeta: (fileName: string, exportName?: string) => import('vue-component-meta').ComponentMeta
  getProgram: () => ts.Program | undefined
}

/** Build the checker once. Slow (a full TS program); done exactly once per generate run. */
export function createComponentChecker(): Checker {
  return createChecker(CORE_TSCONFIG, {
    // Deterministic printing: LF, regardless of host platform. Without this the
    // artifact differs between Windows and CI for multi-line printed types.
    printer: { newLine: ts.NewLineKind.LineFeed },
  }) as unknown as Checker
}

// ── Emit-description recovery ────────────────────────────────────────────────

/**
 * JSDoc for every member of `Dz{Name}Emits`, read through the checker's own
 * program. Returns `null` when the interface does not exist — which is a fact
 * worth reporting, not an error.
 */
export function emitsInterfaceDocs(
  program: ts.Program,
  typesFileAbs: string,
  interfaceName: string,
): Map<string, string> | null {
  const sf = program.getSourceFile(typesFileAbs.replace(/\\/g, '/'))
    ?? program.getSourceFile(typesFileAbs)
  if (!sf)
    return null
  const tc = program.getTypeChecker()
  let out: Map<string, string> | null = null
  ts.forEachChild(sf, (node) => {
    if (out !== null)
      return
    const isMatch = (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))
      && node.name.text === interfaceName
    if (!isMatch)
      return
    const map = new Map<string, string>()
    const type = tc.getTypeAtLocation((node as ts.InterfaceDeclaration).name)
    for (const prop of type.getProperties()) {
      const doc = ts.displayPartsToString(prop.getDocumentationComment(tc)).trim()
      if (doc !== '')
        map.set(prop.getName(), doc)
    }
    out = map
  })
  return out
}

/**
 * Every `Dz…Emits` interface in the program, keyed by name (TASK-R5-O8).
 *
 * `emitsInterfaceDocs` above looks in `{Component}.types.ts`, which is right
 * for a component that owns a types file. **Thirteen compound parts do not**:
 * `DzContextMenuContent`, `DzDialogContent`, `DzPopoverContent`,
 * `DzSheetContent`, `DzListItem`, `DzMenuItem`, `DzSidebarItem`,
 * `DzSplitButtonAction`, `DzStepperItem` and the two `…MenuItem`s all declare
 * `defineEmits<Dz{Part}Emits>()` against an interface that lives in their
 * PARENT's types file — `DzContextMenu.types.ts`, not
 * `DzContextMenuContent.types.ts`, which does not exist. Measured at `99b963a`:
 * 26 of the 35 undescribed authored events were documented prose the path guess
 * could not reach.
 *
 * So the lookup becomes name-keyed instead of path-keyed. This is the same
 * `ts.Program`, the same `ts.TypeChecker` and the same symbols as
 * `emitsInterfaceDocs` — one index built once per run rather than one file
 * guess per component. Names are unique repository-wide by the `Dz` +
 * PascalCase + `Emits` convention; if two files ever declared the same name the
 * first in the program's (sorted) file order wins, which is deterministic.
 *
 * `.vue` files are included: `vue-component-meta`'s program carries all 209 of
 * them, and a part whose emits interface is declared locally in its own
 * `<script setup>` is as documentable as one with a types file.
 */
export function emitsDocIndex(program: ts.Program): Map<string, Map<string, string>> {
  const tc = program.getTypeChecker()
  const out = new Map<string, Map<string, string>>()
  const files = [...program.getSourceFiles()]
    .filter(sf => !sf.isDeclarationFile && sf.fileName.replace(/\\/g, '/').includes('/packages/'))
    .sort((a, b) => a.fileName.localeCompare(b.fileName, 'en'))
  for (const sf of files) {
    ts.forEachChild(sf, (node) => {
      if (!ts.isInterfaceDeclaration(node) && !ts.isTypeAliasDeclaration(node))
        return
      const name = node.name.text
      if (!name.startsWith('Dz') || !name.endsWith('Emits') || out.has(name))
        return
      const map = new Map<string, string>()
      for (const prop of tc.getTypeAtLocation(node.name).getProperties()) {
        const doc = ts.displayPartsToString(prop.getDocumentationComment(tc)).trim()
        if (doc !== '')
          map.set(prop.getName(), doc)
      }
      if (map.size > 0)
        out.set(name, map)
    })
  }

  // Re-export aliases, in a second pass so the declarations they point at are
  // already indexed. `DzSplitter.types.ts` does
  // `export type { DzResizableEmits as DzSplitterEmits }` — the component's
  // emits interface exists, under another name, and a declaration-only index
  // would report its one documented event as undescribed.
  for (const sf of files) {
    ts.forEachChild(sf, (node) => {
      if (!ts.isExportDeclaration(node) || node.exportClause === undefined)
        return
      if (!ts.isNamedExports(node.exportClause))
        return
      for (const el of node.exportClause.elements) {
        const alias = el.name.text
        const original = el.propertyName?.text
        if (original === undefined || !alias.endsWith('Emits') || out.has(alias))
          continue
        const target = out.get(original)
        if (target !== undefined)
          out.set(alias, target)
      }
    })
  }
  return out
}

/**
 * The index, built at most once per `ts.Program`.
 *
 * `extractComponent` runs 208 times against one program; walking 1,488 source
 * files each time would turn a 40-second generate into a 2-hour one. Keyed on
 * the program itself so a second checker in the same process (the validator
 * builds its own) gets its own index rather than a stale one.
 */
const EMITS_INDEX_CACHE = new WeakMap<ts.Program, Map<string, Map<string, string>>>()

function cachedEmitsDocIndex(program: ts.Program): Map<string, Map<string, string>> {
  const hit = EMITS_INDEX_CACHE.get(program)
  if (hit !== undefined)
    return hit
  const built = emitsDocIndex(program)
  EMITS_INDEX_CACHE.set(program, built)
  return built
}

/**
 * The prose published for an `update:*` event `defineModel` synthesised
 * (decision A2-D2, TASK-R5-O8).
 *
 * Measured at `99b963a`: 71 of the 106 undescribed events are `update:*`. There
 * is no member anywhere in the repository to hang a JSDoc comment on — Vue
 * generates the emit from the `defineModel` call — so the options were a
 * permanently blank cell on every `v-model` component's page, or one generated
 * sentence that is true by construction. This is that sentence.
 *
 * It says only what the mechanism guarantees: the event fires when the binding
 * changes and carries the new value. It deliberately does NOT describe what the
 * value means — that belongs on the prop, which IS authorable (and was authored
 * in the same task), and a generator that guessed at meaning would be exactly
 * the "plausible but untrue" failure this pipeline exists to prevent.
 */
export function synthesiseModelEventDescription(eventName: string): string {
  const key = eventName.slice('update:'.length)
  const binding = key === 'modelValue' ? '`v-model`' : `\`v-model:${key}\``
  return `Emitted when the ${binding} binding changes, with the new value. `
    + `Synthesised by \`defineModel\` (ADR-16); ${binding} consumes it for you.`
}

// ── Frozen taxonomies (ADR-02) ───────────────────────────────────────────────

/**
 * Every exported string-literal-union type alias in `@dzup-ui/contracts`, as
 * `name → members` (TASK-N2-A3).
 *
 * These are the ADR-02 frozen taxonomies — `CanonicalSize`, `CanonicalTone`,
 * `ButtonVariant`, … . A component's `variant` prop prints as the alias name
 * (`ButtonVariant | undefined`), never as its members, because that is what
 * `vue-component-meta` resolves the declared type to. `p.schema` does not expand
 * them either — measured: `schema` comes back as the same string. So an
 * agent-facing renderer that wants to tell a coding assistant "variant is one of
 * solid / outline / ghost / text / link" has nowhere to read it from.
 *
 * Resolved here, ONCE per run, through the checker's own `ts.Program` — the
 * same mechanism, and the same justification, as `emitsInterfaceDocs` above:
 * this is not a second extractor, it is the same program and the same AST the
 * checker already built. Published on the artifact so every renderer (llms.txt,
 * the D1 prop tables, the MCP tools) reads one answer.
 */
export function contractTaxonomies(program: ts.Program): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  const marker = 'packages/contracts/src/'
  for (const sf of program.getSourceFiles()) {
    if (!sf.fileName.replace(/\\/g, '/').includes(marker) || sf.isDeclarationFile)
      continue
    ts.forEachChild(sf, (node) => {
      if (!ts.isTypeAliasDeclaration(node))
        return
      const exported = ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export
      if (!exported)
        return
      const members: string[] = []
      let onlyStringLiterals = true
      const visit = (n: ts.TypeNode): void => {
        if (ts.isUnionTypeNode(n))
          n.types.forEach(visit)
        else if (ts.isParenthesizedTypeNode(n))
          visit(n.type)
        else if (ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal))
          members.push(n.literal.text)
        else onlyStringLiterals = false
      }
      visit(node.type)
      if (onlyStringLiterals && members.length > 0)
        out[node.name.text] = members
    })
  }
  return Object.fromEntries(
    Object.entries(out).sort(([a], [b]) => a.localeCompare(b, 'en')),
  )
}

// ── Story parsing ────────────────────────────────────────────────────────────

/** Story export names that make the best canonical example, in preference order. */
const PRIMARY_STORY_PREFERENCE = ['Default', 'Basic', 'Playground', 'Overview', 'Example']

interface ParsedStory extends StoryRecord {
  source: string
  template?: string
}

/** The `template:` string of a story's `render()` result, when it is a static literal. */
function staticTemplate(node: ts.Node): string | undefined {
  let found: string | undefined
  const visit = (n: ts.Node): void => {
    if (found !== undefined)
      return
    if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name) && n.name.text === 'template') {
      const v = n.initializer
      if (ts.isStringLiteral(v))
        found = v.text
      // A template literal with `${}` substitutions is not static source; skip
      // it rather than emit a half-interpolated string a reader cannot paste.
      else if (ts.isNoSubstitutionTemplateLiteral(v))
        found = v.text
      return
    }
    ts.forEachChild(n, visit)
  }
  ts.forEachChild(node, visit)
  return found?.replace(/\r\n/g, '\n')
}

/**
 * Parse a stories file into its exported stories, each with a VERBATIM source
 * slice. Uses the TypeScript AST — the stories file is TypeScript, and a regex
 * over it would be the second parser this packet exists to avoid.
 */
export function parseStories(fileAbs: string): {
  titlePath?: string
  stories: ParsedStory[]
} {
  const text = readFileSync(fileAbs, 'utf8').replace(/\r\n/g, '\n')
  const sf = ts.createSourceFile(fileAbs, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  let titlePath: string | undefined
  const stories: ParsedStory[] = []

  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt))
      continue
    const exported = stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) ?? false
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name))
        continue
      const init = decl.initializer
      // `const meta = { title: 'Core/Buttons/DzButton', … }`
      if (decl.name.text === 'meta' && init && ts.isObjectLiteralExpression(init)) {
        for (const p of init.properties) {
          if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'title'
            && ts.isStringLiteral(p.initializer)) {
            titlePath = p.initializer.text
          }
        }
        continue
      }
      if (!exported || decl.name.text === 'meta')
        continue
      if (!init)
        continue
      // A story is an exported const whose initializer is (or wraps) an object
      // literal — `export const Default: Story = { … }`.
      const obj = ts.isObjectLiteralExpression(init)
        ? init
        : ts.isAsExpression(init) && ts.isObjectLiteralExpression(init.expression)
          ? init.expression
          : undefined
      if (!obj)
        continue
      let name: string | undefined
      for (const p of obj.properties) {
        if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'name'
          && ts.isStringLiteral(p.initializer)) {
          name = p.initializer.text
        }
      }
      const start = stmt.getStart(sf, true)
      const end = stmt.getEnd()
      const startLine = sf.getLineAndCharacterOfPosition(start).line + 1
      const endLine = sf.getLineAndCharacterOfPosition(end).line + 1
      const template = staticTemplate(obj)
      stories.push({
        id: decl.name.text,
        ...(name === undefined ? {} : { name }),
        lines: [startLine, endLine],
        source: text.slice(start, end),
        ...(template === undefined ? {} : { template }),
      })
    }
  }
  return { ...(titlePath === undefined ? {} : { titlePath }), stories }
}

/** Choose the canonical example. Deterministic: preference list, then file order. */
export function pickPrimaryStory(stories: ParsedStory[]): ParsedStory | undefined {
  for (const wanted of PRIMARY_STORY_PREFERENCE) {
    const hit = stories.find(s => s.id === wanted)
    if (hit)
      return hit
  }
  return stories[0]
}

/**
 * Bindings a Storybook story template may reference that exist only inside
 * Storybook. `args` is the whole population in this catalogue — the
 * `render: args => ({ setup: () => ({ args }), template: '<Dz… v-bind="args">' })`
 * idiom — but the check is a list rather than one name so a second such binding
 * cannot slip in unnoticed.
 */
const STORYBOOK_ONLY_BINDINGS = ['args', 'argTypes', 'globals'] as const

/**
 * True when a static template can be mounted outside Storybook as written.
 *
 * The word-boundary match is deliberate and was chosen after measuring: a bare
 * `includes('args')` also matches `aria-label="Search args"`-style prose and
 * every `data-*` attribute containing the substring, and this repository has
 * already been bitten twice by a substring standing in for a token
 * (N2-S1 F1: `data-part` inside `data-participant-id`; N2-A2 F-4: a gate clause
 * satisfied by a comment).
 */
export function isRunnableTemplate(template: string | undefined): template is string {
  if (template === undefined)
    return false
  return !STORYBOOK_ONLY_BINDINGS.some(binding =>
    new RegExp(`\\b${binding}\\b`).test(template),
  )
}

/**
 * Choose the story a playground can run. Same deterministic order as
 * `pickPrimaryStory` — preference list first, then file order — restricted to
 * stories whose static template stands alone. Returns `undefined` when none
 * does, which is the honest answer and must be rendered as an absence.
 */
export function pickRunnableStory(stories: ParsedStory[]): ParsedStory | undefined {
  const runnable = stories.filter(s => isRunnableTemplate(s.template))
  for (const wanted of PRIMARY_STORY_PREFERENCE) {
    const hit = runnable.find(s => s.id === wanted)
    if (hit)
      return hit
  }
  return runnable[0]
}

/**
 * Build the stories join for one component. Absent story file → an empty,
 * honest record — never a fabricated example.
 *
 * `declared` is the `.stories.ts` path the ownership manifest recorded as
 * evidence, and it is tried FIRST. The `stories/{family}/` convention alone
 * misses four public components whose stories live under
 * `stories/_app-specific/` (`GovernanceBadge`, `TeamMemberBadge`,
 * `DzRunStatusBadge`, `DzTokenProgressBar`), and a convention-only lookup would
 * have reported them as example-less when they are not.
 */
export function storiesJoin(
  componentName: string,
  family: string,
  declared?: string,
): StoriesJoin {
  const candidates = [
    ...(declared === undefined ? [] : [declared]),
    `packages/core/stories/${family}/${componentName}.stories.ts`,
  ]
  const rel = candidates.find(c => existsSync(join(ROOT, c)))
  if (rel === undefined)
    return { stories: [] }
  const abs = join(ROOT, rel)
  const { titlePath, stories } = parseStories(abs)
  const primary = pickPrimaryStory(stories)
  const runnable = pickRunnableStory(stories)
  return {
    file: rel,
    ...(titlePath === undefined ? {} : { titlePath }),
    stories: stories.map(s => ({
      id: s.id,
      ...(s.name === undefined ? {} : { name: s.name }),
      lines: s.lines,
    })),
    ...(primary === undefined
      ? {}
      : {
          primary: {
            id: primary.id,
            ...(primary.name === undefined ? {} : { name: primary.name }),
            lines: primary.lines,
            source: primary.source,
            ...(primary.template === undefined ? {} : { template: primary.template }),
          },
        }),
    ...(runnable === undefined
      ? {}
      : {
          runnable: {
            id: runnable.id,
            ...(runnable.name === undefined ? {} : { name: runnable.name }),
            lines: runnable.lines,
            source: runnable.source,
            ...(runnable.template === undefined ? {} : { template: runnable.template }),
          },
        }),
  }
}

// ── The per-component extraction ─────────────────────────────────────────────

export interface ExtractTarget {
  name: string
  kind: 'public-component' | 'compound-part'
  parentComponent?: string
  family: string
  status?: string
  subpaths: string[]
  /** Repo-relative `.vue` path. */
  source: string
  /** Repo-relative `.stories.ts` path the ownership manifest recorded, when it did. */
  storiesFile?: string
}

/** Everything the extractor itself can say about one component. */
export interface ExtractedMembers {
  componentType: ComponentMetaRecord['componentType']
  props: PropMeta[]
  globalPropCount: number
  events: EventMetaRecord[]
  slots: SlotMetaRecord[]
  exposed: ExposedMetaRecord[]
  error?: string
}

/**
 * Extract one component. Never throws: a component the extractor cannot process
 * is recorded with its error and an empty member set — the `<stop_conditions>`
 * "unclassifiable" branch, made into data rather than a crash.
 */
export function extractComponent(
  checker: Checker,
  target: ExtractTarget,
): ExtractedMembers {
  const abs = join(ROOT, target.source)
  const typesAbs = abs.replace(/\.vue$/, '.types.ts')

  let meta: import('vue-component-meta').ComponentMeta
  try {
    meta = checker.getComponentMeta(abs)
  }
  catch (err) {
    return {
      componentType: 'unknown',
      props: [],
      globalPropCount: 0,
      events: [],
      slots: [],
      exposed: [],
      error: err instanceof Error ? err.message : String(err),
    }
  }

  const own = meta.props.filter(p => !p.global)
  const globalPropCount = meta.props.length - own.length

  const props: PropMeta[] = own.map((p) => {
    const description = p.description.trim()
    const deprecated = tagText(p.tags, 'deprecated')
    const examples = allTagTexts(p.tags, 'example')
    const decl = p.getDeclarations()[0]
    const declaredIn = decl && decl.file.replace(/\\/g, '/').includes('/packages/')
      ? repoRelative(decl.file)
      : undefined
    return {
      name: p.name,
      type: normalizeType(p.type),
      required: p.required,
      default: p.default === undefined ? null : p.default,
      description,
      descriptionSource: (description === '' ? 'none' : 'vue-component-meta') as DescriptionSource,
      ...(deprecated === undefined ? {} : { deprecated }),
      ...(examples.length === 0 ? {} : { examples }),
      ...(declaredIn === undefined ? {} : { declaredIn }),
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'))

  const program = checker.getProgram()
  const emitDocs = program && existsSync(typesAbs)
    ? emitsInterfaceDocs(program, typesAbs, `${target.name}Emits`)
    : null

  // Name-keyed fallback for the thirteen compound parts whose emits interface
  // lives in the PARENT's types file (TASK-R5-O8). File-local always wins.
  const indexedDocs = program === undefined
    ? undefined
    : cachedEmitsDocIndex(program).get(`${target.name}Emits`)

  const events: EventMetaRecord[] = meta.events.map((e) => {
    const own = e.description.trim()
    const recovered = own === ''
      ? (emitDocs?.get(e.name) ?? indexedDocs?.get(e.name))
      : undefined
    const modelDerived = e.name.startsWith('update:')
    const synthesised = own === '' && recovered === undefined && modelDerived
      ? synthesiseModelEventDescription(e.name)
      : undefined
    const description = own !== '' ? own : (recovered ?? synthesised ?? '')
    const descriptionSource: DescriptionSource = own !== ''
      ? 'vue-component-meta'
      : recovered !== undefined
        ? 'emits-interface'
        : synthesised !== undefined ? 'model-synthesised' : 'none'
    return {
      name: e.name,
      type: normalizeType(e.type),
      signature: normalizeType(e.signature),
      description,
      descriptionSource,
      modelDerived,
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'))

  const slots: SlotMetaRecord[] = meta.slots.map((s) => {
    const description = s.description.trim()
    return {
      name: s.name,
      type: normalizeType(s.type),
      description,
      descriptionSource: (description === '' ? 'none' : 'vue-component-meta') as DescriptionSource,
      hasPayload: slotHasPayload(s.type),
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'))

  const exposed: ExposedMetaRecord[] = meta.exposed.map((x) => {
    const description = x.description.trim()
    return {
      name: x.name,
      type: normalizeType(x.type),
      description,
      descriptionSource: (description === '' ? 'none' : 'vue-component-meta') as DescriptionSource,
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'))

  return {
    componentType: meta.type === 1 ? 'class' : meta.type === 2 ? 'function' : 'unknown',
    props,
    globalPropCount,
    events,
    slots,
    exposed,
  }
}
