/**
 * DzCodeBlock — design token references.
 *
 * Maps component-level CSS custom properties for theming support.
 *
 * @module @dzup-ui/core/components/data/DzCodeBlock.tokens
 */

export const codeBlockTokens = {
  root: {
    bg: 'var(--dz-codeblock-bg)',
    border: 'var(--dz-codeblock-border)',
    radius: 'var(--dz-codeblock-radius)',
    text: 'var(--dz-codeblock-text)',
    fontFamily: 'var(--dz-codeblock-font-family)',
    fontSize: 'var(--dz-codeblock-font-size)',
    lineHeight: 'var(--dz-codeblock-line-height)',
  },
  header: {
    bg: 'var(--dz-codeblock-header-bg)',
    text: 'var(--dz-codeblock-header-text)',
    paddingX: 'var(--dz-codeblock-header-padding-x)',
    paddingY: 'var(--dz-codeblock-header-padding-y)',
    fontSize: 'var(--dz-codeblock-header-font-size)',
  },
  lineNumber: {
    color: 'var(--dz-codeblock-line-number-color)',
    width: 'var(--dz-codeblock-line-number-width)',
  },
} as const
