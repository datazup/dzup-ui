<script setup lang="ts">
import { DzHeading, DzText } from '@dzup-ui/core'
import { DzAurora } from '../../motion/index.ts'

/**
 * Aurora drift demo (catalog `aurora-drift`, effect 15) — {@link DzAurora}'s
 * brand blobs drift slowly behind a hero-style headline. Re-mounting on Replay
 * restarts the loops. Under reduced motion (OS or page toggle) the blobs sit
 * static — the current `.lp-aurora` look. The copy stays above the wash for
 * contrast and readability.
 */
</script>

<template>
  <div class="stage">
    <DzAurora />
    <div class="content">
      <DzHeading :level="3" size="lg" weight="bold" class="lp-balance">Living backdrop</DzHeading>
      <DzText size="xs" tone="muted" as="div">Soft blobs drift on slow, offset loops.</DzText>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 168px;
  overflow: hidden;
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #fff);
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 16px;
}
</style>
