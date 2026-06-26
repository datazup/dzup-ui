<script setup lang="ts">
import { DzToastProvider, DzToastViewport } from '@dzup-ui/core'
import { useReducedMotion } from '../../motion/index.ts'
import ToastSlideInControls from './ToastSlideInControls.vue'

/**
 * Toast slide-in demo (catalog `toast-slide-in`, effect 29) — real DzToasts
 * enter and stack with a slide + fade. {@link ToastSlideInControls} (inside the
 * provider) pushes them imperatively via the toast context.
 *
 * The slide + fade is driven here off the `data-state` attribute Reka sets on
 * each toast (the same hook tailwindcss-animate uses) — necessary because the
 * landing build doesn't ship those animate utilities. The viewport, normally
 * `position: fixed`, is constrained to this card so the demo stays self-contained.
 *
 * Under reduced motion (OS or the page toggle) toasts appear instantly with no
 * slide — gated here for the live page toggle; DzToast also disables its own
 * motion for the OS setting.
 */
const reduced = useReducedMotion()
</script>

<template>
  <DzToastProvider :duration="4000">
    <div class="stage" :class="{ 'stage--reduced': reduced }">
      <ToastSlideInControls />
      <DzToastViewport position="bottom-right" class="demo-viewport" />
    </div>
  </DzToastProvider>
</template>

<style scoped>
.stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 150px;
}

/* Constrain the normally-fixed viewport into this card so the demo is contained. */
:deep(.demo-viewport) {
  position: absolute !important;
  inset: auto 8px 8px auto !important;
  width: min(248px, 88%) !important;
  max-width: none !important;
  max-height: 100% !important;
  padding: 0 !important;
  gap: 8px !important;
}

/* Slide + fade keyed on Reka's data-state (replaces the absent animate utils). */
:deep(.demo-viewport [data-state='open']) {
  animation: toast-in var(--dz-duration-normal, 200ms) var(--dz-ease-out, ease-out) both;
}
:deep(.demo-viewport [data-state='closed']) {
  animation: toast-out var(--dz-duration-fast, 150ms) var(--dz-ease-in, ease-in) both;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes toast-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: translateX(40px);
  }
}

/* Page-level "Reduce motion" toggle (JS) → toasts appear/leave instantly. */
.stage--reduced :deep([data-state]) {
  animation: none !important;
}
</style>
