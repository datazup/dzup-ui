<!--
  DzProvider — one root component for every concern an application configures.

  ADR-20 fixed the keys, the shapes, the defaults and the merge rules and
  shipped the read half (TASK-OSS-P4-01). This is the write half: the single
  sanctioned writer, so that "two providers mean two locales and two merge
  rules" stays a thing that cannot happen.

  Three properties are load-bearing, and each is tested in both directions:

    1. **A prop that is not set provides nothing.** ADR-20 §3 says a provider
       overrides the keys it sets. That is why `<DzProvider locale="ar-EG">`
       nested inside a themed provider does not reset the theme, and why this
       component has no `withDefaults` values.

    2. **It renders no element.** Its anatomy is `parts: 'none'` and its
       template is a bare `<slot />`, which is what lets it work inside a shadow
       root exactly as `DzThemeProvider` does. The consequence is stated rather
       than hidden: a NESTED provider that changes direction cannot scope `dir`
       in the DOM — see `applyDirection` below.

    3. **The root provider's first client paint matches the server's.** Theme
       and direction are reflected onto `<html>`, and `getThemeScript` writes
       the same two attributes before any of this runs (ADR-15).

  @module @dzup-ui/core/providers/DzProvider
-->

<script setup lang="ts">
import type {
  DzDefaults,
  DzDirection,
  DzDirectionPreference,
  DzLocale,
  DzMessages,
  DzMotionPreference,
  DzTestIds,
} from '@dzup-ui/contracts'
import type { DzProviderDefaults, DzProviderProps, DzProviderSlots } from './DzProvider.types.ts'
import type { ResolvedTheme, ThemePreference } from './DzThemeProvider.types.ts'
import { DZ_DIRECTION_KEY } from '@dzup-ui/contracts'
import { computed, inject, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import {
  createDzMotion,
  provideDzDefaults,
  provideDzMotion,
  provideDzNonce,
  provideDzPortalTarget,
  provideDzTestIds,
  useDzNonce,
  useDzTestIds,
} from '../composables/provider/useDzEnvironment.ts'
import { createDzFormats, provideDzFormats } from '../composables/provider/useDzFormats.ts'
import { directionForLocale, provideDzLocale, useDzLocale } from '../composables/provider/useDzLocale.ts'
import { provideDzMessages } from '../composables/provider/useDzMessages.ts'
import { DZ_PROVIDER_SCOPE_KEY } from './DzProvider.types.ts'
import { DZ_THEME_KEY } from './DzThemeProvider.types.ts'

const props = defineProps<DzProviderProps>()

defineSlots<DzProviderSlots>()

/** Check if code is running in a browser environment */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

// ---------------------------------------------------------------------------
// Scope
// ---------------------------------------------------------------------------

/**
 * Whether this is the outermost provider.
 *
 * Only the root writes to `document.documentElement`. A nested provider that
 * also wrote `dir` there would apply a subtree's direction to the whole page,
 * and the two would fight in an order decided by mount timing.
 */
const isRoot = inject(DZ_PROVIDER_SCOPE_KEY, null) === null
provide(DZ_PROVIDER_SCOPE_KEY, true)

// ---------------------------------------------------------------------------
// Locale and direction
// ---------------------------------------------------------------------------

const inheritedLocale = useDzLocale()
const inheritedDirection = inject(DZ_DIRECTION_KEY, null)

const locale = computed<DzLocale>(() => props.locale ?? inheritedLocale.value)
const directionPreference = computed<DzDirectionPreference>(
  () => props.direction ?? inheritedDirection?.value ?? 'auto',
)

/**
 * What this subtree lays out as — resolved, so never `'auto'`.
 *
 * Computed here as well as in `useDzDirection` because `inject` resolves
 * against the PARENT chain: a component never sees its own `provide`, so this
 * provider cannot ask the composable what it just decided.
 */
const direction = computed<DzDirection>(() =>
  directionPreference.value === 'auto'
    ? directionForLocale(locale.value)
    : directionPreference.value,
)

provideDzLocale(
  props.locale === undefined ? undefined : locale,
  props.direction === undefined ? undefined : directionPreference,
)

/**
 * Whether to write `dir` on `<html>` at all.
 *
 * Only when this host has declared a locale or a direction. A provider mounted
 * purely to set, say, a portal target has no opinion about writing direction,
 * and stamping `dir="ltr"` on a document that never asked is an opinion.
 */
const reflectsDirection = props.locale !== undefined || props.direction !== undefined

// ---------------------------------------------------------------------------
// Messages, formats, portal, motion, defaults
// ---------------------------------------------------------------------------

if (props.messages !== undefined) {
  // Deep-merges with an ancestor catalog inside `provideDzMessages` — the one
  // concern that composes rather than replaces (ADR-20 §3).
  provideDzMessages(computed<DzMessages>(() => props.messages ?? {}))
}

if (props.formats !== undefined)
  provideDzFormats(createDzFormats(locale, props.formats))

if (props.portal !== undefined)
  provideDzPortalTarget(computed(() => props.portal))

const motionPreference = computed<DzMotionPreference>(() => props.motion ?? 'system')
if (props.motion !== undefined)
  provideDzMotion(createDzMotion(motionPreference))

/**
 * Fold the `{ DzButton: { … } }` shorthand into the contract's `components`
 * map, so `useDzDefaults().resolve()` has exactly one shape to read.
 */
function normaliseDefaults(input: DzProviderDefaults): DzDefaults {
  const { size, tone, density, components, ...rest } = input

  const shorthand: Record<string, Readonly<Record<string, unknown>>> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (/^Dz[A-Z]/.test(key) && typeof value === 'object' && value !== null)
      shorthand[key] = value as Readonly<Record<string, unknown>>
  }

  const merged = { ...shorthand, ...components }
  return {
    ...(size === undefined ? {} : { size }),
    ...(tone === undefined ? {} : { tone }),
    ...(density === undefined ? {} : { density }),
    ...(Object.keys(merged).length === 0 ? {} : { components: merged }),
  }
}

if (props.defaults !== undefined)
  provideDzDefaults(computed(() => normaliseDefaults(props.defaults ?? {})))

// ---------------------------------------------------------------------------
// Nonce and test ids
// ---------------------------------------------------------------------------

const inheritedNonce = useDzNonce()
const nonce = computed(() => props.nonce ?? inheritedNonce.value)

if (props.nonce !== undefined)
  provideDzNonce(computed(() => props.nonce))

const inheritedTestIds = useDzTestIds().testIds
const testIds = computed<DzTestIds>(() => {
  const base = inheritedTestIds.value
  const prefix = props.testIdPrefix ?? props.testIds?.prefix ?? base.prefix
  return {
    // An explicit `enabled` wins over the prefix shorthand in both directions,
    // so a subtree can name a prefix and still be switched off.
    enabled: props.testIds?.enabled ?? (props.testIdPrefix !== undefined || base.enabled),
    attribute: props.testIds?.attribute ?? base.attribute,
    ...(prefix === undefined ? {} : { prefix }),
  }
})

if (props.testIds !== undefined || props.testIdPrefix !== undefined)
  provideDzTestIds(testIds)

// ---------------------------------------------------------------------------
// Theme (ADR-09 / ADR-15 behaviour, unchanged)
// ---------------------------------------------------------------------------

/**
 * Whether this provider owns the theme.
 *
 * True when the host configured one, and true for a tree that has no theme
 * above it at all — so `<DzProvider>` alone behaves exactly like
 * `<DzThemeProvider>` and a consumer is not required to know that theme is the
 * one concern with a separate history. A provider nested inside a themed tree
 * that says nothing about theme leaves it alone, which is what stops a nested
 * provider from resetting an application's theme to `'system'`.
 *
 * Read once: whether this component owns theme is a structural fact about the
 * tree, not a value that should change under a running provider.
 */
const ownsTheme = props.theme !== undefined || inject(DZ_THEME_KEY, null) === null

const themeDefault = computed<ThemePreference>(() => props.theme?.default ?? 'system')
const storageKey = computed(() => props.theme?.storageKey ?? 'dz-theme')
const themeAttribute = computed(() => props.theme?.attribute ?? 'data-theme')
const persistsTheme = computed(() => props.theme?.persist ?? true)
const disableTransitionOnChange = computed(() => props.theme?.disableTransitionOnChange ?? true)

/** Read persisted theme from localStorage (returns null if unavailable) */
function readPersistedTheme(): ThemePreference | null {
  if (!isBrowser() || !persistsTheme.value)
    return null
  try {
    const stored = localStorage.getItem(storageKey.value)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  }
  catch {
    // localStorage may throw in restricted contexts (e.g. iframe sandboxes)
  }
  return null
}

/** Persist theme to localStorage */
function persistTheme(value: ThemePreference): void {
  if (!isBrowser() || !persistsTheme.value)
    return
  try {
    localStorage.setItem(storageKey.value, value)
  }
  catch {
    // Silently ignore storage errors
  }
}

/** Apply the theme attribute to document.documentElement */
function applyThemeAttribute(resolved: ResolvedTheme): void {
  if (!isBrowser())
    return
  document.documentElement.setAttribute(themeAttribute.value, resolved)
}

/**
 * Briefly suppress all CSS transitions to prevent colour-flash on theme change.
 * Injects a `<style>` tag, forces a reflow, then removes it on the next frame.
 *
 * The tag carries the provider's CSP nonce when there is one. Without it a
 * strict policy drops the tag silently, and the symptom is a colour sweep on
 * theme change that nobody can reproduce locally — which is the whole reason
 * `nonce` is part of this contract. Both the attribute and the `nonce` property
 * are set: the property is what a browser reads back after parsing, the
 * attribute is what a test can see.
 */
function suppressTransitions(): void {
  if (!isBrowser() || !disableTransitionOnChange.value)
    return
  const style = document.createElement('style')
  style.id = 'dz-theme-no-transition'
  style.textContent = '*,*::before,*::after{transition:none!important}'
  if (nonce.value !== undefined) {
    style.setAttribute('nonce', nonce.value)
    style.nonce = nonce.value
  }
  document.head.appendChild(style)
  // Force reflow so the style takes effect before attribute change
  void document.body.offsetHeight
  requestAnimationFrame(() => {
    style.remove()
  })
}

const theme = ref<ThemePreference>(readPersistedTheme() ?? themeDefault.value)
const systemPrefersDark = ref(false)

/** Resolved theme: converts 'system' to actual light/dark */
const resolvedTheme = computed<ResolvedTheme>(() => {
  if (theme.value === 'system') {
    return systemPrefersDark.value ? 'dark' : 'light'
  }
  return theme.value
})

let mediaQuery: MediaQueryList | null = null

function handleMediaChange(event: MediaQueryListEvent): void {
  systemPrefersDark.value = event.matches
}

/** Set the theme preference */
function setTheme(value: ThemePreference): void {
  suppressTransitions()
  theme.value = value
}

/** Toggle between light and dark (if 'system', resolves to opposite of current) */
function toggleTheme(): void {
  suppressTransitions()
  theme.value = resolvedTheme.value === 'dark' ? 'light' : 'dark'
}

if (ownsTheme) {
  watch(resolvedTheme, (resolved) => {
    applyThemeAttribute(resolved)
  })

  watch(theme, (value) => {
    persistTheme(value)
  })

  provide(DZ_THEME_KEY, {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  })
}

// ---------------------------------------------------------------------------
// Reflection onto <html> (ADR-15, extended to `dir`)
// ---------------------------------------------------------------------------

/**
 * Write `dir` on `<html>`.
 *
 * Only the root provider does this, and only when the host declared a locale or
 * a direction. A NESTED provider changing direction therefore changes what
 * `useDzDirection()` answers for its subtree but writes no attribute — scoping
 * `dir` in the DOM for a subtree is the host's `<div :dir="…">`, because a
 * provider that rendered an element to hold it would stop being usable inside a
 * shadow root and inside `<tbody>` alike.
 */
function applyDirection(value: DzDirection): void {
  if (!isRoot || !reflectsDirection || !isBrowser())
    return
  document.documentElement.setAttribute('dir', value)
}

watch(direction, applyDirection)

onMounted(() => {
  if (!isBrowser())
    return

  if (ownsTheme) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handleMediaChange)
    applyThemeAttribute(resolvedTheme.value)
  }

  applyDirection(direction.value)
})

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaChange)
    mediaQuery = null
  }
})
</script>

<template>
  <slot />
</template>
