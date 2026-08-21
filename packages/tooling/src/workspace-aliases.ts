/**
 * The one definition of how `@dzup-ui/*` specifiers resolve to workspace source
 * (TASK-FREE-12).
 *
 * Yarn's workspace links point at each package's **built** `dist/`, which is wrong
 * for local development: an app would render the last `yarn build` rather than the
 * working tree, and Storybook would need a rebuild between every edit. Every app
 * therefore aliases the published specifiers back to `src/`. That list has to agree
 * everywhere — it is a resolution contract, not a per-app preference — and it was
 * hand-copied into five configs (`.storybook/main.ts`, `apps/storybook/vite.config.ts`,
 * `apps/storybook/vitest.config.ts`, `apps/landing/vite.config.ts`, and the retired
 * `apps/sandbox/vite.config.ts`). The copies had already drifted: the two Storybook
 * ones were missing `@dzup-ui/core/styles`.
 *
 * **Ordering is load-bearing.** Vite matches string `find` entries by prefix, in
 * array order, so every sub-path export must precede the bare package alias.
 * `@dzup-ui/tokens/css` after `@dzup-ui/tokens` would resolve to
 * `packages/tokens/src/css` — a directory that does not exist. Keep the order below.
 *
 * **Why the CSS/Tailwind targets point at `dist/`.** `tokens.css` and
 * `tailwind-theme.js` are *generated* by `yarn tokens:generate`; there is no source
 * equivalent to alias to. They are committed artifacts (ADR-12), so this resolves
 * without a build step — but it does mean a token change needs `tokens:generate`
 * before an app reflects it.
 */
import type { Alias } from 'vite'
import { resolve } from 'node:path'

/**
 * Build the canonical workspace alias list.
 *
 * @param repoRoot Absolute path to the monorepo root (the directory holding
 * `packages/`). Each caller resolves this relative to its own config file.
 */
export function workspaceAliases(repoRoot: string): Alias[] {
  const pkg = (...segments: string[]): string => resolve(repoRoot, 'packages', ...segments)

  return [
    // Sub-path exports first — see "Ordering is load-bearing" above.
    { find: '@dzup-ui/tokens/css', replacement: pkg('tokens/dist/tokens.css') },
    { find: '@dzup-ui/tokens/tailwind', replacement: pkg('tokens/dist/tailwind-theme.js') },
    { find: '@dzup-ui/tokens/utils', replacement: pkg('tokens/src/utils/index.ts') },
    { find: '@dzup-ui/tokens', replacement: pkg('tokens/src') },
    { find: '@dzup-ui/core/styles', replacement: pkg('core/src/styles/base.css') },
    // Generated integration data (TASK-OSS-P1-02). The Nuxt module reads component
    // ownership from here rather than importing the component library.
    { find: '@dzup-ui/core/ownership', replacement: pkg('core/src/generated/component-ownership.ts') },
    { find: '@dzup-ui/contracts', replacement: pkg('contracts/src/index.ts') },
    { find: '@dzup-ui/testing/vitest', replacement: pkg('testing/src/vitest.ts') },
    { find: '@dzup-ui/testing', replacement: pkg('testing/src/index.ts') },
    { find: '@dzup-ui/core', replacement: pkg('core/src') },
  ]
}
