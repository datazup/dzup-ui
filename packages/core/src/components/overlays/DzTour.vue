<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzTourProps, DzTourSlotProps, DzTourSlots, DzTourStep } from './DzTour.types.ts'
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useEscapeKey } from '../../composables/useEscapeKey/index.ts'
import { useFloating } from '../../composables/useFloating/index.ts'
import { useFocusTrap } from '../../composables/useFocusTrap/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzButton from '../buttons/DzButton.vue'
import { tourTokens } from './DzTour.tokens.ts'
import { tourVariants } from './DzTour.variants.ts'
/**
 * DzTour -- Step-by-step product walkthrough that spotlights target elements
 * and shows an anchored popover with title/description/controls.
 *
 * Built on the shared `useFloating` positioning primitive (ADR-07) so anchoring
 * and collision handling match DzPopover/DzTooltip. Open state and the active
 * step are controlled via defineModel (ADR-16).
 *
 * @example
 * ```vue
 * <DzTour
 *   v-model:open="open"
 *   v-model:current="step"
 *   :steps="[
 *     { target: '#create', title: 'Create', description: 'Start here.' },
 *     { target: '#share', title: 'Share', description: 'Invite teammates.' },
 *   ]"
 *   @finish="onFinish"
 * />
 * ```
 */

const props = withDefaults(defineProps<DzTourProps>(), {
  mask: true,
  scrollIntoView: true,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<{
  finish: []
  close: []
  change: [index: number]
}>()

const slots = defineSlots<DzTourSlots>()

const open = defineModel<boolean>('open', { default: false })
const current = defineModel<number>('current', { default: 0 })

const styles = tourVariants()

const autoId = useId()
const titleId = computed(() => `${props.id ?? autoId}-title`)
const descriptionId = computed(() => `${props.id ?? autoId}-description`)
const liveId = computed(() => `${props.id ?? autoId}-live`)

// ── Step resolution ────────────────────────────────────────────────────────

const total = computed(() => props.steps.length)

/** Clamp the model index into range so out-of-bounds values stay safe. */
const activeIndex = computed(() =>
  Math.min(Math.max(current.value, 0), Math.max(total.value - 1, 0)),
)

const activeStep = computed<DzTourStep | undefined>(() => props.steps[activeIndex.value])
const isFirst = computed(() => activeIndex.value <= 0)
const isLast = computed(() => activeIndex.value >= total.value - 1)

/** Resolve a step's target to a live element (selector | element | getter). */
function resolveTarget(step: DzTourStep | undefined): HTMLElement | null {
  if (!step || typeof document === 'undefined') return null
  const { target } = step
  if (typeof target === 'string') return document.querySelector<HTMLElement>(target)
  if (typeof target === 'function') return target()
  return target ?? null
}

// ── Positioning ────────────────────────────────────────────────────────────

const { referenceRef, floatingRef, floatingStyles, update } = useFloating({
  // Reactive getter so each step can anchor with its own placement.
  placement: () => activeStep.value?.placement ?? 'bottom',
  offset: tourTokens.mask.padding + 8,
})

/** Measured viewport rect of the active target for the spotlight cutout. */
const targetRect = ref<{ top: number, left: number, width: number, height: number } | null>(null)

/** Re-measure the active target and refresh the popover position. */
function measure(): void {
  const el = resolveTarget(activeStep.value)
  referenceRef.value = el
  if (el) {
    const rect = el.getBoundingClientRect()
    targetRect.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    }
  }
  else {
    targetRect.value = null
  }
  update()
}

/** Cutout box geometry, padded around the target rect (px, viewport-fixed). */
const cutoutStyle = computed<Record<string, string>>(() => {
  const rect = targetRect.value
  if (!rect) return { display: 'none' } as Record<string, string>
  const pad = tourTokens.mask.padding
  return {
    top: `${rect.top - pad}px`,
    left: `${rect.left - pad}px`,
    width: `${rect.width + pad * 2}px`,
    height: `${rect.height + pad * 2}px`,
  }
})

/** Fallback centered position used when a target cannot be resolved. */
const hasTarget = computed(() => targetRect.value !== null)
const panelStyle = computed<Record<string, string>>(() => {
  if (hasTarget.value) return floatingStyles.value
  return {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }
})

// ── Reduced motion + scrolling ──────────────────────────────────────────────

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollTargetIntoView(): void {
  if (!props.scrollIntoView) return
  const el = resolveTarget(activeStep.value)
  el?.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'center',
    inline: 'center',
  })
}

// ── Re-measure on resize / scroll ───────────────────────────────────────────

let resizeObserver: ResizeObserver | null = null

function handleViewportChange(): void {
  measure()
}

function startTracking(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('scroll', handleViewportChange, true)
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(handleViewportChange)
    const el = resolveTarget(activeStep.value)
    if (el) resizeObserver.observe(el)
  }
}

function stopTracking(): void {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
  resizeObserver?.disconnect()
  resizeObserver = null
}

// ── Focus trap + Escape ─────────────────────────────────────────────────────

const { activate, deactivate } = useFocusTrap(floatingRef)

useEscapeKey(() => close(), open)

// ── Controls ────────────────────────────────────────────────────────────────

function next(): void {
  if (isLast.value) {
    finish()
    return
  }
  current.value = activeIndex.value + 1
}

function prev(): void {
  if (isFirst.value) return
  current.value = activeIndex.value - 1
}

function finish(): void {
  emit('finish')
  open.value = false
}

function close(): void {
  emit('close')
  open.value = false
}

// ── Lifecycle wiring ────────────────────────────────────────────────────────

watch(activeIndex, (index) => {
  emit('change', index)
})

// Drive measurement, scrolling, tracking, and the focus trap from open + step.
// Immediate so a component mounted already-open is wired up correctly.
watch([open, activeIndex], async ([isOpen]) => {
  if (!isOpen) {
    deactivate()
    stopTracking()
    targetRect.value = null
    return
  }
  stopTracking()
  await nextTick()
  measure()
  scrollTargetIntoView()
  startTracking()
  activate()
}, { immediate: true })

onBeforeUnmount(() => {
  deactivate()
  stopTracking()
})

/** Slot props shared across default/footer/indicators slots. */
const slotProps = computed<DzTourSlotProps>(() => ({
  step: activeStep.value as DzTourStep,
  current: activeIndex.value,
  total: total.value,
  isFirst: isFirst.value,
  isLast: isLast.value,
  next,
  prev,
  finish,
  close,
}))

const panelClasses = computed(() => cn(styles.panel()))
</script>

<template>
  <Teleport v-if="open && activeStep" to="body">
    <!-- Spotlight mask (box-shadow cutout dims everything except the target) -->
    <div
      v-if="mask && targetRect"
      :class="styles.mask()"
      :style="cutoutStyle"
      aria-hidden="true"
      data-testid="dz-tour-mask"
    />

    <!-- Step popover -->
    <div
      ref="floatingRef"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="activeStep.title ? titleId : undefined"
      :aria-label="!activeStep.title ? ariaLabel : undefined"
      :aria-describedby="activeStep.description ? descriptionId : undefined"
      :class="panelClasses"
      :style="panelStyle"
      data-testid="dz-tour-panel"
      v-bind="$attrs"
    >
      <!-- Live region announcing step changes -->
      <div :id="liveId" :class="styles.liveRegion()" aria-live="polite" role="status">
        Step {{ activeIndex + 1 }} of {{ total }}
      </div>

      <!-- Body -->
      <slot v-bind="slotProps">
        <div :class="styles.header()">
          <p v-if="activeStep.title" :id="titleId" :class="styles.title()">
            {{ activeStep.title }}
          </p>
        </div>
        <p v-if="activeStep.description" :id="descriptionId" :class="styles.description()">
          {{ activeStep.description }}
        </p>
      </slot>

      <!-- Footer -->
      <slot name="footer" v-bind="slotProps">
        <div :class="styles.footer()">
          <!-- Indicators -->
          <slot name="indicators" v-bind="slotProps">
            <div :class="styles.indicators()" aria-hidden="true">
              <span
                v-for="(_, index) in steps"
                :key="index"
                :class="styles.dot({ active: index === activeIndex })"
              />
            </div>
          </slot>

          <!-- Controls -->
          <div :class="styles.controls()">
            <DzButton
              variant="ghost"
              tone="neutral"
              size="sm"
              data-testid="dz-tour-skip"
              @click="close"
            >
              Skip
            </DzButton>
            <DzButton
              v-if="!isFirst"
              variant="outline"
              tone="neutral"
              size="sm"
              data-testid="dz-tour-back"
              @click="prev"
            >
              Back
            </DzButton>
            <DzButton
              variant="solid"
              tone="primary"
              size="sm"
              data-testid="dz-tour-next"
              @click="next"
            >
              {{ isLast ? 'Finish' : 'Next' }}
            </DzButton>
          </div>
        </div>
      </slot>
    </div>
  </Teleport>
</template>
