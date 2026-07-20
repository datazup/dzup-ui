<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { computed } from 'vue'
import { useThemeTransition } from '../composables/useThemeTransition.ts'

// Prominent hero control (spec §4.2): one click re-themes the entire page with a
// short colour cross-fade (or an instant swap under reduced motion). Reuses the
// shared theme singleton via useThemeTransition, so the nav control stays in sync.
//
// Deliberately still a binary flip (TASK-FREE2-08 <retheme>): this is a "look what
// the tokens do" affordance, and a three-way control would blunt it. What it must
// NOT do is pretend to be the whole theme story — a flip here PINS an explicit
// mode, so the label says so and points at the nav control, which is where
// `system` lives. Before that control existed, this button silently converted one
// curious click into a permanent override with no way back.
const { resolved, retheme } = useThemeTransition()

const next = computed(() => (resolved.value === 'dark' ? 'light' : 'dark'))
</script>

<template>
  <button
    type="button"
    class="retheme"
    :aria-label="`Re-theme the whole page — switch to ${next} mode`"
    :title="`Switch to ${next} mode. Pins an explicit theme — the nav control is where 'system' lives.`"
    @click="retheme"
  >
    <span class="retheme-glow" aria-hidden="true" />
    <span class="retheme-icon" aria-hidden="true">
      <Sun v-if="resolved === 'dark'" :size="16" />
      <Moon v-else :size="16" />
    </span>
    <span class="retheme-text">Re-theme the page</span>
    <span class="retheme-mode" aria-hidden="true">{{ resolved }}</span>
  </button>
</template>

<style scoped>
.retheme {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 10px 14px;
  border: 1px solid color-mix(in oklch, var(--dz-primary, #0766ee) 32%, var(--lp-hairline));
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--dz-surface, #ffffff) 76%, transparent);
  backdrop-filter: blur(8px);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
  color: var(--dz-foreground, #1b1d1f);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  cursor: pointer;
  isolation: isolate;
  transition:
    transform var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease),
    border-color var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease),
    box-shadow var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

/* Brand halo behind the pill — transform/opacity only, so hover stays cheap. */
.retheme-glow {
  position: absolute;
  inset: -1px;
  z-index: -1;
  border-radius: inherit;
  background: linear-gradient(120deg,
    color-mix(in oklch, var(--lp-brand) 55%, transparent),
    color-mix(in oklch, var(--lp-brand-2) 55%, transparent));
  opacity: 0;
  transform: scale(0.96);
  transition:
    opacity var(--dz-duration-normal, 200ms) var(--dz-ease-default, ease),
    transform var(--dz-duration-normal, 200ms) var(--dz-ease-default, ease);
}

.retheme:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklch, var(--dz-primary, #0766ee) 55%, transparent);
  box-shadow: var(--lp-shadow), var(--lp-highlight);
}

.retheme:hover .retheme-glow {
  opacity: 0.28;
  transform: scale(1);
}

.retheme:focus-visible {
  outline: 2px solid var(--dz-ring, #0766ee);
  outline-offset: 2px;
}

.retheme-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--dz-radius-full, 9999px);
  background: linear-gradient(135deg, var(--lp-brand), var(--lp-brand-2));
  color: #fff;
}

.retheme-mode {
  padding: 3px 9px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-muted, #d3d4d7);
  color: var(--dz-muted-foreground, #585b60);
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: var(--dz-landing-theme-transition);
}

@media (prefers-reduced-motion: reduce) {
  .retheme,
  .retheme-glow {
    transition: none;
  }
  .retheme:hover {
    transform: none;
  }
}
</style>
