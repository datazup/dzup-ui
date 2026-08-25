---
"@dzup-ui/core": minor
---

**`DzTabs`, `DzAccordion` and `DzStepper` can reveal a hidden panel and say when it is rendered, `DzStepper` can refuse a step change, and `useRevealAndFocus` reports whether focus actually landed.**

`TASK-FORM-OSS-04`, which closes the FORM-OSS program.

**The defect this exists to stop** is one of the quietest in a form. A wizard or
tabbed form validates on submit, finds its first invalid field inside a panel
that is not currently shown, and calls `focus()` on it. The element is not in
the document — or it is `display: none` — so `focus()` does nothing, raises
nothing, and returns nothing. The user is told "please fix the errors" and given
no way to reach them.

Closing it takes both halves. **`revealItem(id)`** on all three disclosure
primitives opens or activates the panel holding `id` and emits `revealed`
*after* it has rendered, which is the moment focus becomes possible. It fires
even when the item was already open, so a caller never has to special-case that
branch — which is exactly where the missing focus comes back.
**`useRevealAndFocus`** waits for `nextTick`, then for the reveal transition,
then focuses — and returns **the element that actually holds focus, or `null`**.
A form that gets `null` can fall back to its error summary instead of stranding
the user.

The transition wait is bounded and skipped under `prefers-reduced-motion`. A
`transitionend` that never fires must not leave the user with no focus at all:
slightly early focus is recoverable, never focusing is not.

**`DzStepper` gains `beforeChange` and `linear`.** A wizard cannot advance past
a step whose fields are invalid, and the stepper is the only thing that knows a
change is being attempted. The guard is a **boolean and nothing more** — the
stepper is never told what validation is, only whether the host permits this
move. It is awaited even when synchronous, so an async validator does not cause
the next step to flash and roll back. A refusal emits `blocked` with a reason,
because a Next button that silently does nothing is indistinguishable from a
broken one.

`linear` tracks the furthest step reached rather than the current one, so a user
can return to step 1 from step 3 and jump straight back — which is what "you
cannot skip ahead" means to a person filling in a form.

**`revealItem` deliberately bypasses the guard.** It is how a form takes the
user *to* an error; a guard that blocked it would trap them on a step whose
problems are somewhere else.

**`DzAccordion` honours `prefers-reduced-motion`.** Its panel height animation
and its chevron rotation both ran regardless.

**What was audited and found sound.** `DzGrid`'s responsive `cols` work per
breakpoint, and neither it nor `DzStack` has a physical direction: CSS grid and
`flex-direction: row` are writing-mode relative, so `dir="rtl"` orders them
correctly with nothing to configure. Both now have specs saying so.

**Two things are recorded rather than fixed.** `DzGrid` has **no span API** — a
renderer's "this field takes two of three columns" is a raw `class` on the
child today, and adding a `DzGridItem` or a `span` prop is an owner decision.
And `DzStack` calls its axis `horizontal`/`vertical` where a renderer's layout
node says `row`/`column`; a `direction="row"` silently falls back to vertical,
which reads as a styling bug for a week. Both are asserted by tests so the
absence cannot be mistaken for an oversight.

The readiness matrix now carries a **Layouts** section, so these five are
tracked beside the 39 controls rather than in prose.
