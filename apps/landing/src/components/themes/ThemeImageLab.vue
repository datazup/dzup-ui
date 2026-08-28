<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { DzBadge, DzText } from '@dzup-ui/core'
import { Upload } from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'
import { useThemeDesigner } from '../../composables/useThemeDesigner.ts'
import { useReducedMotion } from '../../motion/index.ts'
import { sampleDominantOklch } from './themeImageSampling.ts'

/**
 * ThemeImageLab — the Theme Designer's "from image" darkroom
 * (docs/themes-v2.md TASK-THV2-06).
 *
 * The extraction pipeline moved VERBATIM from ThemesPage (same sampling — now
 * the pure `sampleDominantOklch` — same clamps, same palette writes); what's
 * new is the staging: a real drag-and-drop zone (the label+input pair stays
 * the keyboard path), a thumbnail of the picked image, and — motion allowed —
 * a one-shot flight of sampled-colour dots from the thumbnail to the Primary
 * palette swatch, after which the primary control's THV2-03 ramp shimmer
 * fires by itself (the palette write triggers the page's watcher).
 *
 * Fully client-side: the image never leaves the browser (the privacy note
 * below must stay true). Object URLs are always revoked. `useReducedMotion`
 * here resolves the OS query OR the page's Motion preview (ThemesPage
 * provides the override) — under either gate the RESULT still applies
 * instantly; only the show is skipped.
 *
 * The status line is this page's SECOND polite region — deliberately WITHOUT
 * `role="status"` so the copy-outcome region's `[aria-live][role="status"]`
 * contract (ThemesPage.copy.spec.ts) keeps a unique match; the two announce
 * disjoint events.
 */

const designer = useThemeDesigner()
const reduced = useReducedMotion()

const imageStatus = ref<string>('')
const dragActive = ref(false)
const thumbUrl = ref<string>('')
const thumbEl = ref<HTMLElement | null>(null)

interface FlightDot {
  id: number
  style: CSSProperties
}
const flightDots = ref<FlightDot[]>([])
let flightSeq = 0
let flightTimer = 0

function setThumb(url: string): void {
  if (thumbUrl.value)
    URL.revokeObjectURL(thumbUrl.value)
  thumbUrl.value = url
}

onBeforeUnmount(() => {
  setThumb('')
  window.clearTimeout(flightTimer)
})

function takeFile(file: File | undefined | null): void {
  if (!file || !file.type.startsWith('image/'))
    return
  imageStatus.value = 'Reading image…'
  const img = new Image()
  const objectUrl = URL.createObjectURL(file)
  img.onload = () => {
    try {
      applyImagePalette(img)
    }
    catch {
      imageStatus.value = 'Could not read that image.'
    }
    finally {
      // The thumbnail keeps its own URL; this decode URL is released.
      URL.revokeObjectURL(objectUrl)
    }
  }
  img.onerror = () => {
    imageStatus.value = 'Could not load that image.'
    URL.revokeObjectURL(objectUrl)
  }
  // A second object URL for the visible thumbnail (revoked on replace/unmount).
  setThumb(URL.createObjectURL(file))
  img.src = objectUrl
}

function onImagePick(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-picking the same file
  takeFile(file)
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  dragActive.value = false
  takeFile(event.dataTransfer?.files?.[0])
}

function onDragOver(event: DragEvent): void {
  event.preventDefault()
  dragActive.value = true
}

function onDragLeave(): void {
  dragActive.value = false
}

function applyImagePalette(img: HTMLImageElement): void {
  const size = 48
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    imageStatus.value = 'Canvas unavailable in this browser.'
    return
  }
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  const sample = sampleDominantOklch(data)
  if (!sample) {
    imageStatus.value = 'No dominant colour found — try a more colourful image.'
    return
  }
  const { hue } = sample
  // Clamp chroma into a usable brand range so washed-out or neon photos still
  // yield a workable palette.
  const chroma = Math.min(0.24, Math.max(0.1, sample.chroma))
  designer.palettes.primary = { hue, chroma }
  designer.palettes.neutral = { hue, chroma: 0.012 }
  imageStatus.value = `Applied primary from image · hue ${hue}° · chroma ${chroma.toFixed(2)}`
  launchFlight(sample.topBins)
}

/**
 * The performance: sampled-colour dots fly from the thumbnail to the Primary
 * palette swatch. Decoration only — skipped entirely under either motion gate
 * (the apply above already happened); skipped silently when the endpoints
 * cannot be measured (jsdom, detached controls).
 */
function launchFlight(bins: { hue: number, chroma: number }[]): void {
  if (reduced.value)
    return
  const from = thumbEl.value?.getBoundingClientRect()
  const to = document.querySelector('.palette-control .palette-swatch')?.getBoundingClientRect()
  if (!from || !to || (from.width === 0 && from.height === 0))
    return
  const startX = from.left + from.width / 2
  const startY = from.top + from.height / 2
  const dots: FlightDot[] = bins.slice(0, 5).map((bin, i) => ({
    id: (flightSeq += 1),
    style: {
      'left': `${startX}px`,
      'top': `${startY}px`,
      '--dx': `${to.left + to.width / 2 - startX}px`,
      '--dy': `${to.top + to.height / 2 - startY}px`,
      // Sampled DATA colours (like the hue track), not theme styling.
      'background': `oklch(0.65 ${bin.chroma.toFixed(3)} ${bin.hue})`,
      'animationDelay': `${i * 60}ms`,
    } as CSSProperties,
  }))
  flightDots.value = dots
  window.clearTimeout(flightTimer)
  flightTimer = window.setTimeout(() => {
    flightDots.value = []
  }, 1000)
}
</script>

<template>
  <section class="control-group">
    <h2 class="control-h">
      From image
      <DzBadge variant="subtle" tone="warning" size="sm">
        Experimental
      </DzBadge>
    </h2>
    <DzText size="sm" tone="muted">
      Derive a primary hue from an image's dominant colour — client-side, nothing uploaded.
    </DzText>
    <div
      class="thv2-dropzone"
      :class="{ 'thv2-dropzone--active': dragActive }"
      @dragenter="onDragOver"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <label class="upload">
        <Upload :size="15" aria-hidden="true" />
        <span>Choose image… or drop it here</span>
        <input type="file" accept="image/*" class="upload-input" @change="onImagePick">
      </label>
      <img
        v-if="thumbUrl"
        ref="thumbEl"
        :src="thumbUrl"
        alt=""
        aria-hidden="true"
        class="thv2-thumb"
      >
    </div>
    <!-- Polite (NO role="status" — the copy region owns that pairing). -->
    <DzText size="xs" tone="muted" aria-live="polite" class="thv2-image-status">
      {{ imageStatus }}
    </DzText>
    <!-- The flight: sampled colours pouring into the Primary control. -->
    <Teleport to="body">
      <i
        v-for="dot in flightDots"
        :key="dot.id"
        class="thv2-flight-dot"
        aria-hidden="true"
        :style="dot.style"
      />
    </Teleport>
  </section>
</template>

<style scoped>
/* The section reuses the page's control-group/control-h layout classes (they
   are page-scoped) — restate the essentials so the lab is self-contained. */
.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.control-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
}

.thv2-dropzone {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: var(--dz-radius-md, 6px);
}
.thv2-dropzone--active .upload {
  border-color: var(--dz-primary, #0766ee);
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 8%, var(--dz-background, #e7e8e9));
}

.upload {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px dashed var(--dz-border, #b5b7bb);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-background, #e7e8e9);
  color: var(--dz-foreground, #1b1d1f);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color var(--dz-duration-fast, 150ms),
    background var(--dz-duration-fast, 150ms);
}
.upload:hover {
  border-color: var(--dz-primary, #0766ee);
}
.upload-input {
  display: none;
}

.thv2-thumb {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: var(--dz-radius-md, 6px);
  border: 1px solid var(--lp-hairline, #d5d7d9);
  flex: none;
}

.thv2-image-status {
  min-height: 1em;
}

.thv2-flight-dot {
  position: fixed;
  z-index: 60;
  width: 11px;
  height: 11px;
  margin: -5px 0 0 -5px;
  border-radius: var(--dz-radius-full, 9999px);
  pointer-events: none;
  opacity: 0;
  animation: thv2-flight 620ms cubic-bezier(0.3, 0, 0.3, 1) both;
}
@keyframes thv2-flight {
  0% {
    opacity: 0.95;
    transform: translate(0, 0) scale(1);
  }
  85% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx, 0), var(--dy, 0)) scale(0.5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .thv2-flight-dot {
    animation: none;
    opacity: 0;
  }
}
</style>
