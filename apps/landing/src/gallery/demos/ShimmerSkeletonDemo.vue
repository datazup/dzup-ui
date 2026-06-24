<script setup lang="ts">
import { DzSkeleton } from '@dzup-ui/core'
import { DzShimmer } from '../../motion/index.ts'

/**
 * Shimmer skeleton demo (catalog `shimmer-skeleton`, effect 28) — a card of
 * DzSkeleton placeholders with a soft highlight sweeping across them via
 * {@link DzShimmer}. The skeletons set `:animate="false"` so the shimmer sweep
 * is the only motion (no competing pulse).
 *
 * Under reduced motion (OS or the page toggle) the sweep is removed and the
 * placeholders sit static.
 */
</script>

<template>
  <div class="stage">
    <DzShimmer class="card">
      <div class="head">
        <DzSkeleton variant="circular" width="44px" height="44px" :animate="false" />
        <div class="head-lines">
          <DzSkeleton variant="text" width="60%" height="12px" :animate="false" />
          <DzSkeleton variant="text" width="40%" height="10px" :animate="false" />
        </div>
      </div>
      <DzSkeleton variant="text" :lines="3" :animate="false" />
      <DzSkeleton variant="rectangular" width="100%" height="64px" :animate="false" />
    </DzShimmer>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(300px, 100%);
  padding: 16px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #fff);
}

.head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.head-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
</style>
