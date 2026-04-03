<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type {
  DateRangeValue,
  DzDateRangePickerEmits,
  DzDateRangePickerProps,
  DzDateRangePickerSlots,
} from './DzDateRangePicker.types.ts'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
  DateRangePickerAnchor,
  DateRangePickerCalendar,
  DateRangePickerCell,
  DateRangePickerCellTrigger,
  DateRangePickerContent,
  DateRangePickerField,
  DateRangePickerGrid,
  DateRangePickerGridBody,
  DateRangePickerGridHead,
  DateRangePickerGridRow,
  DateRangePickerHeadCell,
  DateRangePickerHeader,
  DateRangePickerHeading,
  DateRangePickerInput,
  DateRangePickerNext,
  DateRangePickerPrev,
  DateRangePickerRoot,
  DateRangePickerTrigger,
} from 'reka-ui'
/**
 * DzDateRangePicker -- Date range selection using Reka UI (ADR-07).
 *
 * Uses @internationalized/date for date manipulation (ADR-13).
 * v-model via defineModel<DateRangeValue>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzDateRangePicker v-model="range" placeholder="Select range" />
 * ```
 */
import { computed, toRef, useAttrs } from 'vue'
import { useDatePicker } from '../../composables/useDatePicker/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { dateRangePickerVariants } from './DzDateRangePicker.variants.ts'

const model = defineModel<DateRangeValue>({ default: () => ({ start: '', end: '' }) })

const props = withDefaults(defineProps<DzDateRangePickerProps>(), {
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

const emit = defineEmits<DzDateRangePickerEmits>()
defineSlots<DzDateRangePickerSlots>()

const attrs = useAttrs()
const fieldContext = useFormFieldContext()

const startPicker = useDatePicker({
  modelValue: toRef(() => model.value.start),
  min: toRef(() => props.min),
  max: toRef(() => props.max),
  locale: toRef(() => props.locale),
})

const endPicker = useDatePicker({
  modelValue: toRef(() => model.value.end),
  min: toRef(() => props.min),
  max: toRef(() => props.max),
  locale: toRef(() => props.locale),
})

/** Combined Reka UI range value */
const rangeValue = computed(() => {
  const start = startPicker.dateValue.value
  const end = endPicker.dateValue.value
  if (start && end) {
    return { start, end }
  }
  return undefined
})

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const styles = computed(() =>
  dateRangePickerVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

function handleRangeChange(raw: unknown): void {
  const value = raw as { start: DateValue, end: DateValue } | undefined
  if (!value)
    return
  const rangeVal: DateRangeValue = {
    start: startPicker.toISOString(value.start),
    end: endPicker.toISOString(value.end),
  }
  model.value = rangeVal
  emit('change', rangeVal)
  emit('select', rangeVal)
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
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DateRangePickerRoot
    :model-value="rangeValue"
    :min-value="startPicker.minValue.value"
    :max-value="startPicker.maxValue.value"
    :locale="startPicker.resolvedLocale.value"
    :disabled="resolvedDisabled"
    :name="name"
    :placeholder="startPicker.placeholderDate.value"
    granularity="day"
    @update:model-value="handleRangeChange"
    @update:open="handleOpenChange"
  >
    <DateRangePickerAnchor>
      <DateRangePickerField
        :id="id ?? fieldContext?.fieldId"
        :class="triggerClasses"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        :data-state="resolvedDisabled ? 'disabled' : 'idle'"
        :data-disabled="resolvedDisabled ? '' : undefined"
        :data-invalid="resolvedInvalid ? '' : undefined"
        style="contain: layout style"
        v-bind="{ ...$attrs, class: undefined }"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <template v-if="!model.start && !model.end && placeholder">
          <span class="text-[var(--dz-muted-foreground)]">{{ placeholder }}</span>
        </template>
        <template v-else>
          <DateRangePickerInput part="month" type="start" :class="styles.fieldInput()" />
          <span>/</span>
          <DateRangePickerInput part="day" type="start" :class="styles.fieldInput()" />
          <span>/</span>
          <DateRangePickerInput part="year" type="start" :class="styles.fieldInput()" />

          <span :class="styles.separator()">-</span>

          <DateRangePickerInput part="month" type="end" :class="styles.fieldInput()" />
          <span>/</span>
          <DateRangePickerInput part="day" type="end" :class="styles.fieldInput()" />
          <span>/</span>
          <DateRangePickerInput part="year" type="end" :class="styles.fieldInput()" />
        </template>

        <DateRangePickerTrigger
          class="ml-auto"
          :aria-label="ariaLabel ?? 'Open date range picker'"
        >
          <CalendarIcon :class="styles.icon()" aria-hidden="true" />
        </DateRangePickerTrigger>
      </DateRangePickerField>
    </DateRangePickerAnchor>

    <DateRangePickerContent :class="styles.content()" :side-offset="4">
      <DateRangePickerCalendar v-slot="{ weekDays, grid }" :class="styles.calendar()">
        <DateRangePickerHeader :class="styles.header()">
          <DateRangePickerPrev :class="styles.navButton()">
            <ChevronLeft class="h-4 w-4" aria-hidden="true" />
          </DateRangePickerPrev>
          <DateRangePickerHeading :class="styles.heading()" />
          <DateRangePickerNext :class="styles.navButton()">
            <ChevronRight class="h-4 w-4" aria-hidden="true" />
          </DateRangePickerNext>
        </DateRangePickerHeader>

        <DateRangePickerGrid
          v-for="month in grid"
          :key="month.value.toString()"
          :class="styles.grid()"
        >
          <DateRangePickerGridHead>
            <DateRangePickerGridRow>
              <DateRangePickerHeadCell
                v-for="day in weekDays"
                :key="day"
                :class="styles.headCell()"
              >
                {{ day }}
              </DateRangePickerHeadCell>
            </DateRangePickerGridRow>
          </DateRangePickerGridHead>
          <DateRangePickerGridBody>
            <DateRangePickerGridRow
              v-for="(weekDates, index) in month.rows"
              :key="`week-${index}`"
            >
              <DateRangePickerCell
                v-for="weekDate in weekDates"
                :key="weekDate.toString()"
                :date="weekDate"
                :class="styles.cell()"
              >
                <DateRangePickerCellTrigger
                  :day="weekDate"
                  :month="month.value"
                  :class="styles.cellTrigger()"
                />
              </DateRangePickerCell>
            </DateRangePickerGridRow>
          </DateRangePickerGridBody>
        </DateRangePickerGrid>
      </DateRangePickerCalendar>
    </DateRangePickerContent>
  </DateRangePickerRoot>
</template>
