<script setup lang="ts">
import { DzSegmented } from '@dzup-ui/core'
import { Moon, Sun } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useLazyMount } from '../composables/useLazyMount.ts'
import Section from './Section.vue'
import ShowcaseFrame from './ShowcaseFrame.vue'

// "Show, don't tell": the same live @dzup-ui/core dashboard rendered twice — in
// scoped `data-theme="light"` and `data-theme="dark"` containers — so a visitor
// sees both skins of one token system at once. Both frames are fully live (real
// components, not screenshots).
//
// Performance budget: on desktop we mount both frames side by side; on small
// screens that doubled render is wasteful, so we mount a single frame and let a
// segmented toggle switch which theme it shows. The breakpoint is resolved with
// matchMedia (not just CSS) so the second frame is never mounted on mobile.
const DESKTOP_QUERY = '(min-width: 901px)'

function matchesDesktop(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(DESKTOP_QUERY).matches
    : true
}

// Seed synchronously so a phone doesn't flash both frames before onMounted runs.
const isDesktop = ref(matchesDesktop())
let mql: MediaQueryList | null = null

function onChange(event: MediaQueryListEvent): void {
  isDesktop.value = event.matches
}

onMounted(() => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mql = window.matchMedia(DESKTOP_QUERY)
    isDesktop.value = mql.matches
    mql.addEventListener('change', onChange)
  }
})

onBeforeUnmount(() => mql?.removeEventListener('change', onChange))

// The hero now mounts its own compact frame eagerly (TASK-DS-11). These two are
// below the fold, so mounting them during the first paint only delays the LCP
// text above it. `useLazyMount` renders them a screen ahead of the scroll — in
// practice on the first observer callback, right after the page paints — and
// falls back to rendering eagerly with no IntersectionObserver. Measured: this
// takes ~84ms off the median LCP.
//
// The placeholder holds the frame's aspect ratio, so the swap does not move the
// page. It happens below the fold either way, which is why CLS stays at 0.
const { setEl, shouldRender } = useLazyMount()

// Mobile-only: which theme the single frame shows.
const mobileTheme = ref('light')
const themeItems = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]
</script>

<template>
  <Section
    eyebrow="Show, don't tell"
    title="One system, both skins — live"
    lede="The very same dashboard, built entirely from @dzup-ui/core, rendered in light and dark side by side. No screenshots — every element re-skins from one token system."
    heading-id="showcase-title"
  >
    <!-- Desktop: both skins side by side, each in its own scoped data-theme box. -->
    <div v-if="isDesktop" :ref="setEl" class="split">
      <div class="pane">
        <div class="pane-label">
          <Sun :size="15" aria-hidden="true" /><span>Light</span>
        </div>
        <div class="pane-scope" data-theme="light">
          <ShowcaseFrame v-if="shouldRender" label="light" />
          <div v-else class="frame-reserve" aria-hidden="true" />
        </div>
      </div>
      <div class="pane">
        <div class="pane-label">
          <Moon :size="15" aria-hidden="true" /><span>Dark</span>
        </div>
        <div class="pane-scope" data-theme="dark">
          <ShowcaseFrame v-if="shouldRender" label="dark" />
          <div v-else class="frame-reserve" aria-hidden="true" />
        </div>
      </div>
    </div>

    <!-- Mobile: one live frame + a toggle, so we never double the mount cost. -->
    <div v-else :ref="setEl" class="split-mobile">
      <DzSegmented
        v-model="mobileTheme"
        :items="themeItems"
        size="sm"
        aria-label="Preview theme"
        class="theme-switch"
      />
      <div class="pane-scope" :data-theme="mobileTheme">
        <ShowcaseFrame v-if="shouldRender" :label="mobileTheme" />
        <div v-else class="frame-reserve" aria-hidden="true" />
      </div>
    </div>
  </Section>
</template>

<style scoped>
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  align-items: start;
}

.pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

/* Labels sit OUTSIDE the scoped boxes, so they read in the live page theme. */
.pane-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
}

/* The scoped container carries its own theme's background/hairline so each side
   reads as an independent app surface, and eases its colours when re-themed. */
.pane-scope {
  padding: clamp(12px, 2vw, 20px);
  border-radius: var(--dz-radius-xl, 0.875rem);
  border: 1px solid var(--lp-hairline);
  background: var(--dz-background, #fff);
  transition: var(--dz-landing-theme-transition);
}

/* Holds the live frame's footprint until useLazyMount swaps it in. The ratio is
   the frame's own (a tall, single-column dashboard once the pane narrows), so
   the section's height barely changes when the real thing arrives. */
.frame-reserve {
  width: 100%;
  aspect-ratio: 0.43;
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #fff);
  border: 1px solid var(--lp-hairline);
}

.split-mobile {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}

.theme-switch {
  align-self: center;
}

.split-mobile .pane-scope {
  width: 100%;
}
</style>
