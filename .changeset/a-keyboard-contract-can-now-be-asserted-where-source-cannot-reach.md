---
"@dzup-ui/testing": patch
---

`expectKeyboardContract` can assert a platform-owned key, and a `when` may name a prop

`expectKeyboardContract` was exported and **called by no component spec**. Wiring
it into eight of them found two things the helper could not express, so it gains two
options. Both are additive: an existing call behaves exactly as it did.

**`platform: readonly string[]`** — keys the caller asserts are owned by a native
element *in the rendered tree*. For each one the check fails unless the mounted DOM
contains an element whose documented HTML behaviour is that key: a `<button>`,
`<summary>` or `<select>` for Enter and Space, an `<a href>` for Enter, a checkbox
or radio `<input>` for Space, a text field for a character, a `<dialog>` for Escape,
or a node carrying an activation role.

This is the half of a keyboard contract that only a runtime check can see. Four
components in `@dzup-ui/core` — `DzCheckboxGroup`, `DzCollapse`, `DzFieldArray`,
`DzRadioGroup` — declare a key whose receiving node is the *consumer's*: the
component is a `<div>` and a `<slot />`, so no source scan can say whether anything
answers the key, only a spec that mounts it with real children.

It is **not** interchangeable with `handled`, which asserts that the component
called `preventDefault()`. `handled` is right for a key the component overrides and
wrong for a platform key: Reka's `CheckboxRoot` and `RadioGroupItem` prevent `Enter`
only, because Space on a `<button>` *is* the activation and preventing it would
break the toggle. Like the static checker, `platform` credits activation and text
entry only and **never navigation** — a declared arrow is a claim about roving
focus, and roving focus always takes code.

**`conditions: readonly string[]`** — single-word `when` values that are legitimate
contexts rather than typos, in practice the component's own prop names. The
coherence check calls a single lowercase `when` that is neither a declared part nor
a declared state *"almost always a typo"*, and **twelve values in live use**
(`clickable`, `interactive`, `open`, `closable`, `dropzone`, …) are prop names. The
rule had never been called, so neither half was ever true; the first spec to call it
failed on arrival. The decision is that a `when` may name a prop, made sayable
rather than by deleting the rule — the rule is the only thing between a published row
and a context that does not exist. The failure message now says how to admit one.

`keyboard.ts` also gains the unit spec it never had: 24 tests, pinning both new
options in both directions, because an assertion helper that cannot fail is worse
than no helper at all.
