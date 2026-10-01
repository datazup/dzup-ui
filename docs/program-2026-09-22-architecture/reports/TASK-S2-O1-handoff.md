# TASK-S2-O1 — Complete the package-qualification matrix

> Programme: [Architecture Review 2026-09-22](../README.md) · file
> [custody-and-release-tasks.md](../custody-and-release-tasks.md) · agent run
> **2026-09-22**. Written incrementally while the task ran.
>
> **Commit this report is bound to:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`
> (`4e4e46f`). README §2 and this task file's preamble both say `589be13`;
> **both are stale**, re-verified at the start of this run per README §4 point 1.
> Every number below is a measurement **at `4e4e46f`** with the prior tasks'
> regenerated artifacts uncommitted in the worktree. Nothing here is CI, release
> or production evidence — it is **locally qualified** only.

---

## 0. Progress log (append-only, written while the task ran)

| # | When | What |
|---|---|---|
| 1 | session start | HEAD `4e4e46f`; **190 dirty paths** inherited from TASK-S0-O1 / S1-O2 / S3-O1 — preserved, none reverted, stashed, checked out or cleaned. |
| 2 | done_check | Run first, per README §4. **1 of 4 pass** → task runs in full. Two clauses defective (§1). |
| 3 | discovery | Twelve-row coverage mapping built from the 2026-09-04 reports and the live lanes (§2). Three brief-supplied facts proved wrong (§2a). |
| 4 | red build, layer 1 | D-S0O1-1(b) **verified against the real errors, then applied**. codemods builds; entry-point hashes **byte-identical**. §3. |
| 5 | red build, layer 2 | Unblocking codemods revealed **17 further errors in `@dzup-ui/nuxt`**, traceable to the *uncommitted* S3-O1 work. Fixed minimally; S3-O1's logic preserved entirely. §3b. **`yarn build` now exit 0 for the first time since `589be13`.** |
| 6 | ratchets | Links 44 `externals` and 45 `dts` **red → green**. Link 48 `peers` left red (genuine D174/D175). §6. |
| 7 | implementation | `qualify:package` lane + `e2e/package-qualification/` fixtures. §4. |
| 8 | validation | §5. |
| 9 | end | §8–§10. |

---

## 1. `<done_check>` outcome — **1 of 4 at `4e4e46f`**, 2 clauses defective

Run before reading the rest of the prompt, per README §4.

| # | Check | Result |
|---:|---|---|
| 1 | a `qualify:package`-shaped lane exists | **FAIL** — zero `qualify*` scripts in `package.json`. |
| 2 | `ls e2e/package-qualification/` → fixtures exist | **FAIL** — the directory does not exist. |
| 3 | `yarn qualify:package > /tmp/qp.log 2>&1` runs to completion | **FAIL** (no such script) — **and the clause is defective twice over.** |
| 4 | `ls docs/qa/release/*/sbom*.json \| head -1` | **PASS** — `docs/qa/release/2026-09-21-527dbd1/sbom.cdx.json` exists. |

Checks 1–3 fail, so the task ran **in full**.

### 1a. Defective clauses — the 9th and 10th recurrence in this programme

- **Clause 3 writes to `/tmp/qp.log`.** This is a Windows machine; `/tmp` is not
  writable from the shell this repository is driven with (`Permission denied`,
  reproduced). A future agent that trusts the redirect reads an *empty or
  absent* log and can conclude anything it likes. All logs in this run were
  written to the session scratchpad instead, and **every exit code was read
  directly, never through a pipe**.
- **Clause 4 is satisfiable by a stale artifact.** `docs/qa/release/2026-09-21-527dbd1/`
  is bound to `527dbd1`, is stamped `admissible: false`, and both `report.md`
  and `ledger.md` already carry a **⛔ SUPERSEDED** banner (D173). `ls … | head -1`
  passes on it regardless. An SBOM existing is not an SBOM that is *current*, and
  this check cannot tell the difference. It is the same "green over a stale
  artifact" failure `<repo_conventions><validation>` warns about.

---

## 2. Discovery — the twelve-row coverage mapping (the task's scope contract)

Built by reading `../program-2026-09-04/reports/TASK-R1-O{2,3}-handoff.md`,
`peer-hygiene-decisions-2026-09.md`, `icon-swap-contract-2026-09.md`, the
`docs/qa/release/2026-09-21-527dbd1/` bundle, and every lane named below in
source. **The packet's "5 covered / 7 uncovered" split is a hypothesis, and
measuring it moved three rows.**

| # | doc-08 row | Claimed | Measured before this task |
|---:|---|---|---|
| 1 | ESM import + declarations from the tarball | covered | **covered** — `validate:published-imports`, tarball, 31 subpaths / 62 leaves |
| 2 | Vite production build of a consumer app | covered | **NOT covered** — every Vite build in the repo resolves through **source aliases**, never a tarball |
| 3 | Nuxt SSR + auto-import | covered | **covered** — `test:nuxt-fixtures`, real `yarn pack` + `npm install` outside the repo |
| 4 | Resolver ownership | covered | **half covered** — the packed second-tier half (`core-pro`) has never executed |
| 5 | CSS/token import order | covered | **covered** — the best-covered row (two independent tarball lanes) |
| 6 | Per-component tree-shaking, optional engine separated | uncovered | **partial** — `validate:tree-shake` exists but externalises the engine, so engine cost is never measured |
| 7 | Minimum **and** current Vue/Reka peers | uncovered | **partial** — `test:min-peer` is real and blocking, but **workspace**, not tarball |
| 8 | Optional peer absent / incompatible / installed | uncovered | **1 of 3 lanes**, and it records the *opposite* of the row's premise |
| 9 | CSP + Trusted Types | uncovered | **half** — a strong nonce-based CSP lane exists; **Trusted Types: nothing at all** |
| 10 | Licence / entitlement failure behaviour | uncovered | **half** — licence metadata is audited; no entitlement concept exists in OSS |
| 11 | Tarball file/export/API diff | uncovered | **partial** — API diff exists but runs **degraded**; no file-level diff |
| 12 | SBOM + vuln/licence + provenance/hash | uncovered | **generated once, not a gate**, and now superseded |

**Corrected baseline: not 5/12 covered but 4 fully covered, 6 partial, 2 empty.**
The packet's headline "seven rows have no fixture at all" is false for five of
the seven — they have a lane that measures something adjacent to the row. That
distinction matters, because reusing a partial lane is cheap and rebuilding one
from scratch is not.

### 2a. Three facts in my task brief were wrong — recorded so the next agent does not lose the hour

1. **`scripts/pack-smoke-test.sh` and `scripts/consumer-fixture.sh` do not
   exist.** The brief instructed me to use both. `scripts/` contains only
   `check-external-links.mjs`, `credential-scan.sh`, `release-rehearsal.sh` and
   `release-checks/{dist-artifacts,esm-only}.sh`.
2. **The `npm pack` warning is already obeyed everywhere.** Every pack path in
   the repository already uses `yarn pack` (`packages/tooling/src/release/pack.ts:90`,
   `packages/nuxt/scripts/pack-fixtures.mjs`, `e2e/styling/pack-styles.mjs`),
   explicitly because `npm pack` copies `workspace:*` verbatim. The only
   surviving `npm pack` is the **dead CI step** at `.github/workflows/ci.yml:318`
   (`npm pack --dry-run | tee | grep`, which cannot fail — D151, untouched).
3. **The build was not "exactly 14 TS errors".** 14 was the first layer only;
   see §3b.

---

## 3. The red build — which path I took, and the evidence

### 3a. Layer 1 — D-S0O1-1(b) verified, then applied

The recommendation was **verified against the real errors before applying**, as
instructed. `yarn build` before: **exit 1, exactly 14 errors**, all under
`packages/codemods/src/transforms/__fixtures__/swap-icon-library/`:

| Error | Count | What it is |
|---|---:|---|
| `TS2307` cannot find `@lucide/vue` | 8 | the **post-swap** module, installed nowhere **on purpose** — emitting that specifier is precisely what `swap-icon-library` is asserted to do |
| `TS2307` cannot find `../../utilities/cn.ts` | 2 | the fixture reproduces the *shape* of a `packages/core` module; the relative path is meaningless inside `codemods` and is never resolved |
| `TS7016` implicit `any` on a deep `lucide-vue-next` subpath | 2 | the **pre-swap** deep-import form the transform must rewrite |
| `TS4058` `IconProps` cannot be named | 1 | same fixture family |

**The recommendation holds, and for a stronger reason than it stated.** The
fixtures are **never imported as modules**: `transforms/__tests__/swap-icon-library.spec.ts:32`
resolves the directory and reads the files as **text**. Type-checking them
reports the fixture as the bug — verbatim the reasoning already written into
`packages/tooling/tsconfig.json`, which excludes `src/**/__fixtures__/**` for
exactly this. Applied to `packages/codemods/tsconfig.json`.

**Proof that no published output changed** — the entry points are byte-identical
across the fix:

| `packages/codemods/dist` | before | after |
|---|---|---|
| `index.js` sha256 | `c65f57f3968fdf46…` | **`c65f57f3968fdf46…` (identical)** |
| `index.d.ts` sha256 | `c170cee44eb96450…` | **`c170cee44eb96450…` (identical)** |
| total files | 86 | **57** |
| `__fixtures__` files | **31** | **0** |

The fix does not add or alter one byte of published surface; it **removes 31
fixture artifacts that were being compiled into a package whose `files` field is
`["LICENSE","bin","dist"]`**. `exports` names only `./dist/index.js`, so no entry
point moved.

**Deliberately not done:** I did *not* also exclude `src/**/__tests__/**`, which
would have been the tidier edit. 22 compiled spec files remain in `dist`, and
they reference `../__fixtures__/…` which no longer exists there. That is a real
defect — and it is exactly what the row-11 tarball-diff gate exists to catch, so
it is **reported by the new lane rather than hidden by me**. Hiding it would have
made my own gate's first run a false green.

### 3b. Layer 2 — unblocking codemods revealed a broken `@dzup-ui/nuxt`

This is the finding of the task. `yarn build` compiles 8 workspaces in order and
stopped at codemods, the **6th**. With codemods fixed it reached the 7th and
produced **17 new errors**, none of which anything in the repository had ever
seen:

| Error | Count | Cause |
|---|---:|---|
| `TS6059` "not under `rootDir`" | 16 | `packages/nuxt/src/module.ts:1` imports `@dzup-ui/contracts`; `tsconfig.base.json` maps that to **contracts source**, so all 16 contracts files became program inputs outside nuxt's `rootDir: ./src` |
| `TS2322` `string` not assignable to `OwningPackage` | 1 | `module.ts:246` — a genuine type defect |

**Both are regressions in the *uncommitted* TASK-S3-O1 work, not in `4e4e46f`.**
Proved directly:

```
git show HEAD:packages/nuxt/src/module.ts | grep -c "@dzup-ui/contracts"   →  0
```

The committed `module.ts` does not import contracts at all; S3-O1's second-tier
resolver wiring added the import. **S3-O1 could not have seen this**, because the
build was already red two workspaces earlier — and, decisively:

> **`yarn typecheck:all` does not include `packages/nuxt`.** It checks tokens,
> contracts, testing, core, compat, codemods, mcp (×2) and `apps/landing`. Nuxt
> is in neither `typecheck`, `typecheck:all`, nor `validate:all`.

So a **published package** had no type gate whatsoever. `yarn workspace @dzup-ui/nuxt typecheck`
reproduced all 17 independently.

**A third, silent symptom:** because contracts resolved to source under a
violated `rootDir`, the nuxt build **emitted 48 stray `.js` / `.d.ts` / `.js.map`
files into `packages/contracts/src/`** — build output written into a source tree,
against ADR-12. I removed all 48 (every one untracked with a sibling `.ts`);
S3-O1's two genuinely-new source files (`ownership-manifest.ts`,
`ownership-manifest.spec.ts`) were preserved. Dirty count returned to 190 + my
own edits.

**What I changed, minimally, preserving every line of S3-O1's logic:**

| File | Change |
|---|---|
| `packages/nuxt/tsconfig.json` | became the **typecheck view**: no `rootDir`, `noEmit: true`. Keeps contracts resolving to source, honouring the base config's own rule that *"a typecheck must not depend on whether someone has run `yarn build`"* |
| `packages/nuxt/tsconfig.build.json` | **new build view**, same shape and precedent as `packages/contracts/tsconfig.build.json`. Restores `rootDir: ./src` + declaration emit (so the published layout is unchanged) and **drops the `@dzup-ui/contracts` → source `paths` entry**, so the built package compiles against the same `dist/index.d.ts` a consumer receives |
| `packages/nuxt/package.json` | `build` → `tsc --project tsconfig.build.json` |
| `packages/nuxt/src/module.ts` | one annotation: `const rows: { name: string, from: string }[]`, which is **the function's own already-declared return type**. Inference had narrowed `from` to the generated `OwningPackage` union, which cannot express the `pkg/sub` specifier S3-O1's second-tier rows legitimately carry. Behaviour unchanged |

### 3c. Result

```
yarn build   →  exit 0        (0 errors; was exit 1 with 14, since 589be13)
```

All **8 of 8** workspaces emit — `@dzup-ui/nuxt` and `@dzup-ui/mcp` build for the
first time in this programme. No stray emits into any source tree.

| Link | Gate | Before (S0-O1, at `4e4e46f`) | Now |
|---:|---|---|---|
| 44 | `validate:externals` | **red** | **0 — green** |
| 45 | `validate:dts` | **red** | **0 — green** |
| 48 | `validate:peers` | red | **1 — still red, untouched** |

Link 48 is the genuine `lucide-vue-next` two-version resolve (**D174/D175**). It
is *not* mine to take: it needs manifest changes in two apps plus a lockfile
update, and the upstream package is deprecated in favour of `@lucide/vue`. **No
ratchet was raised and no allowlist widened to clear anything.**


---

## 4. Implemented files and API effect

### 4a. New — the qualification lane

| File | What it is |
|---|---|
| `e2e/package-qualification/matrix.ts` | the twelve-row scope contract: row list, requirement text, `RowResult`/`Verdict` types, the standing second-tier reason |
| `e2e/package-qualification/stage.ts` | the only place a consumer workspace is built. `fullStage` reuses `packAll`; `controlledStage` packs the same tarballs but installs **no** junction, provisioning each third-party peer as `link` / `absent` / `stub` |
| `e2e/package-qualification/rows-bundle.ts` | rows **2** and **6** — consumer production build, and per-component tree-shaking with the engine measured by difference |
| `e2e/package-qualification/rows-peers.ts` | rows **7** and **8** — peer floor matrix, and the three optional-peer lanes |
| `e2e/package-qualification/rows-policy.ts` | rows **9**, **10**, **11** — CSP/Trusted-Types sink scan, licence + entitlement, tarball file/export diff |
| `e2e/package-qualification/rows-supply.ts` | row **12** — drives `release:evidence` into the candidate directory and gates its output |
| `e2e/package-qualification/qualify.ts` | the orchestrator: runs all twelve, writes the report, exits 1 on any red |
| `package.json` | `qualify:package` script + its `//` doc entry |

### 4b. Changed — to make the build complete (§3)

| File | Change | Published effect |
|---|---|---|
| `packages/codemods/tsconfig.json` | exclude `src/**/__fixtures__/**` | **removes** 31 fixture artifacts from `dist`; entry points byte-identical |
| `packages/nuxt/tsconfig.json` | becomes the typecheck view | none |
| `packages/nuxt/tsconfig.build.json` | **new** build view | none — same `rootDir`, same emitted layout |
| `packages/nuxt/package.json` | `build` points at the build view | the package **builds at all**, for the first time since the S3-O1 import landed |
| `packages/nuxt/src/module.ts` | one type annotation, its own declared return type | none — behaviour unchanged |
| `packages/core/README.md` | **new** section "Peer dependencies" | documentation only, and a **precondition**: `<requirements><degradation>` forbids asserting an undocumented behaviour, so row 8's contract had to be written before it could be tested |
| `.changeset/olive-pugs-invite.md` | **new**, `@dzup-ui/nuxt: patch` | — |

**Public API effect: none.** No file under `packages/*/src` changed except the
one `module.ts` annotation, which alters no signature. No export was added,
removed or renamed; `validate:exports` and `validate:published-imports` both
exit 0.

**Not written:** no ratchet raised, no allowlist widened, no exception added, no
baseline replaced, no maturity level relabelled. Nothing committed.

---

## 5. Focused validation output

Every command run unpiped, exit code written to a file and read from it. `npx`
avoided throughout; `vite` is used through its Node API.

| # | Command | Exit | Note |
|---:|---|---:|---|
| 1 | `yarn build` | **0** | was **1**. All 8 workspaces emit |
| 2 | `yarn typecheck` | **0** | |
| 3 | `yarn lint` | **0** | first run 20 errors, all in this task's new files; fixed at the defect |
| 4 | `yarn test` | **0** | **556 files, 10,637 passed, 3 skipped, 1 todo, 0 failed** — identical to the inherited baseline, so nothing here broke a test |
| 5 | `yarn qualify:package` | **1** | **9 green / 2 red / 1 blocked**; both reds are genuine, newly-detected defects |
| 6 | `yarn validate:all` | **1** | 51 links, first red at **48** (`validate:peers`) |
| 7 | `yarn validate:externals` (44) | **0** | was red |
| 8 | `yarn validate:dts` (45) | **0** | was red |
| 9 | `yarn validate:licenses` (49) | **0** | |
| 10 | `yarn validate:tree-shake` (50) | **0** | |
| 11 | `yarn validate:evidence-binding` (51) | **0** | S0-O1's gate still green after this task's edits |
| 12 | `yarn validate:exports` · `validate:published-imports` | **0** · **0** | the published surface is unchanged |

---

## 6. Aggregate qualification

**`validate:all`: 50 of 51 links green**, up from 48 of 51. The single red is
link 48, `validate:peers` — the `lucide-vue-next` two-version resolve
(**D174/D175**), pre-existing, untouched, and correctly left red.

| State | First red | Green |
|---|---|---:|
| S0-O1 end (inherited) | 44 / 51 `validate:externals` | 48 of 51 |
| **this task end** | **48 / 51 `validate:peers`** | **50 of 51** |

### 6a. The twelve rows — final verdicts at `4e4e46f`

Full report: `docs/qa/release/2026-09-22-4e4e46f/package-qualification.md` (+ `.json`).

| # | Row | Core only | Second tier |
|---:|---|---|---|
| 1 | ESM import + declarations from tarball | **green** _(cited, re-run)_ | blocked |
| 2 | Vite production build of a consumer app | **green** — 66,998 B / 12,880 B gzip from the tarball, CSS present | blocked |
| 3 | Nuxt SSR + auto-import | **green** _(cited)_ | blocked |
| 4 | Resolver ownership | **blocked** — first-tier half green; the packed second-tier half has never executed | blocked |
| 5 | CSS/token import order | **green** _(cited)_ | blocked |
| 6 | Tree-shaking, engine separated | **green** — 4 components, 0 sentinels leaked, engine measured alone | blocked |
| 7 | Min + current peers | **green** — 5 peers, every floor explicit, no split floor | blocked |
| 8 | Optional peer absent/incompatible/installed | **green** — all three lanes fail-closed as documented | blocked |
| 9 | CSP + Trusted Types | **RED** — CSP half green (cited); Trusted-Types half unimplemented, 1 governed sink shipped | blocked |
| 10 | Licence / entitlement | **RED** — `@dzup-ui/mcp` ships no LICENSE file | blocked |
| 11 | Tarball file/export/API diff | **green** — 0 broken entry points, 0 leakage, 0 divergence across 6 tarballs | blocked |
| 12 | SBOM + vuln/licence + provenance/hash | **green** — 6 tarballs, 143 deps, 0 blocked, 0 unresolved protocols | blocked |

**9 green · 2 red · 1 blocked.** Every blocked cell names its reason; there are
no unexplained blocks and no fabricated verdicts.

**The second-tier column is blocked for all twelve rows, by one probe:**
`require.resolve('@dzup-ui-pro/pro/package.json')` reports not installed. Per
`<stop_conditions>` that is the correct outcome, not a failure — obtaining a
second-tier tarball is not this repository's work.

### 6b. What the new rows actually measured

**Row 6 — the number doc-08 asked for and nothing had ever produced.** The
pre-existing `validate:tree-shake` externalises `reka-ui` in every build, so the
engine's cost was subtracted before anything was measured. Measured here by
building each entry twice from the tarball, identical but for that one external:

| Component | Library gzip | + engine | **engine alone** |
|---|---:|---:|---:|
| `DzButton` | 4,315 B | 4,315 B | **0 B** |
| `DzInput` | 7,199 B | 7,199 B | **0 B** |
| `DzSelect` | 8,448 B | 28,381 B | **19,933 B** |
| `DzAlert` | 4,796 B | 4,796 B | **0 B** |

The engine is genuinely absent from three of four components and costs **2.4x
the component itself** on the fourth. That is a good result, and it is the first
time it has been a measurement rather than a claim. No sentinel leaked.

**Row 7 — five peers, all sound:** `vue ^3.5.0` (floor 3.5.0, installed 3.5.31,
declared identically by contracts and core — no split), `reka-ui ^2.0.0`
(2.9.2), `nuxt >=3.0.0` (4.4.5), and the two first-party ranges.

**Row 11 — the six published tarballs are clean**, and the measurement worth
keeping is `@dzup-ui/core`: **1,461 files, 3.37 MB**, because it ships `src/`
and `stories/` alongside `dist/`. That is legitimate (`files` says so) but it is
~8x the next largest tarball and nobody appears to have decided it deliberately.

---

## 7. Findings — two red rows, both real, both newly detectable

### F1 — the Nuxt module injects an inline script with **no nonce** (row 9)

`packages/nuxt/src/module.ts:375` pushes the ADR-15 FOUC-prevention theme script
into `nuxt.options.app.head.script` as `innerHTML`, with no nonce. Under a
strict `script-src 'self' 'nonce-...'` that inline script is **blocked**, so FOUC
prevention silently stops working in exactly the deployments most likely to run
a strict CSP. Under `require-trusted-types-for 'script'` it throws.

**This is not a missing feature — the contract already exists and is unused.**
`@dzup-ui/contracts` defines `DZ_NONCE_KEY` and the provider contract carries
`nonce` (ADR-20); `DzProvider` has contract specs for it. The Nuxt module never
reads any of it: `grep -n nonce packages/nuxt/src/module.ts` returns **zero
matches**. The existing `e2e/csp` lane could not see this because it tests a
Vite consumer app, not the Nuxt module.

### F2 — `@dzup-ui/mcp` publishes MIT and ships no LICENSE (row 10)

`packages/mcp/package.json` declares MIT and lists
`["README.md","dist","docs","server.json"]` in `files`. **`LICENSE` is not in
that list**, and it is in every other published package's. The tarball therefore
carries an MIT declaration with no licence text. 5 of 6 packages ship it; mcp is
the only gap, which is what makes it an oversight rather than a policy.

Deliberately **not fixed here**: it changes the contents of a published tarball
and needs a changeset, so it is a packaging decision (**D-S2O1-2**), and leaving
the row honestly red is the correct demonstration that the gate works.

### F3 — `yarn typecheck:all` does not include `packages/nuxt`

A **published** package with no type gate in any lane. This is why S3-O1's
regression reached the worktree invisibly. See **D-S2O1-1**.

### F4 — `packages/codemods/dist` ships 21 compiled spec files

Reported, not gated: codemods is `withheld` in `release-policy.json`, so it
cannot fail a release today. The lane reports it under
`detail.withheldPackagesReportedNotGated`. This is the finding section 3a
deliberately left visible instead of hiding behind a second tsconfig exclude.

### F5 — the licence-exception schema has no `reachability` field

`<requirements><exceptions>` demands owner + expiry + **reachability**. The
schema in `packages/tooling/scripts/licence-exceptions.json` carries `owner`,
`reason` and `expires` — not reachability. The list is **empty**, so the clause
passes vacuously today and row 12 is green; but the next exception cannot
satisfy the requirement, because there is nowhere to put the answer. Row 12
asserts all four fields, so it will fail the moment an entry is added without
one. See **D-S2O1-4**.

### F6 — a false green in this task's own first draft, recorded deliberately

Row 6's first implementation collected bundle text from `*.js` only. Vite's `es`
lib format emits `bundle.mjs`, so it gzipped the **empty string** — a constant
20 B for every component — and every sentinel check passed against an empty
haystack. **Row 6 reported green while measuring nothing.** It is fixed (`.mjs`
accepted, and an empty bundle now throws rather than being measured), and it is
written down because it is the exact failure this matrix exists to prevent,
produced by the matrix itself on its first run.

---

## 8. Ratchet movements (old to new), all bound to `4e4e46f`

| Ratchet | Old | New | Moved by |
|---|---:|---:|---|
| **doc-08 rows covered** | **5 of 12** claimed / 4 full + 6 partial measured | **12 of 12 stated — 9 green, 2 red, 1 blocked** | this task |
| doc-08 rows with a runnable tarball fixture | 4 | **11** (all but row 4's second-tier half) | this task |
| `yarn build` exit code | **1** (since `589be13`) | **0** | this task |
| Workspaces that build | 5 of 8 | **8 of 8** | this task |
| `validate:all` links green | 48 of 51 | **50 of 51** | links 44, 45 fixed |
| `validate:all` first failing link | 44 / 51 | **48 / 51** | — |
| Published packages with no type gate | 1 (`nuxt`, unknown) | **1 (`nuxt`, now named)** | measurement — **not fixed**, see D-S2O1-1 |
| Fixture artifacts in `packages/codemods/dist` | 31 | **0** | this task |
| Optional-peer lanes that exist | 1 of 3 | **3 of 3** | this task |
| Trusted-Types sinks measured in packed bytes | never measured | **1, named** | this task |
| Published tarballs missing a LICENSE | unknown | **1, named** | measurement — **not fixed**, see D-S2O1-2 |
| `qualify*` scripts | 0 | **1** | this task |
| Test files / tests | 556 / 10,637 | 556 / 10,637 | unchanged — nothing broken |
| `validate:peers` (link 48) | red | **red** | **not moved** — D174/D175, owner |
| AT cells executed | 0 of 534 | **0 of 534** | **not moved, deliberately** — human only |
| `maxProposedCitedFromCode` | 3 | 3 | S0-O3, owner |

**No ratchet raised. No allowlist widened. No exception file touched.**

---

## 9. Owner decisions raised

### D-S2O1-1 (red) — `@dzup-ui/nuxt` had no type gate, and shipped a broken build because of it

**Fact.** Section 3b. The package does not appear in `typecheck`,
`typecheck:all` or `validate:all`; `yarn build` was the only thing that would
have caught it, and it was already red two workspaces earlier for an unrelated
reason.

| Option | Cost |
|---|---|
| **(a)** add `tsc --noEmit -p packages/nuxt/tsconfig.json` to `typecheck:all`, **and** add `yarn build` as a `validate:all` link | two lines. Closes the class, not just this instance. This is also D-S0O1-1 option (c), now unblocked because the build is green |
| **(b)** add the typecheck only | catches type errors, not emit/`rootDir` errors — which is what actually happened |
| **(c)** nothing | the next agent to touch `packages/nuxt` repeats this exactly |

**Recommendation: (a).** Not done here: appending a `validate:all` link changes
the aggregate's contract, and S0-O1 section 5b argues that link numbering is
cited across four ledgers. It is a one-line owner act with a clear payoff.

### D-S2O1-2 (amber) — `@dzup-ui/mcp` ships no LICENSE file

**Fact.** F2. Declares MIT, does not ship the text; the other five do.

| Option | Cost |
|---|---|
| **(a)** add `"LICENSE"` to `packages/mcp/package.json#files` and ensure the file exists | one line plus a `patch` changeset. Row 10 goes green |
| **(b)** leave it | a published MIT package with no licence text is a legal defect, not a cosmetic one |

**Recommendation: (a).** Not done here because it changes published tarball
contents, which is a release act.

### D-S2O1-3 (amber) — Trusted Types: implement, or state the posture

**Fact.** F1. One governed sink ships (`@dzup-ui/nuxt` `dist/module.js`,
`innerHTML`), no policy is created anywhere, and the `trustedTypes?: boolean`
field on the provider contract is read by nothing.

| Option | Cost |
|---|---|
| **(a)** thread the existing nonce through the Nuxt module's head script (`DZ_NONCE_KEY` / `nonce` already exist in the contract) and add a `require-trusted-types-for` lane to `e2e/csp` | the smaller half is real: the module simply never reads a contract that is already there. Makes row 9 green |
| **(b)** declare Trusted Types out of scope and delete `trustedTypes?: boolean` | honest and cheap, and loses a genuine capability — but a typed field nothing reads is worse than no field |
| **(c)** leave both | row 9 stays red and the FOUC script stays CSP-blocked for strict-CSP consumers |

**Recommendation: (a) for the nonce half immediately** — it is a defect whose
fix is already in the repository — and **(a) or (b) for Trusted Types as a
separate, deliberate choice.**

### D-S2O1-4 (green) — the licence-exception schema cannot express reachability

**Fact.** F5. Row 12 asserts owner + expiry + reachability; the schema has the
first two. Vacuous today (zero exceptions), blocking the first time one is added.

**Recommendation:** add `reachability` to `$rules` and to the entry shape now,
while the list is empty and the change costs nothing.

### D-S2O1-5 (green) — `@dzup-ui/core` ships 1,461 files / 3.37 MB

**Fact.** Section 6b. It ships `src/` and `stories/` beside `dist/`. Legitimate
and declared, but ~8x the next tarball and apparently never decided. Options:
keep it (source maps and story-driven docs are genuinely useful to consumers),
or split the sources into a separate artifact. **Recommendation: measure demand
before changing anything** — this is a note, not a defect.

### D-S2O1-6 (amber) — where `qualify:package` should be wired

It is not in `validate:all`: it packs six tarballs and runs ~10 Vite builds —
minutes, not seconds — and it writes into `docs/qa/release/`. Options:
**(a)** add it to `rehearse:release` only; **(b)** add a `validate:release`
aggregate; **(c)** CI-only on a release branch. **Recommendation: (a)** — it is
release-candidate evidence, and that is what the rehearsal is for.

---

## 10. `done_check` scored, final state, and the ranked next packet

### 10a. `done_check` — **1 of 4 at `4e4e46f`** on entry, **4 of 4 on exit**

| # | Clause | On entry | On exit |
|---:|---|---|---|
| 1 | a `qualify:package`-shaped lane exists | FAIL | **pass** |
| 2 | fixtures for tree-shake, peers, optional-peer, csp, tarball-diff, sbom | FAIL | **pass** — all six, plus consumer-build and licence |
| 3 | the lane runs to completion and names all twelve rows with a verdict | FAIL | **pass** — exit 1 by design (2 red rows), report names 12 of 12. **Clause defective:** it writes to `/tmp/qp.log`, unwritable here |
| 4 | an SBOM exists for the latest candidate | pass (on a superseded artifact) | **pass** — freshly generated at `2026-09-22-4e4e46f`. **Clause defective:** cannot distinguish current from stale |

Both defective clauses are recorded in section 1a. Consistent with every prior
task in this programme, the checks that "passed" were the least informative ones.

### 10b. Final state

**Worktree:** `4e4e46f`, **197 dirty paths** — the **190 inherited from S0-O1 /
S1-O2 / S3-O1 all preserved**, none reverted, stashed, checked out or cleaned,
plus this task's own. Nothing committed, pushed, published, dispatched,
deployed or baseline-replaced. No registry was contacted except the npm advisory
endpoint, read-only, by the pre-existing evidence generator.

48 stray build artifacts that the first unblocked build wrote into
`packages/contracts/src/` were removed (section 3b); S3-O1's two genuinely-new
source files there were preserved.

### 10c. Ranked next packet

1. **D-S2O1-1(a) — gate `packages/nuxt`, and add `yarn build` to `validate:all`.** (red)
   Two lines. The build is green for the first time in this programme, so the
   gate that keeps it green can finally be added. Until it is, nothing stops
   the next uncommitted change from breaking a published package invisibly —
   which is exactly what happened here.
2. **TASK-S2-O2 — release report + stop-condition gate + deprecation machinery.** (amber)
   **Unblocked by this task and ready now.** It needs a completed build (has
   one) and a per-row qualification verdict to quote (has one:
   `docs/qa/release/2026-09-22-4e4e46f/package-qualification.json`). Two of the
   eleven 08-11 stop conditions — "tarball differs from the reviewed build or
   has undeclared files or entry points" and "optional-peer path fails open" —
   are now **mechanically detectable** for the first time, so S2-O2 can gate on
   them rather than describing them.
3. **D-S2O1-3(a) — thread the nonce through the Nuxt module.** (amber)
   A real defect with its fix already in the contract layer.
4. **D-S2O1-2(a) — ship `@dzup-ui/mcp`'s LICENSE.** (amber) One line.
5. **D174/D175 — the icon-library swap.** (red, unchanged)
   Still the only red link in `validate:all`, and now the *only* one.

### What a reader should take from this report, in one paragraph

The build was red for one reason and turned out to be red for two. Excluding the
codemods fixtures — verified first, and it removed 31 junk files from a
published `dist` without moving a byte of any entry point — let the build reach
`@dzup-ui/nuxt` for the first time and immediately exposed **17 errors from the
uncommitted S3-O1 work, in a published package that no type gate covers at all**.
With both fixed, `yarn build` exits 0 for the first time since `589be13` and
`validate:all` is 50 of 51. On that foundation the package-qualification matrix
is complete: all twelve doc-08 rows now have a stated verdict, eleven of them
backed by a fixture that consumes a real `yarn pack` tarball in a throwaway
consumer workspace. Nine are green, two are red on **genuine defects nothing in
the repository could previously see** — the Nuxt module injecting a nonce-less
inline script under a strict CSP, and `@dzup-ui/mcp` publishing MIT with no
licence text — and one is blocked because the second tier is not installed, which
is the correct answer. The most useful single number the lane produced is that
`reka-ui` costs **19,933 B gzip on `DzSelect` and 0 B on `DzButton`**: the
optional engine really is optional, and now that is measured rather than
asserted. And the lane caught itself reporting a false green on its first run,
which is recorded in full as F6.

---

## 11. Final verification, re-run after the last edit to any file

The prompt's three `<validation>` commands, plus everything a new document can
break. Each run unpiped, exit code read directly.

| Command | Exit | Result |
|---|---:|---|
| `yarn qualify:package` | **1** | **by design** — 9 green · 2 red · 1 blocked; all twelve rows named |
| `yarn test:nuxt-fixtures` | **0** | 12 passed, 8 skipped — `core-pro: unrun — needs @dzup-ui-pro/pro`, skipped **by name**, which is the correct outcome |
| `yarn validate:all` | **1** | 51 links, **50 green**, sole red at link 48 (D174/D175) |
| `yarn build` | **0** | 8 of 8 workspaces |
| `yarn typecheck` · `yarn lint` · `yarn test` | **0** · **0** · **0** | 556 files, 10,637 passed, 0 failed |
| `validate:package-names` (39) | **0** | re-run **after** this report was written — D-S0O1-2's tax not incurred |
| `validate:adr-references` (42) | **0** | same |
| `validate:readme-facts` (43) | **0** | re-run because `packages/core/README.md` gained a section |
| `validate:doc-snippets` · `validate:docs-size` · `check:links` | **0** · **0** · **0** | the new report and the new candidate directory break nothing |
| `validate:evidence-binding` (51) | **0** | S0-O1's gate still green |

`yarn test:nuxt-fixtures` deserves a note: it exercises the **same
`packages/nuxt` package whose build this task repaired**, through a real
`yarn pack` + `npm install` outside the repository, and it passes. That is
independent confirmation that the `tsconfig.build.json` split changed the
build's *correctness* and not its *output*.

### Artifacts written

```
docs/qa/release/2026-09-22-4e4e46f/
  package-qualification.md      ← the twelve-row report, all rows, per-row verdict
  package-qualification.json    ← the same, machine-readable, for TASK-S2-O2
  sbom.cdx.json · sbom/         ← CycloneDX 1.6, aggregate + 6 per-tarball
  supply-chain.json · .md       ← 143 distinct deps · 0 blocked · 0 unresolved protocols
  hashes.json · provenance.json ← sha256+sha512 per tarball and per file; provenance UNSIGNED [!owner]
```

**No registry was mutated.** The only network use was the pre-existing evidence
generator's read-only query to the npm advisory endpoint, which reported
`advisoryStatus: "mixed"` — recorded as `not-run` per package rather than
claimed as zero.
