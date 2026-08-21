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
