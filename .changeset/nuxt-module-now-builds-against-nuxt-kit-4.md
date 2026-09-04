---
"@dzup-ui/nuxt": minor
---

**`@dzup-ui/nuxt` now depends on `@nuxt/kit@4.5.2` instead of `3.14.0`.** If you install this module, `@nuxt/kit` 4 arrives in your dependency tree — including on a Nuxt 3 project.

`TASK-N5-03`. `minor`, which under `packages/contracts/VERSIONING.md` is the
**breaking** position for a `0.x` package: a consumer on `^0.1.0` does not
receive this automatically, and that is the intent. A module quietly changing
which major of `@nuxt/kit` it drags into somebody's project is not a patch.

**What was verified, and on what.**

| Check | Result |
|---|---|
| `tsc --noEmit` against `@nuxt/schema` 4.4.5 | passes |
| `tsc --project tsconfig.json` (build) | passes |
| 46 unit tests (`packages/nuxt/src`) | pass |
| Consumer fixtures on `nuxt@4.4.5` | see below |
| Consumer fixtures on `nuxt@3.19.0` | see below |

Nothing in `src/module.ts` needed changing. Every kit API this module uses —
`defineNuxtModule`, `addComponent`, `useLogger`, `nuxt.options.css`,
`nuxt.options.build.transpile`, `nuxt.options.app.head.script`,
`nuxt.options.rootDir` — is unchanged between kit 3 and kit 4.

**The declared floor did NOT move.** `peerDependencies.nuxt` is still
`>=3.0.0`, and `meta.compatibility.nuxt` is still `>=3.0.0`. Narrowing them is
an owner decision (`N5-03-D2` in
`docs/program-2026-09/reports/N5-03-toolchain-currency-handoff.md`) and it should
be taken on evidence: the fixture lane now runs **both** majors
(`.github/workflows/vue-next.yml`, job `nuxt-majors`), so "does this still work
on Nuxt 3?" is answered by a run rather than by an assumption.

**A Node-floor fact that constrains the answer.** `nuxt` <= 4.4.5 declares
`engines.node: ^20.19.0 || >=22.12.0`; `nuxt` >= 4.4.6 declares
`^22.12.0 || ^24.11.0 || >=26.0.0`. This repository declares `^20.19.0 || >=22.13.0`
and CI runs 20.19.0, so the fixtures pin `4.4.5` exactly rather than `^4`.
Moving to a newer Nuxt 4 is an **ADR-18 amendment**, not a dependency bump.
