# @dzup-ui/nuxt

## 0.1.0

### Minor Changes

- 5773f65: **`@dzup-ui/nuxt` now depends on `@nuxt/kit@4.5.2` instead of `3.14.0`.** If you install this module, `@nuxt/kit` 4 arrives in your dependency tree — including on a Nuxt 3 project.

  `TASK-N5-03`. `minor`, which under `packages/contracts/VERSIONING.md` is the
  **breaking** position for a `0.x` package: a consumer on `^0.1.0` does not
  receive this automatically, and that is the intent. A module quietly changing
  which major of `@nuxt/kit` it drags into somebody's project is not a patch.

  **What was verified, and on what.**

  | Check                                       | Result    |
  | ------------------------------------------- | --------- |
  | `tsc --noEmit` against `@nuxt/schema` 4.4.5 | passes    |
  | `tsc --project tsconfig.json` (build)       | passes    |
  | 46 unit tests (`packages/nuxt/src`)         | pass      |
  | Consumer fixtures on `nuxt@4.4.5`           | see below |
  | Consumer fixtures on `nuxt@3.19.0`          | see below |

  Nothing in `src/module.ts` needed changing. Every kit API this module uses —
  `defineNuxtModule`, `addComponent`, `useLogger`, `nuxt.options.css`,
  `nuxt.options.build.transpile`, `nuxt.options.app.head.script`,
  `nuxt.options.rootDir` — is unchanged between kit 3 and kit 4.

  **The declared floor did NOT move.** `peerDependencies.nuxt` is still
  `>=3.0.0`, and `meta.compatibility.nuxt` is still `>=3.0.0`. Narrowing them is
  an owner decision (`N5-03-D2` in
  `docs/program-2026-09/reports/N5-03-toolchain-currency-handoff.md`) and it should
  be taken on evidence: the fixture lane now runs **both** majors
  (`.github/workflows/vue-next.yml`, job `nuxt-majors`), so "does this still work
  on Nuxt 3?" is answered by a run rather than by an assumption.

  **A Node-floor fact that constrains the answer.** `nuxt` <= 4.4.5 declares
  `engines.node: ^20.19.0 || >=22.12.0`; `nuxt` >= 4.4.6 declares
  `^22.12.0 || ^24.11.0 || >=26.0.0`. This repository declares `^20.19.0 || >=22.13.0`
  and CI runs 20.19.0, so the fixtures pin `4.4.5` exactly rather than `^4`.
  Moving to a newer Nuxt 4 is an **ADR-18 amendment**, not a dependency bump.

### Patch Changes

- 527dbd1: **A pane and a column can now be resized with a single pointer and no dragging, and the packages say which browsers they are built for.**

  **WCAG 2.2 SC 2.5.7 Dragging Movements was measured as not met on three
  surfaces** — `DzResizable`, `DzSplitter` and `DzTable`'s column resize. All
  three were keyboard-operable, and a keyboard path satisfies SC 2.1.1, not this
  one: the criterion is about pointer input and asks for a single pointer without
  dragging. `DzTable`'s handle was the worst of them, because `@click.stop` sat on
  it and discarded the one plain press that might have been a non-drag path.

  Each of the three now carries a **stepper pair** — one control that shrinks, one
  that grows:
  - **Nothing moves until you reach for it.** The pair is absolutely positioned
    over the gutter (or, for a column, over the header cell) and rests fully
    transparent, so it occupies no layout and paints nothing: every splitter and
    every table header looks exactly as it did, and no consuming layout shifts.
    It is revealed by hovering the gutter, by focusing the separator, or by one
    tap on a device that has no hover. The **DOM** does gain two buttons per
    handle, so a consumer's own DOM snapshot of one of these three components will
    need re-recording — that is the one thing this change asks of you.
  - **It is the same step as the keyboard.** On a splitter, a press dispatches the
    very `keydown` the arrow keys already drive, so the step is `keyboardResizeBy`
    and `Shift` is still the full sweep. On a column, both paths call one
    function: 8 px, or 24 px with `Shift`.
  - **There is no prop to switch it off.** A conformance claim a consumer can
    withdraw is not one worth publishing.
  - Each control is **24 × 24 CSS px**, the SC 2.5.8 floor, measured in chromium,
    firefox and webkit.

  New `data-part` names you can style and test against: `step-decrease` and
  `step-increase` on the resizable, splitter and table anatomies. `DzTable`'s
  column-resize handle also gains `data-part="separator"` — it has carried
  `role="separator"` all along — plus `aria-valuenow` and `aria-valuemin`, so a
  screen reader is told the width it is changing.

  Four catalog keys, so nothing is hard-coded English:
  `DzResizableHandle.shrinkPane`, `DzResizableHandle.growPane`,
  `DzTableCell.narrowColumn`, `DzTableCell.widenColumn`.

  **The packages now declare a supported-browser floor.** All six published
  packages carry a `browserslist` key naming the same range. It is not a
  preference: it is the lowest range the published CSS can be generated for, so a
  declaration below it would be a promise the build could not keep. The
  browser-support evidence page reads it out of the tree and prints, beside it,
  the engines the matrix actually drives — a browser the floor admits and no lane
  measures is named as supported by declaration and nothing more.

  This is a `patch` under `packages/contracts/VERSIONING.md`: every part, key and
  attribute above is **added**, none is removed, renamed or narrowed, and §3's
  accessibility carve-out puts a corrected rendered accessibility attribute in the
  patch position deliberately — we would rather ship the fix than hold it for a
  range bump.

- 7edd39a: **A second-tier package can now publish an ownership manifest, and `includePro` resolves it.**

  `DzResolver({ includePro: true })` and the Nuxt module's `includePro` have
  advertised a second tier since the resolver was rewritten to exact-name lookup.
  Neither could resolve anything, and the reason was not the code: **this
  repository had never published the schema an ownership manifest would conform
  to.** The shape existed only inside `@dzup-ui/tooling`, which is private, so no
  downstream package could produce a conforming manifest even in principle. The
  seam was recorded as "blocked" across two programmes, waiting on an artifact
  nobody had specified.

  **`@dzup-ui/contracts` now publishes that schema.** Pure, dependency-free, and
  usable by any package that wants its components auto-imported:

  ```ts
  import { OWNERSHIP_MANIFEST_SUBPATH, readOwnershipManifest } from '@dzup-ui/contracts'
  ```

  - `OWNERSHIP_MANIFEST_SCHEMA_VERSION` (`1.1.0`), `OWNERSHIP_MANIFEST_SCHEMA_MAJOR`
    (`1`) and `OWNERSHIP_MANIFEST_SUBPATH`
    (`./manifests/component-ownership.manifest.json`, a **declared exports
    subpath**).
  - `OwnershipManifestDocument` / `OwnershipManifestEntry` and the kind, status and
    tier vocabularies — the same sets this repository's own generator emits, so one
    reader serves both tiers.
  - `readOwnershipManifest`, `indexOwnershipManifest`, `consumeOwnershipManifest`,
    `isSupportedOwnershipSchema`, `ownershipSpecifier` and the two diagnostics.

  Required per entry: `symbol`, `package`, `subpath`, `kind` — all facts a
  component library can generate about itself. `since`, `deprecated`, `family`,
  `status`, `subpaths`, `anatomy` and `evidence` are optional. `evidence` is
  required of this repository's own manifest and optional here on purpose: it
  names authority paths inside the _producing_ repository, which a consumer cannot
  open and no resolver reads.

  **`@dzup-ui/core`** — the resolver reads a conforming manifest from the installed
  second-tier package, **as data**, at construction time. It never imports
  second-tier runtime source, so nothing in that package executes in your build.
  New `resolveFrom` option names the project directory to resolve from (default
  `process.cwd()`). Unknown names answer `undefined` in **both** tiers.

  **`@dzup-ui/nuxt`** — `includePro` registers the second tier's mountable
  components from that manifest, each from the subpath the manifest declares, so a
  part can come from a narrower entry point than the root barrel.
  `componentsToRegister` takes an optional second argument; every existing call is
  unchanged. `proTierMissingMessage()` is deprecated — still exported, no longer
  emitted — because a table baked in when `@dzup-ui/core` was built is no longer
  the only route to a second tier, and it is not the one that matters: the version
  **you** installed is the version whose components you can import.

  Three failures, three different owners, three different messages — none of them
  silence:
  - **Package not installed** → install it, or turn the option off. Unchanged,
    byte for byte.
  - **Installed, no conforming manifest** → the subpath to export, named as a gap
    in _that_ package rather than something you failed to install.
  - **A schema major this build cannot read** → refused with the version named,
    never parsed best-effort. A resolver guessing at a redefined field misroutes
    imports silently, which is the defect this whole path exists to end.

  A name both tiers export keeps the first tier's answer and names both packages.
  Nothing picks a winner between two tiers at your build time.

  Patch, not minor: nothing was removed and no existing answer changed. Names that
  used to resolve to `undefined` because no second tier could exist may now
  resolve — which is the option finally doing what it says.

- 4c9fb7a: **`@dzup-ui/nuxt` pushed a stylesheet path the tokens package does not export, so every consumer install failed.**

  The module added `@dzup-ui/tokens/dist/tokens.css` to `nuxt.options.css`. That
  deep path is not in the tokens package's `exports` map — the declared specifier
  is `@dzup-ui/tokens/css` — so a real install died at build time with:

  ```
  Missing "./dist/tokens.css" specifier in "@dzup-ui/tokens" package
  ```

  It resolved in this repository only because the workspace's `node_modules` are
  symlinks into the source tree, which is precisely the class of defect a
  workspace-alias test cannot see. It was found by installing the packed tarball
  into a Nuxt app.

  Also in this release:
  - **Registration comes from generated ownership data.** The module carried a
    second handwritten Pro list beside the resolver's, and the two had drifted
    from each other and from both packages: it classified the Core components
    `DzAppShell` and `DzCalendar` as Pro, and named Pro components
    (`DzScheduler`, `DzComment`, `DzVirtualTable`) that Pro does not export. Both
    lists are gone; the module reads `@dzup-ui/core/ownership`.
  - **`includePro: true` with Pro absent now explains itself.** The build no
    longer fails on an unresolvable import — it logs which package is missing,
    which option asked for it, and the command that installs it, then continues
    with Core.
  - **`prefix` stops mangling un-prefixed names.** The old rule was
    `name.slice(2)` unconditionally, which turned `TeamMemberBadge` into
    `AcmeamMemberBadge`. Names without the `Dz` prefix are now registered
    unchanged.
  - **`@dzup-ui/core` gains an `./ownership` subpath** exposing the generated
    ownership table, so integrations can read component ownership without
    importing the component library.

- 7edd39a: Fix the Nuxt module build, which had not produced output since the
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

- 4c9fb7a: **The Pro package is `@dzup-ui-pro/pro`. The resolver and the Nuxt module named a package that has never existed.**

  `DzResolver({ includePro: true })` emitted `from: '@dzup-ui/pro'`, and
  `@dzup-ui/nuxt` transpiled and registered components from the same string. No
  such package is published under any plan — the commercial tier is
  `@dzup-ui-pro/pro` — so every consumer who followed the documented `includePro`
  path got an unresolvable import for the one feature the option exists to enable.

  The reason it survived is the part worth recording: `resolver.spec.ts` asserted
  the _same wrong name_ at all three of its Pro sites. The suite was green, the
  feature was broken, and the gate certified it. A green test that copies the
  implementation's mistake is not evidence.

  What changed:
  - The resolver emits `@dzup-ui-pro/pro` for Pro components. Its two package
    names are module-local constants, and the spec states the two real names
    independently rather than importing them — asserting an implementation
    against its own constant is what hid this defect.
  - `@dzup-ui/nuxt` transpiles and registers Pro components from `@dzup-ui-pro/pro`.
    The `includePro` option name is unchanged.
  - `@dzup-ui/codemods`' `rename-imports` now rewrites `dzup-ui/pro` and
    `@dzup-ui/pro-components` to `@dzup-ui-pro/pro`, so a migrated codebase no
    longer lands on the dead name.
  - A new repository gate, `yarn validate:package-names`, fails if a retired
    package name reappears outside changelogs, changesets, ADRs, and audit
    records. It is in `yarn validate:all`.

  This is a patch: the previous behaviour could not work for anybody. If you set
  `includePro: true` against a local `@dzup-ui/pro` alias, repoint it at
  `@dzup-ui-pro/pro`.

  `includePro: true` still requires the Pro package to be installed, and Pro is
  not published yet — the option remains `false` by default.

- Updated dependencies [2d51eec]
- Updated dependencies [527dbd1]
- Updated dependencies [7edd39a]
- Updated dependencies [4c9fb7a]
- Updated dependencies [527dbd1]
- Updated dependencies [589be13]
- Updated dependencies [4c9fb7a]
- Updated dependencies [3ae7915]
- Updated dependencies [667b0b1]
- Updated dependencies [a01965f]
- Updated dependencies [a01965f]
- Updated dependencies [4c9fb7a]
- Updated dependencies [2d51eec]
- Updated dependencies [a01965f]
- Updated dependencies [4c9fb7a]
- Updated dependencies [e986952]
- Updated dependencies [527dbd1]
- Updated dependencies [4c9fb7a]
- Updated dependencies [8d80bc3]
- Updated dependencies [5773f65]
- Updated dependencies [7edd39a]
- Updated dependencies [a01965f]
- Updated dependencies [a01965f]
  - @dzup-ui/contracts@0.2.0

## 0.1.0-alpha.0 (2026-04-06)

### Features

- Initial alpha release of the dzup-ui Nuxt module
- Auto-imports all `Dz*` components from `@dzup-ui/core`
- Optional `includePro` flag to auto-import `@dzup-ui/pro` components
- Configurable component prefix via `prefix` option
- Compatible with Nuxt 3.x and `@nuxt/kit`
