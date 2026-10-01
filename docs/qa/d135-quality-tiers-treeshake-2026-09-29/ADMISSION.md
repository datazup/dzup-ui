# Admission — DZUP-UI-D135-QUALITY-TIERS-TREESHAKE-20260929-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-D135-QUALITY-TIERS-TREESHAKE-20260929-R1 (first cut from the D135 size-growth investigation) |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `297100bbb5ce776b3b3c3adc723aa0ae97955205` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-d135-quality-tiers-treeshake-20260929` |
| Branch | `d135-quality-tiers-treeshake-20260929` |
| Plan reference | Open owner decision **D135** (size budgets, `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md`); measured in `docs/qa/lucide-tooling-hygiene-2026-09-28/EVIDENCE.md` (20/22 budgets over) |
| Authorisation | Operator, 2026-09-29: "do proceed as suggested next steps". The suggested step was to find what grew in the biggest cases and cut it. |

## Authority classes

| Class | Granted |
|---|---|
| Candidate commit | yes, on the branch above |
| Local integration | yes, fast-forward of canonical `main` under the integration lane |
| Push | yes, `refs/heads/main` only, after `ls-remote` still equals the base (or a rebase re-gated on the new base) |
| Cleanup | yes, this packet's own worktree and branch only |
| Baseline rewrite (`packages/core/perf/baselines.json`), budget change, D135 decision | **no** — owner |
| Production, publish, tag, secrets, branch protection | **no** |

## Investigation (read-only, before any edit)

Two temporary Storage clones were built: one at the baseline commit `8d80bc3`,
one at the base above. Each built a one-export fixture per budgeted component
(same aliases and externals as `perf/export-sizes.ts`), and rollup's
per-module `renderedLength` was diffed.

- Growth in DzMention (+21.5 KB rendered) and DzDataView (+13.4 KB rendered)
  comes from deliberate programme work:
  - the ICU plural formatter `i18n/message-format.ts` (7.2 KB, TASK-R5-O4) and
    catalog growth in `i18n/messages.ts`;
  - async options (`DzOptionsState.vue`, `useAsyncOptions.ts`) and DzMention's
    own growth;
  - the locale, direction and environment provider hooks.

  None of it is removable without an owner product decision.
- **One defect.** `packages/contracts/src/quality-tiers.ts` (evidence, AT and
  WCAG tables used only by tooling) ships in **every** component bundle that
  imports any runtime value from `@dzup-ui/contracts`. That is 2837 rendered
  bytes, about 680 gzip. No runtime code reads it. It is retained because the
  top-level initialiser `new Set(WCAG_22_CRITERIA.map(c => c.id))` is a call the
  bundler cannot prove pure. A `/* @__PURE__ */` on the `new` alone does not
  fix it, because the `.map()` argument is still kept (unminified output
  inspected). Wrapping the initialiser in a pure-annotated IIFE drops the whole
  module.

## Scope

1. `quality-tiers.ts`: make `WCAG_CRITERION_IDS` a pure-annotated IIFE, with a
   comment giving the reason. The value and type are unchanged.
2. `tree-shake-check.ts`: fail when tooling-only contract data appears in a
   single-component bundle. The marker is a string literal that exists only in
   `WCAG_22_CRITERIA`.
3. A patch changeset for `@dzup-ui/contracts`, then `build:releases`.

## Allowed paths

- `docs/qa/d135-quality-tiers-treeshake-2026-09-29/ADMISSION.md`, `EVIDENCE.md`
- `packages/contracts/src/quality-tiers.ts`
- `packages/tooling/src/tree-shake-check.ts`
- `.changeset/contracts-quality-tiers-tree-shakes.md`
- `apps/landing/src/generated/releases.ts`, `apps/landing/public/feed.xml` (only if `build:releases` changes them)

## Acceptance

1. **Negative control.** `yarn validate:tree-shake` fails at the base with the
   new guard, and passes with the fix.
2. The 22 budgeted export sizes each fall by roughly 660–710 bytes gzip.
   Report which budgets go back under threshold. Baselines are not rewritten.
3. The contracts unit tests for `WCAG_CRITERION_IDS` still pass; `yarn
   typecheck`, `yarn lint` and `yarn validate:all` pass; tooling unit tests
   pass; `build:releases` leaves no diff after the commit.
4. The pushed commit's CI run is green.

## Deferred

- **D135 itself:** raising or keeping the 17 budgets that remain over after
  this cut (owner).
- Making the ICU formatter lazy or compiled at build time is a design change.
  It would be the next-largest shared saving (about 2.5 KB gzip in every
  component with text), and would need an owner decision.
