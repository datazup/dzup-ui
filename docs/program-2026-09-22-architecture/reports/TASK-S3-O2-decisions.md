# TASK-S3-O2 — owner-decision sheet

> Three decisions ride along with the form-control primitives. Every number was
> measured on 2026-09-24 at `ui/dzup-ui` **`4e4e46f`** (not copied from the
> programme README, five of whose §2 numbers the register's §1.1 already
> corrects). Read with [`TASK-S3-O2-handoff.md`](./TASK-S3-O2-handoff.md).
>
> **None of these three appears in the 62-row
> [owner-decision register](./owner-decision-register-2026-09-22.md)** — not as a
> row, and not in its §6.1 consolidated / §6.2 superseded / §6.3 out-of-scope
> lists — although README §7 item 9 names all three. They were dropped, not
> closed. This sheet is their record, and §8.4 is appended to the register so the
> entry point carries them.
>
> Predecessor: [`../../program-2026-09-04/reports/TASK-R3-O3-decisions.md`](../../program-2026-09-04/reports/TASK-R3-O3-decisions.md)
> (**D67** span API, **D68** `utility` kind, **D69** `time` profile, **D71**
> `DzMention` resolver). D67, D70 and D71(a) were **taken and executed**; D68 was
> taken and **not executed**; D69 was taken and needs **no Core change**. What
> follows is what is still open, with the engineering that has landed since.

| id | Question | State entering this task | State leaving it |
|---|---|---|---|
| `D-S3O2-1` | `DzGrid` span API — the row axis and the document's spelling | D67 shipped the column axis; the row axis did not exist | **Implemented** under owner delegation; ratifiable or reversible (§1) |
| `D-S3O2-2` | The `utility` ownership kind (+ `injection-key`), schema 1.2.0 | D68 recommendation taken, **never executed** | Re-costed with today's numbers; **still not executed** — it is a tooling packet, not this one (§2) |
| `D-S3O2-3` | The `time` format profile | D69 taken: the codec owns the zone, no Core change | **Re-verified still true at `4e4e46f`**; one unchanged Pro follow-up (§3) |
| `D-S3O2-4` | `@deprecate` `DzMentionOptionResolver`? | D71(b) "left open" | Re-presented; recommendation **defer** (§4) |

---

## 1. `D-S3O2-1` — the `DzGrid` span API: the row axis, and `colSpan`/`rowSpan`

**Status: implemented under the owner's standing delegation for this run. Fully
reversible before publication — nothing is released (`@dzup-ui/core` 404s on npm;
`find .changeset -name '*.md' -not -name 'README.md' | wc -l` → **41** before
this task, **42** after; `ls .changeset/*.md` over-counts by one, because
changesets ships its own `.changeset/README.md`).**

### What was measured, not assumed

README §1 says *"`DzGrid` has no span API"*. That was true on 2026-09-22 only in
the sense that the work was uncommitted; at `4e4e46f` the worktree carries
`DzGridItem.vue`, `gridItemSpanMap`, nine tests and a story from TASK-R3-O3
(D67 option (b)). What did **not** exist:

| Form document field (`dzup-form-document-v1alpha1.schema.json` `$defs.nodeLayout`) | API at `4e4e46f` |
|---|---|
| `colSpan: integer 1..12` | `DzGridItem.span` — same semantics, **different name** |
| `rowSpan: integer 1..12` | **nothing.** `grep -rn "row-span" packages/ apps/` → 0 hits |

So a document carrying `layout.rowSpan` had to be rendered with a raw
`row-span-2`, which is the violation doc 03 §3 exists to prevent, moved into the
component boundary instead of removed — exactly the argument D67 made for the
column axis, unapplied to the row axis.

### The decision taken

`DzGridItem` gains **`rowSpan`** (`GridSpan | ResponsiveSpan`, the same type as
the column axis) and **`colSpan`** as an additive alias of `span`. `span` is
retained, not deprecated; resolution is `colSpan ?? span`, and passing both warns
once per session.

Two reasons for the alias rather than a rename:

1. **A bare `span` is ambiguous the moment a second axis exists.** "Span of
   what?" has one answer today and two after this change.
2. **It is the document's own field name**, so a renderer forwards `node.layout`
   with no translation — which is the whole argument D67 won.

### Alternatives rejected

| # | Option | Why not |
|---|---|---|
| (a) | **Rename `span` → `colSpan`** | Breaking for the API D67 shipped, for no gain the alias does not already give. `span` also reads better on a grid with no row spans, which is most of them. Under `0.x` a rename is a `minor` (`VERSIONING.md` §3) plus a dev warning plus a codemod entry — three artifacts to buy tidiness |
| (b) | **Add `rowSpan` only, leave `span` as the column axis** | Leaves the asymmetric pair `span`/`rowSpan`, where a reader cannot tell which axis the unprefixed one means, and a renderer still needs a `colSpan → span` mapping — the lookup table D67 deleted, reintroduced one field smaller |
| (c) | **Child-targeting selectors on `DzGrid`** (D67 option (a), `data-span-md="6"`) | Already costed and rejected in D67: 52+ arbitrary-variant classes serialised on **every** grid instance including in SSR HTML, and it fails **silently** on any child with `inheritAttrs: false` — which `DzMention`, `DzCombobox` and `DzPersonaSelector` all are. Not revisited; adding `rowSpan` would double it to 104 |
| (d) | **`colStart`/`rowStart`/`colEnd`** as well | The document has no start or end field, so nothing can produce one. D67 already recorded start as additive-later. Out of scope: an API with no producer is a maintenance cost with no consumer |
| (e) | **`style="grid-row: span 2"`** instead of a class table | Escapes the cascade-layer and token contract (ADR-04, ADR-19), and an inline style cannot be overridden by a consumer's `ui` prop or layer. It would also make the scanner argument moot by abandoning the scanner |
| (f) | **A second responsive/breakpoint system** | Explicitly refused: the change reuses the four breakpoints `ResponsiveCols`/`ResponsiveSpan` already have (`base`, `sm`, `md`, `lg`). No new breakpoint, no container query, no new engine |

### Is a raw class still needed anywhere?

**For the Form document's layout vocabulary, no.** `columns` (`DzGrid.cols`,
`1|2|3|4|5|6|12` ⊇ the document's `1|2|3|4|6|12`), `gap` (`LayoutGap` ⊇ the
document's five), `colSpan` and `rowSpan` are now all typed props. That is the
complete `DzupGridNode` + `nodeLayout` surface.

**Outside it, yes, and deliberately.** `col-start`/`row-start`, named grid areas,
`grid-auto-flow`, subgrid and per-item alignment have no prop — and no document
field either, so nothing schema-driven needs them. A consumer writing raw CSS
grid by hand is outside the document contract and is not what doc 03 §3 governs.

### Cost, reversibility, and what the owner is ratifying

- **Cost.** Two props, one literal class table (52 entries), 15 tests, one story,
  one changeset (`patch`). No new component, no new export from any barrel, no
  anatomy part, no token. `unclassified` and `maxWithoutAnatomy` unmoved.
- **Reversibility.** Full, and cheap: delete `rowSpan`, `colSpan`,
  `gridItemRowSpanMap` and `warnConflictingProps`. Nothing is published, so no
  deprecation series is owed.
- **The owner's act** is to ratify (nothing to do) or to say (a)/(b) instead,
  which is a small edit while it is unreleased and a `minor` + codemod after.

---

## 2. `D-S3O2-2` — the `utility` ownership kind (and `injection-key`)

**Recommendation: (a) — schema 1.2.0 adds both kinds — unchanged from D68. Still
NOT executed, and deliberately not executed here.**

### Re-measured at `4e4e46f`

```
node -e "const m=require('./packages/core/manifests/component-ownership.manifest.json');
const u=m.entries.filter(e=>e.kind==='unclassified');console.log(u.length, m.sourceCommit)"
→ 29  4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a
```

The composition is **unchanged since `569d887`**, which is itself the finding: two
programmes have passed and not one of the 29 has been classified.

| Group | Count | Symbols |
|---|---|---|
| Compound-context injection keys | **23** | `DZ_ACCORDION_KEY`, `DZ_AVATAR_GROUP_KEY`, `DZ_BREADCRUMB_KEY`, `DZ_BUTTON_GROUP_KEY`, `DZ_CAROUSEL_KEY`, `DZ_CHECKBOX_GROUP_KEY`, `DZ_DATA_GRID_KEY`, `DZ_DESCRIPTIONS_KEY`, `DZ_DIALOG_KEY`, `DZ_FORM_FIELD_KEY`, `DZ_LIST_KEY`, `DZ_MENU_KEY`, `DZ_RESIZABLE_KEY`, `DZ_SIDEBAR_KEY`, `DZ_SPLITTER_KEY`, `DZ_SPLIT_BUTTON_KEY`, `DZ_STEPPER_KEY`, `DZ_TABLE_KEY`, `DZ_TABS_KEY`, `DZ_THEME_KEY`, `DZ_TIMELINE_KEY`, `DZ_TOAST_KEY`, `DZ_TREE_KEY` |
| Pure runtime helpers | **6** | `cn`, `themeScript`, `getThemeScript`, `warnDeprecated`, `resetDeprecationWarnings`, `DzResolver` |

`23 + 6 = 29`. **Every one of the 29 falls into exactly one of the two kinds D68
named**, so option (a) takes the count to **0** and the ceiling with it. No
residue, no standing exception.

### What this task learned that D68 did not know

The ceiling is not merely untidy — **it changes what gets built.** This task
needed a once-per-session dev warning, and a `<script setup>` block cannot hold
module state (its whole body compiles into `setup()`), so the flag had to live in
a module. The choice presented itself immediately:

> put the helper in `utilities/` and export it → a 30th `unclassified` entry and
> a broken down-only ceiling; **or** keep it unexported and invisible to the
> manifest.

The second was taken (`packages/core/src/utilities/warnConflictingProps.ts`,
exported from no barrel — the `warnRemovedProp.ts` precedent). That is the right
answer for this helper, but notice the shape: **the ceiling is now steering helper
visibility**, and D68's own framing — *"every future pure helper faces the same
'park it in contracts or raise a down-only ceiling' choice"* — has just been
observed happening, in this task, for the second time. This is the concrete cost
of delay the D68 sheet could only predict.

### Options and costs

- **(a) schema 1.2.0 adds `utility` + `injection-key`** — classifier rules:
  `DZ_*_KEY` exported from a family → `injection-key` with `parentComponent`; a
  function or const exported from `utilities/` or `theme/` → `utility`.
  `unclassified` **29 → 0**, ceiling lowered to 0 in the same change. Touches
  `ownership-manifest.schema.json`, `ownership-manifest.ts` (contracts),
  `classify.ts` + spec, the runtime-lookup emitter (must ignore both kinds) and
  every consumer that switches on `kind` (Nuxt module registration, MCP,
  resolver). **Then regenerate in the sanctioned order** (ownership → quality →
  capability → component-meta → llms → docs-pages).
- **(b) classify only the ten value codecs as `contract`** — solves 0 of Core's
  29 (the codecs live in `@dzup-ui/contracts`, not in this count) and puts runtime
  functions in the types-only package. Rejected then, rejected now.
- **(c) leave it** — the 29 stay, the ceiling stays down-only, and the steering
  effect above recurs at every new helper.

**Recommendation: (a).** **Not executed here** for the reason D68 gave: a schema
minor with a total re-classification and four consumers is a tooling packet, and
folding it into a component-API task would put a manifest migration behind a
`DzGrid` changeset. **It is small, fully specified, and ready to run as its own
task** — it is the cheapest remaining `unclassified` movement in the programme.

---

## 3. `D-S3O2-3` — the `time` format profile

**Recommendation: (a) — the codec owns the zone. Unchanged from D69, and
re-verified true at `4e4e46f`. No Core change.**

### Re-verified

`DzTimePicker` still models a local wall-clock string:

```
grep -n "defineModel" packages/core/src/components/forms/DzTimePicker.vue
→ defineModel<string>({ default: '' })     # 'HH:mm' / 'HH:mm:ss'
```

That is RFC 3339 **`partial-time`**. JSON Schema `format: time` is **`full-time`**
= `partial-time` + a UTC offset. The two are not the same value, and the control
emits the first.

### Why (a) is still right

A control cannot invent an offset it was never given, and a time with no date
cannot resolve DST — so the only party with enough information is the renderer
that knows the document's zone. Three consequences, stated plainly so nobody
re-derives them:

1. **Core is correct as it stands.** A wall-clock time control is a legitimate,
   complete control; it simply does not implement `format: time`.
2. **The gap is a mapping, and mappings are codecs.** A `dz.time` codec maps
   `HH:mm[:ss]` ↔ `HH:mm:ss±hh:mm` using a zone the fragment or the provider
   declares.
3. **A document that genuinely wants wall-clock time should say so** with a named
   custom format (e.g. `x-dz-partial-time`) rather than `time`, because a strict
   `time` validator will reject an offset-less value and should.

### Options

- **(a) codec owns the zone** — no Core change. Cost: one follow-up in the tier
  that owns the renderer (a `dz.time` codec, and refusing `format: time` without a
  declared zone). Recorded here as a **finding**, per
  README §5 `<repository_boundary>` — not pushed into another programme's ledger.
- **(b) `timeZone?: string` on `DzTimePicker`, emitting `full-time` when given** —
  additive and available at any time, but the control then formats instants,
  duplicates the codec, and owes DST answers for a value with no date. Available
  later if a **non-renderer** consumer needs it; nothing asks today.
- **(c) leave C1.5 as "somebody has to own this"** — the state this decision
  exists to end.

**Recommendation: (a).** The owner's act is ratification; there is nothing to
build in this repository. Reversibility is total, because nothing changed.

---

## 4. `D-S3O2-4` — `DzMention`'s resolver: deprecate or keep? (D71(b))

**Recommendation: keep, un-deprecated, and revisit at the 1.0 API freeze.**

### The seam question is closed

README §1 records the `DzMention` seam as *"unresolved"*. At `4e4e46f` it is
resolved and its disposition is recorded, not blank:

- `DzMention.vue` imports `useAsyncOptions` (line 39) and renders `DzOptionsState`
  (line 840). Both host-driven (`optionsState` + `@load-options`) and
  resolver-driven (`DzMentionOptionResolver`) mentions run through the one seam,
  the resolver executed against the seam's `AbortSignal` (`runResolver`, line 302)
  — which replaced its private `resolveToken` fence and, unlike it, has an error
  path. That is D71 option (a), executed.
- `docs/program-2026-08/form-controls-readiness-matrix.md:116` gives `DzMention` a
  verdict in **all nine** clause cells, C9 = `✅ pass`, and
  `validate:form-readiness` exits **0**.

So clause 4 of the `<done_check>` was already satisfied, and **nothing about
`DzMention` needed building.** Building a mention control "on a whim" was
explicitly out of scope and there was nothing to build.

### What remains

`DzMentionTrigger.options` still accepts `DzMentionOption[] | DzMentionOptionResolver`.
D71(b) asks whether to mark the resolver `@deprecated` in favour of
`@load-options`.

- **Keep, un-deprecated (recommended).** The resolver is the *convenient* API for
  a single-trigger mention in an application that has no form renderer, and it now
  runs on the same fence as the seam, so it is no longer a second, weaker
  implementation — it is a thin adapter over the same one. Nothing is duplicated
  and nothing is unfenced.
- **Deprecate.** `VERSIONING.md` §4 makes this a full `0.x` minor series: a typed
  annotation, a runtime dev warning, first-deprecated / earliest-removal metadata,
  a codemod per deprecation, and a rollback path — **and that machinery is itself
  unbuilt** (it is TASK-S2-O2). Deprecating before the machinery exists would
  create the sixteenth-plus annotation without the record the machinery keeps.
- **Remove.** Breaking (`minor`) and forbidden by the additive scope of both this
  task and R3-O3.

**Recommendation: keep.** The cost of delay is close to zero — one extra accepted
prop shape on one control — and the natural moment is the 1.0 API freeze, when the
deprecation machinery exists and a whole-surface pass is being made anyway. **The
owner's act is to note it, not to decide it now.**

---

## 5. `D-S3O2-5` — **NEW, found by this task**: `data-options-state` publishes the raw state, not the row

**Recommendation: (a) — publish the row, in a task of its own. Recorded, not
fixed here.**

### What was found

The async-options row is a published styling surface: `data-part="options-state"`
is declared in **nine** anatomy files (`DzSelect`, `DzCombobox`, `DzListbox`,
`DzMultiSelect`, `DzCascader`, `DzTreeSelect`, `DzTransfer`, `DzMention`,
`DzPersonaSelector`) and carries `data-options-state` beside it. Writing the
runnable six-state spec exposed that the attribute and the rendered content
disagree in **two of the five states**:

| host says | `useAsyncOptions().row` renders | `data-options-state` publishes |
|---|---|---|
| `loading` | loading row | `loading` ✓ |
| `error` | error row | `error` ✓ |
| `empty` | empty row | `empty` ✓ |
| **`ready` + nothing to show** | **empty** row, "No options found" | **`ready`** ✗ |
| **`idle` + nothing to show** | **loading** row, "Loading options" | **`idle`** ✗ |

The cause is one line: `DzOptionsState` is handed `useAsyncOptions().state` (the
raw state) while the decision to render at all comes from `.row` (the inferred
one). Both `ready`-with-nothing and `idle`-with-nothing are *deliberate*
inferences the composable documents — and the attribute does not carry them.

**Why it matters, concretely.** A consumer styling
`[data-options-state="empty"]` gets nothing in exactly the case the seam exists to
infer — and `ready`-with-an-empty-collection is the path a **cascading** form
takes most often, because a host that clears its dependent collection without also
resetting the state is the ordinary sloppy host. The same consumer styling
`[data-options-state="loading"]` misses the first paint of every driven control,
which is `idle`.

Measured at `4e4e46f` by
`packages/core/src/components/forms/DzSelect.asyncStates.spec.ts` (three tests,
all three instances pinned as they behave, each naming this finding).

### Options

- **(a) pass `row` instead of `state`** to `DzOptionsState` — one line in the
  composable's consumers, or better, publish both: keep `data-options-state` as
  the host's state and add the row as `data-state` (which ADR-19 already names as
  the state channel and which this row does not currently emit at all). Covers all
  seven controls at once because they share the row.
- **(b) leave it and document the inference** in the styling contract, so a
  consumer knows to write `[data-options-state="ready"]:empty-ish` — i.e. to
  re-derive the inference the library already made.
- **(c) leave it undocumented** — the state this finding ends.

**Recommendation: (a).** The attribute exists so a consumer can style what is on
screen, and today it describes something else. **Not done here** for two reasons
that both point the same way: changing a published `data-*` value on seven
controls is **not an additive change** (this task's `<additive>` requirement), and
`<stories_not_behaviour>` says a story that needs new behaviour is a **finding** to
file, not a seam to extend. The three tests pin the current behaviour, so whichever
way the owner decides, the change is visible in a diff.

**Cost of delay: low but compounding** — every consumer that writes a selector
against this attribute writes it against the wrong value, and every such selector
is a migration when (a) lands.
