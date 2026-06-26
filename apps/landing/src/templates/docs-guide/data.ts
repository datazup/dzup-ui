/**
 * Sample content for the Docs / Guide template (docs/templates.md §6.5).
 * Co-located so the template is self-contained (§7). Content only — token-driven
 * with no painted artwork, so this file carries no raw hex.
 */

/** A single link in the docs sidebar. */
export interface NavLink {
  label: string
  /** Marks the page currently being read. */
  active?: boolean
}

/** A titled group of links in the docs sidebar. */
export interface NavGroup {
  title: string
  links: NavLink[]
}

/** A right-rail "On this page" anchor (matches DzAnchor's item shape). */
export interface AnchorItem {
  href: string
  label: string
}

export const SIDEBAR: NavGroup[] = [
  {
    title: 'Getting started',
    links: [
      { label: 'Introduction' },
      { label: 'Installation' },
      { label: 'Quick start' },
    ],
  },
  {
    title: 'Core concepts',
    links: [
      { label: 'Components' },
      { label: 'Design tokens' },
      { label: 'Theming', active: true },
      { label: 'Accessibility' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { label: 'Dark mode' },
      { label: 'Multi-brand' },
      { label: 'Server rendering' },
    ],
  },
]

export const TOC: AnchorItem[] = [
  { href: '#overview', label: 'Overview' },
  { href: '#tokens', label: 'How theming works' },
  { href: '#override', label: 'Overriding tokens' },
  { href: '#dark', label: 'Dark mode' },
]

export const INSTALL_CODE = `import { createApp } from 'vue'
import { DzThemeProvider } from '@dzup-ui/core'
import '@dzup-ui/tokens/theme.css'

createApp(App).mount('#app')`

export const OVERRIDE_CODE = `:root {
  --dz-primary: oklch(0.62 0.19 256);
  --dz-radius-md: 0.5rem;
}

/* Re-point a single token and every component follows. */
[data-theme='dark'] {
  --dz-background: oklch(0.21 0.02 264);
  --dz-foreground: oklch(0.98 0 0);
}`
