<script setup lang="ts">
import { DzButton, DzHeading, DzText } from '@dzup-ui/core'
import { SHADE_STEPS } from '@dzup-ui/tokens'
import { AlertCircle, ArrowRight, Check, Download, Link2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { DESIGNER_INTENTS } from '../../composables/useThemeDesigner.ts'
import { LINKS } from '../../config.ts'
import { DzBeam, DzOrbit, useInView, useReducedMotion, vAnimateOnScroll } from '../../motion/index.ts'

/**
 * ThemesFinale — the /themes private view (docs/themes-v2.md TASK-THV2-07).
 *
 * A compact CTA band closing the editor: an aria-hidden art panel where the
 * connection primitives draw the designer's OWN architecture live — DzBeam
 * light-paths linking "your recipe" → "--dz-* variables" → "every component",
 * with a DzOrbit ring on the middle node — everything reading the LIVE
 * `--dz-primary`, so the diagram is painted in the visitor's mix. Beside it:
 * truthful derived copy (the "already applied" claim is exactly what
 * ThemeRecipeController does) and three actions.
 *
 * The share action is the HERO's clipboard plumbing passed down (one source of
 * truth — ThemesPage.copy.spec.ts pins its labels, decay windows and single
 * polite announcement; this band must never duplicate that machinery), and the
 * download action reuses the page's `download()`. Beams idle only in view and
 * still completely under either motion gate (the primitives resolve the
 * combined preference via the page's motion provider).
 */

const props = defineProps<{
  /** The hero's `copyLabel('share', …)` resolution, passed for byte-parity. */
  shareLabel: string
  /** 'copied' | 'failed' | 'idle' — drives the same icon swap as the hero. */
  shareState: 'idle' | 'copied' | 'failed'
}>()

const emit = defineEmits<{
  /** Copy the share link — the page routes this to its own `copyText`. */
  share: []
  /** Download the generated CSS — routed to the page's `download()`. */
  downloadCss: []
}>()

/** Derived at setup from the designer's exports — never hand-typed. */
const paletteCount = DESIGNER_INTENTS.length
const shadeCount = DESIGNER_INTENTS.length * SHADE_STEPS.length

const reduced = useReducedMotion()

// Off-screen loop cap, same recipe as the animations finale.
const artEl = ref<HTMLElement | null>(null)
const inView = useInView(artEl, { once: false, rootMargin: '160px 0px 160px 0px', threshold: 0 })

/** Entrance binding: no-op enter under either motion gate. */
const entrance = computed(() => (reduced.value ? { enterClass: '' } : {}))

const shareIcon = computed(() =>
  props.shareState === 'copied' ? Check : props.shareState === 'failed' ? AlertCircle : Link2)
</script>

<template>
  <section class="thv2-finale" aria-labelledby="themes-finale-title">
    <div v-animate-on-scroll="entrance" class="tf-inner" :class="{ 'is-still': reduced }">
      <!-- The pipeline, performed in the visitor's own primary. Pure
           decoration — one aria-hidden + inert panel; the copy beside it
           carries the meaning. -->
      <div
        ref="artEl"
        class="tf-art"
        :class="{ 'dz-stage-idle': !inView }"
        aria-hidden="true"
        inert
      >
        <span class="tf-node tf-node--recipe">your recipe</span>
        <span class="tf-node tf-node--vars">
          <DzOrbit :radius="30" speed="22s" class="tf-orbit">
            <i class="tf-orbit-dot" />
            <i class="tf-orbit-dot tf-orbit-dot--2" />
            <i class="tf-orbit-dot tf-orbit-dot--3" />
          </DzOrbit>
          <span class="tf-node-label">--dz-* variables</span>
        </span>
        <span class="tf-node tf-node--app">every component</span>
        <DzBeam from=".tf-node--recipe" to=".tf-node--vars" :curvature="34" />
        <DzBeam from=".tf-node--vars" to=".tf-node--app" :curvature="-34" />
      </div>

      <div class="tf-copy">
        <DzHeading id="themes-finale-title" :level="2" size="xl" weight="semibold" class="tf-title lp-balance">
          Ship the theme you just mixed
        </DzHeading>
        <DzText size="md" tone="muted" as="p" class="tf-lede lp-balance">
          One recipe · {{ paletteCount }} palettes · {{ shadeCount }} shades — exported as
          plain CSS variables, and already applied to the page you're reading.
        </DzText>
        <div class="tf-actions">
          <DzButton variant="solid" tone="primary" @click="emit('share')">
            <template #prefix>
              <component :is="shareIcon" :size="16" aria-hidden="true" />
            </template>
            {{ props.shareLabel }}
          </DzButton>
          <DzButton variant="outline" tone="neutral" @click="emit('downloadCss')">
            <template #prefix>
              <Download :size="15" aria-hidden="true" />
            </template>
            Download .css
          </DzButton>
          <DzButton variant="outline" tone="neutral" as="a" :href="LINKS.components">
            Browse components
            <template #suffix>
              <ArrowRight :size="15" aria-hidden="true" />
            </template>
          </DzButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.thv2-finale {
  margin-top: clamp(40px, 6vw, 72px);
}

.tf-inner {
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
      color-mix(in oklch, var(--thv2-accent, var(--dz-primary, #0766ee)) 10%, transparent),
      transparent 55%
    ),
    color-mix(in oklch, var(--dz-surface, #ffffff) 82%, transparent);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
  overflow: clip;
}

.tf-inner.is-still {
  animation: none;
}

/* ── Art panel ── */
.tf-art {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 150px;
  pointer-events: none;
}

.tf-node {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #0766ee) 30%, var(--lp-hairline));
  background: color-mix(in oklch, var(--dz-surface, #ffffff) 88%, transparent);
  box-shadow: var(--dz-shadow-sm, 0 2px 6px rgb(0 0 0 / 0.06));
  font-family: var(--dz-font-mono, ui-monospace, monospace);
  font-size: clamp(0.65rem, 1.4vw, var(--dz-text-xs, 0.75rem));
  font-weight: 600;
  color: var(--dz-muted-foreground, #585b60);
  white-space: nowrap;
}

.tf-node--vars {
  color: var(--dz-foreground, #1b1d1f);
}

.tf-orbit-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-primary, #0766ee);
}

.tf-orbit-dot--2 {
  width: 6px;
  height: 6px;
  background: var(--dz-secondary, #7260bd);
}

.tf-orbit-dot--3 {
  width: 5px;
  height: 5px;
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 55%, var(--dz-muted, #d3d4d7));
}

/* ── Copy ── */
.tf-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tf-title {
  margin: 0;
}

.tf-lede {
  margin: 0;
  line-height: 1.65;
}

.tf-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

@media (max-width: 820px) {
  .tf-inner {
    grid-template-columns: 1fr;
  }

  .tf-art {
    order: 1;
    min-height: 130px;
  }
}
</style>
