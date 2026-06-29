<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-vue-next'
import { ref } from 'vue'
import { DzIsland, useReducedMotion } from '../../motion/index.ts'

/**
 * Dynamic island demo (catalog `dynamic-island`, effect 56) — a compact "Now
 * playing" pill morphs to reveal full playback controls and back.
 *
 * {@link DzIsland} sizes the morph with `interpolate-size: allow-keywords` where
 * supported (a true `width`/`height` → `auto` transition) and a FLIP fallback
 * elsewhere; the expanded content fades + rises in via `@starting-style`. Under
 * reduced motion (OS or the page toggle) it expands/collapses instantly. The
 * expanded state is announced politely to assistive tech.
 */
const reduced = useReducedMotion()
const playing = ref(true)
</script>

<template>
  <div class="stage">
    <DzIsland
      class="island"
      :disabled="reduced"
      announce="Now playing: Aurora — Midnight Pulse. Playback controls available."
    >
      <!-- Collapsed pill (also the toggle): a live status indicator. -->
      <template #pill="{ expanded }">
        <span class="pill">
          <span class="pulse" :class="{ 'pulse--still': reduced }" aria-hidden="true" />
          <span class="pill-label">Now playing</span>
          <span class="eq" :class="{ 'eq--still': reduced || !playing }" aria-hidden="true">
            <i /><i /><i />
          </span>
          <span class="pill-hint">{{ expanded ? 'Tap to close' : 'Tap to open' }}</span>
        </span>
      </template>

      <!-- Expanded surface. -->
      <template #default>
        <div class="panel">
          <div class="track">
            <span class="cover" aria-hidden="true">♪</span>
            <div class="meta">
              <DzText weight="semibold" size="sm" as="div" class="track-title">Midnight Pulse</DzText>
              <DzText size="xs" tone="muted" as="div" class="track-artist">Aurora</DzText>
            </div>
          </div>

          <div class="controls">
            <button type="button" class="ctl" aria-label="Previous track"><SkipBack :size="18" /></button>
            <button
              type="button"
              class="ctl ctl--primary"
              :aria-label="playing ? 'Pause' : 'Play'"
              @click="playing = !playing"
            >
              <Pause v-if="playing" :size="20" />
              <Play v-else :size="20" />
            </button>
            <button type="button" class="ctl" aria-label="Next track"><SkipForward :size="18" /></button>
          </div>
        </div>
      </template>
    </DzIsland>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 160px;
}

/* The island is a deliberately dark chrome (like the iOS original) — legible in
   both themes. The DzIsland root owns the radius + overflow + size morph. */
.island {
  color: var(--dz-colors-neutral-50, #f8fafc);
  background: var(--dz-colors-neutral-900, #0f172a);
  box-shadow: var(--dz-shadow-xl, 0 18px 40px -12px rgb(15 23 42 / 0.45));
  max-width: 100%;
}

/* ── Collapsed pill ── */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  white-space: nowrap;
}

.pill-label {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
}

.pill-hint {
  font-size: var(--dz-text-xs, 0.75rem);
  color: color-mix(in oklch, var(--dz-colors-neutral-50, #f8fafc) 60%, transparent);
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-colors-success-400, #4ade80);
  box-shadow: 0 0 0 0 color-mix(in oklch, var(--dz-colors-success-400, #4ade80) 70%, transparent);
  animation: dz-island-pulse 1.6s var(--dz-ease-out, ease-out) infinite;
}
.pulse--still {
  animation: none;
}

/* A tiny equalizer to signal playback; transform-only, paused when not playing. */
.eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}
.eq i {
  width: 3px;
  height: 100%;
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--dz-colors-neutral-50, #f8fafc) 78%, transparent);
  transform-origin: bottom;
  animation: dz-island-eq 0.9s var(--dz-ease-in-out, ease-in-out) infinite;
}
.eq i:nth-child(2) {
  animation-delay: 0.18s;
}
.eq i:nth-child(3) {
  animation-delay: 0.36s;
}
.eq--still i {
  animation: none;
  transform: scaleY(0.4);
}

/* ── Expanded panel ── */
.panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px 18px;
  width: min(260px, 72vw);
}

.track {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cover {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--dz-radius-md, 0.5rem);
  font-size: 20px;
  color: var(--dz-colors-neutral-900, #0f172a);
  background: linear-gradient(
    135deg,
    var(--dz-colors-primary-400, #818cf8),
    var(--dz-colors-secondary-400, #c084fc)
  );
}

.track-title {
  color: var(--dz-colors-neutral-50, #f8fafc);
}
.track-artist {
  color: color-mix(in oklch, var(--dz-colors-neutral-50, #f8fafc) 64%, transparent);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.ctl {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-colors-neutral-50, #f8fafc);
  background: color-mix(in oklch, var(--dz-colors-neutral-50, #f8fafc) 10%, transparent);
  cursor: pointer;
  transition: background var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}
.ctl:hover {
  background: color-mix(in oklch, var(--dz-colors-neutral-50, #f8fafc) 18%, transparent);
}
.ctl--primary {
  width: 46px;
  height: 46px;
  color: var(--dz-colors-neutral-900, #0f172a);
  background: var(--dz-colors-neutral-50, #f8fafc);
}
.ctl--primary:hover {
  background: color-mix(in oklch, var(--dz-colors-neutral-50, #f8fafc) 88%, var(--dz-colors-primary-300, #a5b4fc));
}
.ctl:focus-visible {
  outline: 2px solid var(--dz-colors-primary-300, #a5b4fc);
  outline-offset: 2px;
}

@keyframes dz-island-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in oklch, var(--dz-colors-success-400, #4ade80) 60%, transparent);
  }
  70%,
  100% {
    box-shadow: 0 0 0 7px transparent;
  }
}

@keyframes dz-island-eq {
  0%,
  100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
  }
}

/* Custom keyframes never run under reduced motion (OS); the `--still` classes
   mirror the page-level toggle. */
@media (prefers-reduced-motion: reduce) {
  .pulse,
  .eq i {
    animation: none !important;
  }
  .eq i {
    transform: scaleY(0.4);
  }
}
</style>
