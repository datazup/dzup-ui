<script setup lang="ts">
import { DzButton, DzHeading, DzText } from '@dzup-ui/core'
import { ArrowRight, ArrowUp } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { LINKS } from '../../config.ts'
import { CATALOG } from '../../gallery/catalog.ts'
import { DzBeam, DzOrbit, useInView, useReducedMotion, vAnimateOnScroll } from '../../motion/index.ts'

/**
 * AnimationsFinale — the /animations curtain call
 * (docs/animations-v2.md TASK-AV2-06).
 *
 * A compact CTA band closing the gallery: an aria-hidden art panel where the
 * gallery's own connection primitives draw the architecture live — DzBeam
 * light-paths linking "@dzup-ui/tokens" → "motion primitives" → "your app",
 * with a DzOrbit ring decorating the middle node — beside truthful, derived
 * copy and two next actions. The diagram is decoration (SR users get the one
 * clean sentence, never a diagram read as soup); the claim in the copy sells
 * the snippets and core, NOT an npm package that does not exist (the motion
 * module is landing-local — claims.spec.ts polices org consistency).
 *
 * Contracts: the art panel is aria-hidden + inert + pointer-events none; its
 * beam/orbit loops pause off-screen via the shared `.dz-stage-idle` cap and
 * still completely under reduced motion (both gates — the primitives resolve
 * the combined preference themselves). The band scroll-enters via the same
 * fail-open directive AV2-05 standardized. Back-to-top respects both gates.
 */

/** Derived at setup from the catalog import — never hand-typed (repo rule). */
const effectCount = CATALOG.length

const reduced = useReducedMotion()

// Off-screen loop cap, same recipe as AnimationCard's stage.
const artEl = ref<HTMLElement | null>(null)
const inView = useInView(artEl, { once: false, rootMargin: '160px 0px 160px 0px', threshold: 0 })

/** Entrance binding: no-op enter under the page toggle (mirrors the bento). */
const entrance = computed(() => (reduced.value ? { enterClass: '' } : {}))

function backToTop(): void {
  if (typeof window === 'undefined')
    return
  window.scrollTo({ top: 0, behavior: reduced.value ? 'auto' : 'smooth' })
}
</script>

<template>
  <section class="av2-finale" aria-labelledby="animations-finale-title">
    <div v-animate-on-scroll="entrance" class="finale-inner" :class="{ 'is-still': reduced }">
      <!-- The architecture, performed: tokens → motion → your app. Pure
           decoration — one aria-hidden + inert panel; the copy beside it
           carries the meaning. -->
      <div
        ref="artEl"
        class="finale-art"
        :class="{ 'dz-stage-idle': !inView }"
        aria-hidden="true"
        inert
      >
        <span class="finale-node finale-node--tokens">@dzup-ui/tokens</span>
        <span class="finale-node finale-node--motion">
          <DzOrbit :radius="30" speed="22s" class="finale-orbit">
            <i class="finale-orbit-dot" />
            <i class="finale-orbit-dot finale-orbit-dot--2" />
            <i class="finale-orbit-dot finale-orbit-dot--3" />
          </DzOrbit>
          <span class="finale-node-label">motion primitives</span>
        </span>
        <span class="finale-node finale-node--app">your app</span>
        <DzBeam from=".finale-node--tokens" to=".finale-node--motion" :curvature="34" />
        <DzBeam from=".finale-node--motion" to=".finale-node--app" :curvature="-34" />
      </div>

      <div class="finale-copy">
        <DzHeading id="animations-finale-title" :level="2" size="xl" weight="semibold" class="finale-title lp-balance">
          Take the motion with you
        </DzHeading>
        <DzText size="md" tone="muted" as="p" class="finale-lede lp-balance">
          All {{ effectCount }} effects are built on @dzup-ui/core components and design
          tokens — every snippet is copy-paste yours, reduced-motion handling included.
        </DzText>
        <div class="finale-actions">
          <DzButton variant="solid" tone="primary" as="a" :href="LINKS.components">
            Browse components
            <template #suffix>
              <ArrowRight :size="16" aria-hidden="true" />
            </template>
          </DzButton>
          <DzButton variant="outline" tone="neutral" @click="backToTop">
            <template #prefix>
              <ArrowUp :size="16" aria-hidden="true" />
            </template>
            Back to top
          </DzButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.av2-finale {
  max-width: var(--lp-container, 1120px);
  margin: clamp(48px, 8vw, 88px) auto 0;
  padding: 0 24px;
}

.finale-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(20px, 4vw, 48px);
  padding: clamp(24px, 4vw, 44px);
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background:
    radial-gradient(
      110% 130% at 0% 0%,
      color-mix(in oklch, var(--av2-accent, var(--dz-primary, #0766ee)) 10%, transparent),
      transparent 55%
    ),
    color-mix(in oklch, var(--dz-surface, #ffffff) 82%, transparent);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
  overflow: clip;
}

/* Page toggle → no entrance animation; the band is simply there. */
.finale-inner.is-still {
  animation: none;
}

/* ── Art panel ── */
.finale-art {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 150px;
  pointer-events: none;
}

.finale-node {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  border: 1px solid color-mix(in oklch, var(--av2-accent, var(--dz-primary, #0766ee)) 30%, var(--lp-hairline));
  background: color-mix(in oklch, var(--dz-surface, #ffffff) 88%, transparent);
  box-shadow: var(--dz-shadow-sm, 0 2px 6px rgb(0 0 0 / 0.06));
  font-family: var(--dz-font-mono, ui-monospace, monospace);
  font-size: clamp(0.65rem, 1.4vw, var(--dz-text-xs, 0.75rem));
  font-weight: 600;
  color: var(--dz-muted-foreground, #585b60);
  white-space: nowrap;
}

.finale-node--motion {
  color: var(--dz-foreground, #1b1d1f);
}

.finale-orbit-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--av2-accent, var(--dz-primary, #0766ee));
}

.finale-orbit-dot--2 {
  width: 6px;
  height: 6px;
  background: var(--av2-accent-2, var(--dz-primary, #0766ee));
}

.finale-orbit-dot--3 {
  width: 5px;
  height: 5px;
  background: color-mix(in oklch, var(--av2-accent, var(--dz-primary, #0766ee)) 55%, var(--dz-muted, #d3d4d7));
}

/* ── Copy ── */
.finale-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.finale-title {
  margin: 0;
}

.finale-lede {
  margin: 0;
  line-height: 1.65;
}

.finale-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

@media (max-width: 820px) {
  .finale-inner {
    grid-template-columns: 1fr;
  }

  .finale-art {
    order: 1;
    min-height: 130px;
  }
}
</style>
