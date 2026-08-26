# Resolving `@dzup-ui/*` from outside this repository

> Written by `TASK-SK-1`. Companion to the API reference in
> [`packages/tooling/README.md`](../packages/tooling/README.md#resolution--dzup-uitoolingresolution).
>
> This page is about applications that live **outside** `ui/dzup-ui` and consume
> the library. In-repo consumers (landing, sandbox, Storybook, the root Vitest
> config) already call the helper directly.

## The state this replaces

The alias logic that maps `@dzup-ui/*` onto files existed in **three**
independent implementations, none of which knew about the others:

| Where | Entries | Missing |
|---|---:|---|
| `packages/tooling/src/workspace-aliases.ts` (in-repo, TASK-FREE-12) | 10 | 21 of the declared specifiers |
| `apps/sandbox/vite.config.ts` (hand-rolled) | 7 | `@dzup-ui/core/ownership`, `@dzup-ui/testing`, `@dzup-ui/testing/vitest` |
| root `vitest.config.ts` (hand-rolled) | 8 | `@dzup-ui/tokens/css`, `/tailwind`, `/utils`, `@dzup-ui/core/styles`, `@dzup-ui/testing/vitest` |
| `@datazup/dzup-theme`'s `dzupAliases` (**another repository**) | 7 | `@dzup-ui/core/ownership`, `@dzup-ui/testing`, `@dzup-ui/testing/vitest` |

The first three are now one call to `createDzupResolution`. The fourth is not
ours to edit; the patch below is a proposal for its owner.

Two facts worth stating plainly, because they are what the helper exists to stop:

1. **Every copy resolved `@dzup-ui/core` to a directory**, so any deep path under
   `packages/core/src` resolved whether or not the package exported it.
   `@dzup-ui/core/providers` — imported by the landing app, the sandbox and
   Core's own source — was never in any alias list. It worked by accident.
2. **No copy set `dedupe`.** `vue` and `reka-ui` are Core's peer dependencies,
   and two copies of either is the failure overlays hit first: teleports land in
   the wrong root, focus traps fight, `provide`/`inject` misses. Nothing in the
   repository or its consumers guarded against it.

## What an external application should do

```ts
// vite.config.ts
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { createDzupResolution } from '@dzup-ui/tooling/resolution'

const dzup = createDzupResolution({
  // The library as a published consumer receives it. See "Which mode" below.
  mode: 'externalized',
  // Required outside the repository: this app's own node_modules is not next
  // to `packages/`.
  root: resolve(import.meta.dirname, '../../../../ui/dzup-ui'),
  // Only what the app installs, so no alias points at a package it lacks.
  packages: ['@dzup-ui/core', '@dzup-ui/tokens', '@dzup-ui/contracts'],
})

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@', replacement: resolve(import.meta.dirname, 'src') },
      ...dzup.alias,
    ],
    dedupe: dzup.dedupe,
  },
})
```

Spread `dzup.alias` **after** the app's own aliases and do not re-key it into an
object: Vite matches a string `find` by prefix in declaration order, and the
entries are sorted most-specific-first so `@dzup-ui/tokens/css` cannot be
swallowed by `@dzup-ui/tokens`.

### Which mode

| | `merged-source` | `externalized` |
|---|---|---|
| Resolves to | `packages/*/src` | `packages/*/dist` |
| Sees an uncommitted library edit | yes | no — rebuild first |
| Compiles the library | **yes**, so the app needs the Vue plugin and must tolerate `.ts`-suffixed relative imports | no |
| Matches what a published consumer gets | no | **yes** |
| Appropriate outside this repository | only for deliberate co-development | **default** |

`workspace-share/apps/website-app` currently resolves **source**, because
`dzupAliases` has no mode and only ever emitted source paths. That is very
likely not what its owner intended: it means an application in another
repository compiles this library from a working tree, and a broken build here
surfaces there as a type error in unfamiliar code.

## Patch proposal — `@datazup/dzup-theme`

**File:** `workspace-share/shared-kit/shared-app-kit/dzup-theme/src/vite/dzup-alias-config.ts`
**Owner:** shared-kit. Not applied here; `ui/dzup-ui` does not own that package.

`dzupAliases` is a hand-copied duplicate of a list that has since been derived.
Keeping it as a duplicate guarantees it drifts again — it already has, by three
entries. Make it a **re-export with the mode made explicit**, so there is one
implementation and the caller states its choice:

```ts
import type { DzupResolutionMode } from '@dzup-ui/tooling/resolution'
import { resolve } from 'node:path'
import { createDzupResolution } from '@dzup-ui/tooling/resolution'

export interface AliasEntry {
  find: string
  replacement: string
}

/**
 * @deprecated Pass a mode. `dzupAliases(dir)` resolves the library from
 * SOURCE, which is almost never what an application outside ui/dzup-ui wants.
 * Use `dzupResolution({ fromDir, mode: 'externalized' })`.
 */
export function dzupAliases(fromDir: string, dzupUiRoot?: string): AliasEntry[] {
  return dzupResolution({ fromDir, dzupUiRoot, mode: 'merged-source' }).alias
}

export function dzupResolution(options: {
  fromDir: string
  mode: DzupResolutionMode
  dzupUiRoot?: string
  packages?: `@dzup-ui/${string}`[]
}) {
  const { fromDir, mode, dzupUiRoot, packages } = options
  return createDzupResolution({
    mode,
    root: dzupUiRoot ?? resolve(fromDir, '../../../../ui/dzup-ui'),
    packages: packages ?? ['@dzup-ui/core', '@dzup-ui/tokens', '@dzup-ui/contracts'],
  })
}
```

Then `website-app`'s `apps/web/vite.config.ts` becomes:

```ts
const dzup = dzupResolution({ fromDir: import.meta.dirname, mode: 'externalized' })
// resolve: { alias: [ …app aliases, ...dzup.alias ], dedupe: dzup.dedupe }
```

### What the owner has to decide

1. **Which mode `website-app` should actually be in.** Switching it to
   `externalized` requires `yarn build` in `ui/dzup-ui` to have run — that is the
   point, but it is a workflow change and it is theirs to make. The deprecated
   wrapper above keeps today's behaviour until they do.
2. **How `@dzup-ui/tooling` reaches them.** It is `private: true` and
   unpublished. `website-app` already uses `portal:` entries for
   `@dzup-ui/core`, `/tokens` and `/contracts`; adding
   `"@dzup-ui/tooling": "portal:../../ui/dzup-ui/packages/tooling"` is the
   smallest change and needs no publication. If shared-kit would rather not
   depend on a private package, the alternative is for `ui/dzup-ui` to stop
   marking `tooling` private and publish it — a bigger decision, and not one
   this packet makes.
3. **Whether the fallback `dzupUiRoot` should stay.**
   `resolve(fromDir, '../../../../ui/dzup-ui')` encodes a directory layout four
   levels up. It is correct today and silently wrong the moment an app moves.

## Verifying a consumer resolves what it thinks it does

`createDzupResolution` returns the reason for every entry, so a consumer can
print its own resolution instead of guessing:

```ts
for (const entry of dzup.alias)
  console.log(entry.find, '→', entry.replacement, `[${entry.origin}]`)
```

`origin` is `exports` (derived from the package's `exports` map),
`generated-artifact` (`@dzup-ui/tokens/css` and `/tailwind`, which are written by
`yarn tokens:generate` and have no source form), or `override` (a declared
exception with a reason — there is exactly one).
