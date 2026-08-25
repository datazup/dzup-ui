/**
 * useRevealAndFocus composable — public exports.
 *
 * @module @dzup-ui/core/composables/useRevealAndFocus
 */
export type { RevealAndFocusOptions } from './useRevealAndFocus.ts'
/**
 * `revealAndFocus` is deliberately not re-exported here.
 *
 * The ownership schema has no `utility` kind, so a bare exported function lands
 * as `unclassified` — and that count is under a ceiling which only ratchets
 * down. The composable is the supported entry point; the standalone function is
 * what it is built from and is reachable by deep import for a test.
 */
export { useRevealAndFocus } from './useRevealAndFocus.ts'
