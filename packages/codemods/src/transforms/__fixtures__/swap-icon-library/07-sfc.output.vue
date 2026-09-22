<script setup lang="ts">
import { Filter, X } from '@lucide/vue'
import { computed } from 'vue'

const label = computed(() => 'Filter')
</script>

<template>
  <button type="button" :aria-label="label">
    <Filter />
    <X />
  </button>
</template>
