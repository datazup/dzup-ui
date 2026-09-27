# TASK-R2-O5 — WCAG 2.5.7 resize affordance: design decision sheet

> Prepared 2026-09-18 at `main` @ `2d51eec` (+ the R2-O2/O3/O4/O5 working tree).
>
> ## **DECIDED — taken by the owner on 2026-09-19: option A, with no opt-out prop.**
>
> **D117** in [`../EXECUTION-STATUS.md`](../EXECUTION-STATUS.md) is **closed**.
> The owner read this sheet and instructed that the task be finished on the
> recommendation in §4: steppers revealed on the handle, the resting state
> byte-identical to the previous rendering, **no opt-out prop** (§2.5 — an
> opt-out would ship a conformance claim a prop can withdraw), on all three
> surfaces. The decision is the owner's, not an agent's, and not still open.
>
> It was implemented the same day by TASK-R2-O5's residual, exactly to the
> seven steps in §5 — see
> [`./TASK-R2-O5-handoff.md`](./TASK-R2-O5-handoff.md) §9 for what landed, the
> ratchet movements (`openGaps` and `ceiling` **3 → 0**) and the 27/27 browser
> cells that re-measured the flip.
>
> Two details §6 left undecided were settled during implementation rather than
> re-opened; both are recorded in §7 below with the reason.
>
> Everything in §1 is measured, not recalled — sources are named per row.
> §§1–4 are left exactly as they were written on 2026-09-18: a decision sheet
> that edits its own analysis after the answer is known is worth nothing.

## 1. The question, and why it is still open

WCAG 2.2 SC 2.5.7 Dragging Movements (AA): *all functionality that uses a
dragging movement for operation can be achieved by a **single pointer without
dragging**, unless dragging is essential or the functionality is determined by
the user agent.*

`packages/core/docs/wcag-deviations.json` records the audit: **nine** drag
surfaces (the set is gated against the `drags` trait in `quality-matrix.json`, so
a tenth cannot appear silently), **six met**, **three open** — and the three are
two operations:

| Surface | Drag operation | Keyboard (SC 2.1.1) | Single pointer, no drag (SC 2.5.7) |
|---|---|---|---|
| `DzResizable` | drag the separator | Reka `useWindowSplitterBehavior`: arrows, Home/End, F6 | **none** |
| `DzSplitter` | the same Reka `SplitterResizeHandle` | as above | **none** |
| `DzTable` (`DzTableCell`) | drag the column-resize handle | `onResizeKey`: ±8 px, ±24 px with Shift | **none** — and `@click.stop` on the handle actively discards a plain click today |

Neither of the criterion's exceptions applies: dragging is not *essential* (the
keyboard path proves a non-drag mechanism exists) and the behaviour is authored,
not user-agent-determined.

**Why an agent has not simply built one.** APG specifies keyboard interaction for
the Window Splitter pattern and says nothing about a pointer alternative; there
is no APG pattern for column resizing at all. Every candidate below changes the
component's visual language or its interaction vocabulary, so the choice is a
product decision. What this task did instead was make the gap *measurable*: the
new lane `e2e/matrix/non-drag.spec.ts` presses each of the nine surfaces with a
single pointer in three engines and asserts the result **equals what the record
claims**, so the day an affordance lands, the lane goes red until the record is
updated — and until then nobody can quietly claim the gap is closed.

**Measured 2026-09-18 at `2d51eec`: 27 of 27 cells agree with the record.** The
six met surfaces each changed their value on a single press in chromium, firefox
and webkit; the three resize surfaces did not, on any engine. The table above is
therefore no longer a source reading — the gap is a browser result.

## 2. What the implementation has to satisfy, whichever option is picked

Measured constraints, each with the file that imposes it:

1. **One implementation closes two surfaces.** `DzSplitter*` is `DzResizable*`
   under another name — one `.variants.ts`, one `.tokens.ts` re-export, the same
   `DZ_RESIZABLE_KEY`, the same Reka `SplitterResizeHandle`. `DzTableCell` is
   separate, hand-written code.
2. **A rendered control needs a part, an anatomy entry and a message id.** Today
   `DzResizable.anatomy.ts` / `DzSplitter.anatomy.ts` declare
   `root · panel · separator · indicator` and `DzTable.anatomy.ts` declares no
   resize part at all; the table handle carries a bare `data-dz-resize-handle`,
   not a `data-part`. `validate:anatomy-parts` fails on a part that is rendered
   and undeclared.
3. **Any new tap target is bound by SC 2.5.8.** The `touch` matrix condition
   asserts ≥ 24 × 24 CSS px on every pointer target in three engines. The
   splitter handle is already a 24 px-wide hit box over a 1 px hairline
   (TASK-N1-O3 §4.5, change V4); the table handle is 8 px wide with
   `.dz-target-min`. A stepper pair therefore fits *inside* the splitter gutter
   and does **not** fit inside the table handle — it has to overlay the header
   cell.
4. **No live region exists on any of the three.** Reka's separator carries
   `aria-valuenow`/`min`/`max`; the table column carries none, only a static
   `aria-label` from `DzTableCell.resizeColumn`. Announcing a size after a
   single-pointer step needs either `aria-valuetext` (splitters) or a polite
   live region (`DzOrderList`'s `role="status"` announcer is the in-repo
   precedent — note its strings are hard-coded English, which a new one must not
   repeat).
5. **An opt-out prop re-opens the gap.** `DzOrderList` is recorded as *met* with
   a caveat: its single-pointer path is behind `showControls`, which a consumer
   can switch off while keeping the drag handle. Repeating that here would ship a
   conformance claim a prop can withdraw. Recommendation: **no opt-out prop**,
   which also keeps the change out of `VERSIONING`'s `minor` band.
6. **The lane must be updated with the affordance.** `clickResizeSurface` in
   `e2e/matrix/non-drag.spec.ts` presses the handle and then presses whatever the
   press revealed; options A and D answer that shape directly, option C answers
   it with the first press, option B needs its own probe.

## 3. The options

```text
A — steppers on the handle              B — tap-to-place on a rail
 ┌──────┬─┬──────┐                       ┌──────┬─┬──────┐
 │      │▴│      │   ▴ / ▾ appear on     │      │┊│      │   the full-height
 │ pane │ │ pane │   focus or first tap, │ pane ││ pane │   gutter is a track:
 │  A   │▾│  B   │   each tap = one step │  A   │┊│  B   │   tap it at the
 └──────┴─┴──────┘                       └──────┴─┴──────┘   height you want

C — presets on tap                      D — menu on the handle
 ┌──────┬─┬──────┐                       ┌──────┬─┬──────┐  ┌───────────┐
 │      │┃│      │   each tap cycles     │      │⋮│      │  │ 25 %      │
 │ pane │┃│ pane │   25 % → 50 % → 75 %  │ pane │ │ pane │  │ 50 %  ✓   │
 │  A   │┃│  B   │   → back              │  A   │ │  B   │  │ Width… ▭  │
 └──────┴─┴──────┘                       └──────┴─┴──────┘  └───────────┘
```

| | **A — steppers** | **B — tap-to-place** | **C — preset cycling** | **D — menu / numeric field** |
|---|---|---|---|---|
| **Interaction** | Handle focused or tapped once → a −/+ (or ▴/▾) pair appears on the gutter; each tap moves one step (the existing `keyboardResizeBy`, default 10 %; 8 px for a column) | A tap anywhere on the gutter/rail places the divider at that point, exactly as `DzSlider` and `DzImageComparison` already behave | A tap on the handle cycles snap positions; a second tap continues the cycle | A kebab (or long-press) on the handle opens a menu of presets plus a numeric size field |
| **Satisfies 2.5.7** | Yes | Yes | Yes | Yes |
| **Discoverable to a pointer user** | Yes — a visible control | Partly — the gutter does not look like a track | **No** — nothing indicates a tap does anything | Yes — a visible affordance |
| **APG borrowing** | No resize pattern exists; borrows `button` semantics and the `toolbar`-style grouping, and mirrors `DzNumberInput`'s decrease/increase pair and `DzOrderList`'s move controls in-repo | Borrows the `slider` pattern's click-on-track behaviour, which is what `DzSlider`/`DzImageComparison` already do | Nothing to borrow | Borrows `menu` / `menuitemradio`; the numeric field is a `spinbutton` |
| **Visual change** | **Yes** — new controls in the gutter (revealable, so resting state can stay identical) | **None** | **None** | **Yes** — a kebab, plus an overlay |
| **Works on a table column** | Yes, but the pair must overlay the header cell (the handle is 8 px wide) | **No** — there is no rail; the tap area would be the header cell, which sorts | Yes | Yes |
| **Collides with existing behaviour** | Needs `@pointerdown.stop` on the child so the handle's drag registry does not swallow the press; `DzTableCell`'s `@click.stop` must go | Conflicts with clicking pane content near the edge; Reka's hit area already extends ~11.5 px into both panes | A tap on a splitter currently does nothing, so no regression — but a user aiming to start a drag and releasing without moving now *moves the divider* | Core layout/data components would gain a dependency on the overlays family |
| **New parts / messages** | 2 parts (`step-decrease`, `step-increase`) × 2 families + 4 message ids | none | none (but a `data-state` for the current preset is worth adding) | 1 part + a menu subtree + ≥ 4 message ids |
| **Announcement** | `aria-valuetext` on the separator + label per button | value already announced by Reka on focus | needs a live region — nothing visible changes except geometry | menu item state announces itself |
| **Estimated cost** | **~1.5 days** — shared handle change, table handle change, anatomy + messages + variants, unit specs, lane probe, artifact flip and regeneration | **~0.5 day** for the splitters, **not viable** for the table | **~0.5 day** all three | **~3 days** + a new cross-family dependency |
| **Public API** | none (if no opt-out prop) | none | none | none |
| **Risk** | The gutter is 24 px wide: two 24 × 24 controls consume 48 px of its length, so short panes need a single cycling control instead — a real design detail to settle | Accidental resizes when a user clicks near a pane edge | Silent behaviour change on a tap; users cannot reach an arbitrary size, only the presets | Weight, and a layout primitive that now pulls in an overlay |

## 4. Recommendation

**A for all three surfaces, with the resting state unchanged.**

1. The controls are **revealed**, not always-on: `:hover`, `:focus-within`, and a
   first tap on the handle reveal them; the resting rendering is byte-identical
   to today's, so no consuming layout shifts. (This is the one property that
   makes A cheaper than it looks: nothing moves until a user reaches for it.)
2. It is the only option that is both discoverable *and* viable on a table
   column, and it reuses two in-repo precedents rather than inventing a
   vocabulary — `DzNumberInput`'s decrease/increase pair and `DzOrderList`'s move
   controls, which is exactly how the six surfaces that already pass 2.5.7 got
   there.
3. The step is the existing one, so the pointer path and the keyboard path agree
   by construction: `keyboardResizeBy` (10 % default) for panes, 8 px / 24 px for
   a column. One function behind both, as `DzOrderList.performMove` does.
4. **C is the fallback** if the owner refuses any new pixel: it is half a day and
   costs nothing visually. Its weakness is honest and should be recorded in the
   component docs if it is picked — an affordance nobody can see is a conformance
   pass, not a usable design.
5. **B is not recommended** (it cannot serve the table and it makes clicks near a
   pane edge ambiguous), and **D is not recommended** (a layout primitive pulling
   in the overlay family for one control is the most expensive way to close a
   24 px gap).

## 5. What lands when the owner picks A

| Step | Files |
|---|---|
| 1 | `DzResizableHandle.vue` + `DzSplitterHandle.vue`: render the stepper pair inside the Reka handle, `@pointerdown.stop`, `@click` → `resizeBy(±step)` |
| 2 | `DzResizable.anatomy.ts` + `DzSplitter.anatomy.ts`: `step-decrease`, `step-increase` parts; keyboard rows unchanged; add the `2.5.7` citation beside `2.1.1` on the arrow rows (the `DzOrderList`/`DzImageComparison` anatomies already cite both) |
| 3 | `DzTableCell.vue`: drop `@click.stop`, render the same pair overlaying the header cell, reuse `onResizeKey`'s step arithmetic; add `role="separator"` + `aria-valuenow` to the handle |
| 4 | `messages.ts` + `locales/*`: `DzResizableHandle.shrinkPane` / `growPane`, `DzTableCell.narrowColumn` / `widenColumn` (then `yarn generate:i18n-packs`) |
| 5 | Unit specs: a click on each control moves the size, the step matches the keyboard step, the pair is not rendered when the group is disabled |
| 6 | `packages/core/docs/wcag-deviations.json`: three surfaces `gap → met`, `singlePointerNoDrag` filled, `openGaps` **3 → 0**, `ceiling` **3 → 0**, `conformanceStatement` rewritten. `crossCheckWcagDeviations` enforces every one of those in the same commit |
| 7 | Re-run `e2e/matrix/non-drag.spec.ts` on three engines — it is already written to flip with the record — then `yarn generate:docs-pages` and `yarn generate:capability-matrix` |

## 6. What this sheet does not decide

- Whether the revealed controls should also be **always visible** on touch
  (no hover) — a device-class decision that interacts with the 24 px floor.
- Whether `DzOrderList`'s `showControls: false` should be *refused* while a drag
  handle is on (the recorded caveat on the one surface that passes with a
  condition). It is the same question in a different component and should be
  answered with it.
- Anything about SC 2.5.7 outside this repository: the Pro graph's node dragging
  is Pro-owned and is not in this audit's nine.

---

## 7. Settled during implementation (2026-09-19), with the reason

Three details were open when this sheet was written. Two were settled by the
engineering because the criterion forces an answer either way; the third is
still open and was **not** settled.

| # | Question | Settled as | Why |
|---|---|---|---|
| **7.1** | §2 Risk — *"the gutter is 24 px wide: two 24 × 24 controls consume 48 px of its length, so short panes need a single cycling control instead"* | **The pair never shrinks and never becomes one control. It is absolutely positioned, centred, and overflows the gutter's ends when the gutter is shorter than 48 px.** | A control that shrinks below 24 px fails SC 2.5.8, which is the criterion the `touch` lane measures in three engines — so shrinking was never available. Swapping in a single cycling control below a height threshold was: it is §3's option **C**, and it would make the same tap mean different things in different layouts, which is a worse property than an overhang. An overhang is also not new geometry: TASK-N1-O3 change V4 already has this handle overhanging each pane by ~11.5 px, and that trade is written into `DzResizable.variants.ts` at the point of the change. The overhang is along the gutter's *length*, is transient (the pair is revealed, not resident), and at the only size where it bites — a splitter under 48 px on its long axis — it is a few pixels. |
| **7.2** | §6 — *"whether the revealed controls should also be always visible on touch (no hover)"* | **No. They are not always visible on any device class.** Reveal is `:hover` on the gutter, `:focus-within` on the separator, **or one tap**, and the tap reveal is made sticky only for a non-mouse `pointerType`. | Always-visible-on-touch would have meant a media query changing the *resting* rendering on a whole device class, which is precisely what option A was chosen for avoiding. The tap path costs a touch user one extra press — tap the gutter, then tap a stepper — and both are single presses with no dragging, which is what SC 2.5.7 asks for and what `e2e/matrix/non-drag.spec.ts` presses. The sticky flag is restricted to non-mouse pointers so a mouse user's drag does not leave the controls painted behind it. |
| **7.3** | §6 — *"whether `DzOrderList`'s `showControls: false` should be refused while a drag handle is on"* | **Not settled. Still open.** | It is the same question in a different component, it is a public-API refusal rather than an addition, and nothing in this task's scope authorises narrowing a shipped prop. It is carried in `wcag-deviations.json`'s `followUp` and in `DzOrderList`'s recorded `caveat`, which is the one conditional verdict left in the record. |

### 7.4 Where this sheet was wrong, and what caught it

§5 step 1 says *"render the stepper pair **inside** the Reka handle"*. That
cannot be done. The handle carries `role="separator"` and `tabindex="0"`, so it
is an interactive control, and axe's **`nested-interactive`** (WCAG 4.1.2,
serious) refuses focusable content inside one — stating explicitly that a
negative `tabindex` does not exempt it, because assistive technologies can still
focus the element. The first implementation followed the sheet literally and
`apps/landing/src/blocks/a11y.spec.ts` turned red on the `resizable-workspace`
block in both themes.

The shipped structure puts the pair in a **zero-size flex item immediately after
the handle**, positioned over the divider, with the reveal moved from a Tailwind
`group` to a `peer`. Everything the sheet decided is unchanged — same controls,
same step, same reveal, same resting rendering, no opt-out prop — and the
geometry was re-measured after the change to prove it (handoff §9.5). Recorded
here rather than silently corrected, because the next person to read §5 would
otherwise repeat it.

### What the implementation added that this sheet did not ask for

Two things, both because the alternative was a claim nothing measures:

1. **`e2e/matrix/conditions.spec.ts`'s `touch` case gained an explicit stepper
   measurement.** Its generic sweep skips any element at `opacity: 0` as a
   visually-hidden native control — correct for a `DzCheckbox` input, and wrong
   for a control whose whole design is to rest transparent. Left alone, a 12 px
   stepper would have passed SC 2.5.8 in three engines while failing the
   criterion it was added for.
2. **The same measurement in `non-drag.spec.ts`**, because the `touch` lane
   opens each component's *default* story and `DzTable`'s renders no resize
   handle at all. The 2.5.7 lane is the only lane that opens
   `core-data-dztable--column-resizing`, so it is the only place the table's
   pair can be measured.
