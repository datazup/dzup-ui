# Admission — DZUP-UI-ADR-ACCEPT-LHCI-RUNS-20260926-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-ADR-ACCEPT-LHCI-RUNS-20260926-R1 |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `843ffad7f4a6e03112c28c894d5c51965e4514ae` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-adr-lighthouse-20260926` |
| Branch | `chore/adr-accept-lighthouse-runs-20260926` |
| Authorisation | Owner, 2026-09-26, answering three questions: "Accept all three" (ADR-18, ADR-19, ADR-20) and "5 runs instead of 3" (Lighthouse). The third answer, the visual-lane container (O6-D2 option b), is a separate packet |

## Part 1 — accept ADR-18, ADR-19, ADR-20 (owner decision D188)

Applies `docs/qa/adr-prep-2026-09-26/ACCEPTANCE.md` as written:

- each ADR's `Status:` line becomes `Accepted (owner, 2026-09-26; proposed by …)`,
  keeping the existing proposal text;
- `maxProposedCitedFromCode` in `packages/tooling/scripts/adr-registry.json`
  goes from 3 to 0.

Criterion C1 moves from 0/3 to 3/3.

**Amendment A1 (same day, before the ADR commit).** The prescribed wording
failed the gate: `yarn validate:adr-references` still counted 3 Proposed.
`readStatus` checked `ADR_STATUSES` in declaration order, so `proposed by …`
matched `Proposed` before `Accepted`. The function's own comment says it "takes
the first status word". It now does, by position, and a spec case pins that.
The two files are added to the allowed paths.

## Part 2 — Lighthouse: 5 runs per URL instead of 3

The mobile `/templates` LCP gate is flaky, not regressed. Identical code measured:

- `cc13194`: median 3376 ms, a pass;
- `fb9689c`: 4032, 4185 and 4561 ms, a fail;
- `843ffad`: a pass;
- pre-swap `e168748`: median 3862 ms.

The LCP element is a text `<p>`, and about 88% of its LCP time is render delay
on a client-rendered page. `maxNumericValue` is asserted on the best run, so
more runs cut the flake rate without moving the 4000 ms ratchet. Both configs
move to 5 runs together, because the file header requires the same run count.
`lighthouserc.spec.ts` gains an assertion that pins this, so the counts
cannot drift apart.

This is a small loosening, because one fast run in five now suffices. The owner
accepted that. The ceiling itself is unchanged and may still only move down.

## Allowed paths

- `docs/adr/ADR-18-runtime-floor-and-validator-runner.md`
- `docs/adr/ADR-19-public-styling-contract.md`
- `docs/adr/ADR-20-provider-contract.md`
- `packages/tooling/scripts/adr-registry.json`
- `packages/tooling/scripts/validate-adr-references.ts`, `validate-adr-references.spec.ts` (A1)
- `apps/landing/lighthouserc.json`
- `apps/landing/lighthouserc.mobile.json`
- `apps/landing/src/lighthouserc.spec.ts`
- `.github/workflows/ci.yml` (comment only)
- `docs/qa/owner-decisions-r2-2026-09-26/**`

## Acceptance

- `yarn validate:adr-references` and `yarn validate:all` pass.
- The spec `apps/landing/src/lighthouserc.spec.ts` passes.
- CI on the pushed head is green, Landing Perf included.

## Authority

| Class | Granted |
|---|---|
| Candidate commit, local integration, push `refs/heads/main` | yes |
| Cleanup of this packet's worktree and branch | yes |
| Publish, tag, secrets, PR #3 merge, production | **no** |
