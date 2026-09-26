<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DzDatePickerEmits, DzDatePickerProps, DzDatePickerSlots } from './DzDatePicker.types.ts'
import { CalendarIcon, ChevronLeft, ChevronRight } from '@lucide/vue'
import {
  DatePickerAnchor,
  DatePickerCalendar,
  DatePickerCell,
  DatePickerCellTrigger,
  DatePickerContent,
  DatePickerField,
  DatePickerGrid,
  DatePickerGridBody,
  DatePickerGridHead,
  DatePickerGridRow,
  DatePickerHeadCell,
  DatePickerHeader,
  DatePickerHeading,
  DatePickerInput,
  DatePickerNext,
  DatePickerPrev,
  DatePickerRoot,
  DatePickerTrigger,
} from 'reka-ui'
/**
 * DzDatePicker -- Date selection using Reka UI DatePicker (ADR-07).
 *
 * Uses @internationalized/date for date manipulation (ADR-13).
 * v-model via defineModel<string>() -- ISO 8601 date string (ADR-16).
 *
 * @example
 * ```vue
 * <DzDatePicker v-model="date" placeholder="Select date" />
 * <DzDatePicker v-model="date" min="2026-01-01" max="2026-12-31" />
 * ```
 */
import { computed, toRef, useAttrs, useId } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDatePicker } from '../../composables/useDatePicker/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { datePickerVariants } from './DzDatePicker.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** The selected date as an ISO 8601 `YYYY-MM-DD` string; the default empty string selects no date. */
const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzDatePickerProps>(), {
  placeholder: undefined,
  min: undefined,
  max: undefined,
  locale: undefined,
  disabled: false,
  size: 'md',
  variant: 'outline',
  name: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzDatePickerEmits>()
defineSlots<DzDatePickerSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const { dateValue, minValue, maxValue, placeholderDate, resolvedLocale, toISOString }
  = useDatePicker({
    modelValue: model,
    min: toRef(() => props.min),
    max: toRef(() => props.max),
    locale: toRef(() => props.locale),
  })

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const resolvedRequired = computed(
  () => props.required || (fieldContext?.isRequired.value ?? false),
)

/** ID for the error message element (for aria-describedby) */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby from prop + own error element + field context */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value)
    parts.push(fieldContext.ariaDescribedby.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

const styles = computed(() =>
  datePickerVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

function handleDateChange(date: DateValue | undefined): void {
  const iso = toISOString(date)
  model.value = iso
  emit('change', iso)
  emit('select', iso)
}

function handleOpenChange(open: boolean): void {
  if (open) {
    emit('open')
  }
  else {
    emit('close')
  }
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

const triggerClasses = computed(() =>
  cn(styles.value.trigger(), attrs.class as string | undefined),
)

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div data-part="root" :class="[ui?.root]" v-bind="dzTestId('dz-date-picker')">
    <DatePickerRoot
      :model-value="dateValue"
      :min-value="minValue"
      :max-value="maxValue"
      :locale="resolvedLocale"
      :disabled="resolvedDisabled"
      :required="resolvedRequired"
      :name="name"
      :placeholder="placeholderDate"
      granularity="day"
      @update:model-value="handleDateChange"
      @update:open="handleOpenChange"
    >
      <DatePickerAnchor>
        <DatePickerField
          :id="resolvedId"
          v-slot="{ segments }"
          data-part="control"
          :class="[triggerClasses, ui?.control]"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="resolvedAriaDescribedby"
          :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
          :data-state="resolvedDisabled ? 'disabled' : 'idle'"
          :data-disabled="resolvedDisabled ? '' : undefined"
          :data-required="resolvedRequired ? '' : undefined"
          :data-invalid="resolvedInvalid ? '' : undefined"
          style="contain: layout style"
          v-bind="{ ...$attrs, class: undefined }"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <!--
          Placeholder text shown only while empty. The segment inputs stay
          mounted (v-show, not v-if) so a programmatic/calendar selection is
          reflected immediately instead of mounting fresh, unpopulated segments.
          Each DatePickerInput renders only its default slot, so the segment
          value must be passed explicitly — otherwise only the literal "/"
          separators show.
        -->
          <span
            v-show="!model && placeholder"
            class="text-[var(--dz-muted-foreground)]"
          >{{ placeholder }}</span>
          <span
            v-show="!(!model && placeholder)"
            class="inline-flex items-center"
          >
            <DatePickerInput
              v-for="(item, index) in segments"
              :key="`${item.part}-${index}`"
              data-part="input"
              :part="item.part"
              :class="[item.part === 'literal' ? styles.field() : styles.fieldInput(), ui?.input]"
            >
              {{ item.value }}
            </DatePickerInput>
          </span>

          <!--
            TASK-N1-O3 / WCAG 2.2 SC 2.5.8: the calendar trigger measured 16x16.
            Plain `dz-target-min` rather than the footprint-neutral `-tight`
            variant: the trigger relies on a logical auto inline-start margin to
            sit at the end of the field, and `.dz-target-min-tight`'s `margin`
            shorthand lives in `@layer dz-base`, which in this build sorts AFTER
            Tailwind's utilities and would therefore overwrite it. The cost is
            recorded instead of hidden: the glyph shifts <= 4px along the inline
            axis, inside a field whose height does not change.
          -->
          <DatePickerTrigger
            data-part="trigger"
            class="ms-auto dz-target-min inline-flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer dz-focus-ring-button"
            :class="[ui?.trigger]"
            :aria-label="ariaLabel ?? 'Open date picker'"
          >
            <CalendarIcon data-part="icon" :class="[styles.icon(), ui?.icon]" aria-hidden="true" />
          </DatePickerTrigger>
        </DatePickerField>
      </DatePickerAnchor>

      <DatePickerContent data-part="content" :class="[styles.content(), ui?.content]" :side-offset="4">
        <DatePickerCalendar v-slot="{ weekDays, grid }" data-part="panel" :class="[styles.calendar(), ui?.panel]">
          <DatePickerHeader data-part="header" :class="[styles.header(), ui?.header]">
            <DatePickerPrev data-part="action" :class="[styles.navButton(), ui?.action]">
              <ChevronLeft class="h-4 w-4" aria-hidden="true" />
            </DatePickerPrev>
            <DatePickerHeading data-part="title" :class="[styles.heading(), ui?.title]" />
            <DatePickerNext data-part="action" :class="[styles.navButton(), ui?.action]">
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </DatePickerNext>
          </DatePickerHeader>

          <DatePickerGrid v-for="month in grid" :key="month.value.toString()" data-part="group" :class="[styles.grid(), ui?.group]">
            <DatePickerGridHead>
              <DatePickerGridRow data-part="row" :class="[ui?.row]">
                <DatePickerHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  data-part="cell"
                  :class="[styles.headCell(), ui?.cell]"
                >
                  {{ day }}
                </DatePickerHeadCell>
              </DatePickerGridRow>
            </DatePickerGridHead>
            <DatePickerGridBody>
              <DatePickerGridRow v-for="(weekDates, index) in month.rows" :key="`week-${index}`" data-part="row" :class="[ui?.row]">
                <DatePickerCell
                  v-for="weekDate in weekDates"
                  :key="weekDate.toString()"
                  :date="weekDate"
                  data-part="cell"
                  :class="[styles.cell(), ui?.cell]"
                >
                  <DatePickerCellTrigger
                    :day="weekDate"
                    :month="month.value"
                    data-part="item"
                    :class="[styles.cellTrigger(), ui?.item]"
                  />
                </DatePickerCell>
              </DatePickerGridRow>
            </DatePickerGridBody>
          </DatePickerGrid>
        </DatePickerCalendar>
      </DatePickerContent>
    </DatePickerRoot>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      data-part="error"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      :class="[ui?.error]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
