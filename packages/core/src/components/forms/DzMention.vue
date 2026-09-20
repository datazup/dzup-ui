<script setup lang="ts">
import type { AsyncOptionsState, LoadOptionsReason, LoadOptionsRequest } from '@dzup-ui/contracts'
import type {
  DzMentionEmits,
  DzMentionOption,
  DzMentionOptionResolver,
  DzMentionProps,
  DzMentionSlots,
  DzMentionTrigger,
} from './DzMention.types.ts'
/**
 * DzMention — a textarea/input that surfaces a suggestion dropdown when a
 * configured trigger character (`@`, `#`, …) is typed.
 *
 * Detects the active trigger and the partial query at the caret, resolves
 * options (sync arrays, async resolvers, or a host driving `optionsState`), and
 * inserts the chosen option back into the text at the caret. Built on the shared
 * `--dz-input-*` control family and the shared menu surface so it composes with
 * the rest of the library.
 *
 * Async options run on the shared `useAsyncOptions` seam (renderer contract C9,
 * TASK-R3-O3) — the same state, abortable request, retry and state row as the
 * seven selection controls — so Pro's renderer needs one adapter, not an eighth.
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
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useAsyncOptions } from '../../composables/useAsyncOptions/index.ts'
import { useDualModel } from '../../composables/useDualModel/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessageFormat, useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { mentionVariants } from './DzMention.variants.ts'
import DzOptionsState from './DzOptionsState.vue'

defineOptions({
  inheritAttrs: false,
})

/**
 * Both `v-model` and `v-model:value` (renderer contract C1).
 *
 * `v-model:value` keeps working unchanged; `v-model` is the binding every other
 * control in the catalog takes, and until now it silently did nothing here.
 */
const legacyValueModel = defineModel<string>('value', { default: '' })
/** The raw text including the mention trigger characters, bound with the contract-conforming default `v-model`. Left `undefined` the component reads the legacy `v-model:value` instead; writes go to both (ADR-16, `useDualModel`). */
const primaryModel = defineModel<string | undefined>({ default: undefined })
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
  optionsState: undefined,
  optionsError: undefined,
  optionsRetryable: undefined,
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

const model = useDualModel(primaryModel, legacyValueModel)

// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzMention')
// Count-bearing announcement, on Intl.PluralRules (TASK-R5-O4).
const dzFormat = useComponentMessageFormat('DzMention')
const resolvedLoadingText = computed(() => props.loadingText ?? dzMessages.value.loading)
const resolvedNoResultsText = computed(() => props.noResultsText ?? dzMessages.value.noResults)
// The async-options rows are one shared group across every seam host, so a
// translator writes them once (renderer contract C9). An explicit prop wins.
const dzAsyncMessages = useComponentMessages('DzAsyncOptions')

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
/** Highlighted option index */
const activeIndex = ref(0)
/** Inline position for the caret-anchored menu */
const menuStyle = ref<Record<string, string>>({})
/** Token the user dismissed via Esc — suppresses reopening until it changes */
const dismissedKey = ref<string | null>(null)
/** The suggestion menu element, so focus moving into it does not close it */
const menuRef = ref<HTMLElement | null>(null)

/**
 * The active trigger as the host currently declares it.
 *
 * Looked up by character on every read rather than held as the object captured
 * at activation: a host-driven mention answers `load-options` by writing a new
 * `options` array into `triggers`, and a captured object would never see it.
 */
const liveTrigger = computed<DzMentionTrigger | null>(() => {
  const captured = activeTrigger.value
  if (captured === null)
    return null
  return props.triggers.find(t => t.char === captured.char) ?? captured
})

/** The active trigger's resolver, when its options are a function. */
const activeResolver = computed<DzMentionOptionResolver | null>(() => {
  const source = liveTrigger.value?.options
  return typeof source === 'function' ? source : null
})

// ---------------------------------------------------------------------------
// Async options — the shared seam (renderer contract C9, TASK-R3-O3)
// ---------------------------------------------------------------------------

/**
 * Host-driven: the host passed `optionsState`, answers `load-options` itself,
 * and writes results into the trigger's `options` array.
 */
const hostDriven = computed(() => props.optionsState !== undefined)

/**
 * Where a *resolver* is, when the host is not driving.
 *
 * A trigger whose `options` is a function is the pre-seam async form. It no
 * longer has a loader of its own: the resolver is run as the host of the same
 * request the seam emits, its state is reported into the seam, and superseding
 * a query aborts the request's signal instead of bumping a private counter.
 */
const resolverState = ref<AsyncOptionsState | undefined>(undefined)
/** The options the resolver last returned for the current token. */
const resolverOptions = ref<DzMentionOption[]>([])

/** Options for the active trigger, before filtering. */
const rawOptions = computed<DzMentionOption[]>(() => {
  const trigger = liveTrigger.value
  if (trigger === null)
    return []
  return typeof trigger.options === 'function' ? resolverOptions.value : trigger.options
})

/** Filtered options shown in the menu. Resolver and host results are trusted as-is. */
const filteredOptions = computed<DzMentionOption[]>(() => {
  const opts = rawOptions.value
  if (!props.filter || hostDriven.value || activeResolver.value !== null)
    return opts
  const q = activeQuery.value.toLowerCase()
  if (!q)
    return opts
  return opts.filter(
    o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  )
})

const {
  row: optionsRow,
  state: resolvedOptionsState,
  canRetry: canRetryOptions,
  announcement: optionsAnnouncement,
  request: requestOptions,
  abort: abortOptions,
} = useAsyncOptions(
  {
    state: () => props.optionsState ?? (activeResolver.value !== null ? resolverState.value : undefined),
    error: () => props.optionsError,
    retryable: () => props.optionsRetryable,
    hasOptions: () => filteredOptions.value.length > 0,
    emit: request => emit('loadOptions', request),
    // A mention has nothing to ask for until a trigger character is typed.
    requestOnMount: false,
  },
  () => ({
    loading: props.loadingText ?? dzAsyncMessages.value.loading,
    empty: props.noResultsText ?? dzAsyncMessages.value.empty,
    error: dzAsyncMessages.value.error,
  }),
)

/** Whether the suggestion menu is currently visible. */
const menuOpen = computed(() => open.value && activeTrigger.value !== null)

/**
 * The shared state row, when one replaces the list.
 *
 * Host-driven mentions render all three rows through `DzOptionsState`, exactly
 * as the seven selection controls do. A resolver keeps its pre-seam `loader`
 * and `empty` rows — with their `#loading` / `#empty` slots — and gains the one
 * row it never had: `error`, with a retry.
 */
const stateRow = computed(() => {
  if (hostDriven.value)
    return optionsRow.value
  return optionsRow.value === 'error' ? 'error' : null
})

/** A resolver is pending: the pre-seam loader row. */
const loaderRow = computed(() => !hostDriven.value && optionsRow.value === 'loading')

/**
 * Whether the control is in a loading state (root `data-loading`, `aria-busy`).
 *
 * N1-O1 defect D3: the public `loading` prop -- inherited from
 * `BaseBehaviorProps` like every other control's -- was declared, defaulted and
 * then read by nothing, so `<DzMention loading>` did nothing at all. The host's
 * answer is now ORed with the component's own: a host that knows it is fetching
 * can say so before any trigger character has been typed, and the resolver's
 * own pending state still lights the indicator by itself.
 */
const optionsLoading = computed(() =>
  props.loading === true || (menuOpen.value && optionsRow.value === 'loading'),
)

/**
 * Ask for options for the active token.
 *
 * Static triggers ask nobody; anything in flight is aborted. Host-driven
 * mentions emit `load-options` and wait for the host. A resolver becomes the
 * host of the request the seam just emitted.
 */
function loadOptions(reason: LoadOptionsReason, query: string): void {
  const resolver = activeResolver.value
  if (!hostDriven.value && resolver === null) {
    abortOptions()
    resolverState.value = undefined
    return
  }
  if (!hostDriven.value)
    resolverState.value = 'loading'
  const request = requestOptions(reason, query)
  if (request !== null && !hostDriven.value && resolver !== null)
    void runResolver(resolver, request)
}

async function runResolver(resolver: DzMentionOptionResolver, request: LoadOptionsRequest): Promise<void> {
  try {
    const result = await resolver(request.query)
    // Superseded by a newer query, or the menu closed: the signal says so.
    if (request.signal.aborted)
      return
    resolverOptions.value = result
    resolverState.value = result.length > 0 ? 'ready' : 'empty'
  }
  catch {
    if (request.signal.aborted)
      return
    resolverOptions.value = []
    resolverState.value = 'error'
  }
}

function handleRetryOptions(): void {
  emit('retryOptions')
  const query = activeQuery.value
  loadOptions(query === '' ? 'open' : 'search', query)
  // Keep focus in the text control (C9.4): the retry is a button in the menu.
  void nextTick(() => controlRef.value?.focus())
}

/**
 * Whether the option list itself is on screen. A state or loader row replaces
 * it, and a host may still hold the previous array while it loads — so the
 * keyboard must not walk, or insert, options nobody can see.
 */
const listVisible = computed(() =>
  menuOpen.value && stateRow.value === null && !loaderRow.value && filteredOptions.value.length > 0,
)

const activeOptionId = computed(() =>
  listVisible.value && filteredOptions.value[activeIndex.value]
    ? `${resolvedId.value}-option-${activeIndex.value}`
    : undefined,
)

/**
 * Screen-reader announcement for the open list / count.
 *
 * Silent while the shared state row is showing: that row is its own polite
 * live region, and saying it twice is noise.
 */
const announcement = computed(() => {
  if (!menuOpen.value || stateRow.value !== null)
    return ''
  if (loaderRow.value)
    return resolvedLoadingText.value
  const n = filteredOptions.value.length
  if (n === 0)
    return resolvedNoResultsText.value
  return dzFormat('suggestionsAvailable', { count: n })
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
  activate(detected)
}

function activate(detected: DetectedTrigger): void {
  const { trigger, start, query } = detected
  const key = `${trigger.char}:${start}:${query}`
  if (key === dismissedKey.value) {
    // The user dismissed this exact token with Esc — keep it closed.
    closeMenu()
    return
  }
  dismissedKey.value = null

  const sameToken
    = open.value
      && activeTrigger.value?.char === trigger.char
      && triggerStart.value === start
  const changed = !sameToken || activeQuery.value !== query

  if (!sameToken)
    resolverOptions.value = []
  activeTrigger.value = trigger
  triggerStart.value = start
  activeQuery.value = query
  updateMenuPosition()
  openMenu()

  if (changed) {
    emit('search', trigger.char, query)
    // A new token asks as `open`; the same token with a longer query, `search`.
    loadOptions(sameToken ? 'search' : 'open', query)
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
  // Abort whatever is in flight: its signal tells a host — or a resolver — that
  // nobody is waiting for the answer any more.
  abortOptions()
  resolverState.value = undefined
  resolverOptions.value = []
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
      if (listVisible.value)
        moveActive(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (listVisible.value)
        moveActive(-1)
      break
    case 'Enter':
    case 'Tab': {
      const opt = listVisible.value ? filteredOptions.value[activeIndex.value] : undefined
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
    if (controlRef.value && document.activeElement !== controlRef.value && !focusInMenu())
      closeMenu()
  }, 0)
}

/** Whether focus sits inside the suggestion menu — on the retry control, say. */
function focusInMenu(): boolean {
  const active = document.activeElement
  return active !== null && (menuRef.value?.contains(active) ?? false)
}

/** Focus left the menu (Tab past the retry control): close unless it went back to the field. */
function onMenuFocusout(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null
  if (next !== null && (next === controlRef.value || (menuRef.value?.contains(next) ?? false)))
    return
  window.setTimeout(() => {
    if (document.activeElement !== controlRef.value && !focusInMenu())
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

defineExpose({
  /**
   * The underlying `<textarea>`, or the `<input>` when `multiline` is off,
   * for focus and caret work. `null` before mount.
   */
  controlRef,
})

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div
    data-part="root"
    v-bind="dzTestId('dz-mention')"
    :class="[styles.root(), ui?.root]"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-invalid="resolvedInvalid ? '' : undefined"
    :data-required="resolvedRequired ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-loading="optionsLoading ? '' : undefined"
    :aria-busy="optionsLoading || undefined"
    style="contain: layout style"
  >
    <div data-part="control" :class="[styles.field(), ui?.control]">
      <!-- Text control: textarea (multiline) or input (single-line) -->
      <textarea
        v-if="multiline"
        :id="resolvedId"
        ref="controlRef"
        v-model="model"
        data-part="input"
        :class="[controlClasses, ui?.input]"
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
        :aria-controls="listVisible ? listboxId : undefined"
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
        data-part="input"
        :class="[controlClasses, ui?.input]"
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
        :aria-controls="listVisible ? listboxId : undefined"
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
        ref="menuRef"
        data-part="content"
        :class="[styles.menu(), ui?.content]"
        :style="menuStyle"
        data-mention-menu
        @focusout="onMenuFocusout"
      >
        <!--
          The shared state row (renderer contract C9). Host-driven: loading, empty
          or failed. Resolver-driven: failed only — its loading and empty rows are
          the pre-seam ones below. Mousedown is prevented so a pointer retry keeps
          focus in the text control.
        -->
        <DzOptionsState
          v-if="stateRow !== null"
          :state="resolvedOptionsState"
          :message="optionsAnnouncement"
          :can-retry="canRetryOptions"
          @mousedown.prevent
          @retry="handleRetryOptions"
        />
        <template v-else-if="loaderRow">
          <div data-part="loader" :class="[styles.helper(), ui?.loader]" data-mention-loading>
            <slot name="loading" :char="activeTrigger!.char" :query="activeQuery">
              {{ resolvedLoadingText }}
            </slot>
          </div>
        </template>

        <ul
          v-else-if="filteredOptions.length > 0"
          :id="listboxId"
          data-part="list"
          :class="[styles.list(), ui?.list]"
          role="listbox"
          :aria-label="`${activeTrigger!.char} suggestions`"
        >
          <li
            v-for="(option, index) in filteredOptions"
            :id="`${resolvedId}-option-${index}`"
            :key="option.value"
            role="option"
            data-part="item"
            :class="[styles.item(), ui?.item]"
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
              <span data-part="item-label" :class="[styles.optionLabel(), ui?.['item-label']]">{{ option.label }}</span>
            </slot>
          </li>
        </ul>

        <div v-else data-part="empty" :class="[styles.helper(), ui?.empty]" data-mention-empty>
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
      data-part="error"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      :class="[ui?.error]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
