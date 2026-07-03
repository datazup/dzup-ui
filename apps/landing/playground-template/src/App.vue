<script setup lang="ts">
import { ref } from 'vue'
import { DzButton } from '@dzup-ui/core'

// This file is replaced with the block/template source when you open one from
// dzup-ui.com — edit freely, it's a real Vite + Vue 3 project.
const count = ref(0)
</script>

<template>
  <main style="padding: 24px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
    <DzButton variant="solid" tone="primary" @click="count++">
      Clicked {{ count }} times
    </DzButton>
    <DzButton variant="outline" tone="neutral">Outline</DzButton>
  </main>
</template>
