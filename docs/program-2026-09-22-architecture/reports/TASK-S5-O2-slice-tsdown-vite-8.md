# TASK-S5-O2 · slice 4 — tsdown / Vite 8

> **Landed: NO. Measured: YES — both halves, for the first time.** TASK-R5-O9
> refused tsdown from registry metadata and left Vite 8 **"blocked, not refused,
> and deliberately not attempted"**. This slice attempted both in a throwaway
> `git worktree` and has numbers where there were predictions.
> Repository `ui/dzup-ui`, commit **`4e4e46f`**. No commit, push, CI dispatch or
> publish was performed.

## 1. Declared target and current state — measured

| Thing | Declared | Installed (shared tree) | Where it bites |
|---|---|---|---|
| `vite` | `^7` (root, `core`, `compat`, `tokens`, `tooling`) | **7.3.5** | `yarn build`, root vitest transform, `validate:tree-shake` |
| `vite` (apps) | `^6.1.0` (`storybook`, `landing`, `sandbox`), `^5.4.14` via vitepress (`docs`) | 6.4.1 / 5.x | insulated — `apps/storybook` sets `installConfig.hoistingLimits: "workspaces"` |
| `vitest` | `^3.2.4` + exact `resolutions` **3.2.6** | 3.2.6 | gates Vite 8 (§2.1) |
| `tsdown` / `rolldown` | — | **absent** (`grep` → exit 1, no match) | this would be an **adoption**, not an upgrade |
| Builders | `tsc` for `contracts`, `testing`, `mcp`, `codemods`, `nuxt` · `vite build` for `core`, `compat`, `tokens` | — | tsdown targets the five `tsc` packages; Vite 8 targets the three `vite` ones |

### 1.1 Upstream re-verified 2026-09-24 — drift reported, never silently taken

| Package | R5-O9 recorded (2026-09-18) | **Today** | Effect |
|---|---|---|---|
| `vite` `latest` | 8.3.0 | **8.3.1**, `engines.node "^20.19.0 \|\| >=22.12.0"`, `dependencies.rolldown ~1.2.9` | **floor-compatible**; one patch newer |
| `vite` `previous` | 7.3.6 | **7.3.6 — unchanged** | trigger **B1** still has not fired: the 7.x line is still the `previous` tag, i.e. still shipping |
| `vitest` `V4` | 4.1.11 | **4.1.11 — unchanged**, peers `vite "^6 \|\| ^7 \|\| ^8"` | the link that unblocks Vite 8 |
| `tsdown` `latest` | 0.23.0 | **0.23.0 — unchanged** (published 2026-09-03), `engines.node "^22.18.0 \|\| ^24.11.0 \|\| >=26.0.0"` | **still floor-breaking**; no newer release to reconsider |
| newest floor-compatible `tsdown` | 0.21.10 (2026-04-22) | **still 0.21.10**, `engines.node ">=20.19.0"`, pins `rolldown@1.0.0-rc.17` | now **five months** old |
| `rolldown` `latest` | 1.2.9 | **1.2.11** | tsdown's pinned rc.17 is further behind than it was |

**No pin moved in a way that changes a verdict.** R5-O9's refusal of tsdown and
its blocking of Vite 8 both stand on re-verified facts.

## 2. What breaks — run, not predicted

**Method.** One throwaway `git worktree` at `4e4e46f`
(`git -c core.longpaths=true worktree add --detach`, short path), three
successive dependency states, each installed with `yarn install --no-immutable`.
`packages/tokens/dist` from the shared checkout was hashed first as the Vite-7
baseline.

### 2.1 Experiment A — Vite 8 with Vitest 3: **D95 is real, and it is silent**

R5-O9 §8b *predicted* that bumping `vite` to `^8` while `vitest@3.2.6` holds
`vite` as a **dependency** (not a peer) would install cleanly and split the tree.
Measured:

```
# bumped devDependencies.vite ^7 → ^8 in root, core, compat, tokens, tooling
yarn install --no-immutable        → exit 0
peer/resolution warnings (YN0060|YN0002 in the log)   → 0

hoisted vite                        8.3.1      ← what `yarn build` uses
vite resolved from node_modules/vitest  7.3.5  ← what every test lane transforms through
node_modules/vitest/node_modules/vite/package.json   EXISTS
```

**`yarn install` exits 0 with zero warnings and two Vite majors in one tree.**
Then the dangerous half:

```
node node_modules/vitest/vitest.mjs run packages/core/src/components/buttons/
→ exit 0 · Test Files 17 passed (17) · Tests 282 passed (282)
```

**The ladder runs green.** A repository in this state builds its published
artifacts with Vite 8 and qualifies them with a suite transformed by Vite 7, and
nothing — not `yarn install`, not `validate:engines` (which reads the *hoisted*
vite's engines and would see 8.3.1 and pass), not `validate:peer-ranges` (which
reads declared peers, not installed duplicates) — says a word.

**`D95` is hereby upgraded from a predicted hazard to a measured one.**

### 2.2 Experiment B — Vite 8 with Vitest 4: the supported configuration resolves correctly

```
# + resolutions: vitest / @vitest/browser / @vitest/coverage-v8 → 4.1.11
yarn install --no-immutable        → exit 0
peer/resolution warnings           → 0

hoisted vite    8.3.1
vitest          4.1.11
vite resolved from node_modules/vitest    8.3.1
node_modules/vitest/node_modules/vite     ABSENT  → SINGLE MAJOR
```

```
node node_modules/vitest/vitest.mjs run packages/core/src/components/buttons/
→ exit 0 · 17 files · 282 tests · 7.69 s   (vs 9.20 s under experiment A)
```

So the *correct* configuration is clean, and the only thing standing between the
repository and it is **D91** (the coverage re-baseline, slice 3 §6).

### 2.3 The Vite 8 build output diff — against R5-O9's own stop condition

Target: **`@dzup-ui/tokens`** — the `<discovery>` step asks for "the package with
the simplest surface (`contracts` or `tokens`)", and of those two only `tokens`
is *built by Vite*, so it is the only one a Vite major can affect.

```
rm -rf packages/tokens/dist && yarn workspace @dzup-ui/tokens build
→ exit 0   (11 s, under vite@8.3.1 / rolldown 1.2.11)
```

| Classifier (R5-O9 §8b) | Vite 7.3.5 | **Vite 8.3.1** | Verdict |
|---|---|---|---|
| **file list** — did `preserveModules` survive? | 13 files | **13 files**, `diff` of the sorted path lists **exit 0** | **IDENTICAL — not the stop** |
| **`.d.ts` bytes** (`vite-plugin-dts` unchanged ⇒ must be identical) | 6 declarations | **all 6 byte-identical** | **IDENTICAL — not the stop** |
| generated assets (`tokens.css`, `tokens.dtcg.json`, `tokens.high-contrast.css`) | — | **byte-identical** (they come from the two `tsx` generators, not the bundler) | unchanged |
| **`.js` bytes** | — | **3 of 3 changed** | **expected — "a `contentSha256` change with a plausible bundler explanation is acceptable"** |

The stop condition — *any change to the file **list**, or to the `.d.ts` bytes* —
**does not fire.**

**And the explanation is plausible and visible**, which is what makes it
acceptable rather than merely tolerated:

| File | Vite 7 | Vite 8 | Δ |
|---|---:|---:|---|
| `index.js` | 56,620 B | **44,991 B** | **−11,629 B (−20.5 %)** |
| `utils/index.js` | 135 B | 131 B | −4 B |
| `utils/theme-script.js` | 378 B | **421 B** | +43 B |

The `−20.5 %` on `index.js` is **comment stripping**: the Rollup output preserves
the full JSDoc blocks on every token (`/** Width the AppShell content area
reserves… */`), and the rolldown output does not. The `+43 B` on the smallest file
is rolldown's module framing:

```diff
-const t = "(function(){…})();", e = "dz-theme";
-export {
-  e as THEME_STORAGE_KEY,
-  t as themeScript
-};
+//#region src/utils/theme-script.ts
+var e = "(function(){…})();", t = "dz-theme";
+//#endregion
+export { t as THEME_STORAGE_KEY, e as themeScript };
```

`//#region` markers, `var` instead of `const`, single-line exports, and swapped
minified identifiers. All bundler-shape, none semantic.

**Cross-check that isolates the cause:** experiment B's `tokens/dist` is
**byte-identical to experiment A's** (`diff` exit 0) — same Vite, different
Vitest major. So every byte of the delta above is **Vite's**, and none of it is
Vitest's. That independently re-confirms R5-O9 phase 2's finding that a Vitest
major leaves `dist/` byte-identical.

### 2.4 tsdown — attempted, not merely refused from metadata

```
yarn add -D tsdown@0.21.10          → exit 0
tsdown 0.21.10  engines {"node":">=20.19.0"}
rolldown        1.0.0-rc.17         ← was 1.2.11 before this line
vue-tsc         3.3.3               ← tsdown's dts plugin peers ~3.2.0
```

**Finding new to this slice: adopting tsdown *downgrades the hoisted rolldown*
from 1.2.11 to 1.0.0-rc.17, and splits it.**

```
hoisted rolldown              1.0.0-rc.17
rolldown resolved from vite   1.2.11        ← nested copy
rolldown resolved from tsdown 1.0.0-rc.17
```

That is the **same silent-split class as D95**, one layer down, and it appears
the moment tsdown and Vite 8 are in one tree. Nothing warns.

**The build itself — run:**

```
node ../../node_modules/tsdown/dist/run.mjs src/index.ts \
     --out-dir dist-tsdown --dts --format esm --unbundle
→ exit 0, "23 files, total: 167.20 kB", "Build complete in 1930ms"
```

**It builds. And the output is a different artifact:**

| | current (`tsc -p tsconfig.build.json`) | **tsdown 0.21.10** |
|---|---:|---:|
| `.js` | **16** | 0 |
| `.mjs` | 0 | **8** |
| `.d.ts` | **16** | 0 |
| `.d.mts` | 0 | **15** |
| `.map` (`.js.map` + `.d.ts.map`) | **16** | **0 — source maps gone** |
| **total files** | **48** | **23** |
| `dist/index.js` (the declared `exports` target) | present | **MISSING** |
| `dist/index.d.ts` (the declared `types` target) | present | **MISSING** |

`packages/contracts/package.json` declares
`exports: {".": {"types": "./dist/index.d.ts", "import": "./dist/index.js"}}`.
**Neither file exists in the tsdown output**, so the package's published entry
point would 404 on every consumer. The extension change also blinds three gates
at once: `validate:dts` asserts *"every `dist/*.js` has a sibling `.d.ts`"* and
would see **zero** `.js` files and pass vacuously; `validate:externals` and
`validate:exports` both read the same emitted files.

This is R5-O9's stop condition firing at full volume — **a changed file list and
changed declaration files** — and it is now measured rather than reasoned.

## 3. Revertibility

| Revert | Command | What it does NOT restore |
|---|---|---|
| **This slice** | `git worktree remove --force <path>` | **nothing — there is nothing to restore.** All three dependency states existed only in the worktree; §4 proves the shared tree is byte-identical |
| A Vite 8 cutover | `git checkout -- package.json packages/{core,compat,tokens,tooling}/package.json && yarn install` | **the published bytes, once published.** `dist/` is gitignored (ADR-12, corrected 2026-09-04) so nothing is committed to revert — but a *published* tarball built by rolldown cannot be recalled, and its `index.js` differs from the Rollup one by 20 % of its size. The revert also does not restore `yarn.lock`'s resolution *order*, which is why the hash comparison in §4 is the real check |
| A tsdown adoption | `yarn remove tsdown && yarn install`, then rebuild | **the hoisted `rolldown` version** — `yarn remove` restores the range, but any artifact built while rolldown was pinned to `1.0.0-rc.17` was built by a pre-1.0 release candidate and must be rebuilt, not just re-hashed. And **nothing in the repository would tell you it happened**: `validate:engines`'s `GATE_DEPENDENCIES` is `['vite','vitest','eslint','tsx','typescript','jsdom','@playwright/test']` — **`tsdown` and `rolldown` are both absent**, so the gate stays green through the whole episode |

**The claim to disprove — "a revertible cutover that cannot actually be reverted"
— tested here and it holds for two of three.** The Vite 8 and tsdown *dependency*
states revert cleanly because nothing is committed. What does **not** revert is a
**publication** made from either: §2.3 shows a 20 % byte change in one file of
one package, and slice 2 shows the same asymmetry for a peer range. **The
irreversible step in this repository is never the toolchain change; it is the
first `npm publish` made after it** — which is A4-D1's territory, not this task's.

## 4. Proof the install state is unchanged

| Check | Before | After |
|---|---|---|
| `sha256sum yarn.lock` | `6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb` | **`sha256sum -c` exit 0 — identical** |
| `sha256sum package.json` | `a9eb7c4af03e949341bb8a64bbfed767f4ca99c4a25d3645a30263f306852498` | **identical** |
| `git status --porcelain -- yarn.lock package.json` | ` M package.json` (pre-existing) | **unchanged — still exactly that one line** |
| `node_modules` spot-check | `vite 7.3.5` · `vitest 3.2.6` · `vue 3.5.31` · `@nuxt/kit 4.5.2` · `nuxt 4.4.5` | **all five unchanged** |
| `require('tsdown/package.json')` | throws | **still throws — "tsdown absent"** |
| `packages/tokens/dist` | 13 files, `index.js` sha `4b819117…` | **untouched — the Vite 8 build wrote only into the worktree** |
| `git worktree list` | one entry | **one entry**; the worktree directory is gone (`ls` → `No such file or directory`) |

## 5. Go / no-go, with a costed window

**NO-GO on tsdown (refusal re-affirmed, now measured). Vite 8 is a
conditional GO that nothing is asking for.**

| Move | Verdict | Window | Blocked on |
|---|---|---|---|
| **tsdown adoption** | **NO-GO — refusal re-affirmed on three independent grounds** | — | (1) **floor**: every release ≥ 0.22.0 excludes the declared Node floor, and `latest` 0.23.0 excludes Node 24.0–24.10 and all of 25.x too; the only usable release is **five months old**. (2) **output shape**: 48 files → 23, `.js`/`.d.ts` → `.mjs`/`.d.mts`, **16 source maps to 0**, and both declared `exports` targets missing (§2.4). (3) **dependency conflict**: it downgrades hoisted `rolldown` 1.2.11 → 1.0.0-rc.17 and splits it against Vite's. Trigger **B3** re-tested by R5-O9 and **has not fired** |
| **Vite 7.3.5 → 8.3.1** | **conditional GO — and low priority** | **~3 h** once D91 lands: bump 5 manifests, install, `yarn build`, re-hash `dist`, re-run the four build validators | **D91 only.** The *build* half is now proven safe on `tokens`: identical file list, identical declarations, an explicable 3-file JS delta. What remains unproven is the same diff on **`core`** (1,450 files) and `compat` — a bigger surface, but the same instrument |
| **Bump `vite` to `^8` while `vitest` is 3.2.6** | **HARD NO-GO — this is the trap** | — | §2.1. Exit 0, zero warnings, green suite, two Vite majors. Do not let this happen by accident |
| **Add `tsdown` and `rolldown` to `validate:engines`'s `GATE_DEPENDENCIES`** | **GO — cheap, and it closes the hole that made all this necessary** | **~30 min** | nothing. A one-line array edit plus a test. Today the gate is *structurally unable* to see a tsdown floor breach |

**What Vite 8 unblocks:** nothing. Trigger **B1** has not fired — `vite@7.3.6` is
the `previous` tag, so the 7.x line is still shipping, and every plugin in the
build path still admits `^7`. It is a **currency** upgrade carrying one untested
link (`vite-plugin-dts@4.5.4` declares `vite: "*"`, i.e. installs against
anything and is tested against nothing — **D96**).
**What the tsdown no-go forgoes:** a faster `tsc` on five packages, at the price
of an unreviewable 48→23-file artifact change and a broken `exports` map.

## 6. ADR-18 interaction

Two inputs, pointing in **opposite** directions — worth stating together, because
the temptation is to treat "raise the Node floor" as a single decision:

- **tsdown wants the floor raised** to `^22.18.0` and would keep wanting more
  (`latest` now demands `^22.18.0 || ^24.11.0 || >=26.0.0`). This is the *weakest*
  possible reason to move ADR-18: an optional build tool this repository does not
  use, whose adoption is refused on two further grounds anyway.
- **Vite 8 wants nothing.** `vite@8.3.1` declares `^20.19.0 || >=22.12.0`, which
  the current floor already satisfies. Vite 8 is a **sequencing** problem, not a
  floor problem.

Combined with slice 2 (`nuxt@4.4.6+` needs `^22.12.0`, `nuxt@4.5.2` needs
`^22.19.0`) and TASK-S0-O3's two `node:fs` glob sites needing Node 22: **the
real pressure on ADR-18 comes from Nuxt consumers and from this repository's own
source, not from the build tooling.** Recorded as an amendment input; ADR-18 is
not resolved here.
