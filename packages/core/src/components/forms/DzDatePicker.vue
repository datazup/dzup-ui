<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DzDatePickerEmits, DzDatePickerProps, DzDatePickerSlots } from './DzDatePicker.types.ts'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next'
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
import { computed, toRef, useAttrs } from 'vue'
import { useDatePicker } from '../../composables/useDatePicker/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { datePickerVariants } from './DzDatePicker.variants.ts'

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
const fieldContext = useFormFieldContext()

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
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DatePickerRoot
    :model-value="dateValue"
    :min-value="minValue"
    :max-value="maxValue"
    :locale="resolvedLocale"
    :disabled="resolvedDisabled"
    :name="name"
    :placeholder="placeholderDate"
    granularity="day"
    @update:model-value="handleDateChange"
    @update:open="handleOpenChange"
  >
    <DatePickerAnchor>
      <DatePickerField
        :id="id ?? fieldContext?.fieldId"
        :class="triggerClasses"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        :data-disabled="resolvedDisabled ? '' : undefined"
        :data-invalid="resolvedInvalid ? '' : undefined"
        style="contain: layout style"
        v-bind="{ ...$attrs, class: undefined }"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <template v-if="!model && placeholder">
          <span class="text-[var(--dz-muted-foreground)]">{{ placeholder }}</span>
        </template>
        <template v-else>
          <DatePickerInput part="month" :class="styles.fieldInput()" />
          <span :class="styles.field()">/</span>
          <DatePickerInput part="day" :class="styles.fieldInput()" />
          <span :class="styles.field()">/</span>
          <DatePickerInput part="year" :class="styles.fieldInput()" />
        </template>

        <DatePickerTrigger
          class="ml-auto"
          :aria-label="ariaLabel ?? 'Open date picker'"
        >
          <CalendarIcon :class="styles.icon()" aria-hidden="true" />
        </DatePickerTrigger>
      </DatePickerField>
    </DatePickerAnchor>

    <DatePickerContent :class="styles.content()" :side-offset="4">
      <DatePickerCalendar v-slot="{ weekDays, grid }" :class="styles.calendar()">
        <DatePickerHeader :class="styles.header()">
          <DatePickerPrev :class="styles.navButton()">
            <ChevronLeft class="h-4 w-4" aria-hidden="true" />
          </DatePickerPrev>
          <DatePickerHeading :class="styles.heading()" />
          <DatePickerNext :class="styles.navButton()">
            <ChevronRight class="h-4 w-4" aria-hidden="true" />
          </DatePickerNext>
        </DatePickerHeader>

        <DatePickerGrid v-for="month in grid" :key="month.value.toString()" :class="styles.grid()">
          <DatePickerGridHead>
            <DatePickerGridRow>
              <DatePickerHeadCell
                v-for="day in weekDays"
                :key="day"
                :class="styles.headCell()"
              >
                {{ day }}
              </DatePickerHeadCell>
            </DatePickerGridRow>
          </DatePickerGridHead>
          <DatePickerGridBody>
            <DatePickerGridRow v-for="(weekDates, index) in month.rows" :key="`week-${index}`">
              <DatePickerCell
                v-for="weekDate in weekDates"
                :key="weekDate.toString()"
                :date="weekDate"
                :class="styles.cell()"
              >
                <DatePickerCellTrigger
                  :day="weekDate"
                  :month="month.value"
                  :class="styles.cellTrigger()"
                />
              </DatePickerCell>
            </DatePickerGridRow>
          </DatePickerGridBody>
        </DatePickerGrid>
      </DatePickerCalendar>
    </DatePickerContent>
  </DatePickerRoot>
</template>
