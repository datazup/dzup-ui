/**
 * Browser-backed responsive certification contract for the Blocks catalog.
 *
 * Keep this module dependency-free: the Playwright suite imports it directly in
 * Node, while landing Vitest specs compare its declared probes with `BLOCKS`.
 * A viewport or probe added here therefore changes both the browser evidence and
 * the trust-mark contract instead of leaving a decorative claim behind.
 */

export const RESPONSIVE_VIEWPORTS = [
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
  { id: 'desktop', label: 'Desktop', width: 1280, height: 900 },
] as const

export type ResponsiveViewportId = (typeof RESPONSIVE_VIEWPORTS)[number]['id']

export type ResponsiveProbeProperty = 'gridColumns' | 'flexDirection' | 'alignItems'

export interface ResponsiveProbe {
  /** Stable element owned by the block whose computed layout proves the reflow. */
  selector: string
  /** Computed-layout measurement made by the real browser. */
  property: ResponsiveProbeProperty
  /** Exact expected value at every certified viewport. */
  expected: Record<ResponsiveViewportId, string | number>
}

/**
 * Structural proof for every block that declares `responsive.mobile` in the
 * registry. The paired Vitest guard fails if those ids and these probes drift.
 */
export const RESPONSIVE_PROBES = {
  'sticky-aside': {
    selector: '.sa-row',
    property: 'flexDirection',
    expected: { mobile: 'column', tablet: 'column', desktop: 'row' },
  },
  'page-scaffold': {
    selector: '.ps-split',
    property: 'flexDirection',
    expected: { mobile: 'column', tablet: 'column', desktop: 'row' },
  },
  'auth-split': {
    selector: '.as-root',
    property: 'gridColumns',
    expected: { mobile: 1, tablet: 1, desktop: 2 },
  },
  'product-grid': {
    selector: '.pg-grid',
    property: 'gridColumns',
    expected: { mobile: 1, tablet: 2, desktop: 3 },
  },
  'product-detail': {
    selector: '.pd-grid',
    property: 'gridColumns',
    expected: { mobile: 1, tablet: 2, desktop: 2 },
  },
  'category-header': {
    selector: '.ch-title-row',
    property: 'alignItems',
    expected: { mobile: 'flex-start', tablet: 'flex-end', desktop: 'flex-end' },
  },
  'order-status': {
    selector: '.os-stepper',
    property: 'flexDirection',
    expected: { mobile: 'column', tablet: 'row', desktop: 'row' },
  },
  'blog-list': {
    selector: '.bl-grid',
    property: 'gridColumns',
    expected: { mobile: 1, tablet: 2, desktop: 3 },
  },
  'toc-aside': {
    selector: '.ta-grid',
    property: 'gridColumns',
    expected: { mobile: 1, tablet: 1, desktop: 2 },
  },
  'faq-2col': {
    selector: '.fq-cols',
    property: 'gridColumns',
    expected: { mobile: 1, tablet: 1, desktop: 2 },
  },
} as const satisfies Record<string, ResponsiveProbe>

export type ResponsiveProbeBlockId = keyof typeof RESPONSIVE_PROBES
