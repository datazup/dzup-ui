<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzTimePickerEmits, DzTimePickerProps, DzTimePickerSlots } from './DzTimePicker.types.ts'
import { Clock, X } from 'lucide-vue-next'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
/**
 * DzTimePicker — dropdown time picker (CoreUI-style) built on Reka UI Popover.
 *
 * The trigger shows the formatted time and opens a popover with selectable
 * hour / minute / (optional) second and AM/PM columns. Two layouts are
 * supported: a scrollable `roll` wheel (default) and native `select` dropdowns.
 *
 * v-model via defineModel<string>() — canonical 24h `HH:mm` / `HH:mm:ss` (ADR-16).
 *
 * @example
 * ```vue
 * <DzTimePicker v-model="time" placeholder="Select time" />
 * <DzTimePicker v-model="time" :hour12="true" seconds selection="select" />
 * <DzTimePicker v-model="time" min="09:00" max="17:00" :step="15" :footer="false" />
 * ```
 */
import { computed, nextTick, ref, useAttrs, useId, watch } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { timePickerVariants } from './DzTimePicker.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzTimePickerProps>(), {
  placeholder: 'Select time',
  min: undefined,
  max: undefined,
  step: 1,
  secondStep: 1,
  seconds: false,
  disabled: false,
  size: 'md',
  variant: 'outline',
  selection: 'roll',
  name: undefined,
  locale: undefined,
  hour12: undefined,
  indicator: true,
  cleaner: true,
  footer: true,
  confirmText: 'OK',
  cancelText: 'Cancel',
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzTimePickerEmits>()
defineSlots<DzTimePickerSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

const open = ref(false)
/** Element that scopes the roll columns so we can auto-scroll the selection */
const columnsEl = ref<HTMLElement>()

// ---------------------------------------------------------------------------
// Resolved field-context state
// ---------------------------------------------------------------------------

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)
const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))
const resolvedInvalid = computed(() => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false))
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))
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

// ---------------------------------------------------------------------------
// Time parsing / formatting
// ---------------------------------------------------------------------------

interface TimeParts { hour: number, minute: number, second: number }

/** Parse a canonical `HH:mm` / `HH:mm:ss` string into numeric parts */
function parseTime(value: string | undefined): TimeParts | null {
  if (!value)
    return null
  const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!match)
    return null
  const hour = Number.parseInt(match[1]!, 10)
  const minute = Number.parseInt(match[2]!, 10)
  const second = match[3] ? Number.parseInt(match[3], 10) : 0
  if (hour > 23 || minute > 59 || second > 59)
    return null
  return { hour, minute, second }
}

/** Format numeric parts to the canonical 24h string (respecting `seconds`) */
function formatModel(p: TimeParts): string {
  const hh = String(p.hour).padStart(2, '0')
  const mm = String(p.minute).padStart(2, '0')
  if (!props.seconds)
    return `${hh}:${mm}`
  return `${hh}:${mm}:${String(p.second).padStart(2, '0')}`
}

const showSeconds = computed(() => props.seconds)

/** Human-readable display string for the trigger, locale + hour12 aware */
const displayValue = computed(() => {
  const p = parseTime(model.value)
  if (!p)
    return ''
  const date = new Date(2000, 0, 1, p.hour, p.minute, p.second)
  return new Intl.DateTimeFormat(props.locale ?? 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds.value ? '2-digit' : undefined,
    hour12: props.hour12,
  }).format(date)
})

// ---------------------------------------------------------------------------
// Draft (staged) selection
// ---------------------------------------------------------------------------

/** Working selection stored in 24h hours. null = not yet chosen. */
const draftHour = ref<number | null>(null)
const draftMinute = ref<number | null>(null)
const draftSecond = ref<number | null>(null)

/** Load the draft from the committed model (called when the popover opens) */
function loadDraft(): void {
  const p = parseTime(model.value)
  draftHour.value = p?.hour ?? null
  draftMinute.value = p?.minute ?? null
  draftSecond.value = p?.second ?? null
}

// ---------------------------------------------------------------------------
// Bounds
// ---------------------------------------------------------------------------

const minParts = computed(() => parseTime(props.min ?? undefined))
const maxParts = computed(() => parseTime(props.max ?? undefined))

function toSeconds(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s
}

/** Whether a fully-specified time falls within the min/max bounds */
function withinBounds(h: number, m: number, s: number): boolean {
  const t = toSeconds(h, m, s)
  if (minParts.value && t < toSeconds(minParts.value.hour, minParts.value.minute, minParts.value.second))
    return false
  if (maxParts.value && t > toSeconds(maxParts.value.hour, maxParts.value.minute, maxParts.value.second))
    return false
  return true
}

// ---------------------------------------------------------------------------
// Option lists
// ---------------------------------------------------------------------------

const is12h = computed(() => props.hour12 === true)

function range(start: number, end: number, step: number): number[] {
  const out: number[] = []
  for (let i = start; i <= end; i += step)
    out.push(i)
  return out
}

/** Raw 24h hour values backing the hour column */
const hourValues = computed<number[]>(() =>
  is12h.value ? [12, ...range(1, 11, 1)] : range(0, 23, 1),
)
const minuteValues = computed<number[]>(() => range(0, 59, Math.max(1, props.step)))
const secondValues = computed<number[]>(() => range(0, 59, Math.max(1, props.secondStep)))

/** Convert a displayed 12h hour + meridiem into a 24h hour */
function to24Hour(displayHour: number, meridiem: 'AM' | 'PM'): number {
  if (meridiem === 'AM')
    return displayHour === 12 ? 0 : displayHour
  return displayHour === 12 ? 12 : displayHour + 12
}

/** The 12h display hour (1–12) for a 24h hour */
function to12Hour(hour24: number): number {
  const h = hour24 % 12
  return h === 0 ? 12 : h
}

const draftMeridiem = computed<'AM' | 'PM'>(() =>
  (draftHour.value ?? 0) >= 12 ? 'PM' : 'AM',
)

/** Hour value currently shown as selected in the column (24h or 12h-display) */
const selectedHourDisplay = computed<number | null>(() => {
  if (draftHour.value == null)
    return null
  return is12h.value ? to12Hour(draftHour.value) : draftHour.value
})

// --- Per-option enabled checks against bounds -------------------------------

/** Resolve a column hour value (24h or 12h-display) to a 24h hour for bounds */
function resolveColumnHour(value: number): number {
  return is12h.value ? to24Hour(value, draftMeridiem.value) : value
}

function isHourEnabled(value: number): boolean {
  const h = resolveColumnHour(value)
  return minuteValues.value.some(m =>
    (showSeconds.value ? secondValues.value : [0]).some(s => withinBounds(h, m, s)),
  )
}
function isMinuteEnabled(value: number): boolean {
  if (draftHour.value == null)
    return true
  return (showSeconds.value ? secondValues.value : [0]).some(s =>
    withinBounds(draftHour.value!, value, s),
  )
}
function isSecondEnabled(value: number): boolean {
  if (draftHour.value == null || draftMinute.value == null)
    return true
  return withinBounds(draftHour.value, draftMinute.value, value)
}
function isMeridiemEnabled(value: 'AM' | 'PM'): boolean {
  const dh = selectedHourDisplay.value ?? 12
  const h = to24Hour(dh, value)
  return minuteValues.value.some(m =>
    (showSeconds.value ? secondValues.value : [0]).some(s => withinBounds(h, m, s)),
  )
}

// ---------------------------------------------------------------------------
// Display labels
// ---------------------------------------------------------------------------

const pad = (n: number): string => String(n).padStart(2, '0')

function hourLabel(value: number): string {
  return is12h.value ? String(value) : pad(value)
}

// ---------------------------------------------------------------------------
// Selection handlers
// ---------------------------------------------------------------------------

function selectHour(value: number): void {
  draftHour.value = resolveColumnHour(value)
  // Default minute to 0 so a single tap yields a usable time.
  if (draftMinute.value == null)
    draftMinute.value = minuteValues.value[0] ?? 0
  afterSelect()
}
function selectMinute(value: number): void {
  draftMinute.value = value
  if (draftHour.value == null)
    draftHour.value = hourValues.value[0] != null ? resolveColumnHour(hourValues.value[0]) : 0
  afterSelect()
}
function selectSecond(value: number): void {
  draftSecond.value = value
  afterSelect()
}
function selectMeridiem(value: 'AM' | 'PM'): void {
  const dh = selectedHourDisplay.value ?? 12
  draftHour.value = to24Hour(dh, value)
  afterSelect()
}

/** After any pick: scroll the roll into view and (if no footer) commit live */
function afterSelect(): void {
  scrollSelectedIntoView()
  if (!props.footer)
    commitDraft('user')
}

// ---------------------------------------------------------------------------
// Commit / clear
// ---------------------------------------------------------------------------

function commitDraft(source: 'user' | 'api'): void {
  if (draftHour.value == null || draftMinute.value == null)
    return
  const value = formatModel({
    hour: draftHour.value,
    minute: draftMinute.value,
    second: showSeconds.value ? (draftSecond.value ?? 0) : 0,
  })
  if (value === model.value)
    return
  model.value = value
  emit('change', value, { source })
  emit('select', value)
}

function handleConfirm(): void {
  commitDraft('user')
  open.value = false
}

function handleCancel(): void {
  open.value = false
}

function handleClear(): void {
  if (!model.value)
    return
  model.value = ''
  draftHour.value = null
  draftMinute.value = null
  draftSecond.value = null
  emit('clear')
  emit('change', '', { source: 'user' })
}

// ---------------------------------------------------------------------------
// Select-layout (native <select>) handlers
// ---------------------------------------------------------------------------

function onSelectHour(event: Event): void {
  selectHour(Number.parseInt((event.target as HTMLSelectElement).value, 10))
}
function onSelectMinute(event: Event): void {
  selectMinute(Number.parseInt((event.target as HTMLSelectElement).value, 10))
}
function onSelectSecond(event: Event): void {
  selectSecond(Number.parseInt((event.target as HTMLSelectElement).value, 10))
}
function onSelectMeridiem(event: Event): void {
  selectMeridiem((event.target as HTMLSelectElement).value as 'AM' | 'PM')
}

// ---------------------------------------------------------------------------
// Roll auto-scroll
// ---------------------------------------------------------------------------

function scrollSelectedIntoView(): void {
  if (props.selection !== 'roll')
    return
  nextTick(() => {
    const root = columnsEl.value
    if (!root)
      return
    root.querySelectorAll<HTMLElement>('[data-roll-column]').forEach((col) => {
      const selected = col.querySelector<HTMLElement>('[data-selected="true"]')
      if (selected)
        col.scrollTop = selected.offsetTop - col.clientHeight / 2 + selected.clientHeight / 2
    })
  })
}

// ---------------------------------------------------------------------------
// Open/close lifecycle
// ---------------------------------------------------------------------------

watch(open, (isOpen) => {
  if (isOpen) {
    loadDraft()
    emit('open')
    scrollSelectedIntoView()
  }
  else {
    emit('close')
  }
})

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}
function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

// ---------------------------------------------------------------------------
// Styling
// ---------------------------------------------------------------------------

const styles = computed(() =>
  timePickerVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const showCleaner = computed(() => props.cleaner && !!model.value && !resolvedDisabled.value)
</script>

<template>
  <div
    :class="rootClasses"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-state="resolvedDisabled ? 'disabled' : undefined"
    :data-invalid="resolvedInvalid ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <PopoverRoot v-model:open="open">
      <PopoverTrigger
        as-child
        :disabled="resolvedDisabled"
      >
        <button
          :id="resolvedId"
          type="button"
          :class="styles.trigger()"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="resolvedAriaDescribedby"
          :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
          :aria-required="resolvedRequired || undefined"
          :aria-expanded="open"
          :aria-haspopup="true"
          :disabled="resolvedDisabled || undefined"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <slot name="trigger" :value="model" :display="displayValue">
            <span v-if="displayValue" :class="styles.valueText()">{{ displayValue }}</span>
            <span v-else :class="styles.placeholder()">{{ placeholder }}</span>
          </slot>

          <span
            v-if="showCleaner"
            :class="styles.cleaner()"
            role="button"
            tabindex="-1"
            aria-label="Clear time"
            @click.stop="handleClear"
            @keydown.enter.stop.prevent="handleClear"
            @keydown.space.stop.prevent="handleClear"
          >
            <X class="h-3.5 w-3.5" aria-hidden="true" />
          </span>

          <Clock v-if="indicator" :class="styles.icon()" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          :side-offset="4"
          align="start"
          class="z-50"
        >
          <div :class="styles.panel()">
            <!-- Roll layout: scrollable unit columns -->
            <div
              v-if="selection === 'roll'"
              ref="columnsEl"
              :class="styles.columns()"
            >
              <div
                :class="styles.column()"
                data-roll-column
                role="listbox"
                aria-label="Hours"
              >
                <button
                  v-for="h in hourValues"
                  :key="`h-${h}`"
                  type="button"
                  :class="styles.option()"
                  :data-selected="selectedHourDisplay === h"
                  :aria-selected="selectedHourDisplay === h"
                  :aria-disabled="!isHourEnabled(h) || undefined"
                  :disabled="!isHourEnabled(h)"
                  @click="selectHour(h)"
                >
                  {{ hourLabel(h) }}
                </button>
              </div>

              <div
                :class="styles.column()"
                data-roll-column
                role="listbox"
                aria-label="Minutes"
              >
                <button
                  v-for="m in minuteValues"
                  :key="`m-${m}`"
                  type="button"
                  :class="styles.option()"
                  :data-selected="draftMinute === m"
                  :aria-selected="draftMinute === m"
                  :aria-disabled="!isMinuteEnabled(m) || undefined"
                  :disabled="!isMinuteEnabled(m)"
                  @click="selectMinute(m)"
                >
                  {{ pad(m) }}
                </button>
              </div>

              <div
                v-if="showSeconds"
                :class="styles.column()"
                data-roll-column
                role="listbox"
                aria-label="Seconds"
              >
                <button
                  v-for="s in secondValues"
                  :key="`s-${s}`"
                  type="button"
                  :class="styles.option()"
                  :data-selected="draftSecond === s"
                  :aria-selected="draftSecond === s"
                  :aria-disabled="!isSecondEnabled(s) || undefined"
                  :disabled="!isSecondEnabled(s)"
                  @click="selectSecond(s)"
                >
                  {{ pad(s) }}
                </button>
              </div>

              <div
                v-if="is12h"
                :class="styles.column()"
                data-roll-column
                role="listbox"
                aria-label="AM/PM"
              >
                <button
                  v-for="mer in (['AM', 'PM'] as const)"
                  :key="mer"
                  type="button"
                  :class="styles.option()"
                  :data-selected="draftHour !== null && draftMeridiem === mer"
                  :aria-selected="draftHour !== null && draftMeridiem === mer"
                  :aria-disabled="!isMeridiemEnabled(mer) || undefined"
                  :disabled="!isMeridiemEnabled(mer)"
                  @click="selectMeridiem(mer)"
                >
                  {{ mer }}
                </button>
              </div>
            </div>

            <!-- Select layout: native dropdowns -->
            <div
              v-else
              :class="styles.selectRow()"
            >
              <select
                :class="styles.select()"
                aria-label="Select hours"
                :value="selectedHourDisplay ?? ''"
                @change="onSelectHour"
              >
                <option value="" disabled>--</option>
                <option
                  v-for="h in hourValues"
                  :key="`h-${h}`"
                  :value="h"
                  :disabled="!isHourEnabled(h)"
                >
                  {{ hourLabel(h) }}
                </option>
              </select>
              <span :class="styles.selectSeparator()">:</span>
              <select
                :class="styles.select()"
                aria-label="Select minutes"
                :value="draftMinute ?? ''"
                @change="onSelectMinute"
              >
                <option value="" disabled>--</option>
                <option
                  v-for="m in minuteValues"
                  :key="`m-${m}`"
                  :value="m"
                  :disabled="!isMinuteEnabled(m)"
                >
                  {{ pad(m) }}
                </option>
              </select>
              <template v-if="showSeconds">
                <span :class="styles.selectSeparator()">:</span>
                <select
                  :class="styles.select()"
                  aria-label="Select seconds"
                  :value="draftSecond ?? ''"
                  @change="onSelectSecond"
                >
                  <option value="" disabled>--</option>
                  <option
                    v-for="s in secondValues"
                    :key="`s-${s}`"
                    :value="s"
                    :disabled="!isSecondEnabled(s)"
                  >
                    {{ pad(s) }}
                  </option>
                </select>
              </template>
              <select
                v-if="is12h"
                :class="styles.select()"
                aria-label="Select AM/PM"
                :value="draftHour !== null ? draftMeridiem : ''"
                @change="onSelectMeridiem"
              >
                <option value="" disabled>--</option>
                <option
                  v-for="mer in (['AM', 'PM'] as const)"
                  :key="mer"
                  :value="mer"
                  :disabled="!isMeridiemEnabled(mer)"
                >
                  {{ mer }}
                </option>
              </select>
            </div>

            <!-- Footer -->
            <div v-if="footer" :class="styles.footer()">
              <button
                type="button"
                :class="styles.footerButton({ confirm: false })"
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                :class="styles.footerButton({ confirm: true })"
                @click="handleConfirm"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>

    <!-- Hidden form input for native form submission -->
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="model"
    >

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
