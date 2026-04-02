<script setup lang="ts">
import type { DzDataGridPaginationEmits, DzDataGridPaginationProps } from './DzDataGrid.types.ts'
/**
 * DzDataGridPagination — Internal pagination sub-part for DzDataGrid.
 *
 * Renders page navigation and page size selector.
 */
import { computed } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dataGridVariants } from './DzDataGrid.variants.ts'

const props = withDefaults(defineProps<DzDataGridPaginationProps>(), {
  pageSizeOptions: () => [10, 25, 50, 100],
})

const emit = defineEmits<DzDataGridPaginationEmits>()

const styles = computed(() => dataGridVariants({ size: 'md', density: 'default' }))

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

function goToPage(page: number): void {
  const clamped = Math.max(1, Math.min(page, totalPages.value))
  emit('update:page', clamped)
}

function handlePageSizeChange(event: Event): void {
  const size = Number((event.target as HTMLSelectElement).value)
  emit('update:pageSize', size)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div :class="styles.pagination()">
    <div class="flex items-center gap-[var(--dz-spacing-2)]">
      <span>
        Showing {{ (page - 1) * pageSize + 1 }}
        to {{ Math.min(page * pageSize, total) }}
        of {{ total }}
      </span>
    </div>

    <div class="flex items-center gap-[var(--dz-spacing-1)]">
      <select
        :value="pageSize"
        :class="cn(
          'h-8 rounded-[var(--dz-radius-sm)] border border-[var(--dz-border)]',
          'bg-transparent px-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)]',
        )"
        aria-label="Rows per page"
        @change="handlePageSizeChange"
      >
        <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
          {{ opt }} / page
        </option>
      </select>

      <button
        :class="styles.paginationButton()"
        :disabled="page <= 1"
        aria-label="Previous page"
        @click="goToPage(page - 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <span class="px-[var(--dz-spacing-2)]">
        {{ page }} / {{ totalPages }}
      </span>

      <button
        :class="styles.paginationButton()"
        :disabled="page >= totalPages"
        aria-label="Next page"
        @click="goToPage(page + 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  </div>
</template>
