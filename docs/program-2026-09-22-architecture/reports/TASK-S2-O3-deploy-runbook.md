# Docs-site deploy runbook — for the owner

> **TASK-S2-O3**, `[!owner deploys]`. Prepared in `ui/dzup-ui` at
> **`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`** (`4e4e46f`) on a worktree with
> ~263 uncommitted paths from this programme's prior tasks. Every number below
> was measured at that commit with the command printed beside it.
>
> **The hosting target is still decision `D165` and is NOT picked in this file.**
> §2 costs the three options and recommends one; the choice is the owner's. This
> runbook is executable the moment D165, D166 and A4-D1 are answered, and not
> before — §3 says why the order matters and what each step makes irreversible.
>
> **Nothing here has been executed.** No DNS record was created or changed, no
> hosting account was opened or touched, no workflow file was written, no package
> was published, and no request was made to `dzup-ui.com` expecting it to answer.
> This document and the gates it calls are the whole of the delivery.
>
> Predecessor, cited rather than restated:
> [`../../program-2026-09-04/reports/docs-deployment-packet-2026-09.md`](../../program-2026-09-04/reports/docs-deployment-packet-2026-09.md)
> (203 lines: the option analysis, the full cache table, the eight-step workflow
> sketch). This file **re-measures** its inputs and adds the two things it could
> not have: an executable pre-deploy lane (`yarn docs:verify`) and a
> step-by-step runbook with the irreversible steps marked.

---

## 1. State at `4e4e46f`, measured

| Fact | Value | Command |
|---|---|---|
| Docs artifact | **34,771,698 B (33.16 MB), 510 files** — **96.6 % of its 36,000,000 B declared budget**. A second build in the same session measured **34,772,063 B**: **+365 B of content-hash noise**, three orders of magnitude inside the 1,400,000 B tolerance. Quote the one you measured; do not average them | `yarn docs:build` (ends in `validate:docs-size --require-dist`) |
| Storybook artifact | 26,226,136 B (25.01 MB), 425 files — 96.2 % of 27,262,976 B | `yarn validate:docs-size --all` |
| Landing artifact | **still unmeasured at any recent commit** — decision **D170**, unchanged since R1-O5 | `du -sb apps/landing/dist/*` needs a fresh build |
| Whole one-origin payload | **≈ 76 MB** (33.16 docs + 25.01 Storybook + ≈ 16.7 landing, the last from a 2026-08-28 build and **not citable**) | sum |
| Registry served under `/r/` | **3 indexes · 191 items · 191 payloads · 401 files present in this workspace** | `yarn validate:registry` |
| Registry **installability** | **0 of 191.** Every item depends on `@dzup-ui/core` + `@dzup-ui/tokens`; no npm-resolution probe is recorded, so the gate reports *unknown* and refuses to count it as resolved | `yarn validate:registry --all` → resolution ledger |
| `dzup-ui.com` · `www.` · `docs.` | **NXDOMAIN at all three**, confirmed against **two public resolvers** (`1.1.1.1` and `8.8.8.8`), not the local one — see §1.1 | `nslookup dzup-ui.com 1.1.1.1` |
| `datazup.com` | resolves, **213.199.40.69** (unchanged since 2026-09-21) | `nslookup datazup.com 8.8.8.8` |
| `SITE_ORIGIN` | `https://dzup-ui.com`, authored **once** in `apps/landing/src/origin.ts:32` | `grep -n SITE_ORIGIN apps/landing/src/origin.ts` |
| Deploy automation | **none.** 8 workflows; **zero** contain a Pages, artifact-upload, Cloudflare, Netlify, Vercel, Wrangler or `gh-pages` step | `grep -rilE 'deploy-pages\|upload-pages-artifact\|cloudflare\|netlify\|vercel\|wrangler\|gh-pages' .github/workflows/` → no match |
| Host header config | **no `_headers` and no `_redirects` file anywhere under `apps/`** | `find apps -name '_headers' -o -name '_redirects'` → empty |
| VitePress `base` | **absent** — the site assumes it is served from `/` | `grep -nE '^\s*base:' apps/docs/.vitepress/config.ts` → no match |
| Search | **VitePress `provider: 'local'`** (offline MiniSearch, no service, no account). Costs a **2,557,311 B** index chunk | `apps/docs/.vitepress/config.ts:244` |
| Versioning | **none, and stated on the page**: the footer reads *"Locally built, not deployed — this site publishes the tip of main and is not versioned."* | `apps/docs/.vitepress/config.ts:261` |
| Pending changesets | **42** | `ls .changeset/*.md \| wc -l` |
| Packages on npm | **6 of 6 `E404`** — cited from the register's 2026-09-24 re-measurement (row 1), not re-run here | `owner-decision-register-2026-09-22.md` §row 1 |
| `validate:all` | **58 links** after this task (was 57) | `node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"` |

### 1.1 A measurement warning worth one paragraph

The first DNS reading taken for this file said `dzup-ui.com → 77.77.193.0` at all
three names, which would have **falsified the register's NXDOMAIN row**. It was
wrong. `77.77.193.0` is the **local resolver's own address**, printed by
`nslookup` in its `Server:`/`Address:` preamble; a naive line filter picked that
line up instead of the answer. The control — a domain that certainly does not
exist — returned the same address, which is what exposed it.

**Do not read DNS through a line filter, and always query a named public
resolver.** The correct form, and the one whose output §1 quotes:

```bash
nslookup dzup-ui.com 1.1.1.1      # → *** can't find dzup-ui.com: Non-existent domain
nslookup dzup-ui.com 8.8.8.8      # → same
```

This is the same class of error as reading a gate result through a pipe, and it
came within one line of putting a fabricated fact into a register row.

---

## 2. The decision sheet — five decisions, re-measured

The 2026-09-04 packet framed these as **D165–D169**. Three of the five
(**D167**, **D168**, **D169**) were **not carried into** the 62-row
`owner-decision-register-2026-09-22.md`; only D165, D166/A4-D2 and D172 are
there. They are restored below and §2.2 records the gap.

| id | Decision | Re-measured input at `4e4e46f` | Options, costed | Recommendation |
|---|---|---|---|---|
| **D165** 🟠 | **Hosting target** | No hosting resource of any kind exists; **0 of 8 workflows** has an upload step; **no `_headers` file** exists to carry §2.1's cache policy | **(a) Cloudflare Pages** — free tier covers it; needs one account someone owns; `_headers` supported; 25 MB per *file* and 20 000 files per deploy, so the 4.34 MB chunk and 510+425 files fit comfortably; per-PR previews built in · **(b) GitHub Pages** — free, **zero new accounts**, the repo already exists; **cannot set headers** (≈10 min fixed cache on everything, including `/r/*.json`); 1 GB site limit but the artifact-upload step is the practical ceiling and 76 MB is already large for it; previews are hand-rolled on a second branch · **(c) the existing `datazup.com` host** (213.199.40.69) — an origin that already resolves, but forces `SITE_ORIGIN` to move and **regenerates all 282 `/r/**` files plus both `llms*.txt`** | **(a)**, unchanged from R1-O5 and from register row #14. It is the only option that can set the `/r/*.json` cache policy, and `/r/*.json` is a machine-read API. **(b) is the right answer if the owner's constraint is "no new accounts"** — take it explicitly and accept D168 collapsing to "host defaults", rather than drifting into it |
| **D166** ≡ **A4-D2** 🔴 | **Domain and site composition** | **NXDOMAIN at `dzup-ui.com`, `www.` and `docs.`**, verified against two public resolvers. `SITE_ORIGIN` is already `https://dzup-ui.com` and is stamped into 3 registry indexes, 87 markdown mirrors, both `llms*.txt`, `sitemap.xml`, every canonical link, the OG image URLs and every exported theme's `$schema`. **`apps/docs` has no `base:`**, so it currently assumes `/` | **(a) register `dzup-ui.com`, one origin** — landing at `/`, Storybook at `/storybook/`, docs at `/docs/`. Cost: a registration, plus **one line** (`base: '/docs/'`) and a mount plugin modelled on `apps/landing/vite/serve-storybook.ts`; **zero artifact churn** · **(b) `docs.dzup-ui.com` as a second origin** — no `base:` needed, but splits the offline MiniSearch index, duplicates the `data-theme` cookie surface and gives `/r/` either a second home or a cross-origin fetch · **(c) `datazup.com/ui/`** — the only option whose domain resolves today; costs a regeneration of **all 282** `/r/**` files and both `llms*.txt` | **(a).** Free to change today because **nothing is distributed** (0 of 191 items install); expensive the day A4-D1 goes to publish, because a registry item copies our origin into the consumer's repository irrevocably. **This is the one row no further engineering can prepare** |
| **D167** 🟠 | **Deploy trigger** | 8 workflows, **none deploying**. `ci.yml` has not been green since **2026-07-03** (R1-O4) | **(a) `workflow_dispatch` + `push: tags: ['v*']`** · **(b) `push: main`** — every merge is live · **(c) manual upload** | **(a).** The site documents a published API, and with `ci.yml` red since July `main` is not a quality signal. **(b) additionally means a stale-evidence deploy is one merge away** — which `validate:docs-freshness` now catches, but only if the pipeline runs `docs:verify`, which is exactly what (a)'s narrower trigger makes affordable |
| **D168** 🟠 | **Cache policy ownership** | **No `_headers`/`_redirects` file exists.** The policy is fully specified in the 2026-09 packet §4 and has never been written down as a file | **(a) host `_headers`** (requires D165 = Cloudflare) · **(b) accept fixed host defaults** (GitHub Pages: ≈10 min on everything) | **(a)**, and it is a **consequence of D165, not an independent choice.** The load-bearing row is `/r/*.json` at `max-age=300`: a machine-read registry served under a 10-minute blanket cache is wrong in both directions — too stale for `shadcn add`, too short for 191 immutable payloads. `@dzup-ui/mcp`'s `RegistryClient` reads `/r/component-meta.json` in HTTP mode and has the same problem |
| **D169** 🟢 | **Rollback drill** | The word "rollback" appears in **exactly two** files in `docs/`, both release-QA reports (`docs/qa/release/*/report.md`). **There is no release checklist that contains it** | **(a) re-run `docs-deploy` at the previous tag** — every input is generated from the tree, so the tag **is** the artifact and nothing needs storing · **(b) repoint a stored deployment** (Cloudflare keeps them; GH Pages does not) | **(a) as the drill, (b) as the 60-second mitigation** on Cloudflare. And **write it into a release checklist** — §5. A rollback that lives only in a handoff is not a drill |

### 2.1 The three decisions the prompt named that are NOT D165–D169

The task prompt's step 4 names a different five: *hosting target, custom domain
vs subpath, preview deployments per PR, versioned docs, and search provider.*
Two of those are D165 and D166. The other three are **already answered in the
code** and need no owner decision — recorded here so nobody re-opens them:

| Topic | Measured answer at `4e4e46f` | Verdict |
|---|---|---|
| **Preview deployments per PR** | Nothing exists; it is a **property of D165**, not a separate choice — Cloudflare Pages gives per-PR previews with no configuration, GitHub Pages needs a hand-rolled second branch. Already in §2's D165 row | **not a separate decision**; folded into D165 |
| **Versioned docs** (single vs `/v0.2/`) | **Decided and shipped as "not versioned"**, and the site says so in its own footer: *"this site publishes the tip of main and is not versioned"* (`config.ts:261`). With `@dzup-ui/core` at 0.2.0, **nothing published** and 42 pending changesets, there is no second version to serve | **closed, no decision needed.** Re-open when a second minor is published, not before |
| **Search provider** | **Decided and shipped**: VitePress `provider: 'local'` (offline MiniSearch, `config.ts:244`), with a documented `boost` tuning. **No account, no service, no network dependency.** The cost is a 2,557,311 B index chunk — 7.4 % of the artifact | **closed.** Revisit only as part of a size-reduction task (§2.3), and note that an Algolia swap would trade 2.5 MB for an account and a crawl |

### 2.2 Register correction — three decision rows were dropped

`owner-decision-register-2026-09-22.md` (62 rows) carries **D165** (row 14),
**D166 ≡ A4-D2** (row 13) and **D172** (row 15). It does **not** carry **D167**,
**D168** or **D169**, which the R1-O5 handoff §8 and the 2026-09 deployment
packet §2 both raise as open. This is a **gap, not a contradiction**: no register
row is falsified by this task, and §2 above restores the three with re-measured
inputs. **The register's substantive rows were all re-verified and all hold** —
in particular row #13's NXDOMAIN claim, which §1.1 nearly broke with a bad
measurement and which two public resolvers confirm.

One new row is raised by this task (**D-S2O3-1**, §4 step 8) and one existing
report-level finding gains a number (**D194**, the registry `docs` clause) — both
listed in the handoff's owner-decision section.

### 2.3 If the budget is the blocker

28.9 % of the docs artifact (9,782,779 B of 34,771,698 B) is four chunks that
**nothing fetches** unless a reader presses **Launch** or types in the search
box: the `@vue/repl` Babel chunk (4,340,223 B), the MiniSearch index
(2,557,311 B), `playground/dzup-core.mjs` (1,840,013 B) and `vue-repl`
(1,045,245 B). The 144 component pages are not the problem — the largest is
149,790 B. A reduction task starts there. **The ceiling was not raised and not
lowered by this task**; see the handoff §3 for why lowering it to the measured
value would break the tolerance clause in the other direction.

---

## 3. Order, and what each answer unlocks

```
A4-D1  publish-or-freeze  ──►  D172  deploy before or after?  ──►  D166  domain
                                                                     │
                                                          D165  host ─┤
                                                                     │
                                            D167 trigger · D168 cache ┴─►  deploy
```

**A4-D1 first.** The site advertises `npm i @dzup-ui/core` on all 144 component
pages, 87 block mirrors, both `llms*.txt` and all 191 registry items, and that
command returns `E404` for every one of the six published-policy packages.
Deploying first publishes a working site whose every call to action is broken,
which is **worse than NXDOMAIN, because NXDOMAIN is honest** (D172's recorded
reasoning, unchanged).

### 3.1 What deployment would make newly true

| Claim | Today | After a deploy |
|---|---|---|
| **08-28 roadmap N2 exit** — *"an agent or human can discover, install, style and verify a component from published machine-readable surfaces alone"* | **unmeetable.** The surfaces exist and are unreachable: `llms.txt`, `llms-full.txt`, `/r/component-meta.json`, 191 registry items, 144 component pages, 6 evidence pages | **discover / style / verify become meetable.** **`install` does NOT** — it needs A4-D1, because `shadcn add` accepts the item and then `npm install` fails. **A deploy alone moves N2 from 0 of 4 to 3 of 4** |
| **Figma kit / Tokens Studio sync** (README §8, deferred `[!owner]` with *"S2-O3 is its precondition"*) | blocked | **unblocked.** It needs a public `dist/tokens.dtcg.json` to sync against, which the deploy serves |
| **08-11 doc 03 documentation contract** — *"the published site, manifests and package declarations must agree in CI"* | **vacuous** — there is no published site for anything to agree with | **enforceable.** `docs:verify` is the agreement check; the pipeline is its CI half |
| **`validate:component-meta`'s reachability clause** | a **static proxy**: it asserts `build-registry.ts` copies `component-meta.json` into `/r/`. It never fetches | an **HTTP probe becomes possible** for the first time. Adding one is a follow-up, not a precondition |
| **MCP HTTP mode** — `@dzup-ui/mcp`'s `RegistryClient` reading `/r/component-meta.json` over HTTP | code path exists, **has no origin to read** | exercised for real |

### 3.2 One gate silently depends on the site being unreachable

**`scripts/check-external-links.mjs:50`**:

```js
['dzup-ui.com', 'canonical origin, deploy pending'],
```

`yarn check:links` exits **0** today having **skipped four `dzup-ui.com` URLs**
with the note *"canonical origin, deploy pending"*. That allowlist entry is
correct while the domain is NXDOMAIN and becomes a **hole the moment the site is
live**: the gate would keep printing green while never once fetching the origin
the whole project points at. **Removing that entry is step 8 of §4 and is not
optional.**

A second, softer instance on the same line-block: `www.npmjs.com/package/@dzup-ui/core`
is allowlisted with the reason *"returns 403 to scripted requests"*. At `4e4e46f`
that URL returns **404**, because the package does not exist. The reason is stale
in a direction that hides A4-D1 from the link gate. Fix it when A4-D1 is taken.

---

## 4. The runbook

Steps 1–4 are the owner's **decisions and account actions**; 5–7 are mechanical
and safe; 8–11 are the publish and its verification. **Every irreversible step is
marked.** Nothing before step 9 is publicly visible.

| # | Command / action | Expected artifact | Publicly visible? | Rollback |
|---|---|---|---|---|
| 1 | **Answer A4-D1** (register row 1) — publish 0.x, prerelease-only, or freeze | a recorded decision | no | n/a — but see below: (a) and (b) claim npm names **irreversibly** |
| 2 | If A4-D1 ≠ freeze: publish, then **record the probe** the registry gate reads:<br>`node -e "const {execFileSync:e}=require('child_process');const p=['@dzup-ui/contracts','@dzup-ui/core','@dzup-ui/mcp','@dzup-ui/nuxt','@dzup-ui/testing','@dzup-ui/tokens'];const o={sourceCommit:e('git',['rev-parse','HEAD']).toString().trim(),probedAt:new Date().toISOString(),registry:'https://registry.npmjs.org',packages:{}};for(const n of p){try{o.packages[n]=e('npm',['view',n,'version'],{stdio:['ignore','pipe','ignore']}).toString().trim()}catch{o.packages[n]=null}}require('fs').writeFileSync('docs/qa/release/'+o.sourceCommit.slice(0,7)+'/npm-resolution.json',JSON.stringify(o,null,2))"` | `docs/qa/release/<sha>/npm-resolution.json` | **yes — a publish is irreversible** (npm names, version levels) | unpublish windows are narrow and partial; treat as one-way |
| 3 | **Answer D166** — register `dzup-ui.com` (recommended), or pick (b)/(c) | a domain you control, or a decision to move `SITE_ORIGIN` | **yes — a registration is public** | let it lapse; but if (c) was chosen, `SITE_ORIGIN` and 282 `/r/**` files must be regenerated first |
| 4 | **Answer D165 / D167 / D168 / D169** and create the hosting project | a Pages project, no custom domain attached yet | no (an unattached project has an ugly default URL, not an indexed one) | delete the project |
| 5 | `git status --porcelain \| wc -l` → **commit the tree first** (register row #2 ≡ D127) | a commit anyone can check out | no | `git revert` |
| 6 | `yarn install --immutable` | `node_modules` | no | n/a |
| 7 | `yarn docs:verify --require-installable` | exit **0**; the log prints the artifact's bytes **against its declared budget**, the registry resolution ledger, and the freshness verdict | no | n/a — **if this is non-zero, stop.** It is the whole point of the lane |
| 8 | **Remove the `deploy-pending` allowlist entry**: delete `['dzup-ui.com', 'canonical origin, deploy pending'],` from `scripts/check-external-links.mjs:50`, then `yarn check:links` | exit 0 having actually fetched the origin — **it will fail until step 9 completes, which is correct** | no | restore the line |
| 9 | Write and dispatch `.github/workflows/docs-deploy.yml` per D167, whose build half is: contracts → tokens → core build · `yarn storybook:build` · `yarn workspace @dzup-ui/landing build` · `yarn docs:verify --require-installable` · assemble `apps/landing/dist/` + `apps/docs/.vitepress/dist/` → upload | a live default-host URL | **yes — the content is public but not yet at your domain** | delete the deployment; nothing is indexed under your name yet |
| 10 | Attach the custom domain and the `_headers` file per D168 | `https://dzup-ui.com` serving `/`, `/storybook/`, `/docs/` | **yes — IRREVERSIBLE in practice: search engines and AI crawlers will index it, and `shadcn add` copies `SITE_ORIGIN` into consumer repositories permanently** | detach the domain; **the index and any consumer copy survive** |
| 11 | Post-deploy verification, in order: `curl -fsS https://dzup-ui.com/llms.txt > /dev/null; echo $?` · `curl -fsS https://dzup-ui.com/r/component-meta.json > /dev/null; echo $?` · `curl -fsS https://dzup-ui.com/docs/components/DzButton.html > /dev/null; echo $?` · `yarn check:links` (now without the allowlist entry) · `curl -sI https://dzup-ui.com/r/registry.json \| grep -i cache-control` | four exit-0s and a `max-age=300` on `/r/` | already visible | §5 |

**Not in this runbook, on purpose:** any credential, token or secret; any DNS API
call; the workflow file itself (step 9 writes it — an agent may not).

---

## 5. Rollback

| Situation | Action | Time | Residue |
|---|---|---|---|
| The deploy is wrong (broken page, missing asset, stale evidence) | **Re-run `docs-deploy` at the previous tag.** Every input is generated from the tree, so the tag *is* the artifact | one workflow run | none |
| Faster mitigation, Cloudflare only | Repoint the previous deployment in the Pages dashboard | ~60 s | the bad deployment stays in history |
| GitHub Pages | `git revert` the deploy commit and re-push, or re-run at the tag | one run | none |
| The site should not be public at all | **Detach the custom domain**, then delete the deployment | minutes | **the search index and any `shadcn add` copy already taken survive — this is the irreversible part** |
| A published package is wrong | **not a docs rollback.** See A4-D1; version levels cannot be re-levelled after publication | — | permanent |

**Write rows 1–2 into a release checklist.** At `4e4e46f` the word "rollback"
appears in exactly two files under `docs/`, both of them release-QA reports. A
drill nobody has written down is a drill nobody runs.

---

## 6. What the owner must supply — the short list

1. **A4-D1** — publish, prerelease, or freeze. Everything waits on it (register row 1).
2. **Does anyone own `dzup-ui.com`?** One lookup says no, at three names, from two
   resolvers. It is a registration, not an engineering task (**D166**).
3. **Which account owns the hosting project**, and whether "no new accounts" is a
   constraint — that single answer decides **D165** and therefore **D168**
   (**D165**: Cloudflare Pages recommended; GitHub Pages is the honest
   zero-account answer with its cache row collapsed).
4. **Releases or `main`** as the deploy trigger (**D167** — releases recommended,
   because `ci.yml` has been red since 2026-07-03).
5. **Confirm the rollback drill** is "re-run `docs-deploy` at the previous tag"
   and have it written into the release checklist (**D169**).

Everything else is done: the artifact is inside a declared budget, the registry
is under a gate that has been watched to fail on eight seeded defects, the build
is bound to its inputs, and the whole pre-deploy sequence is **one command** —
`yarn docs:verify --require-installable`.
