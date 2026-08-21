<!--
  DzThemeProvider — Provides theme context to the component tree.

  Since TASK-OSS-P4-02 this is a **thin wrapper over `DzProvider`** with theme
  props only. Its public contract is unchanged — same four props, same ADR-09
  context (`theme`, `resolvedTheme`, `setTheme`, `toggleTheme`), same ADR-15
  persistence and `data-theme` reflection, same bare `<slot />` — and its test
  suite passes untouched, which is the evidence for that claim.

  The wrapper exists rather than the reverse because there must be exactly one
  implementation of the theme state machine. Two would drift, and the way that
  drift surfaces is an application that mounts `DzProvider` and a `DzThemeToggle`
  written against `DzThemeProvider` finding two different themes.

  A consumer that wants more than the theme should mount `DzProvider` instead;
  this component is not deprecated, and nesting one inside the other is safe —
  `DzProvider` only takes ownership of theme when it is asked to or when nothing
  above it already has.

  @module @dzup-ui/core/providers/DzThemeProvider
-->

<script setup lang="ts">
import type { DzProviderThemeOptions } from './DzProvider.types.ts'
import type { DzThemeProviderProps } from './DzThemeProvider.types.ts'
import { computed } from 'vue'
import DzProvider from './DzProvider.vue'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props = withDefaults(defineProps<DzThemeProviderProps>(), {
  defaultTheme: 'system',
  storageKey: 'dz-theme',
  attribute: 'data-theme',
  disableTransitionOnChange: true,
})

/**
 * The flat props, as the one object `DzProvider` takes.
 *
 * `persist` is not surfaced here: this component has always persisted, and
 * adding the option to the older name would mean two places to look up what
 * "does it remember my theme?" answers to.
 */
const theme = computed<DzProviderThemeOptions>(() => ({
  default: props.defaultTheme,
  storageKey: props.storageKey,
  attribute: props.attribute,
  disableTransitionOnChange: props.disableTransitionOnChange,
}))
</script>

<template>
  <DzProvider :theme="theme">
    <slot />
  </DzProvider>
</template>
