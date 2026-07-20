<script setup lang="ts">
import type { Component } from 'vue'
/**
 * Coming Soon — Utility template (docs/templates.md §6.3).
 *
 * A chromeless, centered launch page in the family of the shipped maintenance
 * page: a brand lockup, a status DzBadge, a headline + lede, a live DzCountdown to
 * launch rendered as day/hour/minute/second segments, and a notify-me DzCard
 * pairing a DzInput email capture with a DzButton that flips to a client-side
 * success state. Leans on the brand primary palette with a confident, anticipatory
 * tone — distinct from the warning-toned maintenance page beside it in Utility.
 *
 * Built only from free `@dzup-ui/core` components, token-styled, light + dark,
 * reflows cleanly 390px → up.
 */
import { DzBadge, DzButton, DzCard, DzCountdown, DzDivider, DzHeading, DzInput, DzText } from '@dzup-ui/core'
import { ArrowRight, Boxes, CheckCircle2, Github, Linkedin, Rocket, Twitter } from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * The launch instant. Computed at setup (not module top-level) as a fixed offset
 * from "now" so the countdown always has time left to tick down, whenever the
 * template is previewed. ~32 days out reads as a real, near-term launch.
 */
const LAUNCH_AT = new Date(Date.now() + (32 * 24 + 7) * 60 * 60 * 1000)

interface Social {
  icon: Component
  label: string
  href: string
}

const SOCIALS: Social[] = [
  { icon: Twitter, label: 'Follow on X', href: '#' },
  { icon: Github, label: 'Star on GitHub', href: '#' },
  { icon: Linkedin, label: 'Connect on LinkedIn', href: '#' },
]

/** Notify-me capture: a non-empty email flips the card to a confirmation state. */
const email = ref('')
const subscribed = ref(false)
function subscribe(): void {
  if (!email.value.trim())
    return
  subscribed.value = true
}
</script>

<template>
  <main class="cs-page">
    <div class="cs-wrap">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
        <span class="brand-name">Northwind</span>
      </span>

      <DzBadge variant="subtle" tone="primary" size="md">
        <template #default>
          <span class="badge-inline"><Rocket :size="13" aria-hidden="true" /> Launching soon</span>
        </template>
      </DzBadge>

      <DzHeading :level="1" size="3xl" weight="bold" align="center" class="cs-title">
        Something big is on the way
      </DzHeading>

      <DzText tone="muted" as="p" align="center" class="cs-lede">
        We’re putting the finishing touches on the next generation of Northwind — faster,
        sharper and built for the way your team works. Be first through the door.
      </DzText>

      <!-- ── Countdown ───────────────────────────────────────────── -->
      <DzCountdown
        :target="LAUNCH_AT"
        mode="to"
        format="DD:HH:mm:ss"
        aria-label="Time remaining until launch"
        class="cs-countdown"
      >
        <template #default="{ remaining }">
          <div class="cs-segments">
            <div class="cs-seg">
              <span class="cs-seg-value">{{ String(remaining.days).padStart(2, '0') }}</span>
              <span class="cs-seg-label">Days</span>
            </div>
            <span class="cs-seg-sep" aria-hidden="true">:</span>
            <div class="cs-seg">
              <span class="cs-seg-value">{{ String(remaining.hours).padStart(2, '0') }}</span>
              <span class="cs-seg-label">Hours</span>
            </div>
            <span class="cs-seg-sep" aria-hidden="true">:</span>
            <div class="cs-seg">
              <span class="cs-seg-value">{{ String(remaining.minutes).padStart(2, '0') }}</span>
              <span class="cs-seg-label">Minutes</span>
            </div>
            <span class="cs-seg-sep" aria-hidden="true">:</span>
            <div class="cs-seg">
              <span class="cs-seg-value">{{ String(remaining.seconds).padStart(2, '0') }}</span>
              <span class="cs-seg-label">Seconds</span>
            </div>
          </div>
        </template>
      </DzCountdown>

      <!-- ── Notify me ───────────────────────────────────────────── -->
      <DzCard variant="outlined" padding="lg" class="cs-notify">
        <template v-if="!subscribed">
          <DzText weight="semibold" as="div" class="notify-title">
            Get early access at launch
          </DzText>
          <DzText size="sm" tone="muted" as="p" class="notify-sub">
            Join the waitlist — one email when we go live, plus an invite ahead of the crowd.
          </DzText>
          <form class="notify-form" @submit.prevent="subscribe">
            <DzInput
              v-model="email"
              type="email"
              placeholder="you@company.com"
              autocomplete="email"
              aria-label="Email address"
              class="notify-input"
            />
            <DzButton type="submit" variant="solid" tone="primary">
              Notify me
              <template #suffix>
                <ArrowRight :size="16" aria-hidden="true" />
              </template>
            </DzButton>
          </form>
        </template>
        <div v-else class="notify-done">
          <span class="notify-done-icon" aria-hidden="true"><CheckCircle2 :size="22" /></span>
          <div class="notify-done-meta">
            <DzText weight="semibold" as="div">
              You’re on the list
            </DzText>
            <DzText size="sm" tone="muted" as="p">
              We’ll email <strong>{{ email }}</strong> the moment we launch.
            </DzText>
          </div>
        </div>
      </DzCard>

      <DzDivider class="cs-divider" />

      <nav class="cs-socials" aria-label="Follow Northwind">
        <a v-for="social in SOCIALS" :key="social.label" class="cs-social" :href="social.href" :aria-label="social.label">
          <component :is="social.icon" :size="18" aria-hidden="true" />
        </a>
      </nav>

      <DzText size="sm" tone="muted" as="p" class="cs-foot">
        © 2026 Northwind Labs · Crafted in the open
      </DzText>
    </div>
  </main>
</template>

<style scoped>
.cs-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: clamp(24px, 5vw, 64px);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--dz-primary) 10%, transparent), transparent 62%),
    var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

.cs-wrap {
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
  margin-bottom: 2px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.cs-title {
  margin-top: 2px;
}

.cs-lede {
  max-width: 46ch;
  line-height: 1.6;
}

/* ── Countdown ──────────────────────────────────────────────────── */
.cs-countdown {
  margin-top: 10px;
}

.cs-segments {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(6px, 2vw, 14px);
}

.cs-seg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: clamp(56px, 16vw, 76px);
  padding: clamp(10px, 2.4vw, 16px) clamp(6px, 2vw, 12px);
  border-radius: var(--dz-radius-lg, 14px);
  background: var(--dz-card, var(--dz-background));
  border: 1px solid var(--dz-border);
  box-shadow: var(--dz-shadow-xs);
}

.cs-seg-value {
  font-size: clamp(1.75rem, 7vw, 2.5rem);
  font-weight: var(--dz-font-bold);
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--dz-primary);
}

.cs-seg-label {
  font-size: var(--dz-text-xs, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dz-muted-foreground);
}

.cs-seg-sep {
  align-self: center;
  margin-top: clamp(4px, 1.5vw, 10px);
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: var(--dz-font-bold);
  line-height: 1;
  color: var(--dz-muted-foreground);
}

/* ── Notify ─────────────────────────────────────────────────────── */
.cs-notify {
  width: 100%;
  margin-top: 8px;
  text-align: left;
}

.notify-title {
  margin-bottom: 4px;
}

.notify-sub {
  margin-bottom: 14px;
  line-height: 1.5;
}

.notify-form {
  display: flex;
  gap: 10px;
}

.notify-input {
  flex: 1;
  min-width: 0;
}

.notify-done {
  display: flex;
  align-items: center;
  gap: 14px;
}

.notify-done-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: var(--dz-radius-full, 999px);
  background: color-mix(in oklch, var(--dz-success) 14%, transparent);
  color: var(--dz-success);
}

.notify-done-meta {
  min-width: 0;
  line-height: 1.4;
}

/* ── Footer ─────────────────────────────────────────────────────── */
.cs-divider {
  margin: 10px 0 2px;
}

.cs-socials {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.cs-social {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--dz-radius-full, 999px);
  border: 1px solid var(--dz-border);
  color: var(--dz-muted-foreground);
  text-decoration: none;
  transition:
    color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out),
    border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.cs-social:hover {
  color: var(--dz-primary);
  border-color: var(--dz-primary);
}

.cs-social:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
}

.cs-foot {
  margin-top: 2px;
}

@media (max-width: 440px) {
  .notify-form {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cs-social {
    transition: none;
  }
}
</style>
