<script setup lang="ts">
/**
 * DzThemeBuilder — TASK-N2-D3.
 *
 * Controls for every ThemeRecipeV1 axis, a live preview across representative
 * components, a shareable URL and two copy-paste consumer snippets.
 *
 * **Every theming operation is a call into `@dzup-ui/tokens`.** The recipe's
 * axes, their labels and their bounds are read from the package's own exported
 * constants (`THEME_RECIPE_PALETTES`, `THEME_RECIPE_DENSITIES`, …), so a new
 * font or a seventh palette appears in this UI without an edit here; validation
 * and normalisation go through `normalizeThemeRecipe`; the CSS variables and
 * the `data-*` attributes come from `applyThemeRecipe`; the URL is
 * `themeRecipeTo/FromUrl`. Nothing in this component computes a colour, a
 * spacing or a shadow. That is the task's stop condition, and `apps/landing`
 * already shipping a 1,570-line theme designer is the reason it is worth
 * stating twice.
 *
 * The preview is the same `@vue/repl` sandbox the component playgrounds use,
 * booted with `acceptThemeRecipe: true`, and re-themed by `postMessage` rather
 * than by re-creating the iframe — re-creating it would discard whatever the
 * visitor has typed, which is the one thing a playground must not do.
 */
import type { ThemeRecipeV1 } from '@dzup-ui/tokens'
import type { MountedRepl, PlaygroundSeeds } from '../playground.ts'
import {
  createDefaultThemeRecipe,
  createThemeRecipePreset,
  THEME_RECIPE_DENSITIES,
  THEME_RECIPE_DIRECTIONS,
  THEME_RECIPE_FONTS,
  THEME_RECIPE_MODES,
  THEME_RECIPE_MOTIONS,
  THEME_RECIPE_PALETTES,
  THEME_RECIPE_PRESETS,
} from '@dzup-ui/tokens'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import {
  currentTheme,
  loadSeeds,
  mountRepl,
  THEME_RECIPE_MESSAGE,
} from '../playground.ts'
import {
  consumerSnippets,
  recipeFromUrl,
  recipeToUrl,
  sandboxPayload,
  urlWithoutRecipe,
  validateRecipe,
} from '../theme-recipe-url.ts'

const FONT_IDS = Object.keys(THEME_RECIPE_FONTS) as Array<keyof typeof THEME_RECIPE_FONTS>
/** `custom` is a *result*, never a choice — it is what editing an axis produces. */
const SELECTABLE_PRESETS = THEME_RECIPE_PRESETS.filter(p => p !== 'custom')

const recipe = ref<ThemeRecipeV1>(createDefaultThemeRecipe())
const urlError = ref<{ code: string, message: string } | null>(null)
const seeds = ref<PlaygroundSeeds | null>(null)
const preview = ref<string>('')
const previewHost = ref<HTMLElement | null>(null)
const previewState = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const previewMessage = ref('')
const instance = shallowRef<MountedRepl | null>(null)
const copied = ref('')
const systemPrefersDark = ref(false)

const validation = computed(() => validateRecipe(recipe.value))
const snippets = computed(() => consumerSnippets(recipe.value, systemPrefersDark.value))
const shareUrl = computed(() =>
  typeof window === 'undefined' ? '' : recipeToUrl(window.location.href, recipe.value),
)
const representatives = computed(() => seeds.value?.representatives ?? [])

/** Any axis edit demotes the recipe to `custom` — the preset no longer describes it. */
function touched(): void {
  recipe.value.preset = 'custom'
}

/**
 * Read a control's value without `v-model`.
 *
 * **This is a bundle-size decision, and it was measured.** `v-model` on a
 * `<select>` or a numeric `<input>` pulls Vue's `vModelSelect` / `vModelText` /
 * `vModelDynamic` runtime directives into the module graph, and Rollup hoists
 * everything from `vue` into VitePress's shared `framework` chunk — the one
 * chunk every page of the site downloads. With `v-model` in this panel that
 * chunk measured **140,060 B**; without it, **111,886 B**. The panel itself is
 * lazily loaded, but the *directives it uses* are not, so 28,174 B would have
 * been charged to all 158 pages for a control surface that exists on one.
 *
 * An isolation build (a custom theme entry registering nothing) reproduced the
 * 111,886 B baseline exactly, which is what attributes the delta to these
 * bindings rather than to having a custom theme at all. §7 of the handoff.
 */
function numberFrom(event: Event): number {
  return Number((event.target as HTMLInputElement).value)
}

function valueFrom(event: Event): string {
  return (event.target as HTMLSelectElement).value
}

function applyPreset(id: string): void {
  if (id === 'custom')
    return
  recipe.value = createThemeRecipePreset(
    id as Exclude<(typeof THEME_RECIPE_PRESETS)[number], 'custom'>,
    { mode: recipe.value.mode, direction: recipe.value.direction, motion: recipe.value.motion },
  )
}

function reset(): void {
  recipe.value = createDefaultThemeRecipe()
  urlError.value = null
  if (typeof window !== 'undefined')
    window.history.replaceState(null, '', urlWithoutRecipe(window.location.href))
}

/** Push the recipe into the live sandbox without re-creating it. */
function pushToSandbox(): void {
  const frame = instance.value?.frame()
  if (!frame?.contentWindow || !validation.value.ok)
    return
  const payload = sandboxPayload(recipe.value, systemPrefersDark.value)
  frame.contentWindow.postMessage({ type: THEME_RECIPE_MESSAGE, ...payload }, '*')
}

async function launchPreview(): Promise<void> {
  if (previewState.value === 'loading' || previewState.value === 'ready')
    return
  previewState.value = 'loading'
  try {
    const loaded = seeds.value ?? (await loadSeeds())
    seeds.value = loaded
    if (preview.value === '')
      preview.value = loaded.representatives[0] ?? ''
    const seed = loaded.seeds[preview.value]
    if (seed === undefined)
      throw new Error(`no seed for ${preview.value}`)
    if (previewHost.value === null)
      throw new Error('preview host element vanished before mount')
    instance.value = await mountRepl({
      host: previewHost.value,
      code: seed.code,
      theme: currentTheme(),
      acceptThemeRecipe: true,
      layout: 'vertical',
    })
    previewState.value = 'ready'
    // The sandbox reports nothing when it is ready, so seed the theme on a short
    // delay and again on every change. Idempotent: the listener only sets
    // properties.
    window.setTimeout(pushToSandbox, 600)
    window.setTimeout(pushToSandbox, 1800)
  }
  catch (error) {
    previewMessage.value = error instanceof Error ? error.message : String(error)
    previewState.value = 'error'
  }
}

async function switchPreview(name: string): Promise<void> {
  preview.value = name
  if (previewState.value !== 'ready')
    return
  const seed = seeds.value?.seeds[name]
  if (seed === undefined || previewHost.value === null)
    return
  instance.value?.unmount()
  previewHost.value.innerHTML = ''
  instance.value = await mountRepl({
    host: previewHost.value,
    code: seed.code,
    theme: currentTheme(),
    acceptThemeRecipe: true,
    layout: 'vertical',
  })
  window.setTimeout(pushToSandbox, 600)
}

async function copy(kind: 'url' | 'css' | 'recipe'): Promise<void> {
  const text = kind === 'url' ? shareUrl.value : snippets.value[kind]
  try {
    await navigator.clipboard.writeText(text)
    copied.value = kind
    window.setTimeout(() => {
      copied.value = ''
    }, 1600)
  }
  catch {
    copied.value = ''
  }
}

onMounted(() => {
  systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  const restored = recipeFromUrl(window.location.href)
  recipe.value = restored.recipe
  urlError.value = restored.error ?? null
  void loadSeeds().then((loaded) => {
    seeds.value = loaded
    if (preview.value === '')
      preview.value = loaded.representatives[0] ?? ''
  }).catch(() => {})
})

onBeforeUnmount(() => instance.value?.unmount())

watch(recipe, () => {
  if (typeof window === 'undefined' || !validation.value.ok)
    return
  window.history.replaceState(null, '', recipeToUrl(window.location.href, recipe.value))
  pushToSandbox()
}, { deep: true })
</script>

<template>
  <div class="dz-tb">
    <p v-if="urlError" class="dz-tb__alert">
      <strong>This link's theme could not be read.</strong>
      <code>{{ urlError.code }}</code> — {{ urlError.message }}
      Showing the default theme instead; nothing was repaired, because repairing an
      invalid recipe would invent design intent the sender did not express.
    </p>
    <p v-if="!validation.ok" class="dz-tb__alert">
      <strong>Invalid recipe.</strong>
      <code>{{ validation.code }}</code> — {{ validation.message }}
    </p>

    <section class="dz-tb__controls">
      <div class="dz-tb__row">
        <label>Preset</label>
        <div class="dz-tb__presets">
          <button
            v-for="id in SELECTABLE_PRESETS"
            :key="id"
            type="button"
            class="dz-tb__chip"
            :class="{ 'is-on': recipe.preset === id }"
            @click="applyPreset(id)"
          >
            {{ id }}
          </button>
          <button type="button" class="dz-tb__chip" @click="reset">
            reset
          </button>
        </div>
      </div>

      <div class="dz-tb__row">
        <label>Palettes</label>
        <div class="dz-tb__palettes">
          <div v-for="name in THEME_RECIPE_PALETTES" :key="name" class="dz-tb__palette">
            <span class="dz-tb__palette-name">{{ name }}</span>
            <label class="dz-tb__mini">hue
              <input
                type="range" min="0" max="360" step="1"
                :value="recipe.palettes[name].hue"
                @input="recipe.palettes[name].hue = numberFrom($event); touched()"
              >
              <output>{{ recipe.palettes[name].hue }}</output>
            </label>
            <label class="dz-tb__mini">chroma
              <input
                type="range" min="0" max="0.4" step="0.002"
                :value="recipe.palettes[name].chroma"
                @input="recipe.palettes[name].chroma = numberFrom($event); touched()"
              >
              <output>{{ recipe.palettes[name].chroma.toFixed(3) }}</output>
            </label>
          </div>
        </div>
      </div>

      <div class="dz-tb__row">
        <label for="dz-tb-radius">Radius</label>
        <input
          id="dz-tb-radius" type="range" min="0" max="2" step="0.05"
          :value="recipe.radius"
          @input="recipe.radius = numberFrom($event); touched()"
        >
        <output>{{ recipe.radius.toFixed(2) }}×</output>
      </div>

      <div class="dz-tb__row">
        <label for="dz-tb-shadow">Shadow</label>
        <input
          id="dz-tb-shadow" type="range" min="0" max="2.5" step="0.05"
          :value="recipe.shadow"
          @input="recipe.shadow = numberFrom($event); touched()"
        >
        <output>{{ recipe.shadow.toFixed(2) }}×</output>
      </div>

      <div class="dz-tb__row">
        <label for="dz-tb-density">Density</label>
        <select id="dz-tb-density" :value="recipe.density" @change="recipe.density = valueFrom($event) as typeof recipe.density; touched()">
          <option v-for="d in THEME_RECIPE_DENSITIES" :key="d" :value="d">
            {{ d }}
          </option>
        </select>

        <label for="dz-tb-font">Font</label>
        <select id="dz-tb-font" :value="recipe.font" @change="recipe.font = valueFrom($event) as typeof recipe.font; touched()">
          <option v-for="f in FONT_IDS" :key="f" :value="f">
            {{ f }}
          </option>
        </select>
      </div>

      <div class="dz-tb__row">
        <label for="dz-tb-mode">Mode</label>
        <select id="dz-tb-mode" :value="recipe.mode" @change="recipe.mode = valueFrom($event) as typeof recipe.mode">
          <option v-for="m in THEME_RECIPE_MODES" :key="m" :value="m">
            {{ m }}
          </option>
        </select>

        <label for="dz-tb-dir">Direction</label>
        <select id="dz-tb-dir" :value="recipe.direction" @change="recipe.direction = valueFrom($event) as typeof recipe.direction">
          <option v-for="d in THEME_RECIPE_DIRECTIONS" :key="d" :value="d">
            {{ d }}
          </option>
        </select>

        <label for="dz-tb-motion">Motion</label>
        <select id="dz-tb-motion" :value="recipe.motion" @change="recipe.motion = valueFrom($event) as typeof recipe.motion">
          <option v-for="m in THEME_RECIPE_MOTIONS" :key="m" :value="m">
            {{ m }}
          </option>
        </select>
      </div>
    </section>

    <section class="dz-tb__preview">
      <div class="dz-tb__row">
        <label>Preview</label>
        <select
          v-if="representatives.length"
          :value="preview"
          @change="switchPreview(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="name in representatives" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
        <button
          v-if="previewState === 'idle' || previewState === 'error'"
          type="button" class="dz-tb__chip is-on" @click="launchPreview"
        >
          {{ previewState === 'error' ? 'Retry preview' : 'Start live preview' }}
        </button>
        <span v-else-if="previewState === 'loading'" class="dz-tb__note">
          loading sandbox…
        </span>
      </div>
      <p v-if="previewState === 'error'" class="dz-tb__alert">
        {{ previewMessage }}
      </p>
      <p v-else-if="previewState === 'idle'" class="dz-tb__note">
        The preview runs each component's real Storybook story inside a sandbox that
        loads ~2&nbsp;MB on demand and needs network access. One component at a time,
        switchable above — every one of them is story source, not a mock-up.
      </p>
      <div v-show="previewState === 'ready'" ref="previewHost" class="dz-tb__host" />
    </section>

    <section class="dz-tb__out">
      <div class="dz-tb__row">
        <label>Share</label>
        <input class="dz-tb__url" :value="shareUrl" readonly>
        <button type="button" class="dz-tb__chip" @click="copy('url')">
          {{ copied === 'url' ? 'copied' : 'copy link' }}
        </button>
      </div>
      <details>
        <summary>
          CSS custom properties
          <button type="button" class="dz-tb__chip" @click.prevent="copy('css')">
            {{ copied === 'css' ? 'copied' : 'copy' }}
          </button>
        </summary>
        <pre class="dz-tb__code">{{ snippets.css }}</pre>
      </details>
      <details>
        <summary>
          ThemeRecipe object
          <button type="button" class="dz-tb__chip" @click.prevent="copy('recipe')">
            {{ copied === 'recipe' ? 'copied' : 'copy' }}
          </button>
        </summary>
        <pre class="dz-tb__code">{{ snippets.recipe }}</pre>
      </details>
    </section>
  </div>
</template>

<style>
.dz-tb { margin: 24px 0; }
.dz-tb__controls,
.dz-tb__preview,
.dz-tb__out {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.dz-tb__row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 12px; }
.dz-tb__row > label { font-size: 13px; font-weight: 600; min-width: 76px; }
.dz-tb__presets { display: flex; flex-wrap: wrap; gap: 6px; }
.dz-tb__chip {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  color: inherit;
}
.dz-tb__chip.is-on { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.dz-tb__palettes { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 8px; flex: 1; }
.dz-tb__palette { border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 6px 10px; }
.dz-tb__palette-name { font-size: 12px; font-weight: 600; }
.dz-tb__mini { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--vp-c-text-2); }
.dz-tb__mini input { flex: 1; }
.dz-tb__mini output { min-width: 44px; text-align: right; font-variant-numeric: tabular-nums; }
.dz-tb__note { font-size: 13px; color: var(--vp-c-text-2); margin: 6px 0 0; line-height: 1.5; }
.dz-tb__alert {
  font-size: 13px;
  border-left: 3px solid var(--vp-c-danger-1);
  padding: 8px 12px;
  margin: 0 0 12px;
  background: var(--vp-c-danger-soft);
}
.dz-tb__host { height: 520px; }
.dz-tb__host .vue-repl { height: 100%; }
.dz-tb__url { flex: 1; min-width: 200px; font-size: 12px; padding: 4px 8px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: transparent; color: inherit; }
.dz-tb__code { max-height: 320px; overflow: auto; font-size: 12px; }
</style>
