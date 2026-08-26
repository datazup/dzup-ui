<script setup lang="ts">
import type { BlockDef } from '../../blocks/registry.ts'
import { LayoutTemplate } from 'lucide-vue-next'
import { onBeforeUnmount, ref, watch } from 'vue'
import { useLazyMount } from '../../composables/useLazyMount.ts'

/**
 * BlockCardArt — the live postcard on a BlockCard (TASK-BV2-05).
 *
 * The card's "image" is the block itself: the SAME lazy component the preview
 * below will mount, rendered on a fixed 1100px-wide stage and scaled down to
 * the card's width. Zero repo bytes, zero screenshot drift — and because the
 * block reads the same `--dz-*` custom properties as everything else, the
 * global theme toolbar re-colors every card's art live.
 *
 * Contract:
 * - **Decoration.** The stage is `aria-hidden`, `inert` and pointer-inert; the
 *   card's interactive anatomy (cover link, chips, CLI, permalink) is
 *   untouched. The 16/10 crop from the top is the accepted framing — the same
 *   call the OG pipeline made (scripts/shoot-og.mts).
 * - **Never a second identity.** The page also mounts the block live in its
 *   preview, so the art copy must not duplicate DOM ids: `stripIdentity`
 *   removes `id`/`for`/`name`/`aria-*` reference attributes from the art
 *   subtree (it is invisible to AT anyway), and a MutationObserver re-strips
 *   whatever the async component adds after it resolves. Without this,
 *   `getElementById` and label/aria lookups for the REAL preview could resolve
 *   into the hidden art — an accessibility regression, not just axe noise.
 * - **Lazy.** The block mounts through the same `useLazyMount` proximity gate
 *   the previews trust; until then (and in no-IO/SSR environments if the
 *   module never resolves) the accent-gradient fallback with a ghost glyph IS
 *   the final state, and it is designed to look intentional.
 * - **CLS 0.** The container reserves a fixed 16/10 box; mounting swaps paint,
 *   never layout.
 */

defineProps<{
  block: BlockDef
}>()

/** Stage design width — blocks are authored for desktop sections. */
const STAGE_WIDTH = 1100

const { setEl, shouldRender } = useLazyMount({ rootMargin: '400px 0px' })

/** The scaled stage host; measured to derive the scale factor. */
const frameEl = ref<HTMLElement | null>(null)
const scale = ref(0.3)

let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

/** Attribute names that give elements a document-wide identity or reference. */
const IDENTITY_ATTRS = ['id', 'for', 'name', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'aria-activedescendant']

/** Remove document-identity attributes from the (inert, hidden) art subtree. */
function stripIdentity(root: HTMLElement): void {
  for (const attr of IDENTITY_ATTRS) {
    for (const el of root.querySelectorAll(`[${attr}]`))
      el.removeAttribute(attr)
  }
}

function measure(): void {
  const el = frameEl.value
  if (!el)
    return
  const width = el.getBoundingClientRect().width
  if (width > 0)
    scale.value = width / STAGE_WIDTH
}

function disconnect(): void {
  resizeObserver?.disconnect()
  resizeObserver = null
  mutationObserver?.disconnect()
  mutationObserver = null
}

// The frame lives behind the lazy gate's v-if, so it appears AFTER mount (the
// gate flips `shouldRender` in its own onMounted and the DOM materialises on
// the following tick) — a plain onMounted here would observe nothing. Watch
// the template ref instead: attach when the frame exists, detach when it goes.
watch(frameEl, (el) => {
  disconnect()
  if (!el)
    return
  measure()
  stripIdentity(el)
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(el)
  }
  if (typeof MutationObserver !== 'undefined') {
    // The async block resolves (and may keep rendering) after this point —
    // strip identity attributes from whatever appears, whenever it appears.
    mutationObserver = new MutationObserver(() => {
      if (frameEl.value)
        stripIdentity(frameEl.value)
    })
    mutationObserver.observe(el, { childList: true, subtree: true })
  }
}, { flush: 'post' })

onBeforeUnmount(disconnect)

defineExpose({
  /** Test hook: the proximity gate's target setter (mirrors LazyBlockPreview). */
  setEl,
})
</script>

<template>
  <div :ref="setEl" class="block-card-art" aria-hidden="true">
    <!-- Accent-gradient fallback: visible until (unless) the live block paints.
         Ghost glyph, not a spinner — this is a designed resting state. -->
    <div class="block-card-art-fallback">
      <LayoutTemplate :size="42" aria-hidden="true" class="block-card-art-ghost" />
    </div>

    <!-- The live miniature: the block's own lazy component on an inert,
         identity-stripped, pointer-inert stage. -->
    <div
      v-if="shouldRender"
      ref="frameEl"
      class="block-card-art-frame"
      inert
    >
      <div class="block-card-art-stage" :style="{ transform: `scale(${scale})` }">
        <component :is="block.component" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.block-card-art {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: var(--dz-radius-lg, 0.625rem);
  border: 1px solid var(--lp-hairline);
  /* The art must never trap a click meant for the card's cover link. */
  pointer-events: none;
}

.block-card-art-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(
      120% 100% at 20% 0%,
      color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #0766ee)) 16%, transparent),
      transparent 60%
    ),
    color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #0766ee)) 5%, var(--dz-surface, #ffffff));
}

.block-card-art-ghost {
  color: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #0766ee)) 45%, transparent);
}

.block-card-art-frame {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--dz-background, #e7e8e9);
}

.block-card-art-stage {
  /* Fixed desktop design width, scaled to the card by the measured factor.
     Height covers the tallest crop the 16/10 frame can show at min scale. */
  width: 1100px;
  min-height: 690px;
  transform-origin: top left;
  background: var(--dz-background, #e7e8e9);
}
</style>
