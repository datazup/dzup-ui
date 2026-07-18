/**
 * Styles build entry — side-effect CSS imports only.
 *
 * Everything imported here is extracted by the vite lib build into the
 * single dist/core.css asset (exported as `@dzup-ui/core/styles`).
 * Note: base.css is intentionally NOT imported — it has never shipped to
 * consumers, and adding its global resets would change every app.
 */

import './prose.css'

/** Root class of the rich-content typography family shipped in core.css. */
export const DZ_PROSE_CLASS = 'dz-prose'
