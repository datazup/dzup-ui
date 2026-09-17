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
    radius: 'var(--dz-codeblock-radius, var(--dz-radius-lg))',
    text: 'var(--dz-codeblock-text)',
    fontFamily: 'var(--dz-codeblock-font-family, var(--dz-font-mono))',
    fontSize: 'var(--dz-codeblock-font-size, var(--dz-text-sm))',
    lineHeight: 'var(--dz-codeblock-line-height, var(--dz-leading-normal))',
  },
  header: {
    bg: 'var(--dz-codeblock-header-bg)',
    text: 'var(--dz-codeblock-header-text)',
    paddingX: 'var(--dz-codeblock-header-padding-x, var(--dz-spacing-4))',
    paddingY: 'var(--dz-codeblock-header-padding-y, var(--dz-spacing-2))',
    fontSize: 'var(--dz-codeblock-header-font-size, var(--dz-text-xs))',
  },
  lineNumber: {
    color: 'var(--dz-codeblock-line-number-color, var(--dz-codeblock-line-number))',
    width: 'var(--dz-codeblock-line-number-width, 2rem)',
  },
} as const
