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
  useFilter,
} from 'reka-ui'
/**
 * DzCommandPalette — A combined command palette with search, items, and groups.
 *
 * Uses Reka UI Dialog for the overlay and Combobox for the search/selection.
 * Opens with Ctrl+K / Cmd+K by default.
 *
 * Filtering matches the query against each item's `label`, case- and
 * accent-insensitively — and against `label` ALONE, whatever the `#item` slot
 * renders. Put everything a row should be findable by in `label` (ids, tags,
 * keywords) and render the display text from your own data in the slot.
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
import { computed, onMounted, onUnmounted, ref, useAttrs, watch } from 'vue'
import { useEscapeKey } from '../../composables/useEscapeKey/useEscapeKey.ts'
import { cn } from '../../utilities/cn.ts'
import { commandPaletteVariants } from './DzCommandPalette.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

const emit = defineEmits<DzCommandPaletteEmits>()
defineSlots<DzCommandPaletteSlots>()

const attrs = useAttrs()
const searchQuery = ref('')
const searchModel = ref<string>('')

const styles = computed(() => commandPaletteVariants())

const contentClasses = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)
const fallbackTitle = computed(() => props.ariaLabel ?? 'Command palette')
const contentAria = computed<Record<string, unknown>>(() => {
  const aria: Record<string, unknown> = {}
  if (props.ariaLabel !== undefined)
    aria['aria-label'] = props.ariaLabel
  if (props.ariaLabelledby !== undefined)
    aria['aria-labelledby'] = props.ariaLabelledby
  if (props.ariaDescribedby !== undefined)
    aria['aria-describedby'] = props.ariaDescribedby
  return aria
})

/**
 * Locale-aware, case- and accent-insensitive substring matching — the SAME
 * `Intl.Collator`-backed comparison Reka's own combobox filter uses. Turning that
 * filter off (see `ignore-filter` in the template) therefore changes *what* is
 * searched, not *how*: `résumé` still matches `resume`.
 */
const { contains } = useFilter({ sensitivity: 'base' })

/**
 * Items whose `label` matches the search query.
 *
 * `label` is the search key, deliberately: it is the one field a consumer can put
 * anything into. Rows rendered through the `#item` slot commonly show a *subset*
 * of what they should be findable by — a title and a category, say — while `label`
 * carries the full haystack (ids, tags, keywords). See the `ignore-filter` note in
 * the template for why that only started working when Reka's filter was disabled.
 */
const filteredItems = computed(() => {
  const query = searchQuery.value.trim()
  if (!query)
    return props.items
  return props.items.filter(item => contains(item.label, query))
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

/**
 * Escape dismissal.
 *
 * The nested Reka Combobox owns the Escape key while it is open (it resets the
 * search term and stops the event from propagating to the Dialog's own escape
 * handler). As a result the Dialog never closes on Escape on its own. We adopt
 * the simple, predictable contract: **Escape always closes the palette**,
 * regardless of whether the search query is empty or not. Closing flips the
 * `open` model to `false`, which lets Reka's Dialog FocusScope return focus to
 * the trigger that opened it. The `open` guard ensures we only react while the
 * palette is actually visible.
 */
useEscapeKey(() => {
  open.value = false
}, open)

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

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal
      :to="portalTo"
      :disabled="portalDisabled"
      :defer="portalDefer"
    >
      <DialogOverlay :class="styles.overlay()" />
      <DialogContent
        :id="id"
        :class="contentClasses"
        style="contain: layout style"
        v-bind="{ ...contentAria, ...$attrs, class: undefined }"
      >
        <DialogTitle class="sr-only">
          {{ fallbackTitle }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          Search commands, then use arrow keys to move through results and Enter to select.
        </DialogDescription>
        <!-- `ignore-filter` — this component owns filtering; Reka must not also.
             Reka's `ComboboxItem` registers each row's RENDERED TEXT
             (`textValue || textContent`) with `ComboboxRoot` and hides any row its
             own filter scores zero. That is a SECOND filter, downstream of and
             invisible to the one above, and it silently overrode it: a consumer
             that put a full search haystack in `label` — exactly what `label` is
             for — got rows filtered by the handful of words the `#item` slot
             happened to render instead. On this repo's own site that made every
             block unfindable by its id, its tags or the components it is built
             from, even though all three were indexed and weighted, while the
             visible title still worked. Nothing in the DOM showed why.

             This also removes a `:filter-function` binding that had quietly
             stopped doing anything: it is not a `ComboboxRoot` prop in Reka 2.x,
             so it fell through to `$attrs` and was spread onto the listbox. -->
        <ComboboxRoot
          v-model="searchModel"
          v-model:search-term="searchQuery"
          open
          ignore-filter
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
