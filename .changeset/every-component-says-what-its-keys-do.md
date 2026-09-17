---
"@dzup-ui/contracts": minor
"@dzup-ui/testing": minor
"@dzup-ui/core": minor
---

**Components now declare what their keys do, and the documentation renders the table from that declaration instead of saying it has not been derived.**

Until this release the library had no machine-readable keyboard contract. The one
generated keyboard signal was the capability matrix's `keyboard-spec` cell, and
that cell was a regular expression over the unit spec: it recorded *that* some
key was asserted, never *which* key did *what*. So every one of the 144 generated
component pages carried the sentence **"Not yet derived"** exactly where an
accessibility reviewer looks first, and the only honest alternative would have
been a hand-typed table that nothing could check and that would be wrong within
a release.

**New in `@dzup-ui/contracts`**

`ComponentAnatomy` gains an optional `keyboard` field:

```ts
export const anatomy = {
  parts: ['root', 'spinner'],
  states: ['idle', 'loading', 'disabled'],
  componentTokens: ['--dz-button-md-height'],
  keyboard: [
    { key: 'Enter', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },
  ],
  riskTier: 'B',
} as const satisfies ComponentAnatomy
```

Each `KeyboardBinding` carries the key as `KeyboardEvent.key` spells it, any
modifiers, the part or state it applies in, what it does, the WCAG success
criteria it is the mechanism for, the APG pattern it implements, and whether it
swaps meaning in a right-to-left document. `keyboard: 'none'` is an **explicit
claim** that the component has no keyboard behaviour of its own — deliberately a
different fact from the field being absent, and the two are never collapsed.

**In `@dzup-ui/core`:** 104 components declare a contract — 393 bindings across
85 components, plus 19 that declare `'none'`.

**New in `@dzup-ui/testing`:** `expectKeyboardContract` / `checkKeyboardContract`
hold a rendered component to its declaration — that every binding's context names
a part or state the component actually declares, that no key is declared twice,
that nothing contradicts the component's own RTL contract, and that something in
the tree can receive a key at all.

**What you get as a consumer.** Every component page now publishes a real
keyboard table with WCAG and APG references per row, and the components that have
not declared one say *"not declared"* rather than implying they have no keyboard
behaviour. The same declaration is what the manual screen-reader scaffolds cite,
so a tester drives the component's promises rather than the pattern's from
memory.

**Two things this release makes visible rather than fixes.** `DzMenu` and
`DzSidebar` are assigned the APG `menu` and `treeview` patterns but implement
neither pattern's keyboard — their items are links and buttons in document order
with no roving index — and their declarations now say so. And because
`keyboard-spec` is measured against the declared contract instead of against any
key at all, the number of components whose spec exercises everything they promise
is **5**, not the 29 the old presence test reported.
