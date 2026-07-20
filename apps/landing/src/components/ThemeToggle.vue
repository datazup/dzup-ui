<script setup lang="ts">
import { DzColorModeToggle } from '@dzup-ui/core'
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme.ts'

/**
 * The nav theme control — light / dark / system (TASK-FREE2-08).
 *
 * This is `DzColorModeToggle` from our own library, not a hand-rolled button.
 * The site that markets the component should use it, and its icon variant
 * already does everything this control needs: it cycles all three modes, shows
 * the active preference as its glyph (sun / moon / monitor), labels the action
 * it will perform, and announces `System theme (Dark)` through a live region —
 * so the "following system" state and the resolved theme both reach assistive
 * tech. It is a DzIconButton underneath, so it is keyboard operable and themed.
 *
 * It binds to the `DzThemeProvider` context rather than to the landing's
 * `useTheme` singleton. That is only correct because `useProviderThemeSync`
 * (mounted in App.vue) makes the provider mirror the singleton — before that
 * bridge existed, adopting this component here would have split the site's
 * theme state in two. See that composable for the authority design.
 *
 * The binary flip this replaced could reach `light` and `dark` only: one click
 * pinned an explicit mode and `system` became unreachable without clearing
 * localStorage.
 *
 * Trade-off, deliberate: a change made here cross-fades via the CSS
 * `--dz-landing-theme-transition` on major surfaces, not the full-page View
 * Transition snapshot that `useThemeTransition` drives. The component has no
 * knowledge of that landing-only flourish, and the hero's RethemeButton — where
 * the effect is the point — still uses it.
 */

const { mode, resolved } = useTheme()

// Hover affordance for the state the glyph alone cannot show: while following
// the OS, which theme that currently resolves to.
const title = computed(() =>
  mode.value === 'system' ? `Theme: system (${resolved.value})` : `Theme: ${mode.value}`,
)
</script>

<template>
  <DzColorModeToggle
    variant="icon"
    size="md"
    :show-system="true"
    class="theme-toggle"
    :title="title"
  />
</template>

<style scoped>
/* The control is a DzIconButton (already tokenised and focus-ringed); this only
   matches it to the neighbouring nav affordances, which are bordered boxes. */
.theme-toggle :deep(button) {
  width: 38px;
  height: 38px;
  border: 1px solid var(--dz-border, #b5b7bb);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #ffffff);
  color: var(--dz-muted-foreground, #585b60);
  transition:
    background var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease),
    color var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease),
    border-color var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.theme-toggle :deep(button:hover) {
  background: var(--dz-muted, #d3d4d7);
  color: var(--dz-foreground, #1b1d1f);
  border-color: var(--dz-border-hover, #b5b7bb);
}
</style>
