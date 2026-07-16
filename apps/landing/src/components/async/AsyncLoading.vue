<script setup lang="ts">
import { DzSkeleton } from '@dzup-ui/core'

/**
 * AsyncLoading — the shared `loadingComponent` for every lazily-loaded block
 * and template (see `src/lib/lazyComponent.ts`, TASK-FREE-09). A neutral
 * skeleton scaffold that holds space while the chunk downloads, so a slow
 * network shows structure instead of nothing. Announced politely to assistive
 * tech via `role="status"`.
 */
</script>

<template>
  <div class="async-loading" role="status" aria-label="Loading content">
    <DzSkeleton variant="rectangular" height="120px" />
    <DzSkeleton variant="text" :lines="3" />
  </div>
</template>

<style scoped>
.async-loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}
</style>
