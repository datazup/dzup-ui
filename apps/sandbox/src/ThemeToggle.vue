<script setup lang="ts">
import { useTheme } from '@dzup-ui/core/providers'

const { resolvedTheme, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`"
    :title="`Current: ${resolvedTheme}`"
    @click="toggleTheme"
  >
    <span v-if="resolvedTheme === 'dark'" aria-hidden="true">☀️</span>
    <span v-else aria-hidden="true">🌙</span>
    <span class="theme-label">{{ resolvedTheme === 'dark' ? 'Light' : 'Dark' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-muted-foreground, #64748b);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--dz-duration-fast, 150ms), color var(--dz-duration-fast, 150ms);
  text-align: left;
}

.theme-toggle:hover {
  background: var(--dz-accent, #e2e8f0);
  color: var(--dz-foreground, #1a202c);
}

.theme-label {
  flex: 1;
}
</style>
