<script setup lang="ts">
/**
 * DzPlayground — the editable playground a generated component page embeds.
 *
 * Emitted by `renderPlayground()` in
 * `packages/tooling/src/docs/docs-pages.ts` as a single self-closing tag, which
 * is the only component tag `escapeForVue`'s allowlist lets through.
 *
 * **Why it opens closed.** `<performance>` requires that the site's
 * non-playground pages not pay the REPL bundle cost, and 144 of the site's 158
 * pages carry this tag. If the REPL auto-booted, every visitor scrolling a
 * component page would fetch the CodeMirror editor (527,585 B) and the
 * self-contained `@dzup-ui/core` bundle (1,752,877 B) whether or not they
 * intended to run anything. So this component is a button until pressed, and
 * the seeds file is not even fetched until then. The static, paste-ready
 * example is already on the page above — nothing is hidden by this, only
 * deferred.
 *
 * Nothing under `@vue/repl` is imported statically anywhere in `apps/docs`.
 */
import type { MountedRepl, PlaygroundSeed } from '../playground.ts'
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { currentTheme, loadSeeds, mountRepl } from '../playground.ts'

const props = defineProps<{
  /** Public component name; the key into `public/playground/seeds.json`. */
  component: string
}>()

const host = ref<HTMLElement | null>(null)
const state = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const message = ref('')
const seed = ref<PlaygroundSeed | null>(null)
const instance = shallowRef<MountedRepl | null>(null)
let themeObserver: MutationObserver | null = null

async function launch(): Promise<void> {
  if (state.value === 'loading' || state.value === 'ready')
    return
  state.value = 'loading'
  try {
    const seeds = await loadSeeds()
    const found = seeds.seeds[props.component]
    if (found === undefined) {
      // Reachable only if a page claims a playground the seeds file does not
      // carry. `validate:docs-pages` compares the two sets precisely so this
      // branch stays unreachable in a built site; it says what happened rather
      // than rendering an empty box.
      throw new Error(
        `no seed for ${props.component} in seeds.json — the page and the seeds artifact disagree`,
      )
    }
    seed.value = found
    if (host.value === null)
      throw new Error('playground host element vanished before mount')
    instance.value = await mountRepl({
      host: host.value,
      code: found.code,
      theme: currentTheme(),
    })
    state.value = 'ready'
  }
  catch (error) {
    message.value = error instanceof Error ? error.message : String(error)
    state.value = 'error'
  }
}

onMounted(() => {
  themeObserver = new MutationObserver(() => instance.value?.setTheme(currentTheme()))
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  instance.value?.unmount()
})
</script>

<template>
  <div class="dz-playground">
    <div v-if="state !== 'ready'" class="dz-playground__idle">
      <button
        v-if="state !== 'loading'"
        type="button"
        class="dz-playground__launch"
        @click="launch"
      >
        {{ state === 'error' ? 'Retry' : 'Launch editable playground' }}
      </button>
      <p v-else class="dz-playground__note">
        Loading the sandbox…
      </p>
      <p v-if="state === 'error'" class="dz-playground__error">
        {{ message }}
      </p>
      <p v-else-if="state === 'idle'" class="dz-playground__note">
        Loads a ~2&nbsp;MB sandbox on demand, so pages you only read cost nothing.
        Needs network access: the sandbox pulls Vue and the Tailwind browser
        compiler from jsDelivr.
      </p>
    </div>
    <p v-if="seed && state === 'ready'" class="dz-playground__note dz-playground__attribution">
      Running <code>{{ seed.storyName ?? seed.storyId }}</code> from
      <code>{{ seed.storyFile }}</code> lines {{ seed.storyLines[0] }}–{{ seed.storyLines[1] }}.
    </p>
    <div v-show="state === 'ready'" ref="host" class="dz-playground__host" />
  </div>
</template>

<style>
/*
 * Chrome only — the preview inside the sandbox is styled by the library's own
 * tokens, which is the point. Custom properties are VitePress's, because this
 * site still ships the stock theme (owner decision D1-D6, untouched here).
 */
.dz-playground {
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
}

.dz-playground__idle {
  padding: 20px;
  text-align: center;
}

.dz-playground__launch {
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: transparent;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.dz-playground__launch:hover {
  background: var(--vp-c-brand-soft);
}

.dz-playground__note {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.dz-playground__attribution {
  padding: 8px 12px;
  margin: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
}

.dz-playground__error {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--vp-c-danger-1);
}

.dz-playground__host {
  height: 460px;
}

.dz-playground__host .vue-repl {
  height: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .dz-playground .vue-repl * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
