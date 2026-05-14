<script setup lang="ts">
import {
  DzButton,
  DzButtonGroup,
  DzIconButton,
  DzSplitButton,
  DzSplitButtonAction,
  DzSplitButtonMenu,
  DzToggleButton,
} from '@dzup-ui/core'
import { Pencil, Settings, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'

const clickCount = ref(0)
const isLoading = ref(false)
const togglePressed = ref(false)

const variants = ['solid', 'outline', 'ghost', 'text', 'link'] as const
const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

function simulateLoading(): void {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Buttons
    </h1>
    <p class="page-description">
      Interactive button components with variants, sizes, tones, and states.
    </p>

    <!-- Variants -->
    <section class="demo-section">
      <h2 class="section-title">
        Variants
      </h2>
      <div class="demo-row">
        <DzButton v-for="v in variants" :key="v" :variant="v">
          {{ v }}
        </DzButton>
      </div>
    </section>

    <!-- Tones -->
    <section class="demo-section">
      <h2 class="section-title">
        Tones
      </h2>
      <div class="demo-row">
        <DzButton v-for="t in tones" :key="t" :tone="t" variant="solid">
          {{ t }}
        </DzButton>
      </div>
      <div class="demo-row">
        <DzButton v-for="t in tones" :key="t" :tone="t" variant="outline">
          {{ t }}
        </DzButton>
      </div>
    </section>

    <!-- Sizes -->
    <section class="demo-section">
      <h2 class="section-title">
        Sizes
      </h2>
      <div class="demo-row align-end">
        <DzButton v-for="s in sizes" :key="s" :size="s" tone="primary">
          {{ s }}
        </DzButton>
      </div>
    </section>

    <!-- States -->
    <section class="demo-section">
      <h2 class="section-title">
        States
      </h2>
      <div class="demo-row">
        <DzButton tone="primary">
          Normal
        </DzButton>
        <DzButton tone="primary" disabled>
          Disabled
        </DzButton>
        <DzButton tone="primary" :loading="isLoading" @click="simulateLoading">
          {{ isLoading ? 'Loading...' : 'Click to Load' }}
        </DzButton>
      </div>
    </section>

    <!-- Click Counter -->
    <section class="demo-section">
      <h2 class="section-title">
        Event Handling
      </h2>
      <div class="demo-row">
        <DzButton tone="primary" @click="clickCount++">
          Clicked {{ clickCount }} times
        </DzButton>
        <DzButton variant="outline" @click="clickCount = 0">
          Reset
        </DzButton>
      </div>
    </section>

    <!-- ButtonGroup -->
    <section class="demo-section">
      <h2 class="section-title">
        Button Group
      </h2>
      <div class="demo-row">
        <DzButtonGroup>
          <DzButton variant="outline">
            Left
          </DzButton>
          <DzButton variant="outline">
            Center
          </DzButton>
          <DzButton variant="outline">
            Right
          </DzButton>
        </DzButtonGroup>
      </div>
    </section>

    <!-- IconButton -->
    <section class="demo-section">
      <h2 class="section-title">
        Icon Button
      </h2>
      <div class="demo-row">
        <DzIconButton :icon="Settings" ariaLabel="Settings" variant="outline" />
        <DzIconButton :icon="Pencil" ariaLabel="Edit" tone="primary" />
        <DzIconButton :icon="Trash2" ariaLabel="Delete" tone="danger" variant="ghost" />
      </div>
    </section>

    <!-- ToggleButton -->
    <section class="demo-section">
      <h2 class="section-title">
        Toggle Button
      </h2>
      <div class="demo-row">
        <DzToggleButton v-model="togglePressed">
          {{ togglePressed ? 'Pressed' : 'Not Pressed' }}
        </DzToggleButton>
        <span class="state-label">State: {{ togglePressed }}</span>
      </div>
    </section>

    <!-- SplitButton -->
    <section class="demo-section">
      <h2 class="section-title">
        Split Button
      </h2>
      <div class="demo-row">
        <DzSplitButton tone="primary">
          <DzSplitButtonAction>Save</DzSplitButtonAction>
          <DzSplitButtonMenu>
            <div style="padding: 4px">
              <div style="padding: 8px 12px; cursor: pointer">
                Save as Draft
              </div>
              <div style="padding: 8px 12px; cursor: pointer">
                Save and Close
              </div>
            </div>
          </DzSplitButtonMenu>
        </DzSplitButton>
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
  margin-bottom: 32px;
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

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.demo-row.align-end {
  align-items: flex-end;
}

.state-label {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  font-family: monospace;
}
</style>
