# ADR-18 — Runtime floor and validator runner

- **Status:** Proposed (TASK-OSS-P2-01, 2026-08-20)
- **Supersedes:** the `engines.node: ">=20.0.0"` declaration in the root
  `package.json` and the matching claim in `CONTRIBUTING.md`

## Context

A contributor who satisfies `engines` must be able to run every mandatory gate.
Today they cannot, and nothing in CI would notice.

The declared floor is `>=20.0.0`. Measured against the dependencies the gates
actually load:

| Dependency | Declares `engines.node` | Used by |
|---|---|---|
| `vite@7.3.5` | `^20.19.0 \|\| >=22.12.0` | `yarn build`, `yarn storybook:build`, `yarn landing:build` |
| `jsdom@29.1.1` | `^20.19.0 \|\| ^22.13.0 \|\| >=24.0.0` | `yarn test` (the default vitest environment) |
| `eslint@9.39.4` | `^18.18.0 \|\| ^20.9.0 \|\| >=21.1.0` | `yarn lint` |
| `vitest@3.2.6` | `^18.0.0 \|\| ^20.0.0 \|\| >=22.0.0` | `yarn test` |
| `tsx@4.21.0` | `>=18.0.0` | every `validate:*` and `generate:*` script |

So on Node 20.0.0 — a version the repository claims to support — `yarn build`
and `yarn test` both fail on their own dependencies. Nobody has hit it because
every CI job requests `node-version: 20`, which `actions/setup-node` resolves to
the *latest* 20.x. **The floor is a claim CI never tests.** That is the defect;
the machine this was written on runs Node 24.14.1 and cannot reproduce it either.

Two related facts:

- Every `validate:*` and `generate:*` script already invokes TypeScript through
  `tsx`. None relies on `node file.ts` or `--experimental-strip-types`, so there
  is nothing to convert — only something to keep true.
- There is no `.nvmrc` or `.node-version`, so a contributor has no local signal
  at all.

## Decision

**1. The floor is `^20.19.0 || >=22.13.0`.**

It is the exact intersection of what the gates' own dependencies require, not a
round number. A bare `>=20.19.0` would additionally claim Node 21.x and 23.x,
which `jsdom` refuses; both are non-LTS and already end-of-life, so claiming
them would be false rather than generous.

Declared in three places, which must agree:

- root `package.json` → `engines.node`
- `packages/mcp/package.json` → `engines.node` (the only publishable package
  that declares one)
- `.nvmrc` → `20.19.0`, the **floor itself**, so a contributor using `nvm` runs
  the minimum rather than something newer that hides a floor break

**2. TypeScript in scripts runs through `tsx`, always.**

Native `.ts` execution (`node file.ts`, `--experimental-strip-types`) is not
used, because its availability and semantics vary across the supported range —
which is exactly the class of problem this ADR exists to close. A validator that
cannot *start* is indistinguishable from a repository with no gate.

**3. A `validate-min-runtime` CI job runs every documented gate at the floor.**

From a clean checkout, on the floor version only. A startup error
(`ERR_UNKNOWN_FILE_EXTENSION`, `SyntaxError`, `Unsupported engine`) fails the
job. This is what turns the floor from a claim into evidence.

**4. No threshold, validator, or test is weakened to make the job green.**

If a gate cannot run at the floor, the floor moves or the gate is fixed. The one
thing that must not happen is the gate being dropped from the preflight list.

## Consequences

- Node 20.0.0–20.18.x are no longer claimed. They never worked; this stops
  saying they did.
- Node 21.x and 23.x are explicitly not claimed.
- CI jobs pin `20.19.0` rather than floating `20`, so the floor is what gets
  exercised. The unit-test matrix keeps a second, current entry so the ceiling
  is covered too.
- `CONTRIBUTING.md` states the same range.

## For the owner: Node 20 is end-of-life

Node 20 left maintenance in **April 2026**; as of 2026-08-20 it receives no
security updates. This ADR keeps it in the floor because the evidence supports
it and dropping a major is a product decision, not a tooling one — but a floor
of `>=22.13.0` would be defensible today, and will be increasingly hard to argue
against. Recorded here rather than decided unilaterally.

## Alternatives considered

- **`>=22.12.0`** (the task's fallback). Cleaner, and drops an EOL major — but
  it is a support decision this packet has no authority to make, and `jsdom`
  would push it to `22.13.0` anyway.
- **Leave `>=20.0.0` and add the preflight.** The preflight would fail
  immediately, which is honest, but leaves the repository advertising a runtime
  its own dependencies reject.
- **Drop `engines` entirely.** Removes the false claim without replacing it, and
  gives contributors nothing.

## Validation hooks

- `yarn validate:engines` — the declarations agree with each other and with
  every dependency's own `engines`
- CI job `validate-min-runtime` — every gate starts and completes at the floor

---

## Amendments

### A1 — Decision 1 (the floor itself) is under revision. Three reports have answered it differently and none is binding. *(TASK-R0-O2, 2026-09-22)*

**This amendment does not change the floor.** It records that the floor is an
**open owner decision**, so that a reader of this ADR stops treating
`^20.19.0 || >=22.13.0` as settled. Three reports have recommended three
different answers, and the two most recent were written on the same day with
the later one explicitly differing from the earlier:

| Recommended | Source (cite by this path — `D<n>` ids are not unique across reports) | Reason given |
|---|---|---|
| **`>=22.13.0`**, and stop coupling the floor to the RTL list | `docs/program-2026-09/reports/N5-04-peer-hygiene-handoff.md` §3 (**N5-04 D3**, 2026-09-03) | This ADR already calls that floor "defensible today"; Node 20 left maintenance in April 2026 |
| **Keep `^20.19.0 \|\| >=22.13.0`** and fix the one offending import | `docs/program-2026-09-04/reports/TASK-R1-O4-handoff.md` §9 (**D160**, 2026-09-21) | One import in one spec; `^20.19.0` is what every consumer's `engines` check reads |
| **`>=22.13.0`**, with D160's fix as a legitimate interim | `docs/program-2026-09-04/reports/TASK-R1-O6-handoff.md` §9 and §7.3 (**D176**, 2026-09-21) | **Explicitly differs from D160**, in its own §7.3. Also **rejects `>=24.0.0`** — Node 22 LTS runs to April 2027 and a library floor excluding it is aggressive |

Consolidated as one contradiction in
`docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` §7. It is
**not resolved here**: TASK-R0-O2 is the ADR steward, not the owner of the
support policy, and Decision 1 keeps its current text until an owner answers.

### A2 — The declared floor is measurably false on its `20.x` branch *(TASK-R0-O2, 2026-09-22, from TASK-R1-O4)*

The Context section above says *"the floor is a claim CI never tests"*, and
predicts the class of break. The break has now been **measured**, and this ADR
should stop implying the floor is merely unverified:

`packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts:49` imports
`globSync` from `node:fs`. `fs.globSync` is `@since v22.0.0`
(`node_modules/@types/node/fs.d.ts:4442`). On any Node in the floor's `^20.19.0`
branch, `yarn test` fails with `TypeError: globSync is not a function`.
Evidence: `docs/program-2026-09-04/reports/TASK-R1-O4-handoff.md` §9 (**D160**).

Two consequences the same report records, and both bear on A1:

- **There has never been a green run on the 20.x floor.** Fixing one import
  restores the *claim* without the *evidence* (`TASK-R1-O6-handoff.md` §7.3).
- **One `@since v22` API reached the tree unnoticed because nothing runs on the
  floor.** A sweep is owed whichever way A1 goes. That is 1.0 criterion **C10**
  — "a floor nothing has run on is not a floor" — and it is currently **not
  met**.

### A3 — The floor must stop being coupled to the RTL language list *(TASK-R0-O2, 2026-09-22, from N5-04 D3 and D176)*

ADR-20 §4 justifies its checked-in RTL subtag list by saying
`Intl.Locale.prototype.getTextInfo()` is *"unavailable across this repository's
Node floor (`^20.19.0 || >=22.13.0`, ADR-18)"*, and that *"when the floor moves
past it, the list becomes a one-line delegation."*

**That prediction is wrong, on every floor under discussion in A1.**
`getTextInfo()` requires Node **24.0.0**; raising the floor to `>=22.13.0` does
not unlock it. ADR-20 §4 and its *Alternatives considered* entry are corrected
by ADR-20's own amendment **A1** in the same change as this one.

The consequence for *this* ADR is the part N5-04 D3 asked for: **the Node floor
and the RTL mechanism are independent decisions and must stop being argued as
one.** Nothing in this ADR's Decision section depends on the RTL list, and no
future amendment to Decision 1 should be justified by it.

### A4 — Nuxt ≥ 4.4.6 has already dropped Node 20 *(TASK-R0-O2, 2026-09-22, from N5-03 D4)*

The Nuxt fixture matrix is **pinned at 4.4.5** precisely because 4.4.6 and later
drop Node 20, which the floor's `^20.19.0` branch still claims. So the floor is
now holding a dependency back rather than only describing the runtime.
`N5-03 D4` (`docs/program-2026-09/reports/N5-03-toolchain-currency-handoff.md`
§10) recommends holding at 4.4.5 *until a Nuxt security fix lands above it* —
and that recommendation is explicitly downstream of A1. If the floor moves to
`>=22.13.0`, the pin can be lifted; if it does not, the pin becomes a security
exposure with a date on it.

### A5 — Status *(TASK-R0-O2, 2026-09-22)*

This ADR remains **`Proposed`**. TASK-R0-O2 found **no recorded owner
acceptance** for ADR-18, ADR-19 or ADR-20 in any ledger, decision register or
handoff, and does not invent one. Since 2026-09-22 that status is measured:
`yarn validate:adr-references` reads the `Status:` line above and counts this
document in `maxProposedCitedFromCode` (**3** today). Acceptance means an owner
flipping that line and lowering the ceiling in the same change.

Its unmet precondition is **A1** — a floor decision. See the precondition table
in `docs/program-2026-09-04/reports/TASK-R0-O2-handoff.md`.
