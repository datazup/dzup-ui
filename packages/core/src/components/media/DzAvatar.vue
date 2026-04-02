<script setup lang="ts">
import type { DzAvatarEmits, DzAvatarProps, DzAvatarSlots } from './DzAvatar.types.ts'
/**
 * DzAvatar — User avatar component with image and fallback support.
 *
 * Displays an image when `src` is provided; falls back to initials or
 * custom slot content when the image is unavailable or fails to load.
 *
 * @example
 * ```vue
 * <DzAvatar src="/user.jpg" alt="Jane Doe" />
 * <DzAvatar fallback="JD" size="lg" />
 * <DzAvatar shape="square">
 *   <UserIcon />
 * </DzAvatar>
 * ```
 */
import { computed, inject, ref, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_AVATAR_GROUP_KEY } from './DzAvatar.types.ts'
import { avatarVariants } from './DzAvatar.variants.ts'

const props = withDefaults(defineProps<DzAvatarProps>(), {
  size: undefined,
  shape: 'circle',
})

const emit = defineEmits<DzAvatarEmits>()
defineSlots<DzAvatarSlots>()

const attrs = useAttrs()
const groupContext = inject(DZ_AVATAR_GROUP_KEY, null)

/** Whether the image has failed to load */
const imageError = ref(false)

/** Resolved size: prop wins, then group context, then default */
const resolvedSize = computed(() => props.size ?? groupContext?.size.value ?? 'md')

/** Whether to show the image */
const showImage = computed(() => !!props.src && !imageError.value)

const classes = computed(() =>
  cn(
    avatarVariants({ size: resolvedSize.value, shape: props.shape }),
    attrs.class as string | undefined,
  ),
)

function handleImageError(event: Event): void {
  imageError.value = true
  emit('error', event)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <span
    :id="id"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    role="img"
    :data-state="showImage ? 'image' : 'fallback'"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Image -->
    <img
      v-if="showImage"
      :src="src"
      :alt="alt ?? ''"
      class="h-full w-full object-cover"
      @error="handleImageError"
    >

    <!-- Fallback content -->
    <template v-else>
      <slot>
        <span aria-hidden="true">{{ fallback }}</span>
      </slot>
    </template>
  </span>
</template>
