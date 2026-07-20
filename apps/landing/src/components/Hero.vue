<script setup lang="ts">
import { DzButton } from '@dzup-ui/core'
import { ArrowRight, Star } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { FACTS, LINKS } from '../config.ts'
import HeroCodePanel from './HeroCodePanel.vue'
import RethemeButton from './RethemeButton.vue'
import ShowcaseFrame from './ShowcaseFrame.vue'

/**
 * Hero v2 (TASK-DS-11) — lead with the product, not the gradient.
 *
 * Three deliberate changes from v1:
 *
 * 1. **A live dashboard above the fold.** `ShowcaseFrame` in `compact` mode —
 *    real `@dzup-ui/core` components, never a screenshot. It is the single
 *    strongest proof on the site and it used to sit a full scroll down.
 * 2. **One decorative layer, not four.** The aurora, hairline grid and grain
 *    overlay are gone; only `.hero-spot` remains. Measured (Playwright, 6 runs,
 *    1280x800, median FCP/LCP): aurora ~52ms, spot ~48ms, grid+grain ~4ms.
 *    Dropping all four moved LCP 772ms -> 668ms. The spot is the cheapest layer
 *    that still does real work — it focuses the LCP text — so it is the one kept.
 * 3. **No entrance animation on the headline path.** v1 staggered seven hero
 *    children through an `opacity: 0` keyframe, promoting seven compositing
 *    layers and gating the LCP element on an animation. Only the visual column
 *    animates now, and it fades in behind the text rather than in front of it.
 *
 * The stat row moved out: `SocialProof` already renders those figures, and the
 * duplicate cost ~90px of fold that the product visual now uses.
 */

// The compact frame is ~600px of live component tree. On phones it would be a
// heavy above-the-fold mount for a layout that cannot show it well — and the
// full side-by-side `ShowcaseDashboard` is the very next section anyway. So we
// resolve the breakpoint with matchMedia, not just CSS, and never mount it.
const VISUAL_QUERY = '(min-width: 1024px)'

function matchesWide(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(VISUAL_QUERY).matches
    : true
}

// Seeded synchronously so a phone never flashes the frame before onMounted runs.
const showVisual = ref(matchesWide())
let mql: MediaQueryList | null = null

function onChange(event: MediaQueryListEvent): void {
  showVisual.value = event.matches
}

onMounted(() => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mql = window.matchMedia(VISUAL_QUERY)
    showVisual.value = mql.matches
    mql.addEventListener('change', onChange)
  }
})

onBeforeUnmount(() => mql?.removeEventListener('change', onChange))

// What the library is BUILT WITH — every chip is a fact a visitor can verify
// from package.json or the token files. 'Nuxt' was here and is not one of those:
// `@dzup-ui/nuxt` is unpublished and its guide does not exist, so the chip read
// as an integration claim we can't back. Re-add it at publish. (TASK-FREE3-03)
const trust = ['Tailwind CSS 4', 'Reka UI', 'OKLCH tokens', 'TypeScript']
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <!-- The single remaining full-bleed decorative layer. No filter, no
         mix-blend-mode: it paints into the hero's own layer rather than forcing
         another composited one. -->
    <div class="hero-spot" aria-hidden="true" />

    <div class="hero-inner">
      <div class="hero-copy">
        <h1 id="hero-title" class="hero-title lp-balance">
          The Vue&nbsp;3 component library
          <span class="hero-accent">for serious products</span>
        </h1>

        <p class="hero-lede lp-balance">
          {{ FACTS.freeComponents }} open-source components across {{ FACTS.families }} families —
          built on Tailwind CSS&nbsp;4, an OKLCH token system, and Reka UI accessible primitives.
          Light &amp; dark out of the box.
        </p>

        <div class="hero-ctas">
          <DzButton size="lg" variant="solid" tone="primary" as="a" :href="LINKS.components">
            Browse components
            <template #suffix>
              <ArrowRight :size="18" aria-hidden="true" />
            </template>
          </DzButton>
          <DzButton size="lg" variant="outline" tone="neutral" as="a" :href="LINKS.github" target="_blank" rel="noreferrer noopener">
            <template #prefix>
              <Star :size="16" aria-hidden="true" />
            </template>
            Star on GitHub
          </DzButton>
        </div>

        <HeroCodePanel class="hero-code" />
      </div>

      <div v-if="showVisual" class="hero-visual">
        <div class="hero-visual-bar">
          <span class="hero-visual-hint">
            One click re-skins every component below — light&nbsp;⇄&nbsp;dark from one token system.
          </span>
          <RethemeButton />
        </div>
        <ShowcaseFrame label="the current" compact :glow="false" />
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

/* A soft brand glow behind the headline. The only decorative layer left. */
.hero-spot {
  position: absolute;
  top: -14%;
  left: 50%;
  width: min(1100px, 96vw);
  height: 620px;
  transform: translateX(-50%);
  z-index: 0;
  background: radial-gradient(ellipse 50% 50% at 50% 50%,
    color-mix(in oklch, var(--lp-brand) 15%, transparent), transparent 70%);
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  /* Top-aligned, not centred: centring each column against the other's height is
     what pushed the taller one (the frame) through the fold. */
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

/* v1 ran the second line through `lp-gradient-text`. A gradient headline is the
   most-copied move in the archetype this hero is trying to leave, and it is also
   a background-clip paint on the LCP element. A token-coloured accent reads as
   ours and paints as plain text. */
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

.hero-code {
  margin-top: 24px;
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

/* v1 dimmed full-strength foreground to `opacity: 0.62`, which measures 4.41:1
   on the page background — below AA. axe never caught it: the aurora and grain
   layers made the backdrop uncomputable, so the rule reported "incomplete"
   rather than "fail". Removing those layers surfaced it. The muted foreground
   token is the colour this always wanted, and it is contrast-gated. */
.hero-trust-list li {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-muted-foreground, #585b60);
  transition: color var(--dz-duration-fast, 150ms);
}

.hero-trust-list li:hover {
  color: var(--dz-foreground, #1b1d1f);
}

/* Two columns only where the frame has room to be legible — the same 1024px
   threshold `showVisual` gates the mount on. */
@media (min-width: 1024px) {
  .hero-inner {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr);
    gap: 44px;
  }
}

/* Motion: transform + opacity only, and never on the LCP text. The visual column
   rises once; the headline, lede and CTAs paint in their final position. */
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
