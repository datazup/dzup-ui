<script setup lang="ts">
import type { DzCodeProps, DzCodeSlots } from './DzCode.types.ts'
/**
 * DzCode — Code display component (inline or block).
 *
 * Renders code with monospace font and appropriate styling.
 * Inline variant renders as `<code>`, block variant as `<pre><code>`.
 *
 * @example
 * ```vue
 * <DzCode>const x = 42</DzCode>
 * <DzCode variant="block" language="typescript">
 *   function greet(name: string) {
 *     return `Hello, ${name}`
 *   }
 * </DzCode>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { codeVariants } from './DzCode.variants.ts'

const props = withDefaults(defineProps<DzCodeProps>(), {
  variant: 'inline',
})

defineSlots<DzCodeSlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    codeVariants({ variant: props.variant }),
    attrs.class as string | undefined,
  ),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <pre
    v-if="variant === 'block'"
    :id="id"
    :class="classes"
    :data-language="language"
    v-bind="{ ...$attrs, class: undefined }"
  ><code><slot /></code></pre>
  <code
    v-else
    :id="id"
    :class="classes"
    :data-language="language"
    v-bind="{ ...$attrs, class: undefined }"
  ><slot /></code>
</template>
