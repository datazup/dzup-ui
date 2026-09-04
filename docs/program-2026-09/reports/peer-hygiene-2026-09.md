# Peer & runtime hygiene — decision packet

> **Task:** TASK-N5-04 (System Program 2026-09, roadmap N5).
> **Repository state:** `ui/dzup-ui` on `main` @ `6f1f653`, worktree dirty with
> the uncommitted output of TASK-N5-01/02/03/05. **HEAD did not move for this
> packet.** Every number below was measured on that working tree on 2026-09-03.
> **Nothing here is CI, release or production evidence.** It is a set of local
> runs, reproducible by the commands each section names.
>
> **Four decisions, all `[!owner]`:** `N5-04-D1` (reka-ui peer),
> `N5-04-D2` (icon swap contract), `N5-04-D3` (Node 20 floor),
> `N5-04-D4` (locale packs). Each section is
> **measured facts → measured-vs-claimed → options → recommendation →
> prepared (unapplied) diff.**
>
> **No dependency-graph change ships in this packet.** `packages/core/package.json`
> is byte-identical to HEAD. Every `package.json` diff below is text in this
> document and nothing else.

---

## 0. How these numbers were produced

Three harnesses, in increasing order of what they can prove.

**(a) The in-repo reporter — `yarn report:peer-surface`.** Added by this packet
(§5.1). Walks the static import graph of `packages/core/dist` from every
subpath in the published `exports` map and reports which external packages each
entry point can reach, plus the `lucide-vue-next` glyph inventory. It reads the
built artifact, not `src/`, because an `exports` map and a barrel's re-export
shape are properties of the artifact. **Report only** — exit 0 always, no
baseline, no ratchet, not in `validate:all`.

**(b) A minimal *plain-Vite* consumer, installed from real tarballs.** The Nuxt
fixture lane (`packages/nuxt/test/fixtures/`) answers "does the Nuxt module
work in a consumer app"; it cannot separate the Nuxt module's component
registration from the package's own module graph. So this packet used the same
*machinery* — `yarn workspace <pkg> pack`, `file:` tarball specifiers, npm
`overrides`, staged **outside the repository** — against a bare Vite library
build:

```
# outside the repo, in the session scratchpad
yarn workspace @dzup-ui/core build          # fresh dist first, see F9
yarn workspace @dzup-ui/contracts pack --out <stage>/tarballs/dzup-ui-contracts.tgz
yarn workspace @dzup-ui/tokens    pack --out <stage>/tarballs/dzup-ui-tokens.tgz
yarn workspace @dzup-ui/core      pack --out <stage>/tarballs/dzup-ui-core.tgz
npm install --no-audit --no-fund            # 64 packages, no Nuxt
npx vite build                              # one entry per measurement
```

Two Vite configurations, deliberately:

| Config | `external` | Answers |
|---|---|---|
| **consumer-real** | `['vue']` only | what a real app ships |
| **baseline-comparable** | the list copied verbatim from `packages/tooling/src/perf/export-sizes.ts` (`vue, reka-ui, @floating-ui/vue, @internationalized/date, lucide-vue-next, tailwind-variants, clsx, qrcode-generator`) | numbers comparable to `packages/core/perf/baselines.json` |

**(c) Cross-version Node probes.** `npx -y node@<version> probe.mjs`, run
against 20.19.0, 22.13.0, 22.23.2, 23.0.0, 24.0.0 and 24.20.0 (§3).

**Cross-check of harness (b) against the committed baselines.** Three of four
overlapping components land within 1% of `packages/core/perf/baselines.json`,
which is the agreement expected between a `src`-aliased build (what
`perf:capture` measures) and a `dist` build (what a consumer resolves):

| Export | `baselines.json` median (gzip B) | This harness (gzip B) | Δ |
|---|---|---|---|
| `DzTable` | 15,751 | 15,607 | −0.9% |
| `DzOrderList` | 22,299 | 22,088 | −0.9% |
| `DzTimePicker` | 22,011 | 21,800 | −1.0% |
| `DzTreeSelect` | 25,391 | **26,667** | **+5.0%** |

`DzTreeSelect` is the one that does not fit the pattern. **This packet does not
claim a regression** — the harness differs from `perf:capture` in two ways
(`dist` vs `src` alias; this machine's esbuild vs the one that wrote
`sourceCommit 4c9fb7a`) and one component out of four is not a signal.
It is recorded so the next `yarn perf:capture` is read rather than skimmed.
**No baseline file was written, read-modified, or replaced by this packet.**

---

## 1. `N5-04-D1` — `reka-ui` as a non-optional peer

### 1.1 Measured facts

**Import surface.** 67 of 209 `.vue` files in `packages/core/src` import
`reka-ui` (32.1%); the built tree reproduces that exactly — 67 of 637 emitted
`.js` modules. Not one of them is a type-only reference.

**Reachability per published entry point** (`yarn report:peer-surface`):

| `exports` subpath | modules reached | reaches `reka-ui`? | reaches `lucide-vue-next`? |
|---|---:|---|---|
| `.` | 414 | ✔ 67 importers | ✔ 22 importers |
| `./resolver` | 2 | — | — |
| `./ownership` | 1 | — | — |
| `./providers` | 12 | — | — |
| `./buttons` | 26 | ✔ 3 | ✔ 1 |
| `./cards` | 11 | **—** | **—** |
| `./data` | 101 | ✔ 8 | ✔ 8 |
| `./feedback` | 48 | ✔ 3 | ✔ 1 |
| `./forms` | 88 | ✔ 18 | ✔ 12 |
| `./inputs` | 23 | ✔ 1 | — |
| `./layout` | 45 | ✔ 7 | — |
| `./media` | 37 | ✔ 1 | — |
| `./navigation` | 59 | ✔ 7 | ✔ 2 |
| `./overlays` | 61 | ✔ 30 | ✔ 1 |
| `./typography` | 31 | ✔ 3 | — |

**`./cards` is the only component entry point that reaches neither.**

**The component and the barrel disagree.** `DzButton.vue.js` reaches **5**
external packages across a **5-module** graph, and `reka-ui` is not one of them.
The `./buttons` barrel reaches it through exactly one edge:

```
components/buttons/index.js
  → components/buttons/DzSpeedDial.vue.js
      → components/overlays/DzTooltip.vue.js         ┐
      → components/overlays/DzTooltipContent.vue.js  ├ the only reka-ui edge
      → components/overlays/DzTooltipTrigger.vue.js  ┘ under ./buttons
```

`./typography` reaches `reka-ui` through the same three files. Every other
group's `reka-ui` importers include at least one in-family component, so
severing cross-family composition would make **3 of 12** component groups
reka-free (`cards`, `buttons`, `typography`) and no more.

**There is no per-component subpath.** Measured against the published tarball
with Node's own resolver:

```
RESOLVED  @dzup-ui/core
RESOLVED  @dzup-ui/core/buttons
FAILED    @dzup-ui/core/buttons/DzButton                        ERR_PACKAGE_PATH_NOT_EXPORTED
FAILED    @dzup-ui/core/dist/components/buttons/DzButton.vue.js ERR_PACKAGE_PATH_NOT_EXPORTED
```

**The minimal-consumer build matrix.** Plain Vite, consumer-real externals.
Exit codes read from the unpiped process, not from a wrapper:

| # | entry | `reka-ui` installed | exit | output raw / gzip |
|---|---|---|---:|---|
| 1 | `import { DzButton } from '@dzup-ui/core/buttons'` | yes (auto) | **0** | 161,501 / 29,838 |
| 2 | `import { DzButton } from '@dzup-ui/core'` | yes | **0** | 161,507 / 29,722 |
| 3 | `import { DzCard } from '@dzup-ui/core/cards'` | yes | **0** | 150,593 / 27,566 |
| 4 | `import { DzDialog, DzDialogContent } from '@dzup-ui/core/overlays'` | yes | **0** | 199,693 / 40,514 |
| 5 | entry 1, `node_modules/reka-ui` removed | **no** | **1** | — |
| 6 | entry 2, removed | **no** | **1** | — |
| 7 | entry 3, removed | **no** | **0** | 150,593 / 27,566 |
| 8 | deep file import of `DzButton.vue.js`, removed | **no** | **0** | 161,501 / 29,738 |

Row 5's message, verbatim:

```
[vite]: Rollup failed to resolve import "reka-ui" from
".../node_modules/@dzup-ui/core/dist/components/overlays/DzTooltip.vue.js".
```

**`reka-ui` costs a Button-only consumer nothing.** Rows 1, 2 and 8 differ by
**6 bytes** across three different import paths, and rows 1/2/3 contain **zero**
occurrences of the string `reka` in the emitted bundle. Row 4 does (4
occurrences), and the reka-attributable delta is row 4 − row 1 ≈ **38.2 kB raw /
10.7 kB gzip**. With `reka-ui` external, `DzDialog`'s own code is **1,222 raw /
584 gzip bytes** — the component is a thin binding and the peer is the payload.

**npm installs it whether or not you ask.** The fixture's `package.json` never
names `reka-ui`; `npm install` produced `reka-ui@2.10.4` regardless, because the
peer is not marked optional.

### 1.2 Measured vs claimed

> **Claimed** (task file, from `02` §4): *"`reka-ui ^2.0.0` is a non-optional
> peer (Button-only apps must install it)."*

**Confirmed at install and build time; false at bundle time, and the mechanism
named is the wrong one.**

| Claim | Measured |
|---|---|
| Button-only apps must **install** `reka-ui` | **True.** Rows 5–6: exit 1 without it. |
| …because `DzButton` needs it | **False.** `DzButton.vue.js` reaches 5 externals; `reka-ui` is not among them. The requirement comes from the **barrel**, via `DzSpeedDial → DzTooltip`. |
| Button-only apps **ship** `reka-ui` | **False.** Zero `reka` occurrences in rows 1–3; row 1 and row 8 are the same size to 0 bytes. Tree-shaking already works. |
| "Making it optional" is a `peerDependenciesMeta` change | **False, and measured to make things worse** — see option B. |

An additional fact the claim does not contain: **`./cards` is already
peer-free** (row 7, exit 0), so the repository does have one entry point that
demonstrates the desired property today.

### 1.3 Options, each measured

**Option A — leave it.** `reka-ui` stays a required peer.
Cost: every consumer installs ~1 MB of node_modules they may never ship. Zero
bundle cost (measured). Zero risk. The `optional-peer` Nuxt fixture already
records this as the honest status quo.

**Option B — `peerDependenciesMeta: { "reka-ui": { "optional": true } }` alone.**
**Measured, and it is worse than A.** Patched into the installed tarball,
`reka-ui` removed, entry 1 rebuilt → **exit 1**, with the resolve error replaced
by a Vite optional-peer stub error:

```
node_modules/@dzup-ui/core/dist/components/overlays/DzTooltip.vue.js (2:9):
"TooltipProvider" is not exported by
"__vite-optional-peer-dep:reka-ui:@dzup-ui/core:false", imported by ...
```

The build still fails, npm no longer installs the fix, and the error now names
an internal Vite pseudo-module instead of the missing package. `validate:peers`
already understands `peerDependenciesMeta.optional`, so nothing in `validate:all`
would catch this.

**Option C — optional peer **plus** a per-component subpath export.**
**Measured to work.** Same patched tarball, plus
`"./components/*": { "types": "./dist/components/*.d.ts", "import": "./dist/components/*.js" }`:

| probe | `reka-ui` | result |
|---|---|---|
| `import DzButton from '@dzup-ui/core/components/buttons/DzButton.vue'` (Node ESM) | present | **RESOLVED** |
| same, Vite build | **absent** | **exit 0**, output **byte-identical (md5 `0780b6f8543b`, 161,501 B)** to the deep-file build of row 8 |
| `import DzDialog from '@dzup-ui/core/components/overlays/DzDialog.vue'` | **absent** | **exit 1**, `"DialogRoot" is not exported by "__vite-optional-peer-dep:reka-ui:…"` — a diagnostic that names the symbol and the peer |

Cost, and it is the real one: a wildcard subpath makes **every file under
`dist/components/`** a public entry point. Under
`packages/contracts/VERSIONING.md` (0.x minor = breaking), moving or renaming any
of the 637 emitted modules then becomes a breaking change. The specifier also
carries the `.vue` suffix (`…/DzButton.vue`), because that is what the emitted
filename is.

**Option D — sever the cross-family composition** (`DzSpeedDial` stops composing
`DzTooltip`). Makes `./buttons` and `./typography` reka-free — **3 of 12**
component groups total. It is a behaviour change to a shipped component and it
does not generalise. Not recommended on its own.

### 1.4 Recommendation

**Option A now; Option C only if a per-component entry surface is wanted for its
own sake.**

The reasoning is the measurement: the cost the claim asserts — that Button-only
apps carry Reka's weight — **does not exist**. Rows 1–3 ship zero bytes of it.
What remains is an install-time obligation, and the price of removing that
obligation under Option C is freezing 637 emitted module paths as public API in
a package that is `0.2.0` and has not shipped `1.0`. That is a large, permanent
constraint bought to remove a `node_modules` entry.

If the owner wants Option C anyway — and there are good reasons to (deep imports
are what per-component tree-shaking documentation usually assumes) — **it must
land as a pair**. `peerDependenciesMeta` without the subpath is Option B, which
is measurably worse than doing nothing.

### 1.5 Prepared diff — **not applied**

```diff
--- a/packages/core/package.json
+++ b/packages/core/package.json
@@ exports @@
     ".": {
       "types": "./dist/index.d.ts",
       "import": "./dist/index.js"
     },
+    "//./components/*": "TASK-N5-04 D1 option C. A per-component entry so a
+      consumer of one component resolves one module graph rather than a family
+      barrel. Measured: with this present, DzButton builds with reka-ui absent
+      and emits a byte-identical bundle to the barrel import; DzDialog fails
+      with a diagnostic naming the peer and the symbol. Cost: every file under
+      dist/components/ becomes public API under VERSIONING.md.",
+    "./components/*": {
+      "types": "./dist/components/*.d.ts",
+      "import": "./dist/components/*.js"
+    },
     "./resolver": {
@@ peerDependencies @@
   "peerDependencies": {
     "reka-ui": "^2.0.0",
     "vue": "^3.5.0"
   },
+  "peerDependenciesMeta": {
+    "reka-ui": { "optional": true }
+  },
```

Changeset level under `packages/contracts/VERSIONING.md`: **minor (breaking)** —
it changes what a consumer must install and permanently widens the public
surface. Not a patch.

Two gates would need to learn about the wildcard before this could land:
`validate:exports` and `validate:dts` both walk the `exports` map, and neither
was written against a pattern subpath. Neither was modified by this packet.

---

## 2. `N5-04-D2` — the icon swap contract

### 2.1 Measured facts

**Import surface.** 26 files under `packages/core/src` mention
`lucide-vue-next`; **4 of them only in a doc comment**
(`DzIcon.vue`, `DzIcon.types.ts`, `DzIconButton.types.ts`,
`DzPopconfirm.types.ts`). The real runtime surface is **22 modules and 18
distinct glyph identifiers**:

| glyph | modules | glyph | modules |
|---|---:|---|---:|
| `X` | 8 | `ChevronsDown` | 1 |
| `Check` | 7 | `ChevronsLeft` | 1 |
| `ChevronDown` | 7 | `ChevronsRight` | 1 |
| `ChevronRight` | 7 | `ChevronsUp` | 1 |
| `ChevronLeft` | 5 | `ChevronUp` | 1 |
| `CalendarIcon` | 2 | `Clock` | 1 |
| `Minus` | 2 | `Filter` | 1 |
| | | `GripVertical` | 1 |
| | | `MoreHorizontal` | 1 |
| | | `Plus` | 1 |
| | | `Star` | 1 |

**`DzIcon` already has the indirection.** `DzIconProps.icon` is typed
`Component` (from `vue`) and `DzIcon.vue` renders whatever it is given —
`lucide-vue-next` appears in that file only as an example in prose. The lock-in
is **not** in the icon component; it is 22 module-level `import` statements
inside other components that no consumer can reach.

**Measured bundle cost.** Two builds per entry, identical except that
`lucide-vue-next` is external in one and bundled in the other. The delta is
exactly what lucide costs:

| entry | lucide external | lucide bundled | **delta** |
|---|---|---|---|
| `DzSelect` | 108,578 / 20,998 | 109,530 / 21,451 | **+952 raw / +453 gzip** |
| `DzPagination` | 95,984 / 17,953 | 97,372 / 18,513 | **+1,388 / +560** |
| `import * as All` (all 433 exports) | 1,076,335 / 219,947 | 1,079,773 / 221,153 | **+3,438 / +1,206** |

**3,438 raw / 1,206 gzip bytes is the entire icon cost of the entire library.**
On disk, the 18 glyph modules total **8,769 bytes unminified** out of
`lucide-vue-next`'s **1,099,363 bytes across 1,556 icons** — core pulls **0.8%**
of the package, plus 1,958 bytes of shared runtime
(`createLucideIcon` + `defaultAttributes` + `Icon`).

**`lucide-vue-next@0.477.0` is deprecated.** Emitted by npm during the fixture
install, and confirmed by `npm view`:

```
npm warn deprecated lucide-vue-next@0.477.0: Package deprecated. Please use @lucide/vue instead.
$ npm view lucide-vue-next@0.477.0 deprecated
Package deprecated. Please use @lucide/vue instead.
$ npm view lucide-vue-next version
1.0.0
```

**Two copies are installed in this repository right now.**

| declared in | range | resolved |
|---|---|---|
| `packages/core/package.json` | `^0.477.0` | `0.477.0` (nested at `packages/core/node_modules/`) |
| `apps/landing/package.json` | `^0.475.0` | `0.475.0` (hoisted to the root) |
| `apps/sandbox/package.json` | `^0.475.0` | 0.475.0 |

`yarn.lock` carries both entries. A caret on a `0.x` version pins the minor, so
the two ranges cannot ever unify. Nothing in `validate:all` looks at this:
`validate:peers` reads `peerDependencies` only, `validate:externals` checks that
what `dist` imports is *declared*, not that it resolves once.

### 2.2 Measured vs claimed

> **Claimed:** *"`lucide-vue-next ^0.477.0` is a hard dependency (icon lock-in,
> no swap contract)."*

**True as stated, and materially understated in one direction and overstated in
another.**

| Claim | Measured |
|---|---|
| Hard dependency | **True** — `dependencies`, not peer, not optional. |
| No swap contract | **Half false.** `DzIcon` accepts any `Component`; the missing half is the 22 internal call sites. |
| Icon lock-in is a bundle problem | **False.** 1,206 gzip bytes for the whole library. |
| (not claimed) | **The pinned version is deprecated upstream**, with a named successor (`@lucide/vue`) and a `1.0.0` line the repo is 0.477 behind. |
| (not claimed) | **Two versions are installed simultaneously**, and no gate can see it. |

The consequence for the decision is a reframe: **this is not a size problem, it
is a currency and substitutability problem.** Arguing it on bytes will lose,
because there are 1,206 of them.

### 2.3 Options

**Option A — leave it.** Ships a deprecated dependency in a package heading for
`1.0`. Cheapest today, worst on the day `lucide-vue-next` stops receiving
security metadata.

**Option B — currency only: `lucide-vue-next` → `@lucide/vue`.** A dependency
swap and 22 import-line rewrites. Removes the deprecation. Does **not** create a
swap contract — the next consumer who wants Heroicons is where they were.

**Option C — the icon-slot contract, defaults preserved.** A new provider
concern in `@dzup-ui/contracts` (ADR-20 §9 shape, same mechanism Pro must use),
read by a `useDzIcons()` composable in core, with the current lucide glyph as
the default for every slot. Consumers who change nothing see no change. The
22 modules stop importing `lucide-vue-next` at module scope and read
`icons.value.<role>` instead.

Sizing, measured rather than estimated:
- **18 glyph slots**, named by *role* not by glyph — `X` is used for 8 different
  roles (toast dismiss, dialog close, chip remove, …) and collapsing them to one
  `close` slot is a design decision, not a rename.
- **22 modules** to change, ~30 import sites.
- `DzIcon`, `DzIconButton`, `DzPopconfirm` need **no runtime change** — only
  their doc comments stop naming a vendor.
- `lucide-vue-next` moves from `dependencies` to an **optional** dependency,
  because a consumer who supplies all 18 icons should not install it. That is
  the same install/bundle distinction measured in §1: it costs 1,206 gzip bytes
  to ship and ~1 MB to install.

**Option D — Option C plus Option B**: build the contract, and make the shipped
default `@lucide/vue` rather than the deprecated package.

### 2.4 Recommendation

**Option D, sequenced as B then C.**

Do **B first and alone**: it is a mechanical, independently reviewable change
that removes a deprecation warning from every consumer install, and it does not
depend on any icon-contract design. Then **C**, which is the part that needs an
ADR-20 amendment (a tenth injection key) and a decision about role naming.

Do not argue C on bundle size. Argue it on the fact that the library currently
hard-codes a vendor into 22 components while telling consumers, in `DzIcon`'s
own JSDoc, that icons are pluggable.

### 2.5 Prepared diffs — **not applied**

**B — currency (mechanical):**

```diff
--- a/packages/core/package.json
+++ b/packages/core/package.json
-    "lucide-vue-next": "^0.477.0",
+    "@lucide/vue": "^1.0.0",
--- a/apps/landing/package.json          # and apps/sandbox/package.json
-    "lucide-vue-next": "^0.475.0",
+    "@lucide/vue": "^1.0.0",
```
plus 22 import-line rewrites in `packages/core/src` and the landing/sandbox call
sites. **Verify before applying** that `@lucide/vue` exports the same 18
identifiers; `MoreHorizontal` is already an alias of `ellipsis` in the current
package and alias sets change across majors. Changeset level: **patch** for
core (no public API change), but it changes a resolved dependency, so it needs
`validate:externals` and a fixture build to confirm.

**C — the contract (additive), three files:**

```diff
--- a/packages/contracts/src/provider.types.ts
+++ b/packages/contracts/src/provider.types.ts
+/**
+ * The icons components render, by ROLE rather than by glyph name.
+ *
+ * Roles, not glyphs: `X` is the current default for eight different roles, and
+ * a host that wants a different dismiss affordance should not have to accept
+ * the same change in the chevron of a tree node.
+ */
+export interface DzIcons {
+  readonly close?: Component
+  readonly check?: Component
+  readonly indeterminate?: Component
+  readonly chevronDown?: Component
+  readonly chevronUp?: Component
+  readonly chevronLeft?: Component
+  readonly chevronRight?: Component
+  readonly chevronsLeft?: Component
+  readonly chevronsRight?: Component
+  readonly chevronsUp?: Component
+  readonly chevronsDown?: Component
+  readonly calendar?: Component
+  readonly clock?: Component
+  readonly filter?: Component
+  readonly dragHandle?: Component
+  readonly overflow?: Component
+  readonly add?: Component
+  readonly rating?: Component
+}
+
+export const DZ_ICONS_KEY: InjectionKey<Ref<DzIcons>> = Symbol('dz-icons')
```
```diff
--- /dev/null
+++ b/packages/core/src/composables/provider/useDzIcons.ts
+export function useDzIcons(): Readonly<Ref<Required<DzIcons>>>
```
```diff
--- a/packages/core/src/components/feedback/DzToast.vue     # ×22 modules
-import { X } from 'lucide-vue-next'
+const icons = useDzIcons()
-  <X ... />
+  <component :is="icons.close" ... />
```

Changeset level: **patch** (0.x additive) for the contracts and composable
additions; the `dependencies` → `optionalDependencies` move for the icon package
is **minor (breaking)**. Requires an **ADR-20 amendment** — it adds a tenth
provider concern and the ADR enumerates nine.

---

## 3. `N5-04-D3` — the Node 20 floor

### 3.1 Measured facts

**The floor today** is `^20.19.0 || >=22.13.0`, declared in exactly three places
that `yarn validate:engines` holds in agreement: root `package.json`,
`packages/mcp/package.json`, `.nvmrc` (`20.19.0`). Fourteen CI `node-version:`
pins are checked to be concrete. `docs/adr/ADR-18-runtime-floor-and-validator-runner.md`
is the governing document, and it already contains this, verbatim:

> **For the owner: Node 20 is end-of-life.** Node 20 left maintenance in **April
> 2026**; as of 2026-08-20 it receives no security updates. This ADR keeps it in
> the floor because the evidence supports it and dropping a major is a product
> decision, not a tooling one — but a floor of `>=22.13.0` would be defensible
> today, and will be increasingly hard to argue against.

**What the floor buys.** One thing, measured by TASK-N5-03: `nuxt` ≤ 4.4.5
declares `^20.19.0 || >=22.12.0`; `nuxt` ≥ 4.4.6 declares
`^22.12.0 || ^24.11.0 || >=26.0.0`. **The Node 20 floor is what pins the Nuxt
fixture matrix at `4.4.5`.** Raising the floor unpins it. That is the whole of
the "buys" column, and it is a cost, not a benefit.

**What the floor is claimed to cost — and this is where the claim is wrong.**
ADR-20 §4:

> Resolution is a checked-in list of RTL language subtags… `Intl.Locale.prototype.getTextInfo()`
> would be the right mechanism and is deliberately **not** used: it is
> Baseline-2023 and unavailable across this repository's Node floor
> (`^20.19.0 || >=22.13.0`, ADR-18). **When the floor moves past it, the list
> becomes a one-line delegation.**

Measured across six Node builds:

| Node | ICU | `Intl.Locale.prototype.getTextInfo` | `.textInfo` accessor |
|---|---|---|---|
| 20.19.0 | 76.1 | **absent** | present |
| 22.13.0 | 76.1 | **absent** | present |
| 22.23.2 (newest 22.x) | 78.2 | **absent** | present |
| 23.0.0 | 75.1 | **absent** | present |
| **24.0.0** | 77.1 | **present** | present |
| 24.20.0 | 78.3 | **present** | present |

**`getTextInfo()` first appears in Node 24.0.0.** Raising the floor to
`>=22.13.0` — the move ADR-18 pre-authorises and the one this packet's brief
described as deleting the hand-maintained list — **does not unlock it.** Only a
`>=24.0.0` floor does.

**The older accessor is available at the current floor, and is not a
substitute.** `Intl.Locale.prototype.textInfo` exists on 20.19.0. It gives
*different answers on different Node versions at the same ICU version*:

```
node 20.19.0 (icu 76.1):  dv=ltr  khw=ltr  arc=ltr
node 22.13.0 (icu 76.1):  dv=rtl  khw=rtl  arc=rtl
```

For a library whose SSR output must match its client hydration, a direction
resolver that answers differently on the build machine and the runtime is worse
than a checked-in list. **ADR-20's conclusion is right; its stated reason is
not.**

**The list it defends has two errors.** `packages/core/src/composables/provider/useDzLocale.ts`
carries 14 entries; measured against ICU on Node 24.20.0:

- `'uz-AF'` is **dead code**. `directionForLocale` lower-cases the input before
  the `Set.has()` lookup, so `uz-AF` becomes `uz-af`, misses, falls back to the
  `uz` prefix, misses again, and returns `'ltr'`. ICU says `rtl`.
- `'ha'` (Hausa) is **wrong**. The list says rtl, annotated "Ajami"; ICU says
  `ltr` on every Node version tested.

Nothing catches either, because `RTL_LANGUAGES` appears exactly three times in
the repository, all inside its own file, and the provider spec asserts only
`ar-EG`/`he`/`fa-IR`/`ur-PK` → rtl and `en-US`/`bs-BA` → ltr.

**How exercised is the list?** One runtime consumer in `packages/core/src`
(`DzProvider.vue`, plus its SSR arm `theme-script.ts`), reached indirectly by
the `useTabs` composable, and one in `apps/landing`
(`BlockCategoryNav.vue`). No `.vue` file in `packages/core/src` calls
`useDzDirection()` directly.

**What a floor move actually costs.** `yarn validate:engines` holds three
declarations plus 14 CI pins in agreement, so a floor change is:
`package.json` ×2 + `.nvmrc` + ~14 workflow pins + `CONTRIBUTING.md` +
**an ADR-18 amendment**. ADR-18 is one of only **three** documented ADRs in the
repository (`ADR-01`–`ADR-17` are an undocumented debt ledger with
`maxUndocumented: 14`), so there is a real document to amend rather than a
convention to guess at.

### 3.2 Measured vs claimed

| Claim | Source | Measured |
|---|---|---|
| Node 20 is EOL and the floor retains it | task file, ADR-18 | **True.** Maintenance ended April 2026. |
| Raising the floor to `>=22.13.0` collapses the RTL list to a one-line delegation | this packet's brief, via N5-05; ADR-20 §4 | **False.** `getTextInfo()` needs **Node ≥ 24.0.0**. |
| The list is unexercised, so now is the cheap moment | this packet's brief | **True but weaker than stated.** One direct consumer in core plus one in `apps/landing`; the list is fully encapsulated behind `directionForLocale()`. |
| The floor pins Nuxt at 4.4.5 | N5-03 D4 | **True**, and it is the only concrete thing the floor buys. |

### 3.3 Options

**Option A — hold `^20.19.0 || >=22.13.0`.** Ships an EOL major. Keeps the Nuxt
matrix pinned at 4.4.5. Costs nothing today.

**Option B — `>=22.13.0`.** Drops the EOL major. Unpins Nuxt. ADR-18 already
calls it "defensible today". **Does not** unlock `getTextInfo()` and therefore
**does not** delete the RTL list. Cost: an ADR-18 amendment, 3 declarations,
~14 CI pins, `CONTRIBUTING.md`.

**Option C — `>=24.0.0`.** Everything in B, plus `getTextInfo()` becomes
available and ADR-20 §4's delegation becomes real. Cost: a component library
declaring a floor of Node 24 (LTS since October 2025) excludes consumers on
Node 22 LTS, whose maintenance runs to April 2027. For a *library*, that is
aggressive; for an *app*, it would be routine.

**Option D — B now, and fix the two list errors independently of any floor
move.** The list is wrong today and will still be wrong on Node 22.

### 3.4 Recommendation

**Option D: move the floor to `>=22.13.0`, and treat the RTL list as a separate,
smaller problem that the floor move does not solve.**

Two things follow, and they should be written into the ADR-18 amendment so the
next reader does not repeat this measurement:

1. **Correct ADR-20 §4.** Its rejection of `getTextInfo()` is right, but for the
   wrong reason and with a wrong prediction. The accurate statement is: *the API
   requires Node ≥ 24.0.0, and its predecessor `Intl.Locale.prototype.textInfo`
   — which IS available at the floor — returns different directions on different
   Node versions at identical ICU versions, which a library with SSR cannot
   accept.* That converts a temporary workaround into a deliberate, defensible
   design.
2. **The list needs a test, not a floor.** Two of 14 entries are wrong and
   nothing in `validate:all` can see it.

### 3.5 Prepared diff — **not applied**

```diff
--- a/package.json                       # and packages/mcp/package.json
   "engines": {
-    "node": "^20.19.0 || >=22.13.0"
+    "node": ">=22.13.0"
   },
--- a/.nvmrc
-20.19.0
+22.13.0
--- a/.github/workflows/*.yml            # ~14 pins
-          node-version: '20.19.0'
+          node-version: '22.13.0'
--- a/.github/workflows/ci.yml           # the unit-test ceiling leg
-        node-version: ['20.19.0', '22.13.0']
+        node-version: ['22.13.0', '24.20.0']
```
```diff
--- a/packages/core/src/composables/provider/useDzLocale.ts
-  'ha', // Hausa (Ajami)
-  'uz-AF', // Uzbek (Afghanistan)
+  // 'ha' removed: ICU resolves Hausa to ltr on every Node version measured
+  // (20.19.0 through 24.20.0). The Ajami script is a minority orthography and
+  // the CLDR default for the subtag is Latin.
+  'uz-af', // Uzbek (Afghanistan) — lower-case, because the lookup lower-cases
```
```diff
--- a/docs/adr/ADR-18-runtime-floor-and-validator-runner.md
+## Amendment A1 (TASK-N5-04, 2026-09-03) — the floor moves to >=22.13.0
+ … including the measured table of getTextInfo availability, so that
+   "when the floor moves past it" is never quoted again without a version.
```

Changeset level: **minor (breaking)** — a runtime floor is part of what a
consumer must satisfy.

**A note the floor decision must not skip:** `docs/adr/ADR-20-provider-contract.md`
§4 and its "Alternatives considered" section both assert the floor is the reason
the list exists. Moving the floor without amending both leaves the repository
with two documents claiming a delegation that the new floor still cannot
perform.

---

## 4. `N5-04-D4` — locale packs

### 4.1 Measured facts

**One locale, 97 keys, 40 component groups.** `packages/core/src/i18n/messages.ts`
holds `enMessages`, declared `as const satisfies DzMessageCatalog`. The
`satisfies` clause is the only completeness mechanism: a key declared and not
supplied, or supplied and not declared, is a `yarn typecheck` failure. 40 `.vue`
components call `useComponentMessages` at 47 call sites.

**The catalog resolves per key, not per component.** A host overriding
`DzTimePicker.confirm` keeps the other nine shipped `DzTimePicker` strings, and
a non-string override falls back to English rather than rendering
`[object Object]`. Nested providers **merge**; they do not replace.

**A pseudo-locale exists and is derived, not maintained.**
`packages/core/src/i18n/pseudo.ts` — `pseudoLocalise`, `pseudoLocaliseCatalog`,
`pseudoMessages` — accents, pads to +130%, frames as `[!!! … !!!]`, and passes
`{placeholders}` and `%s` through untouched. `pseudoMessages()` is computed from
`enMessages` at call time, so a message added tomorrow is covered today. Its
only consumer is `apps/storybook/.storybook/preview.ts`.

**The contribution path does not exist.** Measured against the published
tarball, in Node, not inferred from source:

```
$ node -e "import('@dzup-ui/core/i18n')"                       ERR_PACKAGE_PATH_NOT_EXPORTED
$ node -e "import('@dzup-ui/core/messages')"                   ERR_PACKAGE_PATH_NOT_EXPORTED
$ node -e "import('@dzup-ui/core/dist/i18n/messages.js')"      ERR_PACKAGE_PATH_NOT_EXPORTED
@dzup-ui/core exports: 433
  enMessages:            not exported
  pseudoMessages:        not exported
  useComponentMessages:  not exported
  useDzMessages:         EXPORTED
  useDzLocale:           EXPORTED
  useDzDirection:        EXPORTED
  DzProvider:            EXPORTED
```

**A translator cannot obtain the 97 English strings they are being asked to
translate.** `DzProvider` accepts a `messages` prop, and the base catalog it
merges over is unreachable by every path the package exposes.

**The type is unreachable too.** The augmentation
`declare module '@dzup-ui/contracts' { interface DzMessageCatalog { … } }` lives
only in `dist/i18n/messages.d.ts`, and **nothing reachable from
`dist/index.d.ts` references it** (`grep -n "i18n" dist/index.d.ts` → no match).
A consumer's TypeScript program therefore never loads it, so `DzMessageCatalog`
is the empty interface `contracts` declares. The 97-key contract is invisible on
both the value and the type side.

**No parity gate exists, and none can be written yet.** `package.json` has zero
scripts matching `i18n|locale|messages|pseudo`. Completeness is enforced only by
`satisfies` at typecheck time — which validates `en` against itself. The
pseudo-locale is derived from `en`, so it cannot catch a missing key either.
This is *sound today* precisely because there is one locale, and it stops being
sound the moment there are two.

### 4.2 Measured vs claimed

> **Claimed:** *"one locale (`en`) ships with no contribution path."*

**True, and understated.** The measured position is not "there is no documented
process" — it is that **the artifact makes contribution impossible**: neither
the base catalog nor its type escapes the package. A contributor's only route
today is to copy 97 strings out of a GitHub source file into a hand-written
object with no type checking and no gate.

### 4.3 Options

**Option A — leave it.** English-only, indefinitely.

**Option B — export the catalog; no pack format.** Add an `./i18n` subpath
exporting `enMessages`, `pseudoMessages` and the `DzMessageCatalog` augmentation.
That alone converts "impossible" into "possible": a host writes
`<DzProvider :messages="bs">`, and with the augmentation loaded their TypeScript
checks the keys. **Small, additive, and it does most of the work.**

**Option C — B plus a locale-pack format and a parity gate.** A pack is a module
whose default export is a `DzMessages` shaped like `enMessages`, plus metadata:

```ts
// packages/core/src/i18n/packs/bs.ts
export default definePack({
  locale: 'bs-BA',
  // Declared, not inferred: a pack that renders under the wrong direction is a
  // bug the pack author can see and the library cannot.
  direction: 'ltr',
  messages: { DzAlert: { close: 'Zatvori' }, /* … */ },
})
```
with:
- `validate:i18n-parity` — every checked-in pack has exactly the keys `en` has,
  no more and no fewer, and every leaf is a string. **This is the gate that does
  not exist and cannot be replaced by `satisfies`**, because a pack is data, not
  a type literal.
- the **pseudo-locale as the template**: `pseudoMessages()` already produces a
  complete, correctly-shaped, machine-generated catalog from `en`. It is the
  reference pack, and `validate:i18n-parity` should assert against it so the
  gate is exercised even with zero human translations checked in.
- a `./i18n/packs/<locale>` subpath so a consumer pays for the locales they use.

**Option D — C plus a translation-management integration.** Out of scope for a
library at `0.2.0` with 97 keys.

### 4.4 Recommendation

**Option C, built in the order B → gate → first pack.**

The ordering matters and is the recommendation's substance. **Do not check in a
second locale before the parity gate exists.** Today, one locale is safe because
the type system compares `en` to itself. The first translated pack is the moment
that stops being true, and the repository would acquire a class of defect —
a missing key rendering `undefined` in a language nobody on the team reads —
that nothing in `validate:all` could see. The pseudo-locale is what lets the
gate be written and exercised *before* any human translation exists.

**This is also where D3 and D4 meet.** The RTL subtag list (§3) is the direction
half of the same i18n surface as the message catalog. A pack that declares its
own `direction` (Option C) is a second, independent source of truth for the same
question `directionForLocale()` answers from a 14-entry list with two errors in
it. Whichever way the floor decision goes, the pack format should declare
direction explicitly and the list should become the *fallback* for locales no
pack covers — not the primary mechanism.

### 4.5 Prepared diff — **not applied**

```diff
--- a/packages/core/package.json
+++ b/packages/core/package.json
+    "//./i18n": "TASK-N5-04 D4. The base catalog a translation is written
+      against. Measured 2026-09-03: enMessages, pseudoMessages and the
+      DzMessageCatalog augmentation are unreachable from the published package
+      by every path it exposes, so a contributor cannot obtain the 97 strings
+      they are asked to translate, and their TypeScript sees an empty
+      DzMessageCatalog. Exported here rather than from the root barrel: a
+      catalog is data a host loads deliberately, not payload every app carries.",
+    "./i18n": {
+      "types": "./dist/i18n/index.d.ts",
+      "import": "./dist/i18n/index.js"
+    },
```
```diff
--- /dev/null
+++ b/packages/core/src/i18n/index.ts
+export { enMessages } from './messages.ts'
+export { pseudoLocalise, pseudoLocaliseCatalog, pseudoMessages } from './pseudo.ts'
+export { useComponentMessages } from './useComponentMessages.ts'
```
```diff
--- /dev/null
+++ b/packages/core/src/i18n/packs/define-pack.ts
+export interface DzLocalePack {
+  readonly locale: DzLocale
+  /** Declared, never inferred — see peer-hygiene-2026-09.md §4.4. */
+  readonly direction: DzDirection
+  readonly messages: DzMessages
+}
+export function definePack(pack: DzLocalePack): DzLocalePack
```
```diff
--- a/package.json
+    "//validate:i18n-parity": "TASK-N5-04 D4. Every checked-in locale pack has
+      exactly the keys enMessages has -- no more, no fewer, every leaf a string.
+      `as const satisfies DzMessageCatalog` cannot do this: it compares en to
+      itself, and a pack is data rather than a type literal. Runs against the
+      derived pseudo-locale as well as any human pack, so the gate is exercised
+      before the first translation exists.",
+    "validate:i18n-parity": "tsx packages/tooling/src/validators/i18n-parity.ts",
```

Changeset level: **patch** for the `./i18n` subpath and the pack helper (0.x
additive). The parity gate is repo tooling and takes no changeset. Adding a link
to `validate:all` moves the chain from **37** to **38** links; the next packet
to quote a link count must know that.

---

## 5. What this packet changed, and what it found on the way

### 5.1 Implemented — additive and reversible

| File | What | Why it is reversible |
|---|---|---|
| `packages/tooling/src/peer-surface.ts` | The reachability + glyph reporter behind §1 and §2 | New file. Delete it. |
| `packages/tooling/src/peer-surface.spec.ts` | 10 cases over its pure functions | New file. Delete it. |
| `package.json` | `report:peer-surface` + its `//` doc key | Two lines, adjacent to `report:component-sizes`. Not referenced by any other script. |

It is **not a gate**: exit 0 always, no committed baseline, no ratchet, and
deliberately outside `validate:all`. Every number it prints is a consequence of
a decision the owner has not taken; a gate over an undecided surface would
freeze the status quo by accident.

### 5.2 Found while measuring — not this packet's to fix

**F9 — `test:nuxt-fixtures:pack` packs whatever `dist/` is on disk.**
`node packages/nuxt/scripts/pack-fixtures.mjs` runs `yarn workspace <pkg> pack`
with no build step and no freshness assertion. Measured: the tarballs staged at
15:05 on 2026-09-03 were built from a `packages/core/dist` last written
**2026-08-25**, i.e. before the TASK-N5-02 ARIA changes in the same working
tree. After `yarn workspace @dzup-ui/core build`, the same pack produced
**583,429 bytes** where the earlier one produced **557,112**. The fixture lane is
the repository's only runtime observation post, and it can silently observe a
stale artifact. A one-line fix (`packAll()` runs the workspace build first, or
asserts `dist` is newer than `src`) would close it.

**F10 — two `lucide-vue-next` versions are installed and nothing can see it.**
§2.1. `validate:peers` reads peers only; `validate:externals` checks declaration,
not resolution. A `validate:duplicate-deps` gate would be cheap.

**F11 — the docs site is still the only static artifact with no size ceiling.**
Carried from N2-D3 / N5-03-D5. This packet's bundle work does not make freezing
it trivial: the measured surface here is `packages/core/dist`, and the docs site
is a VitePress build with a different gate shape. Noting that the "cheap moment"
hoped for in the brief did **not** materialise.

---

## 6. Reproduction

```bash
yarn workspace @dzup-ui/core build      # F9: pack does not build for you
yarn report:peer-surface                # §1 reachability table, §2 glyph inventory
yarn report:peer-surface --json         # the same as data
```

The minimal-consumer builds (§1.1 rows 1–8, §2.1 deltas, §1.3 option probes) ran
in a scratch directory outside the repository and are **not** checked in. That is
deliberate: this program has repeatedly found harnesses written into the
repository and never dispatched (`validate-min-runtime`, the `nuxt-majors`
matrix), and a second unrun consumer harness would be the same defect. The
commands in §0 reproduce it in about four minutes.
