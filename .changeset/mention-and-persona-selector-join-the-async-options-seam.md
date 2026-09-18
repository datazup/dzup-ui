---
"@dzup-ui/contracts": patch
"@dzup-ui/core": patch
---

**`DzMention` and `DzPersonaSelector` can be driven by a remote option source through the same contract as the seven selection controls.**

`TASK-R3-O3`, renderer contract C9. Additive: without `optionsState` both
components behave as before.

**`DzMention`** now takes `optionsState`, `optionsError` and `optionsRetryable`
and emits `loadOptions` / `retryOptions`. Pass `optionsState` and each trigger
token asks the host — reason `open` for a new token, `search` as the query grows,
with an `AbortSignal` that the next request aborts — and the host writes its
answer into the trigger's `options`. The menu shows the shared loading, empty and
error rows (`options-state`, `options-message`, `options-retry`), and retry keeps
focus in the text field. The `search` event still fires first and carries the
trigger character.

The **async resolver** form (`options: (query) => Promise<…>`) keeps working and
now runs on the same seam: a newer query aborts the older request instead of a
private counter, and **a rejected resolver shows the error row with a retry**
where it used to leave an unhandled rejection and the previous list on screen.
Its loading and no-results rows, and the `#loading` / `#empty` slots, are
unchanged. `aria-controls` is now only set while the suggestion list is actually
rendered.

**`DzPersonaSelector`** declares the seam and forwards it to the `DzCombobox` it
renders. It was reachable before only through untyped attribute fallthrough.

`@dzup-ui/contracts`: `ANATOMY_PART_EXTENSIONS` lists `DzMention` as an owner of
the three `options-*` part names.
