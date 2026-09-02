/**
 * The CURATED half of `llms.txt` / `llms-full.txt` (TASK-N2-A3).
 *
 * This file is the **only** place in the repository where agent-facing llms
 * prose is written by hand. Everything else in those two files —
 * the component roster, descriptions, prop / event / slot / exposed tables, the
 * frozen taxonomies, v-model bindings, anatomy parts and usage snippets — is
 * assembled by `render-llms.ts` from `packages/core/docs/component-meta.json`
 * and can therefore not drift from the sources.
 *
 * The split matters. `llms.txt` is what coding agents actually read; the gap
 * this packet closes (A5-1) is that its content had no gate at all, so anything
 * hand-typed in it was a claim nobody was checking. Confining the hand-typed
 * part to this file makes "how much of llms.txt is unverifiable prose" a
 * question with a file-sized answer.
 *
 * NOTHING HERE MAY STATE A CATALOG COUNT. `yarn validate:llms` fails when a
 * curated string matches `<digits> components|families|props|events|slots|
 * blocks|tokens|variants`, because that is the hand-typed-facts class this
 * program has now found five times (P2-02 README versions · N2-T1 K4 phantom
 * token exports · N2-A1 F3 version literals · N2-A2 F-3 story `argTypes`
 * defaults) — and once in this file's own ancestor, `build-llms.mjs`, whose
 * `FAMILY_LABELS` hard-coded "the 11 component families" while the catalog had
 * 12. ADR citations and framework major versions are prose, not counts, and are
 * allowed.
 *
 * @module @dzup-ui/tooling/llms/llms-content
 */

/** Public URL of the component-API index, as served today. */
export const INDEX_URL = '/storybook/llms.txt'
/** Public URL of the full component-API document, as served today. */
export const FULL_URL = '/storybook/llms-full.txt'
/** Public URL of the landing site's separate BLOCKS index (a different document). */
export const BLOCKS_INDEX_URL = '/llms.txt'
/** Public URL of the landing site's separate BLOCKS full document. */
export const BLOCKS_FULL_URL = '/llms-full.txt'

/** The npm package every component is a named export of. */
export const PACKAGE = '@dzup-ui/core'

/** H1 of the concise index. Exactly one H1 per file — the gate checks it. */
export const INDEX_TITLE = 'dzup-ui components'
/** H1 of the full document. */
export const FULL_TITLE = 'dzup-ui components — full API'

/**
 * The `>` summary blockquote, per the llmstxt.org convention. Deliberately says
 * what the library *is* and how it is styled, and states no number.
 */
export const SUMMARY
  = 'The Vue 3 component library published as `@dzup-ui/core`. Every component is a named '
    + 'export of a single entry point, is styled exclusively through `--dz-*` design tokens '
    + '(no hardcoded colours, no scoped styles), themes via a `data-theme` attribute, and '
    + 'takes v-model through `defineModel` (ADR-16). This file is generated from the same '
    + 'metadata extraction the library documents itself with, so it cannot disagree with the '
    + 'shipped code.'

/** Curated conventions, stated once so no component section has to repeat them. */
export const CONVENTIONS_INTRO
  = 'These hold for every component below, so they are stated once here:'

/**
 * Conventions bullets that carry no generated data. The size/tone taxonomy
 * bullets are appended by the renderer from the artifact, never written here.
 */
export const CONVENTIONS: readonly string[] = [
  `**Import** — everything is a named export of \`${PACKAGE}\`: `
  + `\`import { DzButton, DzInput } from '${PACKAGE}'\`. Types come from \`@dzup-ui/contracts\`.`,
  '**Styling (ADR-04, ADR-19)** — components are styled only through CSS custom properties '
  + '(`var(--dz-*)`). There are no hardcoded colours and no `<style scoped>`. Override the look '
  + 'by re-mapping tokens or through the typed `ui` prop, not by patching classes; library CSS '
  + 'always loses to consumer CSS (cascade layers). dzup-ui is restyleable by contract, not unstyled.',
  '**Theming** — light/dark and brand themes are switched with a `data-theme` attribute on an '
  + 'ancestor element (typically `<html>`); tokens cascade from there.',
  '**v-model (ADR-16)** — stateful components expose v-model through `defineModel`. The default '
  + 'binding is `v-model`; named bindings are written `v-model:name` and are listed per component.',
  '**Provider defaults (ADR-20)** — many props declare `undefined` as their default on purpose: '
  + 'the surrounding `DzProvider` supplies the effective value at runtime. Every default printed '
  + 'below is the **declared** one, read from source. Where it says `undefined`, the value comes '
  + 'from the provider, not from the component.',
  '**Inherited props** — props declared on the `Base*Props` interfaces in `@dzup-ui/contracts` '
  + '(accessibility, behaviour, validation, appearance) are listed inline with each component\'s '
  + 'own props, because a consumer passes them the same way. Each component section says how many '
  + 'of its props are inherited.',
  '**Compound parts** — components such as `DzCardBody` are sub-parts of a parent and are used '
  + 'inside it. Each one names its parent, and its usage example is the parent\'s.',
] as const

/**
 * Per-component install line. `{name}` is substituted by the renderer; nothing
 * else in it varies, which is why it can be curated.
 */
export const INSTALL_TEMPLATE
  = `\`npm i ${PACKAGE}\` — then \`import { {name} } from '${PACKAGE}'\``

/** Human labels for the component families. A family with no label fails the gate. */
export const FAMILY_LABELS: Readonly<Record<string, string>> = {
  buttons: 'Buttons',
  cards: 'Cards',
  data: 'Data display',
  feedback: 'Feedback',
  forms: 'Forms',
  inputs: 'Inputs',
  layout: 'Layout',
  media: 'Media',
  navigation: 'Navigation',
  overlays: 'Overlays',
  // The 12th family (TASK-N2-A2 finding F-6). `CLAUDE.md` documents 11; the
  // capability matrix has always filed these two under `providers`. The gate
  // fails on an unlabelled family, which is how the disagreement surfaces.
  providers: 'Providers',
  typography: 'Typography',
}

/** Order families are rendered in. Any family not listed fails the gate. */
export const FAMILY_ORDER: readonly string[] = [
  'buttons',
  'inputs',
  'forms',
  'cards',
  'layout',
  'navigation',
  'overlays',
  'feedback',
  'data',
  'media',
  'typography',
  'providers',
] as const

/** Closing line of the index, cross-linking the separate BLOCKS document. */
export const INDEX_FOOTER
  = `Part of dzup-ui. The ready-made **blocks** catalog is a different document — `
    + `its index is at [${BLOCKS_INDEX_URL}](${BLOCKS_INDEX_URL}) and its full source at `
    + `[${BLOCKS_FULL_URL}](${BLOCKS_FULL_URL}) on the landing site.`

/** Closing line of the full document. */
export const FULL_FOOTER = INDEX_FOOTER

/**
 * Stated in both files, because an agent that reads a generated document is
 * entitled to know which fields are measured and which are absent. The renderer
 * fills the counts; this is the prose around them.
 */
export const FIDELITY_NOTE
  = 'Fidelity is published rather than assumed. Descriptions come from source JSDoc; where a '
    + 'member has none, the cell is `—` and nothing is invented. Usage snippets are verbatim '
    + 'slices of the component\'s Storybook story — never synthesised markup — and a component '
    + 'with no story says so.'

/** Sentence used where a component has no published example at all. */
export const NO_EXAMPLE_NOTE
  = 'No published Storybook story exists for this component, so no usage snippet is shown. '
    + 'This document never synthesises example markup.'

/** Sentence used for a compound part, which is documented through its parent. */
export const COMPOUND_EXAMPLE_TEMPLATE
  = 'A compound sub-part of `{parent}`; see that component\'s usage snippet.'

/**
 * Sentence for a component that DECLARES an API — it has a `.types.ts` — yet
 * from which the extractor recovered no props, events or slots.
 *
 * Silence here would read to an agent as "this component takes nothing", which
 * is a claim, and a false one — the same reason a missing usage snippet says so
 * rather than simply not appearing. One component is in this state today
 * (`DzAccordion`, whose props type is a discriminated union `vue-component-meta`
 * cannot resolve); `validate:llms` ratchets the count so a second cannot arrive
 * unnoticed.
 */
export const NO_MEMBERS_NOTE
  = 'No props, events or slots could be extracted for this component, although it '
    + 'declares them in source. That is an extraction gap, **not** a statement that it '
    + 'has none — read its types file before assuming an empty API.'

/**
 * Sentence for a component that genuinely declares nothing — a bare `.vue`
 * sub-part with no `.types.ts` and no `define*` macros, such as the menu
 * separators. Deliberately a *different* sentence from `NO_MEMBERS_NOTE`:
 * "declares nothing" and "we could not read what it declares" are different
 * facts, and telling an agent the wrong one is exactly the failure this
 * document is trying to stop.
 */
export const NO_API_NOTE
  = 'This component declares no props, events or slots; it renders a fixed element and '
    + 'takes only Vue\'s standard attributes.'
