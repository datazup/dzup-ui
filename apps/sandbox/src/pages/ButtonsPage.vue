<script setup lang="ts">
import {
  DzButton,
  DzButtonGroup,
  DzCopyButton,
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
  DzIconButton,
  DzSplitButton,
  DzSplitButtonAction,
  DzSplitButtonMenu,
  DzToggleButton,
} from '@dzup-ui/core'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  Bold,
  ChevronDown,
  Download,
  ExternalLink,
  Heart,
  Italic,
  Minus,
  Pencil,
  Plus,
  Save,
  Settings,
  Star,
  Trash2,
  Underline,
} from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const clickCount = ref(0)
const isLoading = ref(false)
const togglePressed = ref(false)

const variants = ['solid', 'outline', 'ghost', 'text', 'link'] as const
const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

type Variant = (typeof variants)[number]

function simulateLoading(): void {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

// Matrix controls
const matrixDisabled = ref(false)
const matrixLoading = ref(false)

// Toggle group: formatting bar
const formatting = ref<string[]>(['bold'])
function toggleFormat(key: string): void {
  const i = formatting.value.indexOf(key)
  if (i === -1)
    formatting.value.push(key)
  else formatting.value.splice(i, 1)
}
const isPressed = (key: string): boolean => formatting.value.includes(key)

const alignment = ref<'left' | 'center' | 'right'>('left')

// Toggle matrix: pressed states for each cell so demo shows both states
const matrixToggleVariants: Variant[] = ['solid', 'outline', 'ghost']
const toggleMatrixState = ref<Record<string, boolean>>({})
function matrixKey(v: Variant, s: typeof sizes[number]): string {
  return `${v}:${s}`
}

// SplitButton state
const lastSaveAction = ref<string | null>(null)
function recordSave(action: string): void {
  lastSaveAction.value = action
}

// CopyButton demo values
const apiToken = ref('dzup_pk_8f3c2e7a91b04d6cae5d2f7b1a9c8e3f')
const snippet = ref(
  '<DzButton tone="primary" :prefix="Save">Save changes</DzButton>',
)

// Accessibility demo
const ariaToggle = ref(false)
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">
        Buttons
      </h1>
      <p class="page-description">
        Interactive button family — base button, icon button, copy button, toggle, split button, and button group.
        Covers variants, tones, sizes, polymorphic rendering, dropdown integration, and accessibility behavior.
      </p>
    </header>

    <!-- Variants -->
    <section class="demo-section">
      <h2 class="section-title">
        Variants
      </h2>
      <p class="section-hint">
        Five canonical variants per <code>ButtonVariant</code>. <code>solid</code> for primary calls to action,
        <code>outline</code>/<code>ghost</code> for secondary surfaces, <code>text</code>/<code>link</code> for inline actions.
      </p>
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
      <p class="section-hint">
        Six semantic tones map to design tokens — never hardcode colors at the call site.
      </p>
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
      <p class="section-hint">
        Canonical scale <code>xs → xl</code>. Height, padding, and font size all token-driven via <code>--dz-button-*</code>.
      </p>
      <div class="demo-row align-end">
        <DzButton v-for="s in sizes" :key="s" :size="s" tone="primary">
          {{ s }}
        </DzButton>
      </div>
    </section>

    <!-- Icon usage -->
    <section class="demo-section">
      <h2 class="section-title">
        Icon Usage
      </h2>
      <p class="section-hint">
        Use <code>#prefix</code> / <code>#suffix</code> slots on <code>DzButton</code> for labeled icons.
        Use <code>DzIconButton</code> for icon-only triggers — <code>ariaLabel</code> is required.
      </p>

      <h3 class="subsection-title">
        Prefix / Suffix Slots
      </h3>
      <div class="demo-row">
        <DzButton tone="primary">
          <template #prefix>
            <Save class="btn-icon" aria-hidden="true" />
          </template>
          Save changes
        </DzButton>
        <DzButton variant="outline">
          <template #suffix>
            <ArrowRight class="btn-icon" aria-hidden="true" />
          </template>
          Continue
        </DzButton>
        <DzButton variant="ghost" tone="danger">
          <template #prefix>
            <Trash2 class="btn-icon" aria-hidden="true" />
          </template>
          Delete
        </DzButton>
        <DzButton variant="link" tone="info">
          Open docs
          <template #suffix>
            <ExternalLink class="btn-icon" aria-hidden="true" />
          </template>
        </DzButton>
      </div>

      <h3 class="subsection-title">
        DzIconButton — Sizes
      </h3>
      <div class="demo-row align-end">
        <DzIconButton v-for="s in sizes" :key="s" :size="s" :icon="Settings" :aria-label="`Settings (${s})`" variant="outline" />
      </div>

      <h3 class="subsection-title">
        DzIconButton — Tones &amp; States
      </h3>
      <div class="demo-row">
        <DzIconButton :icon="Pencil" aria-label="Edit" tone="primary" />
        <DzIconButton :icon="Heart" aria-label="Favorite" tone="danger" variant="ghost" />
        <DzIconButton :icon="Star" aria-label="Star" tone="warning" variant="outline" />
        <DzIconButton :icon="Download" aria-label="Download" tone="success" />
        <DzIconButton :icon="Trash2" aria-label="Delete" tone="danger" variant="ghost" disabled />
        <DzIconButton :icon="Settings" aria-label="Loading" tone="primary" loading />
      </div>
    </section>

    <!-- States -->
    <section class="demo-section">
      <h2 class="section-title">
        States
      </h2>
      <p class="section-hint">
        <code>loading</code> swaps the prefix slot for a spinner and sets <code>aria-busy</code>. <code>disabled</code> sets the
        native attribute on <code>&lt;button&gt;</code> and blocks click emission.
      </p>
      <div class="demo-row">
        <DzButton tone="primary">
          Normal
        </DzButton>
        <DzButton tone="primary" disabled>
          Disabled
        </DzButton>
        <DzButton tone="primary" :loading="isLoading" @click="simulateLoading">
          {{ isLoading ? 'Working…' : 'Click to load' }}
        </DzButton>
      </div>
    </section>

    <!-- Tones × Variants matrix -->
    <section class="demo-section">
      <div class="section-head">
        <h2 class="section-title">
          Tones × Variants Matrix
        </h2>
        <div class="controls-row">
          <DzToggleButton v-model="matrixDisabled" size="sm" variant="outline">
            Disabled
          </DzToggleButton>
          <DzToggleButton v-model="matrixLoading" size="sm" variant="outline">
            Loading
          </DzToggleButton>
        </div>
      </div>
      <p class="section-hint">
        All <strong>{{ tones.length }} tones × {{ variants.length }} variants</strong> in one view — fastest way to surface
        token-mapping regressions. Toggle the modifiers to validate spinner + dimming token coverage.
      </p>

      <div class="matrix-wrapper">
        <table class="matrix">
          <thead>
            <tr>
              <th class="matrix-corner" />
              <th v-for="v in variants" :key="v" class="matrix-head">
                {{ v }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tones" :key="t">
              <th class="matrix-row-head">
                {{ t }}
              </th>
              <td v-for="v in variants" :key="`${t}-${v}`" class="matrix-cell">
                <DzButton
                  :variant="v"
                  :tone="t"
                  size="sm"
                  :disabled="matrixDisabled"
                  :loading="matrixLoading"
                >
                  Aa
                </DzButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Polymorphic root -->
    <section class="demo-section">
      <h2 class="section-title">
        Polymorphic Root
      </h2>
      <p class="section-hint">
        Same visual button can render as <code>&lt;button&gt;</code>, <code>&lt;a&gt;</code>, or
        <code>RouterLink</code>. Prefer <code>href</code> for external URLs, <code>to</code> for in-app navigation,
        and explicit <code>:as</code> only when you need a non-default component.
      </p>

      <div class="poly-grid">
        <div class="poly-cell">
          <p class="poly-label">
            Default — <code>&lt;button&gt;</code>
          </p>
          <DzButton tone="primary" @click="clickCount++">
            <template #prefix>
              <Plus class="btn-icon" aria-hidden="true" />
            </template>
            Add item
          </DzButton>
        </div>

        <div class="poly-cell">
          <p class="poly-label">
            <code>href</code> — renders <code>&lt;a&gt;</code>
          </p>
          <DzButton href="https://github.com" target="_blank" rel="noreferrer" variant="outline">
            github.com
            <template #suffix>
              <ExternalLink class="btn-icon" aria-hidden="true" />
            </template>
          </DzButton>
        </div>

        <div class="poly-cell">
          <p class="poly-label">
            <code>to</code> — auto-detects <code>RouterLink</code>
          </p>
          <DzButton to="/cards" variant="ghost" tone="info">
            Go to /cards
            <template #suffix>
              <ArrowRight class="btn-icon" aria-hidden="true" />
            </template>
          </DzButton>
        </div>

        <div class="poly-cell">
          <p class="poly-label">
            Explicit <code>:as="RouterLink"</code>
          </p>
          <DzButton :as="RouterLink" to="/typography" variant="link" tone="primary">
            Typography page
          </DzButton>
        </div>
      </div>
    </section>

    <!-- Event handling -->
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
      <p class="section-hint">
        Group propagates <code>size</code>, <code>variant</code>, <code>tone</code>, and <code>disabled</code> via inject —
        children can still override per-button. Use <code>orientation="vertical"</code> for stacked toolbars.
      </p>

      <h3 class="subsection-title">
        Segmented (outline)
      </h3>
      <div class="demo-row">
        <DzButtonGroup variant="outline" aria-label="Pagination range">
          <DzButton>Previous</DzButton>
          <DzButton>1</DzButton>
          <DzButton tone="primary">
            2
          </DzButton>
          <DzButton>3</DzButton>
          <DzButton>Next</DzButton>
        </DzButtonGroup>
      </div>

      <h3 class="subsection-title">
        Mixed children (DzButton + DzIconButton)
      </h3>
      <div class="demo-row">
        <DzButtonGroup variant="outline" aria-label="Item actions">
          <DzButton>
            <template #prefix>
              <Pencil class="btn-icon" aria-hidden="true" />
            </template>
            Edit
          </DzButton>
          <DzIconButton :icon="Star" aria-label="Star" variant="outline" />
          <DzIconButton :icon="Trash2" aria-label="Delete" tone="danger" variant="outline" />
        </DzButtonGroup>
      </div>

      <h3 class="subsection-title">
        Vertical orientation
      </h3>
      <div class="demo-row">
        <DzButtonGroup orientation="vertical" variant="outline" size="sm" aria-label="Quantity">
          <DzIconButton :icon="Plus" aria-label="Increment" variant="outline" size="sm" />
          <DzIconButton :icon="Minus" aria-label="Decrement" variant="outline" size="sm" />
        </DzButtonGroup>

        <DzButtonGroup orientation="vertical" tone="primary" aria-label="Sidebar">
          <DzButton variant="ghost">
            Dashboard
          </DzButton>
          <DzButton variant="ghost">
            Reports
          </DzButton>
          <DzButton variant="ghost">
            Settings
          </DzButton>
        </DzButtonGroup>
      </div>

      <h3 class="subsection-title">
        Disabled group
      </h3>
      <div class="demo-row">
        <DzButtonGroup variant="outline" disabled aria-label="Read only actions">
          <DzButton>Approve</DzButton>
          <DzButton>Reject</DzButton>
          <DzButton>Defer</DzButton>
        </DzButtonGroup>
      </div>
    </section>

    <!-- ToggleButton -->
    <section class="demo-section">
      <h2 class="section-title">
        Toggle Button
      </h2>
      <p class="section-hint">
        Single toggle uses <code>v-model</code> via <code>defineModel&lt;boolean&gt;()</code> (ADR-16). Build toggle groups
        by composing multiple toggles around an array model — Reka handles <code>aria-pressed</code> on each.
      </p>

      <h3 class="subsection-title">
        Formatting bar (independent toggles)
      </h3>
      <div class="demo-row">
        <DzButtonGroup variant="outline" aria-label="Text formatting">
          <DzToggleButton
            :model-value="isPressed('bold')"
            variant="outline"
            aria-label="Bold"
            @update:model-value="toggleFormat('bold')"
          >
            <template #prefix>
              <Bold class="btn-icon" aria-hidden="true" />
            </template>
            Bold
          </DzToggleButton>
          <DzToggleButton
            :model-value="isPressed('italic')"
            variant="outline"
            aria-label="Italic"
            @update:model-value="toggleFormat('italic')"
          >
            <template #prefix>
              <Italic class="btn-icon" aria-hidden="true" />
            </template>
            Italic
          </DzToggleButton>
          <DzToggleButton
            :model-value="isPressed('underline')"
            variant="outline"
            aria-label="Underline"
            @update:model-value="toggleFormat('underline')"
          >
            <template #prefix>
              <Underline class="btn-icon" aria-hidden="true" />
            </template>
            Underline
          </DzToggleButton>
        </DzButtonGroup>
        <span class="state-label">active: [{{ formatting.join(', ') || '∅' }}]</span>
      </div>

      <h3 class="subsection-title">
        Alignment (exclusive toggle group)
      </h3>
      <div class="demo-row">
        <DzButtonGroup variant="outline" aria-label="Text alignment">
          <DzToggleButton
            :model-value="alignment === 'left'"
            aria-label="Align left"
            @update:model-value="alignment = 'left'"
          >
            <AlignLeft class="btn-icon" aria-hidden="true" />
          </DzToggleButton>
          <DzToggleButton
            :model-value="alignment === 'center'"
            aria-label="Align center"
            @update:model-value="alignment = 'center'"
          >
            <AlignCenter class="btn-icon" aria-hidden="true" />
          </DzToggleButton>
          <DzToggleButton
            :model-value="alignment === 'right'"
            aria-label="Align right"
            @update:model-value="alignment = 'right'"
          >
            <AlignRight class="btn-icon" aria-hidden="true" />
          </DzToggleButton>
        </DzButtonGroup>
        <span class="state-label">selected: {{ alignment }}</span>
      </div>

      <h3 class="subsection-title">
        Variant × Size matrix
      </h3>
      <div class="toggle-matrix">
        <div class="matrix-wrapper">
          <table class="matrix">
            <thead>
              <tr>
                <th class="matrix-corner" />
                <th v-for="s in sizes" :key="s" class="matrix-head">
                  {{ s }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in matrixToggleVariants" :key="v">
                <th class="matrix-row-head">
                  {{ v }}
                </th>
                <td v-for="s in sizes" :key="`${v}-${s}`" class="matrix-cell">
                  <DzToggleButton
                    :model-value="toggleMatrixState[matrixKey(v, s)] ?? (v === 'solid')"
                    :variant="v"
                    :size="s"
                    @update:model-value="(val) => (toggleMatrixState[matrixKey(v, s)] = val)"
                  >
                    Aa
                  </DzToggleButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h3 class="subsection-title">
        Single toggle (legacy)
      </h3>
      <div class="demo-row">
        <DzToggleButton v-model="togglePressed">
          {{ togglePressed ? 'Pressed' : 'Not Pressed' }}
        </DzToggleButton>
        <span class="state-label">aria-pressed: {{ togglePressed }}</span>
      </div>
    </section>

    <!-- SplitButton -->
    <section class="demo-section">
      <h2 class="section-title">
        Split Button
      </h2>
      <p class="section-hint">
        Compound: <code>DzSplitButtonAction</code> handles the primary click; <code>DzSplitButtonMenu</code>'s default slot
        replaces its built-in chevron trigger, so you wire in a real dropdown (here <code>DzDropdownMenu</code>).
        Keyboard: <kbd>Enter</kbd> / <kbd>Space</kbd> on the trigger opens the menu; <kbd>↑</kbd>/<kbd>↓</kbd> moves focus
        between items; <kbd>Esc</kbd> closes; <kbd>Tab</kbd> leaves the menu.
      </p>

      <div class="demo-row">
        <DzSplitButton tone="primary">
          <DzSplitButtonAction @click="recordSave('save')">
            Save
          </DzSplitButtonAction>
          <DzSplitButtonMenu>
            <DzDropdownMenu>
              <DzDropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="chevron-trigger chevron-trigger--primary"
                  aria-label="More save actions"
                >
                  <ChevronDown class="btn-icon" aria-hidden="true" />
                </button>
              </DzDropdownMenuTrigger>
              <DzDropdownMenuContent align="end" :side-offset="6">
                <DzDropdownMenuItem @select="recordSave('draft')">
                  Save as draft
                </DzDropdownMenuItem>
                <DzDropdownMenuItem @select="recordSave('close')">
                  Save and close
                </DzDropdownMenuItem>
                <DzDropdownMenuSeparator />
                <DzDropdownMenuItem disabled>
                  Schedule (coming soon)
                </DzDropdownMenuItem>
                <DzDropdownMenuSeparator />
                <DzDropdownMenuItem @select="recordSave('discard')">
                  <span class="danger-text">Discard changes</span>
                </DzDropdownMenuItem>
              </DzDropdownMenuContent>
            </DzDropdownMenu>
          </DzSplitButtonMenu>
        </DzSplitButton>

        <DzSplitButton tone="neutral" variant="outline">
          <DzSplitButtonAction @click="recordSave('export-csv')">
            Export CSV
          </DzSplitButtonAction>
          <DzSplitButtonMenu>
            <DzDropdownMenu>
              <DzDropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="chevron-trigger chevron-trigger--outline"
                  aria-label="More export formats"
                >
                  <ChevronDown class="btn-icon" aria-hidden="true" />
                </button>
              </DzDropdownMenuTrigger>
              <DzDropdownMenuContent align="end" :side-offset="6">
                <DzDropdownMenuItem @select="recordSave('export-json')">
                  Export JSON
                </DzDropdownMenuItem>
                <DzDropdownMenuItem @select="recordSave('export-xlsx')">
                  Export XLSX
                </DzDropdownMenuItem>
                <DzDropdownMenuItem @select="recordSave('export-pdf')">
                  Export PDF
                </DzDropdownMenuItem>
              </DzDropdownMenuContent>
            </DzDropdownMenu>
          </DzSplitButtonMenu>
        </DzSplitButton>

        <span class="state-label">last action: {{ lastSaveAction ?? '—' }}</span>
      </div>
    </section>

    <!-- CopyButton -->
    <section class="demo-section">
      <h2 class="section-title">
        Copy Button
      </h2>
      <p class="section-hint">
        Copies <code>value</code> to clipboard, swaps to a check icon for ~1s, then reverts. The
        <code>copied</code> event fires with the original value — use it to toast or log.
      </p>

      <h3 class="subsection-title">
        Label + value (API token)
      </h3>
      <div class="copy-row">
        <code class="token-display">{{ apiToken }}</code>
        <DzCopyButton :value="apiToken" label="Copy token" copied-label="Copied!" />
      </div>

      <h3 class="subsection-title">
        Icon-only (small)
      </h3>
      <div class="copy-row">
        <code class="token-display token-display--block">{{ snippet }}</code>
        <DzCopyButton :value="snippet" size="sm" aria-label="Copy snippet" />
      </div>

      <h3 class="subsection-title">
        Disabled
      </h3>
      <div class="copy-row">
        <DzCopyButton value="locked" label="Copy" disabled />
      </div>
    </section>

    <!-- Accessibility -->
    <section class="demo-section">
      <h2 class="section-title">
        Accessibility
      </h2>
      <p class="section-hint">
        The button family is wired for screen readers and keyboard users out of the box. Notable behaviors:
      </p>

      <h3 class="subsection-title">
        <code>disabled</code> vs <code>aria-disabled</code>
      </h3>
      <p class="section-hint">
        <code>disabled</code> sets the native attribute — button is removed from the tab order and dispatches no clicks.
        Use it for actions that are truly unavailable. For actions you still want focusable (e.g. to show a tooltip
        explaining why), prefer a custom <code>aria-disabled</code> pattern on a wrapping element — DzButton does not
        expose this directly because the loading/disabled state machine drives <code>aria-disabled</code> internally.
      </p>
      <div class="demo-row">
        <DzButton tone="primary">
          Enabled (focusable, clickable)
        </DzButton>
        <DzButton tone="primary" disabled>
          Disabled (skipped by Tab)
        </DzButton>
      </div>

      <h3 class="subsection-title">
        <code>loading</code> sets <code>aria-busy</code>
      </h3>
      <p class="section-hint">
        Screen readers announce a busy region; the spinner replaces the <code>#prefix</code> slot to prevent duplicate
        iconography. Inspect with DevTools — <code>aria-busy="true"</code> and <code>data-state="loading"</code> appear
        on the root.
      </p>
      <div class="demo-row">
        <DzButton tone="primary" loading>
          Submitting
        </DzButton>
        <DzButton variant="outline" loading>
          <template #prefix>
            <Save class="btn-icon" aria-hidden="true" />
          </template>
          Save (prefix hidden during load)
        </DzButton>
      </div>

      <h3 class="subsection-title">
        Focus-visible
      </h3>
      <p class="section-hint">
        Tab into the row below — outlines appear only for keyboard focus, not for mouse clicks (browser-native
        <code>:focus-visible</code>). Variants share a single focus ring token for consistency.
      </p>
      <div class="demo-row">
        <DzButton variant="solid" tone="primary">
          Solid
        </DzButton>
        <DzButton variant="outline">
          Outline
        </DzButton>
        <DzButton variant="ghost">
          Ghost
        </DzButton>
        <DzButton variant="link" tone="info">
          Link
        </DzButton>
      </div>

      <h3 class="subsection-title">
        <code>aria-pressed</code> on ToggleButton
      </h3>
      <p class="section-hint">
        ToggleButton sets <code>aria-pressed</code> based on its model value. The live region below mirrors the state
        for verification.
      </p>
      <div class="demo-row">
        <DzToggleButton v-model="ariaToggle" variant="outline">
          {{ ariaToggle ? 'Notifications on' : 'Notifications off' }}
        </DzToggleButton>
        <span class="state-label" aria-live="polite">
          aria-pressed = {{ ariaToggle }}
        </span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1120px;
}

.page-header {
  margin-bottom: 28px;
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
  margin: 0;
  line-height: 1.6;
  max-width: 820px;
}

.demo-section {
  margin-bottom: 24px;
  padding: 24px;
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 12px;
}

.subsection-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dz-muted-foreground, #64748b);
  margin: 20px 0 10px;
}

.section-hint {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  line-height: 1.55;
}

.section-hint code,
.poly-label code,
.subsection-title code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.92em;
  padding: 1px 5px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

.section-hint kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
  padding: 1px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
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

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.state-label {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.btn-icon {
  width: 1em;
  height: 1em;
}

/* Polymorphic root */
.poly-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.poly-cell {
  padding: 14px;
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.poly-label {
  margin: 0;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
}

/* Matrix */
.matrix-wrapper {
  overflow-x: auto;
}

.matrix {
  border-collapse: separate;
  border-spacing: 8px;
}

.matrix-corner {
  width: 70px;
}

.matrix-head {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dz-muted-foreground, #64748b);
  padding: 2px 8px;
  text-align: center;
}

.matrix-row-head {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dz-muted-foreground, #64748b);
  padding: 2px 8px;
  text-align: right;
  white-space: nowrap;
}

.matrix-cell {
  text-align: center;
  padding: 2px;
}

.toggle-matrix .matrix-corner {
  width: 70px;
}

/* SplitButton chevron trigger — visually matches the action half of the split button */
.chevron-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: var(--dz-button-md-height, 36px);
  padding: 0 8px;
  border-top-right-radius: var(--dz-button-radius, var(--dz-radius-md, 6px));
  border-bottom-right-radius: var(--dz-button-radius, var(--dz-radius-md, 6px));
  border: 0;
  font: inherit;
  line-height: 1;
  outline-offset: 2px;
  transition: filter 0.15s ease, background-color 0.15s ease;
}

.chevron-trigger--primary {
  background: var(--dz-primary, #2563eb);
  color: var(--dz-primary-foreground, #ffffff);
  border-left: 1px solid color-mix(in oklch, var(--dz-primary-foreground, #ffffff) 20%, transparent);
}

.chevron-trigger--primary:hover {
  filter: brightness(0.95);
}

.chevron-trigger--outline {
  background: transparent;
  color: var(--dz-foreground, #1a202c);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-left: 0;
}

.chevron-trigger--outline:hover {
  background: var(--dz-muted, #f1f5f9);
}

.chevron-trigger:focus-visible {
  outline: 2px solid var(--dz-primary, #2563eb);
}

.danger-text {
  color: var(--dz-danger, #dc2626);
  font-weight: 500;
}

/* CopyButton demo */
.copy-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.token-display {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.token-display--block {
  display: block;
  flex: 1 1 320px;
  white-space: pre;
  overflow-x: auto;
}

@media (max-width: 900px) {
  .demo-section {
    padding: 18px;
  }

  .poly-grid {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
