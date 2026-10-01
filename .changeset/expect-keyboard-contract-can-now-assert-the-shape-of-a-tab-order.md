---
"@dzup-ui/testing": minor
---

`expectKeyboardContract` can now assert the shape of a tab order

A new `tabStops` option, for the one row the existing options cannot evidence: a
declared `Tab`.

```ts
expectKeyboardContract(wrapper, anatomy, {
  tabStops: { of: '[role="checkbox"]', expect: 'each' },
})
```

**Why neither existing option works.** `handled: ['Tab']` asserts the component
called `preventDefault()`, which is what a focus **trap** does and the opposite of a
row that says focus moves. `platform: ['Tab']` fails, deliberately: the table of
elements whose documented behaviour is a given key credits activation and text entry
only, **never navigation**, because `Tab` is not a behaviour of an element — it is
the document's focus order, and crediting any focusable node for any `Tab` row is
the verdict this check exists to refuse.

**A `Tab` row makes one of two opposite claims**, and telling them apart is the
whole content of the row:

| The row says | Pass | Mechanism |
|---|---|---|
| "each box in the group is its own tab stop" | `expect: 'each'` | every node in the order |
| "the toolbar is one tab stop" | `expect: 'one'` | a roving `tabindex`, which takes the siblings **out** of the order |

An audit found the first of those published against a citation that proves the
second, so a single `Tab` key list could not have told them apart either.

**What it asserts**, and it fails on any of them: `Tab` is in the declared contract;
the selector matches at least two nodes, because a claim about order over one node is
not a claim; exactly all of them or exactly one is in the tab order; and the key is
**driven** — a cancelable `Tab` keydown is dispatched and the component must not have
consumed it. The root counts when it matches the selector, which is how a roving
focus group built on the container (Reka's `RovingFocusGroup` puts `tabindex="0"` on
the group and `-1` on every item) reads as one tab stop rather than as none.

It does not prove the browser's order matches DOM order — `tabindex` above zero,
`inert` and portals all reorder it, and that belongs in a browser lane. Existing
calls are unaffected; the option is opt-in.
