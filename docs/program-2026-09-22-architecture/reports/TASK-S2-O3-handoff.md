# TASK-S2-O3 — Docs-site deployment, size gate and registry gate — handoff

> Programme: [`program-2026-09-22-architecture`](../README.md) · task file
> [`custody-and-release-tasks.md`](../custody-and-release-tasks.md) lines 418–492.
> **Commit observed: `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`** (`4e4e46f`).
> Every number in this report is bound to that commit. The worktree is **not
> clean** — ~263 dirty paths from twelve prior tasks in this programme, held
> uncommitted by design (the owner commits). Nothing here was committed,
> pushed, published or deployed.
>
> **Written incrementally while the task ran.** Sections appear in the
> `<handoff>` order of README §5 and are filled as each step completes.

## 0. Progress log (append-only, written as the task ran)

| # | Step | Outcome |
|---|---|---|
| 0 | Handoff skeleton created before any edit | done |
| 1 | `<done_check>` executed with the three mandated corrections | done — see §1 |
| 2 | Discovery: what already exists vs what the check names | done — see §2 |
| 3 | `yarn docs:build` and the size re-measurement | done — see §3 |
| 4 | Registry gate extended: resolution ledger + fail-closed mode | done — see §4 |
| 5 | `docs:verify` lane built, proven green **and** proven red | done — see §5 |
| 6 | `validate:docs-freshness` built, 21 specs, chained as link 58 | done — see §6 |
| 7 | Five deployment decisions re-measured; the DNS near-miss caught | done — see §7, §8 |
| 8 | Deploy runbook written | done — [`./TASK-S2-O3-deploy-runbook.md`](./TASK-S2-O3-deploy-runbook.md) |
| 9 | lint / typecheck / 89 specs / `validate:all` end to end | done — see §11, §12 |
| 10 | `EXECUTION-STATUS.md` row + 7 ratchet rows; register corrected and extended | done — see §13, §14, §17 |
| 11 | **Register damaged by a bad splice and restored verbatim** | done, verified — see **§18** |

## 1. `<done_check>` executed first — and its defects

The prompt's four clauses were run **with the three corrections the task brief
mandates**, because as written two of them cannot execute in this repository
and one silently passes.

| # | Clause as written | Correction applied | Result |
|---|---|---|---|
| 1 | `node -e "…scripts…/docs:(verify\|size)\|validate:registry/…"` | none needed | **DEFECTIVE — see below** |
| 2 | `yarn docs:verify > /tmp/dv.log 2>&1` | `/tmp` is not writable on this machine → repo-local/scratchpad log | **FAIL — `docs:verify` did not exist** |
| 3 | `npx tsx packages/tooling/src/validators/registry.ts` | `npx` fetches dependency-confusion placeholders here (silent false green) → `node node_modules/tsx/dist/cli.mjs …` | ran; see §3 |
| 4 | `ls …/TASK-S2-O3-deploy-runbook.md` | none needed | FAIL at start (file absent) |

**Clause 1 is defective** and is the 17th defective prompt clause found in this
programme (S0-O2's audit counted 16 of 16 before this one). Its regex
`/docs:(verify|size)|validate:registry/` is alternated at the top level, so the
`docs:` prefix binds only to `(verify|size)`. Run against `package.json` it
printed:

```
//validate:registry,validate:registry
```

i.e. it matched the **documentation comment key** `//validate:registry` and the
script `validate:registry` — two names for one lane — and reported nothing about
`docs:verify` or `docs:size`. It therefore **cannot decide the question it
claims to decide**: it neither detects `docs:verify`'s absence (it did not look
for `docs:` + anything but verify/size, and the repo's real size lane is called
`validate:docs-size`, which the regex misses because `docs-size` is not
`docs:size`) nor distinguishes a real script from a comment key. A naive reader
would have seen two hits and concluded "two of three lanes exist".

Corrected measurement (all three questions asked separately, comment keys
excluded):

| Lane the check names | Real name in this repo | Exists? |
|---|---|---|
| `docs:size` | **`validate:docs-size`** (`tsx packages/tooling/src/validators/docs-size.ts`) | **yes** — TASK-R1-O5 |
| `validate:registry` | `validate:registry` (same name) | **yes** — TASK-R1-O5 |
| `docs:verify` | — | **no** — this task's only real build |

### 1.1 done_check outcome — **4 of 4 at `4e4e46f`**, with **3 of 4 clauses defective as written**

| # | Clause | Outcome | Defect |
|---|---|---|---|
| 1 | the three lanes exist | **PASS after correction** — `validate:docs-size` and `validate:registry` existed (R1-O5); `docs:verify` and `validate:docs-freshness` were built by this task | **DEFECTIVE**: the regex alternates at the top level so `docs:` binds only to `verify\|size`, it misses the repo's real `validate:docs-size`, and it matched the `//validate:registry` **documentation comment key** as if it were a script. It printed two hits and reported nothing about either missing lane. **A new defect class** — not one of the five in register row #41 |
| 2 | `yarn docs:verify` exit 0, log reports the size against a declared budget | **PASS** — exit **0**, 7 of 7 commands; log line `33.16 MB (34,772,063 B) of 34.33 MB (36,000,000 B) — 96.6% of budget, 510 files` | **DEFECTIVE**: writes `/tmp/dv.log`; `/tmp` is not writable here (row #41 class **i**). Logged to the scratchpad instead |
| 3 | the registry validator exits 0 and names how many entries it resolved | **PASS** — exit **0**; it now names **three tiers**: 191 / 191 / **0** of 191 | **DEFECTIVE**: `npx tsx …` — `npx` fetches dependency-confusion placeholders that exit 0 **without running**, a silent false green (row #41 class **ii**). Run as `node node_modules/tsx/dist/cli.mjs …` |
| 4 | the runbook exists and names the target **or** states it is still D165 | **PASS** — `./TASK-S2-O3-deploy-runbook.md` states plainly that the target **is still D165** and costs three options | none |

So the check would have decided `[x] found-done` on clause 1 alone if read
naively, and **that would have been wrong**: `docs:verify` did not exist and the
deployable artifact had no freshness binding. This is the **17th** defective
prompt in this programme (S0-O2 audited 16 of 16 before it) and the **first with
a defect not in row #41's five classes** — a regex that cannot distinguish a
script from its documentation comment. Row #41's remedy **(a)** (one shared
`<harness_facts>` block) does not cover it; a sixth rule belongs there:
**a clause that reads `package.json` must exclude `//`-prefixed keys.**

## 2. Discovery — what already existed (cited, not rebuilt)

**What already existed, and is CITED not rebuilt.** Two of the three lanes the
prompt asks for were delivered by **TASK-R1-O5** (2026-09-21) and are already
links **40** and **41** of `validate:all`:

| Asset | Path | Delivered by | This task's change |
|---|---|---|---|
| Size gate | `packages/tooling/src/validators/docs-size.ts` (+ `.spec.ts`, 14 specs) | R1-O5 | **none** — re-measured only |
| Size budget (data file) | `packages/tooling/src/validators/docs-size-ceilings.json` | R1-O5 | **none** — see §3 for why it was neither raised nor lowered |
| Registry gate | `packages/tooling/src/validators/registry.ts` (+ `.spec.ts`, `--self-test` over 8 seeded clauses) | R1-O5 | **extended** — a resolution ledger and a fail-closed mode (§4) |
| Deployment options, costed | `../../program-2026-09-04/reports/docs-deployment-packet-2026-09.md` (203 lines, D165–D169 with alternatives and cache table) | R1-O5 | **re-measured, not re-derived** (§5) |
| Docs-page contract | `../../program-2026-09-04/reports/TASK-R5-O5-handoff.md` | R5-O5 | cited |
| Docs site itself | `../../program-2026-09/reports/N2-D1-docs-site-handoff.md` (N2 lane), `N2-D2` (evidence pages), `N2-D3` (playgrounds) | 2026-09 N2 | cited |
| Internal dead-link check | `apps/docs/.vitepress/config.ts` — VitePress fails the build on a dead internal link | N2-D1 | **no second link checker added**, per `<discovery>` step 4 |
| External link check | `scripts/check-external-links.mjs` → `yarn check:links` | TASK-FREE-11 | chained into `docs:verify`; **one allowlist finding**, §6 |
| Registry supersession | `A4-D3` is recorded **superseded** in the 62-row register §6.2: *"Built and executed: `validate:registry` is chain link 40"* | S0-O2 | cited |

So the honest statement of this task's build: **one new validator, one new
orchestration lane, one extension to an existing gate, and the paperwork.** The
prompt's framing — "two gates are also still missing" — was true when it was
written against `589be13` and is **false at `4e4e46f`**. That is the packet-gap
hypothesis rule of README §4.6 firing for the thirteenth time in this programme.

## 3. The size gate, re-measured at `4e4e46f`

`yarn docs:build` → exit **0** (VitePress 1.6.4, "build complete in 41.37s"),
which ends in `validate:docs-size --require-dist`:

| Artifact | Measured | Declared budget | Used | Files |
|---|---|---|---|---|
| `apps/docs/.vitepress/dist` | **34,771,698 B (33.16 MB)** | **36,000,000 B (34.33 MB)** | **96.6 %** | **510** |
| `apps/storybook/storybook-static` | 26,226,136 B (25.01 MB) | 27,262,976 B (26.00 MB) | 96.2 % | 425 |

Both numbers are printed **against the budget** by the gate itself, which is the
design requirement; neither was hard-coded — both come from
`docs-size-ceilings.json`.

**The budget was neither raised nor lowered, and that is a decision, not an
omission.** The rule given to this task was "if a budget must be set, set it at
the measured current value (never above)". A budget already existed, seeded by
R1-O5 from a measured build at `527dbd1` (34,730,981 B). Setting it to today's
34,771,698 B would **break the gate in the other direction**: this ratchet is
tolerance-bounded, `relaxToleranceBytes = 1,400,000`, and it fails when the
artifact sits *further under* the ceiling than the tolerance. The current gap is
`36,000,000 − 34,771,698 = 1,228,302 B`, i.e. **87.7 % of the tolerance and
inside it**. Re-seeding at the measurement would make the gap 0 and the very next
build would either exceed the ceiling or trip the stale-ceiling clause. Lowering
it is therefore a *reduction* task, not a bookkeeping act — and §3.1 says where.

Growth since the ceiling was seeded three days ago: **+40,717 B (+0.12 %)**,
against +106 % over the four packets before it. The ratchet is holding.

### 3.1 The ten largest assets — where a reduction would start

| Bytes | Path |
|---|---|
| 4,340,223 | `assets/chunks/jsx-CwMPlI4_.CAitHN50.js` — the `@vue/repl` Babel chunk |
| 2,557,311 | `assets/chunks/@localSearchIndexroot.t_RUNYrG.js` — the offline MiniSearch index |
| 1,840,013 | `playground/dzup-core.mjs` |
| 1,045,245 | `assets/chunks/vue-repl.q3BfCOc-.js` |
| 287,876 | `assets/chunks/codemirror-editor.CG01Xe9l.js` |
| 149,790 | `components/DzSidebar.html` |
| 145,030 | `components/DzDataGrid.html` |
| 144,451 | `components/DzTable.html` |
| 143,260 | `components/DzTreeSelect.html` |
| 142,996 | `components/DzCascader.html` |

**28.9 % of the artifact is four playground/search chunks** (9,782,779 B of
34,771,698 B) and none of them is fetched unless a reader presses **Launch** or
types in the search box. The 144 component pages are not the problem: the largest
is 150 KB and the median is far below it. This is the same conclusion
`docs-size-ceilings.json`'s own `//` note reached and it is unchanged at `4e4e46f`
— recorded here so the owner is not asked to re-derive it.

## 4. The registry gate — extended, and what it now says

`validate:registry` existed and was already chain link **40**; `A4-D3` is
recorded **superseded** in the register §6.2 on exactly that ground. It was not
rebuilt. It **was** extended, because the design requirement given to this task —
*"a registry gate that passes while every descriptor points at an unpublished
package is measuring the wrong thing"* — turned out to be a live defect and not
a hypothesis.

**What the gate printed before this task:**

```
3 registries · 191 listed items · 191 payloads · 401 installable files
✓ registry: every listed item resolves, every file is present, …
```

Both sentences are true and **neither means what a reader takes them to mean.**
"Installable files" are files present **in this workspace**; "resolves" is *"the
payload sits beside its index entry"*. A consumer's `shadcn add` does two further
things the gate never looked at: fetch the item from an origin that is NXDOMAIN,
then run `npm install @dzup-ui/core`, which 404s. The A4-D1 report line said so
in prose, underneath a green tick, and nobody had ever written it as a count.

**What it prints now** — the **resolution ledger**, on every run:

```
resolution ledger — what "resolves" means, per tier
  tier 1  payload + files present in THIS workspace   191 of 191
  tier 2  every @dzup-ui/* dep is a PUBLISHED-policy pkg  191 of 191
  tier 3  a consumer could actually install it today       0 of 191
          deps: @dzup-ui/core, @dzup-ui/tokens
          served: NONE · unserved/unknown: @dzup-ui/core, @dzup-ui/tokens
          probe: NONE RECORDED
```

**Answering the brief's question directly: 191 of 191 descriptor entries resolve
in tier 1 and tier 2; 0 of 191 resolve in tier 3, and the reason is that no
npm-resolution probe exists, so the gate cannot tell.** It reports *unknown* as
**unresolved**, never as resolved. The three "registry descriptors" S2-O1 found
describing artifacts nobody can install are the three **indexes** (88 + 59 + 44
items); all three are in that 0.

**Fail closed where it cannot tell.** `--require-installable` promotes the
`resolution` clause from report to error:

| Invocation | Exit | Why that is the right default |
|---|---|---|
| `validate:registry` (chain link 40) | **0** | The registry's *correctness* is a different question from whether the owner has published anything. Making link 40 permanently red would teach people to ignore it, and the decision it depends on (A4-D1) is not a defect |
| `validate:registry --require-installable` | **1** | The deploy lane. On the machine about to publish a site whose every install command is unverified, "we cannot tell" is a reason not to upload |

The one artifact that can satisfy it is `docs/qa/release/<sha>/npm-resolution.json`,
**written by the owner after a publish** — the exact command is step 2 of the
runbook. `readNpmResolution` performs no probe: this gate touches no network by
construction, and an agent may not manufacture evidence of an owner action.

Two counting defects were found and fixed while building the ledger, both of the
kind this programme keeps meeting:

1. The first implementation keyed items **by name**, and reported **188 of 191** —
   three item names are shared across the three indexes. "188 of 191" reads as
   *three items are broken* while measuring nothing of the kind. Keyed by
   `(index, name)` it is 191 of 191, with a spec that locks it.
2. `--self-test` still catches **8 of 8** seeded defects; the new clause is
   report-level by default and so is not seedable there. It is covered by **12
   new unit specs** instead, including two seeded probes (a probe recording a
   404, and a probe recording every dependency served).

## 5. `docs:verify` — the one new lane

`packages/tooling/src/docs/verify.ts` + `.spec.ts` (16 specs), wired as
`yarn docs:verify`. **Nothing in it re-implements a check** — it is the
2026-09 deployment packet §5's eight-step job with the host, the credential and
the upload removed, so the pipeline configuration the owner still has to write
reduces to *checkout · install · `yarn docs:verify` · upload `dist`*.

| # | Check | Command it delegates to | Exit at `4e4e46f` |
|---|---|---|---|
| 1 | build | `yarn docs:build` | **0** |
| 2 | size | `yarn validate:docs-size --require-dist --all` | **0** |
| 3 | registry | `yarn validate:registry --all` | **0** |
| 4 | links | `yarn check:links` | **0** |
| 5 | freshness | `yarn validate:docs-freshness --require-dist` | **0** |
| 5 | pages | `yarn validate:docs-pages` | **0** |
| 5 | playground | `yarn validate:playground-parity` | **0** |

`yarn docs:verify` → **exit 0**, and the log prints
`33.16 MB (34,772,063 B) of 34.33 MB (36,000,000 B) — 96.6% of budget, 510 files`,
which is the `<done_check>`'s "reports the build size against a declared budget".

**The deploy lane, proven red:**
`yarn docs:verify --skip-build --offline --require-installable` → **exit 1**,
`FAIL [3/registry] exit 1`, ending `✗ docs:verify: 1 command(s) failed. Do not
deploy.` A lane nobody has watched fail is a lane nobody knows works.

Three flags, each spec'd: `--skip-build` (reuse the dist — step 5 still catches a
stale one), `--require-installable` (the deploy lane), `--offline` (drop the
external link check). A spec asserts the lane's argv contains no `deploy`,
`publish`, `upload`, `dns`, `token`, `secret` or `login`.

**Two minor build-to-build byte deltas, recorded rather than smoothed:** the
artifact measured 34,771,698 B on the first build of this session and
34,772,063 B on the `docs:verify` build — **+365 B of content-hash noise**, three
orders of magnitude inside the 1,400,000 B tolerance. Quote whichever you
measured; do not average them.

## 6. `validate:docs-freshness` — the actual gap this task closed

New: `packages/tooling/src/validators/docs-freshness.ts` + `.spec.ts` (**21
specs**), `yarn validate:docs-freshness`, chained at the **END** of
`validate:all` as link **58** so every existing link number holds.

The hole, measured rather than assumed: **three gates cover `apps/docs` and not
one of them could tell a stale build from a fresh one.**

| Gate | Compares | Blind to |
|---|---|---|
| `validate:docs-pages` | committed `.md` vs a fresh render | **`.vitepress/dist` entirely — it never opens it** |
| `validate:docs-size` | `dist`'s byte total vs the ceiling | *which* build produced them; a six-week-old dist measures the same |
| `validate:playground-parity` | copied assets vs the producer | the pages and the rendered HTML |

So the **deployable artifact — the only thing a deploy uploads — was the one
input under no binding at all**, and a pipeline could pass a ceiling, pass the
page gate (which reads `.md`, not HTML) and publish a site describing a tree that
no longer exists.

Three clauses: `dist` (present; skip off CI, error under `--require-dist`/CI —
the same policy `validate:docs-size` uses, deliberately), `stale` (no declared
input newer than the build; report off CI, error under `--require-dist`/CI) and
`stamp` (every rendered artifact names the **same** `sourceCommit`).

**One thing it deliberately does not do:** fail when a stamp differs from `HEAD`.
That is register row **#40**'s known-defective shape — an artifact is stamped
with the HEAD it was generated at, so every stamp goes stale the instant the
owner commits, through nobody's fault. The stamps are **printed** against HEAD
and never enforced, and a spec locks that behaviour in so a later packet does not
"fix" it into a permanent red. This is the first gate in this programme written
with a named defect class deliberately excluded.

At `4e4e46f`: **160 inputs compared · 0 newer than the build · all four rendered
artifacts stamped `4e4e46f`**, which equals HEAD today.

## 7. The five deployment decisions, re-measured

Full sheet with options and costs: **[`./TASK-S2-O3-deploy-runbook.md`](./TASK-S2-O3-deploy-runbook.md) §2.**
Summary of what the re-measurement changed:

| id | Decision | Re-measured at `4e4e46f` | Changed since R1-O5? | Recommendation |
|---|---|---|---|---|
| **D165** | Hosting target | **0 of 8 workflows** has a Pages/upload/Cloudflare/Netlify/Vercel/Wrangler/`gh-pages` step; **no `_headers` file exists anywhere under `apps/`** | no | **Cloudflare Pages** — the only option that can set the `/r/*.json` cache policy. **GitHub Pages is the honest answer if "no new accounts" is the constraint**; take it explicitly rather than drifting into it |
| **D166** ≡ A4-D2 | Domain / composition | **NXDOMAIN at `dzup-ui.com`, `www.` and `docs.`**, confirmed against **1.1.1.1 and 8.8.8.8** (§8). `SITE_ORIGIN` unchanged. `apps/docs` still has **no `base:`** | no — **register row #13 CONFIRMED, not falsified** | **register `dzup-ui.com`, one origin.** Free today because **0 of 191 items install**; irreversible the day A4-D1 goes to publish |
| **D167** | Deploy trigger | still no deploying workflow; `ci.yml` red since 2026-07-03 | no | **`workflow_dispatch` + `push: tags: ['v*']`** |
| **D168** | Cache ownership | **no `_headers`/`_redirects` file exists** — the policy has never been written down as a file | no | **host `_headers`** — a consequence of D165, not an independent choice |
| **D169** | Rollback drill | the word "rollback" appears in **exactly two** files under `docs/`, both release-QA reports; **no release checklist contains it** | no | **re-run `docs-deploy` at the previous tag** — and write it into a checklist |

### 7.1 The prompt named a different five — three of them are already closed

The prompt's step 4 names *hosting target, custom domain vs subpath, preview
deployments per PR, versioned docs, search provider*. Two of those are D165 and
D166. The other three need **no owner decision**, and the measurements say so:

- **Preview deployments per PR** — not a separate decision; it is a *property of*
  D165 (Cloudflare gives them free, GitHub Pages needs a hand-rolled branch).
- **Versioned docs** — **already decided and shipped as "not versioned"**, stated
  in the site's own footer (`config.ts:261`: *"this site publishes the tip of
  main and is not versioned"*). With nothing published and 42 pending changesets
  there is no second version to serve.
- **Search provider** — **already decided and shipped**: VitePress
  `provider: 'local'`, offline MiniSearch, no account, no service
  (`config.ts:244`), with tuned `boost`. The cost is a **2,557,311 B** index
  chunk, 7.4 % of the artifact.

### 7.2 Register correction — three rows were dropped, none falsified

`owner-decision-register-2026-09-22.md` carries **D165** (row 14), **D166 ≡
A4-D2** (row 13) and **D172** (row 15). It does **not** carry **D167**, **D168**
or **D169**, which both the R1-O5 handoff §8 and the 2026-09 deployment packet
§2 raise as open. That is a **gap, not a contradiction**: no register row is
falsified by this task, and the runbook §2 restores the three with re-measured
inputs. Row #13's NXDOMAIN claim was re-verified against two public resolvers and
**holds**.

## 8. A measurement near-miss worth recording

The **first** DNS reading taken for this task said `dzup-ui.com → 77.77.193.0` at
all three names — which would have **falsified register row #13** and put a
fabricated fact into this programme's most load-bearing document.

It was wrong. `77.77.193.0` is the **local resolver's own address**, printed by
`nslookup` in its `Server:` / `Address:` preamble; a `grep 'Address' | tail -1`
filter picked that line instead of the answer. The control — a domain that
certainly does not exist — returned the same address, which is what exposed it.

```bash
nslookup dzup-ui.com 1.1.1.1      # *** can't find dzup-ui.com: Non-existent domain
nslookup dzup-ui.com 8.8.8.8      # *** can't find dzup-ui.com: Non-existent domain
nslookup datazup.com 8.8.8.8      # 213.199.40.69
```

This is the **same class** as this repository's standing rule *"never read a gate
result through a pipe"*, one domain over. It is recorded here because the rule as
written names gates and pipes, and this was a DNS lookup and a line filter — the
rule's *reason* generalises and its *wording* did not.

## 9. What deployment would make newly true

| Claim | Today | After a deploy |
|---|---|---|
| **08-28 roadmap N2 exit** — *"discover, install, style and verify a component from published machine-readable surfaces alone"* | **unmeetable.** The surfaces exist and are unreachable | **3 of 4 become meetable** (discover, style, verify). **`install` does NOT** — it needs A4-D1, because `shadcn add` accepts the item and then `npm install` 404s. **A deploy alone moves N2 from 0 of 4 to 3 of 4** |
| **Figma kit / Tokens Studio sync** (README §8, *"S2-O3 is its precondition"*) | blocked | **unblocked** — it needs a public `dist/tokens.dtcg.json` to sync against |
| **08-11 doc 03** — *"the published site, manifests and package declarations must agree in CI"* | **vacuous**: no published site for anything to agree with | **enforceable** — `docs:verify` is the agreement check, the pipeline is its CI half |
| **MCP HTTP mode** (`RegistryClient` reading `/r/component-meta.json`) | code path exists, **no origin to read** | exercised for real |

### 9.1 One gate silently depends on the site being unreachable — found

**`scripts/check-external-links.mjs:50`**:

```js
['dzup-ui.com', 'canonical origin, deploy pending'],
```

`yarn check:links` exits **0** today having **skipped four `dzup-ui.com` URLs**.
That is correct while the domain is NXDOMAIN and becomes **a hole the moment the
site is live**: the gate keeps printing green while never once fetching the
origin the whole project points at. **Removing that entry is step 8 of the
runbook and is not optional.**

A softer second instance on the same allowlist: `www.npmjs.com/package/@dzup-ui/core`
is skipped because it *"returns 403 to scripted requests"*. At `4e4e46f` it
returns **404** — the package does not exist. The reason is stale in the
direction that hides A4-D1 from the link gate.

**Everything else was checked and is clean.** `validate:component-meta`'s
`reachability` clause sounds like an HTTP probe and is not: it asserts statically
that `build-registry.ts` copies `component-meta.json` into `/r/`. That is an
honest proxy, not a hidden dependency on unreachability — but it also means
**nothing anywhere fetches the live URL**, so a real probe becomes possible for
the first time after a deploy (a follow-up, not a precondition).

## 10. Implemented files and API effect

| Path | Status | What it is |
|---|---|---|
| `packages/tooling/src/validators/docs-freshness.ts` | **new** | `yarn validate:docs-freshness` — three clauses over the deployable artifact |
| `packages/tooling/src/validators/docs-freshness.spec.ts` | **new** | 21 specs, every clause driven red on a synthetic tree |
| `packages/tooling/src/docs/verify.ts` | **new** | `yarn docs:verify` — the 5-check pre-deploy lane, as data plus a spawn |
| `packages/tooling/src/docs/verify.spec.ts` | **new** | 16 specs over the lane's shape and its three flags |
| `packages/tooling/src/validators/registry.ts` | **modified** (+235) | the resolution ledger, `readNpmResolution`, `installabilityViolations`, `--require-installable`, the `resolution` rule |
| `packages/tooling/src/validators/registry.spec.ts` | **modified** (+122) | **+12 specs**: the ledger, the fail-closed clause, the probe reader |
| `package.json` | **modified** (+36/−4) | `validate:docs-freshness` + `docs:verify` and their `//` documentation keys; `validate:all` extended at the END |
| `docs/program-2026-09-22-architecture/reports/TASK-S2-O3-deploy-runbook.md` | **new** | the owner's runbook + the re-measured decision sheet |
| `docs/program-2026-09-22-architecture/reports/TASK-S2-O3-handoff.md` | **new** | this file |
| `docs/program-2026-09-22-architecture/EXECUTION-STATUS.md` | **modified** | the S2-O3 row + three ratchet rows |

**Public API effect: none.** Nothing under `packages/{contracts,core,tokens,mcp,
nuxt,testing,compat,codemods}/src` was touched. `@dzup-ui/tooling` is private
(release-policy `private`), so the two new modules are not a published surface.
**No component, story, token, anatomy file, manifest or generated artifact was
modified**, and no generated page was hand-edited.

**`docs-size-ceilings.json` was NOT touched** — no ceiling raised, none lowered
(§3 for the reasoning).

## 11. Focused validation — every command, read directly, never through a pipe

| Command | Exit | Evidence |
|---|---:|---|
| `yarn docs:build` | **0** | `build complete in 41.37s`; docs dist 34,771,698 B / 510 files · 96.6 % of budget |
| `node node_modules/vitest/vitest.mjs run …docs-freshness.spec.ts` | **0** | 21 passed |
| `node node_modules/vitest/vitest.mjs run …{docs-freshness,registry,verify,docs-size}.spec.ts` | **0** | **89 passed, 0 failed** (docs-size 20 · docs-freshness 21 · registry 32 · verify 16) |
| `node node_modules/tsx/dist/cli.mjs …/validators/docs-freshness.ts` | **0** | 160 inputs · 0 newer · 4 stamps all `4e4e46f` |
| `node node_modules/tsx/dist/cli.mjs …/validators/registry.ts` | **0** | ledger 191/191/**0**; 3 report findings |
| `node node_modules/tsx/dist/cli.mjs …/validators/registry.ts --require-installable` | **1** | `✗ [resolution] 0 of 191 …` — the fail-closed path, watched to fire |
| `node node_modules/tsx/dist/cli.mjs …/validators/registry.ts --self-test` | **0** | `all 8 seeded defects were caught by their own clause` |
| `yarn docs:verify` | **0** | 7 of 7 commands PASS; budget line printed |
| `yarn docs:verify --skip-build --offline --require-installable` | **1** | `FAIL [3/registry] exit 1` → `Do not deploy.` |
| `yarn check:links` | **0** | 20 URLs resolve, **7 allowlisted** — see §9.1 |
| `yarn typecheck` | **0** | |
| `yarn typecheck:tooling` | **0** | |
| `yarn lint` | **1 → 0** | 15 errors + 1 warning, **all in this task's six files**; `eslint --fix` scoped to those six; re-run **0**. See §11.1 |
| `yarn test` (full suite) | **0** | **569 files · 11,061 passed · 3 skipped · 1 todo · 0 failed.** Baseline at task start was 567 files / 11,012 passed, so the delta is **exactly +2 files and +49 tests** — the two new spec files and the 49 specs §10 lists (21 + 16 + 12). **No pre-existing test changed, and no `+25 tests I did not author` appeared**, which is the concurrent-session check TASK-S1-O1 asked every later task to run |
| final re-run after the documentation edits (`validate:{doc-snippets,adr-references,readme-facts,docs-freshness,registry,docs-size}`) | **0 0 0 0 0 0** | run *after* the last `docs/` write, because editing under `docs/` during an aggregate scan has killed a run spuriously in this repository |

### 11.1 `eslint --fix` damage, found and repaired

The standing warning that `eslint --fix` has corrupted a string literal in this
repository fired again, in a milder form. The `test/prefer-lowercase-title` rule
rewrote six deliberate test titles **in place**, lowercasing only the first
character:

```
'ERRORS on an absent dist …'            → 'eRRORS on an absent dist …'
'SEEDED: a generated page newer …'      → 'sEEDED: a generated page newer …'   (×4)
'SEEDED: a probe recording a 404 …'     → 'sEEDED: a probe recording a 404 …'
```

`sEEDED` is not a word and would have shipped in the test output of three spec
files. All six were rewritten by hand to genuinely lowercase phrasings
(`seeded defect: …`, `errors (not reports) on …`). **Every touched file was
re-verified after the fix**, not assumed: lint 0, typecheck 0, 89 specs green,
and all three validators re-run with byte-identical output to before the fix.

## 12. Aggregate qualification

`yarn validate:all` run **end to end**, exit code read **directly**:

- **Link count: 57 → 58.** The new link is `validate:docs-freshness`, appended at
  the **END**, so every existing link number holds — `validate:registry` is still
  **40**, `validate:docs-size` still **41**, `validate:peers` still **51**,
  `validate:at-runs` still **57**. This is the **eighth** change to the count in
  five days; **count it, never quote it.**
- **Result: exit 1, at link 51, exactly as before this task.** The failing half is
  `validate:peers`' second command `validate:icon-duplicates`:
  `✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.`
  — `lucide-vue-next@^0.475.0` from `@dzup-ui/landing` and `@dzup-ui/sandbox`,
  `^0.477.0` from `@dzup-ui/core`. **33 lanes printed a green line before it.**
  `validate:peers` itself passes; the two report-level findings under it
  (`deprecated-ident`, `generated-surface-drift`) are consequences of the same
  open decision and cannot fail.
- **Links 52–58 remain unreached in the aggregate.** They were unreached at 57
  links before this task and are unreached at 58; adding link 58 did not change
  which link fails or why. Each is 0 individually and
  `validate:docs-freshness` is 0 individually (§11).
- **Nothing in this task touches the failing lane.** `validate:icon-duplicates`
  is `lucide-vue-next 0.475.0 + 0.477.0`, register rows #3 / D174 / D175, an
  owner decision about an icon library. No file this task wrote is in its path.

**Maturity level reached: aggregate-qualified locally, for the lanes that run.**
Not CI, not release, not production, and explicitly **not deployed**.

## 13. Ratchet movements

| Ratchet | Old | New | Note |
|---|---:|---:|---|
| `validate:all` links | 57 | **58** | `validate:docs-freshness` appended at the END; positions 1–57 unchanged |
| **Gates binding the deployable docs artifact to its inputs** | **0** | **1** | new. `validate:docs-freshness`, link 58. Before it, `dist` was the only docs input under no binding at all |
| **Registry items measured for end-to-end installability** | **0 of 191** (never counted) | **0 of 191, now a printed number with a reason** | the count did not move — **the visibility did.** Tier 3 is 0 and the gate says why and refuses to call it resolved |
| **Registry gate able to fail closed on installability** | **no** | **yes** (`--require-installable`) | watched to fire; report-level by default so link 40 keeps measuring correctness |
| **Pre-deploy checks runnable as one command** | **0** (a list in a report) | **7 commands / 5 checks** (`yarn docs:verify`) | the pipeline config the owner writes is now checkout · install · one command · upload |
| Docs dist bytes | 34,730,981 (seeded `527dbd1`) | **34,771,698** / 34,772,063 | **+40,717 B (+0.12 %)** in three days; 96.6 % of the 36,000,000 B ceiling; **1,228,302 B of headroom against a 1,400,000 B tolerance** |
| Docs-size ceiling | 36,000,000 | **36,000,000 — UNCHANGED** | **not raised** (forbidden) and **not lowered** (would zero the headroom and trip the stale-ceiling clause in the other direction). Lowering it is a reduction task; §3.1 names the four chunks |
| Tooling specs over the docs/deploy lanes | 39 (docs-size 20 · registry 20) | **89** | +21 freshness · +16 verify · +12 registry ledger = **+49**; registry.spec 20 → 32 |
| Repository test suite | 567 files / 11,012 passed | **569 files / 11,061 passed / 0 failed** | **+2 files, +49 tests — exactly this task's additions.** `yarn test` exit **0** on the first run; the known "exit 1 with zero failing tests under load" did not occur |
| **`yarn check:links` allowlist entries that hide a live surface** | **2, unrecorded** | **2, recorded with their expiry condition** | `dzup-ui.com` *"deploy pending"* (4 URLs) and `npmjs.com/@dzup-ui/core` *"403"* which is actually a 404. Runbook step 8 removes the first |

**Ratchets NOT moved, deliberately:** every size ceiling; every capability,
anatomy, ownership, ADR, perf and i18n ratchet; the AT cell count (0 of 534,
untouched and untouchable by an agent). **No allowlist was widened and no
threshold was relaxed to make anything pass.**

## 14. Owner decisions raised

1. **D165 · D166 · D167 · D168 · D169** — the five deployment decisions, all
   still **open**, all re-measured, each with a costed recommendation in
   [`./TASK-S2-O3-deploy-runbook.md`](./TASK-S2-O3-deploy-runbook.md) §2. Nothing
   an agent can do moves them; the engineering behind all five is finished.
2. **D-S2O3-1 (new) — the `check:links` allowlist must expire with the deploy.**
   `scripts/check-external-links.mjs:50` skips `dzup-ui.com` with the reason
   *"canonical origin, deploy pending"*. **(a)** delete the entry as part of the
   deploy (runbook step 8) · **(b)** keep it and accept a link gate that never
   fetches the project's own origin. **Recommend (a)**, and the same change
   should correct the `npmjs.com` entry's reason from *"403"* to *404 / A4-D1*.
   Low cost, and it is the difference between a green gate and a gate.
3. **D194 — the registry `docs` clause: ratchet or leave report-only?** Raised by
   S0-O2's finding S9 inside `registry.ts`'s own header and **not carried into
   the 62-row register**. It fires on **103 of 191** items (59 animations + 44
   templates) with no markdown mirror. **(a)** record 103 and fail on a rise ·
   **(b)** leave report-only. **Recommend (a)** — it is the shape every other
   ratchet here has, and a report-level finding under a green tick is the exact
   pattern this task spent its time undoing.
4. **Register housekeeping — done, not left as a request.** All four ids missing
   from the 62 rows (**D167**, **D168**, **D169**, **D194**) plus the new
   **D-S2O3-1** are now recorded in
   [`./owner-decision-register-2026-09-22.md`](./owner-decision-register-2026-09-22.md)
   **§8 Addendum**, and the deployment three are fully costed in the runbook §2.
   **Appended, never inserted** — no existing row number moved, and the 62 rows
   are unchanged apart from the two deliberate changeset-count corrections (§17).
   This is bookkeeping, not a contradiction — see §7.2.

## 15. Ranked next packet

1. **The owner answers A4-D1** (register row 1). It gates D172 → D166 → D165 →
   the deploy, and it is the only thing between "3 of 4 of the N2 exit" and "4 of
   4". Nothing an agent does changes this position.
2. **The owner commits the 269-path worktree** (register row #2 ≡ D127). Every
   number in this handoff is bound to `4e4e46f` **plus 269 uncommitted paths**,
   which is not a tree anyone can check out — and the runbook's step 5 says so.
3. **S2-O4** — dispatch the four written-but-never-dispatched CI lanes. It is the
   nearest sibling, also `[!owner dispatches]`, and its evidence is cheap.
4. **A docs-artifact reduction task** — not created here. 28.9 % of the artifact
   (9,782,779 B) is four chunks nothing fetches unless a reader presses **Launch**
   or types in the search box. It is the only way the 36,000,000 B ceiling gets
   lowered rather than forgotten; §3.1 names the four files and their bytes.
5. **After a deploy only:** add a real HTTP probe to
   `validate:component-meta`'s `reachability` clause, which is a static proxy
   today (§9.1), and record the first `npm-resolution.json` so the registry
   gate's tier 3 can be something other than 0.

## 16. Scope boundaries honoured

- **No git commit, push, CI dispatch, publish, registry mutation, deployment,
  domain or DNS change, baseline replacement or hosting-account action.** DNS was
  **read** (four `nslookup` queries against public resolvers) and never written.
- **No sibling repository was read, written or reported on.** The only
  cross-tier mention is `@dzup-ui-pro` as a string the registry gate forbids,
  which was already there.
- **All 263 pre-existing dirty paths preserved.** Nothing reverted, stashed,
  checked out or cleaned. **End state 269, and the +6 accounts for itself
  exactly:**

  | Δ | Paths | Why it is +1 each |
  |---:|---|---|
  | +4 | `packages/tooling/src/{validators/docs-freshness.ts,validators/docs-freshness.spec.ts,docs/verify.ts,docs/verify.spec.ts}` | new files in directories that already contain tracked files, so each shows individually |
  | +2 | `packages/tooling/src/validators/registry.{ts,spec.ts}` | **were clean** at task start and this task made them ` M`. Their diffs are `+235/−0` and `+122/−0` — pure additions, no prior task's edits underneath |
  | +0 | `TASK-S2-O3-handoff.md`, `TASK-S2-O3-deploy-runbook.md` | they live inside `docs/program-2026-09-22-architecture/reports/`, which git already reports as **one** untracked directory entry, so two new files add nothing to the count |
  | +0 | `package.json`, `EXECUTION-STATUS.md`, `owner-decision-register-2026-09-22.md` | already dirty from prior tasks. `package.json`'s diff is `+36/−4` and only `+5/−1` of that is this task's |

  **No change was observed that this task did not make.** TASK-S1-O1 found +25
  tests it had not authored; the equivalent check here is the suite delta, which
  is **exactly +2 files and +49 tests** (§11). No sign of the concurrent session
  in this window.
- **No generated page hand-edited.** The docs pages were regenerated only by
  `yarn docs:build`, which is their sanctioned producer.

## 17. Register correction — the changeset count is off by one

**Falsified and corrected.** `owner-decision-register-2026-09-22.md` row 1 and
row 10 both state **42 pending changesets**, measured with
`ls .changeset/*.md | wc -l`. The ratchet board in
[`../EXECUTION-STATUS.md`](../EXECUTION-STATUS.md) repeats it.

That glob includes **`.changeset/README.md`**, which is changesets' own
boilerplate and not a changeset. The true count at `4e4e46f` is **41**, and the
repository's own gate says so independently:

```
✓ release-policy: … 41 pending changeset(s), 0 major, 0 mixed …
```

```bash
ls .changeset/*.md | wc -l                                  # 42  ← counts README.md
find .changeset -name '*.md' -not -name 'README.md' | wc -l  # 41  ← correct
yarn validate:release-policy                                # "41 pending changeset(s)"
```

**Corrected in place** in both register rows, in their measurement commands, and
in the ratchet board, each with a `←` note naming this task. Nothing else in the
register is changed: the *substance* of rows 1 and 10 is untouched (the set is
still large, still unaudited, still one-way), and row #13's NXDOMAIN claim was
independently re-verified and **holds** (§8).

**Why it matters more than one:** row 10's recommendation is *"audit all 42
rather than the 11 already known"*, and an auditor working from that number would
look for a 42nd file that does not exist, or would audit `README.md` as if it
declared a version level. A count that is off by one in a document whose whole
purpose is binding numbers to commits is the defect that document exists to
prevent.

## 18. Incident — this task damaged the register and restored it exactly

**Disclosed because a silent recovery would be worse than the damage.**

While repairing a mojibake (`â` where an em dash belonged) introduced by an
earlier edit of mine to `owner-decision-register-2026-09-22.md`, a Python
one-liner located the splice point with
`s.find('by TASK-S2-O3**')` … `s.find('see row 1', i)`. Both anchors matched, but
**not in the same row**: the first matched row 1, the second matched row 10.
The replacement therefore deleted an ~9,000-character span covering **register
rows 1 through 10** — A4-D1, D127, D174/D175, D146, D158, `D-S2O2-3`,
`D-S2O1-2`, `D-S2O1-3`, D154 and `N5-01 D3`, i.e. **the whole of Part A, the
publication critical path.**

**The file is untracked** (`?? docs/…/owner-decision-register-2026-09-22.md` — it
was created by S0-O2 on this same uncommitted worktree), so there was **no git
copy to restore from.** The register would have been unrecoverable but for one
accident: the same script printed `repr(frag)` — the exact span it was about to
remove — **before** writing. That output was the recovery source.

Restored verbatim by
`<scratchpad>/restore-register.py`, which refuses to run unless the splice point
occurs exactly once. Verification, all four checks:

| Check | Result |
|---|---|
| Row count | **62** |
| Row numbering | **1…62, contiguous, no gaps, no duplicates** |
| Each restored row's distinctive title | present **exactly once** (10 of 10) |
| Mojibake (`â`) | **0** — the original defect is also fixed |
| Row #41 (the done_check audit, the most-cited row) | intact |

**Three lessons, recorded because this class of damage is not hypothetical here:**

1. **Never splice with two independent `find()` calls.** `find(a)` and
   `find(b, i)` can land in different records and the span between them is
   whatever happens to lie there. Match the *whole* literal, assert
   `count(...) == 1`, and refuse otherwise — which is what every later edit in
   this task did, and what `restore-register.py` itself does.
2. **This programme's most load-bearing documents are untracked.** Every report
   under `docs/program-2026-09-22-architecture/reports/` is `??` on a worktree the
   owner has not committed. There is **no undo for any of them**. That is a
   second, independent argument for register row **#2** (commit the tree) beyond
   the evidence-admissibility one it already makes: *right now a single bad
   `sed`, `python` or `eslint --fix` destroys work no command can recover.*
3. **`repr()` before `write()` is cheap insurance.** It is the only reason this
   paragraph is a lesson and not a loss.

**Nothing else in the register was altered by this task** beyond the two
deliberate changeset-count corrections (§17) and the appended §8 addendum.
