/**
 * playground-contract.ts — TASK-N2-D3.
 *
 * The framework-neutral contract between a `@vue/repl` sandbox and the
 * self-contained `@dzup-ui/core` bundle it resolves imports against.
 *
 * **This is not a new mechanism.** `apps/storybook/scripts/build-playground.mjs`
 * and `apps/storybook/stories/_blocks/playground.config.ts` have implemented it
 * since 2026-07-17, and this module states the same contract in one place so the
 * docs site (`apps/docs`) can be a *second consumer* rather than a second
 * implementation — the shape TASK-N2-A3 gave `apps/storybook/scripts/build-llms.mjs`
 * when it went from a 567-line second extractor to a 73-line copy step.
 *
 * The four things a sandbox host must agree on with the bundle producer:
 *
 *   1. `PLAYGROUND_ASSETS` — the exact filenames the producer writes, so a host
 *      cannot `<link>` a stylesheet nobody wrote. A third name (`dzup-core.css`)
 *      once sat in the Storybook sandbox head and 404'd on every load.
 *   2. `PLAYGROUND_IMPORT_SPECIFIER` — the bare specifier the import map binds.
 *   3. `TAILWIND_BROWSER_CDN` — components carry no stylesheet of their own
 *      (ADR-04: `tv()` + Tailwind utilities over `--dz-*`), so without this the
 *      preview renders structurally correct and visually unstyled.
 *   4. The `<head>` the sandbox is created with, including the theme bridge.
 *
 * `yarn validate:playground-parity` asserts `playground.config.ts` still agrees
 * with all four. See D3-D1 for why Storybook was not re-pointed at this module
 * outright.
 *
 * This file imports nothing from `@dzup-ui/*` — `packages/tooling` may not
 * depend on the library it tools (README §3 `<packages>`).
 */

/**
 * Every file `apps/storybook/scripts/build-playground.mjs` writes into its
 * `public/playground/` directory, and every file a sandbox host references.
 * Asserted by the producer after each build and by `validate:playground-parity`.
 */
export const PLAYGROUND_ASSETS = ['dzup-core.mjs', 'tokens.css', 'core.css'] as const

/**
 * `@vue/repl`'s own stylesheets, as the paths a sandbox HOST links them from —
 * relative to the playground asset base.
 *
 * They are NOT written by the bundle producer (Storybook does not serve them),
 * so they are a second list rather than part of `PLAYGROUND_ASSETS`. They are
 * declared here rather than in either consumer because they were, briefly, the same
 * two-item list hand-written in two files with no gate between them —
 * `apps/docs/scripts/sync-playground-assets.mjs` writes them and
 * `apps/docs/.vitepress/theme/playground.ts` linked them, and renaming one
 * produced a stylesheet the site requests and nothing writes, with every gate
 * in the repository still green (D3-F7). That is the same defect the
 * `dzup-core.css` 404 was, one directory down.
 *
 * The theme module now imports this constant, so only the `.mjs` copy step
 * restates it — and `validate:playground-parity` checks that restatement.
 */
export const PLAYGROUND_REPL_STYLESHEETS = [
  'repl/vue-repl.css',
  'repl/codemirror-editor.css',
] as const

/** The bare specifier the sandbox import map binds to `dzup-core.mjs`. */
export const PLAYGROUND_IMPORT_SPECIFIER = '@dzup-ui/core'

/**
 * Tailwind v4 browser JIT. Generates the utility classes `tv()` emits
 * (`inline-flex`, `h-[var(--dz-button-md-height)]`, …) live inside the sandbox,
 * so no precompiled utility sheet has to ship. A runtime CDN dependency — see
 * D3-F3 and owner decision D3-D2.
 */
export const TAILWIND_BROWSER_CDN = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'

/**
 * The `postMessage` type a host sends to push a ThemeRecipe's expanded CSS
 * variables into a live sandbox without re-creating it.
 *
 * Re-creating the iframe would work and would also discard whatever the visitor
 * has typed into the editor, which is the one thing a playground must not do.
 */
export const THEME_RECIPE_MESSAGE = 'dz-playground:theme-recipe'

/**
 * One component's playground seed, as written to
 * `apps/docs/public/playground/seeds.json` and read by the site at runtime.
 *
 * The shape lives here rather than beside its generator because both ends need
 * it: `packages/tooling/src/docs/playground-seeds.ts` writes it, and the docs
 * site reads it. A second declaration of the same JSON is the drift every
 * generated artifact in this repository has a gate against.
 */
export interface PlaygroundSeed {
  /** The SFC the editor opens with. */
  code: string
  /** Storybook export name of the story the template came from. */
  storyId: string
  /** The story's `name:` override, when it declares one. */
  storyName?: string
  /** Repo-relative stories file. */
  storyFile: string
  /** 1-based `[start, end]` line range of that story export. */
  storyLines: [number, number]
}

/**
 * Why a public component has no playground seed — TASK-N2-D3.
 *
 * **The reason is measured, never inferred from the shape of the record.** The
 * first implementation of this packet printed one sentence for every absence
 * ("every story either has a computed template or binds Storybook's `args`"),
 * and on three pages — `DzAsyncBoundary`, `DzErrorBoundary`, `DzMenu` — that
 * sentence was **false**: each of those has a runnable story with a static
 * template that binds nothing of Storybook's, and is refused because the
 * template opens a tag `@dzup-ui/core` does not export (`AsyncChild`, `Bomb`,
 * `Home`/`Settings`). A published sentence that is not the measurement is the
 * defect class this whole program exists to stop, so the reason travels with
 * the refusal instead of being guessed at the far end.
 *
 * - `no-stories-file` - no `.stories.ts` was found for the component at all.
 * - `no-runnable-story` - stories exist, but none has a static template that
 *   stands alone outside Storybook.
 * - `no-component-tag` - the runnable template opens no component tag, so a
 *   sandbox seeded from it would render an empty box.
 * - `unexported-tags` - the runnable template opens tags the library does not
 *   export, which a sandbox cannot import.
 */
export type SeedRefusalReason
  = 'no-stories-file'
    | 'no-runnable-story'
    | 'no-component-tag'
    | 'unexported-tags'

export interface SeedRefusal {
  reason: SeedRefusalReason
  /** Repo-relative stories file, when one was found. */
  file?: string
  /** For `unexported-tags`: the tag names, sorted. Named, never counted. */
  tags?: string[]
}

export interface PlaygroundSeeds {
  /** Bumped when the seed SHAPE changes, not when a seed's content does. */
  schemaVersion: string
  /** The metadata artifact these seeds were derived from. */
  generatedFrom: string
  sourceCommit: string
  totals: {
    publicComponents: number
    withSeed: number
    /** Named, never counted alone — `<evidence_rules>` applies to absences too. */
    withoutSeed: string[]
  }
  /**
   * One seeded component per family, for the theme builder's *"live preview
   * across representative components"*.
   *
   * **Derived, never hand-picked.** A curated list of "good examples" would be
   * the hand-typed-facts class this program has now found five times (P2-02
   * READMEs · T1 K4 phantom exports · A1 F3 version literals · A2 F-3 story
   * defaults · D3 F4 below), and it would rot the first time a component was
   * renamed. The rule is: the alphabetically first seeded public component of
   * each family, families in the artifact's own order.
   */
  representatives: string[]
  seeds: Record<string, PlaygroundSeed>
  /**
   * One entry per name in `totals.withoutSeed`, carrying the MEASURED reason.
   *
   * Published rather than counted: `<evidence_rules>` applies to absences too,
   * and a component page renders this reason verbatim rather than composing a
   * plausible one.
   */
  refusals: Record<string, SeedRefusal>
}

/** `1.1.0` — additive: `refusals` joined the artifact (the measured absence reason). */
export const PLAYGROUND_SEEDS_SCHEMA_VERSION = '1.1.0'

/** Import-map entries that make `@dzup-ui/core` resolve inside the sandbox. */
export function playgroundImportMap(assetBase: string): Record<string, string> {
  return { [PLAYGROUND_IMPORT_SPECIFIER]: `${assetBase}dzup-core.mjs` }
}

export interface SandboxHeadOptions {
  /** Absolute or root-relative URL of the playground asset directory; ends in `/`. */
  assetBase: string
  /** Initial resolved colour mode. */
  theme: 'light' | 'dark'
  /**
   * When true, install the listener that applies a ThemeRecipe's CSS variables
   * from a `THEME_RECIPE_MESSAGE` postMessage. Off by default: a component
   * playground has no theme controls and should not carry the listener.
   */
  acceptThemeRecipe?: boolean
}

/**
 * HTML injected into the sandbox `<head>`.
 *
 * The theme bridge is load-bearing and its reason is worth keeping: dzup dark
 * mode keys off `[data-theme="dark"]`, while `@vue/repl` expresses its `theme`
 * prop by writing `html.className = 'dark' | 'light'` — and only when the host
 * passes `previewTheme: true`. The observer mirrors that class onto
 * `data-theme`, so a theme toggle re-themes the preview **without reloading the
 * sandbox**, which would wipe the visitor's edits.
 */
export function sandboxHeadHTML(options: SandboxHeadOptions): string {
  const { assetBase, theme, acceptThemeRecipe = false } = options
  const themeBridge
    = `(function(){var el=document.documentElement;`
      + `function sync(){el.setAttribute('data-theme',el.classList.contains('dark')?'dark':'light');}`
      + `el.setAttribute('data-theme',${JSON.stringify(theme)});`
      + `new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class']});})();`

  // Applies the variables a ThemeRecipe expands to, plus the four data-*
  // attributes `applyThemeRecipe` sets. The recipe itself is never computed
  // here — the host runs @dzup-ui/tokens' own applyThemeRecipe and sends the
  // result, so there is exactly one theme engine (this task's stop condition).
  const recipeBridge
    = `(function(){var el=document.documentElement;window.addEventListener('message',function(e){`
      + `var d=e.data;if(!d||d.type!==${JSON.stringify(THEME_RECIPE_MESSAGE)})return;`
      + `var v=d.variables||{};for(var k in v)el.style.setProperty(k,v[k]);`
      + `var a=d.attributes||{};for(var n in a)el.setAttribute(n,a[n]);});})();`

  return [
    `<script src="${TAILWIND_BROWSER_CDN}"></script>`,
    `<link rel="stylesheet" href="${assetBase}tokens.css">`,
    `<link rel="stylesheet" href="${assetBase}core.css">`,
    `<style>html,body{margin:0;padding:16px;background:var(--dz-background, transparent);color:var(--dz-foreground, inherit);font-family:var(--dz-font-sans, system-ui, -apple-system, sans-serif);}</style>`,
    `<script>${themeBridge}</script>`,
    ...(acceptThemeRecipe ? [`<script>${recipeBridge}</script>`] : []),
  ].join('\n')
}

/**
 * Remove the indentation a template literal inherited from the story file's own
 * nesting, by the smallest amount every non-blank line shares.
 *
 * Stated precisely because "verbatim" is a claim this packet makes repeatedly:
 * **no character of markup is changed and no line is reordered** — only a
 * constant number of leading spaces, identical on every line, is removed. Vue
 * treats the result as the same template. The story's *relative* indentation,
 * which is the part an author chose, is preserved exactly.
 */
export function dedent(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').replace(/^\n+|\s+$/g, '').split('\n')
  const indents = lines
    .filter(line => line.trim() !== '')
    .map(line => /^ */.exec(line)![0].length)
  const common = indents.length === 0 ? 0 : Math.min(...indents)
  return lines.map(line => (line.trim() === '' ? '' : line.slice(common))).join('\n')
}

/**
 * Wrap a story's static template literal in the smallest SFC that mounts it.
 *
 * **This is a wrapper, not an example.** The `<template>` body is the story's
 * own markup; the only thing added is the `import` line the sandbox needs and
 * which Storybook supplies through the story's `components:` option. The
 * component names are read from the template, never invented — a playground
 * that synthesised markup would be the exact thing TASK-N2-D3 forbids twice.
 */
export function wrapStoryTemplate(componentNames: readonly string[], template: string): string {
  const names = [...new Set(componentNames)].sort()
  const body = dedent(template)
  const indented = body.split('\n').map(line => (line.trim() === '' ? '' : `  ${line}`)).join('\n')
  return [
    '<script setup lang="ts">',
    `import { ${names.join(', ')} } from '${PLAYGROUND_IMPORT_SPECIFIER}'`,
    '</script>',
    '',
    '<template>',
    indented,
    '</template>',
    '',
  ].join('\n')
}

/**
 * Every `Dz…`/`PascalCase` tag a template opens.
 *
 * The pattern is `[A-Z][A-Za-z0-9]*`, not `Dz[A-Za-z0-9]+` — constraint **B12**:
 * `GovernanceBadge` and `TeamMemberBadge` are public components without a `Dz`
 * prefix, and a `Dz`-only pattern is exactly the defect TASK-N2-A3 fixed in
 * `@dzup-ui/mcp`.
 */
export function componentTagsIn(template: string): string[] {
  const found = new Set<string>()
  for (const match of template.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) {
    const tag = match[1]
    if (tag !== undefined)
      found.add(tag)
  }
  return [...found].sort()
}
