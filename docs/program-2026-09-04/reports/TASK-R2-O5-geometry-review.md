# TASK-R2-O5 — the N1-O3 geometry changes, re-measured and photographed for design review

> Prepared 2026-09-18 at `main` @ `2d51eec` (+ the R2-O2/O3/O4/O5 working tree).
>
> ## **REVIEWED — outcome taken by the owner on 2026-09-19: accept all six.**
>
> **D121** in [`../EXECUTION-STATUS.md`](../EXECUTION-STATUS.md) is **closed**.
> The owner read this sheet and accepted every item on the recommendation in §4.
> The outcome is recorded **per item** in §4.1 below, as the sheet asked for.
> Nothing was reverted, nothing was adjusted, and **no ledger entry moved**: the
> 28 entries that left `e2e/matrix/known-failures.json` on the strength of these
> changes stand, which is the whole practical consequence of accepting rather
> than reverting.
>
> The measurement, the method and the images in §§1–3 are left exactly as they
> were on 2026-09-18. An agent measures a layout change; it does not approve one,
> and it does not re-write the measurement once the answer is known.

## 0. Two corrections to the task prompt, both measured

1. **No before/after screenshots existed.** TASK-R2-O5's prompt says
   *"before/after screenshots exist in N1-O3"*. They do not: N1-O3 §7.1 states
   that a pre-fix Storybook build no longer existed and that "before" was
   produced as **numbers**, by injecting a stylesheet that neutralises the
   target-size layer. There are no images in `docs/program-2026-09/reports/` for
   N1-O3 (the only `assets/` directory there belongs to N2-D2). So they were
   captured here, by the same neutralisation technique, and they are in
   [`./assets/TASK-R2-O5/`](./assets/TASK-R2-O5/) — 10 before/after pairs, plus
   two current-state-only images for the changes that cannot be neutralised.
2. **The prompt says six changes; N1-O3 numbered eight.** §7.3 flagged
   V1–V4 + V8 and §7.4 added V5–V7. Six of the eight change visible geometry —
   **V1, V2, V3, V5, V6, V8** — and the other two do not: V4 changes only a
   transparent hit area (the hairline still paints 1 px) and V7 is story-fixture
   markup that never binds above a 320 px viewport. The six are therefore the
   six below; V4 and V7 are listed at the end so the set stays complete.

## 1. Method

Every row was re-measured on the current tree, in chromium at 1280 × 720, by
loading each component's default story and reading `#storybook-root`'s box twice
on the same render: once as it ships, and once with N1-O3's neutraliser
stylesheet applied, which removes exactly the target-size layer that task added:

```css
.dz-target-min, .dz-target-min-tight,
.dz-target-min-tight-inline, .dz-target-min-tight-block {
  min-inline-size: 0 !important; min-block-size: 0 !important; margin: 0 !important }
.dz-field-input-reset, .dz-native-input {
  align-self: auto !important; min-block-size: 0 !important }
```

Raw numbers: [`./assets/TASK-R2-O5/geometry.json`](./assets/TASK-R2-O5/geometry.json).

**Every measurement reproduces N1-O3 §7.2 to the hundredth of a pixel**, three
weeks and several commits later. That is itself the first finding: the changes
under review are still exactly the changes that were reported, and nothing since
has moved them.

## 2. The six changes that move pixels

| # | Change | Before → after (story canvas) | Screenshots | Why it happened | Reversible? |
|---|---|---|---|---|---|
| **V1** | `DzDatePicker` / `DzDateRangePicker` grow **8 px wider**; the calendar glyph moves ≤ 4 px along the inline axis | `218.02 × 122 → 226.02 × 122` · `246.38 × 122 → 254.38 × 122` | `DzDatePicker-{before,after}.png`, `DzDateRangePicker-{before,after}.png` | The trigger relies on `ml-auto`, and the footprint-neutral utility's `margin` shorthand sorts after Tailwind's utilities in this build, so it would have moved the trigger to the start of the field. Growing was chosen as the smaller change | Yes — swap to the footprint-neutral variant and fix the layer order, or accept the trigger moving |
| **V2** | `DzBreadcrumb` rows grow **3 px taller** (21 → 24 px links) | `278.7 × 101 → 278.7 × 104` | `DzBreadcrumb-{before,after}.png` | A text-height link cannot be a 24 px target without its line box growing | No — this *is* SC 2.5.8 |
| **V3** | `DzRating` grows **2 px taller** (20 → 24 px root) | `196 × 136 → 196 × 138` | `DzRating-{before,after}.png` | Same shape as V2; the root carries `role="slider"` and is the target | No |
| **V5** | **Spacing-token repair** — 26 dropped declarations now apply. Largest effect: a `DzTree` node row 21 → 33 px at `md` | current `217.11 × 344` (not neutralisable) | `DzTree-after.png` | 31 references named `--dz-spacing-N-N`; the scale emits `--dz-spacing-N_N`, so the CSS parser discarded them | Only by re-breaking the tokens |
| **V6** | **`DzLightbox` renders styled** — backdrop, blur, rounding, sizing, positioned nav controls | current `205.63 × 118` closed state (not neutralisable) | `DzLightbox-after.png` | The recipe bound tv() slot **functions** instead of calling them, so the component rendered unclassed | Only by re-breaking the recipe |
| **V8** | **Checkbox and radio rows floored at 24 px.** The indicator's own paint is unchanged (18 × 18) | `DzCheckbox 282.42 × 104 → × 110` · `DzCheckboxGroup 151.25 × 158 → × 176` · `DzRadio 160.44 × 101 → × 104` · `DzRadioGroup 151.25 × 159 → × 168` | four `{before,after}` pairs | The `<label>` row activates the control, so it is a pointer target, and a 21 px target fails SC 2.5.8 | Partly — the row could stay 18 px if the label stopped being the target, which is a worse design |

**The density question, stated plainly.** V8 is the one with reach: every
checkbox and radio row in every consuming form is 3–6 px taller, so a ten-row
settings form grows 30–60 px. That is a product decision about density, and it is
the single item on this sheet most worth an explicit yes.

## 3. The two that change no pixels, for completeness

| # | Change | Measured | Note |
|---|---|---|---|
| **V4** | The splitter / resizable handle captures pointer events within ~11.5 px of the divider on both sides | `315.66 × 154 → 315.66 × 154` — **identical**, and the before/after PNGs are byte-identical | The hit box is `1 × 72 → 24 × 72` with `margin: 0 −11.5px`; the hairline still paints 1 px. The trade — pane content within 11.5 px of the divider is no longer clickable — is real and is written into `DzResizable.variants.ts` at the point of the change |
| **V7** | `max-w-full` on five fixed-width story wrappers; `flex-wrap` on two demo rows | no change above 320 px | Documentation fixtures, not library output |

## 4. What the owner is being asked

For each of V1, V2, V3, V5, V6, V8: **accept**, **revert**, or **adjust**.

**Recommendation: accept all six.** V2, V3 and V8 *are* the WCAG 2.2 SC 2.5.8
fix and reverting them re-opens 28 measured failures; V5 and V6 restore designs
the authors wrote and the build silently discarded; V1 is the only one that is a
genuine trade, and the alternative (the calendar glyph jumping to the start of
the field) is the more visible of the two.

If any item is rejected, the reversal is not a CSS edit in isolation: 28 entries
left `e2e/matrix/known-failures.json` on the strength of these changes, so a
revert must put its entries back with their measured numbers, which is what makes
that file a ratchet.

### 4.1 The outcome, per item — taken by the owner, 2026-09-19

| # | Change | Outcome | What that means in the tree |
|---|---|---|---|
| **V1** | `DzDatePicker` / `DzDateRangePicker` grow 8 px wider | **accept** | Nothing changes. The trade is owned: the field grows rather than the calendar glyph jumping to the start of the field. The layer-order repair that would allow the footprint-neutral variant stays available and is **not** tasked by this outcome. |
| **V2** | `DzBreadcrumb` rows grow 3 px taller | **accept** | Nothing changes. This *is* SC 2.5.8 and is not revertible without re-opening it. |
| **V3** | `DzRating` grows 2 px taller | **accept** | Nothing changes. Same shape as V2. |
| **V5** | Spacing-token repair — 26 dropped declarations now apply | **accept** | Nothing changes. Reverting would mean re-breaking `--dz-spacing-N-N` against the scale's `--dz-spacing-N_N`, i.e. deliberately re-introducing a parse failure. |
| **V6** | `DzLightbox` renders styled | **accept** | Nothing changes. Reverting would mean re-binding tv() slot *functions* instead of calling them, which `validate:tv-slots` now refuses anyway. |
| **V8** | Checkbox and radio rows floored at 24 px | **accept** | Nothing changes, and this is the item that carried the reach: every checkbox and radio row in every consuming form stays 3–6 px taller, so a ten-row settings form stays 30–60 px taller. That is the density cost, accepted explicitly rather than inherited. |

**Consequences recorded rather than assumed.**

- **No revert, so no ledger restoration.** `e2e/matrix/known-failures.json` is
  untouched by this outcome; the 28 entries stay closed.
- **V4 and V7 needed no outcome** and were not given one: V4 moves no pixel (its
  two PNGs are byte-identical) and V7 is story-fixture markup that never binds
  above a 320 px viewport. They are listed in §3 so the set of eight stays
  complete, not because they are pending.
- **The density scale stays out of scope.** §5 already says a `compact` mode is
  a design-system feature request rather than a review outcome. Accepting V8
  does not commission one, and nothing in this outcome should be read as
  refusing one either.

## 5. What this sheet does not decide

- The **resize affordance** — a separate, larger decision:
  [`./TASK-R2-O5-2-5-7-decision.md`](./TASK-R2-O5-2-5-7-decision.md) (D117).
- Whether these components deserve a **density scale** (a `compact` mode that
  would make V8 configurable rather than fixed). That is a design-system feature
  request, not a review outcome, and no task has proposed it.
