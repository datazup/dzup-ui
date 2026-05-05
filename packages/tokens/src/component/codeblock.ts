/**
 * CodeBlock Component Tokens
 *
 * Component-level token mappings for the DzCodeBlock display component.
 * References semantic tokens. Consumers can override per-component.
 */

export const CODEBLOCK_TOKENS: Record<string, string> = {
  '--dz-codeblock-bg': 'var(--dz-surface-raised)',
  '--dz-codeblock-border': 'var(--dz-border)',
  '--dz-codeblock-radius': 'var(--dz-radius-lg)',
  '--dz-codeblock-padding': 'var(--dz-spacing-4)',
  '--dz-codeblock-font-family': 'var(--dz-font-mono)',
  '--dz-codeblock-font-size': 'var(--dz-text-sm)',
  '--dz-codeblock-line-height': '1.7',
  '--dz-codeblock-text': 'var(--dz-foreground)',

  /* ── Header ── */
  '--dz-codeblock-header-bg': 'var(--dz-muted)',
  '--dz-codeblock-header-padding-x': 'var(--dz-spacing-4)',
  '--dz-codeblock-header-padding-y': 'var(--dz-spacing-2)',
  '--dz-codeblock-header-font-size': 'var(--dz-text-xs)',
  '--dz-codeblock-header-color': 'var(--dz-muted-foreground)',

  /* ── Line Numbers ── */
  '--dz-codeblock-line-number-color': 'var(--dz-muted-foreground)',
  '--dz-codeblock-line-number-width': '3rem',
}
