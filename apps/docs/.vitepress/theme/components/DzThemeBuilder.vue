<script setup lang="ts">
/**
 * DzThemeBuilder — the shell (TASK-N2-D3).
 *
 * The builder itself is `ThemeBuilderPanel.vue`, loaded by a dynamic `import()`
 * on mount. **The shell exists purely to keep `defineAsyncComponent` out of the
 * shared bundle**, and that is a measured decision rather than a stylistic one:
 * registering the panel with `defineAsyncComponent` in `theme/index.ts` grew the
 * site's shared `framework` chunk from 111,886 B to 140,060 B — **+28,174 B paid
 * by every page on the site**, including 150 pages that have no theme builder on
 * them. `<component :is>` is already in VitePress's own runtime, so this shape
 * costs nothing shared.
 *
 * §7 of the handoff has the before/after transfer measurements.
 */
import { onMounted, shallowRef } from 'vue'

const panel = shallowRef<unknown>(null)
const failed = shallowRef('')

onMounted(async () => {
  try {
    panel.value = (await import('./ThemeBuilderPanel.vue')).default
  }
  catch (error) {
    failed.value = error instanceof Error ? error.message : String(error)
  }
})
</script>

<template>
  <component :is="panel" v-if="panel" />
  <p v-else-if="failed" class="dz-tb-shell__error">
    The theme builder could not be loaded: {{ failed }}
  </p>
  <p v-else class="dz-tb-shell__note">
    Loading the theme builder…
  </p>
</template>

<style>
.dz-tb-shell__note,
.dz-tb-shell__error {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 24px 0;
}
</style>
