# `src/generated/` — committed build artifacts

Every `.ts` module in this directory is written by a script in `apps/landing/scripts/`
and **committed to the repository**. Do not hand-edit them; edit the generator and
re-run it.

| File            | Generator                  | Script            |
|-----------------|----------------------------|-------------------|
| `components.ts` | `build-component-index.ts` | `yarn build:component-index` |
| `counts.ts`     | `build-counts.ts`          | `yarn build:counts` |
| `ogImages.ts`   | `build-og-images.ts`       | `yarn build:og`   |
| `liveStats.ts`  | `build-stats.ts`           | `yarn build:stats` |

(`componentIndex.spec.ts` is hand-written — it tests the generated `components.ts`.)

## Why committed rather than gitignored

Two independent reasons, and either alone is sufficient:

1. **They are imported by specs that run without a build.** The root
   `vitest.config.ts` includes `apps/*/src/**/*.spec.ts`, and CI's `test` job runs
   `yarn install && yarn test` with no generation step in between. `claims.spec.ts`
   statically imports `counts.ts` and `components.ts`; `router.head.spec.ts` imports
   `ogImages.ts`. Gitignore them and those specs cannot resolve their imports on a
   fresh clone.

2. **`liveStats.ts` is its own fallback.** `build-stats.ts` is deliberately
   fail-safe: when an API is down it reads the *previously committed* numbers and
   keeps them rather than regressing a real value to `null`. That degradation path
   only exists because the file is in the repo.

`counts.ts` and `ogImages.ts` were untracked until 2026-07-16 (TASK-FREE-18), which
made CI's `test` job structurally red on any fresh checkout.

## Drift

`components.ts`, `counts.ts` and `ogImages.ts` are pure functions of the source tree,
so CI regenerates them and fails on a diff — the same guard `packages/tokens/dist`
gets. Regenerate locally with `yarn build:counts` (etc.) and commit the result.

`liveStats.ts` is **not** drift-guarded: it depends on live GitHub/npm APIs, so a
legitimate refresh would fail the check. Its `generatedAt` only advances when a
metric actually changes, so it no longer churns on unchanged builds.
