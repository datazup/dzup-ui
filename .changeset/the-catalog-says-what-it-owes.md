---
"@dzup-ui/contracts": minor
"@dzup-ui/core": minor
---

Evidence by risk tier: every public component now says what it owes, and one page says what it has (TASK-OSS-P5-01…06).

**`@dzup-ui/contracts`** gains `quality-tiers`: the tier→evidence rules, the WCAG
2.2 catalog a component library can actually fail, the APG pattern vocabulary,
and `SecurityBoundary` — a second axis so a `DzButton` with an `href` owes a URL
policy without owing a data grid's performance baseline.

**`RiskTier` was inverted and is now corrected.** TASK-OSS-P3-02 introduced the
field with `A` as the highest risk and `D` as structural layout, which is the
opposite of the 2026-08-11 reassessment it was implementing and of every P5
packet that consumes it. The scale is now ascending — `A` presentational, `B`
interactive primitive, `C` composite, `D` security or data boundary — and the
eight declarations written against the old reading were migrated. Read any
`riskTier` predating this change as the mirror of the current scale.

**`DzFileUpload` now enforces `accept` and `multiple` on the drop path.**
`:accept` and `:multiple` on `<input type="file">` constrain the operating
system's picker and have no effect on a drop — `DataTransfer.files` arrives
unfiltered. A control rendering "Accepted: image/\*" beneath its drop zone would
take a dropped `.exe` into `v-model` and emit `upload` with no `error` event.
Both are now checked in `processFiles`, where the picker and the drop zone meet.
An application relying on the old behaviour will start receiving `error` events
it previously did not.

Also adds: a component anatomy for `DzFileUpload`, its threat model and
hostile-input corpus under `packages/core/security/`, and its SSR sample.
