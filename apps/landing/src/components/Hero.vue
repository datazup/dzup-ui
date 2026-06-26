<script setup lang="ts">
import { DzButton } from '@dzup-ui/core'
import { ArrowRight, Check, Copy, Sparkles, Star } from 'lucide-vue-next'
import { ref } from 'vue'
import { FACTS, LINKS } from '../config.ts'

const installCmd = 'npm i @dzup-ui/core'
const copied = ref(false)

async function copyInstall(): Promise<void> {
  try {
    await navigator.clipboard.writeText(installCmd)
    copied.value = true
    window.setTimeout(() => (copied.value = false), 1800)
  }
  catch {
    /* clipboard unavailable — no-op */
  }
}

const trust = ['Tailwind CSS 4', 'Reka UI', 'OKLCH tokens', 'TypeScript', 'Nuxt']

// Inline credibility facts — concrete, verifiable, fills the hero with substance.
const stats = [
  { value: FACTS.freeComponents, label: 'components' },
  { value: FACTS.families, label: 'families' },
  { value: 'MIT', label: 'licensed' },
  { value: 'AA', label: 'WCAG' },
]
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="lp-aurora hero-aurora" aria-hidden="true" />
    <div class="hero-grid" aria-hidden="true" />
    <div class="hero-spot" aria-hidden="true" />
    <div class="lp-grain-layer" aria-hidden="true" />

    <div class="hero-inner">
      <a class="hero-pill" :href="LINKS.pro">
        <span class="hero-pill-icon" aria-hidden="true"><Sparkles :size="13" /></span>
        <span class="hero-pill-text">{{ FACTS.proComponents }} Pro components coming soon</span>
        <ArrowRight :size="13" aria-hidden="true" class="hero-pill-arrow" />
      </a>

      <h1 id="hero-title" class="hero-title lp-balance">
        The Vue&nbsp;3 component library
        <span class="hero-accent lp-gradient-text">for serious products</span>
      </h1>

      <p class="hero-lede lp-balance">
        {{ FACTS.freeComponents }} open-source components across {{ FACTS.families }} families —
        built on Tailwind CSS&nbsp;4, an OKLCH token system, and Reka UI accessible primitives.
        Light &amp; dark out of the box.
      </p>

      <div class="hero-ctas">
        <DzButton size="lg" variant="solid" tone="primary" as="a" :href="LINKS.components" class="hero-cta-primary">
          Browse components
          <template #suffix><ArrowRight :size="18" aria-hidden="true" /></template>
        </DzButton>
        <DzButton size="lg" variant="outline" tone="neutral" as="a" :href="LINKS.github" target="_blank" rel="noreferrer noopener">
          <template #prefix><Star :size="16" aria-hidden="true" /></template>
          Star on GitHub
        </DzButton>
      </div>

      <div class="hero-install">
        <code class="hero-install-cmd"><span class="prompt" aria-hidden="true">$</span> {{ installCmd }}</code>
        <button
          type="button"
          class="hero-install-copy"
          :aria-label="copied ? 'Copied' : 'Copy install command'"
          @click="copyInstall"
        >
          <Check v-if="copied" :size="15" aria-hidden="true" />
          <Copy v-else :size="15" aria-hidden="true" />
        </button>
      </div>

      <dl class="hero-stats">
        <div v-for="s in stats" :key="s.label" class="hero-stat">
          <dt class="hero-stat-value">{{ s.value }}</dt>
          <dd class="hero-stat-label">{{ s.label }}</dd>
        </div>
      </dl>

      <div class="hero-trust">
        <span class="hero-trust-label">Built with</span>
        <ul class="hero-trust-list">
          <li v-for="t in trust" :key="t">{{ t }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(88px, 13vw, 152px) 24px clamp(56px, 8vw, 96px);
}

/* Aurora sits at the very top, then we fade everything into the page below. */
.hero-aurora {
  bottom: 30%;
  -webkit-mask-image: linear-gradient(to bottom, #000 35%, transparent);
  mask-image: linear-gradient(to bottom, #000 35%, transparent);
}

/* Hairline grid that dissolves toward the content. */
.hero-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--dz-foreground, #000) 5%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--dz-foreground, #000) 5%, transparent) 1px, transparent 1px);
  background-size: 60px 60px;
  -webkit-mask-image: radial-gradient(ellipse 78% 56% at 50% 0%, #000 6%, transparent 70%);
  mask-image: radial-gradient(ellipse 78% 56% at 50% 0%, #000 6%, transparent 70%);
}

/* A tight conic spotlight directly behind the headline for focus. */
.hero-spot {
  position: absolute;
  top: -12%;
  left: 50%;
  width: min(900px, 92vw);
  height: 560px;
  transform: translateX(-50%);
  z-index: 0;
  background: radial-gradient(ellipse 50% 50% at 50% 50%,
    color-mix(in oklch, var(--lp-brand) 16%, transparent), transparent 70%);
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 840px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 6px 8px 6px 8px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--dz-surface, #fff) 70%, transparent);
  backdrop-filter: blur(8px);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--dz-foreground, #1a202c);
  text-decoration: none;
  transition:
    border-color var(--dz-duration-fast, 150ms),
    transform var(--dz-duration-fast, 150ms);
}

.hero-pill:hover {
  border-color: color-mix(in oklch, var(--dz-primary, #6366f1) 40%, var(--lp-hairline));
  transform: translateY(-1px);
}

.hero-pill-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--dz-radius-full, 9999px);
  background: linear-gradient(135deg, var(--lp-brand), var(--lp-brand-2));
  color: #fff;
}

.hero-pill-text {
  color: var(--dz-muted-foreground, #64748b);
}

.hero-pill-arrow {
  color: var(--dz-muted-foreground, #64748b);
  transition: transform var(--dz-duration-fast, 150ms);
}

.hero-pill:hover .hero-pill-arrow {
  transform: translateX(2px);
}

.hero-title {
  margin: 26px 0 0;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.03;
  font-size: clamp(2.7rem, 6.6vw, 5rem);
  color: var(--dz-foreground, #1a202c);
}

.hero-accent {
  display: block;
}

.hero-lede {
  margin: 24px 0 0;
  max-width: 58ch;
  font-size: clamp(1.05rem, 1.7vw, 1.3rem);
  line-height: 1.6;
  color: var(--dz-muted-foreground, #64748b);
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 36px;
}

/* A soft brand glow lifts the primary CTA off the page. */
.hero-cta-primary {
  box-shadow: 0 8px 24px -8px color-mix(in oklch, var(--dz-primary, #6366f1) 60%, transparent);
}

.hero-install {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  padding: 6px 6px 6px 16px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--dz-surface, #fff) 80%, transparent);
  backdrop-filter: blur(8px);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
}

.hero-install-cmd {
  font-family: var(--dz-font-mono, monospace);
  font-size: var(--dz-text-sm, 0.875rem);
  color: var(--dz-foreground, #1a202c);
}

.hero-install-cmd .prompt {
  color: var(--dz-primary, #4f46e5);
  margin-right: 2px;
}

.hero-install-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-muted-foreground, #64748b);
  cursor: pointer;
  transition: background var(--dz-duration-fast, 150ms), color var(--dz-duration-fast, 150ms);
}

.hero-install-copy:hover {
  background: var(--dz-primary-muted, #eef2ff);
  color: var(--dz-primary, #4f46e5);
}

/* Inline credibility stats — concrete numbers, divider-separated. */
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: clamp(20px, 4vw, 44px);
  margin: 52px 0 0;
  padding: 0;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
}

.hero-stat + .hero-stat::before {
  content: "";
  position: absolute;
  left: clamp(-10px, -2vw, -22px);
  top: 50%;
  height: 28px;
  width: 1px;
  transform: translateY(-50%);
  background: var(--lp-hairline);
}

.hero-stat-value {
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--dz-foreground, #1a202c);
}

.hero-stat-label {
  margin: 0;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #64748b);
}

.hero-trust {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 44px;
  padding-top: 28px;
  border-top: 1px solid var(--lp-hairline);
  width: min(620px, 100%);
}

.hero-trust-label {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #64748b);
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
  color: var(--dz-foreground, #1a202c);
  opacity: 0.62;
  transition: opacity var(--dz-duration-fast, 150ms);
}

.hero-trust-list li:hover {
  opacity: 1;
}

/* Quiet entrance for the hero stack. */
.hero-inner > * {
  animation: hero-rise 0.7s var(--dz-ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;
}
.hero-inner > :nth-child(2) { animation-delay: 0.06s; }
.hero-inner > :nth-child(3) { animation-delay: 0.12s; }
.hero-inner > :nth-child(4) { animation-delay: 0.18s; }
.hero-inner > :nth-child(5) { animation-delay: 0.24s; }
.hero-inner > :nth-child(6) { animation-delay: 0.30s; }
.hero-inner > :nth-child(7) { animation-delay: 0.36s; }

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 520px) {
  .hero-trust {
    gap: 12px;
  }
  .hero-trust-list {
    gap: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-inner > * {
    animation: none;
  }
}
</style>
