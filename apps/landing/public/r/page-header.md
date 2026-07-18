# Page header

Breadcrumb trail, page title with inline status badge, and a row of contextual action buttons.

- **Category:** Application
- **Components:** DzBreadcrumb, DzBreadcrumbItem, DzHeading, DzBadge, DzButton
- **Preview:** /blocks/page-header

```vue
<script setup lang="ts">
/**
 * Page header — breadcrumb, page title, status badge, action buttons.
 *
 * A surface-level page header pattern: location breadcrumb, an H4 page
 * title with a status DzBadge inline, and a right-aligned row of action
 * buttons. Self-contained — no props, no router, local state only.
 *
 * Heading level: H4 so the visual hierarchy nests under the BlockPreview's
 * H3 title. On a real page, raise :level to match your document outline.
 */
import {
  DzBadge,
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzButton,
  DzHeading,
} from '@dzup-ui/core'
import { Download, Plus, Share2 } from 'lucide-vue-next'
</script>

<template>
  <section class="ph-wrap" aria-labelledby="ph-title">
    <!-- Breadcrumb row -->
    <DzBreadcrumb aria-label="Page location" class="ph-breadcrumb">
      <DzBreadcrumbItem href="#">Workspace</DzBreadcrumbItem>
      <DzBreadcrumbItem href="#">Projects</DzBreadcrumbItem>
      <DzBreadcrumbItem :current="true">Q3 Launch Plan</DzBreadcrumbItem>
    </DzBreadcrumb>

    <!-- Title + actions row -->
    <div class="ph-row">
      <div class="ph-left">
        <div class="ph-title-group">
          <DzHeading id="ph-title" :level="4" size="2xl" weight="bold">
            Q3 Launch Plan
          </DzHeading>
          <DzBadge variant="subtle" tone="success" size="sm">In progress</DzBadge>
        </div>
      </div>

      <div class="ph-actions">
        <DzButton variant="ghost" tone="neutral" size="sm">
          <template #prefix><Share2 :size="15" aria-hidden="true" /></template>
          Share
        </DzButton>
        <DzButton variant="outline" tone="neutral" size="sm">
          <template #prefix><Download :size="15" aria-hidden="true" /></template>
          Export
        </DzButton>
        <DzButton variant="solid" tone="primary" size="sm">
          <template #prefix><Plus :size="15" aria-hidden="true" /></template>
          New task
        </DzButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ph-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
}

.ph-breadcrumb {
  /* Breadcrumb sits above the main title row */
}

.ph-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-4, 1rem);
  flex-wrap: wrap;
}

.ph-left {
  min-width: 0;
}

.ph-title-group {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  flex-wrap: wrap;
}

.ph-actions {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  flex-wrap: wrap;
}

@media (max-width: 560px) {
  .ph-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .ph-actions {
    width: 100%;
  }
}
</style>
```
