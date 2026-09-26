# @dzup-ui/codemods

## 0.1.0

### Minor Changes

- 5773f65: **Nine ARIA props that were declared, type-checked in your source, and never rendered anything have been removed from six components.** `DzFloatLabel` loses `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid`; `DzInplace`, `DzGrid`, `DzStack`, `DzStepper` and `DzTabs` lose `ariaInvalid`.

  `TASK-N5-02`. These are the six `⛔ gap` cells the C2 (identity) column of
  `docs/program-2026-08/form-controls-readiness-matrix.md` has carried since the
  form-controls audit. The matrix now reports **0 gaps**.

  **Why removal and not implementation.** Each of these props inherits from
  `BaseAccessibilityProps` and each landed on an element that cannot carry it:
  - `DzGrid` and `DzStack` render a generic `<div>`. A layout box is not invalid;
    the fields inside it are.
  - `DzTabs` renders Reka's `TabsRoot`, which is not a widget with a validity
    state. A field inside a panel is invalid, and `DzTabTrigger` is where an
    invalid-panel affordance belongs.
  - `DzStepper`'s root is `role="group"`, and ARIA 1.2 does not support
    `aria-invalid` on `group`.
  - `DzInplace`'s display trigger is `role="button"`, likewise unsupported.
  - `DzFloatLabel` is a `<div>` plus a `<label>`. It is not a labelable element and
    computes no accessible name of its own, a generic element ignores
    `aria-describedby` and `aria-invalid` entirely, and the control it wraps
    already merges its own error id into `aria-describedby` — writing one from the
    wrapper would clobber that merge.

  A declared prop that silently does nothing is worse than its absence, because a
  consumer reasonably believes it has met its own accessibility obligation. The
  honest fix is to stop declaring it.

  **Why this is a `minor` and not a `patch`.** `packages/contracts/VERSIONING.md`
  §3: removing a declared prop is a type removal, and a prop that did nothing at
  runtime still type-checked in consumer source, so deleting it stops that source
  compiling. Under the 0.x mapping in §1 a break goes in the minor position, where
  `^0.x` does not carry it into an unattended install.

  **What you will see if you were passing one.** The binding no longer resolves to
  a prop, so Vue routes it into `$attrs` and every one of these components spreads
  `$attrs` onto its root — which means the attribute now _renders_, on an element
  with no role to carry it. That is a different wrong answer from the old silent
  swallow, so each component emits a one-time dev-mode warning naming the prop,
  what to do instead, and the fall-through. Production builds drop the check.

  **Migration.** Delete the binding, or move it to the element that owns it:

  | Was                                   | Now                                                               |
  | ------------------------------------- | ----------------------------------------------------------------- |
  | `<DzGrid :aria-invalid="hasError">`   | put `aria-invalid` on the field, or bind `invalid` on the control |
  | `<DzStack :aria-invalid="…">`         | same                                                              |
  | `<DzTabs :aria-invalid="…">`          | the field inside the panel carries it                             |
  | `<DzStepper :aria-invalid="…">`       | the field inside the step carries it                              |
  | `<DzInplace :aria-invalid="…">`       | set it on the editor you render into `#edit`                      |
  | `<DzFloatLabel :aria-label="…">` etc. | put all four on the control you wrap, or use `DzFormField`        |

  `@dzup-ui/codemods`' `rename-props` transform strips all nine, in every binding
  form a Vue template or JSX can write:

  ```sh
  npx @dzup-ui/codemods rename-props src/
  ```

  `@dzup-ui/codemods` is released alongside this change (owner decision N5-01-D2,
  2026-09-26). The table above is the same migration, by hand.

  **Three sibling props were kept and implemented rather than removed** —
  `DzInplace.ariaLabelledby`, `DzStepper.ariaLabelledby` and
  `DzStepper.ariaDescribedby`. See the accompanying patch.

### Patch Changes

- 63c1325: **Icons come from `@lucide/vue`, not the deprecated `lucide-vue-next`.** `lucide-vue-next` is deprecated on npm in favour of `@lucide/vue`, its renamed continuation. `@dzup-ui/core` now depends on `@lucide/vue ^1.47.0`. The glyph names it uses are unchanged.

  This is a `minor` because three things you can see change (owner decision D175):
  - **Every icon's rendered `class` changes.** `lucide lucide-chevron-down-icon` becomes `lucide lucide-chevron-down`, and `X`'s `lucide lucide-xicon` becomes `lucide lucide-x`. `Filter` renders `lucide lucide-funnel lucide-filter` and `MoreHorizontal` renders `lucide lucide-ellipsis lucide-more-horizontal`. If your CSS or tests select on a `lucide-*` class that an icon inside a dzup component renders, update the selector.
  - **Icons render `aria-hidden="true"` by default.** `@lucide/vue` 1.x marks every icon decorative. The dzup components already give icon-only controls their accessible name, so no control loses its name. If your own icons carry meaning, give the control an `aria-label`.
  - **Three glyphs are redrawn:** `CalendarIcon`, `Clock` and `Filter`. The date pickers, the time picker and the data-grid header show the new drawings.

  **If your own code imports `lucide-vue-next`,** you can keep it, and you will then install both packages. To move to one:

  ```sh
  npx @dzup-ui/codemods swap-icon-library src/
  ```

  It rewrites `lucide-vue-next` imports, deep subpaths, re-exports and dynamic `import()` to `@lucide/vue`, in `.ts`, `.tsx`, `.js` and every `<script>` block of a `.vue` file. It is not part of `all`; run it on its own, then your formatter.

  **`@dzup-ui/codemods`:** `swap-icon-library` now rewrites `.vue` files. It used to parse a whole single-file component as TypeScript and fail on every one, so it changed only `.ts` files.

  The registry items the site serves for `shadcn add` now name `@lucide/vue` in their `dependencies` and in their source.

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

## 0.1.0-alpha.0 (2026-04-06)

### Features

- Initial alpha release of dzup-ui automated migration codemods
- `dzup-codemod` CLI for running AST transforms on consumer codebases
- `rename-props` transform: migrates legacy prop names to vNext API
- `update-imports` transform: rewrites `dzup-ui` imports to `@dzup-ui/core`
- `remove-deprecated` transform: removes deprecated wrapper usage after compat migration
