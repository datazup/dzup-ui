# TASK-N1-O4 — Execute manual AT-matrix cells for Tier C/D `[!owner]`

> Handoff for [`evidence-execution-tasks.md` → TASK-N1-O4](../evidence-execution-tasks.md).
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-08-31 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD (binding for every number below):** `51dec93c73214af2d1e424e3454a7122691fea48`
> **Worktree:** **dirty** — ~100 files from N0-05, N1-O1, N1-O2, N1-O3, N1-O5, N1-O6.
> Every number here is **locally qualified, worktree-dirty**. Not CI, not release, not
> production evidence.
> **Toolchain:** Node `v24.14.1`, Yarn `4.16.0`.
>
> **Nothing is committed, pushed, dispatched to CI, or published.**
>
> ## Headline
>
> **22/22 Tier C/D components have executable AT scripts. `0` cells were executed,
> and `0` is the honest number.** No screen reader exists on this host, no human
> tester is assigned, and no cadence exists. The `<owner_gate>` fires and the task
> is **`[!]`**.
>
> **AT cells executed: 0/534 → 0/534.** The one ratchet this program could not move
> is still at its starting value, and this handoff does not pretend otherwise.
>
> Two findings that outrank the scripts:
>
> 1. **The capability matrix reads `pass` for a component whose every AT pair
>    FAILED.** Proven in memory, without writing a fabricated record (§6.2). Wiring
>    real results in today would publish a lie. This is a **blocker on the first
>    wave**, not a nice-to-have.
> 2. **9 of the 22 components have uncommitted source edits right now.** A run today
>    would stamp `sourceCommit 51dec93` against behaviour that is not at `51dec93`.
>    That is a false record, which the task forbids more strongly than an empty cell
>    (§5.1).

---

## 1. Discovery

### 1a. The cell schema — and what a "cell" actually is

Read at HEAD: `packages/tooling/src/quality/at-matrix.ts` (the format),
`generate-at-matrix.ts` (the writer), `validators/at-matrix.ts` (the five gates),
`e2e/at-matrix/index.json` and four scaffold files.

The task brief describes the cell as `component × AT × browser × scenario`. The
scaffold does **not** implement that shape. Measured:

| Dimension | What the scaffold actually does |
|---|---|
| component | 89 rows — every Tier B–D component. Tier A is excluded by `buildAtIndex`'s `row.tier !== 'A'` filter. |
| AT × browser | **Collapsed into one dimension: the `pair`.** Six fixed `AT_PAIRS`, each a `{at, browser, platform}` triple with an id. There is no independent AT axis and no independent browser axis. |
| scenario | **Not a cell dimension at all.** Scenarios exist as `tasks` — derived from the APG pattern by `tasksFor()` — but they are a property of the *entry*, not of the row. |

So the real schema is **component × pair**, and the arithmetic is
**89 components × 6 pairs = 534 cells**, which is the number the ledger quotes.
The 22 Tier C/D components are **132 of those 534 cells (24.7 %)**; Tier B holds
the other 402.

`npx tsx packages/tooling/src/validators/at-matrix.ts` at task end:

```text
  components (Tier B–D)  89
  cells                  534
  executed               0
  unrun                  534  (reported)
  stale                  0  (reported)
```

**Finding A1 — the scaffold's own instructions contradict its row schema.**
The generated header in every file says:

> Append one row per `{task, pair}` you actually drove.

The row has seven columns — `pair | result | versions | tester | date | sourceCommit | notes` —
and **none of them is a task**. A per-`{task, pair}` row is unrepresentable: two
rows for the same pair would parse as two runs of the whole component, and
`index.json` would count them as two executed cells. The scripts therefore
resolve it explicitly (`e2e/at-matrix/scripts/README.md`): **one row per
`{component, pair}`; `pass` only if every step passed; a single failed step makes
the row `partial` or `fail`, and the notes name the step.** That is the only
reading the parser supports. It is an owner decision whether the header text
should change or the schema should grow a task column (§8).

### 1b. The append-only record format

`RESULTS_MARKER` — `<!-- results: append-only. The generator never rewrites below here. -->` —
splits every file. `renderFile()` regenerates everything above it from the quality
matrix and keeps everything below it byte-for-byte. A regeneration therefore
cannot destroy a recorded run, which is the failure mode that turns an evidence
file into a file nobody trusts.

```text
| pair | result | versions | tester | date | sourceCommit | notes |
```

- `result ∈ {unrun, pass, fail, partial, blocked}`. `unrun` is a **first-class
  outcome**, not a placeholder: it means the AT or the device was not available,
  which is a different fact from `fail`.
- The validator's **substance** gate rejects any non-`unrun` row whose
  `versions`/`tester`/`date`/`sourceCommit` is blank, `-`, `n/a` or `tbd` — *"a
  result with nothing behind it is worse than `unrun`, because `unrun` is true."*
- The **freshness** gate marks a row stale when its `sourceCommit` predates the
  component's last change (`evidenceIsCurrent`). Stale and unrun are **reported,
  never failed** — a gate that failed on a new matrix would be switched off the
  day it landed.
- The module's own docstring states the invariant this task obeys: *"Nothing in
  here can mark a row passed. The generator writes `unrun`, and the only way a row
  says anything else is a human editing it after a run."*

### 1c. Which pairings the scaffold declares required for Tier C vs Tier D

**None differ. The scaffold declares no tier-differentiated pair requirement at all.**

Grepped across `at-matrix.ts`, `generate-at-matrix.ts` and `validators/at-matrix.ts`:
every reference to `tier` is either the header string, the `tier !== 'A'` inclusion
filter, or the field copied onto the entry. `AT_PAIRS` is a flat `readonly` array
consumed unconditionally by `renderHeader()` and `buildAtIndex()`.

| Tier | Components | Pairs the scaffold requires | Cells |
|---|---|---|---|
| A | 55 | — (excluded entirely) | 0 |
| B | 67 | all six | 402 |
| **C** | **21** | **all six** | **126** |
| **D** | **1** (`DzFileUpload`) | **all six** | **6** |

The quality matrix's `evidenceOrigin` for `at-manual` reads **`"tier B"`** on every
Tier C and D row — the obligation is inherited from Tier B and is never widened.
So the honest answer to the discovery question is: **Tier D owes exactly what Tier B
owes.** The one component in the catalog whose primary job is a data boundary
carries the same AT obligation as a `DzButton`. Whether that is right is an owner
decision (§8); it is not something this task may quietly change, and it is
recorded rather than assumed.

The six pairs, and what each is uniquely able to expose:

| id | Pairing | Platform | Exposes |
|---|---|---|---|
| `nvda-firefox` | NVDA + Firefox | Windows | Browse/forms mode switching, Gecko a11y tree |
| `nvda-chrome` | NVDA + Chrome | Windows | Same AT over Blink; virtualized/composite widgets differ |
| `jaws-chrome` | JAWS + Chrome | Windows | JAWS heuristics that override author ARIA |
| `voiceover-safari` | VoiceOver + Safari | macOS | WebKit behaviour, rotor navigation |
| `voiceover-ios` | VoiceOver + Safari | iOS | Touch exploration; controls reached by gesture, not Tab |
| `talkback-android` | TalkBack + Chrome | Android | Touch exploration, gestures, drag alternatives |

### 1d. The 22 components, their patterns and their task sets

Cross-referenced from `packages/core/docs/quality-matrix.json`
(`sourceCommit 51dec93…`, tiers A 55 / B 67 / C 21 / D 1) against
`e2e/at-matrix/index.json`.

| Component | Tier | APG pattern | Traits | Scaffold tasks | Steps |
|---|---|---|---|---|---|
| `DzCalendar` | C | `grid` | — | reach, navigate, select, live | 4 |
| `DzCascader` | C | `combobox` | dataset, teleports | reach, open, navigate, typeahead, select, dismiss, error, live | 8 |
| `DzColorPicker` | C | `custom` | teleports | reach, activate | 2 |
| `DzCombobox` | C | `combobox` | dataset, teleports | reach, open, navigate, typeahead, select, dismiss, error, live | 8 |
| `DzCommandPalette` | C | `combobox` | dataset, teleports | reach, open, navigate, typeahead, select, dismiss, error, live | 8 |
| `DzDataGrid` | C | `grid` | dataset, teleports | reach, navigate, select, live | 4 |
| `DzDataView` | C | `custom` | dataset | reach, activate, live | 3 |
| `DzDatePicker` | C | `combobox` | — | reach, open, navigate, typeahead, select, dismiss, error | 7 |
| `DzDateRangePicker` | C | `combobox` | — | reach, open, navigate, typeahead, select, dismiss, error | 7 |
| **`DzFileUpload`** | **D** | `button` | **drags** | reach, activate, non-drag, error | 4 |
| `DzMegaMenu` | C | `menubar` | dataset | reach, navigate, open, activate, dismiss, live | 6 |
| `DzMention` | C | `combobox` | dataset | reach, open, navigate, typeahead, select, dismiss, error, live | 8 |
| `DzMultiSelect` | C | `combobox` | dataset, teleports | reach, open, navigate, typeahead, select, dismiss, error, live | 8 |
| `DzOrderList` | C | `listbox` | dataset, **drags** | reach, navigate, typeahead, select, non-drag, live | 6 |
| `DzPersonaSelector` | C | `listbox` | dataset, teleports | reach, navigate, typeahead, select, live | 5 |
| `DzSidebar` | C | `treeview` | dataset, teleports | reach, navigate, select, typeahead, live | 5 |
| `DzTable` | C | `table` | dataset, **drags** | reach, navigate, non-drag, live | 4 |
| `DzTimePicker` | C | `combobox` | teleports | reach, open, navigate, typeahead, select, dismiss, error | 7 |
| `DzTour` | C | `dialog` | dataset, teleports | open, reach, dismiss, live | 4 |
| `DzTransfer` | C | `listbox` | dataset | reach, navigate, typeahead, select, live | 5 |
| `DzTree` | C | `treeview` | dataset | reach, navigate, select, typeahead, live | 5 |
| `DzTreeSelect` | C | `combobox` | dataset, teleports | reach, open, navigate, typeahead, select, dismiss, error, live | 8 |

**126 tasks across 22 components.** Driven on all six pairs that is **756
step-runs**, occupying **132 of the scaffold's 534 cells**.

### 1e. AT availability in this environment — measured, not assumed

| Pair | Available here? | Evidence |
|---|---|---|
| `nvda-firefox` | **No** | No NVDA at `C:\Program Files\NVDA` or `C:\Program Files (x86)\NVDA`; no `nvda` process. |
| `nvda-chrome` | **No** | Same. |
| `jaws-chrome` | **No** | No Freedom Scientific install directory; no `jfw`/`jaws*` process. Commercial licence. |
| `voiceover-safari` | **No** | Host is Windows 11. |
| `voiceover-ios` | **No** | No iOS device. |
| `talkback-android` | **No** | No Android device. |

Windows **Narrator** *is* present (`C:\Windows\system32\Narrator.exe`). It was
**deliberately not run.** Narrator is not one of the six declared pairs, so a
Narrator session would produce evidence with no column to hold it — and this agent
has no audio path and no way to read a speech buffer, so it could not honestly
report what was announced even if a column existed. **No AT run was attempted, and
no cell was written.**

---

## 2. The 22 scripts

### 2a. Where they live

| Path | Lines | What it is |
|---|---|---|
| `e2e/at-matrix/scripts/{Component}.at-script.md` | 3 100 | 22 generated scripts, one per Tier C/D component |
| `e2e/at-matrix/scripts/README.md` | 105 | Shared preamble: AT key reference, recording rules, what to do when a step fails |
| `packages/tooling/src/quality/at-scripts.data.ts` | 1 897 | The authored source — setup, keystrokes, expectations, APG citation, known defects |
| `packages/tooling/src/quality/generate-at-scripts.ts` | 457 | The generator and its three script-QA checks |
| `package.json` | +4 | `generate:at-scripts` and `validate:at-scripts` (with their `//` doc entries) |

**23 files written, all new.** Nothing under `e2e/at-matrix/*.md` was modified —
`git status --short e2e/at-matrix/` reports only `?? e2e/at-matrix/scripts/`. The
89 scaffold files and their append-only tables are byte-identical to HEAD.

### 2b. Why a generator, and why it is not "second machinery"

`evidence-execution-tasks.md`'s standing rule is *the machinery exists — do not
build second machinery.* This generator does not measure, does not run a browser,
does not read a result and cannot write one. It exists for exactly one property:

> **The scripts cannot drift from the scaffold.** `generate:at-scripts` fails when a
> scaffold task has no step, when a step invents a task the pattern does not imply,
> when two steps claim one task, or when a step sends a tester to a story id
> Storybook does not have.

The scaffold decides *what* is owed (from the APG pattern, via `tasksFor()`); this
file only says *how*. If a component's pattern changes tomorrow and it grows a
`typeahead` obligation, the generator goes red until somebody writes the step. A
hand-written folder of 22 markdown files has no such property, and a stale AT
script is worse than none — it sends a tester to a keystroke that no longer means
anything.

`validate:at-scripts` is **deliberately NOT wired into `validate:all`.** Widening a
repo-wide gate at the end of a task mixes this task's result with the chain's, and
the ledger tracks `validate:all` at 28 links. Whether it becomes link 29 is an
owner decision (§8).

### 2c. The shape of one script

Every file is the same eight blocks:

1. **Header** — component, tier, APG pattern, source path, and the auto-generated
   warning naming `at-scripts.data.ts` as the thing to edit.
2. **Pointer to `README.md`** for the AT key reference and the recording rules.
3. **Pointer to `../{Component}.md`** — the scaffold file, named as the only place
   a result is ever written, with "append, never edit" restated.
4. **Before you start** — the fixture data the tester will meet, stated concretely.
   Not "a list of items" but *"Five rows: Draft the proposal, Review with the team,
   Incorporate feedback, Send for approval, Publish."*
5. **Pairs this component owes** — all six, with what each uniquely exposes, and
   the line that matters most: *"A pair you did not run is `unrun`, which is a
   fact; it is never `fail`."*
6. **Steps** — one per scaffold task, each carrying:
   - **Open:** a clickable `/iframe.html?id=…&viewMode=story` link (canvas only, so
     the AT reads the component and not the Storybook sidebar);
   - **Do:** a numbered keystroke list;
   - **The AT must:** a checkbox list of individually checkable expectations;
   - **Read from:** the APG section or WCAG SC the expectation is derived from.
7. **Known open defects — read this AFTER you have recorded your result.**
8. Nothing else. No result table, no place to write one.

Expectations are written as separate checkboxes on purpose: a step with four
expectations of which one fails is a `partial` with a nameable cause, not a
mystery `fail`.

### 2d. The APG pattern each step maps to

Every one of the **126 steps** carries a `Read from:` citation. Grouped:

| Scaffold task | Derived from | Example expectation |
|---|---|---|
| `reach` | Pattern's own role/name/state contract; "one tab stop" for composites (Grid, Listbox, Tree View, Menubar) | *"The grid is one tab stop: Tab reaches it once, and one more Tab leaves it entirely."* |
| `open` | Combobox — Down Arrow opens; `aria-expanded`; `aria-activedescendant` focus management | *"Focus does NOT move: the AT must not report a focus change to a tree row."* |
| `navigate` | Pattern's Keyboard Interaction table verbatim (Right/Left/Down/Up, Home/End, PageUp/PageDown, Ctrl+Home/End) + `aria-posinset`/`aria-setsize` | *"Every option is announced with its label AND its position — 'China, 1 of 2'."* |
| `typeahead` | Listbox/Tree View — *"type a character, focus moves to the next item with a name that starts with the typed character"*; or Combobox list autocomplete + live result count | *"Focus moves to 'Publish' and it is announced."* |
| `select` | `aria-selected`; Enter accepts; and for multi-select, *the popup does not close* | *"Every row announces a selected state, including the unselected ones."* |
| `dismiss` | Dialog / Combobox — Escape closes and **focus returns to the invoking control** | *"Focus on the document body is a FAIL for this step, not a pass."* |
| `error` | WCAG 3.3.1 Error Identification + `aria-invalid` / `aria-errormessage` | *"Re-focusing the control announces the error text again."* |
| `live` | ARIA live regions + `aria-busy`; announced **once**, without moving focus | *"It is announced exactly once — not once by the caption and again by the grid."* |
| `activate` | Button — **both** Enter and Space activate, exactly once | *"Both Enter and Space open the file picker, and each opens it exactly once."* |
| `non-drag` | **WCAG 2.5.7 Dragging Movements** — a keyboard path is not sufficient; the SC asks for a single-pointer, non-drag alternative | *"There is a single-pointer path that does not require a held drag."* |

**397 individually checkable expectations across the 126 steps.**

The `<scripts>` requirement — *derive expected behaviour from the contract spec +
APG pattern, NOT from what the component currently does* — is honoured literally.
Accessible names, message strings and fixture values were read from
`packages/core/src/i18n/messages.ts` and the story sources so the tester knows what
they will actually meet ("Clear selection", "Search paths", "Matching paths",
"Move to top", "Select hours", "Reorder controls"), but every *expectation* is the
APG-correct behaviour. Where a known defect makes that impossible today, the
expectation stays correct and the tester will correctly record a failure (§4).

### 2e. Determinism and the negative tests

`generate:at-scripts` run twice: **23 files, 23 MD5s, zero divergence.**
`validate:at-scripts` (`--check`) → **exit 0**.

The three checks were **proven to fire**, not asserted, by driving the pure
`checkScripts()` with mutated inputs in memory (no repo file touched):

| Probe | Result |
|---|---|
| baseline, unmodified | **0 violations** |
| drop the `DzTour` script | 1 × `coverage` — *"DzTour is Tier C or D and has no AT script."* |
| drop `DzTree`'s `typeahead` step | 1 × `task` — *"owes the scaffold task `typeahead` and the script has no step for it."* |
| invent a `DzTable` `typeahead` step | 1 × `task` — *"which its pattern does not imply. Add it to the scaffold's pattern, or drop the step — do not invent an obligation here."* |
| duplicate `DzCalendar`'s `reach` step | 1 × `task` — *"has 2 steps for task `reach`."* |
| point `DzMention` at a non-existent story | 1 × `story` — *"which the built Storybook index does not contain."* |
| remove the built Storybook index | **0 violations, and the CLI prints `story resolution UNVERIFIED`** — the check degrades loudly rather than passing silently |

That last row is the one that matters: an absent input makes the gate say so,
rather than making it green. Same lesson as N1-O2's finding E3.

---

## 3. Script QA — **this is script QA, NOT an AT run**

> **Read this heading literally.** Nothing in this section is assistive-technology
> evidence. No screen reader was started. No announcement was heard. What follows
> is a dry-run of the *instructions* — do the URLs resolve, are the keystrokes
> unambiguous, does the expected announcement follow from the contract spec and the
> APG pattern. **Zero AT cells moved and zero run records were written.** The task's
> `<steps>` asks for a dry-run "against 2 components to remove ambiguity from the
> wording"; this was run against all 22, because it is cheap and mechanical.

### 3a. Story URL resolution — 62/62

Every story id named anywhere in `at-scripts.data.ts` was resolved against the
built Storybook index (`apps/storybook/storybook-static/index.json`, **1 635
entries**):

| Check | Result |
|---|---|
| Distinct ids in the structured `story` field | **47** |
| Further ids named in prose inside a step's `Do:` list | **15** |
| **Total ids referenced** | **62** |
| Missing from the built index | **0** |
| Resolving to a `docs` page instead of a canvas story | **0** — all 62 are `type: "story"` |

The `docs`-vs-`story` check is not pedantry: `core-forms-dzcascader--docs` exists
for every component and renders an MDX page, not a driveable canvas. A tester sent
there would spend the session reading prose.

**Script-QA limitation, stated plainly:** the generator only *gates* the 47 ids in
the structured field. The 15 named in prose were verified by a separate one-off
scan and are correct today, but they are free text and will not be caught if a
story is later renamed. Promoting them to structured references is a small,
worthwhile follow-up.

### 3b. Ambiguity found and fixed — the "Default story" trap

The single highest-value finding of the dry-run. **Five of the 22 components have
no story called `Default`.** A script that said "open the Default story" — the
obvious wording — would have sent the tester to Storybook's own error page, which
renders as *"the component is broken"*:

| Component | There is no `--default`. The entry story is | |
|---|---|---|
| `DzCalendar` | `core-data-dzcalendar--month` | |
| `DzDataView` | `core-data-dzdataview--list-layout` | |
| `DzMegaMenu` | `core-navigation-dzmegamenu--horizontal` | |
| `DzTour` | `core-overlays-dztour--basic-three-step` | |
| `DzTreeSelect` | `core-forms-dztreeselect--single` | |

Fixed by never naming a story in prose: every step carries a resolved, clickable
`/iframe.html?id=…` link, and the id is gated. This is the same class as the trap
`e2e/matrix/fixtures.ts` already documents in `openTarget()` — *"it is almost
always a story id that does not exist, and saying so is the difference between a
five-minute fix and an afternoon."*

### 3c. Wording changed after the dry-run

| Ambiguity | What it was going to say | What it says now |
|---|---|---|
| "Activate the control" | Ambiguous across ATs — VoiceOver uses VO+Space, TalkBack a double-tap | A shared per-AT command table in `scripts/README.md`, and steps that name the actual key: *"Enter. Cancel the picker. Space. Choose the small PNG."* |
| "Announced correctly" | Unfalsifiable | Every expectation names the literal string or the literal state: *"Grabbed item at position 3 of 5"*, *"'Vue, 2 of 6'"*, *"aria-readonly on the right grids only"* |
| "Announced once" | Unanswerable from memory | `README.md` now requires the speech log to be on before the session starts (NVDA Speech Viewer, JAWS speech history, VoiceOver caption panel) |
| "Tab to the component" | Wrong instruction on the two touch pairs | Steps say Tab, and the README's command table maps it to *"swipe right until X is announced"* for `voiceover-ios` and `talkback-android` |
| `pass` on a partly-good run | Undefined | `README.md`: *"`pass` means **every** step passed. If one step failed, the row is `partial` (or `fail`), and the notes say which step."* |
| Bare version strings | `validate:at-matrix` rejects them | README warns: *"'NVDA 2026.1, Firefox 151.0', not 'NVDA, Firefox'"* |

### 3d. Steps found genuinely ambiguous — and what was done

**QA1 — `DzSidebar` declares an APG pattern it deliberately does not implement.**
The quality matrix says `pattern: "treeview"` with the justification *"A nested
navigation tree…"*. The component ships `role="navigation"` (`DzSidebar.vue:224`)
with per-item links carrying `aria-current="page"` and `tabindex="0"`
(`DzSidebarItem.vue:110-114`). There is no `role="tree"`, no `treeitem`, no
`aria-level`.

APG explicitly recommends **against** the tree/menu patterns for site navigation, so
**the component is right and the declaration is wrong.** Writing the script against
the declared pattern would have manufactured **30 guaranteed failures** (5 tasks ×
6 pairs) for a metadata defect. The script is therefore written against the
navigation-landmark contract the component actually declares, and says so in its
first setup line, in capitals, with the mismatch named as an open owner decision
so the tester does not file it again. **The `typeahead` obligation is met through
the AT's own element-navigation commands** (NVDA/JAWS `k`, VoiceOver rotor →
Links), which is the equivalent affordance a landmark of links offers.

**QA2 — `DzCommandPalette` owes an `error` task it has no surface for.**
`tasksFor()` derives `error` from the `combobox` pattern unconditionally. The
command palette has no invalid state, no error message and no required semantics —
there is nothing to drive. `tasksFor()` has no per-component opt-out, and `unrun`
would be a lie (`unrun` means *the AT was not available*, which is a different
fact). The step renders as an explicit recording instruction instead:

> Write `error task not applicable: no validation surface` in the run row `notes`.
> Do **NOT** record `fail`; a task with no surface is not a failed task.

This is the **only** not-applicable step in the 126.

**QA3 — `DzTreeSelect` has no story that reaches a validation error.** Its nearest
is `--in-form-field`, which is `required` but ships no message. The `error` step
uses it and expects the *required-then-empty* announcement, which is reachable and
APG-correct. Weaker evidence than a real invalid story; recorded rather than
papered over.

**QA4 — `DzCalendar`'s `live` task has no loading/empty/error state.** `live` comes
from the `grid` pattern, not from a `dataset` trait. Rather than declare it
inapplicable, the step drives the genuinely live thing: changing month from the
header control while focus stays outside the grid, expecting the caption change to
be announced once. That is the APG Date Picker Dialog contract and it is a real
obligation — it may well be the step that finds something.

**QA5 — `DzTable`'s `non-drag` step asks for something known to be absent.** Kept
deliberately; see §4.

### 3e. What script QA did **not** and could not check

- **Nothing was heard.** No AT was started (§1e). Whether an expectation is *met* is
  entirely unknown for all 534 cells.
- **No story was rendered.** Ids were resolved against the built index, not loaded
  in a browser. A story that throws at runtime would still pass this check.
- **The built index is from the dirty worktree** (built 2026-09-01 by N1-O6), so it
  reflects working-tree stories, not `51dec93`. Fine for id resolution; not
  evidence of anything else.

---

## 4. Anticipated failures — so a first wave is not mistaken for discovery

The `<scripts>` rule says expectations derive from the contract spec and the APG
pattern, **not** from what the component currently does. Applied honestly, that
means several steps are written to fail against known, already-registered defects.
**That is the intended outcome:** the run records a real failure, and the register
explains it.

Each script therefore ends with a **"Known open defects — read this AFTER you have
recorded your result"** section. It sits after the steps on purpose — a tester who
reads "this will fail" before driving the step is no longer measuring. **13
defect→step bindings across 11 of the 22 components.**

### 4a. The bindings

| Defect | Component(s) | Step expected to fail | What the tester will hear instead |
|---|---|---|---|
| **D7** | `DzTour` | `dismiss` | **Expected to fail on all six pairs.** `useFocusTrap.deactivate()` removes its keydown listener and nothing else — it never restores focus. Escape/Skip/Finish leave focus on `<body>`. Verified still present at working-tree state: `useFocusTrap.ts:110-116` has no counterpart to `activate()`'s `focusable[0].focus()`. The step says outright: *"Focus on the document body is a FAIL for this step, not a pass."* |
| **D4** | `DzCascader`, `DzTreeSelect` | `reach` | Nested interactive control inside a `role="combobox"` **button** — `DzCascader.vue:563` and `DzTreeSelect.vue:664` render `role="button"` spans inside the trigger opened at `:535` / `:625`. Expect the trigger to announce two controls, or the nested control to be unreachable, depending on the pair. The step's expectation is *"Exactly ONE control is announced here."* |
| **D10** | `DzTreeSelect` | `open` | Two focus mechanisms at once: the trigger advertises `aria-activedescendant` while the popover moves real DOM focus onto the tree row. The step's fourth expectation — *"Focus does NOT move… the AT must not report a focus change to a tree row"* — is expected to fail. |
| **D8** | `DzCascader`, `DzMention`, `DzTreeSelect` | `select` | `useDualModel` ignores external writes to `v-model:value` after the first user edit (`useDualModel.ts:59` — `get` prefers latched local state). Surfaces only where a step resets the value from outside; noted so a tester who tries does not file it as new. Still present at working-tree state. |
| **D9** | `DzCombobox`, `DzPersonaSelector` | `reach` (on the `--disabled` stories) | The clear button has no `:disabled` binding while its sibling `ComboboxTrigger` does. **Keyboard-only pairs will not find it** (`tabindex="-1"`), so this is expected to fail *only* on `voiceover-ios` and `talkback-android`, which reach controls by gesture. A rare pair-specific divergence — worth capturing precisely. |
| **D1** | `DzTree` | `live` (third expectation) | Tree-level `disabled` is presentational: the prop never reaches the rows, so a "disabled" tree keeps its roving tabindex, click handlers and expansion. The step expects *"is not operable"*. |
| **D3** | `DzMention` | `live` | The `loading` prop is dead (shadowed by an internal ref). The step already routes around it by using `--async-search`, the only path that reaches the state — recorded so nobody re-diagnoses it. |
| **G5** | `DzTable` | `non-drag` (third expectation) | Column resize is keyboard-operable but has **no single-pointer, non-drag alternative**. WCAG 2.5.7 is not met; this is N1-O3's recorded open owner decision. Expected to fail on the touch pairs. |
| **E6** | `DzOrderList` | `reach` | **Commit-dependent — read carefully.** At `51dec93` the list bound `:ariaLabel` (camelCase), so an `aria-label` prop reached the tree only through modern ARIA reflection and was **absent from SSR markup**. The working tree fixes it to `:aria-label`. The `--accessibility` story names the list via `aria-labelledby`, which was always correct, so **this step should pass on either commit**; it surfaces only on a story that names the list with `aria-label`. The binding exists so a tester on the committed tree knows why. |

### 4b. Defects from the register that are **out of scope** for this wave

Stated so their absence is not read as an oversight:

- **D11** (`DzDropdownMenu` dangling `aria-controls`) — `DzDropdownMenu` is **Tier
  B**, not among the 22. It sits in the other 402 cells and will surface when Tier
  B is scripted.
- **D2** (`DzResizable` group-level `disabled`), **D5**/**D6** — all Tier B or
  tooling-only.
- **D8's other four call sites** (`DzKnob`, `DzRating`, `DzTagsInput`, `DzInplace`)
  are Tier B; only the three Tier C ones are bound here.

### 4c. The rule the scripts give the tester

From `scripts/README.md`, verbatim:

1. Finish the rest of the steps — a failed step is not a reason to abandon the pair.
2. Read the script's "Known open defects" section. If it explains the failure,
   reference the defect id in the notes and stop there.
3. If it does not, **file a defect**. *"A failed step creates a defect entry; never
   a silent re-run, and never a second attempt recorded as the first."*

**Expected first-wave shape:** roughly **11 of the 22 components will produce at
least one failing step for a reason already on the register.** If the first wave
reports 11 "new" defects, the process failed, not the library.

---

## 5. The cadence proposal

### 5.1 Two things must be true before **any** cell is executed

**Blocker 1 — commit the tree first.** 9 of the 22 components have uncommitted
source edits right now: `DzCombobox`, `DzDatePicker`, `DzDateRangePicker`,
`DzFileUpload`, `DzMultiSelect`, `DzOrderList`, `DzTour`, `DzTree`, `DzTreeSelect`.
A run today would record `sourceCommit 51dec93` against behaviour that is **not**
at `51dec93` — including `DzOrderList`'s `aria-label` fix, which changes what an AT
announces. That is a false record. The task's stop condition is unambiguous: *"an
empty cell is honest, an invented one is corruption."* A record with a wrong
commit is the same corruption wearing a valid-looking commit hash. This is the same
owner decision O2 and O3 already raised; N1-O4 is the third packet blocked behind
it, and the first one where ignoring it produces a permanently wrong artifact
rather than an inadmissible one.

**Blocker 2 — fix the capability-matrix cell logic first (§6.2).** Today a
component whose every pair FAILED reads `pass`. Executing cells before that is
fixed converts honest emptiness into published overstatement — strictly worse than
0/534.

### 5.2 Which cells, in what order

| Wave | Pairs | Cells | Steps × pairs | Est. hours | Needs |
|---|---|---|---|---|---|
| **1** | `nvda-firefox` + `jaws-chrome` | **44** | 252 | **~21 h** (≈ 2.6 tester-days) | One Windows machine. NVDA is free (GPL); JAWS runs 40 minutes per boot in demo mode, which comfortably covers one component session. |
| **2** | `nvda-chrome` + `voiceover-safari` | 44 | 252 | ~21 h | A Mac. Adds the second engine per AT and the second AT vendor. |
| **3** | `voiceover-ios` + `talkback-android` | 44 | 252 | ~33 h | An iOS and an Android device. Slowest per step — this is where `non-drag` and D9 actually get tested. |
| **Total Tier C/D** | all six | **132 of 534** | 756 | **~75 h ≈ 9.5 tester-days** | |
| *(later)* Tier B | all six | 402 | — | ~3× the above | Not scoped here. |

**Wave 1 is the task's own stated minimum** — *"NVDA + one of VoiceOver/JAWS at
minimum."* `jaws-chrome` is recommended over `voiceover-safari` for wave 1 **only
if no Mac is available**; if one is, `nvda-firefox` + `voiceover-safari` is the
better first pair because it covers two engines *and* two AT vendors for the same
21 hours.

**The estimate model, stated so it can be argued with:**

- Desktop pair, one component: **3 min setup + 4 min per step.**
  → 22 × 3 + 4 × 126 = 570 min = **9.5 h per desktop pair.**
- Touch pair, one component: **6 min setup + 6 min per step** (device handoff,
  gesture navigation, screen recording).
  → 22 × 6 + 6 × 126 = 888 min = **14.8 h per touch pair.**
- 4 desktop + 2 touch = 38.0 + 29.6 = **67.6 h**, plus **10 %** for defect write-ups
  (§4 predicts ~11 components with a failing step) = **~75 h.**

The variance is real: `DzColorPicker` is 2 steps and `DzCascader` is 8. A
per-component estimate is in `scripts/README.md`'s table (steps × 6 pairs per row).

### 5.3 The recurring cadence — and why "quarterly" is the wrong shape

`validate:at-matrix`'s freshness gate marks a row stale when the component's source
has changed since the run. So the real driver is **component change rate, not the
calendar.** Measured, from `git log -1` per source file:

| Last touched | Components |
|---|---|
| 2026-08-25 | 11 |
| 2026-08-21 | 6 |
| 2026-07-13 | 1 |
| 2026-06-26 | 4 |

**18 of 22 changed within the last seven weeks.** A calendar-quarterly re-run would
spend most of its budget on components that changed the week after the previous
run, and would still be reporting stale cells for the rest.

**Proposed cadence — two clauses:**

1. **Event-driven (the load-bearing one).** When a component's `at-manual` cell goes
   **stale**, re-run its **wave-1 pairs only** before the next release train. At the
   observed rate (~18 components per quarter × 2 pairs × ~26 min average) that is
   **≈ 16 h per quarter, ≈ 62 h per year.**
2. **Calendar floor.** One full six-pair sweep of the 22 **per release train**, or
   half-yearly if releases are less frequent — **~75 h**, from a clean tree, with
   the results appended, never overwritten.

Total steady-state: roughly **0.75–1.0 FTE-weeks per quarter** for Tier C/D.
That is the real price of the credibility gap the competitive benchmark found, and
it is the number an owner is actually being asked to approve.

### 5.4 What a named owner must decide

| # | Decision | Why it cannot be an agent call |
|---|---|---|
| **1** | **Name the tester and adopt a cadence.** | This is the `<owner_gate>` itself. Everything else below is downstream of it. |
| **2** | **Which two pairs are wave 1**, which turns on whether a Mac exists. | Hardware and budget. |
| **3** | **JAWS licensing** — demo mode (40 min/boot) or a paid seat. | Procurement. |
| **4** | **Fix the `at-manual` cell logic before wave 1** (§6.2), and decide how a failed run is represented — `CellState` has no `fail` value. | Changes the capability-matrix schema and its totals; five other packets read it. |
| **5** | **Commit the tree**, then re-bind, before any cell is written (§5.1). | Already on the ledger from O2 and O3; N1-O4 makes it blocking. |
| **6** | **Should Tier D owe more than Tier B?** The scaffold requires identical pairs for B, C and D (§1c). | A scaffold change; `<no_gaming>` forbids this task widening or narrowing an obligation. |
| **7** | **`DzSidebar`'s declared pattern is wrong** (§3d QA1): the matrix says `treeview`, the component ships a `navigation` landmark, and APG says the component is right. Fix the declaration, or the component. | Changes generated quality/AT/capability artifacts for a component that is behaving correctly. |
| **8** | **`tasksFor()` has no per-component opt-out** (§3d QA2): `DzCommandPalette` owes an `error` task it has no surface for. Add an opt-out, or accept a permanent note. | A scaffold rule change. |
| **9** | **The row schema cannot express a per-task result** (§1a A1), while the generated header instructs one row per `{task, pair}`. Change the header text, or add a task column. | Changes an append-only evidence format that already has 534 rows in it. |
| **10** | **Should `validate:at-scripts` become link 29 of `validate:all`?** | Widens a repo-wide gate; the ledger tracks the chain at 28. |
| **11** | **`DzTreeSelect` has no invalid-state story** (§3d QA3) — the `error` step leans on `--in-form-field`'s `required`. Author one? | Story work, N1-O1's lane. |

---

## 6. Capability-matrix state

### 6.1 Executed cells: **0/534. Unchanged, and honestly so.**

The task's `<steps>` item 4 says *"Regenerate the capability matrix so executed-cell
counts replace 'unrun'."* It was regenerated. Nothing replaced anything, because
nothing was executed.

`npx tsx packages/tooling/src/quality/generate-capability-matrix.ts` → **exit 0**,
and both outputs are **byte-identical** to their pre-run MD5s:

```text
packages/core/docs/capability-matrix.json          0298ce178c45f4702f7727cb49965893  OK
apps/storybook/stories/_data/capability.generated.ts  ee514a8eaaf81fadde9ceaa52fefcc6c  OK
```

```text
capability-matrix: 144 components, 1661 evidence cells

  tier   pass  present  stale  unrun  excepted
  A       106      174      0     65         4
  B       326      252      0    330         9
  C       158       96     10    110         0
  D         7       12      1      1         0
```

`at-manual` cells, counted directly out of the artifact:

| Metric | Value |
|---|---|
| `at-manual` cells in the capability matrix | **89** (one per Tier B–D component) |
| …by state | **`unrun`: 89.** No `pass`, no `stale`, no `present`, no `excepted` |
| …on Tier C/D rows | 22 |
| Total evidence cells | **1 661** — unchanged |
| `sourceCommit` | `51dec93c73214af2d1e424e3454a7122691fea48` |

Example cell, `DzFileUpload` — the sole Tier D component:

```json
{"kind":"at-manual","origin":"tier B","scope":"component","state":"unrun",
 "artifacts":["e2e/at-matrix/DzFileUpload.md"],
 "note":"6 AT/browser pairs, none executed."}
```

**Ratchet movement: AT cells executed 0/534 → 0/534.** The board entry does not
move. Writing anything else would have required inventing a run.

Note the granularity mismatch worth knowing: the capability matrix carries **one
`at-manual` cell per component (89)**, while the scaffold carries **534**. The
per-pair detail survives only in the cell's `note` string.

### 6.2 **The finding that blocks step 4: a component whose every AT pair FAILED reads `pass`**

`generate-capability-matrix.ts:539-556`, verbatim:

```ts
case 'at-manual': {
  const entry = sources.atIndex?.entries.find(e => e.component === row.component)
  if (entry === undefined)
    return cell(kind, origin, { state: 'unrun' })
  const executed = entry.rows.filter(r => r.result !== 'unrun')
  if (executed.length === 0) { /* … unrun … */ }
  const stale = executed.some(r => !evidenceIsCurrent(r.sourceCommit, entry.componentCommit))
  return cell(kind, origin, {
    state: stale ? 'stale' : 'pass',
    note: `${executed.length}/${entry.rows.length} pairs executed`,
  })
}
```

`executed` is `result !== 'unrun'` — so `fail`, `partial` and `blocked` all count as
executed, and **the result value is never inspected.**

**Proven, not asserted.** Driven through the exported `buildCapabilityMatrix()`
with a synthetic index, entirely in memory — **no file was written and no run
record was fabricated on disk**, because proving it any other way would have meant
writing a fake row, which this task forbids:

| Synthetic input | Cell state | Cell note |
|---|---|---|
| all six pairs `unrun` | `unrun` | `6 AT/browser pairs, none executed.` |
| one pair `pass`, five `unrun` | **`pass`** | `1/6 pairs executed` |
| one pair **`fail`**, five `unrun` | **`pass`** | `1/6 pairs executed` |
| **all six `fail`** | **`pass`** | `6/6 pairs executed` |
| all six `blocked` | **`pass`** | `6/6 pairs executed` |

Two distinct defects:

1. **A failed run is published as a pass.** Directly false.
2. **One pair out of six is published as a pass.** `1/6 pairs executed` is in the
   note, but the *state* — the thing the totals table counts and the docs site will
   render — says `pass`.

This is precisely N1-O2's finding **E3** repeating in the neighbouring lane: *"the
generator only checked that the report file exists, so all 89 read `pass`
regardless of engine."* Same shape, same consequence, different input.

**Deliberately not fixed here.** `CellState` is
`'pass' | 'present' | 'stale' | 'unrun' | 'excepted'` — **there is no `fail`
value**, so any repair is a schema decision that changes the totals table five
other packets read. That is an owner decision (§5.4 #4), not an agent call, and it
is latent today precisely because 0 cells are executed. **It must be closed before
the first wave lands**, or the first honest AT run in this repository's history
will be published as a clean pass.

*(Related and already on the ledger: O2/O3 asked that `validate:capability-matrix`
fail when a cell degrades `pass` → `unrun`. This is the mirror-image hole — a cell
that should never have said `pass` in the first place.)*

---

## 7. Validation ladder

**Tooling failures and component failures are reported separately**, per
`<repo_conventions><validation>`.

### 7a. Narrowest owning command first

| Lane | Command | Result |
|---|---|---|
| script generation | `npx tsx …/generate-at-scripts.ts` | **exit 0** — 22/22 scripted, 126 steps, 132 of 534 cells covered, story ids checked against 1 635 built stories |
| determinism | generator run twice, `md5sum -c` | **23/23 OK, zero divergence** |
| script QA | `npx tsx …/generate-at-scripts.ts --check` | **exit 0** |
| negative tests | 6 mutated-input probes | **all 6 fired correctly** (§2e) |
| lint (new files) | `npx eslint …at-scripts.data.ts …generate-at-scripts.ts --max-warnings 0` | **exit 0** |
| AT scaffold | `npx tsx …/validators/at-matrix.ts` | **exit 0** — 89 components, 534 cells, **0 executed**, 0 stale, no malformed rows |
| capability matrix | `npx tsx …/validators/capability-matrix.ts` | **exit 0** — fresh, no Tier D cell unexplained |
| capability regen | `npx tsx …/generate-capability-matrix.ts` | **exit 0**, output byte-identical |
| package.json | `JSON.parse` | parses |

### 7b. Full ladder

| Command | Exit | Notes |
|---|---|---|
| `yarn validate:all` (mid-task) | **0** | 28 links green |
| `yarn validate:all` (task end, re-run bare) | **see §7f** | |
| `npx vitest run packages/tooling` | **1** | **603 passed, 2 failed — both pre-existing, neither mine.** See §7d. |

### 7c. Component failures

**None. Zero component source files were touched by this task.**
`git status --short packages/core/src/` shows no file this task modified. No prop,
emit, slot, type, token or variant taxonomy changed. No `.vue`, `.types.ts`,
`.tokens.ts` or `.variants.ts` was opened for writing.

The component *defects* in §4 were all found by earlier packets and are reported,
not fixed — consistent with N1-O1's register and this task's `<records>` rule.

### 7d. Tooling failures — the two pre-existing `yarn test` reds

`npx vitest run packages/tooling` → **2 failed / 39 passed test files; 2 failed /
603 passed tests.** Both are the **known pre-existing failures recorded as G6** and
neither is in this task's lane:

| # | File | Cause |
|---|---|---|
| T1 | `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts` | Six hard-coded colour fallbacks in the landing themes page disagree with their tokens. Belongs to `apps/landing`. |
| T2 | `packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen > subtracts a waiver` | Its fixture asks the live repo for an open tier-required item; **N1-O1 drove that count to 0**, so `find` returns `undefined` and line 105 throws. N1-O1's success breaking its own unit test. |

`yarn validate:all` does not run `yarn test`, which is why neither surfaces in the
28-link chain.

### 7e. Run-record integrity — nothing irreplaceable was disturbed

| Artifact | Check | Result |
|---|---|---|
| `test-results/matrix-report.json` (git-ignored, sole copy of the chromium run) | MD5 | **`15b4139314e12569cc160609fa0692a3`** — matches the value recorded at task start. Untouched. |
| `e2e/at-matrix/*.md` — the 89 append-only scaffold files | `git status` | **No modification.** Only `?? e2e/at-matrix/scripts/` is new. |
| `e2e/visual/` baselines and ledger (N1-O6) | `git status` | Untouched — the same untracked set N1-O6 left. |
| `packages/core/docs/capability-matrix.json` | MD5 before/after regen | **identical** |
| Unrelated dirty work (~100 files from N0-05/O1/O2/O3/O5/O6) | `git status` | **Preserved.** No commit, no push, no CI dispatch, no publish, no baseline replacement. |

### 7f. Task-end `yarn validate:all` — **exit 0**

Re-run bare at task end (redirected to a file, **not read through a pipe**, so the
exit code is the process's own):

```text
VALIDATE_ALL_EXIT=0
✓ lines: 16      ✗ lines: 0
```

**All 28 links green** — `typecheck` + `lint` + 26 validators, including
`validate:at-matrix`, `validate:capability-matrix`, `validate:visual-baselines`,
`validate:story-dod-tiers` and `validate:ownership`. (16 validators print a `✓`
summary line; the rest report in their own format. The chain length is 28 and no
link failed.)

The tree is verified green at task end. `yarn test` remains red with the two
pre-existing failures in §7d, which `validate:all` does not run.

### 7g. Files this task added or changed

| File | Change |
|---|---|
| `e2e/at-matrix/scripts/*.at-script.md` | **new** — 22 files, 3 100 lines |
| `e2e/at-matrix/scripts/README.md` | **new** — 105 lines |
| `packages/tooling/src/quality/at-scripts.data.ts` | **new** — 1 897 lines |
| `packages/tooling/src/quality/generate-at-scripts.ts` | **new** — 457 lines |
| `package.json` | **+4 lines** — `generate:at-scripts`, `validate:at-scripts` and their `//` doc entries. `validate:all` untouched. |
| `docs/program-2026-09/EXECUTION-STATUS.md` | ledger row 7 → `[!]`; AT ratchet annotated; 7 owner decisions appended |
| `docs/program-2026-09/reports/N1-O4-at-matrix-handoff.md` | this file |

**Public API effect: none.** No `packages/core/src/**` file, no barrel, no type, no
token, no variant. `validate:exports`, `validate:dts` and `validate:ownership` all
green with no delta.

---

## 8. Status: `[!]` — blocked on an owner decision

### 8a. Why `[!]`, in the task's own words

The `<owner_gate>` reads:

> Executing cells requires a named human owner and a recurring cadence. If none is
> assigned, complete the scripts + dry-run one component yourself with a screen
> reader if the environment allows, then mark the task `[!]` with a concrete
> proposal.

And the `<stop_conditions>`:

> Stop when no AT is available in the environment and no human tester is assigned —
> deliver the scripts + proposal and mark `[!]`. **Never fabricate a run record; an
> empty cell is honest, an invented one is corruption.**

Both conditions hold, measured rather than assumed:

- **No AT is available.** No NVDA, no JAWS, no macOS, no iOS device, no Android
  device (§1e). Windows Narrator exists but is not one of the six declared pairs and
  could not be heard by this agent anyway.
- **No human tester is assigned and no cadence exists.**

So: **scripts + proposal delivered, `[!]` marked, `0/534` left standing.**

### 8b. Success criteria, scored honestly

| Criterion | Status |
|---|---|
| 22/22 Tier C/D components have executable scripts | ✅ **Met.** 126 steps, 397 expectations, every scaffold task covered, gated. |
| "at least the dry-run components carry real appended records" | ❌ **Not met, and correctly not met.** Zero records appended. The dry-run performed was **script QA** (§3), not an AT run, and it is labelled as such everywhere it appears. |
| every failure became a tracked defect | ➖ **Vacuous — no run, no failures.** The 13 anticipated failures (§4) are pre-registered against the existing register so a first wave does not re-file them. |
| capability matrix reflects executed counts | ✅ **Met, and the count is 0.** Regenerated; byte-identical; 89 `at-manual` cells all `unrun`. |
| a written cadence proposal exists for the owner | ✅ **Met** (§5): which cells, what cadence, ~75 h, 11 decisions. |

### 8c. What unblocks it — in order

1. **Name a tester and adopt a cadence** (§5.4 #1). This *is* the gate. Everything
   else is downstream.
2. **Commit the tree** (§5.1, Blocker 1). 9 of 22 components have uncommitted source
   edits; a run today writes a permanently wrong `sourceCommit`. Already on the
   ledger from O2 and O3 — N1-O4 makes it blocking rather than merely
   inadmissible.
3. **Fix the `at-manual` cell logic** (§5.1, Blocker 2 / §6.2). A failed run
   currently publishes as `pass`. Executing before this is closed is worse than
   0/534, because it converts honest emptiness into published overstatement.
4. **Answer decisions 2, 3, 6–11** (§5.4) — pair choice, JAWS licensing, the Tier D
   pair question, `DzSidebar`'s pattern, `tasksFor()`'s missing opt-out, the row
   schema's missing task column, `validate:at-scripts` as link 29, and
   `DzTreeSelect`'s missing invalid story.

Once 1–3 are answered, **wave 1 is ~21 hours of tester time and moves the ratchet
`0/534 → 44/534`** — the first non-zero value that number has ever had.

### 8d. Ranked next packet

| # | Packet | Why here |
|---|---|---|
| **1** | **Fix `at-manual` cell resolution + decide how a failed run is represented.** | Half a day of tooling work that decides whether the entire AT programme produces evidence or theatre. Blocks wave 1. Same class as E3, G1, G2, S1 — a gate that could not see a lie. |
| **2** | **Commit the tree and re-bind.** | Third packet blocked behind it. Also unblocks O2/O3's browser evidence. |
| **3** | **Wave 1: `nvda-firefox` + `jaws-chrome` on the 22.** | ~21 h. 44 cells. The single biggest credibility movement available to this repository. |
| **4** | **Resolve `DzSidebar`'s declared pattern.** | A generated artifact currently declares a pattern the component correctly does not implement. Cheap, and it removes a permanent asterisk from one of 22 scripts. |
| **5** | **Promote the 15 prose-referenced story ids to structured references** (§3a) and decide `validate:at-scripts` as link 29. | Small hardening; keeps the scripts from rotting the way the scaffold was designed not to. |
| **6** | **Script Tier B** (67 components, 402 cells). | Only worth doing once wave 1 has proved the format survives contact with a real tester. |

### 8e. Maturity level reached

Per `<maturity_levels>` — *specified → implemented → focused-validated →
aggregate-qualified → browser/AT-qualified → packaged → released*:

The AT scripts are **implemented and focused-validated** (generated, deterministic,
gated, negative-tested, every story id resolved). The **components remain exactly
where they were: `browser-qualified`, and not one step closer to `AT-qualified`.**

This task built the instrument. It did not take the measurement, and it does not
claim to have.
