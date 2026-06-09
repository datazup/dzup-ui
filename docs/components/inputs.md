# Inputs

Reference for the **Inputs** component family as exercised on the `/inputs` route of
`apps/sandbox` (`apps/sandbox/src/pages/InputsPage.vue`).

The page is a live playground for the form-entry components exported from
`@dzup-ui/core`: text inputs, numeric/specialty inputs, toggles, choice pickers,
date/time pickers, sliders, and file/color pickers. Every demo binds with
`v-model` and prints its live state below the control.

## Components covered

`DzInput`, `DzInputGroup`, `DzNumberInput`, `DzPasswordInput`, `DzSearchInput`,
`DzOtpInput`, `DzTextarea`, `DzCheckbox`, `DzCheckboxGroup`, `DzRadio`,
`DzRadioGroup`, `DzSwitch`, `DzSelect`, `DzMultiSelect`, `DzCombobox`,
`DzDatePicker`, `DzDateRangePicker`, `DzTimePicker`, `DzSlider`, `DzRangeSlider`,
`DzFileUpload`, `DzColorPicker`.

Shared axes used throughout the page:

- **sizes** — `xs` `sm` `md` `lg` `xl`
- **variants** — `outline` `filled` `underlined`
- **tones** — `neutral` `primary` `success` `warning` `danger` `info`
- **group sizes** — `sm` `md` `lg`

---

## Sections

### Text Input
A single `DzInput` bound to `v-model`, with a live readout of the current value.
The baseline demonstration of the component.

### Sizes
One `DzInput` per canonical size (`xs`–`xl`), rendered from the `sizes` array so
you can compare control heights side by side.

### Variants
The three `InputVariant` values shown as separate inputs: `outline`, `filled`,
and `underlined`.

### Variant × Tone matrix
A 3 × 6 grid (variants × tones) of `size="sm"` inputs. Intended as a visual
regression surface — use it to spot broken compound variants where a specific
variant/tone combination renders incorrectly.

### States
A stack of `DzInput` instances demonstrating each interaction state:
`normal`, `disabled`, `readonly` (with a fixed `model-value`), `loading`,
`invalid` (with an `error` message), and `clearable`. The clearable input wires
`@clear` to a counter so you can confirm the clear event fires.

### Validation
Validation affordances side by side: a `required` field, an `invalid` field with
an `error` message, and one input per semantic tone (`success`, `warning`,
`danger`, `info`) to show tone-driven validation styling.

### Prefix & suffix slots (DzInput)
Demonstrates the `#prefix` and `#suffix` slots on `DzInput` directly — a search
input with a leading magnifier icon, and an email input with a leading envelope
icon plus a trailing `.com` text suffix.

### Input groups (DzInputGroup)
`DzInputGroup` attaches text or icon addons to either end of an inner `DzInput`.
Examples: a URL (`https://` prefix + `.com` suffix), a subdomain (`.datazup.io`
suffix), a currency field (`$` prefix + `USD` suffix), and a weight field (`kg`
suffix). The same `size` must be passed to both the group and the inner input so
heights and corners align.

**Group sizes (sm / md / lg)** — a sub-section repeating an `@`-prefixed,
`.dev`-suffixed username group across the three group sizes to show addon and
input edges staying aligned.

> Note: the page includes a sandbox-only CSS `:deep()` override to flatten the
> inner input's rounded corners inside the group so the control renders as one
> continuous element.

### Email Input
A `DzInput` with `type="email"` and a live value readout.

### Number Input
A baseline `DzNumberInput` bound to a numeric `v-model`.

### Number Input — constraints
`DzNumberInput` with `min`, `max`, and `step` constraints, plus the `#prefix`
slot (a `$` for the price field). Wires `@increment` / `@decrement` (which fire
alongside `update:modelValue`) into an event log that records the last five
spinner/arrow-key events. Two fields: a price (min 0, max 1000, step 0.5) and a
quantity (min 0, max 10, step 1).

### Password Input
A `DzPasswordInput` with a value readout (includes the built-in
show/hide toggle).

### Search Input
A `DzSearchInput` with a live query readout.

### OTP / PIN Input (DzOtpInput)
Fixed-length code entry powered by Reka UI's `PinInput`. Three configurations:
4-digit numeric, 6-digit numeric, and 6-digit masked. Each fires `@complete`
when all digits are filled; completions feed a shared event log.

### Textarea
A baseline `DzTextarea` with a live character-count readout.

### Textarea — configuration
Configuration options for `DzTextarea`: `rows` (initial height, shown at 2/5/8
rows), `maxlength` (hard cap, with an 80-char counter that turns a warning color
near the limit), and `autoResize` (grows up to `maxRows`, here 8, as the user
types).

### Toggles — Checkbox
`DzCheckbox` variations: a standalone checkbox, an `indeterminate` (mixed) state,
the three sizes (`sm`/`md`/`lg`), a disabled+checked checkbox, and a horizontal
`DzCheckboxGroup` managing an array `v-model` of notification channels.

### Toggles — Radio
`DzRadio` must live inside a `DzRadioGroup`, which owns the `v-model`. Two groups:
a vertical billing-plan group (including a disabled option) and a horizontal size
group.

### Toggles — Switch
`DzSwitch` examples: two labeled switches bound to state, the three sizes, and a
disabled+checked switch.

### Choice — Select
`DzSelect` dropdown selection. Shows a basic framework picker, a `searchable`
country picker with a custom `search-placeholder` (and a disabled item), plus
`disabled` and `invalid` (with `error`) states. Items are `DzSelectItem[]`.

### Choice — MultiSelect & Combobox
`DzMultiSelect` with `maxSelections` (capped at 3) bound to an array `v-model`,
and `DzCombobox` supporting free-text entry plus filtering against the item list.

### Date & time pickers
Calendar- and clock-driven entry; date values are ISO 8601 strings.
- `DzDatePicker` — single date with `min`/`max` bounds.
- `DzDateRangePicker` — start/end range bound to a `{ start, end }` object.
- `DzTimePicker` — locale-default time entry.
- `DzTimePicker` — 24-hour mode (`:hour12="false"`) with 15-minute steps.

### Sliders
- `DzSlider` — single-thumb, default primary tone (0–100).
- `DzSlider` — single-thumb with `tone="danger"`.
- `DzRangeSlider` — dual-thumb range bound to a `[number, number]` tuple.
- `DzSlider` — disabled state.

### File upload
`DzFileUpload` bound to a `File[]` `v-model`. Two demos: single-file (filtered to
`image/*` with a 2 MB `maxSize`) and multiple files (`multiple`, `maxFiles="5"`).

### Color picker
`DzColorPicker` with `show-input` enabled and a `presets` swatch palette, bound
to a hex-string `v-model`.
