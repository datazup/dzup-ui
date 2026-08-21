<script setup lang="ts">
import type {
  DzMentionEmits,
  DzMentionOption,
  DzMentionProps,
  DzMentionSlots,
  DzMentionTrigger,
} from './DzMention.types.ts'
/**
 * DzMention — a textarea/input that surfaces a suggestion dropdown when a
 * configured trigger character (`@`, `#`, …) is typed.
 *
 * Detects the active trigger and the partial query at the caret, resolves
 * options (sync arrays or async resolvers), and inserts the chosen option back
 * into the text at the caret. Built on the shared `--dz-input-*` control family
 * and the shared menu surface so it composes with the rest of the library.
 *
 * v-model:value via defineModel<string>() (ADR-16) — the raw text including the
 * inserted trigger tokens.
 *
 * @example
 * ```vue
 * <DzMention
 *   v-model:value="comment"
 *   :triggers="[{ char: '@', options: users }, { char: '#', options: tags }]"
 *   placeholder="Write a comment…"
 * />
 * ```
 */
import { computed, nextTick, ref, useAttrs, useId, watch } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { mentionVariants } from './DzMention.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string>('value', { default: '' })

const props = withDefaults(defineProps<DzMentionProps>(), {
  multiline: true,
  filter: true,
  placeholder: undefined,
  rows: 3,
  maxlength: undefined,
  insertSpace: true,
  allowSpaceInQuery: false,
  loadingText: undefined,
  noResultsText: undefined,
  disabled: false,
  readonly: false,
  loading: false,
  size: 'md',
  variant: 'outline',
  tone: undefined,
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

const emit = defineEmits<DzMentionEmits>()
defineSlots<DzMentionSlots>()
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzMention')
const resolvedLoadingText = computed(() => props.loadingText ?? dzMessages.value.loading)
const resolvedNoResultsText = computed(() => props.noResultsText ?? dzMessages.value.noResults)

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

const controlRef = ref<HTMLTextAreaElement | HTMLInputElement | null>(null)

// ---------------------------------------------------------------------------
// Resolved field-context state (mirrors DzTextarea / DzCascader)
// ---------------------------------------------------------------------------

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)
const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))
const resolvedReadonly = computed(() => props.readonly ?? false)
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))
const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))
const listboxId = computed(() => `${resolvedId.value}-listbox`)

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
// Suggestion state
// ---------------------------------------------------------------------------

const open = ref(false)
const activeTrigger = ref<DzMentionTrigger | null>(null)
/** Index in the text where the active trigger char sits */
const triggerStart = ref(-1)
/** The partial query typed after the trigger char */
const activeQuery = ref('')
/** Caret offset within the control's value */
const caretPos = ref(0)
/** Options resolved for the active trigger (pre-filter) */
const rawOptions = ref<DzMentionOption[]>([])
/** Whether an async resolver is pending */
const loading = ref(false)
/** Highlighted option index */
const activeIndex = ref(0)
/** Inline position for the caret-anchored menu */
const menuStyle = ref<Record<string, string>>({})
/** Token the user dismissed via Esc — suppresses reopening until it changes */
const dismissedKey = ref<string | null>(null)
/** Monotonic token to discard stale async resolutions */
let resolveToken = 0

/** Filtered options shown in the menu. Async resolvers are trusted as-is. */
const filteredOptions = computed<DzMentionOption[]>(() => {
  const opts = rawOptions.value
  if (!props.filter || typeof activeTrigger.value?.options === 'function')
    return opts
  const q = activeQuery.value.toLowerCase()
  if (!q)
    return opts
  return opts.filter(
    o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  )
})

/** Whether the suggestion menu is currently visible. */
const menuOpen = computed(() => open.value && activeTrigger.value !== null)

const activeOptionId = computed(() =>
  menuOpen.value && filteredOptions.value[activeIndex.value]
    ? `${resolvedId.value}-option-${activeIndex.value}`
    : undefined,
)

/** Screen-reader announcement for the open list / count. */
const announcement = computed(() => {
  if (!menuOpen.value)
    return ''
  if (loading.value)
    return resolvedLoadingText.value
  const n = filteredOptions.value.length
  if (n === 0)
    return resolvedNoResultsText.value
  return `${n} suggestion${n === 1 ? '' : 's'} available`
})

// ---------------------------------------------------------------------------
// Trigger / query detection at the caret
// ---------------------------------------------------------------------------

interface DetectedTrigger {
  trigger: DzMentionTrigger
  start: number
  query: string
}

/** Find the trigger token (if any) ending at the caret. */
function detectAtCaret(): DetectedTrigger | null {
  const el = controlRef.value
  if (!el)
    return null
  const text = el.value
  const caret = el.selectionStart ?? text.length
  caretPos.value = caret
  const before = text.slice(0, caret)

  let best: DetectedTrigger | null = null
  for (const trigger of props.triggers) {
    if (!trigger.char)
      continue
    const idx = before.lastIndexOf(trigger.char)
    if (idx === -1)
      continue
    // The trigger must start the token: preceded by start-of-text or whitespace.
    const prevChar = idx > 0 ? before[idx - 1] : ''
    if (prevChar && !/\s/.test(prevChar))
      continue
    const query = before.slice(idx + trigger.char.length)
    if (!props.allowSpaceInQuery && /\s/.test(query))
      continue
    // Prefer the closest trigger to the caret.
    if (best === null || idx > best.start)
      best = { trigger, start: idx, query }
  }
  return best
}

/** Re-run detection and open/refresh or close the menu accordingly. */
function syncCaret(): void {
  if (resolvedDisabled.value || resolvedReadonly.value)
    return
  const detected = detectAtCaret()
  if (!detected) {
    dismissedKey.value = null
    closeMenu()
    return
  }
  void activate(detected)
}

async function activate(detected: DetectedTrigger): Promise<void> {
  const { trigger, start, query } = detected
  const key = `${trigger.char}:${start}:${query}`
  if (key === dismissedKey.value) {
    // The user dismissed this exact token with Esc — keep it closed.
    closeMenu()
    return
  }
  dismissedKey.value = null

  const changed
    = activeTrigger.value?.char !== trigger.char
      || triggerStart.value !== start
      || activeQuery.value !== query

  activeTrigger.value = trigger
  triggerStart.value = start
  activeQuery.value = query
  updateMenuPosition()
  openMenu()

  if (changed) {
    emit('search', trigger.char, query)
    await resolveOptions(trigger, query)
  }
}

async function resolveOptions(trigger: DzMentionTrigger, query: string): Promise<void> {
  const token = ++resolveToken
  if (typeof trigger.options === 'function') {
    loading.value = true
    try {
      const result = await trigger.options(query)
      if (token !== resolveToken)
        return
      rawOptions.value = result
    }
    finally {
      if (token === resolveToken)
        loading.value = false
    }
  }
  else {
    loading.value = false
    rawOptions.value = trigger.options
  }
}

function openMenu(): void {
  if (!open.value) {
    open.value = true
    emit('open')
  }
}

function closeMenu(): void {
  const was = open.value
  open.value = false
  activeTrigger.value = null
  activeQuery.value = ''
  triggerStart.value = -1
  rawOptions.value = []
  loading.value = false
  // Invalidate any in-flight async resolution.
  resolveToken++
  if (was)
    emit('close')
}

function dismiss(): void {
  if (activeTrigger.value)
    dismissedKey.value = `${activeTrigger.value.char}:${triggerStart.value}:${activeQuery.value}`
  closeMenu()
}

// ---------------------------------------------------------------------------
// Selection / insertion
// ---------------------------------------------------------------------------

function insertOption(option: DzMentionOption): void {
  const el = controlRef.value
  const trigger = activeTrigger.value
  if (!el || !trigger || option.disabled)
    return

  const char = trigger.char
  const text = model.value
  const start = triggerStart.value
  const end = caretPos.value
  const insertText = `${char}${option.label}${props.insertSpace ? ' ' : ''}`
  const newText = text.slice(0, start) + insertText + text.slice(end)
  const newCaret = start + insertText.length

  model.value = newText
  emit('change', newText, { source: 'user' })
  emit('select', char, option)
  dismissedKey.value = null
  closeMenu()

  void nextTick(() => {
    const c = controlRef.value
    if (!c)
      return
    c.focus()
    c.setSelectionRange(newCaret, newCaret)
    caretPos.value = newCaret
  })
}

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

const MENU_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'])

function moveActive(dir: 1 | -1): void {
  const opts = filteredOptions.value
  if (opts.length === 0)
    return
  let i = activeIndex.value
  for (let n = 0; n < opts.length; n++) {
    i = (i + dir + opts.length) % opts.length
    if (!opts[i]!.disabled) {
      activeIndex.value = i
      scrollActiveIntoView()
      return
    }
  }
}

function scrollActiveIntoView(): void {
  void nextTick(() => {
    const el = controlRef.value?.parentElement?.querySelector<HTMLElement>(
      `[data-mention-option][data-index="${activeIndex.value}"]`,
    )
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function onKeydown(event: KeyboardEvent): void {
  if (!menuOpen.value)
    return
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveActive(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveActive(-1)
      break
    case 'Enter':
    case 'Tab': {
      const opt = filteredOptions.value[activeIndex.value]
      if (opt && !opt.disabled) {
        event.preventDefault()
        insertOption(opt)
      }
      break
    }
    case 'Escape':
      event.preventDefault()
      event.stopPropagation()
      dismiss()
      break
    default:
      break
  }
}

function onKeyup(event: KeyboardEvent): void {
  // Navigation keys are handled in keydown; don't re-detect on their keyup.
  if (menuOpen.value && MENU_KEYS.has(event.key))
    return
  syncCaret()
}

// ---------------------------------------------------------------------------
// Caret-anchored menu positioning (textarea/input mirror technique)
// ---------------------------------------------------------------------------

const MIRROR_PROPS = [
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontFamily',
  'lineHeight',
  'textAlign',
  'letterSpacing',
  'whiteSpace',
] as const

function updateMenuPosition(): void {
  const el = controlRef.value
  if (!el || typeof document === 'undefined')
    return
  try {
    const computedStyle = getComputedStyle(el)
    const isInput = el.nodeName === 'INPUT'
    const mirror = document.createElement('div')
    const s = mirror.style as unknown as Record<string, string>
    const source = computedStyle as unknown as Record<string, string>
    s.position = 'absolute'
    s.visibility = 'hidden'
    s.whiteSpace = isInput ? 'nowrap' : 'pre-wrap'
    s.wordWrap = 'break-word'
    for (const prop of MIRROR_PROPS)
      s[prop] = source[prop] ?? ''

    let head = el.value.slice(0, caretPos.value)
    if (isInput)
      head = head.replace(/\s/g, ' ')
    mirror.textContent = head
    const marker = document.createElement('span')
    marker.textContent = el.value.slice(caretPos.value) || '.'
    mirror.appendChild(marker)
    document.body.appendChild(mirror)

    const borderTop = Number.parseInt(computedStyle.borderTopWidth || '0', 10) || 0
    const borderLeft = Number.parseInt(computedStyle.borderLeftWidth || '0', 10) || 0
    let lineHeight = Number.parseInt(computedStyle.lineHeight || '0', 10)
    if (!lineHeight)
      lineHeight = (Number.parseInt(computedStyle.fontSize || '0', 10) || 0) * 1.2

    const top = marker.offsetTop + borderTop + lineHeight - el.scrollTop
    const left = marker.offsetLeft + borderLeft - el.scrollLeft
    document.body.removeChild(mirror)

    menuStyle.value = Number.isFinite(top) && Number.isFinite(left)
      ? { top: `${top}px`, left: `${left}px` }
      : { top: '100%', left: '0px' }
  }
  catch {
    // Measurement unavailable (e.g. jsdom) — fall back to below the field.
    menuStyle.value = { top: '100%', left: '0px' }
  }
}

// Keep the highlighted index valid as the option set changes.
watch(filteredOptions, (opts) => {
  const first = opts.findIndex(o => !o.disabled)
  activeIndex.value = first === -1 ? 0 : first
})

// ---------------------------------------------------------------------------
// Native event handlers
// ---------------------------------------------------------------------------

function onInput(): void {
  // v-model has already synced `model`; just re-detect the trigger token.
  syncCaret()
}

function onChange(): void {
  emit('change', model.value, { source: 'user' })
}

function onFocus(event: FocusEvent): void {
  emit('focus', event)
}

function onBlur(event: FocusEvent): void {
  emit('blur', event)
  // Close on blur so the menu doesn't linger; defer so option clicks land first.
  window.setTimeout(() => {
    if (controlRef.value && document.activeElement !== controlRef.value)
      closeMenu()
  }, 0)
}

function onOptionMousedown(event: MouseEvent, option: DzMentionOption): void {
  // Prevent the control from losing focus before insertion runs.
  event.preventDefault()
  insertOption(option)
}

function onOptionHover(index: number, option: DzMentionOption): void {
  if (!option.disabled)
    activeIndex.value = index
}

// ---------------------------------------------------------------------------
// Styling
// ---------------------------------------------------------------------------

const styles = computed(() =>
  mentionVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value,
  }),
)

const controlClasses = computed(() =>
  cn(styles.value.control(), attrs.class as string | undefined),
)

defineExpose({ controlRef })
</script>

<template>
  <div
    :class="styles.root()"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-invalid="resolvedInvalid ? '' : undefined"
    style="contain: layout style"
  >
    <div :class="styles.field()">
      <!-- Text control: textarea (multiline) or input (single-line) -->
      <textarea
        v-if="multiline"
        :id="resolvedId"
        ref="controlRef"
        v-model="model"
        :class="controlClasses"
        :name="name"
        :placeholder="placeholder"
        :rows="rows"
        :maxlength="maxlength"
        :disabled="resolvedDisabled"
        :readonly="resolvedReadonly"
        :required="resolvedRequired"
        role="combobox"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        :aria-expanded="menuOpen"
        :aria-controls="menuOpen ? listboxId : undefined"
        :aria-activedescendant="activeOptionId"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        :aria-required="resolvedRequired || undefined"
        v-bind="{ ...$attrs, class: undefined }"
        @input="onInput"
        @change="onChange"
        @keydown="onKeydown"
        @keyup="onKeyup"
        @click="syncCaret"
        @focus="onFocus"
        @blur="onBlur"
      />
      <input
        v-else
        :id="resolvedId"
        ref="controlRef"
        v-model="model"
        type="text"
        :class="controlClasses"
        :name="name"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :disabled="resolvedDisabled"
        :readonly="resolvedReadonly"
        :required="resolvedRequired"
        role="combobox"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        :aria-expanded="menuOpen"
        :aria-controls="menuOpen ? listboxId : undefined"
        :aria-activedescendant="activeOptionId"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        :aria-required="resolvedRequired || undefined"
        v-bind="{ ...$attrs, class: undefined }"
        @input="onInput"
        @change="onChange"
        @keydown="onKeydown"
        @keyup="onKeyup"
        @click="syncCaret"
        @focus="onFocus"
        @blur="onBlur"
      >

      <!-- Suggestion menu -->
      <div
        v-if="menuOpen"
        :class="styles.menu()"
        :style="menuStyle"
        data-mention-menu
      >
        <template v-if="loading">
          <div :class="styles.helper()" data-mention-loading>
            <slot name="loading" :char="activeTrigger!.char" :query="activeQuery">
              {{ resolvedLoadingText }}
            </slot>
          </div>
        </template>

        <ul
          v-else-if="filteredOptions.length > 0"
          :id="listboxId"
          :class="styles.list()"
          role="listbox"
          :aria-label="`${activeTrigger!.char} suggestions`"
        >
          <li
            v-for="(option, index) in filteredOptions"
            :id="`${resolvedId}-option-${index}`"
            :key="option.value"
            role="option"
            :class="styles.item()"
            :data-mention-option="true"
            :data-index="index"
            :data-active="index === activeIndex || undefined"
            :aria-selected="index === activeIndex"
            :aria-disabled="option.disabled || undefined"
            @mousedown="onOptionMousedown($event, option)"
            @mouseenter="onOptionHover(index, option)"
          >
            <slot
              name="option"
              :option="option"
              :char="activeTrigger!.char"
              :query="activeQuery"
              :active="index === activeIndex"
              :index="index"
            >
              <span :class="styles.optionLabel()">{{ option.label }}</span>
            </slot>
          </li>
        </ul>

        <div v-else :class="styles.helper()" data-mention-empty>
          <slot name="empty" :char="activeTrigger!.char" :query="activeQuery">
            {{ resolvedNoResultsText }}
          </slot>
        </div>
      </div>
    </div>

    <!-- Screen-reader announcement of the open list + count -->
    <span class="sr-only" aria-live="polite" role="status">{{ announcement }}</span>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
