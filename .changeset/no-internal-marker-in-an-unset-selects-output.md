---
"@dzup-ui/core": patch
---

`DzSelect` keeps its internal empty-value marker out of the rendered output

Reka's `SelectItem` throws on an empty `value`, so `DzSelect` maps an item that
declares `''` onto an internal marker, `__DZ_SELECT_EMPTY__`. That mapping is
necessary and unchanged. It was also applied to the value handed to `SelectRoot` —
which is not necessary: Reka's own error message documents `''` as the value that
*"can be set to an empty string to clear the selection and show the placeholder"*.

`SelectRoot` spreads its `modelValue` onto the hidden native `<select>` it renders
for form participation, so the marker shipped verbatim in the rendered output of
**every** unset select: `value="__DZ_SELECT_EMPTY__"`.

That was not only cosmetic, which is how it was first filed. Reka's
`shouldShowPlaceholder` tests for `''`, and the marker is not `''` — so an unset
select never received `data-placeholder` on its trigger, and this component's own
`data-[placeholder]:text-[var(--dz-muted-foreground)]` rule could never apply. The
placeholder of every unset select painted in the normal foreground colour instead
of the muted placeholder colour.

The root now receives the model unchanged, and falls back to the marker **only**
when an item actually claims the empty string — an *"— any —"* row, whose internal
value is the marker and which the root's value must match for the panel to show it
as chosen. That behaviour is preserved exactly, including when the items arrive
late through `optionsState`.

**What this changes for you.** An unset select's hidden native `<select>` carries
`value=""` rather than `value="__DZ_SELECT_EMPTY__"`, and its trigger now carries
`data-placeholder`, so placeholder text renders muted. If you have visual baselines
for an unset select, that colour changes — and what the old baseline recorded was a
placeholder styled as a value. No prop, emit, slot, `data-part`, `data-state` value
or message key changed.

`undefined` was considered for the unset case and rejected: `SelectRoot` computes
`passive: props.modelValue === void 0`, so handing it `undefined` would make the
root uncontrolled.
