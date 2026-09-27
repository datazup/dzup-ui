<script lang="ts">
export type { LucideIcon } from '@lucide/vue'
</script>

<script setup lang="ts">
import { Check, Minus } from '@lucide/vue'

defineProps<{ indeterminate?: boolean }>()
</script>

<template>
  <span class="dz-check">
    <Minus v-if="indeterminate" />
    <Check v-else />
  </span>
</template>
