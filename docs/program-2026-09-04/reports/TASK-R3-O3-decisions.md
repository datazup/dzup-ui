# TASK-R3-O3 — decision sheets

> Written 2026-09-17 against `ui/dzup-ui` `main` @ `569d887` + dirty tree
> (uncommitted TASK-R5-O4 work). Pro read-only at `esmir` @ `1c55355`.
> The owner delegated these decisions for this run ("decide what is best and
> continue"). Each sheet records the choice as **taken — agent choice under owner
> delegation 2026-09-17** and says how to reverse it. Register numbers continue
> from D66 in `../EXECUTION-STATUS.md`.

---

## D67 — Decision: `DzGrid` span API

**Raised by:** FORM-OSS-04 "Not done" · `DzGrid.formLayout.spec.ts:66` ("a
spanning field is a raw class on the child") · Form spec F-16x. **Today:** the
columns live on the container (`cols: GridCols | { sm, md, lg }`, `GridCols =
1|2|3|4|5|6|12`); nothing types how many columns a child occupies. Pro's
`DzFormGridLayout.vue` wraps every child in a `<div>` and looks its class up in
`FORM_GRID_SPANS` (12 literal strings `col-span-full md:col-span-N`, in
`DzFormRenderer.variants.ts:108-121`) because a class built at runtime is
invisible to Tailwind's scanner. The Form document admits `columns: 1|2|3|4|6|12`
and `layout.colSpan: number` — span only, no start/end.

### Option (a) — a `span` attribute on arbitrary grid children

```vue
<DzGrid :cols="{ sm: 1, md: 12 }">
  <DzInput v-bind="dzGridSpan({ md: 6 })" />   <!-- → data-span-md="6" -->
</DzGrid>
```

`DzGrid` would carry child-targeting literal selectors
(`[&>[data-span-md='6']]:md:col-span-6`, 13 values × 4 breakpoints = 52 classes)
on **every** grid instance, and a typed helper would produce the attributes.

- **RTL:** safe — `grid-column: span N` is writing-mode relative.
- **SSR:** neutral — static classes and attributes, no measurement.
- **Costs:** 52 arbitrary-variant classes serialised on every grid, in SSR HTML
  too; the attribute only works on a *direct* child whose root element receives
  it (a component with `inheritAttrs: false` swallows it silently — `DzMention`,
  `DzCombobox`, `DzPersonaSelector` all do); the span is not discoverable from
  the child's own props; a `data-span-*` vocabulary is a styling surface ADR-19
  never reviewed.
- **Pro would delete:** `FORM_GRID_SPANS` and `spanClass()`; it would keep the
  wrapper `<div>` (its slot content is not guaranteed to forward attributes).

### Option (b) — a `DzGridItem` compound part with a typed `span` ✅

```vue
<DzGrid :cols="{ sm: 1, md: 12 }">
  <DzGridItem :span="{ md: 6 }"><DzInput /></DzGridItem>
  <DzGridItem span="full"><DzTextarea /></DzGridItem>
</DzGrid>
```

```ts
type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full'
interface ResponsiveSpan { base?: GridSpan, sm?: GridSpan, md?: GridSpan, lg?: GridSpan }
interface DzGridItemProps { span?: GridSpan | ResponsiveSpan, as?: string }
```

A lone `DzGridItem.vue` beside `DzGrid.vue` (the `DzResizablePanel` /
`DzSplitterPanel` shape): it renders one element whose class comes from a literal
per-breakpoint map in `DzGrid.variants.ts`, so the scanner sees every class.

- **RTL:** safe — `col-span-*` is `grid-column: span N / span N`; grid lines
  count from the inline-start edge, so a span mirrors under `dir="rtl"` with
  nothing to configure. No `start`/`end` prop in this change: the Form document
  has none, and `col-start-*` would be additive later (and also logical).
- **SSR:** neutral — a pure computed class; no DOM read, no `window`, no
  `useId`, identical server and client output.
- **Anatomy:** `DzGrid` is Tier A and declares no anatomy; `DzGridItem` follows
  its parent and emits **no** `data-part`, so it introduces no part and no
  anatomy update is owed (`maxUndeclaredEmissions` stays 0). Declaring layout
  anatomy is the Tier A packet D25 names, not this one.
- **Registration:** classified by the ownership generator as a `compound-part`
  of `DzGrid` (name prefix, no story of its own) — no new quality tier row,
  capability row or docs page; the story lives in `DzGrid.stories.ts`.
- **Costs:** one more exported `.vue` (catalog count +1); a consumer must wrap a
  field to span it (the same wrapper Pro already renders).
- **Pro would delete:** `FORM_GRID_SPANS` (12 entries) from
  `DzFormRenderer.variants.ts`, the `spanClass()` lookup, and the hand-written
  `<div :class>` wrapper in `DzFormGridLayout.vue`, replaced by
  `<DzGridItem :span="{ md: clamped }">`. The clamp to the document's column count
  stays in Pro — it is a document rule, and a Core item cannot know its parent's
  per-breakpoint column count without a provide/inject this change avoids.

**Recommendation: (b).** It is typed, discoverable, works for any child
(including components that do not inherit attributes), costs nothing on grids
that do not span, and is the shape every comparable library ships (a grid item).
(a) makes every grid pay for a feature few use and fails silently on the exact
controls a form renders. **Reversibility:** additive (`patch`); removing
`DzGridItem` before 1.0 is a `minor` with a deprecation series, and nothing
existing changes behaviour. **State: taken — agent choice under owner delegation
2026-09-17 (reversible: delete `DzGridItem.vue`, its export and the
`gridItemSpanMap` before a release; after release, deprecate then remove in a
minor).**

---

## D68 — Decision: `utility` ownership kind

**Raised by:** FORM-OSS-03 owner Q1 (`../program-2026-08/EXECUTION-STATUS-FORM.md`
§Unresolved 1). **Today:** ownership schema **1.1.0** has no `utility` and no
`injection-key` kind. `unclassified` = **29** at `569d887` = 23 compound-context
injection keys (`DZ_ACCORDION_KEY` …) + `DzResolver`, `cn`, `themeScript`,
`getThemeScript`, `warnDeprecated`, `resetDeprecationWarnings`. Ten value codecs
(`emptyValueFor`, `isEmptyValue`, `toNumberValue`, `toIsoDate`, `fromIsoDate`,
`toIsoTime`, `fromIsoTime`, `toFileRef`, `isFileRef`, `isJsonSerializable`) were
parked in `@dzup-ui/contracts` (`form-value.ts`) because adding them to Core would
have raised the down-only ceiling to 39.

**Options:**
- **(a)** schema **1.2.0** adds `utility` (pure runtime helper, no component,
  no reactive state) **and** `injection-key` (the kind the ceiling's own
  `$comment` has named since 2026-08-20). Classifier rules: `DZ_*_KEY` exported
  from a family → `injection-key` with `parentComponent`; a function/const
  exported from `utilities/` or `theme/` → `utility`. `unclassified` 29 → **0**,
  and the ceiling is lowered to 0 in the same change. Touches
  `ownership-manifest.schema.json`, `ownership-manifest.types.ts`, `classify.ts`
  + spec, the runtime-lookup emitter (must ignore both kinds) and every consumer
  that switches on `kind` (Nuxt module registration, MCP, resolver).
- **(b)** classify the codecs as `contract` and leave Core's 29 alone — solves
  only the codecs, and they are *runtime* functions, which is what the
  contracts package's "types only, stated exception for `assertNever`" rule was
  written to keep small.
- **(c)** leave — every future pure helper faces the same "park it in contracts
  or raise a down-only ceiling" choice.

**Recommendation: (a)**, because the ceiling exists to force classification and
29 of 29 unclassified entries fall into two kinds that are already named; a
schema minor with a total re-classification is cheaper than a standing exception.
The codecs may then stay in contracts (Pro already imports them there) or move;
moving is a separate, breaking choice and is **not** recommended. **Cost:** one
tooling packet (schema + classifier + 3 consumers + regenerate ownership →
quality → capability → component-meta → llms → docs-pages). **Reversibility:**
a schema minor; consumers that do not know the new kinds must treat unknown kinds
as ignorable (verify Nuxt/MCP before shipping). **State: recommendation taken as
the decision — agent choice under owner delegation 2026-09-17; NOT executed**
(a schema migration is outside TASK-R3-O3's scope; reversible: it is unexecuted).

---

## D69 — Decision: the `time` profile has no offset

**Raised by:** FORM-OSS-03 owner Q4 · renderer contract C1.5 and its "Open owner
decisions" §1. **Today:** `DzTimePicker` emits a local wall-clock `HH:mm` /
`HH:mm:ss` (`defineModel<string>({ default: '' })`), which is RFC 3339
`partial-time`, **not** JSON Schema `format: time` (`full-time` = partial-time +
offset). **Finding (Pro, read-only):** Pro's built-in `dz.date` renderer matches
`format: 'time'` (`registry/builtInRenderers.ts:184`) and `dateCodec.fromControl`
passes a string through unchanged (`registry/valueCodecs.ts:151-168`) — so a
`format: time` field bound to a time control would store an offset-less value
that a strict `time` validator rejects. Nothing ships a `dz.time` row today, so it
is latent, not live.

**Options:**
- **(a)** keep the control wall-clock; the **codec owns the zone** — a Pro
  `dz.time` codec maps `HH:mm[:ss]` ↔ `HH:mm:ss±hh:mm` using a zone the fragment
  or provider declares, and a document that genuinely wants wall-clock time uses
  a named custom format (e.g. `x-dz-partial-time`) rather than `time`.
- **(b)** add `timeZone?: string` to `DzTimePicker` and emit `full-time` when it
  is given — additive, but the control then formats instants, duplicates the
  codec, and has to answer DST questions for a value that has no date.
- **(c)** leave C1.5 as "somebody has to own this".

**Recommendation: (a).** C1.5 already argues it — a control cannot invent an
offset it was never given, and a time without a date cannot resolve DST, so the
only party with enough information is the renderer that knows the document's
zone. It needs **no Core change**. **Cost:** a Pro follow-up (a `dz.time` codec +
refusing `format: time` in `dz.date` without a zone). **Reversibility:** full —
(b) remains available additively if a non-renderer consumer needs it. **State:
taken — agent choice under owner delegation 2026-09-17 (reversible: nothing in
Core changed; C1.5 wording stands).** Pro follow-up is a note, not an edit.

---

## D70 — Decision: C9 on controls that own no option source

**Raised by:** this task (success criterion `future` 5 → 0, "no new control").
**Today:** three of the five `future` cells are not missing *seam* — the seam has
existed since TASK-FORM-OSS-03 — they are controls with **no option source to
drive**: `DzCheckboxGroup` and `DzRadioGroup` render whatever children the host
slots in (`DzCheckbox`/`DzRadio`); `DzTagsInput` takes free text and has no
suggestion list. The contract's own rule: *"A control with only static options is
`n-a`."* Pro's `dz.radio` / `dz.checkbox-group` render static `optionItems` and
route remote option sets to `dz.select`/`dz.combobox` (read-only check,
`DzFormRadioControl.vue`).

**Options:**
- **(a)** re-review the three cells as `n-a` in `packages/tooling/src/forms/assessments.ts`
  with the reason and evidence; the derived C9 probe (a HARD clause) overrides the
  review automatically the day any of them declares `AsyncOptionsProps`.
- **(b)** add an `items` prop + the seam to both groups and a suggestion source
  to `DzTagsInput` — three features (and for `DzTagsInput` a whole combobox), well
  beyond a residual packet.
- **(c)** keep `future` — which says "the seam does not exist yet", and that is no
  longer true.

**Recommendation: (a)** for the three; the two controls that *do* own or forward
an option source (`DzMention`, `DzPersonaSelector`) are wired for real in this
task instead. **Reversibility:** one reviewed cell each; the probe re-derives the
cell if the seam is ever declared. **State: taken — agent choice under owner
delegation 2026-09-17 (reversible: restore the three reviewed `future` cells in
`assessments.ts` and `yarn generate:form-readiness`).**

---

## D71 — Decision: `DzMention`'s function resolver after the seam lands

**Raised by:** this task (`<mention>`: "its private loader is deleted").
**Today:** `DzMentionTrigger.options` is `DzMentionOption[] | DzMentionOptionResolver`
(public type). The private loader was `resolveOptions()` — a monotonic
`resolveToken` fence plus a private `loading` ref, with no error path (a rejected
resolver left an unhandled rejection and a stale list).

**Options:**
- **(a)** delete the private loader; drive **both** host-driven (`optionsState`
  + `@load-options`) and resolver-driven mentions through `useAsyncOptions`: a
  resolver becomes a host adapter that runs against the seam's `AbortSignal`
  (supersede = abort, replacing the token fence) and reports
  `loading → ready | empty | error` into the same state; keep the resolver type.
- **(b)** as (a) and mark `DzMentionOptionResolver` `@deprecated` in favour of
  `@load-options`.
- **(c)** remove the resolver form — breaking (`minor`) and forbidden by this
  task's additive scope.

**Recommendation: (a) now, (b) as a later owner call.** Deprecation is an owner
act (VERSIONING.md §4 — a full `0.x` minor series), and the resolver is the
convenient API for a single-trigger mention; the seam is what a renderer needs.
**State: (a) taken — agent choice under owner delegation 2026-09-17
(reversible: restore `resolveOptions()` from `569d887`); (b) left open.**

---

## D72 — Decision: two `<done_check>` probes in TASK-R3-O3 are fragile

**Raised by:** this task. (1) `grep -n "useAsyncOptions" packages/core/src/components/**/DzMention.vue`
works **by accident**: without `globstar`, `**` degrades to `*` and matches one
directory level, which is exactly where `forms/DzMention.vue` sits (verified in
Git Bash and `sh`). A family move would silently turn it into a never-passing
check. (2) `grep -rl "useAsyncOptions" packages/core/stories` counts files that
*mention* a composable name, not stories that walk loading → ready → error →
retry.

**Options:** (a) amend (1) to the literal path and (2) to count story exports
named `AsyncOptions` in `packages/core/stories/forms` · (b) leave.
**Recommendation: (a).** **State: open** (a task-file amendment is the program
owner's).
