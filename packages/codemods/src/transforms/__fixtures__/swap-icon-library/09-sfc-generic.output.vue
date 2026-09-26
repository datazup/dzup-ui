<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ChevronDown } from '@lucide/vue'

defineProps<{ rows: T[] }>()
</script>

<template>
  <ChevronDown />
</template>
