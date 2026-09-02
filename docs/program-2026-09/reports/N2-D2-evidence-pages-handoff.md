# TASK-N2-D2 — The evidence layer on the docs site

> **Status:** complete. Written incrementally as the packet ran.
> Repo `ui/dzup-ui`, branch `main`, HEAD `51dec93 new version for themes`,
> worktree **dirty** (179 entries at run start: the uncommitted N1 evidence
> program plus N2-T1 / A1 / A2 / A3 / D1). Nothing is committed, pushed,
> dispatched, deployed or published by this packet.
> Toolchain: Node `v24.14.1`, Yarn `4.16.0`.
> Every number below is bound to that HEAD and to the generated artifacts named
> in §1, each of which records `sourceCommit 51dec93c…`.
>
> **Standing:** everything here is **locally qualified on a dirty worktree**. It
> is not CI evidence, not release evidence, not production evidence. That
> sentence is also printed on every page this packet generates, once per page,
> composed from the artifacts rather than typed.

---

## 0. Headline

**The site now publishes what has *not* been measured, in the same tables and at
the same weight as what has.**

**506 of 1,661 capability cells are `unrun`** and every one of them is printed by
name on the component it belongs to. **AT cells executed: 0 of 534** — rendered
per pairing, with `unrun` in the result column and an em dash where a tester's
name would go. **144 of 144 keyboard sections say *"not yet derived"***, because
the repository's only machine-readable keyboard signal is a boolean and this
packet refused to hand-type 144 tables nothing could check.

Six generated pages under `/evidence/`, an *Accessibility and evidence* section
on all **144** component pages, and the two authored statements — all inside
`validate:docs-pages`, all fingerprinted, all rendered by
`buildDocsPages()`, exactly as D1's §14 seam specified. **The statements'
prose contains no metric at all**, enforced by a spec that scans every string in
`statements.ts` for a digit run or an English number word and requires an
allowlist entry with a reason; it **fired on five sentences on its first run**,
all of which were rewritten rather than allowlisted.

**B-N1-AT is not merely avoided, it is enforced.** The AT state is read from the
append-only scaffold, never from the `at-manual` capability cell, and
`atManualTripwire()` **refuses to generate the site** when that cell claims more
than the raw records support. Seeded with the exact N1-O4 §6.2 defect — all six
pairings `fail`, cell resolves to `pass` — the generator exits 1 and names the
component. It is silent today, and it exists for the day it will not be.

**Nine seeded violations, every one red, everything restored** — 152 generated
files and 6 artifacts verified `sha256sum -c` clean afterwards. Two of the nine
close N1's finding **F4** for this surface: a lane record that *vanishes* now
turns the site build red instead of silently flipping a page to a confident
absence.

**`yarn validate:all` exit 0, 33 links — unchanged**, because the evidence gates
were folded into `validate:docs-pages` rather than added beside it. `yarn lint`
exit 0 including the five new files. `yarn test` red only on **B5**'s two
pre-existing failures. `packages/tooling`'s **7** `tsc` errors are pre-existing
and **none is in this packet's files** (**B-A1-F7**, checked by hand).

**Ten findings.** The sharpest is that **`non-drag-alternative` cites WCAG 2.5.7
and does not measure it** — it tests whether a unit spec asserts a key, which is
SC 2.1.1 — and it disagrees with the measured audit on **4 of 9** drag surfaces,
including `DzTable`, which reads `present` and does **not** meet the criterion.
That is the artifact-shape defect this rendering exercise was meant to surface.

**Nothing was deployed, hosted, published or committed; `build:registry` and
`generate:exports` were not run.**

---

## 1. Artifact fields → page sections (the map, made before any renderer)

The task's step 1: *map artifact fields to page sections; identify any missing
machine-readable field and record it (do not invent data)*. This is that map,
and the right-hand column is the honest answer where a field does not exist.

### 1a. What each artifact can supply

| Artifact | Tracked? | Fields this packet reads |
|---|---|---|
| `packages/core/docs/quality-matrix.json` (schema 1.0.0, `sourceCommit 51dec93c…`) | yes | per component: `tier`, `pattern`, `patternJustification`, `securityBoundary`, `boundaryJustification`, `traits`, **`wcag` (SC ids)**, `evidence`, `evidenceOrigin`, `exceptions`, `parts`. Top level: the **`wcag` dictionary** — 38 criteria with `id · name · level · since` — and `rules.tierIncrement`. |
| `packages/core/docs/capability-matrix.json` (schema 1.1.0) | yes | per component: `anatomy`, `componentCommit`, and **1,661 cells** carrying `kind · origin · scope · state · artifacts · note`. Top level: `inputs` (which measurement files were available, with their caveats) and `totals` by tier. |
| `e2e/at-matrix/index.json` (schema 1.0.0) | via its 89 `.md` files | the six `pairs` (`id · at · browser · platform · purpose`) and, per component, the **raw append-only rows**: `pair · result · versions · tester · date · sourceCommit · notes`. **This is the AT source of truth for this packet** — §3. |
| `packages/core/docs/wcag-deviations.json` **(new, §5)** | new file | the measured SC 2.5.7 audit: 9 surfaces, their keyboard path, their single-pointer path or its absence, the reason each gap is not excepted, and the conformance statement. |
| `e2e/matrix/engine-ratchets.json` | untracked (N1-O2, uncommitted) | engine `version`, `conditionsRun`, per-engine `summary`, `crossEngineResult`, `admissibility`, `worktreeDirty`, `playwrightVersion`, `platform`, `method`. |
| `e2e/matrix/known-failures.json` | yes | the cross-engine ledger — `entries` (0 today), `closedBy`. |
| `packages/core/security/security-deviations.json` | untracked (N1-O5) | 12 measured deviations over 6 components, with `sink · severity · publicBehaviourChange`. |
| `packages/core/docs/component-meta.json` (schema 1.1.0) | untracked (N2-A2) | the record every page is already built from. Its `capability` join is used **only as a cross-check**, never as the evidence source (§2b). |
| `packages/core/src/styles/base.css` | yes | the single `@layer` ordering statement — the only generated source for the layer names the styling statement quotes. |

### 1b. Page section → field, and where "not derivable" bites

| Page section | Fields | The honest state |
|---|---|---|
| APG pattern link | `quality.pattern` + the `ApgPattern` contract in `packages/contracts/src/quality-tiers.ts`, whose doc comment states the slug rule: *"lowercase-hyphenated exactly as the APG URL slug spells it, so a reader can paste it after `https://www.w3.org/WAI/ARIA/apg/patterns/`"* | `custom` and `none` have **no APG page**. **73 of 144** components are in that state (62 `none`, 11 `custom`). Their pages say *"no WAI-ARIA Authoring Practices pattern describes this component"* and print the recorded reason; **nothing is linked**. |
| WCAG SC list | `quality.wcag` ids joined to the top-level dictionary | Complete. Every id resolves; the renderer still carries an unresolved-id branch and prints the ids rather than dropping them. |
| **Keyboard interaction table** | **nothing** | **The repository has no machine-readable keyboard table.** Finding **F-1**; 144 of 144 pages say *"not yet derived"*. §4. |
| AT matrix state | the raw scaffold rows | **0 of 534 executed.** Rendered per pairing with `result`, `tester`, `date`, versions and the commit — all `unrun` / `—` today. |
| Evidence cells | `capability.cells` | `unrun` and `stale` printed **by name**, never as a count alone. |
| WCAG 2.5.7 open gap | **did not exist** | Created as `packages/core/docs/wcag-deviations.json`, transcribed from N1-O3 §6.3's measured audit with provenance and **gated against the generated `drags` trait** so it cannot rot silently. §5. |
| Browser support | `engine-ratchets.json` + `known-failures.json` | **No `browserslist`, no build `target`, no declared Baseline tier exists anywhere in the repository** — finding **F-2**. The Baseline sentence is `[!owner]` and claims nothing. |
| Styling posture | `base.css` `@layer` line · anatomy declarers · `ui`-prop declarers | The ledger's *"`ui` prop adopted / 144 = 5 (pilots)"* is **4 public components plus 1 compound part** — finding **F-3**. |

### 1c. Machine-readable fields that were looked for and do not exist

Recorded rather than invented, per the task's stop condition.

| Wanted | Nearest thing that exists | Why it is not enough |
|---|---|---|
| A keyboard interaction table (`key → action`) | `capability.cells['keyboard-spec']` | A **boolean**. `generate-capability-matrix.ts:470-482` resolves it by testing the unit spec against `/Arrow(?:Up\|Down\|Left\|Right)\|['"]Tab['"]\|['"]Escape['"]\|['"]Enter['"]\|keydown/`. It records *that* keys are asserted, never *which* key does *what*. |
| A per-component RTL keyboard note | `anatomy.rtl.keyboard` | Two values only, `'swap-horizontal' \| 'none'`, and only on the 8 components that declare an anatomy. It is a mirroring flag, not a table. |
| Executable keystrokes | `at-scripts.data.ts` `press[]` for 22 components | These are **AT test instructions** whose expectations are *derived from APG, not from the component* — the file says so in its own docstring. Publishing them as "what this component does" would publish the specification as the measurement, which is the exact inversion this program exists to stop. |
| A `fail` cell state | — | `CellState` is `'pass' \| 'present' \| 'stale' \| 'unrun' \| 'excepted'`. A measured failure has nowhere to live, which is why the SC 2.5.7 gap needed its own register (§5) and why the AT state is read raw (§3). |
| A per-component conformance verdict | — | Nothing in the repository produces one, and this packet does not. Every page says the SC list is *scope, not conformance*. |

---

## 2. What was built

| Path | Lines | What it is |
|---|---|---|
| `packages/tooling/src/docs/evidence.ts` | 978 | The artifact types, the three cross-artifact gates, and the **per-component evidence section**: risk tier, APG link, traits, boundary, anatomy, exceptions, sub-part warning, WCAG scope table, the SC 2.5.7 block, the keyboard section, the AT table and the evidence-cell table. Pure — no filesystem. |
| `packages/tooling/src/docs/evidence-pages.ts` | 716 | The six `/evidence/` pages, the shared provenance footer and the catalogue arithmetic. Pure. |
| `packages/tooling/src/docs/statements.ts` | 387 | **The only hand-written prose in the evidence layer**, in named blocks, containing **no metric** — plus `PROSE_LITERAL_ALLOWLIST`, six entries, each with the reason it is a name rather than a measurement. |
| `packages/tooling/src/docs/read-evidence.ts` | 153 | The filesystem half: required vs optional artifacts, the `@layer` reader, the AT-script index, and the SHA-256 fingerprints. |
| `packages/tooling/src/docs/evidence.spec.ts` | 570 | **43 tests.** The at-manual tripwire driven with synthetic failures, the prose gate, the derived-URL rule, the absent-lane-record path, and a whole-catalogue sweep over the real artifacts. |
| `packages/core/docs/wcag-deviations.json` | 100 | **New generated-truth artifact** (§5): the measured SC 2.5.7 audit, bound to the `drags` trait by a gate. |
| `apps/docs/evidence/index.md` | 89 | The hub — catalogue totals, how to read a state, what the evidence is admissible for. |
| `apps/docs/evidence/accessibility.md` | 203 | The conformance statement: the open gap first, the audit, the AT matrix, the summariser defect, the keyboard position, the 38-criterion scope table. |
| `apps/docs/evidence/at-matrix.md` | 186 | 0 of 534, the six pairings, and every component that owes a run. |
| `apps/docs/evidence/browser-support.md` | 128 | The statement + the engine lane. |
| `apps/docs/evidence/capability-matrix.md` | 318 | The whole matrix: inputs, totals by tier, totals by kind, the 14 kinds with a gap named component-by-component, and all 144 rows. |
| `apps/docs/evidence/styling-posture.md` | 101 | *Restyleable by contract, not unstyled*, with its counts generated. |

**Modified (six files, all additive):**

| Path | Change |
|---|---|
| `packages/tooling/src/docs/docs-pages.ts` | `ComponentPageInput` gained an optional `evidence`; `renderComponentPage` calls `renderEvidence(record, evidence)` after `renderFidelity` — **D1 §14's seam, one line, taken verbatim**. `DocsNav` gained `evidenceSha256` and an `evidence` summary. With no `evidence` passed the output is byte-identical to D1's, which keeps every D1 unit test meaningful. |
| `packages/tooling/src/docs/generate-docs-pages.ts` | Reads the evidence sources, runs the three gates **before writing anything**, adds the six evidence pages to `buildDocsPages()`, and sweeps `apps/docs/evidence/` for orphans as well as `apps/docs/components/`. |
| `apps/docs/.vitepress/config.ts` | The fingerprint assertion widened to every evidence artifact, including the *absence* case; an Evidence nav entry and sidebar; the unrun-cell and AT-cell counts in the header dropdown. |
| `apps/docs/guide/how-this-site-is-built.md` | **D1 §14 rule 4 discharged.** The sentence *"It is not evidence."* is gone; in its place are the six things that now fail the build and an explicit statement that what is published is locally qualified. |
| `apps/docs/guide/styling-contract.md` | Points at the published posture statement, so the how-to and the position do not drift apart. |
| `package.json` | The `//generate:docs-pages` and `//validate:docs-pages` doc keys describe the evidence layer and its three gates. **No script was added** — see §7. |

### 2b. Why the evidence layer reads the matrices and not `record.capability`

`component-meta.json`'s `CapabilityJoin` is a **summary**: a count per state, plus
`unrun`/`stale` by name. It carries no per-cell `origin`, no `note`, no
`artifacts` and no WCAG list — everything a reader needs in order to *check* a
claim rather than take it. So the join is used as a **cross-check only**:
`crossCheckCapabilityJoin()` compares the summary in one artifact against the
matrix in the other, component by component, and the build stops if they
disagree. That is not hypothetical hygiene — seed **S1** (§6) tripped it as a
side effect, which is how a cross-check is supposed to behave.

---

## 3. The AT state is read from the scaffold, and the summariser is fenced off

**B-N1-AT, discharged three ways.**

**1. The page never reads the defective cell.** `renderAtSection()` reads
`e2e/at-matrix/index.json` — the append-only run records themselves — and renders
one row per `{component, pair}` with `result`, `tester`, `date`, the AT/browser
versions and the commit. Today every row is `unrun` and every metadata column is
an em dash. The section's headline is composed, not written:
`**0 of 6 AT/browser pairs executed.**`

**2. The generator refuses to publish a contradiction.** `atManualTripwire()`
compares the `at-manual` capability cell against those raw rows and fails the run
on three shapes:

| Shape | Why it is refused |
|---|---|
| cell is not `unrun` **and** a recorded row is `fail` / `partial` / `blocked` | **The exact N1-O4 §6.2 defect.** `CellState` has no `fail`, so the summariser resolves an all-failed component to `pass`. |
| cell is not `unrun` **and** every row is `unrun` | A state with nothing behind it. |
| cell **is** `unrun` **and** a row is executed | The mirror image: a real run the matrix has not been regenerated to see. |

A **partial** run — some pairings executed, summarised as `pass` — is
deliberately *not* a build failure. It is an overstatement rather than a
falsehood, and the page already handles it by not reading the cell: it prints
`1 of 6 executed` and names the five that were not. That split is asserted by a
test whose comment says so.

**3. The one place the cell state does appear says what it is.** The
`at-manual` row in each page's evidence-cell table is the matrix's own summary,
so a paragraph under the table states that the page does not rely on it, and
links to the disclosure on `/evidence/accessibility`.

**The disclosure is published, not hidden.** `/evidence/accessibility` and
`/evidence/at-matrix` both carry *"A known defect in the summariser, disclosed
rather than inherited"*, which states plainly that a component whose every
pairing had failed would be summarised as a pass, that the cell-state type has no
`fail` value, and that repairing it is an owner decision. Publishing that is
uncomfortable and it is the correct trade: a reader who knows the limitation can
weigh the number, and a reader who does not cannot.

**Nothing was fabricated.** Every synthetic failure used to prove the tripwire
lives in `evidence.spec.ts` and in memory. No run record was written to disk, in
either the packet or the seeded-failure run (§6 restores are hash-verified).

---

## 4. "Not yet derived" — the keyboard table, and why refusing was the deliverable

The task's own instruction: *where only prose exists, the section links the APG
pattern and marks the table "not yet derived" rather than hand-typing one.*

**Measured before deciding.** The repository's keyboard signal, in full:

```ts
// packages/tooling/src/quality/generate-capability-matrix.ts:470-482
case 'keyboard-spec': {
  const path = sidecar(sources, row, '.spec.ts')
  if (path === undefined) return cell(kind, origin, { state: 'unrun' })
  const source = readFileSync(resolve(ROOT, path), 'utf8')
  const has = /Arrow(?:Up|Down|Left|Right)|['"]Tab['"]|['"]Escape['"]|['"]Enter['"]|keydown/.test(source)
  return cell(kind, origin, { state: has ? 'present' : 'unrun', … })
}
```

That is a **regex probe for the presence of a key name in a spec file**. It
cannot say which key, on which element, does what. Nothing else in the repository
is closer: `anatomy.rtl.keyboard` is a two-valued mirroring flag on 8 components,
and `at-scripts.data.ts`'s keystrokes are APG-derived *expectations* for a human
tester, explicitly *"NOT from what the component currently does"*.

**So all 144 pages say it, and say what they do have instead:**

> **Not yet derived.** This library has no machine-readable keyboard table: the
> only generated keyboard signal is whether a spec asserts *some* key, not which
> key does what. Rather than hand-type a table that nothing could check, this
> page links the pattern the component is held to and states what has actually
> been measured.
>
> - **Pattern:** [APG — `table`](https://www.w3.org/WAI/ARIA/apg/patterns/table/) · its *Keyboard Interaction* section is the contract this component is audited against.
> - **Measured:** `keyboard-spec` is **present** — a spec asserts at least one key sequence in `packages/core/src/components/data/DzTable.spec.ts`. That is a presence measurement, not a table: it does not say which keys, or what they do.

Catalogue-wide, of the **89** components that owe a `keyboard-spec`: **29
`present`, 58 `unrun`, 2 `excepted`**. Where the pattern is `custom` or `none`
there is no APG page to link either, and the section says that rather than
linking a URL that would 404 — **73 of 144** components are in that state.

`/evidence/accessibility` carries the position in one place: *"An honest gap is
worth more than a plausible table."*

---

## 5. The one artifact this packet created, and why it had to exist

**`packages/core/docs/wcag-deviations.json`** — the measured SC 2.5.7 audit,
transcribed from N1-O3 handoff §6.3 with `measuredBy`, `source`, `sourceCommit`,
`worktree: dirty` and `admissibility` on the record.

**Why a new artifact rather than a cell.** `B-N1-G5` requires a conformance page
to state the library's only open WCAG 2.2 AA gap. Nothing generated can express
it:

- `CellState` has no `fail` value, so no capability cell can hold a measured
  failure.
- The nearest cell, `non-drag-alternative`, **measures the wrong thing** — see
  finding **F-4**. It tests a unit spec for a key sequence, which is SC 2.1.1;
  SC 2.5.7 is a pointer criterion that a keyboard path does not satisfy.
- The quality matrix's `wcag` array is a **scope** list. `2.5.7` appearing there
  means the criterion applies, not that it was met or missed.

**Why it cannot rot.** `crossCheckWcagDeviations()` fails the build when the
audited set is not exactly the set of components carrying the generated `drags`
trait, when the declared `openGaps` disagrees with the surfaces in state `gap`,
when a gap also names a single-pointer path, or when the open count exceeds its
ceiling. It is a downward-only ratchet at **3**. Seed **S4** (§6) proved all of
that by dropping one component from the audit.

**What it publishes.** On `/evidence/accessibility`, the gap is stated *before*
any total, quoting the criterion, naming `DzResizable`, `DzSplitter` and
`DzTable`, listing the full 9-row audit gaps-first, and printing the reason each
gap is not excepted and the scoped follow-up handed to the owner. On the three
affected component pages it is a `::: danger` block; on the six that meet it, a
`::: tip` that names the actual single-pointer mechanism — and `DzOrderList`'s
configuration caveat (`:show-controls="false"` removes the only single-pointer
path) is printed, because N1-O3 recorded it and a conformance claim that ignores
a configuration that breaks it is not a conformance claim.

---

## 6. Proof the gates can fail — nine seeded violations, all restored

Every gate in this lane is proven by seeding the violation it claims to catch.
This packet has five independent failure surfaces and all five were made to fire.

| # | Seeded | Gate | Result |
|---|---|---|---|
| **S1** | `at-manual` cell on `DzTable` → `pass`, run records untouched | tripwire clause 2 + capability cross-check | **exit 1, nothing written** — and the cross-check fired *as well*, which is what a redundant gate is for |
| **S2** | all 6 `DzTable` AT rows → `fail`, capability matrix left as it was | tripwire clause 3 (a real run the matrix has not seen) | **exit 1** |
| **S3** | **the exact N1-O4 §6.2 defect**: 6 rows `fail` **and** the cell resolved to `pass` with note `6/6 pairs executed`, and the meta join updated to match so nothing else could mask it | tripwire clause 1 | **exit 1** |
| **S4** | `DzTable` removed from the SC 2.5.7 audit while it still carries `drags` | `crossCheckWcagDeviations` | **exit 1, two clauses** |
| **S5** | `wcag-deviations.json` moved aside | required-artifact clause in `readEvidenceSources` | **throws, nothing written** |
| **S6** | hand-edited `evidence/accessibility.md`, changing `**0 of 534 cells**` to `**534 of 534 cells**` | `validate:docs-pages` byte comparison | **exit 1, names the file** |
| **S7** | copied `at-matrix.md` to `evidence/ghost-lane.md` | orphan clause, widened to the evidence directory | **exit 1** |
| **S8** | edited `capability-matrix.json` **after** the pages were generated, then ran `vitepress build` **alone** | the widened fingerprint in `.vitepress/config.ts` | **exit 1 before the first page compiles** |
| **S9** | `engine-ratchets.json` **deleted**, then `vitepress build` alone | the fingerprint's absence clause | **exit 1** — this is N1's finding **F4** closed for this surface |

Verbatim output of the three that matter most.

**S3 — the defect this constraint exists to stop, reaching a published page:**

```
✗ [evidence] DzTable: the capability matrix publishes at-manual `pass`, but 6 of 6 recorded AT rows
  are `fail`. This is the N1-O4 §6.2 defect (`CellState` has no `fail` value) reaching a published
  page. Fix the cell resolution before publishing AT evidence.

1 evidence violation(s). NOTHING was generated.
An evidence page that overstates what was measured is worse than no evidence page, because a
reader cannot tell. Fix the artifact that disagrees, then re-run.
```

**S1 — a state with nothing behind it, caught twice:**

```
✗ [evidence] DzTable: the capability matrix publishes at-manual `pass` while all 6 AT run records
  read `unrun`. No screen-reader session is recorded, so there is nothing for that state to be a
  summary of.
✗ [evidence] DzTable: component-meta.json says unrun = [at-manual, controlled-uncontrolled],
  capability-matrix.json says [controlled-uncontrolled]. One artifact is stale.
```

**S9 — a measurement record disappearing, which is N1's F4:**

```
build error:
The generated evidence pages are STALE: e2e/matrix/engine-ratchets.json was read at render time
and is now gone.
The pages describe measurements from an artifact that no longer exists. Run `yarn generate:docs-pages`.
```

**Restoration verified, not asserted.**

```
sha256sum -c pages-before.txt      152 of 152 OK   (144 component pages + index + 6 evidence + nav)
sha256sum -c artifacts-before.txt    6 of 6   OK   (capability · quality · component-meta ·
                                                    wcag-deviations · at-matrix index · engine-ratchets)
tsx generate-docs-pages.ts --check
  ✓ docs pages fresh — 144 component pages + index + 6 evidence pages + nav
    evidence: 1661 capability cells (506 unrun, 11 stale) · AT cells executed 0/534
```

**A tenth failure, unplanned and more instructive than any of the nine** — see
finding **F-6**: `eslint --fix` silently rewrote two authored strings in this
packet's own source, one of them a test title. Fourth sighting of that class.

---

## 7. Focused validation output

| Command | Result | Time |
|---|---|---|
| `vitest run packages/tooling/src/docs/evidence.spec.ts` | **43 passed** | 5.9 s |
| `eslint packages/tooling/src/docs apps/docs --max-warnings 0` | **exit 0** | — |
| `tsc --noEmit -p packages/tooling/tsconfig.json` | **exit 2 — 7 errors, none in this packet's files** (§9) | 40 s |
| `tsx packages/tooling/src/docs/generate-docs-pages.ts` | exit 0 — 152 files | 25 s |
| `tsx packages/tooling/src/docs/generate-docs-pages.ts --check` *(= `validate:docs-pages`)* | exit 0 | 21 s |
| `vitepress build` (cold) | **exit 0** | 31.9 s |
| `vitepress build` (warm) | exit 0 | 22.3 s |
| `node apps/docs/scripts/report-size.mjs` | 20.67 MB / 494 files | — |

### 7a. Build stats, against D1's

| Measure | D1 | D2 | Δ |
|---|---|---|---|
| generated markdown | 146 files, 786,593 B | **152 files, 1,914,163 B** | +6 files, +1,127,570 B |
| mean component page | ~5.4 KB | **12.4 KB** | the evidence section is ~7 KB/page |
| evidence pages | — | **6 files, 93,225 B** | `capability-matrix.md` is the largest at 42,856 B |
| static build | 16.04 MB / 476 files | **20.67 MB / 494 files** | +4.63 MB, +18 files |
| HTML pages emitted | 152 | **158** | +6 |
| `vitepress build` | 17.44 s | **22.27 s** | +4.8 s |
| local search index | 736,743 B, 1,051 sections | **1,542,784 B, 1,817 sections** | +766,041 B, **+766 sections** |
| `validate:all` links | 33 | **33** | unchanged — deliberately, see below |

**No validator was added, and that is a decision rather than an omission** — the
reasoning is in §9a. **B7 stands at exit 0, 33 links.**

### 7b. Search, verified rather than assumed

The built MiniSearch index, queried by anchor:

```
documents indexed: 1817          (D1: 1051)
#accessibility-and-evidence      144   ← one per public component
#wcag-2-2-criteria-in-scope*     144
#keyboard-interaction            144
#assistive-technology            145   ← 144 components + the /evidence/at-matrix page
#evidence-cells*                 144
sections under /evidence/         46
```

Every component's evidence section is independently searchable, and so is every
heading on the six evidence pages — including
`/evidence/accessibility#why-this-site-reads-the-raw-scaffold-and-not-the-summary-cell`,
which is the disclosure the whole AT lane hangs on.

### 7c. What the evidence layer actually publishes

| | |
|---|---|
| capability cells rendered | **1,661** over 144 components and 23 kinds of evidence |
| …by state | `pass` 597 · `present` 534 · **`unrun` 506** · `excepted` 13 · `stale` 11 |
| kinds with at least one gap, named on the page | **14** |
| the five largest `unrun` populations | `at-manual` 89/89 · `controlled-uncontrolled` 88/89 · `axe` 84/144 · `rtl-contract` 81/89 · `keyboard-spec` 58/89 |
| AT cells | **0 executed of 534** — 89 components (67 B · 21 C · 1 D) × 6 pairings |
| AT scripts on disk | **22 of 89** components have one |
| WCAG dictionary | 38 criteria; **5 apply to no component at all** (F-5) |
| components with no APG pattern | **73 of 144** — 62 `none`, 11 `custom`, **0** `custom` without a written reason |
| open WCAG 2.2 AA gaps | **1 criterion, 3 components** — SC 2.5.7 on `DzResizable`, `DzSplitter`, `DzTable` |
| measured security deviations surfaced on component pages | **12 over 6 components**, all 6 of which read `url-policy: present` in the matrix (F-8) |
| anatomy declarers named on the styling statement | **8 of 144** |
| `ui`-prop declarers named | **4 public components + 1 compound part** (F-3) |

---

## 8. Screenshots — a Tier C component's evidence section

Captured from `vitepress preview` against the built site (`chromium` via
Playwright `1.61.1`, 1280 px, `deviceScaleFactor: 2`), written to
`docs/program-2026-09/reports/assets/N2-D2/`.

| File | What it shows |
|---|---|
| `DzTable-evidence-full.png` | **The whole *Accessibility and evidence* section of `DzTable`**, 1,248 x 10,732 px. Tier C, `drags` + `dataset`, and one of the three components with the open SC 2.5.7 gap — so a single screenshot exercises every honest state this packet can render: an `unrun` cell, a measured WCAG failure, a *"not yet derived"* keyboard section and six `unrun` AT pairings. |
| `DzTable-evidence-viewport.png` | The same page at the top, for the standing note in context. |
| `evidence-hub.png` · `evidence-accessibility.png` · `evidence-at-matrix.png` · `evidence-browser-support.png` · `evidence-styling-posture.png` · `evidence-capability-matrix.png` | The six generated pages. |

What the `DzTable` capture shows, in order: the standing note (`locally
qualified`, both `sourceCommit`s); tier / APG link / traits / boundary / anatomy
/ component commit; the pattern justification; the compound-sub-parts warning;
the **22-criterion** WCAG scope table with every SC linked to its Understanding
document; the **`::: danger` SC 2.5.7 gap block**; the keyboard section reading
**Not yet derived**; the AT table with **0 of 6** and six `unrun` rows; the
**18-cell** evidence table with `controlled-uncontrolled` and `at-manual` in
bold `unrun`; the named-gaps line; and the paragraph stating that the page does
not rely on the `at-manual` summary cell.

**The preview server was stopped, and stopping it took two attempts.** N1-O6's
finding **J7(c)** was a stale `vite preview` still holding port 6106 after the
task that started it had ended. The same thing happened here: killing the shell
that launched `vitepress preview --port 4319` left the child **still serving —
`curl` returned 200 after the parent was gone**. The listener had to be found by
port and terminated by PID. Port 4319 now answers nothing. Recorded because J7(c)
was written down and still caught this packet.

---

## 9. Aggregate qualification — what ran, and what is still red

| Gate | Result | Note |
|---|---|---|
| `yarn lint` (`packages/ apps/`, `--max-warnings 0`) | **exit 0** | Includes the five new `packages/tooling/src/docs/*` files and the changed `apps/docs` files (**B6**). The six generated evidence pages fall inside D1's existing generated-page ignore. |
| `yarn typecheck` (core, via `validate:all`) | exit 0 | |
| `tsc -p packages/tooling/tsconfig.json` | **exit 2 — 7 errors, none in `src/docs/`** | `perf-bench.spec.ts` x2, `accept-visual-baseline.ts` x2, `story-dod-triage.ts`, `at-matrix.spec.ts`, `story-dod-tiers.spec.ts`. Identical to the list D1 reported. Pre-existing; **B-A1-F7** / A1-D4 / A2-F-10 / A3-F-6 / D1 §9. **Checked by hand, because a green `yarn typecheck` proves nothing about this package.** |
| `yarn validate:all` | **exit 0, 33 links** | §9a. |
| `yarn test` | **red — exactly the two pre-existing failures** | §9b. |
| `vitepress build` | **exit 0**, 22.3 s warm / 31.9 s cold | Run directly: `yarn workspace @dzup-ui/docs build` resolves through a global Yarn 1.x on this host and refuses; the underlying command is identical. |

### 9a. `yarn validate:all` — exit 0, 33 links, unmoved

Link 23 is `validate:docs-pages`, and it now reports the evidence arithmetic:

```
✓ docs pages fresh — 144 component pages + index + 6 evidence pages + nav,
  rendered from packages/core/docs/component-meta.json
  evidence: 1661 capability cells (506 unrun, 11 stale) · AT cells executed 0/534
```

**B7 stands at exit 0 with 33 links.** No validator was added, and that is a
decision rather than an omission: the three evidence gates live inside
`generate-docs-pages.ts`, which *is* `validate:docs-pages`, so they already fail
the aggregate gate and already fail the site build. A `validate:evidence` beside
it would re-read the same artifacts to gate nothing new, and would give **B7** a
fourth number to track.

### 9b. Test-count movement, measured A/B

```
packages/tooling with    evidence.spec.ts : 815 passed | 2 failed | 1 todo  (818)
packages/tooling without evidence.spec.ts : 772 passed | 2 failed | 1 todo  (775)
                                            --- exactly +43, nothing removed
```

The two failures are **B5**'s, in both runs: `landing-token-fallbacks` (six
hard-coded colour fallbacks in the landing themes page disagree with their
tokens) and `story-dod-tiers > countOpen > subtracts a waiver` (N1-O1's own
success broke its fixture). Neither is this packet's and neither was touched.

Full suite: **8,907 passing / 2 failed / 2 skipped / 1 todo (8,912 total)** over
492 files, 389.6 s.

**Stated rather than reconciled:** D1 recorded `packages/tooling` at **768**
passing and the full suite at **8,860**; the same tooling subset *without* this
packet's spec measures **772** here, and 8,860 + 43 = 8,903 ≠ 8,907 — the same
4-test difference, which places it inside `packages/tooling` and *before* this
packet's spec existed. The delta this packet is responsible for is **+43**,
measured A/B on one tree in one sitting. Reconciling the other 4 would mean
re-running on a tree this packet cannot restore. Reported, not absorbed — the
same posture D1 took with its own 5-test discrepancy.

### 9c. Maturity level reached

`specified -> implemented -> **focused-validated** -> aggregate-qualified`.

The evidence layer is **locally qualified, worktree-dirty**: built once, on one
machine, on a tree carrying five uncommitted programs. It is **not** CI
evidence, **not** release evidence, and **not deployed** — no hosting, no DNS, no
CI job, no `build:registry` run.

And the content it publishes inherits that standing *twice over*: the evidence it
renders was itself produced by local runs on a dirty tree (N1 owner decision #1).
The page says so, in a sentence composed from the artifacts' own `admissibility`
and `worktreeDirty` fields rather than typed by this packet.

---

## 10. Findings

Ten. Rendering every evidence cell of every component turned out to be a good
instrument for the same reason the extraction was: it forces every field of every
artifact through one code path, and a field that cannot express the truth stops
being a schema detail and starts being a page that would mislead somebody.

| # | Finding | Consequence |
|---|---|---|
| **F-1** 🔴 | **The repository has no machine-readable keyboard table, and the thing that looks like one is a boolean.** `keyboard-spec` is resolved by testing the unit spec against `/Arrow(?:Up\|Down\|Left\|Right)\|['"]Tab['"]\|['"]Escape['"]\|['"]Enter['"]\|keydown/`. It records *that* a key name appears in a spec file — never which key, on which element, does what. The two other candidates are worse: `anatomy.rtl.keyboard` is `'swap-horizontal' \| 'none'` on 8 components, and `at-scripts.data.ts`'s keystrokes are APG-derived *expectations for a human tester*, explicitly *"NOT from what the component currently does"*. | **144 of 144 pages say "not yet derived"** — the task's own prescribed outcome, and the largest single honest-state population on the site. It is also the biggest gap between what this library measures and what the 2026 docs bar expects. Closing it means a new generated field — plausibly an `interactions` block in the anatomy files, asserted by the contract spec so a published table and the behaviour cannot diverge. -> ranked next packet. |
| **F-2** 🔴 | **No browser target is declared anywhere in the repository.** Measured, not assumed: no `browserslist` in any `package.json` and no `.browserslistrc` (the only match in the tree is a transitive entry in `yarn.lock`), no `build.target` in any Vite config, no Baseline tier in any document, no "supported browsers" statement anywhere. The engine lane measures three engines exhaustively and nothing says which browsers the library *supports*. | The task asked for *"Baseline Widely Available + the actual engine-lane evidence state"*. The second half is generated and published in full; **the first half is `[!owner]` and claims nothing**, because adopting a tier is a commitment that would oblige the library to refuse features below it and to gate that refusal, and no repo fact supports the claim today. The stop condition fired and was honoured. -> owner decision **D2-D1**. |
| **F-3** 🔴 | **`non-drag-alternative` cites WCAG 2.5.7 and does not measure it — and it disagrees with the measured audit on 4 of 9 drag surfaces.** The cell's own note reads *"The component drags and its spec asserts no keyboard equivalent (WCAG 2.5.7)"*, but a keyboard equivalent satisfies **SC 2.1.1**; SC 2.5.7 requires a **single pointer without dragging**, which keyboard operation does not provide. Measured side by side: `DzTable` reads **`present`** and **does not meet 2.5.7**; `DzSlider` and `DzRangeSlider` read **`unrun`** and **do meet it**; `DzResizable` and `DzSplitter` read `unrun` and are gaps for an unrelated reason. | A reader of the capability matrix alone would conclude `DzTable`'s dragging criterion is satisfied and the sliders' is not, and both halves are wrong. This is why the SC 2.5.7 position needed its own register (§5) rather than a cell — and it is a third instance of the class N1-O2's **E3** and N1-O4's **§6.2** belong to: **a generator that reports on a proxy and labels it as the thing.** Fixing the note is one line; fixing the *measurement* means deciding what a `non-drag-alternative` cell is for -> owner decision **D2-D2**. |
| **F-4** 🟠 | **`url-policy` reads `present` on all six components that carry measured, high-severity, unfixed URL deviations.** N1-O5's `security-deviations.json` records **12 deviations over 6 components** (`DzButton`, `DzAnchor`, `DzBreadcrumb`, `DzMenu`, `DzMegaMenu`, `DzSidebar`); every one of the six has `url-policy: present` in the capability matrix, because `present` means *an artifact exists and is bound to this component* — and it does: the artifact is the spec that **measured the failure**. | *A corpus that runs is a different fact from a corpus that passes*, and the matrix has no way to say which. Handled on the page by rendering the deviations in a `::: danger` block directly under the evidence table, with severity and `publicBehaviourChange`, so the two facts arrive together. The matrix itself still cannot express "measured and failing" — the same missing `fail` state as **B-N1-AT**, reached from a third direction. |
| **F-5** 🟠 | **Five of the 38 published WCAG criteria apply to no component at all**: 1.3.4 Orientation (AA), 2.3.1 Three Flashes (A), **2.5.2 Pointer Cancellation (A)**, 2.5.4 Motion Actuation (A), **3.3.3 Error Suggestion (AA)**. | Two of them are hard to believe. **2.5.2 Pointer Cancellation** governs whether an action fires on the down-event rather than the up-event — it applies to every button in the catalogue and to all nine drag surfaces. **3.3.3 Error Suggestion** applies wherever an error is detected and a correction is known — the library has a whole form system and scopes **14** components for 3.3.1 Error Identification. This was invisible until something rendered the dictionary against the assignment; it is now a table on `/evidence/accessibility` that says `0 of 144` in public. Either the assignment has a gap or the dictionary carries criteria the library genuinely cannot fail, and only a human can say which -> owner decision **D2-D3**. |
| **F-6** 🟠 | **`eslint --fix` silently rewrote two authored strings in this packet's own source.** `test/prefer-lowercase-title` turned the test name `'REFUSES the N1-O4 defect...'` into `'rEFUSES the N1-O4 defect...'` — it lower-cases the first character only, so an emphatic capital became a typo. `jsdoc/no-multi-asterisks` ate the opening asterisk of `*disappearing*` in a JSDoc comment, leaving `disappearing*` and broken emphasis. Both were caught by reading the diff, not by a gate. | **Fourth sighting of the class**: A1's **F8** (`regexp/use-ignore-case` would have changed a published JSON Schema pattern), A3's **F-7**, D1's **F-5** (`perfectionist/sort-imports` would have made the documented install order wrong). The mitigation that worked is the one D1 implied: `statements.ts` — the file where a rewrite would actually reach readers — was **diffed byte-for-byte before and after the autofix and is unchanged**. That check should be routine for any packet that runs `--fix` over authored prose. |
| **F-7** 🟠 | **The AT matrix has two granularities, and the smaller one is what the capability matrix publishes.** The capability matrix carries **one `at-manual` cell per component (89)**; the scaffold carries **534** `{component, pair}` records, and the per-pair detail survives only in the cell's `note` string. Separately, **67 of the 89 components that owe a run have no executable script**: scripts were authored for the 22 Tier C/D components, so Tier B — 67 components, **402 of the 534 cells** — has none. | The site renders the 534, because that is the honest number, and states script coverage on `/evidence/at-matrix`. But a first AT wave against Tier B has no script to follow, and the scaffold *"declares no tier-differentiated pairs — Tier D owes exactly what Tier B owes"* (N1-O4), so Tier B's 402 cells are formally owed and practically unstartable. |
| **F-8** 🟢 | **The ledger's `ui`-prop pilot count is 5; the catalogue says 4 public components and 1 compound part.** `DzButton`, `DzInput`, `DzSelect` and `DzTable` declare a `ui` prop; the fifth declarer is **`DzDialogContent`**, a compound part of `DzDialog` — so `DzDialog` itself does not have one. | The ratchet reads *"`ui` prop adopted / 144"*, and 144 is the public-component denominator, so the numerator should be **4**. N2-S1 owns the ratchet and should book from 4, or its first slice books a phantom −1 — the same shape as **B2**'s anatomy ceiling. The styling statement publishes both numbers separately for exactly this reason. |
| **F-9** 🟢 | **73 of 144 public components map to no APG pattern** — 62 declared `none`, 11 declared `custom`. **All 11 `custom` declarations carry a written reason**, which the validator requires and which their pages now print. | The good half: the justification rule is being honoured, and rendering it turns a schema rule into published prose a reader can judge. The other half: 62 components have no external keyboard contract to be held to, so for them *"not yet derived"* (F-1) is not only unmet — it has nothing to point at. |
| **F-10** 🟢 | **The site is now 20.67 MB and still has no size gate.** D1's **F-4** measured 16.04 MB and recorded that neither existing budget (`storybook-static` 25 MB, the landing chunk budgets) can reach `apps/docs/.vitepress/dist`. This packet added **+4.63 MB (+29 %)** — the evidence section is ~7 KB of markdown per component page — and the offline search index **doubled**, 736,743 B -> 1,542,784 B, because every evidence heading is indexed. | The growth is the payload, not waste, and D1's `report-size.mjs --max-mb` is still the ready mechanism. But two packets have now grown an ungated artifact, D3 (playgrounds) will grow it again, and the search index is downloaded by every visitor. -> owner decision **D1-D4**, restated with a second data point. |

---

## 11. Ratchet movements

| Ratchet | Old | New | Note |
|---|---|---|---|
| `validate:all` links | **33** | **33** | **Unmoved deliberately.** The three evidence gates run inside `generate-docs-pages.ts`, which is already link 23 (`validate:docs-pages`). A second entry point re-reading the same artifacts would gate nothing new and would give **B7** a fourth number to track. |
| **capability cells rendered on the public site** | *(uninitialised)* | **1,661 / 1,661** | New. Every cell of every public component is on the page it belongs to. |
| **`unrun` cells published by name** | *(uninitialised)* | **506** | New — a ratchet that should fall, not a badge. `at-manual` 89 · `controlled-uncontrolled` 88 · `axe` 84 · `rtl-contract` 81 · `ssr-sample` 62 · `keyboard-spec` 58 · `data-scenarios` 22 · `portal-hydration` 10 · `unit-spec` 4 · `non-drag-alternative` 4 · `contract-spec` 2 · `story-light-dark` 1 · `browser-play` 1. |
| **`stale` cells published by name** | *(uninitialised)* | **11** | New — all `perf-baseline`, which N1's finding F5 records as legitimately stale until a perf re-run. |
| **`excepted` cells published with their reason** | *(uninitialised)* | **13** | New. An exception is visible with its reason attached, never deleted. |
| **AT cells executed / 534** | 0 | **0 — unmoved, and now published per pairing on 89 component pages and on `/evidence/at-matrix`** | N1-O4's `[!]` number, made public. |
| **components whose page carries an APG link** | *(uninitialised)* | **71 / 144** | New. The other 73 declare `custom` or `none` and are told so, never linked (F-9). |
| **`custom` patterns published without a reason** | *(uninitialised)* | **0 / 11** | New — held at zero by the existing quality-matrix rule; the page now shows the reason. |
| **open WCAG 2.2 AA criteria** | *(uninitialised)* | **1 criterion · 3 of 9 drag surfaces** (SC 2.5.7) | New (§5). Downward-only ceiling **3**, gated against the generated `drags` trait. |
| **components whose page renders a measured security deviation** | *(uninitialised)* | **6** (12 deviations) | New (F-4). Falls when N5-02 closes the URL policy. |
| **WCAG criteria applying to no component** | *(uninitialised)* | **5 / 38** | New (F-5). Should fall as the assignment is reviewed — or the dictionary should shrink. |
| **metrics hand-typed into a published statement** | *(uninitialised)* | **0** | New, and enforced: `evidence.spec.ts` scans every string in `statements.ts` for a digit run or an English number word. Six allowlist entries, each with a reason; **the gate fired on five sentences on its first run** and all five were rewritten rather than allowlisted. |
| `packages/tooling` tests | 768 | **811** (+43) | `evidence.spec.ts`; A/B measured, nothing removed. |
| **static-artifact size gates in the repo** | 2 | **2 — unmoved, and still the finding** | The docs site is now 20.67 MB (D1: 16.04 MB) and covered by neither (F-10, owner decision D1-D4). |
| A2's nine extraction ratchets · A3's four llms ratchets | at ceiling | at ceiling | Unmoved. This packet reads artifacts and regenerates none of them. |
| anatomy non-declaring | 136 | 136 | N2-S1 owns it. The styling statement names the 8 declarers and states that the other 136 have **not declared** parts. |
| `ui` prop adopted / 144 | 5 | **4 public + 1 compound part** | Not a movement — a **correction** (F-8). N2-S1 should book from 4. |

---

## 12. Unresolved owner decisions

| # | Decision | Why it is the owner's |
|---|---|---|
| **D2-D1** | **Adopt a browser-support target, or keep publishing none?** There is no `browserslist`, no build `target` and no Baseline tier anywhere (F-2). Adopting **Baseline Widely Available** would oblige the library to refuse features below the tier and to gate that refusal; the engine lane already demonstrates it in practice. | A public commitment, not a measurement. The page says so and claims nothing. |
| **D2-D2** | **What is a `non-drag-alternative` cell for?** It cites SC 2.5.7, measures a keyboard path (SC 2.1.1), and disagrees with the measured audit on 4 of 9 surfaces (F-3). Fixing the note is one line; fixing the measurement means deciding whether the cell tracks 2.1.1, 2.5.7 or both — and 2.5.7 has no automatable signal. | Changing what an evidence kind means changes what every drag component owes. |
| **D2-D3** | **Five WCAG criteria apply to no component** (F-5), including 2.5.2 Pointer Cancellation and 3.3.3 Error Suggestion. Widen the assignment, or record why the library cannot fail them. | Adding a criterion to a component adds an obligation, and the table is now public. |
| **D2-D4** | **`CellState` has no `fail` value, and three independent lanes now need one.** B-N1-AT (a failed AT run reads `pass`), F-3 (a component that fails 2.5.7 reads `present`), F-4 (a corpus that measured a failure reads `present`). This packet routed around all three — the AT state is read raw, and the other two got registers — but registers are a workaround. | A schema change five packets read. It is N1 owner decision #2, and it is now three decisions rather than one. |
| **D2-D5** | **Should `/evidence/` be the site's front door?** It is currently a nav entry beside Guide and Components. The argument for promoting it is the whole thesis of this lane; the argument against is that a first-time visitor meets 506 `unrun` cells before a single component. | Positioning, and it interacts with **D1-D3** (does this site replace Storybook). |
| **D2-D6** | **Is publishing the summariser defect the right call?** `/evidence/accessibility` states plainly that the capability matrix would summarise an all-failed AT run as a pass. It is the honest thing, and it is also a public description of an internal defect. | A disclosure decision. The alternative — fix the cell first, then publish — is strictly better and is **D2-D4**. |
| **D2-D7** | **Deploy? Same answer as D1-D2, with more at stake.** The evidence layer is the credibility payload and it exists only on one developer's disk. It is also the surface where deploying stale content would do the most damage. | README §3 `<authority>` names deployment explicitly, and **A2-D6 / A3-D2** are still open. |

---

## 13. Ranked next packet

1. **Fix `at-manual` cell resolution (D2-D4 / N1 owner decision #2).** It blocks
   the first AT wave, and the tripwire this packet added only stops the *site*
   publishing the lie — it does not stop the matrix telling it. Repairing it
   probably means adding `fail` to `CellState`, which also gives F-3 and F-4
   somewhere to live.
2. **Correct `non-drag-alternative`'s note (F-3) — one line**, so the matrix
   stops citing a criterion it does not measure; decide **D2-D2** separately.
3. **Review the five zero-scope WCAG criteria (F-5).** Cheap, and 2.5.2 Pointer
   Cancellation applying to no component in a library with nine drag surfaces is
   the kind of gap a procurement reviewer finds first.
4. **A machine-readable keyboard contract (F-1).** The largest gap between what
   this library measures and what a 2026 docs site is expected to show. An
   `interactions` block in the anatomy files, asserted by the contract spec,
   would make 144 keyboard tables generated *and* gated in one move — and would
   be the first thing on this site competitors cannot match by writing prose.
5. **AT scripts for Tier B (F-7)** — 67 components, 402 of the 534 cells, with no
   script to follow.
6. **A size ceiling for `apps/docs` (F-10, D1-D4)**, now with two data points.

---

## 14. The D3 seam — playgrounds and the theme builder

**What D3 gets that D1 did not offer it.** Everything in D1 §15 still holds
(global component registration, one line in `renderComponentPage`, the escaper
must be extended and not disabled). Three additions from this packet:

1. **`escapeForVue` is now load-bearing for far more content.** The evidence
   sections push artifact `note` strings, WCAG criterion names, security
   deviation reasons and the SC 2.5.7 audit prose through it. A `<br>` in a table
   cell was written and removed during this packet for exactly that reason — the
   escaper turns it into visible `&lt;br&gt;`. **D3 must add its component tags
   to an allowlist, not weaken the escaper**, and it now has more callers to keep
   working.
2. **The generated-directory boundary is a rule, not a convention.**
   `apps/docs/guide/` is hand-written; `apps/docs/components/` and
   `apps/docs/evidence/` are generated and both are swept for orphans. A
   playground page is one or the other, and if it is generated it must come out
   of `buildDocsPages()` or it fails the gate by design.
3. **The fingerprint now covers seven artifacts, and absence counts as change.**
   If D3 introduces a new input — a theme-recipe document, say — it belongs in
   `EVIDENCE_PATHS` (or an equivalent) so a stale or vanished input turns the
   build red rather than the page quiet.

**What D3 must not do with the evidence surface.** Do not summarise it into a
badge on a playground. The single most damaging thing available to this site is a
green tick over a component whose AT cells are `unrun`, and every gate in §6
exists to make that impossible *from the artifacts* — none of them can stop a
hand-written badge inside a Vue component.

**Where a playground would help this lane.** The keyboard gap (F-1) is the one
place where an interactive surface would produce real evidence rather than
prettier documentation: a playground that records which keys a component
actually handles is a *measurement*, and it is exactly the missing input a
generated keyboard table needs.

---

## 15. Every place a page says "unrun" or "not yet derived", and why

The orchestrator's requirement, as an explicit inventory.

| Where | Count | What it says | Why it says it |
|---|---|---|---|
| Keyboard section, every component page | **144 / 144** | *"Not yet derived."* | **F-1.** No machine-readable keyboard table exists; the only signal is a regex boolean. Hand-typing 144 tables would create the most-quoted, least-checkable content on the site. |
| AT section, every component that owes a run | **89** pages, **534** rows | *"0 of N AT/browser pairs executed"*, then one `unrun` row per pairing with an em dash for tester, date, versions and commit | **B-N1-AT.** No screen reader has been driven. `unrun` means the pairing was not available and was not attempted — printed with that sentence, because it is a different fact from a failure. |
| AT section, Tier A components | **55** pages | *"Tier A does not owe a manual screen-reader run"* | Not a gap: the matrix excludes Tier A. Said rather than left blank, so an absent table is never ambiguous. |
| Evidence-cell table, every component | **506 cells** | **`unrun`** in bold, plus the artifact's own note where one exists | `<evidence_rules>`: unrun cells stay visible. Each is also named in a line under the table. |
| Evidence-cell table | **11 cells** | `stale` | All `perf-baseline`; the artifact predates the component's last change. |
| Evidence-cell table | **13 cells** | `excepted`, with the recorded reason | An exception is visible with its reason attached, never deleted. |
| APG line and keyboard section | **73 / 144** | *"no WAI-ARIA Authoring Practices pattern describes this component"* | `custom` (11) or `none` (62). Linking `.../patterns/custom/` would be a 404 dressed as a citation. |
| Components with compound parts | every such page | *"Compound sub-parts are not matrix rows"*, naming them | N1-O5 **S4**: a parent can declare a boundary whose sink lives on a part, and the part has no row. |
| `DzAccordion`, `DzThemeProvider`, four bare compound parts | inherited from D1 | *"unknown — the extractor recovered nothing"* / *"No published example"* | D1's honest-rendering rules, unchanged and still rendering above the evidence section. |
| `/evidence/at-matrix` | headline | *"0 of 534 cells executed. That is the whole result."* | The catalogue-level form of the same fact. |
| `/evidence/at-matrix` | script coverage | *"22 of 89 components have an executable script"* | F-7. Tier B's 402 cells have none. |
| `/evidence/capability-matrix` | 14 kinds | every `unrun` and `stale` component named inside a `::: details` block | A count without names is the shape of evidence that stops being read. |
| `/evidence/accessibility` | scope table | `0 of 144` on five criteria | **F-5**, published rather than hidden. |
| `/evidence/accessibility` | automated lane | *"bound to 60 of 144 components; 84 have none"* | Published as coverage, never as conformance. |
| `/evidence/accessibility` and `/evidence/at-matrix` | the disclosure | *"A known defect in the summariser, disclosed rather than inherited"* | **B-N1-AT**, stated in public rather than quietly worked around. |
| `/evidence/browser-support` | the Baseline block | `[!owner]` — *"This page will not claim a tier the repository does not declare."* | **F-2.** |
| `/evidence/browser-support` | the WebKit block | *"No result on this page is evidence about Safari."* | **B-N1-E5.** Playwright's WebKit on Windows is WinCairo reporting a macOS UA. |
| `/evidence/browser-support` | the history block | the partial chromium record and the reflow harness defect, named | **B-N1-E2.** The "46" was always a partial number, and a share of the reflow entries were a harness defect. Published rather than summarised away. |
| `/evidence/browser-support` | conditional | *"No engine-lane record exists in this checkout"* | Not rendered today (the record is present) but proven by unit test and by seed **S9**. N1's **F4**: the record is git-ignored, and a site that renders confidently around its absence repeats that defect. |
| `/evidence/styling-posture` | rollout note | *"136 component pages print nothing under parts"* | *Has not declared parts* is not *has no parts*. |
| Every evidence page and every component evidence section | **150** places | *"locally qualified ... not CI, not release, not production evidence"* | Composed from the artifacts' own `admissibility` and `worktreeDirty` fields, never typed. |

---

## 16. Live defects inherited, re-stated as required

**B-A2-D6 / B-A3-D2 / B-D1-D2 remain open, and this packet raises the stakes
rather than the risk.** `apps/landing/scripts/build-registry.ts` `rm -rf`s and
rewrites 282 tracked files, so it has deliberately never been run:

- `/r/component-meta.json` still **404s in production**, so `@dzup-ui/mcp`'s
  metadata tools work locally through the source fallback and fail over HTTP.
- The Storybook build has not been run either, so **production still serves the
  pre-A3 `llms.txt`**, and MCP clients over HTTP still see 101 of 144 components.

**What this packet adds:** the evidence layer reads `packages/core/docs/*.json`,
`e2e/at-matrix/index.json`, `e2e/matrix/*.json` and
`packages/core/security/security-deviations.json` **directly at build time and
never a site path**, so it introduces no new dependency on the un-runnable
script. But it is now the case that the library's most credible public asset — a
published, honest, per-component evidence surface — exists only on one
developer's disk.

**`build:registry` was not run** (B-A2-D6). **`generate:exports` was not run**
(B3); `public-api.manifest.json` is byte-unchanged and this packet never reads
it. **Nothing was deployed, hosted, published or dispatched.**

---

## 17. Custody

- **Nothing committed, pushed, stashed, reverted or cleaned.** The worktree was
  dirty with 179 entries at run start; it is 180 now, the difference being the
  one new file in a tracked directory, `packages/core/docs/wcag-deviations.json`.
- **Nine seeded failures, all restored and verified by hash** — 152 generated
  files and 6 artifacts `sha256sum -c` clean, and `validate:docs-pages` green
  afterwards.
- **`eslint --fix` was run once** over `packages/tooling/src/docs` and
  `apps/docs`, and `statements.ts` — the file holding the authored prose — was
  **diffed before and after and is byte-identical**. F-6 explains why that is not
  paranoia.
- **No Playwright test run was invoked**, so `test-results/matrix-report.json` is
  untouched (**B4**). The screenshots were taken by a standalone script driving
  `chromium` against `vitepress preview` on port 4319; the server **survived its
  parent shell** (N1-O6 **J7(c)** again — `curl` returned 200 after the parent
  was gone) and was terminated by PID. **Port 4319 answers nothing.**
- **Storybook and `apps/landing` are untouched** — no file under either was
  modified.
- Scratch files were written to the session scratchpad. The only additions inside
  the repository are the five `packages/tooling/src/docs/*` modules,
  `packages/core/docs/wcag-deviations.json`, the six generated
  `apps/docs/evidence/*.md`, this handoff and its eight screenshots.
