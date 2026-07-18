import { createElement, useEffect, useState } from 'react'
import { addons, types } from 'storybook/manager-api'
import { create } from 'storybook/theming'
import { STATUS_BADGES, statusFromTags } from '../../../packages/core/stories/_shared/status.ts'
import { BRAND_COLORS, NEUTRAL_COLORS, PAPER, STATUS_BADGE_COLORS } from './brandPalette.ts'

// ---------------------------------------------------------------------------
// dzup-ui manager brand identity.
//
// The manager UI (sidebar, toolbar, brand slot) renders OUTSIDE the preview
// iframe, so it has no access to the `--dz-*` token CSS and its colours must be
// literals. Those literals live in `brandPalette.ts`, each paired with the token
// it mirrors, and `@dzup-ui/tooling`'s `manager-brand-palette.spec.ts` recomputes
// every one from `tokens.css` and fails on drift.
//
// This file therefore has no colour of its own — reach for a token-backed entry
// in `brandPalette.ts` rather than adding a hex here (TASK-FREE-17).
// ---------------------------------------------------------------------------

const BRAND = BRAND_COLORS.base.hex
const BRAND_STRONG = BRAND_COLORS.strong.hex
const BRAND_LIGHT = BRAND_COLORS.light.hex
const NEUTRAL = {
  50: NEUTRAL_COLORS[50].hex,
  100: NEUTRAL_COLORS[100].hex,
  200: NEUTRAL_COLORS[200].hex,
  300: NEUTRAL_COLORS[300].hex,
  600: NEUTRAL_COLORS[600].hex,
  800: NEUTRAL_COLORS[800].hex,
  900: NEUTRAL_COLORS[900].hex,
  950: NEUTRAL_COLORS[950].hex,
}

/**
 * The dzup-ui wordmark as an inline SVG data-URI. The badge (brand-blue square +
 * white "up" chevron) is constant; only the wordmark ink + accent adapt so the
 * logo stays legible on both the light and dark manager chrome.
 */
function logo(ink: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="28" viewBox="0 0 120 28" role="img" aria-label="dzup-ui">
  <rect y="2" width="24" height="24" rx="6" fill="${BRAND}"/>
  <path d="M6 18l6-4.5 6 4.5" fill="none" stroke="${PAPER}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6 22l6-4.5 6 4.5" fill="none" stroke="${PAPER}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
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
  appContentBg: PAPER,
  appPreviewBg: PAPER,
  appBorderColor: NEUTRAL[200],
  textColor: NEUTRAL[900],
  textInverseColor: NEUTRAL[50],
  barTextColor: NEUTRAL[600],
  barSelectedColor: BRAND_STRONG,
  barHoverColor: BRAND,
  barBg: PAPER,
  inputBg: PAPER,
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

// ---------------------------------------------------------------------------
// Manager chrome theme (TASK-FREE-17).
//
// Match the OS colour scheme so the branded chrome stays consistent whether the
// viewer runs the manager in light or dark — the same brand blue anchors both.
//
// This used to be a single `.matches` read at module load, which meant it could
// never fire twice: changing the OS theme mid-session left the sidebar and
// toolbar on the old chrome until a full reload, while the PREVIEW iframe (whose
// `theme` global is independent) had already switched. Now we subscribe to the
// MediaQueryList and re-apply, and the viewer can also override the OS entirely.
//
// Re-applying works because `addons.setConfig` is not load-time-only: it
// `Object.assign`s onto the stored config and emits SET_CONFIG on the channel,
// which the manager is listening to. Calling it again with a new `theme` is the
// supported way to restyle live.
// ---------------------------------------------------------------------------

/** `system` follows the OS; `light`/`dark` pin the chrome regardless of it. */
type ThemePreference = 'system' | 'light' | 'dark'

const THEME_PREF_KEY = 'dzup-ui:manager-theme'

const darkQuery
  = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : undefined

/** Read the stored override. Storage can throw (private mode) — default to OS. */
function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_PREF_KEY)
    if (stored === 'system' || stored === 'light' || stored === 'dark')
      return stored
  }
  catch {}
  return 'system'
}

function writePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_PREF_KEY, preference)
  }
  catch {}
}

function resolveTheme(preference: ThemePreference) {
  const dark = preference === 'system' ? (darkQuery?.matches ?? false) : preference === 'dark'
  return dark ? darkTheme : lightTheme
}

function applyTheme(preference: ThemePreference): void {
  addons.setConfig({ theme: resolveTheme(preference) })
}

// The listener that the old one-shot read could never have. Only `system` tracks
// the OS — an explicit override must survive the OS flipping underneath it.
darkQuery?.addEventListener('change', () => {
  if (readPreference() === 'system')
    applyTheme('system')
})

const THEME_LABELS: Record<ThemePreference, string> = {
  system: '🖥️ OS theme',
  light: '☀️ Light',
  dark: '🌙 Dark',
}

const NEXT_PREFERENCE: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

/**
 * The manual override, cycling system → light → dark. Storybook exposes no
 * built-in switcher for the MANAGER theme (the toolbar's theme control belongs to
 * addon-themes and drives the preview iframe only), so this is a small tool of
 * our own. It lives in the toolbar because that is the only surface an addon can
 * render into; the preference persists per browser.
 */
function ManagerThemeTool() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference)

  useEffect(() => {
    applyTheme(preference)
  }, [preference])

  return createElement(
    'button',
    {
      'type': 'button',
      'title': `Manager chrome: ${THEME_LABELS[preference]} — click to change`,
      'aria-label': `Manager chrome theme: ${THEME_LABELS[preference]}. Click to change.`,
      'onClick': () => {
        const next = NEXT_PREFERENCE[preference]
        writePreference(next)
        setPreference(next)
      },
      'style': {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        font: 'inherit',
        fontSize: 12,
        padding: '0 8px',
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color: 'inherit',
      },
    },
    THEME_LABELS[preference],
  )
}

addons.register('dzup-ui/manager-theme', () => {
  addons.add('dzup-ui/manager-theme', {
    type: types.TOOL,
    title: 'Manager theme',
    // Every story, plus the MDX docs pages — the chrome is global, so the control
    // for it should not vanish depending on what is selected.
    match: () => true,
    render: () => createElement(ManagerThemeTool),
  })
})

// TASK-0.13 — render a component-status badge next to each entry in the sidebar.
// The taxonomy/labels come from the single source (`_shared/status.ts`); the ink
// comes from `brandPalette.ts`, which ties each literal to its token and is
// drift-checked. These four used to be Tailwind's amber/blue/green/red-700 rather
// than dzup-ui's own ramp of the same names — close enough to look deliberate,
// and wrong (TASK-FREE-17).
const BADGE_HEX: Record<string, string> = {
  experimental: STATUS_BADGE_COLORS.experimental.hex,
  beta: STATUS_BADGE_COLORS.beta.hex,
  stable: STATUS_BADGE_COLORS.stable.hex,
  deprecated: STATUS_BADGE_COLORS.deprecated.hex,
}

addons.setConfig({
  theme: resolveTheme(readPreference()),
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
