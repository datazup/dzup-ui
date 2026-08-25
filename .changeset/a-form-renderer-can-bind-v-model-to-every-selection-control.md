---
"@dzup-ui/core": minor
---

**`DzCascader` and `DzTreeSelect` now take `v-model` as well as `v-model:value`, thirteen selection controls reflect the states their types promise, `DzRadio` and `DzRadioGroup` read the field context they were ignoring, and `DzSelect` stops rendering an empty field on the server.**

The second slice of `TASK-FORM-OSS-02`. Clause references are to
`docs/program-2026-08/form-control-renderer-contract.md`; the per-control status
is `docs/program-2026-08/form-controls-readiness-matrix.md`.

**Both model names, one value** (C1). Seven Core controls bind their value to
`v-model:value` and every other control binds `v-model`. That is invisible until
something binds a control whose name it does not know — a schema-driven
renderer, for instance, which holds a component and a codec and binds `v-model`
to whatever the registry names. On those seven it bound *nothing*: no error, no
warning, a control that renders and never reports a value.

`DzCascader` and `DzTreeSelect` now accept both. `v-model:value` is unchanged
and every existing template keeps working; `v-model` reaches the same value.
Whichever a consumer binds is the one that carries it, and binding both keeps
them in step. The merge is one composable, `useDualModel`, exported from
`@dzup-ui/core` — the remaining five controls follow in the next slices.

**States that were only in the type** (C3). Six props were declared, defaulted,
and read nowhere: `DzCascader.loading`, `DzListbox.loading` and `.readonly`,
`DzTreeSelect.loading` and `.required`, `DzCombobox.required`,
`DzMultiSelect.required`. All now reach the DOM.

Alongside them, `data-required` on `DzSelect`, `DzSwitch`, `DzCheckbox`,
`DzRadioGroup`, `DzListbox` and `DzTransfer`. Those six already rendered
`aria-required` — Reka supplies it — but not the presence-only attribute ADR-19
§4 names, so a stylesheet had no way to show a required field as required.

**Identity the field context was already offering** (C2). `DzRadioGroup` merged
required, describedby and invalid from `DzFormField` and not `disabled`, so
every radio inside a disabled field stayed live. `DzRadio` read no context at
all and declared an `ariaInvalid` prop that did nothing.

**`DzSelect` renders its value on the server** (C5). `SelectValue` resolves a
label from Reka's item registry, and that registry fills when the *content*
mounts — which never happens during SSR. A select with a value therefore
server-rendered an empty placeholder and filled itself in after hydration: a
field that looks unset until JavaScript arrives. The label is now computed from
`items`, which is already on the component. Unset selects are untouched — the
first attempt supplied slot content unconditionally, which replaced the
placeholder too and emptied the accessible name of every empty select.

**`DzSwitch` honours `prefers-reduced-motion`** (C7). The thumb is the one part
that moves, and it slid regardless.

**`DzPersonaSelector` was never broken.** It renders a `DzCombobox`, and
injection walks the component tree, so the field context reaches the delegate
directly. The readiness matrix now records the delegation instead of reporting
three gaps against a wrapper that correctly does nothing.

**Tests.** `packages/core/tests/ssr/form-controls-ssr.spec.ts` grew the
selection controls — each rendered with a value, `DzCascader` and `DzTreeSelect`
through *both* model names. `useDualModel` has its own unit suite, and the
contract specs gained the dual-model and state assertions. Nothing existing was
edited: all 4,317 core tests pass, including the 69 that already covered these
two components.
