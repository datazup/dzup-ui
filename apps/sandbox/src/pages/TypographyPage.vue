<script setup lang="ts">
// TODO: Import DzHeading, DzText, DzCode from @dzip-ui/core
// and create typography demos with sizes, weights, and styles.
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Typography
    </h1>
    <p class="page-description">
      Typography components for headings, body text, and code blocks.
    </p>
    <div class="placeholder">
      <!-- TODO: Add typography demos with heading levels, text sizes, code formatting -->
      <p>Typography demos coming soon. Components: DzHeading, DzText, DzCode.</p>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 960px; }
.page-title { font-size: 28px; font-weight: 700; color: var(--dz-foreground, #1a202c); margin: 0 0 8px; }
.page-description { font-size: 15px; color: var(--dz-muted-foreground, #64748b); margin: 0 0 32px; }
.placeholder { padding: 40px 24px; background: var(--dz-surface, #ffffff); border: 2px dashed var(--dz-border, #e2e8f0); border-radius: var(--dz-radius-lg, 8px); text-align: center; color: var(--dz-muted-foreground, #64748b); }
</style>
