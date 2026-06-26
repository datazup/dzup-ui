<script setup lang="ts">
import type {
  DzInfiniteScrollEmits,
  DzInfiniteScrollProps,
  DzInfiniteScrollSlots,
} from './DzInfiniteScroll.types.ts'
import { computed, ref, toRef, useAttrs } from 'vue'
import { useInfiniteScroll } from '../../composables/useInfiniteScroll/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzButton from '../buttons/DzButton.vue'
import DzSpinner from '../feedback/DzSpinner.vue'
import { infiniteScrollVariants } from './DzInfiniteScroll.variants.ts'

/**
 * DzInfiniteScroll — viewport-sentinel "load more" wrapper.
 *
 * Renders the already-paged items through the default slot and an
 * IntersectionObserver-driven sentinel beside them. As the sentinel scrolls
 * into view (`distance` px early) it emits `load-more`, guarded so it fires
 * once per intersection until the parent flips `loading` back off — then, if
 * the sentinel is still visible, the next page is requested automatically.
 *
 * Built-in loading / end / error states are overridable via slots; the error
 * state surfaces a `retry` handler (also exposed via template ref). `direction`
 * supports reverse/chat lists by paging towards the top.
 *
 * @example
 * ```vue
 * <DzInfiniteScroll :loading="loading" :has-more="hasMore" @load-more="fetchNext">
 *   <DzList :items="rows" />
 * </DzInfiniteScroll>
 * ```
 */
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzInfiniteScrollProps>(), {
  loading: false,
  hasMore: true,
  disabled: false,
  error: false,
  distance: 0,
  direction: 'down',
  size: 'md',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzInfiniteScrollEmits>()
defineSlots<DzInfiniteScrollSlots>()

const attrs = useAttrs()

/** The observed sentinel element. */
const sentinel = ref<HTMLElement | null>(null)

const { retry: retryLoad } = useInfiniteScroll({
  target: sentinel,
  loading: toRef(props, 'loading'),
  hasMore: toRef(props, 'hasMore'),
  // An error halts observation until the consumer retries, so fold it into the
  // disabled guard alongside the explicit `disabled` prop.
  disabled: computed(() => props.disabled || props.error),
  distance: toRef(props, 'distance'),
  direction: toRef(props, 'direction'),
  onLoadMore: () => emit('loadMore'),
})

/** Re-arm the loader and re-request the failed page. */
function retry(): void {
  emit('retry')
  retryLoad()
}

defineExpose({ retry })

const styles = computed(() =>
  infiniteScrollVariants({ size: props.size, direction: props.direction }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

/** Whether to render the sentinel at all (no point once exhausted/failed). */
const showSentinel = computed(() => props.hasMore && !props.disabled && !props.error)

/** Polite announcement of the current loading lifecycle. */
const announcement = computed(() => {
  if (props.error)
    return 'Failed to load more items'
  if (props.loading)
    return 'Loading more items'
  if (!props.hasMore)
    return 'End of results'
  return ''
})
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :data-size="size"
    :data-direction="direction"
    :data-disabled="disabled ? '' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Live region: announces loading / end / error transitions -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>

    <!-- Already-rendered items -->
    <div :class="styles.content()">
      <slot />
    </div>

    <!-- Error state (takes precedence; offers retry) -->
    <div
      v-if="error"
      :class="cn(styles.status(), styles.error())"
      role="alert"
    >
      <slot name="error" :retry="retry">
        <span>Couldn't load more items.</span>
        <DzButton variant="outline" size="sm" tone="danger" @click="retry">
          Retry
        </DzButton>
      </slot>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" :class="styles.status()">
      <slot name="loading">
        <DzSpinner :size="size" label="Loading more items" />
        <span>Loading more…</span>
      </slot>
    </div>

    <!-- End state (no more items) -->
    <div v-else-if="!hasMore" :class="styles.status()">
      <slot name="end">
        <span>You've reached the end.</span>
      </slot>
    </div>

    <!-- Sentinel: only mounted while more items can still be requested -->
    <div
      v-if="showSentinel"
      ref="sentinel"
      :class="styles.sentinel()"
      aria-hidden="true"
    />
  </div>
</template>
