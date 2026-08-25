<script setup lang="ts">
import type {
  DzTransferEmits,
  DzTransferProps,
  DzTransferSlots,
} from './DzTransfer.types.ts'
import { Check } from 'lucide-vue-next'
/**
 * DzTransfer — Dual-list transfer component.
 *
 * Built from scratch (no Reka UI primitive).
 * v-model via defineModel<string[]>() -- selected keys (ADR-16).
 */
import { computed, toRef, useAttrs, useId } from 'vue'
import { useAsyncOptions } from '../../composables/useAsyncOptions/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useTransfer } from '../../composables/useTransfer/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzOptionsState from './DzOptionsState.vue'
import { transferVariants } from './DzTransfer.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** modelValue = array of keys currently in the target list */
const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<DzTransferProps>(), {
  optionsState: undefined,
  optionsError: undefined,
  optionsRetryable: undefined,
  target: undefined,
  searchable: false,
  disabled: false,
  size: 'md',
  searchPlaceholder: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzTransferEmits>()
defineSlots<DzTransferSlots>()

// The async-options rows are one shared group across all seven selection
// controls, so a translator writes them once (renderer contract C9).
const dzAsyncMessages = useComponentMessages('DzAsyncOptions')

/**
 * The async-options seam (renderer contract C9).
 *
 * Inert unless the host passes `optionsState`, so a control with a static
 * option array behaves exactly as it did. Every request supersedes and aborts
 * the last, so a host that fences on the signal never has two in flight.
 */
const {
  row: optionsRow,
  state: resolvedOptionsState,
  canRetry: canRetryOptions,
  announcement: optionsAnnouncement,
  request: requestOptions,
} = useAsyncOptions(
  {
    state: () => props.optionsState,
    error: () => props.optionsError,
    retryable: () => props.optionsRetryable,
    hasOptions: () => props.source.length > 0,
    emit: request => emit('loadOptions', request),
  },
  () => ({
    loading: dzAsyncMessages.value.loading,
    empty: dzAsyncMessages.value.empty,
    error: dzAsyncMessages.value.error,
  }),
)

function handleRetryOptions(): void {
  emit('retryOptions')
  requestOptions('open')
}
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzTransfer')
const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? dzMessages.value.searchPlaceholder)
const resolvedAriaLabel = computed(() => props.ariaLabel ?? dzMessages.value.ariaLabel)

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

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
  transferVariants({
    size: props.size,
    disabled: resolvedDisabled.value || undefined,
  }),
)

/** Lists row classes — danger border on each list when invalid */
const groupClasses = computed(() =>
  cn(styles.value.root(), resolvedInvalid.value && '[&_[data-dz-transfer-list]]:border-[var(--dz-danger)]'),
)

/** Outer wrapper carries the consumer class so the error message stacks below */
const wrapperClasses = computed(() =>
  cn('flex flex-col gap-[var(--dz-spacing-1_5)]', attrs.class as string | undefined),
)

const {
  sourceSearch,
  targetSearch,
  sourceSelected,
  targetSelected,
  sourceItems,
  targetItems,
  filteredSourceItems,
  filteredTargetItems,
  toggleSourceItem,
  toggleTargetItem,
  moveToTarget: transferMoveToTarget,
  moveToSource: transferMoveToSource,
} = useTransfer({
  source: toRef(() => props.source),
  modelValue: model,
  searchable: toRef(() => props.searchable),
})

function emitChange(targetKeys: string[]): void {
  const sourceKeys = props.source
    .map(i => i.key)
    .filter(k => !targetKeys.includes(k))
  emit('change', { source: sourceKeys, target: targetKeys })
}

function moveToTarget(): void {
  const newModel = transferMoveToTarget()
  model.value = newModel
  emitChange(newModel)
}

function moveToSource(): void {
  const newModel = transferMoveToSource()
  model.value = newModel
  emitChange(newModel)
}

function isItemDisabled(item: { disabled?: boolean }): boolean {
  return resolvedDisabled.value || !!item.disabled
}

function selectSourceItem(item: Parameters<typeof toggleSourceItem>[0]): void {
  if (resolvedDisabled.value)
    return
  toggleSourceItem(item)
}

function selectTargetItem(item: Parameters<typeof toggleTargetItem>[0]): void {
  if (resolvedDisabled.value)
    return
  toggleTargetItem(item)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<template>
  <div :class="wrapperClasses" v-bind="{ ...$attrs, class: undefined }">
    <div
      :id="resolvedId"
      :class="groupClasses"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-required="resolvedRequired ? '' : undefined"
      :data-state="resolvedDisabled ? 'disabled' : undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      :aria-label="resolvedAriaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
      :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
      role="group"
      style="contain: layout style"
      @focus.capture="handleFocus"
      @blur.capture="handleBlur"
    >
      <!--
        One row instead of the list while the host is loading, has nothing, or
        failed (renderer contract C9). `optionsRow` is null whenever the control
        is static, so a control with a plain option array renders none of this.
      -->
      <DzOptionsState
        v-if="optionsRow !== null"
        :state="resolvedOptionsState"
        :message="optionsAnnouncement"
        :can-retry="canRetryOptions"
        @retry="handleRetryOptions"
      />
      <!-- Source list -->
      <div :class="styles.list()" data-dz-transfer-list>
        <div :class="styles.listHeader()">
          <slot name="source-header">
            <span>Source</span>
          </slot>
          <span :class="styles.listCount()">
            {{ sourceSelected.size }}/{{ sourceItems.length }}
          </span>
        </div>
        <input
          v-if="searchable"
          v-model="sourceSearch"
          type="text"
          :class="styles.searchInput()"
          :placeholder="resolvedSearchPlaceholder"
          :aria-label="dzMessages.searchSource"
        >
        <div
          :class="styles.listBody()"
          role="listbox"
          :aria-label="dzMessages.sourceItems"
          aria-multiselectable="true"
          :aria-disabled="resolvedDisabled || undefined"
        >
          <template v-if="filteredSourceItems.length > 0">
            <div
              v-for="item in filteredSourceItems"
              :key="item.key"
              :class="cn(styles.item(), sourceSelected.has(item.key) ? styles.itemSelected() : '')"
              :data-disabled="isItemDisabled(item) ? '' : undefined"
              role="option"
              :aria-selected="sourceSelected.has(item.key)"
              :aria-disabled="isItemDisabled(item) || undefined"
              :tabindex="isItemDisabled(item) ? -1 : 0"
              @click="selectSourceItem(item)"
              @keydown.enter.prevent="selectSourceItem(item)"
              @keydown.space.prevent="selectSourceItem(item)"
            >
              <slot name="item" :item="item" :selected="sourceSelected.has(item.key)">
                <span
                  :class="styles.itemCheckbox()"
                  :data-checked="sourceSelected.has(item.key)"
                  data-transfer-check
                  aria-hidden="true"
                >
                  <Check v-if="sourceSelected.has(item.key)" class="h-3 w-3" />
                </span>
                <span>{{ item.label }}</span>
              </slot>
            </div>
          </template>
          <div v-else :class="styles.empty()">
            No items
          </div>
        </div>
      </div>

      <!-- Transfer actions -->
      <div :class="styles.actions()">
        <button
          type="button"
          :class="styles.actionButton()"
          :disabled="sourceSelected.size === 0 || resolvedDisabled"
          :aria-label="dzMessages.moveToTarget"
          @click="moveToTarget"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button
          type="button"
          :class="styles.actionButton()"
          :disabled="targetSelected.size === 0 || resolvedDisabled"
          :aria-label="dzMessages.moveToSource"
          @click="moveToSource"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <!-- Target list -->
      <div :class="styles.list()" data-dz-transfer-list>
        <div :class="styles.listHeader()">
          <slot name="target-header">
            <span>Target</span>
          </slot>
          <span :class="styles.listCount()">
            {{ targetSelected.size }}/{{ targetItems.length }}
          </span>
        </div>
        <input
          v-if="searchable"
          v-model="targetSearch"
          type="text"
          :class="styles.searchInput()"
          :placeholder="resolvedSearchPlaceholder"
          :aria-label="dzMessages.searchTarget"
        >
        <div
          :class="styles.listBody()"
          role="listbox"
          :aria-label="dzMessages.targetItems"
          aria-multiselectable="true"
          :aria-disabled="resolvedDisabled || undefined"
          :aria-required="resolvedRequired || undefined"
        >
          <template v-if="filteredTargetItems.length > 0">
            <div
              v-for="item in filteredTargetItems"
              :key="item.key"
              :class="cn(styles.item(), targetSelected.has(item.key) ? styles.itemSelected() : '')"
              :data-disabled="isItemDisabled(item) ? '' : undefined"
              role="option"
              :aria-selected="targetSelected.has(item.key)"
              :aria-disabled="isItemDisabled(item) || undefined"
              :tabindex="isItemDisabled(item) ? -1 : 0"
              @click="selectTargetItem(item)"
              @keydown.enter.prevent="selectTargetItem(item)"
              @keydown.space.prevent="selectTargetItem(item)"
            >
              <slot name="item" :item="item" :selected="targetSelected.has(item.key)">
                <span
                  :class="styles.itemCheckbox()"
                  :data-checked="targetSelected.has(item.key)"
                  data-transfer-check
                  aria-hidden="true"
                >
                  <Check v-if="targetSelected.has(item.key)" class="h-3 w-3" />
                </span>
                <span>{{ item.label }}</span>
              </slot>
            </div>
          </template>
          <div v-else :class="styles.empty()">
            No items
          </div>
        </div>
      </div>
    </div>

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
