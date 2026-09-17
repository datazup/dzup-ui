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
import { computed, toRef, useAttrs, useId } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDatePicker } from '../../composables/useDatePicker/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { dateRangePickerVariants } from './DzDateRangePicker.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** The selected range as ISO 8601 `start`/`end` date strings; the default pair of empty strings selects no range. */
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
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

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

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div data-part="root" :class="[ui?.root]" v-bind="dzTestId('dz-date-range-picker')">
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
          :id="resolvedId"
          v-slot="{ segments }"
          data-part="control"
          :class="[triggerClasses, ui?.control]"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="resolvedAriaDescribedby"
          :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
          :aria-required="resolvedRequired || undefined"
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
          Placeholder text shown only while both ends are empty. Segment inputs
          stay mounted (v-show, not v-if) so a calendar selection is reflected
          immediately rather than mounting fresh, unpopulated segments.
          Each DateRangePickerInput renders only its default slot, so the segment
          value must be passed explicitly — otherwise only the literal "/"
          separators show.
        -->
          <span
            v-show="!model.start && !model.end && placeholder"
            class="text-[var(--dz-muted-foreground)]"
          >{{ placeholder }}</span>
          <span
            v-show="!(!model.start && !model.end && placeholder)"
            class="inline-flex items-center"
          >
            <DateRangePickerInput
              v-for="(item, index) in segments.start"
              :key="`start-${item.part}-${index}`"
              data-part="input"
              :part="item.part"
              type="start"
              :class="[item.part === 'literal' ? styles.field() : styles.fieldInput(), ui?.input]"
            >
              {{ item.value }}
            </DateRangePickerInput>

            <span data-part="separator" :class="[styles.separator(), ui?.separator]">-</span>

            <DateRangePickerInput
              v-for="(item, index) in segments.end"
              :key="`end-${item.part}-${index}`"
              data-part="input"
              :part="item.part"
              type="end"
              :class="[item.part === 'literal' ? styles.field() : styles.fieldInput(), ui?.input]"
            >
              {{ item.value }}
            </DateRangePickerInput>
          </span>

          <!-- TASK-N1-O3 / WCAG 2.2 SC 2.5.8 -- see DzDatePicker.vue for why this
               uses `dz-target-min` and not the footprint-neutral variant. -->
          <DateRangePickerTrigger
            data-part="trigger"
            class="ms-auto dz-target-min inline-flex items-center justify-center"
            :class="[ui?.trigger]"
            :aria-label="ariaLabel ?? 'Open date range picker'"
          >
            <CalendarIcon data-part="icon" :class="[styles.icon(), ui?.icon]" aria-hidden="true" />
          </DateRangePickerTrigger>
        </DateRangePickerField>
      </DateRangePickerAnchor>

      <DateRangePickerContent data-part="content" :class="[styles.content(), ui?.content]" :side-offset="4">
        <DateRangePickerCalendar v-slot="{ weekDays, grid }" data-part="panel" :class="[styles.calendar(), ui?.panel]">
          <DateRangePickerHeader data-part="header" :class="[styles.header(), ui?.header]">
            <DateRangePickerPrev data-part="action" :class="[styles.navButton(), ui?.action]">
              <ChevronLeft class="h-4 w-4" aria-hidden="true" />
            </DateRangePickerPrev>
            <DateRangePickerHeading data-part="title" :class="[styles.heading(), ui?.title]" />
            <DateRangePickerNext data-part="action" :class="[styles.navButton(), ui?.action]">
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </DateRangePickerNext>
          </DateRangePickerHeader>

          <DateRangePickerGrid
            v-for="month in grid"
            :key="month.value.toString()"
            data-part="group"
            :class="[styles.grid(), ui?.group]"
          >
            <DateRangePickerGridHead>
              <DateRangePickerGridRow data-part="row" :class="[ui?.row]">
                <DateRangePickerHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  data-part="cell"
                  :class="[styles.headCell(), ui?.cell]"
                >
                  {{ day }}
                </DateRangePickerHeadCell>
              </DateRangePickerGridRow>
            </DateRangePickerGridHead>
            <DateRangePickerGridBody>
              <DateRangePickerGridRow
                v-for="(weekDates, index) in month.rows"
                :key="`week-${index}`"
                data-part="row"
                :class="[ui?.row]"
              >
                <DateRangePickerCell
                  v-for="weekDate in weekDates"
                  :key="weekDate.toString()"
                  :date="weekDate"
                  data-part="cell"
                  :class="[styles.cell(), ui?.cell]"
                >
                  <DateRangePickerCellTrigger
                    :day="weekDate"
                    :month="month.value"
                    data-part="item"
                    :class="[styles.cellTrigger(), ui?.item]"
                  />
                </DateRangePickerCell>
              </DateRangePickerGridRow>
            </DateRangePickerGridBody>
          </DateRangePickerGrid>
        </DateRangePickerCalendar>
      </DateRangePickerContent>
    </DateRangePickerRoot>

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
