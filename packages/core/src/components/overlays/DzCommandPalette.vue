<script setup lang="ts">
import type {
  CommandItem,
  DzCommandPaletteEmits,
  DzCommandPaletteProps,
  DzCommandPaletteSlots,
} from './DzCommandPalette.types.ts'
import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxRoot,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
/**
 * DzCommandPalette — A combined command palette with search, items, and groups.
 *
 * Uses Reka UI Dialog for the overlay and Combobox for the search/selection.
 * Opens with Ctrl+K / Cmd+K by default.
 *
 * @example
 * ```vue
 * <DzCommandPalette
 *   v-model:open="isOpen"
 *   :items="commands"
 *   :groups="groups"
 *   @select="handleSelect"
 * />
 * ```
 */
import { computed, onMounted, onUnmounted, ref, useAttrs, useId, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { commandPaletteVariants } from './DzCommandPalette.variants.ts'

const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(defineProps<DzCommandPaletteProps>(), {
  placeholder: 'Type a command or search...',
  items: () => [],
  groups: () => [],
  enableGlobalShortcut: true,
  id: undefined,
  ariaLabel: 'Command palette',
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzCommandPaletteEmits>()
defineSlots<DzCommandPaletteSlots>()

const attrs = useAttrs()
const autoId = useId()
const searchQuery = ref('')
const searchModel = ref<string>('')

const styles = computed(() => commandPaletteVariants())

const fallbackDescriptionId = computed(() => `${props.id ?? autoId}-description`)
const resolvedAriaDescribedby = computed(() => props.ariaDescribedby ?? fallbackDescriptionId.value)

const contentClasses = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)

/** Items filtered by search query */
const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query)
    return props.items
  return props.items.filter(item =>
    item.label.toLowerCase().includes(query),
  )
})

/** Group items by their group id */
const groupedItems = computed(() => {
  if (props.groups.length === 0)
    return null
  const map = new Map<string, CommandItem[]>()
  for (const item of filteredItems.value) {
    const groupId = item.group ?? '__ungrouped'
    if (!map.has(groupId))
      map.set(groupId, [])
    map.get(groupId)!.push(item)
  }
  return map
})

watch(searchQuery, (query) => {
  emit('search', query)
})

function handleSelect(item: CommandItem): void {
  emit('select', item)
  open.value = false
}

function handleSearchInput(value: string): void {
  searchQuery.value = value
}

/** Global keyboard shortcut (Ctrl+K / Cmd+K) */
function handleKeydown(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    open.value = !open.value
  }
}

onMounted(() => {
  if (props.enableGlobalShortcut) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (props.enableGlobalShortcut) {
    document.removeEventListener('keydown', handleKeydown)
  }
})

/** Reset search when dialog closes */
watch(open, (isOpen) => {
  if (!isOpen) {
    searchQuery.value = ''
    searchModel.value = ''
  }
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay :class="styles.overlay()" />
      <DialogContent
        :id="id"
        :class="contentClasses"
        :aria-label="ariaLabel"
        :aria-describedby="resolvedAriaDescribedby"
        role="dialog"
        style="contain: layout style"
        v-bind="{ ...$attrs, class: undefined }"
      >
        <DialogTitle class="sr-only">
          {{ ariaLabel }}
        </DialogTitle>
        <DialogDescription v-if="!ariaDescribedby" :id="fallbackDescriptionId" class="sr-only">
          Search commands, then use arrow keys to move through results and Enter to select.
        </DialogDescription>
        <ComboboxRoot
          v-model="searchModel"
          v-model:search-term="searchQuery"
          open
          :filter-function="() => filteredItems"
        >
          <!-- Search input -->
          <div :class="styles.inputWrapper()">
            <svg
              :class="styles.inputIcon()"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <ComboboxInput
              :class="styles.input()"
              :placeholder="placeholder"
              auto-focus
              @update:model-value="handleSearchInput"
            />
          </div>

          <!-- Items list -->
          <ComboboxContent :class="styles.list()" :dismiss-able="false">
            <!-- Grouped rendering -->
            <template v-if="groupedItems">
              <template v-for="groupDef in groups" :key="groupDef.id">
                <ComboboxGroup v-if="groupedItems.get(groupDef.id)?.length">
                  <ComboboxLabel :class="styles.groupHeading()">
                    {{ groupDef.label }}
                  </ComboboxLabel>
                  <ComboboxItem
                    v-for="item in groupedItems.get(groupDef.id)"
                    :key="item.id"
                    :value="item.id"
                    :disabled="item.disabled"
                    :class="styles.item()"
                    @select.prevent="handleSelect(item)"
                  >
                    <slot name="item" :item="item">
                      <component
                        :is="item.icon"
                        v-if="item.icon"
                        :class="styles.itemIcon()"
                        aria-hidden="true"
                      />
                      <span :class="styles.itemLabel()">{{ item.label }}</span>
                      <span
                        v-if="item.shortcut"
                        :class="styles.itemShortcut()"
                      >
                        {{ item.shortcut }}
                      </span>
                    </slot>
                  </ComboboxItem>
                </ComboboxGroup>
              </template>

              <!-- Ungrouped items -->
              <template v-if="groupedItems.get('__ungrouped')?.length">
                <ComboboxItem
                  v-for="item in groupedItems.get('__ungrouped')"
                  :key="item.id"
                  :value="item.id"
                  :disabled="item.disabled"
                  :class="styles.item()"
                  @select.prevent="handleSelect(item)"
                >
                  <slot name="item" :item="item">
                    <component
                      :is="item.icon"
                      v-if="item.icon"
                      :class="styles.itemIcon()"
                      aria-hidden="true"
                    />
                    <span :class="styles.itemLabel()">{{ item.label }}</span>
                    <span
                      v-if="item.shortcut"
                      :class="styles.itemShortcut()"
                    >
                      {{ item.shortcut }}
                    </span>
                  </slot>
                </ComboboxItem>
              </template>
            </template>

            <!-- Flat rendering (no groups) -->
            <template v-else>
              <ComboboxItem
                v-for="item in filteredItems"
                :key="item.id"
                :value="item.id"
                :disabled="item.disabled"
                :class="styles.item()"
                @select.prevent="handleSelect(item)"
              >
                <slot name="item" :item="item">
                  <component
                    :is="item.icon"
                    v-if="item.icon"
                    :class="styles.itemIcon()"
                    aria-hidden="true"
                  />
                  <span :class="styles.itemLabel()">{{ item.label }}</span>
                  <span
                    v-if="item.shortcut"
                    :class="styles.itemShortcut()"
                  >
                    {{ item.shortcut }}
                  </span>
                </slot>
              </ComboboxItem>
            </template>

            <!-- Empty state -->
            <ComboboxEmpty :class="styles.empty()">
              <slot name="empty">
                No results found.
              </slot>
            </ComboboxEmpty>
          </ComboboxContent>
        </ComboboxRoot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
