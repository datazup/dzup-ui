<script setup lang="ts">
import { DzButton, DzErrorBoundary, DzHeading, DzText, DzThemeProvider, DzToastProvider, DzToastViewport, DzVisuallyHidden } from '@dzup-ui/core'
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AnnouncementBanner from './components/AnnouncementBanner.vue'
import AppFooter from './components/Footer.vue'
import GlobalCommandPalette from './components/GlobalCommandPalette.vue'
import ThemeRecipeController from './components/ThemeRecipeController.ts'
import TopNav from './components/TopNav.vue'
import { supportsViewTransitions, useReducedMotion } from './motion/index.ts'

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

// Error-boundary recovery (TASK-FREE-09). The boundary around <RouterView>
// dogfoods the library's own DzErrorBoundary: a throw anywhere in a routed
// page renders the fallback below instead of blanking the app. "Try again"
// re-renders in place; "Go home" navigates first so a page that throws on
// every render isn't retried into the same error.
const router = useRouter()
function logRouteError(error: unknown, _instance: unknown, info: string): void {
  console.error(`[dzup-ui landing] route render error (${info}):`, error)
}
async function recoverHome(reset: () => void): Promise<void> {
  await router.push('/')
  reset()
}

// SPA route-change accessibility (TASK-FREE-10). Two things a client-side
// router never does by itself:
//
//   1. FOCUS: after navigation, keyboard/screen-reader focus stays parked in
//      the OLD page's DOM position (scrollBehavior only moves the viewport).
//      Move it to the new page's <h1> — which announces the page name — or to
//      <main> as the fallback. Skipped on the initial load (the document start
//      is already correct) and on in-page anchor/hash navigation (same path).
//      `preventScroll` leaves scrolling to the router's scrollBehavior, and the
//      focus move itself does not fight the View Transition guard: both run
//      after the navigation is confirmed and the DOM is patched.
//
//   2. ANNOUNCEMENT: not all assistive tech announces a <title> change in a
//      client-routed SPA, so a visually-hidden aria-live region (the library's
//      own DzVisuallyHidden) speaks the new page title once it settles.
const routeAnnouncement = ref('')
router.afterEach((to, from, failure) => {
  if (failure || !from.name || to.path === from.path)
    return
  void nextTick(() => {
    const target
      = document.querySelector<HTMLElement>('main h1') ?? document.getElementById('main')
    if (target) {
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
    routeAnnouncement.value = document.title
  })
})
</script>

<template>
  <!-- DzThemeProvider is the landing's one color-mode preference authority.
       ThemeRecipeController applies the app-owned ThemeRecipeV1 design fields
       and mirrors the provider's mode into that recipe; no second theme store or
       synchronization bridge remains. -->
  <DzThemeProvider>
    <ThemeRecipeController />
    <DzToastProvider>
      <a class="skip-link" href="#main">Skip to content</a>
      <div class="landing-shell">
        <!-- Config-driven announcement bar above the nav. Hidden on the chromeless
           preview routes (iframe / new-tab render targets), like the nav/footer. -->
        <AnnouncementBanner v-if="!isPreview" />
        <TopNav v-if="!isPreview" />
        <!-- `tabindex="-1"` is PERMANENT, not something the router adds later
             (TASK-FREE3-07). The skip link above targets `#main`, and moving focus
             on fragment activation is only guaranteed for a focusable target —
             browsers vary on what they do when the target cannot take focus, some
             moving the viewport without moving focus at all. The afterEach guard
             below also sets it, but that fires on NAVIGATION: on the first painted
             route no navigation has happened yet, so the very first use of the skip
             link — the one a keyboard user hits within seconds of arriving — was
             the one case with no tabindex on the target. -1 keeps it unreachable by
             Tab; the unscoped rule below suppresses the ring for this programmatic
             focus alone. -->
        <main id="main" tabindex="-1" class="landing-main">
          <!-- The library's own error boundary around the routed view: a throw in
             any page renders this recoverable fallback, never a blank screen. -->
          <DzErrorBoundary :on-error="logRouteError">
            <template #fallback="{ reset }">
              <div class="route-error" role="alert">
                <DzHeading :level="1" size="xl" weight="semibold">
                  This page hit an error
                </DzHeading>
                <DzText tone="muted">
                  Something inside this page threw while rendering. You can retry it, or head back
                  to the home page — the rest of the site is unaffected.
                </DzText>
                <div class="route-error-actions">
                  <DzButton variant="solid" tone="primary" @click="reset()">
                    Try again
                  </DzButton>
                  <DzButton variant="outline" tone="neutral" @click="recoverHome(reset)">
                    Go home
                  </DzButton>
                </div>
              </div>
            </template>
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
          </DzErrorBoundary>
        </main>
        <AppFooter v-if="!isPreview" />
      </div>
      <!-- Site-wide ⌘K / Ctrl+K palette (its own global shortcut + focus trap).
         Skipped on the chromeless preview routes — those are iframe/new-tab
         render targets, not surfaces a visitor navigates from. -->
      <GlobalCommandPalette v-if="!isPreview" />
      <!-- Route announcer: speaks the new page title after client-side navigation
         (aria-live, visually hidden). See the afterEach guard above. -->
      <DzVisuallyHidden aria-live="polite" role="status">
        {{ routeAnnouncement }}
      </DzVisuallyHidden>
      <DzToastViewport position="bottom-right" />
    </DzToastProvider>
  </DzThemeProvider>
</template>

<style scoped>
.landing-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--dz-background, #e7e8e9);
  color: var(--dz-foreground, #1b1d1f);
  transition: var(--dz-landing-theme-transition);
}

.landing-main {
  flex: 1;
}

/**
 * Hold the viewport open while a lazy route chunk is in flight (TASK-FREE-13).
 *
 * `main` is `flex: 1` inside a `min-height: 100vh` column, so with an empty routed
 * view it collapses to whatever is left of the first screen — which puts the FOOTER
 * inside the viewport. When the chunk lands and the real page mounts, the footer is
 * shoved down: one large, visible jump. Measured on the built site, that single
 * shift is the entire CLS of every lazy route — 0.44 on desktop, 0.82 on mobile,
 * against a 0.1 budget — while eager `/` sits at 0.000. The app mounts without
 * awaiting `router.isReady()` (main.ts), which is what makes the empty frame
 * visible at all.
 *
 * Reserving a screen's worth of height means the footer starts below the fold and
 * never shifts *into* view, so the arriving content extends the page instead of
 * displacing painted pixels. `min-height` (not `height`) so a real page is free to
 * be taller; short pages simply place the footer at the bottom of the first screen,
 * which is where it already sat.
 *
 * The alternative — mounting after `router.isReady()` — trades this for a blank
 * screen until the chunk arrives, i.e. it fixes CLS by making FCP worse. Not the
 * trade this task is here to make.
 */
.route-view {
  min-height: 100vh;
}

/* Fallback rendered by the DzErrorBoundary around the routed view. */
.route-error {
  max-width: 560px;
  margin: 0 auto;
  padding: clamp(64px, 12vw, 140px) 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.route-error-actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
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
  background: var(--dz-primary, #0766ee);
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
/* Route-change focus targets (see the afterEach guard): the <h1>/<main> gain
   tabindex="-1" ONLY so script can move focus to them after navigation. They
   are never tab-reachable, so the focus ring is suppressed for this
   programmatic focus alone — real interactive elements keep their rings.
   Unscoped: the h1 lives inside routed pages, outside this component's scope. */
h1[tabindex='-1']:focus,
main[tabindex='-1']:focus {
  outline: none;
}

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
