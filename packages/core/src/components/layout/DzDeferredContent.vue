<script setup lang="ts">
import type {
  DzDeferredContentEmits,
  DzDeferredContentProps,
  DzDeferredContentSlots,
} from './DzDeferredContent.types.ts'
import { computed, onMounted, ref, toRef, useAttrs } from 'vue'
import { useIntersection } from '../../composables/useIntersection/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzSkeleton from '../feedback/DzSkeleton.vue'
import { deferredContentVariants } from './DzDeferredContent.variants.ts'

/**
 * DzDeferredContent — viewport-triggered lazy renderer.
 *
 * The default slot is mounted only once the wrapper scrolls into view (an
 * IntersectionObserver watches the root element). Until then a `placeholder`
 * slot — a DzSkeleton by default — reserves space, avoiding the mount cost of
 * below-the-fold widgets the user may never reach. `rootMargin` reveals content
 * early; `once` (default true) keeps it mounted after the first reveal, while
 * `once: false` re-defers it as it leaves view.
 *
 * Where `IntersectionObserver` is unavailable (SSR / old engines) the content
 * renders immediately, so it always reaches the user.
 *
 * Emits `load` exactly once (on the first reveal) and `reveal` on *every* mount
 * transition — so under `once: false`, `reveal` fires each time the content
 * re-mounts on re-entry, while `load` stays a once-only signal.
 *
 * @example
 * ```vue
 * <DzDeferredContent>
 *   <HeavyChart />
 *   <template #placeholder><DzSkeleton height="320px" /></template>
 * </DzDeferredContent>
 * ```
 */
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzDeferredContentProps>(), {
  rootMargin: '0px',
  threshold: 0,
  once: true,
  as: 'div',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzDeferredContentEmits>()
defineSlots<DzDeferredContentSlots>()

const attrs = useAttrs()

/** The observed wrapper element. */
const root = ref<HTMLElement | null>(null)

const { isSupported } = useIntersection({
  target: root,
  rootMargin: toRef(props, 'rootMargin'),
  threshold: toRef(props, 'threshold'),
  once: toRef(props, 'once'),
  onChange: handleChange,
})

// Without IntersectionObserver (SSR / old engines) there is nothing to observe,
// so render the content immediately — including during server render, where
// `onMounted` never runs.
const loaded = ref(!isSupported)
/** `load` is emitted exactly once, on the first reveal. */
let hasLoaded = false

/**
 * Mount the content, emitting `reveal` on every mount transition and `load`
 * only on the first one.
 */
function reveal(): void {
  loaded.value = true
  emit('reveal')
  if (!hasLoaded) {
    hasLoaded = true
    emit('load')
  }
}

/** React to the wrapper entering / leaving the viewport. */
function handleChange(isIntersecting: boolean): void {
  if (isIntersecting) {
    // Only react to a real mount transition so a repeated `isIntersecting`
    // tick can't emit a spurious `reveal`.
    if (!loaded.value)
      reveal()
  }
  else if (!props.once) {
    // Re-defer: unmount until the next entry (observer stays connected).
    loaded.value = false
  }
}

onMounted(() => {
  // Fallback path: announce the immediate render once mounted on the client.
  if (!isSupported)
    reveal()
})

const styles = computed(() => deferredContentVariants({ loaded: loaded.value }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

defineExpose({ loaded })
</script>

<template>
  <component
    :is="as"
    :id="id"
    ref="root"
    :class="rootClasses"
    :data-loaded="loaded ? '' : undefined"
    :aria-busy="loaded ? undefined : 'true'"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Deferred content: participates normally in tab / reading order. -->
    <slot v-if="loaded" />

    <!-- Placeholder: decorative; the default DzSkeleton is aria-hidden so it is
         never announced as loaded content. -->
    <slot v-else name="placeholder" :loaded="false">
      <DzSkeleton :class="styles.placeholder()" variant="rectangular" height="var(--dz-deferred-content-min-height)" />
    </slot>
  </component>
</template>
