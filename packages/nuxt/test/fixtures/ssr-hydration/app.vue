<script setup lang="ts">
const count = ref(0)
</script>

<template>
  <div>
    <DzThemeProvider>
      <DzButton data-testid="ssr-button" @click="count++">
        Rendered on the server: {{ count }}
      </DzButton>
    </DzThemeProvider>
  </div>
</template>
