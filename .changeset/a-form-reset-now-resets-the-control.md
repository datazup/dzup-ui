---
"@dzup-ui/core": minor
---

**A parent can take a control's value back after the user has edited it, a focus trap gives focus back when it releases, a disabled tree is disabled, and a menu's `aria-controls` points at something that exists.**

`TASK-R2-O3` closes the defect register `TASK-N1-O1` reported and did not fix.
Every entry below has a regression spec that failed before the change and passes
after it; the spec title carries the defect id.

**An external write after a user edit is honoured** (defect D8). `useDualModel`
merges a control's default `v-model` with its legacy `v-model:value` and wrote
to **both**. On a consumer who bound only `v-model:value` — which is every
template written before the dual model — the default model is component-local
state, so the first user edit latched a value into it, and from that moment
every read preferred the latched copy and **every external write was silently
discarded**. Resetting a form field did nothing at all. Seven public controls
shared it: `DzCascader`, `DzInplace`, `DzKnob`, `DzMention`, `DzRating`,
`DzTagsInput`, `DzTreeSelect`.

The composable now remembers the value it last wrote. A model that has moved
away from it was moved by the parent, and the parent wins — whichever model
(or both) the consumer bound. A consumer binding the default `v-model` sees no
change; a consumer binding `v-model:value` gets back the control of the value
they always had in every other control.

The whole suite was green through all of it, because every test mounted fresh
and asserted, and on a fresh mount the composable was correct. The seven
regression specs are written as traces — edit, *then* write — for that reason.

**A focus trap returns focus when it releases** (defect D7). `useFocusTrap`'s
`deactivate()` removed its keydown listener and nothing else, so dismissing a
`DzTour` — Skip, Escape or Finish — left focus on `<body>` instead of the
control that opened it (WCAG 2.4.3 Focus Order). It now restores focus to
whatever held it when the trap was activated, and skips the restore when the
target has left the document or when something outside deliberately took focus
as the trap closed. `useFocusTrap` gains an options argument,
`{ restoreFocus?: boolean }`, default `true`; `DzBlockUI` and `DzPopconfirm`
pass `false` because they already own the restore and know a better target.

**`<DzTree disabled>` and `<DzResizable disabled>` do something** (defects D1,
D2). Both stamped a `data-disabled` attribute on the root and stopped there,
because the prop never reached the context their children inject: every tree row
kept its roving `tabindex`, its click handler, its chevron and its selection,
and every resize handle stayed focusable with Arrow keys still resizing.
Freezing a layout required repeating `disabled` on every single handle.
`DzTreeContext` and `DzResizableContext` each gain a `disabled: Ref<boolean>`
member, and a child is inert when its own `disabled` **or** the group's is set.

**A disabled combobox has no live Clear button** (defect D9). `DzCombobox`'s
clear control had no `:disabled` binding while its sibling trigger did, so a
disabled combobox holding a value still rendered a clickable Clear.
`tabindex="-1"` kept keyboard users out of it; pointer and AT users were not.

**`aria-controls` points at an element that exists** (defect D11). Five overlay
content components bound `:id="id"` unconditionally, which handed an explicit
`undefined` to the underlying Reka component and **overrode the content id Reka
generates for itself**. The panel then carried no `id` at all while its trigger
advertised one — axe `aria-valid-attr-value`, and an AT user following the
reference found nothing. `DzDropdownMenuContent`, `DzContextMenuContent`,
`DzDialogContent`, `DzSheetContent` and `DzCommandPalette` now bind the
attribute only when there is one; an explicit `id` still wins.

**`DzMention`'s `loading` prop is no longer dead** (defect D3). It was declared
(through `BaseBehaviorProps`), defaulted in the component, and read by nothing.
The host's answer is now ORed with the component's own resolver state, so a host
that knows it is fetching can say so before a trigger character has been typed.

**An ARIA attribute that only works after hydration is now a test failure**
(defect D5, finding E6). `DzOrderList` shipped `:ariaLabel` (camelCase), which
reaches `aria-label` in a browser through ARIA reflection and is **absent from
server-rendered markup** — so every jsdom and Playwright assertion passed while
the list had no accessible name until hydration. The source is already correct;
`packages/core/tests/ssr/aria-attribute-casing-ssr.spec.ts` now gates the class,
from both ends: a scan of every component template for a camelCase ARIA
attribute name, and a scan of real server output with a seeded component that
must be caught.

**Story and tooling corrections.** Two stories asserted `role="alert"` on a form
field's error message, which `DzFormMessage` deliberately stopped emitting in
`e986952` — an `alert` implies `aria-live="assertive"` and would interrupt
whatever the user was being told, so renderer contract C4 says polite. One story
bound `:options` on a `DzSelect`, which takes `items`, and threw while
rendering. And `validate:story-dod`'s state-prop scan read the whole `.types.ts`
file, so a same-named **slot** and *item-level* members counted as component
props; it now reads `*Props` interface bodies only (defect D6). The `states`
denominator moves 62 → 56 and every enforced check stays green.

**Not fixed, recorded instead.** Defect D4 (a `role="button"` span inside the
`<button role="combobox">` trigger of `DzCascader` and `DzTreeSelect`) and
defect D10 (`DzTreeSelect` declaring `aria-activedescendant` while DOM focus
moves into the tree) each need a decision the library's owner has to take, and
each changes rendered output or a published part. Both are pinned by
recorded-defect assertions in their contract specs, so the count cannot drift
and the eventual fix cannot land unnoticed.
