<script setup lang="ts">
import type {
  DzTransferEmits,
  DzTransferProps,
  DzTransferSlots,
  TransferItem,
} from './DzTransfer.types.ts'
/**
 * DzTransfer — Dual-list transfer component.
 *
 * Built from scratch (no Reka UI primitive).
 * v-model via defineModel<string[]>() -- selected keys (ADR-16).
 *
 * @example
 * ```vue
 * <DzTransfer
 *   v-model="selectedKeys"
 *   :source="allItems"
 *   searchable
 *   @change="handleChange"
 * />
 * ```
 */
import { computed, ref, useAttrs } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
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

const sourceSearch = ref('')
const targetSearch = ref('')
const sourceSelected = ref<Set<string>>(new Set())
const targetSelected = ref<Set<string>>(new Set())

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

/** Source items: those NOT in model (not transferred) */
const sourceItems = computed(() =>
  props.source.filter(item => !model.value.includes(item.key)),
)

/** Target items: those IN model (transferred) */
const targetItems = computed(() =>
  props.source.filter(item => model.value.includes(item.key)),
)

/** Filtered source items by search */
const filteredSourceItems = computed(() => {
  if (!sourceSearch.value)
    return sourceItems.value
  const q = sourceSearch.value.toLowerCase()
  return sourceItems.value.filter(item =>
    item.label.toLowerCase().includes(q),
  )
})

/** Filtered target items by search */
const filteredTargetItems = computed(() => {
  if (!targetSearch.value)
    return targetItems.value
  const q = targetSearch.value.toLowerCase()
  return targetItems.value.filter(item =>
    item.label.toLowerCase().includes(q),
  )
})

function toggleSourceItem(item: TransferItem): void {
  if (item.disabled)
    return
  const set = new Set(sourceSelected.value)
  if (set.has(item.key)) {
    set.delete(item.key)
  }
  else {
    set.add(item.key)
  }
  sourceSelected.value = set
}

function toggleTargetItem(item: TransferItem): void {
  if (item.disabled)
    return
  const set = new Set(targetSelected.value)
  if (set.has(item.key)) {
    set.delete(item.key)
  }
  else {
    set.add(item.key)
  }
  targetSelected.value = set
}

/** Move selected source items to target */
function moveToTarget(): void {
  const newModel = [...model.value, ...sourceSelected.value]
  model.value = newModel
  sourceSelected.value = new Set()
  emitChange(newModel)
}

/** Move selected target items back to source */
function moveToSource(): void {
  const toRemove = targetSelected.value
  const newModel = model.value.filter(key => !toRemove.has(key))
  model.value = newModel
  targetSelected.value = new Set()
  emitChange(newModel)
}

function emitChange(targetKeys: string[]): void {
  const sourceKeys = props.source
    .map(i => i.key)
    .filter(k => !targetKeys.includes(k))
  emit('change', { source: sourceKeys, target: targetKeys })
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
