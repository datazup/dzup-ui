<script setup lang="ts">
import { DzButton, DzHeading, DzText } from '@dzup-ui/core'
import { ArrowRight, Github, MessageCircle } from 'lucide-vue-next'
import { LINKS } from '../../config.ts'
import { DzParticles, vMagnetic } from '../../motion/index.ts'
</script>

<template>
  <!-- CommunityCTAV2 (docs/landing-v2.md TASK-LV2-08): the v1 finale (kept for
       /classic) on a token-coloured particle field, with a magnetic primary CTA
       and a shimmer sweep on the card. Copy and destinations are v1's, verbatim. -->
  <section class="community" aria-labelledby="community-title">
    <div class="community-card dz-shimmer">
      <div class="community-glow" aria-hidden="true" />
      <DzParticles class="community-particles" :count="40" :pointer="false" />
      <div class="lp-grain-layer" aria-hidden="true" />
      <div class="community-inner">
        <span class="lp-eyebrow">Get involved</span>
        <DzHeading id="community-title" :level="2" size="3xl" weight="semibold" class="community-title lp-balance">
          Ready to build
          <span class="lp-gradient-text">something great?</span>
        </DzHeading>
        <DzText size="lg" tone="muted" class="community-sub lp-balance">
          Open the component browser, star the repo, or join the conversation. Contributions welcome.
        </DzText>
        <div class="community-ctas">
          <span v-magnetic="{ radius: 8 }" class="community-cta-slot">
            <DzButton size="lg" variant="solid" tone="primary" as="a" :href="LINKS.gettingStarted">
              Get started
              <template #suffix>
                <ArrowRight :size="18" aria-hidden="true" />
              </template>
            </DzButton>
          </span>
          <DzButton size="lg" variant="outline" tone="neutral" as="a" :href="LINKS.github" target="_blank" rel="noreferrer noopener">
            <template #prefix>
              <Github :size="18" aria-hidden="true" />
            </template>
            Star on GitHub
          </DzButton>
          <!-- Issues, not Discord: no Discord server exists yet (the old invite
               404'd — TASK-FREE-11). Bring a chat link back when one is real. -->
          <DzButton size="lg" variant="ghost" tone="primary" as="a" :href="LINKS.issues" target="_blank" rel="noreferrer noopener">
            <template #prefix>
              <MessageCircle :size="18" aria-hidden="true" />
            </template>
            Report an issue
          </DzButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.community {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  padding: clamp(40px, 7vw, 96px) 24px;
}

.community-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(48px, 8vw, 104px) 24px;
  border-radius: var(--dz-radius-2xl, 1.25rem);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #0766ee) 22%, var(--lp-hairline));
  background: var(--dz-surface, #ffffff);
  box-shadow: var(--lp-shadow-lg), var(--lp-highlight);
  transition: var(--dz-landing-theme-transition);
}

.community-particles {
  z-index: 0;
  opacity: 0.55;
}

/* v-magnetic host: the wrapper moves (≤8px); the button keeps its own box. */
.community-cta-slot {
  display: inline-flex;
}

.community-glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 56% 90% at 50% -12%, color-mix(in oklch, var(--lp-brand) 22%, transparent), transparent 68%),
    radial-gradient(ellipse 44% 80% at 85% 116%, color-mix(in oklch, var(--lp-brand-2) 18%, transparent), transparent 70%);
}

.community-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.community-title {
  margin: 4px 0 0;
  letter-spacing: -0.025em;
}

.community-sub {
  max-width: 52ch;
  line-height: 1.6;
}

.community-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}
</style>
