<script setup lang="ts">
import { DzButton } from '@dzup-ui/core'
import { ArrowRight, Star } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { FACTS, LINKS } from '../../config.ts'
import { DzBorderBeam, DzParallax, DzWordReveal, vMagnetic, vTilt } from '../../motion/index.ts'
import HeroCodePanel from '../HeroCodePanel.vue'
import RethemeButton from '../RethemeButton.vue'
import ShowcaseFrame from '../ShowcaseFrame.vue'

/**
 * Hero v2.1 — "the stage" (docs/landing-v2.md TASK-LV2-03).
 *
 * Adds the z-axis back to the TASK-DS-11 hero WITHOUT giving back the
 * milliseconds it won. That review measured the cost of decoration on the LCP
 * path (aurora ~52ms, grid+grain ~4ms, entrance animations gating LCP), so
 * every v2 addition obeys one rule: **nothing new on the critical path**.
 *
 *  - The copy column (h1 first line, lede, CTAs) paints immediately, in final
 *    position, with zero animation — exactly as before.
 *  - The depth field is a `DzParallax` stage of three CSS-painted layers behind
 *    the content (z-index 0, aria-hidden, pointer-events none). At rest it
 *    paints the same soft radial `.hero-spot` used to; the pointer parallax is
 *    input-gated to fine pointers and off under reduced motion.
 *  - The accent line ("for serious products") cascades in word-by-word via
 *    `DzWordReveal` — three words at 50ms steps, done ~300ms after mount. The
 *    h1's FIRST line (the bulk of the LCP element) is never animated. LCP was
 *    re-measured after this change in TASK-LV2-10.
 *  - The visual column keeps its single rise animation and gains `v-tilt` with
 *    glare (4°, pointer-only) on the frame, `v-magnetic` (8px) on the CTAs,
 *    and a border beam on the code panel that is ARMED ONLY POST-PAINT — a
 *    double-rAF/idle gate flips `beamArmed`, so the first painted frame never
 *    carries the beam's conic-gradient animation.
 *
 * The v1 hero survives untouched at `../Hero.vue` (rendered by `/classic`).
 */

const VISUAL_QUERY = '(min-width: 1024px)'

function matchesWide(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(VISUAL_QUERY).matches
    : true
}

const showVisual = ref(matchesWide())
let mql: MediaQueryList | null = null

function onChange(event: MediaQueryListEvent): void {
  showVisual.value = event.matches
}

/**
 * Post-paint gate for the code panel's border beam. `requestIdleCallback` where
 * available; the double-rAF fallback still guarantees at least one full frame
 * has painted before the beam's animation starts. The wrapper itself renders
 * from the start (no remount — `PmCommandTabs` keeps its tab state); only the
 * `::before` ring is held back via `.hero-code--armed`.
 */
const beamArmed = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mql = window.matchMedia(VISUAL_QUERY)
    showVisual.value = mql.matches
    mql.addEventListener('change', onChange)
  }

  if (typeof window === 'undefined')
    return
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => {
      beamArmed.value = true
    })
  }
  else {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      beamArmed.value = true
    }))
  }
})

onBeforeUnmount(() => mql?.removeEventListener('change', onChange))

// Same verifiable-facts rule as v1 (TASK-FREE3-03): every chip is checkable
// from package.json or the token files; 'Nuxt' returns at publish.
const trust = ['Tailwind CSS 4', 'Reka UI', 'OKLCH tokens', 'TypeScript']
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <!-- The depth field: three decorative layers on a pointer-parallax stage.
         At rest (touch, reduced motion, pointer at centre) this paints the same
         single soft radial the v1 `.hero-spot` did, plus a hairline grid and a
         small secondary glow — all tokens, all behind the content. -->
    <DzParallax source="viewport" class="hero-depth">
      <span class="dz-parallax-layer hero-depth-spot" style="--depth: 0.3" />
      <span class="dz-parallax-layer hero-depth-grid" style="--depth: 0.6" />
      <span class="dz-parallax-layer hero-depth-glow" style="--depth: 1" />
    </DzParallax>

    <div class="hero-inner">
      <div class="hero-copy">
        <h1 id="hero-title" class="hero-title lp-balance">
          The Vue&nbsp;3 component library
          <span class="hero-accent">
            <DzWordReveal text="for serious products" as="span" :step="50" />
          </span>
        </h1>

        <p class="hero-lede lp-balance">
          {{ FACTS.freeComponents }} open-source components across {{ FACTS.families }} families —
          built on Tailwind CSS&nbsp;4, an OKLCH token system, and Reka UI accessible primitives.
          Light &amp; dark out of the box.
        </p>

        <div class="hero-ctas">
          <span v-magnetic="{ radius: 8 }" class="hero-cta-slot">
            <DzButton size="lg" variant="solid" tone="primary" as="a" :href="LINKS.components">
              Browse components
              <template #suffix>
                <ArrowRight :size="18" aria-hidden="true" />
              </template>
            </DzButton>
          </span>
          <span v-magnetic="{ radius: 8 }" class="hero-cta-slot">
            <DzButton size="lg" variant="outline" tone="neutral" as="a" :href="LINKS.github" target="_blank" rel="noreferrer noopener">
              <template #prefix>
                <Star :size="16" aria-hidden="true" />
              </template>
              Star on GitHub
            </DzButton>
          </span>
        </div>

        <DzBorderBeam class="hero-code" :class="{ 'hero-code--armed': beamArmed }">
          <HeroCodePanel />
        </DzBorderBeam>
      </div>

      <div v-if="showVisual" class="hero-visual">
        <div class="hero-visual-bar">
          <span class="hero-visual-hint">
            One click re-skins every component below — light&nbsp;⇄&nbsp;dark from one token system.
          </span>
          <RethemeButton />
        </div>
        <div v-tilt="{ max: 4, perspective: 1200, glare: true }" class="hero-frame-tilt">
          <ShowcaseFrame label="the current" compact :glow="false" />
        </div>
      </div>
    </div>

    <div class="hero-trust">
      <span class="hero-trust-label">Built with</span>
      <ul class="hero-trust-list">
        <li v-for="t in trust" :key="t">
          {{ t }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(28px, 3.4vw, 44px) 24px clamp(48px, 6vw, 72px);
}

/* --- The depth field (replaces v1's single .hero-spot) ------------------- */

.hero-depth {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Layer 1 — the v1 spot, now drifting gently at depth 0.3. Same geometry and
   the same 15% brand mix TASK-DS-11 kept, so the resting paint is unchanged. */
.hero-depth-spot {
  position: absolute;
  top: -14%;
  /* Centred without a physical edge (the parallax transform owns `transform`,
     so the v1 translateX(-50%) trick is unavailable): span the inline axis and
     let auto margins find the middle — identical in both directions. */
  inset-inline: 0;
  margin-inline: auto;
  width: min(1100px, 96vw);
  height: 620px;
  background: radial-gradient(ellipse 50% 50% at 50% 50%,
    color-mix(in oklch, var(--lp-brand) 15%, transparent), transparent 70%);
}

/* Layer 2 — a hairline grid, masked to fade out toward the edges. Painted
   with the token hairline at low alpha; measured class of cost: the v1 review
   put grid+grain at ~4ms, and this is half of that pair. */
.hero-depth-grid {
  position: absolute;
  inset: -6% -4%;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--lp-hairline) 55%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--lp-hairline) 55%, transparent) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse 62% 58% at 50% 32%, black 0%, transparent 78%);
}

/* Layer 3 — a small secondary glow at full depth, so pointer travel reads as
   layers sliding against each other rather than the page moving. */
.hero-depth-glow {
  position: absolute;
  top: 4%;
  inset-inline-end: 6%;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle at 50% 50%,
    color-mix(in oklch, var(--lp-brand-2) 12%, transparent), transparent 70%);
}

/* --- Copy column: identical to v1 — the LCP path is untouched ------------ */

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: start;
}

.hero-copy {
  min-width: 0;
}

.hero-title {
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
  font-size: clamp(2.4rem, 4vw, 3.1rem);
  color: var(--dz-foreground, #1b1d1f);
}

.hero-accent {
  display: block;
  color: var(--dz-primary-muted-foreground, #0039a3);
}

.hero-lede {
  margin: 16px 0 0;
  max-width: 56ch;
  font-size: clamp(1rem, 1.2vw, 1.15rem);
  line-height: 1.6;
  color: var(--dz-muted-foreground, #585b60);
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

/* v-magnetic hosts: the wrapper moves (≤8px), the button inside keeps its own
   box, so focus rings and hit targets travel together with the visual. */
.hero-cta-slot {
  display: inline-flex;
}

.hero-code {
  display: block;
  margin-top: 24px;
  border-radius: var(--dz-radius-lg, 0.625rem);
}

/* The beam ring stays dark until the post-paint gate arms it — the first
   painted frame never runs the conic-gradient animation. */
.hero-code:not(.hero-code--armed)::before {
  content: none;
}

.hero-visual {
  min-width: 0;
}

.hero-visual-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.hero-visual-hint {
  font-size: var(--dz-text-sm, 0.875rem);
  line-height: 1.45;
  color: var(--dz-muted-foreground, #585b60);
  text-wrap: balance;
}

/* Perspective comes from the directive; the wrapper just needs to not clip. */
.hero-frame-tilt {
  border-radius: var(--dz-radius-lg, 0.625rem);
}

.hero-trust {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin: clamp(40px, 5vw, 64px) auto 0;
  padding-top: 28px;
  border-top: 1px solid var(--lp-hairline);
  width: min(620px, 100%);
}

.hero-trust-label {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
}

.hero-trust-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.hero-trust-list li {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-muted-foreground, #585b60);
  transition: color var(--dz-duration-fast, 150ms);
}

.hero-trust-list li:hover {
  color: var(--dz-foreground, #1b1d1f);
}

@media (min-width: 1024px) {
  .hero-inner {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr);
    gap: 44px;
  }
}

/* Motion: transform + opacity only, and never on the LCP text — the visual
   column rises once, exactly as in v1. */
.hero-visual {
  animation: hero-rise 0.6s var(--dz-ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-visual {
    animation: none;
  }
}
</style>
