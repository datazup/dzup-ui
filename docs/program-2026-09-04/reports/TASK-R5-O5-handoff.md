# TASK-R5-O5 — Docs-page contract completion: keyboard tables, parts/states/tokens, provider hooks

- **Ran:** 2026-09-04 → 2026-09-15 window, `main` @ **`99b963a`**, which did not
  move. Every number is bound to that commit plus the dirty tree (523 paths at
  start).
- **Authority used:** file edits only. No commit, push, publish, CI dispatch,
  deployment or baseline replacement. `ui/dzup-ui-pro` untouched.

## 0. `<done_check>` result — and a false pass in the check itself

| Check | Result |
|---|---|
| `grep -c "not yet derived" apps/docs/components/*.md` → 0 | **PASSED — falsely.** `grep` is case-sensitive and the rendered string is `**Not yet derived.**`. Case-insensitively the count is **144/144**. Recorded as **F-1**. |
| section headings each ≥ 140 | **FAILED.** Intent 0 · Variants 0 · Parts 0 · Provider 1 · Locale 0 · SSR 0 · States 0. (`## Keyboard` matched 144 only as a substring of `### Keyboard interaction`.) |
| `ls packages/core/src/components/**/*.keyboard.ts` ≥ keyboard-bearing components | **FAILED.** 0 files. |
| `yarn validate:docs-pages` exit 0 with a check per section | **PARTIAL.** Exit 0, but its source has no per-section check. |

Premise verified against the tree, per the program's lesson 3: the task's stated
gap is real. The task ran in full.

## 1. Implemented files + API effect

### 1.1 The keyboard contract — the one new artifact

Built as a **field on the declaration that already exists**, not as a second
file type. The `<done_check>` offered `Dz{Name}.keyboard.ts` "or the chosen
declaration file"; a second per-component declaration beside
`Dz{Name}.anatomy.ts` would have been the second mechanism this task file's
governing rule forbids, and the anatomy is already the Contract Spec v1
styling-and-semantics declaration that the ownership generator reads, the
capability matrix joins and `expectAnatomy` asserts.

| File | Change |
|---|---|
| `packages/contracts/src/anatomy.types.ts` | **New** `ComponentKeyboard`, `KeyboardBinding`, `KeyboardModifier`; `ComponentAnatomy.keyboard?: ComponentKeyboard`. A binding is `key · modifiers · when · action · wcag · apg · rtl`. `'none'` is an explicit claim and is a different fact from the field being absent. |
| `packages/contracts/src/index.ts` | Exports the three new types. |
| `packages/tooling/src/ownership/anatomy-source.ts` | `readKeyboard()`, `ManifestKeyboardBinding`, escape-aware `scanString`/`splitElements`/`objectString`, and the in-file contradiction check (a `rtl: 'mirrored'` row under `rtl.keyboard: 'none'` is refused). |
| `packages/tooling/src/ownership/anatomy-source.spec.ts` | **+14 specs** for the keyboard contract, every one of them a shape that must be read or must be refused. |
| `packages/tooling/src/meta/component-meta.ts` | `AnatomyJoin` widened from `{state, parts, source}` to carry `optionalParts · states · componentTokens · recipes · globalDefaults · riskTier · rtl · keyboard`; new `KeyboardBindingJoin`. |
| `packages/tooling/src/meta/generate-component-meta.ts` | `anatomyJoin()` populates them. Sorted where order is meaningless, **source order preserved for `keyboard`** — a keyboard table is not alphabetical. |
| 104 × `Dz*.anatomy.ts` — 102 under `packages/core/src/components/**`, 2 under `packages/core/src/providers/` | The declarations: **393 bindings over 85 components + 19 explicit `keyboard: 'none'`**. Over the 144 PUBLIC components that is 84 rendered tables + 19 explicit `'none'` + 41 "not declared". |

### 1.2 Two defects the work found

**F-2 — a latent parser collision that would have published a wrong table on
every page.** `fieldValue()` looked its key up with `(?:^|,)\s*key\s*:` against
the whole object body, which cannot tell a top-level field from a nested one.
`rtl: { mirrors: 'layout', keyboard: 'none' }` contains the literal
`, keyboard: 'none'`, so **every component that declares `rtl` before its
keyboard contract would have had its table read as the explicit claim
`'none'`** — 60+ components silently publishing "no keyboard behaviour".
`fieldValue` is now a depth-0 scan that also skips string contents, which
removes the class rather than the instance. Pinned by the spec
*"does NOT mistake rtl.keyboard for the top-level keyboard contract"*.

**F-3 — two components were about to be published with a keyboard table they do
not implement.** The new in-file contradiction check fired on 7 components. Two
of them, `DzMenu` and `DzSidebar`, are assigned APG `menu` and `treeview` by the
quality matrix, but **their own anatomy records that the items are links and
buttons in document order with no roving index** — there is no arrow navigation
to publish. Seeding the APG table from the pattern name would have put a table
on those two pages that a keyboard user could disprove in one press. Both now
declare what is there, and say in the declaration that closing the gap to the
pattern is component work.

### 1.3 The seven missing page sections

`packages/tooling/src/docs/contract-sections.ts` — **new**, 6 renderers, and one
in `evidence.ts`. Every renderer names its source artifact in a doc comment, and
**where the artifact says nothing the section renders an honest "not declared"
cell that a ratchet counts.** Silent omission is the failure mode that let 144
pages ship without a keyboard table; an ugly visible cell cannot hide.

| # | Section | Rendered from |
|---|---|---|
| 1 | **Intent and selection guidance** | `record.intent` — a new `@intent` block in the SFC header, extracted by `componentIntent()` in `extract-component-meta.ts`. Never authored in `apps/docs`. |
| 4 | **Variants and controlled state** | `anatomy.recipes` (with the `data-{axis}` selector each mirrors onto the root), the `prop`/`update:prop` pair for the `v-model` surface, and the component's story ids |
| 5 | **Parts, states and tokens** | `anatomy.parts` · `optionalParts` · `states` · `componentTokens`, with the `[data-part=…]` selector and a `ui` example per component |
| 6 | **Provider defaults and context** | `record.providerHooks` (TASK-R5-O3) joined to a reader → context map, plus `anatomy.globalDefaults` |
| 7 | **Keyboard** | `anatomy.keyboard` — `renderKeyboardSection` in `evidence.ts`, rewritten |
| 8 | **Locale, direction and formats** | `anatomy.rtl`'s three axes, the locale-ish provider readers, and the capability `rtl-contract` cell |
| 9 | **Server rendering, portals, performance and security** | capability cells `ssr-sample`, `portal-hydration`, `perf-baseline`, `threat-model`, `malicious-corpus`, `csp-fixture`, `url-policy` + `traits` + `securityBoundary` |
| 10 | **States and migration** | `anatomy.states`, the `state-stories` cell, and `componentCommit`; migration is deferred to the changesets by name rather than restated |

Wired into `renderComponentPage` at two points — section 1 **above** the API
tables (a reader wants "what is this for" before a prop table) and 4–10 after
the compound parts, before the fidelity block.

### 1.4 The gate: one check and one ratchet per section

| File | Change |
|---|---|
| `packages/tooling/src/docs/page-contract.ts` | **New.** `SECTION_CHECKS` (all ten, each with its heading and a `missing` predicate), `measureSections`, `checkPageContract`. |
| `packages/tooling/src/docs/page-contract-ceilings.json` | **New.** One ratchet per section, at today's measured values, each with a `//` explaining what a reader loses while the artifact is absent. |
| `packages/tooling/src/docs/page-contract.spec.ts` | **New. 19 specs**, ten of which are the per-section seeded failures the task asked for — kept rather than removed, because a seeded failure that is deleted proves the check worked *once*. |
| `packages/tooling/src/docs/generate-docs-pages.ts` | `--check` runs the contract; the success line now prints the per-section debt. |

`validate:docs-pages` fails when a section is missing from any page, when a
ratchet rises, **and when one falls without the ceiling being lowered** — a
ceiling nobody lowers stops meaning anything.

### 1.5 `keyboard-spec` no longer measures "some key"

`generate-capability-matrix.ts` — the `keyboard-spec` cell used to resolve a
regex over the unit spec and report `present` on a single hit. It now measures
the spec against **the keys the component promises**, names the ones it does not
assert, and records `excepted` with the reason for a component that declares
`keyboard: 'none'`. Where no contract is declared the old presence test still
applies and the note says it is presence only.

### 1.6 The AT scaffolds cite the contract

`generate-at-matrix.ts` gains `renderKeyboardCitation`: every
`e2e/at-matrix/<Component>.md` header now carries a **Declared keyboard
contract** section with the component's own rows, above the pairs table.
The `navigate` task used to say *"with the pattern's own keys"*, which asks a
tester to know APG from memory and to guess where the component departs from it
— and it departs often. All 91 scaffolds regenerated; **every append-only result
row was preserved** (the generator owns only the text above the marker).

### 1.7 API effect — additive only

- `ComponentAnatomy.keyboard` is **optional**. Every existing declaration still
  satisfies the interface.
- `AnatomyJoin` gains eight optional fields; `component-meta.json`'s schema stays
  `1.2.0` because nothing existing changed shape. A 1.2.0 reader keeps working.
- `ComponentMetaRecord.intent` is optional and absent on all 208 records today.
- `@dzup-ui/testing` gains two exports; nothing is renamed or removed.
- No component's rendered DOM changed. No prop, event, slot or `data-part` moved.
- One changeset added: `.changeset/every-component-says-what-its-keys-do.md`
  (`contracts`, `testing`, `core` — minor, which is breaking under the 0.x policy
  only in the sense `packages/contracts/VERSIONING.md` already defines).

---

## 2. Focused validation

Every exit code read **directly** (`cmd; echo "exit $?"`), never through a pipe.

| Command | Exit | Note |
|---|---|---|
| `yarn typecheck` | **0** | |
| `yarn lint` | **0** | |
| `npx vitest run packages/tooling/src/ownership/anatomy-source.spec.ts` | **0** | 42 tests (14 new) |
| `npx vitest run packages/tooling/src/docs/page-contract.spec.ts` | **0** | 19 tests, 10 seeded per-section failures |
| `npx vitest run packages/tooling/src/quality/keyboard-contract.spec.ts` | **0** | 9 tests over all 104 declarations |
| `npx vitest run packages/tooling/src/{docs,ownership,quality,meta} packages/testing/src` | **0** | 313 tests |
| `yarn generate:{ownership,quality-matrix,at-matrix,capability-matrix,component-meta,llms,docs-pages}` | **0** ×7 | in `<repo_conventions>` order |
| `yarn generate:rtl-matrix` | **0** | see F-4 |
| `yarn validate:docs-pages` | **0** | 10 sections on all 144 pages |
| `yarn validate:llms` | **0** | |
| `yarn validate:component-meta` | **0** | |
| `yarn validate:ownership` | **0** | |
| `yarn validate:anatomy-parts` | **0** | |
| `yarn validate:rtl` | **0** | |
| `yarn validate:at-matrix` · `yarn validate:at-scripts` | **0** | |
| `yarn validate:playground-parity` | **0** | |
| `yarn validate:changelog` · `yarn validate:doc-snippets` | **0** | |
| `yarn docs:build` | **0** | 35.67 s, 508 files, **32.7 MB** (measured for TASK-R1-O5) |

### 2.1 Determinism, proven by hash

The regeneration order was run **twice** and 275 generated artifacts
(`packages/core/docs`, `apps/docs/components`, `apps/docs/evidence`,
`e2e/at-matrix`, `packages/core/manifests`) hashed after each:

```
diff hash1.txt hash2.txt   →  IDENTICAL across two runs
```

A third pass after `eslint --fix` touched seven source files produced
byte-identical artifacts again.

### 2.2 The seeded failures, proven red

Per the programme's standing lesson, nothing here is believed green until it has
been shown red.

| Seed | Result |
|---|---|
| `keyboard` ceiling 43 → 42 in the ceilings file | `✗ [ratchet-keyboard] Section 7 (keyboard) debt ROSE 42 → 43 …` — **exit 1** |
| *(unseeded, real)* two provider declarations added late | `✗ [ratchet-keyboard] … debt FELL 43 → 41. Lower the ceiling …` — **exit 1**; see F-8 |
| `## Provider defaults and context` heading renamed in the renderer, pages regenerated so freshness passes first | `✗ [section-provider] Section 6 … is missing from 144 page(s) …` — **exit 1** |
| `DzButton` binding rewritten to `{ key: 'Spacebar', action: 'activate' }` | catalogue spec **exit 1** |
| Ten per-section omissions, one ratchet rise, one ratchet fall, one absent ceiling | all red in `page-contract.spec.ts`, kept permanently |

Both live seeds were restored and the artifacts regenerated; `grep -c
CONTEXT-TYPO` → 0, `grep -c Spacebar` → 0, ceilings file restored byte-for-byte.

**The `Spacebar` seed found a real weakness in my own check** and was not simply
reverted: the key-shape pattern accepted `Spacebar` because it has the shape of a
real named key. A `LEGACY_KEY_SPELLINGS` denylist now catches it and the other
DOM-Level-2 names, which matters because `DzOrderList.vue` still tests for
`'Spacebar'` beside `' '`.

---

## 3. Aggregate qualification

`yarn validate:all` — run **end to end**, exit code read directly: **exit 1**.

**The failure is pre-existing and is the documented one.** It stops at
`validate:capability-matrix` with 12 stale cells and
`✗ [tier-d] DzFileUpload is Tier D and its browser-matrix cell is unrun` —
the known-red recorded in the brief. Nothing this packet did caused it and
nothing this packet did fixed it.

Every link after it was run **individually** and is green:
`validate:visual-baselines`, `validate:tokens`, `validate:exports`,
`validate:ownership`, `validate:mcp`, `validate:component-meta`,
`validate:llms`, `validate:docs-pages`, `validate:playground-parity`,
`validate:package-names`, `validate:doc-snippets`, `validate:adr-references`,
`validate:readme-facts`, `validate:release-policy` — **exit 0** each.

`yarn test`: **exit 1**, `2 failed | 9,631 passed | 3 skipped | 1 todo (9,637)`.
The two are the inherited `landing-token-fallbacks` and
`story-dod-tiers countOpen`. **No new failure.** The suite grew by ~47 tests, all
added here.

| Class | What |
|---|---|
| Pre-existing | `validate:capability-matrix` (12 stale + DzFileUpload tier-d) · 2 suite failures · `packages/tooling` tsc 7 · `eslint e2e/` 53 |
| **New** | **none** |
| Other packets' | the 523 dirty paths at start, preserved in full |

**Maturity reached: focused-validated.** Not aggregate-qualified — the aggregate
is red on an inherited link. Not browser- or AT-qualified: `docs:build` is a
local static build and nothing here was exercised in a browser or by a screen
reader. Not packaged, not released.

---

## 4. Ratchet movements

| Ratchet | Old | New | Direction |
|---|---|---|---|
| Pages saying "Not yet derived" where the keyboard table belongs | **144 / 144** | **0 / 144** | ↓ closed |
| Pages with a rendered keyboard table | 0 | **84** | ↑ |
| Pages declaring `keyboard: 'none'` explicitly | 0 | **19** | ↑ |
| Pages saying keyboard "not declared" | 144 | **41** | ↓ |
| Generated page sections of the ten-section contract | **3** | **10** | ↑ complete |
| `page-contract` `intent` | — (no ratchet existed) | **144** | new, set at measurement |
| `page-contract` `variants` | — | **49** | new |
| `page-contract` `parts` | — | **41** | new |
| `page-contract` `provider` | — | **39** | new |
| `page-contract` `keyboard` | — | **41** | new (read 43 for one run — see F-8) |
| `page-contract` `locale` | — | **41** | new |
| `page-contract` `states` | — | **41** | new |
| `page-contract` `api` / `usage` / `operational` | — | **0** each | new, held at zero |
| `rtl-matrix.md` rows behind the declarations | **72** | **0** | ↓ (F-4) |
| Generated component markdown | 1.80 MB | 2.53 MB | ↑ (+40 %, the seven sections) |

**No ceiling was raised.** Every `page-contract` ceiling is set to the value
measured at `99b963a` + the dirty tree, and the gate refuses a rise.

### 4.1 A number that got worse on purpose

| `keyboard-spec` cell | At `99b963a` | Now |
|---|---|---|
| `present` | **29** | **5** |
| `unrun` | 58 | 78 |
| `excepted` | 2 | 6 |

This is the regex replacement working. Twenty-four components scored `present`
for asserting **one** key out of the nine they now declare. The evidence did not
get worse; the measurement got honest, and honest is the direction this
programme's ratchets move. The 6 `excepted` are the components that declare
`keyboard: 'none'` and therefore have no key sequence for a spec to assert.

---

## 5. Findings

**F-1 — the `<done_check>`'s first check gives a false pass.** `grep -c "not yet
derived"` is case-sensitive and the rendered string is `**Not yet derived.**`.
A fresh agent running the check as written would have recorded this task
`found-done` over 144 pages that still said it. Measured before trusting, per
the programme's lesson 3.

**F-2 — a latent parser collision that would have published a wrong table on
every page.** See §1.2. Caught by a spec written before the declarations landed.

**F-3 — `DzMenu` and `DzSidebar` do not implement the pattern they are assigned.**
See §1.2. The quality matrix says `menu` and `treeview`; the components' own
anatomies say the items are links and buttons in document order with no roving
index. The contract now states what is there.

**F-4 — `rtl-matrix.md` was 72 rows behind its declarations.** Another instance
of the S1-F10 stale-artifact mode: `validate:rtl` checks physical utilities and
**does not check the generated matrix against the declarations**, so it reported
green over a file missing 72 of 102 components. Regenerated here (purely
additive: 72 rows added, 0 changed, 0 removed). The gap in `validate:rtl` is
**not** closed and is ranked in §8.

**F-5 — `DzInfiniteScroll` implements none of the APG `feed` keyboard.** Its
declaration says so rather than publishing PageUp/PageDown/Control+Home.

**F-6 — `DzThemeProvider` rendered a page with no Usage section at all.** Found
by the new per-section check on its first run: the two absence branches of
`renderComponentSection` pushed a note with no heading. Both now carry the
heading, which also improves `llms-full.txt`.

**F-8 — the downward ratchet arm caught a real omission, unseeded.** `DzProvider`
and `DzThemeProvider` live in `packages/core/src/providers/`, outside
`components/{family}/`, and the first authoring walk scanned only the latter —
so two public components reached the ratchet as "no keyboard contract" while
their anatomy files sat one directory away. Declaring them made the debt **fall**
43 → 41, and `validate:docs-pages` **failed on the fall** until the ceiling was
lowered to record it. The catalogue spec now walks both roots.

**F-7 — `eslint --fix` silently rewrote authored prose again.**
`jsdoc/no-multi-asterisks` deleted a leading `*` inside a sentence in
`component-meta.ts`. This is the fifth recorded sighting of an autofix editing
authored text; repaired by hand.

---

## 6. Owner decisions raised

### D34 — Where the keyboard contract lives

**Taken as (b).** The `<done_check>` suggested `Dz{Name}.keyboard.ts` "or the
chosen declaration file".

- (a) A new `Dz{Name}.keyboard.ts` per component — a second per-component
  declaration file, a second reader, a second freshness gate. This task file's
  governing rule forbids exactly that.
- **(b) A `keyboard` field on `ComponentAnatomy`** — the Contract Spec v1
  declaration that already exists, is already read by the ownership generator,
  already joined into `component-meta.json`, and already asserted by
  `expectAnatomy`. **Chosen.**
- (c) A central catalogue keyed by component — the hand-kept list that every
  generated artifact in this repository exists to replace.

**Consequence the owner should see:** the 41 public components with **no anatomy
file at all** — all 41 Tier A, per D25 — cannot declare a keyboard contract either, so their pages say "not
declared" and the `keyboard` ratchet sits at 41. It is now pinned to the `parts`
ratchet and falls only with it. Per **D25**, TASK-R5-O2 finished every Tier B, C
and D component (89/89) and its scope boundary **excludes Tier A**, so these 41
need a Tier A anatomy packet that does not yet exist. **The success criterion
"144/144 derived" is therefore not reachable inside this task**, and reaching it
by any other route would mean a second declaration mechanism.

### D35 — Flat per-component tables, not a shared APG dictionary

**Taken as (a).**

- **(a) Each component declares its full table; each row names the APG pattern
  it comes from in `apg`.** Chosen. Provenance survives without inheritance, and
  where the component departs from the pattern the departure is visible — which
  is the whole value, as F-3 demonstrates.
- (b) A pattern → keyboard dictionary in `@dzup-ui/contracts`, expanded per
  component. Rejected: it publishes the APG's table rather than the component's,
  and `DzMenu` would have shipped a nine-row menu table it does not implement.

**Cost:** ~393 authored rows, some repeated across components in a family.

### D36 — Five components whose `rtl.keyboard` disagrees with their keys

**Prepared, not resolved — the owner decides.** The new in-file contradiction
check fired on 7 components. Two were my authoring error (F-3, fixed).
The other five — **`DzTreeSelect`, `DzOtpInput`, `DzContextMenu`,
`DzDropdownMenu`, `DzTour`** — declare `rtl.keyboard: 'none'` while their
ArrowLeft/ArrowRight rows genuinely follow the reading direction. Their recorded
reasons say the underlying primitive "already flips it for RTL", i.e. the two
fields are using different definitions of the same word.

- **(a) Drop the `rtl` marker from those rows. Taken, provisionally.** No
  published row contradicts a shipped declaration, and no other packet's
  ratcheted field is touched. The cost: five components' horizontal keys publish
  no RTL answer at all.
- (b) Change `rtl.keyboard` to `swap-horizontal` on those five. More accurate to
  what a user experiences, but it rewrites `rtl-matrix.md` and belongs to the
  RTL packet, not to a docs task.
- (c) Sharpen `ComponentRtl.keyboard`'s definition to distinguish "the meaning
  swaps" from "we implement the swap ourselves". Cleanest, and breaking.

**Recommendation: (b), owned by whoever next holds the RTL packet.**

### D37 — `@intent` is 144/144 undeclared and needs a person

The intent ratchet is at its maximum because the field did not exist until now
and no extractor can derive the sentence. It is the largest single documentation
debt the contract exposes.

- (a) Leave it at 144 and let it fall as components are touched. **Taken**, as
  the only option available to an agent.
- (b) Commission a pass over the 144 headers — roughly a day of authoring, and
  the one section of the ten a machine genuinely cannot produce.
- (c) Drop section 1 from the contract. Not recommended: "which of these four
  selects do I want" is the question a component catalogue most often fails to
  answer.

**Recommendation: (b), sequenced after TASK-R5-O2 completes, so a component's
intent and its anatomy are written in one visit.**

---

## 7. Scope boundaries honoured

- No commit, push, publish, CI dispatch, deployment or baseline replacement.
- `ui/dzup-ui-pro` untouched; no Pro data rendered (Pro pages are Pro TASK-R5-P4).
- No site deployment and no size gate — that is TASK-R1-O5; the measured size is
  handed to it in §2.
- No new Storybook story written. The variants section names the stories that
  exist and records the absence where none does, for `validate:story-dod`.
- Not mine, not touched: `packages/core/src/security/`, `useDzSanitizer.ts`,
  `packages/nuxt/src/module*.ts`, `CLAUDE.md`,
  `apps/landing/vite/serve-storybook.ts`,
  `packages/tooling/{README.md,scripts/adr-registry.json}`, ADR-19/ADR-20,
  `docs/program-2026-09/**`.
- No ceiling raised anywhere.

---

## 8. Ranked next packet

1. **Open the Tier A anatomy packet D25 asks for** — the 41 public components
   with no anatomy file, **every one of them Tier A**, which TASK-R5-O2's scope
   boundary deliberately excluded after it finished all 89 Tier B+ components.
   It is the single unblock for **four** of this packet's ratchets at once:
   `parts`, `locale`, `states` and `keyboard` all read **41** and fall together,
   and only then is "144/144 keyboard tables" reachable. This is now the largest
   lever on the documentation contract.
2. **Close the `validate:rtl` gap in F-4.** The validator does not compare
   `rtl-matrix.md` against the declarations it is generated from, so it reported
   green over a file missing 72 components. One freshness clause, the same shape
   `validate:docs-pages` already uses.
3. **Bring the 24 components in §4.1 up to their own contract.** Their specs
   assert one key of the nine they declare. The cell now names exactly which keys
   are unasserted, so the work is enumerable rather than open-ended.
4. **Give `DzMenu` and `DzSidebar` the patterns they are assigned** (F-3), or
   change the assignment in `quality-matrix.json`. Today the matrix claims
   `menu` / `treeview` and the components implement neither.
5. **`@intent` authoring pass** (D37), sequenced after item 1.
6. **`DzInfiniteScroll` and the APG `feed` keys** (F-5) — smallest of the six.

---

## 9. Start and end `git status --short` (owner decision D5's mitigation)

| | Paths |
|---|---|
| **Start** | **523** |
| **End** | **662** |
| Added by this packet | **139** |
| Present at start and **gone** at end | **0** — verified by set difference |

Of the 139: 104 `*.anatomy.ts` (102 under `components/**` + 2 under `providers/`;
31 were previously tracked-and-clean, 73 already untracked from TASK-R5-O2), plus regenerated `apps/docs/components/*.md` and
`e2e/at-matrix/*.md`, 12 edited tooling/testing/contracts sources, 4 new tooling
files, 1 ceilings file, 1 changeset, and this handoff.

`apps/docs/.vitepress/dist` is git-ignored and did not enter the tree.
