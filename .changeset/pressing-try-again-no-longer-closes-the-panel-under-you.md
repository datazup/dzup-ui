---
"@dzup-ui/core": patch
---

**Pressing `Try again` in a portalled options panel no longer closes the panel under you.**

Every selection control on the async-options seam renders one shared row,
`DzOptionsState`, and that row's retry control **removed itself as it was
pressed**: `useAsyncOptions`'s `canRetry` is `state === 'error'` and nothing
else, so activating the retry made the state `loading`, which unrendered the
button. A pointer press focuses a `<button>` first, so removing it handed focus
to `document.body` — and a portalled panel is a dismissable layer, which reads
focus arriving on `body` as focus leaving the layer and closes. The user asked
for a retry and got an empty, closed field; the reload they triggered ran and
its result was never shown.

Measured in real chromium on `DzCombobox`: after the press,
`[data-part="content"]` count `0`, the retry button detached, `activeElement`
`BODY`. With the press no longer moving focus, content `1`,
`data-state="open"`, and focus still on the panel's own input.

The retry control now prevents the mousedown default, so focus stays where the
panel put it — which is also the WAI-ARIA combobox rule: pressing a control
inside the panel does not change the panel's focus owner. The `click` still
fires, so keyboard activation is unchanged, and so are the row's markup, parts,
messages and `retry` event.

**This was already the renderer contract, and one control out of seven kept it.**
`DzMention` carries `@mousedown.prevent` on its own `DzOptionsState` instance and
a contract spec that asserts it — *"A pointer retry must not steal focus from the
text control (C9.4)"*. The other six controls never did. Putting the rule on the
shared row makes all of them keep it, which is what the shared row exists for:
seven near-copies of one behaviour is the failure the seam was written to avoid.
`DzMention`'s own binding stays, harmlessly, and its contract spec still passes.

**Affects the two controls whose panels are non-modal dismissable layers,
`DzCombobox` and `DzMultiSelect`.** `DzSelect`, `DzListbox`, `DzCascader`,
`DzTreeSelect`, `DzMention` and `DzTransfer` were not reachable by this path —
their panels either trap focus or are not layers — and their behaviour does not
change.

Pinned by the existing `Async Options: loading → ready → error → retry` stories,
which drive the retry with a real focusing pointer press in the Storybook browser
lane. They were the two long-standing reds of that lane (R5-O9 `F-5`), diagnosed
until now as a harness artefact.
