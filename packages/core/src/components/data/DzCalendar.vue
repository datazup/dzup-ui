<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import type { CalendarDay } from '../../composables/useCalendar/index.ts'
import type {
  CalendarRangeValue,
  DzCalendarEmits,
  DzCalendarModelValue,
  DzCalendarProps,
  DzCalendarSlots,
} from './DzCalendar.types.ts'
import { getLocalTimeZone } from '@internationalized/date'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
/**
 * DzCalendar — full-surface month/week calendar for date selection and
 * day-cell content (events, counts, badges).
 *
 * Built on the useCalendar composable, which shares @internationalized/date
 * math with DzDatePicker (ADR-13). Selection is exposed via v-model:value
 * (shape keyed to `mode`) and the visible period via v-model:focusedDate
 * (ADR-16). The grid is a roving-tabindex `role="grid"` (WCAG AA).
 *
 * @example
 * ```vue
 * <DzCalendar v-model:value="date" />
 * <DzCalendar v-model:value="range" mode="range" />
 * <DzCalendar v-model:value="dates" mode="multiple">
 *   <template #day="{ date, dayNumber }">
 *     <span>{{ dayNumber }}</span>
 *     <span v-if="hasEvent(date)" class="dot" />
 *   </template>
 * </DzCalendar>
 * ```
 */
import { computed, nextTick, ref, toRef, useAttrs } from 'vue'
import { useCalendar } from '../../composables/useCalendar/index.ts'
import { cn } from '../../utilities/cn.ts'
import { calendarVariants } from './DzCalendar.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const value = defineModel<DzCalendarModelValue>('value', { default: null })

const focusedDate = defineModel<string>('focusedDate', { default: '' })

const props = withDefaults(defineProps<DzCalendarProps>(), {
  mode: 'single',
  view: 'month',
  size: 'md',
  disabled: false,
  readonly: false,
  minDate: undefined,
  maxDate: undefined,
  disabledDate: undefined,
  firstDayOfWeek: 0,
  locale: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzCalendarEmits>()
defineSlots<DzCalendarSlots>()

const attrs = useAttrs()
const gridRef = ref<HTMLElement | null>(null)

const {
  focusedCalendarDate,
  focusedIso,
  weeks,
  weekDayLabels,
  periodLabel,
  toISO,
  parseISO,
  todayDate,
} = useCalendar({
  focusedDate,
  view: toRef(() => props.view),
  firstDayOfWeek: toRef(() => props.firstDayOfWeek),
  locale: toRef(() => props.locale),
})

const tz = getLocalTimeZone()

/** JS weekday (0 = Sunday … 6 = Saturday) for a CalendarDate */
function jsWeekday(date: CalendarDate): number {
  return date.toDate(tz).getDay()
}

/** First day (CalendarDate) of the week containing `date`, per firstDayOfWeek */
function weekStartOf(date: CalendarDate): CalendarDate {
  const offset = (jsWeekday(date) - props.firstDayOfWeek + 7) % 7
  return date.subtract({ days: offset })
}

const styles = computed(() => calendarVariants({ size: props.size }))

const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))

// ---------------------------------------------------------------------------
// Selection state (per mode)
// ---------------------------------------------------------------------------

const selectedSet = computed<Set<string>>(() => {
  if (props.mode === 'multiple') {
    return new Set(Array.isArray(value.value) ? value.value : [])
  }
  if (props.mode === 'single') {
    return new Set(typeof value.value === 'string' && value.value ? [value.value] : [])
  }
  return new Set()
})

const range = computed<CalendarRangeValue>(() => {
  if (
    props.mode === 'range'
    && value.value
    && typeof value.value === 'object'
    && !Array.isArray(value.value)
  ) {
    return value.value
  }
  return { start: null, end: null }
})

function isSelected(iso: string): boolean {
  if (props.mode === 'range') {
    return iso === range.value.start || iso === range.value.end
  }
  return selectedSet.value.has(iso)
}

function isInRange(iso: string): boolean {
  if (props.mode !== 'range')
    return false
  const { start, end } = range.value
  if (!start || !end)
    return false
  // ISO YYYY-MM-DD strings are lexicographically ordered.
  return iso > start && iso < end
}

// ---------------------------------------------------------------------------
// Per-day disabled predicate
// ---------------------------------------------------------------------------

function isDayDisabled(day: CalendarDay): boolean {
  if (props.disabled)
    return true
  if (props.minDate && day.iso < props.minDate)
    return true
  if (props.maxDate && day.iso > props.maxDate)
    return true
  if (props.disabledDate?.(day.jsDate))
    return true
  return false
}

// ---------------------------------------------------------------------------
// Focus / period navigation
// ---------------------------------------------------------------------------

/** Stable key for the visible window — change ⇒ emit panelChange */
function visibleKey(iso: string): string {
  const d = parseISO(iso) ?? todayDate()
  if (props.view === 'week') {
    // Anchor to the week start so any date in the same week shares a key.
    return `w:${toISO(weekStartOf(d))}`
  }
  return `m:${d.year}-${d.month}`
}

function setFocused(iso: string): void {
  const previous = focusedIso.value
  focusedDate.value = iso
  if (visibleKey(previous) !== visibleKey(iso)) {
    emit('panelChange', { focusedDate: iso, view: props.view })
  }
}

function focusCell(iso: string): void {
  nextTick(() => {
    gridRef.value?.querySelector<HTMLButtonElement>(`button[data-iso="${iso}"]`)?.focus()
  })
}

function commitFocus(iso: string, withFocus = true): void {
  setFocused(iso)
  if (withFocus)
    focusCell(iso)
}

// ---------------------------------------------------------------------------
// Selection commit
// ---------------------------------------------------------------------------

function selectDay(day: CalendarDay): void {
  if (props.disabled || props.readonly || isDayDisabled(day))
    return

  const iso = day.iso

  if (props.mode === 'single') {
    value.value = iso
  }
  else if (props.mode === 'multiple') {
    const next = new Set(selectedSet.value)
    if (next.has(iso))
      next.delete(iso)
    else next.add(iso)
    value.value = [...next].sort()
  }
  else {
    const { start, end } = range.value
    if (!start || end) {
      // Begin a new range.
      value.value = { start: iso, end: null }
    }
    else if (iso < start) {
      value.value = { start: iso, end: start }
    }
    else {
      value.value = { start, end: iso }
    }
  }

  // Selecting a cell also moves the roving focus (and may shift the panel).
  setFocused(iso)
}

// ---------------------------------------------------------------------------
// Header controls
// ---------------------------------------------------------------------------

function goPrev(): void {
  const cur = focusedCalendarDate.value
  const next = props.view === 'week' ? cur.subtract({ weeks: 1 }) : cur.subtract({ months: 1 })
  commitFocus(toISO(next), false)
}

function goNext(): void {
  const cur = focusedCalendarDate.value
  const next = props.view === 'week' ? cur.add({ weeks: 1 }) : cur.add({ months: 1 })
  commitFocus(toISO(next), false)
}

function goToday(): void {
  commitFocus(toISO(todayDate()), false)
}

// ---------------------------------------------------------------------------
// Roving-tabindex keyboard navigation
// ---------------------------------------------------------------------------

/** The CalendarDay matching the current roving focus (for Enter/Space). */
const focusedDay = computed<CalendarDay | undefined>(() => {
  for (const week of weeks.value) {
    for (const day of week) {
      if (day.iso === focusedIso.value)
        return day
    }
  }
  return undefined
})

function onGridKeydown(event: KeyboardEvent): void {
  if (props.disabled)
    return

  const cur = focusedCalendarDate.value
  let next = cur
  let handled = true

  switch (event.key) {
    case 'ArrowLeft':
      next = cur.subtract({ days: 1 })
      break
    case 'ArrowRight':
      next = cur.add({ days: 1 })
      break
    case 'ArrowUp':
      next = cur.subtract({ days: 7 })
      break
    case 'ArrowDown':
      next = cur.add({ days: 7 })
      break
    case 'Home':
      next = weekStartOf(cur)
      break
    case 'End':
      next = weekStartOf(cur).add({ days: 6 })
      break
    case 'PageUp':
      next = cur.subtract({ months: 1 })
      break
    case 'PageDown':
      next = cur.add({ months: 1 })
      break
    case 'Enter':
    case ' ': {
      const day = focusedDay.value
      if (day)
        selectDay(day)
      handled = true
      break
    }
    default:
      handled = false
  }

  if (!handled)
    return

  event.preventDefault()
  if (event.key !== 'Enter' && event.key !== ' ')
    commitFocus(toISO(next))
}

// ---------------------------------------------------------------------------
// Per-cell slot props
// ---------------------------------------------------------------------------

function daySlotProps(day: CalendarDay) {
  return {
    date: day.jsDate,
    isToday: day.isToday,
    isSelected: isSelected(day.iso),
    isOutsideMonth: day.isOutsideMonth,
    isDisabled: isDayDisabled(day),
    dayNumber: day.dayNumber,
  }
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :data-size="size"
    :data-mode="mode"
    :data-view="view"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Live region: announces the visible period on navigation -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ periodLabel }}
    </div>

    <!-- Header: heading + prev/today/next controls -->
    <div :class="styles.header()">
      <span :class="styles.heading()" aria-hidden="true">{{ periodLabel }}</span>
      <div :class="styles.nav()">
        <button type="button" :class="styles.todayButton()" :disabled="disabled" @click="goToday">
          Today
        </button>
        <button
          type="button"
          :class="styles.navButton()"
          :disabled="disabled"
          :aria-label="view === 'week' ? 'Previous week' : 'Previous month'"
          @click="goPrev"
        >
          <ChevronLeft class="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          :class="styles.navButton()"
          :disabled="disabled"
          :aria-label="view === 'week' ? 'Next week' : 'Next month'"
          @click="goNext"
        >
          <ChevronRight class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div
      ref="gridRef"
      role="grid"
      :class="styles.grid()"
      :aria-label="ariaLabel ?? periodLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby"
      :aria-readonly="readonly || undefined"
      :aria-disabled="disabled || undefined"
      @keydown="onGridKeydown"
    >
      <!-- Weekday header row -->
      <div role="row" :class="styles.weekdayRow()">
        <span
          v-for="label in weekDayLabels"
          :key="label"
          role="columnheader"
          :class="styles.weekday()"
        >
          {{ label }}
        </span>
      </div>

      <!-- Week rows -->
      <div
        v-for="(week, weekIndex) in weeks"
        :key="`week-${weekIndex}`"
        role="row"
        :class="styles.week()"
      >
        <div
          v-for="day in week"
          :key="day.iso"
          role="gridcell"
          :aria-selected="isSelected(day.iso)"
          :class="styles.cell()"
        >
          <button
            type="button"
            :data-iso="day.iso"
            :tabindex="day.iso === focusedIso ? 0 : -1"
            :class="styles.dayButton()"
            :aria-label="day.label"
            :aria-disabled="isDayDisabled(day) || undefined"
            :data-today="day.isToday ? '' : undefined"
            :data-selected="isSelected(day.iso) ? '' : undefined"
            :data-in-range="isInRange(day.iso) ? '' : undefined"
            :data-outside-month="day.isOutsideMonth ? '' : undefined"
            :data-disabled="isDayDisabled(day) ? '' : undefined"
            @click="selectDay(day)"
          >
            <slot name="day" v-bind="daySlotProps(day)">
              {{ day.dayNumber }}
            </slot>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
