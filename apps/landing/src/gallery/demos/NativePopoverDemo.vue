<script setup lang="ts">
import { DzMenu, DzMenuItem, DzMenuSeparator, DzText } from '@dzup-ui/core'
import { Archive, ChevronDown, Info, Pencil, Share2, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import { DzNativePopover, useReducedMotion } from '../../motion/index.ts'

/**
 * Native popover entrance demo (catalog `native-popover-entrance`, effect 57) — a
 * menu and a tooltip that open with the browser's own Popover API.
 *
 * {@link DzNativePopover} renders a `popovertarget` trigger + a `[popover]` panel,
 * so the platform owns light-dismiss, Esc and top-layer stacking. The entrance
 * animates from `@starting-style` with `transition-behavior: allow-discrete` (the
 * exit plays too) behind `@supports`; where the Popover API is absent it falls
 * back to a `<Transition>` with re-added Esc + outside-click. Under reduced motion
 * (OS or the page toggle) both paths show/hide instantly.
 */
const reduced = useReducedMotion()
const lastAction = ref('')

function pick(action: string): void {
  lastAction.value = action
}
</script>

<template>
  <div class="stage">
    <div class="row">
      <!-- Menu popover (pairs with DzMenu). -->
      <DzNativePopover class="pop" aria-label="Document actions" :disabled="reduced">
        <template #trigger>
          <span class="trigger">
            Actions
            <ChevronDown :size="15" aria-hidden="true" />
          </span>
        </template>

        <template #default="{ close }">
          <div class="surface">
            <DzMenu aria-label="Document actions" size="sm">
              <DzMenuItem @click="pick('Edit'); close()">
                <template #icon>
                  <Pencil :size="16" />
                </template>
                Edit
              </DzMenuItem>
              <DzMenuItem @click="pick('Share'); close()">
                <template #icon>
                  <Share2 :size="16" />
                </template>
                Share
              </DzMenuItem>
              <DzMenuItem @click="pick('Archive'); close()">
                <template #icon>
                  <Archive :size="16" />
                </template>
                Archive
              </DzMenuItem>
              <DzMenuSeparator />
              <DzMenuItem @click="pick('Delete'); close()">
                <template #icon>
                  <Trash2 :size="16" />
                </template>
                Delete
              </DzMenuItem>
            </DzMenu>
          </div>
        </template>
      </DzNativePopover>

      <!-- Tooltip popover (pairs with DzTooltip; role="tooltip"). -->
      <DzNativePopover class="pop" role="tooltip" aria-label="About sync" :disabled="reduced">
        <template #trigger>
          <span class="trigger trigger--icon" aria-label="About sync">
            <Info :size="16" aria-hidden="true" />
          </span>
        </template>

        <template #default>
          <div class="surface surface--tip">
            <DzText size="sm" as="p" class="tip-copy">
              Changes sync to every device the moment you make them.
            </DzText>
          </div>
        </template>
      </DzNativePopover>
    </div>

    <DzText size="xs" tone="muted" as="p" class="readout" aria-live="polite">
      {{ lastAction ? `Picked: ${lastAction}` : 'Open a popover — Esc or click-away dismisses it.' }}
    </DzText>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  min-height: 160px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Trigger chrome lives on the slotted content; DzNativePopover's own button is a
   transparent wrapper, so there is no nested-button. */
.trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: var(--dz-radius-md, 0.5rem);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
  color: var(--dz-foreground, #0f172a);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  transition:
    border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out),
    background var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}
.trigger--icon {
  padding: 9px;
  color: var(--dz-muted-foreground, #64748b);
}

/* Make the wrapper button's focus ring read on the visible trigger chrome. */
.pop :deep(.dz-native-pop__trigger:hover) .trigger {
  border-color: color-mix(in oklch, var(--dz-primary, #6366f1) 45%, var(--dz-border, #e2e8f0));
}
.pop :deep(.dz-native-pop__trigger:focus-visible) {
  outline: none;
}
.pop :deep(.dz-native-pop__trigger:focus-visible) .trigger {
  outline: 2px solid var(--dz-ring, var(--dz-primary, #6366f1));
  outline-offset: 2px;
}

/* Surface chrome the primitive deliberately leaves to the consumer. */
.surface {
  min-width: 188px;
  padding: 6px;
  border-radius: var(--dz-radius-lg, 0.75rem);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
  box-shadow: var(--dz-shadow-xl, 0 18px 40px -12px rgb(15 23 42 / 0.35));
}

.surface--tip {
  min-width: 0;
  max-width: 220px;
  padding: 10px 12px;
}

.tip-copy {
  margin: 0;
  line-height: 1.5;
  color: var(--dz-foreground, #0f172a);
}

.readout {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
</style>
