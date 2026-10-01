# Admission — DZUP-UI-LUCIDE-TOOLING-HYGIENE-20260928-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-LUCIDE-TOOLING-HYGIENE-20260928-R1 (review findings 1–4 of 2026-09-28) |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `15d789bd18b62ddaa2be61fa57534f2916f96fb2` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-lucide-tooling-hygiene-20260928` |
| Branch | `chore/lucide-tooling-hygiene-20260928` |
| Plan reference | Follow-up to the icon swap (`docs/qa/icon-swap-2026-09-26/ADMISSION.md`, D174) and to the ADR acceptance (`94621fb`, D188); read-only review of landed ui/** work, 2026-09-28 |
| Authorisation | Operator, 2026-09-28: "do proceed with recommendation and improve ui/*" |

## Authority classes

| Class | Granted |
|---|---|
| Candidate commit | yes, on the branch above |
| Local integration | yes, fast-forward of canonical `main` under the integration lane |
| Push | yes, `refs/heads/main` only, after `ls-remote` still equals the base (or a rebase re-gated on the new base) |
| Cleanup | yes, this packet's own worktree and branch only |
| Production, publish, tag, secrets, branch protection | **no** |

## Outcome

The perf and peer-surface tooling measures the icon library core actually
ships (`@lucide/vue`), so the next `perf:capture` does not report icon code as
a size regression and the peer-surface report stops reading "0 glyphs"; the
accepted ADRs and a few comments stop contradicting the repository.

## Measured before any edit (at the base)

- `packages/core/dist` imports `@lucide/vue` 22 times and `lucide-vue-next` 0.
- `lucide-vue-next` is still the external/matched name in
  `packages/tooling/src/perf/export-sizes.ts:34`,
  `packages/tooling/src/tree-shake-check.ts:70` and
  `packages/tooling/src/peer-surface.ts:85,264,274`.
- ADR-18 (§A5, closing Status), ADR-19 (Rollout 1, §A4) and ADR-20 (Rollout 1,
  §A8.7, closing Status) still say the ADR "remains `Proposed`"; the `Status:`
  lines say Accepted (owner, 2026-09-26).
- `apps/landing/vite.config.ts:35` says "3002+" (port is 5299);
  `apps/landing/playwright.config.ts:28` calls 3001 the default.
- `packages/tooling/src/validators/peer-icon-duplicates.ts:4-5` and its spec
  header describe the pre-swap state.
- `@dzup-ui/codemods` ships a `bin` and declares no `engines`
  (`@dzup-ui/mcp` declares `^20.19.0 || >=22.13.0`, the ADR-18 floor).

## Scope

1. Replace `lucide-vue-next` with `@lucide/vue` in the three tools; update the
   peer-surface spec fixtures to the shipped name.
2. ADRs: the two Rollout lines state the accepted status; each dated "remains
   Proposed" passage gets a dated superseded note (history is not rewritten).
3. Comments in the two landing configs and the icon-duplicates header/spec.
4. `packages/codemods/package.json` `engines.node` = the ADR-18 floor; `patch`
   changeset; `build:releases`.

## Allowed paths

- `docs/qa/lucide-tooling-hygiene-2026-09-28/**`
- `packages/tooling/src/perf/export-sizes.ts`, `packages/tooling/src/tree-shake-check.ts`
- `packages/tooling/src/peer-surface.ts`, `packages/tooling/src/peer-surface.spec.ts`
- `packages/tooling/src/validators/peer-icon-duplicates.ts`, `.spec.ts`
- `docs/adr/ADR-18-runtime-floor-and-validator-runner.md`, `docs/adr/ADR-19-public-styling-contract.md`, `docs/adr/ADR-20-provider-contract.md`
- `apps/landing/vite.config.ts`, `apps/landing/playwright.config.ts`
- `packages/codemods/package.json`, `.changeset/codemods-declares-its-node-floor.md`
- `apps/landing/src/generated/releases.ts`, `apps/landing/public/feed.xml`

## Acceptance

1. `rg -n "lucide-vue-next" packages/tooling/src/perf packages/tooling/src/tree-shake-check.ts packages/tooling/src/peer-surface.ts` → 0.
2. `peer-surface` over the built core reports a non-zero `@lucide/vue` module and glyph count.
3. `perf:capture` (or `export-sizes` alone) compared with `packages/core/perf/baselines.json` shows no icon-driven regression; baselines are not rewritten.
4. `validate:adr-references` passes (3 Accepted, ceiling 0); tooling unit tests, `yarn lint`, `yarn typecheck`, `validate:all` pass; `build:releases` leaves no diff after the commit.
5. The pushed commit's CI run is green.

## Deferred

- The landing commercial-templates snapshot (1 → 68 templates is a visible
  product change; owner decides what the gallery lists).
- dzup-templates items (layout gate in CI, re-vendoring core) and the
  dzup-ui-pro peer range; Release-vs-CI gating (owner).
