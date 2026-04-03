<script setup lang="ts">
import {
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogDescription,
  DzDialogTitle,
  DzDialogTrigger,
  DzPopover,
  DzPopoverContent,
  DzPopoverTrigger,
  DzSheet,
  DzSheetClose,
  DzSheetContent,
  DzSheetDescription,
  DzSheetTitle,
  DzSheetTrigger,
  DzTooltip,
  DzTooltipContent,
  DzTooltipTrigger,
} from '@dzup-ui/core'
import { ref } from 'vue'

const dialogOpen = ref(false)
const sheetOpen = ref(false)
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Overlays
    </h1>
    <p class="page-description">
      Dialog, Popover, Tooltip, and Sheet (Drawer) overlay components.
    </p>

    <!-- Dialog -->
    <section class="demo-section">
      <h2 class="section-title">
        Dialog
      </h2>
      <div class="demo-row">
        <DzDialog v-model:open="dialogOpen">
          <DzDialogTrigger as-child>
            <button class="trigger-btn">
              Open Dialog
            </button>
          </DzDialogTrigger>
          <DzDialogContent>
            <DzDialogTitle>Dialog Title</DzDialogTitle>
            <DzDialogDescription>
              This is a dialog description. Dialogs are used for important interactions
              that require user attention.
            </DzDialogDescription>
            <div class="dialog-actions">
              <DzDialogClose as-child>
                <button class="trigger-btn outline">
                  Cancel
                </button>
              </DzDialogClose>
              <DzDialogClose as-child>
                <button class="trigger-btn">
                  Confirm
                </button>
              </DzDialogClose>
            </div>
          </DzDialogContent>
        </DzDialog>
        <span class="state-label">Open: {{ dialogOpen }}</span>
      </div>
    </section>

    <!-- Dialog Sizes -->
    <section class="demo-section">
      <h2 class="section-title">
        Dialog Sizes
      </h2>
      <div class="demo-row">
        <DzDialog v-for="size in (['sm', 'md', 'lg'] as const)" :key="size">
          <DzDialogTrigger as-child>
            <button class="trigger-btn outline">
              {{ size }}
            </button>
          </DzDialogTrigger>
          <DzDialogContent :size="size">
            <DzDialogTitle>{{ size.toUpperCase() }} Dialog</DzDialogTitle>
            <DzDialogDescription>
              This is a {{ size }} sized dialog content panel.
            </DzDialogDescription>
            <DzDialogClose as-child>
              <button class="trigger-btn">
                Close
              </button>
            </DzDialogClose>
          </DzDialogContent>
        </DzDialog>
      </div>
    </section>

    <!-- Popover -->
    <section class="demo-section">
      <h2 class="section-title">
        Popover
      </h2>
      <div class="demo-row">
        <DzPopover>
          <DzPopoverTrigger as-child>
            <button class="trigger-btn outline">
              Open Popover
            </button>
          </DzPopoverTrigger>
          <DzPopoverContent>
            <div style="padding: 12px; max-width: 240px">
              <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px">
                Popover Content
              </p>
              <p style="margin: 0; font-size: 13px; color: #64748b">
                This is rich content inside a popover. You can place any content here.
              </p>
            </div>
          </DzPopoverContent>
        </DzPopover>
      </div>
    </section>

    <!-- Tooltip -->
    <section class="demo-section">
      <h2 class="section-title">
        Tooltip
      </h2>
      <div class="demo-row">
        <DzTooltip>
          <DzTooltipTrigger as-child>
            <button class="trigger-btn outline">
              Hover me
            </button>
          </DzTooltipTrigger>
          <DzTooltipContent>
            This is a tooltip
          </DzTooltipContent>
        </DzTooltip>

        <DzTooltip>
          <DzTooltipTrigger as-child>
            <button class="trigger-btn outline">
              Another tooltip
            </button>
          </DzTooltipTrigger>
          <DzTooltipContent side="bottom">
            Tooltip on the bottom
          </DzTooltipContent>
        </DzTooltip>
      </div>
    </section>

    <!-- Sheet (Drawer) -->
    <section class="demo-section">
      <h2 class="section-title">
        Sheet (Drawer)
      </h2>
      <div class="demo-row">
        <DzSheet v-model:open="sheetOpen">
          <DzSheetTrigger as-child>
            <button class="trigger-btn">
              Open Sheet
            </button>
          </DzSheetTrigger>
          <DzSheetContent>
            <DzSheetTitle>Sheet Title</DzSheetTitle>
            <DzSheetDescription>
              This is a side sheet / drawer panel. It slides in from the right side
              and can contain navigation, forms, or detailed content.
            </DzSheetDescription>
            <div style="padding: 16px 0">
              <p>Sheet body content goes here.</p>
            </div>
            <DzSheetClose as-child>
              <button class="trigger-btn">
                Close Sheet
              </button>
            </DzSheetClose>
          </DzSheetContent>
        </DzSheet>
        <span class="state-label">Open: {{ sheetOpen }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-colors-foreground, #1a202c);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-colors-muted-foreground, #64748b);
  margin: 0 0 32px;
}

.demo-section {
  margin-bottom: 24px;
  padding: 24px;
  background: var(--dz-colors-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-colors-border, #e2e8f0);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-colors-foreground, #1a202c);
  margin: 0 0 16px;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.trigger-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-colors-primary-500, #3b82f6);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.trigger-btn:hover {
  background: var(--dz-colors-primary-600, #2563eb);
}

.trigger-btn.outline {
  background: transparent;
  border: 1px solid var(--dz-colors-border, #e2e8f0);
  color: var(--dz-colors-foreground, #1a202c);
}

.trigger-btn.outline:hover {
  background: var(--dz-colors-muted, #f1f5f9);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.state-label {
  font-size: 13px;
  color: var(--dz-colors-muted-foreground, #64748b);
  font-family: monospace;
}
</style>
