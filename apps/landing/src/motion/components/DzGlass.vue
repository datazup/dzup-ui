<script setup lang="ts">
import { computed } from 'vue'

/**
 * DzGlass — a frosted, lightly-refractive panel over a busy backdrop
 * (docs/animations.md §5.4, effect 45). Wraps any content in a translucent
 * surface that blurs + saturates whatever sits behind it (`backdrop-filter`),
 * with a hairline highlight border so it reads as a pane of glass.
 *
 * Accessibility fallbacks (§7) — no motion, so reduced-motion needs nothing, but:
 * - `prefers-reduced-transparency`: drop the blur for a fully opaque RAISED
 *   surface (`--dz-surface-raised`) so the content stays legible over the busy
 *   backdrop instead of fighting it through translucency.
 * - `forced-colors: active`: `backdrop-filter` + translucency are dropped by the
 *   platform (and `box-shadow` is forced to none), so the panel would blend into
 *   its backdrop — pin a solid system `Canvas` surface + a `CanvasText` border so
 *   it still reads as a distinct panel.
 *
 * Token-only, light + dark.
 */
const props = withDefaults(
  defineProps<{
    /** Frost radius; falls back to `--dz-anim-glass-blur` (14px). */
    blur?: string
    /** Corner radius; any `--dz-radius-*` token value. */
    radius?: string
    /** Inner padding. */
    padding?: string
  }>(),
  {
    blur: 'var(--dz-anim-glass-blur, 14px)',
    radius: 'var(--dz-radius-xl, 0.875rem)',
    padding: '20px',
  },
)

const style = computed(() => ({
  '--dz-glass-blur': props.blur,
  'borderRadius': props.radius,
  'padding': props.padding,
}))
</script>

<template>
  <div class="dz-glass" :style="style">
    <slot />
  </div>
</template>

<style scoped>
.dz-glass {
  position: relative;
  border: 1px solid color-mix(in oklch, var(--dz-colors-base-white, #fff) 22%, transparent);
  background: color-mix(in oklch, var(--dz-surface, #ffffff) 55%, transparent);
  backdrop-filter: blur(var(--dz-glass-blur, 14px)) saturate(var(--dz-anim-glass-saturate, 1.6));
  -webkit-backdrop-filter: blur(var(--dz-glass-blur, 14px)) saturate(var(--dz-anim-glass-saturate, 1.6));
  box-shadow:
    var(--dz-shadow-md, 0 8px 24px rgb(15 23 42 / 0.12)),
    inset 0 1px 0 color-mix(in oklch, var(--dz-colors-base-white, #fff) 30%, transparent);
}

/* Dark theme: a thinner, cooler frost so it sits well over a dark busy backdrop. */
[data-theme="dark"] .dz-glass {
  border-color: color-mix(in oklch, var(--dz-colors-base-white, #fff) 12%, transparent);
  background: color-mix(in oklch, var(--dz-surface, #ffffff) 45%, transparent);
}

/* prefers-reduced-transparency → opaque raised surface (no see-through frost). */
@media (prefers-reduced-transparency: reduce) {
  .dz-glass {
    background: var(--dz-surface-raised, var(--dz-surface, #ffffff));
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

/* forced-colors → solid system surface + visible border so the panel doesn't
   vanish into the backdrop when blur/translucency/shadow are stripped. */
@media (forced-colors: active) {
  .dz-glass {
    background: Canvas;
    border: 1px solid CanvasText;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
  }
}
</style>
