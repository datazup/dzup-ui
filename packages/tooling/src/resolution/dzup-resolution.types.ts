/**
 * The shape of a dzup-ui resolution decision (TASK-SK-1).
 *
 * Written before the implementation, on purpose: the argument this packet is
 * really about is that **a consumer must state which build of the library it is
 * resolving**, and that argument lives in the type, not in the algorithm.
 *
 * @module @dzup-ui/tooling/resolution
 */

/**
 * Which build of `@dzup-ui/*` a consumer resolves.
 *
 * - `merged-source` — every specifier resolves to the workspace package's
 *   **source**. This is what in-repo development needs: an edit in
 *   `packages/core/src` shows up without a rebuild. It also means the consumer
 *   is compiling the library itself, with the library's own source semantics
 *   (`.ts` extensions in relative imports, `.vue` SFCs), so the consumer needs
 *   the plugins to handle them.
 * - `externalized` — every specifier resolves to the package's **built**
 *   output, exactly as a published consumer would get it. This is the mode that
 *   proves a change survives the build, and the only mode an app outside this
 *   repository should use.
 *
 * There is deliberately **no default**. A default is how the current state
 * happened: five configs each hand-rolled a source-resolving alias map, nobody
 * wrote down that they had chosen anything, and an app outside the repository
 * ended up compiling the library from source without that ever being a
 * decision. Requiring the field turns an accident into a sentence.
 */
export type DzupResolutionMode = 'merged-source' | 'externalized'

/**
 * A `@dzup-ui/*` package name.
 *
 * A template literal rather than an enumerated union, because the set of
 * packages is **read from disk** — enumerating it here would be the handwritten
 * inventory the repo conventions forbid, and it would drift the first time
 * someone adds a package. Names outside the real set are rejected at runtime
 * with a message that lists what was actually found.
 */
export type DzupPackageName = `@dzup-ui/${string}`

/** One Vite alias entry. Structurally satisfied by Vite's own `Alias`. */
export interface DzupAliasEntry {
  readonly find: string
  readonly replacement: string
}

export interface DzupResolutionOptions {
  /** Required — see {@link DzupResolutionMode}. */
  readonly mode: DzupResolutionMode

  /**
   * Absolute path to the monorepo root (the directory holding `packages/`).
   *
   * Optional only for callers inside this repository, where it is derived from
   * this module's own location. An external app must pass it: its own
   * `node_modules/@dzup-ui/tooling` is not next to `packages/`.
   */
  readonly root?: string

  /**
   * Restrict the result to these packages. Defaults to every package found.
   *
   * Useful for an app that installs only `@dzup-ui/core` and `@dzup-ui/tokens`
   * and does not want aliases pointing at packages it has not installed.
   */
  readonly packages?: readonly DzupPackageName[]
}

/**
 * Why one entry resolves where it does — carried so a consumer can print the
 * decision instead of guessing, and so the tests can assert the *reason* rather
 * than only the path.
 */
export type DzupEntryOrigin
  /** Derived mechanically from the package's `exports` target. */
  = | 'exports'
  /**
   * The `exports` target is a build artifact with no source equivalent
   * (generated CSS, a generated Tailwind theme), so even `merged-source`
   * resolves it to `dist/`. It needs `yarn tokens:generate` to be current.
   */
    | 'generated-artifact'
  /**
   * A declared exception: the source file exists but is not where the
   * mechanical `dist/x.js` → `src/x.ts` rule would look. Every one of these
   * carries a reason and is asserted to be non-derivable.
   */
    | 'override'

export interface DzupResolutionEntry extends DzupAliasEntry {
  /** The package this entry belongs to, e.g. `@dzup-ui/core`. */
  readonly package: DzupPackageName
  /** The `exports` subpath it came from, e.g. `.` or `./providers`. */
  readonly subpath: string
  readonly origin: DzupEntryOrigin
  /** Present when `origin` is not `'exports'`. */
  readonly reason?: string
}

/**
 * The result, shaped to be spread into a Vite `resolve` config or a Storybook
 * `viteFinal`.
 *
 * `alias` is an **ordered array**, not a `Record<string, string>`. Vite matches
 * string `find` entries by prefix in declaration order, so the order is
 * load-bearing: `@dzup-ui/tokens` before `@dzup-ui/tokens/css` would resolve
 * the stylesheet to `packages/tokens/src/css`, a directory that does not exist.
 * An object invites a merge or a re-key that silently reorders it, and the
 * array is also the only form that can be spread into the array-shaped alias
 * config Storybook's `main.ts` already builds.
 */
export interface DzupResolution {
  readonly mode: DzupResolutionMode
  readonly alias: DzupResolutionEntry[]
  /**
   * Packages that must resolve to exactly one copy.
   *
   * Two copies of `vue` or `reka-ui` is the failure overlays hit first:
   * teleports land in the wrong root, focus traps fight each other, and
   * `provide`/`inject` silently misses. In `merged-source` the `@dzup-ui/*`
   * packages join the list, because a workspace link and an alias can otherwise
   * load the same package twice.
   */
  readonly dedupe: string[]
  /**
   * Vite pre-bundles bare imports from `node_modules`. In `merged-source` the
   * `@dzup-ui/*` specifiers point at working-tree source, so pre-bundling them
   * would serve a stale copy that ignores edits until the cache is cleared.
   */
  readonly optimizeDeps: { readonly exclude: string[] }
}
