/**
 * CodeBlock Component Tokens
 *
 * The layout half of DzCodeBlock's `--dz-codeblock-*` set, emitted into the
 * component tier of tokens.css and consumed by `DzCodeBlock.variants.ts`.
 *
 * The colour half (`--dz-codeblock-bg`, `-text`, `-border`, `-header-bg`,
 * `-header-text`, `-line-number`) lives in the semantic tier
 * (`semantic/light.ts`, `semantic/dark.ts`), because the high-contrast cascade
 * maps those six to system colours by name. Each name is declared exactly once
 * (UI-DZUP-UI-DESIGN-L-01, decision D2): a code block is a muted panel in
 * every theme, matching what DzCodeBlock always rendered.
 */

export const CODEBLOCK_TOKENS: Record<string, string> = {
  '--dz-codeblock-radius': 'var(--dz-radius-lg)',
  '--dz-codeblock-padding': 'var(--dz-spacing-4)',
  '--dz-codeblock-font-family': 'var(--dz-font-mono)',
  '--dz-codeblock-font-size': 'var(--dz-text-sm)',
  /* 1.25rem on the 0.875rem default size (calc(1.25 / 0.875)), the line box `text-sm`
   * always gave the block; a plain number so the DTCG export can type it. */
  '--dz-codeblock-line-height': '1.4286',

  /* ── Header ── */
  '--dz-codeblock-header-padding-x': 'var(--dz-spacing-4)',
  '--dz-codeblock-header-padding-y': 'var(--dz-spacing-2)',
  '--dz-codeblock-header-font-size': 'var(--dz-text-xs)',

  /* ── Line Numbers ── */
  '--dz-codeblock-line-number-width': '2rem',
}
