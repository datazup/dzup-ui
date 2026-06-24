<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme.ts'

const { resolved, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`"
    :title="`Theme: ${resolved}`"
    @click="toggle"
  >
    <Sun v-if="resolved === 'dark'" :size="18" aria-hidden="true" />
    <Moon v-else :size="18" aria-hidden="true" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #ffffff);
  color: var(--dz-muted-foreground, #64748b);
  cursor: pointer;
  transition:
    background var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease),
    color var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease),
    border-color var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.theme-toggle:hover {
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
  border-color: var(--dz-border-hover, #cbd5e1);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--dz-ring, #4f46e5);
  outline-offset: 2px;
}
</style>
