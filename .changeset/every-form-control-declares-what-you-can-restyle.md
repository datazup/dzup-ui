---
"@dzup-ui/core": patch
"@dzup-ui/contracts": patch
---

**Every form control declares its styling surface — and five of them stop pinning things to the wrong edge in Arabic.**

This finishes the ADR-19 rollout across the catalogue's risk-bearing components.
`forms` was the last family and the largest: 24 more components now declare
their parts, their states and a typed per-part `ui` override, so restyling a
combobox's option row, a slider's thumb, a date picker's month grid or a
transfer list's pane no longer means writing a descendant selector against a
class name `tailwind-variants` is free to change.

**Every Tier B, C and D component in the library now declares an anatomy.**

**New `data-part` and `ui` surfaces**

| Group | Components | Parts you can now address |
|---|---|---|
| Selection controls | `DzCheckbox`, `DzCheckboxGroup`, `DzRadio`, `DzRadioGroup`, `DzSwitch` | `root`, `control`, `indicator`, `label` |
| Value controls | `DzSlider`, `DzRangeSlider`, `DzKnob`, `DzRating`, `DzInplace` | `root`, `control`, `indicator`, `item`, `item-indicator`, `label`, `trigger`, `content`, `icon`, `error` |
| Pickers | `DzColorPicker`, `DzDatePicker`, `DzDateRangePicker`, `DzTimePicker` | `root`, `control`, `trigger`, `label`, `icon`, `clear`, `content`, `panel`, `header`, `title`, `action`, `group`, `row`, `cell`, `item`, `input`, `list`, `separator`, `footer`, `indicator`, `error` |
| Option controls | `DzCombobox`, `DzListbox`, `DzMultiSelect`, `DzCascader`, `DzTreeSelect`, `DzTransfer`, `DzPersonaSelector`, `DzMention`, `DzTagsInput` | `root`, `control`, `input`, `trigger`, `clear`, `icon`, `content`, `viewport`, `panel`, `list`, `group`, `group-label`, `item`, `item-label`, `item-indicator`, `body`, `header`, `hint`, `loader`, `empty`, `error`, `options-state`, `options-message`, `options-retry` |
| Renderless | `DzFieldArray` | `parts: 'none'` — it renders no element of its own, and now says so |

```vue
<DzCheckbox v-model="agreed" :ui="{ control: 'rounded-full', label: 'text-sm' }">I agree</DzCheckbox>
<DzSlider v-model="volume" :ui="{ indicator: 'size-5 shadow-lg' }" />
<DzCombobox :items="items" :ui="{ item: 'rounded-lg', 'item-indicator': 'opacity-60' }" />
<DzTransfer :source="items" :ui="{ list: 'w-72', header: 'font-semibold' }" />
<DzDatePicker v-model="date" :ui="{ item: 'rounded-full', title: 'uppercase tracking-wide' }" />
```

**The async options row is part of the contract now.** The tri-state row a
selection control shows while its options are loading, empty or failed emits
`options-state`, `options-message` and `options-retry`, and every control that
renders it — `DzCascader`, `DzCombobox`, `DzListbox`, `DzMultiSelect`,
`DzPersonaSelector`, `DzSelect`, `DzTransfer`, `DzTreeSelect` — now declares
those three names. They were emitted and undeclared in every one of them.

**Eight real RTL fixes, found by declaring rather than by reading.**

`validate:rtl` reads a component's declared `rtl.mirrors` and then checks its
source for physical utilities. Declaring these turned up geometry that promised
to follow the reading direction and did not:

- **`DzRating`**'s partial-star overlay was pinned to the screen's left edge and
  clipped by width, so in an Arabic document it filled the wrong half of every
  star. Now a logical inset.
- **`DzTimePicker`**'s clear control was pinned to the screen's right edge rather
  than to the end of the field. Now a logical inset.
- **`DzCombobox`** and **`DzMultiSelect`** positioned the option check mark and
  indented the option label physically. Now logical.
- **`DzDatePicker`**, **`DzDateRangePicker`** and **`DzPersonaSelector`** used
  physical `ml-`/`pl-` for the calendar trigger and the persona row. Now `ms-`/`ps-`.

**In a left-to-right document nothing moves by a pixel.** The logical properties
compile to the same edges the physical ones did.

**Nothing is removed and every existing override keeps working.** `ui` is a new
optional prop on 21 components; `class` lands exactly where it always did; no
part was renamed and no `data-state` value changed. In `@dzup-ui/contracts`, the
three `options-*` names move from `held` to `reviewed` in
`ANATOMY_PART_EXTENSIONS`, which is a documentation change to an already-exported
constant.
