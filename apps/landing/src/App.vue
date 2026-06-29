<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DzThemeProvider, DzToastProvider, DzToastViewport } from '@dzup-ui/core'
import TopNav from './components/TopNav.vue'
import AppFooter from './components/Footer.vue'
import { useTheme } from './composables/useTheme.ts'
import { supportsViewTransitions, useReducedMotion } from './motion/index.ts'

// Initialise the theme singleton at the root so the toggle re-themes the whole
// page (spec §4.2 / §6.4). DzToastProvider lets showcase components raise toasts.
useTheme()

// The preview routes render chromeless — they are the iframe / fullscreen /
// "open in new tab" targets — so suppress the nav and footer around them: the
// template preview (docs/templates.md §3) and the standalone block preview
// (docs/blocks.md §3.5).
const CHROMELESS_ROUTES = new Set(['template-preview', 'block-preview'])
const route = useRoute()
const isPreview = computed(() => CHROMELESS_ROUTES.has(route.name as string))

// Native route transition (docs/animations.md §3.1, §4 — effect 30). When the
// View Transitions API is available and motion is allowed, the route swap is
// driven through `document.startViewTransition` by the router guard (router.ts)
// and animated by the scoped `::view-transition-*` keyframes below — so the Vue
// `<Transition name="route">` must NOT also fire (its out-in mode would defer the
// mount past the snapshot). We render the routed view bare on the native path and
// keep the original `<Transition>` untouched as the guaranteed fallback for
// unsupported browsers and reduced motion. Reactive to OS reduced-motion changes.
const reduced = useReducedMotion()
const useNativeRoute = computed(() => supportsViewTransitions() && !reduced.value)
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
          <!-- Native path: the router guard wraps the swap in a View Transition,
               so render bare (no Vue <Transition>) to avoid double-animating. The
               wrapper still carries one root so the routed `root` snapshot is the
               whole view. -->
          <div v-if="useNativeRoute" :key="current.path" class="route-view">
            <component :is="Component" />
          </div>
          <!-- Fallback path (unsupported / reduced motion): the original Vue
               <Transition>, unchanged. -->
          <Transition v-else name="route" mode="out-in">
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

<!-- Native route transition keyframes (docs/animations.md §3.1, §4 — effect 30).
     UNSCOPED on purpose: the `::view-transition-*` pseudo-elements live in the
     top layer attached to :root, outside this component's scoped DOM, so a scoped
     selector can never reach them. Gated inside @media (prefers-reduced-motion:
     no-preference) so the custom morph NEVER runs under reduced motion — there the
     guard also skips the View Transition entirely and the <Transition> fallback
     handles the instant swap. transform/opacity only; tokens for timing. -->
<style>
@media (prefers-reduced-motion: no-preference) {
  /* Replace the UA default cross-fade on the whole-page `root` snapshot with a
     fade + short vertical slide that mirrors the <Transition> fallback. */
  ::view-transition-old(root) {
    animation: dz-route-vt-out var(--dz-duration-normal, 200ms) var(--dz-ease-in, ease-in)
      both;
  }
  ::view-transition-new(root) {
    animation: dz-route-vt-in var(--dz-duration-normal, 200ms) var(--dz-ease-out, ease-out)
      both;
  }

  @keyframes dz-route-vt-out {
    to {
      opacity: 0;
      transform: translateY(-8px);
    }
  }
  @keyframes dz-route-vt-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
}
</style>
