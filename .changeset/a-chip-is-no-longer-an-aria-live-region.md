---
"@dzup-ui/core": patch
---

`DzChip` no longer declares `role="status"` — a chip is not a live region

The chip root carried `role="status"` unconditionally. `status` is an ARIA **live
region**, so every chip on the page was one: adding, relabelling or removing a
chip in a filter bar announced itself over whatever the user was reading. `status`
is also not a `nameFromContent` role, so the chip's own label stopped being read
as content in its place in the document. With `closable` the root additionally
takes `tabindex="0"`, which made it a focusable live region with no widget role.

The root now carries no role, which is what `DzTag` — the sibling in this family,
with the same `<span>` root, the same props, the same
`data-state`/`data-tone`/`tabindex` ladder and the same remove button — has always
done. `DzChip.spec.ts` now asserts that the two agree, so they cannot diverge
again.

`role="button"` was considered and rejected: activating the chip root does
nothing. The only keys it handles are Backspace/Delete, and the remove control is
its own real `<button>` with its own label.

**What this changes for you.** `role="status"` is gone from the rendered output. If
you select chips with `[role="status"]`, that selector stops matching — use
`[data-part="root"]` or the component's own class. Nothing else moved: no prop,
emit, slot, `data-part`, `data-state` value or message key changed, and the chip's
`ui` surface is unchanged.

**One known consequence, stated rather than discovered later.** A `<span>` with no
role is `generic`, and ARIA 1.2 prohibits `aria-label` on `generic`. If you pass
`ariaLabel` to a chip, axe now reports `aria-prohibited-attr` — as `incomplete`,
so `toHaveNoViolations()` does not see it. `DzTag` has had exactly this for exactly
this reason; the two components are now identical in it rather than one of them
hiding it behind a live region. It is tracked, and the fix is to let the chip's own
text name it.
