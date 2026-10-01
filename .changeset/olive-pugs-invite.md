---
"@dzup-ui/nuxt": patch
---

Fix the Nuxt module build, which had not produced output since the
`@dzup-ui/contracts` import was added.

`packages/nuxt/tsconfig.json` set `rootDir: ./src` while `tsconfig.base.json`
maps `@dzup-ui/contracts` to contracts **source**, so every contracts file
became a program input outside `rootDir`: 16 × `TS6059`, no emit, and 48 stray
`.js`/`.d.ts` files written into `packages/contracts/src/`. The build never
reported it because it already stopped two workspaces earlier, and no type gate
covers this package — `yarn typecheck:all` does not include `packages/nuxt`.

`tsconfig.json` is now the typecheck view (no `rootDir`, no emit, contracts
still resolved from source so a typecheck never depends on a prior build), and
a new `tsconfig.build.json` is what `yarn build` compiles: it restores
`rootDir` and declaration emit, and resolves `@dzup-ui/contracts` to the
published `dist/index.d.ts` a consumer actually receives. The published layout
is unchanged.

Also fixes a type error in `componentsToRegister`, where inference narrowed
`from` to the generated `OwningPackage` union and rejected the `pkg/sub`
specifier a second-tier ownership manifest may legitimately carry. The
annotation is the function's own declared return type; behaviour is unchanged.
