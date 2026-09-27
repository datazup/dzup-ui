# Docs-site deployment packet — 2026-09

> **TASK-R1-O5**, `[!owner deploy]`. Prepared 2026-09-21 against `main` @
> `527dbd1` plus this task's uncommitted work. Every number below is measured
> at that commit and named with the command that produced it.
>
> **Nothing in this packet has been executed.** No DNS record was created, no
> hosting account was opened, no deploy workflow was written or run, and no
> request was made to `dzup-ui.com` expecting it to answer. The engineering
> that makes a deploy *legal* — a size ceiling on the artifact and a gate on the
> registry it serves — is done and green (§6). What remains is five decisions
> only the owner can take, and they are the whole of §2.

---

## 1. What exists today, measured

| Fact | Value at `527dbd1` (2026-09-21) | How it was measured |
|---|---|---|
| Docs site artifact | **34,730,981 B (33.12 MB), 510 files** | `yarn docs:build` then `yarn validate:docs-size` |
| Storybook artifact | **26,232,563 B (25.02 MB), 425 files** | `yarn validate:docs-size` |
| Landing artifact, excluding its Storybook mount | **≈ 16.7 MB** — 6.39 MB `og-templates`, 4.63 MB `assets`, 2.81 MB `r`, 2.31 MB `templates`, 0.55 MB `llms*.txt` | `du -sb apps/landing/dist/*` on a **2026-08-28** local build — stale, and the only one on this machine. Not a citable figure; see **D170** |
| Whole deploy payload, one origin | **≈ 76 MB** (33.12 docs + 26.23 Storybook + ≈16.7 landing) | sum of the above |
| Registry served under `/r/` | **282 files** — 3 indexes, 191 items, 401 installable files, 87 markdown mirrors, 1 stylesheet | `yarn validate:registry` |
| `dzup-ui.com` | **NXDOMAIN** — the apex and `www` both fail to resolve | `nslookup dzup-ui.com`, `nslookup www.dzup-ui.com`, 2026-09-21 |
| `datazup.com` | resolves, `213.199.40.69` | `nslookup datazup.com`, 2026-09-21 |
| Git remote | `git@github.com:datazup/dzup-ui.git` | `git remote -v` |
| Deploy automation | **none.** 8 workflows (`ci`, `chromatic`, `landing-e2e-snapshots`, `min-peer`, `publish-prerelease`, `release`, `validate-min-runtime`, `vue-next`); not one has a Pages, upload-artifact-to-host or DNS step | `grep -rn 'pages\|deploy' .github/workflows/*.yml` |
| npm | every `@dzup-ui/*` package 404s (**A4-D1**, unchanged) | `registry-evaluation-2026-09.md` §S1; re-stated by `validate:registry`'s standing report line |

### 1.1 The origin is already baked into distributed artifacts

`https://dzup-ui.com` is authored **once**, in `apps/landing/src/origin.ts`
(`SITE_ORIGIN`), and that module's own header records why: the host previously
shipped as seven literals naming a `.dev` variant nobody owns. It is then
stamped, at build time, into:

- the `homepage` field of all three `registry.json` indexes;
- the install command in all 87 block markdown mirrors and both `llms*.txt`;
- `sitemap.xml`, `feed.xml`, `<link rel="canonical">`, the OG image URLs;
- the `$schema` of every exported theme file and the `/themes` share-link.

That matters for **D166** in one specific way: a registry item is a
*distributed* artifact. The moment a consumer runs `shadcn add`, the origin we
published is copied into their repository and outlives any redirect we later
put up. Today nothing is distributed — the packages 404, so no `add` completes
(§S1 of the registry study) — so **the domain is still free to change at zero
cost, and it stops being free the day A4-D1 is decided "publish"**. That is the
ordering constraint on this whole packet.

### 1.2 The three artifacts are three sites, and nobody has said they are one

- `apps/landing` is a Vite SPA that **mounts the Storybook** at `/storybook/`
  (`apps/landing/vite/serve-storybook.ts`, `MOUNT = '/storybook'`; CI asserts
  `dist/storybook/index.html` exists via `check:storybook`, because a green
  landing build once deployed a 404 front door).
- `apps/docs` is a VitePress site with **no `base`** in
  `apps/docs/.vitepress/config.ts`, i.e. it currently assumes it is served from
  `/`. Serving it from `/docs/` is a one-line `base: '/docs/'` plus a rebuild —
  and, if it is to live inside the landing dist, a second mount plugin modelled
  on `serve-storybook.ts`. Neither has been written.

So "deploy the docs site" is not a single act. It is a choice about how many
origins this project has, and §2's **D166** is where that is taken.

---

## 2. The decision table

The shape the task asks for: one row per item, a recommendation, the
alternative that was actually considered, and what the owner has to supply.

| Item | Recommendation | Alternative | Owner input |
|---|---|---|---|
| **Host** (**D165**) | **Cloudflare Pages**, one project, built from a `docs-deploy` workflow | GitHub Pages from the same workflow · the existing `datazup.com` host (213.199.40.69) | Which account owns the project, and whether the org already pays for Cloudflare. GH Pages is free and needs no account, but see §3: it cannot set the cache headers §4 asks for, and its per-deploy artifact ceiling is uncomfortably close to a 76 MB payload that has grown 106 % in four packets |
| **Domain** (**D166**) | **Register `dzup-ui.com`**, serve the landing site at `/`, Storybook at `/storybook/`, docs at `/docs/` — one origin, `SITE_ORIGIN` unchanged, zero artifact churn | `docs.dzup-ui.com` as a second origin (needs no `base`, but splits the search index and the `/r/` path) · `datazup.com/ui/` (needs `SITE_ORIGIN` changed and **all 282 registry files plus both `llms*.txt` regenerated**) | **DNS authority for `dzup-ui.com`, and whether it is registered at all** — it is NXDOMAIN today, which is consistent with "never bought". This is the only item that cannot be prepared any further without the owner |
| **Workflow** (**D167**) | A new `.github/workflows/docs-deploy.yml`, `on: workflow_dispatch` **and** `on: push: tags: ['v*']`, that builds tokens → core → Storybook → landing → docs and uploads one merged directory. **Not** `on: push: main` | `on: push: main` (every merge is live) · manual upload | Whether the docs site tracks **releases** or **`main`**. Recommended: releases — the site documents a published API, and `ci.yml` has not been green since 2026-07-03 (TASK-R1-O4), so `main` is not currently a quality signal |
| **Cache** (**D168**) | Hashed assets (`/assets/*`, `/storybook/assets/*`) `Cache-Control: public, max-age=31536000, immutable`; HTML and `hashmap.json` `public, max-age=0, must-revalidate`; `/r/*.json` and `llms*.txt` `public, max-age=300` — they are an API, and a consumer's `shadcn add` should not get a day-old item | Host defaults everywhere (GH Pages: 10 min on everything, not configurable) | None, if D165 lands on a host that can set headers. If GH Pages, this row becomes "accept 10 minutes on immutable assets and no control over `/r/`" |
| **Rollback** (**D169**) | Re-run `docs-deploy` at the previous tag. Every input is generated from the tree, so the tag **is** the artifact; nothing needs to be stored | Keep the previous upload and repoint an alias (Cloudflare) · `git revert` and re-push (GH Pages) | Confirm the rollback drill is "re-run the workflow at `vX.Y.Z`" and that it is written into the release checklist, not remembered |

### 2.1 Why Cloudflare Pages over GitHub Pages

Stated plainly, because the recommendation is not free:

| | GitHub Pages | Cloudflare Pages |
|---|---|---|
| Cost | free | free tier covers this |
| Account needed | **none** — the repo already exists | yes, and someone owns it |
| Custom headers | **no** — fixed ~10 min cache on everything | yes, `_headers` file |
| Per-deploy size | 1 GB hard site limit; artifact upload is the practical ceiling and 76 MB is already large for it | 25 MB per **file**, 20 000 files per deploy — the 4.34 MB `jsx` chunk and 510+425 files are both comfortably inside |
| Preview deploys | via a second branch, hand-rolled | per-PR, built in |
| Rollback | re-run the workflow | re-run, or repoint a previous deployment |

GitHub Pages is the correct answer if the owner wants **zero new accounts** and
will accept D168 collapsing to "host defaults". It is not the correct answer
for `/r/*.json`, which is a machine-read API that a 10-minute blanket cache
governs badly in both directions.

---

## 3. What is *not* being recommended, and why

- **Deploying anything today.** The whole site advertises `npm i @dzup-ui/core`
  on every one of 144 component pages, 87 block mirrors, both `llms*.txt` and
  all 191 registry items, and that command fails with `E404`. Deploying before
  **A4-D1** (publish-or-freeze) is decided publishes a working site whose every
  call to action is broken — which is a worse state than NXDOMAIN, because
  NXDOMAIN is honest. **Recommended order: A4-D1 → D166 → D165 → D167.**
- **Buying a second domain for the docs.** It splits the offline MiniSearch
  index, duplicates the theme/cookie/`data-theme` surface, and gives `/r/`
  either a second home or a cross-origin fetch.
- **Serving the docs from `datazup.com/ui/`.** It works, and it costs a
  regeneration of all 282 registry files plus both `llms*.txt` because
  `SITE_ORIGIN` moves. Cheap today (nothing is distributed), not cheap after
  A4-D1.
- **A CDN in front of a static host.** Both recommended hosts are already one.

---

## 4. The cache policy in full

For whichever host D165 lands on. Paths are relative to the deployed root under
the single-origin layout of D166.

| Path | `Cache-Control` | Why |
|---|---|---|
| `/assets/*`, `/storybook/assets/*`, `/docs/assets/*` | `public, max-age=31536000, immutable` | Content-hashed by Vite/VitePress/Storybook. A new build writes a new name |
| `*.html`, `/docs/hashmap.json` | `public, max-age=0, must-revalidate` | The entry points. A stale HTML referencing a deleted hashed chunk is the classic post-deploy white screen |
| `/r/*.json`, `/r/**/*.json` | `public, max-age=300` | A machine-read registry. `shadcn add` should not install a day-old item, and it should not re-fetch 191 files per session either |
| `/llms.txt`, `/llms-full.txt`, `/r/component-meta.json` | `public, max-age=300` | Same argument: `@dzup-ui/mcp`'s `RegistryClient` reads `/r/component-meta.json` in HTTP mode (asserted by `validate:component-meta`'s reachability clause) |
| `/sitemap.xml`, `/feed.xml` | `public, max-age=3600` | Crawler inputs |
| `/docs/playground/*` | `public, max-age=31536000, immutable` | `dzup-core.mjs` (1.84 MB), `tokens.css`, `core.css` — rewritten only by a build, fetched only when a reader presses **Launch** |

---

## 5. The deploy workflow, described (not written)

Named here so D167 is a decision about a concrete thing. **This file does not
exist and was not created** — writing a workflow that deploys is inside the
`<no_deploy>` boundary.

```
name: docs-deploy
on:
  workflow_dispatch:
  push:
    tags: ['v*']

jobs:
  build-and-deploy:
    1. checkout, node from .nvmrc, yarn install --immutable
    2. yarn workspace @dzup-ui/contracts build
       yarn workspace @dzup-ui/tokens build
       yarn workspace @dzup-ui/core build          # Storybook consumes core/dist
    3. yarn storybook:build                        # enforces check:size --max-mb 26
    4. yarn workspace @dzup-ui/landing build       # mounts /storybook/, asserts check:storybook
    5. yarn docs:build                             # enforces validate:docs-size --require-dist
    6. yarn validate:registry                      # the 282 files are about to become public
    7. assemble: apps/landing/dist/ + apps/docs/.vitepress/dist/ → dist/docs/
    8. upload to the host chosen in D165
```

Steps 3, 5 and 6 are the point: **every gate this task built runs before a byte
is uploaded**, and each fails the deploy rather than reporting after it. The
build order in step 2 is not decoration — it is copied from `ci.yml`'s `landing`
job, whose comment records that skipping either build "once produced a green
landing build that deployed a 404 front door".

---

## 6. What TASK-R1-O5 already did, so the deploy is legal when it happens

| Gate | Status at `527dbd1` + this task's tree | Proof |
|---|---|---|
| `yarn validate:docs-size` | **green.** Docs dist ceiling 36,000,000 B (96.5 % used); Storybook ceiling 27,262,976 B (96.2 % used). Down-only, tolerance-bounded, `--require-dist` inside `yarn docs:build` | `packages/tooling/src/validators/docs-size.ts` · 14 specs, both failure modes driven |
| `yarn validate:registry` | **green**, and red on all **8** seeded defects | `yarn validate:registry --self-test` · `packages/tooling/src/validators/registry.ts` |
| A4-F4 (inert theme) | **closed.** `tokens.json` now carries a `css` block aliasing the dark scheme under `[data-theme="dark"]` inside `@layer dz-tokens` | `apps/landing/src/blocks/tokensItem.ts` · `validate:registry`'s `theme` clause |
| A4-F5 (Pro source) | **gated.** No item may name or import `@dzup-ui-pro` anywhere | `pro-source` clause, seeded |
| Bare HTML in descriptions | **12 → 0**, fixed in the source JSDoc, held at 0 by a ratchet | `descriptionsWithBareHtml` in `component-meta-ceilings.json` |
| D3-F8 (chrome not page-conditional) | **closed.** Shared `theme` chunk 59,482 → 53,752 B on every page; the chrome moved to page-local chunks loaded by the 129 pages that carry a playground | `apps/docs/.vitepress/theme/index.ts` · measured in the handoff §4 |

Remaining, and **not** this task's to take:

- **A4-D1** publish-or-freeze — gates everything above (TASK-R0-O1).
- **D170** — `apps/landing/dist` is the third publishable artifact and has no
  total-size ceiling. `check:bundle` measures first-paint gzip only. It was not
  seeded here because the only local build is from 2026-08-28 and a ceiling
  seeded from a stale artifact is a fabricated number.

---

## 7. One-page summary for the owner

1. **`dzup-ui.com` does not resolve.** Decide whether it is ours (**D166**).
   Until then nothing can be deployed anywhere the project's own artifacts
   point at.
2. **Decide A4-D1 first.** A live site whose every install command 404s is
   worse than no site.
3. **Then pick a host (D165), a trigger (D167), headers (D168) and a rollback
   drill (D169).** §2 has a recommendation and a costed alternative for each.
4. **The engineering is done.** The artifact is under a ceiling, the registry is
   under a gate that has been watched to fail, and the deploy workflow in §5 is
   eight steps of things that already work.
