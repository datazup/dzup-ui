<script setup lang="ts">
import type {
  DzTransferEmits,
  DzTransferProps,
  DzTransferSlots,
} from './DzTransfer.types.ts'
/**
 * DzTransfer — Dual-list transfer component.
 *
 * Built from scratch (no Reka UI primitive).
 * v-model via defineModel<string[]>() -- selected keys (ADR-16).
 */
import { computed, toRef, useAttrs } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useTransfer } from '../../composables/useTransfer/index.ts'
import { cn } from '../../utilities/cn.ts'
import { transferVariants } from './DzTransfer.variants.ts'

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
const fieldContext = useFormFieldContext()

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const styles = computed(() =>
  transferVariants({
    size: props.size,
    disabled: resolvedDisabled.value || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
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

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="rootClasses"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-state="resolvedDisabled ? 'disabled' : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
    role="group"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @focus.capture="handleFocus"
    @blur.capture="handleBlur"
  >
    <!-- Source list -->
    <div :class="styles.list()">
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
      <div :class="styles.listBody()">
        <template v-if="filteredSourceItems.length > 0">
          <div
            v-for="item in filteredSourceItems"
            :key="item.key"
            :class="cn(styles.item(), sourceSelected.has(item.key) ? styles.itemSelected() : '')"
            :data-disabled="item.disabled ? '' : undefined"
            role="option"
            :aria-selected="sourceSelected.has(item.key)"
            @click="toggleSourceItem(item)"
          >
            <slot name="item" :item="item" :selected="sourceSelected.has(item.key)">
              <input
                type="checkbox"
                :class="styles.itemCheckbox()"
                :checked="sourceSelected.has(item.key)"
                :disabled="item.disabled"
                tabindex="-1"
                :aria-hidden="true"
              >
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
    <div :class="styles.list()">
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
      <div :class="styles.listBody()">
        <template v-if="filteredTargetItems.length > 0">
          <div
            v-for="item in filteredTargetItems"
            :key="item.key"
            :class="cn(styles.item(), targetSelected.has(item.key) ? styles.itemSelected() : '')"
            :data-disabled="item.disabled ? '' : undefined"
            role="option"
            :aria-selected="targetSelected.has(item.key)"
            @click="toggleTargetItem(item)"
          >
            <slot name="item" :item="item" :selected="targetSelected.has(item.key)">
              <input
                type="checkbox"
                :class="styles.itemCheckbox()"
                :checked="targetSelected.has(item.key)"
                :disabled="item.disabled"
                tabindex="-1"
                :aria-hidden="true"
              >
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
</template>
