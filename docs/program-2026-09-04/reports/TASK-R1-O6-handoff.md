# TASK-R1-O6 — the icon library resolves twice, and nothing could see it until now

> **Packet:** TASK-R1-O6, `docs/program-2026-09-04/release-exit-tasks.md`
> ("Peer and dependency hygiene execution", 🟢 `[!owner]`).
> **Repository:** `ui/dzup-ui` on `main` @ **`527dbd1`** — **not `99b963a`** as
> the task file's baseline says. `git rev-parse HEAD` re-verified at session
> start. The worktree carried **266 uncommitted paths** from TASK-R1-O1…O5 when
> this packet started; **nothing belonging to another packet was reverted,
> stashed, cleaned or committed.** `yarn.lock` was not touched.
> **Everything below is a local run on 2026-09-21.** Locally qualified. Not CI,
> not release, not production evidence.
> **Deliverables:** [`peer-hygiene-decisions-2026-09.md`](./peer-hygiene-decisions-2026-09.md)
> (the four-item memo) · [`icon-swap-contract-2026-09.md`](./icon-swap-contract-2026-09.md)
> (the swap contract, codemod and measured deltas).
> **Nothing was executed.** No recorded owner decision authorises the swap or
> the `apps/sandbox` removal — see §5.

---

## 1. Headline

The packet was asked to prepare four decisions and build one gate. The gate is
built, it is **red**, and it is red for the reason the brief predicted — which
makes this the first `_Gap:_` preamble of the day whose central claim survived
measurement intact.

Everything around that claim did not.

| # | Premise as handed to this packet | Measured at `527dbd1` |
|---|---|---|
| 1 | "`lucide-vue-next@0.477` is deprecated upstream in favour of `@lucide/vue` **1.0**" | **True, and the version is wrong.** `@lucide/vue` is at **`1.47.0`**, 47 minors past the number N5-04 recorded and the prepared diff pins. `lucide-vue-next`'s own `latest` is `1.0.0` — the two `1.0`s in the record are **different packages** |
| 2 | "two versions are installed and no gate notices" | **True by two independent routes**, and still true 18 days later. Lockfile: `0.475.0` + `0.477.0`. Disk: root `node_modules` holds 0.475.0, `packages/core/node_modules` holds 0.477.0 |
| 3 | "`report:peer-surface` exists and is report-only" | **True** — `exit 0` always, no baseline, deliberately outside `validate:all`, and it says so in its own `//` doc string |
| 4 | "`apps/sandbox` was retired and is still a live workspace" | **True, and understated in both directions.** It is a live workspace *and* it has a declared **production deployment** whose domain **resolves** and answers 503 behind an untrusted certificate. And the "retired 2026-06-09" date two files repeat is **stale by 11 weeks**: `git log -1 -- apps/sandbox` → `7984c68`, **2026-08-25** |
| 5 | (not claimed) — the swap's cost | **The swap ADDS ~1,068 gzip bytes**, roughly doubling the library's icon cost, because 1.x carries a much larger shared runtime. N5-04's *"do not argue this on bundle size"* framing is reversed |
| 6 | (not claimed) — the swap's blast radius | **All 18 rendered `<svg class>` values change**, 3 glyphs are redrawn, and 1.x emits **`aria-hidden="true"` by default**. N5-04 called the swap a `patch`; this packet says **`minor`** and shows the measurements |
| 7 | (not claimed) — how many declarers there are | **Three is wrong; there are five surfaces**, and two of them no gate in this repository could reach. §3.3 |

**Implemented:** one gate (5 hard clauses, 3 report clauses, `--self-test`,
`--json`), joined to `validate:peers`; one codemod with 7 fixtures; **44 new
tests**. **Prepared, not applied:** every `package.json` change, the codemod
run, the floor move, the workspace removal.

---

## 2. Done-check: 0 of 4, and clause 1 is a counting trap

Run first, exactly as written (README §4).

| # | Check | Expected | Actual | Verdict |
|---|---|---|---|---|
| 1a | `yarn why lucide-vue-next \| grep -c 'lucide-vue-next@'` | `0` (swapped) or `1` (single version) | **5** | **FAIL** |
| 1b | `grep -c '@lucide/vue' packages/core/package.json` | `1` if swapped | **0** | **FAIL** |
| 2 | a gate exists that fails on two installed icon-library versions (`grep -rn 'icon' packages/tooling/src/validators/*peer*`) | a hit | **no output** — the only `*peer*` validator was `peer-ranges.ts` | **FAIL** |
| 3 | `ls docs/program-2026-09-04/reports/ \| grep -i 'peer-hygiene'` | a decision memo | **grep exit 1**, no such file | **FAIL** |
| 4 | `ls apps/ \| grep -c sandbox` | `0`, or the memo records a keep decision | **1**, and no memo existed | **FAIL** |

None pass → run the task (README §4.3).

**Clause 1 is the trap this programme keeps finding.** `yarn why` prints **one
line per importer**, not one per version: three `@dzup-ui/core` workspace
instances plus `@dzup-ui/landing` plus `@dzup-ui/sandbox` = 5. A result of `1`
would have meant *one importer*, which is not the property the check claims to
test, and a repository with one importer on two versions would have passed it.
The correct count is of **distinct resolved versions**, which is what the gate
this packet built does. Same class as R1-O4's `grep -E` false pass and R1-O5's
structurally-impossible assertion; third in a row.

---

## 3. Implemented files, and their API effect

| File | What it is | API effect |
|---|---|---|
| `packages/tooling/src/validators/peer-icon-duplicates.ts` **(new)** | The gate. Reads `yarn.lock` (what a consumer's CI installs from), attributes every range to its declaring workspace, reads the two surfaces the lockfile cannot see (§3.3), and cross-checks `node_modules` when present. **5 hard clauses** (`single-version`, `single-ident`, `declared-family`, `lockfile-coverage`, `shipped-manifest-ident`) **+ 3 report clauses** (`deprecated-ident`, `lock-vs-disk`, `shipped-manifest-range`/`generated-surface-drift`) + `--self-test` + `--json` | **New public tooling module.** `packages/tooling` is `private`, so no published surface changes |
| `packages/tooling/src/validators/peer-icon-duplicates.spec.ts` **(new, 25 tests)** | Drives `runSeeds()` — the same run the CLI exposes as `--self-test` — and asserts each defect is caught **by its own clause**, not merely by some clause | none |
| `package.json` | `validate:peers` → `tsx …/validate-peers.ts && yarn validate:icon-duplicates`; new standalone `validate:icon-duplicates`; two `//`-prefixed doc strings in the house style | **`validate:all` stays 50 links.** The second assertion joins the existing peers link rather than adding a 51st — deliberate, so the chain's link count keeps meaning what R1-O1…O5 recorded |
| `packages/tooling/package.json` | same pairing for the package-local `validate:peers`, so it cannot mean something different from the root one | none |
| `packages/codemods/src/transforms/swap-icon-library.ts` **(new)** | The codemod. Specifier rewrite + an inert identity `GLYPH_MAP`, plus the measured `REDRAWN_GLYPHS` / `ALIASED_GLYPHS` / `CLASS_RENAMES` constants the contract doc cites | **`@dzup-ui/codemods` gains 9 exports.** The package is `withheld` under `release-policy.json` and permanently unreleasable (N5-01 **D2**), so this is not a published API change |
| `packages/codemods/src/transforms/__fixtures__/swap-icon-library/` **(new, 11 files)** | 7 fixture cases; 5 with an `.output.*` sibling, 2 asserting *no change* | none |
| `packages/codemods/src/transforms/__tests__/swap-icon-library.spec.ts` **(new, 19 tests)** | Fixture-driven, plus an idempotence pass over every `.output.*`, plus assertions pinning the measured contract so the doc's numbers cannot drift from the code | none |
| `packages/codemods/src/index.ts` | re-exports the transform as `swapIconLibrary` | see above |
| `packages/codemods/bin/dzup-codemod.js` | registers `swap-icon-library`, **deliberately not in `all`** | CLI surface of a withheld package |
| `eslint.config.js` | ignores `packages/codemods/src/transforms/__fixtures__/**`, with the reasoning written out | none |
| `docs/program-2026-09-04/reports/peer-hygiene-decisions-2026-09.md` **(new)** | The four-item memo | — |
| `docs/program-2026-09-04/reports/icon-swap-contract-2026-09.md` **(new)** | The swap contract: mapping table, runtime deltas, bundle deltas, runbook | — |

### 3.1 Why the gate is a lockfile reader and not a `node_modules` reader

`node_modules` can be absent (fresh clone), pruned, or — as `test:min-peer`
does on purpose — temporarily pinned to a floor and restored. A lockfile is
what a consumer's `yarn install --immutable` reproduces. The gate reads the
lockfile and **reports** (does not fail on) any disagreement with what is
unpacked, which is a second route to the same fact rather than a second source
of truth.

### 3.2 Why the identity set is declared rather than discovered

`lucide-vue-next` and `@lucide/vue` are the same library under two names. A
half-finished swap leaves *one version of each*, which any per-package version
count calls clean. So the gate counts across a declared set — and guards the
declaration with a `declared-family` clause: any dependency whose name matches
`/(?:^|\/)lucide(?:-|$)|^@lucide\//` and is **not** in the set is an error that
says "add it to the identity set, or remove the dependency". Same reasoning as
`validate:registry` declaring its three registries: discovery cannot see an
absence.

### 3.3 The finding that came out of building it: there are five surfaces, not three

The `_Gap:_`, N5-04 and the first version of this gate all counted **three**
declarers — `packages/core`, `apps/landing`, `apps/sandbox`. Measuring the
repository for the memo turned up two more, and **neither is reachable from
`yarn.lock`**:

| Surface | Declares | Why nothing could see it |
|---|---|---|
| `apps/landing/playground-template/package.json` | `"lucide-vue-next": "^0.475.0"` | **Not a workspace.** The globs are `packages/*` and `apps/*`; this sits one level deeper, so it has no lockfile entry and `validate:peers` never reads it. It is the manifest a visitor **downloads and installs** |
| `apps/landing/public/r/*.json` | **40 of 89** registry items name it in `dependencies` **and** inline it in their copied source | Generated build output. `validate:registry` checks that every file resolves, that no item names Pro source and that nothing depends on a withheld package — but not *which* icon package the items hand out. A `shadcn add` **copies** that list into a consumer's repository, irrevocably (A4-F5) |
| `apps/landing/public/llms-full.txt` | **41** occurrences in code samples an MCP client reads | Generated; `validate:llms` gates freshness and structure, not dependency currency |

Two clauses were added for this, and the split between them is the point:

- **`shipped-manifest-ident` — error.** Fires when the playground template names
  an ident no workspace uses any more. That is *precisely* the "we swapped the
  three manifests and forgot the template" state, and **every other clause in
  this gate would call it green**: the lockfile would hold exactly one name at
  exactly one version. Seeded and proven.
- **`generated-surface-drift` — report.** The registry count. The fix is always
  "re-run the generator", never "edit the file", so failing on build output
  would be failing on the wrong thing — and it would break on a fresh clone,
  where `public/r/` does not exist. It reports 0 findings when the directory is
  absent rather than manufacturing one.

Both surfaces are now printed on every run under `shipped to consumers, not
installed here:`, so a swap cannot forget them by accident.

---

## 4. Focused validation

Read directly, never through a pipe.

| Command | Exit | Result |
|---|---:|---|
| `tsx packages/tooling/src/validators/peer-icon-duplicates.ts --self-test` | **0** | **6 of 6 seeded cases behaved**: `single-version`, `single-ident`, `declared-family`, `lockfile-coverage`, `shipped-manifest-ident` each caught by **its own** clause, and the clean control **passed**. A clause that cannot be made to fail — *or one that fires on a clean tree* — is not a gate |
| `tsx packages/tooling/src/validators/peer-icon-duplicates.ts` | **1** | `2 lockfile entries · 2 distinct versions · 1 name · 3 declarations`, plus the two shipped surfaces; `✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may` — naming `@dzup-ui/core (packages/core/package.json)`, `@dzup-ui/landing`, `@dzup-ui/sandbox`. Plus `! [deprecated-ident]` and `! [generated-surface-drift]` as report lines |
| `yarn validate:peers` | **1** | Peer ranges pass (**7 compatible, 0 warnings, 0 incompatible**), then the icon gate fails. Both halves run; the exit code is the second half's |
| `vitest run packages/tooling/src/validators/peer-icon-duplicates.spec.ts` | **0** | **25 passed** |
| `vitest run packages/codemods/src/transforms/__tests__/swap-icon-library.spec.ts` | **0** | **19 passed** |
| `eslint packages/ apps/ e2e/ --max-warnings 0` | **1** | **1 problem, and it is not this packet's** — see §6 |
| `yarn report:peer-surface` | **0** | Report-only, as the `_Gap:_` says — no baseline, no ratchet, outside `validate:all`, and its own doc string says so. It confirms this packet's inventory **from `dist/`** where everything above was measured from `src/`: the same 18 glyphs with the same per-glyph module counts, and `./inputs`, `./layout`, `./media` and `./providers` reaching **no** icon package at all |
| `yarn validate:package-names` | **0** | Re-run after §6.2's finding; 0 occurrences |
| `validate:{doc-snippets,readme-facts,adr-references,docs-pages,llms,release-policy,engines}` | **0** each | The seven links a new document or a `package.json` edit could disturb, re-run individually after the last doc change |
| `yarn validate:bundle-budget` | **0** | `2 passed, 0 failed, 1 skipped`. `packages/core/dist/index.js` 7.07 kB ≤ 150 kB; `packages/tokens/dist/tokens.css` 7.23 kB ≤ 15 kB; **`packages/core/dist/index.css` SKIP — file not found**. Recorded as the pre-swap baseline **with that caveat**: it covers 2 of its 3 budgeted files, so a post-swap comparison needs a fresh `yarn build` first |
| `yarn validate:licenses` (link 49) | **0** | `9 allowed, 0 blocked, 0 unknown`. Run directly, because the `&&` chain never reaches it — see §6.1 |
| `yarn validate:tree-shake` (link 50) | **0** | `DzButton 194.3 KB · DzInput 202.5 KB · DzSelect 212.1 KB · DzAlert 192.4 KB`, all pass. Same reason |

### 4.1 The seeded failure, in full

```
Icon-library duplication gate — seeded defects

  ✓ [single-version]         two versions of lucide-vue-next (the state at 527dbd1)
  ✓ [single-ident]           a half-finished swap: one version of each name
  ✓ [declared-family]        a lucide package the identity set does not know
  ✓ [lockfile-coverage]      a declared range with no lockfile entry
  ✓ [shipped-manifest-ident] the workspaces swapped and the playground template was forgotten
  ✓ [none]                   the control: one name, one version, fully covered,
                             template and registry agreeing

✓ all 6 seeded cases behaved: 5 defects caught by their own clause, 1 clean control passed.
```

The control is the half usually skipped, and it earned its place twice: it
caught a real bug during development (the lockfile's `npm:` protocol prefix made
every declared range look uncovered, so `lockfile-coverage` fired on a clean
tree), and it is what stops the two new shipped-surface clauses from firing on a
repository where the template and the registry agree with the workspaces.

### 4.2 The gate's live output — this is what red looks like

```
Icon-library duplication — TASK-R1-O6 (N5-04-F4)

  identity set: lucide-vue-next = @lucide/vue
  2 lockfile entr(ies) · 2 distinct version(s) · 1 name(s) · 3 declaration(s)
    lucide-vue-next@0.475.0        "^0.475.0"
    lucide-vue-next@0.477.0        "^0.477.0"
    @dzup-ui/core          dependencies      lucide-vue-next@"^0.477.0"
    @dzup-ui/landing       dependencies      lucide-vue-next@"^0.475.0"
    @dzup-ui/sandbox       dependencies      lucide-vue-next@"^0.475.0"

  shipped to consumers, not installed here:
    apps/landing/playground-template/package.json    lucide-vue-next@"^0.475.0"
    apps/landing/public/r/*.json                     lucide-vue-next in 40 item(s)

  ! [deprecated-ident] lucide-vue-next is deprecated upstream ("Package deprecated.
    Please use @lucide/vue instead."). TASK-R1-O6 decision item 1 decides the swap;
    this line is not a failure.

  ! [generated-surface-drift] 40 generated registry item(s) under apps/landing/public/r
    hand consumers a dependency on lucide-vue-next, which npm has deprecated.
    Consequence of the open decision, not a defect here.

✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0" by @dzup-ui/landing (apps/landing/package.json),
                                                          @dzup-ui/sandbox (apps/sandbox/package.json)
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core (packages/core/package.json)
```

---

## 5. What was deliberately NOT executed, and why

`<task>` says *"and where the owner has already decided execute"*.
`<stop_conditions>` says *"stop at the memo for any item the owner has not
decided"*. Both were tested rather than assumed:

- `docs/program-2026-09-04/EXECUTION-STATUS.md` — **no decided row** on any of
  the four; the TASK-R1-O6 row was `[ ]` and empty.
- `docs/program-2026-09/EXECUTION-STATUS{,-N2,-N5}.md` — no decided row.
- every `reports/*decision*.md` and `*packet*.md` in both programmes — six
  decision documents, none of them about lucide, the Node floor, `reka-ui` or
  `apps/sandbox`.
- **TASK-R0-O1**, the packet that would consolidate the ~125 open `[!owner]`
  items into a register, is still `[ ]`.

**No owner decision exists. Nothing was executed.** Specifically not done:

| Not done | Why |
|---|---|
| the `lucide-vue-next` → `@lucide/vue` swap | `[!owner]` — D174, and it needs a visual + AT re-baseline, which is an owner action under `<authority>` |
| aligning the two app ranges to `^0.477.0` (the two-line green path) | also a dependency decision (D175), and it rewrites `yarn.lock` — a shared file in a worktree with 266 uncommitted paths from five other packets. Pure churn if the owner takes the swap |
| `apps/sandbox` removal | `[!owner]` — D177, **and it is an infrastructure action**: the workspace has a declared production deployment whose domain resolves (§7.4). `<authority>` withholds deployment and DNS changes |
| the Node floor move | `[!owner]` — D176, and it needs an ADR-18 amendment **and** an ADR-20 §4 correction, both of which are TASK-R0-O2's |
| fixing `RTL_LANGUAGES`' two wrong entries | not this packet's file; it belongs to the provider lane (R5-O3/R5-O4). Recorded in the memo §3.4 so the floor decision is not sold on a benefit it does not deliver |
| `peerDependenciesMeta.optional` for `reka-ui` | **measurably worse than doing nothing** (N5-04-F2) and `validate:peers` would pass it. Recorded as the reopening condition instead |
| any commit, push, CI dispatch, publish, deploy, baseline replacement | `<authority>` |

---

## 6. Aggregate qualification

### 6.1 What ran

| Lane | Exit | Notes |
|---|---:|---|
| `yarn validate:all` (50 links) | **1** | Fails at **link 3, `yarn lint`**, for a reason that is not this packet's |
| `yarn lint` (link 3) | **1** | **1 error**, pre-existing — §6.2 |
| the other **49** links, re-run as one `&&` chain with `yarn lint` removed | **1** | **46 links green, then link 48 (`validate:peers`) fails on the new icon gate and nothing else.** The whole 417-line run contains exactly **one** `✗`, and it is `[single-version]`. Links 49 (`licenses`) and 50 (`tree-shake`) never started — `&&` — so both were run directly (§4) and both exit **0** |
| `yarn test` | **0** | **552 files · 10,478 passed · 0 failed** · 3 skipped · 1 todo (baseline at the start of this packet: 552 / 10,470 / 1 failed — and that one failure was **this packet's own handoff**, §6.2). The **+44** specs this packet added are inside that count |

The second row is the measurement that matters: with the one pre-existing lint
error removed from the chain, **every link this packet did not touch is green**,
and the only failure in the repository's aggregate is the defect this packet
built a gate to see. Selected confirmations from that run, quoted because they
are the links most likely to have been disturbed by a `package.json` edit:

```
✓ package-names: no retired package name outside history
✓ engines: floor "^20.19.0 || >=22.13.0" is declared consistently and every gate dependency satisfies it
✓ release-policy: `changeset status` assembles; 6 published, 2 withheld, 5 private of 13
                  workspace packages; 36 pending changeset(s), 0 major, 0 mixed
✓ readme-facts: 6 generated region(s) across the repository
✓ adr-references: 17 ADR(s) cited · 3 documented · 14 registry-only (ceiling 14)
Peer dependency validation passed.   ← the FIRST half of validate:peers, still green
Results: 7 compatible, 0 warnings, 0 incompatible
```

### 6.2 Pre-existing vs new — the one red link, attributed

```
packages/tooling/scripts/validate-engines.spec.ts
  92:61  error  The quantifier '\s*' can exchange characters with '\s*' …
                regexp/no-super-linear-backtracking
```

**Not this packet's.** That file is untracked at `527dbd1` (it arrives with
TASK-R1-O4's dirty work) and was edited immediately before this session by the
session owner to fix the one failing spec in `yarn test`. The fix landed a
regex that `regexp/no-super-linear-backtracking` rejects. This packet was told
explicitly not to re-fix that file and **did not**: it is reported here as
pre-existing red, in the class README §5 calls "report them as pre-existing, do
not fix them inside unrelated tasks, do not call the aggregate green over
them".

Consequence, stated plainly: **`yarn validate:all` cannot reach the icon gate
today**, because `lint` is link 3 and `validate:peers` is link 48. The gate's
red is therefore *measured directly* (§4) and by *re-running the chain without
that one link* (§6.1), rather than observed through the aggregate as shipped.
One `eslint --fix` on that one file would restore the chain.

**The aggregate also caught two defects in this packet's own work, which is the
argument for running it.** `yarn test` failed on **this handoff file**: it
quoted `validate:package-names`' own success line verbatim, and that line names
the retired package the gate exists to forbid — a gate that scans *documents*,
so a report about a green gate turned it red. One failed of 10,475; fixed by
paraphrasing instead of quoting, and the re-run is **552 files / 10,478 passed /
0 failed**.

The second: **eight lint errors in this packet's own files**, all fixed here — a
template literal in
`bin/dzup-codemod.js` terminated early on a backticked word inside it (a real
parse error, not a style finding); an export-order violation in
`codemods/src/index.ts`; a JSDoc asterisk; and three findings *inside the
codemod fixtures*, which is what prompted the `eslint.config.js` ignore entry
(§3). The fixture findings are the interesting ones: `perfectionist/sort-imports`
wanted to reorder an `.input.ts` file that exists to reproduce real, unsorted
source, and `style/semi` wanted to delete the trailing semicolon that the
`.output.ts` fixture records `recast` producing. An `--fix` there would not have
tidied the fixtures, it would have **falsified** them and turned the spec red.

### 6.3 New red this packet DID introduce, deliberately

`validate:peers` — link **48** — now exits **1**. It is not a defect in the
gate; it is the gate working. The duplication has existed since at least
2026-09-03 and `validate:all` has reported green over it ever since, because
`validate:peers` read `peerDependencies` only and `validate:externals` checks
that what `dist` imports is *declared*, not that it resolves once.

Three things make this honest rather than merely disruptive:

1. it is **declared** — the `//validate:peers` doc string in `package.json`
   says it is red today and names the decision (D174) that clears it;
2. it is **one decision away from green** — the memo's option (b) is two lines
   in two `package.json` files;
3. there is **no waiver mechanism**. An exceptions file for the exact defect the
   gate exists to catch would be the S1-F10 pattern again, and this packet did
   not build one.

### 6.4 The other route: self-check before finishing

`<success_criteria>` asks that the gate "reflects reality". Reality was
established twice before the gate was written and once after:

| Route | Says |
|---|---|
| `yarn.lock` block parse | 2 entries, 2 versions |
| `require('…/package.json').version` at both install sites | `0.475.0` (root) and `0.477.0` (nested under `packages/core`) |
| the gate's own `lock-vs-disk` report clause | **silent** — the lockfile and the disk agree, so no finding was manufactured |

---

## 7. The four decisions, in one screen

Full working in [`peer-hygiene-decisions-2026-09.md`](./peer-hygiene-decisions-2026-09.md).

### 7.1 Item 1 — the icon library (**D174**, **D175**)

18 identifiers, 22 modules, **0 renames** — every name `@dzup-ui/core` imports
exists in `@lucide/vue@1.47.0`, verified against both the `.d.ts` and the ESM
barrel's runtime exports. `<stop_conditions>`' "lacks an icon" case **does not
fire**. What does change:

- **3 glyphs redrawn** — `CalendarIcon`, `Clock`, `Filter` (which is now an
  alias of a different module, `funnel.mjs`, with entirely new path data).
- **18 of 18 rendered `<svg class>` values change** — `lucide lucide-x-icon` →
  `lucide lucide-x`, and two gain an alias class. **No file in this repository
  selects on those classes**; a consumer's stylesheet may.
- **1.x emits `aria-hidden="true"` by default** for icons with no accessible
  name and no default slot. 0.x never did.
- **+2,432 raw / +1,068 gzip** for the 18 glyphs — and the delta is a **fixed
  runtime cost** (+864 gzip at *one* glyph), not a per-glyph one. The library's
  icon cost roughly doubles.
- therefore **changeset `minor`, not `patch`** — this packet disagrees with
  N5-04 and shows the measurements.

And the swap's surface is **five things, not three**: the three workspace
manifests, plus `apps/landing/playground-template/package.json` (shipped, not a
workspace, invisible to `yarn.lock`) and the generated consumer surfaces — **40
of 89** registry items and **41** `llms-full.txt` occurrences, fixed by
re-running their generators and never by editing. §3.3.

### 7.2 Item 2 — `reka-ui` stays (**D178**, a formality)

Leave it. `Install: true. Ship: false` — a Button-only bundle contains **zero
bytes** of `reka-ui`; the obligation is one barrel edge, `DzSpeedDial →
DzTooltip`. Reopen **only** for a per-component entry surface wanted for its own
sake, and then only as a **pair** with `./components/*`, because
`peerDependenciesMeta.optional` alone is measurably worse than doing nothing and
`validate:peers` would report it green.

**New input:** R1-O4's `test:min-peer` **did** pin `reka-ui@2.0.0`, installed
it under npm's own peer resolution and SSR-rendered the `reka-ui`-backed
`DzTooltip` from a packed tarball at the floor. The `<stop_conditions>` case
handed to this packet — *"the min-peer lane cannot pin a lower `reka-ui`
because of a transitive constraint"* — **did not occur**.

### 7.3 Item 3 — the Node floor (**D176**)

Recommend **`>=22.13.0`**, and this packet **differs from R1-O4 D160(a)**
deliberately. D160 found the declared floor is *false* on its 20.x branch
(`fs.globSync` is `@since v22.0.0`) and recommended fixing the one import.
R1-O4 also found (**F2**) that the lane which should have caught it was
running `generate:exports:core` — which rewrites `packages/core/src/index.ts` —
so **there has never been a green run on the 20.x floor**. Fixing one import
restores the *claim* without the *evidence*, Nuxt ≥ 4.4.6 has already dropped
Node 20 (which is what pins the fixture matrix at 4.4.5), and Node 20 has had
no security updates since 2026-08-20.

Also recorded, because the floor is routinely sold on it and it is false:
raising to `>=22.13.0` does **not** unlock `Intl.Locale.prototype.getTextInfo()`
— that needs Node **24.0.0** — so ADR-20 §4's "when the floor moves past it"
prediction is wrong and must be corrected in the same amendment.

### 7.4 Item 4 — `apps/sandbox` (**D177**)

Do **not** remove it today. Three measured reasons:

1. **It has a declared production deployment.**
   `deploy/sandbox/coolify{,.staging}.json` name `dzup-ui-sandbox-production` at
   `dzup-ui-sandbox.dziphost.com`. That domain **resolves** (`213.199.40.69`),
   a host answers TLS with an **untrusted certificate**, and both `/` and
   `/healthz` return **503**. Removing the workspace orphans the config;
   removing the config does not remove the Coolify resource or the DNS record.
   `<authority>` withholds deployment and DNS actions.
2. **The retirement premise is stale.** `docs/free-apps-audit.md:165` and
   `packages/tooling/src/validators/contract-parity.ts`'s doc comment both say
   "abandoned 2026-06-09". `git log -1 -- apps/sandbox` says **`7984c68`,
   2026-08-25**.
3. **`<stop_conditions>` fires, twice over.** *"Stop and report when removing
   `apps/sandbox` breaks a changeset or fixture reference."* It breaks **two**
   classification references, both read by `validate:release-policy`:
   `.changeset/config.json`'s `ignore` array, and
   `packages/tooling/scripts/release-policy.json`, which classifies
   `@dzup-ui/sandbox` as `private` at line 34 — and that validator carries an
   explicit clause for exactly this, *"release-policy.json classifies X, which
   is not a workspace package. A renamed or deleted package leaves a stale
   classification behind"* (**R3**). It also makes R1-O3's
   `candidate-content-digest.json` name ~30 deleted files, which is **D173**
   one commit later.

**And the fact that decides sequencing: removing `apps/sandbox` does not clear
the icon gate.** `apps/landing` declares `^0.475.0` independently.

---

## 8. Ratchet movements

| Ratchet | Before (`527dbd1`) | After | Note |
|---|---|---|---|
| gates that can see a duplicated dependency | **0** | **1** | `validate:icon-duplicates`, joined to `validate:peers` |
| hard clauses in that gate proven on a seeded defect | **0** | **5 of 5** | plus a clean control, which is the half that is usually skipped |
| icon-declaring surfaces any gate can see | **0 of 5** | **5 of 5** | 3 workspace manifests + the shipped playground template + the generated registry |
| icon declarations outside `yarn.lock`'s reach | **2, invisible** | **2, printed on every run** | §3.3 |
| registry items handing consumers a deprecated dependency | **40, unmeasured** | **40, reported** | measurement starting, not the surface degrading |
| `validate:all` links | **50** | **50** | deliberate — the second assertion joins the existing peers link |
| icon-library versions resolving | **2** | **2** | unchanged: the fix is D174/D175, not this packet |
| icon-library names resolving | **1** | **1** | the `single-ident` clause has nothing to catch yet, and that is the point of having it before the swap |
| declared icon identity set | **absent** | **2 names, guarded** | `declared-family` fails on any unlisted lucide-family package |
| codemod transforms | **6** | **7** | `swap-icon-library`, deliberately outside `all` |
| codemod transforms with file fixtures | **0** | **1** | the other six are assertion-driven |
| measured glyph mappings | **0** | **18** | 18/18 present, 15/18 identical artwork, 0/18 identical class |
| measured swap bundle delta | **none** | **+2,432 raw / +1,068 gzip** | esbuild, vue external, minified, tree-shaken |
| tooling/codemods specs | baseline | **+44** (25 + 19) | |
| eslint `ignores` entries | 24 | **25** | codemod fixtures, with the reasoning written out |
| owner decisions raised | D173 | **D178** | five new |
| `_Gap:_` premises falsified | — | **4 of 7** | see §1 |

---

## 9. Owner decisions raised (continuing from R1-O5's **D173**)

| # | Decision | Options | Recommendation | Gates |
|---|---|---|---|---|
| **D174** | **Take the `lucide-vue-next` → `@lucide/vue` swap?** | (a) swap all three manifests to `^1.47.0`, run the codemod, re-record visual + AT baselines, `minor` changeset · (b) defer the swap, align ranges only · (c) leave both defects | **(a)** — the contract is complete (18/18 mapped, codemod + 7 fixtures, runbook), the deprecation is upstream and permanent, and the visual baselines (R2-O6) and AT matrix (R2-O2) are **not yet locked**, which makes now the cheapest moment. Cost is honest: **+1,068 gzip** and a full icon re-baseline | `validate:peers` red · R1-O3's supply-chain report · C12 |
| **D175** | **The changeset level for that swap** | (a) `patch` (N5-04's answer: "no public API change") · (b) **`minor`** | **(b)** — three consumer-visible changes: every icon's rendered `class`, a new default `aria-hidden="true"`, and three different drawings. Under VERSIONING.md 0.x, `minor` *is* the breaking level, and `validate:release-policy` R5 refuses `major` anyway, so it is a cheap honesty | the release plan; a `patch` that changes what renders is a release note nobody reads until it breaks them |
| **D176** | **The Node floor** | (a) fix the one `globSync` import, keep `^20.19.0 \|\| >=22.13.0` (R1-O4 **D160**'s answer) · (b) **`>=22.13.0`** · (c) `>=24.0.0` | **(b)**, with (a) as a legitimate interim. §7.3 sets out where this differs from D160 and why. **(c) rejected** — Node 22 LTS runs to April 2027 and a library floor excluding it is aggressive. Whichever is taken, **ADR-20 §4 must be corrected in the same amendment**: `getTextInfo()` needs Node 24, not 22.13 | ADR-18 acceptance text (R0-O2) · criterion **C10** · the Nuxt 4.4.5 pin (N5-03 **D4**) |
| **D177** | **`apps/sandbox`** | (a) remove the workspace, its deploy configs, its changeset-ignore entry and ~10 doc references · (b) keep, with the justification signed · (c) **retire the deployment only, keep the tree** | **(c) now; (a) only once the owner confirms the Coolify resource `dzup-ui-sandbox-production` and its DNS record can go.** (a) is not an agent action, it breaks a changeset reference, and it does **not** clear the icon gate | the `apps/*` story in R0-O1 · **D173**'s candidate digest |
| **D178** | **Record the `reka-ui` decision** (a formality — N5-04 D1 recommended it, nobody wrote it down) | (a) **leave, non-optional peer** · (b) `peerDependenciesMeta.optional` alone · (c) optional **+** `./components/*` subpaths | **(a), recorded with its reopening condition** (§7.2), so the next programme does not re-derive it a fourth time. **(b) is measurably worse than doing nothing** and `validate:peers` reports it green | nothing today; it is the *recording* that has value |

---

## 10. Ranked next packet

1. **D174 or D175 — clear the icon gate.** It is the only red this packet
   introduced and it is two lines (option b) or one codemod run (option a).
   Everything in the swap contract is measured and runnable.
2. **One `eslint --fix` on `packages/tooling/scripts/validate-engines.spec.ts`.**
   `validate:all` fails at **link 3** for a single regex in a file this packet
   was told not to touch. Until that is fixed the chain cannot reach links 4–50,
   and R1-O1's "truthfully green tree" is not observable end to end.
3. **D176 — the Node floor.** It is 1.0 criterion **C10** and it blocks ADR-18's
   acceptance text in **TASK-R0-O2**. Take (a) this week if (b) needs
   scheduling; they do not conflict.
4. **TASK-R0-O1** — the consolidated owner-decision register. Five more
   decisions (D174–D178) joined the ~125 already scattered across three ledgers,
   and this packet had to search four documents to establish that none of its
   four items had been decided. That search is the register's whole purpose.
5. **The `RTL_LANGUAGES` test** (R5-O3/R5-O4). Two of 14 entries are wrong
   today (`'ha'` is `ltr` in ICU; `'uz-AF'` can never match because the lookup
   lower-cases first) and **no floor move fixes it**. It needs a test, and the
   provider lane owns the file.
6. **D178** — thirty seconds of writing that stops a fourth re-derivation.

---

## 11. Reproduction

```bash
cd ui/dzup-ui
git rev-parse HEAD                                 # 527dbd1

# the gate
yarn validate:icon-duplicates;             echo "exit $?"   # 1
yarn validate:icon-duplicates --self-test; echo "exit $?"   # 0
yarn validate:peers;                       echo "exit $?"   # 1 (ranges pass, icons fail)

# the specs
node node_modules/vitest/vitest.mjs run \
  packages/tooling/src/validators/peer-icon-duplicates.spec.ts \
  packages/codemods/src/transforms/__tests__/swap-icon-library.spec.ts

# the two versions, two routes
node -e "console.log(require('./node_modules/lucide-vue-next/package.json').version)"
node -e "console.log(require('./packages/core/node_modules/lucide-vue-next/package.json').version)"

# the successor
npm view @lucide/vue version                       # 1.47.0
npm view lucide-vue-next@0.477.0 deprecated

# the sandbox deployment
nslookup dzup-ui-sandbox.dziphost.com
curl -sSk -o /dev/null -w "%{http_code}\n" https://dzup-ui-sandbox.dziphost.com/healthz
git log -1 --format='%h %ad %s' --date=short -- apps/sandbox
```
