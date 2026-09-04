---
"@dzup-ui/contracts": patch
---

**The published `@dzup-ui/contracts` could not be loaded by Node's ESM resolver at all. It can now.** Any consumer whose bundler externalised it — every Nuxt app, on Nuxt 3 and Nuxt 4 alike — got a 500 on the first render.

`TASK-N5-03`. Five re-exports in the emitted `dist/index.js` were **extensionless**:

```js
export { ANATOMY_PART_VOCABULARY } from './anatomy.types'   // ← Node: ERR_MODULE_NOT_FOUND
```

`anatomy.types.js` is right there next to it. Node's ESM resolver does not care:
relative specifiers in ESM must carry their extension, and `tsc` emits the
specifier the source wrote. `packages/contracts/src` wrote extensionless ones,
so `tsc` emitted extensionless ones, and the file describes an import that
cannot resolve.

The failure a consumer saw:

```
Cannot find module '…/node_modules/@dzup-ui/contracts/dist/anatomy.types'
  imported from '…/node_modules/@dzup-ui/contracts/dist/index.js'
[nitro]  ├─ / (60ms)
  │ └── [500] Server Error
ERROR  Exiting due to prerender errors.
```

**Why nothing caught it.** Every gate that loads this package resolves modules
the way a *bundler* does, not the way Node does: Vitest and Vite both resolve
extensionless relative specifiers, and `tsconfig.base.json` sets
`moduleResolution: "bundler"`, which tells TypeScript to assume the same. Two
thousand unit tests, `typecheck:all`, `validate:exports`, `validate:dts` and
`validate:externals` all pass against a file Node cannot open. The Nuxt consumer
fixtures are the one lane in this repository that runs the published tarball
through Node — and they were red, on both Nuxt majors, for exactly this reason.

The fix is the convention `@dzup-ui/testing`, `@dzup-ui/mcp` and
`@dzup-ui/codemods` already use: relative specifiers carry `.js`, which
`moduleResolution: "bundler"` resolves to the `.ts` source at compile time and
Node resolves to the emitted `.js` at runtime. 27 specifiers across 7 files;
no type, no export and no runtime value changed.

A `patch` under `packages/contracts/VERSIONING.md`: nothing that worked stops
working, and something that never worked starts.
