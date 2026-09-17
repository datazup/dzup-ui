# `[!owner]` decision packet — Tokens Studio / Figma sync

> **Prepared, not executed.** README §8 lists "a Figma kit and Tokens Studio
> sync" as a deferred `[!owner]` until the docs site is live. This packet exists
> so the decision can be taken quickly when the trigger fires; it builds nothing
> and changes no token.
>
> Prepared by TASK-R5-O7 on 2026-09-15, `main` @ **`99b963a`** (did not move),
> worktree dirty. Every number below is bound to that commit plus the dirty
> tree. Evidence class: **locally qualified**. No commit, push, publish, CI
> dispatch or deployment.

---

## 1. The decision in one line

**Does dzup-ui publish its design tokens into Figma — and if so, in which
direction, and who owns the conflict when the two disagree?**

---

## 2. What exists today (measured, not assumed)

| Fact | Value |
|---|---|
| Interchange artifact | `packages/tokens/dist/tokens.dtcg.json`, subpath `@dzup-ui/tokens/dtcg` |
| Tokens in it | **800** — 774 typed, 26 untyped |
| Spec | DTCG **2025.10**, validated in-gate against the vendored official JSON Schema (`validate:tokens:schema`, added by this task) |
| Round-trip | `validate:tokens:dtcg` — every alias resolved and compared to what `dist/tokens.css` computes, in **three** cascades |
| Determinism | byte-identical across runs; hashed this session |
| Direction | **one-way**. Source of truth is TypeScript in `packages/tokens/src/`; the JSON is generated from it |
| Existing prose | `packages/tokens/TOKENS.md` §3 "Tokens Studio — *untested*" |

Three facts constrain every option below.

**(a) 26 tokens cannot be expressed in DTCG at all.** Recorded by N2-T1 §"The 26
tokens DTCG cannot express" — keywords like `--dz-shadow-none`, and values with
no spec type. They are carried in a `$extensions["com.dzup"].untyped` census
instead. A design tool sees 774 tokens, not 800.

**(b) The high-contrast cascade cannot be exported at all.** TASK-R5-O7 added a
third cascade — 115 ABI names valued in CSS system colours (`Canvas`,
`ButtonText`, …). The official schema enumerates thirteen `$type`s and `color`
requires a `colorSpace` with numeric components; a system colour is a reference
to the platform, not a value in a colour space. So a Figma sync carries **light
and dark only**, and a designer working in Figma has no view of the
accessibility theme at all.

**(c) Figma stores colour variables in sRGB; the palette is oklch — and the
conversion is not free.** Measured this session over the 311 distinct `oklch()`
triples in `dist/tokens.css`, converting each to linear sRGB and taking the
largest per-channel excursion outside `[0,1]`:

| Excursion after gamut mapping | Distinct colours |
|---|---|
| ≤ 0.001 — invisible | 181 |
| 0.001 – 0.01 — negligible | 57 |
| 0.01 – 0.05 — subtle | 44 |
| **> 0.05 — visibly different** | **29** |

The 29 worst cluster at hue ≈ 260 — the **primary blue ramp**, i.e. the brand
colour (worst excursion 0.146 in linear light). Any Figma sync therefore shows
designers a brand blue that is measurably not the one the browser paints, and
**no gate in this repository can see that divergence**, because it happens
inside Figma. The converter was validated against white, black and the three
sRGB primaries before these numbers were taken.

---

## 3. Options

### Option A — Do nothing; keep the documented one-way file handoff *(status quo)*

A designer imports `tokens.dtcg.json` into Tokens Studio by hand when they want
it. Already works; already documented; untested.

- **Cost:** zero.
- **Risk:** the Figma file drifts silently; nobody can tell how stale it is.
- **Who does the work:** nobody.

### Option B — One-way automated sync, repo → Figma (recommended)

A CI job pushes `dist/tokens.dtcg.json` to a Tokens Studio git sync branch on
every release. Tokens Studio applies it to Figma Variables. Designers consume;
they never author.

- **Cost:** ~1 packet. A publish step, a Tokens Studio workspace, a mapping for
  the two cascades onto Figma modes, and a staleness check.
- **Risk:** the sRGB divergence in §2(c) becomes a standing, invisible fact —
  mitigated by a one-page note in the Figma file naming the 29 colours.
- **Reversal cost:** low. Delete the job; the Figma file freezes where it is.
- **Keeps:** the ABI contract intact. TypeScript stays the single source of
  truth, and `validate:tokens:dtcg` still gates what is pushed.

### Option C — Two-way sync, designers author in Figma

Tokens Studio writes back to a branch; a bot opens a PR against
`packages/tokens/src/`.

- **Cost:** 2–3 packets, and a permanent one.
- **Risk:** **high, and structural.** It inverts the source of truth. Every
  generator, gate and ratchet in this repo assumes the TS maps are authored and
  everything else is derived — `validate:tokens:dtcg` fails by construction the
  moment the JSON leads the maps. A Figma-authored colour also arrives in sRGB
  and would have to be converted *back* to oklch, which is lossy in the other
  direction for the same 29 colours.
- **Reversal cost:** high — designers will have authored real work in Figma by
  then.
- **Verdict:** not recommended at any point on the current roadmap.

### Option D — Skip Tokens Studio; push Figma Variables directly via the REST API

A script maps DTCG groups onto Figma variable collections and modes.

- **Cost:** ~1.5 packets, plus a Figma access token in CI (a new secret, a new
  owner obligation) and ongoing exposure to Figma API changes.
- **Risk:** same sRGB divergence; adds a bespoke integration this repo would own
  forever, against the file's governing rule — *build on the existing
  generators, never a second mechanism*.
- **Verdict:** only if Tokens Studio is rejected for licensing reasons.

---

## 4. Recommendation

**Option B, and not before the trigger.**

Rationale, in the order that decided it:

1. It preserves the property the five-layer contract is built on — one source of
   truth, everything else generated and gated. Option C trades that away for
   designer convenience, and this repo's entire validation posture is the
   collateral.
2. The interchange artifact already exists, is deterministic, and is now gated
   twice (schema + round-trip). Option B is a *delivery* step on top of finished
   work, which is why it is one packet rather than three.
3. The measured fidelity cost (§2(c)) is real but bounded, and it is bounded
   only in the one-way direction. Two-way doubles it.

**The trigger stays as README §8 states it: the docs site must be live first.**
That is not bureaucratic sequencing. The docs site is where the token reference
is published, and it is the artifact a designer would be pointed at to resolve a
disagreement with the Figma file. Syncing into Figma before that page exists
creates a second source of truth with no tiebreaker. `apps/docs` builds locally
(N2-D1: 152 pages, 17.4 s) but **is not deployed** — deployment is owner
authority and has not been exercised.

---

## 5. What the owner is being asked to decide

| # | Question | Default if no decision |
|---|---|---|
| 1 | A, B, C or D? | A — status quo, drift continues |
| 2 | If B: does the brand accept that 29 token colours render differently in Figma than in the browser, or should the primary ramp be re-authored inside sRGB first? | unresolved; blocks B |
| 3 | If B: who owns the Figma workspace and its licence? | unassigned; blocks B |
| 4 | Is high-contrast being absent from Figma acceptable, given it cannot be expressed in DTCG? | accepted by omission |

Question 2 is the one with a second-order effect: re-authoring the primary ramp
inside sRGB would change shipped pixels and is a token change, so it is an owner
call of its own — not a side effect of a sync decision.

---

## 6. What this packet deliberately did not do

- No Figma work of any kind (the task's `<scope>` forbids it).
- No Tokens Studio account, workspace or trial.
- No sync script, CI job or secret.
- No token renamed, and no `--dz-*` name changed.
