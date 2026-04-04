<script setup lang="ts">
import {
  DzInput,
  DzNumberInput,
  DzPasswordInput,
  DzSearchInput,
  DzTextarea,
} from '@dzup-ui/core'
import { ref } from 'vue'

const textValue = ref('')
const emailValue = ref('')
const numberValue = ref(0)
const passwordValue = ref('')
const searchValue = ref('')
const textareaValue = ref('')
const clearableValue = ref('Clear me')

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Inputs
    </h1>
    <p class="page-description">
      Form input components with v-model bindings, variants, and sizes.
    </p>

    <!-- Basic Input -->
    <section class="demo-section">
      <h2 class="section-title">
        Text Input
      </h2>
      <div class="demo-stack">
        <DzInput v-model="textValue" placeholder="Type something..." />
        <span class="state-label">Value: "{{ textValue }}"</span>
      </div>
    </section>

    <!-- Input Sizes -->
    <section class="demo-section">
      <h2 class="section-title">
        Sizes
      </h2>
      <div class="demo-stack">
        <DzInput v-for="s in sizes" :key="s" :size="s" :placeholder="`Size: ${s}`" />
      </div>
    </section>

    <!-- Input Variants -->
    <section class="demo-section">
      <h2 class="section-title">
        Variants
      </h2>
      <div class="demo-stack">
        <DzInput variant="outline" placeholder="Outline variant" />
        <DzInput variant="filled" placeholder="Filled variant" />
        <DzInput variant="underlined" placeholder="Underlined variant" />
      </div>
    </section>

    <!-- States -->
    <section class="demo-section">
      <h2 class="section-title">
        States
      </h2>
      <div class="demo-stack">
        <DzInput placeholder="Normal input" />
        <DzInput placeholder="Disabled input" disabled />
        <DzInput placeholder="Readonly input" readonly model-value="Read only text" />
        <DzInput placeholder="Invalid input" invalid error="This field has an error" />
      </div>
    </section>

    <!-- Clearable -->
    <section class="demo-section">
      <h2 class="section-title">
        Clearable
      </h2>
      <div class="demo-stack">
        <DzInput v-model="clearableValue" clearable placeholder="Clearable input" />
        <span class="state-label">Value: "{{ clearableValue }}"</span>
      </div>
    </section>

    <!-- Email Input -->
    <section class="demo-section">
      <h2 class="section-title">
        Email Input
      </h2>
      <div class="demo-stack">
        <DzInput v-model="emailValue" type="email" placeholder="Enter your email" />
        <span class="state-label">Value: "{{ emailValue }}"</span>
      </div>
    </section>

    <!-- Number Input -->
    <section class="demo-section">
      <h2 class="section-title">
        Number Input
      </h2>
      <div class="demo-stack">
        <DzNumberInput v-model="numberValue" placeholder="Enter a number" />
        <span class="state-label">Value: {{ numberValue }}</span>
      </div>
    </section>

    <!-- Password Input -->
    <section class="demo-section">
      <h2 class="section-title">
        Password Input
      </h2>
      <div class="demo-stack">
        <DzPasswordInput v-model="passwordValue" placeholder="Enter password" />
        <span class="state-label">Value: "{{ passwordValue }}"</span>
      </div>
    </section>

    <!-- Search Input -->
    <section class="demo-section">
      <h2 class="section-title">
        Search Input
      </h2>
      <div class="demo-stack">
        <DzSearchInput v-model="searchValue" placeholder="Search..." />
        <span class="state-label">Query: "{{ searchValue }}"</span>
      </div>
    </section>

    <!-- Textarea -->
    <section class="demo-section">
      <h2 class="section-title">
        Textarea
      </h2>
      <div class="demo-stack">
        <DzTextarea v-model="textareaValue" placeholder="Write something longer..." />
        <span class="state-label">Length: {{ textareaValue.length }} characters</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 32px;
}

.demo-section {
  margin-bottom: 24px;
  padding: 24px;
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 16px;
}

.demo-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.state-label {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  font-family: monospace;
}
</style>
