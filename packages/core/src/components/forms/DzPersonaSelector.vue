<script setup lang="ts">
import type {
  DzPersonaSelectorEmits,
  DzPersonaSelectorProps,
  DzPersonaSelectorSlots,
  Persona,
} from './DzPersonaSelector.types.ts'
/**
 * DzPersonaSelector — Searchable persona picker.
 *
 * Wraps DzCombobox and renders each option as
 * (avatar + name + muted role label).
 * v-model is the persona id.
 *
 * @example
 * ```vue
 * <DzPersonaSelector
 *   v-model="selectedPersonaId"
 *   :personas="personas"
 *   placeholder="Pick a persona…"
 * />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import type { DzSelectItem } from './DzSelect.types.ts'
import DzCombobox from './DzCombobox.vue'

const props = withDefaults(defineProps<DzPersonaSelectorProps>(), {
  modelValue: '',
  placeholder: 'Select persona',
  disabled: false,
})

const emit = defineEmits<DzPersonaSelectorEmits>()

defineSlots<DzPersonaSelectorSlots>()

const attrs = useAttrs()

/** Adapt personas → DzCombobox items (label shown when slot not overridden) */
const items = computed<DzSelectItem[]>(() =>
  props.personas.map(p => ({
    label: p.name,
    value: p.id,
  })),
)

/** Quick lookup map id → persona */
const personaById = computed<Map<string, Persona>>(() => {
  const map = new Map<string, Persona>()
  for (const p of props.personas)
    map.set(p.id, p)
  return map
})

function handleUpdate(value: string): void {
  emit('update:modelValue', value)
  emit('change', personaById.value.get(value))
}

const rootClass = computed(() => cn(attrs.class as string | undefined))
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DzCombobox
    :model-value="modelValue"
    :items="items"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="rootClass"
    data-component="DzPersonaSelector"
    v-bind="{ ...$attrs, class: undefined }"
    @update:model-value="handleUpdate"
  >
    <template #item="{ item, selected }">
      <template v-if="personaById.get(item.value)">
        <slot
          name="item"
          :persona="(personaById.get(item.value) as Persona)"
          :selected="selected"
        >
          <div class="flex items-center gap-2 pl-6">
            <img
              v-if="personaById.get(item.value)?.avatarUrl"
              :src="personaById.get(item.value)?.avatarUrl"
              :alt="`${personaById.get(item.value)?.name} avatar`"
              class="h-6 w-6 flex-shrink-0 rounded-[var(--dz-radius-full)] object-cover"
            >
            <span
              v-else
              class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[var(--dz-radius-full)] bg-[var(--dz-muted)] text-[length:var(--dz-font-size-xs)] text-[var(--dz-muted-foreground)]"
              aria-hidden="true"
            >
              {{ (personaById.get(item.value)?.name ?? '?').charAt(0).toUpperCase() }}
            </span>
            <span class="flex flex-col">
              <span class="text-[length:var(--dz-font-size-sm)] text-[var(--dz-foreground)]">
                {{ personaById.get(item.value)?.name }}
              </span>
              <span class="text-[length:var(--dz-font-size-xs)] text-[var(--dz-muted-foreground)]">
                {{ personaById.get(item.value)?.role }}
              </span>
            </span>
          </div>
        </slot>
      </template>
    </template>

    <template #empty>
      <slot name="empty">
        No personas found
      </slot>
    </template>
  </DzCombobox>
</template>
