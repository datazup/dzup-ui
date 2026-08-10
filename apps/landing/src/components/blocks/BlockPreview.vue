<script setup lang="ts">
import type { SegmentedItem } from '@dzup-ui/core'
import type { BlockDef } from '../../blocks/registry.ts'
import {
  DzButton,
  DzCodeBlock,
  DzCollapse,
  DzCopyButton,
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogTitle,
  DzHeading,
  DzIconButton,
  DzSegmented,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
  DzTooltip,
  DzTooltipContent,
  DzTooltipTrigger,
} from '@dzup-ui/core'
import {
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Maximize2,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { REGISTRY_ENABLED, v0OpenUrl } from '../../blocks/config.ts'
import { blockMarkdown, blockPrompt, LLMS_TXT } from '../../blocks/llmsText.ts'
import { blocksUsingComponent, CATEGORIES } from '../../blocks/registry.ts'
import { getBlockSource } from '../../blocks/sources.ts'
import { useBlockCodeView } from '../../composables/useBlockCodeView.ts'
import { useBlockTheme } from '../../composables/useBlockTheme.ts'
import { useTheme } from '../../composables/useTheme.ts'
import BlockManifest from './BlockManifest.vue'
import BlockTrustMarks from './BlockTrustMarks.vue'

/**
 * BlockPreview — the shared per-block shell (docs/blocks.md §3.2).
 *
 * Renders a header (title, description, viewport control, full-screen toggle)
 * over a DzTabs with two panels:
 *   • Preview — the live, interactive block in a bordered, resizable container
 *     whose max-width is driven by a DzSegmented viewport control, plus a
 *     per-preview light/dark control. By default the preview follows the global
 *     site theme; once the user picks the *opposite* of the global theme the
 *     preview is pinned to that override (re-picking the global value clears it,
 *     so it follows the site again). The override is scoped by setting
 *     `data-theme` on the preview stage ONLY — `[data-theme]` is a plain
 *     attribute selector in the tokens/landing CSS (not `:root`-scoped), so the
 *     `--dz-*`/`--lp-*` custom properties re-resolve for that subtree alone and
 *     never leak to the page or sibling previews.
 *   • Code — the block's exact `?raw` source in a scrollable DzCodeBlock, with a
 *     DzCopyButton that copies the source string verbatim.
 *
 * The full-screen DzIconButton opens the same live block in a full-width
 * DzDialog. The chrome is dogfooded entirely from @dzup-ui/core; the only CSS
 * here is layout (no color literals) per the token-only rule.
 */
const props = withDefaults(
  defineProps<{
    block: BlockDef
    /**
     * Semantic level for the block-title heading. 3 fits the /blocks index
     * (page h1 → category h2 → block h3); the block detail page passes 1
     * because the preview is that route's primary content and canonical title.
     * Visual size is unchanged.
     */
    headingLevel?: 1 | 2 | 3
    /**
     * Keep install/import commands in the Code tab by default. The detail route
     * places that manifest in its supporting section below the preview and turns
     * this off so setup information appears only once on the page.
     */
    showCodeManifest?: boolean
  }>(),
  { headingLevel: 3, showCodeManifest: true },
)

const emit = defineEmits<{
  /**
   * Request the index filter to all blocks using this `Dz*` component. The page
   * owns the single `useBlockSearch` filtering path (Task E3/E4); the preview
   * only surfaces the chips as a reverse-lookup affordance.
   */
  selectComponent: [name: string]
}>()

/** How many catalog blocks use `name` (memoized reverse index, Task E1). */
function usageCount(name: string): number {
  return blocksUsingComponent(name).length
}

/** Active tab — Preview by default; Code on demand. */
const tab = ref<'preview' | 'code'>('preview')

/**
 * Single source of truth for the preview width (docs §1.2 #5, Task F3). A number
 * is an explicit pixel width; `'full'` means "fill the container" (the Desktop
 * preset). BOTH the DzSegmented presets and the drag handle write here — they
 * never diverge. `'full'` is kept distinct from a pixel value so the preview
 * stays responsive at the Desktop preset instead of being pinned to whatever the
 * container measured once.
 */
const width = ref<number | 'full'>('full')

/** Smallest draggable width — a hair under the narrowest common phone. */
const MIN_WIDTH = 320

/** The DzSegmented presets, mapped to width values. */
const PRESET_WIDTHS = { mobile: 390, tablet: 768 } as const

/**
 * v-model proxy for the viewport DzSegmented. Reads the preset that matches the
 * current width (so the matching quick-set button highlights), or `''` when the
 * width was dragged to a custom value — DzSegmented simply highlights nothing,
 * which is the correct "custom" affordance. Writing a preset sets the one width
 * state.
 */
const viewport = computed<string>({
  get: () => {
    if (width.value === 'full')
      return 'desktop'
    if (width.value === PRESET_WIDTHS.mobile)
      return 'mobile'
    if (width.value === PRESET_WIDTHS.tablet)
      return 'tablet'
    return ''
  },
  set: (value) => {
    width.value
      = value === 'mobile' ? PRESET_WIDTHS.mobile : value === 'tablet' ? PRESET_WIDTHS.tablet : 'full'
  },
})

/** Resolved global site theme (the singleton drives <html data-theme>). */
const { resolved: globalTheme } = useTheme()

/**
 * Per-preview theme override (docs §1.2 #6). `null` = follow the global theme;
 * a concrete value pins this preview. Behaviour: *follows global until
 * overridden* — the segmented control reads the effective theme, and choosing a
 * value equal to the current global clears the override (so the preview tracks
 * the site again), while choosing the opposite pins it.
 */
const themeOverride = ref<'light' | 'dark' | null>(null)

/** Effective theme applied to this preview's stage only. */
const previewTheme = computed<'light' | 'dark'>(() => themeOverride.value ?? globalTheme.value)

/** Two-state light/dark control, matching the viewport segmented style. */
const themeItems: SegmentedItem[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

/** v-model proxy: writing the global value resets to "follow"; else override. */
const previewThemeModel = computed<string>({
  get: () => previewTheme.value,
  set: (value) => {
    themeOverride.value = value === globalTheme.value ? null : (value as 'light' | 'dark')
  },
})

/**
 * Per-preview text direction (docs §1.2 #3, §3.5, Task F2). Blocks are authored
 * LTR; flipping this to `rtl` lets developers verify a block mirrors correctly.
 * The change is scoped by binding `dir` on the preview stage ONLY — `dir` is
 * inherited down the subtree but never up to the page, so the surrounding
 * gallery and sibling previews stay LTR. (When Task F4 moves section-blocks into
 * an iframe, this same value should drive the iframe documentElement's `dir`.)
 */
const previewDir = ref('ltr')

/** Two-state direction control, matching the viewport/theme segmented style. */
const dirItems: SegmentedItem[] = [
  { value: 'ltr', label: 'LTR' },
  { value: 'rtl', label: 'RTL' },
]

/** Full-screen dialog open state. */
const fullscreen = ref(false)

/** Viewport options for the segmented control (docs §3.2: ~390 / ~768 / 100%). */
const viewports: SegmentedItem[] = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'desktop', label: 'Desktop' },
]

/** The scrollable stage; its content box is the resize ceiling. */
const stageEl = ref<HTMLElement | null>(null)
/** The resizable frame, measured to anchor the drag with no initial jump. */
const frameEl = ref<HTMLElement | null>(null)

/**
 * Container content width — the max the frame may take, tracked reactively so
 * the readout/aria-valuemax stay correct at `'full'` and across responsive
 * reflow. Driven by a ResizeObserver on the stage.
 */
const containerWidth = ref(0)

/** True while a pointer drag is in flight (disables the width transition). */
const dragging = ref(false)

/** The current rendered width in px — the live readout and aria-valuenow. */
const readoutWidth = computed(() =>
  width.value === 'full'
    ? containerWidth.value
    : Math.min(width.value, containerWidth.value || width.value),
)

/** Frame max-width: `'full'` fills the container, a number pins explicit px. */
const frameStyle = computed(() => ({
  'maxWidth': width.value === 'full' ? '100%' : `${width.value}px`,
  '--bp-preview-min-height-wide': props.block.previewMinHeight
    ? `${props.block.previewMinHeight.wide}px`
    : undefined,
  '--bp-preview-min-height-compact': props.block.previewMinHeight
    ? `${props.block.previewMinHeight.compact}px`
    : undefined,
}))

/** Measure the stage's content-box width (clientWidth minus horizontal padding). */
function availableWidth(): number {
  const el = stageEl.value
  if (!el)
    return MIN_WIDTH
  const styles = getComputedStyle(el)
  const padX = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight)
  return Math.max(MIN_WIDTH, el.clientWidth - padX)
}

/**
 * Write the one width state from a desired px value, clamped to
 * [MIN_WIDTH, container]. Snapping to `'full'` at the ceiling keeps the preview
 * responsive (rather than pinned to a stale measured px) once it's maxed out.
 */
function setWidth(px: number): void {
  const max = availableWidth()
  const clamped = Math.round(Math.max(MIN_WIDTH, Math.min(px, max)))
  width.value = clamped >= max ? 'full' : clamped
}

/* --- Pointer drag (rAF-batched for smoothness) --- */
let rafId = 0
let pendingX = 0
/** Offset between the pointer and the frame's true right edge at grab time. */
let dragOffset = 0

/**
 * The frame is centre-aligned in the stage, so its right edge sits at
 * `centre + width/2`; therefore `width = 2 × (pointerX − centre)`. We subtract
 * the grab offset so the handle doesn't jump under the cursor on grab.
 */
function widthFromPointer(clientX: number): number {
  const el = stageEl.value
  if (!el)
    return MIN_WIDTH
  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  return 2 * (clientX - dragOffset - centerX)
}

function onPointerMove(event: PointerEvent): void {
  pendingX = event.clientX
  if (rafId)
    return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    setWidth(widthFromPointer(pendingX))
  })
}

function onPointerUp(event: PointerEvent): void {
  dragging.value = false
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  const handle = event.currentTarget as HTMLElement | null
  handle?.releasePointerCapture?.(event.pointerId)
  handle?.removeEventListener('pointermove', onPointerMove)
  handle?.removeEventListener('pointerup', onPointerUp)
  handle?.removeEventListener('pointercancel', onPointerUp)
}

function onPointerDown(event: PointerEvent): void {
  if (event.pointerType === 'mouse' && event.button !== 0)
    return
  dragging.value = true
  const right = frameEl.value?.getBoundingClientRect().right
  dragOffset = right === undefined ? 0 : event.clientX - right
  const handle = event.currentTarget as HTMLElement
  handle.setPointerCapture?.(event.pointerId)
  handle.addEventListener('pointermove', onPointerMove)
  handle.addEventListener('pointerup', onPointerUp)
  handle.addEventListener('pointercancel', onPointerUp)
  event.preventDefault()
}

/** Keyboard resize: ±10px (±50px with Shift), Home/End to min/full. */
function onKeydown(event: KeyboardEvent): void {
  const step = event.shiftKey ? 50 : 10
  const current = readoutWidth.value
  let next: number
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      next = current - step
      break
    case 'ArrowRight':
    case 'ArrowUp':
      next = current + step
      break
    case 'Home':
      next = MIN_WIDTH
      break
    case 'End':
      next = availableWidth()
      break
    default:
      return
  }
  event.preventDefault()
  setWidth(next)
}

/** Set by `announceCopied` below; cleared here on unmount. */
let copyStatusTimer: ReturnType<typeof setTimeout> | undefined
let resizeObserver: ResizeObserver | null = null

/**
 * Secondary preview utilities stay visible on desktop, but collapse behind one
 * explicit control on narrow screens so the live block reaches the first
 * viewport. matchMedia keeps the breakpoint semantic in sync with the CSS and
 * resets to the appropriate default when the viewport crosses it.
 */
const PREVIEW_CONTROLS_QUERY = '(max-width: 560px)'
let previewControlsMedia
  = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(PREVIEW_CONTROLS_QUERY)
    : null
const previewControlsOpen = ref(!(previewControlsMedia?.matches ?? false))

function syncPreviewControls(event: MediaQueryList | MediaQueryListEvent): void {
  previewControlsOpen.value = !event.matches
}

onMounted(() => {
  containerWidth.value = availableWidth()
  if (stageEl.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      containerWidth.value = availableWidth()
    })
    resizeObserver.observe(stageEl.value)
  }
  previewControlsMedia?.addEventListener('change', syncPreviewControls)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  previewControlsMedia?.removeEventListener('change', syncPreviewControls)
  previewControlsMedia = null
  if (rafId)
    cancelAnimationFrame(rafId)
  if (copyStatusTimer !== undefined)
    clearTimeout(copyStatusTimer)
})

/** Stable ids so the regions/dialog have accessible names. */
const titleId = computed(() => `block-${props.block.id}-title`)
const dialogTitleId = computed(() => `block-${props.block.id}-fs-title`)
const controlsId = computed(() => `block-${props.block.id}-preview-controls`)

/**
 * URL of the standalone, chrome-free render of this block (docs/blocks.md §3.5),
 * carrying the inspector's current state so the new tab opens looking exactly
 * like the in-gallery preview: the effective theme and direction always, plus the
 * pinned pixel width when the viewport is constrained (omitted at `'full'`, so the
 * standalone fills the viewport instead of being pinned to a stale measured px).
 * The param contract is theme=light|dark, dir=ltr|rtl, w=<px> — see
 * BlockPreviewPage.vue.
 */
const previewUrl = computed(() => {
  const params = new URLSearchParams({ theme: previewTheme.value, dir: previewDir.value })
  if (width.value !== 'full')
    params.set('w', String(width.value))
  return `/blocks/preview/${props.block.id}?${params.toString()}`
})

/** Open the standalone preview in a new tab; `noopener` severs the opener ref. */
function openInNewTab(): void {
  if (typeof window !== 'undefined')
    window.open(previewUrl.value, '_blank', 'noopener')
}

/**
 * "Open in v0" handoff URL (docs/blocks.md §1.2 #10, §1.3, Task G4) — hands this
 * block's registry item JSON to v0 for AI remixing with the `--dz-*` tokens
 * preloaded. Empty until the registry exists AND a registry host resolves, so
 * the action below can hide rather than link to a dead URL: it is gated on the
 * SAME `REGISTRY_ENABLED` flag as the Task F6 `npx shadcn-vue add …` line, plus
 * a resolvable host (`v0Url` non-empty), since v0 fetches the JSON from its own
 * servers and needs an absolute, public URL.
 */
const v0Url = computed(() => v0OpenUrl(props.block.id))

/** Hand the block's registry item to v0 in a new tab; `noopener` severs the opener ref. */
function openInV0(): void {
  if (typeof window !== 'undefined' && v0Url.value)
    window.open(v0Url.value, '_blank', 'noopener')
}

/**
 * "Copy as markdown" payload (docs/blocks.md §1.3, §3.2 #10, Task G3). Built from
 * the SAME `blockMarkdown` shaper the build runs to emit `public/r/<id>.md`
 * (scripts/build-registry.ts), over the SAME `block` + `CATEGORIES` inputs — so
 * the copied text is byte-for-byte identical to the served `.md` and the two can
 * never drift. The single source of that markdown lives in `blocks/llmsText.ts`.
 */
const markdownPayload = computed(() =>
  blockMarkdown(props.block, CATEGORIES, b => getBlockSource(b.path)),
)

/**
 * Absolute URL of the catalog's AI-docs index, resolved against the live origin
 * so a pasted prompt points an assistant at *this* deployment's `/llms.txt`.
 * Empty origin during SSR/prerender — harmless, the value is only read on click.
 */
const llmsTxtUrl = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/${LLMS_TXT}`
})

/**
 * "Copy as prompt" payload — a ready-made instruction that references `llms.txt`
 * and restates this block's title/description/components (shared `blockPrompt`
 * shaper, so the wording stays in one place). Paste straight into Cursor/Claude/
 * ChatGPT to regenerate the block.
 */
const promptPayload = computed(() => blockPrompt(props.block, llmsTxtUrl.value))

/**
 * Live-region message announced after a copy. DzCopyButton already flips its icon
 * to a check and its tone to success (visual confirmation); this adds an explicit,
 * distinct spoken confirmation per action — the icon-only buttons would otherwise
 * sound identical. Cleared shortly after so the region can re-announce a repeat.
 */
const copyStatus = ref('')
function announceCopied(what: string): void {
  copyStatus.value = `Copied ${what} to clipboard`
  if (copyStatusTimer !== undefined)
    clearTimeout(copyStatusTimer)
  copyStatusTimer = setTimeout(() => {
    copyStatus.value = ''
  }, 2000)
}

/**
 * Code-tab variants (docs/blocks.md §3.2). All four shapes — Full SFC vs
 * Template-only, TS vs JS — plus the consumer import line are derived
 * deterministically from the one canonical `?raw` source (and `components[]`)
 * at runtime, so there is no second copy of the code and zero drift. The Copy
 * button copies whatever `codeView.code` currently resolves to.
 */
const codeView = useBlockCodeView(
  () => getBlockSource(props.block.path),
  () => props.block.components,
)
const { code: shownCode, language: codeLanguage } = codeView

/**
 * Live token overrides from the global theme editor (docs/blocks.md §3.4). The
 * SAME store drives both halves of the single-source guarantee:
 *   • `themeVars` binds as an inline `:style` on the preview stage(s) below, so
 *     the brand/radius/density overrides cascade into the block subtree and
 *     re-resolve its `--dz-*` tokens — scoped to the stage, never the chrome.
 *   • `themeCssBlock` is the SAME overrides serialised as a `:root{}` block,
 *     prepended to the shown/copied code so a paste renders identically.
 * With every control at its default both are empty, so the copy stays byte-for-
 * byte the block's raw source (the Task F5 guarantee).
 */
const { vars: themeVars, themeCssBlock } = useBlockTheme()

/**
 * The code shown in the Code tab AND copied by the button — one value, so what a
 * visitor reads is exactly what they paste. When the editor is themed it leads
 * with the `:root{}` overrides; otherwise it is the untouched source.
 */
const themedCode = computed(() =>
  themeCssBlock.value ? `${themeCssBlock.value}\n\n${shownCode.value}` : shownCode.value,
)

/** Full-SFC ↔ template-only toggle. */
const formatItems: SegmentedItem[] = [
  { value: 'sfc', label: 'SFC' },
  { value: 'template', label: 'Template' },
]
/** TS ↔ derived-JS toggle; only meaningful for the SFC format. */
const langItems: SegmentedItem[] = [
  { value: 'ts', label: 'TS' },
  { value: 'js', label: 'JS' },
]
/** String-typed v-model proxies for the two DzSegmented controls (model is `string`). */
const formatModel = computed<string>({
  get: () => codeView.format.value,
  set: (value) => {
    codeView.format.value = value === 'template' ? 'template' : 'sfc'
  },
})
const langModel = computed<string>({
  get: () => codeView.lang.value,
  set: (value) => {
    codeView.lang.value = value === 'js' ? 'js' : 'ts'
  },
})
</script>

<template>
  <section :id="block.id" class="block-preview" :aria-labelledby="titleId">
    <!-- Header: title + description, viewport control, full-screen toggle. -->
    <header class="bp-head">
      <div class="bp-head-text">
        <DzHeading :id="titleId" :level="headingLevel" size="md" weight="semibold" class="bp-title">
          {{ block.title }}
        </DzHeading>
        <DzText size="sm" tone="muted" as="p" class="bp-desc">
          {{ block.description }}
        </DzText>
        <ul
          class="bp-chips"
          :aria-label="`Built from ${block.components.length} ${block.components.length === 1 ? 'component' : 'components'}`"
        >
          <li v-for="name in block.components" :key="name">
            <button
              type="button"
              class="bp-chip"
              :aria-label="`Show ${usageCount(name)} ${usageCount(name) === 1 ? 'block' : 'blocks'} using ${name}`"
              @click="emit('selectComponent', name)"
            >
              <span class="bp-chip-name">{{ name }}</span>
              <span class="bp-chip-count" aria-hidden="true">{{ usageCount(name) }}</span>
            </button>
          </li>
        </ul>
        <!-- Earned trust marks (Task I3, docs §3.6): each badge maps 1:1 to a
             guarantee the per-block axe suite proves; renders nothing for a block
             with known a11y debt rather than claim a mark the CI can't back. -->
        <BlockTrustMarks :block-id="block.id" class="bp-marks" />
      </div>

      <div class="bp-controls-wrap">
        <DzButton
          variant="outline"
          tone="neutral"
          size="sm"
          class="bp-controls-toggle"
          :aria-expanded="previewControlsOpen"
          :aria-controls="controlsId"
          @click="previewControlsOpen = !previewControlsOpen"
        >
          <template #prefix>
            <SlidersHorizontal :size="16" aria-hidden="true" />
          </template>
          Preview settings
          <template #suffix>
            <ChevronDown
              :size="16"
              aria-hidden="true"
              class="bp-controls-chevron"
              :class="{ 'is-open': previewControlsOpen }"
            />
          </template>
        </DzButton>

        <DzCollapse :id="controlsId" v-model="previewControlsOpen" class="bp-controls-collapse">
          <div class="bp-head-controls">
            <!-- Group 1 — "how the preview renders". Kept in one non-wrapping
                 cluster so the three segmented controls break to a new line
                 together instead of stranding one of them beside an action
                 button; the whole group hides on the Code tab. -->
            <div v-show="tab === 'preview'" class="bp-control-group bp-control-group--render">
              <DzSegmented
                v-model="viewport"
                :items="viewports"
                size="sm"
                aria-label="Preview width"
                class="bp-viewport"
              />
              <!-- Always-on width readout (the live value also lives on the drag
                   handle as aria-valuenow). aria-hidden: it mirrors the handle. -->
              <span class="bp-width-readout" aria-hidden="true"> {{ readoutWidth }}px </span>
              <DzSegmented
                v-model="previewThemeModel"
                :items="themeItems"
                size="sm"
                aria-label="Preview theme"
                class="bp-theme"
              />
              <DzSegmented
                v-model="previewDir"
                :items="dirItems"
                size="sm"
                aria-label="Text direction"
                class="bp-dir"
              />
            </div>

            <!-- Group 2 — "what I do with the block". Always present (these
                 actions are meaningful on both tabs), so on the Code tab the
                 header collapses to this single tidy cluster. -->
            <div
              class="bp-control-group bp-control-group--actions"
              :data-leading="tab === 'code' || undefined"
            >
              <!-- Copy-for-AI actions: the block as a markdown doc (byte-identical to
                 the generated /r/<id>.md) and as a ready-to-paste prompt. Both reuse
                 DzCopyButton, so the copied-checkmark + success-tone feedback comes
                 for free; the icon slot keeps each action's glyph while still flipping
                 to a check on copy. The bp-copy-status live region adds a distinct
                 spoken confirmation (the icon-only buttons would sound identical). -->
              <DzTooltip>
                <DzTooltipTrigger as-child>
                  <DzCopyButton
                    :value="markdownPayload"
                    aria-label="Copy block as markdown"
                    variant="outline"
                    tone="neutral"
                    size="sm"
                    @copied="announceCopied('markdown')"
                  >
                    <template #icon="{ copied }">
                      <Check v-if="copied" :size="16" aria-hidden="true" />
                      <FileText v-else :size="16" aria-hidden="true" />
                    </template>
                  </DzCopyButton>
                </DzTooltipTrigger>
                <DzTooltipContent>Copy as markdown</DzTooltipContent>
              </DzTooltip>
              <DzTooltip>
                <DzTooltipTrigger as-child>
                  <DzCopyButton
                    :value="promptPayload"
                    aria-label="Copy block as AI prompt"
                    variant="outline"
                    tone="neutral"
                    size="sm"
                    @copied="announceCopied('AI prompt')"
                  >
                    <template #icon="{ copied }">
                      <Check v-if="copied" :size="16" aria-hidden="true" />
                      <Sparkles v-else :size="16" aria-hidden="true" />
                    </template>
                  </DzCopyButton>
                </DzTooltipTrigger>
                <DzTooltipContent>Copy as AI prompt</DzTooltipContent>
              </DzTooltip>
              <span class="bp-copy-status" role="status" aria-live="polite">{{ copyStatus }}</span>
              <!-- "Open in v0" handoff (Task G4): remix this block in v0 with the
                 registry item JSON + `--dz-*` tokens preloaded. Gated on the same
                 REGISTRY_ENABLED flag as the F6 `shadcn-vue add` line, plus a
                 resolvable registry host (`v0Url`), so it never renders a dead link.
                 `window.open(..., 'noopener')` severs the opener ref (rel=noopener). -->
              <DzTooltip v-if="REGISTRY_ENABLED && v0Url">
                <DzTooltipTrigger as-child>
                  <DzIconButton
                    :icon="Wand2"
                    aria-label="Open in v0"
                    variant="outline"
                    tone="neutral"
                    size="sm"
                    @click="openInV0"
                  />
                </DzTooltipTrigger>
                <DzTooltipContent>Open in v0</DzTooltipContent>
              </DzTooltip>
              <DzTooltip>
                <DzTooltipTrigger as-child>
                  <DzIconButton
                    :icon="ExternalLink"
                    aria-label="Open preview in new tab"
                    variant="outline"
                    tone="neutral"
                    size="sm"
                    @click="openInNewTab"
                  />
                </DzTooltipTrigger>
                <DzTooltipContent>Open in a new tab</DzTooltipContent>
              </DzTooltip>
              <DzTooltip>
                <DzTooltipTrigger as-child>
                  <DzIconButton
                    :icon="Maximize2"
                    aria-label="Open preview full screen"
                    variant="outline"
                    tone="neutral"
                    size="sm"
                    @click="fullscreen = true"
                  />
                </DzTooltipTrigger>
                <DzTooltipContent>Full screen</DzTooltipContent>
              </DzTooltip>
            </div>
          </div>
        </DzCollapse>
      </div>
    </header>

    <!-- Preview / Code tabs. -->
    <DzTabs v-model="tab" variant="line" class="bp-tabs">
      <DzTabList class="bp-tablist">
        <DzTabTrigger value="preview">
          Preview
        </DzTabTrigger>
        <DzTabTrigger value="code">
          Code
        </DzTabTrigger>
      </DzTabList>

      <!-- Live, interactive, resizable preview. -->
      <DzTabContent value="preview" class="bp-panel">
        <!-- `data-theme` here scopes the override to this stage only (attribute
             selector → only this subtree's --dz-*/--lp-* tokens re-resolve). -->
        <div
          ref="stageEl"
          class="bp-stage"
          :data-theme="previewTheme"
          :dir="previewDir"
          :style="themeVars"
        >
          <div
            ref="frameEl"
            class="bp-frame"
            :style="frameStyle"
            :data-dragging="dragging || undefined"
          >
            <component :is="block.component" />
            <!-- Draggable + keyboard-operable width handle on the frame's right
                 edge. role="separator" with the live width as aria-valuenow so AT
                 announces the resize; presets and drag both write `width`. -->
            <div
              class="bp-resize-handle"
              role="separator"
              aria-orientation="vertical"
              :aria-label="`Resize preview width, currently ${readoutWidth} pixels`"
              :aria-valuenow="readoutWidth"
              :aria-valuemin="MIN_WIDTH"
              :aria-valuemax="containerWidth"
              tabindex="0"
              :data-dragging="dragging || undefined"
              @pointerdown="onPointerDown"
              @keydown="onKeydown"
            >
              <span class="bp-resize-readout" aria-hidden="true">{{ readoutWidth }}px</span>
              <span class="bp-resize-grip" aria-hidden="true" />
            </div>
          </div>
        </div>
      </DzTabContent>

      <!-- Source + copy, with Full-SFC↔Template and TS↔JS toggles. Every variant
           derives from the one ?raw source at runtime (useBlockCodeView) — no
           second source of truth. Copy copies the currently-shown variant. -->
      <DzTabContent value="code" class="bp-panel">
        <!-- Dependency manifest: import + install command(s). Chips are hidden
             here (`:show-components="false"`) because the header already carries
             the reverse-lookup chips — no need to repeat them in the same view. -->
        <BlockManifest
          v-if="showCodeManifest"
          :block="block"
          :show-components="false"
          class="bp-manifest"
          @select-component="emit('selectComponent', $event)"
        />
        <div class="bp-code-toolbar">
          <div class="bp-code-toggles">
            <DzSegmented
              v-model="formatModel"
              :items="formatItems"
              size="sm"
              aria-label="Code format"
              class="bp-code-seg"
            />
            <DzSegmented
              v-model="langModel"
              :items="langItems"
              size="sm"
              aria-label="Code language"
              :disabled="codeView.format.value === 'template'"
              class="bp-code-seg"
            />
          </div>
          <DzCopyButton
            :value="themedCode"
            aria-label="Copy the code shown below"
            label="Copy"
            copied-label="Copied"
            variant="outline"
            tone="neutral"
            size="sm"
          />
        </div>
        <DzCodeBlock
          :code="themedCode"
          :language="codeLanguage"
          :copyable="false"
          max-height="520px"
          :aria-label="`${block.title} source`"
          class="bp-code"
        />
      </DzTabContent>
    </DzTabs>

    <!-- Full-screen live preview. -->
    <DzDialog v-model:open="fullscreen">
      <DzDialogContent size="full" scrollable :aria-labelledby="dialogTitleId">
        <template #header>
          <DzDialogTitle :id="dialogTitleId">
            {{ block.title }}
          </DzDialogTitle>
          <DzDialogClose />
        </template>
        <!-- Fullscreen honours the same per-preview override so the blown-up
             view matches what the user is inspecting. -->
        <div class="bp-fs-stage" :data-theme="previewTheme" :dir="previewDir" :style="themeVars">
          <component :is="block.component" />
        </div>
      </DzDialogContent>
    </DzDialog>
  </section>
</template>

<style scoped>
/* "Window frame" treatment, consistent with ShowcaseDashboard / BlocksIndexPage. */
.block-preview {
  scroll-margin-top: 124px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #fff);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
  overflow: hidden;
}

.bp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  border-bottom: 1px solid var(--lp-hairline);
}

.bp-head-text {
  min-width: 0;
  /* The controls now own a full-width row of their own (see
     `.bp-controls-wrap`), so the text column simply takes the whole line. */
  flex: 1 1 100%;
}

.bp-title {
  margin: 0 0 2px;
}

.bp-desc {
  margin: 0;
  line-height: 1.5;
}

.bp-marks {
  margin-top: 10px;
}

/* "Built from" component chips — same token treatment as BlockCard. */
.bp-chips {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bp-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  padding: 2px 9px;
  border: 0;
  border-radius: var(--dz-radius-full, 9999px);
  cursor: pointer;
  /* Same category-accent tint as BlockCard's chips (`--lp-cat-500` inherited
     from the panel), legible in light and dark; primary is the fallback. */
  background: color-mix(
    in oklch,
    var(--lp-cat-500, var(--dz-primary, #4f46e5)) 13%,
    var(--dz-surface, #fff)
  );
  color: color-mix(
    in oklch,
    var(--lp-cat-500, var(--dz-primary, #4f46e5)) 62%,
    var(--dz-foreground, #1a202c)
  );
  transition: background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.bp-chip:hover {
  background: color-mix(
    in oklch,
    var(--lp-cat-500, var(--dz-primary, #4f46e5)) 22%,
    var(--dz-surface, #fff)
  );
}

.bp-chip:focus-visible {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #4f46e5));
  outline-offset: 2px;
}

/* Usage count — subtle "used in N blocks" hint, quieter than the name. */
.bp-chip-count {
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
}

.bp-controls-wrap {
  min-width: 0;
  /* The two clusters need ~670px together — more than is left beside a title
     and description in a 1078px header, so squeezing them onto that line only
     produced the ragged wrap this replaces. They get their own full-width row,
     which is stable at every viewport and reads as a real toolbar. */
  flex: 1 1 100%;
  padding-top: 14px;
  margin-top: 2px;
  border-top: 1px solid var(--lp-hairline);
}

.bp-controls-toggle {
  display: none;
}

.bp-controls-collapse {
  width: 100%;
}

.bp-head-controls {
  display: flex;
  align-items: center;
  /* Render settings read left-to-right from the start of the row; the actions
     cluster is pushed to the trailing edge (see `--actions`). */
  justify-content: flex-start;
  gap: 10px 16px;
  width: 100%;
  flex-wrap: wrap;
}

/* Two clusters — render settings and actions. Each is `nowrap` so a group
   moves to the next line as a unit; previously all 8 controls were siblings in
   one wrapping row, which stranded 2 icon buttons on a ragged second line at
   both 1440px and 1280px. */
.bp-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

/* A hairline rule reads the two clusters apart without adding chrome. It is
   decorative, so it hangs off the actions group rather than an extra element,
   and is dropped once the groups stack. */
.bp-control-group--actions {
  /* Sit at the trailing edge of the toolbar row, opposite the render settings.
     `auto` collapses to 0 once the groups wrap, so the actions stay left-
     aligned under the settings instead of drifting to a lonely right edge. */
  margin-inline-start: auto;
  padding-inline-start: 16px;
  border-inline-start: 1px solid var(--lp-hairline);
}

/* On the Code tab the render group is hidden, leaving the actions cluster
   alone — the divider would then float with nothing before it. */
.bp-control-group--actions[data-leading] {
  padding-inline-start: 0;
  border-inline-start: 0;
}

.bp-controls-chevron {
  transition: transform var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.bp-controls-chevron.is-open {
  transform: rotate(180deg);
}

/* Visually-hidden live region for the copy-action success announcement. */
.bp-copy-status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Persistent width readout in the header, tabular so it doesn't jitter. */
.bp-width-readout {
  min-width: 6ch;
  text-align: right;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--dz-foreground-muted, var(--dz-foreground, #1a202c));
}

.bp-tabs {
  display: block;
}

.bp-tablist {
  padding: 0 20px;
  border-bottom: 1px solid var(--lp-hairline);
}

.bp-panel {
  padding: 0;
}

/* Contain a resized/overflowing block so it never breaks the page layout. */
.bp-stage {
  padding: 24px;
  overflow: auto;
  /* A faint corner wash in the category accent so each preview's stage hints at
     its group's colour without competing with the live block on top. */
  background:
    radial-gradient(
      circle at 0% 0%,
      color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #6366f1)) 6%, transparent),
      transparent 42%
    ),
    var(--dz-background, #fff);
}

/* The resizable container — width driven by the presets + drag handle. */
.bp-frame {
  position: relative;
  width: 100%;
  min-height: var(--bp-preview-min-height-wide, 0);
  margin: 0 auto;
  transition: max-width var(--dz-transition-base, 250ms) ease;
}

@media (max-width: 768px) {
  .bp-frame {
    min-height: var(--bp-preview-min-height-compact, var(--bp-preview-min-height-wide, 0));
  }
}

/* While dragging, track the pointer 1:1 — no easing lag. */
.bp-frame[data-dragging] {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .bp-controls-chevron,
  .bp-frame {
    transition: none;
  }
}

/* Drag handle pinned to the frame's right edge; keyboard-focusable. */
.bp-resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  /* Pull half-width outward so the grip straddles the edge without widening the
     frame's content box (the stage clips any overflow). */
  margin-right: -8px;
  cursor: ew-resize;
  touch-action: none;
  color: var(--dz-foreground, #1a202c);
}

/* The visible grab bar. */
.bp-resize-grip {
  width: 4px;
  height: clamp(28px, 14%, 56px);
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--lp-hairline);
  transition: background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.bp-resize-handle:hover .bp-resize-grip,
.bp-resize-handle[data-dragging] .bp-resize-grip {
  background: var(--dz-primary, #4f46e5);
}

.bp-resize-handle:focus-visible {
  outline: none;
}

.bp-resize-handle:focus-visible .bp-resize-grip {
  background: var(--dz-primary, #4f46e5);
  outline: 2px solid var(--dz-ring, #4f46e5);
  outline-offset: 2px;
}

/* Live "<n>px" readout floating above the handle; emphasised while active. */
.bp-resize-readout {
  position: absolute;
  bottom: calc(100% + 4px);
  right: 0;
  padding: 2px 6px;
  border-radius: var(--dz-radius-sm, 0.375rem);
  background: var(--dz-surface, #fff);
  border: 1px solid var(--lp-hairline);
  box-shadow: var(--lp-shadow-sm);
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--dz-foreground-muted, var(--dz-foreground, #1a202c));
  white-space: nowrap;
  opacity: 0;
  transition: opacity var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.bp-resize-handle:hover .bp-resize-readout,
.bp-resize-handle:focus-visible .bp-resize-readout,
.bp-resize-handle[data-dragging] .bp-resize-readout {
  opacity: 1;
  color: var(--dz-foreground, #1a202c);
}

@media (prefers-reduced-motion: reduce) {
  .bp-resize-grip,
  .bp-resize-readout {
    transition: none;
  }
}

.bp-code-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 20px 0;
}

/* Format + language segmented controls, grouped on the toolbar's leading edge. */
.bp-code-toggles {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.bp-code {
  margin: 12px 20px 20px;
}

/* Dependency manifest at the top of the Code tab — fenced from the source below. */
.bp-manifest {
  padding: 16px 20px;
  border-bottom: 1px solid var(--lp-hairline);
}

.bp-fs-stage {
  padding: clamp(16px, 3vw, 32px);
}

@media (max-width: 560px) {
  .bp-head {
    flex-direction: column;
    align-items: stretch;
  }

  .bp-controls-wrap {
    width: 100%;
    flex: 0 1 auto;
  }

  .bp-controls-toggle {
    display: inline-flex;
    width: 100%;
    justify-content: space-between;
  }

  .bp-controls-collapse[data-state='open'] .bp-head-controls {
    padding-top: var(--dz-space-3, 0.75rem);
  }

  .bp-head-controls {
    justify-content: flex-start;
  }

  .bp-viewport {
    flex: 1 1 100%;
  }

  .bp-theme,
  .bp-dir {
    flex: 1 1 calc(50% - var(--dz-space-2, 0.5rem));
  }
}
</style>
