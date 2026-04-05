<script setup lang="ts">
// TODO: Import DzContainer, DzStack, DzGrid, DzDivider, DzSpacer, DzAspectRatio
// from @dzip-ui/core and create layout composition demos.
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Layout
    </h1>
    <p class="page-description">
      Layout primitives for structuring page content.
    </p>
    <div class="placeholder">
      <!-- TODO: Add layout demos with stacking, grid, and spacing examples -->
      <p>Layout demos coming soon. Components: DzContainer, DzStack, DzGrid, DzDivider, DzSpacer, DzAspectRatio.</p>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 960px; }
.page-title { font-size: 28px; font-weight: 700; color: var(--dz-foreground, #1a202c); margin: 0 0 8px; }
.page-description { font-size: 15px; color: var(--dz-muted-foreground, #64748b); margin: 0 0 32px; }
.placeholder { padding: 40px 24px; background: var(--dz-surface, #ffffff); border: 2px dashed var(--dz-border, #e2e8f0); border-radius: var(--dz-radius-lg, 8px); text-align: center; color: var(--dz-muted-foreground, #64748b); }
</style>
