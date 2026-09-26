# Changeset audit — D180, 2026-09-26

Packet `DZUP-UI-CHANGESET-AUDIT-20260926-R1` ([admission](./ADMISSION.md)).
Base `788f5ba`.

## Result

- **#33 `the-six-cascade-layers-the-styling-contract-promised` was under-declared.**
  It is now `minor` for `@dzup-ui/contracts`, `@dzup-ui/core` and
  `@dzup-ui/tokens`, and its body names what breaks and the fix.
- **The 13 first-pass re-levels are applied** (`minor` → `patch`).
- **The release plan does not change.** Every package lands on the same
  version before and after. The re-levels move entries between the Minor and
  Patch sections of each changelog.

## 1. #33, measured

### Method

Both sides are the CSS inside `yarn pack` tarballs of `@dzup-ui/tokens` and
`@dzup-ui/core`, extracted by `e2e/styling/pack-styles.mjs`:

- **before:** `99b963a`, the parent of `a01965f`, which added #33. It was built
  in a scratch clone.
- **after:** the base, `788f5ba`.

[`layer-precedence-diff.mjs`](./layer-precedence-diff.mjs) renders the same
consumer override against each side and records the computed value. The matrix:

- consumer CSS in 8 places: unlayered, in each of the six ADR-19 layers, and in
  a layer of its own (`app`);
- 2 positions: after the library sheets and before them;
- 2 library emit orders: tokens then core, and core then tokens;
- 4 properties, one for each kind of library rule:
  - `opacity` on `.dz-tab-close-btn`, a `dz-components` rule;
  - `box-sizing`, the reset (in `dz-base` before, `dz-reset` after);
  - `body` margin, the same reset block;
  - `--dz-text-xs`, a `dz-tokens` custom property.

That is 128 cells per engine per side. The raw cells are in
[`layer-precedence-diff.json`](./layer-precedence-diff.json).

### What was measured

- **Chromium and Firefox agree cell for cell.** WebKit could not launch: this
  host lacks its system libraries, and installing them needs `sudo`. The
  repository's own `test:e2e:layer-order` lane is not in CI either, so WebKit is
  unmeasured for this question. Layer order is defined by CSS Cascade 5, not by
  the engine.
- **Emit order changes nothing.** Every difference appears identically in both
  library orders.
- **6 of 128 cells differ per engine**, 24 in total.

| Consumer CSS | Position | Property | Before | After | Direction |
|---|---|---|---|---|---|
| `@layer dz-reset` | after | component `opacity` | consumer wins | library wins | **breaks** |
| `@layer dz-reset` | after | token `--dz-text-xs` | consumer wins | library wins | **breaks** |
| `@layer dz-base` | before | reset `box-sizing` | consumer wins | library wins | **breaks** |
| `@layer dz-reset` | before | reset `box-sizing` | library wins | consumer wins | gains |
| `@layer dz-tokens` | after | reset `box-sizing` | library wins | consumer wins | gains |
| `@layer dz-tokens` | after | reset `body` margin | library wins | consumer wins | gains |

Unlayered CSS, `dz-overrides`, `dz-components`, `dz-utilities` and `app` are
unchanged in every cell, in both positions and both emit orders. The two
documented override routes, unlayered CSS and `dz-overrides` loaded after the
library, behave exactly as before.

### Why the three regressions happen

- **`dz-reset`.** Before #33 the library registered
  `dz-tokens, dz-base, dz-components` and nothing else. A consumer's
  `@layer dz-reset` was an unregistered name, appended after every registered
  layer, so it beat the library's components and tokens. #33 registers it first,
  as ADR-19 §2 decided, so it now loses to all of them.
- **`dz-base`, loaded first.** A consumer sheet that opens `@layer dz-base` before
  the library registers `dz-base` first. Before #33 the reset lived in `dz-base`,
  where the consumer's `.probe` selector out-specified `*`. #33 moved the reset
  to `dz-reset`, which the library then registers after the consumer's `dz-base`,
  so the reset wins.

### The level

`VERSIONING.md` §2.2 lists the six layer names as public contract, and §1 puts a
change that stops consumer code working in the `minor` position. Consumer CSS
written in a public layer name stopped working. The earlier behaviour was an
accident, and the changeset says so. But accidental behaviour a consumer can
rely on is still what their build does. A `patch` would reach every `^0.x`
range unannounced. That is the unsafe direction D180 was raised to catch. **#33
is `minor` for core and tokens.**

The register recorded a second ground for **contracts**: the
`DataAttributes['data-state']` widening from `DataState` to `string`
(`packages/contracts/src/data-attributes.types.ts`). It widens a type the
library hands out. `VERSIONING.md` §2.1 classes that as breaking. **#33 is `minor`
for contracts on that ground alone.**

The register's first ground, that the layers change precedence for consumer
overrides in `dz-overrides`, is refuted by this measurement, as the 2026-09-22
correction said. The regressions are in `dz-reset` and `dz-base`, not
`dz-overrides`.

## 2. The first pass for the rest

The packet
[`publication-decision-packet-2026-09.md`](../../program-2026-09-04/reports/publication-decision-packet-2026-09.md)
lists these re-levels: N5-01's 11 (§3.1) and #20 and #23 (§3.2). Each goes from
`minor` to `patch` on the ground recorded there.

| # | Changeset | Packages moved to `patch` |
|---|---|---|
| 1 | `a-field-no-longer-describes-its-control-with-ids-that-do-not-exist` | core |
| 2 | `a-form-renderer-can-bind-v-model-to-every-selection-control` | core |
| 3 | `an-application-can-configure-more-than-the-theme` | contracts, core |
| 4 | `a-wizard-can-take-you-to-the-error-instead-of-just-naming-it` | core |
| 6 | `components-declare-their-styling-surface` | contracts, testing, core |
| 7 | `every-string-the-library-shows-you-can-be-translated` | contracts, core |
| 8 | `nuxt-module-registers-from-generated-ownership` | core |
| 9 | `one-provider-configures-the-whole-library` | contracts, core |
| 13 | `selection-controls-can-be-driven-by-a-remote-option-source` | contracts (core stays `minor`) |
| 14 | `text-inputs-say-in-the-dom-what-they-say-in-their-types` | core |
| 15 | `the-catalog-knows-which-way-it-reads` | contracts, testing |
| 20 | `a-one-time-code-can-be-filled-and-a-password-can-be-revealed` | core |
| 23 | `every-component-says-what-its-keys-do` | contracts, testing, core |

The five contested changesets keep their declared level, which in each case is
the safe direction: #18, #29, #32, #36, and #33, raised above.

## 3. The release plan

`yarn changeset status --verbose`, before and after this packet:

| Package | Before | After |
|---|---|---|
| `@dzup-ui/codemods` | 0.1.0 | 0.1.0 |
| `@dzup-ui/contracts` | 0.2.0 | 0.2.0 |
| `@dzup-ui/core` | 0.3.0 | 0.3.0 |
| `@dzup-ui/mcp` | 0.3.0 | 0.3.0 |
| `@dzup-ui/nuxt` | 0.1.0 | 0.1.0 |
| `@dzup-ui/testing` | 0.2.0 | 0.2.0 |
| `@dzup-ui/tokens` | 0.3.0 | 0.3.0 |

The publication packet (§3.3, §7) says that re-levelling lands core on `0.2.1`.
**That does not hold.** Core keeps genuinely `minor` changesets:

- #12 `resolver-resolves-by-exact-name`
- #13's core half
- #16 `the-catalog-says-what-it-owes`
- #27 `nine-aria-props-that-did-nothing-are-gone`
- #30 `six-navigation-components-no-longer-render-a-javascript-url`
- the contested #18 and #29
- now #33

Tokens is linked to core in `.changeset/config.json`, so it follows core to
`0.3.0`.

`yarn validate:release-policy`: 7 published, 1 withheld, 41 pending, 0 major.

## Reproduce

```sh
# before: a scratch checkout of 99b963a, built and packed
yarn install --immutable
yarn workspace @dzup-ui/tokens build
yarn workspace @dzup-ui/contracts build
yarn workspace @dzup-ui/core build
# pack-styles.mjs copied from the base
DZUP_STYLE_STAGE=<before> node e2e/styling/pack-styles.mjs

# after: this tree, built
DZUP_STYLE_STAGE=<after> node e2e/styling/pack-styles.mjs

node docs/qa/changeset-audit-2026-09-26/layer-precedence-diff.mjs \
  --before <before> --after <after> \
  --out docs/qa/changeset-audit-2026-09-26/layer-precedence-diff.json
```
