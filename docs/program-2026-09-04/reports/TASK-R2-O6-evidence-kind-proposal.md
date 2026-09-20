# `visual-baseline` as an `EvidenceKind` — proposal and schema change

> **TASK-R2-O6**, closing N1-O6 decision **D4**. Bound to `ui/dzup-ui` HEAD
> **`2d51eec`**, worktree dirty. `[!owner]` — this changes a **published
> contract** (`@dzup-ui/contracts`) and what every Tier B+ component owes.
> The agent prepared it; nothing in it is applied.

---

## 1. The question, stated precisely

Today visual coverage is a **field** on every `CapabilityRow`:

```ts
// packages/tooling/src/quality/generate-capability-matrix.ts
export interface VisualEvidence {
  readonly state: 'covered' | 'not-covered' | 'stale'
  readonly baselines: number
  readonly themes: readonly string[]
  readonly artifacts: readonly string[]
  readonly note?: string
}
```

It is **not** a cell. N1-O6 §4.2 refused the promotion deliberately, on the
ground that `<generated_authority>` says a generator reports and never decides
public API, and that `TIER_EVIDENCE_INCREMENT` is transcribed from the
2026-08-11 reassessment.

That refusal was correct then and is still correct as a *process* statement.
What it left open is the substantive question, which is this one:

> **Is a visual baseline something a component *owes*, or something the
> repository happens to have for it?**

A field says the second. A cell says the first.

## 2. Why it matters — the concrete difference

| | field (today) | cell (proposed) |
|---|---|---|
| a component with no baseline reads | `not-covered` — a declared gap | `unrun` — an **unmet obligation** |
| appears in the tier totals | no | yes |
| `requiredEvidence(tier)` returns it | no | yes |
| blocks a tier claim | no | yes |
| `validate:quality-tiers` can fail on it | no | yes |
| cost of never rolling out | zero | **89 red cells, permanently visible** |

The last row is the whole decision. Making it a cell is a commitment to roll the
lane out, because after the promotion the matrix reports 89 components failing an
obligation and there is no honest way to make that go away except by capturing
the baselines.

That is an argument **for** the promotion if the owner intends the rollout, and a
decisive argument against it otherwise. It is not an argument the agent can
settle.

## 3. The concrete schema change

### 3.1 `packages/contracts/src/quality-tiers.ts` — three edits

**(a) the union.** Add to the Tier B block, after `browser-matrix`:

```ts
    /** The three-engine by five-condition lane (TASK-OSS-P5-03). */
    | 'browser-matrix'
+   /**
+    * An accepted per-component screenshot baseline, light and dark, on the
+    * authoritative platform (TASK-N1-O6, TASK-R2-O6). The artifact is the PNG
+    * plus its entry in `e2e/visual/visual-baselines.json`, which carries the
+    * digest, the capture commit, the author and the stated cause.
+    */
+   | 'visual-baseline'
    /** Teleported content survives SSR and hydration. */
    | 'portal-hydration'
```

**(b) `EVIDENCE_KINDS`.** Insert `'visual-baseline'` after `'browser-matrix'`.
The array is declared to be "in tier order" and validators iterate it, so the
position is load-bearing for output ordering, not decorative.

**(c) `TIER_EVIDENCE_INCREMENT.B`.** Insert `'visual-baseline'` after
`'browser-matrix'`:

```ts
  B: [
    'keyboard-spec',
    'state-stories',
    'controlled-uncontrolled',
    'browser-play',
    'rtl-contract',
    'browser-matrix',
+   'visual-baseline',
    'at-manual',
  ],
```

**Why Tier B and not Tier A.** Three reasons, in order of weight:

1. The failure that created this lane was geometry drift on **interactive
   primitives** (TASK-N1-O3 moved 24 components; the six visible ones are
   buttons, form controls, tree rows, splitter handles, a lightbox). Tier A is
   typography and layout scaffolding, where a baseline catches token drift and
   almost nothing else.
2. It matches the rollout order this programme already ranked (N1-O6 §6:
   forms → data → inputs → media → navigation → layout → overlays, then the
   Tier-A-heavy families last) and the `<done_check>`'s own target of
   "≥ 89 Tier B+ components".
3. Tier A is 55 of 144 components. Promoting into Tier A would add 144 cells and
   make the obligation 62 % larger for the part of the catalogue with the least
   to gain.

**Not `TRAIT_EVIDENCE`.** Traits are `teleports`, `drags`, `dataset` — statements
about what a component *does*. "Has a screenshot" is not trait-shaped, and
routing it through traits would give it to 3 components rather than 89.

### 3.2 `packages/tooling/src/quality/generate-capability-matrix.ts`

`resolveVisual()` already computes everything a cell needs. The change is a
projection, not new logic:

```ts
function visualCell(row: QualityRow, visual: VisualEvidence): EvidenceCell {
  return {
    kind: 'visual-baseline',
    origin: 'tier B',
    scope: 'component',
    state: visual.state === 'covered'
      ? 'pass'
      : visual.state === 'stale' ? 'stale' : 'unrun',
    artifacts: visual.artifacts,
    note: visual.note,
  }
}
```

**The `VisualEvidence` field stays.** It carries `baselines` and `themes`, which
a cell has no room for, and removing it would drop information the docs pages
already print. The cell is the obligation; the field is the detail.

**`covered → pass` and never `present`.** A baseline is not an artifact that
merely exists: the lane either matched it or did not. Mapping it to `present`
would repeat the exact mistake TASK-R2-O1 §3.1 found in the `browser-matrix`
cells, which were derived from a file's *existence* for three weeks.

### 3.3 Counts that move

| | today at `2d51eec` | after promotion |
|---|---|---|
| total evidence cells | **1,662** | **1,751** (+89) |
| Tier B cells | 917 | 984 (+67) |
| Tier C cells | 374 | 395 (+21) |
| Tier D cells | 21 | 22 (+1) |
| Tier A cells | 350 | 350 (unchanged) |
| cells reading `unrun` on day one | — | **+82** (89 owed − 7 Tier B+ pilot components) |

`DzButton`…`DzToggleButton` are 8 components, of which **7 are Tier B** and 1 is
Tier A (`DzSpeedDial` is Tier A and would owe nothing). All 8 currently read
`stale`, so on day one the promotion produces **7 `stale` and 82 `unrun`**, not
7 `pass` — see §5.

Other documents quote the 1,662 total. Changing it means updating them in the
same act, which is the cost N1-O6 flagged.

### 3.4 Release policy

`packages/contracts/VERSIONING.md`: at `0.x`, **`minor` = breaking**. Widening an
exported union is source-breaking for any consumer holding an exhaustive
`Record<EvidenceKind, …>` — and this repository holds three
(`TIER_EVIDENCE_INCREMENT`, `TRAIT_EVIDENCE`, `BOUNDARY_EVIDENCE`), which is
proof the pattern is in use.

**`@dzup-ui/contracts` 0.1.0 → 0.2.0, `minor`.** A changeset saying so is part of
the change, not a follow-up.

## 4. What the promotion does **not** fix

Stated so the owner does not buy it expecting this:

- It does not capture one baseline. The cells go from absent to `unrun`.
- It does not make the lane gate CI. That is blocked on the rendering-environment
  decision in the TASK-R2-O6 handoff §4, which is independent of this.
- It does not resolve the platform lock. A cell that reads `pass` on `win32`
  while CI runs `linux` is a `pass` about a platform no runner has — the promotion
  makes that *more* visible, not less true.

## 5. Recommendation

**Promote it, but only in the same act as the platform decision — not before.**

Ordering matters and this is the substantive advice in this packet:

1. **First** decide the rendering environment (handoff §4 decision 2). Until
   then, a `visual-baseline` cell reading `pass` means "matched on one developer's
   Windows box", which is precisely the kind of collapsed maturity level
   `<evidence_rules>` forbids.
2. **Then** promote, and capture Tier D → C → B in the rollout order, so the
   82 `unrun` cells close as the capture proceeds rather than standing red
   indefinitely.

If the owner is not going to fund the rollout, **do not promote**. A field that
says `not-covered` for 136 components is an honest declared gap. A cell that says
`unrun` for 82 components nobody intends to cover is a permanent red that
teaches readers to ignore reds — which costs more than the information is worth.
