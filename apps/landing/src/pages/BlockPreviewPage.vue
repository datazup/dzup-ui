<script setup lang="ts">
/**
 * BlockPreviewPage (/blocks/preview/:id) — the CHROMELESS, full-bleed render of a
 * SINGLE block, with no site nav/footer (App.vue suppresses the chrome for this
 * route name). It is the canonical standalone view (docs/blocks.md §3.5, §1.2 #7):
 *   • the "Open in new tab" target from each BlockPreview,
 *   • the intended <iframe> src for full-section block isolation (Tasks F1–F3),
 *   • the OG-image render source (Task I4).
 *
 * The render is param-driven so a URL fully encodes what to show — nothing is read
 * from app state. Three optional query params re-skin it deterministically on load
 * (and on any later change, so an iframe parent can swap the `src`):
 *   • ?theme=light|dark → `data-theme` on <html> (any other value: keep current),
 *   • ?dir=ltr|rtl      → `dir` on <html> (any other value: ltr),
 *   • ?w=<px>           → max-width of the centred frame, clamped to a sane range
 *                         (omitted/invalid: the block fills the viewport).
 * So `…/hero-split?theme=dark&dir=rtl&w=420` renders that block alone, dark, RTL,
 * pinned to 420px. An unknown :id redirects to /blocks (the route guard already
 * does this; the check here is a defensive fallback for any other entry path).
 */
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBlock } from '../blocks/registry.ts'

const props = defineProps<{ id: string }>()
const route = useRoute()
const router = useRouter()

const block = computed(() => getBlock(props.id))

// Defensive redirect — the route guard normally prevents an unknown id here.
if (!block.value) {
  router.replace('/blocks')
}

/** Narrowest / widest the frame may be pinned to via ?w (clamped, never rejected). */
const MIN_WIDTH = 240
const MAX_WIDTH = 3840

/**
 * Centred-frame max-width from ?w: a clamped pixel string, or `'100%'` when the
 * param is absent or not a finite number (the block fills the viewport).
 */
const frameMaxWidth = computed<string>(() => {
  const raw = route.query.w
  const px = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number.NaN
  if (!Number.isFinite(px)) return '100%'
  return `${Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, px))}px`
})

/** Apply a `light`/`dark` theme to <html>; ignore anything else (keep current). */
function applyTheme(theme: unknown): void {
  if (typeof document === 'undefined') return
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

/** Apply `rtl`/`ltr` to <html>; default to `ltr` for any other value. */
function applyDir(dir: unknown): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('dir', dir === 'rtl' ? 'rtl' : 'ltr')
}

/** Read theme + dir off the query and apply them together. */
function applyParams(): void {
  applyTheme(route.query.theme)
  applyDir(route.query.dir)
}

// Honour the initial params and any later change. Swapping an iframe `src` reloads
// this document (re-running setup); watching also covers in-SPA navigations.
applyParams()
watch(() => [route.query.theme, route.query.dir], applyParams)
</script>

<template>
  <div class="block-preview-root">
    <div class="block-preview-frame" :style="{ maxWidth: frameMaxWidth }">
      <component :is="block.component" v-if="block" />
    </div>
  </div>
</template>

<style scoped>
/* Full-bleed stage: fill the viewport, centre the framed block horizontally, and
   paint the token background so the standalone render (and its OG screenshot) is
   never a transparent/white box. No nav/footer chrome — App.vue suppresses it. */
.block-preview-root {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background: var(--dz-background, #ffffff);
  color: var(--dz-foreground, #1a202c);
}

/* Width is driven entirely by ?w (max-width); the block stays responsive within
   it, matching BlockPreview's in-gallery frame. */
.block-preview-frame {
  width: 100%;
  margin: 0 auto;
}
</style>
