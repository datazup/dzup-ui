# Empty state

Styled icon illustration, heading, supporting copy and a primary call-to-action button for zero-data screens.

- **Category:** Application
- **Components:** DzEmpty, DzButton
- **Preview:** /blocks/empty-state

```vue
<script setup lang="ts">
/**
 * Empty state — illustration icon, heading, copy, primary action.
 *
 * Uses DzEmpty with its icon slot (overrides the icon prop for a richer
 * styled icon container), title and description props, and the actions
 * slot for a primary DzButton. Self-contained: no props, no router.
 *
 * DzEmpty renders the heading it receives via the `title` prop internally,
 * so no DzHeading is composed here — DzEmpty owns the heading level.
 */
import { DzButton, DzEmpty } from '@dzup-ui/core'
import { FolderOpen, Plus } from 'lucide-vue-next'
</script>

<template>
  <section class="es-wrap" aria-label="Empty state example">
    <DzEmpty
      title="No projects yet"
      description="Create your first project to start organizing work, tracking goals, and collaborating with your team."
    >
      <template #icon>
        <span class="es-icon" aria-hidden="true">
          <FolderOpen :size="40" />
        </span>
      </template>

      <template #actions>
        <DzButton variant="solid" tone="primary" size="md">
          <template #prefix>
            <Plus :size="16" aria-hidden="true" />
          </template>
          Create project
        </DzButton>
        <DzButton variant="ghost" tone="neutral" size="md">
          Learn more
        </DzButton>
      </template>
    </DzEmpty>
  </section>
</template>

<style scoped>
.es-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  padding: var(--dz-space-8, 2rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
}

.es-icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: var(--dz-radius-xl, 0.75rem);
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 10%, transparent);
  color: var(--dz-primary, #6366f1);
}
</style>
```
