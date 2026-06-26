<script setup lang="ts">
import type { DzWatermarkProps, DzWatermarkSlots } from './DzWatermark.types.ts'
/**
 * DzWatermark — tiled content watermark overlay.
 *
 * Wraps slotted content and layers a repeating text/image mark over it for
 * ownership/confidentiality marking (confidential previews, trial states,
 * shared exports). The mark is rasterized once to a canvas data URL and tiled
 * via a repeating CSS background, so it stays crisp on HiDPI displays and cheap
 * to repaint.
 *
 * The overlay is `aria-hidden` and `pointer-events: none`, so it never blocks
 * interaction nor is announced by screen readers. Colors are token-based
 * (ADR-04): the canvas draws in `--dz-watermark-color` and the layer's low
 * opacity comes from `--dz-watermark-opacity`.
 *
 * With `observe`, a `MutationObserver` re-applies the overlay if it is removed
 * or its critical styles are tampered with — best-effort resistance for
 * confidential surfaces.
 *
 * @example
 * ```vue
 * <DzWatermark content="CONFIDENTIAL">
 *   <DocumentPreview />
 * </DzWatermark>
 *
 * <DzWatermark :content="['Acme Inc.', 'Do not distribute']" :rotate="-30" observe>
 *   <SharedReport />
 * </DzWatermark>
 * ```
 *
 * @status experimental
 */
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { watermarkVariants } from './DzWatermark.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzWatermarkProps>(), {
  rotate: -22,
  gap: () => [100, 100],
  fontSize: 16,
  fontFamily: 'inherit',
  fontWeight: 'normal',
  color: 'var(--dz-watermark-color)',
  zIndex: 9,
  observe: false,
})

defineSlots<DzWatermarkSlots>()

const attrs = useAttrs()

const rootRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)

/** Generated tile as a data URL, plus the CSS background-size it tiles at. */
const tile = ref<{ url: string, size: string }>({ url: '', size: '' })

const styles = computed(() => watermarkVariants())

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

/** Normalize `gap` into a `[x, y]` tuple. */
const gapXY = computed<[number, number]>(() =>
  Array.isArray(props.gap) ? props.gap : [props.gap, props.gap],
)

/** Text lines to render (image marks ignore this). */
const lines = computed<string[]>(() => {
  if (props.image)
    return []
  if (Array.isArray(props.content))
    return props.content
  return props.content ? [props.content] : []
})

const overlayStyle = computed(() => ({
  zIndex: String(props.zIndex),
  backgroundImage: tile.value.url ? `url("${tile.value.url}")` : undefined,
  backgroundSize: tile.value.size || undefined,
}))

/**
 * Resolve a CSS color that may be a `var(--token)` reference into a concrete
 * color the canvas can paint with, by reading the host's computed styles. Falls
 * back to the raw value (and finally a neutral) when the token is unresolved —
 * e.g. in non-DOM test environments.
 */
function resolveColor(value: string, el: HTMLElement | null): string {
  const match = /var\(\s*(--[\w-]+)(?:,([^)]*))?\)/.exec(value)
  if (!match)
    return value
  const name = match[1]
  if (!name)
    return value

  const fallback = match[2]
  const resolved = el
    ? getComputedStyle(el).getPropertyValue(name).trim()
    : ''
  return resolved || fallback?.trim() || 'currentColor'
}

/**
 * Rasterize the configured mark to a data URL and compute the tile size. Returns
 * an empty tile when there is nothing to draw or no 2D context is available
 * (so SSR / jsdom degrade gracefully instead of throwing).
 */
function buildTextTile(): { url: string, size: string } {
  const empty = { url: '', size: '' }
  if (typeof document === 'undefined' || lines.value.length === 0)
    return empty

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return empty

  const ratio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const [gapX, gapY] = gapXY.value
  const fontSize = props.fontSize
  const lineHeight = fontSize * 1.2
  const font = `${props.fontWeight} ${fontSize}px ${props.fontFamily}`

  ctx.font = font
  const markWidth
    = props.width ?? Math.ceil(Math.max(...lines.value.map(l => ctx.measureText(l).width)))
  const markHeight = props.height ?? Math.ceil(lineHeight * lines.value.length)

  const tileWidth = markWidth + gapX
  const tileHeight = markHeight + gapY

  canvas.width = tileWidth * ratio
  canvas.height = tileHeight * ratio
  ctx.scale(ratio, ratio)

  ctx.translate(tileWidth / 2, tileHeight / 2)
  ctx.rotate((props.rotate * Math.PI) / 180)

  ctx.font = font
  ctx.fillStyle = resolveColor(props.color, rootRef.value)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const top = -((lines.value.length - 1) * lineHeight) / 2
  lines.value.forEach((line, i) => {
    ctx.fillText(line, 0, top + i * lineHeight)
  })

  return { url: canvas.toDataURL(), size: `${tileWidth}px ${tileHeight}px` }
}

/** Image marks load asynchronously; resolve to a tile once decoded. */
function buildImageTile(): Promise<{ url: string, size: string }> {
  const empty = { url: '', size: '' }
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || !props.image) {
      resolve(empty)
      return
    }
    const ratio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const [gapX, gapY] = gapXY.value
    const markWidth = props.width ?? 120
    const markHeight = props.height ?? 64
    const tileWidth = markWidth + gapX
    const tileHeight = markHeight + gapY

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(empty)
        return
      }
      canvas.width = tileWidth * ratio
      canvas.height = tileHeight * ratio
      ctx.scale(ratio, ratio)
      ctx.translate(tileWidth / 2, tileHeight / 2)
      ctx.rotate((props.rotate * Math.PI) / 180)
      ctx.drawImage(img, -markWidth / 2, -markHeight / 2, markWidth, markHeight)
      resolve({ url: canvas.toDataURL(), size: `${tileWidth}px ${tileHeight}px` })
    }
    img.onerror = () => resolve(empty)
    img.src = props.image
  })
}

async function render(): Promise<void> {
  tile.value = props.image ? await buildImageTile() : buildTextTile()
}

// ---------------------------------------------------------------------------
// Tamper resistance (opt-in)
// ---------------------------------------------------------------------------

let observer: MutationObserver | null = null

/** Ensure the overlay is attached to the root and carries its guard styles. */
function reapply(): void {
  const root = rootRef.value
  const overlay = overlayRef.value
  if (!root || !overlay)
    return
  if (overlay.parentNode !== root)
    root.appendChild(overlay)
  overlay.style.pointerEvents = 'none'
  overlay.style.position = 'absolute'
  overlay.setAttribute('aria-hidden', 'true')
}

function startObserver(): void {
  if (observer || typeof MutationObserver === 'undefined' || !rootRef.value)
    return
  observer = new MutationObserver(() => reapply())
  observer.observe(rootRef.value, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  })
}

function stopObserver(): void {
  observer?.disconnect()
  observer = null
}

onMounted(() => {
  void render()
  if (props.observe)
    startObserver()
})

onBeforeUnmount(stopObserver)

// Re-render when any visual input changes.
watch(
  () => [
    props.content,
    props.image,
    props.rotate,
    props.gap,
    props.fontSize,
    props.fontFamily,
    props.fontWeight,
    props.color,
    props.width,
    props.height,
  ],
  () => void render(),
  { deep: true },
)

// Toggle the observer with the prop.
watch(
  () => props.observe,
  (on) => {
    if (on)
      startObserver()
    else
      stopObserver()
  },
)
</script>

<template>
  <div
    :id="id"
    ref="rootRef"
    :class="rootClasses"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
    <div
      ref="overlayRef"
      :class="styles.overlay()"
      :style="overlayStyle"
      aria-hidden="true"
    />
  </div>
</template>
