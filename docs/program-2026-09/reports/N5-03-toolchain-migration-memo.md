# Toolchain migration schedule — Vitest browser mode, tsdown / Vite 8, and the rest

> **TASK-N5-03**, dzup-ui System Program 2026-09, N5 (release & toolchain).
> **Scheduled, not executed.** Nothing in this memo has been performed. Every
> track below states what would change, what it would break, and the condition
> that starts it — so that a migration begins because its trigger fired, not
> because somebody noticed a yellow `npm outdated` line.
>
> **Every version number here was read from the npm registry on 2026-09-03** and
> is bound to that date. A version claim with no date is a claim about whenever
> you happen to be reading it.
>
> Companion: `N5-03-toolchain-currency-handoff.md` (what *was* executed).

---

## 0. Where the toolchain actually is

| Package | This repo | Latest (2026-09-03) | Distance |
|---|---|---|---|
| `vue` | 3.5.31 | 3.5.42 (`rc`: 3.6.0-rc.6) | 11 patches; one minor pending |
| `vite` | 7.3.5 | **8.2.2** (`previous`: 7.3.6) | **one major behind** |
| `vitest` | 3.2.6 (pinned by `resolutions`) | **5.0.0** (4.x ended at 4.1.11) | **two majors behind** |
| `@vitest/browser` | 3.2.6 (pinned) | 5.0.0 | two majors behind |
| `vue-tsc` | ^3 → 3.x | 3.3.11 | current line |
| `vue-component-meta` | **3.3.7 exact** | 3.3.11 | 4 patches |
| `@nuxt/kit` | **4.5.2** (this packet) | 4.5.2 | current |
| `nuxt` (dev + fixtures) | 4.4.5 / `^3.19.0` | 4.5.2 | see §4 |
| `tsdown` | **not used** | 0.22.14 | adoption, not upgrade |
| `@playwright/test` | 1.61.1 | — | not in scope here |
| Node floor | `^20.19.0 \|\| >=22.13.0` | — | see §4 and §6 |

**N5-03-M1 — the task named "Vitest 4" and Vitest 4 is already over.** The 4.x
line ended at `4.1.11`; `latest` is `5.0.0`. Scheduling a migration to 4 would
schedule a migration to a line that receives no further features. Track A is
therefore written against **5.0.0**, and the fact that the packet's own brief
was one major stale is itself the argument for the review cadence in §7.

---

## 1. What is *not* being scheduled, and why

Naming the non-goals first, because an unbounded migration memo becomes a
wish-list nobody reads.

- **A Vue 3.6 upgrade.** The forward-compat lane (§3) *tests* 3.6; it does not
  adopt it. Adoption is a separate act with its own trigger.
- **A `vue-component-meta` bump.** §6. It is the single most expensive pin in
  this repository and it moves on its own schedule.
- **Anything that changes a published package's version.** This memo authorises
  no release.

---

## 2. Track A — Vitest 3.2.6 → 5.x, and browser mode

### Current state

`vitest` and `@vitest/browser` are pinned **exactly** in the root
`resolutions` (`3.2.6`), not merely ranged. Browser mode is real and in use, in
exactly one place:

- `apps/storybook/vitest.config.ts` — `browser: { instances: [{ browser: 'chromium' }] }`,
  driven by `@storybook/addon-vitest` 10.5.1 under Storybook 10.5.1.

Everything else — 499 unit and contract test files — runs in **jsdom 29**.

### What a move to 5.x actually touches

Ordered by how likely it is to be the thing that stops the migration:

1. **Storybook is the constraint, not Vitest.** `@storybook/addon-vitest@10.5.1`
   declares which Vitest majors it supports. The repository cannot hold Vitest 5
   and Storybook 10.5.1 unless that addon supports 5. **This is the first thing
   to check and the most likely blocker**, and it is why "upgrade Vitest" is
   really "upgrade Storybook and Vitest together".
2. **The exact pin is load-bearing.** The `resolutions` block pins three
   packages to `3.2.6` — an exact pin in a monorepo that also installs Storybook's
   own Vitest is what keeps *one* Vitest in the tree. Two Vitest majors in one
   `node_modules` produce failures in the pool/worker layer that read as test
   flakes. Any migration moves all three together or not at all.
3. **jsdom 29 → the browser provider.** Vitest 4 moved browser mode's provider
   API and deprecated `webdriverio` in favour of Playwright-based providers.
   This repository already installs `@playwright/test` 1.61.1, so the provider
   is available; the work is config, not a new dependency.
4. **`environment: 'jsdom'` is not going away** and should not. See the risk
   below.

### Risk

- **HIGH — the coverage thresholds are enforced in CI.** `vitest.config.ts`
  carries a global package bar *and* a measured active-app ratchet, and the
  `coverage` job gates PRs on them. A v8-coverage change between majors moves
  measured percentages without a line of source changing, and the ratchet would
  read that as a regression. **Any Vitest major upgrade must re-measure the
  ratchet in the same change**, with the old and new numbers both recorded —
  never silently re-baselined.
- **MEDIUM — jsdom is where the accessibility evidence lives.** 499 files, plus
  the a11y sweep. A migration that "moves the suite to browser mode" is not a
  toolchain upgrade, it is a re-platforming of every piece of unit-level
  evidence this repository holds, and it would invalidate the maturity level of
  every component at once. **Not scheduled. Browser mode stays where it is.**
- **MEDIUM — `vitest-axe@0.1.0`** is a 0.x dependency on Vitest's expect
  extension API. It is the most likely small thing to break and the least likely
  to be fixed upstream quickly.
- **LOW** — the VTU/jsdom interaction recorded elsewhere in this program
  (`trigger('pointerdown', { button, clientX })` not setting mouse properties
  under jsdom 29) is a *jsdom* behaviour, not a Vitest one, and does not move
  with this track.

### Trigger conditions

Start Track A when **either**:

- **A1** — `@storybook/addon-vitest` ships a release declaring support for
  Vitest 5, **and** the repository's Storybook is on a version that carries it; or
- **A2** — a security advisory lands against `vitest@3` or a package in its
  worker/pool chain that has no 3.x backport.

Do **not** start it because 3.2.6 is "old". A pinned, green, fully-measured test
runner two majors behind is a smaller liability than a re-measured coverage
ratchet nobody trusts.

### Exit condition

`yarn test`, `yarn test:contracts`, `yarn test:a11y`, `yarn test:ssr`,
`yarn test:coverage` and the Storybook `storybook-test` job all green, **with the
coverage ratchet re-measured and both numbers recorded in the changeset**.

---

## 3. Track B — Vite 7 → 8, and tsdown

These are one track because they are one decision: **what builds the packages.**

### Current state

Two build tools already, split by whether a package ships Vue:

- `vite build` — `@dzup-ui/core`, `@dzup-ui/tokens`, `@dzup-ui/compat`
  (`packages/core/vite.config.ts`, `vite-plugin-dts@^4.5.4`).
- `tsc` — `@dzup-ui/contracts`, `@dzup-ui/testing`, `@dzup-ui/mcp`,
  `@dzup-ui/codemods`, `@dzup-ui/nuxt`.

**`tsdown` is not installed and is used nowhere.** Track B's tsdown half is an
*adoption*, and adoptions carry a burden upgrades do not: something has to be
better afterwards, not merely newer.

### What Vite 8 touches

- `@vitejs/plugin-vue@^6`, `vite-plugin-dts@^4.5.4`, `@storybook/builder-vite`
  (via Storybook 10.5.1), `apps/landing`, `apps/docs` (VitePress), and the
  `vitest/config` re-export that the root `vitest.config.ts` imports. **Vitest
  and Vite move together**: `vitest@3.2.6` is built against Vite 5–7. Vite 8
  therefore *implies* Track A, which implies the Storybook constraint.
- `validate:engines` reads the **installed** `engines` of `vite`, `vitest`,
  `eslint`, `tsx`, `typescript`, `jsdom` and `@playwright/test` and fails when
  the declared Node floor cannot satisfy them. Vite 8's floor is the single most
  likely thing to force the Node floor up — the same mechanism that produced
  ADR-18 when `vite@7` required `^20.19.0` against a declared `>=20.0.0`.
- `validate:bundle`, `validate:externals`, `validate:dts`, `validate:tree-shake`
  and `validate:bundle-budget` all read build output. A Rollup major inside Vite
  changes chunk boundaries; the budget check is the one that turns red.

### What tsdown would buy, and what it would cost

- **Buys:** one build tool instead of two; `.d.ts` generation without
  `vite-plugin-dts` (whose 4.x line is the least-maintained dependency in the
  build path); rolldown-speed builds.
- **Costs:** `packages/core` builds **Vue SFCs**, and the SFC path is exactly
  where a new bundler is least proven. ADR-12 commits `dist/` artifacts, so a
  bundler swap rewrites committed bytes for every package it touches — and
  `validate:dts` / `validate:exports` / `validate:externals` compare those bytes.
- **Recommendation: adopt tsdown for the `tsc`-built packages first** (contracts,
  testing, mcp, codemods, nuxt — no SFCs, smallest possible blast radius), and
  only consider `core` after that has been green for a full release cycle.
  Doing `core` first is the version of this migration that fails.

### Risk

- **HIGH** — Vite 8 + Vitest, coupled to Storybook's builder. Three majors that
  must land together or not at all.
- **MEDIUM** — committed `dist/` (ADR-12) churns under any bundler change; the
  diff will be large and unreviewable line by line, so the gates have to be the
  review.
- **LOW** — tsdown on the `tsc`-built packages. Reversible in one commit.

### Trigger conditions

- **B1** — Vite 7 leaves security support, **or** a dependency this repository
  needs drops Vite 7 support. Not "Vite 8 is out".
- **B2** — Track A completes. Vite 8 before Vitest 5 is a partial upgrade that
  holds two incompatible Vite majors in one tree.
- **B3 (tsdown, independent)** — the next time `vite-plugin-dts` blocks a
  `validate:dts` fix. That is the moment the second build tool starts paying for
  itself, and the moment to swap it on the five `tsc` packages.

---

## 4. Track C — the Nuxt floor

Executed in part by this packet: `@dzup-ui/nuxt` now depends on
`@nuxt/kit@4.5.2`. **The declared floor was not moved** — `peerDependencies.nuxt`
is still `>=3.0.0`, pending the `[!owner]` decision recorded in the handoff.

Two facts constrain the decision and both are measurements, not opinions:

- **`nuxt` <= 4.4.5** declares `engines.node: ^20.19.0 || >=22.12.0`.
  **`nuxt` >= 4.4.6** declares `^22.12.0 || ^24.11.0 || >=26.0.0`.
  This repository's declared floor is **20.19.0**, and `validate:engines`
  requires `.nvmrc`, `package.json` and every CI `node-version:` to agree on it.
  **A consumer fixture on `nuxt@^4` (which resolves to 4.5.2) cannot install on
  the Node this repository declares.** That is why the fixture matrix pins
  `4.4.5` exactly rather than a caret range.
- `@nuxt/kit` itself declares `>=18.12.0` at every 4.x. The *module* is
  Node-20-safe; only a consumer app installing modern `nuxt` is not.

### Trigger conditions

- **C1** — raise `peerDependencies.nuxt` to `>=4.0.0` when the Nuxt 3 fixture leg
  of `.github/workflows/vue-next.yml` goes red. Until it does, the module works
  on both and the floor should not be narrowed on principle.
- **C2** — raise the repository's **Node** floor to `>=22.12.0` when the fixtures
  need `nuxt` >= 4.4.6 (a security fix, or a feature the module depends on).
  That is an **ADR-18 amendment**, not a dependency bump: `.nvmrc`, `engines` in
  two `package.json` files and ~14 CI `node-version:` values move together or
  `validate:engines` fails.

---

## 5. Track D — Vue 3.6 and Vapor

The lane exists (`.github/workflows/vue-next.yml`,
`packages/tooling/scripts/vue-next-lane.mjs`) and is **advisory**.

### Trigger conditions

- **D1 — the lane becomes blocking the day `vue@latest` is `3.6.x`.** Mechanically:
  delete the two `continue-on-error: true` lines in `vue-next.yml` and move the
  `suite` job into `ci.yml`. Not before: a red RC is Vue's fact, not ours.
- **D2 — bump `dependencies.vue` from `^3.5.13` to `^3.6.0`** only after the
  lane has been green on a *stable* 3.6 for two consecutive scheduled runs. One
  green run is a sample of one.
- **D3 — the Vapor statement is re-verified on every promotion.** It is backed by
  a run, and a run is about the version it ran on. Moving to a new Vue minor
  invalidates the evidence, not the claim's plausibility — and the claim without
  the evidence is what this repository's evidence rules exist to refuse.

### Non-goal

**Compiling `@dzup-ui/core` in Vapor mode is not scheduled and is not intended.**
The library is a vDOM library. Vapor interop is the supported path and it is the
one that was verified.

---

## 6. Track E — the `vue-component-meta` pin

`vue-component-meta` is pinned **exactly** at `3.3.7`; `latest` is `3.3.11`.
TASK-N5-02 ranked it as the most sensitive pin in the repository, and the
reason is arithmetic:

`component-meta.json` is a projection of its output. **Five committed artifacts
are projections of `component-meta.json`**, and every one of them is byte-compared
by a gate:

| Artifact | Gate |
|---|---|
| `packages/core/docs/component-meta.json` | `validate:component-meta` |
| `packages/core/docs/llms.txt`, `llms-full.txt` | `validate:llms` |
| 144 `apps/docs/components/*.md` pages | `validate:docs-pages` |
| `apps/docs/public/playground/seeds.json` | `validate:playground-parity` |
| `apps/docs/.vitepress/generated/nav.json` | `validate:docs-pages` |

A patch bump to the extractor therefore rewrites five artifacts in one commit
and turns five gates red until every one is regenerated. **`vue-tsc` moves with
it** — both sit on `vue-language-core`.

**This is why the Vue 3.6 lane deliberately does not pin `vue-component-meta`.**
The lane tests a runtime; dragging the extractor in would make every run of it
look like a five-artifact regression, and a lane whose failures are all
self-inflicted is a lane people switch off.

### Trigger conditions

- **E1** — bump only when the extractor's output *needs* to change (a Vue
  language feature it cannot see, a `descriptionSource` defect), never for
  currency. Regenerate all five artifacts **in the same change** and state the
  diff shape in the changeset.
- **E2** — a Vue major/minor adoption (Track D, D2) forces it. Then it is part of
  that change, not a separate one.

---

## 7. Track F — the docs site has no size ceiling (N2-D3 finding D3-F10 / decision D3-D3)

Carried into this memo from TASK-N2-D3, which measured `apps/docs` `dist/` at
**29,822,709 B (29.82 MB)** and found it to be **the only static artifact in the
repository under no size gate at all**. Three consecutive packets grew it —
16.04 → 20.67 → 29.82 MB, **+44 % in the last step** — and 5.67 MB of that is REPL
machinery no page loads unless a reader presses a button.

It is scheduled here rather than executed because the missing piece is a
**number**, and a ceiling somebody invents is a ceiling that gets raised the
first time it fires.

### The mechanism already exists

`validate:bundle-budget` (`packages/tooling/src/bundle-budget-check.ts`) and the
`check-bundle-size` path already implement "measure an output directory, compare
to a recorded ceiling, fail upward". D1-F-4 recorded that the existing check
reads `storybook-static` **only**. Extending it to a second directory is a
config-shaped change, not a new gate.

### What it needs from an owner

- **F1 `[!owner]`** — the ceiling for `apps/docs/dist`. Candidates, all defensible:
  (a) today's 29.82 MB frozen as-is, so it can only fall; (b) 30 MB, a round
  number with ~0.6 % headroom; (c) 24 MB, which forces the REPL machinery to be
  split out or lazily fetched before the gate can go green. **(a) is the one to
  take if nobody wants to argue**: a downward-only ratchet at the measured value
  is the repository's existing idiom, and it stops the fourth consecutive growth
  without demanding a fix first.
- **F2** — whether the ceiling covers the whole `dist/` or excludes the REPL
  assets. Excluding them would gate the wrong bytes; including them means the
  first fix is to stop shipping 5.67 MB nobody asked for.

### Trigger

**Immediately available. This is the cheapest item in the memo** and the only one
with a finding, a mechanism and a measured number already in hand. It needs one
decision, not one investigation.

---

## 8. Ordering

```
Track F (docs size ceiling)   ── independent, do first, costs one decision
Track C (Nuxt floor)          ── independent, gated on a fixture leg going red
Track E (vue-component-meta)  ── independent, event-driven, never for currency
Track D (Vue 3.6)             ── independent until D2, then feeds Track E
Track A (Vitest 5)            ── BLOCKED BY @storybook/addon-vitest
        └── Track B (Vite 8)  ── BLOCKED BY Track A
            └── tsdown (B3)   ── independent of both, if scoped to the tsc packages
```

The two expensive tracks (A, B) are both blocked on a third party. The three
cheap ones (F, C, E) are blocked on decisions this repository can make today.
**That asymmetry is the memo's main finding**: the toolchain being "two majors
behind" is not currently actionable, while three items that *are* actionable
have been waiting on nobody.

---

## 9. Review cadence

Re-read this memo when a trigger fires, and **re-run its version table on the
first Monday of each quarter**. `N5-03-M1` is the argument: the packet that
commissioned this memo named a Vitest major that had already been superseded,
because the last time anybody checked was long enough ago to matter.

---

## 10. What this memo refuses to imply

- **It does not say the toolchain is unsafe.** Two majors behind on a pinned,
  green test runner is a supportable position and this memo recommends holding it.
- **It does not authorise any of these migrations.** Each track states a trigger
  precisely so that starting one without the trigger is visibly a departure.
- **It does not claim any of these was attempted.** No Vitest, Vite, tsdown or
  `vue-component-meta` change was made, tried, or benchmarked by TASK-N5-03.
  Every version number is a registry read, not a run.
- **It does not price the work.** Nothing here carries an estimate, because an
  estimate for a migration blocked on a third party's release is a guess wearing
  a number.
