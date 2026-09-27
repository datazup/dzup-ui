# Publication decision packet — **A4-D1: publish, freeze, or private registry**

**Task:** TASK-R0-O1 · **Compiled:** 2026-09-22 · **Commit:** `527dbd1`, 278 uncommitted paths
**Companion:** [`owner-decision-register-2026-09.md`](./owner-decision-register-2026-09.md)
**Scope:** this packet **measures and costs**. It takes no decision, edits no changeset, runs no `changeset version` on the tree, publishes nothing, mutates no registry, touches no DNS.

> **The decision in one sentence.** Six packages are `published` in
> `release-policy.json`, 36 changesets are queued against them, three registries
> and 88 registry items tell consumers to `npm install @dzup-ui/core
> @dzup-ui/tokens`, and **none of those packages exists on npm** — so every
> consumer surface this programme built is currently making a promise the
> registry cannot keep.

---

## 1. What is true at `527dbd1`, measured

| Fact | Value | How it was measured |
|---|---|---|
| Published-class packages | **6** — `contracts`, `core`, `mcp`, `nuxt`, `testing`, `tokens` | `packages/tooling/scripts/release-policy.json` |
| Withheld public packages | **2** — `compat`, `codemods` | ditto, each with a written reason |
| Private packages | **5** — `docs`, `landing`, `sandbox`, `storybook`, `tooling` | ditto |
| Pending changesets | **36** | `yarn validate:release-policy` → exit 0, *"36 pending changeset(s), 0 major, 0 mixed"* |
| `validate:release-policy` | **exit 0** | run 2026-09-22, read directly (not through a pipe) |
| `validate:all` chain length | **50 links** | `node -e "…scripts['validate:all'].split('&&').length"` |
| Registry items declaring `@dzup-ui/tokens` | **88 of 88** | script over `apps/landing/public/r/*.json` |
| Registry items declaring `@dzup-ui/core` | **87 of 88** | ditto |
| Registry items declaring `lucide-vue-next` (deprecated — **D174**) | **40 of 88** | ditto |
| Tracked files in `apps/landing/public/r/` | **282**, all present on disk, 1 modified | `git ls-files` + `find` |
| Tracked files naming `dzup-ui.com` | **63** | `git grep -l` |
| `dzup-ui.com` DNS | **NXDOMAIN at apex and www** | [`TASK-R1-O5-handoff.md`](./TASK-R1-O5-handoff.md) §8 **D166** — cited, not re-measured (no DNS action is authorised) |

**The failure mode, concretely.** `app-shell.json` — and 87 of its siblings —
declares `dependencies: ["@dzup-ui/core", "@dzup-ui/tokens", "lucide-vue-next"]`.
A consumer who runs the documented `shadcn add` against this registry gets
`E404` on the first two and a deprecation warning on the third.

---

## 2. The three options, costed

Each option is costed in four consumer surfaces — **docs** (`apps/docs`,
`apps/landing`, Storybook), **`llms.txt`** (6 files; `llms-full.txt` alone
carries 528 `@dzup-ui/` references), **MCP** (`@dzup-ui/mcp`, a public package
whose `get_install_command` tool returns these strings), and **registry**
(`/r/**`, 282 files, 88 installable items).

### Option A — **publish 0.x now**

| | |
|---|---|
| **What it is** | Take N5-01 D1 (a), (b); re-level per N5-01 D3; run `changeset version`; `changeset publish` the six published-class packages at their computed versions (§3). |
| **First implementation packet** | **TASK-R1-O1** residual (commit the tree — 278 paths) → **N5-01 D1 (a)+(b)** gate fix (~20 lines) → **TASK-R0-O1 §4** re-levelling → **TASK-R1-O3**'s `release:api-surface:record` on the clean commit → `changeset version` → `changeset publish`. **TASK-R1-O5/D172** then deploys the docs site *after*. |
| **Risk** | **The API surface is not frozen.** `D158` is unresolved, so the barrel and `public-api.manifest.json` disagree about five composables; publishing locks whichever side ships. `D154`'s 8 `high` advisories ship inside `@dzup-ui/mcp`. `npm unpublish` is available for **72 h only** and `D159`'s rollback policy does not exist yet. **The tree is uncommitted**, so nothing published would be reproducible from a commit. |
| **Docs** | Becomes true. Every install command starts working. |
| **`llms.txt`** | Becomes true; no regeneration needed — the strings are already correct-in-form. |
| **MCP** | `get_install_command` starts returning commands that work. Requires **N2-A1 D5** (namespace verification) before any *registry* publish of the MCP server itself. |
| **Registry** | All 88 items become installable — **except** the 40 that pull deprecated `lucide-vue-next` (**D174**). |
| **Blocks on** | N5-01 D1 · N5-01 D3 · D158 · D154 · D159 · a committed tree |

### Option B — **freeze and stop advertising install commands**

| | |
|---|---|
| **What it is** | Publish nothing. Change every surface to say the packages are not yet released, and remove or disable the install commands until A4-D1 is revisited. |
| **First implementation packet** | A new packet (no existing task id covers it) that: suppresses install commands in `apps/docs` and `apps/landing`; regenerates `llms{,-full}.txt` and the 144 docs pages through the existing generators; makes `get_install_command` return an `isError` "not yet published" result (the mechanism already exists — N2-A1 D3 records it being added for unknown items); and either removes the 88 registry items' `dependencies` arrays or marks the registry pre-release. Then **D172 (b)** — deploy the site with install commands suppressed. |
| **Risk** | **It is a lot of generated-artifact churn for a reversible state**, and every one of those regenerations has to be undone on the day A4-D1 flips to publish. It also makes the library's most credible asset — the evidence layer — public while saying the library cannot be installed, which is honest but weak. |
| **Docs** | Every install snippet edited or suppressed; 144 generated pages regenerate. |
| **`llms.txt`** | Both files regenerate; **528 `@dzup-ui/` references in `llms-full.txt`** are in prose and import examples, so most survive — it is the *install* lines that change. |
| **MCP** | A behaviour change to a **published tool** on an **unpublished package** — which is itself the absurdity this option is trying to remove. Needs a changeset it cannot release (see §4). |
| **Registry** | 88 items lose or qualify their `dependencies`; `/r/**` regenerates, which today also triggers **D171** (`build:registry` wipes directories it does not own). |
| **Blocks on** | Nothing. **This is the only option available today without a decision from anyone else.** |

### Option C — **publish to a private registry first**

| | |
|---|---|
| **What it is** | Publish the six packages to a private npm-compatible registry (Verdaccio, GitHub Packages, Cloudsmith, Artifactory), exercise the whole release path end to end, then publish publicly once it is proven. |
| **First implementation packet** | **The infrastructure does not exist.** No private registry is configured anywhere in this repository — no `.npmrc` registry entry, no publish workflow targeting one, no credentials mechanism. Per `<stop_conditions>` this packet **describes it and does not build it.** The sequence would be: choose a host (an account decision, like D165 and N2-A1 D5) → add a scoped registry to `.npmrc` → a `release-rehearse` workflow that publishes there → **TASK-R1-O2**'s consumer-truth gates re-run against the *installed* packages rather than the tarballs → then Option A. |
| **Risk** | **It does not make any consumer surface honest** — the docs, `llms.txt`, MCP and registry all name the public npm names, and a private registry does not serve those. It buys a rehearsal, not a truth. It also adds a standing secret and a second place a version can exist. **D150** already asks for a full-fidelity `--install` variant of the import gate, which is most of the value of Option C **without** a registry: R1-O2's gate extracts the tarballs and resolves peers through a junction today. |
| **Docs / `llms.txt` / MCP / Registry** | **Unchanged — all four stay wrong.** Every install command still 404s for every real consumer. |
| **Blocks on** | An account/hosting decision; then everything Option A blocks on. |

### What this packet recommends the owner weigh

**No recommendation is made between A, B and C — that is A4-D1 and it is the
owner's.** What the measurements say:

- **Option C is dominated.** Its rehearsal value is largely available from
  **D150** (an `--install` variant of the existing import gate) at a fraction of
  the cost, and it leaves all four consumer surfaces untrue. If the goal is
  "prove the release path", D150 plus `rehearse:release` is the cheaper packet.
- **Option A's blockers are all small and all known** — N5-01 D1 is ~20 lines
  (**proven**, §5), the re-levelling is 11 files (§4), D154 is a transitive bump.
  The expensive blocker is not technical: it is that **the tree is not committed**
  and **D158 has no measurable answer** (§6).
- **Option B is the only one available with no other decision**, and it is
  strictly reversible. Its cost is generated-artifact churn that a later Option A
  undoes.
- **D172 answers the ordering either way:** *"a live site whose every install
  command returns `E404` is worse than NXDOMAIN, because NXDOMAIN is honest."*
- **A4-D2 / D166 must be answered before A, not after.** `SITE_ORIGIN` is free to
  change today and baked into 282 registry files, 63 tracked files, both
  `llms*.txt` and every canonical link afterwards.

---

## 3. The 36 pending changesets — declared level vs the level `VERSIONING.md` requires

**The rule** (`packages/contracts/VERSIONING.md` §1, a 0.x library):
**`minor` = breaking** (removes, renames or narrows one of the five surfaces in §2);
**`patch` = additive or a fix**; **`major` is refused by a gate** until the deliberate 1.0 act.
**§3 carve-out:** *correcting a rendered accessibility attribute is a `patch`*; *removing a declared prop is a `minor`*.

### 3.1 The 16 audited by TASK-N5-01 (2026-09-03) — verdicts carried, not re-derived

Source: [`N5-01-release-policy-handoff.md`](../../program-2026-09/reports/N5-01-release-policy-handoff.md) §6.
**Outcome: 5 correct · 10 over-declared · 1 correct-where-it-matters with a secondary over-declaration · 0 under-declared.**

| # | Changeset | Declared | Required | Verdict |
|---|---|---|---|---|
| 1 | `a-field-no-longer-describes-its-control-with-ids-that-do-not-exist` | core: minor | core: **patch** | ⚠️ over-declared |
| 2 | `a-form-renderer-can-bind-v-model-to-every-selection-control` | core: minor | core: **patch** | ⚠️ over-declared |
| 3 | `an-application-can-configure-more-than-the-theme` | contracts, core: minor | both **patch** | ⚠️ over-declared — its own text says *"mechanical and non-breaking"* |
| 4 | `a-wizard-can-take-you-to-the-error-instead-of-just-naming-it` | core: minor | core: **patch** | ⚠️ over-declared |
| 5 | `command-palette-label-is-the-search-key` | core: patch | core: patch | ✅ correct |
| 6 | `components-declare-their-styling-surface` | contracts, testing, core: minor | all **patch** | ⚠️ over-declared — *"Nothing is removed, and every existing override keeps working"* |
| 7 | `every-string-the-library-shows-you-can-be-translated` | contracts, core: minor | both **patch** | ⚠️ over-declared |
| 8 | `nuxt-module-registers-from-generated-ownership` | nuxt: patch, core: minor | nuxt: patch, core: **patch** | ⚠️ core over-declared |
| 9 | `one-provider-configures-the-whole-library` | contracts, core: minor | both **patch** | ⚠️ over-declared — `DzProvider` is a *new* component |
| 10 | `overlays-go-where-your-application-says` | core: patch | core: patch | ✅ correct |
| 11 | `pro-package-is-named-dzup-ui-pro-pro` | core, nuxt: patch | core, nuxt: patch | ✅ level correct; **package coverage wrong** — it describes a `@dzup-ui/codemods` change it may not name (§4) |
| 12 | `resolver-resolves-by-exact-name` | core: minor | core: **minor** | ✅ correct, genuinely breaking |
| 13 | `selection-controls-can-be-driven-by-a-remote-option-source` | contracts, core: minor | core: **minor**, contracts: **patch** | ⚠️ core correct; **contracts over-declared** (the 11th) |
| 14 | `text-inputs-say-in-the-dom-what-they-say-in-their-types` | core: minor | core: **patch** | ⚠️ over-declared |
| 15 | `the-catalog-knows-which-way-it-reads` | contracts, testing: minor, core: patch | all **patch** | ⚠️ over-declared |
| 16 | `the-catalog-says-what-it-owes` | contracts, core: minor | both **minor** | ✅ correct — `RiskTier` was inverted; an exported scale whose meaning flipped |

### 3.2 The 20 that have **never been audited** — first pass by this task

**This is new work and it is a first pass, not a ruling.** N5-01's audit
predates all twenty. Each verdict below cites the clause it turns on; the
contested ones are the point of the table.

| # | Changeset | Declared | First-pass required | Verdict · clause |
|---|---|---|---|---|
| 17 | `a-count-reads-right-in-every-language-and-the-catalog-ships` | contracts, core: patch | same | ✅ additive (i18n + catalog export) |
| 18 | `a-form-reset-now-resets-the-control` | core: minor | **contested** | ⚖️ It fixes defect `D8` — but a consumer bound to `v-model:value` now *receives* external writes it previously ignored. Behaviour a template relied on changes ⇒ `minor` defensible; "a defect corrected" ⇒ `patch`. **Owner call; the safe direction is what shipped.** |
| 19 | `a-grid-item-can-say-how-many-columns-it-spans` | core: patch | same | ✅ additive (new API; decision **D67**) |
| 20 | `a-one-time-code-can-be-filled-and-a-password-can-be-revealed` | core: minor | **patch** | ⚠️ **over-declared.** Pure WCAG 2.2 SC 3.3.8 correction; nothing removed. §3's first clause: *correcting a rendered accessibility attribute is a `patch`* |
| 21 | `a-pane-and-a-column-can-be-resized-without-dragging` | 6 packages: patch | same | ✅ WCAG fix + additive declarations; §3 first clause |
| 22 | `an-at-matrix-that-cannot-turn-a-failed-run-into-a-pass` | contracts: patch | same | ✅ additive `CellState` value + fixed summariser (closes **N1-O4 #2**, **D2-D4**) |
| 23 | `every-component-says-what-its-keys-do` | contracts, testing, core: minor | **all patch** | ⚠️ **over-declared, 3 packages.** Purely additive keyboard declarations — the same shape as #6, which N5-01 ruled over-declared |
| 24 | `every-form-control-declares-what-you-can-restyle` | core, contracts: patch | same | ✅ additive; the RTL edge fixes change class names, which ADR-19 excludes from the contract (same reasoning as #15) |
| 25 | `mention-and-persona-selector-join-the-async-options-seam` | contracts, core: patch | same | ✅ additive seam adoption |
| 26 | `navigation-and-data-say-what-you-can-restyle` | core: patch | same | ✅ additive |
| 27 | `nine-aria-props-that-did-nothing-are-gone` | core: minor | **minor** | ✅ **correct, and exemplary.** §3: *removing a declared prop is a `minor`* — with all four required artifacts (type removed, dev warning, codemod entry, minor changeset naming the removal) |
| 28 | `nuxt-module-now-builds-against-nuxt-kit-4` | nuxt: minor | **minor** | ✅ correct, and argued in its own body against `VERSIONING.md` — it drags `@nuxt/kit` 4 into a Nuxt 3 project |
| 29 | `one-place-to-configure-how-html-is-sanitized` | contracts, core: minor | **contested** | ⚖️ The *provider concern* is additive (⇒ `patch`, like #9). But it also **installs a default sanitizer**, which narrows what previously rendered — a consumer relying on unsanitized HTML breaks. **Owner call; relates to D6** |
| 30 | `six-navigation-components-no-longer-render-a-javascript-url` | contracts, core: minor | **minor** | ✅ correct — `javascript:void(0)` renders today and would stop (**N1-O5 O5-1**) |
| 31 | `the-contracts-package-can-now-be-loaded-by-node` | contracts: patch | same | ✅ a fix; the package was unloadable (**N5-03 D3**) |
| 32 | `the-security-corpus-is-one-format-for-both-repositories` | testing: minor | **contested** | ⚖️ Schema 1.1.0 and the shipped JSON Schemas are additive (⇒ `patch`), but *"a stricter checker"* narrows what validates for an existing fixture. **Lean correct as declared** |
| 33 | `the-six-cascade-layers-the-styling-contract-promised` | contracts, core, tokens: patch | **contested** | ⚖️ Declaring the three missing layers is additive, **but it changes cascade precedence for existing consumer overrides** — the exact surface ADR-19 §2.2 governs. **Lean over-declared-in-the-other-direction, i.e. possibly under-declared.** The only candidate under-declaration in all 36 |
| 34 | `three-aria-props-start-working-and-a-drag-handle-gets-its-label` | core: patch | same | ✅ §3 first clause (see **N5-02 D2** for the `title` question) |
| 35 | `twenty-five-more-components-declare-what-you-can-restyle` | core: patch | same | ✅ additive |
| 36 | `your-class-wins-and-the-docs-now-say-where-it-lands` | contracts, core, testing: patch | **contested** | ⚖️ `UI_MERGE_ORDER = recipe → ui → class` **changes which of two consumer inputs wins.** 74 of 79 merge sites already passed `class` first, so most consumers see no change — but the five that did not, break. Tied to **D38** (ratify the order + sequence a 73-component migration) |

**First-pass totals for the 20:** 13 ✅ correct · 2 ⚠️ over-declared (#20, #23) ·
5 ⚖️ contested (#18, #29, #32, #33, #36) · 0 confirmed under-declared, **but #33
is the one candidate**, and it is the only place in 36 changesets where the error
might run in the *unsafe* direction.

### 3.3 What `changeset version` would produce

[`TASK-R1-O1-handoff.md`](./TASK-R1-O1-handoff.md) §7 ran it **in a throwaway
`git worktree` of `527dbd1`**, never on the tree, and recorded:

> *core 0.2.0→0.3.0, mcp 0.2.0→0.2.1, tokens/testing/contracts 0.2.0, nuxt 0.1.0*

Computed independently here from the 36 frontmatters:

| Package | Now | Bumps queued | Computed next |
|---|---|---|---|
| `@dzup-ui/contracts` | 0.1.0 | 10 minor, 8 patch | **0.2.0** |
| `@dzup-ui/core` | 0.2.0 | 18 minor, 14 patch | **0.3.0** |
| `@dzup-ui/tokens` | 0.2.0 | 0 minor, 2 patch | **0.2.1** |
| `@dzup-ui/mcp` | 0.2.0 | 0 minor, 1 patch | **0.2.1** |
| `@dzup-ui/nuxt` | 0.1.0-alpha.0 | 1 minor, 3 patch | **0.1.0** (as R1-O1 measured) |
| `@dzup-ui/testing` | 0.1.0 | 4 minor, 2 patch | **0.2.0** |

**One discrepancy to re-confirm at the next dry run:** R1-O1 groups `tokens`
with the packages landing on `0.2.0`; `tokens` is already `0.2.0` and carries
only patch bumps, so it should land on `0.2.1`. R1-O1's run is the measured
authority and its transcription is loose in the same sentence that says
"37 changesets" (it counted `.changeset/README.md`; there are **36**). **Nothing
in this packet depends on which is right**, but a release must not be taken from
that line without re-running the dry run.

**If N5-01 D3 is taken, `@dzup-ui/core` lands on `0.2.1`, not `0.3.0`** — and a
consumer on `^0.2.0` receives it automatically instead of having to opt in. That
is the whole of the re-levelling decision.

---

## 4. The two withheld packages, and what withholding costs

`@dzup-ui/compat` and `@dzup-ui/codemods` are **public**
(`publishConfig.access: public`), **publishable**, **in CI's pack smoke test**,
and **on the changesets `ignore` list** — so no changeset can ever release them.
`release-policy.json` carries a written reason for each, which is why the gate is
green: *"'ignored' with no reason is indistinguishable from 'forgotten'"*.

**The measured cost is not hypothetical — it is already being paid twice:**

1. **A changeset that cannot name the package it changed.**
   `.changeset/pro-package-is-named-dzup-ui-pro-pro.md` describes a behaviour
   change to `@dzup-ui/codemods`' `rename-imports` **in its body** and cannot
   declare it in its frontmatter, *"because a changeset naming an ignored package
   alongside a published one is refused outright (the SK-1 failure). The change
   ships with no changelog entry."*
2. **A written, tested codemod that cannot reach a consumer.** **N5-02 D6**
   records the nine-entry ARIA-removal codemod in the same state: it exists, it
   is tested, `VERSIONING.md` §3 requires it as one of the four artifacts of a
   prop removal — and `.changeset/nine-aria-props-that-did-nothing-are-gone.md`
   ships the removal to consumers who **cannot install the codemod that migrates
   them**.

**A third cost, structural.** `VERSIONING.md` §3 clause 2 names `warnDeprecated`
in **`@dzup-ui/compat`** as *"the existing utility"* for every prop removal —
and Core may not import `compat` (**N5-02 D4**, which is why a second warn-once
utility now exists in Core). So the policy document points at a package the
policy will not let anybody install.

**Options, and neither is free:**

| | Cost |
|---|---|
| **Release both** (remove from `ignore`, classify `published`) | They become supported surfaces with their own version histories. `@dzup-ui/compat` is explicitly *"migration tooling with no stable API of its own"* under `VERSIONING.md` §5 — which is a reason to withhold it, **not a reason it cannot be released**. |
| **Formally withhold** (status quo, documented) | The two costs above continue, and **`VERSIONING.md` §3's four-artifact requirement for a prop removal is unsatisfiable** for any consumer. |

**Recommendation of this packet:** whichever is chosen, **`VERSIONING.md` §3
must be amended in the same change** to name a utility and a codemod a consumer
can actually obtain — otherwise the policy requires an artifact the release
policy forbids shipping. This is **N5-01 D2** and it is a prerequisite of
Option A, not a follow-up.

---

## 5. The N5-01 D1 proof — **already reproduced; not re-run here**

The task allows reproducing D1 *"in a scratch copy only"* if absent. **It is not
absent.** [`TASK-R1-O1-handoff.md`](./TASK-R1-O1-handoff.md) §7 proved it on
2026-09-21 in a throwaway `git worktree` of `527dbd1` with `node_modules`
junctioned in, worktree and junction removed afterwards. **Nothing was re-run on
the tree for this packet.**

| Stage | `validate:changelog` | `validate:mcp` |
|---|---|---|
| At `527dbd1`, before versioning | **exit 0** (7 passed) | **exit 0** (12 tools, versions agree at 0.2.0) |
| After `changeset version` | **exit 1** — 5 of 7 packages: `Version entry missing ISO date (YYYY-MM-DD): "## 0.3.0"` | **exit 1** — 4 errors |
| After adding ` - 2026-09-21` to every `## x.y.z` heading | **exit 0** | **exit 1** — **5** errors |

**Both fail, and fixing one makes the other worse.** The mechanism, to the line:

- `validate-changelog.ts:75` requires `/\d{4}-\d{2}-\d{2}/` on every `## x.y.z`
  line. Changesets writes a bare `## 0.3.0`.
- `mcp-surface.ts:94` reads the version with
  `/^##\s+(\d+\.\d+\.\d+(?:-[\w.]+)?)\s*$/m` — **anchored to end of line,
  whitespace only**. A dated heading does not match, `latestChangelogVersion`
  returns `null`, and a **fifth** error appears.

**The three failures no date fix can touch — which N5-01 D1 does not mention:**

```
✗ packages/mcp/server.json#version says "0.2.0" but package.json says "0.2.1"
✗ packages/mcp/server.json#packages[0].version says "0.2.0" but package.json says "0.2.1"
✗ packages/mcp/docs/mcp-tool-surface.json#version says "0.2.0" but package.json says "0.2.1"
```

plus `mcp-tool-surface.json is STALE` and the README tool table with it.

> **`changeset version` bumps one file; four others mirror that version by hand.
> The first `changeset version` turns `validate:all` red for five reasons, not
> one. N5-01 D1 understates the problem by four.**

**The fix, costed:** **(a)** widen the `validate:mcp` heading regex to allow an
optional ` - YYYY-MM-DD` suffix — one line; **(b)** add a `version` script that
runs `generate:mcp-surface` and syncs `server.json` after `changeset version` —
mechanically fixes all four mirrors. **(a) + (b) together are ~20 lines and turn
a guaranteed-red first release into a green one.** Option (c) — drop the ISO-date
rule — is cheapest but loses the date the release report needs.

**This is a prerequisite of Option A and is worth taking even under Option B**,
because it is the difference between a release path that has never been run and
one that is known to work.

---

## 6. The `generate:exports` drift — **measured, and deliberately unresolved (D158)**

Cited from [`TASK-R1-O3-handoff.md`](./TASK-R1-O3-handoff.md) §10 and the API
diff it generated, `docs/qa/release/2026-09-21-527dbd1/api-diff.{json,md}`.
Independently corroborated by **N0-05 D2** (a sandboxed dry run, 2026-09) and
**N2-A1 D2** — three measurements, one result.

Running `yarn generate:exports` today would:

| Direction | Symbols |
|---|---|
| **Drop (5)** | `useAffix` · `useCalendar` · `useInfiniteScroll` · `useScrollSpy` · `useScrollToTop` |
| **Add (2)** | `useCountdown` · `useIntersection` |

Plus: `public-api.manifest.json` declares `"version": "0.0.1"` while
`@dzup-ui/core` is `0.2.0`, and **N2-A1 D2** measures a **43-component
visibility gap** — about **30 % of the catalog invisible to every AI client** —
traceable to the same file.

**Why this is the hardest item in the packet:** the five composables are
**live in the shipped barrel today**. A consumer can import them. So:

- **Option (a) — the barrel is right.** Add the five to the manifest, drop the
  two it wrongly promises. **No version bump; the public surface does not move.**
- **Option (b) — the manifest is right.** Run `generate:exports` and ship the
  removal as a **`minor`** naming the five composables (`VERSIONING.md` §2.1, §3).
- **Option (c) — retire `public-api.manifest.json` as the barrel's source.**
  `generate:component-meta` was already moved off it (TASK-N2-A1), and the
  455-symbol documentation gap says the rest of it is not maintained either.

R1-O3's own words, carried forward without softening:

> *"This is the input TASK-R0-O1 was waiting for, and it is **reported, not
> resolved**: which option is right depends on whether those five composables are
> intended public API, and that is not a fact a tool can read."*

**This packet agrees and does not resolve it.** What it adds is the publication
consequence: **whichever option is taken must be taken *before* the first
publish.** After publication, option (a) is still free, but option (b) becomes a
breaking change to a released package — it removes five importable symbols —
and option (c) becomes an argument about a file consumers now depend on the
output of. **Today all three are cheap. On the day after A4-D1, only one is.**

---

## 7. The re-levelling proposal (N5-01 D3)

**Proposal, for the owner to accept or reject as a whole:**

1. **Audit first, re-level second.** §3.2's 20 changesets have never been
   audited. Re-levelling the 11 N5-01 found while leaving 2 newly-found
   over-declarations and 1 candidate **under**-declaration (#33) in place would
   produce a release plan that is *more* wrong in the position that matters.
2. **Then re-level the 11** (10 wholly over-declared + `selection-controls-…`'s
   `@dzup-ui/contracts` half) and the 2 from §3.2 (#20, #23), moving `minor` →
   `patch` where the change is additive or an accessibility correction.
3. **Resolve the 5 contested and the 1 candidate under-declaration by argument,
   not by default.** #33 (`the-six-cascade-layers-…`) is the one that must not be
   got wrong: if declaring the layers changes precedence for existing overrides,
   `patch` puts a breaking change into every consumer's next `yarn install`
   unannounced — the exact failure `VERSIONING.md` §1 exists to prevent.
4. **Do it before `changeset version`, never after.** Re-levelling changes
   `@dzup-ui/core` from `0.3.0` to `0.2.1`. That is a release-behaviour change,
   which is why N5-01 refused to make it unilaterally and why **zero changeset
   files were edited** — by this task too.

**What re-levelling buys:** consumers on `^0.2.0` receive the work automatically
instead of having to widen their range for changes that break nothing.
**What it costs:** `@dzup-ui/core`'s first published version is `0.2.1` rather
than `0.3.0`, and 13 changeset files change.

**Every error found runs in the safe direction except #33.** That is the summary
sentence of this section.

---

## 8. Sequenced checklist, if Option A is taken

Not a recommendation to take it — a costing of what taking it means.

| # | Step | Owner or agent | Blocking decision |
|---|---|---|---|
| 1 | Answer **A4-D2 / D166** (register `dzup-ui.com`, or change `SITE_ORIGIN` and regenerate 282 files) | **Owner** — an account action | free today, expensive after step 9 |
| 2 | Commit the tree (278 paths) | **Owner** — no prompt authorises it | unblocks steps 3, 5, 6 |
| 3 | `yarn release:api-surface:record` on the clean commit | agent | **D157** — a prerequisite of the first release |
| 4 | Take **D158**; make the barrel and the manifest agree | **Owner** | cheapest today (§6) |
| 5 | Audit the 20, then re-level the 13 (§7) | agent, owner signs | **N5-01 D3** |
| 6 | Apply the D1 fix (a)+(b), ~20 lines | agent | **N5-01 D1 / D146** |
| 7 | Bump the 20 advisories, `patch` changeset, re-run `release:evidence` | agent | **D154**, and set the severity threshold |
| 8 | Write `docs/release/rollback-and-support.md` | agent, owner signs | **D159** — `npm unpublish` is 72 h only |
| 9 | `changeset version` → verify `validate:all` is green → `changeset publish` | **Owner** | **A4-D1** |
| 10 | Deploy the docs site | **Owner** | **D172** (after), **D165**, **D167** |
| 11 | Verify the `io.github.datazup/mcp` namespace before any MCP registry publish | **Owner** | **N2-A1 D5** — nothing in the repo can check it |

**Steps 1, 2, 4, 9, 10 and 11 are owner actions that no prompt in this programme
authorises.** Steps 3, 5, 6, 7 and 8 are agent work already specified and costed.

---

## 9. What this packet deliberately did not do

- **No changeset was edited** — not one of the 36, and not to fix the two
  over-declarations or the candidate under-declaration §3.2 found.
- **`changeset version` was not run**, on the tree or in a scratch copy. R1-O1's
  proof is complete and current at this commit; reproducing it would have been
  work for its own sake.
- **Nothing was published, no registry was mutated, no DNS was queried or
  changed.** `dzup-ui.com`'s NXDOMAIN state is cited from R1-O5, not re-measured.
- **`build:registry` was not run** — it `rm -rf`s `apps/landing/public/r/` and
  rewrites 282 tracked files (**D171**, **N2-A2 D6**).
- **A private registry was not built or configured** (`<stop_conditions>`:
  *"when an option requires infrastructure that does not exist — describe, do not
  build"*).
- **A4-D1 was not taken, and neither was any other decision in the register.**
