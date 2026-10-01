<script lang="ts">
export type { LucideIcon } from 'lucide-vue-next'
</script>

<script setup lang="ts">
import { Check, Minus } from 'lucide-vue-next'

defineProps<{ indeterminate?: boolean }>()
</script>

<template>
  <span class="dz-check">
    <Minus v-if="indeterminate" />
    <Check v-else />
  </span>
</template>
