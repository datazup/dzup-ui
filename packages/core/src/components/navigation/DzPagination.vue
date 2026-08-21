<script setup lang="ts">
import type { DzPaginationEmits, DzPaginationProps, DzPaginationSlots } from './DzPagination.types.ts'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-vue-next'
import {
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from 'reka-ui'
/**
 * DzPagination — Page navigation using Reka UI Pagination primitives (ADR-07).
 *
 * v-model via defineModel<number>() for current page (ADR-16).
 *
 * @example
 * ```vue
 * <DzPagination v-model="page" :total="100" :page-size="10" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { paginationVariants } from './DzPagination.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<number>({ default: 1 })

const props = withDefaults(defineProps<DzPaginationProps>(), {
  pageSize: 10,
  siblingCount: 1,
  showEdges: false,
  size: 'md',
  disabled: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzPaginationEmits>()
defineSlots<DzPaginationSlots>()
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzPagination')
const resolvedAriaLabel = computed(() => props.ariaLabel ?? dzMessages.value.ariaLabel)

const attrs = useAttrs()

const styles = computed(() =>
  paginationVariants({ size: props.size }),
)

const navClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

function handlePageChange(page: number): void {
  model.value = page
  emit('change', page)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<template>
  <nav
    :id="id"
    :class="navClasses"
    :aria-label="resolvedAriaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-state="disabled ? 'disabled' : 'idle'"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @focusin="handleFocus"
    @focusout="handleBlur"
  >
    <PaginationRoot
      :page="model"
      :items-per-page="pageSize"
      :total="total"
      :sibling-count="siblingCount"
      :show-edges="showEdges"
      :disabled="disabled"
      @update:page="handlePageChange"
    >
      <PaginationList v-slot="{ items }" :class="styles.list()">
        <!-- First page button -->
        <PaginationFirst
          v-if="showEdges"
          :class="styles.button()"
          :aria-label="dzMessages.firstPage"
        >
          <slot name="first">
            <ChevronsLeft class="h-4 w-4" aria-hidden="true" />
          </slot>
        </PaginationFirst>

        <!-- Previous button -->
        <PaginationPrev
          :class="styles.button()"
          :aria-label="dzMessages.previousPage"
        >
          <slot name="prev">
            <ChevronLeft class="h-4 w-4" aria-hidden="true" />
          </slot>
        </PaginationPrev>

        <!-- Page items -->
        <template v-for="(item, index) in items" :key="index">
          <PaginationListItem
            v-if="item.type === 'page'"
            :value="item.value"
            :class="cn(
              styles.button(),
              item.value === model ? styles.activeButton() : '',
            )"
            :aria-current="item.value === model ? 'page' : undefined"
          >
            {{ item.value }}
          </PaginationListItem>

          <PaginationEllipsis
            v-else
            :index="index"
            :class="styles.ellipsis()"
          >
            <MoreHorizontal class="h-4 w-4" aria-hidden="true" />
          </PaginationEllipsis>
        </template>

        <!-- Next button -->
        <PaginationNext
          :class="styles.button()"
          :aria-label="dzMessages.nextPage"
        >
          <slot name="next">
            <ChevronRight class="h-4 w-4" aria-hidden="true" />
          </slot>
        </PaginationNext>

        <!-- Last page button -->
        <PaginationLast
          v-if="showEdges"
          :class="styles.button()"
          :aria-label="dzMessages.lastPage"
        >
          <slot name="last">
            <ChevronsRight class="h-4 w-4" aria-hidden="true" />
          </slot>
        </PaginationLast>
      </PaginationList>
    </PaginationRoot>
  </nav>
</template>
