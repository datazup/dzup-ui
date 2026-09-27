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
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { useDzMotionAttribute } from '../../composables/provider/useDzMotion.ts'
import { useEscapeKey } from '../../composables/useEscapeKey/useEscapeKey.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { commandPaletteVariants } from './DzCommandPalette.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** Whether the palette overlay is open; `false` keeps it closed. */
const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(defineProps<DzCommandPaletteProps>(), {
  placeholder: 'Type a command or search...',
  items: () => [],
  groups: () => [],
  enableGlobalShortcut: true,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

const emit = defineEmits<DzCommandPaletteEmits>()
defineSlots<DzCommandPaletteSlots>()
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzCommandPalette')
const resolvedAriaLabel = computed(() => props.ariaLabel ?? dzMessages.value.ariaLabel)

const attrs = useAttrs()
const searchQuery = ref('')
const searchModel = ref<string>('')

const styles = computed(() => commandPaletteVariants())

const contentClasses = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)
/**
 * The visually-hidden dialog title.
 *
 * Was `props.ariaLabel ?? 'Command palette'` — a second copy of the same
 * literal that already sat in `withDefaults`, and one the string inventory
 * missed because it is an inline fallback rather than a prop default. Both are
 * now the one catalog entry, and the fallback is gone rather than left as
 * unreachable code: `resolvedAriaLabel` is typed `string`, so there was nothing
 * left for `??` to catch.
 */
const fallbackTitle = resolvedAriaLabel
const contentAria = computed<Record<string, unknown>>(() => {
  const aria: Record<string, unknown> = {}
  aria['aria-label'] = resolvedAriaLabel.value
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

// Reduced motion, as the APPLICATION asked for it (ADR-20 §7, TASK-R5-O3).
// The `prefers-reduced-motion` gate in the recipe answers for the OS; this
// answers for a host with its own accessibility setting, which the media
// query cannot see.
const dzMotionAttr = useDzMotionAttribute()
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal
      :to="resolvedPortalTo"
      :disabled="portalDisabled"
      :defer="portalDefer"
    >
      <DialogOverlay data-part="overlay" :class="cn(styles.overlay(), props.ui?.overlay)" :data-dz-motion="dzMotionAttr" />
      <!--
        N1-O1 defect D11: `:id="id"` with no `id` handed an explicit `undefined`
        to the Reka component, which OVERRODE the content id Reka generates for
        itself. The trigger then advertised `aria-controls=""` and the panel
        carried no id at all -- axe `aria-valid-attr-value`, and an AT user
        following the reference found nothing. Bind it only when there is one.
      -->
      <DialogContent
        data-part="content"
        :class="contentClasses"
        :data-dz-motion="dzMotionAttr"
        style="contain: layout style"
        v-bind="{ ...(id === undefined ? {} : { id }), ...contentAria, ...$attrs, class: undefined }"
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
          <div data-part="control" :class="cn(styles.inputWrapper(), props.ui?.control)">
            <svg
              data-part="icon"
              :class="cn(styles.inputIcon(), props.ui?.icon)"
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
              data-part="input"
              :class="cn(styles.input(), props.ui?.input)"
              :placeholder="placeholder"
              auto-focus
              @update:model-value="handleSearchInput"
            />
          </div>

          <!-- Items list -->
          <ComboboxContent data-part="list" :class="cn(styles.list(), props.ui?.list)" :dismiss-able="false">
            <!-- Grouped rendering -->
            <template v-if="groupedItems">
              <template v-for="groupDef in groups" :key="groupDef.id">
                <ComboboxGroup v-if="groupedItems.get(groupDef.id)?.length" data-part="group" :class="props.ui?.group">
                  <ComboboxLabel data-part="group-label" :class="cn(styles.groupHeading(), props.ui?.['group-label'])">
                    {{ groupDef.label }}
                  </ComboboxLabel>
                  <ComboboxItem
                    v-for="item in groupedItems.get(groupDef.id)"
                    :key="item.id"
                    :value="item.id"
                    :disabled="item.disabled"
                    data-part="item"
                    :class="cn(styles.item(), props.ui?.item)"
                    @select.prevent="handleSelect(item)"
                  >
                    <slot name="item" :item="item">
                      <component
                        :is="item.icon"
                        v-if="item.icon"
                        data-part="icon"
                        :class="cn(styles.itemIcon(), props.ui?.icon)"
                        aria-hidden="true"
                      />
                      <span data-part="item-label" :class="cn(styles.itemLabel(), props.ui?.['item-label'])">{{ item.label }}</span>
                      <span
                        v-if="item.shortcut"
                        data-part="suffix"
                        :class="cn(styles.itemShortcut(), props.ui?.suffix)"
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
                  data-part="item"
                  :class="cn(styles.item(), props.ui?.item)"
                  @select.prevent="handleSelect(item)"
                >
                  <slot name="item" :item="item">
                    <component
                      :is="item.icon"
                      v-if="item.icon"
                      data-part="icon"
                      :class="cn(styles.itemIcon(), props.ui?.icon)"
                      aria-hidden="true"
                    />
                    <span data-part="item-label" :class="cn(styles.itemLabel(), props.ui?.['item-label'])">{{ item.label }}</span>
                    <span
                      v-if="item.shortcut"
                      data-part="suffix"
                      :class="cn(styles.itemShortcut(), props.ui?.suffix)"
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
                data-part="item"
                :class="cn(styles.item(), props.ui?.item)"
                @select.prevent="handleSelect(item)"
              >
                <slot name="item" :item="item">
                  <component
                    :is="item.icon"
                    v-if="item.icon"
                    data-part="icon"
                    :class="cn(styles.itemIcon(), props.ui?.icon)"
                    aria-hidden="true"
                  />
                  <span data-part="item-label" :class="cn(styles.itemLabel(), props.ui?.['item-label'])">{{ item.label }}</span>
                  <span
                    v-if="item.shortcut"
                    data-part="suffix"
                    :class="cn(styles.itemShortcut(), props.ui?.suffix)"
                  >
                    {{ item.shortcut }}
                  </span>
                </slot>
              </ComboboxItem>
            </template>

            <!-- Empty state -->
            <ComboboxEmpty data-part="empty" :class="cn(styles.empty(), props.ui?.empty)">
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
