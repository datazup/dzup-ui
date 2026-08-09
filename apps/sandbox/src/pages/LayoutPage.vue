<script setup lang="ts">
import {
  DzAppShell,
  DzAspectRatio,
  DzCollapse,
  DzContainer,
  DzDivider,
  DzFlex,
  DzGrid,
  DzResizable,
  DzResizableHandle,
  DzResizablePanel,
  DzScrollArea,
  DzSpacer,
  DzSplitter,
  DzSplitterHandle,
  DzSplitterPanel,
  DzStack,
} from '@dzup-ui/core'
import type {
  ContainerMaxWidth,
  DzAspectRatioProps,
  DzCollapseProps,
  DzContainerProps,
  DzFlexProps,
  DzGridProps,
  DzResizableProps,
  DzScrollAreaProps,
  DzSpacerProps,
  DzStackProps,
  FlexAlign,
  FlexDirection,
  FlexJustify,
  GridCols,
  LayoutGap,
  ResizableDirection,
  ScrollOrientation,
  SpacerSize,
  StackAlign,
  StackDirection,
} from '@dzup-ui/core'
import { computed } from 'vue'
import DemoCode from '../components/DemoCode.vue'
import SandboxControl from '../components/SandboxControl.vue'
import { useDemoSnippet } from '../composables/useDemoSnippet.ts'
import { useUrlState } from '../composables/useUrlState.ts'

type ResizableComponent = 'resizable' | 'splitter'

const containerWidths: ContainerMaxWidth[] = ['sm', 'md', 'lg', 'xl', '2xl', 'full']
const stackGaps: LayoutGap[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl']
const stackAlignments: StackAlign[] = ['start', 'center', 'end', 'stretch']
const flexDirections: FlexDirection[] = ['row', 'column', 'row-reverse', 'column-reverse']
const flexAlignments: FlexAlign[] = ['start', 'center', 'end', 'stretch', 'baseline']
const flexJustifyValues: FlexJustify[] = ['start', 'center', 'end', 'between', 'around', 'evenly']
const spacerSizes: SpacerSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const gridColOptions: GridCols[] = [1, 2, 3, 4, 6, 12]
const scrollOrientations: ScrollOrientation[] = ['vertical', 'horizontal', 'both']
const resizableDirections: ResizableDirection[] = ['horizontal', 'vertical']
const aspectRatios = [
  { label: '1 / 1 (square)', value: 1 },
  { label: '4 / 3', value: 4 / 3 },
  { label: '16 / 9', value: 16 / 9 },
  { label: '21 / 9', value: 21 / 9 },
]

const containerWidth = useUrlState<ContainerMaxWidth>('container', 'md')
const stackDirection = useUrlState<StackDirection>('stack-dir', 'vertical')
const stackGap = useUrlState<LayoutGap>('stack-gap', 'md')
const stackAlign = useUrlState<StackAlign>('stack-align', 'stretch')
const gridCols = useUrlState<GridCols>('grid-cols', 3)
const gridGap = useUrlState<LayoutGap>('grid-gap', 'md')
const spacerSize = useUrlState<SpacerSize>('spacer', 'md')
const aspectRatio = useUrlState<number>('aspect', 16 / 9)

const flexDirection = useUrlState<FlexDirection>('flex-dir', 'row')
const flexAlign = useUrlState<FlexAlign>('flex-align', 'center')
const flexJustifyValue = useUrlState<FlexJustify>('flex-justify', 'between')
const flexGap = useUrlState<LayoutGap>('flex-gap', 'md')
const flexWrap = useUrlState<boolean>('flex-wrap', false)

const collapseOpen = useUrlState<boolean>('collapse-open', true)
const collapseDuration = useUrlState<number>('collapse-dur', 200)

const scrollOrientation = useUrlState<ScrollOrientation>('scroll-orient', 'vertical')
type ScrollType = NonNullable<DzScrollAreaProps['type']>
const scrollType = useUrlState<ScrollType>('scroll-type', 'hover')

const resizableDirection = useUrlState<ResizableDirection>('resizable-dir', 'horizontal')
const resizableComponent = useUrlState<ResizableComponent>('resizable-comp', 'resizable')

const aspectLabel = computed(() => {
  const match = aspectRatios.find(r => r.value === aspectRatio.value)
  return match?.label ?? aspectRatio.value.toFixed(3)
})

const isSplitter = computed(() => resizableComponent.value === 'splitter')
const resizableRootTag = computed(() => (isSplitter.value ? 'DzSplitter' : 'DzResizable'))
const resizableHandleTag = computed(() => (isSplitter.value ? 'DzSplitterHandle' : 'DzResizableHandle'))
const resizablePanelTag = computed(() => (isSplitter.value ? 'DzSplitterPanel' : 'DzResizablePanel'))
const resizableRootComponent = computed(() => (isSplitter.value ? DzSplitter : DzResizable))
const resizableHandleComponent = computed(() => (isSplitter.value ? DzSplitterHandle : DzResizableHandle))
const resizablePanelComponent = computed(() => (isSplitter.value ? DzSplitterPanel : DzResizablePanel))

const containerSnippet = useDemoSnippet<Partial<DzContainerProps>>(() => ({
  tag: 'DzContainer',
  props: { maxWidth: containerWidth.value },
  children: '  <p>Centered content</p>',
}))

const stackSnippet = useDemoSnippet<Partial<DzStackProps>>(() => ({
  tag: 'DzStack',
  props: {
    direction: stackDirection.value,
    gap: stackGap.value,
    align: stackAlign.value,
  },
  children: '  <Item />\n  <Item />',
}))

const gridSnippet = useDemoSnippet<Partial<DzGridProps>>(() => ({
  tag: 'DzGrid',
  props: { cols: gridCols.value, gap: gridGap.value },
  children: '  <Item v-for="n in 12" :key="n" />',
}))

const flexSnippet = useDemoSnippet<Partial<DzFlexProps>>(() => ({
  tag: 'DzFlex',
  props: {
    direction: flexDirection.value,
    align: flexAlign.value,
    justify: flexJustifyValue.value,
    gap: flexGap.value,
    wrap: flexWrap.value,
  },
  children: '  <Item />\n  <Item />\n  <Item />',
}))

const spacerSnippet = useDemoSnippet<Partial<DzSpacerProps>>(() => ({
  tag: 'DzFlex',
  props: {},
  children: `  <Item />\n  <DzSpacer size="${spacerSize.value}" />\n  <Item />`,
}))

const aspectSnippet = useDemoSnippet<Partial<DzAspectRatioProps>>(() => ({
  tag: 'DzAspectRatio',
  props: { ratio: Number(aspectRatio.value.toFixed(4)) },
  children: '  <img src="cover.jpg" alt="" />',
}))

const collapseSnippet = useDemoSnippet<Partial<DzCollapseProps>>(() => ({
  tag: 'DzCollapse',
  props: { duration: collapseDuration.value },
  attrs: { 'v-model': 'open' },
  children: '  <p>Collapsible content</p>',
}))

const scrollSnippet = useDemoSnippet<Partial<DzScrollAreaProps>>(() => ({
  tag: 'DzScrollArea',
  props: { orientation: scrollOrientation.value, type: scrollType.value },
  attrs: { style: 'height: 200px' },
  children: '  <LongContent />',
}))

const resizableSnippet = useDemoSnippet<Partial<DzResizableProps>>(() => ({
  tag: resizableRootTag.value,
  props: { direction: resizableDirection.value },
  children: `  <${resizablePanelTag.value} :default-size="40" :min-size="20">A</${resizablePanelTag.value}>
  <${resizableHandleTag.value} with-handle />
  <${resizablePanelTag.value} :default-size="60" :min-size="20">B</${resizablePanelTag.value}>`,
}))

const appShellSnippet = `<DzAppShell sidebar-width="14rem" header-height="3.5rem">
  <template #sidebar>
    <nav>...</nav>
  </template>
  <template #header>
    <div>Breadcrumbs / actions</div>
  </template>
  <section>Main content</section>
</DzAppShell>`
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Layout
    </h1>
    <p class="page-description">
      Layout primitives for structuring page content -- containers, stacks, grids, flex, dividers,
      spacers, scroll areas, collapsible regions, resizable panels and the application shell.
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
        <SandboxControl label="max-width">
          <select v-model="containerWidth">
            <option v-for="w in containerWidths" :key="w" :value="w">
              {{ w }}
            </option>
          </select>
        </SandboxControl>
      </div>

      <div class="container-track">
        <DzContainer :max-width="containerWidth" class="container-demo">
          <div class="container-content">
            max-width = {{ containerWidth }}
          </div>
        </DzContainer>
      </div>

      <DemoCode :code="containerSnippet" />
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
        <SandboxControl label="direction">
          <select v-model="stackDirection">
            <option value="vertical">
              vertical
            </option>
            <option value="horizontal">
              horizontal
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="gap">
          <select v-model="stackGap">
            <option v-for="g in stackGaps" :key="g" :value="g">
              {{ g }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="align">
          <select v-model="stackAlign">
            <option v-for="a in stackAlignments" :key="a" :value="a">
              {{ a }}
            </option>
          </select>
        </SandboxControl>
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

      <DemoCode :code="stackSnippet" />
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
        <SandboxControl label="cols">
          <select v-model.number="gridCols">
            <option v-for="c in gridColOptions" :key="c" :value="c">
              {{ c }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="gap">
          <select v-model="gridGap">
            <option v-for="g in stackGaps" :key="g" :value="g">
              {{ g }}
            </option>
          </select>
        </SandboxControl>
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
        <code>{ sm: 2, md: 3, lg: 4 }</code> -- watch the corner badge as the breakpoint changes.
      </p>
      <div class="frame">
        <DzGrid :cols="{ sm: 2, md: 3, lg: 4 }" gap="md">
          <div v-for="n in 8" :key="n" class="block block-grid">
            {{ n }}
          </div>
        </DzGrid>
      </div>

      <DemoCode :code="gridSnippet" />
    </section>

    <!-- DzFlex -->
    <section class="demo-section">
      <h2 class="section-title">
        DzFlex
      </h2>
      <p class="section-description">
        Full-control flexbox -- direction, alignment, justification, wrap, and inline mode.
      </p>

      <div class="control-row">
        <SandboxControl label="direction">
          <select v-model="flexDirection">
            <option v-for="d in flexDirections" :key="d" :value="d">
              {{ d }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="align">
          <select v-model="flexAlign">
            <option v-for="a in flexAlignments" :key="a" :value="a">
              {{ a }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="justify">
          <select v-model="flexJustifyValue">
            <option v-for="j in flexJustifyValues" :key="j" :value="j">
              {{ j }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="gap">
          <select v-model="flexGap">
            <option v-for="g in stackGaps" :key="g" :value="g">
              {{ g }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="wrap">
          <input v-model="flexWrap" type="checkbox">
        </SandboxControl>
      </div>

      <div class="frame frame-flex">
        <DzFlex
          :direction="flexDirection"
          :align="flexAlign"
          :justify="flexJustifyValue"
          :gap="flexGap"
          :wrap="flexWrap"
          class="flex-host"
        >
          <div v-for="n in 6" :key="n" class="block block-grid" :class="{ 'block-tall': n === 2, 'block-wide': n === 4 }">
            {{ n }}
          </div>
        </DzFlex>
      </div>

      <DemoCode :code="flexSnippet" />
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

      <DemoCode code="<DzDivider />
<DzDivider orientation=&quot;vertical&quot; decorative />" />
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
        <SandboxControl label="fixed size">
          <select v-model="spacerSize">
            <option v-for="s in spacerSizes" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
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

      <DemoCode :code="spacerSnippet" />
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
        <SandboxControl label="ratio">
          <select v-model.number="aspectRatio">
            <option v-for="r in aspectRatios" :key="r.label" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </SandboxControl>
      </div>

      <div class="frame aspect-frame">
        <DzAspectRatio :ratio="aspectRatio">
          <div class="aspect-content">
            {{ aspectLabel }}
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

      <DemoCode :code="aspectSnippet" />
    </section>

    <!-- DzCollapse -->
    <section class="demo-section">
      <h2 class="section-title">
        DzCollapse
      </h2>
      <p class="section-description">
        Animated expand/collapse region. Honors <code>prefers-reduced-motion</code>.
      </p>

      <div class="control-row">
        <SandboxControl label="open">
          <input v-model="collapseOpen" type="checkbox">
        </SandboxControl>
        <SandboxControl label="duration (ms)">
          <input v-model.number="collapseDuration" type="number" min="50" max="800" step="50">
        </SandboxControl>
        <button type="button" class="ghost-btn" @click="collapseOpen = !collapseOpen">
          Toggle
        </button>
      </div>

      <div class="frame">
        <DzCollapse v-model="collapseOpen" :duration="collapseDuration">
          <div class="block block-a collapse-content">
            <p>
              This region animates its height between 0 and <code>scrollHeight</code>. Wrap any
              content here -- text, forms, nested layouts.
            </p>
            <p class="muted-text">
              Reduced-motion users get an instant transition.
            </p>
          </div>
        </DzCollapse>
      </div>

      <DemoCode :code="collapseSnippet" />
    </section>

    <!-- DzScrollArea -->
    <section class="demo-section">
      <h2 class="section-title">
        DzScrollArea
      </h2>
      <p class="section-description">
        Custom scrollbars over native overflow, backed by Reka UI primitives.
      </p>

      <div class="control-row">
        <SandboxControl label="orientation">
          <select v-model="scrollOrientation">
            <option v-for="o in scrollOrientations" :key="o" :value="o">
              {{ o }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="type">
          <select v-model="scrollType">
            <option value="auto">
              auto
            </option>
            <option value="always">
              always
            </option>
            <option value="scroll">
              scroll
            </option>
            <option value="hover">
              hover
            </option>
          </select>
        </SandboxControl>
      </div>

      <div class="frame">
        <DzScrollArea
          :orientation="scrollOrientation"
          :type="scrollType"
          class="scroll-host"
        >
          <div class="scroll-content">
            <p v-for="n in 24" :key="n" class="scroll-line">
              Line {{ n }} -- lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus quis
              tortor a velit posuere convallis. {{ n % 4 === 0 ? 'A longer line that forces horizontal overflow on narrow viewports.' : '' }}
            </p>
          </div>
        </DzScrollArea>
      </div>

      <DemoCode :code="scrollSnippet" />
    </section>

    <!-- DzResizable / DzSplitter -->
    <section class="demo-section">
      <h2 class="section-title">
        {{ resizableRootTag }}
      </h2>
      <p class="section-description">
        Drag-resizable panel groups (Reka UI Splitter). <code>DzSplitter</code> is a naming alias
        for <code>DzResizable</code> -- toggle below to verify parity. Try keyboard arrows on the
        focused handle.
      </p>

      <div class="control-row">
        <SandboxControl label="component">
          <select v-model="resizableComponent">
            <option value="resizable">
              DzResizable
            </option>
            <option value="splitter">
              DzSplitter
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="direction">
          <select v-model="resizableDirection">
            <option v-for="d in resizableDirections" :key="d" :value="d">
              {{ d }}
            </option>
          </select>
        </SandboxControl>
      </div>

      <div class="frame resizable-frame">
        <component
          :is="resizableRootComponent"
          :key="resizableComponent"
          :direction="resizableDirection"
          class="resizable-host"
        >
          <component :is="resizablePanelComponent" :default-size="30" :min-size="15">
            <div class="resizable-panel resizable-panel-a">
              Panel A
            </div>
          </component>
          <component :is="resizableHandleComponent" with-handle />
          <component :is="resizablePanelComponent" :default-size="40" :min-size="20">
            <div class="resizable-panel resizable-panel-b">
              Panel B
            </div>
          </component>
          <component :is="resizableHandleComponent" with-handle />
          <component :is="resizablePanelComponent" :default-size="30" :min-size="15">
            <div class="resizable-panel resizable-panel-c">
              Panel C
            </div>
          </component>
        </component>
      </div>

      <DemoCode :code="resizableSnippet" />
    </section>

    <!-- DzAppShell -->
    <section class="demo-section">
      <h2 class="section-title">
        DzAppShell
      </h2>
      <p class="section-description">
        Sidebar + header + main scaffold. Demoed at miniature scale; in production it spans the
        viewport (the sandbox itself uses a hand-rolled equivalent).
      </p>

      <div class="frame app-shell-frame">
        <DzAppShell
          sidebar-width="11rem"
          header-height="3rem"
          aria-label="Mini app shell preview"
          class="app-shell-mini"
        >
          <template #sidebar>
            <div class="app-shell-sidebar">
              <strong>Sidebar</strong>
              <ul>
                <li>Dashboard</li>
                <li>Reports</li>
                <li>Settings</li>
              </ul>
            </div>
          </template>
          <template #header>
            <div class="app-shell-header">
              <span>Header</span>
              <DzSpacer size="auto" />
              <span class="muted-text">user@dzup</span>
            </div>
          </template>
          <div class="app-shell-main">
            <h4>Main content</h4>
            <p class="muted-text">
              Default slot renders inside the body region.
            </p>
          </div>
        </DzAppShell>
      </div>

      <DemoCode :code="appShellSnippet" />
    </section>

    <!-- Composition -->
    <section class="demo-section">
      <h2 class="section-title">
        Composition
      </h2>
      <p class="section-description">
        Container caps width, stack arranges sections, grid lays out cards, dividers separate them,
        and aspect ratio fixes the media region.
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
          <DzFlex direction="row" align="center" gap="sm">
            <span class="muted-text">Footer</span>
            <DzSpacer size="auto" />
            <span class="muted-text">Updated today</span>
          </DzFlex>
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
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
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

.frame-flex .flex-host {
  min-height: 120px;
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

.collapse-content {
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 6%, var(--dz-surface, #ffffff));
}

.collapse-content p {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
}

.collapse-content p:last-child {
  margin-bottom: 0;
}

.scroll-host {
  height: 200px;
  width: 100%;
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
}

.scroll-content {
  padding: 12px 16px;
  width: 1200px;
}

.scroll-line {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  white-space: nowrap;
}

.resizable-frame {
  padding: 0;
}

.resizable-host {
  height: 240px;
  width: 100%;
  border-radius: var(--dz-radius-md, 6px);
  overflow: hidden;
}

.resizable-panel {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
}

.resizable-panel-a { background: color-mix(in srgb, var(--dz-primary, #2563eb) 12%, transparent); }
.resizable-panel-b { background: color-mix(in srgb, var(--dz-info, #0ea5e9) 14%, transparent); }
.resizable-panel-c { background: color-mix(in srgb, var(--dz-success, #16a34a) 14%, transparent); }

.app-shell-frame {
  padding: 0;
  overflow: hidden;
}

.app-shell-mini {
  height: 280px;
}

.app-shell-sidebar {
  height: 100%;
  padding: 12px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
}

.app-shell-sidebar ul {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--dz-muted-foreground, #64748b);
}

.app-shell-header {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border-bottom: 1px solid var(--dz-border, #e2e8f0);
}

.app-shell-main {
  padding: 16px;
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 4%, var(--dz-surface, #ffffff));
  height: 100%;
}

.app-shell-main h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
}

.app-shell-main p {
  margin: 0;
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

.ghost-btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dz-primary, #2563eb);
  background: transparent;
  border: 1px solid var(--dz-primary, #2563eb);
  border-radius: var(--dz-radius-sm, 4px);
  cursor: pointer;
}

.ghost-btn:hover {
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 8%, transparent);
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 4px;
  background: var(--dz-muted, #f1f5f9);
  border-radius: 3px;
}
</style>
