<script setup lang="ts">
import { DzAspectRatio, DzBadge, DzHeading, DzImage, DzLightbox, DzText } from '@dzup-ui/core'
import type { LightboxImage } from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Media gallery — a responsive image grid that opens a fullscreen lightbox.
 *
 * Built from the Media family: DzImage (loading/error states + lazy) framed by
 * DzAspectRatio for ratio-stable tiles, and DzLightbox for the focus-trapped
 * fullscreen viewer (arrow-key / on-screen navigation, captions, counter).
 *
 * Self-contained: only free @dzup-ui/core components and `--dz-*` tokens, so it
 * drops in already themed, accessible, and light/dark-ready (docs/blocks.md §3.6).
 * Heading is semantic level 4 so it nests under the BlockPreview H3 outline.
 */

/** A gallery photo. Narrows `alt` to required (DzImage needs it) + adds a tag. */
interface Shot extends LightboxImage {
  alt: string
  tag: string
}

const shots: Shot[] = [
  {
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    alt: 'A mirror-still alpine lake reflecting forested peaks at dusk',
    caption: 'Still water — Moraine Lake, golden hour',
    tag: 'Landscape',
  },
  {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=80',
    alt: 'Sun breaking over a layered mountain ridgeline',
    caption: 'First light over the ridge',
    tag: 'Mountains',
  },
  {
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=80',
    alt: 'Pine forest fading into morning fog',
    caption: 'Low fog through the pines',
    tag: 'Forest',
  },
  {
    src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=900&q=80',
    alt: 'Path winding through tall autumn trees',
    caption: 'The long way through',
    tag: 'Trail',
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80',
    alt: 'Sunlit green forest canopy from below',
    caption: 'Canopy, looking up',
    tag: 'Canopy',
  },
]

/** Lightbox open state + the photo it should open on. */
const open = ref(false)
const startIndex = ref(0)

function openAt(index: number): void {
  startIndex.value = index
  open.value = true
}
</script>

<template>
  <section class="gallery" aria-labelledby="media-gallery-title">
    <header class="g-head">
      <div>
        <DzBadge variant="subtle" tone="primary" size="sm">Gallery</DzBadge>
        <DzHeading id="media-gallery-title" :level="4" size="xl" weight="semibold" class="g-title">
          Field notebook
        </DzHeading>
        <DzText size="sm" tone="muted" class="g-lede">
          Five frames from the road — select any tile to open the fullscreen viewer.
        </DzText>
      </div>
    </header>

    <!-- Asymmetric grid: the lead frame spans two columns and two rows. -->
    <ul class="g-grid">
      <li
        v-for="(shot, i) in shots"
        :key="shot.src"
        class="g-cell"
        :class="{ 'g-cell--lead': i === 0 }"
      >
        <button
          type="button"
          class="g-tile"
          :aria-label="`Open image ${i + 1} of ${shots.length}: ${shot.alt}`"
          @click="openAt(i)"
        >
          <DzAspectRatio :ratio="i === 0 ? 4 / 3 : 1">
            <DzImage :src="shot.src" :alt="shot.alt" fit="cover" lazy class="g-img" />
          </DzAspectRatio>

          <span class="g-overlay" aria-hidden="true">
            <span class="g-tag">{{ shot.tag }}</span>
            <span class="g-zoom">
              <svg
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" class="g-zoom-icon"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </span>
          </span>
        </button>
      </li>
    </ul>

    <!-- Fullscreen viewer, controlled by the tiles above. -->
    <DzLightbox v-model="open" :images="shots" :start-index="startIndex" aria-label="Field notebook gallery" />
  </section>
</template>

<style scoped>
.gallery {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.g-head {
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.g-title {
  margin: 0.5rem 0 0.25rem;
  letter-spacing: -0.01em;
}

.g-lede {
  margin: 0;
  line-height: 1.55;
}

.g-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  gap: var(--dz-space-3, 0.75rem);
}

/* Lead frame occupies a 2×2 cell on wide layouts. */
.g-cell--lead {
  grid-column: span 2;
  grid-row: span 2;
}

.g-tile {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  cursor: pointer;
  border-radius: var(--dz-radius-lg, 0.75rem);
  overflow: hidden;
  background: var(--dz-muted, #f1f5f9);
  box-shadow: 0 1px 2px color-mix(in oklch, var(--dz-shadow, #000) 8%, transparent);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.g-tile:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 20px -8px color-mix(in oklch, var(--dz-shadow, #000) 22%, transparent),
    0 0 0 1px color-mix(in oklch, var(--dz-primary, #6366f1) 40%, transparent);
}

.g-tile:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--dz-ring, #6366f1) 55%, transparent);
}

.g-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* Hover/focus scrim with tag + zoom affordance. */
.g-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-3, 0.75rem);
  background: linear-gradient(to top, color-mix(in oklch, var(--dz-shadow, #000) 55%, transparent), transparent 55%);
  opacity: 0;
  transition: opacity 180ms ease;
}

.g-tile:hover .g-overlay,
.g-tile:focus-visible .g-overlay {
  opacity: 1;
}

.g-tag {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  color: #fff;
  padding: 2px 9px;
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--dz-shadow, #000) 45%, transparent);
  backdrop-filter: blur(4px);
}

.g-zoom {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-foreground, #0f172a);
  background: color-mix(in oklch, var(--dz-background, #fff) 88%, transparent);
}

.g-zoom-icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 560px) {
  .g-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .g-cell--lead {
    grid-column: span 2;
    grid-row: span 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .g-tile,
  .g-overlay {
    transition: none;
  }
}
</style>
