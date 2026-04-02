<script setup lang="ts">
import type { DzAvatarGroupContext } from './DzAvatar.types.ts'
import type { DzAvatarGroupProps, DzAvatarGroupSlots } from './DzAvatarGroup.types.ts'
/**
 * DzAvatarGroup — Stacked avatar display with overflow count.
 *
 * Renders child DzAvatar components in a stacked layout with negative
 * overlap. Shows a "+N" indicator when the count exceeds `max`.
 *
 * @example
 * ```vue
 * <DzAvatarGroup :max="3" size="sm">
 *   <DzAvatar src="/u1.jpg" alt="User 1" />
 *   <DzAvatar src="/u2.jpg" alt="User 2" />
 *   <DzAvatar src="/u3.jpg" alt="User 3" />
 *   <DzAvatar src="/u4.jpg" alt="User 4" />
 * </DzAvatarGroup>
 * ```
 */
import { computed, provide, toRef, useAttrs, useSlots } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_AVATAR_GROUP_KEY } from './DzAvatar.types.ts'
import { avatarGroupOverflowVariants, avatarGroupVariants } from './DzAvatarGroup.variants.ts'

const props = withDefaults(defineProps<DzAvatarGroupProps>(), {
  size: 'md',
})

defineSlots<DzAvatarGroupSlots>()

const attrs = useAttrs()
const slots = useSlots()

const context: DzAvatarGroupContext = {
  size: toRef(() => props.size),
}

provide(DZ_AVATAR_GROUP_KEY, context)

/** Count of child VNodes in the default slot */
const childCount = computed(() => {
  const children = slots.default?.() as { length: number } | undefined
  if (!children)
    return 0
  return children.length
})

/** Number of hidden avatars */
const overflowCount = computed(() => {
  if (!props.max || childCount.value <= props.max)
    return 0
  return childCount.value - props.max
})

const rootClasses = computed(() =>
  cn(avatarGroupVariants(), attrs.class as string | undefined),
)

const overflowClasses = computed(() =>
  avatarGroupOverflowVariants({ size: props.size }),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    role="group"
    :class="rootClasses"
    :aria-label="ariaLabel"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
    <span
      v-if="overflowCount > 0"
      :class="overflowClasses"
      aria-hidden="true"
    >
      +{{ overflowCount }}
    </span>
  </div>
</template>
