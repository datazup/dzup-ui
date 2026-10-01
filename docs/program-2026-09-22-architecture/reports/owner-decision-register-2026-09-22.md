# Owner-decision register — architecture programme 2026-09-22

> **Refreshed by TASK-S0-O2.** Supersedes
> [`../../program-2026-09-04/reports/owner-decision-register-2026-09.md`](../../program-2026-09-04/reports/owner-decision-register-2026-09.md)
> as the **entry point**; that register remains authoritative for the full
> argument behind any id it raised.
>
> **Every number below was re-measured on 2026-09-24 at**
> `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` (`4e4e46f`). Nothing is copied from
> the prior register, and nothing is copied from this programme's README §2 —
> **five of §2's numbers are stale** (§1.1). Where a number could not be
> reproduced, its row says `unverified` and names the obstacle (§7).
>
> **What this document is not.** It takes no decision. Every row is a
> recommendation with costed options. **A4-D1 is not resolved here** — resolving
> it is the owner's act, and a register that wrote "decided" to satisfy a
> checklist would be the exact failure this programme has spent nine tasks
> catching. Row 1 carries a **dated re-measurement** instead (§3).

## 0. How to read this register

| Column | Meaning |
|---|---|
| **N** | This register's stable row number. It survives into the next programme; cite `register-2026-09-22 #N`. |
| **id** | The historical id(s) **as their source report spelled them**, newest first. Aliases after `≡` are the *same question in different clothes* and are merged here (§6). Ids are never renumbered. |
| **status** | `open` · `open — re-measured` · `superseded` (premise gone — closed, with the reason) · `taken` (recorded elsewhere; the artifact is cited) · `unverified` (number not reproducible now). |
| **blocks** | What cannot move until it is decided. |
| **evidence @ `4e4e46f`** | The measured fact, bound to the commit. |
| **reproduce** | The exact command. Read its exit code **directly** — never through a pipe, and never from a background-task notification (§1.2). |
| **cost of delay** | What gets more expensive, or less reversible, while the row stays open. |

**Ordering is by what each row blocks — "the order they bite", as README §7 does.**
Part A is the publication critical path. Part B blocks a claim this repository
makes about itself. Part C is real and blocks nothing on the critical path.
Read Part A in one sitting; Part B and C can be scheduled.

**Row-count floor.** This programme's `EXECUTION-STATUS.md` carries **10** `[!]`
rows (`grep -c '^| TASK-S.*\[!' docs/program-2026-09-22-architecture/EXECUTION-STATUS.md`).
This register has **62** rows.

## 1. What moved, and what the README now gets wrong

### 1.1 Five README §2 / prior-register numbers are stale at `4e4e46f`

| Quoted | Where | Measured at `4e4e46f` | Command |
|---|---|---|---|
| Changesets: **38** (README §2) · **37** (prior register §1.2) | both | ~~42~~ **41** (TASK-S2-O3) | `find .changeset -name '*.md' -not -name 'README.md' \| wc -l` |
| `validate:all` = 50 links | README §2 | **55 links**, exit **1**, stops at link **51** | `node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"` |
| capability `stale 37` · `unrun 441` | README §2 | **stale 22** (C 21 · D 1) · **unrun 400** · **excepted 47** | `node -e "const c=require('./packages/core/docs/capability-matrix.json');console.log(JSON.stringify(c.totals))"` |
| artifacts stamp `527dbd1` | README §2 | **all four bound to HEAD** — S0-O1 closed it | `TASK-S0-O1-tree-truth-4e4e46f.md` |
| "the committed tree is green" | README §2 | **false** — the aggregate exits 1 at link 51 | `yarn validate:all > log 2>&1; echo "exit $?"` |

**The link count has now moved five times in three days.** Two live consequences:
`D-S1O3-5` was written when the chain stopped at link **48** and named links
49–52 as unreached; it now stops at **51** and the unreached set is **52–55**.
`D-S0O1-4` was written when `validate:evidence-binding` was link **51**; it is
now link **54**. Both rows below carry the corrected numbering. **Never quote a
link number without recounting it.**

### 1.2 Two harness hazards observed live

1. **A background-task completion notice reported "exit code 0" for
   `yarn validate:all` while the gate itself exited 1.** The notice reported the
   wrapping subshell's status. The real code was recovered only because the
   command was written `… > log 2>&1; echo "exit $?" > exitfile`. **A task
   notification is not a gate result** — same class as the pipe hazard, new disguise.
2. **`grep … | wc -l` masks grep's exit code** exactly as `grep … | head` does.
   Every count in this register was taken as `grep … > file; echo "exit $?"; wc -l < file`.

---

## Part A — blocking now: the publication critical path

| N | id | title | status | blocks | evidence @ `4e4e46f` | reproduce | options | recommendation | cost of delay | opened | re-measured |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **A4-D1** 🔴 | **Publish or freeze** | **open — re-measured 2026-09-24 at `4e4e46f`; decision-ready, not decided** (§3) | Everything: C12, all three registries, the docs site (#15, #16), every `npm install @dzup-ui/*` string in the docs, `llms{,-full}.txt`, MCP and `/r/**` | **6 of 6** published packages `E404` on npm · ~~42~~ **41** pending changesets (**corrected 2026-09-24 by TASK-S2-O3**: `ls .changeset/*.md` counts `.changeset/README.md`, which is changesets’ own boilerplate and not a changeset; `validate:release-policy` independently reports 41) · `allowMajor false` · the repository's own release gate says **STOP**: 11 stop conditions = 5 clear · **4 fired** · 1 unevaluable · 1 unattested | `for p in contracts core mcp nuxt testing tokens; do npm view "@dzup-ui/$p" version; done` · `find .changeset -name '*.md' -not -name 'README.md' \| wc -l` · `yarn validate:stop-conditions; echo "exit $?"` → **1** | (a) publish 0.x now · (b) prerelease/snapshot tag only · (c) freeze and keep qualifying | **(c) now with (b) as a committed, gated exit** — see §3 for the five prepared acts, the commands, the irreversibility and the rollback per path. **Path (a) cannot be taken today without overriding the repository's own stop-condition gate, which is itself a recorded stop condition.** | **high and compounding**: changesets grew **38 → 41 in two days**; version levels (#10) cannot be re-levelled after publication; npm names are claimed irreversibly on (a) *and* (b) | 2026-09-04 | 2026-09-24 |
| 2 | **D127** ≡ SC-1 ≡ SC-3 ≡ `D-S2O2-3(a)` 🔴 | **Commit the 255-path worktree** | open | **The most of anything here.** SC-1, SC-3, and the baseline half of SC-5; every `admissible` evidence artifact; #6; A4-D1 paths (a) and (b) | **255** dirty paths, all produced by the nine executed tasks of this programme · SC-1 fired: *"the candidate is `4e4e46f+255`, which is not a commit anyone can check out"* · SC-3 fired: **5** candidate artifacts stamped `provenance.admissible = false` | `git status --porcelain \| wc -l` → 255 · `yarn validate:stop-conditions; echo "exit $?"` (SC-01, SC-03 blocks) | (a) commit, then regenerate the candidate on the clean tree · (b) keep deferring · (c) commit in slices | **(a).** No agent may do it; nothing downstream is admissible without it. **See §5 for exactly what it clears — and the one thing it does not.** | **high**: every hour of new work adds paths, and every candidate generated meanwhile is stamped inadmissible by construction | 2026-09-19 | 2026-09-24 |
| 3 | **D174** ≡ **D175** ≡ `N5-04 D2` ≡ `D-S0O1-3` ≡ `D-S1O3-5` 🔴 | **Icon library: single-version violation, and the swap** | **open — option (b) EXECUTED 2026-09-25 by RESIDUAL-01; one owner command and option (a) remain.** All three `^0.475.0` declarants (`apps/landing`, `apps/sandbox`, **and `apps/landing/playground-template`**, which this row never named) are aligned **UP** to `^0.477.0`, so **0 declarants** remain on the old range. The gate reads `yarn.lock`, not the manifests, so the last step is the owner's **`yarn install`** (exactly 4 lockfile lines, enumerated in [`./RESIDUAL-01-gate-cleanup-handoff.md`](./RESIDUAL-01-gate-cleanup-handoff.md) §1.3) — an agent may not leave a mutated lockfile, and `yarn.lock`'s sha256 is **unchanged** by that task. **Measured with the aligned lockfile in place: link 51 ✓ and `yarn validate:all` exits 0 over all 60 links — the first green aggregate in this programme, and the first ever execution of links 52–59 inside it.** Option (a), the `@lucide/vue ^1.47.0` swap, is untouched and still right on the merits; the `deprecated-ident` advisory still prints. See §9.1 | **Link 51, therefore links 52–55** — `validate:licenses`, `validate:tree-shake`, `validate:evidence-binding`, `validate:deprecations` have **never run inside this programme's aggregate** | Link 51 = `validate:peers && validate:icon-duplicates`. **`validate:peers` itself PASSES**; the failure is `✗ [single-version] 2 versions resolve (0.475.0, 0.477.0); exactly 1 may` — `0.477.0` from `@dzup-ui/core`, `0.475.0` from `@dzup-ui/landing` **and** `@dzup-ui/sandbox`. `1 icon-library violation(s)` — the deprecation and the 40 drifting registry items print as `!` advisories and say *"not a failure"*. 40 generated `/r/**` items hand consumers the deprecated name | `yarn validate:peers > log 2>&1; echo "exit $?"` → **1** · `for l in licenses tree-shake evidence-binding deprecations; do yarn "validate:$l"; echo "exit $?"; done` → **0 0 0 0** | (a) full swap to `@lucide/vue ^1.47.0` + codemod + re-record visual and AT baselines + `minor` · (b) **align the two apps' range to `^0.477.0` only** · (c) leave both | **(b) TODAY, (a) as its own scheduled packet.** **New finding:** the *only* failing clause is `[single-version]`, and both offending declarants are **workspace apps, not published packages** — so (b) alone clears link 51 and makes links 52–55 measurable, at the cost of one range in two `package.json` files and **no re-baselining**. (a) remains right on the merits (upstream deprecation is permanent) and `minor` remains the right level per D175, but it is no longer the cheapest unblock. #17 (remove `apps/sandbox`) removes one of the two declarants for free | **high**: four gates, one of them the evidence-binding gate built precisely to catch this programme's failure mode, are unmeasured in the aggregate for as long as this stays open | 2026-09-21 | 2026-09-24 |
| 4 | **D146** ≡ `N5-01 D1` 🔴 | **`validate:changelog` ⇄ `validate:mcp`: the first `changeset version` turns the chain red** | open | The **first `changeset version`** — therefore A4-D1 paths (a) *and* (b); C15 | S0-O1's snapshot probe in a throwaway worktree: on a snapshot version `validate:changelog` **0 → 1 (5 of 7 entries)** and `validate:mcp` **0 → 1 (5 errors)**. Two facts the recorded workaround does not cover: a snapshot version has **no date to attach**, and `validate:mcp`'s regex **rejects the `-` inside a prerelease tag**, so it reports the *previous* release as newest | `TASK-S0-O1-handoff.md` §(snapshot probe); reproduce with `git worktree add` + `yarn changeset version --snapshot` in a throwaway copy, never the working tree | (a) widen the `mcp-surface.ts` heading regex to allow ` - YYYY-MM-DD` · (b) + sync the three version mirrors · (c) drop the ISO-date rule · **(d) NEW: also make the version parser accept a prerelease `-`** | **(a) + (b) + (d) together, before any release is attempted.** **`validate:mcp` yields, not `validate:changelog`** — an ISO date in a changelog entry is a consumer-facing fact (it answers *"when did this ship"*), whereas the heading-shape rule is an internal formatting preference with no consumer. **The recorded fix (a)+(b) is INSUFFICIENT**: it addresses the exclusivity but not the prerelease-parse defect, so a snapshot publish (A4-D1 path b) still turns the chain red after it | **high**: it fires on the *first* release act, i.e. at the worst moment, and path (b) — the cheap proof — is the path it breaks hardest | 2026-09-03 | 2026-09-24 (probe at `4e4e46f`) |
| 5 | **D158** ≡ `D-S2O2-5` 🔴 | **Barrel or manifest — which is authoritative?** | open | **The half of SC-5 that committing does NOT clear**; the published barrel; C12; `generate:exports` | `public-api.manifest.json` (its own `version` field reads **`0.0.1`** against a `0.2.0` package) **promises 6 symbols the barrel does not export** — `useCountdown`, `useIntersection`, `formatRemaining`, `toRemainingParts`, `UseIntersectionOptions`, `UseIntersectionReturn` — each recorded by the gate as *"no longer exported by the packed declarations"*, `severity: breaking`, `level: minor`. Symmetrically the barrel exports **5** symbols the manifest does not name: `useAffix`, `useCalendar`, `useInfiniteScroll`, `useScrollSpy`, `useScrollToTop`. `requiredLevel: minor`. So `generate:exports` would perform a **breaking removal with no changeset behind it** | `node -e "const d=require('./docs/qa/release/2026-09-22-4e4e46f/api-diff.json');const c=d.packages.find(p=>p.package==='@dzup-ui/core');console.log(c.requiredLevel);for(const x of c.changes.filter(y=>y.kind==='removed'))console.log(x.symbol,x.severity,x.level)"` | (a) the barrel is right — add the 6 to the manifest, no bump · (b) the manifest is right — ship the removal as a `minor` · (c) retire `public-api.manifest.json` as the barrel's source | **(a), unless those five composables were never meant to be public.** That is *"not a fact a tool can read"* (D158's own words) and it is the one input this row needs. **Correction to `D-S2O2-3`:** its claim that one owner act clears SC-1, SC-3 and SC-5 **together** is not quite right — this row is SC-5's **6th finding of 11** and no commit or baseline record touches it (§5) | **high**: it is on the critical path for A4-D1 *and* it is the one row that keeps SC-5 red after the commit. It also grows: the manifest declares `0.0.1` and drifts further every time the barrel moves | 2026-09-21 | 2026-09-24 |
| 6 | **`D-S2O2-3`** 🔴 | **Five of six published packages have no API baseline** | open | SC-5's other **5 of 11** findings; the stop-condition gate can never pass without it | SC-5 fired with **11** findings: **5** are `no baseline — every symbol is unbaselined, so no change is explained` (`contracts`, `mcp`, `nuxt`, `testing`, `tokens`); only `@dzup-ui/core` has one, at `manifest-only` fidelity against an `admissible:false` snapshot. The remaining **6** are #5's | `yarn validate:stop-conditions; echo "exit $?"` (SC-05 block) | (a) commit (#2), then `yarn release:api-surface:record` on the clean tree · (b) record now on the dirty tree · (c) exempt unbaselined packages | **(a).** (b) produces a baseline stamped `admissible:false` that SC-3 then fires on — a baseline nobody may cite. (c) is widening an exception to make a gate pass, which is itself a recorded stop condition | **high**: structurally red until done, so *no* release can be qualified, however good it is | 2026-09-23 | 2026-09-24 |
| 7 | **`D-S2O1-2`** 🟢 | **`@dzup-ui/mcp` declares MIT and ships no licence text** | **CLOSED 2026-09-25 by RESIDUAL-01 — option (a) executed in full.** `packages/mcp/LICENSE` is a byte-identical copy of the text its six siblings and the repository root carry (md5 `7281b4a9175a6c90c5572d47c901edeb`, CRLF, `Copyright (c) 2026 DataZup` unchanged); `files` now reads `["LICENSE","README.md","dist","docs","server.json"]`; `.changeset/the-mcp-package-ships-the-licence-it-declares.md` is the `patch`. **Tarball proof:** `yarn workspace @dzup-ui/mcp pack` → `tar -tzf` lists `package/LICENSE`, and `tar -xzOf … | md5sum` matches the siblings (`npm pack` is unusable here — `workspace:*` siblings yield `EUNSUPPORTEDPROTOCOL`). Row 10's only red clause (`rows-policy.ts:207`, *"ships no LICENSE file in its tarball"*) is satisfied; **the row's verdict should be re-read by `yarn qualify:package` after the commit, not now** — on a dirty tree that artifact is stamped `admissible:false` and fires SC-3 (§9.2, `D-RES01-2`) | Qualification **row 10 = FAIL**; publishing `@dzup-ui/mcp` | No `packages/mcp/LICENSE` file **and** `files` = `["README.md","dist","docs","server.json"]`. The other **five** published packages each have both the file and the `files` entry | `ls packages/mcp/LICENSE` → exit **2** · `node -e "console.log(require('./packages/mcp/package.json').license, JSON.stringify(require('./packages/mcp/package.json').files))"` | (a) add the file and the `files` entry + a `patch` changeset · (b) leave it | **(a).** A published MIT package with no licence text is a legal defect, not a cosmetic one. Cheapest row in Part A: one file, one line, one changeset | **low today, unbounded after publication** — it is only a defect once someone can install it, and then it is not fixable retroactively for anyone who already did | 2026-09-22 | 2026-09-24 |
| 8 | **`D-S2O1-3`** ≡ **`D-S3O3-5`** ≡ **`D-S3O3-6`** 🔴 | **Trusted Types posture, and the Nuxt module's nonce-less `innerHTML`** | open | **SC-8 fired**; qualification **row 9 = FAIL** | SC-8: *"row 9 … Trusted-Types half RED — 1 governed sink in packed bytes and no policy is created anywhere, so a consumer setting `require-trusted-types-for 'script'` would throw."* The sink is the ADR-15 FOUC script the Nuxt module itself writes (`packages/nuxt/src/module.ts`). `DzSanitizeContext.trustedTypes` / `trustedTypes?: boolean` exist on the provider contract and **nothing reads them**; `DZ_NONCE_KEY` and `nonce` already exist and the module never reads them either | `yarn validate:stop-conditions` (SC-08 block) · `grep -E '^\| *9 \|' docs/qa/release/2026-09-22-4e4e46f/package-qualification.md` | **two separable halves.** Nonce: (a) read `DZ_NONCE_KEY` in the Nuxt module head script. Trusted Types: (b) implement a policy in Core, then add the runner arm · (c) declare it out of scope and delete `trustedTypes?: boolean` | **(a) immediately — it is a defect whose fix is already in the repository.** Then **(b) or (c) as a deliberate choice**; a typed field nothing reads is worse than no field. `D-S3O3-5`'s ordering is right and must be kept: policy first, conformance arm second — an arm for an unimplemented feature is assertion without measurement. **`D-S3O3-6` is closed into this row**: the FOUC script is first-party code, so no corpus fixture can express it and none should be added | **medium**: strict-CSP consumers are broken from the first publish, and row 9 keeps SC-8 red | 2026-09-22 | 2026-09-24 |
| 9 | **D154** 🔴 | **`@dzup-ui/mcp`: 20 advisories, 8 `high`** | open | Publishing `@dzup-ui/mcp` | **20 advisory rows: 8 `high` · 11 `moderate` · 1 `low`**, all transitive, in `fast-uri` (7 high), `ip-address` (1 high + 2 moderate), `hono` (7), `@hono/node-server` (1), `qs` (2). `advisoriesTotal: 20`, `advisoryStatus: "mixed"`. The other five packages: **0** — three of them `status: "not-run"` with the honest reason *"declares no runtime dependencies … which is not the same as a clean audit"*. Audit queried **2026-09-22T18:29Z**, 94 packages | `node -e "const s=require('./docs/qa/release/2026-09-22-4e4e46f/supply-chain.json');console.log(JSON.stringify(s.totals));const m=s.packages.find(p=>p.package==='@dzup-ui/mcp');const by={};for(const r of m.advisoryRows)by[r.severity]=(by[r.severity]\|\|0)+1;console.log(m.advisoryRows.length,JSON.stringify(by))"` | (a) bump the transitives + `patch` changeset + re-run `release:evidence` · (b) triage and record accepted risks with owner/expiry/reachability · (c) withhold `@dzup-ui/mcp` from the first publication | **(a).** Every one has a fix available and it is mechanical. **Doc 08 names no severity threshold — setting one is part of this decision**, and it should be set now while the answer is cheap | **medium and rising**: the advisory list grows on its own; it was 20 at the 09-21 measurement and is 20 now, but the fixed-version floors keep moving | 2026-09-21 | 2026-09-24 |
| 10 | **`N5-01 D3`** 🔴 | **Re-level the 11 over-declared changesets** | open | The version numbers the first release ships | ~~42~~ **41** pending changesets (**corrected 2026-09-24 by TASK-S2-O3** — see row 1); `allowMajor false`; VERSIONING.md line 27 (`minor` **is** a breaking change in 0.x), line 29 (`major` **is** the 1.0 act), line 37 (`major` refused by `validate:release-policy`). The prior register measured **11** over-declared and **20 never audited**; the set has grown by 5 since and **the new ones are unaudited too** | `find .changeset -name '*.md' -not -name 'README.md' \| wc -l` → **41** · `yarn validate:release-policy; echo "exit $?"` (its own line reads *“41 pending changeset(s)”*) · audit requires reading each file's declared level against VERSIONING.md §2.1 | (a) re-level the over-declared, after auditing all ~~42~~ 41 · (b) keep them conservative | **(a), and audit all ~~42~~ 41 rather than the 11 already known.** Re-levelling takes `@dzup-ui/core` from `0.3.0` to `0.2.1`. **This is the most irreversible row in Part A**: a version number cannot be re-levelled after publication, and 0.x `minor` means "breaking", so an over-declared changeset publishes a false breaking-change signal permanently | **high and strictly one-way**: every new changeset adds to the unaudited set, and the window closes the instant A4-D1 goes to (a) or (b) | 2026-09-03 | 2026-09-24 |
| 11 | **D159** 🟠 | **No rollback-and-support document** | open | The first publication | OSS has no `docs/release/rollback-and-support.md`. `npm unpublish` is available for **72 h only** — after that the only lever is `npm deprecate` | `ls docs/release/rollback-and-support.md` | (a) write it before the first publication · (b) fold into the publication packet · (c) defer | **(a) — a prerequisite, not a follow-up.** The first release is the first moment it can be needed, and the 72-hour window means the document must exist *before* the act, not after the incident | **medium**: zero cost today, unbounded cost if the first publish needs a rollback and nobody wrote down how | 2026-09-21 | 2026-09-24 |
| 12 | **`N5-01 D2`** ≡ `N5-02 D6` 🟠 | **`@dzup-ui/compat` and `@dzup-ui/codemods`: release or formally withhold** | open | Whether either can ever ship | `release-policy.json` lists **6 published** (`contracts`, `core`, `mcp`, `nuxt`, `testing`, `tokens`); `compat` and `codemods` are **withheld** and already carry reasons in that file. Both are at `0.1.0-alpha.0`, both declare `publishConfig.access: public`, both are on the changesets `ignore` list | `node -e "const r=require('./packages/tooling/scripts/release-policy.json');console.log(JSON.stringify(r.published),JSON.stringify(r.withheld))"` | (a) release them · (b) formally withhold and say so in the README (status quo, reasons already recorded) | **(b), unless the codemods are meant to be consumable** — in which case (a) is the only honest answer, because a codemod nobody can install cannot migrate anybody. Note the tension with #3: the icon swap's value depends on a codemod that is currently unpublishable | **low**: the policy file already records the posture; what is missing is the README sentence | 2026-09-03 | 2026-09-24 |
| 13 | **A4-D2** ≡ **D166** 🔴 | **The docs domain does not exist** | open | A4-D1's ordering; #14; #15; every canonical link | **NXDOMAIN at three names**: `dzup-ui.com`, `www.dzup-ui.com` **and** `docs.dzup-ui.com` (the prior register measured apex and www only). `SITE_ORIGIN` is already `https://dzup-ui.com` and is baked into 3 registry indexes, 87 markdown mirrors, both `llms*.txt`, `sitemap.xml` and every canonical link | `nslookup dzup-ui.com` · `nslookup www.dzup-ui.com` · `nslookup docs.dzup-ui.com` — all three *"Non-existent domain"* | (a) register `dzup-ui.com`, one origin (`/`, `/storybook/`, `/docs/`) · (b) `docs.dzup-ui.com` as a second origin · (c) `datazup.com/ui/` | **(a)** — `SITE_ORIGIN` already points there, so (a) costs a registration and (c) costs a regeneration of all 282 `/r/**` files. **The prior register's §7.2 already established A4-D2 and D166 are one question; they are merged here and the pair is retired as two rows.** Decide before the first publish: free to change today, expensive after | **high, one-way**: the origin is already embedded in 282 generated files plus 87 mirrors; every regeneration makes the wrong answer more expensive | 2026-09-04 | 2026-09-24 |
| 14 | **D165** ≡ `D1-D2` ≡ `D2-D7` 🟠 | **Docs hosting target** | open | C14's second half; the deploy runbook (S2-O3) | Site is **built and not deployed**; no hosting resource exists | `ls apps/docs/.vitepress/dist \| head -3` · `docs-deployment-packet-2026-09.md` | (a) Cloudflare Pages · (b) GitHub Pages · (c) the existing `datazup.com` host | **(a)** — only (a) can set the `/r/*` and immutable-asset cache headers the docs packet §4 specifies | **medium**: the whole N2 exit condition ("discover, install, style and verify from published surfaces alone") is unmeetable until something is deployed | 2026-09-04 | 2026-09-24 |
| 15 | **D172** 🔴 | **Deploy the docs before or after A4-D1?** | open | The order of the whole docs packet | Site built, nothing published, **6 of 6 packages 404** — so every install command on a deployed site would return `E404` | `ls apps/docs/.vitepress/dist` · the npm loop in row 1 | (a) deploy after A4-D1 · (b) before, with install commands suppressed · (c) before, as-is | **(a)** — *"a live site whose every install command returns `E404` is worse than NXDOMAIN, because NXDOMAIN is honest."* This row is why #13 and #14 sit **behind** row 1 rather than beside it | **low**: it is an ordering decision and costs nothing to hold, but holding it stalls #13/#14 | 2026-09-21 | 2026-09-24 |
| 16 | **`D-S2O1-1`** ≡ `D-S0O1-1(c)` 🟢 | **`yarn build` is not a `validate:all` link, and `@dzup-ui/nuxt` has no type gate** | **CLOSED 2026-09-25 by RESIDUAL-01 — option (a) executed in full, both halves.** `tsc --noEmit -p packages/nuxt/tsconfig.json` is in `typecheck:all` (9 projects + apps; `yarn typecheck:all` → **exit 0**, zero output), and **`yarn build` is link 60** of `validate:all`, appended at the END so links 1–59 keep their numbers — the count is now **60**, measured not quoted. **It was not the one-line act this row predicted:** wiring the project in reported **6 × TS5097** because `packages/nuxt/tsconfig.json` set `allowImportingTsExtensions: false`, which rejects the repository's own mandated `.ts` specifiers (CLAUDE.md rule 5) in the three spec files. Nothing was excluded or allowlisted — the flag moved to `tsconfig.build.json`, where emit makes it mandatory and specs are already excluded, and `packages/nuxt/dist` is **md5-identical** before and after a rebuild. Net effect: three spec files went from unchecked to checked. `packages/nuxt` was the last published package with no type gate; that count is now **0**. See §9.3 | The class of defect that shipped a broken `@dzup-ui/nuxt` build | `yarn build` is **not** in the 55-link chain. `@dzup-ui/nuxt` appears in neither `typecheck` nor `typecheck:all`. **`D-S0O1-1` option (b) has landed** — `packages/codemods/tsconfig.json` now excludes `src/**/__fixtures__/**`, with the precedent comment intact — so the build is green again and option (c) is unblocked | `node -e "console.log(require('./package.json').scripts['validate:all'].includes('yarn build')?'YES':'NO')"` → **NO** · `grep -n exclude -A4 packages/codemods/tsconfig.json` | (a) add `tsc --noEmit -p packages/nuxt/tsconfig.json` to `typecheck:all` **and** `yarn build` as a chain link · (b) the typecheck only · (c) nothing | **(a).** (b) catches type errors but not the emit/`rootDir` error that actually happened. Appending a link changes the aggregate's contract and renumbers nothing (append at the end, as link 51 did) — it is a one-line owner act with a clear payoff. **The build half of `D-S0O1-1` is `superseded`; only its option (c) survives, here** | **medium**: the next agent to touch `packages/nuxt` repeats the same defect, and no gate says so | 2026-09-22 | 2026-09-24 |
| 17 | **D177** 🟢 | **Remove the `apps/sandbox` workspace** | open | Nothing on the critical path — but it is **one of the two declarants in #3** | `apps/sandbox` declares `lucide-vue-next@^0.475.0` and is one of the two workspaces causing the `[single-version]` failure. Retired as a product, still a workspace | the `validate:peers` output in #3 names it by path | (a) remove the workspace, deploy configs, changeset-ignore entry and ~10 doc references · (b) keep, with a signed justification · (c) retire the deployment only | **(c) now; (a) once the owner confirms the Coolify resource `dzup-ui-sandbox-production` and its DNS record can go.** **Promoted out of hygiene:** it was filed as "gates nothing"; it is in fact half of #3's cause, and removing it makes #3 option (b) a one-file change | **low, but it is the cheapest contribution to #3** | 2026-09-21 | 2026-09-24 |

---

## Part B — blocks a claim this repository makes about itself

| N | id | title | status | blocks | evidence @ `4e4e46f` | reproduce | options | recommendation | cost of delay | opened | re-measured |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 18 | **`N5-05 D-B`** + **`D-C`** · S0-O3 🟠 | **ADR-18/19/20 signature** | open | `maxProposedCitedFromCode` 3 → 0; calling any styling or provider contract "public" | **all three `Proposed`**: ADR-18 *(TASK-OSS-P2-01, 2026-08-20)*, ADR-19 *(P3-01, 2026-08-20)*, ADR-20 *(P4-01, 2026-08-21, five amendments)*. Gate: `0/3 Accepted · 3 Proposed cited from code (ceiling 3)`. Blast radius: ADR-19 cited from **273** source files, ADR-20 from **169**, ADR-18 from **1** | `grep -m1 -i '^- \*\*Status' docs/adr/ADR-1[89]-*.md docs/adr/ADR-20-*.md` · `yarn validate:adr-references; echo "exit $?"` → 0 · `grep -rl 'ADR-19' packages/*/src --include='*.ts' --include='*.vue' > f; wc -l < f` | sign all three · sign 19/20 and hold 18 on the Node floor (#19) · leave `Proposed` | **Sign ADR-19 and ADR-20 now; hold ADR-18 behind #19.** The engineering is complete (R0-O2 closed every divergence) and the ceiling must be lowered in the same change. An ADR that 273 files implement while `Proposed` is *"a rumour with a number"* | **medium**: a consumer reading ADR-19 cannot tell whether `data-part` is a contract or a draft, and the 08-11 "stable public semantics" promise cannot be made over a proposal | 2026-08-20 | 2026-09-24 |
| 19 | **`N5-04 D3`** / **D160** / **D176** 🔴 | **The Node floor — three reports, two answers** | open | ADR-18 acceptance (#18) | ADR-18 declares `^20.19.0 \|\| >=22.13.0`; SC-6 clear under Node **24.14.1**. Three reports disagree: `N5-04 D3` says `>=22.13.0`; `D160` says keep the range and fix one `globSync` import; `D176` says `>=22.13.0` with D160's fix as a legitimate interim, and **says explicitly that it differs from D160** | `node -e "console.log(require('./package.json').engines)"` · `yarn validate:engines; echo "exit $?"` | (a) `>=22.13.0` · (b) keep the range + fix the import · (c) defer | **(b) as the interim, (a) at 1.0** — and **record which one ADR-18 states**, because the ADR is wrong either way until it is edited. Node 20 left maintenance in April 2026, which argues for (a); `^20.19.0` is what every consumer's `engines` check reads today, which argues for (b) | **medium**: it is the single open input holding ADR-18, and #18 cannot complete without it | 2026-09-03 | 2026-09-24 |
| 20 | **`D-S1O4-1`** 🔴 | **Designate the authoritative perf capture host** | open | **Every other perf row (#21–#25).** Nothing in the perf lane can move first | `capture-environment.json`: **undesignated — in-place capture is refused**. Committed evidence was captured on `win32-x64-16c-node24`; **no CI runner is win32**, so every existing threshold is unreachable by CI | `yarn validate:perf-baselines; echo "exit $?"` → 0 (prints *"authoritative host: (undesignated — in-place capture is refused)"*) | A `linux-x64-dedicated` · B `win32-x64-16c-node24` (status quo) · C `linux-x64-ci` **scoped to `size` only** | **A, with C as the interim for `size` alone.** C can land this week and makes the 22 deterministic budgets gateable; A is what the other five families need and is a provisioning decision, not a code one. B keeps the measurement where no CI runner can reproduce it — the exact trap #26 found in the visual lane | **high within the perf lane**: it is the root of a five-row dependency chain, and all five have been blocked on it since 2026-09-23 | 2026-09-23 | 2026-09-24 |
| 21 | **D135** ≡ **D140** ≡ **`D-S1O4-4`** 🔴 | **20 of 22 export-size budgets are breached, and a capture would raise all 22** | open | **Precondition to #23.** Capturing first destroys the evidence that the capture was premature | **Re-measured independently for this register** (22 serial Vite builds, gzip, nothing written into the repository): **20 of 22 OVER their committed threshold, 2 under.** Worst `size:DzMention` **25,965 B vs 22,421 B = +15.8 %**; then `DzDataView` +9.3 %, `DzPersonaSelector` +7.2 %, `DzCombobox` +7.2 %, `DzTreeSelect` +7.1 %, `DzDataGrid` +6.8 %. Only `DzColorPicker` (−0.1 %) and `DzOrderList` (−0.3 %) are under. This reproduces S1-O4 §3.2 and R2-O7 §6.6 at a third commit | `measureExportSizes()` from `packages/tooling/src/perf/export-sizes.ts` over the 22 `kind === 'size'` baselines in `packages/core/perf/baselines.json`, compared against each `threshold` | (a) triage the growth before any capture · (b) accept it with a recorded user benefit and a named owner (`--raise-budget --owner --reason`) · (c) retire the per-export budgets | **(a).** Six exports are over +6 % and each is a fixture importing one symbol, so the regression is localisable. (b) is legitimate *if* the growth bought something — doc 06's point is that the benefit must be written down, not that a raise is forbidden. **The `<downward_only>` rule makes re-capturing-to-green the wrong move: it would raise 20 budgets** | **medium and accumulating**: the drift is real, ongoing and reproduced at three separate commits | 2026-09-19 | **2026-09-24 (independently reproduced)** |
| 22 | **`D-S1O4-6`** 🟠 | **Three components breach the 50 ms responsiveness budget, and a capture would legalise it** | open | **Precondition to #23** | `DzCombobox`, `DzCommandPalette`, `DzPersonaSelector` each run **one synchronous task over 50 ms**, median 1, **cv 0.00**. Under the standing formula a capture would give each a `longtask:*:over-50ms` threshold of **1.05** — writing *"one blocked frame is the budget"* into the contract. `DzCalendar` (1.46), `DzCascader` (1.46), `DzDataGrid` (1.06) get the same, so **6 of 22 components would carry a long-task allowance** | `unverified` for the three medians — reproduction needs a `DZUP_PERF_GATE=1` lane run on the designated host, and the host is undesignated, so in-place capture is **refused by design** (#20). The **structural** claim is verified: `longtask` is one of the four families with **no baseline** | (a) file the three as defects and fix before the capture · (b) capture as-is and record the six allowances with a reason each · (c) raise `LONG_TASK_MS` above 50 | **(a).** Then the baseline is 0 for all 22, exactly as `leak` already is. (c) is named only to reject it — 50 ms is the responsiveness budget, not a tuning knob | **medium**: this is the one row where acting later is strictly worse, because the capture writes the breach into the contract | 2026-09-23 | 2026-09-24 (structure verified; medians `unverified` — §7) |
| 23 | **`O2-D1`** ≡ **`D-S1O4-2`** ≡ **D132** 🔴 | **Adopt a capture, clear the 22 stale cells, lower three ceilings in one change** | open | `capability stale` 22 → 0; `metricFamiliesWithoutBaseline` 4 → 0; the `leak` gate | **stale 22** (C 21 · D 1), and `staleCellKinds.kinds` is **`["perf-baseline"]` only** — so every stale cell is this one cause. Families **without** a baseline: `leak`, `longtask`, `memory`, `hydration`; **with**: `runtime`, `size`. Both gates use a two-way handshake: a fall **also** fails unless the ceiling is lowered in the same change, by design | `node -e "console.log(require('./packages/tooling/src/validators/capability-matrix-ceilings.json').staleCells)"` → 22 · `node -e "console.log(JSON.stringify(require('./packages/tooling/src/validators/perf-baselines-ceilings.json')))"` → `metricFamiliesWithoutBaseline 4, unmeasurableMetrics 9` | (a) capture on the designated host, **triage #21 and #22 first**, then adopt · (b) adopt only the four new lane families · (c) accept 22 stale indefinitely | **(a) — but only after #20, #21 and #22.** (b) is a legitimate half-step that costs nothing and unlocks the `leak` gate; do it **first** if (a) is blocked on provisioning. (c) leaves 22 cells reporting a result measured against source that has changed three times since | **medium**: the 22 cells are the only remaining `stale` in a 144-row matrix, and they are the last thing between it and a clean board | 2026-09-22 | 2026-09-24 |
| 24 | **`D-S1O4-3`** 🟠 | **No CI workflow runs the perf harness at all** | open | Whether any perf threshold is ever enforced | `grep -rn 'test:perf\|perf:capture' .github/` returns **nothing**. The `landing-perf` job is Lighthouse on the marketing site — a different measurement. So every threshold, present past and future, is unreachable by CI | `grep -rn 'test:perf\|perf:capture' .github/ > f; echo "exit $?"; wc -l < f` | (a) a `perf` job on the designated host · (b) start with the deterministic families (`size`, `leak`) on `ubuntu-latest` · (c) leave it local | **(b) then (a).** (b) is runnable today and turns 132 metrics into real gates; (a) needs #20. (c) is how the visual lane became unowned the first time | **medium**: a `perf-baseline: pass` cell in the capability matrix reads as if something is gated, and nothing is | 2026-09-23 | 2026-09-24 |
| 25 | **`D-S1O4-5`** 🟠 | **`DZUP_PERF_GATE` should be split by metric family** | open | Nothing structural; it decides how much of the harness is a gate | The flag gates **2 metric observations out of 190**. Two of the six families (`size`, `leak`) are deterministic and need no host declaration at all | `yarn validate:perf-baselines` (families block) · the 190/2 split is S1-O4 §7 — `unverified` here (needs a gated lane run) | (a) gate `leak` and `size` unconditionally, keep wall-clock behind the flag, gate `longtask:over-50ms` only on the designated host · (b) leave one global opt-in switch · (c) default-on | **(a).** (c) today is a no-op over 2 metrics, and after a capture it turns 44 `unmeasurable` metrics plus every wall-clock threshold into a flake source on developer machines | **low**: it is a shape decision, not a blocker | 2026-09-23 | 2026-09-24 (families verified; 190/2 `unverified` — §7) |
| 26 | **`D-S1O3-1`** 🔴 | **Capture the per-component visual lane on linux, or retire it** | open | `developerLocalLanes` 1 → 0; whether 8 components have CI-gated pixels | **58** baselines on disk, all accepted. Authority is **linux**. `gallery` **16 on linux · gate** · `theme-recipe` **18 on linux · gate** · `component-baselines` **24 on win32 · developer-local**. **24 stale.** The gate *reports* this rather than failing, and `developerLocalLanes: 1` is what stops it growing | `yarn validate:visual-baselines; echo "exit $?"` → 0 · `node -e "console.log(require('./packages/tooling/src/validators/visual-baselines-ceilings.json').developerLocalLanes)"` → 1 | A capture on linux — 24 `visual:accept` invocations with an author and a reason, then 4 bookkeeping edits · B capture in CI and accept from the artifact · C retire the lane | **A.** Scope is 8 components and the cost is one sitting. B trades away the acceptance identity the authority rule exists to protect. C throws away the only lane that answers *"which component moved"* | **medium**: 24 images are honest, attributed and unable to fail a CI run | 2026-09-23 | 2026-09-24 |
| 27 | **`D-S1O3-2`** 🟠 | **The two screen-level lanes have no acceptance tool** | open | Acceptance authority over the 34 baselines that **are** gates | `yarn visual:accept` takes `--component` / `--fixture` and drives the per-component spec only. The **34** `gallery` / `theme-recipe` baselines predate the authority rule: digests are gated, but accepting a change means committing a PNG with **no enforced author and no enforced reason**. The two lanes declared as gates have the weaker control | `node -e "console.log(require('./package.json').scripts['visual:accept'])"` · `e2e/visual/README.md` | A extend `visual:accept` with `--screen` / `--recipe` · B leave it, documented · C retire the screen lanes | **A, as a follow-on packet rather than smuggled into another.** Until then the gap is stated in `e2e/visual/README.md` and in the refusal message, which refuses to print a `visual:accept` command for a lane it cannot address | **medium**: the stronger control guards the weaker lane and vice versa | 2026-09-23 | 2026-09-24 |
| 28 | **`D-S1O3-3`** 🟠 | **Wire the visual lane into CI** | open | Whether 34 gate-declared baselines gate anything | No workflow file was edited by S1-O3 — adding a job is an owner act. Every existing CI job already runs `ubuntu-latest`, which is the authoritative platform | `ls .github/workflows/*.yml > f; echo "exit $?"` then `grep -l visual` each | A a `visual` job: `yarn visual:platform gallery theme-recipe && yarn test:e2e:visual` · B attach to the existing e2e job · C leave it local | **A.** The preflight makes the job self-diagnosing: if the runner image ever changes platform the job refuses **by name** instead of silently recapturing | **medium**: *"the machinery is proved and unused, which is how it became unowned the first time"* | 2026-09-23 | 2026-09-24 |
| 29 | **`D-S1O3-4`** 🟢 | **Widen `scope.families` beyond `buttons`** | open | Visual coverage breadth | **136 of 144** components read `not-covered`; scope is `families [buttons]` | `yarn validate:visual-baselines` (scope line) | widen now · defer until #26 lands | **Defer until #26**, so the capture pass happens once, on linux, at the final scope. ~2 images per component, ~180 KB each | **low**: widening before the platform is fixed doubles the capture cost | 2026-09-23 | 2026-09-24 |
| 30 | **`N1-O4 #1`** ≡ **D112** 🔴 | **Name an AT tester and pick a wave-1 date** | open | Criterion C9 and **all 534 cells**. An agent may never fill one | **534** cells, **0** executed — verified by grep, not by ledger. Wave 1 = 44 cells ≈ 21 h; the full 1.0 accessibility claim = 132 sessions ≈ 75 h | `grep -rho '\| unrun \|' e2e/at-matrix/*.md > f; echo "exit $?"; wc -l < f` → **534** | (1) narrow to Tier A/B · (2) narrow the pair set · (3) move C9 post-1.0 · (4) claim the tier ladder — **fourth option added 2026-09-24 by TASK-S1-O1: this row listed three while row 32 listed four; the fourth was created by TASK-R2-O2's tier ladder after this row was written. All four costed at `4e4e46f` in `TASK-S1-O1-wave-1-schedule.md` §2** | **One of the four must be picked** (was "three" — see the options cell). The current C9 claim is unmeetable and has been since P5-04. Everything except the human is ready: scripts 22/22 green, resolver fixed, and since 2026-09-24 an ingest lane (`yarn at:ingest`) so the tester's hours go into running rather than formatting | **high for the 1.0 claim**: 0 of 534 has not moved across four programmes, and no amount of engineering moves it | 2026-09-xx | 2026-09-24 |
| 31 | **D113** 🟠 | **AT cadence after wave 1** | open | Whether AT evidence stays fresh | A cell goes stale when its component changes, and this repository moves daily | as #30 | (a) event-driven ≈16 h/quarter · (b) one full sweep per release · (c) ad hoc | **(a).** (b) cannot keep up with a daily-moving tree; (c) is what produced 0/534 | **medium**: decide with #30 or the first wave has no follow-through | 2026-09-19 | 2026-09-24 |
| 32 | **D114** 🔴 | **Which C9 accessibility claim does 1.0 make?** | open | The 1.0 accessibility statement | **0 of 132** pairings executed | as #30 | narrow to Tier A/B · narrow the pair set · move C9 post-1.0 · claim the tier honestly | **Pick one honest option.** The current claim cannot be met, and a 1.0 that states it anyway is the one failure mode this whole evidence programme exists to prevent | **high**: it is a claim, not a task, and a false claim at 1.0 is not retractable | 2026-09-19 | 2026-09-24 |
| 33 | **D115** 🟠 | **Script the Tier B AT pairings** | open | 67 cells | 67 Tier-B components × 1 pairing = **67 cells, none scripted** | `yarn validate:at-scripts; echo "exit $?"` | (a) script Tier B (~3–4 d) · (b) leave unscripted | **(b) until #30's wave 1 proves the format survives a real tester.** Scripting 67 cells against an unproven format is the expensive way to learn the format is wrong | **low**: it is downstream of #30 | 2026-09-19 | 2026-09-24 |
| 34 | **`O2-D2`** 🟠 | **What "unexplained" means in the N1 exit condition** | open | The N1 exit condition; **the number changes by 53 depending on the reading** | Roadmap says *"zero unexplained `unrun` in Tier C/D"* and never defines it. (a) `unrun` with no artifact on disk → distance **35** (`axe` 16 · `controlled-uncontrolled` 19). (b) anything not `pass`/`present`/`excepted` → distance **88** | `node -e "const c=require('./packages/core/docs/capability-matrix.json');console.log(c.totals.C.unrun, c.totals.D.unrun)"` → 87, 1 | (a) the meaning the Tier D gate already enforces · (b) the broader reading | **(a), written into the roadmap.** The repository already has one checkable definition of "unexplained"; a second one in prose is how the same number gets re-derived differently every packet. Under (a) the exit is two tasks away; under (b) it additionally requires a human AT wave | **medium**: an undefined exit condition cannot be reached, only argued about | 2026-09-22 | 2026-09-24 |
| 35 | **`O2-D3`** 🟠 | **Accept or reject the 30 new capability exceptions** | open | 30 cells' disposition | `excepted` totals **47** at `4e4e46f` (A 4 · B 41 · C 2), of which 30 are S1-O2's proposal: 27 `controlled-uncontrolled` + 3 `axe`. `validate:quality-tiers` already refuses an exception keyed to a row the component does not owe | `node -e "const t=require('./packages/core/docs/capability-matrix.json').totals;console.log(Object.values(t).reduce((a,x)=>a+x.excepted,0))"` → 47 | (a) accept as written · (b) accept 27, reject the 3 `axe` · (c) reject wholesale | **(a).** Each reason names a source fact and carries the commit it was measured at, so a wrong one is **falsifiable** rather than merely arguable. The owner is the reviewer here — this is the one handwritten review artifact the tier model has | **low**: the cells are visible either way; what is open is whether they are explained | 2026-09-22 | 2026-09-24 |
| 36 | **`O2-D4`** 🟢 | **Should `unrunCells` become a hard gate?** | open | Nothing today | `unrunCells` is recorded as a **report-only baseline of 400** (A 65 · B 247 · C 87 · D 1) beside the stale gate, and does not fail | `node -e "console.log(JSON.stringify(require('./packages/tooling/src/validators/capability-matrix-ceilings.json').unrunCells.perTier))"` | (a) leave it reporting · (b) gate it on a rise | **(a) for now; revisit once the F-tasks land.** Gating it today fails the chain the first time a component is added, which is how a gate earns a `--skip` flag | **low** | 2026-09-22 | 2026-09-24 |
| 37 | **`O2-D5`** 🟢 | **`DzThemeProvider` has no stories file** | open | 2 capability cells; one `component-meta` ceiling | The only public component in the catalog without a story; carried as `publicComponentsWithoutExample: 1`. Two singleton `unrun` cells (`story-light-dark`, `browser-matrix` 0/24) trace to that one absence | `ls packages/core/stories/*/DzThemeProvider.stories.ts` · `node -e "console.log(require('./packages/tooling/src/validators/component-meta-ceilings.json').publicComponentsWithoutExample)"` | (a) write the story · (b) declare it story-exempt and except both cells | **(a).** The component whose entire job is the theme is a strange one to have no light/dark story — and it gives the browser matrix a target it currently skips | **low** | 2026-09-22 | 2026-09-24 |
| 38 | **`D-S2O2-2`** 🟠 | **SC-7 cannot evaluate until candidates carry `ratchets.json`** | open | SC-7; therefore a fully green stop-condition run | SC-7 `unevaluable`: *"the previous candidate `2026-09-21-527dbd1` records no `ratchets.json`, so its ceiling values are unknown and no comparison is possible."* The rehearsal now runs with `--write-ratchets`, so the **next** candidate gets a baseline. **Backfilling `527dbd1` is not possible** — that tree is gone and its ceilings cannot be re-measured honestly | `yarn validate:stop-conditions` (SC-07 block) · `ls docs/qa/release/2026-09-21-527dbd1/ratchets.json` | (a) accept one `unevaluable` SC-7 on the next candidate and treat the one after as the first real comparison · (b) seed a synthetic baseline | **(a). Do not seed a synthetic baseline — a fabricated ceiling is worse than a missing one.** Note the consequence for row 1: a fully green stop-condition run is **two candidates away**, not one | **medium**: it puts a floor under how fast row 1 can reach green | 2026-09-23 | 2026-09-24 |
| 39 | **`D-S2O2-1`** (+ **D173**) 🟠 | **`bundleId()` makes a candidate's identity depend on the date** | open | Candidate resolution across midnight | `bundleId()` is `<YYYY-MM-DD>-<shortCommit>`. At midnight the same unchanged tree acquires a second candidate name. Measured live: **four stop conditions went `unevaluable` and the release report printed `ABSENT` three times for evidence that was entirely present.** S2-O2 fixed the two consumers it owns with `candidateForCommit()`; **the generators still mint date-based directories** (`release:evidence`, `release:api-diff` both call `bundleId()`). **D173** is the same failure's other face: `candidate-content-digest.json` names a deleted file | `ls docs/qa/release/` — the candidate is `2026-09-22-4e4e46f` while today is 2026-09-24 | (a) move `candidateForCommit()` into `release/binding.ts` and use it in `evidence.ts` and `api-diff.ts` · (b) drop the date from `bundleId()` · (c) leave the generators | **(a) now, (b) at 1.0** when renaming candidate directories is cheap. **This session crossed midnight twice and this register's own candidate directory is dated two days before the register** — the defect is live, not theoretical. **D173 resolves as (b): leave the existing bundle, regenerate at the next candidate** | **medium**: it silently converts present evidence into `ABSENT`, which is the most dangerous class of defect in an evidence programme | 2026-09-23 | 2026-09-24 |
| 40 | **`D-S0O1-4`** 🟠 | **Adopt the evidence-binding gate and retire `sourceCommit === HEAD`** | open | Whether the programme keeps writing an unsatisfiable check | `sourceCommit === HEAD` is unsatisfiable from any committable state and **has been written into four `<done_check>` blocks**. `yarn validate:evidence-binding` asks the satisfiable ordering question instead, fires on a seeded defect, and passes in both the pre- and post-commit states. **Renumbered: it is chain link 54, not 51** | `yarn validate:evidence-binding; echo "exit $?"` → **0** · `node -e "const c=require('./package.json').scripts['validate:all'].split('&&').map(s=>s.trim());console.log(c.indexOf('yarn validate:evidence-binding')+1)"` → **54** | (a) adopt the gate, close the old invariant, stop writing it into prompts · (b) post-commit re-stamp · (c) documented acceptance, no gate | **(a).** (b) rewrites a possibly-pushed commit **and the stamp still cannot name the commit that contains it**. (c) is the status quo that produced S0-O1. **Merged into #41 as its first remedy** | **medium**: every new prompt that copies the clause repeats the failure | 2026-09-22 | 2026-09-24 |
| 41 | **NEW** (carries **D77**, extends `D42`/`D57`/`D66`/`D72`) 🔴 | **Every `<done_check>` in this programme has at least one defective clause** | open | The check-first protocol itself — README §4's claim that the done/not-done decision is *"mechanical, not a judgement"* | **Audited all 16 prompts at `4e4e46f`: 16 of 16 carry at least one defective clause, and all 7 unrun prompts do.** Five recurring classes: **(i) `/tmp`** — not writable on this machine; in S0-O1, S0-O3, S1-O3, S1-O4, S2-O1, S2-O3, S2-O4, S3-O1. **(ii) `npx`** — fetches dependency-confusion placeholders that **exit 0 without running**, a silent false green; in S0-O3, S1-O1, S1-O2, S2-O2, S2-O3, S3-O1, S3-O2, S3-O3, S5-O1. **(iii) a pipe masking `grep`'s exit code** (`\| head`, `\| wc -l`, `\| xargs grep \| wc -l`); in S1-O1, S2-O4, S3-O2, S5-O2. **(iv) `sourceCommit === HEAD`** — impossible by construction (#40). **(v) a clause satisfiable only by an action the same prompt forbids** — S0-O3 clause 1 (an ADR status the agent may not edit); **this task's own clause 3** (A4-D1 with a non-`open` status, which only the owner can produce) and its own `<validation>` line `git status --porcelain \| wc -l  # only this task's documents may appear`, impossible against 255 pre-existing paths. S0-O3's clause 4 also names a **placeholder path** (`<adr validator>.ts`). **Aggregate counts across the three task files: `/tmp` 43 · `npx ` 29 · a pipe into `head`/`wc`/`xargs` 12 · `sourceCommit===` 2** | `for f in custody-and-release-tasks.md evidence-execution-tasks.md contract-conformance-tasks.md; do grep -c '/tmp' $f; grep -c 'npx ' $f; grep -cE '(grep\|ls)[^\|]*\\\| *(head\|wc\|xargs)' $f; grep -c 'sourceCommit===' $f; done` — run from `docs/program-2026-09-22-architecture/`; the per-prompt audit is in `TASK-S0-O2-handoff.md` §4 | (a) **one shared `<harness_facts>` block** at the top of each task file — repo-local log paths, `node node_modules/<tool>/…` instead of `npx`, `cmd > log 2>&1; echo "exit $?"` instead of any pipe, and the rule that **no clause may require an action the prompt forbids** — then fix the 7 unrun prompts in place · (b) fix the 7 unrun prompts only · (c) keep correcting each check at run time and recording it | **(a).** This is the **fifth to ninth recurrence** of the same class depending on which clause you count, it has now been recorded by every single task in this programme, and each recurrence costs one agent a full re-measurement cycle. The recurring cost is not the defect — it is that **class (ii) can produce a false green**, and class (v) invites exactly the fabrication this register refused in row 1. The remedy is one block of text, written once, in three files | **high and self-compounding**: it is the only row whose cost is *the reliability of every other row's evidence* | 2026-09-04 (as D42) | 2026-09-24 |
| 42 | **`D-S0O1-2`** 🟠 | **Validators that report one site per id turn a repair into three rounds** | open | Nothing structural; a recurring tax on honest reporting | `validate:package-names` and `validate:adr-references` each report the **first** offending site per id. Fixing the three the first run named revealed a fourth and a fifth: three rounds, each a full `validate:all`. Worse, both gates are tripped by **prose that reports the finding**, so writing the handoff re-trips them | `yarn validate:package-names; echo "exit $?"` · `yarn validate:adr-references; echo "exit $?"` → both 0 at `4e4e46f` | (a) report every site per id · (b) leave as is · (c) allowlist `docs/**/reports/**` | **(a).** A few lines in each validator; the repair becomes one round. **(c) is rejected** — that is widening an exception file, and it would blind both gates to a real reintroduction inside a report | **low per occurrence, but it recurs in every evidence packet** | 2026-09-22 | 2026-09-24 |
| 43 | **`D-S0O1-5`** 🟢 | **README §2's baseline numbers are stale** | **superseded — premise widened and relocated** | Nothing | Raised as three stale numbers; **now five** (§1.1), and the link count has moved five times in three days | §1.1 of this register | leave §2 as the historical record and carry the correction forward · rewrite §2 | **Closed as superseded by §1.1 of this register, which is now the correction of record.** §2's table stays as the bound historical record at `589be13`. Any task quoting it must re-measure first | — | 2026-09-22 | 2026-09-24 |

---

## Part C — real, and blocks nothing on the critical path

| N | id | title | status | blocks | evidence @ `4e4e46f` | reproduce | options | recommendation | cost of delay | opened | re-measured |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 44 | **D59** ≡ `S5-O1 D1` 🟠 | **Name the first translated locale and its translator** | open (the **locale** was taken under delegation 2026-09-17; the **translator** never was) | `minSupportedLocales` 1 → 2; every i18n claim | **`de` is 0 % — 0 of 116 catalog keys translated**, 0 missing, 0 arity errors, 0 plural errors. **Locales at ≥95 %: 1 (en), floor 1.** Measured ask: 116 keys · 44 component groups · 318 words · 82 keys of 1–2 words · 10 with a plural → **3.5–5 h** for a 2-category language, **4.5–6.5 h** for a 4- or 6-category one | `yarn validate:i18n-completeness; echo "exit $?"` → **0** | A commission `de` (the scaffold that exists) · B commission `pl` (4 categories) or `ar` (6 + RTL + typeface) · C keep waiting | **B (`pl` or `ar`), but take A if the German speaker is the one actually available.** Availability beats elegance: one finished locale of any kind moves the floor 1 → 2 and turns every i18n claim from a single data point into a gated fact. German has the **same two plural categories as English**, so A leaves the plural half of the contract untested by real content | **medium and growing with the catalog**: it went 110 → 116 keys in seven days, so the ask grows while the row waits | 2026-09-17 | 2026-09-24 |
| 45 | **D63** ≡ `S5-O1 D2` ≡ `AR-2 D1` ≡ `D-10` 🟠 | **The Arabic (and Hebrew) typeface** | open | An Arabic/Hebrew rendering claim | Gate reports, every run: `arabic: none` · `hebrew: none` — **0 font binaries tracked**. All three OFL candidates are SIL OFL 1.1; **IBM Plex Sans Arabic reserves "Plex"**, so a `pyftsubset` subset may not be called Plex, destroying the only thing option A was for. Decisive measured fact: **the entire `packages/core/dist/core.css` is 19,865 bytes**, so an Arabic subset of *one* weight already exceeds the whole published stylesheet. **Blocking prerequisite for A**: `validate:licenses` scans `package.json` dependencies only, so a font under `packages/` **passes the licence gate silently** | `yarn validate:i18n-completeness` (script-support block) · `wc -c packages/core/dist/core.css` | A vendor an OFL face · B a `--dz-font-family-arabic` opt-in token (0 bytes) · C host obligation, documented (0 bytes, **already in force and gated**) | **C now · B next as a `patch` · A never inside `@dzup-ui/core`.** C needs no action to hold. B costs zero bytes, improves the default on every platform that has one of four measured faces, needs **one** visual fixture, and **reports its own arrival** — the gate flips the row to `token-provisioned` with no edit anywhere. If A is ever taken: **Noto Sans Arabic** (no Reserved Font Name), as a separate opt-in package, never `@font-face` in `core.css` | **low**: the gate prints the absence on every run, so the gap cannot go quiet | 2026-09-17 | 2026-09-24 |
| 46 | **`S5-O1 D3`** 🟢 | **Reconcile "has translations" with "is supported"** | open | Nothing — it fails closed | `validate:i18n-packs` rule 9 treats **one** translated value as "has translations" and demands a published `exports` entry. Measured: a `pl.json` holding a single **English-copied** value made that gate exit 1 while the completeness gate read it **0 %**. It fails closed, so nothing ships — but the two gates disagree about what a publishable locale is | `yarn i18n:check; echo "exit $?"` (both gates, in the order their failures make sense) | A leave it — both go red, a human resolves · B make rule 9's `published` predicate use *effective* (non-identical) translations · C move publication behind the 95 % threshold | **B.** One predicate change reusing `isUntranslated`; the two gates then agree by construction. C blocks the legitimate case of shipping a genuinely partial pack that falls back to English, which R5-O4 deliberately supported | **low**: a standing trap for the next contributor, and nothing worse | 2026-09-24 | 2026-09-24 |
| 47 | **`S5-O1 D4`** ≡ `AR-2 D4` 🟢 | **Arabic numeral style** | open | Nothing | `formatMessage` renders **Arabic-Indic digits** under `ar` today (asserted at `message-format.spec.ts:61`). `ar` vs `ar-u-nu-latn`, and **there is no default that is right for everyone** | `grep -n 'ar-u-nu-latn\|Arabic-Indic' packages/core/src/i18n/*.spec.ts` | document both tags and leave the choice with the host · pick one | **Document both in `i18n.md` §2 when the first Arabic pack lands; leave the choice with the host.** Reported **unasserted with that reason** rather than defaulted — choosing would be choosing on a consumer's behalf, which the provider contract exists to avoid | **low** | 2026-09-24 | 2026-09-24 |
| 48 | **`S3O1-D1`** 🟠 | **The cross-tier collision rule at a consumer's build time** | open | Behaviour when both tiers export one name | A name both tiers export keeps the **first tier's** answer and both packages are named in a diagnostic. One pre-known cross-tier collision exists (`CalendarView`); it is `kind: "type"`, therefore **not mountable**, therefore it can never reach the runtime overlay — **but it can still fail the build-time gate. Do not double-count it** | `node -e "try{require.resolve('@dzup-ui-pro/pro/package.json')}catch{console.log('NOT INSTALLED')}"` → **NOT INSTALLED** | (a) additive overlay, first tier wins loudly · (b) second tier shadows the first · (c) withhold from both · (d) honour `collision-decisions.json` at runtime too | **(a) now, (d) when a real collision exists.** (b) lets a package installed downstream silently replace an upstream component; (c) lets a downstream package **remove** a first-tier component — a downstream-breaks-upstream failure nobody has authorised. (d) needs the decisions file to ship inside `@dzup-ui/core`, a packaging change | **low**: no second-tier package is installed, so nothing exercises it yet | 2026-09-22 | 2026-09-24 |
| 49 | **`S3O1-D2`** 🟠 | **Two routes to the second tier — keep both, or retire the build-time merge?** | open | What `OWNERSHIP_TIERS` means | `DZUP_PRO_OWNERSHIP_MANIFEST` bakes a tier into the shipped table at *our* build time; the new path reads the consumer's installed package | as #48 | (a) keep both · (b) retire the baked-in merge · (c) keep the merge for docs/registry generation only | **(b), but not in this packet.** A table baked on our machine is a claim about a package on our machine, and it goes stale invisibly the moment the second tier ships a new version. It changes a published package's behaviour and deserves its own decision | **low** | 2026-09-22 | 2026-09-24 |
| 50 | **`S3O1-D3`** 🟢 | **`evidence` optional downstream, required here** | open | The published schema's shape | Chosen optional: it names paths **inside the producing repository**, which a consumer cannot open and no resolver reads | `grep -rn 'OwnershipManifestSchema' packages/contracts/src \| head -3` | (a) optional · (b) required, mirroring this repository's own manifest | **(a)** — as chosen | **low** | 2026-09-22 | 2026-09-24 |
| 51 | **`S3O1-D4`** 🟢 | **The tier vocabulary is closed at `'core' \| 'pro'`** | open | Whether a third party can publish a conforming manifest | A partner package or internal design system cannot publish one today. **Opening `tier` alone would not be enough** — both consumers resolve a single hard-coded second-tier package name | as #50 | (a) keep closed until someone asks · (b) open `tier` to any string and key by package name | **(a).** A third tier is a larger change than a schema field, and (b) alone would look like support without being it | **low** | 2026-09-22 | 2026-09-24 |
| 52 | **`S3O1-D5`** 🟠 | **`proTierMissingMessage()` is `@deprecated`** | open | The `@deprecated`-without-a-record ratchet | Exists at `packages/nuxt/src/module.ts:195`, still exported (removing a published export is breaking under VERSIONING.md), no longer emitted from `setup()`. **The ledger now covers it: 16 annotations, 16 with a record, 0 without** | `grep -rn 'proTierMissingMessage' packages/ --include='*.ts'` · `yarn validate:deprecations; echo "exit $?"` → **0** | (a) keep until the 1.0 act, then remove · (b) remove at the next minor | **(a).** In 0.x a removal is a `minor`, i.e. a breaking change, for a symbol whose only cost is being exported. **The "no record yet" half of this row is `superseded`** — the ledger has a record for every one of the 16 annotations | **low** | 2026-09-22 | 2026-09-24 |
| 53 | **`S3O1-D6`** 🟢 | **Should the contract-vs-generator schema-version check be its own chain link?** | open | Nothing; a named gate in the release report | It lives inside `validate:ownership` (link **33**, not 30 — the chain has grown) | `node -e "const c=require('./package.json').scripts['validate:all'].split('&&').map(s=>s.trim());console.log(c.indexOf('yarn validate:ownership')+1)"` → **33** | (a) leave it there · (b) promote it | **(a)** — it is an ownership fact. Note the original recommendation cited "the link count stays 51"; it is **55** now, which is why a recommendation should never be argued from a link number | **low** | 2026-09-22 | 2026-09-24 |
| 54 | **`D-S2O1-4`** 🟢 | **The licence-exception schema cannot express reachability** | open | The first supply-chain exception ever added | Qualification row 12 asserts owner + expiry + **reachability**; the schema has the first two. **Vacuous today — `excepted: 0`** — and blocking the first time one is added | `node -e "console.log(require('./docs/qa/release/2026-09-22-4e4e46f/supply-chain.json').totals.excepted)"` → **0** | add `reachability` to `$rules` and the entry shape now · wait | **Add it now, while the list is empty and the change costs nothing.** Doing it later means doing it under the pressure of a live advisory | **low now, awkward later** | 2026-09-22 | 2026-09-24 |
| 55 | **`D-S2O1-5`** 🟢 | **`@dzup-ui/core` ships 1,461 files / 3.37 MB** | open | Nothing — a note, not a defect | It ships `src/` and `stories/` beside `dist/`. Legitimate and declared, ~8× the next tarball, and apparently never decided. For scale: `@dzup-ui/mcp`'s tarball is **35,891 bytes** | `node -e "const s=require('./docs/qa/release/2026-09-22-4e4e46f/supply-chain.json');for(const p of s.packages)console.log(p.package,p.artifact.bytes,p.entries)"` | keep it (source maps and story-driven docs are genuinely useful) · split the sources into a separate artifact | **Measure demand before changing anything.** This is a note, not a defect | **low** | 2026-09-22 | 2026-09-24 |
| 56 | **`D-S2O1-6`** 🟠 | **Where `qualify:package` should be wired** | open | Nothing; it runs on demand | Not in `validate:all` (55 links, none of them `qualify:package`): it packs six tarballs and runs ~10 Vite builds — minutes, not seconds — and it writes into `docs/qa/release/` | `node -e "console.log(require('./package.json').scripts['validate:all'].includes('qualify')?'YES':'NO')"` → **NO** | (a) `rehearse:release` only · (b) a `validate:release` aggregate · (c) CI-only on a release branch | **(a)** — it is release-candidate evidence, and that is what the rehearsal is for. A minutes-long lane inside a seconds-long chain is how a chain earns a `--skip` flag | **low** | 2026-09-22 | 2026-09-24 |
| 57 | **`D-S2O2-4`** 🟢 | **The deprecation ledger sits in a published package and does not ship** | open | Nothing | `packages/contracts/deprecations.json` sits in a package whose `files` is `["LICENSE","VERSIONING.md","dist"]`, so **no consumer can read it**. 16 records | `node -e "console.log(JSON.stringify(require('./packages/contracts/package.json').files))"` · `yarn validate:deprecations` | (a) leave it, repo-internal · (b) ship it with a `./deprecations` export · (c) move it to `packages/tooling/` | **(a) now, (b) when a consumer asks.** Shipping it makes its *shape* a public contract, which should be a deliberate act, not a side effect. (c) puts the ledger further from the versioning policy that defines it | **low** | 2026-09-23 | 2026-09-24 |
| 58 | **`D-S2O2-6`** 🟠 | **SC-11 needs a signature, and it must be the last one** | open | A fully green stop-condition run — permanently, by construction | SC-11 `unattested`: *"authority lives in a person, not in a file … an agent may never sign this row."* `docs/qa/release/2026-09-22-4e4e46f/attestations.json` is **absent**; the template exists; **no attestation was created, deliberately** | `yarn validate:stop-conditions` (SC-11 block) · `ls docs/qa/release/2026-09-22-4e4e46f/attestations.json` | sign it as the last step before publishing · sign it earlier | **Sign last, never earlier.** A signature given before the other ten conditions are clear attests to something that has not happened yet. **This row is why the gate can never read all-green before a release, only immediately before one** | **none while frozen; it is the final gate on row 1 paths (a) and (b)** | 2026-09-23 | 2026-09-24 |
| 59 | **`D-S3O3-1`** 🟠 | **Should the security corpus gain an `attribute-name` sink?** | open | Expressing "a value that becomes an attribute *name* cannot be escaped" | Form doc 06 §10 forbids spreading unknown renderer-option **keys** onto a DOM element; `rejected` is the only safe outcome and the format has no sink that says so | `yarn validate:security-corpus; echo "exit $?"` · `yarn validate:security-conformance; echo "exit $?"` | (a) add sink `attribute-name` — a **minor** schema bump (the union, `SECURITY_SINKS`, `definitions.sink.enum`, the outcomes-map key order the gate compares, plus every data file's `schemaVersion`) · (b) a source-level gate forbidding `v-bind` of an untrusted object · (c) leave it unexpressed | **(a), but not before (b) exists.** A sink no suite consumes produces a fixture nothing runs — the exact silent-pass this lane was built to prevent. Add the sink in the same packet as the gate that reads it | **low** | 2026-09-23 | 2026-09-24 |
| 60 | **`D-S3O3-2`** 🟠 | **Where does a provenance rule live?** | open | Expressing "never fetch a document-provided URL" | Graph doc 06 requires it, but the same string is legitimate from a trusted prop, so the rule is a property of the **binding**, not the payload. As `subresource: rejected` it would fail every legitimate image component | as #59 | (a) add a `provenance` field to `BoundaryBinding` and assert per binding, in Core · (b) a second fixture kind beside the peer-compatibility file · (c) leave it to the tier that renders documents | **(a).** The corpus is for payloads; provenance belongs to the binding registry, which already knows which prop it is feeding | **low** | 2026-09-23 | 2026-09-24 |
| 61 | **`D-S3O3-3`** + **`D-S3O3-4`** 🟢 | **The reference's `lossy` count, and whether it joins `evidence-binding.json`** | open | Nothing | Core's reference is **9 lossy of 10** because Core bundles no sanitizer and always will. The reference carries a `sourceCommit`, which is the shape the binding gate governs — but its declared inputs would be the corpus files, and the commit that lands a regeneration touches them, so registering it makes the gate red on the one commit where the artifact is most correct | `yarn validate:security-conformance; echo "exit $?"` → 0 · `yarn validate:evidence-binding; echo "exit $?"` → 0 | lossy: (a) one reference + the `lossy` field · (b) add a DOMPurify dev-dep and a second reference · (c) publish an example in the README. binding: (a) leave unregistered · (b) register + add the corpus to `generatedOutputs` · (c) register with an empty `generatedFrom` | **lossy (a) now, (c) when someone asks** — (b) puts a parser in a test package for a library that renders no HTML. **Binding (a): a gate that re-derives the number beats a gate that checks a timestamp on it**; (b) is wrong outright — the corpus is a *source* | **low** | 2026-09-23 | 2026-09-24 |
| 62 | **D187** 🟠 | **Does this repository keep sharing the ADR number space?** | open | Every cross-tier ADR citation; the next collision | Resolved *for ADR-13* by **naming, not renumbering** (CLAUDE.md §"ADR-13 is two different decisions"): a bare `ADR-13` here always means the date-math decision, and a cross-tier citation must be written `dzup-ui ADR-13` or `dzup-ui-pro ADR-13`. The underlying clash is unresolved and **the next collision is a matter of time** — this repository is at **ADR-20** with **17 ADRs cited, 3 documented, 14 registry-only (ceiling 14)**, and neither tier coordinates | `yarn validate:adr-references; echo "exit $?"` → 0 (prints the 17/3/14 split) · `grep -n 'ADR-13' CLAUDE.md` | (a) split the space (this repository takes a reserved range) · (b) keep sharing with the naming rule · (c) coordinate a joint registry | **(b) with the naming rule, until a second collision occurs; then (a).** Renumbering was rejected on the merits and that reasoning still holds: Pro's ADR-13 is Accepted and cited from Pro source, this one is cited from 10 sites here, and a renumber breaks every existing citation to buy tidiness. **The trigger to revisit is a second collision, and nothing watches for one** — that is the part worth fixing cheaply | **low now, one-way later**: the cost of splitting rises with every ADR either tier writes | 2026-09-22 | 2026-09-24 |

---

## 3. A4-D1 — the three executable paths, re-measured

**Status, stated plainly: `open`.** This register **re-measures** A4-D1's evidence
and costs its options; it does not resolve it. Resolving it is the owner's act.
The `<done_check>` clause that asks for "a status that is **not** `open`" offers
a second branch — *"or with a dated re-measurement of its evidence"* — and this
section is that branch, taken deliberately. **Writing "resolved" to satisfy a
checklist would be precisely the failure this programme has been catching, and
it is recorded as defect class (v) in row 41.**

### 3.1 The decision's inputs, all re-measured on 2026-09-24 at `4e4e46f`

| Input | Value | Command |
|---|---|---|
| npm state | **`E404` for all six** published packages | `for p in contracts core mcp nuxt testing tokens; do npm view "@dzup-ui/$p" version; done` |
| DNS | **NXDOMAIN** at `dzup-ui.com`, `www.`, `docs.` | `nslookup dzup-ui.com` ×3 |
| Pending changesets | ~~42~~ **41** (was 38 two days ago; TASK-S2-O3) | `find .changeset -name '*.md' -not -name 'README.md' \| wc -l` |
| Policy | `allowMajor false`; 0.x `minor` **is** breaking; `major` **is** the 1.0 act and is gate-refused | `node -e "…release-policy.json…"` · `packages/contracts/VERSIONING.md` lines 27, 29, 37 |
| Package versions | `core` 0.2.0 · `tokens` 0.2.0 · `mcp` 0.2.0 · `contracts` 0.1.0 · `testing` 0.1.0 · `nuxt` 0.1.0-alpha.0 | `node -e "…packages/*/package.json…version"` |
| Aggregate | `yarn validate:all` exit **1**, 55 links, stops at **51** | `yarn validate:all > log 2>&1; echo "exit $?"` |
| **The repository's own release verdict** | **`RELEASE STOPPED`** — 11 conditions: 5 clear · **4 fired** · 1 unevaluable · 1 unattested | `yarn validate:stop-conditions; echo "exit $?"` → **1** |
| Package qualification | 12 doc-08 rows: **9 pass** (core-only) · **2 FAIL** (row 9 CSP/Trusted-Types, row 10 licence) · **1 blocked** (row 4, no second-tier tarball) | `grep -E '^\| *[0-9]+ \|' docs/qa/release/2026-09-22-4e4e46f/package-qualification.md` |

### 3.2 Path (a) — publish now under the 0.x policy

| | |
|---|---|
| **Commands** | `git commit` (#2) → audit and re-level all 41 changesets (#10) → `yarn changeset version` → **the chain goes red here** (#4) → fix → `yarn build` → `yarn validate:all` → `yarn qualify:package` → sign `attestations.json` (#58) → `yarn changeset publish` |
| **Becomes irreversible** | the six npm **names** are claimed · every published **version number** is permanent, and in 0.x a `minor` publishes a *breaking-change signal* that cannot be retracted · the docs/`llms.txt`/MCP/`/r/**` install strings become true and get indexed |
| **Rollback** | `npm unpublish` for **72 h only**; after that `npm deprecate` is the only lever, and **there is no rollback document** (#11) |
| **Blocked by** | #2, #4, #5, #6, #7, #8, #9, #10, #11, #58 — **ten rows**, of which #5, #7 and #10 are irreversible-if-wrong |
| **Verdict** | **Cannot be taken today without overriding the repository's own stop-condition gate, and "a threshold raised or a gate overridden without recorded justification" is itself one of the eleven stop conditions.** |

### 3.3 Path (b) — publish a prerelease / snapshot tag only

| | |
|---|---|
| **Commands** | `git commit` (#2) → `yarn changeset version --snapshot <tag>` → `yarn changeset publish --tag <tag>` |
| **Proves** | the whole pipeline: pack, publish, install, resolve, the tarball fixtures, the install commands — without setting `latest` |
| **Becomes irreversible** | the six npm **names** are still claimed — that half is no less permanent than path (a). No consumer gets the package by default |
| **Rollback** | `npm unpublish` within 72 h; no consumer is on `latest`, so the blast radius is small |
| **Blocked by** | #2, #4 (**hardest here**), #7, #58 — and #4 is **worse on this path than on (a)**: S0-O1's probe proved a snapshot version has **no date to attach** to the recorded workaround, and `validate:mcp`'s regex **rejects the `-` inside a prerelease tag**, so it reports the previous release as newest. **The recorded fix (a)+(b) is insufficient; (d) is required** |
| **Verdict** | the cheapest honest proof of the pipeline, reachable in **four** rows rather than ten — but it needs the strictly larger changelog⇄mcp fix first |

### 3.4 Path (c) — freeze and keep qualifying

| | |
|---|---|
| **Commands** | `git commit` (#2) → `yarn release:api-surface:record` (#6) → regenerate the candidate on the clean tree → `yarn validate:stop-conditions` → **no publish** |
| **Becomes irreversible** | nothing |
| **Rollback** | not needed |
| **Cost of staying here** | changesets accrue (**38 → 42 in two days**); the docs site stays undeployed, so the N2 exit condition stays unmeetable; three registry descriptors keep describing artifacts nobody can install; every `npm install @dzup-ui/*` string in the docs, `llms{,-full}.txt`, MCP and all 282 `/r/**` files stays false; and the 42 changesets stay **unaudited**, which is the one cost that becomes *unfixable* the moment (a) or (b) is taken |
| **Verdict** | **the only path the repository's own gate permits today** |

### 3.5 Recommendation

**(c) now, with (b) as a committed, gated exit.** Concretely: publish a
prerelease tag once these five prepared acts are done, in this order —

1. **#2** commit the 255-path worktree.
2. **#6** `yarn release:api-surface:record` on the clean tree, and **#5** decide barrel-or-manifest.
3. **#7** add the `mcp` LICENSE; **#8** read `DZ_NONCE_KEY` in the Nuxt module and take the Trusted-Types posture.
4. **#4** land the **three-part** changelog⇄mcp fix; **#10** audit and re-level all 41 changesets; **#9** bump the `mcp` transitives; **#11** write the rollback document.
5. **#58** sign `attestations.json` — **last**.

None of the five needs new engineering; all five are prepared. Note #38's
consequence: because the previous candidate records no `ratchets.json`, a
*fully* green stop-condition run is **two candidates away, not one** — SC-7 will
read `unevaluable` once more, legitimately.

**Path (a) is not recommended before 1.0 in any case.** Under VERSIONING.md a
0.x `minor` *is* a breaking change, 42 unaudited changesets are pending, and the
one thing that cannot be undone after publication is a version number.

## 4. The `validate:changelog` ⇄ `validate:mcp` recommendation

**`validate:mcp` yields.** An ISO date in a changelog entry is a consumer-facing
fact that answers *"when did this ship"*; `validate:mcp`'s heading-shape rule is
an internal formatting preference with no consumer. Concretely, take **(a) + (b)
+ (d)**:

- **(a)** widen the `mcp-surface.ts` heading regex to allow ` - YYYY-MM-DD`.
- **(b)** sync the three version mirrors in the same change.
- **(d) — new, and required:** make the version comparison accept a prerelease
  `-`, so a snapshot tag does not cause `validate:mcp` to report the *previous*
  release as newest.

**The recorded two-part fix is insufficient.** S0-O1's probe measured
`validate:changelog` 0 → 1 (**5 of 7** entries) and `validate:mcp` 0 → 1
(**5** errors), and surfaced two facts (a) cannot address: a snapshot version has
no date to attach, and the regex rejects the `-` in a prerelease tag. Because
(d) is exactly what A4-D1 path (b) needs, **it is on the critical path for the
cheapest publication option, not a footnote to it.**

## 5. The single owner act that unblocks the most — and the one thing it does not

**Commit the 255-path worktree (#2).**

| It clears | How | Verified |
|---|---|---|
| **SC-1** (fired) | the candidate stops being `4e4e46f+255`, *"which is not a commit anyone can check out"* | `yarn validate:stop-conditions` SC-01 |
| **SC-3** (fired) | the 5 candidate artifacts stamped `provenance.admissible = false` can be regenerated on a clean tree and stamped admissible | SC-03 |
| **5 of SC-5's 11 findings** | `yarn release:api-surface:record` then produces an **admissible** baseline for `contracts`, `mcp`, `nuxt`, `testing`, `tokens` | SC-05 |
| Everything downstream | every evidence artifact in the repository becomes citable as commit-bound evidence rather than a claim about a tree nobody can check out | — |

**The correction.** `D-S2O2-3` states that one act clears SC-1, SC-3 and SC-5
together. **SC-5 is not fully cleared by it.** The gate's 11 findings have two
distinct causes:

- **5** are `no baseline` → cleared by the commit plus `release:api-surface:record`.
- **6** are `@dzup-ui/core: manifest omission(s) — promised and not delivered`:
  `useCountdown`, `useIntersection`, `formatRemaining`, `toRemainingParts`,
  `UseIntersectionOptions`, `UseIntersectionReturn`, each `severity: breaking`,
  `level: minor`. **No commit and no baseline record touches these.** They are the
  barrel-vs-manifest drift of **#5** (`D158` ≡ `D-S2O2-5`), and the manifest's own
  `version` field reads `0.0.1` against a `0.2.0` package.

So the honest statement is: **one owner act (the commit) plus one command
(`release:api-surface:record`) clears SC-1, SC-3 and 5 of SC-5's 11 findings.
Clearing SC-5 entirely also requires the decision in #5** — which is a judgement
about whether five composables were ever meant to be public API, and *"not a
fact a tool can read."*

## 6. Consolidations, supersessions and scope exclusions

### 6.1 Consolidated — 20 raised ids merged into 8 rows

| Row | Merged ids | Why they are one question |
|---|---|---|
| **#3** | **D174** · **D175** · `N5-04 D2` · `D-S0O1-3` · `D-S1O3-5` | All five are the icon library. D175 is D174's changeset level; `D-S0O1-3` and `D-S1O3-5` are the same red link counted at two different link numbers (48, then 51) |
| **#2** | **D127** · SC-1 · SC-3 · `D-S2O2-3(a)` | All four are "commit the tree" |
| **#8** | `D-S2O1-3` · `D-S3O3-5` · `D-S3O3-6` | All three are the Nuxt module's nonce-less `innerHTML` and the Trusted-Types posture; `D-S3O3-6` exists only to say the corpus is the wrong home for it |
| **#13** | **A4-D2** · **D166** | The prior register's §7.2 already established they are one question; retired as two rows here |
| **#16** | `D-S2O1-1` · `D-S0O1-1(c)` | One question: is `yarn build` a gate? |
| **#21** | **D135** · **D140** · `D-S1O4-4` | One measurement, recorded three times at three commits |
| **#23** | `O2-D1` · `D-S1O4-2` · **D132** | `D-S1O4-2` **is** `O2-D1` executed, and D132 is the enforcement point it needs |
| **#61** | `D-S3O3-3` · `D-S3O3-4` | Both are "how honest is the conformance reference", one about its count, one about its binding |

### 6.2 Superseded — closed, with the commit or measurement that removed the premise

| id | Premise | Why it is closed |
|---|---|---|
| **`D-S0O1-1`** (build half) | `yarn build` red with 14 errors in the codemod icon fixtures | **Option (b) landed**: `packages/codemods/tsconfig.json` now excludes `src/**/__fixtures__/**`, with the `packages/tooling` precedent comment intact. `yarn build` is green. Only option (c) survives, as **#16** |
| **`D-S0O1-5`** | README §2 stale in three places | **Widened and relocated** — §1.1 of this register is now the correction of record, and the count is five, not three (**#43**) |
| **`S3O1-D5`** (record half) | `proTierMissingMessage` is the repository's newest `@deprecated` symbol *"and has no record yet"* | `yarn validate:deprecations` → **16 annotations, 16 with a record, 0 without**. The keep-or-remove half stays open as **#52** |
| **`A4-D3`** | no gate proves the registry descriptors resolve | **Built and executed**: `validate:registry` is chain link **40** |
| **`D-S1O3-5`** (as a standalone row) | links 49–52 unmeasured | The numbering moved; the question is **#3** and the unreached set is now 52–55 |
| **`D173`** | a candidate digest names a deleted file | Folded into **#39** as the same date-keyed-identity defect; disposition: leave the existing bundle, regenerate at the next candidate |

### 6.3 Out of scope — belongs to the commercial tier, dropped rather than carried

**`A4-D5`** (Pro distribution posture) is *"cross-repo — not this repository's to
take alone"* in its own source. Per README §5 `<repository_boundary>` it is
**dropped from this register**, not carried. It is recorded here once, as an
exclusion, and never again.

## 7. Rows marked `unverified`, and why

Three numbers could not be reproduced now. **None is repeated as though it were
verified**, and each names its obstacle.

| Row | Number | Why it is not reproducible at `4e4e46f` |
|---|---|---|
| **#22** | the three long-task medians (1, cv 0.00) and the 1.05 threshold a capture would write | Reproduction needs a `DZUP_PERF_GATE=1` lane run **on the designated capture host**, and the host is **undesignated**, so the harness **refuses an in-place capture by design** (#20). The *structural* claim is verified: `longtask` is one of the four families with no baseline |
| **#25** | "the flag gates 2 metric observations out of 190" | Same obstacle. The *families* half is verified directly by `yarn validate:perf-baselines` |
| **#21** (the proposal half only) | "a capture on a non-designated host would move **23** thresholds UP, 0 down" | The proposal file that produced it was written to a scratchpad and is gone; regenerating it requires the refused capture. **The breach itself was independently reproduced** — 20 of 22 over, worst +15.8 % — so the row's own evidence stands on its own measurement |

Everything else in this register was measured during this task, at `4e4e46f`, on
2026-09-24, with the exit code read directly.

## 8. Addendum — raised after this register was written

*Appended by **TASK-S2-O3**, 2026-09-24, at `4e4e46f`. Appended rather than
inserted so no existing row number moves; the 62 rows above are unchanged except
for the two changeset-count corrections noted in them.*

### 8.1 Three deployment decisions were never carried into this register

The 2026-09 docs-deployment packet §2 and `TASK-R1-O5-handoff.md` §8 raise
**five** open deployment decisions, **D165–D169**. This register carries **D165**
(row 14), **D166 ≡ A4-D2** (row 13) and **D172** (row 15). It does **not** carry
**D167** (deploy trigger), **D168** (cache-policy ownership) or **D169**
(rollback drill). All three are open, all three are cited by a prior handoff, and
none was contradicted — they were simply dropped.

They are restored, **re-measured at `4e4e46f`**, with options and a
recommendation each, in
[`./TASK-S2-O3-deploy-runbook.md`](./TASK-S2-O3-deploy-runbook.md) §2. The
measurements that matter: **0 of 8 workflows** contains any deploy/upload step;
**no `_headers` or `_redirects` file exists anywhere under `apps/`**; and the word
"rollback" appears in **exactly two** files under `docs/`, both release-QA
reports, so **no release checklist contains the drill**.

Row **#13**'s NXDOMAIN claim was independently re-verified and **holds** —
`dzup-ui.com`, `www.dzup-ui.com` and `docs.dzup-ui.com` are all NXDOMAIN against
**both `1.1.1.1` and `8.8.8.8`**. See the handoff §8 for why the first reading
said otherwise and why that reading was wrong.

### 8.2 `D-S2O3-1` 🟢 — the `check:links` allowlist must expire with the deploy

| | |
|---|---|
| **Blocks** | nothing today; it makes `yarn check:links` **structurally unable to fail** on the project's own origin the moment the site is live |
| **Evidence @ `4e4e46f`** | `scripts/check-external-links.mjs:50` — `['dzup-ui.com', 'canonical origin, deploy pending']`. `yarn check:links` exits **0** having **skipped 4 `dzup-ui.com` URLs** (`/`, `/ai`, `/og-default.png`, apex). Correct while the domain is NXDOMAIN; a hole afterwards. A second, softer instance on the same allowlist: `www.npmjs.com/package/@dzup-ui/core` is skipped as *"returns 403 to scripted requests"* and in fact returns **404**, because the package does not exist — a reason stale in the direction that hides **A4-D1** from the link gate |
| **Reproduce** | `yarn check:links` → `↷ skipped https://dzup-ui.com/ (canonical origin, deploy pending)` ×4, then `✓ … 20 external URL(s) resolve (7 allowlisted)` |
| **Options** | (a) delete the `dzup-ui.com` entry as part of the deploy — **step 8** of the runbook — and correct the `npmjs.com` reason when A4-D1 is taken · (b) keep it, and accept a link gate that never fetches the origin every generated artifact points at |
| **Recommendation** | **(a).** It is two lines and it is the difference between a green gate and a gate. **This is the only gate in the repository found to depend, silently, on the site being unreachable** — everything else was checked. `validate:component-meta`'s `reachability` clause sounds like an HTTP probe and is not: it asserts statically that `build-registry.ts` copies `component-meta.json` into `/r/`, which is an honest proxy, not a hidden dependency |
| **Cost of delay** | **low now, medium after the deploy** — it costs nothing while NXDOMAIN and becomes a false green the same hour the domain resolves |

### 8.3 `D194` 🟢 — the registry `docs` clause: ratchet, or leave report-only?

Raised by this register's own finding **S9** inside `packages/tooling/src/validators/registry.ts`'s
header and **not carried into the 62 rows**.

| | |
|---|---|
| **Blocks** | nothing; it is the last report-level finding under `validate:registry`'s green tick |
| **Evidence @ `4e4e46f`** | the `docs` clause fires on **103 of 191** items with no markdown mirror — **59** animations + **44** templates. It **cannot fail**, has **no seeded case** in `--self-test`, so *"nine clauses, 8/8 seeded"* is literally true and reads as fuller coverage than it is |
| **Reproduce** | `yarn validate:registry --all` → two `· [docs] …` lines |
| **Options** | (a) record 103 in a ceilings file and fail on a rise · (b) leave report-only |
| **Recommendation** | **(a)** — it is the shape every other ratchet here has, and *a report-level finding under a green tick* is the exact pattern TASK-S2-O3 spent its time undoing one level up (the registry's tier-3 count) |
| **Cost of delay** | **low**, but it drifts: the mirrors are generated by a second script, so the number moves without anyone choosing it |

### 8.4 Three README §7 item-9 decisions were never carried into this register

*Appended by **TASK-S3-O2**, 2026-09-24, at `4e4e46f`. Appended, not inserted:
no row number above moves and no row above is edited.*

README §7 item 9 names three open owner decisions — **the `DzGrid` span API, the
`utility` ownership kind and the `time` format profile**. None of them is a row
here, and none appears in §6.1 (consolidated), §6.2 (superseded) or §6.3 (out of
scope) either. Measured:

```
for t in D67 D68 D69 D70 D71 span Stack; do grep -c "$t" \
  docs/program-2026-09-22-architecture/reports/owner-decision-register-2026-09-22.md; done
→ 0 0 0 0 0 0 0
```

They were **dropped, not closed** — the same defect class §8.1 records for
`D167`/`D168`/`D169`. Their source is
[`../../program-2026-09-04/reports/TASK-R3-O3-decisions.md`](../../program-2026-09-04/reports/TASK-R3-O3-decisions.md)
(D67–D72), and the engineering has moved under all of them since it was written.
They are restored, re-measured at `4e4e46f`, with options and a recommendation
each, in [`./TASK-S3-O2-decisions.md`](./TASK-S3-O2-decisions.md):

| id | Question | Status at `4e4e46f` | Recommendation |
|---|---|---|---|
| **`D-S3O2-1`** 🟢 (was D67) | the `DzGrid` span API | D67's column axis **shipped** (uncommitted, `DzGridItem.vue`); the **row axis did not exist** (`grep -rn "row-span" packages/ apps/` → **0 hits**) while the document schema requires `rowSpan: integer 1..12`. **Implemented by this task** as `rowSpan` + `colSpan` (an additive alias of `span`) | **ratify** — or say "rename instead", which is a small edit while unreleased and a `minor` + codemod after |
| **`D-S3O2-2`** 🟠 (was D68) | the `utility` (+ `injection-key`) ownership kind, schema 1.2.0 | recommendation taken 2026-09-17, **never executed**. `unclassified` = **29**, composition **unchanged since `569d887`**: 23 `DZ_*_KEY` injection keys + 6 pure helpers (`cn`, `themeScript`, `getThemeScript`, `warnDeprecated`, `resetDeprecationWarnings`, `DzResolver`). **29 of 29 fall into the two kinds D68 named**, so (a) takes the count to 0 with no residue | **(a), as its own tooling packet.** Second observed instance of the ceiling *steering* an engineering choice: this task needed a module-scoped dev-warning helper and kept it out of every barrel specifically so it would not become a 30th `unclassified` entry |
| **`D-S3O2-3`** 🟢 (was D69) | the `time` format profile | taken 2026-09-17 and **re-verified still true**: `DzTimePicker` is `defineModel<string>({ default: '' })` at line 35 — RFC 3339 `partial-time`, not JSON Schema `format: time` (`full-time` = `partial-time` + offset). **No Core change is owed** | **ratify (a)** — the codec owns the zone; a control cannot invent an offset, and a time with no date cannot resolve DST. The follow-up belongs to the tier that owns the renderer and is recorded here as a finding only |
| **`D-S3O2-4`** 🟢 (was D71(b)) | `@deprecate` `DzMentionOptionResolver`? | D71(a) **executed**: `DzMention` runs both host-driven and resolver-driven options through `useAsyncOptions`, the resolver against the seam's `AbortSignal`. The **`DzMention` seam is closed**, and its readiness-matrix row carries a verdict in all nine cells (C9 `✅ pass`), so README §1's "unresolved" is stale | **keep, un-deprecated, revisit at the 1.0 freeze.** `VERSIONING.md` §4 makes a deprecation a full `0.x` minor series, and that machinery is itself unbuilt (TASK-S2-O2) |

**Row-count effect.** The 62 rows above are unchanged, and the `[!]`-row floor in
`EXECUTION-STATUS.md` is unaffected. The running total is restated after the two
further rows below.

**Two further rows raised by the same task, after the four above:**

| id | Question | Status at `4e4e46f` | Recommendation |
|---|---|---|---|
| **`D-S3O2-5`** 🟠 **NEW** | `data-options-state` — a published styling surface on **nine** controls — publishes the **raw host state**, not the row the control is rendering | `DzOptionsState` is handed `useAsyncOptions().state` while the decision to render comes from `.row`, so the attribute reads **`ready` on an empty row** and **`idle` on a loading row**. Both are *deliberate* inferences the composable documents, and the attribute carries neither. A consumer styling `[data-options-state="empty"]` gets nothing in exactly the case the seam infers — and `ready`-with-an-empty-collection is the path a **cascading** form takes most often. Measured by three tests in `packages/core/src/components/forms/DzSelect.asyncStates.spec.ts`, each pinning the current behaviour and naming this row | **(a) publish the row** (or add it as `data-state`, which ADR-19 already names as the state channel and which this row does not emit at all). **Recorded, not fixed:** changing a published `data-*` value on nine controls is not an additive change, and the task's own `<stories_not_behaviour>` rule says file it. Whichever way it goes, the change shows in a diff |
| **`D-S3O2-6`** 🟢 **NEW — process** | `EXECUTION-STATUS.md` states the `validate:all` link count **three different ways in one file** | Header **55** · row *"`validate:all` links"* **58** · row *"`validate:all` chain links"* **59**. Measured: **59**. The same file's *"links that have EVER executed"* row consequently reads **58 of 58** against a 59-link chain. §1.1 of this register already corrects this field once | Delete all three statements; keep only the one-line `node -e` probe and the **named** first-failing gate (`validate:peers` → `validate:icon-duplicates`). Directly adjacent to row **#41**: a number that has never been right for a whole day should not be written in prose |

**Revised row-count effect.** 62 rows above unchanged; with §8.2, §8.3 and the six
rows of §8.4 the register carries **70** distinct open questions.

### 8.5 README §7 item-11 — the toolchain cutover windows — were never carried into this register either

*Appended by **TASK-S5-O2**, 2026-09-24, at `4e4e46f`. Appended, not inserted:
no row number above moves and no row above is edited.*

README §7 item **11** names *"Toolchain cutover windows — Vitest 4 browser mode,
tsdown/Vite 8, the Vue 3.6 lane, the Nuxt 4 retarget"* as an open owner decision.
None of the eight decision ids behind it is a row here, and none appears in §6.1
(consolidated), §6.2 (superseded) or §6.3 (out of scope). Measured:

```
for t in D85 D91 D95 D96 D-S2O4-1 cutover tsdown "Vite 8"; do grep -c "$t" \
  docs/program-2026-09-22-architecture/reports/owner-decision-register-2026-09-22.md; done
-> 0 0 0 0 0 0 0 0
```

**Dropped, not closed** — the third instance of the defect class §8.1 and §8.4
record. Their sources are
[`../../program-2026-09-04/reports/TASK-R5-O9-handoff.md`](../../program-2026-09-04/reports/TASK-R5-O9-handoff.md)
(D85, D91, D95, D96) and [`./TASK-S2-O4-handoff.md`](./TASK-S2-O4-handoff.md)
(D-S2O4-1). All five are re-measured at `4e4e46f` in the four slice-evidence
documents `./TASK-S5-O2-slice-*.md`, with options and a recommendation each.

| id | Question | Status at `4e4e46f`, re-measured 2026-09-24 | Recommendation |
|---|---|---|---|
| **`D91`** 🔴 (restored) | Re-baseline four coverage thresholds so Vitest 4 can land | **The keystone: the only blocker of Vitest 4, and Vitest 4 is the only blocker of Vite 8** — `vitest@4.1.11` peers `vite ^6 \|\| ^7 \|\| ^8`, re-verified from the registry today. R5-O9 §7.4c proved the coverage drop is **not caused by Vitest 4**: `vitest@3.2.6 --coverage.experimentalAstAwareRemapping=true` reproduces it to the digit | **take it, on 3.2.6 with remapping on.** One decision releases two slices, and it can be taken with Vitest 4 nowhere near the tree |
| **`D85`** 🟢 (restored) | tsdown adoption | **NO-GO re-affirmed on three grounds, now measured rather than reasoned.** (1) floor: `tsdown` `latest` is still **0.23.0**, `engines.node ^22.18.0 \|\| ^24.11.0 \|\| >=26.0.0`; the newest floor-compatible release is still **0.21.10 (2026-04-22)**. (2) **output shape, built for the first time**: `contracts` under tsdown emits **23 files vs `tsc`'s 48**, `.mjs`/`.d.mts` instead of `.js`/`.d.ts`, **16 source maps to 0**, and **both declared `exports` targets (`./dist/index.js`, `./dist/index.d.ts`) missing**. (3) installing it **downgrades hoisted `rolldown` 1.2.11 → 1.0.0-rc.17** and splits it against Vite's | **keep refused.** Re-open only on R5-O9 §8a's three conditions |
| **`D95`** 🔴 (restored, **upgraded from prediction to measurement**) | Two Vite majors in one tree, undetectably | **Reproduced.** Bumping `vite` to `^8` with `vitest@3.2.6` gives `yarn install` **exit 0, zero peer warnings**, hoisted `vite@8.3.1` building the packages and nested `vite@7.3.5` transforming every test lane — and the suite runs **282/282 green** in that state | **(a) add a one-major-per-tree assertion** to `validate:peers` or `validate:engines`. Today nothing in the repository can see this, and it is the most plausible accidental toolchain break available |
| **`D96`** 🟢 (restored) | Vite 7 → 8 is currency, not necessity | **Trigger B1 still has not fired**: `vite`'s `previous` dist-tag is **7.3.6**, published *after* the installed 7.3.5, and every build-path plugin still admits `^7`. `vite@8.3.1` is floor-compatible (`^20.19.0 \|\| >=22.12.0`). The one untested link remains `vite-plugin-dts@4.5.4`'s `vite: "*"` peer. **Build proved safe on `tokens`**: identical file list, **byte-identical declarations**, 3 JS files changed with a visible bundler explanation (−20.5 % on `index.js`, comment stripping) | **defer.** Conditional GO after D91; nothing is asking for it |
| **`D-S2O4-1`** 🟢 (restored) | The `vue-next` lane pin is stale | `vue-next-lane.json` pins **`3.6.0-rc.6`**; the registry `rc` tag is **`3.6.0-rc.9`** — **three RCs stale, unchanged since S2-O4 raised it**. rc.9 was installed and run at `4e4e46f`: **typecheck 0, 340 files / 4,870 tests / 0 failures**, and the Vapor smoke **verified for real** | **repin to `3.6.0-rc.9`** (~10 min, one JSON file), then dispatch `vue-next.yml` once. Its three historical runs all measured the wrong Vue |
| **`D-S5O2-1`** 🟢 **NEW; premise FALSIFIED 2026-09-25 by RESIDUAL-03 — see §10.1** | The repository's only browser-mode lane regressed between 2026-09-18 and 2026-09-24 | `yarn storybook:test` opens a browser, connects, and the page dies before collection (**415 s, `collect 0ms`, `no tests`**); Playwright itself launches chromium in **236 ms**. R5-O9 ran the same lane to 1,453 assertions on 2026-09-18. It is **not in `validate:all`**, so the aggregate stays green while 1,453 story assertions and the `addon-a11y` axe pass are silently unrun | **(a) diagnose and fix, then add a *smoke* link** asserting the lane *collects at least one test* — not that it passes. (b) mark story-DoD evidence `unrun` with this reason. (c) drop the lane. **(a)** — this is an evidence lane going dark without a gate noticing |
| **`D-S5O2-2`** 🟢 **NEW** | The Nuxt support range is prose, and it drifted twice | `packages/nuxt/README.md` claimed *"**Nuxt 3** module"* and *"fixtures build on **Nuxt 3.21.11**"* while the module depends on `@nuxt/kit@4.5.2` and the matrix pins **`3.19.0`** and **`4.4.5`**. The file is in `FACT_DOCUMENTS` and carries **0** fact regions — the gate says so itself. **Prose corrected by TASK-S5-O2; the drift-proofing was not built** | **(a) add a `facts:nuxt-support` region** modelled on `renderVapor`, with the matrix legs lifted into a `nuxt-majors.json` beside `vue-next-lane.json` so one file is the truth for CI and the README |
| **`D-S5O2-3`** 🟠 **NEW** | `validate:engines` is structurally unable to see a build-tool floor breach | `GATE_DEPENDENCIES` is `['vite','vitest','eslint','tsx','typescript','jsdom','@playwright/test']` — **`tsdown` and `rolldown` are both absent.** Demonstrated: installing `tsdown@0.21.10` moved hoisted `rolldown` to a pre-1.0 release candidate with no warning and no gate movement | **(a) add both**, ~30 min. A gate that cannot see the breach it exists to prevent is the class of defect row #41 is about |

**Two premises this addendum falsifies, because a register may not carry a claim
its own evidence contradicts.**

1. **"Nuxt 3 reached EOL 2026-07-31, which makes the `>=3.0.0` floor debate
   moot"** (the S5-O2 packet's gap statement). **False.** `nuxt@3.21.11` was
   published **2026-08-05**, five days after that date and on the same day as
   `nuxt@4.5.2`; the `3x` dist-tag points at it and every 4.x release since May
   has shipped paired with a 3.x one. The floor debate is not moot — and
   narrowing the peer range would **drop a still-shipping, floor-compatible
   major** while admitting `nuxt` versions the declared Node floor forbids
   (`nuxt` ≥ 4.4.6 needs `^22.12.0`; `latest` 4.5.2 needs `^22.19.0`).
   **Recommendation: do not narrow `peerDependencies.nuxt`.**
2. **Part-A row #1's "~~42~~ **41** pending changesets".** The reasoning is
   right, the number is stale: `validate:release-policy` reports **42** today,
   and `find .changeset -name '*.md' -not -name 'README.md' | wc -l` independently
   returns **42** (`ls .changeset/*.md | wc -l` returns 43, the README). Most
   likely a changeset landed after S2-O3 measured. Row #41's own conclusion
   applies: **do not write this number in prose.**

**Revised row-count effect.** The 62 rows above are unchanged and the `[!]`-row
floor in `EXECUTION-STATUS.md` is unaffected. With §8.2, §8.3, the six rows of
§8.4 and the **eight** rows here (five restored, three new), the register carries
**78** distinct open questions.

---

## 9. Addendum — the RESIDUAL-01 gate-cleanup batch, 2026-09-25

*Appended by the **RESIDUAL-01** residual batch, 2026-09-25, at `4e4e46f` +
**295** dirty paths. Appended rather than inserted so no row number moves. Three
rows above are updated in place — **#3**, **#7** and **#16** — and no other row's
text is touched. Full evidence:
[`./RESIDUAL-01-gate-cleanup-handoff.md`](./RESIDUAL-01-gate-cleanup-handoff.md).*

**The headline.** `yarn validate:all` **exits 0 over all 60 links** with the
lockfile aligned — the first green aggregate in this programme — and **links 52–59
executed inside the aggregate for the first time in the repository's history**,
including `validate:evidence-binding`, the gate this programme built to catch its
own failure mode. On the tree as delivered the lockfile is restored to its original
bytes, so the chain stops at link 51 again until the owner runs **one command**.

### 9.1 `D-RES01-1` 🟢 — the icon alignment needs one owner command, and it fixes a second thing

| | |
|---|---|
| **Blocks** | link 51, therefore links 52–60 *in the aggregate*; and, separately, any CI job that runs `yarn install --immutable` |
| **Evidence @ `4e4e46f`** | `validate:icon-duplicates` **reads `yarn.lock`, not the manifests** (its own header: *"a lockfile is what a consumer's CI installs from"*), so the three manifest edits alone leave the gate red on a **lockfile entry with no declarant**: `2 lockfile entr(ies) · 2 distinct version(s) · 1 name(s) · 3 declaration(s)`, all 3 declarations reading `^0.477.0`. `yarn install --mode=update-lockfile` was run in a closed experiment window to measure the real diff: **exactly 4 changes** — 2 workspace descriptor lines, the orphaned `lucide-vue-next@npm:^0.475.0` resolution block deleted, **and `"@dzup-ui/contracts": "workspace:*"` added under `@dzup-ui/nuxt@workspace:packages/nuxt`**. That fourth line is **pre-existing drift**: the S3-O1 dependency was never recorded in the lockfile, so `yarn install --immutable` fails on the committed tree today for a reason unrelated to icons. `yarn.lock` was then restored and re-hashed to `6332fae9…` — **unchanged by the batch** |
| **Reproduce** | `yarn validate:peers > log 2>&1; echo "exit $?"` → **1** · then `yarn install` and re-run → **0**, printing `✓ icon library: one name, one version.` |
| **Options** | (a) plain `yarn install` — updates the lockfile **and** the link step, so the `lock-vs-disk` advisory clears too · (b) `yarn install --mode=update-lockfile` — lockfile only; `node_modules` keeps both copies and the advisory persists · (c) neither |
| **Recommendation** | **(a).** The diff is 4 lines and every one is enumerated, so it is reviewable in ten seconds — and (a) is the only option that leaves `node_modules` agreeing with the lockfile, which is the state the gate's own `lock-vs-disk` line asks for: *"Run `yarn install` before trusting a green run."* |
| **Cost of delay** | **medium.** It is the last step of row #3 option (b) and the difference between a 60-link green chain and a chain that stops at 51 — plus an `--immutable` failure that will surface the moment CI runs on the committed tree |

### 9.2 `D-RES01-2` 🟢 — re-read qualification row 10 now, or after the commit?

| | |
|---|---|
| **Blocks** | nothing; it is a bookkeeping question about **when** row 10's verdict flips |
| **Evidence @ `4e4e46f`** | Row 10's only red clause is `e2e/package-qualification/rows-policy.ts:207` — *"`@dzup-ui/mcp` ships no LICENSE file in its tarball"* — which tests the **extracted tarball** for `/^licen[cs]e(\.[a-z]+)?$/i`. `tar -tzf` on a fresh `yarn workspace @dzup-ui/mcp pack` lists `package/LICENSE`, md5 `7281b4a9…`. So the clause is satisfied; the recorded *artifact* still says FAIL because it was written on 2026-09-22 |
| **Reproduce** | §2.3 of the RESIDUAL-01 handoff, verbatim |
| **Options** | (a) re-run `yarn qualify:package` after the commit, inside the release-evidence regeneration · (b) re-run now · (c) cite the tarball listing and leave the artifact until (a) |
| **Recommendation** | **(a), with (c) standing meanwhile.** (b) writes `docs/qa/release/<candidate>/package-qualification.{md,json}` on a dirty tree, which SC-3 stamps `admissible: false` — a report nobody may cite, which is precisely the trap rows #2 and #6 describe |
| **Cost of delay** | **low.** The defect is fixed; only the record lags |

### 9.3 `D-RES01-3` 🟢 — `yarn test` is still not a chain link

| | |
|---|---|
| **Blocks** | nothing today. Raised because row #16's argument (*"a broken build is not a broken typecheck"*) applies verbatim to the suite, and the batch that closed the build hole should say where it stopped |
| **Evidence @ `4e4e46f`** | `validate:all` is now 60 links and **none** of them is `yarn test`. Two real counter-arguments: the lane is meant to be runnable on a fresh clone in minutes (`docs-size.ts` skips a 40 s build for exactly that reason), and `yarn test` **has exited 1 with zero failing tests under load** — a reporter flake that would make the aggregate flaky rather than strict |
| **Reproduce** | `node -e "console.log(require('./package.json').scripts['validate:all'].includes('yarn test')?'YES':'NO')"` → **NO** |
| **Options** | (a) append `yarn test` as link 61 · (b) leave it to CI, where `test` is already a job and a `needs:` prerequisite of the same downstream jobs `typecheck` gates · (c) append a fast subset |
| **Recommendation** | **(b).** The build was the exception, not the rule: **nothing** covered it, whereas the suite is already covered. Adding a flaky 10-minute link to a lane whose value is that it always runs would trade strictness for noise |
| **Cost of delay** | **low** |

**Revised row-count effect.** The 62 rows above plus §8's eight remain as they
were; **#7** and **#16** move from `open` to **CLOSED** and **#3** stays open with
its cheap half executed. With the three rows here the register carries **79**
distinct questions, of which **77** are open.

## 10. Addendum — the RESIDUAL-03 browser-lane batch, 2026-09-25

*Appended by the **RESIDUAL-03** residual batch, 2026-09-25, at `4e4e46f` +
**297** dirty paths. Appended rather than inserted so no row or section number
moves. Exactly **one** row above is touched — **`D-S5O2-1`** in §8, whose status
cell now carries a dated pointer to §10.1. Its original text is left verbatim,
because a register that rewrote a falsified premise out of itself would destroy the
evidence that the premise was ever held. Full evidence:
[`./RESIDUAL-03-browser-lane-handoff.md`](./RESIDUAL-03-browser-lane-handoff.md).*

**The headline.** There was no regression and there is no dark lane.
`yarn storybook:test` runs **170 files / 1,462 tests / 1,458 passed / 4 failed in
103.80 s** in real chromium at `4e4e46f`, and `.github/workflows/ci.yml` job
`storybook-test` (`ubuntu-latest`, no `continue-on-error`) has been gating it all
along. The 415 s death was a **measurement artifact**: the lane was driven through
the **root-hoisted** `vitest` binary from inside `apps/storybook`, which declares
`installConfig.hoistingLimits`, so two `@vitest/browser` copies and two `vite`
majors met in one run.

### 10.1 `D-S5O2-1` 🟢 — CLOSED as **not a defect**; the defect was the probe

| | |
|---|---|
| **Original claim** | The lane regressed between 2026-09-18 and 2026-09-24 (415 s, `collect 0ms`), and "it is not part of `validate:all`, so the aggregate is green while 1,453 story assertions and the addon-a11y axe pass are **silently unrun**" |
| **What is false** | **Both halves.** (1) No regression: `git log --since=2026-09-15` over `vitest.config.*`, `apps/storybook/**` and `package.json` shows the only change to `apps/storybook/package.json` in that window is `check:size --max-mb 25` → `26`; `apps/storybook/node_modules` is still the 2026-09-18 13:26 install that R5-O9's green run used. (2) Not unrun: CI job `storybook-test` runs `test-storybook:ci` on `ubuntu-latest` with `playwright install --with-deps chromium` and **no `continue-on-error`**, so a red lane blocks the PR. Only the "not in `validate:all`" clause was true |
| **What is true instead** | Driving `apps/storybook/vitest.config.ts` with `node ../../node_modules/vitest/vitest.mjs` puts the Node orchestrator in the root install while the Vite server, the `storybookTest` plugin and the browser client resolve app-locally (root `vite` **7.3.5** vs app `vite` **6.4.1**). The browser launches and connects, the handshake fails, `collect 0ms`, and the process never returns |
| **Evidence** | A four-run controlled experiment, one variable at a time. App-local binary on `DzButton.stories.ts` → **16/16, 19.41 s, `EXIT=0`**. App-local binary on **S5-O2's own target file** `AsyncOptionsStates.stories.ts` → **8 tests, 7 passed, 9.99 s, `EXIT=1`** (so neither the story nor the config is the cause). Root binary on `DzButton.stories.ts` → **no output past one `[vite] Re-optimizing` line, `EXIT=137` at a 200 s cap**. The refusal's own stack trace then confirmed the mechanism directly: `loadConfigFromFile` came from `./node_modules/vite/`, i.e. root vite loading the app's config |
| **Fixed here** | `apps/storybook/vitest.config.ts` calls `assertAppLocalRunner()`, which refuses the cross-install shape in ~1 s with the correct command in the message (measured: `EXIT=1`, immediate, against 415 s of silence) and leaves the canonical entry point untouched (re-measured after the guard: **16/16, 7.26 s, `EXIT=0`**). Fail-**open**: it judges only an entry it can identify as a `vitest/vitest.mjs` path, so workers and IDE integrations are unaffected |
| **Gated here** | **`yarn validate:browser-lane`**, appended as **link 61** of `validate:all` (60 → 61; every existing link number holds). Browser-free and CI-safe by design: it never runs the lane, downloads no chromium and measures nothing. It fails if the guard is removed, if `apps/storybook` stops declaring its own `vitest`/`@vitest/browser`/`vite`/`playwright`, if the config stops configuring browser mode (after which the suite still passes — in jsdom — having stopped being browser evidence), if the CI job stops invoking `test-storybook:ci`, or if that job gains `continue-on-error`. **Proved able to fail on live inputs**, not only on fixtures: 2 violations against a live tree with the guard call and the job name mutated in memory, 0 against the real one |
| **Status** | **CLOSED as not-a-defect.** The option (a) the row recommended — "diagnose and fix, then add a smoke link asserting the lane collects at least one test" — is executed in substance, with one deliberate deviation stated in §10.2 |

### 10.2 `D-RES03-1` 🟢 — the smoke link the row asked for is **not** what was built, and why

| | |
|---|---|
| **Blocks** | nothing. Raised because the executed fix deviates from a recommendation this register carries, and a deviation nobody wrote down is indistinguishable from an oversight |
| **What was asked** | `D-S5O2-1` option (a): a `validate:all` **smoke** link that asserts the lane *collects at least one test* |
| **What was built** | A browser-free wiring gate (§10.1). The smoke link was considered and rejected on three measured grounds: (1) it needs a **chromium download** in a chain whose value is that it runs on a fresh clone in minutes — the same argument `docs-size.ts` already makes about a 40 s build, and `validate:all` has no browser dependency anywhere today; (2) a cold-cache first run of this lane costs **~19 s** for one story file, of which several seconds is Vite dep pre-bundling, so it is not cheap either; (3) it would be **host-sensitive** inside a host-insensitive chain — and a link that must be skipped when chromium is absent cannot fail CI, which is the failure mode `inputs[].gate` exists to name |
| **What the deviation costs** | The wiring gate cannot catch a lane that is correctly wired and *still* dies — the 09-18→09-24 hypothesis, which turned out not to exist. That residual risk is carried by CI's `storybook-test` job, which does run the lane and does block merges |
| **Options** | (a) accept the wiring gate as the discharge of option (a) · (b) additionally add the browser smoke link, accepting a chromium dependency in `validate:all` · (c) add the smoke link to the **CI** `storybook-test` job as a fast pre-step instead, where chromium is already installed |
| **Recommendation** | **(a), with (c) available for ~10 minutes if the owner wants a fast-fail signal before the 104 s run.** (b) is the only one that changes `validate:all`'s dependency profile, and it buys nothing CI does not already have |
| **Cost of delay** | **low** |

### 10.3 `D-RES03-2` 🟠 — two new browser-only reds belong to another packet's uncommitted work

| | |
|---|---|
| **Blocks** | a green `storybook-test` job on the commit the owner is about to make |
| **Evidence @ `4e4e46f` + 297 dirty paths** | The lane is **4-red**, down from R5-O9's 5. Three of R5-O9's five now pass, and the three fixed files are exactly the three story files in `git diff 2d51eec..HEAD -- packages/core/stories apps/storybook`. Two of the five persist (`DzCombobox` and `DzMultiSelect` › `Async Options`, R5-O9's F-5, both failing inside `stories/_shared/asyncOptionsHost.ts:170`). **Two are new, and both are in files the uncommitted programme owns:** `forms/AsyncOptionsStates.stories.ts` › `5. Stale-response discard` (untracked — the file does not exist at HEAD) and `layout/DzGrid.stories.ts` › `Form Layout Node (colSpan + rowSpan)` (uncommitted-modified) |
| **Triage** | **0 of the 4 are component defects.** #1–#3 are the async-options seam's dismissable-layer behaviour, which `AsyncOptionsStates.stories.ts`'s own header already documents (*"the panel is a dismissable layer and a pointer-down outside it closes the panel, which aborts the request in flight"*) and which jsdom cannot reproduce. #4 is an assertion that encodes a false expectation about CSS grid: the `rowSpan: 2` item is the sole occupant of both content-sized tracks, so grid distributes its own content height across them and it is **not** taller than a one-row sibling (54 px against 54 px) |
| **Options** | (a) the owning packets fix their two stories before the commit · (b) commit 4-red and fix after · (c) rewrite the two older `Async Options` stories to drive their host programmatically, as `AsyncOptionsStates` already does, closing F-5 as well |
| **Recommendation** | **(a) for the two new ones, then (c) as its own small packet.** (c) is ~40 minutes and retires a finding that has been open since 2026-09-18; #4 is a two-line assertion change and should not reach a commit, because a story that has never passed in the only lane that runs it is not evidence |
| **Cost of delay** | **medium** — `storybook-test` blocks the PR, so a 4-red lane is a red CI run on the owner's first push |
| **Status, 2026-09-25** | **CLOSED by the RESIDUAL-04 batch — see §11.1.** All four reds are fixed and the lane is **0-red** (170 files / 1,462 tests / 1,462 passed / 102.62 s, `EXIT=0`). Recommendation (a) is discharged. **Recommendation (c) is NOT what was done, and the reason matters: the triage in this row is wrong on two of the four rows.** The `Async Options` pair is **not** dismissable-layer behaviour and **not** a harness assumption — it is a real, user-visible defect of `DzCombobox` and `DzMultiSelect`, measured in §11.1. Rewriting those two stories to drive their host programmatically, as (c) proposed, would have turned the lane green **over a live defect**. The row's text is left verbatim |

**Revised row-count effect.** §9 closed with the register carrying **79** distinct
questions, of which 77 were open. This addendum adds **two** new rows
(`D-RES03-1`, `D-RES03-2`) and moves **`D-S5O2-1`** from open to **CLOSED**, so the
register now carries **81** distinct questions, of which **78** are open.

> **Status 2026-09-28 (RESIDUAL-09): RESIDUAL-03's ranked items 3 and 4 are 🟢 CLOSED.**
> The `browser-matrix` and `browser-engine-ratchets` inputs of the capability matrix now each
> declare a `gate` block, filled in the generator and regenerated —
> `{platform: "win32 …", authoritative: "linux", ciGate: false, blockedOn: …}` for both, with
> `ciGate: false` measured over **all eight** workflow files (a grep for `e2e:matrix`,
> `browser-evidence`, `engine-ratchets` and `e2e/matrix` returns **zero** matches: **no
> workflow runs that lane at all**) and `authoritative: linux` measured from the **19**
> `runs-on:` values, every one `ubuntu-latest`. **This section's ground for deferring the work
> was respected, not overridden**: not one cell, state, total or note moved, proved
> byte-for-byte in §15.2. The same batch also filled the two other missing blocks,
> `story-dod` and `at-matrix`, so all six inputs now answer *"can this fail CI?"*.

## 11. Addendum — the RESIDUAL-04 browser-lane-green batch, 2026-09-25

*Appended by the **RESIDUAL-04** residual batch, 2026-09-25, at `4e4e46f` +
**301** dirty paths. Appended rather than inserted so no row or section number
moves. Exactly **one** row above is touched — **`D-RES03-2`** in §10.3, which gains
a dated `Status, 2026-09-25` row; its original text, including the triage this batch
falsifies, is left verbatim, because a register that edited a wrong call out of
itself would destroy the evidence that the call was made. One row outside this
register is touched the same way: **`F-5`** in
`docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md`. Full evidence:
[`./RESIDUAL-04-browser-lane-green-handoff.md`](./RESIDUAL-04-browser-lane-green-handoff.md).*

**The headline.** The lane is **0-red**: `yarn storybook:test` → **170 files /
1,462 tests / 1,462 passed / 0 failed / 102.62 s, `EXIT=0`**, with the **test count
unchanged** (1,462 → 1,462 — nothing was reached by deleting a test). And the
finding that matters more than the colour: **RESIDUAL-03's "4 failures, 4 harness
assumptions, 0 component defects" is wrong on two of the four.** The `Async Options`
pair is a real, user-visible defect of `DzCombobox` and `DzMultiSelect`, and the
recommendation this register carried — rewrite those stories to drive their host
programmatically — would have made the lane green **over** it.

### 11.1 `D-RES03-2` 🟢 — CLOSED; and two of its four rows were misdiagnosed

| | |
|---|---|
| **Original claim** | Four browser-only reds, **"0 of the 4 are component defects"**; #1–#3 are "the async-options seam's dismissable-layer behaviour, which `AsyncOptionsStates.stories.ts`'s own header already documents"; recommendation (a) then (c) |
| **What holds** | **Two rows.** `DzGrid` › `Form Layout Node` really was an assertion that is false about CSS grid — a `rowSpan: 2` item that is the sole occupant of both content-sized tracks it spans is **not** taller than a one-row sibling, so the check could not have passed for *any* working `rowSpan`. `AsyncOptionsStates` › `5. Stale-response discard` really was a fixture problem, though not the one named: the walk types `ab` and `DzSelect`'s `searchable` path re-filters **host-supplied** items locally, so the host's answer arrived and was filtered away |
| **What is false** | **The `Async Options` pair is not harness behaviour, and the quoted cause is about something else.** The header sentence — *"a pointer-down outside it closes the panel"* — is true of the story's on-page **host buttons**, which are outside the panel. The retry control is **inside** the panel, so no pointer-down-outside occurs |
| **What is true instead** | `useAsyncOptions`'s `canRetry` is `state === 'error'` and nothing else, so the retry control **removes itself as it is pressed**. A pointer press focuses a `<button>` first, so the removal hands focus to `document.body`; Reka's `DismissableLayer` reads that as focus leaving the layer, and `ComboboxContentImpl`'s `onDismiss` calls `onOpenChange(false)`. **The panel closes under the user and the retry result is never shown.** `DzSelect` is **measured** unaffected — `AsyncOptionsStates` › `3. Error with retry` drives the identical `userEvent.click(retry)` and passed both before and after the fix — and the *reason* (Reka's `SelectContent` is a focus-trapped modal layer, so focus on `body` is pulled back) is **inferred from Reka's source, not probed**. That one control in the family passed the identical walk is the clue "verified in jsdom only" concealed: the walk was never the problem |
| **Evidence** | Two probes, one variable, live DOM read in real chromium immediately after the press. `userEvent.click(retry)` (focuses, as a browser does): `[data-part="content"]` count **0**, retry button **detached**, `activeElement` **`BODY`**. `retry.click()` (no focus move): content **1**, `data-state` **`open`**, retry **attached**, `activeElement` the panel's **input**. Both fire the handler (`retries=1`, `requests=2`), so the activation is not in question — only the focus is |
| **Fixed here** | `packages/core/src/components/forms/DzOptionsState.vue`: the retry control gains `@mousedown.prevent`, so pressing it does not change the panel's focus owner — which is also the WAI-ARIA combobox rule. The `click` still fires, so keyboard activation is unchanged, and no prop, emit, slot, `data-part`, message or class moved. **Changeset added** (`@dzup-ui/core: patch`), because `core` is in `release-policy.json`'s published list. Both stories pass with their **original** assertions and their **original** `userEvent.click` |
| **It was already the contract, and one control in seven kept it** | This reclassifies the defect from a judgement call to a **conformance gap**. `DzMention.vue:845` already carries `@mousedown.prevent` on its own `DzOptionsState` instance, with the comment *"Mousedown is prevented so a pointer retry keeps focus in the text control"*, and `DzMention.contract.spec.ts:198` asserts it by name: *"A pointer retry must not steal focus from the text control (**C9.4**)."* `grep -rn 'C9\.4'` over `packages/` and `docs/` returns **two hits, both in `DzMention`'s own files**, and `grep -rn mousedown packages/core/src/components/forms/*.vue` found the binding on **no other control**. So six of the seven hosts of the shared row violated a clause the seventh both implements and tests. Putting the rule **on the shared row** is what the row exists for; `DzMention`'s own binding stays, harmlessly, and its contract spec still passes |
| **Proved able to fail** | Three seeded breaks, each on component source and each restored byte-identically (`sha256sum`): `rowSpan` handling removed from `DzGridItem` → `DzGrid` fails at its **geometry** assertion (`expected 54 to be greater than 81`), before any class-name check · `@mousedown.prevent` deleted → both `Async Options` stories fail at `asyncOptionsHost.ts:170`, the exact pre-fix failure · the supersede `abort()` deleted from `useAsyncOptions.request()` → `5. Stale-response discard` fails at `aborted() === total − 1`, which is the proof that changing its fixture did not defang it |
| **Status** | **CLOSED.** Option (a) discharged for all four; option (c) **deliberately not taken**, because it was the recommendation that would have hidden the defect |

### 11.2 `D-RES04-1` 🟠 — the retry control's **keyboard** path has no answer yet

| | |
|---|---|
| **Blocks** | nothing today. Raised because the pointer fix closes one half of a focus contract the seam does not have, and a half-answer nobody wrote down looks like a whole one |
| **Measured** | `canRetry` is still `state === 'error'` and nothing else, so the retry control still unmounts on activation. A keyboard user who had it focused would lose focus to `document.body` exactly as the pointer path did, and the same dismissal would follow. `@mousedown.prevent` does not cover that path |
| **Inferred, not measured** | Whether a keyboard user can reach the control at all. It is a `<button>` inside a panel portalled to `document.body`, so with focus in the panel's input, `Tab` follows document order into the host page rather than into the portal. That reading is from the markup and the portal target, **not** from a key-by-key probe — it is a hypothesis for the owner, and if it holds it is a WCAG 2.1.1 failure that predates this batch |
| **Why not fixed here** | Every candidate fix is a **design decision about seven published controls**, not a defect with one right answer: keep the control mounted and `aria-disabled` while the retry runs (it must be `aria-disabled`, not `disabled`, because Chrome blurs a disabled element and that reintroduces the bug) · have the host control restore focus to its own input when the row's focus owner is removed (the general fix, and the largest) · make the retry a tab stop inside the panel's focus scope. The third is the only one that also fixes reachability. A red-lane packet should not pick |
| **The answer is probably already written** | `DzMention` implements **C9.4 in two parts**, not one: `@mousedown.prevent` on the row (which this batch generalised) **and** `handleRetryOptions()` ending in `void nextTick(() => controlRef.value?.focus())` — an explicit return of focus to the text control after the retry. The second half is exactly what the other six controls lack, and it is the candidate fix above that closes the measured half of this row. It was not copied here because `DzCombobox` and `DzMultiSelect` hold no template ref to their Reka `ComboboxInput` today, so adding one is a real change to two components rather than a one-line generalisation — and it should be made with the reachability question answered, not before it. **Cost estimate with the precedent in hand: ~45 min for the two controls, plus the a11y review** |
| **Options** | (a) accept the pointer fix as the whole of this batch and schedule the keyboard half · (b) probe reachability first (~15 min in the browser lane) and only then choose · (c) take the general fix now: focus restoration in the seam, across seven controls, with an a11y review |
| **Recommendation** | **(b) then (c).** (b) is cheap and decides whether this is a focus-restoration bug or a reachability bug, and they have different fixes |
| **Cost of delay** | **low-to-medium** — nothing regresses, but if reachability is broken then `Try again` has never been operable by keyboard |

### 11.3 `D-RES04-2` 🟠 — a searchable control re-filters the rows its host returned

| | |
|---|---|
| **Blocks** | nothing today; pinned by an assertion so it cannot be tripped over a third time |
| **Evidence** | `DzSelect.vue`'s `filteredItems` filters `props.items` by the live query with a label-substring match **whenever `searchable` is set** — including when a host is driving the options through the `useAsyncOptions` seam. The comment on `handleSearch` states the opposite: *"A host driving the options filters server-side; a static control filters locally through `filteredItems` and **this is a no-op**."* It is not a no-op. Measured: the story typed `ab`, the host answered with three people, and **all three were hidden**, which is how `5. Stale-response discard` failed |
| **Why it matters** | A host that matches on anything other than the label — an e-mail address, a fuzzy score, a server-side ranking, a synonym list — has rows it deliberately returned silently removed. The control filters a set it did not fetch, by a rule it did not choose |
| **Why not fixed here** | It changes what **seven published controls render** for every host-driven `searchable` case, and the safe form of the fix (skip the local filter when `optionsState !== undefined`) is a behaviour change a consumer could be relying on. Same class as `D-S3O2-5`, and pinned the same way: `AsyncOptionsStates.stories.ts` › `5. Stale-response discard` now asserts that a returned-but-non-matching row (`Grace Hopper`) is **absent**, with a comment naming this row, so the behaviour is recorded rather than rediscovered |
| **Options** | (a) leave as is and document it on the seam's page · (b) skip the local filter when the control is host-driven (`isAsync`) · (c) give the seam an explicit opt-out prop (`:filter-local="false"`) |
| **Recommendation** | **(b)**, as a minor, with the pinning assertion updated in the same change — a host that was asked for a query and answered it has already filtered. (c) adds surface for a question that has one right answer |
| **Cost of delay** | **low** |

**Revised row-count effect.** §10 closed with the register carrying **81** distinct
questions, of which 78 were open. This addendum adds **two** new rows
(`D-RES04-1`, `D-RES04-2`) and moves **`D-RES03-2`** from open to **CLOSED**, so the
register now carries **83** distinct questions, of which **79** are open.

---

## 12. Addendum — the RESIDUAL-05 C9.4-and-citations batch, 2026-09-25

Appended, not rewritten. §11's rows keep their original text, including the two
readings this batch falsifies, and each gains a dated status row below. Nothing is
renumbered and no earlier row is edited.

### 12.1 `D-RES04-1` 🟠 → 🟢 **CLOSED for the focus half · SPLIT for reachability**

| | |
|---|---|
| **Status, 2026-09-25 (RESIDUAL-05)** | **The focus-restoration half is CLOSED.** §11.2's option (b) was executed first, exactly as recommended, and then (c) — so the row is discharged to the limit of agent authority, with one part carved out and re-raised as `D-RES05-1` because it is not a focus bug at all |
| **Probed, where §11.2 inferred** | §11.2 said reachability was *"a hypothesis for the owner"*. It was measured, in real chromium, on `DzCombobox` with a live host. **The retry control is not reachable by `Tab`, and it is not reachable by any key.** It is the *only* tabbable element in the panel (`tabIndex 0`, not disabled), and one `Tab` from the panel's input lands on the **host page's** next button and **closes the panel** (`[data-part="content"]` count 0). Seven routes were driven, each on a fresh error state: `Tab` → BODY, panel closed · `Shift+Tab` → BODY, panel closed · `ArrowDown` / `ArrowUp` / `Home` / `End` / `PageDown` → focus never leaves the input (there are no options to navigate in the error state). **The hypothesis holds, and it is a WCAG 2.1.1 failure that predates this batch** |
| **Also measured — one half of §11.2 is false** | §11.2 wrote *"the same dismissal would follow"*. It does not. With the retry focused programmatically (as an AT's form-controls mode does), `Enter` and `Space` both fire the handler (`retries`/`requests` advance) and both leave `document.activeElement` on **`BODY`** — at the instant of activation and still 120 ms later — but `[data-part="content"]` is **present** and `data-state` is **`open`**. So the keyboard path is a **pure focus-loss** bug, not the pointer path's dismissal bug. Smaller than predicted; still a defect, because the user's keyboard position is destroyed and no focus ring is visible anywhere |
| **A second conformance gap found while probing** | §11.2 and §11.1 both treat `DzSelect` as the unaffected control group and count **seven hosts of the shared row**. `DzSelect` **is not a host of the shared row**: `grep -rln DzOptionsState packages/core/src/components/forms/*.vue` returns seven files and `DzSelect.vue` is not among them. It renders its own copy of the async-options row (it has to — it publishes an `options-state` **slot** the shared component does not), and `grep -c mousedown DzSelect.vue` was **0**, so RESIDUAL-04's pointer fix never reached it either. Its pointer path passes only because Reka's `SelectContent` is a modal, focus-trapped layer. Measured: it fails the keyboard clause exactly like `DzCombobox` and `DzMultiSelect` |
| **Fixed here** | C9.4's second half, **one definition** in a new internal module `packages/core/src/components/forms/optionsStateFocus.ts` (`withRetryFocusReturn`), called by **both** hosts of the row — `DzOptionsState.vue` and `DzSelect.vue`. It restores focus **only** when the retry owned it (so a pointer press, whose mousedown default is prevented, is untouched — measured: `activeElement` is still the panel's input) and **only** when nothing else claimed it (so `DzMention` keeps returning focus to its text control, which its own contract spec asserts). Each row gains `tabindex="-1"` and `dz-focus-ring-control-inset` so the destination is focusable and visible. `DzSelect`'s retry also gains `@mousedown.prevent`, which every other host already had — a conformance change, not a measured defect. **Changeset added** (`@dzup-ui/core: patch`) |
| **Asserted on the contract, on eight hosts at once** | `walkAsyncOptionsStates` (the shared story walk) gains a fifth phase, `keyboard retry — C9.4`, so all **eight** story files that drive the seam assert it. It asserts the clause, not the fix: the row is still in the document (the panel survived), `activeElement` is not the body, is connected, and carries a `data-part` — a **named** element of the anatomy, whichever one the host chooses — and the host's own `expectOptions()` then finds a visible option, which a dismissed panel cannot produce. **No test was added or removed** (phases are `step`s): the browser lane is **170 files / 1,462 tests / 1,462 passed / 0 failed** before and after |
| **Proved able to fail** | Two seeded breaks, both on **component source**, each restored byte-identically (`sha256sum -c`, `EXIT=0`). (1) the focus return neutered in `optionsStateFocus.ts` → **3 failed / 51 passed**: `DzCombobox`, `DzMultiSelect` **and `DzSelect`**, while `DzMention` correctly **passed** (it does not depend on the fallback). (2) `tabindex="-1"` deleted from the **shared row only** → **2 failed / 39 passed**, and **`DzSelect` passed** — which is the "`DzSelect` is not on the shared row" finding, measured a second way |
| **What remains** | **Reachability**, split out as `D-RES05-1` below. It cannot be fixed inside the row: making a portalled button reachable is a change to how each panel manages focus, or a change to whether the control unmounts at all |

### 12.2 `D-RES02-2` 🟡 → 🟢 **CLOSED — fixed, with the standing damage measured**

| | |
|---|---|
| **Status, 2026-09-25 (RESIDUAL-05)** | **CLOSED, option (a) as recommended**, plus the audit §8's row asked for (*"worth pairing with an audit of the existing lists, since nothing guarantees this is the first accidental citation"*) — it was not the first |
| **How much of the evidence was real** | Measured over the checked-in matrix, recomputing all citations both ways: **201** citations across the three substring-derived kinds (`axe`, `ssr-sample`, `portal-hydration`), **193 genuine (96.0 %)**, **8 substring-only artefacts (4.0 %)**, **3 cells `present` on nothing but prose**, and **0** citations the substring rule missed that structure finds. The audit first proved it reproduces the recorded artifacts exactly under the old predicate (0 mismatching cells), so it measured the shipped generator |
| **The three cells that were evidence-free** | `DzCarousel` (B) `axe`, `DzDatePicker` (C) `axe`, `DzTree` (C) `axe` — each `present` on one citation, now `unrun` on none. `DzDatePicker` is the sharpest: `forms.a11y.spec.ts`'s header says *"Tests DzDatePicker, …"* and the file **never imports it**, so a Tier C component's accessibility evidence was one stale sentence in a docblock. Four more traced to a *"tested elsewhere"* note — a sentence whose meaning is "this file does not test these" was what granted this file their citations — and those four keep real citations from `inputs.a11y.spec.ts`, so they are harmless in effect |
| **Fixed here** | New `packages/tooling/src/quality/spec-component-refs.ts` (+ a 21-case spec, 8 of them asserting that prose grants nothing). `filesMentioning` is gone; a citation now requires the component to be **loaded**: its module imported (static or dynamic, the form all 11 a11y specs and 3 of 6 SSR specs use), or an import binding from a components/providers module, or a string-literal argument in a file that actually contains a **template-literal dynamic import** (the form the other two SSR specs use, and without which real evidence would have been deleted). All three run on a **comment-stripped** source, hand-scanned so a `//` in a URL and a `/*` in a string survive |
| **Fail closed, proved three ways** | (A) a comment naming two now-`unrun` components, seeded into a spec that imports neither → **both generated artifacts byte-identical**, `validate:capability-matrix` green. (B) the **old predicate seeded back** with the same comment on disk → the two cells flip `unrun` → **`present`**, citing a file that imports neither, the totals return to **exactly the frozen baseline**, and the gate still says **`✓ fresh`**. One comment bought two accessibility-evidence cells and nothing could see it. (C) a fake citation hand-written into the artifact → `✗ [freshness] … is stale`, `EXIT=1`. So the generator refuses to invent a citation and gate 1 refuses one the generator would not produce. Every seed restored, `sha256sum -c` **OK** |
| **Matrix movement, old → new** | `pass` **585 → 585 (unmoved)** · `fail` 0 → 0 · `present` **608 → 605** · `stale` 22 → 22 · `unrun` **400 → 403** · `excepted` 47 → 47 · rows/cells 144/1662 unchanged. The brief anticipated `pass → unrun`; the real movement is **`present → unrun`**, one state to the left, and `pass` — the number a reader trusts most — did not move. The artifact's whole diff is 21 removed and 10 added lines: 4 totals, 8 citations, 3 state flips |
| **No ceiling touched** | `unrunCells` in `capability-matrix-ceilings.json` is, in its own words, *"REPORT ONLY — a recorded baseline, not a gate, and deliberately so"*, and the validator agrees. So the gate prints `unrun 403 (baseline 400, +3)` and passes. **That `+3` is left standing deliberately.** Re-baselining it is raised as `D-RES05-2`, not done |

### 12.3 `D-RES05-1` 🟠 — the retry control is not reachable by keyboard at all

| | |
|---|---|
| **Blocks** | nothing today, and it has blocked nothing for as long as the seam has existed — which is the point |
| **Split from** | `D-RES04-1`, whose focus half is now closed (§12.1). This is the half that is not a focus bug |
| **Measured** | Seven keyboard routes out of the panel's input, each on a fresh error state, in real chromium: none reaches `Try again`. `Tab` and `Shift+Tab` leave the panel **and close it**; the arrow/`Home`/`End`/`PageDown` family never leaves the input because the error state has no options to navigate. The control is focusable (`tabIndex 0`, not disabled) and is the only tabbable element in the panel — and no key delivers focus to it |
| **Why it matters** | `Try again` is the **only** way to recover a failed option load. On this evidence a keyboard-only user cannot operate it, on every host of the seam whose panel is portalled. That is **WCAG 2.1.1 (Keyboard)** on a functional control, not a focus-order nicety. It is also not new: it predates RESIDUAL-04 and RESIDUAL-05 and neither batch's fix changes it |
| **Options** | (a) make the retry an `aria-activedescendant` target of the arrow-key navigation the input already owns · (b) **stop unmounting it**: keep the control rendered while `state === 'loading'` and `aria-disabled` (not `disabled` — Chrome blurs a disabled element and that reintroduces the focus loss), a change to what consumes `useAsyncOptions().canRetry` · (c) move retry off the row and onto the control's own keyboard map (e.g. `Enter` on an error row re-requests) · (d) accept and document |
| **Recommendation** | **(b).** It is the smallest change that fixes reachability, and it would make *both* halves of C9.4 vestigial rather than load-bearing — which is a strong hint that the **unmount**, not the focus, was always the defect. Not taken here because it changes what eight published controls render in the `loading` state (a visual and an AT re-baseline) and `canRetry` is a documented computed on a published composable. ~1–2 h plus an a11y review and two baselines |
| **Cost of delay** | **medium** — a documented recovery affordance has never been keyboard-operable, and the two batches that touched this row did not change that |

### 12.4 `D-RES05-2` 🟢 — re-baseline `unrunCells` from 400 to 403, or not

| | |
|---|---|
| **Blocks** | nothing. `validate:capability-matrix` is green; the drift is printed, not gated |
| **Why it exists** | Removing 8 false citations moved 3 cells `present` → `unrun`, so the matrix now reports `unrun 403 (baseline 400, +3)`. The baseline is a **recorded measurement with a written derivation** (*"400 at 4e4e46f, down from 441 before this task"*) and a per-tier split, so rewriting it is the owner's act. An agent did not silently absorb a +3 into a number the programme quotes |
| **Options** | (a) re-baseline to 403 with the per-tier split (A 65 · B 248 · C 89 · D 1) and a note that the rise is a citation correction, not a coverage loss · (b) leave 400 standing so the `+3` keeps printing until the three cells have real axe evidence · (c) close the gap instead: add `DzCarousel`, `DzDatePicker` and `DzTree` to their families' a11y specs, which is a genuine ~1 h of work and takes the number back to 400 **honestly** |
| **Recommendation** | **(c), then (a).** (c) is the only option that improves the product rather than the bookkeeping, and all three components are Tier B/C with anatomy declared, so an axe render is cheap. Until then (b) is safer than (a): a printed `+3` is a to-do list |
| **Cost of delay** | **none** |

### 12.5 A note on RESIDUAL-04's own numbers, for the next reader

Two of RESIDUAL-04's statements are corrected above and **neither was careless** —
both are the predictable cost of the thing this programme keeps finding. *"Seven hosts
of the shared row"* was derived from `grep -rn 'C9\.4'` and `grep -rn mousedown`, which
answer a different question than *"which components import the shared row"*; and
*"the same dismissal would follow"* was explicitly labelled as inference rather than
measurement, which is what made it cheap to falsify. The lesson recorded rather than
implied: **a grep over the clause found the controls that had heard of the rule, not
the controls the rule applies to.** The component that never mentioned C9.4 was the one
that had copied the row.

**Revised row-count effect.** §11 closed with the register carrying **83** distinct
questions, of which 79 were open. This addendum adds **two** new rows (`D-RES05-1`,
`D-RES05-2`) and closes **two** (`D-RES04-1`'s focus half, `D-RES02-2`), so the
register now carries **85** distinct questions, of which **79** are open.

---

## 13. Addendum — the RESIDUAL-06 reachability-and-citations batch, 2026-09-25

Appended, nothing above renumbered. §12.3's and §12.4's rows keep their original text —
including the recommendation §13.1 falsifies — and gain dated status rows. Full evidence:
`reports/RESIDUAL-06-a11y-reachability-handoff.md`.

### 13.1 `D-RES05-1` 🟠 → 🟢 — CLOSED, and its recommended option was the wrong one

| | |
|---|---|
| **Status, 2026-09-25 (RESIDUAL-06)** | **CLOSED.** A keyboard user can now reach and activate `Try again` on every host of the seam, and the panel is not dismissed at any point in the route. Driven in real chromium, with `document.activeElement` recorded at every step, on three portalled controls and two in-canvas ones |
| **The option taken** | **(a), in the only form Reka leaves available.** The retry control becomes the popup's navigable set while the popup has no options: a bare `ArrowDown` or `ArrowUp` from the element that owns the control's focus moves **real DOM focus** to it, `Enter` / `Space` activate it, `ArrowUp` hands focus back. `Tab` keeps its ARIA APG meaning of leaving the combobox, untouched |
| **Why not `aria-activedescendant`** | Reka **owns that attribute**: `ListboxFilter.vue:46-47,73` binds `:aria-activedescendant` from `rootContext.highlightedElement`, whose value comes from the listbox *collection*. A second writer either fights the binding or registers the retry control into the collection as an option — which makes an error row `role="option"`, selectable and part of the filter set: an anatomy and AT re-baseline for a control that is not a choice. Real focus needs none of it, is the mode Reka's own `ListboxRoot` implements for the same navigation (`highlightedElement.value.focus()` when `focusable`), and `ComboboxInput.handleBlur` explicitly does **not** close the popup when focus moves inside the content |
| **§12.3's recommendation (b) is measured wrong, and this is the correction** | *"(b) … the smallest change that fixes reachability"* — **(b) fixes none of it.** Keeping the control rendered and `aria-disabled` while loading stops focus being *dropped* when it unmounts, which `withRetryFocusReturn` already did in RESIDUAL-05. `Tab` still leaves the panel and the arrows still do nothing, so a keyboard user still cannot arrive. (b) would also change what eight published controls render in the `loading` state, for no reachability gain. Not taken |
| **`DzSelect`'s near-copy is covered, and it was never the control group** | RESIDUAL-04 used `DzSelect` as the unaffected comparison. Measured here: **`Tab` from its open panel's trigger lands on the host page's next button and the panel stays open** — its modal focus trap does not contain the tab order, so `Try again` was no more reachable there than anywhere else. `DzSelect` is wired to the **same module**, and a seeded break that deletes only its own root binding fails only `DzSelect` |
| **The defect the fix exposed, also fixed** | Parking focus on the status row works while the retry is *loading* and fails the moment it **succeeds**: the row unmounts with focus on it and drops focus on `document.body` at the instant the user gets what they asked for. Measured (`active=BODY` as the answer rendered). The destination is now where the keyboard route took focus from — the control's own input or trigger — with the row as the fallback, in one place (`retryFocusDestination`) |
| **Narrowed scope, stated** | `D-RES05-1` is a **portalled-panel** defect. On `DzListbox`, `DzTransfer` and `DzMention` the row sits in the control's own tab order with no layer to dismiss, and **`Tab` reached the control before this batch and still does** — measured, not assumed |
| **Proved able to fail** | Two seeded breaks on *component* source, run against the final bytes. Deleting `retry.focus()` from the route: **5 failed / 100 passed** — every portalled host and only those. Deleting `DzSelect`'s own root binding: **1 failed / 104 passed** — `DzSelect` alone. Both restored, `sha256sum -c` **OK** |
| **Changeset** | `.changeset/the-async-options-retry-control-is-reachable-by-keyboard.md`, `@dzup-ui/core: patch` — no declared surface changed, and the keys the route consumes were measured to do nothing in the state where it consumes them. The changeset records that a reader who counts a new keyboard affordance as an addition would say `minor`, and leaves the bump to the release owner |

### 13.2 `D-RES05-2` 🟢 → 🟢 — CLOSED by option (c), so option (a) is unnecessary

| | |
|---|---|
| **Status, 2026-09-25 (RESIDUAL-06)** | **CLOSED, option (c)** — the recommended one. `DzCarousel`, `DzDatePicker` and `DzTree` have real `axe` renders in their families' a11y specs, so `unrun` returns to **400 by adding evidence**, not by restoring a citation or moving a baseline |
| **What each got** | `DzCarousel`: the whole compound (root + 2 slides + previous + next + dots), horizontal and vertical, **plus a carousel with no slides** — 3 renders in `media.a11y.spec.ts`. `DzDatePicker`: the closed trigger with `aria-label`, with `invalid` + `required`, and inside a labelled `DzFormField` — 3 renders in `forms.a11y.spec.ts`. `DzTree`: a nested tree with expanded branches, then the same tree `selectable` + `checkable` — 2 renders in `data.a11y.spec.ts` |
| **Proved not hollow** | Measured per render: **16–18 elements**, real ARIA roles, and **14–17 axe rules actually passed**. `DzTree` passes the rules a tree can fail (`aria-required-children`, `aria-required-parent`, `aria-treeitem-name`, `tabindex`, `nested-interactive`); `DzDatePicker` passes `aria-input-field-name`, `button-name`, `color-contrast`; `DzCarousel` passes `button-name`, `nested-interactive`, `landmark-unique` |
| **Matrix movement, old → new** | `pass` **585 → 585 (unmoved)** · `fail` 0 → 0 · `present` **605 → 608** · `stale` 22 → 22 · `unrun` **403 → 400** · `excepted` 47 → 47 · rows/cells 144/1662 unchanged. The gate now prints `unrun 400 (baseline 400)` with no drift |
| **No ceiling touched** | `capability-matrix-ceilings.json` was not opened for writing. The recorded baseline stays **400** and the measurement came back to meet it |
| **Scope limit, recorded in the spec and not only here** | `DzDatePicker`'s axe run covers the closed trigger. Its calendar panel is a portalled popover, so it is not inside the scanned `container` and an axe run over that container could not see it either way; the grid's evidence belongs with `DzCalendar` |

### 13.3 `D-RES06-1` 🟢 — where focus should go when the async-options row unmounts on an in-canvas control

| | |
|---|---|
| **Blocks** | nothing. Both affected controls stay fully keyboard-operable: nothing is portalled and nothing is trapped, so the list that replaces the row is reachable by `Tab` |
| **Measured** | On `DzListbox` and `DzTransfer` the whole tab order in the error state **is the row** (`focusablesOutsideRow` = 1 and 0). A user tabbing forward can therefore arrive at the retry control having wrapped past the end of the document, with `relatedTarget` = `document.body` — which the row refuses as a destination, because focusing the body is indistinguishable from losing focus. After a successful retry, focus is then on nothing |
| **Why the row cannot decide it** | The row unmounts because the **host** replaced it with the list it just loaded, and the right destination is that list. The row does not know what replaced it, and guessing means one shared component moving focus into eight different hosts' content |
| **Options** | (a) accept and document — the list is one `Tab` away · (b) each host moves focus into its fresh list when the row it was showing unmounts, which is a focus-order (2.4.3) improvement across the seam · (c) give the shared row a host-supplied "where focus goes when I leave" callback, which is (b) with one definition instead of eight |
| **Recommendation** | **(c)**, and only after `D-RES04-2`, since both re-open the same seam. ~1–2 h plus an a11y review. The walk already has the assertion and skips it only for the measured no-origin case, so wiring (c) turns a skip into a pass on two more hosts with no new test |
| **Cost of delay** | **low** |

### 13.4 `D-RES06-2` 🟡 — `aria-controls=""` on every Reka popover and combobox trigger

| | |
|---|---|
| **Blocks** | nothing today. axe reports it as `incomplete`, not a violation, so no gate is red |
| **Measured** | The new `DzDatePicker` axe render returned `aria-valid-attr-value` incomplete: *"Unable to determine if aria-controls referenced ID exists on the page while using aria-haspopup: `aria-controls=""`"*. An **empty IDREF list is invalid**, and it sits beside `aria-haspopup="dialog"` on a closed trigger. The item-1 probe caught the same empty attribute independently on `DzCombobox`'s toggle |
| **Where it comes from** | **Upstream.** `reka-ui/src/Popover/PopoverTrigger.vue:39` binds `:aria-controls="rootContext.contentId"`, and `contentId` is empty until the content mounts. The identical line is in `Combobox/ComboboxTrigger.vue:39` and `Combobox/ComboboxInput.vue:135`, so this is seam-wide rather than one component's |
| **Why it was not fixed here** | Overriding it means binding `aria-controls` against Reka's own binding on the same element — the same conflict class that ruled out `aria-activedescendant` in §13.1, and a worse trade for an attribute that is merely empty rather than wrong |
| **Options** | (a) report upstream and wait · (b) pin it with an assertion so it cannot silently get worse, and document the deviation on the seam's page · (c) override the attribute on every affected Dz trigger |
| **Recommendation** | **(a) then (b).** The cheap half is (b): one assertion, no behaviour change. (c) is the only one that removes the attribute and it is the one most likely to break when Reka fixes this itself |
| **Cost of delay** | **low** |

### 13.5 A finding worth reading, about what `toHaveNoViolations()` cannot see

Item 2's renders returned **zero violations and three `incomplete` results**, and the
`incomplete` results are where the value was. One of them was a real defect:
`DzCarouselDots` published a **named, childless `role="tablist"`** whenever a carousel's
slides came from an empty collection, which ARIA forbids. axe can only call that
`incomplete` — it cannot know that no `tab` will ever arrive — so
`expect(results).toHaveNoViolations()` **passed before and after the fix**. The spec
therefore asserts the structure directly beside the axe call.

Recorded because it generalises: **a suite that only asserts `toHaveNoViolations()`
cannot see anything axe is unsure about**, and axe is unsure about exactly the cases
where a component's DOM depends on data it has not received yet. Fixed in
`DzCarouselDots.vue` with one `v-if`; changeset
`.changeset/an-empty-carousel-no-longer-publishes-a-childless-tablist.md`,
`@dzup-ui/core: patch`. It broke one existing unit assertion, which had been asserting
the transient empty list synchronously; that assertion is now awaited and **stronger**
(the list must exist *and* own its three tabs).

**Revised row-count effect.** §12 closed with the register carrying **85** distinct
questions, of which 79 were open. This addendum adds **two** new rows (`D-RES06-1`,
`D-RES06-2`) and closes **two** (`D-RES05-1`, `D-RES05-2`), so the register now carries
**87** distinct questions, of which **79** are open.

## 14. Addendum — the RESIDUAL-07 focus-and-regeneration-order batch, 2026-09-25

*Appended. Every row above keeps its original text; §13.3 gains a dated status row below
rather than being rewritten, which is this register's convention.*

### 14.1 `D-RES06-1` 🟢 → 🟢 — CLOSED by option (c), with one amendment the measurement forced

**Status, 2026-09-25 (RESIDUAL-07): CLOSED.** §13.3's recommendation — *"(c) give the
shared row a host-supplied 'where focus goes when I leave' callback"* — **survived
measurement**, which is worth saying plainly after §13.1 had to record the opposite about
its own predecessor. It was implemented, driven in real chromium, and proved able to fail
by three seeded breaks on component source.

| | |
|---|---|
| **Reproduced first** | §13.3's claim was re-measured before anything was changed, by replacing the walk's clause-4 skip with a log and letting the assertions run. **2 of 9 seam story files fail: `DzListbox` and `DzTransfer`, and `document.activeElement` is `document.body` on both.** The register named the right two hosts |
| **The failing sequence** | `DzListbox`: start on `DIV[viewport]` → `Tab` onto the story's three host buttons → `Tab` to **`BODY`** (the tab order runs off the end of the page and wraps) → `Tab` onto `BUTTON[options-retry]`, so `cameFrom` = body → `{Enter}` (`retries` 2, `requests` 3) parks focus on `DIV[options-state]` → the host answers, the row unmounts, **`activeElement` = `BODY`**. `DzTransfer`: **nothing tabbable outside the row at all**, so the very first `Tab` arrives from `BODY` and the rest is identical. `DzMention`, also in-canvas, never loses focus — its own retry handler returns it to `TEXTAREA[input]` |
| **The amendment** | **The host destination must be resolved LAZILY, after the row has unmounted and Vue has flushed.** The obvious implementation — add it to `retryFocusDestination`'s preference order so `withRetryFocusReturn` uses it at activation time — fixes `DzListbox` and **leaves `DzTransfer` broken**, because in the error state `DzTransfer` has **zero** tabbable elements outside the row and the option focus should land on is created by the same answer that removes the row. This is seeded break 3, not an argument |
| **Implemented** | `optionsStateFocus.ts` **extended, not replaced**: `RetryRowExit` + `useRetryRowExit`, and one `RetryRouteChannel` so the host's exit travels the `provide`/`inject` channel the route already used. `provideRetryKeyboardRoute` gains a second optional parameter. `withRetryFocusReturn`, `retryFocusDestination`, `isReturnTarget` and all three route handlers are **unchanged**. `DzListbox` names its listbox viewport; `DzTransfer` names the first enabled `role="option"` of its source list; **`DzSelect`'s near-copy calls the same exported function on the same route object**. Changeset `.changeset/the-async-options-row-hands-focus-to-the-list-that-replaces-it.md`, `@dzup-ui/core: patch` |
| **The assertion** | §13.3 said *"the walk already has the assertion and skips it only for the measured no-origin case"*, and that was correct. **The skip is now deleted**: clause 4 runs unconditionally on all eight hosts, `settled.isConnected` is asserted beside it, and `cameFrom` is gone because nothing reads it. **No test added or removed** — 9 files · 105 tests, before and after |
| **Proved able to fail** | Three seeded breaks on component source, all run against the final bytes, each restored byte-identically (`sha256sum -c` on five files **OK**, three times, `EXIT=0`). **(1)** the host exit dropped from the destination chain → **2 failed / 103 passed**, `DzListbox` and `DzTransfer`, every in-canvas host whose keyboard arrived from the body and **only** those. **(2)** the `exit` argument removed from `DzTransfer`'s own call → **1 failed / 104 passed**, `DzTransfer` alone. **(3)** the exit resolved **eagerly** instead of after the flush → **`DzTransfer` alone fails and `DzListbox` passes**, which is the evidence for the amendment |
| **Measured after** | `DzListbox` → `DIV[item]<Ada Lovelace>` · `DzTransfer` → `DIV[item]<Ada Lovelace>` · `DzMention` → `TEXTAREA[input]` · `DzSelect` → `BUTTON[trigger]` · `DzCombobox` → `INPUT[input]`. **`DzListbox` lands on the first option rather than the viewport it names**, because Reka's `ListboxContent` forwards focus to its highlighted item — the host's stated destination and the measured resting place differ on purpose |
| **Honest limit** | **No seeded break can fail `DzSelect`'s call.** Its panel is portalled, so the keyboard route always arrives from the trigger, which outlives the row; focus is never on the row when a successful retry unmounts it. Its host destination is `null` deliberately, and the file says so. That is raised as **`D-RES07-1`** rather than claimed as proof |
| **Option (a) and (b), for the record** | (a) accept and document was rejected: it is a reproducible focus loss on a Level A affordance and two lines of host wiring fix it. (b) each host moves focus itself was rejected for §13.3's own reason — eight answers to one question |

### 14.2 `D-RES07-1` 🟡 — `DzSelect` now has two pieces of C9.4 that no test drives

| | |
|---|---|
| **Blocks** | nothing today. Both pieces are present and correct by construction; neither is exercised |
| **Measured** | §13's batch recorded the first: the `@keydown` on `SelectContent`, covering the *list showing → item focused → host-driven reload* route. Deleting it fails nothing. This batch adds the second: `useRetryRowExit(retryRoute, null)`, which cannot be failed by any seeded break while the trigger holds focus. **They are the same undriven route seen from two sides** |
| **Why that matters** | It is an argument for **driving the route once**, not for deleting either piece. The route is real: the list is showing, the user has arrowed onto an item so focus is inside the portal, and a host-driven reload then replaces the list with the row — the focused item unmounts and focus falls back inside the content, outside the root |
| **Options** | (a) add that route to `DzSelect`'s own story, which drives **both** pieces at once · (b) delete the content binding and pass no exit, recording the route as unsupported · (c) accept and re-record next batch |
| **Recommendation** | **(a)**, ~45 min. It is the cheapest remaining item in this seam and the last untested route in it after four batches of work |
| **Cost of delay** | **low** |

### 14.3 `D-RES07-2` 🟢 — should the regeneration order be a script rather than a list?

| | |
|---|---|
| **Blocks** | nothing, but it is the recurrence risk behind three agents' broken validation runs in this programme |
| **Measured** | This batch found the order documented in **six** live locations and corrected all six, plus a **seventh** transcription (`docs/program-2026-09-04/contract-conformance-tasks.md:540`) that was already different — four commands instead of six — and was deliberately left alone because it is an executed task's own `<validation>` block. A list that must be hand-copied into six documents has already drifted once |
| **The substance of the correction** | `component-meta` is owed by a **capability** change (it carries a join of `capability-matrix.json` checked by `src/docs/evidence.spec.ts`) **and** by any **story** edit (it records each story's example line range); `docs-pages` is owed by **every** `component-meta` change, because `nav.json`'s `artifactSha256` **is** the sha256 of `component-meta.json` (verified: both `347b2530…`); and **`yarn csp:inline-style-inventory` is a seventh command that no link of the order refreshes and `validate:all` never checks** — verified by running the six links end to end, all `EXIT=0`, and finding the inventory still stale |
| **Options** | (a) add `yarn regenerate:all` chaining the seven with `&&`, and have every document point at it, keeping the per-step *why* in `CLAUDE.md` only · (b) leave it as prose, since a script hides which step was owed and invites regenerating everything on every change · (c) add the script **and** keep the annotated table — the script for correctness, the table for judgement |
| **Recommendation** | **(c)**, ~20 min. A `package.json` script is a published-manifest change, so it wants an owner's eye rather than an agent's |
| **Cost of delay** | **medium** — it is cheap, and every batch that does not do it risks the same lost suite |

> **Status 2026-09-28 (RESIDUAL-09): 🟢 CLOSED by option (c), the recommended one.**
> `yarn regenerate:all` exists and runs the seven steps in order; it **refuses to start** when
> a step names a script `package.json` no longer declares, and **stops at the first failure**
> naming the step, its exit code and the steps that did **not** run — each half proved by a
> seeded break on non-test source, each seed restored byte-identically. `CLAUDE.md`'s
> annotated table is **kept in full** and is now **bound to the script by a spec**
> (`packages/tooling/src/regenerate-all.spec.ts`), so the two copies cannot drift. Full
> measurement in **§15.1**.

### 14.4 The trap itself, stated once so it is not rediscovered an eighth time

`packages/core/security/inline-style-inventory.json` records the **line number** of every
inline `style=` site in published component source. This batch inserted lines into three
`.vue` files that each carry one, and the measured consequence was:

```
sites 133 → 133   (0 added, 0 removed)      dispositions 78/3/0/19/33 → identical
LINE NUMBERS MOVED: 3     DzListbox 408→429 · DzSelect 441→458 · DzTransfer 242→263
```

Nothing was added and no disposition changed — three numbers moved and a published
package's security artifact went stale. **`validate:all` does not check it at all** (there
is no such link in the 61), and the only gate that fails is the **unit suite**
(`packages/core/security/inline-style-inventory.spec.ts` › *"is fresh — the artifact and
the source agree, site for site"*). Run `yarn csp:inline-style-inventory` after **any**
edit to a `.vue` carrying an inline style, whether or not a generated artifact looks
involved.

**Revised row-count effect.** §13 closed with the register carrying **87** distinct
questions, of which 79 were open. This addendum adds **two** new rows (`D-RES07-1`,
`D-RES07-2`) and closes **one** (`D-RES06-1`), so the register now carries **89** distinct
questions, of which **80** are open.

### 14.5 `D-RES01-1` 🟠 → 🟢 CLOSED, and `D-RES07-3` 🟠 raised by its closure — 2026-09-28

**`D-RES01-1` is CLOSED.** Between this batch's gate runs (2026-09-25) and its hand-off,
**`yarn install` was run** — `yarn.lock` mtime and `node_modules/.yarn-state.yml` mtime are
both **2026-09-28 09:36**, and the lockfile diff is exactly what seven reports predicted:
`apps/landing` and `apps/sandbox` move from `^0.475.0` to `^0.477.0` and the orphan
`lucide-vue-next@npm:^0.475.0` resolution block is deleted. **This batch did not run it**;
`yarn.lock` was proved clean by sha256 after every gate run, and every `yarn` command since
has been bracketed by an identical before/after sha (`dcef3ed2… → dcef3ed2…`). Nothing was
reverted or restored.

**Measured consequence:** `yarn validate:all` is **61 links, `EXIT=0`, 1,304 lines, 52 `✓`,
zero `✗`** — the first fully green aggregate in this programme's residual thread. Link 51's
red, identical across RESIDUAL-01…07, is gone. `node_modules/lucide-vue-next` reads
`0.477.0` and exactly one version resolves.

### `D-RES07-3` 🟠 — two defect pins have outlived their defect

| | |
|---|---|
| **Blocks** | **the unit suite.** `yarn test` is **`EXIT=1`**: 574 files, **11,180 passed, 2 failed**, 3 skipped, 1 todo. 11,180 + 2 = **11,182**, the handed baseline exactly, over the same 574 files — nothing was added or lost, two tests flipped |
| **Measured** | Both failures are in **one** file, `packages/tooling/src/validators/peer-icon-duplicates.spec.ts`. *"records the duplication that is open as TASK-R1-O6 item 1 (D174)"* fails with `expected [ '0.477.0' ] to deeply equal [ '0.475.0', '0.477.0' ]` at line **225**; *"names every declarer in the diagnostic a human reads"* fails with `expected '' to contain 'packages/core/package.json'`. Both **assert that the duplication still exists** |
| **Why it is not a regression** | The spec's own comment states the intent — *"this fact is asserted rather than tolerated, so nobody can quietly re-introduce a second version under cover of the first"*. The pinned fact has been fixed, so the pin fails. **That is the pin working.** No failure touches RESIDUAL-07's work: item 1's files are in `packages/core/src/components/forms/` and the seam's nine story files are in the browser lane, which is **green** (170 files · 1,462 tests · 0 failed); item 2's `inline-style-inventory.spec.ts` **passes** on the post-install tree |
| **Why this batch did not just fix it** | Inverting the two assertions **decides that `D174` / TASK-R1-O6 item 1 is closed**, and that decision is entangled with a second fact the same gate reports: `lucide-vue-next` is **deprecated upstream** (*"Please use @lucide/vue instead"*), which TASK-R1-O6 decision item 1 was always going to resolve together with the version split. So *"exactly one version resolves"* may not be the assertion wanted next, and a pin is retired by whoever decided the defect was fixed — not by the agent that noticed |
| **Options** | (a) invert both assertions to pin the **fixed** state — exactly one `lucide-vue-next` resolution, zero error-level violations — and close `D174`, ~10 min · (b) invert them **and** fold in the deprecation, pinning `@lucide/vue` as the target so the swap cannot regress silently, which is TASK-R1-O6 item 1 done properly · (c) delete both tests, which loses the ratchet that stopped a second version being re-introduced |
| **Recommendation** | **(a) now, (b) next.** (a) is ten minutes and returns the unit suite to green; (c) is refused — it is the only thing standing between this repository and a silently re-introduced duplicate icon library. Not (c) under any reading |
| **Cost of delay** | **high** — it is the only red left in the whole repository, and a red suite is how green ones stop being read |

**Revised row-count effect for this addendum.** §14 added `D-RES07-1` and `D-RES07-2` and
closed `D-RES06-1`. This section adds **one** more row (`D-RES07-3`) and closes **one** more
(`D-RES01-1`), so the register carries **90** distinct questions, of which **80** are open.

---

## 15. Addendum — the RESIDUAL-09 regeneration-script and input-gate batch, 2026-09-28

Report: [`./RESIDUAL-09-regen-script-and-input-gates-handoff.md`](./RESIDUAL-09-regen-script-and-input-gates-handoff.md).
Observed at HEAD **`4e4e46f`** with **331 → 333** dirty paths (+2, both attributed). No
commit, push, CI dispatch, publish, `yarn install`, baseline replacement or screenshot
capture. Both aggregates handed back **green**: `validate:all` **61 links, `EXIT=0`, zero
`✗`**; `yarn test` **575 files / 11,196 passed / 0 failed, `EXIT=0`**; browser lane
**170 / 1,462 / 0 failed**.

### 15.1 `D-RES07-2` 🟢 → 🟢 — CLOSED by option (c), and option (c) grew a spec

*§14.3's row keeps its original text. This is its dated status row.*

**Status 2026-09-28: CLOSED by the recommended option (c) — `yarn regenerate:all` AND the
annotated table.** Both halves exist, and the recommendation survived measurement.

**What was built.** `packages/tooling/src/regenerate-all.ts` holds the order as **data**
(seven `{ step, script, owedWhen }` rows) with a CLI in the house shape of
`src/docs/verify.ts`; `package.json` gains `regenerate:all` and its `//` documentation key;
`CLAUDE.md`'s seven-row table and every line of its prose are **kept**, with a blockquote
beneath pointing at the script and stating that the table is not redundant.

**The seven names were verified against `package.json` before wiring** — the brief's warning
is real here (`validate:ownership` runs `validators/ownership-manifest.ts`) — and
`Object.keys(scripts).filter(/regenerate/)` was `[]` beforehand, so nothing was overwritten.
`validate:all` stays **61** links: a script key is not a chain link.

**Two refusals, each proved by a seeded break on non-test source, each restored
byte-identically (never by `git checkout`, which the brief forbids).**

| Seed | Result | Exit |
|---|---|---|
| step 5's script renamed to `generate:llms-renamed-away` | **refuses to START**, names step 5, **0** step banners in the log — not one step ran | **1** |
| `throw new Error(...)` prepended to `generate-quality-matrix.ts` | step 1 exits 0, **step 2 fails and the chain stops**; **2** banners only, and the message lists steps 3–7 as *"NOT RUN — these artifacts are NOT fresh"* | **1**, the failing step's own code |

**End to end from a deliberately stale state.** One comment line inserted into
`packages/core/src/components/buttons/DzButton.vue` (chosen because it was **clean** at
session start) moved its inline `style=` site from line 209 to 210:
`inline-style-inventory.spec.ts` **`EXIT=1`** (`expected [ Array(133) ] to deeply equal
[ Array(133) ]`) → `yarn regenerate:all` **`EXIT=0`, 7 of 7** → the same spec **`EXIT=0`** →
`yarn validate:all` **`EXIT=0`, 52 `✓`, zero `✗`** → restore + regenerate → **`sha256sum -c`
over 182 files, 182 OK**, including the `.vue` and every artifact derived from it.

**The one thing option (c) did not ask for, and the reason it is safe to keep both copies.**
`packages/tooling/src/regenerate-all.spec.ts` (14 tests) parses `CLAUDE.md`'s table and
asserts the `yarn <script>` names it contains **equal the script's order, step for step**.
A second live test reads the **live** `package.json` and fails if any step names a script it
does not declare. Editing one copy without the other is now a red unit test — which is the
only durable answer to the drift this row was raised about.

### 15.2 RESIDUAL-03 ranked items 3 and 4 🟠 → 🟢 — CLOSED; four `gate` blocks declared

*RESIDUAL-03 §4 recorded the platform-authority answer for `browser-matrix` as prose and
deliberately did not write it into the generator, on the ground that "a win32 packet that
cannot qualify a browser result has no business rewriting the artifact that records browser
results". That ground was respected, not overridden: **not one cell, state, total or note
moved**, proved byte-for-byte.*

Four of the six `inputs` declared no `gate`, which the rendered evidence page printed as `—`
in its **Can fail CI** column — indistinguishable from *"not asked"*. All six now answer.

| Input | `platform` | `authoritative` | `ciGate` | Workflow checked for `ciGate`, and its `continue-on-error` |
|---|---|---|---|---|
| **`story-dod`** | `any` — static analysis of committed `.stories.ts` text; no browser, AT, timing or pixel | `any` | **`true`** | **`ci.yml`** job **`validate`** (`ubuntu-latest`), step at **line 163**, `yarn validate:story-dod`. **No `continue-on-error` anywhere in that job** (lines 124–253); the only one in the file is **line 515**, on the *visual* e2e step. Plus `validate:story-dod-tiers`, link 21 of `validate:all` |
| **`at-matrix`** | `none — 0 of 534 cells executed` (derived: 534 rows, distinct `result` set `['unrun']`) | the AT pairing's own platform — **Windows, macOS, iOS, Android**, so no single runner can be authoritative | **`false`** | **all eight** workflow files: a grep for `at-matrix`/`at-runs`/`at-scripts`/`at:ingest` returns **zero** matches. The structural gates reach CI only via `validate:all` (links 23 and 57, `ubuntu-latest`, **no `continue-on-error`**) and **both exit 0 over an empty directory by design** |
| **`browser-matrix`** | `win32 — node v24.14.1` (derived: one distinct value across all 24 runs, every one `worktreeDirty: true` at `589be13`) | `linux` — **all 19 `runs-on:` values across the eight files are `ubuntu-latest`** | **`false`** | **all eight**: a grep for `e2e:matrix`/`browser-evidence`/`engine-ratchets`/`e2e/matrix` returns **zero** matches. The `e2e` job runs `test:e2e:functional` (no `continue-on-error`) and `test:e2e:visual` (**`continue-on-error: true`**) — neither is the matrix lane. **No workflow runs this lane at all** |
| **`browser-engine-ratchets`** | `win32 -- Windows 11 Pro 10.0.26200, node v24.14.1`, read from the ledger's own `platform` field (declared since TASK-N1-O2, never read here until now) | `linux` | **`false`** | **all eight**, same zero matches — the same lane. Declared separately rather than by reference because this input is read on its own: it is what lets a `browser-matrix` cell say *which* of the 24 projects ran |

**`at-matrix`'s `blockedOn` names the human, as it must.** *"a NAMED HUMAN TESTER and a date
(register D112): 534 cells, 0 executed. No CI job can ever make this true — `yarn at:ingest`
transcribes a session record a named person produced, and an agent may never write one."*
`D112` is now printed in the artifact and on 144 generated docs pages, which is the most
visible it has ever been.

**It promoted nothing, and here is the proof rather than the assurance.** The artifact's
sha256 was recorded before the change; afterwards the regenerated artifact was parsed, the
four new `gate` keys deleted, and re-serialized through the generator's own serializer:
**`563789e3f62f0f6ec9d6cc9d616b99bc788c2aa1c69863d4e8ab4adde491bbf0` on both sides —
identical.** So the entire diff is four objects. `pass` **585** · `fail` **0** ·
`present` **608** · `stale` **22** · `unrun` **400** · `excepted` **47** · rows **144** ·
cells **1662**, every one unchanged.

**One honest edge, recorded in the generator rather than smoothed over.** Of the five
story-DoD checks the matrix reads, `dark-mode` is `level: 'error'` at 170/170 and `states` /
`accessibility` / `real-world` sit at `0 / 0` **tier-required** ceilings — but `play` is
reported and **no tier requires it**, so a `play` regression alone fails nothing. `ciGate:
true` with that edge written down is accurate; `false` would be wrong, because four of the
five can turn a CI run red.

### 15.3 `D-RES09-1` 🟡 — does declaring an existing truth in a published generated artifact owe a changeset?

| | |
|---|---|
| **Blocks** | nothing today, but three packets have now answered it privately and inconsistently is only a matter of time |
| **Measured** | `packages/core/docs/capability-matrix.json` ships inside `@dzup-ui/core`, which **is** in `packages/tooling/scripts/release-policy.json`'s `published` list, and this batch changed its bytes: four `gate` objects added under `inputs`. Nothing about the package's declared surface changed — no prop, emit, slot, anatomy part, state value, message key, variant, export or type — `gate` was **already optional** in both `packages/tooling/src/quality/capability-matrix.ts` and `packages/tooling/src/docs/evidence.ts`, two of the six inputs already carried it, and `schemaVersion` is unchanged. **No changeset was added**, and pending changesets stay at **48** |
| **Why it is a question and not an oversight** | Every regeneration of a published `docs/` artifact has this shape. TASK-S1-O3 added `gate` to two inputs and TASK-S1-O4 filled `perf-baselines`; both changed the same published file. If a `patch` is owed for a byte change to a generated evidence artifact, then every `yarn regenerate:all` is a release event and the changeset directory becomes noise; if none is owed, that rule should be written where the next agent will read it |
| **Options** | (a) accept that a generated evidence artifact under `core/docs/` is not a release-worthy surface, and record the rule in `release-policy.json`'s own `$comment` so it does not have to be re-decided · (b) require a `patch` for any byte change to a published `docs/` artifact · (c) stop publishing `core/docs/**`, which is a larger decision about what the package is for |
| **Recommendation** | **(a)**, ~10 min. It is a documentation change to a policy file, and it closes a question three packets have hit |
| **Cost of delay** | **low**, but it is ten minutes and it removes a recurring judgement call |

### 15.4 The weakest link in this batch, named rather than left to be discovered

**Every `ciGate` value in §15.2 was measured by a human grep over `.github/workflows/`**, and
`perfInputGate`'s has been hardcoded on the same basis since TASK-S1-O4. A workflow that
gains `continue-on-error`, or a job renamed away, silently turns one of these blocks into a
lie — and the repository already has the mechanism to stop that:
`packages/tooling/src/validators/browser-lane.ts` does a **textual** read of `ci.yml`'s
`storybook-test` job for exactly this failure mode (`[ci-gate]`, `[ci-advisory]`), because a
YAML parser for one job costs more than it buys. Extending it to assert each declared
`ciGate` against the workflow that justifies it is ranked as RESIDUAL-09's next-packet item 4
(~1 h). It is not raised as a decision because there is no choice in it — it is work.

**Row-count effect for this addendum.** This section adds **one** row (`D-RES09-1`) and
closes **one** (`D-RES07-2`, plus RESIDUAL-03's two ranked items, which were never register
rows). The register carries **91** distinct questions, of which **80** are open.

## 16. Addendum — the RESIDUAL-10 SSR-assertion and `ciGate` batch, 2026-09-28

Report: [`./RESIDUAL-10-ssr-assertions-and-cigate-handoff.md`](./RESIDUAL-10-ssr-assertions-and-cigate-handoff.md).
Observed at HEAD **`4e4e46f`** with **333 → 333** dirty paths — the `diff` of the two full
`git status --porcelain` listings is **empty**, because every path this batch touched was
already dirty at entry and the new report sits inside the already-`??` `reports/` entry. No
commit, push, CI dispatch, publish, `yarn install`, baseline replacement or screenshot
capture. All three lanes handed back **green**: `validate:all` **61 links, `EXIT=0`, 1,311
lines, 52 `✓`, ZERO `✗`** (run twice end to end; the two differ by one line, a
`published-imports` staleness advisory the in-chain build cleared); `yarn test` **575 files / 11,215 passed / 3 skipped / 1 todo / 0
failed, `EXIT=0`**; browser lane **170 files / 1,462 tests / 1,462 passed / 0 failed, `EXIT=0`** (§5.5 records a first run that stalled and was re-run clean).

### 16.1 §15.4's named weakness 🟠 → 🟢 — CLOSED: the `ciGate` claims are asserted

*§15.4 said there was "no choice in it — it is work". It was done as work, in the file §15.4
named, and it found no wrong value.*

All six `ciGate` values were **re-measured by hand first** (so the validator could be checked
against something) and all six confirm RESIDUAL-09: `story-dod` **true** (`ci.yml` job
`validate`, line 163, no `continue-on-error` in lines 124–253; the only one in the file is
line 515 on the visual e2e step) · `at-matrix` **false** (0 matches over all 8 files) ·
`perf-baselines` **false** (0) · `browser-matrix` **false** (0) · `browser-engine-ratchets`
**false** (0) · `visual-baselines` **false** — and this one for a *different reason*: a job
**does** run its lane, and cannot fail, because the step carries `continue-on-error: true`.

**What now runs, inside `validate:browser-lane` (already link 61, so `validate:all` stays at
61 links — measured, not assumed).** For **each** input declaring `ciGate`, the validator
reads the value **as published** from `packages/core/docs/capability-matrix.json` and every
file under `.github/workflows/`, splits each file into jobs and each job into steps, and asks
whether a job runs that input's lane **and can fail** — `continue-on-error: true` on neither
the step nor the job, matched by separate anchored patterns at their own indentation, because
the live `ci.yml` carries it on a *step* while `chromatic.yml` and `vue-next.yml` carry it on
*jobs*. `ciGate: true` requires ≥ 1 such job; **`ciGate: false` requires 0**, so a lane that
silently gains enforcement reddens the chain until the declaration follows. A step's command
is expanded through the root `package.json` scripts transitively before matching, which is
why `validate-min-runtime.yml`'s `yarn validate:all` is seen as a second enforcing job for
`story-dod` rather than as a blank.

**It fails closed, and on more than the two obvious cases**: an unreadable matrix, **zero**
workflow files read (a `false` would pass vacuously), an input declaring `ciGate` with no lane
declared, and a declared lane whose input the matrix no longer publishes.

**Three seeded changes, each proved to turn it red, each restored byte-identically by copy
(never `git checkout`).** `ci.yml` was **clean at HEAD**, so its restore is provable from
`git status` too.

| Seed | Result | Exit |
|---|---|---|
| declaration `story-dod` `true` → `false` | `✗ [ci-gate-drift]` naming the input, `ci.yml` job **`validate`**, step **`Story definition of done`**, command `validate:story-dod` | **1** |
| declaration `visual-baselines` `false` → `true` | `✗ [ci-gate-claim]` naming the input, the 2 commands searched, **20 jobs across 8 files** listed, and that the 1 job which does run it is **advisory** — `ci.yml` job `e2e` step `Run visual snapshot tests (Chromium, report-only)` | **1** |
| **no declaration touched** — `continue-on-error: true` deleted from `ci.yml:515` | `✗ [ci-gate-drift]` on `visual-baselines`: the lane became a gate and the declaration did not follow | **1** |

The third seed is the one §15.4 could not have been closed without: it is the scenario in
which **nobody edits a declaration at all**.

**Two live-repository tests with teeth**, beyond the 17 fixture cases among the 19 new ones: one asserts that the
set of inputs declaring `ciGate` **equals** the set the validator has lanes for (a seventh
input is a red test, not silence), and one re-derives *"`story-dod` is the only input whose
lane a CI job enforces today"* from the workflows on every run — a sentence three reports of
this programme have quoted, now a measurement rather than a citation. `browser-lane.spec.ts`
**18 → 37** tests.

### 16.2 `D-RES10-1` 🔴 — `DzStepperItem` renders every step `completed` on the server, and none current

| | |
|---|---|
| **Blocks** | nothing gated, but it is a user-visible wrong first paint on every server-rendered wizard, plus a guaranteed hydration mismatch |
| **Measured** | `DzStepperItem.vue` sets `const stepIndex = ref(-1)` and assigns it in **`onMounted`**, which never runs during SSR. `status` is then `stepIndex < activeStep ? 'completed' : …`, and `-1 < 0` is true for every step. Rendered on a two-step stepper with `modelValue: 0`: **both** items emit `data-state="completed"` **and** the completed check-mark `<svg>`; **no** element carries `aria-current="step"`. Hydration then corrects both the attribute and the indicator subtree, so the same defect is also a DOM patch on first paint |
| **Why it was not fixed here** | the fix is to obtain the index during `setup` instead of `onMounted`, which changes the registration-order semantics of a shared counter (`stepCounter`) on a **published** component, risks double registration, and has `DzStepper.spec.ts` and `DzStepper.gating.spec.ts` in scope. It owes a changeset. The SSR block deliberately asserts the structure that IS correct and says at the assertion what it does not pin, so the fix will not redden it |
| **Options** | (a) register in `setup` and drop the `onMounted` assignment · (b) keep `onMounted` and derive the index from the parent's child list during render · (c) leave it and document that a stepper must not be server-rendered |
| **Recommendation** | **(a)**, with both stepper specs re-read first. It is the only option that makes the server HTML correct |
| **Cost of delay** | **medium** — every SSR consumer of `DzStepper` ships a wizard that says it is finished |

### 16.3 `D-RES10-2` 🟡 — `DzMegaMenu`'s menubar owns a `listitem`

| | |
|---|---|
| **Measured** | the expanded top level renders `nav > ul[role="menubar"] > li` (no role) `> a[role="menuitem"]`. Two ARIA structure rules are engaged, both read from the vendored `axe-core` role table rather than from memory: `menubar.requiredOwned` is `group / menuitemradio / menuitem / menuitemcheckbox / menu / separator`, and the `li`'s implicit `listitem` is none of them; and `listitem.requiredContext` is `list`, which the `ul` stopped being when it was given `role="menubar"` |
| **Worth knowing alongside it** | both rules **do** run in the browser lane (they carry the `wcag2a` tag that `preview.ts` pins in `a11y.options.runOnly`), but that lane's global gate is `a11y.test: 'todo'` — **report-only** — and a family opts into enforcement by spreading `a11yError` into its story metas. **41 story files do; `DzMegaMenu.stories.ts` is not one of them, and no file under `stories/navigation/` is.** So the lane's green result says nothing about this component's axe result: a violation there is surfaced and **cannot fail CI**. That is a stronger reason to fix the markup, and it is the same read-but-ungated distinction item 2 of this batch exists to keep honest |
| **Options** | (a) `role="none"` on the `<li>` · (b) drop the `<ul>`/`<li>` and render the items as direct children of the menubar · (c) leave it and record a WCAG deviation |
| **Recommendation** | **(a)** — one attribute, no pixel change, and it makes both rules pass. It is still a published a11y-tree change, so it owes a `patch` changeset and an AT consideration, which is why an agent did not take it |
| **Cost of delay** | **low-medium** |

### 16.4 `D-RES10-3` 🟢 — `DzChip` declares `role="status"` on every chip

**Measured:** `DzChip.vue:109` sets `role="status"` unconditionally; a chip rendered with
nothing but a label carries it in the server HTML. Consequences: every chip is an ARIA **live
region**, so adding, relabelling or removing one is announced; `status` is not a
`nameFromContent` role, so the chip's own text stops being its accessible name; and with
`closable` the element also gets `tabindex="0"`, making it a focusable live region with no
widget role. **Options:** (a) remove the role and let the content name the element ·
(b) `role="listitem"` inside a chip group · (c) keep it and document why a chip announces
itself. **Recommendation: (a)**, but what a chip *should* be is a design decision, not an
agent's. **Cost of delay: low.**

### 16.5 `D-RES10-4` 🟢 — `DzDataView` announces its empty state twice

**Measured:** the root renders an `sr-only` `aria-live="polite" aria-atomic="true"` region
containing `No items`, and the empty branch below renders a `DzEmpty` whose root carries
`role="status"` — itself a live region — with the same string. Two live regions, one string,
one render. **Options:** (a) drop the wrapper's live region and let the empty state announce ·
(b) drop `role="status"` from `DzEmpty` (couples to `D-RES10-3`) · (c) keep both and make the
sr-only region announce the *count* rather than the text. **Recommendation: (c)** — the
wrapper region exists to announce the rendered window on page/sort/layout change, which is a
different message from the empty state; making them different messages keeps both purposes.
**Cost of delay: low.** The SSR block deliberately does not assert how many nodes carry the
string, so either fix lands without reddening it.

### 16.6 `D-RES10-5` 🟢 — `DzSelect` ships an internal sentinel in the server HTML

**Measured:** `DzSelect.vue:113` defines `EMPTY_VALUE_SENTINEL = '__DZ_SELECT_EMPTY__'` to map
an empty external value onto something Reka accepts, and the visually-hidden native `<select>`
in the server output carries it verbatim: `value="__DZ_SELECT_EMPTY__"`. It is inert in a
browser — `value` is not a content attribute of `<select>` and the element has no options —
so this is hygiene, not a bug. **Options:** (a) map the sentinel back to `''` on the hidden
native element · (b) leave it and note it in the component header so nobody files it twice ·
(c) stop rendering the hidden select when there is no value. **Recommendation: (a)** if it is
one binding, **(b)** otherwise. **Cost of delay: very low.**

### 16.7 Two cells of the capability matrix moved, and they moved for a real reason

**`present` 608 → 610, `unrun` 400 → 398.** This is the only frozen number this batch moved,
and it is worth stating plainly rather than burying: making `DzTimeline` and `DzList` render
real children means the SSR smoke spec now **structurally loads** `DzTimelineItem.vue` and
`DzListItem.vue`, so `filesLoadingComponent` — RESIDUAL-05's structural predicate, not the old
substring one — grants each an `ssr-sample` artifact. Those two cells were `unrun` with an
empty artifact list and are now `present` citing a spec that really does render and assert
them. `DzStepperItem` was already `present` and merely gained a second artifact.
`pass` **585** · `fail` **0** · `stale` **22** · `excepted` **47** · rows **144** are
unchanged, no ceiling file was opened for writing, and no allowlist widened. The movement is
*evidence appearing*, in the direction this programme exists to move, and it is reported as a
movement rather than presented as "nothing changed".

**Row-count effect for this addendum.** This section closes **one** open item (§15.4's named
weakness, which was never a numbered row) and adds **five** rows — `D-RES10-1` … `D-RES10-5`.
The register carries **96** distinct questions, of which **85** are open.

## 17. Addendum — the RESIDUAL-11 SSR-defect-fix batch, 2026-09-28

*Written after §16. This section **dispositions all five** of §16's raised rows and adds
two. Report: [`./RESIDUAL-11-ssr-defect-fixes-handoff.md`](./RESIDUAL-11-ssr-defect-fixes-handoff.md).*

### 17.1 `D-RES10-1` 🔴 → 🟢 **FIXED** — `DzStepperItem` claims its index during `setup`

**What was measured before the fix**, three renders differing only in the model:

| render | bytes | states | `aria-current` | check-mark `<svg>` |
|---|---:|---|---:|---:|
| `modelValue: 0` | 2,706 | ready · completed · completed · completed | 0 | 3 |
| `modelValue: 1` | 2,706 | ready · completed · completed · completed | 0 | 3 |
| `modelValue: 2` | 2,706 | ready · completed · completed · completed | 0 | 3 |

**Identical bytes and identical states for three different models** — the server HTML of a
stepper did not depend on `modelValue` at all, which is stronger than §16.2 stated.

**§16.2's own wording is corrected.** It says *"Also a hydration mismatch, since hydration
corrects both the attribute and the indicator subtree."* **Measured: Vue emits no hydration
warning whatever.** The client's *first* render agreed with the server (both had
`stepIndex === -1`), so hydration matched; the correction arrived afterwards in `onMounted`
as an ordinary reactive patch that silently rewrote **2,706 bytes of DOM into 2,317** —
three `completed` states into completed/active/upcoming, three check marks into one, and an
`aria-current` out of nowhere — with **0 lines** of console output. Not a mismatch Vue could
report: a silent post-hydration rewrite nothing could see. That is why the test that holds
the fix is a **byte equality** between the server string and the DOM one tick after
hydration, not a warning check.

**Fix:** option (a) as recommended — `const stepIndex = ctx ? ctx.registerStep() : -1` in
place of a `ref(-1)` plus an `onMounted` registration. `registerStep`'s published contract
(`() => number` on `DzStepperContext`) is unchanged; only the moment it is called moved.
`DzStepperItem.anatomy.ts` already declared `states: ['upcoming', 'active', 'completed']`,
so the fix makes that declaration true rather than altering it. After: three different
renders, exactly one `aria-current="step"` each, check marks equal to the steps behind the
user, and `container.innerHTML === serverHtml` after hydration.

**Seed A** restored the original `onMounted` registration and failed **exactly 3** tests —
the three server-side claims — while **all 37 client-side stepper tests passed**
(`contract` 6 + `gating` 12 + `spec` 19), which is the precision claim. Restored by byte
copy, `sha256sum -c` OK. Changeset:
`a-server-rendered-stepper-no-longer-says-every-step-is-done.md`, `@dzup-ui/core: patch`.

### 17.2 `D-RES10-2` 🟡 → 🟢 **FIXED** — `role="none"` on the expanded menubar's wrapper

Option (a), one attribute. Verified against the **vendored** `axe-core`'s traversal rather
than from the spec: `getOwnedRoles` resolves children with
`getRole(vNode, { noPresentational: true })`, which returns `null` for a presentational
role, and then pushes that element's *children* onto the queue — but only while the element
has no global ARIA attribute and is not focusable. The test asserts that condition, because
the fix depends on it.

**§16.3 predicted two axe rules. Measured, by seeding the fix away: three.**

| rule | fires on | axe's words |
|---|---|---|
| `aria-required-children` | the `<ul>` | *"Element has children which are not allowed: li[tabindex]"* |
| `aria-required-parent` | **each `<a role="menuitem">`**, not the `<li>` | *"Required ARIA parents role not present: menu, menubar, group"* |
| **`listitem`** — not predicted | each `<li>` | *"List item parent element has a role that is not role=list"* |

The second is worth reading twice: the violation lands on the **menu item**, so the
consequence was not an odd child on a `<ul>` but that **neither menu item was in a menubar**
in the accessibility tree.

**The collapsed disclosure branch was deliberately not touched** — its `<ul>` has no role,
so there the `<li>` is a real `listitem` in a real `list`.

**`DzMegaMenu` had no entry in `packages/core/tests/a11y/` at all**, which is half of why
this survived; §16.3's own note is the other half (the browser lane runs both rules and
cannot fail on them). It has two entries now, and that is the one capability cell this
batch moved (§17.7). **Seed B** failed **exactly 3** tests out of 541 across 32 files.
Changeset: `a-mega-menus-menubar-no-longer-owns-two-list-items.md`, `patch`.

### 17.3 `D-RES10-3` 🟢 → 🟢 **FIXED**, and the cost is raised rather than hidden

Option (a) — the role removed. §16.4 said *"what a chip should be is a design decision, not
an agent's"*, and the investigation found the decision already made **inside this
repository**: `DzTag` is the same element — same `<span>` root, same `data-part="root"`,
same forwarded names, same `data-state`/`data-tone`/`data-disabled`, same `tabindex="0"`
under `closable`, same `contain: layout style`, same remove button (`DzChip.vue`'s own
comment says *"same treatment as DzTag"*) — and it has **never carried a role**. Two
components with one anatomy and two different roles is a divergence, not a decision, and
`DzTag` is the side that is not a live region. `DzChip.spec.ts` now compares the two, so the
divergence is what goes red.

`role="button"` was rejected on measurement: activating the chip root does nothing.
`handleKeyDown` handles only Backspace/Delete and there is no click handler.

**The cost, measured with axe on both components rather than assumed:** a `<span>` with no
role is `generic`, ARIA 1.2 prohibits `aria-label` on `generic`, and `DzTag` + `ariaLabel`
already reports `aria-prohibited-attr` — in **`incomplete`**, which `toHaveNoViolations()`
does not see. `DzChip` with `role="status"` reported nothing, in all three states. So the
role **was** doing something: suppressing a naming warning by declaring a live region,
which is the larger defect. Fixed anyway, and the exposed issue raised as `D-RES11-1`
(§17.5) with that table as its evidence, stated in the changeset body so a consumer reads
it there. **Seed C** failed **exactly 6** tests — the six role assertions — out of 677
across 38 files, with every `DzTag` test green. Changeset:
`a-chip-is-no-longer-an-aria-live-region.md`, `patch`.

### 17.4 `D-RES10-4` 🟢 → 🟢 **FIXED** — recommendation (c), and it broke a play function

`announcement`'s zero branch returns `dzFormat('showingAll', { count: 0 })` instead of
`props.emptyTitle`, so the window region reports the count and `DzEmpty` reports the title.
**No new message key**, so no locale moved and `i18n/count-bearing.spec.ts` still covers it
— which is how the frozen *"locales ≥ 95 %: 1"* floor could not be touched. Options (a) and
(b) were rejected for reasons recorded in the report: (b) couples to `D-RES10-3` and moves
`DzEmpty`, which `DzTableBody.vue` also imports; (a) leaves a data view that announces
nothing about its window on the one transition the region exists for. The branch could not
simply be deleted either — falling through to the paginator arm announces *"Showing 1 to 0
of 0 items"*.

**One browser-lane play function was asserting the defect.**
`DzDataView.stories.ts:412` required the polite window region to read `No products found` —
the same string `DzEmpty` renders below it. Rewritten to require the two regions to say
**different** things, and to require the title still to be announced **once**: strictly
stronger than before. Every other story assertion on the five changed components was
checked individually and none was affected. **Seed D** failed **exactly 2** tests out of 827
across 47 files; `DzDataView.contract.spec.ts`'s `exposes a polite live region` stayed green
both before and after, which is the point of asserting the **count** rather than the
presence. Changeset: `an-empty-data-view-announces-itself-once.md`, `patch`.

### 17.5 `D-RES10-5` 🟢 → 🟢 **FIXED at the root, kept at the item — and §16.6 was wrong about it being hygiene**

§16.6 says *"It is inert in a browser — `value` is not a content attribute of `<select>` and
the element has no options — so this is hygiene, not a bug."* True of the attribute.
**Beside the point**, and the report records why.

Reka's `shouldShowPlaceholder` (`Select/utils.js:24`) returns true for `''` and
`null`/`undefined`, and `SelectTrigger.js:74` binds `data-placeholder` from it. The sentinel
is not `''`, so **an unset select never received `data-placeholder`**, and
`DzSelect.variants.ts`' own `data-[placeholder]:text-[var(--dz-muted-foreground)]` — which
exists for exactly this and nothing else — **could never apply**. Every unset `DzSelect`
painted its placeholder in the foreground colour instead of the muted placeholder colour.
A visible styling defect on the default state of a form control, not hygiene.

**The sentinel splits in two, with different answers.** `SelectItem` **throws** on an empty
`value` (`SelectItem.js:89`), so the item mapping is **load-bearing and stays**. The root
never needed it — Reka's own error text documents `''` as the value that *"can be set to an
empty string to clear the selection and show the placeholder"*. Options (a) and (c) as
written are not available: the hidden `<select>` is Reka's, so there is nothing here to map
back, and omitting it would remove form participation. The route that exists is one level
up: pass the model unchanged, and fall back to the sentinel **only** when an item actually
declares `value: ''` (an *"— any —"* row, whose internal value *is* the sentinel and which
the root must match for the panel to show it as chosen). `undefined` was rejected on
measurement — `SelectRoot` computes `passive: props.modelValue === void 0`, so `undefined`
would make the root **uncontrolled**.

**Seed E** failed **exactly 3** tests out of 1,052 across 66 files, and the fourth new test
— `still uses the marker when an item actually claims the empty string` — **passed under the
seed**, which is what proves the two uses are separated rather than the sentinel merely
being gone. Changeset: `no-internal-marker-in-an-unset-selects-output.md`, `patch`, and it
carries the visual-baseline warning (§17.6).

### 17.6 `D-RES11-1` 🟢 — `aria-label` on `DzChip` and `DzTag` is prohibited on their root's role, and no gate can see it

**Measured** (§3.3 of the report), with axe on both components:

| render | `violations` | `incomplete` |
|---|---|---|
| `DzChip` + `ariaLabel`, **with** the old `role="status"` | `[]` | `[]` |
| `DzChip` + `ariaLabel`, **now** | `[]` | **`aria-prohibited-attr`** |
| `DzTag` + `ariaLabel` (no role, always) | `[]` | **`aria-prohibited-attr`** |
| either component with no `ariaLabel` | `[]` | `[]` |

A `<span>` with no role is `generic`; ARIA 1.2 prohibits `aria-label` on `generic`. Both
components forward `ariaLabel`, `ariaLabelledby` and `ariaDescribedby` from
`BaseAccessibilityProps`. `DzTag` has had this since it was written; `DzChip` acquired it by
giving up a role that was suppressing the warning **by being wrong**. axe reports it as
`incomplete`, so `toHaveNoViolations()` cannot fail on it and the existing chip and tag axe
tests pass either way.

**Options:** (a) let the text name the element and document `ariaLabel` as unsupported on
these two — cheapest, but it leaves a declared prop that misbehaves, which VERSIONING.md §3
calls *"a promise-shaped lie"*; (b) give the root a naming-capable, non-live role **when**
it is named (e.g. `group`) — correct ARIA, but a conditional role and a new a11y-tree node
per labelled chip; (c) remove `ariaLabel`/`ariaLabelledby` from both components — the honest
fix under §3, a **`minor`**, with a codemod and a `warnDeprecated`; (d) record a deviation.
**Recommendation: (b) for a named chip** — the only option that is both correct and
non-breaking — but which role a chip should be is the same design question `D-RES10-3`
raised. **Cost of delay: low**; nothing regresses, the warning is not new to the repository,
only newly symmetric. Whichever is chosen, an `incomplete` assertion should land with it.

### 17.7 `D-RES11-2` 🟢 — `DzChip.anatomy.ts` publishes a keyboard contract the component has never implemented

Found while establishing what a chip should be, and untouched by this batch. The anatomy's
`keyboard` table lists `{ key: 'Enter', action: 'Activate the chip.', apg: 'button' }` and
the same for `' '`, with **no `when` guard** — while `DzChip.vue`'s `handleKeyDown` handles
**only** `Delete` and `Backspace` and the root has no click handler at all. And the two keys
it *does* handle are listed `when: 'removable'` while the prop is named **`closable`**. So
the published keyboard documentation promises an activation that does not exist and guards
the real keys on a prop that does not exist.

`role="button"` was rejected for `D-RES10-3` on exactly this evidence, so the next person to
look at the chip's role will find the anatomy disagreeing with the code. **Options:**
(a) delete the two Enter/Space rows and correct `removable` → `closable`; (b) implement
activation and emit a `click`-shaped event — new behaviour on a published component, and it
needs a reason; (c) leave and document. **Recommendation: (a).** **Cost of delay: low**, but
it is *documentation that is wrong*.

**The larger question underneath it, worth more than the instance:** nothing checks an
anatomy `keyboard` entry against the component's actual handlers. `DzChip` is one instance
found by accident; **144 components declare anatomy and this batch looked at one.** A
validator that parsed each declared key and required the component source to mention it
would be cheap, would fail closed, and would find its own backlog — the same shape as
RESIDUAL-10's `ciGate` clause applied to a different claim.

### 17.8 One capability cell moved, and it is the fix's own footprint

**`present` 610 → 611, `unrun` 398 → 397** (Tier C `present` 117 → 118, `unrun` 87 → 86).
One cell out of 1,662, found by diffing the artifacts cell by cell rather than by comparing
summary counts:

```
DzMegaMenu  axe  unrun  artifacts []
         -> present     artifacts ["packages/core/tests/a11y/navigation.a11y.spec.ts"]
```

The component had **no** a11y-spec entry, which is half of why `D-RES10-2` survived.
Everything else unmoved: `pass` **585** · `fail` **0** · `stale` **22** · `excepted` **47** ·
rows **144** / cells **1662** · `unclassified` **29** · `maxWithoutAnatomy` **41** ·
`maxProposedCitedFromCode` **3** · **AT 0 of 534** · locales ≥ 95 % **1** · inline-style
sites **133** (the artifact's *bytes* changed — it records line numbers — and its totals did
not) · `validate:all` **61** links, **0** `✗`. **No ceiling raised, no allowlist widened, no
`*ceiling*.json` opened for writing.** Pending changesets **48 → 53**: five
`@dzup-ui/core: patch`, one per defect, each naming its rendered-output change.

**Row-count effect for this addendum.** It closes **five** rows — `D-RES10-1` …
`D-RES10-5`, §16.2–§16.6 — and adds **two**, `D-RES11-1` and `D-RES11-2`. The register
carries **98** distinct questions, of which **82** are open.

## 18. Addendum — the RESIDUAL-12 anatomy-keyboard-contract batch, 2026-09-28

*Written after §17. This section **dispositions both** of §17's raised rows and adds **two**
of its own. Report:
[`./RESIDUAL-12-anatomy-keyboard-contracts-handoff.md`](./RESIDUAL-12-anatomy-keyboard-contracts-handoff.md).*

### 18.1 `D-RES11-2` 🔴 → 🟢 **FIXED, instance and general case both** — the anatomy keyboard table nothing checked

§17.7 recommended option (a) for the instance and said the larger question — *"nothing checks
an anatomy `keyboard` entry against the component's actual handlers"* — was *"worth more than
the instance"*. Both are now closed, and the general case was measured **first**, because the
instance is only interesting if the population is.

**The measurement, before any fix on this tree.** 104 anatomy declarations; **19** declare
`keyboard: 'none'` explicitly; **85** declare a bindings array carrying **398** rows over 17
distinct keys. Against the code: **358 backed** · **32 unbacked** · **8 undetermined** · and
**8 keys handled and not declared** — the reverse drift, which §17.7 did not anticipate and
which is the same defect mirrored. The 104 / 19 / 85 split agrees row for row with the totals
`packages/tooling/src/quality/keyboard-contract.spec.ts` already asserts from its own
independent walk, so the population claim is checkable rather than a coincidence of one glob.

**§17.7's premise was right and its scale was wrong in both directions.** `DzChip` was not
one instance among a few: there were 32 unbacked rows across 12 components. But it was also
not representative — **28 of the 32 are components whose published contract is correct and
whose code does not implement it**, which is an accessibility gap, not a documentation error,
and deleting those rows would have made the gate green and the library no better. Only 4 of
the 32 were false claims: `DzChip`'s two and the two `DzTag` had for the same reason.

**The instance, decided on evidence.** Option (a), for **both** components together.
`DzChip.vue` and `DzTag.vue` have no root `@click`, emit only `close`/`focus`/`blur`, and
their `handleKeyDown` tests only `Delete` and `Backspace` — so there is no pointer activation
for a key to mirror and therefore nothing for SC 2.1.1 to be about. The Enter and `' '` rows
were removed from both, and `when: 'removable'` corrected to `when: 'closable'` after the
prop that actually gates the removal keys. Option (b) — implement activation — is recorded in
each anatomy's own comment as rejected: it is a new behaviour on a published component, and
`role="button"` on these roots was already rejected for `D-RES10-3` on the same evidence.

**The reverse drift, closed to zero in the same batch**, because in that direction the code is
the thing that exists and the declaration can always be made to match it:

| component | keys added | what the code already did |
|---|---|---|
| `DzSpeedDial` | ArrowDown, ArrowUp, ArrowRight, ArrowLeft | `onMenuKeydown` moves the roving focus along the fan; the anatomy's own comment said so and the table did not |
| `DzRating` | ArrowRight, ArrowLeft (`rtl: 'mirrored'`) | handled direction-aware, while the table declared `rtl.keyboard: 'swap-horizontal'` — a claim only the horizontal pair can be about — and listed neither |
| `DzTabs` | Delete, Backspace (`when: 'closable'`) | `DzTabTrigger.handleKeydown` closes a closable tab; the only keyboard route to the tab's remove control, published nowhere |

**The gate.** `yarn validate:anatomy-keyboard`
(`packages/tooling/src/validators/anatomy-keyboard.ts`), chained at the **END** of
`validate:all` so every existing link number holds — **62 links, was 61**; **53** `✓`,
was 52. Ceilings in `anatomy-keyboard-ceilings.json`, seeded at what was measured and never
above: `maxUnbackedDeclarations` **28**, `maxUndeterminedDeclarations` **8**,
`maxUndeclaredHandlers` **0**.

**Delegation is the whole content of it, and 66 % of the answer lies outside the declaring
file.** 57 of the 85 components with bindings contain no `keydown` token at all, so a
per-file check would have accused two thirds of the library. Six routes, each with a
citation: the component's own source (128 rows), a `compound-part` the ownership manifest
attributes to it (13), a component it renders (8), a composable (7), a **Reka primitive
resolved through Reka's own installed `dist` import graph** (154), and a written-down table
of native HTML behaviour scoped to the node the row is about (56). `undetermined` is a
verdict with its own ceiling and is never counted as satisfied.

**Seeded closed in both directions.** A declared key losing its handler → exit 1 naming the
component and the key, ceiling 28 → 29. A handler appearing with no declaration → exit 1.
And the proof a per-file checker could not produce: deleting the `Delete` row from
`DzTabs.anatomy.ts` while leaving `DzTabTrigger.vue` untouched → exit 1, the two files joined
only by `parentComponent`. All restores byte-identical by `sha256sum -c`; no `git checkout`.

### 18.2 `D-RES11-1` 🟢 → 🟢 **FIXED** — a named chip or tag now carries a role that may hold a name

§17.6 gave four costed options, recommended (b) for a named chip, and said *"which role a
chip should be is the same design question `D-RES10-3` raised, and an agent should not answer
it alone."* It cannot be answered by argument alone — but it **can** be measured, and the
measurement decides it. 22 renders (11 configurations × 2 components) against the vendored
`axe-core`, reading **both** result buckets:

| root | `violations` | `incomplete` |
|---|---|---|
| no name, no role | `[]` | `[]` |
| `aria-label`, no role | `[]` | **`['aria-prohibited-attr']`** |
| `aria-labelledby`, no role | `[]` | **`['aria-prohibited-attr']`** |
| `aria-describedby`, no role | `[]` | `[]` |
| `aria-label` + `role="group"` | `[]` | `[]` |
| `aria-label` + `role="note"` | `[]` | `[]` |
| `aria-label` + `role="button"` | `[]` | `[]` |
| `aria-label` + `role="listitem"` | **`['aria-required-parent']`** | `[]` |

**Three facts §17.6 did not have.** `aria-labelledby` is prohibited too, so the defect was
twice the recorded size. `aria-describedby` is unaffected, so the fix need not touch it. And
`role="listitem"` is **measurably worse than the defect** — it turns an `incomplete` into a
real violation, so any resolution reaching for a list role would have made things worse while
looking like a fix.

**Decision: option (b), `role="group"`, and only when the root is actually named.** An
unnamed chip or tag carries no role, exactly as `D-RES10-3` left it, so the common case is
byte-identical output. `note` is clean and semantically wrong; `button` was already rejected
because activating the root does nothing; `listitem` is out on measurement. The fourth clean
option — stop forwarding `ariaLabel`/`ariaLabelledby` to the root — was **rejected** because
both are declared, documented props inherited from `BaseAccessibilityProps` and `ariaLabel` is
already read inside the component by the remove button's own name: silently making a declared
prop do nothing is what VERSIONING.md §3 calls a promise-shaped lie. **Both components were
changed together**, because RESIDUAL-11 §3.2 established their roots are the same element and
a test asserts they agree.

**And the part §17.6 asked for explicitly — *"add an `incomplete` assertion when it is
decided"*.** `packages/core/tests/a11y/prohibited-aria.ts` reads `aria-prohibited-attr` out
of **both** axe buckets and fails with the rule, the bucket and the offending element. Used
beside `toHaveNoViolations()`, never instead of it. Wired into `data.a11y.spec.ts` for three
cases per component plus two structural assertions. Deliberately one rule rather than the
whole `incomplete` bucket, because `incomplete` also carries `color-contrast` (jsdom has no
layout) and `aria-valid-attr-value` (any `aria-describedby` to an id a fixture does not
render) — a blanket assertion would be red on arrival for properties of the environment.

**Seeded closed:** removing `:role="namingRole"` from `DzChip.vue` fails **5** tests, and
`DzTag`'s three stay green — while the three `toHaveNoViolations()` assertions in the same
`describe` stay green under the seed, which is the finding restated as a test result.
Restored byte-identical.

### 18.3 `D-RES12-1` 🔴 — 28 declared keyboard rows are contracts the code does not implement

**Raised, not fixed, and the number is the point.** Ten components publish 28 keyboard rows
that nothing handles, and none is a stale table: each states what its declared APG pattern
requires, against code that does not do it. Deleting them would make the gate green and the
library less accessible.

Ranked by how much a user loses: `DzToolbar` (4 keys — `role="toolbar"` with **no key
handling at all**, so a declared single-tab-stop toolbar whose arrows do nothing);
`DzColorPicker` (6 — an APG `slider` saturation/value area operable only by pointer);
`DzTimePicker` (4 — the list opens on Enter and nothing moves the highlight);
`DzListItem` (2 — an `interactive` row with `tabindex="0"` and an `@click`, so **unlike the
chip there is a pointer action to mirror** and this is a genuine SC 2.1.1 failure);
`DzCascader` (2), `DzDatePicker` (2), `DzDateRangePicker` (2), `DzTransfer` (2),
`DzCarousel` (2), `DzTour` (2). Full evidence per component: RESIDUAL-12 §4, findings F1–F10.

**Options:** (a) implement, component by component, highest-loss first — `DzToolbar` is the
cheapest real win because Reka's `RovingFocusGroup` already exists in the dependency and is
what every other roving row here uses; (b) withdraw the rows and publish the gap in
`wcag-deviations.json`, whose own note says an entry is *"a DEFECT, not a waiver: the library
owes it"*; (c) leave the ceiling at 28 and let it fall opportunistically.
**Recommendation: (a) for `DzToolbar` and `DzListItem`, (b) for the rest until they are
scheduled** — a declared contract and a published deviation are both honest; a declared
contract with silence behind it is not. **Cost of delay: medium.** Nothing regresses, the
ceiling cannot rise, and the gate now names all 28 on every run — but `DzListItem` and
`DzToolbar` are keyboard-inoperable controls in a shipped library and that is a WCAG AA
claim the library cannot currently make.

### 18.4 `D-RES12-2` 🟢 — `expectKeyboardContract` is exported, documented as the thing that checks, and called by nothing

`@dzup-ui/contracts` says of every `KeyboardBinding` field: *"Every field is a promise
something checks: `expectKeyboardContract` (@dzup-ui/testing) asserts the rows against the
rendered component."* **Measured: zero component specs call it.** It is also the mechanism
that would settle all **8** `undetermined` rows, because it runs against rendered DOM and so
sees the children a consumer put in the slot — which is exactly what a source scan cannot.

**Options:** (a) call it from the six components whose rows are undetermined, which lowers
`maxUndeterminedDeclarations` toward 0 and is the cheapest measurable movement left in this
thread; (b) call it from every Tier B+ component's spec, which is the same work at catalogue
scale; (c) delete the sentence from the contract, which is honest and buys nothing.
**Recommendation: (a).** **Cost of delay: low**, but it is the second time this programme has
found a helper written to check a claim and never wired up, and the first time
(`expectAnatomy`, TASK-N2-S1) is what made `validate:anatomy-parts` necessary.

### 18.5 Two capability cells moved, both the right way, and nothing else did

**`present` 611 → 613, `unrun` 397 → 395.** Two cells out of 1,662, both `keyboard-spec`,
and each moved for a different reason worth stating:

```
DzChip  keyboard-spec  unrun -> present
        the cell is present only when EVERY declared key is asserted by name in the
        unit spec; removing the two rows nothing implemented made it satisfiable
DzTag   keyboard-spec  unrun -> present
        DzTag.spec.ts asserted no key at all, for a component whose entire keyboard
        contract is Delete and Backspace; four tests added, mirroring DzChip.spec.ts
```

Everything else unmoved: `pass` **585** · `fail` **0** · `stale` **22** · `excepted` **47** ·
rows **144** / cells **1662** · `unclassified` **29** · `maxWithoutAnatomy` **41** ·
`maxProposedCitedFromCode` **3** · **AT 0 of 534** · locales ≥ 95 % **1** · inline-style sites
**133** (the artifact's bytes changed — it records line numbers and two `.vue` files gained a
line — and its totals did not). `validate:all` **62** links (was 61), **53** `✓` (was 52),
**0** `✗`. **No ceiling raised, no allowlist widened.** The only `*ceiling*.json` created is
the new validator's own, seeded at measured values. Pending changesets **53 → 55**: two
`@dzup-ui/core: patch`, one for the keyboard tables and one for the naming role.

**Row-count effect for this addendum.** This section closes **two** open items — §17.6's
`D-RES11-1` and §17.7's `D-RES11-2` — and adds **two**, `D-RES12-1` and `D-RES12-2`. The
register carries **100** distinct questions, of which **82** are open.

---

## 19. Addendum — the RESIDUAL-13 keyboard-implementation batch, 2026-09-29

*Written after §18. This section **dispositions both** of §18's raised rows and adds **one** of
its own. Report:
[`./RESIDUAL-13-keyboard-implementations-handoff.md`](./RESIDUAL-13-keyboard-implementations-handoff.md).*

### 19.1 `D-RES12-1` 🔴 → 🟢 **FIXED** — the 28 declared keyboard rows nothing implemented

§18.3 raised 28 rows across ten components and said in terms that none was a stale table:
each was *"a published contract that states what its APG pattern requires, against code that
does not do it"*. **All 28 are closed: 22 implemented, 6 withdrawn.**
`maxUnbackedDeclarations` **28 → 0**, measured by the gate §18 built.

**The two Level A failures, done first.**

- **`F1` `DzToolbar`** — `role="toolbar"` with **no key handling at all**, which §18.3 called
  *"the worst of them"*. It now has the roving focus its table published: the inline arrows
  move between controls and wrap (mirrored in RTL), Home and End reach the ends, a text field
  inside the bar keeps its own arrows, and exactly one control carries `tabindex="0"` so the
  bar is one tab stop. The mechanism is this repository's own — `DzSpeedDial.onMenuKeydown`'s
  shape, with `DzRating`'s direction handling — not Reka's `RovingFocusGroup`, which needs each
  control wrapped in a `RovingFocusItem` and every control here arrives through a `<slot />`.
  **Two rows are new**: `orientation="vertical"` has always reached `aria-orientation` and
  never had a block-axis pair declared.
- **`F9` `DzListItem`** — an `interactive` row with `tabindex="0"` and an `@click` and no key
  activation, an SC 2.1.1 failure. Enter and Space now activate it. The emit-signature decision
  §18.3 left open is settled by **synthesising a real click** rather than widening
  `click: [event: MouseEvent]` to `MouseEvent | KeyboardEvent`: widening stops a consumer whose
  handler is typed `(event: MouseEvent) => void` from compiling, which would make a keyboard fix
  a breaking change for everybody who never had the bug. Dispatching a click is what the platform
  does to activate a `<button>`, so the published signature stays *true* rather than unchanged.

**The other eight components.** `DzCascader` Home/End within the focused column (two `case`
arms in a `switch` that already had the arrows) · `DzCarousel` the inline arrows on the region,
which is deliberately **still not a tab stop** because the keys arrive from its own controls ·
`DzTour` the two step keys, **not** direction-aware because its anatomy declares
`rtl.keyboard: 'none'` (owner decision D36) and a step sequence has no inline axis ·
`DzTransfer` all four listbox keys per pane · `DzTimePicker` the open-the-list clause on the
trigger and the movement per **unit column** · `DzDatePicker` and `DzDateRangePicker` Home/End
as the first and last day of the focused week.

**`F2` `DzColorPicker` is the one withdrawal, and the evidence is in its anatomy.** The six
APG `slider` rows described a colour pointer, a saturation axis and a value axis; the panel is
a native `<input type="color">`, a hex text field and a grid of preset buttons, so **none of
those things exists**. It is the `DzChip`/`DzTag` disposition rather than `DzListItem`'s, and
the difference is measurable: `DzListItem` had a pointer action with no key, so deleting the
rows would have hidden an SC 2.1.1 failure; here a keyboard user can set any colour today, so
what was false is the *description* and not the existence of a way. Six true rows replaced
them. Building a real two-dimensional HSV slider — the change that would make the old rows
true — is raised as **`D-RES13-1`**: it is a redesign of a published panel that would replace
the one fully keyboard- and AT-operable element in it, and it repaints the component, which
cannot be qualified on this machine (visual capture is owner-gated, authoritative platform
linux, this machine win32).

**Two rows were also re-attributed without changing any count.** `DzTransfer`'s ArrowDown and
ArrowUp resolved to `optionsStateFocus.ts:294`/`:280` — `retryRouteOwnerKeydown`, which moves
focus onto the async **error** state's retry control. Real behaviour, correctly cited, and not
what the rows say (*"Move focus to the next / previous option"*). **A citation can be true
about a file and false about the claim, and that is the one failure mode this gate cannot catch
for itself** — a property of the gate worth recording beside the component.

### 19.2 `D-RES12-2` 🟢 → 🟢 **FIXED** — the helper called by nothing, and the ceiling it closed

§18.4 recorded that `expectKeyboardContract` is *"called from zero component specs"* and is
*"also what would settle all 8 `undetermined` rows"*. It is now called from **eight**, and
`maxUndeterminedDeclarations` is **8 → 0** — but by **three** mechanisms, because the eight
were not one problem:

1. **One was an absent behaviour, not an unseen one.** `DzOrderList`'s `<character>` row
   declared APG listbox type-ahead that existed nowhere; it read `undetermined` only because
   the rows are slotted. `typeAhead` now reads each **rendered** row's text — the name a screen
   reader announces — so a consumer who filled the item slot is matched on what they rendered
   rather than on `String(item)`.
2. **One was an edge worth following rather than a verdict worth widening.**
   `renderFunctionNodesIn` turns each `h('tag', { … })` into the opening tag it produces, so the
   *same* platform table decides `DzAnchor`'s `Enter` against the `<a href>` it builds. Only a
   string-literal tag, and attribute presence rather than value. Measured effect: `platform`
   60 → 61 and nothing else moved.
3. **Six are genuinely the consumer's node**, and a seventh route — `spec` — credits them only
   when the row would otherwise be `undetermined` **for a `<slot />` reason** and the
   component's spec asserts that key through `expectKeyboardContract`'s `handled` or `platform`
   list. It is asked after every static route and before the undetermined verdicts, so it can
   never reach an `unbacked` row; a unit test pins that from outside.

**`platform` is a new option and the measurement forced it.** The first attempt used `handled`
and **failed**: Reka's `CheckboxRoot` and `RadioGroupItem` prevent `Enter` only, because Space
on a `<button>` *is* the activation. `platform` asserts the correct thing instead — that the
rendered tree, the consumer's children included, contains a node whose own documented behaviour
is that key — and, like the static checker, credits activation and text entry only, **never
navigation**.

### 19.3 `F14` 🟢 **SETTLED** — a keyboard row's `when` may name a prop

§18's *"Not finished, named"* row left this open: `checkKeyboardContract` calls a single-word
`when` that is neither a part nor a state *"almost always a typo"*, **12 values in live use are
prop names**, and nothing called the rule. It could not stay open, because the **first**
`expectKeyboardContract` call written in this batch failed on it — `DzListItem`'s two rows are
both `when: 'interactive'`.

**Settled as: a `when` may name a prop**, made sayable through a new
`KeyboardCheckOptions.conditions` option rather than by deleting the rule. Two alternatives
rejected and recorded in the option's own doc comment: **deleting the rule** (it is the only
thing between a published row and a context that does not exist, and a typo'd `when` still
renders on the documentation page) and **declaring the prop as a `state`** (`states` is the
`data-state` vocabulary, and `validate:anatomy-parts` holds a component to emitting what it
declares, so that trades a docs-only inaccuracy for a false attribute claim). One instance was
**removed rather than admitted**: `DzCarousel`'s two rows were scoped to the loose word
`control`, and the previous/next buttons *are* its declared `action` part, so the rows now name
it and the gate resolves them against that node's own `<button>`.

### 19.4 `D-RES13-1` 🟡 **RAISED** — should `DzColorPicker` have a real two-dimensional slider?

The six APG `slider` rows §19.1 withdrew were not arbitrary: a colour picker whose saturation
and value are chosen from a canvas *should* answer the arrows, and this one has no canvas. The
question is whether it should get one.

**What it would take:** a saturation/value area with a draggable thumb and `role="slider"`
semantics, a hue slider, HSV↔hex conversion, new anatomy parts and new component tokens —
replacing the native `<input type="color">` that is currently the most accessible element in
the panel and that the platform operates fully with the keyboard and exposes to assistive
technology. It also repaints the component, so it needs a visual accept pass on the
authoritative platform.

**Options.** **(a)** Leave it: the panel is keyboard-operable through the hex field and the
native input, and the published table now says so truthfully. **(b)** Build the slider, accept
the visual churn, and re-declare the six rows. **(c)** A middle course — keep the native input
and add an arrow-key affordance to the **preset grid**, which is the only part of the panel
with a natural two-dimensional layout, and declare that instead of a slider.
**Recommendation: (a) until an accessibility review asks for (b).** The current state is
honest and operable; (b) is a redesign, and a redesign chosen by an agent to make a withdrawn
table come back is the wrong reason to do one.

### 19.5 `D-RES13-2` 🟡 **RAISED** — `yarn test` exits 1 intermittently, on a green suite

**The suite is green and is handed back green**: `yarn test` **exit 0**, 578 files, 11,389 passed,
0 failed, `grep -c FAIL` 0, zero unhandled errors. But **two earlier runs exited 1** on **one
unhandled error that is not a test**: `[vitest-worker]: Timeout calling "onTaskUpdate"` — the
worker-to-reporter RPC, carrying no file and no test name.

It was measured **five ways** rather than excused (report §7.1), and it took three wrong readings
to get there. *A load flake* — refuted by the second failure. *Two new spec files tip the runner
over* — the shape `vitest run` minus those two files (576 files, exit 0) suggests, refuted by
`vitest run` over **all 578** files exiting 0 with zero errors. *The `test:prepare && vitest run`
chaining is the trigger* — refuted by a clean `yarn test`. What stands is **contention**: both
failing runs were on a loaded machine (one seconds after two Vite builds, one while the browser
lane was releasing its workers), and both clean runs were on a quiet one.

**Not new to this batch.** The same error is recorded at
`docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md:177` as one of four unhandled errors on a
363-second run, weeks earlier; and `vitest.config.ts`'s own comment records this suite already
raising `testTimeout` from 30 s to 60 s for a timeout that *"timed out only in
`yarn test:coverage`, i.e. only in the CI job that gates merges."* Same class: a gate at the
edge of its own timing budget.

**Why raise it at all, when the tree is green.** Because a gate that fails intermittently under
load is a gate that will fail on a busy CI runner, and the failure looks like a defect: exit 1,
"1 error", no file, no test. The next agent to see it will spend an afternoon bisecting a suite
that is passing — which is what happened here, and the only reason it did not end in a wrong
conclusion is that the third reading was checked too.

**Options.** **(a)** Pin `poolOptions.threads.maxThreads` below the CPU count, which is the
direct answer to contention and costs wall-clock time. **(b)** Split `test:prepare` out of the
`test` script so the two phases never contend and are separately attributable — cheap, and it does
not address contention from outside the command. **(c)** Leave it and treat a lone `onTaskUpdate`
error as non-fatal by policy — **rejected**: an unhandled error a gate ignores is the next batch's
invisible failure, and this repository has already paid for that class twice.
**Recommendation: (a)**, owned by whoever owns the gate. **Not done here**, because choosing a
gate's own configuration to make a change fit is the wrong order.

> **Status 2026-09-30 (RESIDUAL-18): the row conflated two symptoms, and only one of them is
> fixed — see §23.1.** By RESIDUAL-17 §5.1 this exit code was overwhelmingly being produced by a
> *different* error: **58 ×** `ReferenceError: requestAnimationFrame is not defined` against the
> `onTaskUpdate` error's **1**, so option (a) would have been tuning a thread pool at a leaked timer.
> The rAF half is now **fixed at source** — `@formkit/auto-animate`'s un-cancellable cold-poll timers,
> wrapped in `apps/landing/src/motion/autoAnimate.ts` — and measured **0 in five consecutive
> `yarn test` runs**, one of them under six cores of CPU load and one immediately after a full
> `validate:all` + `yarn build`, which is the condition that produced 58. **The reporter-RPC error this
> row literally names reproduced verbatim in that fifth run and is NOT closed**; option (a) stands as
> the recommendation for it, and it is still the gate owner's. The text above is left verbatim.

### 19.6 Ratchets and the row count

`maxUnbackedDeclarations` **28 → 0** · `maxUndeterminedDeclarations` **8 → 0** ·
`maxUndeclaredHandlers` **0 → 0**, never non-zero at any point in the batch. **No ceiling was
raised and no allowlist was widened.** Capability `present` **613 → 620** and `unrun`
**395 → 388**; everything else unmoved — `pass` **585** · `fail` **0** · `stale` **22** ·
`excepted` **47** · rows **144** / cells **1662** · `unclassified` **29** ·
`maxWithoutAnatomy` **41** · `maxProposedCitedFromCode` **3** · **AT 0 of 534** ·
locales ≥ 95 % **1** · inline-style sites **133** · `validate:all` **62** links, **53** `✓`,
**0** `✗`.

**Row-count effect for this addendum.** This section closes **two** open items — §18.3's
`D-RES12-1` and §18.4's `D-RES12-2` — settles **`F14`**, and adds **two**: `D-RES13-1` (§19.4)
and the `yarn test` wrapper question (§19.5, `D-RES13-2`). The register carries **102** distinct
questions, of which **82** are open.

---

## 20. Addendum — the RESIDUAL-14 keyboard-citation audit, 2026-09-29

*Commit `4e4e46f`, 396 → 402 dirty paths (+6, all additions). Report:
[`./RESIDUAL-14-keyboard-citation-audit-handoff.md`](./RESIDUAL-14-keyboard-citation-audit-handoff.md).
This addendum answers §19.6's own remainder — RESIDUAL-13 §10 item 6 — and it is the first
addendum in this register to hand a gate back **red**.*

### 20.0 What the audit measured, because every decision below rests on it

RESIDUAL-13 closed two ceilings to zero and reported **404 of 404** keyboard rows backed. Its
§3.4 also recorded, as a property of the gate rather than of a component, that *"a citation can
be true about a file and false about the claim"* — and that **366 backed citations had never
been read against their action text**.

They have now been read. **All of them**: the 404 rows collapse to **220 distinct `file:line`
citations in 90 files**, which is small enough for a census rather than a sample.

| | Rows | Share |
|---|---:|---:|
| the citation genuinely backs what the row says the key does | **352** | 87.1 % |
| **a real file, and the wrong claim** | **52** | **12.9 %** |
| undecidable | **0** | 0 % |

**Twelve of the 52 are rows that are themselves false** — the citation is wrong because there
is nothing to cite. Five rows were corrected in their anatomy (§20.5); the rest are the four
decisions below. **After tightening: 401 rows, 385 backed, 9 `unbacked`, 7 `undetermined`, and
`yarn validate:anatomy-keyboard` exits 1. Neither ceiling was raised.**

The mechanism was not subtle once looked at. `ownerOf` resolved routes 1–4 with **two
independent file-wide predicates that were never related to one another** — *does this file
contain a keyboard handler* and *does this file name the key anywhere* — so nothing required
the handler to be the one naming the key, to be bound to the node the row is about, or to do
what the row says. The `platform` route had been scoped to the node since RESIDUAL-12,
deliberately, to catch `DzChip`. Routes 1–4 never were.

### 20.1 `D-RES14-1` 🔴 **RAISED** — `DzDataGrid` publishes a grid it does not navigate

**Six rows**, `apg: 'grid'`: `ArrowLeft`/`ArrowRight` *"move focus one cell to the inline
start/end"*, `ArrowUp`/`ArrowDown` *"one row up/down"*, `Home`/`End` *"first/last cell of the
row"*.

**Measured.** `DzDataGrid.vue:179` emits `role="grid"`; `DzDataGridBody.vue` emits
`role="gridcell"` twice. In the **whole family** — `DzDataGrid.vue`, `DzDataGridBody.vue`,
`DzDataGridHeader.vue`, `DzDataGridPagination.vue` — there is **no arrow handling, no roving
`tabindex`, and no `reka-ui` import**. The only keyboard is the header's sort
(`useDataGridHeader.ts:110`, `Enter`/`Space`, shift-aware) and the filter popover's `Escape`.

**Why the gate said otherwise.** The grid's **row-selection checkbox** puts `CheckboxIndicator`
in the closure; its import graph reaches `RovingFocus/utils.js`, whose
`MAP_KEY_TO_FOCUS_INTENT` names all six keys. The gate printed the primitive it credited in its
own `what` field. A **one-dimensional** roving-focus group cannot implement a two-dimensional
grid pattern.

**Options.** **(a) Implement 2-D cell navigation** — a roving `tabindex` over the
`role="gridcell"` nodes, arrows on both axes (inline-mirrored, per this anatomy's
`rtl.keyboard: 'swap-horizontal'`), `Home`/`End` per row, and a decision about whether the
header row participates. A day plus tests, and a changeset that **changes the tab order of a
published grid**. **(b) Withdraw the six rows**, keeping `role="grid"`. Three lines, and it
makes the documentation honest — but it leaves a component announcing a grid pattern to a
screen reader and not implementing it, which is arguably worse than an untrue docs table.
**(c) Withdraw the rows *and* the grid roles**, making it a table that happens to be featured.
Consistent, and a published ARIA change.

**No recommendation.** (b) and (c) both remove something a consumer may already rely on and (a)
changes a published tab order; all three are owner calls. **The six rows stay `unbacked` and
the gate stays red until this is answered** — which is the correct state, because the ceilings
file says in terms that *"a declared key is either implemented or it is not a contract"*.

> **2026-09-29 (RESIDUAL-15) — ANSWERED: (a), implemented.** The component was read before the
> option was chosen, and its structure is why (a) was tractable without restructuring anything:
> the cells are **the family's own** (`DzDataGridBody.vue:113` renders `<td role="gridcell">`
> from a `v-for`; the only `<slot />` is *inside* a cell), the grid ARIA was **already complete**,
> the root renders a real `<table>` so `HTMLTableElement.rows` / `row.cells` is an exact
> order-true cell address with header and body carrying the same cell count, one
> `DZ_DATA_GRID_KEY` context already reaches both sub-parts, and the mechanisms exist here
> already (`DzToolbar`'s roving `tabindex`, `useDzDirection()`, `DzCalendar`'s arrow pair).
> Withdrawal is the right answer for a grid whose cells a consumer supplies; this is not one.
>
> `packages/core/src/composables/useDataGrid/useDataGridNavigation.ts` (new) implements arrows on
> both axes with the inline pair mirrored in RTL, `Home`/`End` per row, **two new declared
> `PageUp`/`PageDown` rows** (ten rows, clamped, declared in the same change so
> `maxUndeclaredHandlers` stays 0), no wrapping, and a roving `tabindex` over the body's cells.
> **The published tab order gains one stop and loses none**: every sortable header keeps its own
> (a non-sortable `<th>` moves from no `tabindex` to `-1`, which adds none), and a control inside
> a cell keeps its own tab stop *and* its own keys because navigation acts only when the cell
> itself has focus.
>
> **The strict single-tab-stop grid was considered inside (a) and rejected**, recorded in the
> anatomy's keyboard comment with (b) and (c): it removes the per-column header tab stops that
> `DzDataGrid.contract.spec.ts:136`/`:158` and `DzDataGrid.spec.ts:146` assert, takes every
> consumer's `#cell` control out of the tab order, and adds an Enter/F2 cell-entry mode nothing
> else in this library uses — to conform with a part of the pattern **no declared row states**,
> since the anatomy declares no `Tab` row. Thirteen new tests in `DzDataGrid.spec.ts` (42 → 55)
> drive each key and assert where focus landed. `@dzup-ui/core: minor`. **6 rows `unbacked` → 0.**

### 20.2 `D-RES14-2` 🟡 **RAISED** — `DzTransfer` declares listbox type-ahead it has never had

**One row**: `<character>`, `apg: 'listbox'`, *"move focus to the next option whose label starts
with that character"*. It was backed by the pane's `searchable` text `<input>` — a field that
**filters**, which is not moving focus among options. `onPaneKeydown` handles
`ArrowDown`/`ArrowUp`/`Home`/`End` and nothing else.

This is the **same shape RESIDUAL-13 fixed on `DzOrderList`**, whose `<character>` row
*"declared APG listbox type-ahead that did not exist anywhere"* and which now reads each
rendered row's own text. That `typeAhead` is **local to `DzOrderList.vue`** and is not shared.

**Options.** **(a) Implement it on the pane**, modelled on `DzOrderList.vue:454`, reading each
option's rendered label so it matches what a screen reader announces — about 20 lines plus
tests. It raises a second question worth deciding at the same time: whether the two become one
shared helper, for which `packages/core/src/utilities/keyboardTargets.ts` is the precedent for
a deliberately non-public one. **(b) Withdraw the row.** APG lists type-ahead as *recommended*
rather than required for a listbox, and both panes are searchable, which is a different and
arguably better affordance for a transfer list.

**Recommendation: (a)**, with the shared-helper question answered as part of it — the row has
been published as a promise and the sibling component now keeps the same promise.

> **2026-09-29 (RESIDUAL-15) — ANSWERED: (a), implemented, and the shared-helper question is
> answered "no" with a measurement.** `onPaneKeydown` already enumerated the pane's options as
> DOM elements and already resolved the focused one through `focusedIndexIn`, so type-ahead is a
> `default:` arm plus one local `typeAheadIndex`. It reads each **rendered** option's
> `textContent`, so it matches what a screen reader announces and keeps working when a consumer
> fills `#item`; it searches **after** the focused option and wraps, so repeating a character
> cycles; and `ownsItsOwnCaret(event.target)` guards a field a consumer put inside an option. The
> pane's search `<input>` is a **sibling** of the `role="listbox"` that carries the handler, not a
> descendant, so it never reaches type-ahead at all. Five new tests in `DzTransfer.spec.ts`
> (29 → 34), one per property.
>
> **Not shared, and the reason is mechanical rather than stylistic.** `keysNamedIn` reads both
> `/typeahead/i` **and** `event.key.length === 1` as the `<character>` placeholder, so a shared
> `typeAhead` would hand **every importer** credit for listbox type-ahead through routes 1–4 —
> exactly what `keyboardTargets.ts`'s own docblock refuses (*"a shared helper that named the keys
> would hand every importer credit for every key in it"*). Recorded in the function's docblock.
> `@dzup-ui/core: minor`. **1 row `undetermined` → `backed` (route `own`).**

### 20.3 `D-RES14-3` 🟡 **RAISED** — `DzCalendar`'s Shift+page-key year paging

**Two rows**: `Shift`+`PageUp` *"move to the previous year"*, `Shift`+`PageDown` *"move to the
next year"*. **`shiftKey` appears nowhere in `DzCalendar.vue`** and neither does any year
arithmetic; both were credited to the `PageUp` arm that subtracts one **month**, because the
validator keyed only on `binding.key` and never on `binding.modifiers`.

**Options.** **(a) Implement it** — branch the page keys on `event.shiftKey` and subtract or add
a year instead of a month, four lines against `useCalendar`'s existing date math (dzup-ui
ADR-13), plus two tests and a changeset. **(b) Withdraw the two rows.**

**Recommendation: (a).** It is the smallest of the four decisions, it is an APG date-grid
behaviour the component's own published table already promises, and `@internationalized/date`
already does the arithmetic. It is raised rather than done because it changes the keyboard of a
published calendar, which is a changeset and an owner's call rather than a citation repair.

> **2026-09-29 (RESIDUAL-15) — ANSWERED: (a), implemented.** `onGridKeydown`'s two page arms now
> read `event.shiftKey ? cur.subtract({ years: 1 }) : cur.subtract({ months: 1 })` and the mirror
> — four lines, exactly as costed. `setFocused` already moves the visible month from the focused
> date, so the panel follows with no extra plumbing. Both rows cite the same switch arm, which
> genuinely implements both under the ternary, and `R2`'s `readsModifiersAt` is satisfied because
> `shiftKey` is inside the innermost block containing the citing line. Two new tests in
> `DzCalendar.spec.ts` (23 → 25), each dispatching a real `KeyboardEvent` with `shiftKey: true`
> and asserting the **year** the panel lands on — and the second also re-asserts the unmodified
> month step, so a ternary wrong in the other direction cannot pass. `@dzup-ui/core: minor`.
> **2 rows `unbacked` → 0.**

### 20.4 `D-RES14-4` 🟡 **RAISED** — `DzSplitButton`'s menu is the consumer's

**One `unbacked` row and one `undetermined` row.** `DzSplitButtonMenu.vue` is a `<div>` and a
bare `<button>` carrying the trigger part and `aria-haspopup`, inside a `<slot>` fallback, with
**no `reka-ui` import, no key handling and no menu**. Its docblock example shows a
`<DzDropdownMenu>` *inside* it — the consumer's markup, which is exactly what the gate was
reading as the closure (§20.0).

So `ArrowDown` *(trigger)* → *"open the menu and focus its first item"* is **false**, and
`Escape` *(menu open)* → *"close the menu and return focus to the trigger"* is the slotted
menu's business rather than this component's. `Enter` *(trigger)* remains true: the trigger is a
real `<button>` and activation is the platform's.

**Options.** **(a) Own a menu** — implement the APG menu-button contract here
(`ArrowDown`/`ArrowUp` open and focus the first/last item, `Escape` closes and restores focus),
which changes this component from a slot host into a menu owner. **(b) Withdraw `ArrowDown`**
and re-state `Escape` as a contract the consumer's menu satisfies, which the `spec` route can
then evidence against a mounted tree. **(c) Give the contract a way to say "required of the
slotted subtree".** There is no column for that today; `expectKeyboardContract`'s `conditions`
is the nearest thing and it admits a **prop**, not a slot. This is the most general answer and
the most expensive, and it would also serve `DzCheckboxGroup`, `DzRadioGroup`, `DzStepper`,
`DzToolbar` and `DzInfiniteScroll`.

**Recommendation: (b) now, and (c) considered on its own merits later** — (b) is honest and
small, and (c) is a contract-vocabulary change that should not be decided to unblock one
component.

> **2026-09-29 (RESIDUAL-15) — ANSWERED: (b), withdrawn, with one addition the option did not
> anticipate.** The deciding evidence is not just that the menu is slotted — it is that
> **`DzDropdownMenu` already publishes and implements both rows**: `DzDropdownMenu.anatomy.ts:96`
> declares `Escape` → *"Close the menu and return focus to the trigger."*, the **identical
> sentence**, backed through `DismissableLayer`, and `:66` declares `ArrowDown` while
> `DzDropdownMenuTrigger.vue` wraps Reka's `DropdownMenuTrigger`. So this is §20.5's own
> `DzTable` → `DzDataGrid` move: the rows belong to the component that implements them, and a
> second copy on a wrapper is a promise the wrapper cannot keep. **`ArrowDown` *(trigger)* and
> `Escape` *(menu open)* are both withdrawn** — not re-stated, because re-stating `Escape` for the
> `spec` route would need a runtime assertion about a **slotted menu's** behaviour, which is
> option (c)'s missing column and not something `handled`/`platform`/`tabStops` can express.
>
> **`Enter` *(trigger)* is kept and re-described**, which was not in the option list and is a
> latent finding of the same audit: it read `backed` on the platform route's real `<button>`,
> while its action text said *"open the menu and focus its first item"* — a claim that citation
> does not show, i.e. a `W` by RESIDUAL-14's own tightened rule. It now reads *"Activate the
> disclosure; the menu composed into its slot is what opens."* and its `apg` drops from
> `menu-button` to `button`. **No markup changed**; the rejected (a) and (c) are recorded in
> `DzSplitButton.anatomy.ts`'s keyboard comment. `@dzup-ui/core: minor`.
> **1 row `unbacked` → 0 and 1 row `undetermined` → 0.**
>
> **(c) remains open on its own merits** and is *no longer needed for the five `Tab` rows* — §20.6
> records the narrower thing that settled them.

### 20.5 Five rows corrected rather than raised, because the row was wrong

Not decisions — measurements, recorded in each anatomy's own comment with the evidence **and**
the rejected alternative, the convention §19.1 used for `DzCarousel`'s `control` part and
`DzColorPicker`'s six withdrawn slider rows. **No behaviour changed in any of the five.**

- **`DzTable` — three rows withdrawn.** It declared `Enter`, `Space` and `Shift`+`Enter` for a
  sortable header, and the comment above them credited `useDataGridHeader`.
  `DzTable.types.ts:41` says of this component *"Column sorting (sort indicators, sort-change
  emits) → DzDataGrid"*; `sortable` appears in the `data` family only in `DzDataGrid.vue` and
  `DzDataGridHeader.vue`; `useDataGridHeader` is imported by `DzDataGridHeader.vue` and by
  nothing in the `DzTable` family. **Rejected alternative:** keep the rows and implement
  sorting, which contradicts the `DzTable`/`DzDataGrid` split this component publishes — and
  `DzDataGrid` carries the same three rows correctly.
- **`DzOrderList` — three rows re-described.** `Space` **grabs and drops** (`toggleGrab` at
  `:501`), `Enter` is what selects (`:506`), and `altKey` is read once in the entire file —
  inside `typeAhead`, where it **rejects** the key — so `Alt`+arrow has never done anything the
  plain arrow does not. The two reorder rows now carry `when: 'grabbed'`, the declared state
  that distinguishes them from the focus-navigation rows on the same keys. **Rejected
  alternative:** implement `Alt`+arrow as declared, doubling the surface to document and test
  in order to make a mis-transcribed sentence true.
- **Three rows re-scoped so the gate can point at the right node** — same words on the
  documentation page: `DzTimePicker`'s `Enter` to the `item` part (unscoped it was satisfied by
  the popover **trigger**, whose `Enter` *opens* the list); `DzSplitButton`'s `Enter`/`Space`
  from `root` (a `role="group"` div that activates on nothing) to `action`; `DzTransfer`'s
  `Enter` from the free text `'transfer action'` to the declared part `action`, because free
  text leaves a row unscoped and unscoped it was satisfied by an option's own binding in a pane.

### 20.6 Six `undetermined` rows that need a test, not a decision

`DzCheckboxGroup`, `DzRadioGroup`, `DzStepper`, `DzToolbar` and `DzInfiniteScroll` `Tab`, and
`DzSplitButton` `Escape` under 20.4(b). All six are the same shape and it is the shape
`undetermined` was invented for: a wrapper plus a `<slot />`, so the node that receives the key
is the consumer's. They read `backed` only because the render-edge walk was reading `<Dz…>` out
of docblock example blocks.

The resolution is the **`spec` route §19.2 built**: one `expectKeyboardContract` call per
component with `Tab` in its `platform` list. §19.6's own next-packet list already scheduled two
of them — *"`DzTour` and `DzCheckboxGroup` need one `'Tab'` assertion each — a test that Tab is
**not** consumed, which is a real claim about a component that must not trap focus"*. Six small
tests would take `undetermined` **7 → 1**. Scheduled work, not judgement, and deliberately not
squeezed into this packet.

> **2026-09-29 (RESIDUAL-15) — DONE, but the stated mechanism does not work and this paragraph
> was wrong about it.** `platform: ['Tab']` **throws**: `PLATFORM_OWNERS` in `@dzup-ui/testing`'s
> `keyboard.ts` has no entry for `Tab` and says why in its own docblock — *"activation and text
> entry only, **never navigation**"* — so the check reports *"the rendered tree contains no
> element whose documented HTML behaviour is that key"*. **That refusal is correct and was kept**:
> `Tab` is the document's focus order, not an element's behaviour, and a `Tab` entry in that table
> would credit any focusable node for any `Tab` row.
>
> A key list also cannot tell these five rows apart, because they claim **opposite** shapes —
> `DzCheckboxGroup`/`DzStepper`/`DzInfiniteScroll` say *each* node is its own tab stop, while
> `DzRadioGroup`/`DzToolbar` say the set is *one*, built by a roving `tabindex` that removes the
> siblings from the order. §20.0's census caught exactly that inversion published:
> `DzCheckboxGroup`'s "each box is its own tab stop" was cited to `RovingFocusItem.js`, *"which is
> what makes a group **one** tab stop"*.
>
> **So the resolution was widened, not the ceiling** — which is what the ceilings file's own
> comment says makes `undetermined` fall. `expectKeyboardContract` gains
> **`tabStops: { of, expect }`** (`@dzup-ui/testing: minor`): it names the shape, counts how many
> matched nodes are in the tab order, and **drives the key** — a cancelable `Tab` keydown the
> component must not have consumed. It refuses a set of fewer than two nodes, because a claim
> about order over one node is not a claim about anything. `specAssertedKeys` credits **`Tab` and
> only `Tab`** from it, anchored on the option's opening brace so a sentence about it grants
> nothing. Nine proof cases in `packages/testing/src/keyboard.spec.ts` pin both directions,
> including the inversion above.
>
> **One measurement changed the implementation.** `DzRadioGroup` first read *"0 of 2 matched
> node(s) are in the tab order"* — a correct implementation reported broken. Reka builds "one tab
> stop" on the **root** (`RovingFocusGroup.js`: `tabindex: isTabbingBackOut ||
> focusableItemsCount === 0 ? -1 : 0`; `RovingFocusItem.js`: `isCurrentTabStop ? 0 : -1`), so the
> measured shape at rest is `radiogroup=0 | radio=-1 | radio=-1`. `querySelectorAll` searches
> descendants only, so the root is now counted when it matches the selector — as the `platform`
> check already does. Its spec also records that the **synchronous** DOM reads `radiogroup=-1`,
> because items register in their own `onMounted`, and awaits two ticks.
>
> **Five sites, not six:** `DzCheckboxGroup.spec.ts:175` · `DzRadioGroup.spec.ts:166` ·
> `DzStepper.spec.ts:268` · `DzToolbar.spec.ts:338` · `DzInfiniteScroll.spec.ts:172`. The sixth
> row named above — `DzSplitButton` `Escape` — was **withdrawn** under §20.4(b) rather than
> evidenced, because the assertion it would need is about a slotted menu's behaviour, which is
> option (c)'s missing column. **`undetermined` 7 → 0**, not 7 → 1: the seventh row
> (`DzTransfer` `<character>`) was implemented under §20.2.

### 20.7 Ratchets, and a new artifact that can only ratchet down

**NO CEILING RAISED.** `anatomy-keyboard-ceilings.json` was not opened for writing and its
three values re-read as `0` / `0` / `0`. `maxUnbackedDeclarations` **0 → 0, now exceeded by
9** · `maxUndeterminedDeclarations` **0 → 0, now exceeded by 7** ·
`maxUndeclaredHandlers` **0 → 0, still met**. Rows **404 → 401**; `backed` **404 → 385**.

**Frozen and unmoved, every one:** capability `pass` **585** · `fail` **0** · `present`
**620** · `stale` **22** · `unrun` **388** · `excepted` **47** (1662 cells over 144
components — this batch changed no evidence cell, only declarations) · `unclassified` **29** ·
`maxWithoutAnatomy` **41** · `maxProposedCitedFromCode` **3** · **AT 0 of 534** ·
locales ≥ 95 % **1** · inline-style sites **133** · `anatomy-parts` **626 emissions, 0/0,
0/0**. `validate:all` **52 `✓`, one `✗`** — `anatomy-keyboard`, and nothing else.

**One new ratcheting artifact:**
`packages/tooling/src/validators/anatomy-keyboard-rejected-citations.json`, 25 entries over 22
rows. It records the audit's judgements — the residue no structural rule reaches, a real
handler correctly bound doing something other than what the sentence says — with the evidence
beside each, and the validator refuses them. **By construction it can only lower `backed`**: a
rejected citation is skipped and the walk continues to the next line of the same file and then
to the next route. Its own comment carries the rule, and it is a ceiling's rule: *an entry may
be added by any audit; an entry may be removed only when the row is re-cited to a site that is
not the rejected one, or the row is withdrawn. Deleting an entry to recover a `backed` count is
the same act as raising a ceiling.*

**Row-count effect for this addendum.** This section closes §19.6's remainder (RESIDUAL-13 §10
item 6) and adds **four**: `D-RES14-1` (§20.1), `D-RES14-2` (§20.2), `D-RES14-3` (§20.3) and
`D-RES14-4` (§20.4). The register carries **106** distinct questions, of which **86** are open.

---

## 21. Addendum — the RESIDUAL-16 capability-citation audit, 2026-09-29

*Commit `4e4e46f`, 416 → 421 dirty paths (+5: 3 additions, 2 modifications). Report:
[`./RESIDUAL-16-capability-citation-audit-handoff.md`](./RESIDUAL-16-capability-citation-audit-handoff.md).
This addendum answers RESIDUAL-05 §10 item 5 — "outcome-verify the 193 surviving citations" — and
it is the first addendum in this register to take cells out of **`pass`**.*

### 21.0 What the audit measured, because every decision below rests on it

RESIDUAL-05 made a citation mean the component is **loaded** and said in the same breath what that
does not prove: *"It does not prove the spec asserts anything about the component."* RESIDUAL-14
then showed, on a different artifact, that the gap is not theoretical — **52 of 404** keyboard rows
cited a real file for the wrong claim.

Every citation the capability matrix publishes has now been read against the capability its cell
claims. **A census, not a sample:** the 1,208 `present`/`pass` cells carry **1,634 cell→citation
pairs** over **798** distinct `(kind, file)` sites, and every pair was adjudicated — by a scanner
that opens the cited file, isolates the `it(` block the component appears in and applies the kind's
criterion, with every non-genuine verdict opened and read by hand.

| | Pairs | Share |
|---|---:|---:|
| the citation genuinely evidences its cell's capability | **1,590** | 97.3 % |
| **loads or exists, and does not exercise that capability** | **44** | **2.7 %** |
| undecidable | **0** | 0 % |

**Two mechanisms, and the second is the one that touches `pass`.**

1. **`portal-hydration` was `ssr-sample` under another name.** Both cells called the *same*
   predicate over the *same* directory, so the kind had no term for a teleport and none for
   hydration. Of 19 citations: **3** take the portal branch, 8 render the component **closed** (the
   `<Teleport>` behind a false `v-if` — the exact defect RESIDUAL-10 fixed in two tests and left in
   eight), 8 have no teleport in the test at all, and **0 hydrate anything**.
2. **"The check was never asked" was published as "the check passed", 27 times.**
   `generate-capability-matrix.ts`'s `storyCheck` asked one question — *is this component absent
   from the check's failing set?* — and a component the check does not **apply** to is absent from
   it too. `states` is the check with a non-trivial `applies` clause (56 of 170 story files), so 27
   `state-stories` cells read **`pass`** while citing a story file with no `States` story in it.

**After tightening: `pass` 585 → 558 · `present` 623 → 608 · `unrun` 385 → 400 · `excepted`
47 → 74 · `stale` 22 → 22. NO CEILING RAISED; `capability-matrix-ceilings.json` was not opened for
writing.** Both predicates are pinned by tests that reconstruct the old rule inline, show it
crediting the wrong thing, then show the new one rejecting it — and show the new one still crediting
every genuine case, because a predicate that rejects everything passes every rejection test.

### 21.1 `D-RES16-1` 🔴 **RAISED** — 27 `state-stories` cells were `pass` because nobody asked

**27 cells**, all `state-stories`, 25 Tier B and 2 Tier C: `DzBackTop` `DzBlockUI` `DzCard`
`DzCollapse` `DzColorModeToggle` `DzDialog` `DzFieldArray` `DzInputMask` `DzKnob` `DzLightbox`
`DzListItem` `DzNotification` `DzPanel` `DzPopover` `DzRating` `DzScrollArea` `DzSheet`
`DzSplitter` `DzStepper` `DzStepperItem` `DzTagsInput` `DzToast` `DzToolbar` `DzTooltip`
`DzTreeItem` · `DzTour` `DzTreeSelect`.

**Measured.** `checkStoryDod()` reports `states` as `applicable=56, passing=53, violations=3` over
170 story files. `DodCheckResult` carried `applicable` as a **count**, so its one consumer could not
tell *passed* from *never asked*, and inverted `violations` as if it could. The 27 cells cited their
story file as the evidence for a `States` story the file does not contain.

**A measurement that corrected the fix itself.** The first tightening asked applicability first and
moved **36** cells — and **9 were wrong**. `DzInput`, `DzTextarea`, `DzNumberInput`,
`DzPasswordInput`, `DzSearchInput`, `DzListbox`, `DzMention`, `DzAnchor` and `DzCascader` all export
a real `States` story; `states` never asks them because their state props are **inherited** from
`BaseFormControlProps` while `story-dod.ts` reads the component's own `.types.ts` — deliberately
narrowed by N1-O1 defect D6. Demoting `DzInput`'s real `States` story to "nothing to demonstrate"
would have been a second false claim in the opposite direction. The shipped resolution asks *does
the story satisfy the check?* **first**, and applicability only to explain a component that does
not. `passingFiles` was added beside `applicableFiles` for exactly that, and
`story-dod.spec.ts` now asserts the two disagree **in both directions**.

**Options.** **(a)** keep `excepted` with the derived reason and a citation of the component's
`.types.ts` — what ships now, and what `keyboard: 'none'` has done for `keyboard-spec` since
TASK-R5-O5. **(b)** `unrun`, treating "no `States` story" as a gap whatever the props say. **(c)**
do not build the cell at all for a non-applicable component, so "as applicable" becomes a property
of `requiredEvidence` rather than of one resolver.

**Recommendation: (a) now, (c) as the eventual shape.** (b) asks 27 components to demonstrate
states they do not have, which is the box-ticking this matrix exists to make visible.

**Cost of doing nothing:** none numerically — the cells are already `excepted`. The risk is a future
reader seeing `excepted` **74** and reading laundering where there was a correction, which is why
each of the 27 carries a note naming the mechanism and the packet.

### 21.2 `D-RES16-2` ✅ **CLOSED 2026-09-29 (RESIDUAL-17, option (d) — see §22.2)** — `portal-hydration` claims hydration and nothing hydrates

**19 citations, 18 cells.** The kind is documented as *"Teleported content survives SSR **and
hydration**."* Three citations evidence the SSR half with the portal branch taken — `DzSidebar`
(`teleport start`/`end` anchors plus its own subtree), `DzTour` (`open: true`, anchor pair, nothing
painted) and `DzCommandPalette` (`open: true`, nothing in the document flow). **None evidences
hydration.** `ssr-smoke.spec.ts` contains no hydration at all, only a comment at :76 pointing at
the file that does; `form-controls-ssr.spec.ts` says so in its own header — *"What this does not do
is drive a hydration mismatch."* The only hydration in the lane is `dz-provider-ssr.spec.ts`
(providers) and `form-layouts-ssr.spec.ts:157` (`DzStepper`), neither a teleporting component's
portal.

**What ships:** 15 cells `present` → `unrun` (`DzCascader` `DzColorPicker` `DzCombobox`
`DzContextMenu` `DzDataGrid` `DzDialog` `DzDropdownMenu` `DzMultiSelect` `DzPersonaSelector`
`DzPopover` `DzSelect` `DzSheet` `DzTimePicker` `DzTooltip` `DzTreeSelect`), and each of the three
survivors now carries a note saying *"The SSR half only … the `and hydration` half of this kind is
unevidenced."*

**The rejected alternative** was to redefine the kind silently to mean whatever the tests happen to
do. The evidence for the narrower *SSR* reading is the repository's own, `ssr-smoke.spec.ts:1032`:
*"A teleporting component that renders to string at all is the claim that row makes: SSR has no DOM
to teleport INTO, so the component must degrade rather than reach for one."* That is a considered
position and it is kept — as the **stated** half, not as the whole kind.

**Options.** **(a)** split into `portal-ssr` and `portal-hydration`. **(b)** demote the 3 survivors
too, leaving the column honestly empty. **(c)** ship (c): 3 `present` with the note, 15 `unrun`.
**(d)** write the missing harness — hydrate an opened overlay into its server markup and assert the
teleported subtree.

**Recommendation: (c) now, (d) next, (a) only if (d) is declined.** (d) is cheap for `DzTour` and
`DzSidebar`, whose SSR output is already byte-asserted, and `form-layouts-ssr.spec.ts:157` is a
working model of the assertion.

**Cost of doing nothing:** three cells read `present` for a kind whose name promises twice what
they show. The note makes that visible; the name still overstates.

### 21.3 `D-RES16-3` ✅ **CLOSED 2026-09-29 (RESIDUAL-17, option (a) — see §22.1)** — nothing in this repository refuses a manufactured `pass`

**Measured.** `pass` fell **585 → 558** and `present` **623 → 608** in this batch, and
`yarn validate:all` exits **0** with **53 `✓` and zero `✗`**. `capability-matrix-ceilings.json`
ratchets `staleCells` (22, two-way) and holds `staleCellKinds`; it *reports* `unrun` and says so
("REPORT ONLY"). **`pass` and `present` have no ratchet, no baseline and no per-kind record.** Gate
5 guards browser `pass` cells specifically and compared 2,112 committed cells with 0 degraded,
because no browser cell moved.

This is the same asymmetry three packets in a row have paid for. RESIDUAL-02's substring citations,
RESIDUAL-14's 52 keyboard rows and this packet's 27 false passes were each found by **reading**, and
in each case the reason they had survived is the sentence RESIDUAL-05 already wrote: *"The totals
did not move, so no gate fired."*

**Options.** **(a)** record `passCells` and `presentCells` per **kind** in
`capability-matrix-ceilings.json` as two-way handshakes, exactly as `staleCellKinds` holds the stale
*set*: a rise must be explained in the same change, a fall must lower the record in the same change.
**(b)** a weaker floor: hold `pass` per tier as a report, like `unrun`. **(c)** nothing, on the
argument that a gate on `pass` becomes a reason to manufacture one.

**Recommendation: (a), scoped per kind.** The objection behind (c) is real for `unrun` — failing on
a visible gap is how a matrix becomes a thing people delete — and it does not transfer: a ratchet on
`pass` cannot be satisfied by hiding a gap, only by producing evidence or by recording that evidence
was withdrawn. Per-kind matters for the same reason `staleCellKinds` does — a bare 585 is also
satisfied by trading 27 real passes for 27 invented ones.

**Cost of doing nothing:** the next false `pass` is found by the next audit or not at all. This
packet's own 42-cell movement would have gone unnoticed in either direction.

### 21.4 Ratchets, and why the gate is green

**NO CEILING RAISED AND NO ALLOWLIST WIDENED.** `capability-matrix-ceilings.json` was not opened
for writing; `staleCells` re-reads **22** against ceiling **22**, `staleCellKinds`
`["perf-baseline"]`. `anatomy-keyboard-ceilings.json` untouched, **0 / 0 / 0**, **401 of 401
backed**.

`yarn validate:capability-matrix` exits **0**: `✓ fresh, and no Tier D cell is unexplained` ·
`unrun 400 (baseline 400)` — drift **zero**, the tightening having returned the number to the
recorded baseline, which is also the honest close of **`D-RES05-2`**'s third option ("give
`DzCarousel`, `DzDatePicker` and `DzTree` real axe specs, which returns the number to 400
*honestly*") arriving by a different road: the three were re-covered by later packets and this one
took 15 unearned `present` cells back out. One mismatch is left deliberately: `unrunCells.perTier`
records `A 65 / B 247 / C 87 / D 1` **at `4e4e46f`**, still true of that commit; the working tree
reads `A 64 / B 244 / C 91 / D 1` for the same total. The gate compares only the total, and editing
the ratchet file is the one move this packet was told not to make.

**Frozen and unmoved, every one:** `unclassified` **29** · `maxWithoutAnatomy` **41** ·
`maxProposedCitedFromCode` **3** · **AT 0 of 534** · locales ≥ 95 % **1** · inline-style sites
**133** · `maxUndeclaredHandlers` **0** · `anatomy-keyboard` **0/0/0**.
`yarn validate:all` **62 links, 53 `✓`, zero `✗`, exit 0** · `yarn test` **580 files, 11,479
passed, 0 failed, exit 0** (+28 tests, all new).

**Row-count effect for this addendum.** This section closes RESIDUAL-05 §10 item 5 and adds
**three**: `D-RES16-1` (§21.1), `D-RES16-2` (§21.2) and `D-RES16-3` (§21.3). The register carries
**109** distinct questions, of which **89** are open.

## 22. Addendum — the RESIDUAL-17 evidence-ratchet and portal-hydration batch, 2026-09-29

*Repository `ui/dzup-ui`, HEAD `4e4e46f`, **421 → 422** dirty paths (**+1**, the new harness spec),
uncommitted by design. Report:
[`./RESIDUAL-17-pass-ratchet-and-portal-harness-handoff.md`](./RESIDUAL-17-pass-ratchet-and-portal-harness-handoff.md).
This addendum **closes two** of the three decisions §21 raised and **adds one**.*

### 22.1 `D-RES16-3` ✅ **CLOSED, 2026-09-29 — option (a), per kind and two-way**

`validate:capability-matrix` gate **8** (`evidence-ratchet`) holds `pass` and `present` **per kind**
and in **both directions**, recorded in the new `evidenceCells` block of
`capability-matrix-ceilings.json`. Three clauses:

1. **per kind, per state, both directions** — the message names the kind, the state, the direction
   and the delta (`` `state-stories` / pass ROSE 60 → 87 (+27) ``);
2. **the kind set is pinned** — all **23** kinds recorded, zeros included, so a new column arriving
   with credit already in it is an error and so is a column vanishing from the model;
3. **`totals` must equal the sum of `kinds`**, so the headline a report quotes cannot drift from the
   table under it.

**Baseline seeded at the values measured NOW** — `pass` **558**, `present` **608** over 1,662 cells —
**never** at the pre-audit 585/623, which §21 had just shown to be false.

**How a legitimate move is declared, and why honesty stayed cheap.** One edit to that kind's entry,
in the same change, plus one line in `//moves`. The gate prints the literal replacement in the
message *and* the whole corrected block ready to paste, and a test parses that printed block and
re-runs the gate against it — so the offered remedy is asserted to be the actual fix. There is
deliberately **no** `--write-baseline` flag: a ratchet an agent can discharge with a command is not a
ratchet. The objection behind §21.3's option (c) — that gating `pass` punishes audits — is therefore
answered by construction.

**Proved both ways end to end, on the real tree, each seed byte-copied first and restored with
`sha256sum -c`.** RISE: `storyCheck` reverted to §21.2's exact pre-audit inversion →
`` `state-stories` / pass ROSE 60 → 87 (+27) ``, exit **1**. **This is the RESIDUAL-16 change
replayed, and it now fails.** FALL: `DzCalendar.stories.ts`'s `export const Accessibility` renamed →
`` `a11y-narrative` / pass FELL 22 → 21 (-1) ``, exit **1**. A negative control on `DzButton`
(Tier A, so no such cell) correctly stayed **green**. 12 unit cases cover both directions, the
cross-kind swap at an identical total, an unrecorded kind, a vanished kind, a zero-credit kind that
must *not* read as vanished, a drifted `totals`, `//` comment keys, and the shipped record against
the shipped matrix.

**No new `validate:all` link.** Gate 8 is inside `validate:capability-matrix`, so the chain stays at
**62 links** and every existing link number in this programme holds.

**The first move through the mechanism was this packet's own** (§22.2): gate 8 went red naming
`portal-hydration +1` and `ssr-sample +2`, and the record was corrected in one edit each.

### 22.2 `D-RES16-2` ✅ **CLOSED, 2026-09-29 — option (d), the harness written**

§21.2 recommended *"(c) now, (d) next"*. (d) is done:
`packages/core/tests/ssr/portal-hydration.spec.ts`, **5 tests**, in RESIDUAL-11's `DzStepper` shape.

**All 24 rows were probed before anything was written.** Exactly **four** components emit a teleport
anchor pair from `renderToString` — `DzBlockUI`, `DzPopconfirm`, `DzSidebar`, `DzTour`, the four whose
`.vue` holds a native Vue `<Teleport>`. The other **20** portal through a Reka UI `*Portal`, which
renders **nothing** on the server.

The harness asserts, per component: the anchor pair in the server output; **the teleported markup the
server produced, read from `renderToString`'s `ctx.teleports`** — the half nothing in this repository
had ever examined, and where `DzTour`'s 3,471-byte `role="dialog"` panel and `DzPopconfirm`'s
2,771-byte `role="alertdialog"` panel actually live; **hydration rewriting zero bytes**; and that
every diagnostic hydration produces is a hydration notice, captured from `warn` **and** `error` so
nothing sprays into a green suite.

**`open: true` was deleted as proof the branch was taken, on measurement.** `DzCommandPalette`
opened emits `<!--[--><!--v-if--><!--]-->` — 27 bytes, no teleport, empty `ctx.teleports` — and
hydration *replaces* them with an anchor pair. **It loses the cell §21.2 counted among its three good
ones**, now `unrun` with the reason **asserted** in the harness so it goes red the day Reka
server-renders its portals.

**Movement:** `portal-hydration` `present` **3 → 4**, `unrun` **21 → 20**; `ssr-sample` `present`
**94 → 96** (`DzBlockUI` and `DzPopconfirm` — the harness is the **first spec that server-renders
either**). Matrix totals `present` **608 → 611**, `unrun` **400 → 397**, `pass` **unchanged at 558**.
**No citation was manufactured for any of the 20.**

**Seeded breaks on SOURCE, predicted before counted**, over a bounded 10-file / 167-test set
baselined green: `DzBlockUI.vue`'s teleport `:disabled` flipped → **14 failed** (1 harness, 1
portal-target, 4 contract, 8 unit); `DzTour.vue`'s teleport `v-if` falsified → **20 failed** (1
harness, 1 `ssr-smoke`, 1 portal-target, 4 contract, 13 unit). Both `.vue` files restored,
`sha256sum -c` `OK`.

**Splitting the kind (option (a)) is no longer recommended:** it was on the table because nothing
evidenced hydration, and now four things do.

### 22.3 `D-RES17-1` 🔴 **RAISED** — the teleport TARGET half of hydration is unmeasurable in jsdom

**Measured.** The harness proves the component's own server output survives hydration byte for byte,
and for `DzBlockUI` — whose teleport is *disabled*, so the overlay sits in that output — the full
claim is evidenced end to end. For `DzTour`, `DzPopconfirm` and `DzSidebar` the teleported content
goes to `body`, and whether hydration **claims** it or re-creates it cannot be decided here:
injecting `ctx.teleports` into `document.body` and hydrating produced one `Hydration node mismatch`
and a doubled panel for `DzTour` (body 3,522 → 6,662 bytes) and `DzPopconfirm` (2,925 → 5,517).

**The fixture was controlled before any defect was claimed.** Four minimal `<Teleport>` shapes — a
plain `h(Teleport, { to: 'body' }, [h('div', { id: 'p' }, 'panel')])`, one with an author comment
first, one wrapping a `Transition`, one `v-if`-guarded — **all four fail identically**. So the
mismatch belongs to hand-placing a teleport target in jsdom, not to the components, and asserting
there would have been a defect claim against two components on the strength of a broken fixture.

**Options.** **(a)** accept the harness's scope, with the cell's note saying which half it evidences
(what ships now). **(b)** add a real-engine SSR lane serving a genuine document with the target
populated — a Playwright/Vite fixture like `test:e2e:csp`, so a lane, not a spec — and assert the
target subtree there. **(c)** split into `portal-ssr` and `portal-target-hydration`, the second
`unrun` for all 24 until (b) exists.

**Recommendation: (a) now, (b) when a browser-qualified SSR lane is next opened.** (c) buys accuracy
in a column name at the price of 24 more cells and a second kind nothing evidences; the note already
carries the distinction and the harness asserts it.

**Cost of doing nothing:** three cells read `present` for a kind whose name covers slightly more than
they show — materially less than the 16-of-19 overstatement §21.2 measured, and now written into the
cell rather than into a report.

### 22.4 Ratchets, and what green means now

**NO CEILING WAS RAISED AND NO ALLOWLIST WAS WIDENED.** `anatomy-keyboard-ceilings.json` was not
opened. `capability-matrix-ceilings.json` **was** opened, twice and only for gate 8: once to **add**
the `evidenceCells` record that did not exist, once to **declare** gate 8's own first move with the
reason in `//moves`. `staleCells` (**22**, ceiling **22**), `staleCellKinds` (`["perf-baseline"]`) and
`unrunCells` were **not touched** — `unrunCells.baseline` still records **400** at `4e4e46f` while
the tree reads **397**, left deliberately as §21.4 left its `perTier` mismatch, because those numbers
are bound to a commit and the block is S1-O2's.

**Frozen and unmoved, every one:** `unclassified` **29/29** · `maxWithoutAnatomy` **41/41** ·
`maxProposedCitedFromCode` **3** (ceiling 3) · **AT 0 of 534** · locales ≥ 95 % **1** (floor 1) ·
inline-style sites **133** (81 static + 52 bound) · `maxUndeclaredHandlers` **0** ·
`anatomy-keyboard` **0 / 0 / 0**, **401 of 401 backed**.

`yarn validate:all` **62 links, 53 `✓`, zero `✗`, exit 0**, twice — identical to entry, the
second run after every docs, register and status edit. `yarn test` run **three** times:
**581 files, 11,500 passed, 3 skipped, 1 todo, ZERO failed on all three**, exits **1 / 0 / 1**.
Every non-zero exit is vitest’s `Unhandled Errors` channel and every error is in **`apps/landing`**,
which this batch never opened: 1 then 58 `ReferenceError: requestAnimationFrame is not defined` from
an `@formkit/auto-animate` timer firing after jsdom teardown, plus — in run 3 —
`[vitest-worker]: Timeout calling "onTaskUpdate"`, which is **`D-RES13-2` reproduced verbatim**, and
one `chunk load failed`. The count scales with host load: run 3 followed a full `validate:all` and
`yarn build`. **All three runs quoted**, per the standing rule; run 2’s exit 0 is the clean point.

**The difference §22.1 buys.** RESIDUAL-16 moved 42 cells and every gate stayed green. RESIDUAL-17
moved **3** and gate 8 went **red**, naming both kinds and both deltas, before the record was
corrected. The green at the end of this batch is a statement rather than an absence.

**Row-count effect for this addendum.** This section **closes two** (`D-RES16-2` §22.2 and
`D-RES16-3` §22.1) and **adds one** (`D-RES17-1` §22.3). The register carries **110** distinct
questions, of which **88** are open.

---

## 23. Addendum — the RESIDUAL-18 test-determinism batch, 2026-09-30

*Repository `ui/dzup-ui`, HEAD `4e4e46f`, **422 → 459** dirty paths (**+37**, nothing removed and no
status letter changed), uncommitted by design. Report:
[`./RESIDUAL-18-test-determinism-handoff.md`](./RESIDUAL-18-test-determinism-handoff.md).
This addendum **closes one** decision (§19.5 `D-RES13-2`, in the half that was ever this
repository's), records the outcome of a long-standing item that was never a numbered row (the
`document.body.innerHTML = ''` population, TASK-S5-O2 §2.3 / RESIDUAL-03 §5), and **adds none**.*

### 23.1 `D-RES13-2` — dated note, 2026-09-30: the dominant half is **FIXED**; the reporter-RPC half is **narrowed, not closed**

**The row conflated two symptoms under one exit code, and only one of them was ever
`D-RES13-2` as written.**

`D-RES13-2` (§19.5) was raised for `[vitest-worker]: Timeout calling "onTaskUpdate"` — a reporter-RPC
error carrying no file and no test name — and its recommendation was option **(a)**, pin
`poolOptions.threads.maxThreads`. By RESIDUAL-17 §5.1 the same non-zero exit code was overwhelmingly
being produced by something else: **58 × `ReferenceError: requestAnimationFrame is not defined`**
against the reporter error's **1**. Anyone acting on option (a) would have been tuning a thread pool
at a leaked timer.

**What is now fixed, and it is not a runner setting.** The rAF errors are a **source defect in a
third-party dependency, reached through this repository's own barrel** —
`@formkit/auto-animate`'s two-stage cold poll (`index.mjs:159`) stores no handle for its outer
`setTimeout` and `cleanUp()` (`index.mjs:499`) never clears a removed node's interval, so
`controller.destroy()` can cancel neither. Every unmount of an auto-animated list therefore left one
2-second polling interval per node running for the lifetime of the document, and each tick calls
`requestAnimationFrame`, which after a jsdom teardown does not exist. 58 is the `/animations` bento's
own arithmetic: the grid plus one per catalogue card.

`apps/landing/src/motion/autoAnimate.ts` now owns both stages of those timers and cancels them in
`destroy()`; the motion barrel re-exports `vAutoAnimate` / `useAutoAnimate` from there instead of
from npm, and the `auto-animate-list` registry item bundles it, so a copied-out snippet inherits the
fix. `apps/landing/src/pages/AnimationsPage.v2.spec.ts`'s **32-line test-local workaround for the
same defect is deleted**, which is the clearest single statement that the cause rather than the
symptom was addressed. The leak is a leak in a browser too — this is a product fix, and it needs no
changeset only because `@dzup-ui/landing` is `private` with `privatePackages.version: false`.

**Measured across four consecutive `yarn test` runs: see the report §5.** The criterion applied was
the one the packet was given — **exit 0 every time with zero unhandled errors**, not "it passed
once".

**What is NOT closed.** The reporter-RPC error itself — the thing `D-RES13-2` literally names — was
observed once in RESIDUAL-17's run 3 and once weeks earlier at
`docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md:177`. It is a **contention** symptom on a
green suite and nothing in this batch addresses it; the batch only removes the noise that was hiding
how rare it is. §19.5's option (a) remains the standing recommendation **for that half only**, and it
remains the gate owner's call, unchanged. The row's own text is left verbatim.

### 23.2 The `document.body.innerHTML = ''` population — **executed**, and it was larger than any recorded count

TASK-S5-O2 §2.3 named **25** body-wiping specs as "the structural blocker" for moving the clean
component specs into browser mode. RESIDUAL-03 §5 recounted independently, confirmed 25 to the file,
named the **3 that live outside `components/`** so a `components/**` glob could not miss them, and
established that they are **irrelevant** to `D-S5O2-1` (the storybook lane collects `*.stories.ts`
only; **0** story files wipe the body). It left the work as "S5-O2's own separate packet, ~8 h, one
family per sitting".

**Executed here. Recounted first, and both earlier numbers are now stale rather than wrong.**
With RESIDUAL-03's own command at this HEAD the `packages/core/src` population is **28**, not 25 —
the `forms` row has grown from 8 to 11. Repo-wide, in statement form, it was **70 sites in 37
files**: the 28 plus `packages/core/security` (3 specs + the shared `boundary-suites.ts` helper),
`packages/core/tests/portal-target.spec.ts`, and 4 specs in `apps/landing/src`.

**All 37 converted. Exit state: zero body wipes repo-wide.** `enableAutoUnmount(afterEach)` in 28
files (matching the four-file precedent already in the tree), `cleanup()` alone in the 4
`@testing-library/vue` files, a locally tracked wrapper list in `boundary-suites.ts` — where
`enableAutoUnmount` **cannot** be used, because the helper is called once per binding and VTU throws
on a second call — and the wipe simply deleted where an explicit `unmount()` already was the
teardown. **No assertion was deleted, skipped or weakened**; test counts per file are unchanged, and
the only other deletions are **28 duplicate per-`describe` hooks** in four form specs (8 + 7 + 8 + 5),
three of which also had a `describe` block carrying **no** teardown at all — now covered by the same
single hook.

**Not one file legitimately needed a pristine `body`**, and one recorded belief is refuted by
measurement. `DzSelect.contract.spec.ts` asserted in prose that *"an unmounted wrapper does not
always take the teleported node with it"*. It does. The rows survived because **the cases in that
block never unmounted at all** — nothing tracked the wrappers — and all 22 tests pass with
`enableAutoUnmount(afterEach)` as the only reset. The three specs that read the **whole document**
and would have been the strongest candidates for keeping a wipe (`overlays.anatomy.spec.ts`,
`DzSelect.asyncStates.spec.ts`, `portal-target.spec.ts`) pass the same way.

**What this does and does not unblock.** It discharges the prerequisite TASK-S5-O2 named for a
browser-mode move of the component specs. It does **not** revive `D-S5O2-1`, which RESIDUAL-03 closed
as not-a-defect, and it does not by itself make a browser-mode move advisable — S5-O2 §2.6's
`screenshotFailures` hazard was already corrected by RESIDUAL-03 §5, but the move remains its own
decision with its own cost.

### 23.3 Ratchets and the row count

**NO CEILING WAS RAISED AND NO ALLOWLIST WAS WIDENED.** `capability-matrix-ceilings.json` and
`anatomy-keyboard-ceilings.json` were not opened. Capability citations are **file paths, not line
anchors**, so 70 edited hook sites moved no cell: `pass` **558** · `fail` **0** · `present` **611** ·
`stale` **22** · `unrun` **397** · `excepted` **74**, all unmoved, and **gate 8 did not fire**.
**Frozen and unmoved, every one:** `unclassified` **29** · `maxWithoutAnatomy` **41** ·
`maxProposedCitedFromCode` **3** · **AT 0 of 534** · locales ≥ 95 % **1** · inline-style sites
**133** (no `.vue` under `packages/core/src` was left modified, so regeneration step 7 is not owed) ·
`maxUndeclaredHandlers` **0** · `anatomy-keyboard` **0 / 0 / 0**, 401 of 401 backed.

**Row-count effect for this addendum.** This section **closes one** (§19.5 `D-RES13-2`, in the half
that was this repository's, with the reporter-RPC half explicitly left open and unchanged) and
**adds none**. The register carries **110** distinct questions, of which **88** are open — the count
is unchanged, because `D-RES13-2` stays open for its narrowed half.

---

## 24. Addendum — the RESIDUAL-19 contract/unit citation audit, 2026-09-30

Report: `RESIDUAL-19-contract-and-unit-citation-audit-handoff.md`. **The batch's closing gates
(`yarn validate:all`, `yarn test`) did not run** — the host stopped them for low memory — so the
numbers below are the generator's and gate 8's, not yet a full-suite result.

### 24.1 `D-RES19-1` 🔴 — is Contract Spec v1 judged per file, or across the sidecar pair?

`contract-spec` was credited on the file existing. Judged against the cell's own definition
(props/events/slots/ARIA, owed only where the component declares the surface), **80 of 142** contract
specs miss at least one owed surface and were withdrawn to `unrun`. **50 of those 80 have the missing
surface asserted in the component's unit spec instead; 30 are covered by neither file.**

| Option | Effect |
|---|---|
| **(a)** per file, as landed | the column means its name; 80 cells owed, 50 of them a move of existing assertions |
| (b) credit across the pair | restores 50 cells with no spec change; makes the two kinds one fact |
| (c) per file, plus a note on the 50 | as (a), with the neighbouring assertion named |

**Recommendation: (a)**, with (c) if the 50 are not scheduled.

### 24.2 `D-RES19-2` 🟡 — one touch per surface, or every declared member?

The predicate is satisfied by one asserted event on a component declaring five. A per-member bar is
mechanically possible for events and slots and is not a standard the repository has written down.
**Recommendation: decide after the 80 are worked.**

### 24.3 Closed, and the row count

RESIDUAL-17 §7 item 7 (`contract-spec`/`unit-spec` measure existence) and item 6 (the three
`toBeTruthy()` SSR citations) are **executed**. `present` 611 → 517 is declared in gate 8's `//moves`.
**Adds two questions, closes none of the numbered rows**: the register carries **112** distinct
questions, of which **90** are open.

### 24.4 Read this before acting on any row above

`origin/main` is **92 commits ahead** of the commit every section of this register is bound to, and
several rows recorded here as open were decided and executed there (ADR-18/19/20 accepted, the Node
floor, the icon-package swap, `apps/sandbox`, the size budgets). See
`INTEGRATION-origin-main-2026-09-30.md`. This register has not been reconciled against it.
