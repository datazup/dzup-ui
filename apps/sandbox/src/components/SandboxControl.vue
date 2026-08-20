<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
}>()
</script>

<template>
  <label class="control">
    <span class="control-label">{{ label }}</span>
    <slot />
    <span v-if="hint" class="control-hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.control-hint {
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
}

.control :deep(select),
.control :deep(input[type='text']),
.control :deep(input[type='number']) {
  padding: 6px 8px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
}

.control :deep(input[type='checkbox']) {
  width: 16px;
  height: 16px;
}

.control :deep(input[type='range']) {
  accent-color: var(--dz-primary, #2563eb);
}
</style>
