/**
 * The site's head copy — the one place the numbers Google, X, LinkedIn and every
 * AI crawler quote about this library are composed.
 *
 * `index.html` is static and cannot import TypeScript, so its four description
 * strings (meta, og, twitter, JSON-LD) are written INTO it at build time by
 * `scripts/build-counts.ts` from the templates below. Edit the copy here; never
 * hand-edit the strings in `index.html`. `src/claims.spec.ts` reads the file back
 * off disk and fails if the two disagree — which is how it was caught publishing
 * "147 components" against a real figure of 139.
 *
 * Which count goes in the head: the DOCUMENTED one (`COUNTS.documentedComponents`
 * — components with a Storybook page of their own), because that is what a person
 * evaluating the library can actually browse, and it is the figure the hero and
 * the stat row already show. The catalog figure (every exported `.vue`, sub-parts
 * included) is a different, larger, correctly-stated number — see DESIGN.md, which
 * publishes both with their rules.
 */

import { COUNTS } from '../generated/counts.ts'

/** The library's one-line pitch, minus the count. */
const PITCH = 'Built on Tailwind CSS 4, an OKLCH token system, and Reka UI accessible primitives. Light & dark out of the box.'

/** `<meta name="description">` and the JSON-LD `description` — the long form. */
export const META_DESCRIPTION
  = `${COUNTS.documentedComponents} accessible, open-source Vue 3 components across `
    + `${COUNTS.families} families. ${PITCH}`

/** `og:description` / `twitter:description` — the short form for social cards. */
export const SOCIAL_DESCRIPTION
  = `${COUNTS.documentedComponents} accessible, open-source Vue 3 components. `
    + 'One token system. Light & dark out of the box.'
