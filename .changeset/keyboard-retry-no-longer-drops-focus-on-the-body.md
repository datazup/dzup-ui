---
"@dzup-ui/core": patch
---

Keyboard activation of the async-options retry no longer drops focus on `document.body`.

`useAsyncOptions().canRetry` is `state === 'error'` and nothing else, so the retry
control unmounts as it is activated. RESIDUAL-04 fixed the pointer path with
`@mousedown.prevent`; that binding does nothing for `Enter`/`Space`, where the
control really does own focus when it disappears. Measured in real chromium:
`document.activeElement` was `BODY` after both keys on `DzCombobox`,
`DzMultiSelect` and `DzSelect`.

Renderer contract C9.4's second half is now implemented once, in
`optionsStateFocus.ts`, and called by both hosts of the row — the shared
`DzOptionsState` and `DzSelect`'s own copy of it. When the retry owned focus and
nothing else claimed it, focus returns to the async-options row, which stays
mounted and stays inside the panel. A pointer press is unaffected (it never owns
focus), and a host that restores focus itself still wins — `DzMention` keeps
returning focus to its text control.

The row gains `tabindex="-1"` and a focus ring so the destination is reachable and
visible. `DzSelect`'s retry also gains `@mousedown.prevent`, which every other host
of the seam already had.
