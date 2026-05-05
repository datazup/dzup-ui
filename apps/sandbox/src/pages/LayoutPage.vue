<script setup lang="ts">
import {
  DzAspectRatio,
  DzContainer,
  DzDivider,
  DzGrid,
  DzSpacer,
  DzStack,
} from '@dzup-ui/core'
import type {
  ContainerMaxWidth,
  GridCols,
  LayoutGap,
  SpacerSize,
  StackAlign,
  StackDirection,
} from '@dzup-ui/core'
import { ref } from 'vue'

const containerWidths: ContainerMaxWidth[] = ['sm', 'md', 'lg', 'xl', '2xl', 'full']
const stackGaps: LayoutGap[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl']
const stackAlignments: StackAlign[] = ['start', 'center', 'end', 'stretch']
const spacerSizes: SpacerSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const gridColOptions: GridCols[] = [1, 2, 3, 4, 6, 12]
const aspectRatios = [
  { label: '1 / 1 (square)', value: 1 },
  { label: '4 / 3', value: 4 / 3 },
  { label: '16 / 9', value: 16 / 9 },
  { label: '21 / 9', value: 21 / 9 },
]

const containerWidth = ref<ContainerMaxWidth>('md')
const stackDirection = ref<StackDirection>('vertical')
const stackGap = ref<LayoutGap>('md')
const stackAlign = ref<StackAlign>('stretch')
const gridCols = ref<GridCols>(3)
const gridGap = ref<LayoutGap>('md')
const spacerSize = ref<SpacerSize>('md')
const aspectRatio = ref<number>(16 / 9)
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Layout
    </h1>
    <p class="page-description">
      Layout primitives for structuring page content -- containers, stacks, grids, dividers and spacers.
    </p>

    <!-- DzContainer -->
    <section class="demo-section">
      <h2 class="section-title">
        DzContainer
      </h2>
      <p class="section-description">
        Centered, padded wrapper that caps content width at one of six breakpoints.
      </p>

      <div class="control-row">
        <label class="control-label">max-width</label>
        <select v-model="containerWidth" class="control-select">
          <option v-for="w in containerWidths" :key="w" :value="w">
            {{ w }}
          </option>
        </select>
      </div>

      <div class="container-track">
        <DzContainer :max-width="containerWidth" class="container-demo">
          <div class="container-content">
            max-width = {{ containerWidth }}
          </div>
        </DzContainer>
      </div>
    </section>

    <!-- DzStack -->
    <section class="demo-section">
      <h2 class="section-title">
        DzStack
      </h2>
      <p class="section-description">
        One-dimensional flex layout with a configurable gap, direction, and cross-axis alignment.
      </p>

      <div class="control-row">
        <label class="control-label">direction</label>
        <select v-model="stackDirection" class="control-select">
          <option value="vertical">
            vertical
          </option>
          <option value="horizontal">
            horizontal
          </option>
        </select>

        <label class="control-label">gap</label>
        <select v-model="stackGap" class="control-select">
          <option v-for="g in stackGaps" :key="g" :value="g">
            {{ g }}
          </option>
        </select>

        <label class="control-label">align</label>
        <select v-model="stackAlign" class="control-select">
          <option v-for="a in stackAlignments" :key="a" :value="a">
            {{ a }}
          </option>
        </select>
      </div>

      <div class="frame">
        <DzStack
          :direction="stackDirection"
          :gap="stackGap"
          :align="stackAlign"
        >
          <div class="block block-a">
            Item 1
          </div>
          <div class="block block-b block-tall">
            Item 2
          </div>
          <div class="block block-c">
            Item 3
          </div>
          <div class="block block-d block-wide">
            Item 4
          </div>
        </DzStack>
      </div>
    </section>

    <!-- DzGrid -->
    <section class="demo-section">
      <h2 class="section-title">
        DzGrid
      </h2>
      <p class="section-description">
        CSS Grid wrapper with a fixed column count or responsive <code>{ sm, md, lg }</code> map.
      </p>

      <div class="control-row">
        <label class="control-label">cols</label>
        <select v-model.number="gridCols" class="control-select">
          <option v-for="c in gridColOptions" :key="c" :value="c">
            {{ c }}
          </option>
        </select>

        <label class="control-label">gap</label>
        <select v-model="gridGap" class="control-select">
          <option v-for="g in stackGaps" :key="g" :value="g">
            {{ g }}
          </option>
        </select>
      </div>

      <div class="frame">
        <DzGrid :cols="gridCols" :gap="gridGap">
          <div v-for="n in 12" :key="n" class="block block-grid">
            {{ n }}
          </div>
        </DzGrid>
      </div>

      <h3 class="subsection-title">
        Responsive cols
      </h3>
      <p class="section-description">
        <code>{ sm: 2, md: 3, lg: 4 }</code> -- resize the viewport to see breakpoints kick in.
      </p>
      <div class="frame">
        <DzGrid :cols="{ sm: 2, md: 3, lg: 4 }" gap="md">
          <div v-for="n in 8" :key="n" class="block block-grid">
            {{ n }}
          </div>
        </DzGrid>
      </div>
    </section>

    <!-- DzDivider -->
    <section class="demo-section">
      <h2 class="section-title">
        DzDivider
      </h2>
      <p class="section-description">
        Horizontal or vertical separator with semantic <code>role="separator"</code> by default.
      </p>

      <div class="frame">
        <p class="muted-text">
          Above the divider
        </p>
        <DzDivider />
        <p class="muted-text">
          Below the divider
        </p>
      </div>

      <h3 class="subsection-title">
        Vertical (decorative)
      </h3>
      <div class="frame frame-row">
        <span class="muted-text">Profile</span>
        <DzDivider orientation="vertical" decorative />
        <span class="muted-text">Settings</span>
        <DzDivider orientation="vertical" decorative />
        <span class="muted-text">Logout</span>
      </div>
    </section>

    <!-- DzSpacer -->
    <section class="demo-section">
      <h2 class="section-title">
        DzSpacer
      </h2>
      <p class="section-description">
        Fixed-size or auto-flexing space filler. Use <code>size="auto"</code> to push siblings apart.
      </p>

      <div class="control-row">
        <label class="control-label">fixed size</label>
        <select v-model="spacerSize" class="control-select">
          <option v-for="s in spacerSizes" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>

      <h3 class="subsection-title">
        Fixed spacer between items
      </h3>
      <div class="frame frame-row">
        <div class="block block-a">
          A
        </div>
        <DzSpacer :size="spacerSize" />
        <div class="block block-b">
          B
        </div>
      </div>

      <h3 class="subsection-title">
        size="auto" pushes siblings to opposite ends
      </h3>
      <div class="frame frame-row frame-stretch">
        <div class="block block-a">
          Left
        </div>
        <DzSpacer size="auto" />
        <div class="block block-c">
          Right
        </div>
      </div>
    </section>

    <!-- DzAspectRatio -->
    <section class="demo-section">
      <h2 class="section-title">
        DzAspectRatio
      </h2>
      <p class="section-description">
        Locks any child to a numeric width / height ratio -- ideal for media placeholders.
      </p>

      <div class="control-row">
        <label class="control-label">ratio</label>
        <select v-model.number="aspectRatio" class="control-select">
          <option v-for="r in aspectRatios" :key="r.label" :value="r.value">
            {{ r.label }}
          </option>
        </select>
      </div>

      <div class="frame aspect-frame">
        <DzAspectRatio :ratio="aspectRatio">
          <div class="aspect-content">
            {{ aspectRatio.toFixed(3) }}
          </div>
        </DzAspectRatio>
      </div>

      <h3 class="subsection-title">
        Common ratios in a grid
      </h3>
      <DzGrid :cols="{ sm: 1, md: 2, lg: 4 }" gap="md">
        <div v-for="r in aspectRatios" :key="r.label">
          <DzAspectRatio :ratio="r.value">
            <div class="aspect-content aspect-content-muted">
              {{ r.label }}
            </div>
          </DzAspectRatio>
        </div>
      </DzGrid>
    </section>

    <!-- Composition -->
    <section class="demo-section">
      <h2 class="section-title">
        Composition
      </h2>
      <p class="section-description">
        All six primitives combined: container caps width, stack arranges sections, grid lays out cards,
        dividers separate them, and aspect ratio fixes the media region.
      </p>

      <DzContainer max-width="lg" class="composition-shell">
        <DzStack direction="vertical" gap="lg">
          <h3 class="composition-heading">
            Featured collection
          </h3>
          <DzDivider />
          <DzGrid :cols="{ sm: 1, md: 2, lg: 3 }" gap="md">
            <div v-for="n in 3" :key="n" class="composition-card">
              <DzAspectRatio :ratio="16 / 9">
                <div class="aspect-content aspect-content-muted">
                  Cover {{ n }}
                </div>
              </DzAspectRatio>
              <DzStack direction="vertical" gap="xs" class="composition-card-body">
                <strong>Card {{ n }}</strong>
                <span class="muted-text">Short caption text</span>
              </DzStack>
            </div>
          </DzGrid>
          <DzDivider />
          <DzStack direction="horizontal" gap="sm" align="center">
            <span class="muted-text">Footer</span>
            <DzSpacer size="auto" />
            <span class="muted-text">Updated today</span>
          </DzStack>
        </DzStack>
      </DzContainer>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1080px;
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
  margin: 0 0 4px;
}

.section-description {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 16px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 20px 0 8px;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.control-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.control-select {
  padding: 6px 8px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
}

.frame {
  padding: 16px;
  background: var(--dz-muted, #f8fafc);
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  min-height: 80px;
}

.frame-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.frame-stretch {
  width: 100%;
}

.container-track {
  background: var(--dz-muted, #f8fafc);
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  padding: 16px 0;
}

.container-demo {
  outline: 2px dashed var(--dz-primary, #2563eb);
  outline-offset: -2px;
  border-radius: var(--dz-radius-sm, 4px);
}

.container-content {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
}

.block {
  padding: 12px 16px;
  border-radius: var(--dz-radius-sm, 4px);
  font-size: 13px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.block-a { background: color-mix(in srgb, var(--dz-primary, #2563eb) 12%, transparent); }
.block-b { background: color-mix(in srgb, var(--dz-success, #16a34a) 14%, transparent); }
.block-c { background: color-mix(in srgb, var(--dz-warning, #d97706) 16%, transparent); }
.block-d { background: color-mix(in srgb, var(--dz-info, #0ea5e9) 14%, transparent); }

.block-tall { padding-block: 28px; }
.block-wide { padding-inline: 36px; }

.block-grid {
  text-align: center;
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 8%, transparent);
}

.muted-text {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
}

.aspect-frame {
  max-width: 480px;
}

.aspect-content {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--dz-primary-foreground, #ffffff);
  background: var(--dz-primary, #2563eb);
  border-radius: var(--dz-radius-md, 6px);
}

.aspect-content-muted {
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 18%, var(--dz-muted, #f1f5f9));
  color: var(--dz-foreground, #1a202c);
}

.composition-shell {
  background: var(--dz-muted, #f8fafc);
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  padding: 24px;
}

.composition-heading {
  font-size: 18px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0;
}

.composition-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
}

.composition-card-body {
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 4px;
  background: var(--dz-muted, #f1f5f9);
  border-radius: 3px;
}
</style>
