/**
 * playground.config.ts — shared, framework-agnostic config for the two
 * "try it without local setup" surfaces:
 *
 *   - DzRepl.ts          embedded, editable @vue/repl in a docs page
 *   - OpenInStackblitz.ts "Open in StackBlitz" deep-link button
 *
 * Both need the same answers: where the self-contained `@dzup-ui/core` bundle
 * lives, what CSS the sandbox must load, and a good starter snippet. Keeping it
 * here (no React/Vue imports) means the REPL and StackBlitz surfaces can never
 * drift apart.
 *
 * The `@dzup-ui/core` bundle + token/base CSS are produced by
 * `scripts/build-playground.mjs` into `public/playground/` before every
 * `storybook dev`/`build`, so they always track the current workspace source.
 */

/**
 * Published `@dzup-ui/*` version the StackBlitz starter installs from npm.
 * Single source of truth — keep in sync with `packages/core/package.json`
 * `version`. The OpenInStackblitz block stamps this into the forked project's
 * package.json so the fork always tracks the current major.
 */
export const DZUP_VERSION = '^0.1.0'

/** Tailwind v4 browser JIT — generates the utility classes dzup components use
 *  (`inline-flex`, `h-[var(--dz-…)]`, …) live inside the sandbox, so we don't
 *  have to ship a precompiled utility sheet. Same CDN pattern the REPL already
 *  uses to load Vue. */
export const TAILWIND_BROWSER_CDN = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'

/**
 * Absolute URL to the generated `public/playground/` directory, resolved
 * against Storybook's configured base href so it also works when the static
 * build is served from a sub-path. Returns '' during SSR/prerender.
 */
export function playgroundAssetBase(): string {
  if (typeof window === 'undefined')
    return ''
  // import.meta.env.BASE_URL is injected by Vite; always ends with '/'.
  const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
  return new URL('playground/', new URL(base, window.location.origin)).href
}

/** The default, minimal editable example — editing the markup re-renders live. */
export const DEFAULT_REPL_CODE = `<script setup lang="ts">
import { ref } from 'vue'
import { DzButton } from '@dzup-ui/core'

// Edit anything below and the preview re-renders instantly.
const count = ref(0)
</script>

<template>
  <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
    <DzButton variant="solid" tone="primary" @click="count++">
      Clicked {{ count }} times
    </DzButton>
    <DzButton variant="outline" tone="neutral">Outline</DzButton>
    <DzButton variant="ghost" tone="danger">Danger ghost</DzButton>
  </div>
</template>
`

/**
 * HTML injected into the REPL sandbox <head>. Loads Tailwind (browser JIT), the
 * design tokens, base interaction utilities and the components' scoped styles,
 * and wires the sandbox to dzup's dark-mode contract.
 *
 * dzup dark mode keys off `[data-theme="dark"]`, but @vue/repl expresses its
 * `theme` prop by writing `html.className = 'dark'|'light'` (see
 * switchPreviewTheme). So we seed the initial theme and install a tiny observer
 * that mirrors that className onto `data-theme` — this makes Storybook's Theme
 * toolbar toggle re-theme the live preview WITHOUT reloading the sandbox (which
 * would otherwise wipe the visitor's edits).
 */
export function replSandboxHeadHTML(theme: 'light' | 'dark'): string {
  const base = playgroundAssetBase()
  const themeBridge = `(function(){var el=document.documentElement;`
    + `function sync(){el.setAttribute('data-theme',el.classList.contains('dark')?'dark':'light');}`
    + `el.setAttribute('data-theme',${JSON.stringify(theme)});`
    + `new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class']});})();`
  return [
    `<script src="${TAILWIND_BROWSER_CDN}"></script>`,
    `<link rel="stylesheet" href="${base}tokens.css">`,
    `<link rel="stylesheet" href="${base}core.css">`,
    `<link rel="stylesheet" href="${base}dzup-core.css">`,
    `<style>html,body{margin:0;padding:16px;background:var(--dz-background, transparent);color:var(--dz-foreground, inherit);font-family:system-ui,-apple-system,sans-serif;}</style>`,
    `<script>${themeBridge}</script>`,
  ].join('\n')
}

/** Import-map entries that make bare `@dzup-ui/*` specifiers resolve to the
 *  self-contained local bundle inside the sandbox. Merged on top of the REPL's
 *  built-in Vue map so Vue stays a shared singleton. */
export function dzupImportMap(): Record<string, string> {
  const base = playgroundAssetBase()
  return { '@dzup-ui/core': `${base}dzup-core.mjs` }
}

/** Read the current Storybook theme from the documented `data-theme` attribute
 *  the Theme toolbar sets on <html>; falls back to the OS preference. */
export function currentStorybookTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined')
    return 'light'
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark' || attr === 'light')
    return attr
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/** True when the visitor asked for reduced motion. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
