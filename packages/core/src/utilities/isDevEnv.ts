/**
 * isDevEnv — the one dev-mode check for library diagnostics (UI-DZUP-UI-CODE-M-17).
 *
 * The guards used to read `import.meta.env?.DEV`. Our packages are built in Vite
 * lib mode, which replaces `import.meta.env.*` with fixed values at build time,
 * so every such guard became `if (false)` and its warning was deleted from
 * `dist` before any consumer could see it. A `define` cannot fix that: Vite only
 * accepts a literal or an entity name there, not an expression.
 *
 * `process.env.NODE_ENV` is the check lib mode deliberately leaves alone, so it
 * survives into `dist` and the CONSUMER's bundler decides it: Vite (dev and
 * build), webpack and Rollup replace it, the dev build keeps the warning and the
 * production build drops it. Vitest and SSR run on Node, where it is real.
 *
 * Deliberately bare, with no `typeof process` guard: a browser bundle replaces
 * the `process.env.NODE_ENV` expression but never defines `process` itself, so a
 * guard would read false in every browser dev build and silence the warnings
 * again. It is the same contract Vue's own `esm-bundler` build — our peer
 * dependency — already places on every consumer.
 *
 * @module @dzup-ui/core/utilities/isDevEnv
 */

/** `true` unless the consumer's build has `NODE_ENV` set to `production`. */
export function isDevEnv(): boolean {
  // eslint-disable-next-line node/prefer-global/process -- must stay the bare global the consumer's bundler replaces
  return process.env.NODE_ENV !== 'production'
}
