---
"@dzup-ui/core": minor
---

**Nine ARIA props that were declared, type-checked in your source, and never rendered anything have been removed from six components.** `DzFloatLabel` loses `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid`; `DzInplace`, `DzGrid`, `DzStack`, `DzStepper` and `DzTabs` lose `ariaInvalid`.

`TASK-N5-02`. These are the six `⛔ gap` cells the C2 (identity) column of
`docs/program-2026-08/form-controls-readiness-matrix.md` has carried since the
form-controls audit. The matrix now reports **0 gaps**.

**Why removal and not implementation.** Each of these props inherits from
`BaseAccessibilityProps` and each landed on an element that cannot carry it:

- `DzGrid` and `DzStack` render a generic `<div>`. A layout box is not invalid;
  the fields inside it are.
- `DzTabs` renders Reka's `TabsRoot`, which is not a widget with a validity
  state. A field inside a panel is invalid, and `DzTabTrigger` is where an
  invalid-panel affordance belongs.
- `DzStepper`'s root is `role="group"`, and ARIA 1.2 does not support
  `aria-invalid` on `group`.
- `DzInplace`'s display trigger is `role="button"`, likewise unsupported.
- `DzFloatLabel` is a `<div>` plus a `<label>`. It is not a labelable element and
  computes no accessible name of its own, a generic element ignores
  `aria-describedby` and `aria-invalid` entirely, and the control it wraps
  already merges its own error id into `aria-describedby` — writing one from the
  wrapper would clobber that merge.

A declared prop that silently does nothing is worse than its absence, because a
consumer reasonably believes it has met its own accessibility obligation. The
honest fix is to stop declaring it.

**Why this is a `minor` and not a `patch`.** `packages/contracts/VERSIONING.md`
§3: removing a declared prop is a type removal, and a prop that did nothing at
runtime still type-checked in consumer source, so deleting it stops that source
compiling. Under the 0.x mapping in §1 a break goes in the minor position, where
`^0.x` does not carry it into an unattended install.

**What you will see if you were passing one.** The binding no longer resolves to
a prop, so Vue routes it into `$attrs` and every one of these components spreads
`$attrs` onto its root — which means the attribute now *renders*, on an element
with no role to carry it. That is a different wrong answer from the old silent
swallow, so each component emits a one-time dev-mode warning naming the prop,
what to do instead, and the fall-through. Production builds drop the check.

**Migration.** Delete the binding, or move it to the element that owns it:

| Was | Now |
| --- | --- |
| `<DzGrid :aria-invalid="hasError">` | put `aria-invalid` on the field, or bind `invalid` on the control |
| `<DzStack :aria-invalid="…">` | same |
| `<DzTabs :aria-invalid="…">` | the field inside the panel carries it |
| `<DzStepper :aria-invalid="…">` | the field inside the step carries it |
| `<DzInplace :aria-invalid="…">` | set it on the editor you render into `#edit` |
| `<DzFloatLabel :aria-label="…">` etc. | put all four on the control you wrap, or use `DzFormField` |

`@dzup-ui/codemods`' `rename-props` transform strips all nine, in every binding
form a Vue template or JSX can write. **That transform has no delivery path**:
`@dzup-ui/codemods` is public and publishable but sits on the changesets `ignore`
list, so no changeset can release it and this changeset is forbidden from naming
it alongside a published package. The codemod exists in the repository and
cannot currently reach you (owner decision N5-01-D2,
`packages/tooling/scripts/release-policy.json`). Until that is resolved, the
table above is the migration.

**Three sibling props were kept and implemented rather than removed** —
`DzInplace.ariaLabelledby`, `DzStepper.ariaLabelledby` and
`DzStepper.ariaDescribedby`. See the accompanying patch.
