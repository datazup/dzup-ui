<script setup lang="ts">
import type { ThemeMode } from '../composables/useTheme.ts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { THEME_MODES, useTheme } from '../composables/useTheme.ts'

const BREAKPOINTS = [
  { name: '2xl', min: 1536 },
  { name: 'xl', min: 1280 },
  { name: 'lg', min: 1024 },
  { name: 'md', min: 768 },
  { name: 'sm', min: 640 },
  { name: 'xs', min: 0 },
] as const

const VIEWPORT_PRESETS = [
  { label: 'auto', width: null },
  { label: '375 (mobile)', width: 375 },
  { label: '640 (sm)', width: 640 },
  { label: '768 (md)', width: 768 },
  { label: '1024 (lg)', width: 1024 },
  { label: '1280 (xl)', width: 1280 },
  { label: '1536 (2xl)', width: 1536 },
] as const

const LOCALES = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP'] as const

const route = useRoute()
const { mode: themeMode, resolved: themeResolved } = useTheme()

const width = ref(typeof window === 'undefined' ? 0 : window.innerWidth)
const open = ref(false)
const frozenWidth = ref<number | null>(null)
const locale = ref<(typeof LOCALES)[number]>('en-US')
const forceReducedMotion = ref(false)

function update(): void {
  width.value = window.innerWidth
}

onMounted(() => {
  update()
  window.addEventListener('resize', update, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', update)
  applyViewportOverride(null)
})

const activeBreakpoint = computed(() => {
  const match = BREAKPOINTS.find(b => width.value >= b.min)
  return match ?? BREAKPOINTS[BREAKPOINTS.length - 1]!
})

function applyViewportOverride(value: number | null): void {
  const main = document.querySelector<HTMLElement>('[data-sandbox-main]')
  if (!main)
    return
  if (value == null) {
    main.style.removeProperty('max-width')
    main.style.removeProperty('outline')
  }
  else {
    main.style.maxWidth = `${value}px`
    main.style.outline = '1px dashed var(--dz-primary, #2563eb)'
  }
}

function onFreezeChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  const parsed = value === '' ? null : Number(value)
  frozenWidth.value = parsed
  applyViewportOverride(parsed)
}

function setTheme(next: ThemeMode): void {
  themeMode.value = next
}

watch(forceReducedMotion, (next) => {
  if (typeof document === 'undefined')
    return
  if (next) {
    document.documentElement.setAttribute('data-force-reduced-motion', '')
  }
  else {
    document.documentElement.removeAttribute('data-force-reduced-motion')
  }
})
</script>

<template>
  <div class="dev-drawer" :data-open="open ? '' : undefined">
    <button
      type="button"
      class="dev-toggle"
      :aria-expanded="open"
      aria-controls="dev-drawer-panel"
      @click="open = !open"
    >
      <span class="dev-toggle-bp">{{ activeBreakpoint.name }}</span>
      <span class="dev-toggle-width">{{ width }}px</span>
      <span class="dev-toggle-caret" :data-open="open ? '' : undefined">⌃</span>
    </button>

    <div v-if="open" id="dev-drawer-panel" class="dev-panel" role="dialog" aria-label="Sandbox dev tools">
      <dl class="dev-grid">
        <div class="dev-row">
          <dt>Route</dt>
          <dd>
            <code>{{ route.path }}</code>
          </dd>
        </div>

        <div class="dev-row">
          <dt>Breakpoint</dt>
          <dd>
            <code>{{ activeBreakpoint.name }}</code>
            <span class="muted">({{ width }}px)</span>
          </dd>
        </div>

        <div class="dev-row">
          <dt>Theme</dt>
          <dd>
            <div class="seg">
              <button
                v-for="mode in THEME_MODES"
                :key="mode"
                type="button"
                class="seg-btn"
                :data-active="themeMode === mode ? '' : undefined"
                @click="setTheme(mode)"
              >
                {{ mode }}
              </button>
            </div>
            <span class="muted">resolved: {{ themeResolved }}</span>
          </dd>
        </div>

        <div class="dev-row">
          <dt>Locale</dt>
          <dd>
            <select v-model="locale">
              <option v-for="l in LOCALES" :key="l" :value="l">
                {{ l }}
              </option>
            </select>
            <span class="muted">(preview only)</span>
          </dd>
        </div>

        <div class="dev-row">
          <dt>Freeze viewport</dt>
          <dd>
            <select :value="frozenWidth === null ? '' : String(frozenWidth)" @change="onFreezeChange">
              <option v-for="preset in VIEWPORT_PRESETS" :key="preset.label" :value="preset.width === null ? '' : String(preset.width)">
                {{ preset.label }}
              </option>
            </select>
          </dd>
        </div>

        <div class="dev-row">
          <dt>Motion</dt>
          <dd>
            <label class="motion-toggle">
              <input v-model="forceReducedMotion" type="checkbox">
              <span>Disable</span>
            </label>
            <span class="muted">mirrors prefers-reduced-motion</span>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<style scoped>
.dev-drawer {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.dev-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: 9999px;
  box-shadow: var(--dz-shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.08));
  cursor: pointer;
}

.dev-toggle:hover {
  background: var(--dz-muted, #f1f5f9);
}

.dev-toggle-bp {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dz-primary, #2563eb);
}

.dev-toggle-width {
  color: var(--dz-muted-foreground, #64748b);
  font-weight: 500;
}

.dev-toggle-caret {
  display: inline-block;
  transition: transform 150ms ease;
  color: var(--dz-muted-foreground, #64748b);
}

.dev-toggle-caret[data-open] {
  transform: rotate(180deg);
}

.dev-panel {
  width: 320px;
  max-width: calc(100vw - 32px);
  padding: 12px 14px;
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 8px);
  box-shadow: var(--dz-shadow-md, 0 4px 16px rgba(15, 23, 42, 0.10));
  font-size: 12px;
  color: var(--dz-foreground, #1a202c);
}

.dev-grid {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dev-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: 8px;
}

.dev-row dt {
  margin: 0;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--dz-muted-foreground, #64748b);
}

.dev-row dd {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dev-row code {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--dz-muted, #f1f5f9);
}

.muted {
  color: var(--dz-muted-foreground, #64748b);
  font-size: 11px;
}

.seg {
  display: inline-flex;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
  overflow: hidden;
}

.seg-btn {
  appearance: none;
  border: none;
  background: var(--dz-surface, #ffffff);
  color: var(--dz-muted-foreground, #64748b);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  cursor: pointer;
  text-transform: capitalize;
}

.seg-btn + .seg-btn {
  border-left: 1px solid var(--dz-border, #e2e8f0);
}

.seg-btn[data-active] {
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 12%, transparent);
  color: var(--dz-primary, #2563eb);
}

select {
  padding: 4px 8px;
  font: inherit;
  font-size: 12px;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
}

.motion-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--dz-foreground, #1a202c);
  cursor: pointer;
}
</style>
