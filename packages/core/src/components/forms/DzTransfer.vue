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
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useTransfer } from '../../composables/useTransfer/index.ts'
import { cn } from '../../utilities/cn.ts'
import { transferVariants } from './DzTransfer.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** modelValue = array of keys currently in the target list */
const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<DzTransferProps>(), {
  target: undefined,
  searchable: false,
  disabled: false,
  size: 'md',
  searchPlaceholder: 'Search...',
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: 'Transfer list',
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzTransferEmits>()
defineSlots<DzTransferSlots>()

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
      :data-state="resolvedDisabled ? 'disabled' : undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
      :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
      role="group"
      style="contain: layout style"
      @focus.capture="handleFocus"
      @blur.capture="handleBlur"
    >
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
          :placeholder="searchPlaceholder"
          aria-label="Search source items"
        >
        <div
          :class="styles.listBody()"
          role="listbox"
          aria-label="Source items"
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
          aria-label="Move selected to target"
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
          aria-label="Move selected to source"
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
          :placeholder="searchPlaceholder"
          aria-label="Search target items"
        >
        <div
          :class="styles.listBody()"
          role="listbox"
          aria-label="Target items"
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
