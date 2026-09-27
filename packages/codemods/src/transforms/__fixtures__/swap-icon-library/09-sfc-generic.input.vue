<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{ rows: T[] }>()
</script>

<template>
  <ChevronDown />
</template>
