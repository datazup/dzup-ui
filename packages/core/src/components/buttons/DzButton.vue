<script setup lang="ts">
import type { ButtonVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { DzButtonEmits, DzButtonProps, DzButtonSlots } from './DzButton.types.ts'
/**
 * DzButton — Primary button component.
 *
 * Supports five variants (solid, outline, ghost, text, link),
 * six semantic tones, five sizes, loading/disabled states,
 * and prefix/suffix icon slots.
 *
 * @example
 * ```vue
 * <DzButton tone="primary" @click="handleClick">Save</DzButton>
 * <DzButton variant="outline" size="sm" loading>Processing</DzButton>
 * ```
 */
import { computed, getCurrentInstance, inject, isProxy, markRaw, toRaw, useAttrs } from 'vue'
import { useDzDefaults } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { buttonVariants } from './DzButton.variants.ts'
import { DZ_BUTTON_GROUP_KEY } from './DzButtonGroup.types.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzButtonProps>(), {
  variant: undefined,
  size: undefined,
  tone: undefined,
  disabled: false,
  loading: false,
  type: 'button',
  asChild: false,
  as: undefined,
  href: undefined,
  to: undefined,
  ui: undefined,
})

const emit = defineEmits<DzButtonEmits>()
defineSlots<DzButtonSlots>()

const attrs = useAttrs()
const groupContext = inject(DZ_BUTTON_GROUP_KEY, null)
const instance = getCurrentInstance()

/**
 * Application-wide defaults (ADR-20 §6).
 *
 * `resolve` owns the precedence so that no component invents its own order:
 * **explicit prop -> compound context -> provider -> the component's own
 * default**. The provider sits third because a `DzButtonGroup` is nearer and
 * more specific than an application-wide setting, and the prop wins outright
 * because it is what the author of that line wrote.
 *
 * With no `DzProvider` mounted this resolves to an empty map, so every line
 * below behaves exactly as it did before the provider existed.
 */
const { resolve } = useDzDefaults()

/** Resolved size: prop, then group context, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzButton', 'size', [props.size, groupContext?.size.value]) ?? 'md',
)

/** Resolved variant: prop, then group context, then provider, then default */
const resolvedVariant = computed(
  () => resolve<ButtonVariant>('DzButton', 'variant', [props.variant, groupContext?.variant.value]) ?? 'solid',
)

/** Resolved tone: prop, then group context, then provider, then default */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzButton', 'tone', [props.tone, groupContext?.tone.value]) ?? 'primary',
)

/** Resolved disabled: own prop OR group-level disabled */
const resolvedDisabled = computed(() => props.disabled || (groupContext?.disabled.value ?? false))

/** Whether interaction is blocked */
const isInert = computed(() => resolvedDisabled.value || props.loading)

/**
 * Resolved root element/component for polymorphic rendering.
 * Priority: explicit `as` > `href` (renders <a>) > `to` (renders router-link) > 'button'
 */
const computedTag = computed(() => {
  if (props.as) {
    if (typeof props.as === 'object' && props.as !== null) {
      const component = isProxy(props.as) ? toRaw(props.as) : props.as
      return markRaw(component)
    }
    return props.as
  }
  if (props.href)
    return 'a'
  if (props.to) {
    const routerLink = instance?.appContext.components.RouterLink
    return routerLink ? markRaw(routerLink) : 'a'
  }
  return 'button'
})

/** Whether the resolved tag is a native anchor element */
const isAnchor = computed(() => computedTag.value === 'a')

/** Whether the resolved tag is a native button element */
const isButton = computed(() => computedTag.value === 'button')

/**
 * Merged class string using cn() (ADR-10).
 *
 * Order is the override order: recipe output, then `ui.root`, then the
 * consumer's `class`. `cn()` is tailwind-merge, so the last conflicting utility
 * wins — which is what lets a consumer restyle without `!important` (ADR-19).
 */
const classes = computed(() =>
  cn(
    buttonVariants({
      variant: resolvedVariant.value,
      size: resolvedSize.value,
      tone: resolvedTone.value,
    }),
    props.ui?.root,
    attrs.class as string | undefined,
  ),
)

/** Spinner classes: the size utilities this component picks, then `ui.spinner`. */
const spinnerClasses = computed(() =>
  cn(
    'animate-spin',
    resolvedSize.value === 'lg' || resolvedSize.value === 'xl' ? 'h-5 w-5' : '',
    resolvedSize.value === 'md' ? 'h-4 w-4' : '',
    resolvedSize.value === 'sm' ? 'h-3.5 w-3.5' : '',
    resolvedSize.value === 'xs' || resolvedSize.value === 'icon' ? 'h-3 w-3' : '',
    props.ui?.spinner,
  ),
)

function handleClick(event: MouseEvent): void {
  if (isInert.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<template>
  <component
    :is="computedTag"
    :id="id"
    :type="isButton ? type : undefined"
    :class="classes"
    :disabled="isButton ? (resolvedDisabled || undefined) : undefined"
    :href="isAnchor && !resolvedDisabled ? (href ?? (to && typeof to === 'string' ? to : undefined)) : undefined"
    :to="!isAnchor && !isButton && to ? to : undefined"
    :role="!isButton ? 'button' : undefined"
    :tabindex="!isButton && isInert ? -1 : (!isButton ? 0 : undefined)"
    :aria-disabled="isInert || undefined"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    data-part="root"
    :data-state="loading ? 'loading' : resolvedDisabled ? 'disabled' : 'idle'"
    :data-tone="resolvedTone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      data-part="spinner"
      :class="spinnerClasses"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>

    <!-- Prefix slot (hidden during loading to avoid double icon) -->
    <slot v-if="!loading" name="prefix" />

    <!-- Default content -->
    <slot />

    <!-- Suffix slot -->
    <slot name="suffix" />
  </component>
</template>
