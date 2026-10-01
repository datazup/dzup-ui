---
"@dzup-ui/core": patch
---

A named `DzChip` or `DzTag` now carries a role that is allowed to hold a name

`aria-label` and `aria-labelledby` are **prohibited** by ARIA 1.2 on the `generic`
role, which is what a `<span>` with no role is. Both components forward
`ariaLabel`, `ariaLabelledby` and `ariaDescribedby` from `BaseAccessibilityProps`
to their root, so passing either of the first two produced an invalid — and
unreliably announced — name. axe reported it as `aria-prohibited-attr`, but in its
**`incomplete`** bucket, which `toHaveNoViolations()` does not read, so ten axe
assertions across the two components stayed green while the defect shipped.
`DzTag` has had it since it was written; `DzChip` acquired it when it gave up the
`role="status"` that had been suppressing the warning by being wrong.

**What changed.** When — and only when — `ariaLabel` or `ariaLabelledby` is set,
the root now renders `role="group"`. An unnamed chip or tag carries **no role**,
exactly as before, so the common case is byte-identical output.

`group` was chosen on measured axe output rather than by argument. `role="note"`
is also clean and semantically wrong; `role="button"` is clean and was already
rejected because activating the root does nothing; `role="listitem"` is **worse**
than the defect — it turns the `incomplete` into a real `aria-required-parent`
violation. Simply not forwarding the two props was the other clean option, and it
was rejected because both are declared, documented props and silently making a
prop do nothing is the failure this change exists to remove.

`aria-describedby` is untouched: it is a global attribute and was never
prohibited.

**What this changes for you.** A chip or tag you have named now appears in the
accessibility tree as a `group` with that name; an unnamed one is unchanged. If you
select these roots by `[role]` — you could not have, they had none — or assert
their absence from the accessibility tree while naming them, that assertion moves.
No prop, emit, slot, `data-part`, `data-state` value, token or message key changed.

Both components were changed together on purpose: their roots are
attribute-for-attribute the same element, and a test asserts that they agree about
the root role.
