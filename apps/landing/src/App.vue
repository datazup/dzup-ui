<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DzThemeProvider, DzToastProvider, DzToastViewport } from '@dzup-ui/core'
import TopNav from './components/TopNav.vue'
import AppFooter from './components/Footer.vue'
import { useTheme } from './composables/useTheme.ts'

// Initialise the theme singleton at the root so the toggle re-themes the whole
// page (spec §4.2 / §6.4). DzToastProvider lets showcase components raise toasts.
useTheme()

// The template preview route (docs/templates.md §3) renders chromeless — it is
// the iframe + fullscreen target — so suppress the nav and footer around it.
const route = useRoute()
const isPreview = computed(() => route.name === 'template-preview')
</script>

<template>
  <!-- DzThemeProvider supplies the core theme context (the `dz-theme` injection)
       so theme-bound components like DzColorModeToggle — used by the nav-bar and
       footer blocks — resolve and function. It shares the landing useTheme()
       storage key ('dz-theme') and `data-theme` attribute, so the two stay in
       sync rather than conflicting. -->
  <DzThemeProvider>
  <DzToastProvider>
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="landing-shell">
      <TopNav v-if="!isPreview" />
      <main id="main" class="landing-main">
        <!-- Route transition (docs/animations.md §6.8, effect 30) — a fade+slide
             between landing routes. Keyed by path so it fires on route changes
             (not in-page hash nav); `out-in` lets scrollBehavior land cleanly
             after the swap. Reduced motion degrades to an instant opacity swap
             via the scoped @media block below. -->
        <router-view v-slot="{ Component, route: current }">
          <Transition name="route" mode="out-in">
            <!-- Wrap the routed component in a single element so the transition
                 always has one root to animate. Page components may have
                 multiple root nodes (e.g. HomePage), which <Transition> cannot
                 transition directly — without this wrapper, leaving a multi-root
                 page breaks the out-in enter step and the next page never mounts
                 (blank screen on client-side navigation). -->
            <div :key="current.path" class="route-view">
              <component :is="Component" />
            </div>
          </Transition>
        </router-view>
      </main>
      <AppFooter v-if="!isPreview" />
    </div>
    <DzToastViewport position="bottom-right" />
  </DzToastProvider>
  </DzThemeProvider>
</template>

<style scoped>
.landing-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--dz-background, #ffffff);
  color: var(--dz-foreground, #1a202c);
  transition: var(--dz-landing-theme-transition);
}

.landing-main {
  flex: 1;
}

/* Route transition (effect 30): fade + a short vertical slide. Transform/opacity
   only; durations/easings from the motion token scale. The outgoing view lifts
   up and out, the incoming view rises in from just below. */
.route-enter-active,
.route-leave-active {
  transition:
    opacity var(--dz-duration-normal, 200ms) var(--dz-ease-default, ease),
    transform var(--dz-duration-normal, 200ms) var(--dz-ease-default, ease);
}

.route-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.route-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Reduced motion: instant opacity swap, no slide (honours the OS setting; the
   page-level demo toggle only governs the in-gallery RouteTransition demo). */
@media (prefers-reduced-motion: reduce) {
  .route-enter-active,
  .route-leave-active {
    transition-duration: 0.01ms;
  }

  .route-enter-from,
  .route-leave-to {
    transform: none;
  }
}

/* Visible-on-focus skip link for keyboard users (spec §8). */
.skip-link {
  position: absolute;
  left: 12px;
  top: -48px;
  z-index: 100;
  padding: 8px 14px;
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-primary, #4f46e5);
  color: var(--dz-primary-foreground, #ffffff);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  text-decoration: none;
  transition: top var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.skip-link:focus {
  top: 12px;
}
</style>
