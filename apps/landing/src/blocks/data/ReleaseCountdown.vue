<script setup lang="ts">
/**
 * Release countdown — a launch banner built on DzCountdown + DzAnimatedNumber.
 *
 * DzCountdown ticks (drift-free) toward a fixed deadline; its default slot
 * exposes the structured `remaining` breakdown, rendered here as four labelled
 * day/hour/minute/second cells. A DzAnimatedNumber counts up the "spots
 * claimed" figure on scroll-into-view. Both honour `prefers-reduced-motion`
 * internally (the count-up snaps; the timer still ticks).
 *
 * Self-contained: the deadline is computed relative to mount. Composed only
 * from free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import {
  DzAnimatedNumber,
  DzBadge,
  DzButton,
  DzCountdown,
  DzHeading,
  DzText,
} from '@dzup-ui/core'

// A fixed deadline ~9 days out, computed once at module load so the timer has
// something concrete to count toward in the live preview.
const deadline = new Date(Date.now() + (9 * 24 * 60 * 60 + 7 * 60 * 60 + 42 * 60) * 1000)
</script>

<template>
  <section class="rc-wrap" aria-labelledby="rc-title">
    <div class="rc-bg" aria-hidden="true" />

    <div class="rc-inner">
      <DzBadge variant="subtle" tone="primary" size="sm">
        Early access
      </DzBadge>

      <DzHeading id="rc-title" :level="4" size="2xl" weight="bold" align="center" class="rc-title">
        Pro blocks launch in
      </DzHeading>

      <DzCountdown :target="deadline" mode="to" format="DD:HH:mm:ss" tone="primary" aria-label="Time until launch">
        <template #default="{ remaining }">
          <div class="rc-clock" role="timer">
            <div class="rc-cell">
              <span class="rc-num">{{ String(remaining.days).padStart(2, '0') }}</span>
              <span class="rc-unit">days</span>
            </div>
            <span class="rc-sep" aria-hidden="true">:</span>
            <div class="rc-cell">
              <span class="rc-num">{{ String(remaining.hours).padStart(2, '0') }}</span>
              <span class="rc-unit">hrs</span>
            </div>
            <span class="rc-sep" aria-hidden="true">:</span>
            <div class="rc-cell">
              <span class="rc-num">{{ String(remaining.minutes).padStart(2, '0') }}</span>
              <span class="rc-unit">min</span>
            </div>
            <span class="rc-sep" aria-hidden="true">:</span>
            <div class="rc-cell">
              <span class="rc-num">{{ String(remaining.seconds).padStart(2, '0') }}</span>
              <span class="rc-unit">sec</span>
            </div>
          </div>
        </template>
      </DzCountdown>

      <DzText size="md" tone="muted" align="center" class="rc-claimed">
        <DzAnimatedNumber
          :value="1284"
          :duration="1400"
          easing="ease-out"
          :format="{ useGrouping: true }"
          class="rc-claimed-num"
        />
        of 2,000 early-access spots claimed
      </DzText>

      <DzButton variant="solid" tone="primary" size="lg">
        Reserve your spot
      </DzButton>
    </div>
  </section>
</template>

<style scoped>
.rc-wrap {
  position: relative;
  overflow: hidden;
  padding: clamp(2.5rem, 7vw, 4.5rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

.rc-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 60% 60% at 50% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 14%, transparent), transparent 70%);
}

.rc-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-4, 1rem);
  max-width: 40rem;
  margin: 0 auto;
  text-align: center;
}

.rc-title {
  margin: 0;
  letter-spacing: -0.01em;
}

.rc-clock {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: var(--dz-space-2, 0.5rem);
  margin: var(--dz-space-2, 0.5rem) 0;
}

.rc-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-1, 0.25rem);
  min-width: 4rem;
  padding: var(--dz-space-3, 0.75rem) var(--dz-space-2, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-md, 0.5rem);
  background: var(--dz-surface, #f8fafc);
}

.rc-num {
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--dz-foreground, #0f172a);
}

.rc-unit {
  font-size: var(--dz-text-xs, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dz-foreground-muted, #64748b);
}

.rc-sep {
  font-size: clamp(1.25rem, 4vw, 2rem);
  font-weight: 700;
  line-height: 1;
  padding-top: var(--dz-space-3, 0.75rem);
  color: var(--dz-foreground-muted, #64748b);
}

.rc-claimed {
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}

.rc-claimed-num {
  font-weight: 600;
}
</style>
