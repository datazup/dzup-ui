/**
 * Forms family -- public exports.
 *
 * @module @dzup-ui/core/components/forms
 */

// Types — DzCheckbox
export type { DzCheckboxEmits, DzCheckboxProps, DzCheckboxSlots } from './DzCheckbox.types.ts'
// Variants (for consumer customization)
export { type CheckboxVariantProps, checkboxVariants } from './DzCheckbox.variants.ts'
export { default as DzCheckbox } from './DzCheckbox.vue'
// Types — DzCheckboxGroup
export type {
  DzCheckboxGroupContext,
  DzCheckboxGroupEmits,
  DzCheckboxGroupProps,
  DzCheckboxGroupSlots,
} from './DzCheckboxGroup.types.ts'
// Injection keys (runtime exports)
export { DZ_CHECKBOX_GROUP_KEY } from './DzCheckboxGroup.types.ts'
export { default as DzCheckboxGroup } from './DzCheckboxGroup.vue'
export type {
  DzColorPickerEmits,
  DzColorPickerProps,
  DzColorPickerSlots,
} from './DzColorPicker.types.ts'
export { type ColorPickerVariantProps, colorPickerVariants } from './DzColorPicker.variants.ts'
// ── DzColorPicker ──
export { default as DzColorPicker } from './DzColorPicker.vue'
// Types — DzCombobox
export type {
  DzComboboxEmits,
  DzComboboxProps,
  DzComboboxSlots,
} from './DzCombobox.types.ts'
export { type ComboboxVariantProps, comboboxVariants } from './DzCombobox.variants.ts'
export { default as DzCombobox } from './DzCombobox.vue'
// Types — DzDatePicker
export type {
  DzDatePickerEmits,
  DzDatePickerProps,
  DzDatePickerSlots,
} from './DzDatePicker.types.ts'
export { type DatePickerVariantProps, datePickerVariants } from './DzDatePicker.variants.ts'
export { default as DzDatePicker } from './DzDatePicker.vue'
// Types — DzDateRangePicker
export type {
  DateRangeValue,
  DzDateRangePickerEmits,
  DzDateRangePickerProps,
  DzDateRangePickerSlots,
} from './DzDateRangePicker.types.ts'

export { type DateRangePickerVariantProps, dateRangePickerVariants } from './DzDateRangePicker.variants.ts'

export { default as DzDateRangePicker } from './DzDateRangePicker.vue'

export type {
  DzFileUploadEmits,
  DzFileUploadProps,
  DzFileUploadSlots,
  FileUploadError,
} from './DzFileUpload.types.ts'

export { type FileUploadVariantProps, fileUploadVariants } from './DzFileUpload.variants.ts'

// ── DzFileUpload ──
export { default as DzFileUpload } from './DzFileUpload.vue'

export { default as DzFormDescription } from './DzFormDescription.vue'

// Types — DzFormField
export type { DzFormFieldProps, DzFormFieldSlots } from './DzFormField.types.ts'

// Components
export { default as DzFormField } from './DzFormField.vue'

export { default as DzFormLabel } from './DzFormLabel.vue'

export { default as DzFormMessage } from './DzFormMessage.vue'

// Types — DzMultiSelect
export type {
  DzMultiSelectEmits,
  DzMultiSelectProps,
  DzMultiSelectSlots,
} from './DzMultiSelect.types.ts'

export { type MultiSelectVariantProps, multiSelectVariants } from './DzMultiSelect.variants.ts'

export { default as DzMultiSelect } from './DzMultiSelect.vue'

// Types — DzPersonaSelector
export type {
  DzPersonaSelectorEmits,
  DzPersonaSelectorProps,
  DzPersonaSelectorSlots,
  Persona,
} from './DzPersonaSelector.types.ts'
export { default as DzPersonaSelector } from './DzPersonaSelector.vue'

// Types — DzRadio
export type { DzRadioProps, DzRadioSlots } from './DzRadio.types.ts'

export { type RadioVariantProps, radioVariants } from './DzRadio.variants.ts'
export { default as DzRadio } from './DzRadio.vue'
// Types — DzRadioGroup
export type {
  DzRadioGroupEmits,
  DzRadioGroupProps,
  DzRadioGroupSlots,
} from './DzRadioGroup.types.ts'
export { default as DzRadioGroup } from './DzRadioGroup.vue'
export type {
  DzRangeSliderEmits,
  DzRangeSliderProps,
  DzRangeSliderSlots,
} from './DzRangeSlider.types.ts'
export { type RangeSliderVariantProps, rangeSliderVariants } from './DzRangeSlider.variants.ts'
// ── DzRangeSlider ──
export { default as DzRangeSlider } from './DzRangeSlider.vue'
// Types — DzSelect
export type {
  DzSelectEmits,
  DzSelectItem,
  DzSelectProps,
  DzSelectSlots,
} from './DzSelect.types.ts'
export { type SelectVariantProps, selectVariants } from './DzSelect.variants.ts'
export { default as DzSelect } from './DzSelect.vue'

// Types — DzSlider
export type {
  DzSliderEmits,
  DzSliderProps,
  DzSliderSlots,
} from './DzSlider.types.ts'

export { type SliderVariantProps, sliderVariants } from './DzSlider.variants.ts'

export { default as DzSlider } from './DzSlider.vue'

// Types — DzSwitch
export type { DzSwitchEmits, DzSwitchProps, DzSwitchSlots } from './DzSwitch.types.ts'

export { type SwitchVariantProps, switchVariants } from './DzSwitch.variants.ts'

export { default as DzSwitch } from './DzSwitch.vue'

// Types — DzTimePicker
export type {
  DzTimePickerEmits,
  DzTimePickerProps,
  DzTimePickerSlots,
} from './DzTimePicker.types.ts'

export { type TimePickerVariantProps, timePickerVariants } from './DzTimePicker.variants.ts'

export { default as DzTimePicker } from './DzTimePicker.vue'

export type {
  DzTransferEmits,
  DzTransferProps,
  DzTransferSlots,
  TransferChangePayload,
  TransferItem,
} from './DzTransfer.types.ts'

export { type TransferVariantProps, transferVariants } from './DzTransfer.variants.ts'

// ── DzTransfer ──
export { default as DzTransfer } from './DzTransfer.vue'
