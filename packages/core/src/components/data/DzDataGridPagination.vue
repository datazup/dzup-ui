<script setup lang="ts">
import type { DzDataGridPaginationEmits, DzDataGridPaginationProps } from './DzDataGrid.types.ts'
/**
 * DzDataGridPagination — Internal pagination sub-part for DzDataGrid.
 *
 * Renders page navigation and page size selector.
 */
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { DzSelectItem } from '../forms/DzSelect.types.ts'
import DzIconButton from '../buttons/DzIconButton.vue'
import DzSelect from '../forms/DzSelect.vue'
import { dataGridVariants } from './DzDataGrid.variants.ts'

const props = withDefaults(defineProps<DzDataGridPaginationProps>(), {
  pageSizeOptions: () => [10, 25, 50, 100],
})

const emit = defineEmits<DzDataGridPaginationEmits>()

const styles = computed(() => dataGridVariants({ size: 'md', density: 'default' }))

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pageSizeItems = computed<DzSelectItem[]>(() =>
  props.pageSizeOptions.map(n => ({ label: `${n} / page`, value: String(n) })),
)

const pageSizeModel = computed({
  get: () => String(props.pageSize),
  set: (val: string) => emit('update:pageSize', Number(val)),
})

function goToPage(page: number): void {
  const clamped = Math.max(1, Math.min(page, totalPages.value))
  emit('update:page', clamped)
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
      <DzSelect
        v-model="pageSizeModel"
        :items="pageSizeItems"
        size="sm"
        aria-label="Rows per page"
      />

      <DzIconButton
        :icon="ChevronLeft"
        aria-label="Previous page"
        variant="ghost"
        size="sm"
        tone="neutral"
        :disabled="page <= 1"
        @click="goToPage(page - 1)"
      />

      <span class="px-[var(--dz-spacing-2)]">
        {{ page }} / {{ totalPages }}
      </span>

      <DzIconButton
        :icon="ChevronRight"
        aria-label="Next page"
        variant="ghost"
        size="sm"
        tone="neutral"
        :disabled="page >= totalPages"
        @click="goToPage(page + 1)"
      />
    </div>
  </div>
</template>
