import { createElement } from 'react'
import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'
import { STATUS_BADGES, statusFromTags } from '../../../packages/core/stories/_shared/status.ts'

// ---------------------------------------------------------------------------
// TASK — dzup-ui manager brand identity.
//
// The manager UI (sidebar, toolbar, brand slot) renders OUTSIDE the preview
// iframe, so it has no access to the `--dz-*` token CSS. Every value below is
// therefore a literal that mirrors a `@dzup-ui/tokens` value:
//
//   --dz-colors-primary-500  oklch(0.550 0.2200 260)  ->  #0766ee   (brand blue)
//   --dz-colors-primary-600  oklch(0.470 0.2068 260)  ->  #004ecb
//   --dz-colors-primary-400  oklch(0.680 0.1804 260)  ->  #5195ff
//   --dz-colors-neutral-*    (hue 260, ~0 chroma)     ->  greys below
//
// Keep these in sync with packages/tokens/dist/tokens.css if the ramp moves.
// ---------------------------------------------------------------------------
const BRAND = '#0766ee' // primary-500
const BRAND_STRONG = '#004ecb' // primary-600
const BRAND_LIGHT = '#5195ff' // primary-400
const NEUTRAL = {
  50: '#f5f5f6',
  100: '#e7e8e9',
  200: '#d3d4d7',
  300: '#b5b7bb',
  600: '#717171',
  800: '#2e3034',
  900: '#1b1d1f',
  950: '#0a0b0d',
}

/**
 * The dzup-ui wordmark as an inline SVG data-URI. The badge (brand-blue square +
 * white "up" chevron) is constant; only the wordmark ink + accent adapt so the
 * logo stays legible on both the light and dark manager chrome.
 */
function logo(ink: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="28" viewBox="0 0 120 28" role="img" aria-label="dzup-ui">
  <rect y="2" width="24" height="24" rx="6" fill="${BRAND}"/>
  <path d="M6 18l6-4.5 6 4.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6 22l6-4.5 6 4.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
  <text x="33" y="19" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700" fill="${ink}">dzup<tspan font-weight="500" fill="${accent}">&#8202;ui</tspan></text>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const shared = {
  brandTitle: 'dzup-ui',
  brandUrl: 'https://github.com/datazup/dzup-ui',
  brandTarget: '_blank',
  colorPrimary: BRAND,
  colorSecondary: BRAND, // selection / active accent in the sidebar + toolbar
  appBorderRadius: 8,
  inputBorderRadius: 6,
  fontBase: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
  fontCode: 'ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, monospace',
}

const lightTheme = create({
  ...shared,
  base: 'light',
  brandImage: logo(NEUTRAL[900], BRAND),
  appBg: NEUTRAL[50],
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: NEUTRAL[200],
  textColor: NEUTRAL[900],
  textInverseColor: NEUTRAL[50],
  barTextColor: NEUTRAL[600],
  barSelectedColor: BRAND_STRONG,
  barHoverColor: BRAND,
  barBg: '#ffffff',
  inputBg: '#ffffff',
  inputBorder: NEUTRAL[300],
  inputTextColor: NEUTRAL[900],
})

const darkTheme = create({
  ...shared,
  base: 'dark',
  brandImage: logo(NEUTRAL[50], BRAND_LIGHT),
  appBg: NEUTRAL[900],
  appContentBg: NEUTRAL[950],
  appPreviewBg: NEUTRAL[950],
  appBorderColor: NEUTRAL[800],
  textColor: NEUTRAL[50],
  textInverseColor: NEUTRAL[900],
  barTextColor: NEUTRAL[300],
  barSelectedColor: BRAND_LIGHT,
  barHoverColor: BRAND_LIGHT,
  barBg: NEUTRAL[950],
  inputBg: NEUTRAL[950],
  inputBorder: NEUTRAL[800],
  inputTextColor: NEUTRAL[50],
})

// Match the OS colour scheme so the branded chrome stays consistent whether the
// viewer runs the manager in light or dark — the same brand blue anchors both.
const prefersDark =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false

// TASK-0.13 — render a component-status badge next to each entry in the sidebar.
// The taxonomy/labels come from the single source (`_shared/status.ts`); colors
// here are literal hex (the manager UI runs outside the preview iframe and has
// no access to the `--dz-*` token CSS).
const BADGE_HEX: Record<string, string> = {
  experimental: '#b45309', // amber-700
  beta: '#1d4ed8', // blue-700
  stable: '#15803d', // green-700
  deprecated: '#b91c1c', // red-700
}

addons.setConfig({
  theme: prefersDark ? darkTheme : lightTheme,
  sidebar: {
    showRoots: true,
    renderLabel: (item) => {
      const status = statusFromTags((item as { tags?: string[] }).tags)
      if (!status || item.type !== 'component') {
        return item.name
      }
      const meta = STATUS_BADGES[status]
      return createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, [
        createElement('span', { key: 'name' }, item.name),
        createElement(
          'span',
          {
            key: 'badge',
            title: meta.description,
            style: {
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
              color: BADGE_HEX[status],
              border: `1px solid ${BADGE_HEX[status]}`,
              borderRadius: 4,
              padding: '0 4px',
              lineHeight: '14px',
            },
          },
          meta.label,
        ),
      ])
    },
  },
  enableShortcuts: true,
})
