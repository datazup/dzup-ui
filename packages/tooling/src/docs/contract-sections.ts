/**
 * The seven generated page sections the documentation contract promised and
 * nothing rendered (TASK-R5-O5).
 *
 * The 2026-08-11 reassessment's doc **03** names ten sections for every public
 * component page. At `99b963a` `apps/docs` rendered three — the API tables, the
 * playground, and the accessibility-and-evidence block — and the keyboard table
 * said *"Not yet derived"* on **144 of 144** pages. This module is the other
 * seven, and the rule it is written to is the same rule the rest of the docs
 * pipeline runs on:
 *
 * > **A page is a projection of an artifact.** If a section cannot be
 * > generated, the artifact is missing — build the artifact, never hand-type
 * > the page.
 *
 * So every renderer below names its source artifact in a comment, reads it from
 * `packages/core/docs/component-meta.json` (and the evidence artifacts the D2
 * layer already reads), and where the artifact has nothing to say it prints an
 * **honest "not declared"** cell that `validate:docs-pages` counts under a
 * ratchet. A silently-omitted section is the failure mode that let 144 pages
 * ship without a keyboard table for a year; an ugly visible one cannot.
 *
 * ## Section → artifact map
 *
 * | # | Section | Artifact |
 * |---|---|---|
 * | 1 | Intent and selection guidance | `record.intent` — the SFC header `@intent` block |
 * | 4 | Variants and controlled state | `anatomy.recipes` · `props`/`events` v-model pair · `stories` |
 * | 5 | Parts, states and tokens | `anatomy.parts` / `.states` / `.componentTokens` / `.optionalParts` |
 * | 6 | Provider defaults and context | `record.providerHooks` (ADR-20) · `anatomy.globalDefaults` |
 * | 7 | Keyboard | `anatomy.keyboard` — see `./evidence.ts` `renderKeyboardSection` |
 * | 8 | Locale, direction and formats | `anatomy.rtl` · `providerHooks` · capability `rtl-contract` |
 * | 9 | SSR, portals, performance, security | capability cells · `traits` · `securityBoundary` |
 * | 10 | States and migration | `anatomy.states` · capability `state-stories` · changesets |
 *
 * @module @dzup-ui/tooling/docs/contract-sections
 */

import type { ComponentMetaRecord } from '../meta/component-meta.ts'
import type { CapabilityRow, EvidenceSources } from './evidence.ts'
import { capabilityRowFor, cell } from './evidence.ts'

/** A `data-part` / `data-state` selector, shown so a reader can copy it. */
function attributeSelector(attribute: string, value: string): string {
  return `\`[data-${attribute}="${value}"]\``
}

/** One capability cell of a row, by kind. */
function cellOf(row: CapabilityRow | undefined, kind: string) {
  return row?.cells.find(c => c.kind === kind)
}

/**
 * How a capability cell reads in a sentence, with its artifacts.
 *
 * The five states are not collapsed (`<evidence_rules>`): `pass` is a lane that
 * ran, `present` is an artifact that exists, `stale` predates the component's
 * last change, `excepted` was waived with a reason, `unrun` measured nothing.
 */
function cellSentence(row: CapabilityRow | undefined, kind: string, absent: string): string {
  const c = cellOf(row, kind)
  if (c === undefined)
    return absent
  const where = c.artifacts === undefined || c.artifacts.length === 0
    ? ''
    : ` — \`${c.artifacts[0]}\``
  const note = c.note === undefined ? '' : ` ${cell(c.note)}`
  return `\`${c.state}\`${where}.${note}`
}

/** The heading every "not declared" cell carries, so the ratchet has one string. */
export const NOT_DECLARED = '**Not declared.**'

// ---------------------------------------------------------------------------
// 1 — Intent and selection guidance
// ---------------------------------------------------------------------------

/**
 * What the component is for, and what to reach for instead.
 *
 * Source: the `@intent` block in the component's own SFC header, extracted by
 * `generate:component-meta`. Deliberately **not** authored in `apps/docs`: a
 * selection guide that lives next to the site drifts from the component the
 * first time the component changes, and nothing would notice. Living in the
 * source header means the person changing the behaviour is holding the sentence
 * that describes it.
 */
export function renderIntent(record: ComponentMetaRecord): string[] {
  const lines = ['## Intent and selection guidance', '']
  if (record.intent === undefined || record.intent === '') {
    lines.push(
      `${NOT_DECLARED} \`${record.name}\` declares no \`@intent\` block in its source header, so`,
      'nothing here says what it is for or when to reach for something else. That is a gap in the',
      'component, not in this page: the guidance is authored in the SFC header and extracted by',
      '`yarn generate:component-meta`, never typed into the site.',
      '',
    )
    return lines
  }
  lines.push(...record.intent.split('\n'), '')
  return lines
}

// ---------------------------------------------------------------------------
// 4 — Variants, and controlled vs uncontrolled
// ---------------------------------------------------------------------------

/**
 * The recipe axes, and whether the component can be driven or left alone.
 *
 * Sources: `anatomy.recipes` for the axes (each one is mirrored onto the root
 * as `data-{axis}` carrying the RESOLVED value, which is the fact a consumer
 * needs in order to select on it), the prop/event pair for the `v-model`
 * surface, and the component's story ids for where each variant is shown.
 */
export function renderVariants(record: ComponentMetaRecord): string[] {
  const lines = ['## Variants and controlled state', '']
  const recipes = record.anatomy.recipes ?? []
  const models = record.props
    .filter(p => record.events.some(e => e.name === `update:${p.name}`))
    .map(p => p.name)

  if (recipes.length === 0 && models.length === 0) {
    lines.push(
      `${NOT_DECLARED} \`${record.name}\` declares no recipe axes in its anatomy and exposes no`,
      '`v-model` pair, so it has neither variants to list nor a controlled form to show. For a',
      'presentational component that is the whole truth; for an interactive one it means the anatomy',
      'has not been written down yet.',
      '',
    )
    return lines
  }

  if (recipes.length > 0) {
    lines.push(
      `**Recipe axes.** Each axis is mirrored onto the root as \`data-{axis}\` carrying the`,
      '**resolved** value — after group and provider inheritance, not the raw prop — which is what',
      'makes `[data-size="lg"]` a selector you can rely on.',
      '',
      '| Axis | Root attribute | Prop |',
      '| --- | --- | --- |',
      ...recipes.map((axis) => {
        const prop = record.props.find(p => p.name === axis)
        return `| \`${axis}\` | ${attributeSelector(axis, '…')} | ${
          prop === undefined ? '— *(inherited or fixed; no prop of this name)*' : `\`${axis}\``} |`
      }),
      '',
    )
  }

  if (models.length === 0) {
    lines.push(
      '**Controlled and uncontrolled.** This component exposes no `v-model` pair, so there is no',
      'controlled form: it holds no value a parent could own.',
      '',
    )
  }
  else {
    for (const model of models) {
      const alias = model === 'modelValue' ? '' : `:${model}`
      lines.push(
        `**Controlled and uncontrolled — \`${model}\`.** Both forms are supported, and they are`,
        'different contracts rather than two spellings of one.',
        '',
        '```vue',
        '<!-- Uncontrolled: the component owns the value. -->',
        `<${record.name} />`,
        '',
        '<!-- Controlled: you own it, and the component only ever asks. -->',
        `<${record.name} v-model${alias}="value" />`,
        '',
        '<!-- Controlled, long form — the same thing, written out. -->',
        `<${record.name} :${model}="value" @update:${model}="value = $event" />`,
        '```',
        '',
      )
    }
  }

  const stories = record.stories?.stories ?? []
  if (stories.length > 0) {
    lines.push(
      `**Where each variant is shown.** ${stories.length} stor${stories.length === 1 ? 'y' : 'ies'} in`,
      `\`${record.stories?.file ?? '—'}\`: ${stories.map(s => `\`${s.name ?? s.id}\``).join(', ')}.`,
      '',
    )
  }
  else {
    lines.push(
      '**Where each variant is shown.** No stories file exists for this component, so no variant has',
      'a published example. Recorded for `validate:story-dod` rather than filled in here.',
      '',
    )
  }
  return lines
}

// ---------------------------------------------------------------------------
// 5 — Parts, states and tokens
// ---------------------------------------------------------------------------

/**
 * The styling surface: what a consumer may address, and how.
 *
 * Source: the component's `Dz{Name}.anatomy.ts`, joined into
 * `component-meta.json` by `generate:component-meta` (ADR-19's five-layer
 * contract, layers 2–5). This is the section ADR-19 exists to make possible —
 * before the declaration, "every public component exposes parts or an explicit
 * none" was a claim nothing could check and the docs had to be written by hand.
 */
export function renderParts(record: ComponentMetaRecord): string[] {
  const a = record.anatomy
  const lines = ['## Parts, states and tokens', '']

  if (a.state !== 'declared') {
    lines.push(
      `${NOT_DECLARED} \`${record.name}\` has no \`Dz${record.name.replace(/^Dz/, '')}.anatomy.ts\`, so`,
      'nothing here says which nodes you may address, which states it advertises or which custom',
      'properties it reads. **That is not the same claim as having none** — it is that nobody has',
      'written them down. Until the declaration exists, a descendant selector against generated',
      '`tailwind-variants` class names is the only way in, and those names are free to change.',
      '',
    )
    return lines
  }

  const optional = new Set(a.optionalParts ?? [])
  lines.push(
    `**Parts** — addressable nodes, emitted as \`data-part\`. Reach one with the selector, or pass`,
    'classes by name through the typed `ui` prop; a typo in `ui` is a type error rather than a class',
    'that lands nowhere.',
    '',
    // The merge order, published per page rather than left in an ADR. It is the
    // answer to "I passed both and only one took effect", and it was undefined
    // anywhere a consumer could read it until TASK-R5-O6 (finding R-021).
    'When your `class` and a `ui` entry set the same Tailwind utility, **your `class` wins**: the',
    'merge order is recipe → `ui` → `class`, and `cn()` is tailwind-merge, so the last one through',
    'takes effect. That is what lets you restyle a wrapper someone else built without `!important`.',
    '',
  )
  if (a.parts.length === 0) {
    lines.push(
      'This component declares `parts: \'none\'` — it renders no element of its own. A renderless or',
      'pure-slot wrapper has nothing to address, which is a different fact from an undeclared anatomy.',
      '',
    )
  }
  else {
    lines.push(
      '| Part | Selector | Always present |',
      '| --- | --- | --- |',
      ...a.parts.map(p => `| \`${p}\` | ${attributeSelector('part', p)} | ${
        optional.has(p) ? 'no — renders zero or more than once' : 'yes'} |`),
      '',
      '```vue',
      `<${record.name} :ui="{ ${a.parts.map(p => `'${p}': 'ring-2'`).join(', ')} }" />`,
      '```',
      '',
    )
  }

  // Where a consumer's own `class`, `id` and `data-*` land (TASK-R5-O6).
  //
  // Rendered only when the component declares it, and the silence is the
  // message: absent means the ordinary case — one root, attributes reach it —
  // which is true of most of the catalogue and would be noise on every page.
  // A declaration means the answer is surprising, and a reader who is about to
  // write `<DzSlider class="w-full">` needs it.
  if (a.fallthrough !== undefined) {
    lines.push(
      a.fallthrough.target === 'none'
        ? '**Where your `class` lands** — nowhere. This component renders no element of its own.'
        : a.fallthrough.delegatesTo !== undefined
          ? '**Where your `class` lands** — on another component, which this one wraps.'
          : '**Where your `class` lands** — read this before you size or position it.',
      '',
    )
    if (a.fallthrough.target === 'none') {
      lines.push(
        'It renders no element of its own, so a `class`, an `id` or a `data-*` you pass **reaches',
        'nothing at all**. Style the markup you put in its slots instead.',
        '',
      )
    }
    else {
      lines.push(
        `Your \`class\`, \`id\` and \`data-*\` land on the \`${a.fallthrough.target}\` part —`,
        `${attributeSelector('part', a.fallthrough.target)}.`,
        a.fallthrough.delegatesTo !== undefined
          ? `This component renders no element of its own: its root **is** a \`${a.fallthrough.delegatesTo}\`, `
          + 'and your attributes pass straight through to it.'
          : a.fallthrough.target === 'root'
            ? 'This component renders **more than one root element**, so Vue cannot choose where your '
            + 'attributes go and the component chooses for it. This is the node it designates.'
            : 'That is an inner node, not the outermost element — so a width or a margin you pass '
              + 'applies there rather than to the whole component.',
        '',
        `The merge order above still holds: your \`class\` beats \`ui.${a.fallthrough.target}\`.`,
        '',
      )
    }
  }

  const states = a.states ?? []
  lines.push('**States** — the values `data-state` may take, plus the presence-only boolean attributes.', '')
  if (states.length === 0) {
    lines.push('This component declares no states: nothing about it is advertised to CSS or to a test.', '')
  }
  else {
    lines.push(
      '| State | Selector |',
      '| --- | --- |',
      ...states.map(s => `| \`${s}\` | ${attributeSelector('state', s)} |`),
      '',
    )
  }

  const tokens = a.componentTokens ?? []
  lines.push(
    '**Component tokens** — the custom properties this component reads, and therefore every one you',
    'may set. The list is the complete supported override surface; any other `--dz-*` it inherits is',
    'not a promise.',
    '',
  )
  if (tokens.length === 0) {
    lines.push(
      'This component declares no component tokens of its own: it is styled entirely from the global',
      'semantic layer, which the theme owns.',
      '',
    )
  }
  else {
    lines.push(
      '| Custom property |',
      '| --- |',
      ...tokens.map(t => `| \`${t}\` |`),
      '',
    )
  }
  lines.push(`Declared in \`${a.source ?? '—'}\`.`, '')
  return lines
}

// ---------------------------------------------------------------------------
// 6 — Provider defaults and context
// ---------------------------------------------------------------------------

/** The ADR-20 reader → what a `DzProvider` supplies through it. */
const PROVIDER_CONTEXTS: Record<string, string> = {
  useDzDefaults: 'per-component prop defaults (`size`, `variant`, `tone`, `density`)',
  useDzMotion: 'the motion preference, including `prefers-reduced-motion`',
  useDzMotionAttribute: 'the motion preference, reduced to the attribute a template binds',
  useDzDirection: 'the document writing direction',
  useDzLocale: 'the active locale',
  useDzMessages: 'the translated string catalogue',
  useComponentMessages: 'the translated string catalogue, with this component\'s branch applied',
  useDzFormats: 'number, date and currency formatting',
  useDzTestIds: 'the test-id attribute name and prefix',
  useDzPortalTarget: 'where teleported content is mounted',
  useDzSanitizer: 'the HTML sanitiser applied to host-supplied markup',
  useDzTheme: 'the active theme and colour mode',
}

/**
 * Which `DzProvider` contexts this component actually reads.
 *
 * Source: `record.providerHooks`, which `generate:component-meta` reads from
 * the component source as CALL SITES — so it is the adoption itself, not a
 * claim about it. TASK-R5-O3 took that field from 0 to 120 of 208 records; a
 * component that reads none says so, because the ADR-20 acceptance packet had
 * to count these by hand precisely because nothing published them.
 */
export function renderProvider(record: ComponentMetaRecord): string[] {
  const hooks = record.providerHooks
  const defaults = record.anatomy.globalDefaults ?? []
  const lines = ['## Provider defaults and context', '']

  if (hooks.length === 0) {
    lines.push(
      `${NOT_DECLARED} \`${record.name}\` calls no \`DzProvider\` reader, so **nothing an application`,
      'sets on the provider reaches it** — not the locale, not the motion preference, not the',
      'direction, not the test-id prefix. Every value it uses comes from its own props and defaults.',
      'That is measured from its source rather than assumed, and it is a gap in the component (ADR-20',
      'adoption), not in this page.',
      '',
    )
    return lines
  }

  lines.push(
    'This component reads the following contexts from the surrounding `DzProvider` (ADR-20). The',
    'precedence is fixed and not per-component: **prop, then any group context, then the provider,',
    'then the component\'s own default.**',
    '',
    '| Reader | What the provider supplies through it |',
    '| --- | --- |',
    ...hooks.map(h => `| \`${h}\` | ${PROVIDER_CONTEXTS[h] ?? '— *(reader not in the published context map)*'} |`),
    '',
  )
  if (defaults.length > 0) {
    lines.push(
      `**Provider-settable defaults:** ${defaults.map(d => `\`${d}\``).join(', ')} — declared in the`,
      'anatomy, so a prop left undefined on this component resolves from the provider rather than',
      'from a hard-coded value.',
      '',
    )
  }
  return lines
}

// ---------------------------------------------------------------------------
// 8 — Locale, direction and formats
// ---------------------------------------------------------------------------

/**
 * What the component does in another locale and in a right-to-left document.
 *
 * Sources: `anatomy.rtl` (the three-axis contract TASK-OSS-P4-05 introduced and
 * `generate:rtl-matrix` renders catalogue-wide), the locale-related provider
 * readers, and the capability matrix's `rtl-contract` cell for what has been
 * measured. Three axes rather than one boolean, because they fail
 * independently.
 */
export function renderLocale(record: ComponentMetaRecord, ev?: EvidenceSources): string[] {
  const rtl = record.anatomy.rtl
  const hooks = record.providerHooks
  const row = ev === undefined ? undefined : capabilityRowFor(record.name, ev)
  const lines = ['## Locale, direction and formats', '']

  if (rtl === undefined) {
    lines.push(
      `${NOT_DECLARED} \`${record.name}\` declares no \`rtl\` contract, so this page cannot say`,
      'whether its layout mirrors, whether the arrow keys swap, or which of its icons carry',
      'direction. "Does it mirror?" has three defensible answers and only the component knows which',
      'applies; leaving it undeclared is how a catalogue ends up mirroring some things and not',
      'others for no stated reason.',
      '',
    )
  }
  else {
    lines.push(
      '| Axis | Declared | What it means |',
      '| --- | --- | --- |',
      `| \`mirrors\` | \`${rtl.mirrors}\` | ${rtl.mirrors === 'layout'
        ? 'Margins, padding, borders and insets are logical, so the box flips with the document.'
        : 'The geometry is **physical on purpose** — a claim, not an oversight.'} |`,
      `| \`keyboard\` | \`${rtl.keyboard}\` | ${rtl.keyboard === 'swap-horizontal'
        ? 'ArrowLeft and ArrowRight exchange meaning in a RTL document.'
        : 'The arrow keys do not swap: they move on the block axis, or map to a direction the user can see.'} |`,
      `| \`icons\` | ${rtl.icons === undefined || rtl.icons.length === 0
        ? '—'
        : rtl.icons.map(i => `\`${i}\``).join(', ')} | ${rtl.icons === undefined || rtl.icons.length === 0
        ? 'No icon on this component carries direction, so none is mirrored.'
        : 'These parts render a direction-bearing icon and mirror with the layout.'} |`,
      '',
    )
  }

  const localeHooks = hooks.filter(h => /Locale|Direction|Messages|Formats/i.test(h))
  lines.push(
    localeHooks.length === 0
      ? '**Locale and formats.** This component reads no locale, message-catalogue or format context '
      + 'from the provider: nothing it renders changes with the application\'s locale.'
      : `**Locale and formats.** Reads ${localeHooks.map(h => `\`${h}\``).join(', ')} from the `
        + 'surrounding `DzProvider`, so its strings and formatted values follow the application locale.',
    '',
    `**Measured:** \`rtl-contract\` is ${cellSentence(row, 'rtl-contract', 'not a requirement at this tier, so nothing measures it.')}`,
    '',
  )
  return lines
}

// ---------------------------------------------------------------------------
// 9 — Server rendering, portals, performance and security
// ---------------------------------------------------------------------------

/**
 * The operational notes: what happens on a server, in a portal, at scale, and
 * at a security boundary.
 *
 * Source: the capability matrix row — `ssr-sample`, `portal-hydration`,
 * `perf-baseline`, `csp-fixture`, `url-policy`, `malicious-corpus` and
 * `threat-model` cells, plus the row's `traits` and `securityBoundary`. Every
 * state is published as measured, and `unrun` is printed rather than routed
 * around.
 */
export function renderOperational(record: ComponentMetaRecord, ev?: EvidenceSources): string[] {
  const lines = ['## Server rendering, portals, performance and security', '']
  const row = ev === undefined ? undefined : capabilityRowFor(record.name, ev)

  if (row === undefined) {
    lines.push(
      `${NOT_DECLARED} \`${record.name}\` has no capability-matrix row, so nothing on this page says`,
      'what it owes on a server, in a portal, at scale or at a security boundary. That is a gap in',
      'the matrix, not a clean bill of health.',
      '',
    )
    return lines
  }

  const teleports = row.traits.includes('teleports')
  const dataset = row.traits.includes('dataset')
  lines.push(
    '| Concern | State |',
    '| --- | --- |',
    `| **Server rendering** | ${cellSentence(row, 'ssr-sample', 'Not a requirement at this tier.')} |`,
    `| **Portal / teleport** | ${teleports
      ? cellSentence(row, 'portal-hydration', 'Declared `teleports`, but no `portal-hydration` cell exists for it.')
      : 'Does not teleport: it renders in place, so there is no portal to hydrate.'} |`,
    `| **Performance baseline** | ${dataset
      ? cellSentence(row, 'perf-baseline', 'Declared `dataset`, but no `perf-baseline` cell exists for it.')
      : cellSentence(row, 'perf-baseline', 'Not a dataset component; no baseline is owed.')} |`,
    `| **Security boundary** | \`${row.securityBoundary}\`${row.securityBoundary === 'none'
      ? ' — no host-supplied HTML, file, URL or payload reaches a sink.'
      : ' — a hostile input can reach a sink here, and the cells below are what has been measured.'} |`,
    '',
  )

  if (row.securityBoundary !== 'none') {
    lines.push(
      '| Security lane | State |',
      '| --- | --- |',
      `| \`threat-model\` | ${cellSentence(row, 'threat-model', 'Not owed at this boundary.')} |`,
      `| \`malicious-corpus\` | ${cellSentence(row, 'malicious-corpus', 'Not owed at this boundary.')} |`,
      `| \`csp-fixture\` | ${cellSentence(row, 'csp-fixture', 'Not owed at this boundary.')} |`,
      `| \`url-policy\` | ${cellSentence(row, 'url-policy', 'Not owed at this boundary.')} |`,
      '',
    )
  }

  lines.push(
    '**Peer packages.** Which external packages this component can reach is a property of the built',
    'artifact, not of its source, and is measured by `yarn report:peer-surface` over `dist/` — a',
    'report with no baseline and no ratchet, deliberately outside `validate:all`, because the',
    'numbers depend on decisions the owner has not taken. It is not summarised here rather than',
    'summarised wrongly.',
    '',
  )
  return lines
}

// ---------------------------------------------------------------------------
// 10 — States and migration
// ---------------------------------------------------------------------------

/**
 * Where each declared state is shown, and what has changed.
 *
 * Sources: `anatomy.states` for the union, the capability matrix's
 * `state-stories` cell for whether each one has a published example, and the
 * component's `componentCommit` for when it last moved. Migration prose comes
 * from the changesets, which are the release notes' single source — a page that
 * hand-typed a migration note would drift from the release it describes.
 */
export function renderStates(record: ComponentMetaRecord, ev?: EvidenceSources): string[] {
  const states = record.anatomy.states ?? []
  const row = ev === undefined ? undefined : capabilityRowFor(record.name, ev)
  const lines = ['## States and migration', '']

  if (record.anatomy.state !== 'declared') {
    lines.push(
      `${NOT_DECLARED} \`${record.name}\` declares no anatomy, so there is no state union to show`,
      'examples for.',
      '',
    )
  }
  else if (states.length === 0) {
    lines.push(
      'This component declares no states, so there is no state matrix to show. A presentational',
      'component that renders the same way every time is the normal case for this.',
      '',
    )
  }
  else {
    lines.push(
      `\`${record.name}\` advertises ${states.length} state${states.length === 1 ? '' : 's'}:`,
      `${states.map(s => `\`${s}\``).join(', ')}. Each is emitted as \`data-state\` or as a`,
      'presence-only boolean attribute, so it is selectable in CSS and assertable in a test.',
      '',
      `**Published examples:** \`state-stories\` is ${cellSentence(row, 'state-stories', 'not a requirement at this tier, so no state example is owed.')}`,
      '',
    )
  }

  lines.push(
    '**Migration.** Breaking changes to this component are recorded in the repository\'s changesets',
    'and published in the release notes; nothing is restated here, because a hand-typed migration',
    'note drifts from the release it describes the first time the release changes. This component',
    `last changed at \`${record.componentCommit.slice(0, 7)}\`.`,
    '',
  )
  return lines
}

// ---------------------------------------------------------------------------
// The block, in contract order
// ---------------------------------------------------------------------------

/**
 * Sections 4, 5, 6, 8, 9 and 10, in the order doc 03 names them.
 *
 * Section 1 is rendered separately (it belongs above the API tables, not below
 * them) and section 7 lives inside the accessibility block, beside the WCAG
 * scope list it is evidence for.
 */
export function renderContractSections(
  record: ComponentMetaRecord,
  ev?: EvidenceSources,
): string[] {
  return [
    ...renderVariants(record),
    ...renderParts(record),
    ...renderProvider(record),
    ...renderLocale(record, ev),
    ...renderOperational(record, ev),
    ...renderStates(record, ev),
  ]
}
