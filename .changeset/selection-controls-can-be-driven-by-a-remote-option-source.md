---
"@dzup-ui/contracts": minor
"@dzup-ui/core": minor
---

**All seven selection controls can now be driven by a remote option source through one contract, `DzFileUpload` can hold file references instead of binaries, and ten value codecs define the seam a form renderer binds through.**

`TASK-FORM-OSS-03`. Clause references are to
`docs/program-2026-08/form-control-renderer-contract.md`.

**One async-options seam, not seven** (C9). `DzSelect`, `DzMultiSelect`,
`DzCombobox`, `DzListbox`, `DzCascader`, `DzTreeSelect` and `DzTransfer` each
took a static array and had nowhere to say "loading", "that failed", or "there
is nothing to show" — so a renderer whose options come from a data source had to
grow one adapter per control.

They now share `AsyncOptionsProps` (`optionsState`, `optionsError`,
`optionsRetryable`), `AsyncOptionsEmits` (`loadOptions`, `retryOptions`), one
`useAsyncOptions` composable, and one `options-state` slot. Five states rather
than a boolean `loading`, because a failed load and a successful one that
returned nothing are not the same thing and a boolean cannot tell you which
happened.

**Core never performs the request.** No URL, no credential, no `fetch`. The
control emits `loadOptions` with a query, a reason, and an `AbortSignal`, and
the host owns execution, fencing and caching (form spec 04 §5, spec 06). Every
request supersedes the last and aborts its signal *before* emitting, so a host
that fences on the signal never has two in flight. All of this is inert unless
`optionsState` is passed: a control with a plain array behaves exactly as it did.

**`DzFileUpload` gains `model-mode="ref"`** (C1). The default stays `File[]`.
In reference mode `v-model` holds `DzFileRef[]` — `{ id, name, size, type,
status, error? }`, all JSON — and the binary reaches the host through
`uploadRequest` instead. A form document is persisted JSON, so a `File` in the
model is lost on reload and leaks a live handle into a builder preview.
Removing a row that is still uploading aborts it.

This one widens a type: `v-model` is `File[] | DzFileRef[]`, so a consumer who
annotated their ref as `File[]` widens it to `DzFileUploadValue`. Runtime
behaviour in the default mode is unchanged.

**Ten value codecs**, in `@dzup-ui/contracts`: `emptyValueFor`, `isEmptyValue`,
`toNumberValue`, `toIsoDate`/`fromIsoDate`, `toIsoTime`/`fromIsoTime`,
`toFileRef`, `isFileRef`, `isJsonSerializable`. Pure — no Vue, no DOM, no clock,
no locale — so they run on a server, in a test, and inside a builder preview.

Two of them are worth reading before use. `isEmptyValue(false)` is **false**:
an unchecked box has answered, and conflating that with absence is how a
mandatory checkbox comes to be satisfied by never being touched.
`toIsoDate` takes date *parts*, not a `Date`: `new Date('2026-08-24')` is
midnight UTC and formats as the 23rd in any negative offset.

**Where the codecs live, and why.** In `@dzup-ui/contracts`, which is types-only
with a stated exception for `assertNever` — these are the same kind of thing.
They also could not go in `@dzup-ui/core`: its public surface is generated from
`public-api.manifest.json`, the ownership schema has no `utility` kind, and the
`unclassified` ceiling of 29 only ratchets down. Ten more functions of the class
`cn` and `themeScript` already occupy would have taken it to 39. Raising that is
a maintainer decision, so the ledger asks for it rather than taking it.

**Events are camelCase.** `loadOptions`, `retryOptions`, `uploadRequest` — the
repository lints custom event names and had no kebab-cased ones before these.
Nothing changes for a consumer: `@load-options="…"` in a template still resolves.
