<script setup lang="ts">
import type { CanonicalTone } from '@dzip-ui/contracts'
import type { DzAlertCompatProps, OldAlertType } from '../adapter-types.ts'
import { DzAlert } from '@dzip-ui/core'
/**
 * DzAlertCompat — backward-compatible wrapper for DzAlert.
 *
 * Maps old dzip-ui alert API to the new vNext API:
 * - `type` prop -> `tone` prop (e.g. "error" -> "danger", "warning" -> "warning")
 * - `closable` -> `closable` (same name, forwarded directly)
 * - `title` -> `title` (same name, forwarded directly)
 *
 * @deprecated Use DzAlert from @dzip-ui/core instead.
 */
import { computed, onMounted, useAttrs } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

const props = withDefaults(defineProps<DzAlertCompatProps>(), {
  type: 'default',
  closable: false,
})

const emit = defineEmits<{
  close: []
}>()

const attrs = useAttrs()

onMounted(() => {
  warnDeprecated('DzAlertCompat', 'DzAlert')
})

/** Map old type values to canonical tones */
const mappedTone = computed<CanonicalTone>(() => {
  const typeToTone: Record<OldAlertType, CanonicalTone> = {
    success: 'success',
    warning: 'warning',
    error: 'danger',
    info: 'info',
    default: 'neutral',
  }
  return typeToTone[props.type ?? 'default']
})
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <DzAlert
    :tone="mappedTone"
    :closable="closable"
    :title="title"
    v-bind="attrs"
    @close="emit('close')"
  >
    <slot />
    <template v-if="$slots.title" #title>
      <slot name="title" />
    </template>
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </DzAlert>
</template>
