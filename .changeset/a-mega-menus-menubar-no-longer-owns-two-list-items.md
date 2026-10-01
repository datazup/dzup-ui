---
"@dzup-ui/core": patch
---

`DzMegaMenu`'s expanded menubar no longer owns list items

The expanded top level renders `nav > ul[role="menubar"] > li > a[role="menuitem"]`,
and the `<li>` carried no role — so it kept its implicit `listitem`. The `<ul>`
stopped being a list the moment it was given `role="menubar"`, which leaves a
`listitem` inside a `menubar` and a `menuitem` with no menubar above it in the
accessibility tree.

Measured with axe over the rendered menubar, **three** rules fire, not two:

- `aria-required-children` on the `<ul>` — *"Element has children which are not
  allowed"*; `menubar`'s required owned roles are
  `group · menuitemradio · menuitem · menuitemcheckbox · menu · separator`.
- `aria-required-parent` on **each** `<a role="menuitem">` — *"Required ARIA
  parents role not present: menu, menubar, group"*.
- `listitem` on each `<li>` — *"List item parent element has a role that is not
  role=list"*.

The wrapper is now `role="none"`, so the menubar owns the menu items inside it.
One attribute; no pixel changes, no prop, emit, slot, `data-part`, `data-state`
or message-key change. The **collapsed** disclosure branch is deliberately
untouched: its `<ul>` has no role, so there the `<li>` is a real `listitem` in a
real `list`.

Worth knowing if you relied on the browser lane to catch this: it could not. Both
structure rules carry the `wcag2a` tag that `apps/storybook/.storybook/preview.ts`
pins in `a11y.options.runOnly`, so they *do* run over this component — but the
lane's global gate is `a11y.test: 'todo'`, report-only, and `stories/navigation/`
has not opted into `a11yError`. `DzMegaMenu` also had no entry in
`packages/core/tests/a11y/navigation.a11y.spec.ts` at all. It has one now.
